import type { StackConstruct } from "./StackConstruct";
import { DependencyGraph } from "../utils/DependencyGraph";
import { StackValidator } from "../utils/StackValidator";
import { ConfigurationSynthesizer } from "../utils/ConfigurationSynthesizer";
import type { Logger } from "../utils/Logger";
import type { FlyApiClient } from "../api/FlyApiClient";

export class FlyStack {
	private name: string;
	private resources: StackConstruct[] = [];
	private dependencyGraph: DependencyGraph = new DependencyGraph();
	private synthesizer: ConfigurationSynthesizer =
		new ConfigurationSynthesizer();
	private validator: StackValidator;

	constructor(name: string) {
		this.name = name || `fly-stack-${Math.random()}-${new Date().toLocaleString()}`;
		this.validator = new StackValidator(this);
	}

	addResource(resource: StackConstruct): void {
		this.resources.push(resource);
		this.dependencyGraph.addResource(resource);
	}

	addDependency(dependent: StackConstruct, dependency: StackConstruct): void {
		this.dependencyGraph.addDependency(dependent, dependency);
	}

	getName(): string {
		return this.name;
	}

	getResources(): StackConstruct[] {
		return this.resources;
	}

	getDependencyGraph(): DependencyGraph {
		return this.dependencyGraph;
	}

	validate(): boolean {
		return this.validator.validate();
	}

	synthesize(): Record<string, any> {
		if (!this.validate()) {
			throw new Error(
				"Stack validation failed. Cannot synthesize invalid stack.",
			);
		}
		return this.synthesizer.synthesize(this);
	}

	getValidationErrors(): string[] {
		return this.validator.getErrors();
	}

	sortResourcesByDependency(): StackConstruct[] {
		return this.dependencyGraph.topologicalSort();
	}
}
