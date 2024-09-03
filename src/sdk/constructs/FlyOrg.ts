import type { FlyStack } from "../core/FlyStack";
import type { FlyApp } from "./FlyApp";
import { DeploymentEngine } from "./DeploymentEngine";

export class FlyOrg {
  private stack: FlyStack;
  private name: string;
  private environments: Record<string, FlyStack> = {};

  constructor(stack: FlyStack, name: string) {
    this.stack = stack;
    this.name = name;
  }

  createEnvironment(name: string): FlyStack {
    const envStack = this.stack.getSDK().createStack(`${this.name}-${name}`);
    this.environments[name] = envStack;
    return envStack;
  }

  async deployEnvironment(name: string): Promise<void> {
    const envStack = this.environments[name];
    if (!envStack) {
      throw new Error(`Environment ${name} not found`);
    }

    const config = envStack.synthesize();
    const deploymentEngine = new DeploymentEngine(envStack.getSDK().getApiClient());
    await deploymentEngine.deploy(config);
  }

  deploy(app: FlyApp): void {
    // Implementation for deploying a single app
  }
}