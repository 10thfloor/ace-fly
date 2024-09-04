import type { FlyStack } from "../core/FlyStack";
import { ResourceReference } from "../utils/ResourceReference";
import { StackConstruct } from "../constructs/StackConstruct";

export class ConfigurationSynthesizer {
  private flatConfig: Record<string, any> = {};

  synthesize(stack: FlyStack): Record<string, any> {
    const config: Record<string, any> = {
      app: stack.getName(),
      resources: {},
    };

    const orderedResources = stack.getDependencyGraph().getOrderedResources();

    // First pass: Add all resources to the flat configuration
    for (const resource of orderedResources) {
      const resourceConfig = resource.synthesize();
      this.addResourceToFlatConfig(resourceConfig);
    }

    // Second pass: Replace nested resources with their names
    for (const resourceName in this.flatConfig) {
      this.replaceNestedResourcesWithNames(this.flatConfig[resourceName]);
    }

    config.resources = this.flatConfig;
    return config;
  }

  private addResourceToFlatConfig(resourceConfig: Record<string, any>): void {
    const { name } = resourceConfig;
    if (name && !this.flatConfig[name]) {
      this.flatConfig[name] = resourceConfig;
    }
  }

  private replaceNestedResourcesWithNames(resourceConfig: Record<string, any>): void {
    for (const key in resourceConfig) {
      if (resourceConfig[key] instanceof ResourceReference) {
        resourceConfig[key] = resourceConfig[key].getName();
      } else if (Array.isArray(resourceConfig[key])) {
        resourceConfig[key] = resourceConfig[key].map((item: any) => {
          if (item instanceof ResourceReference) {
            return item.getName();
          } else if (typeof item === 'object' && item !== null && item.name && this.flatConfig[item.name]) {
            return item.name;
          }
          return item;
        });
      } else if (typeof resourceConfig[key] === 'object' && resourceConfig[key] !== null) {
        if (resourceConfig[key].name && this.flatConfig[resourceConfig[key].name]) {
          resourceConfig[key] = resourceConfig[key].name;
        } else {
          this.replaceNestedResourcesWithNames(resourceConfig[key]);
        }
      }
    }
  }
}