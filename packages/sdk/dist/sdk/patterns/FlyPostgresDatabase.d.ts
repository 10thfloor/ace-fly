import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyMachineType } from "../types/FlyMachineTypes";
export interface DatabaseScalingConfig {
    volumeSize: number;
    highAvailability: boolean;
    machineType: FlyMachineType;
}
export interface IFlyPostgresDatabaseProps {
    name: string;
    region: string;
    isReplica?: boolean;
    primaryName?: string;
    scaling?: DatabaseScalingConfig;
}
export declare class FlyPostgresDatabase extends StackConstruct {
    private props;
    private scaling;
    constructor(stack: FlyStack, id: string, props: IFlyPostgresDatabaseProps);
    getConnectionString(): string;
    validate(): boolean;
    getName(): string;
    synthesize(): Record<string, any>;
}
