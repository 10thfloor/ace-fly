import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface IFlySecretConfig {
  key: string;
}

export class FlySecret extends StackConstruct {
  private config: IFlySecretConfig;

  constructor(stack: FlyStack, name: string, config: IFlySecretConfig) {
    super(stack, name);
    this.config = config;
    this.initialize();
  }

  synthesize(): Record<string, any> {
    return {
      type: 'secret',
      name: this.name,
      key: this.config.key
    };
  }

  protected validate(): boolean {
    return true;
  }
}