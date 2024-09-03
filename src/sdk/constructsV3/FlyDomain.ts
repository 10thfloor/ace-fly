import type { FlyStack } from './FlyStack';

export class FlyDomain {
  domainName: string;
  private stack: FlyStack;
  private name: string;

  constructor(stack: FlyStack, name: string, config: IFlyDomainConfig) {
    this.stack = stack;
    this.name = name;
    this.domainName = config.domainName;
  }
}

export interface IFlyDomainConfig {
  domainName: string;
}