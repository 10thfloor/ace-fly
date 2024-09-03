import type { FlyStack } from "../core/FlyStack";
import { Logger } from "../utils/Logger";

export abstract class StackConstruct {
  protected stack: FlyStack;
  protected name: string;

  constructor(stack: FlyStack, name: string) {
    this.stack = stack;
    this.name = name;
  }

  initialize(): void {
    if (this.validate()) {
      this.stack.addResource(this);
    } else {
      Logger.error(`Failed to create invalid resource ${this.name}`);
      throw new Error(`Invalid configuration for ${this.name}`);
    }
  }

  getName(): string {
    return this.name;
  }

  abstract synthesize(): Record<string, any>;

  protected abstract validate(): boolean;
}