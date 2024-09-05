import type { FlyStack } from "../core/FlyStack";
import type { FlyApp } from "../constructs/FlyApp";
import { DeploymentEngine } from "../deployment/DeploymentEngine";

export class FlyOrg {
  private stack: FlyStack;
  private name: string;

  constructor(stack: FlyStack, name: string) {
    this.stack = stack;
    this.name = name;
  }

  deploy(app: FlyApp): void {
    const deploymentEngine = new DeploymentEngine(
      this.stack.getSDK().getApiClient(),
    );
    deploymentEngine.deploy(app);
  }
}
