import { Logger } from "./Logger";
export class StackValidator {
    constructor(stack) {
        this.errors = [];
        this.stack = stack;
    }
    validate() {
        this.errors = [];
        const resources = this.stack.getResources();
        resources.forEach((resource) => this.validateResource(resource));
        this.validateStackConstraints();
        this.validateNoCyclicDependencies();
        if (this.errors.length > 0) {
            this.errors.forEach((error) => Logger.error(error));
            return false;
        }
        return true;
    }
    validateResource(resource) {
        if (!resource.isValid()) {
            this.errors.push(`Invalid configuration for resource: ${resource.getId()}`);
        }
    }
    validateStackConstraints() {
        // Add more stack-level validations here
    }
    validateNoCyclicDependencies() {
        const graph = this.stack.getDependencyGraph();
        const cycles = graph.findCycles();
        if (cycles.length > 0) {
            cycles.forEach((cycle) => {
                this.errors.push(`Circular dependency detected: ${cycle.map((node) => node.getId()).join(" -> ")}`);
            });
        }
    }
    getErrors() {
        return this.errors;
    }
}
