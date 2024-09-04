import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import type { FlyStack } from "../core/FlyStack";
import type { Certificate } from "./Certificate";
import type { FlySecret } from "./FlySecret";
import type { AnycastIP } from "./AnycastIP";
import type { FlyProxy } from "./FlyProxy";
import type { FlyMachine } from "./FlyMachine";
import { ResourceReference } from "../utils/ResourceReference";

export interface IFlyAppConfig {
  name: string;
  domain: string;
  certificate: ResourceReference<Certificate>;
  secrets: ResourceReference<FlySecret>[];
  env: Record<string, string>;
  publicServices: {
    [name: string]: ResourceReference<AnycastIP>;
  };
  privateServices: {
    [name: string]: ResourceReference<FlyProxy>;
  };
}

export class FlyApp extends StackConstruct {
  
  @Dependency()
  private certificate: Certificate;

  @Dependency()
  private secrets: FlySecret[];

  @Dependency()
  private publicServices: {
    [name: string]: AnycastIP;
  };

  @Dependency()
  private privateServices: {
    [name: string]: FlyProxy;
  };

  private config: IFlyAppConfig;

  constructor(stack: FlyStack, name: string, config: IFlyAppConfig) {
    super(stack, name);
    this.config = config;
    this.certificate = config.certificate.getResource();
    this.secrets = config.secrets.map(ref => ref.getResource());
    this.publicServices = Object.fromEntries(
      Object.entries(config.publicServices).map(([key, ref]) => [key, ref.getResource()])
    );
    this.privateServices = Object.fromEntries(
      Object.entries(config.privateServices).map(([key, ref]) => [key, ref.getResource()])
    );
  }

  synthesize(): Record<string, any> {
    return {
      type: 'app',
      name: this.name,
      domain: this.config.domain,
      certificate: this.config.certificate.getName(),
      secrets: this.config.secrets.map(secret => secret.getName()),
      env: this.config.env,
      publicServices: {
        website: this.config.publicServices.website.getName()
      },
      privateServices: {
        api: this.config.privateServices.api.getName()
      }
    };
  }

  protected validate(): boolean {
    return true;
  }

  protected requiredDependencies(): string[] {
    return ['Domain', 'Certificate', 'FlySecret', 'AnycastIP', 'FlyProxy'];
  }
}