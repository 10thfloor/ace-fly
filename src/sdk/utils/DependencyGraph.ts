import type { StackConstruct } from "../constructs/StackConstruct";

export class DependencyGraph {
  private dependencies: Map<StackConstruct, Set<StackConstruct>> = new Map();

  addDependency(resource: StackConstruct, dependsOn: StackConstruct): void {
    if (!this.dependencies.has(resource)) {
      this.dependencies.set(resource, new Set());
    }
    this.dependencies.get(resource)!.add(dependsOn);
  }

  getOrderedResources(): StackConstruct[] {
    const visited = new Set<StackConstruct>();
    const result: StackConstruct[] = [];

    const visit = (resource: StackConstruct) => {
      if (visited.has(resource)) return;
      visited.add(resource);

      const dependencies = this.dependencies.get(resource) || new Set();
      for (const dep of dependencies) {
        visit(dep);
      }

      result.push(resource);
    };

    for (const resource of this.dependencies.keys()) {
      visit(resource);
    }

    return result;
  }
}