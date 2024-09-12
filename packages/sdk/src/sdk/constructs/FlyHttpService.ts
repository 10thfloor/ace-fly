import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { IFlyAutoScalingConfig } from "./FlyAutoScalingConfig";
import { DefaultConfigs } from '../config/DefaultConfigs';
import { FlyMachineType } from "../types/FlyMachineTypes";
import type { FlyHttpServiceConcurrencyType } from "../types/FlyHttpServiceConcurrencyTypes";

export interface IFlyHttpServiceProps {
	name?: string; // Make name optional
	internal_port: number;
	force_https?: boolean;
	auto_start_machines?: boolean;
	auto_stop_machines?: boolean;
	min_machines_running?: number;
	max_machines_running?: number;
	processes?: string[];
	concurrency?: {
	  type: FlyHttpServiceConcurrencyType;
	  soft_limit: number;
	  hard_limit: number;
	};
	machineType?: FlyMachineType;
}

export class FlyHttpService extends StackConstruct {
	private config: IFlyHttpServiceProps;

	constructor(stack: FlyStack, id: string, config: Partial<IFlyHttpServiceProps>) {
		super(stack, id);
		this.config = {
			...DefaultConfigs.FlyHttpService,
			...config,
			concurrency: {
				...DefaultConfigs.FlyHttpService.concurrency,
				...config.concurrency,
			},
		} as IFlyHttpServiceProps;
		this.initialize();
	}

	synthesize(): Record<string, any> {
		return {
			type: "http_service",
			name: this.config.name || this.getId(),
			internal_port: this.config.internal_port,
			force_https: this.config.force_https ?? true,
			auto_stop_machines: this.config.auto_stop_machines ?? true,
			auto_start_machines: this.config.auto_start_machines ?? true,
			min_machines_running: this.config.min_machines_running ?? 0,
			max_machines_running: this.config.max_machines_running ?? 1,
			processes: this.config.processes,
			concurrency: this.config.concurrency,
			machineType: this.config.machineType || FlyMachineType.SHARED_CPU_1X,
		};
	}

	getInternalPort(): number {
		return this.config.internal_port;
	}

	protected validate(): boolean {
		// Add validation logic if needed
		return true;
	}

	protected getName(): string {
		return this.config.name || this.getId();
	}
}
