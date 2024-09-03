import type { FlyStack } from './FlyStack';

export class FlyCertificate {
  private stack: FlyStack;
  private name: string;
  private config: IFlyCertificateConfig;

  constructor(stack: FlyStack, name: string, config: IFlyCertificateConfig) {
    this.stack = stack;
    this.name = name;
    this.config = config;
  }
}

export interface IFlyCertificateConfig {
  name: string;
  domains: string | string[];
}