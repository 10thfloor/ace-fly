import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface ITlsConfig {
  enabled: boolean;
  certificate: string;
  privateKey: string;
  alpn: string[];
  versions: string[];
}

export class TlsConfig extends StackConstruct {
  private config: ITlsConfig;

  constructor(stack: FlyStack, name: string, config: ITlsConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'tls-config',
      name: this.name,
      enabled: this.config.enabled,
      certificate: this.config.certificate,
      alpn: this.config.alpn,
      versions: this.config.versions
    };
  }
}