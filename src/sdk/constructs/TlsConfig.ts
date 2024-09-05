import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface ITlsConfig {
  name?: string;
  enabled: boolean;
  certificate: string;
  privateKey: string;
  alpn: string[];
  versions: string[];
}

export class TlsConfig extends StackConstruct {
  private config: ITlsConfig;

  constructor(stack: FlyStack, id: string, config: ITlsConfig) {
    super(stack, id);
    this.config = config;
    this.initialize();
  }

  synthesize(): Record<string, any> {
    return {
      type: 'tls-config',
      name: this.config.name || this.getId(),
      enabled: this.config.enabled,
      certificate: this.config.certificate,
      alpn: this.config.alpn,
      versions: this.config.versions
    };
  }

  protected validate(): boolean {
    return true;
  }
}