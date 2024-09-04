import type { FlySDK } from "./FlySDK";
import type { StackConstruct } from "../constructs/StackConstruct";
import { DependencyGraph } from "../utils/DependencyGraph";
import { ConfigurationSynthesizer } from "../utils/ConfigurationSynthesizer";
import { Validator } from "../utils/Validator";
import { Logger } from "../utils/Logger";
import type { DependencyNode } from "../utils/DependencyGraph";
export class FlyStack {
  private resources: StackConstruct[] = [];
  private dependencyGraph: DependencyGraph = new DependencyGraph();
  private sdk: FlySDK;
  private name: string;

  constructor(sdk: FlySDK, name: string) {
    this.sdk = sdk;
    this.name = name;
    Logger.info(`Created new FlyStack: ${name}`);
  }

  addResource(resource: StackConstruct): void {
    this.validateDependencies(resource);

    this.resources.push(resource);
    this.dependencyGraph.addResource(resource);
    Logger.info(`Added resource ${resource.getName()} to stack ${this.name}`);
   
  }

  addDependency(resource: StackConstruct, dependsOn: StackConstruct): void {
    this.dependencyGraph.addDependency(resource, dependsOn);
    Logger.info(`Added dependency: ${resource.getName()} depends on ${dependsOn.getName()}`);
  }

  synthesize(): Record<string, any> {
    Logger.info(`Synthesizing stack ${this.name}`);
    this.validateAllDependencies();
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

  private validateDependencies(resource: StackConstruct): void {
    const missingDeps = this.dependencyGraph.getMissingDependencies().get(resource) || [];
    if (missingDeps.length > 0) {
      Logger.warn(`${resource.getName()} is missing the following dependencies: ${missingDeps.join(', ')}`);
    }
  }

  private validateAllDependencies(): void {
    const missingDependencies = this.dependencyGraph.getMissingDependencies();
    for (const [resource, missing] of missingDependencies) {
      Logger.warn(`${resource.getName()} is missing the following dependencies: ${missing.join(', ')}`);
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

  public getDependencyGraph(): DependencyGraph {
    return this.dependencyGraph;
  }

  private logDependencyNode(nodes: DependencyNode[], depth: number): void {
    for (const node of nodes) {
      Logger.info(`${'  '.repeat(depth)}${node.resource.getName()} (${node.resource.constructor.name})`);
      this.logDependencyNode(node.dependencies, depth + 1);
    }
  }

  checkMissingDependencies(): void {
    const missingDependencies = this.dependencyGraph.getMissingDependencies();
    for (const [resource, missing] of missingDependencies) {
      if (missing.length > 0) {
        Logger.warn(`${resource.getName()} is missing the following dependencies: ${missing.join(', ')}`);
      }
    }
  }
}
