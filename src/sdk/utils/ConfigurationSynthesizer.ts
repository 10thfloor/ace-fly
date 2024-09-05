import type { FlyStack } from "../core/FlyStack";
import { ResourceReference } from "../utils/ResourceReference";
import { StackConstruct } from "../constructs/StackConstruct";
import { Logger } from "../utils/Logger";

export class ConfigurationSynthesizer {
  private processedResources: Map<string, any> = new Map();

  synthesize(stack: FlyStack): Record<string, any> {
    this.processedResources.clear();

    const config: Record<string, any> = {
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

  private resolveReferences(obj: any): any {
    if (obj instanceof ResourceReference || obj instanceof StackConstruct) {
      return obj.getId();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveReferences(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const resolved: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && 'id' in value && this.processedResources.has(value.id as string)) {
          resolved[key] = value.id;
        } else {
          resolved[key] = this.resolveReferences(value);
        }
      }
      return resolved;
    }

    return obj;
  }
}