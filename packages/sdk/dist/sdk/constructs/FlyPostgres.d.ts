import type { FlyStack } from "../core/FlyStack";
import type { FlySecret } from "./FlySecret";
import type { FlyPostgresReplica } from "./FlyPostgresReplica";
import { StackConstruct } from "../core/StackConstruct";
import type { ResourceOrReference } from "../../types";
export interface IFlyPostgresConfig {
    name?: string;
    region: string;
    credentials: {
        username: string;
        password: ResourceOrReference<FlySecret>;
    };
    replicas: ResourceOrReference<FlyPostgresReplica>[];
    instanceType: string;
    storage: {
        size: number;
        type: string;
    };
}
export declare class FlyPostgres extends StackConstruct {
    private password;
    private replicas?;
    private config;
    constructor(stack: FlyStack, id: string, config: IFlyPostgresConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
