import type { FlyStack } from "./FlyStack";
import type { FlyApp } from "../constructs/FlyApp";
import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import { DeploymentEngine } from "../deployment/DeploymentEngine";

export interface IFlyOrgConfig {
  name: string;
}

export class FlyOrg extends StackConstruct {
	private config: IFlyOrgConfig;
	
	@Dependency()
	private apps: FlyApp[] = [];

	constructor(stack: FlyStack, id: string, config: IFlyOrgConfig) {
		super(stack, id);
		this.config = config;
		this.initialize();
	}

	addApp(app: FlyApp): void {
		this.apps.push(app);
	}

	deploy(): void {
		const deploymentEngine = new DeploymentEngine(
			this.getStack().getApiClient()
		);
		for (const app of this.apps) {
			deploymentEngine.deploy(app);
		}
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
