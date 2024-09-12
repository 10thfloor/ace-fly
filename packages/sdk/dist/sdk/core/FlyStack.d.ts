import type { StackConstruct } from "./StackConstruct";
import { DependencyGraph } from "../utils/DependencyGraph";
import type { FlyApiClient } from "../api/FlyApiClient";
export declare class FlyStack {
    private name;
    private resources;
    private dependencyGraph;
    private synthesizer;
    private validator;
    private apiClient;
    constructor(name: string, apiClient: FlyApiClient);
    addResource(resource: StackConstruct): void;
    addDependency(dependent: StackConstruct, dependency: StackConstruct): void;
    getName(): string;
    getResources(): StackConstruct[];
    getDependencyGraph(): DependencyGraph;
    validate(): boolean;
    synthesize(): Record<string, any>;
    getValidationErrors(): string[];
    getApiClient(): FlyApiClient;
}
