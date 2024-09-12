import type { FlyStack } from "./FlyStack";
import type { FlyIoApp } from "../constructs/FlyIoApp";
import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";

export interface IFlyOrgConfig {
  name: string;
}

export class FlyOrg extends StackConstruct {
	private config: IFlyOrgConfig;
	
	@Dependency()
	private apps: FlyIoApp[] = [];

	constructor(stack: FlyStack, id: string, config: IFlyOrgConfig) {
		super(stack, id);
		this.config = config;
		this.initialize();
	}

	addApp(app: FlyIoApp): void {
		this.apps.push(app);
	}

	deploy(): void {
		// TODO: Implement
	}

	synthesize(): Record<string, any> {
		return {
			type: "organization",
			name: this.config.name,
			apps: this.apps.map(app => app.getId()),
		};
	}

	protected validate(): boolean {
		return !!this.config.name;
	}

	protected getName(): string {
		return this.config.name;
	}
}
