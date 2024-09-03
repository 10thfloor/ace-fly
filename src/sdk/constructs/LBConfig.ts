import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface ILBConfig {
  strategy: string;
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
  };
}

export class LBConfig extends StackConstruct {
  private config: ILBConfig;

  constructor(stack: FlyStack, name: string, config: ILBConfig) {
    super(stack, name);
    this.config = config;
    this.initialize();
  }

  synthesize(): Record<string, any> {
    return {
      type: 'lb-config',
      name: this.name,
      strategy: this.config.strategy,
      healthCheck: this.config.healthCheck
    };
  }

  protected validate(): boolean {
    return true;
  }
}