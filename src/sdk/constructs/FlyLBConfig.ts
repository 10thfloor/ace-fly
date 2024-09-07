import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface IFlyLBConfig {
	name?: string;
	strategy: string;
	healthCheck: {
		path: string;
		interval: number;
		timeout: number;
	};
}

export class FlyLBConfig extends StackConstruct {
	private config: IFlyLBConfig;

	constructor(stack: FlyStack, id: string, config: IFlyLBConfig) {
		super(stack, id);
		this.config = config;
		this.initialize();
	}

	synthesize(): Record<string, any> {
		return {
			type: "lb-config",
			name: this.config.name || this.getId(),
			strategy: this.config.strategy,
			healthCheck: this.config.healthCheck,
		};
	}

	protected validate(): boolean {
		return true;
	}
}
