import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyHttpService } from "./FlyHttpService";
import { FlyRegion } from "../types/FlyRegions";
import { FlyAutoScalingConfig } from "./FlyAutoScalingConfig";
import { FlyMachineConfig } from "./FlyMachineConfig";

export interface IFlyMachineProps {
	name: string;
	count: number;
	regions?: FlyRegion[];
	autoScaling?: FlyAutoScalingConfig;
	link?: any[]; // Define a proper type for link if needed
	machineConfig: FlyMachineConfig;
}

export class FlyMachine extends StackConstruct {
	private config: IFlyMachineProps;
	private httpService?: FlyHttpService;

	constructor(stack: FlyStack, id: string, config: IFlyMachineProps) {
		super(stack, id);
		this.config = config;
	}

	attachToHttpService(service: FlyHttpService) {
		this.httpService = service;
		service.addMachine(this);
	}

	synthesize(): Record<string, any> {
		return {
			name: this.config.name,
			count: this.config.count,
			regions: this.config.regions,
			autoScaling: this.config.autoScaling,
			link: this.config.link,
			...this.config.machineConfig.synthesize(),
		};
	}

	getRegions(): FlyRegion[] {
		return this.config.regions || [];
	}

	getInternalPort(): number {
		return this.config.machineConfig.getInternalPort();
	}

	protected validate(): boolean {
		// Add validation logic if needed
		return true;
	}

	protected getName(): string {
		return this.config.name;
	}
}
