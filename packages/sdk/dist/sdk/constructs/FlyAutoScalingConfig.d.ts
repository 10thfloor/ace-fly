import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";
export interface IFlyAutoScalingConfig {
    name?: string;
    minMachines: number;
    maxMachines: number;
    targetCPUUtilization: number;
    scaleToZero: boolean;
}
export declare class FlyAutoScalingConfig extends StackConstruct {
    config: IFlyAutoScalingConfig;
    constructor(stack: FlyStack, id: string, config: IFlyAutoScalingConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
