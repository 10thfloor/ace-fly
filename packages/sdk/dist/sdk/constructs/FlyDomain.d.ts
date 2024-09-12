import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
export interface IFlyDomainConfig {
    name?: string;
    domainName: string;
}
export declare class FlyDomain extends StackConstruct {
    private config;
    constructor(stack: FlyStack, id: string, config: IFlyDomainConfig);
    getDomainName(): string;
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    getName(): string;
}
