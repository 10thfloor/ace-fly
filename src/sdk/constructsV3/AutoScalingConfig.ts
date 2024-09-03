import type { FlyStack } from './FlyStack';

export class AutoScalingConfig {
  private stack: FlyStack;
  private config: IAutoScalingConfigOptions;

  constructor(stack: FlyStack, config: IAutoScalingConfigOptions) {
    this.stack = stack;
    this.config = config;
  }
}

export interface IAutoScalingConfigOptions {
  minMachines: number;
  maxMachines: number;
  targetCPUUtilization: number;
  scaleToZero?: boolean;
}