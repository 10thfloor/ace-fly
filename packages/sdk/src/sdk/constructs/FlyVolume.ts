import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";

export interface IFlyVolumeConfig {
	name?: string;
	size: string;
}

export class FlyVolume extends StackConstruct {
	private config: IFlyVolumeConfig;

	constructor(stack: FlyStack, id: string, config: IFlyVolumeConfig) {
		super(stack, id);
		this.config = config;
		this.initialize();
	}

	synthesize(): Record<string, any> {
		return {
			type: "volume",
			name: this.config.name || this.getId(),
			size: this.config.size,
		};
	}

	protected validate(): boolean {
		return true;
	}

	protected getName(): string {
		return this.config.name || this.getId();
	}
}
