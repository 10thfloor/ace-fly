import { FlyProjectStack } from "../patterns/FlyProjectStack";
import { FlyApiClient } from "../api/FlyApiClient";
import { DeploymentPipeline, Middleware, DeploymentContext } from "../middleware/DeploymentPipeline";
import { Logger } from "../utils/Logger";
import { ResourceDeployer } from "../middleware/ResourceDeployer";

export class FlyDeployment {
  private apiClient: FlyApiClient;
  private pipeline: DeploymentPipeline;

  constructor(apiClient: FlyApiClient) {
    this.apiClient = apiClient;
    this.pipeline = new DeploymentPipeline();
    this.setupDefaultMiddlewares();
  }

  private setupDefaultMiddlewares() {
    this.addMiddleware("resourceDeployer", new ResourceDeployer(this.apiClient), [], 50);
    // Add other middlewares if needed, e.g., EnvironmentValidator, ObservabilitySetup, etc.
    // Example:
    // this.addMiddleware("environmentValidator", new EnvironmentValidator(), [], 100);
    // this.addMiddleware("observabilitySetup", new ObservabilitySetup(), ["environmentValidator"], 80);
  }

  addMiddleware(name: string, middleware: Middleware, dependencies: string[] = [], priority: number = 0) {
    this.pipeline.use(middleware, name);
    // Middleware ordering based on dependencies and priority is not handled yet
    // Consider enhancing DeploymentPipeline to sort/match middleware based on these parameters
  }

  async deploy(app: FlyProjectStack): Promise<void> {
    const config = app.synthesize();
    // Logger.info(`Synthesized config: ${JSON.stringify(config, null, 2)}`);
    const context: DeploymentContext = { app, config };
    await this.pipeline.run(context);
  }

  async dryRun(app: FlyProjectStack): Promise<void> {
    const config = app.synthesize();
    Logger.info(`Synthesized config (dry run): ${JSON.stringify(config, null, 2)}`);
    const context: DeploymentContext = { app, config, dryRun: true };
    await this.pipeline.run(context);
  }
}