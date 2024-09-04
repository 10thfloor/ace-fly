import { StackConstruct } from "../constructs/StackConstruct";

export class ResourceReference<T extends StackConstruct> {
  private readonly resource: T;

  constructor(resource: T) {
    this.resource = resource;
  }

  getName(): string {
    return this.resource.getName();
  }

  getType(): string {
    return this.resource.constructor.name;
  }

  getResource(): T {
    return this.resource;
  }

  toString(): string {
    return `${this.getType()}:${this.getName()}`;
  }
}