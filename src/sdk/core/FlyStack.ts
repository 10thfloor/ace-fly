import type { FlySDK } from "./FlySDK";
import type { StackConstruct } from "../constructs/StackConstruct";
import { DependencyGraph } from "../utils/DependencyGraph";
import { ConfigurationSynthesizer } from "../utils/ConfigurationSynthesizer";

export class FlyStack {
  private sdk: FlySDK;
  private name: string;
  private resources: StackConstruct[] = [];
  private dependencyGraph: DependencyGraph = new DependencyGraph();

  constructor(sdk: FlySDK, name: string) {
    this.sdk = sdk;
    this.name = name;
  }

  addResource(resource: StackConstruct): void {
    this.resources.push(resource);
  }

  addDependency(resource: StackConstruct, dependsOn: StackConstruct): void {
    this.dependencyGraph.addDependency(resource, dependsOn);
  }

  synthesize(): Record<string, any> {
    const synthesizer = new ConfigurationSynthesizer();
    return synthesizer.synthesize(this);
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
