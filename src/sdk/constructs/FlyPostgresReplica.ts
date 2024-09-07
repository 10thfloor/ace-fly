import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface IFlyPostgresReplicaConfig {
	name?: string;
	region: string;
	instanceType: string;
	storage: {
		size: number;
		type: string;
	};
}

export class FlyPostgresReplica extends StackConstruct {
	private config: IFlyPostgresReplicaConfig;

	constructor(
		stack: FlyStack,
		name: string,
		config: IFlyPostgresReplicaConfig,
	) {
		super(stack, name);
		this.config = config;
		this.initialize();
	}

	synthesize(): Record<string, any> {
		return {
			type: "postgres-replica",
			name: this.config.name || this.getId(),
			region: this.config.region,
			instanceType: this.config.instanceType,
			storage: this.config.storage,
		};
	}

	protected validate(): boolean {
		return true;
	}
}
