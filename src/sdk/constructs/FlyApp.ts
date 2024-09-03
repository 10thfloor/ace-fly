import type { FlyStack } from "../core/FlyStack";
import type { FlyCertificate } from "./FlyCertificate";
import type { FlySecret } from "./FlySecret";
import type { AnycastIP } from "./AnycastIP";
import type { FlyProxy } from "./FlyProxy";
import { StackConstruct } from "./StackConstruct";

export interface IFlyAppConfig {
  name: string;
  domain: string;
  certificate: FlyCertificate;
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
  private config: IFlyAppConfig;

  constructor(stack: FlyStack, name: string, config: IFlyAppConfig) {
    super(stack, name);
    this.config = config;
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
}