import type { FlyStack } from './FlyStack';

export class LBConfig {
  private stack: FlyStack;
  private config: ILBConfigOptions;

  constructor(stack: FlyStack, config: ILBConfigOptions) {
    this.stack = stack;
    this.config = config;
  }
}

export interface ILBConfigOptions {
  strategy: string;
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
  };
}