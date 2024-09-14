import { FlyProjectStack } from "../patterns/FlyProjectStack";

export interface DeploymentContext {
  app: FlyProjectStack;
  config: any;
  dryRun?: boolean;
}

export interface Middleware {
  process(context: DeploymentContext, next: () => Promise<void>): Promise<void>;
}

export class DeploymentPipeline {
  private middlewares: Middleware[] = [];
  private middlewareNames: Set<string> = new Set();

  use(middleware: Middleware, name: string): void {
    console.log(`Adding middleware: ${name}`);
    this.middlewares.push(middleware);
    this.middlewareNames.add(name);
  }

  hasMiddleware(name: string): boolean {
    return this.middlewareNames.has(name);
  }

  async run(context: DeploymentContext): Promise<void> {
    console.log("Starting deployment pipeline");
    const runner = this.composeMiddleware(this.middlewares);
    try {
      await runner(context);
      console.log("Deployment pipeline completed successfully");
    } catch (error) {
      console.error("Deployment pipeline failed:", error);
      throw error;
    }
  }

  private composeMiddleware(middlewares: Middleware[]) {
    const sortedMiddlewares = middlewares.sort((a, b) => {
      const aPriority = (a as any).priority || 0;
      const bPriority = (b as any).priority || 0;
      return bPriority - aPriority; // Higher priority first
    });

    return async (context: DeploymentContext) => {
      let index = -1;
      const dispatch = async (i: number): Promise<void> => {
        if (i <= index) return Promise.reject(new Error('next() called multiple times'));
        if (i >= sortedMiddlewares.length) return Promise.resolve();
        index = i;
        const middleware = sortedMiddlewares[i];
        try {
          console.log(`Executing middleware: ${middleware.constructor.name}`);
          await middleware.process(context, () => dispatch(i + 1));
          console.log(`Completed middleware: ${middleware.constructor.name}`);
        } catch (err) {
          console.error(`Error in middleware ${middleware.constructor.name}:`, err);
          throw err;
        }
      };
      return dispatch(0);
    };
  }
}

// Example middleware implementations:

export class ConfigurationLoader implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Loading configuration");
    const loadedConfig = this.loadConfiguration();
    context.config = { ...context.config, ...loadedConfig };
    console.log("Configuration loaded:", context.config);
    await next();
  }

  private loadConfiguration(): any {
    // Implement your configuration loading logic here
    return {};
  }
}

export class EnvironmentValidator implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Validating environment variables");
    if (!process.env.FLY_API_TOKEN) {
      throw new Error("FLY_API_TOKEN is not set");
    }
    await next();
  }
}

export class SecretManager implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Managing secrets");
    // TODO: Implement secret manager
    await next();
  }
}

export class ResourceInitializer implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Initializing basic resources");
    // This could include setting up the FlyApp, FlyDomain, and FlyCertificate
    await next();
  }
}

export class DatabaseSetup implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Setting up databases");
    if (context.config.database) {
       // Setup Database
       console.log("Setting up database:", context.config.database);
    }
    await next();
  }
}

export class ServiceConfigurator implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Configuring services");
    if (context.config.services) {
      for (const serviceConfig of context.config.services) {
        console.log("Configuring service:", serviceConfig);
      }
    }
    await next();
  }
}

export class NetworkingConfigurator implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Configuring networking");
    // This could include setting up load balancers, anycast IPs, etc.
    await next();
  }
}

export class ScalingConfigurator implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Configuring scaling");
    if (context.config.scaling) {
      // TODO: Implement scaling configurator
      console.log("Scaling config:", JSON.stringify(context.config.scaling, null, 2));
    }
    await next();
  }
}

export class FirewallConfigurator implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Configuring firewall rules");
    if (context.config.firewall) {
      console.log("Firewall config:", JSON.stringify(context.config.firewall, null, 2));
      console.log("Firewall rules:", JSON.stringify(context.config.firewall.rules, null, 2));
    } else {
      console.log("No explicit firewall configuration found. Applying default rules.");
      // Here you could apply default firewall rules if needed
    }
    await next();
  }
}

export class ObservabilitySetup implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Setting up observability");
    // This could include configuring metrics, logging, and tracing
    console.log("Observability config:", JSON.stringify(context.config.observability, null, 2));
    await next();
  }
}

export class DeploymentStrategy implements Middleware {
  async process(context: DeploymentContext, next: () => Promise<void>) {
    console.log("Applying deployment strategy");
    // This could be blue-green, canary, or other deployment strategies
    console.log("Deployment strategy:", context.config.deploymentStrategy);
    await next();
  }
}

