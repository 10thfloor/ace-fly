import { FlyStack } from "../core/FlyStack";
import { ResourceDeployer } from "../middleware/ResourceDeployer"; // Update import path
import { DeploymentState } from "./DeploymentState";
import { StackConstruct } from "../core/StackConstruct";
import { Logger } from "../utils/Logger"; // Assuming Logger is imported from core

export class DeploymentOrchestrator {
  private deploymentState: DeploymentState;

  constructor(
    private stack: FlyStack,
    private resourceDeployer: ResourceDeployer // Use middleware ResourceDeployer
  ) {
    this.deploymentState = new DeploymentState();
  }

  async deploy(): Promise<void> {
    const sortedResources = this.stack.sortResourcesByDependency();
    const deployedResources: StackConstruct[] = [];

    try {
      for (const resource of sortedResources) {
        await this.resourceDeployer.deployResource(resource.getId(), resource.synthesize());
        this.deploymentState.updateResourceState(resource.getId(), "deployed");
        deployedResources.push(resource);
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      await this.rollback(deployedResources);
      throw error;
    }
  }

  async dryRun(): Promise<void> {
    Logger.info("Starting dry run deployment...");
    await this.resourceDeployer.simulateDeployment(); // Use simulateDeployment from middleware
    Logger.info("Dry run deployment completed successfully.");
  }

  private async rollback(resources: StackConstruct[]): Promise<void> {
    for (const resource of resources.reverse()) {
      try {
        this.resourceDeployer.rollBackResource(resource);
        this.deploymentState.updateResourceState(resource.getId(), "rolled back");
      } catch (rollbackError) {
        console.error(`Failed to rollback resource ${resource.getId()}:`, rollbackError);
      }
    }
  }

  private getResourceKey(resource: StackConstruct): string {
    // Implementation for getting the resource key
    return resource.getId();
  }
}