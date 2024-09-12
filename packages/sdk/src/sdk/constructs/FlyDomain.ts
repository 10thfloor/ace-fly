import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";

export interface IFlyDomainConfig {
	name?: string;
	domainName: string;
}

export class FlyDomain extends StackConstruct {
	private config: IFlyDomainConfig;

	constructor(stack: FlyStack, id: string, config: IFlyDomainConfig) {
		super(stack, id);
		this.config = config;
		this.initialize();
	}

	getDomainName(): string {
		return this.config.domainName;
	}

	synthesize(): Record<string, any> {
		return {
			type: "domain",
			name: this.config.name || this.getId(),
			domainName: this.config.domainName,
		};
	}

	protected validate(): boolean {
		return !!this.config.domainName;
	}

	getName(): string {
		return this.config.name || this.getId();
	}
}
