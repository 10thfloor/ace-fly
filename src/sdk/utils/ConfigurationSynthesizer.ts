import type { FlyStack } from "../core/FlyStack";

export class ConfigurationSynthesizer {
  synthesize(stack: FlyStack): Record<string, any> {
    const config: Record<string, any> = {
      app: stack.getName(),
      resources: {},
    };

    for (const resource of stack.getOrderedResources()) {
      const resourceConfig = resource.synthesize();
      config.resources[resource.getName()] = resourceConfig;
    }

    return config;
  }
}