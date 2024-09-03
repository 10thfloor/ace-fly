import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface IAutoScalingConfig {
  minMachines: number;
  maxMachines: number;
  targetCPUUtilization: number;
  scaleToZero: boolean;
}

export class AutoScalingConfig extends StackConstruct {
  private config: IAutoScalingConfig;

  constructor(stack: FlyStack, name: string, config: IAutoScalingConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'auto-scaling',
      name: this.name,
      minMachines: this.config.minMachines,
      maxMachines: this.config.maxMachines,
      targetCPUUtilization: this.config.targetCPUUtilization,
      scaleToZero: this.config.scaleToZero
    };
  }
}