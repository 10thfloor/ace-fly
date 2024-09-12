import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyDomain } from "./FlyDomain";
import type { ResourceOrReference } from "../../types";
export interface ICertificateConfig {
    name?: string;
    domains: ResourceOrReference<FlyDomain>[];
}
export declare class FlyCertificate extends StackConstruct {
    private domains;
    private config;
    constructor(stack: FlyStack, id: string, config: ICertificateConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
