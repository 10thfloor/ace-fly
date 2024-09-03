import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface IFlyDomainConfig {
  domainName: string;
}

export class FlyDomain extends StackConstruct {
  domainName: string;

  constructor(stack: FlyStack, name: string, config: IFlyDomainConfig) {
    super(stack, name);
    this.domainName = config.domainName;
    // Implementation
  }

  synthesize(): Record<string, any> {
    return {
      type: 'domain',
      name: this.name,
      domainName: this.domainName
    };
  }
}