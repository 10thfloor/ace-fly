import type { FlyStack } from "../core/FlyStack";
import type { FlyProxy } from "./FlyProxy";
import type { TlsConfig } from "./TlsConfig";
import { StackConstruct } from "../core/StackConstruct";
import type { ResourceOrReference } from "../../types";
import { FlyHttpService } from "./FlyHttpService";
export interface IFlyAnycastIPConfig {
    name?: string;
    type: string;
    shared: boolean;
    proxy: ResourceOrReference<FlyProxy | FlyHttpService>;
    tls?: ResourceOrReference<TlsConfig>;
}
export declare class FlyAnycastIP extends StackConstruct {
    config: IFlyAnycastIPConfig;
    proxy: ResourceOrReference<FlyProxy | FlyHttpService>;
    tls?: ResourceOrReference<TlsConfig>;
    constructor(stack: FlyStack, id: string, config: IFlyAnycastIPConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    getName(): string;
}
