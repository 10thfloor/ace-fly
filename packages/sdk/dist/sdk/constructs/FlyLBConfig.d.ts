import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";
export interface IFlyLBConfig {
    name?: string;
    strategy: string;
    healthCheck: {
        path: string;
        interval: number;
        timeout: number;
    };
}
export declare class FlyLBConfig extends StackConstruct {
    private config;
    constructor(stack: FlyStack, id: string, config: IFlyLBConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
