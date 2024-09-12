import { DependencyGraph } from "../utils/DependencyGraph";
import { StackValidator } from "../utils/StackValidator";
import { ConfigurationSynthesizer } from "../utils/ConfigurationSynthesizer";
export class FlyStack {
    constructor(name, apiClient) {
        this.resources = [];
        this.dependencyGraph = new DependencyGraph();
        this.synthesizer = new ConfigurationSynthesizer();
        this.name = name || `fly-stack-${Math.random()}-${new Date().toLocaleString()}`;
        this.validator = new StackValidator(this);
        this.apiClient = apiClient;
    }
    addResource(resource) {
        this.resources.push(resource);
        this.dependencyGraph.addResource(resource);
    }
    addDependency(dependent, dependency) {
        this.dependencyGraph.addDependency(dependent, dependency);
    }
    getName() {
        return this.name;
    }
    getResources() {
        return this.resources;
    }
    getDependencyGraph() {
        return this.dependencyGraph;
    }
    validate() {
        return this.validator.validate();
    }
    synthesize() {
        if (!this.validate()) {
            throw new Error("Stack validation failed. Cannot synthesize invalid stack.");
        }
        return this.synthesizer.synthesize(this);
    }
    getValidationErrors() {
        return this.validator.getErrors();
    }
    getApiClient() {
        return this.apiClient;
    }
}
