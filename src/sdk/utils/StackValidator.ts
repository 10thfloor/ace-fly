import { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../constructs/StackConstruct";
import { Logger } from "./Logger";
import { FlyApp } from "../constructs/FlyApp";
import { FlyMachine } from "../constructs/FlyMachine";

export class StackValidator {
  private stack: FlyStack;
  private errors: string[] = [];

  constructor(stack: FlyStack) {
    this.stack = stack;
  }

  validate(): boolean {
    this.errors = [];
    const resources = this.stack.getResources();

    // Validate individual resources
    resources.forEach(resource => this.validateResource(resource));

    // Validate stack-level constraints
    this.validateStackConstraints();

    // Check for circular dependencies
    this.validateNoCyclicDependencies();

    // Log errors if any
    if (this.errors.length > 0) {
      this.errors.forEach(error => Logger.error(error));
      return false;
    }

    return true;
  }

  private validateResource(resource: StackConstruct): void {
    if (!resource.isValid()) {  // Use the new public method
      this.errors.push(`Invalid configuration for resource: ${resource.getName()}`);
    }
  }

  private validateStackConstraints(): void {
   // TODO: Add more stack-level validations here
  }

  private validateNoCyclicDependencies(): void {
    const graph = this.stack.getDependencyGraph();
    const cycles = graph.findCycles();
    if (cycles.length > 0) {
      cycles.forEach(cycle => {
        this.errors.push(`Circular dependency detected: ${cycle.map(node => node.getName()).join(' -> ')}`);
      });
    }
  }

  getErrors(): string[] {
    return this.errors;
  }
}