import { StackConstruct } from "../core/StackConstruct";
import { FlyApp } from "./FlyIoApp";
import { FlyHttpService } from "./FlyHttpService";
import { FlyDomain } from "./FlyDomain";
import { FlySecret } from "./FlySecret";
import { FlyCertificate } from "./FlyCertificate";
import type { FlyStack } from "../core/FlyStack";
import { FlyAnycastIP } from "./FlyAnycastIP";

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
}

export class FlyApplication extends StackConstruct {
  private app: FlyApp;
  private domain: FlyDomain;
  private certificate: FlyCertificate;
  private scalingConfig?: ScalingConfig;
  private httpServices: Record<string, FlyHttpService> = {};
  private secrets: Record<string, FlySecret> = {};
  private secretNames: string[];
  private env: Record<string, string> = {};

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
      regions: config.regions,
      secrets: [],
      env: config.env || {},
      publicServices: {},
      privateServices: {},
    });
    
    this.secretNames = config.secretNames;
    
    // Initialize secrets (now just references, not values)
    for (const secretName of this.secretNames) {
      this.addSecretReference(secretName);
    }
    
    this.env = config.env || {};
    
    this.initialize();
  }

  setScalingConfig(config: ScalingConfig): void {
    this.scalingConfig = config;
    // TODO: Apply scaling config to the underlying FlyApp or machines
    
  }

  addHttpService(name: string, config: HttpServiceConfig, dedicatedIp?: boolean): void {
    const httpService = new FlyHttpService(this.getStack(), `${this.getId()}-${name}`, {
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
    };
  }

  protected validate(): boolean {
    // Add validation logic
    return true;
  }

  protected getName(): string {
    return this.app.getId(); // Use getId() instead of getName()
  }
}