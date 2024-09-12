import "reflect-metadata";
import { ResourceReference } from "../utils/ResourceReference";
export class StackConstruct {
    constructor(stack, id) {
        this.stack = stack;
        this.id = id;
    }
    initialize() {
        this.stack.addResource(this);
        this.addDependenciesToStack();
    }
    isValid() {
        return this.validate();
    }
    getResource(resourceOrRef) {
        return resourceOrRef instanceof ResourceReference
            ? resourceOrRef.getResource()
            : resourceOrRef;
    }
    addDependenciesToStack() {
        const dependencyProperties = Reflect.getMetadata("dependencyProperties", this.constructor) || new Map();
        for (const [propertyKey, _] of dependencyProperties) {
            const dependency = this[propertyKey];
            this.addDependency(dependency);
        }
    }
    addDependency(dependency) {
        if (dependency instanceof StackConstruct) {
            this.stack.addDependency(this, dependency);
        }
        else if (dependency instanceof ResourceReference) {
            this.stack.addDependency(this, dependency.getResource());
        }
        else if (Array.isArray(dependency)) {
            for (const item of dependency) {
                this.addDependency(item);
            }
        }
        else if (typeof dependency === "object" && dependency !== null) {
            for (const item of Object.values(dependency)) {
                this.addDependency(item);
            }
        }
    }
    getId() {
        return this.id;
    }
    getReference() {
        return new ResourceReference(this);
    }
    static create(stack, id, config) {
        // biome-ignore lint/complexity/noThisInStatic: This is a warning, not an error
        const instance = new this(stack, id, config);
        instance.initialize();
        return instance;
    }
    getStack() {
        return this.stack;
    }
}
