import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyMachine } from "./FlyMachine";
import { FlyRegion } from "../types/FlyRegions";
import { FlyHttpServiceConcurrencyType } from "../types/FlyHttpServiceConcurrencyTypes";
import { DefaultConfigs } from "../config/DefaultConfigs";

export interface IFlyHttpServiceProps {
	name?: string;
	force_https?: boolean;
	internal_port?: number; // Make internal_port optional
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
	regions: FlyRegion[]; 
	link?: string;
}

export class FlyHttpService extends StackConstruct {
	private config: IFlyHttpServiceProps;
	private machines: Set<FlyMachine> = new Set();

	constructor(stack: FlyStack, id: string, config: Partial<IFlyHttpServiceProps>) {
		super(stack, id);
		this.config = {
			...DefaultConfigs.FlyHttpService,
			...config,
			internal_port: config.internal_port, 
			regions: config.regions || [], 
		};
	}

	addMachine(machine: FlyMachine) {
		const machineRegions = machine.getRegions();
		if (machineRegions.length === 0 || machineRegions.some(region => this.config.regions.includes(region))) {
			this.machines.add(machine);
		} else {
			throw new Error(`Machine regions [${machineRegions.join(', ')}] do not overlap with service regions [${this.config.regions.join(', ')}]`);
		}
	}

	synthesize(): Record<string, any> {
		return {
			type: "http_service",
			name: this.config.name || this.getId(),
			force_https: this.config.force_https ?? true,
			auto_stop_machines: this.config.auto_stop_machines ?? true,
			auto_start_machines: this.config.auto_start_machines ?? true,
			min_machines_running: this.config.min_machines_running ?? 0,
			max_machines_running: this.config.max_machines_running ?? 1,
			concurrency: this.config.concurrency,
			regions: this.config.regions,
			link: this.config.link,
			// Remove public_port from here
			machines: Array.from(this.machines).map(machine => ({
				...machine.synthesize(),
			})),
			};
	}

	protected validate(): boolean {
		// Add validation logic if needed
		return true;
	}

	protected getName(): string {
		return this.config.name || this.getId();
	}

	getConfig(): Record<string, any> {
		return {
			name: this.config.name,
			internal_port: this.config.internal_port,
			auto_stop_machines: this.config.auto_stop_machines,
			auto_start_machines: this.config.auto_start_machines,
			min_machines_running: this.config.min_machines_running,
			max_machines_running: this.config.max_machines_running,
			concurrency: this.config.concurrency,
			processes: this.config.processes,
			regions: this.config.regions,
		};
	}
}
