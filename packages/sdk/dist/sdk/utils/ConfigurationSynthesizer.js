import { ResourceReference } from "../utils/ResourceReference";
import { StackConstruct } from "../core/StackConstruct";
import { Logger } from "../utils/Logger";
export class ConfigurationSynthesizer {
    constructor() {
        this.processedResources = new Map();
    }
    synthesize(stack) {
        this.processedResources.clear();
        const config = {
            app: stack.getName(),
            resources: {},
        };
        const orderedResources = stack.getDependencyGraph().getOrderedResources();
        // First pass: Synthesize all resources
        for (const resource of orderedResources) {
            Logger.info(`Synthesizing resource: ${resource.getId()}`);
            const resourceConfig = resource.synthesize();
            this.processedResources.set(resource.getId(), resourceConfig);
        }
        // Second pass: Resolve references and add to final config
        for (const [id, resourceConfig] of this.processedResources) {
            config.resources[id] = this.resolveReferences(resourceConfig);
        }
        return config;
    }
    resolveReferences(obj) {
        if (obj instanceof ResourceReference || obj instanceof StackConstruct) {
            return obj.getId();
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.resolveReferences(item));
        }
        if (typeof obj === "object" && obj !== null) {
            const resolved = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value &&
                    typeof value === "object" &&
                    "id" in value &&
                    this.processedResources.has(value.id)) {
                    resolved[key] = value.id;
                }
                else {
                    resolved[key] = this.resolveReferences(value);
                }
            }
            return resolved;
        }
        return obj;
    }
}
