import { StackConstruct } from "./StackConstruct";
import type { FlyStack } from "../core/FlyStack";

export interface IDomainConfig {
  name?: string;
  domainName: string;
}

export class Domain extends StackConstruct {
  private config: IDomainConfig;

  constructor(stack: FlyStack, id: string, config: IDomainConfig) {
    super(stack, id);
    this.config = config;
    this.initialize();
  }

  getDomainName(): string {
    return this.config.domainName;
  }

  synthesize(): Record<string, any> {
    return {
      type: "domain",
      name: this.config.name || this.getId(),
      domainName: this.config.domainName,
    };
  }

  protected validate(): boolean {
    return !!this.config.domainName;
  }
}
