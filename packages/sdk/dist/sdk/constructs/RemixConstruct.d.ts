import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyMachine } from "./FlyMachine";
export interface IRemixConstructConfig {
    name?: string;
    env?: Record<string, string>;
}
export declare class RemixConstruct extends StackConstruct {
    private config;
    machine: FlyMachine;
    constructor(stack: FlyStack, id: string, config: IRemixConstructConfig);
    getName(): string;
    private createResources;
    getStack(): FlyStack;
    synthesize(): Record<string, any>;
    protected validate(): boolean;
}
