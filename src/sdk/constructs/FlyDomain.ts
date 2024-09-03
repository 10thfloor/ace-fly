import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";
import { Logger } from "../utils/Logger";

export interface IFlyDomainConfig {
  domainName: string;
}

export class FlyDomain extends StackConstruct {
  domainName: string;

  constructor(stack: FlyStack, name: string, config: IFlyDomainConfig) {
    super(stack, name);
    this.domainName = config.domainName;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'domain',
      name: this.name,
      domainName: this.domainName
    };
  }

  protected validate(): boolean {
    if (!this.domainName || typeof this.domainName !== 'string') {
      Logger.error(`Invalid domain name for ${this.name}`);
      return false;
    }
    // Add more specific validation rules here
    return true;
  }
}