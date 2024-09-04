import { StackConstruct } from "../constructs/StackConstruct";
import { Logger } from "../utils/Logger";

export interface DependencyNode {
	resource: StackConstruct;
	dependencies: DependencyNode[];
	cyclicDependencies?: string[];
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

		if (!resourceNode.dependencies.some(dep => dep.resource === dependsOn)) {
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

		// Visit all nodes
		for (const root of this.rootNodes) {
			visit(this.nodes.get(root)!);
		}

		return result;
	}

	getDependencies(resource: StackConstruct): StackConstruct[] {
		const node = this.nodes.get(resource);
		return node ? node.dependencies.map((dep) => dep.resource) : [];
	}

	getMissingDependencies(): Map<StackConstruct, string[]> {
		const missingDependencies = new Map<StackConstruct, string[]>();

		for (const [resource, node] of this.nodes) {
			const requiredDeps = Reflect.getMetadata('dependencyProperties', Object.getPrototypeOf(resource)) as Map<string | symbol, boolean> || new Map();
			const actualDeps = new Set(node.dependencies.map(dep => dep.resource.constructor.name));
			
			const missing: string[] = [];
			for (const [propKey, isOptional] of requiredDeps) {
				const propValue = (resource as any)[propKey];
				if (!isOptional && (!propValue || !actualDeps.has(propValue?.constructor.name))) {
					missing.push(propKey.toString());
				}
			}

			if (missing.length > 0) {
				missingDependencies.set(resource, missing);
			}
		}

		return missingDependencies;
	}
}
