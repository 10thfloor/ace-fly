import { DependencyGraph } from "../DependencyGraph";
import { StackConstruct } from "../../constructs/StackConstruct";
import { Dependency } from "../../utils/DependencyDecorator";
import { FlyStack } from "../../core/FlyStack";
import "reflect-metadata";

// Import expect from bun:test
// @ts-ignore
import { expect, it, describe } from "bun:test";

class TestResource extends StackConstruct {
  constructor(stack: FlyStack, name: string) {
    super(stack, name);
  }

  get resourceName(): string {
    return this.getId();
  }

  synthesize(): Record<string, any> {
    return {
      name: this.getId(),
    };
  }

  validate(): boolean {
    return true;
  }
}

class ResourceWithDependency extends StackConstruct {
  @Dependency()
  private dependency?: TestResource;

  constructor(stack: FlyStack, name: string) {
    super(stack, name);
  }

  setDependency(dependency: TestResource) {
    this.dependency = dependency;
  }

  synthesize(): Record<string, any> {
    return {
      name: this.getId(),
      dependency: this.dependency?.resourceName,
    };
  }

  validate(): boolean {
    return true;
  }
}

describe("DependencyGraph Tests", () => {
  it("should detect missing required dependencies", () => {
    const graph = new DependencyGraph();
    const stack = new FlyStack("test-stack"); // Proper instance of FlyStack

    const resource1 = new TestResource(stack, "Resource1");
    const resource2 = new TestResource(stack, "Resource2");
    const resourceWithMissingDep = new ResourceWithDependency(
      stack,
      "ResourceWithMissingDep",
    );

    graph.addResource(resource1);
    graph.addResource(resource2);
    graph.addResource(resourceWithMissingDep);

    const missingDependencies = graph.getMissingDependencies();

    expect(missingDependencies.size).toBe(1);
    expect(missingDependencies.get(resourceWithMissingDep)).toEqual([
      "dependency",
    ]);
  });

  it("should not report missing dependencies when all are provided", () => {
    const graph = new DependencyGraph();
    const stack = new FlyStack("test-stack"); // Proper instance of FlyStack

    const resource1 = new TestResource(stack, "Resource1");
    const resource2 = new TestResource(stack, "Resource2");
    const resourceWithDep = new ResourceWithDependency(
      stack,
      "ResourceWithDep",
    );

    graph.addResource(resource1);
    graph.addResource(resource2);
    graph.addResource(resourceWithDep);

    resourceWithDep.setDependency(resource2);
    graph.addDependency(resourceWithDep, resource2);

    const missingDependencies = graph.getMissingDependencies();

    expect(missingDependencies.size).toBe(0);
  });
});
