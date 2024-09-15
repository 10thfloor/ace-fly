import { FlyProjectStack } from "../patterns/FlyProjectStack";
import { FlyApiClient } from "../api/FlyApiClient";
import { DeploymentPipeline, Middleware, DeploymentContext } from "../middleware/DeploymentPipeline";
import { Logger } from "../utils/Logger";
import { ResourceDeployer } from "../middleware/ResourceDeployer"; // Update import path
import { DeploymentOrchestrator } from "./DeploymentOrchestrator"; // Import DeploymentOrchestrator
import { FlyStack } from "../core/FlyStack";

export class FlyDeployment {
  private apiClient: FlyApiClient;
  private pipeline: DeploymentPipeline;
  private orchestrator: DeploymentOrchestrator; // Add orchestrator property

  constructor(apiClient: FlyApiClient, stack: FlyStack) { // Accept stack as a parameter
    this.apiClient = apiClient;
    const resourceDeployer = new ResourceDeployer(this.apiClient);
    this.pipeline = new DeploymentPipeline();
    this.setupDefaultMiddlewares(resourceDeployer);
    this.orchestrator = new DeploymentOrchestrator(stack, resourceDeployer); // Use middleware ResourceDeployer
  }

  private setupDefaultMiddlewares(resourceDeployer: ResourceDeployer) {
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
    await this.orchestrator.deploy(); // Use orchestrator to deploy
  }

  async dryRun(app: FlyProjectStack): Promise<void> {
    const config = app.synthesize();
    Logger.info(`Synthesized config (dry run): ${JSON.stringify(config, null, 2)}`);
    const context: DeploymentContext = { app, config, dryRun: true };
    await this.pipeline.run(context);
    await this.orchestrator.dryRun(); // Use orchestrator for dry run
  }
}