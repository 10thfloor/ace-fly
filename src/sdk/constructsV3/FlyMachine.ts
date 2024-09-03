import type { FlyStack } from './FlyStack';
import type { AutoScalingConfig } from './AutoScalingConfig';
import type { FlyMachineConfig } from './FlyMachineConfig';
import type { FlyPostgres } from './FlyPostgres';

export class FlyMachine {
  private stack: FlyStack;
  private config: IFlyMachineConfig;

  constructor(stack: FlyStack, config: IFlyMachineConfig) {
    this.stack = stack;
    this.config = config;
  }
}

export interface IFlyMachineConfig {
  name: string;
  count: number;
  regions: string[];
  autoScaling: AutoScalingConfig;
  link?: FlyPostgres[];
  machineConfig: FlyMachineConfig;
}