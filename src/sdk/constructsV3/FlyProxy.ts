import type { FlyStack } from './FlyStack';
import type { FlyMachine } from './FlyMachine';
import type { LBConfig } from './LBConfig';

export class FlyProxy {
  private stack: FlyStack;
  private config: IFlyProxyConfig;

  constructor(stack: FlyStack, config: IFlyProxyConfig) {
    this.stack = stack;
    this.config = config;
  }
}

export interface IFlyProxyConfig {
  name: string;
  machines: Record<string, FlyMachine>;
  ports: Record<number, string>;
  loadBalancing: LBConfig;
}