import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import { FlyStack } from "../core/FlyStack";
import { FlyApp } from "./FlyApp";
import { FlyMachine } from "./FlyMachine";
import { FlyMachineConfig } from "./FlyMachineConfig";
import { FlyPostgres } from "./FlyPostgres";
import { FlySecret } from "./FlySecret";
import { AutoScalingConfig } from "./FlyAutoScalingConfig";
import { TlsConfig } from "./TlsConfig";
import { FlyProxy } from "./FlyProxy";
import { AnycastIP } from "./FlyAnycastIP";
import { FlyLBConfig } from "./FlyLBConfig";
import { FlyCertificate } from "./FlyCertificate";
import { FlyDomain } from "./FlyDomain";

export interface IRemixSiteConstructConfig {
  name?: string;
  env?: Record<string, string>;
  domain: string;
}       

export class RemixSite extends StackConstruct {
  private config: IRemixSiteConstructConfig;

  @Dependency()
  app: FlyApp;

  @Dependency()
  machine: FlyMachine;

  @Dependency()
  database: FlyPostgres;

  domain: FlyDomain;
  
  constructor(stack: FlyStack, id: string, config: IRemixSiteConstructConfig) {
    super(stack, id);
    this.config = config;   

    this.app = {} as FlyApp;
    this.machine = {} as FlyMachine;
    this.database = {} as FlyPostgres;

    this.domain = new FlyDomain(this.stack, `${this.getId()}-domain`, {
      domainName: this.config.domain,
    });

    this.createResources();
    this.initialize();
  }

  private createResources(): void {

    const machineConfig = new FlyMachineConfig(this.stack, `${this.getId()}-machine-config`, {
      cpus: 1,
      memoryMB: 256,
      image: "flyio/remix:latest", 
      cmd: ["npm", "run", "start"],
      env: {
        PORT: "{{ .internalPort }}",
        NODE_ENV: "production",
        ...this.config.env,
      },
      internalPort: 8080,
      guest: {
        cpu_kind: "hobby",
        memory_mb: 256,
      },
      volumes: []
    });

    this.database = new FlyPostgres(this.stack, `${this.getId()}-database`, {
        name: `${this.config.name}-database`,
        region: "iad",
        credentials: {
            username: "postgres",
            password: new FlySecret(this.stack, "postgres-password", {
                key: "postgres-password",
            }),
        },
        replicas: [],
        instanceType: "postgres-medium",
        storage: {
            size: 10240,
            type: "storage_performance",
        }
    })

    const autoScaling = new AutoScalingConfig(this.stack, `${this.getId()}-auto-scaling`, {
      minMachines: 1,
      maxMachines: 3,
      targetCPUUtilization: 70,
      scaleToZero: false,
    });

    this.machine = new FlyMachine(this.stack, `${this.getId()}-machine`, {
      name: `${this.config.name}-machine`,
      count: 1,
      regions: ["iad"], // Default to US East
      autoScaling: autoScaling,
      machineConfig: machineConfig,
      link: [this.database],
    });

    const proxy = new FlyProxy(this.stack, `${this.getId()}-proxy`, {
      name: `${this.config.name}-proxy`,
      machines: {
        web: this.machine,
      },
      ports: {
        8080: "{{ .web.internalPort }}",
      },
      loadBalancing: new FlyLBConfig(this.stack, `${this.getId()}-lb-config`, {
        strategy: "round-robin",
        healthCheck: {
          path: "/health",
          interval: 30,
          timeout: 5,
        },
      }),
    });

    const certificate = new FlyCertificate(this.stack, `${this.getId()}-certificate`, {
      name: `${this.config.name}-certificate`,
      domains: [this.domain],
    });

    const tlsConfig = new TlsConfig(this.stack, `${this.getId()}-tls-config`, {
        name: `${this.config.name}-tls-config`,
        enabled: true,
        certificate: certificate,
        privateKey: "tls-key.pem",
        alpn: ["http/1.1", "http/2"],
        versions: ["TLSv1.2", "TLSv1.3"],
      });

    const anycastIp = new AnycastIP(this.stack, `${this.getId()}-anycast-ip`, {
      name: `${this.config.name}-anycast-ip`,
      proxy: proxy,
      tls: tlsConfig,
      type: "v4",
      shared: true,
    });

    this.app = new FlyApp(this.stack, `${this.getId()}-app`, {
      name: this.config.name || this.getId(),
      domain: this.domain,
      certificate: certificate,
      secrets: [],
      env: this.config.env || {},
      publicServices: {
        web: anycastIp,
      },
      privateServices: {},
    });
  }


  getStack(): FlyStack {
    return this.stack;
  }

  synthesize(): Record<string, any> {
    return {
      type: "remix-site",
      name: this.config.name,
      app: this.getResource(this.app),
      machine: this.getResource(this.machine),
      database: this.getResource(this.database),
    };
  }

  protected validate(): boolean {
    // Add Remix-specific validation if needed
    return true;
  }
}
