import type { FlySDK } from "./FlySDK";
import type { StackConstruct } from "../constructs/StackConstruct";
import { DependencyGraph } from "../utils/DependencyGraph";
import { ConfigurationSynthesizer } from "../utils/ConfigurationSynthesizer";
import { Validator } from "../utils/Validator";
import { Logger } from "../utils/Logger";

export class FlyStack {
  private sdk: FlySDK;
  private name: string;
  private resources: StackConstruct[] = [];
  private dependencyGraph: DependencyGraph = new DependencyGraph();

  constructor(sdk: FlySDK, name: string) {
    this.sdk = sdk;
    this.name = name;
    Logger.info(`Created new FlyStack: ${name}`);
  }

  addResource(resource: StackConstruct): void {
    this.resources.push(resource);
    Logger.info(`Added resource ${resource.getName()} to stack ${this.name}`);
  }

  addDependency(resource: StackConstruct, dependsOn: StackConstruct): void {
    this.dependencyGraph.addDependency(resource, dependsOn);
    Logger.info(`Added dependency: ${resource.getName()} depends on ${dependsOn.getName()}`);
  }

  synthesize(): Record<string, any> {
    Logger.info(`Synthesizing stack ${this.name}`);
    if (Validator.validateStack(this.resources)) {
      const synthesizer = new ConfigurationSynthesizer();
      const config = synthesizer.synthesize(this);
      Logger.info(`Successfully synthesized stack ${this.name}`);
      return config;
    } else {
      Logger.error(`Failed to synthesize stack ${this.name} due to validation errors`);
      throw new Error(`Stack ${this.name} failed validation`);
    }
  }

  getOrderedResources(): StackConstruct[] {
    return this.dependencyGraph.getOrderedResources();
  }

  getName(): string {
    return this.name;
  }

  getSDK(): FlySDK {
    return this.sdk;
  }
}
