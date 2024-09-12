import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyAutoScalingConfig } from "./FlyAutoScalingConfig";
import type { FlyMachineConfig } from "./FlyMachineConfig";
import type { FlyPostgres } from "./FlyPostgres";
import type { ResourceOrReference } from "../../types";
export interface IFlyMachineConfig {
    name?: string;
    count: number;
    regions: string[];
    autoScaling: ResourceOrReference<FlyAutoScalingConfig>;
    link?: ResourceOrReference<FlyPostgres>[];
    machineConfig: ResourceOrReference<FlyMachineConfig>;
}
export declare class FlyMachine extends StackConstruct {
    private autoScaling;
    private link?;
    private machineConfig;
    private config;
    constructor(stack: FlyStack, id: string, config: IFlyMachineConfig);
    synthesize(): Record<string, any>;
    getInternalPort(): number;
    protected validate(): boolean;
    addLink(database: ResourceOrReference<FlyPostgres>): void;
    protected getName(): string;
}
