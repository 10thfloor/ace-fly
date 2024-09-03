import type { FlyStack } from './FlyStack';

export class FlySecret {
  private stack: FlyStack;
  private name: string;
  private config: IFlySecretConfig;

  constructor(stack: FlyStack, name: string, config: IFlySecretConfig) {
    this.stack = stack;
    this.name = name;
    this.config = config;
  }
}

export interface IFlySecretConfig {
  key: string;
  value?: string;
}