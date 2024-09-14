import { FlyStack } from "../core/FlyStack";
import { ResourceDeployer } from "./ResourceDeployer";
import { StackConstruct } from "../core/StackConstruct";
import { DeploymentState } from "./DeploymentState";
import { ArcJetProtection } from "../constructs/ArcJetProtection";
import { FlyIoApp } from "../constructs/FlyIoApp";
import { FlyDomain } from "../constructs/FlyDomain";
import { FlyCertificate } from "../constructs/FlyCertificate";
import { FlyFirewall } from "../constructs/FlyFirewall";
import { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyPostgresDatabase } from "../patterns/FlyPostgresDatabase";

export class DeploymentOrchestrator {
  private deploymentState: DeploymentState;

  constructor(
    private stack: FlyStack,
    private resourceDeployer: ResourceDeployer
  ) {
    this.deploymentState = new DeploymentState();
  }

  async deploy(): Promise<void> {
    const sortedResources = this.stack.sortResourcesByDependency();
    const deployedResources: StackConstruct[] = [];

    try {
      for (const resource of sortedResources) {
        await this.resourceDeployer.deployResource(resource);
        this.deploymentState.updateResourceState(resource.getId(), "deployed");
        deployedResources.push(resource);
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      await this.rollback(deployedResources);
      throw error;
    }
  }

  private async rollback(resources: StackConstruct[]): Promise<void> {
    for (const resource of resources.reverse()) {
      try {
        const key = this.getResourceKey(resource);
        await this.resourceDeployer.rollbackResource(key, resource.synthesize());
        this.deploymentState.updateResourceState(resource.getId(), "rolled back");
      } catch (rollbackError) {
        console.error(`Failed to rollback resource ${resource.getId()}:`, rollbackError);
      }
    }
  }

  private getResourceKey(resource: StackConstruct): string {
    // Map StackConstruct instances to their corresponding keys in the config
    if (resource instanceof FlyIoApp) return 'app';
    if (resource instanceof FlyDomain) return 'domain';
    if (resource instanceof FlyCertificate) return 'certificate';
    if (resource instanceof FlyFirewall) return 'firewall';
    if (resource instanceof ArcJetProtection) return 'arcjetProtection';
    if (resource instanceof FlyHttpService) return 'services';
    if (resource instanceof FlyPostgresDatabase) return 'database';
    // Add other mappings as needed
    return 'unknown';
  }

  async dryRun(): Promise<void> {
    const sortedResources = this.stack.sortResourcesByDependency();
    
    for (const resource of sortedResources) {
      console.log(`Would deploy: ${resource.constructor.name}`);
      console.log(JSON.stringify(resource.synthesize(), null, 2));
    }
  }
}