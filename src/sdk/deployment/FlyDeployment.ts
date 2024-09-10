import type { FlyApplication } from "../patterns/FlyApplication";
import type { FlyApiClient } from "../api/FlyApiClient";
import { DeploymentPipeline, type DeploymentContext } from "../middleware/DeploymentPipeline";
import { Logger } from "../utils/Logger";

export class FlyDeployment {
  private apiClient: FlyApiClient;
  private pipeline: DeploymentPipeline;

  constructor(apiClient: FlyApiClient) {
    this.apiClient = apiClient;
    this.pipeline = new DeploymentPipeline();
    this.setupPipeline();
  }

  private setupPipeline() {
    // Add middleware to the pipeline
    // This is where you'd add your ConfigurationLoader, EnvironmentValidator, etc.
  }

  async deploy(app: FlyApplication): Promise<void> {
    console.log("Starting deployment process");
    const context: DeploymentContext = { app, config: app.synthesize() };
    
    try {
      await this.pipeline.run(context);
      console.log("Pipeline execution completed");
      
      Logger.info("==== NOTHING DEPLOYED YET ====");
      
      console.log("Deployment completed successfully");
    } catch (error) {
      console.error("Deployment failed:", error);
      throw error;
    }
  }
}