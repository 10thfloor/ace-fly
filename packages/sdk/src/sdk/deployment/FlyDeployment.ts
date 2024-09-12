import type { FlyApplication } from "../patterns/FlyApplication";
import type { FlyApiClient } from "../api/FlyApiClient";
import { DeploymentPipeline, type DeploymentContext, type Middleware } from "../middleware/DeploymentPipeline";
import { Logger } from "../utils/Logger";

// Import middlewares
import { 
  ConfigurationLoader, EnvironmentValidator, ResourceInitializer, 
  DeploymentStrategy, SecretManager, DatabaseSetup, 
  ServiceConfigurator, NetworkingConfigurator, ScalingConfigurator, 
  FirewallConfigurator, ObservabilitySetup 
} from "../middleware/DeploymentPipeline";

/**
 * Represents a middleware entry in the deployment pipeline
 */
interface MiddlewareEntry {
  middleware: Middleware;
  dependencies: string[];
  priority: number;
}

/**
 * Manages the deployment process for a Fly application
 */
export class FlyDeployment {
  private apiClient: FlyApiClient;
  private pipeline: DeploymentPipeline;
  private middlewares: Map<string, MiddlewareEntry> = new Map();

  /**
   * Creates a new FlyDeployment instance
   * @param apiClient - The Fly API client
   */
  constructor(apiClient: FlyApiClient) {
    this.apiClient = apiClient;
    this.pipeline = new DeploymentPipeline();
    this.setupDefaultMiddlewares();
  }

  /**
   * Sets up the default middlewares for the deployment pipeline
   */
  private setupDefaultMiddlewares() {
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

  /**
   * Adds a middleware to the deployment pipeline
   * @param name - The name of the middleware
   * @param middleware - The middleware instance
   * @param dependencies - Names of middlewares this one depends on
   * @param priority - Priority of the middleware (higher numbers run first)
   * 
   * Priority determines the order in which middlewares are executed:
   * - Higher priority (larger number) middlewares run before lower priority ones
   * - Priorities range from 0 to 100 in the default setup
   * - Custom middlewares can use any integer value for priority
   * - If priorities are equal, the order is determined by when they were added
   */
  addMiddleware(name: string, middleware: Middleware, dependencies: string[] = [], priority = 0) {
    this.middlewares.set(name, { middleware, dependencies, priority });
  }

  /**
   * Builds the deployment pipeline based on the application configuration
   * @param app - The Fly application
   * 
   * This method:
   * 1. Filters middlewares based on the app config
   * 2. Sorts them by priority (highest to lowest)
   * 3. Adds them to the pipeline, respecting dependencies
   */
  private buildPipeline(app: FlyApplication) {
    const config = app.synthesize();
    const sortedMiddlewares = Array.from(this.middlewares.entries())
      .filter(([name, entry]) => this.shouldIncludeMiddleware(name, config))
      .sort((a, b) => b[1].priority - a[1].priority);

    for (const [name, entry] of sortedMiddlewares) {
      if (entry.dependencies.every(dep => this.pipeline.hasMiddleware(dep))) {
        this.pipeline.use(entry.middleware, name);
        Logger.info(`Added middleware: ${name} (priority: ${entry.priority})`);
      } else {
        Logger.warn(`Skipping middleware ${name} due to missing dependencies`);
      }
    }
  }

  /**
   * Determines if a middleware should be included based on the app config
   * @param name - The name of the middleware
   * @param config - The application configuration
   * @returns True if the middleware should be included, false otherwise
   */
  private shouldIncludeMiddleware(name: string, config: any): boolean {
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

  /**
   * Deploys the Fly application
   * @param app - The Fly application to deploy
   * @throws Error if deployment fails
   */
  async deploy(app: FlyApplication): Promise<void> {
    Logger.info("Starting deployment process");
    const context: DeploymentContext = { app, config: app.synthesize() };
    
    // Logger.info(`Synthesized config: ${JSON.stringify(context.config)}`);

    this.buildPipeline(app);

    try {
      await this.pipeline.run(context);
      Logger.info("Pipeline execution completed");
      
      Logger.info("==== NOTHING DEPLOYED YET ====");
      
      Logger.info("Deployment completed successfully");
    } catch (error) {
      Logger.error(`Deployment failed: ${error}`);
      throw error;
    }
  }
}