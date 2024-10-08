import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";

export interface IFlySecretConfig {
	name?: string;
	key: string;
}

export class FlySecret extends StackConstruct {
	private config: IFlySecretConfig;

	constructor(stack: FlyStack, id: string, config: IFlySecretConfig) {
		super(stack, id);
		this.config = config;
		this.initialize();
	}

	synthesize(): Record<string, any> {
		return {
			type: "secret",
			name: this.config.name || this.getId(),
			key: this.config.key,
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
			name: this.config.name || this.getId(),
			key: this.config.key,
		};
	}
}
