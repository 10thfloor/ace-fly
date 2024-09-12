import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "../core/StackConstruct";
export interface IFlySecretConfig {
    name?: string;
    key: string;
}
export declare class FlySecret extends StackConstruct {
    private config;
    constructor(stack: FlyStack, id: string, config: IFlySecretConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
