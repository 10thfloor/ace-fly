import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";
export interface IFlyVolumeConfig {
    name?: string;
    size: string;
}
export declare class FlyVolume extends StackConstruct {
    private config;
    constructor(stack: FlyStack, id: string, config: IFlyVolumeConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
