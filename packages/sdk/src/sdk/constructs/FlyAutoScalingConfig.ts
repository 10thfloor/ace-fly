import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";

export interface IFlyAutoScalingConfig {
	name?: string;
	minMachines: number;
	maxMachines: number;
	targetCPUUtilization: number;
	scaleToZero: boolean;
}

export class FlyAutoScalingConfig extends StackConstruct {
	config: IFlyAutoScalingConfig;

	constructor(stack: FlyStack, id: string, config: IFlyAutoScalingConfig) {
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

	protected getName(): string {
		return this.config.name || this.getId();
	}

	getConfig(): Record<string, any> {
		return {
			minMachines: this.config.minMachines,
			maxMachines: this.config.maxMachines,
			targetCPUUtilization: this.config.targetCPUUtilization,
			scaleToZero: this.config.scaleToZero,
		};
	}
}
