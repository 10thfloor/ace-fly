export class DeploymentPipeline {
    constructor() {
        this.middlewares = [];
        this.middlewareNames = new Set();
    }
    use(middleware, name) {
        console.log(`Adding middleware: ${name}`);
        this.middlewares.push(middleware);
        this.middlewareNames.add(name);
    }
    hasMiddleware(name) {
        return this.middlewareNames.has(name);
    }
    async run(context) {
        console.log("Starting deployment pipeline");
        const runner = this.composeMiddleware(this.middlewares);
        try {
            await runner(context);
            console.log("Deployment pipeline completed successfully");
        }
        catch (error) {
            console.error("Deployment pipeline failed:", error);
            throw error;
        }
    }
    composeMiddleware(middlewares) {
        return async (context) => {
            let index = -1;
            const dispatch = async (i) => {
                if (i <= index)
                    return Promise.reject(new Error('next() called multiple times'));
                index = i;
                let middleware = middlewares[i];
                if (i === middlewares.length)
                    middleware = { process: async () => { } };
                if (!middleware)
                    return Promise.resolve();
                try {
                    console.log(`Executing middleware: ${middleware.constructor.name}`);
                    await middleware.process(context, () => dispatch(i + 1));
                    console.log(`Completed middleware: ${middleware.constructor.name}`);
                }
                catch (err) {
                    console.error(`Error in middleware ${middleware.constructor.name}:`, err);
                    return Promise.reject(err);
                }
            };
            return dispatch(0);
        };
    }
}
// Example middleware implementations:
export class ConfigurationLoader {
    async process(context, next) {
        console.log("Loading configuration");
        context.config = { /* loaded config */};
        console.log("Configuration loaded:", context.config);
        await next();
    }
}
export class EnvironmentValidator {
    async process(context, next) {
        console.log("Validating environment variables");
        if (!process.env.FLY_API_TOKEN) {
            throw new Error("FLY_API_TOKEN is not set");
        }
        await next();
    }
}
export class SecretManager {
    async process(context, next) {
        console.log("Managing secrets");
        // TODO: Implement secret manager
        await next();
    }
}
export class ResourceInitializer {
    async process(context, next) {
        console.log("Initializing basic resources");
        // This could include setting up the FlyApp, FlyDomain, and FlyCertificate
        await next();
    }
}
export class DatabaseSetup {
    async process(context, next) {
        console.log("Setting up databases");
        if (context.config.database) {
            context.app.addDatabase(context.config.database);
        }
        await next();
    }
}
export class ServiceConfigurator {
    async process(context, next) {
        console.log("Configuring services");
        if (context.config.services) {
            for (const serviceConfig of context.config.services) {
                context.app.addHttpService(serviceConfig.name, serviceConfig);
            }
        }
        await next();
    }
}
export class NetworkingConfigurator {
    async process(context, next) {
        console.log("Configuring networking");
        // This could include setting up load balancers, anycast IPs, etc.
        await next();
    }
}
export class ScalingConfigurator {
    async process(context, next) {
        console.log("Configuring scaling");
        if (context.config.scaling) {
            // TODO: Implement scaling configurator
        }
        await next();
    }
}
export class FirewallConfigurator {
    async process(context, next) {
        console.log("Configuring firewall rules");
        if (context.config.firewall) {
            console.log("Firewall config:", JSON.stringify(context.config.firewall, null, 2));
            console.log("Firewall rules:", JSON.stringify(context.config.firewall.rules, null, 2));
        }
        else {
            console.log("No explicit firewall configuration found. Applying default rules.");
            // Here you could apply default firewall rules if needed
        }
        await next();
    }
}
export class ObservabilitySetup {
    async process(context, next) {
        console.log("Setting up observability");
        // This could include configuring metrics, logging, and tracing
        await next();
    }
}
export class DeploymentStrategy {
    async process(context, next) {
        console.log("Applying deployment strategy");
        // This could be blue-green, canary, or other deployment strategies
        await next();
    }
}
