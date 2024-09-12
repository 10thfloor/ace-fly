import type { StackConstruct } from "../core/StackConstruct";
export interface DependencyNode {
    resource: StackConstruct;
    dependencies: DependencyNode[];
}
export declare class DependencyGraph {
    private nodes;
    private rootNodes;
    addResource(resource: StackConstruct): void;
    addDependency(resource: StackConstruct, dependsOn: StackConstruct): void;
    getOrderedResources(): StackConstruct[];
    getMissingDependencies(): Map<StackConstruct, string[]>;
    findCycles(): StackConstruct[][];
}
