import type { FlyStack } from "../core/FlyStack";
import { Logger } from "../utils/Logger";
import "reflect-metadata";

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
      this.addDependenciesToStack();
    } else {
      Logger.error(`Failed to create invalid resource ${this.name}`);
      throw new Error(`Invalid configuration for ${this.name}`);
    }
  }

  private addDependenciesToStack(): void {
    const dependencyProperties = Reflect.getMetadata('dependencyProperties', this.constructor) as Map<string | symbol, boolean> || new Map();
    for (const [propertyKey, _] of dependencyProperties) {
      const dependency = (this as any)[propertyKey];
      if (dependency instanceof StackConstruct) {
        this.stack.addDependency(this, dependency);
      } else if (Array.isArray(dependency)) {
        dependency.forEach(item => {
          if (item instanceof StackConstruct) {
            this.stack.addDependency(this, item);
          }
        });
      } else if (typeof dependency === 'object' && dependency !== null) {
        Object.values(dependency).forEach(item => {
          if (item instanceof StackConstruct) {
            this.stack.addDependency(this, item);
          }
        });
      }
    }
  }

  getName(): string {
    return this.name;
  }

  abstract synthesize(): Record<string, any>;

  protected abstract validate(): boolean;
}