import { StackConstruct } from "../core/StackConstruct";
import type { FlyMachine } from "./FlyMachine";
import type { FlyLBConfig } from "./FlyLBConfig";
import type { FlyStack } from "../core/FlyStack";
import type { ResourceOrReference } from "../../types";
export interface IFlyProxyConfig {
    name?: string;
    machines: {
        [key: string]: ResourceOrReference<FlyMachine>;
    };
    ports: {
        [key: number]: string;
    };
    loadBalancing: ResourceOrReference<FlyLBConfig>;
}
export declare class FlyProxy extends StackConstruct {
    private machines;
    private loadBalancing;
    private ports;
    private config;
    constructor(stack: FlyStack, id: string, config: IFlyProxyConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
