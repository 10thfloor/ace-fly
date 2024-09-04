import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import type { FlyStack } from "../core/FlyStack";
import type { AutoScalingConfig } from "./AutoScalingConfig";
import type { FlyMachineConfig } from "./FlyMachineConfig";
import type { FlyPostgres } from "./FlyPostgres";

export interface IFlyMachineConfig {
  name: string;
  count: number;
  regions: string[];
  autoScaling: AutoScalingConfig;
  link?: FlyPostgres[];
  machineConfig: FlyMachineConfig;
}

export class FlyMachine extends StackConstruct {
  @Dependency()
  private autoScaling: AutoScalingConfig;

  @Dependency(true) // Optional dependency
  private link?: FlyPostgres[];

  @Dependency()
  private machineConfig: FlyMachineConfig;

  private config: IFlyMachineConfig;

  constructor(stack: FlyStack, name: string, config: IFlyMachineConfig) {
    super(stack, name);
    this.config = config;
    this.autoScaling = config.autoScaling;
    this.link = config.link;
    this.machineConfig = config.machineConfig;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'machine',
      name: this.name,
      count: this.config.count,
      regions: this.config.regions,
      autoScaling: this.autoScaling.synthesize(),
      link: this.link?.map(db => db.getName()),
      machineConfig: this.machineConfig.synthesize()
    };
  }

  protected validate(): boolean {
    // Implement validation logic
    return true;
  }

  protected requiredDependencies(): string[] {
    return ['AutoScalingConfig', 'FlyMachineConfig'];
  }

  protected optionalDependencies(): string[] {
    return ['FlyPostgres'];
  }
}