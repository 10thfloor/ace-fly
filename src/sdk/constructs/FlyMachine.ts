import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import type { FlyStack } from "../core/FlyStack";
import type { AutoScalingConfig } from "./FlyAutoScalingConfig";
import type { FlyMachineConfig } from "./FlyMachineConfig";
import type { FlyPostgres } from "./FlyPostgres";
import type { ResourceOrReference } from "../../types";

export interface IFlyMachineConfig {
  name?: string;
  count: number;
  regions: string[];
  autoScaling: ResourceOrReference<AutoScalingConfig>;
  link?: ResourceOrReference<FlyPostgres>[];
  machineConfig: ResourceOrReference<FlyMachineConfig>;
}

export class FlyMachine extends StackConstruct {
  @Dependency()
  private autoScaling: AutoScalingConfig;

  @Dependency(true)
  private link?: FlyPostgres[];

  @Dependency()
  private machineConfig: FlyMachineConfig;

  private config: IFlyMachineConfig;

  constructor(stack: FlyStack, id: string, config: IFlyMachineConfig) {
    super(stack, id);
    this.config = config;
    this.autoScaling = this.getResource(config.autoScaling);
    this.link = config.link?.map((db) => this.getResource(db)) || [];
    this.machineConfig = this.getResource(config.machineConfig);
    this.initialize();
  }

  synthesize(): Record<string, any> {
    return {
      type: "machine",
      name: this.config.name || this.getId(),
      count: this.config.count,
      regions: this.config.regions,
      autoScaling: this.autoScaling.getId(),
      link: this.link?.map((db) => db.getId()) || [],
      machineConfig: this.machineConfig.getId(),
    };
  }

  protected validate(): boolean {
    // Implement validation logic
    return true;
  }

  addLink(database: ResourceOrReference<FlyPostgres>): void {
    this.link = [...(this.link || []), this.getResource(database)];
  }
}
