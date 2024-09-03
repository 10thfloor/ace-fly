import type { FlyStack } from "../core/FlyStack";
import type { FlyProxy } from "./FlyProxy";
import type { TlsConfig } from "./TlsConfig";
import { StackConstruct } from "./StackConstruct";

export interface IAnycastIPConfig {
  type: string;
  shared: boolean;
  proxy: FlyProxy;
  tls: TlsConfig;
}

export class AnycastIP extends StackConstruct {
  private config: IAnycastIPConfig;

  constructor(stack: FlyStack, name: string, config: IAnycastIPConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'anycast-ip',
      name: this.name,
      ipType: this.config.type,
      shared: this.config.shared,
      proxy: this.config.proxy.getName(),
      tls: this.config.tls.synthesize()
    };
  }

  protected validate(): boolean {
    return true;
  }
}