import type { StackConstruct } from "../core/StackConstruct";
import { Logger } from "./Logger";
export interface DependencyNode {
	resource: StackConstruct;
	dependencies: DependencyNode[];
}

export class DependencyGraph {
	private nodes: Map<StackConstruct, DependencyNode> = new Map();
	private rootNodes: Set<StackConstruct> = new Set();

	addResource(resource: StackConstruct): void {
		if (!this.nodes.has(resource)) {
			this.nodes.set(resource, { resource, dependencies: [] });
			this.rootNodes.add(resource);
		}
	}

	addDependency(resource: StackConstruct, dependsOn: StackConstruct): void {
		this.addResource(resource);
		this.addResource(dependsOn);

		const resourceNode = this.nodes.get(resource)!;
		const dependsOnNode = this.nodes.get(dependsOn)!;

		if (!resourceNode.dependencies.some((dep) => dep.resource === dependsOn)) {
			resourceNode.dependencies.push(dependsOnNode);
		}

		this.rootNodes.delete(dependsOn);
	}

	getOrderedResources(): StackConstruct[] {
		const visited = new Set<StackConstruct>();
		const result: StackConstruct[] = [];

		const visit = (node: DependencyNode) => {
			if (visited.has(node.resource)) return;
			visited.add(node.resource);

			for (const dep of node.dependencies) {
				visit(dep);
			}

			result.push(node.resource);
		};

		for (const root of this.rootNodes) {
			visit(this.nodes.get(root)!);
		}

		Logger.info(
			`Ordered resources: ${result.map((r) => r.getId()).join(", ")}`,
		);

		return result;
	}

	getMissingDependencies(): Map<StackConstruct, string[]> {
		const missingDependencies = new Map<StackConstruct, string[]>();

		for (const [resource, node] of this.nodes) {
			const requiredDeps =
				(Reflect.getMetadata(
					"dependencyProperties",
					Object.getPrototypeOf(resource),
				) as Map<string | symbol, boolean>) || new Map();
			const actualDeps = new Set(
				node.dependencies.map((dep) => dep.resource.constructor.name),
			);

			const missing: string[] = [];
			for (const [propKey, isOptional] of requiredDeps) {
				const propValue = (resource as any)[propKey];
				if (
					!isOptional &&
					(!propValue || !actualDeps.has(propValue?.constructor.name))
				) {
					missing.push(propKey.toString());
				}
			}

			if (missing.length > 0) {
				missingDependencies.set(resource, missing);
			}
		}

		return missingDependencies;
	}

	findCycles(): StackConstruct[][] {
		const visited = new Set<StackConstruct>();
		const recursionStack = new Set<StackConstruct>();
		const cycles: StackConstruct[][] = [];

		const dfs = (node: StackConstruct, path: StackConstruct[] = []) => {
			if (recursionStack.has(node)) {
				const cycleStart = path.indexOf(node);
				cycles.push(path.slice(cycleStart));
				return;
			}

			if (visited.has(node)) return;

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
