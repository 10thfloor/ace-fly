import type { FlyStack } from "../core/FlyStack";

export abstract class StackConstruct {
  protected stack: FlyStack;
  protected name: string;

  constructor(stack: FlyStack, name: string) {
    this.stack = stack;
    this.name = name;
    this.stack.addResource(this);
  }

  getName(): string {
    return this.name;
  }

  abstract synthesize(): Record<string, any>;
}