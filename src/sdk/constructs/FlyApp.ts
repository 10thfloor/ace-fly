import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import type { FlyStack } from "../core/FlyStack";
import type { Certificate } from "./Certificate";
import type { FlySecret } from "./FlySecret";
import type { AnycastIP } from "./AnycastIP";
import type { FlyProxy } from "./FlyProxy";
import type { Domain } from "./Domain";
import type { ResourceOrReference } from "../../types";

export interface IFlyAppConfig {
  name: string;
  domain: ResourceOrReference<Domain>;
  certificate: ResourceOrReference<Certificate>;
  secrets: ResourceOrReference<FlySecret>[];
  env: Record<string, string>;
  publicServices: {
    [name: string]: ResourceOrReference<AnycastIP>;
  };
  privateServices: {
    [name: string]: ResourceOrReference<FlyProxy>;
  };
}

export class FlyApp extends StackConstruct {
  @Dependency()
  private domain: ResourceOrReference<Domain>;

  @Dependency()
  private certificate: ResourceOrReference<Certificate>;

  @Dependency()
  private secrets: ResourceOrReference<FlySecret>[];

  @Dependency()
  private publicServices: {
    [name: string]: ResourceOrReference<AnycastIP>;
  };

  @Dependency()
  private privateServices: {
    [name: string]: ResourceOrReference<FlyProxy>;
  };

  private config: IFlyAppConfig;

  constructor(stack: FlyStack, id: string, config: IFlyAppConfig) {
    super(stack, id);
    this.config = config;
    this.domain = this.getResource(config.domain);
    this.certificate = this.getResource(config.certificate);
    this.secrets = config.secrets.map((secret) => this.getResource(secret));
    this.publicServices = Object.fromEntries(
      Object.entries(config.publicServices).map(([key, service]) => [
        key,
        this.getResource(service),
      ]),
    );
    this.privateServices = Object.fromEntries(
      Object.entries(config.privateServices).map(([key, service]) => [
        key,
        this.getResource(service),
      ]),
    );
    this.initialize();
  }

  synthesize(): Record<string, any> {
    return {
      type: "app",
      name: this.config.name || this.getId(),
      domain: this.domain,
      certificate: this.certificate.getId(),
      secrets: this.secrets.map((secret) => secret.getId()),
      env: this.config.env,
      publicServices: Object.fromEntries(
        Object.entries(this.publicServices).map(([key, service]) => [
          key,
          service.getId(),
        ]),
      ),
      privateServices: Object.fromEntries(
        Object.entries(this.privateServices).map(([key, service]) => [
          key,
          service.getId(),
        ]),
      ),
    };
  }

  protected validate(): boolean {
    return true;
  }
}
