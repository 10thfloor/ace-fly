import { StackConstruct } from "../core/StackConstruct";
import { FlyApp } from "../constructs/FlyApp";
import { HttpService } from "../constructs/HttpService";
import { FlyDomain } from "../constructs/FlyDomain";
import { FlySecret } from "../constructs/FlySecret";
import { FlyCertificate } from "../constructs/FlyCertificate";
import type { FlyStack } from "../core/FlyStack";
import { FlyAnycastIP } from "../constructs/FlyAnycastIP";
import { FlyPostgresDatabase, FlyPostgresDatabaseProps } from "./FlyPostgresDatabase";
import { FlyApi, type ApiRoute } from "./FlyApi";

export interface ScalingRule {
  metric: 'cpu' | 'memory';
  threshold: number;
  action: 'scale_up' | 'scale_down';
}

export interface ScalingConfig {
  minMachines: number;
  maxMachines: number;
  scalingRules: ScalingRule[];
}

export interface HttpServiceConfig {
  service: {
    getInternalPort: () => number;
  };
  concurrency?: {
    type: 'connections' | 'requests';
    soft_limit: number;
    hard_limit: number;
  };
}

export interface FlyApplicationConfig {
  name: string;
  organization: string;
  regions: string[];
  domain: string;
  secretNames: string[];
  env?: Record<string, string>; // Add this line
  api?: {
    routes: ApiRoute[];
  };
  database?: {
    name: string;
    region: string;
  };
}

export class FlyApplication extends StackConstruct {
  private app: FlyApp;
  private domain: FlyDomain;
  private certificate: FlyCertificate;
  private scalingConfig?: ScalingConfig;
  private httpServices: Record<string, HttpService> = {};
  private secrets: Record<string, FlySecret> = {};
  private secretNames: string[];
  private env: Record<string, string> = {};
  private api?: FlyApi;
  private database?: FlyPostgresDatabase;
  private databases: Record<string, FlyPostgresDatabase> = {};

  constructor(stack: FlyStack, id: string, config: FlyApplicationConfig) {
    super(stack, id);
    this.domain = new FlyDomain(stack, `${id}-domain`, {
      name: `${config.name}-domain`,
      domainName: config.domain,
    });
    this.certificate = new FlyCertificate(stack, `${id}-certificate`, {
      name: `${config.name}-certificate`,
      domains: [this.domain],
    });

    this.app = new FlyApp(stack, `${id}-app`, {
      name: config.name,
      domain: this.domain,
      certificate: this.certificate,
      secrets: [],
      publicServices: {},
      privateServices: {},
      regions: config.regions,
      env: {},
    });
    
    this.secretNames = config.secretNames;
    
    // Initialize secrets (now just references, not values)
    for (const secretName of this.secretNames) {
      this.addSecretReference(secretName);
    }
    
    this.env = config.env || {};
    
    if (config.api) {
      this.addApi(config.api.routes);
    }

    if (config.database) {
      this.addDatabase({
        name: config.database.name,
        primaryRegion: config.database.region
      });
    }

    this.initialize();
  }

  setScalingConfig(config: ScalingConfig): void {
    this.scalingConfig = config;
    // TODO: Apply scaling config to the underlying FlyApp or machines
    
  }

  addHttpService(name: string, config: HttpServiceConfig, dedicatedIp?: boolean): void {
    const httpService = new HttpService(this.getStack(), `${this.getId()}-${name}`, {
      name: name,
      internal_port: 'getInternalPort' in config.service ? config.service.getInternalPort() : 8080, // Default port
      auto_stop_machines: true,
      auto_start_machines: true,
      min_machines_running: this.scalingConfig?.minMachines || 1,
      processes: ["web"],
      concurrency: config.concurrency,
    });

    if (dedicatedIp) {
        const anycastIp = new FlyAnycastIP(this.getStack(), `${this.getId()}-ip-${name}`, {
          type: "v4",
          shared: false,
          proxy: httpService,
        });
        // Add logic to associate this IP with the service
      }

    this.httpServices[name] = httpService;
    // TODO: Add the HTTP service to the underlying FlyApp
  }

  addSecretReference(secretName: string): void {
    const secret = new FlySecret(this.getStack(), `${this.getId()}-secret-${secretName}`, {
      name: secretName,
      key: secretName, // Add this line to satisfy the IFlySecretConfig interface
    });
    this.secrets[secretName] = secret;
    this.app.addSecret(secret);
  }

  getSecretReference(name: string): FlySecret | undefined {
    return this.secrets[name];
  }

  addEnv(key: string, value: string): void {
    this.env[key] = value;
  }

  getEnv(): Record<string, string> {
    return { ...this.env };
  }

  synthesize(): Record<string, any> {
    return {
      type: "fly-application",
      app: this.app.synthesize(),
      domain: this.domain.synthesize(),
      certificate: this.certificate.synthesize(),
      scalingConfig: this.scalingConfig,
      httpServices: Object.fromEntries(
        Object.entries(this.httpServices).map(([name, service]) => [name, service.synthesize()])
      ),
      secrets: Object.fromEntries(
        Object.entries(this.secrets).map(([key, secret]) => [key, secret.synthesize()])
      ),
      env: this.env,
      api: this.api?.synthesize(),
      database: this.database?.synthesize(),
      databases: Object.fromEntries(
        Object.entries(this.databases).map(([region, db]) => [region, db.synthesize()])
      ),
    };
  }

  protected validate(): boolean {
    // Add validation logic
    return true;
  }

  protected getName(): string {
    return this.app.getId(); // Use getId() instead of getName()
  }

  addDatabase(config: { name: string; primaryRegion: string }): void {
    const primaryDb = new FlyPostgresDatabase(this.getStack(), `${this.getId()}-db-primary`, {
      name: config.name,
      region: config.primaryRegion,
    });
    
    this.databases[config.primaryRegion] = primaryDb;

    // Create read replicas in other regions
    const appRegions = this.app.getRegions();
    for (const region of appRegions) {
      if (region !== config.primaryRegion) {
        const replicaDb = new FlyPostgresDatabase(this.getStack(), `${this.getId()}-db-${region}`, {
          name: `${config.name}-${region}`,
          region: region,
          isReplica: true,
          primaryName: config.name
        });
        this.databases[region] = replicaDb;
      }
    }

    // Add connection logic to the application's environment
    this.addEnv('DATABASE_URL', this.getDatabaseConnectionString());

    if (this.api) {
      this.connectApiToDatabase();
    }
  }

  private getDatabaseConnectionString(): string {
    // TODO: Implement this method
    return "";
  }

  addApi(routes: ApiRoute[]): void {
    this.api = new FlyApi(this.getStack(), `${this.getId()}-api`, { routes });
    this.addHttpService("ApiService", {
      service: this.api,
      concurrency: {
        type: 'connections',
        soft_limit: 25,
        hard_limit: 30,
      }
    });

    if (Object.keys(this.databases).length > 0) {
      this.connectApiToDatabase();
    }
  }

  private connectApiToDatabase(): void {
    if (!this.api || Object.keys(this.databases).length === 0) {
      throw new Error("Both API and database must be initialized before connecting");
    }
    
    this.api.addEnv('DATABASE_URL', this.getDatabaseConnectionString());
  }
}