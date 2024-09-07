import type { FlyStack } from "../core/FlyStack";
import type { StackConstruct } from "../core/StackConstruct";
import { Logger } from "./Logger";

export class StackValidator {
	private stack: FlyStack;
	private errors: string[] = [];

	constructor(stack: FlyStack) {
		this.stack = stack;
	}

	validate(): boolean {
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

	private validateResource(resource: StackConstruct): void {
		if (!resource.isValid()) {
			this.errors.push(
				`Invalid configuration for resource: ${resource.getId()}`,
			);
		}
	}

	private validateStackConstraints(): void {
		// Add more stack-level validations here
	}

	private validateNoCyclicDependencies(): void {
		const graph = this.stack.getDependencyGraph();
		const cycles = graph.findCycles();
		if (cycles.length > 0) {
			cycles.forEach((cycle) => {
				this.errors.push(
					`Circular dependency detected: ${cycle.map((node) => node.getId()).join(" -> ")}`,
				);
			});
		}
	}

	getErrors(): string[] {
		return this.errors;
	}
}
