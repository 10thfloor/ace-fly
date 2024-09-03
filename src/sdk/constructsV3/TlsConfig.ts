import type { FlyStack } from './FlyStack';

export class TlsConfig {
  private stack: FlyStack;
  private config: ITlsConfigOptions;

  constructor(stack: FlyStack, config: ITlsConfigOptions) {
    this.stack = stack;
    this.config = config;
  }
}

export interface ITlsConfigOptions {
  enabled: boolean;
  certificate: string;
  privateKey: string;
  alpn: string[];
  versions: string[];
}