import type { FlyStack } from "../core/FlyStack";
import type { FlyProxy } from "./FlyProxy";
import type { TlsConfig } from "./TlsConfig";
import { StackConstruct } from "./StackConstruct";
import type { ResourceOrReference } from "../../types";
import { Dependency } from "../utils/DependencyDecorator";

export interface IAnycastIPConfig {
  name?: string;
  type: string;
  shared: boolean;
  proxy: ResourceOrReference<FlyProxy>;
  tls: ResourceOrReference<TlsConfig>;
}

export class AnycastIP extends StackConstruct {
  config: IAnycastIPConfig;

  @Dependency()
  proxy: ResourceOrReference<FlyProxy>;

  @Dependency()
  tls: ResourceOrReference<TlsConfig>;

  constructor(stack: FlyStack, id: string, config: IAnycastIPConfig) {
    super(stack, id);
    this.config = config;
    this.proxy = config.proxy;
    this.tls = config.tls;
    this.initialize();
  }

  synthesize(): Record<string, any> {
    return {
      type: "anycast-ip",
      name: this.config.name || this.getId(),
      ipType: this.config.type,
      shared: this.config.shared,
      proxy: this.getResource(this.proxy).getId(),
      tls: this.getResource(this.tls).getId(),
    };
  }

  protected validate(): boolean {
    return true;
  }
}
