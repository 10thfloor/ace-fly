import { DeploymentPipeline } from "../middleware/DeploymentPipeline";
import { Logger } from "../utils/Logger";
// Import middlewares individually to avoid the module not found error
import { ConfigurationLoader } from "../middleware/DeploymentPipeline";
import { EnvironmentValidator } from "../middleware/DeploymentPipeline";
import { ResourceInitializer } from "../middleware/DeploymentPipeline";
import { DeploymentStrategy } from "../middleware/DeploymentPipeline";
import { SecretManager } from "../middleware/DeploymentPipeline";
import { DatabaseSetup } from "../middleware/DeploymentPipeline";
import { ServiceConfigurator } from "../middleware/DeploymentPipeline";
import { NetworkingConfigurator } from "../middleware/DeploymentPipeline";
import { ScalingConfigurator } from "../middleware/DeploymentPipeline";
import { FirewallConfigurator } from "../middleware/DeploymentPipeline";
import { ObservabilitySetup } from "../middleware/DeploymentPipeline";
export class FlyDeployment {
    constructor(apiClient) {
        this.middlewares = new Map();
        this.apiClient = apiClient;
        this.pipeline = new DeploymentPipeline();
        this.setupDefaultMiddlewares();
    }
    setupDefaultMiddlewares() {
        this.addMiddleware("configLoader", new ConfigurationLoader(), [], 100);
        this.addMiddleware("envValidator", new EnvironmentValidator(), ["configLoader"], 90);
        this.addMiddleware("resourceInit", new ResourceInitializer(), ["envValidator"], 80);
        this.addMiddleware("secretManager", new SecretManager(), ["resourceInit"], 70);
        this.addMiddleware("dbSetup", new DatabaseSetup(), ["resourceInit"], 60);
        this.addMiddleware("serviceConfig", new ServiceConfigurator(), ["resourceInit"], 50);
        this.addMiddleware("networkConfig", new NetworkingConfigurator(), ["resourceInit"], 40);
        this.addMiddleware("scalingConfig", new ScalingConfigurator(), ["serviceConfig", "networkConfig"], 30);
        this.addMiddleware("firewallConfig", new FirewallConfigurator(), ["networkConfig"], 20);
        this.addMiddleware("observability", new ObservabilitySetup(), ["resourceInit"], 10);
        this.addMiddleware("deployStrategy", new DeploymentStrategy(), [], 0);
    }
    addMiddleware(name, middleware, dependencies = [], priority = 0) {
        this.middlewares.set(name, { middleware, dependencies, priority });
    }
    buildPipeline(app) {
        const config = app.synthesize();
        const sortedMiddlewares = Array.from(this.middlewares.entries())
            .filter(([name, entry]) => this.shouldIncludeMiddleware(name, config))
            .sort((a, b) => b[1].priority - a[1].priority);
        for (const [name, entry] of sortedMiddlewares) {
            if (entry.dependencies.every(dep => this.pipeline.hasMiddleware(dep))) {
                this.pipeline.use(entry.middleware, name);
                Logger.info(`Added middleware: ${name}`);
            }
            else {
                Logger.warn(`Skipping middleware ${name} due to missing dependencies`);
            }
        }
    }
    shouldIncludeMiddleware(name, config) {
        switch (name) {
            case "configLoader":
            case "envValidator":
            case "resourceInit":
            case "serviceConfig":
            case "networkConfig":
            case "firewallConfig":
            case "observability":
            case "deployStrategy":
                return true; // Always include these essential middlewares
            case "secretManager": return config.secrets && Object.keys(config.secrets).length > 0;
            case "dbSetup": return config.databases && Object.keys(config.databases).length > 0;
            case "scalingConfig": return !!config.app.scaling;
            default: return true;
        }
    }
    async deploy(app) {
        Logger.info("Starting deployment process");
        const context = { app, config: app.synthesize() };
        // Add this logging to see what's in the config
        Logger.info(`Synthesized config: ${context.config}`);
        this.buildPipeline(app);
        try {
            await this.pipeline.run(context);
            Logger.info("Pipeline execution completed");
            Logger.info("==== NOTHING DEPLOYED YET ====");
            Logger.info("Deployment completed successfully");
        }
        catch (error) {
            Logger.error(`Deployment failed: ${error}`);
            throw error;
        }
    }
}
