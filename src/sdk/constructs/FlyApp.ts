import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import type { FlyStack } from "../core/FlyStack";
import type { Certificate } from "./Certificate";
import type { FlySecret } from "./FlySecret";
import type { AnycastIP } from "./AnycastIP";
import type { FlyProxy } from "./FlyProxy";

export interface IFlyAppConfig {
  name: string;
  domain: string;
  certificate: Certificate;
  secrets: FlySecret[];
  env: Record<string, string>;
  publicServices: {
    website: AnycastIP;
  };
  privateServices: {
    api: FlyProxy;
  };
}

export class FlyApp extends StackConstruct {
  
  @Dependency()
  private certificate: Certificate;

  @Dependency()
  private secrets: FlySecret[];

  @Dependency()
  private publicServices: {
    website: AnycastIP;
  };

  @Dependency()
  private privateServices: {
    api: FlyProxy;
  };

  private config: IFlyAppConfig;

  constructor(stack: FlyStack, name: string, config: IFlyAppConfig) {
    super(stack, name);
    this.config = config;
    this.certificate = config.certificate;
    this.secrets = config.secrets;
    this.publicServices = config.publicServices;
    this.privateServices = config.privateServices;
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