import type { FlyStack } from "../core/FlyStack";
import type { AutoScalingConfig } from "./AutoScalingConfig";
import type { FlyMachineConfig } from "./FlyMachineConfig";
import type { FlyPostgres } from "./FlyPostgres";
import { StackConstruct } from "./StackConstruct";

export interface IFlyMachineConfig {
  name: string;
  count: number;
  regions: string[];
  autoScaling: AutoScalingConfig;
  link?: FlyPostgres[];
  machineConfig: FlyMachineConfig;
}

export class FlyMachine extends StackConstruct {
  private config: IFlyMachineConfig;

  constructor(stack: FlyStack, name: string, config: IFlyMachineConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'machine',
      name: this.name,
      count: this.config.count,
      regions: this.config.regions,
      autoScaling: this.config.autoScaling.synthesize(),
      machineConfig: this.config.machineConfig.synthesize(),
      link: this.config.link?.map(postgres => postgres.getName())
    };
  }
}