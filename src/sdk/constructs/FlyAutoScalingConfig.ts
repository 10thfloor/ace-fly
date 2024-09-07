import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface IAutoScalingConfig {
	name?: string;
	minMachines: number;
	maxMachines: number;
	targetCPUUtilization: number;
	scaleToZero: boolean;
}

export class AutoScalingConfig extends StackConstruct {
	config: IAutoScalingConfig;

	constructor(stack: FlyStack, id: string, config: IAutoScalingConfig) {
		super(stack, id);
		this.config = config;
		this.initialize();
	}

	synthesize(): Record<string, any> {
		return {
			type: "auto-scaling-config",
			name: this.config.name || this.getId(),
			minMachines: this.config.minMachines,
			maxMachines: this.config.maxMachines,
			targetCPUUtilization: this.config.targetCPUUtilization,
			scaleToZero: this.config.scaleToZero,
		};
	}

	protected validate(): boolean {
		return true;
	}
}
