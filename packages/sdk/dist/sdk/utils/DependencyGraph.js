import { Logger } from "./Logger";
export class DependencyGraph {
    constructor() {
        this.nodes = new Map();
        this.rootNodes = new Set();
    }
    addResource(resource) {
        if (!this.nodes.has(resource)) {
            this.nodes.set(resource, { resource, dependencies: [] });
            this.rootNodes.add(resource);
        }
    }
    addDependency(resource, dependsOn) {
        this.addResource(resource);
        this.addResource(dependsOn);
        const resourceNode = this.nodes.get(resource);
        const dependsOnNode = this.nodes.get(dependsOn);
        if (!resourceNode.dependencies.some((dep) => dep.resource === dependsOn)) {
            resourceNode.dependencies.push(dependsOnNode);
        }
        this.rootNodes.delete(dependsOn);
    }
    getOrderedResources() {
        const visited = new Set();
        const result = [];
        const visit = (node) => {
            if (visited.has(node.resource))
                return;
            visited.add(node.resource);
            for (const dep of node.dependencies) {
                visit(dep);
            }
            result.push(node.resource);
        };
        for (const root of this.rootNodes) {
            visit(this.nodes.get(root));
        }
        Logger.info(`Ordered resources: ${result.map((r) => r.getId()).join(", ")}`);
        return result;
    }
    getMissingDependencies() {
        const missingDependencies = new Map();
        for (const [resource, node] of this.nodes) {
            const requiredDeps = Reflect.getMetadata("dependencyProperties", Object.getPrototypeOf(resource)) || new Map();
            const actualDeps = new Set(node.dependencies.map((dep) => dep.resource.constructor.name));
            const missing = [];
            for (const [propKey, isOptional] of requiredDeps) {
                const propValue = resource[propKey];
                if (!isOptional &&
                    (!propValue || !actualDeps.has(propValue?.constructor.name))) {
                    missing.push(propKey.toString());
                }
            }
            if (missing.length > 0) {
                missingDependencies.set(resource, missing);
            }
        }
        return missingDependencies;
    }
    findCycles() {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        const dfs = (node, path = []) => {
            if (recursionStack.has(node)) {
                const cycleStart = path.indexOf(node);
                cycles.push(path.slice(cycleStart));
                return;
            }
            if (visited.has(node))
                return;
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            const dependencies = this.nodes.get(node)?.dependencies || [];
            for (const dep of dependencies) {
                dfs(dep.resource, [...path]);
            }
            recursionStack.delete(node);
            path.pop();
        };
        for (const node of this.nodes.keys()) {
            if (!visited.has(node)) {
                dfs(node);
            }
        }
        return cycles;
    }
}
