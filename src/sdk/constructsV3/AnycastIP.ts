import type { FlyStack } from './FlyStack';
import type { FlyProxy } from './FlyProxy';
import type { TlsConfig } from './TlsConfig';

export class AnycastIP {
  private stack: FlyStack;
  private config: IAnycastIPConfig;

  constructor(stack: FlyStack, config: IAnycastIPConfig) {
    this.stack = stack;
    this.config = config;
  }
}

export interface IAnycastIPConfig {
  type: 'v4' | 'v6';
  shared: boolean;
  proxy: FlyProxy;
  tls: TlsConfig;
}