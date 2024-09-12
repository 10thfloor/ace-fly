import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";
export interface IFlyPostgresReplicaConfig {
    name?: string;
    region: string;
    instanceType: string;
    storage: {
        size: number;
        type: string;
    };
}
export declare class FlyPostgresReplica extends StackConstruct {
    private config;
    constructor(stack: FlyStack, name: string, config: IFlyPostgresReplicaConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
