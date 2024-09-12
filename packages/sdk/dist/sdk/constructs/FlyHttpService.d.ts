import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyMachineType } from "../types/FlyMachineTypes";
import type { FlyHttpServiceConcurrencyType } from "../types/FlyHttpServiceConcurrencyTypes";
export interface IFlyHttpServiceProps {
    name?: string;
    internal_port: number;
    force_https?: boolean;
    auto_start_machines?: boolean;
    auto_stop_machines?: boolean;
    min_machines_running?: number;
    max_machines_running?: number;
    processes?: string[];
    concurrency?: {
        type: FlyHttpServiceConcurrencyType;
        soft_limit: number;
        hard_limit: number;
    };
    machineType?: FlyMachineType;
}
export declare class FlyHttpService extends StackConstruct {
    private config;
    constructor(stack: FlyStack, id: string, config: Partial<IFlyHttpServiceProps>);
    synthesize(): Record<string, any>;
    getInternalPort(): number;
    protected validate(): boolean;
    protected getName(): string;
}
