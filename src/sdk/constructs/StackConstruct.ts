import type { FlyStack } from "../core/FlyStack";
import { Logger } from "../utils/Logger";
import "reflect-metadata";
import { ResourceReference } from "../utils/ResourceReference";
import type { ResourceOrReference } from "../../types";
export abstract class StackConstruct {
	protected stack: FlyStack;
	protected id: string;

	constructor(stack: FlyStack, id: string) {
		this.stack = stack;
		this.id = id;
	}

	initialize(): void {
		this.stack.addResource(this);
		this.addDependenciesToStack();
	}

	public isValid(): boolean {
		return this.validate();
	}

	protected getResource<T extends StackConstruct>(
		resourceOrRef: ResourceOrReference<T>,
	): T {
		return resourceOrRef instanceof ResourceReference
			? resourceOrRef.getResource()
			: resourceOrRef;
	}

	private addDependenciesToStack(): void {
		const dependencyProperties =
			(Reflect.getMetadata("dependencyProperties", this.constructor) as Map<
				string | symbol,
				boolean
			>) || new Map();
		for (const [propertyKey, _] of dependencyProperties) {
			const dependency = (this as any)[propertyKey];
			this.addDependency(dependency);
		}
	}

	private addDependency(dependency: any): void {
		if (dependency instanceof StackConstruct) {
			this.stack.addDependency(this, dependency);
		} else if (dependency instanceof ResourceReference) {
			this.stack.addDependency(this, dependency.getResource());
		} else if (Array.isArray(dependency)) {
			for (const item of dependency) {
				this.addDependency(item);
			}
		} else if (typeof dependency === "object" && dependency !== null) {
			for (const item of Object.values(dependency)) {
				this.addDependency(item);
			}
		}
	}

	getId(): string {
		return this.id;
	}

	abstract synthesize(): Record<string, any>;

	protected abstract validate(): boolean;
	protected abstract getName(): string;

	getReference(): ResourceReference<this> {
		return new ResourceReference(this);
	}

	static create<T extends StackConstruct>(
		this: new (
			stack: FlyStack,
			id: string,
			config: any,
		) => T,
		stack: FlyStack,
		id: string,
		config: any,
	): T {
		// biome-ignore lint/complexity/noThisInStatic: This is a warning, not an error
		const instance = new this(stack, id, config);
		instance.initialize();
		return instance;
	}
}
