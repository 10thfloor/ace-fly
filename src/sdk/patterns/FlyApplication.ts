import { StackConstruct } from "../core/StackConstruct";
import { FlyApp } from "../constructs/FlyIoApp";
import type { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyDomain } from "../constructs/FlyDomain";
import type { FlySecret } from "../constructs/FlySecret";
import { FlyCertificate } from "../constructs/FlyCertificate";
import type { FlyStack } from "../core/FlyStack";
import { FlyAnycastIP } from "../constructs/FlyAnycastIP";
import type { FlyPostgresDatabase, DatabaseScalingConfig } from "./FlyPostgresDatabase";
import { FlyApi, type ApiRoute } from "./FlyApi";
import type { FirewallRule } from '../constructs/FlyFirewall';
import { FlyFirewall } from "../constructs/FlyFirewall";
import { ArcJetProtection, type ArcJetProtectionConfig } from "../constructs/ArcJetProtection";
import type { AutoScalingConfig } from "../constructs/FlyAutoScalingConfig";
export interface FlyApplicationConfig {
  name: string;
  organization: string;
  regions: string[];
  domain: string;
  secretNames: string[];
  env?: Record<string, string>;
}

export interface HttpServiceConfig {
  service: {
    getInternalPort: () => number;
  };
  forceHttps?: boolean;
  concurrency?: {
    type: "connections" | "requests";
    soft_limit: number;
    hard_limit: number;
  };
  scaling?: AutoScalingConfig;
}

export class FlyApplication extends StackConstruct {
  private app: FlyApp;
  private domain: FlyDomain;
  private certificate: FlyCertificate;
  private httpServices: Record<string, FlyHttpService> = {};
  private secrets: Record<string, FlySecret> = {};
  private databases: Record<string, FlyPostgresDatabase> = {};
  private firewall: FlyFirewall;
  private arcjetProtection?: ArcJetProtection;

  constructor(stack: FlyStack, id: string, private readonly config: FlyApplicationConfig) {
    super(stack, id);

    this.certificate = {} as FlyCertificate;
    this.domain = {} as FlyDomain;
    this.firewall = {} as FlyFirewall;
    this.app = {} as FlyApp;  

    this.initializeComponents();
  }

  private initializeComponents(): void {
    this.domain = new FlyDomain(this.getStack(), `${this.getId()}-domain`, {
      name: `${this.config.name}-domain`,
      domainName: this.config.domain,
    });

    this.certificate = new FlyCertificate(this.getStack(), `${this.getId()}-certificate`, {
      name: `${this.config.name}-certificate`,
      domains: [this.domain],
    });

    this.app = new FlyApp(this.getStack(), `${this.getId()}-app`, {
      name: this.config.name,
      domain: this.domain,
      certificate: this.certificate,
      secrets: [],
      publicServices: {},
      privateServices: {},
      regions: this.config.regions,
      env: this.config.env || {},
    });

    this.firewall = new FlyFirewall(this.getStack(), this.getId(), {
      app: this.app,
    });

    for (const secretName of this.config.secretNames) {
      this.addSecretReference(secretName);
    }
  }

  addHttpService(name: string, config: HttpServiceConfig): void {
    // Implementation here
  }

  addDatabase(config: { name: string; primaryRegion: string; scaling?: DatabaseScalingConfig }): void {
    // Implementation remains the same
  }

  addFirewallRules(rules: FirewallRule[]): void {
    // Implementation remains the same
  }

  addArcJetProtection(config: ArcJetProtectionConfig): void {
    this.arcjetProtection = new ArcJetProtection(
      this.getStack(),
      `${this.getId()}-arcjet`,
      this.app,
      config
    );
  }

  addSecretReference(secretName: string): void {
    // Implementation remains the same
  }

  synthesize(): Record<string, any> {
    return {
      app: this.app.synthesize(),
      domain: this.domain.synthesize(),
      certificate: this.certificate.synthesize(),
      httpServices: Object.fromEntries(
        Object.entries(this.httpServices).map(([name, service]) => [name, service.synthesize()])
      ),
      secrets: Object.fromEntries(
        Object.entries(this.secrets).map(([key, secret]) => [key, secret.synthesize()])
      ),
      databases: Object.fromEntries(
        Object.entries(this.databases).map(([key, db]) => [key, db.synthesize()])
      ),
      firewall: this.firewall.synthesize(),
      arcjetProtection: this.arcjetProtection?.synthesize(),
    };
  }

  protected validate(): boolean {
    // Implement validation logic
    return true;
  }

  protected getName(): string {
    return this.config.name;
  }
}
