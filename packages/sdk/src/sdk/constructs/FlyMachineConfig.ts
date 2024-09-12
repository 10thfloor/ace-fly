import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyMachineType } from "../types/FlyMachineTypes";

export interface IFlyMachineConfigProps {
	name?: string;
	cpus: number;
	memoryMB: number;
	image: string;
	cmd: string[];
	env: Record<string, string>;
	guest: {
		cpu_kind: "shared" | "performance";
		memory_mb: number;
	};
	volumes?: any[]; // Define a proper type for volumes if needed
	internalPort: number;
}

export class FlyMachineConfig extends StackConstruct {
	private config: IFlyMachineConfigProps;

	constructor(stack: FlyStack, id: string, config: IFlyMachineConfigProps) {
		super(stack, id);
		this.config = config;
	}

	synthesize(): Record<string, any> {
		return {
			...this.config,
			machineType: this.config.guest.cpu_kind === "shared" ? FlyMachineType.SHARED_CPU_1X : FlyMachineType.DEDICATED_CPU_1X,
		};
	}

	protected validate(): boolean {
		return true;
	}

	getName(): string {
		return this.config.name || this.getId();
	}

	getInternalPort(): number {
		return this.config.internalPort;
	}
}
