import type { FlyStack } from "./FlyStack";
import type { FlyIoApp } from "../constructs/FlyIoApp";
import { StackConstruct } from "./StackConstruct";
export interface IFlyOrgConfig {
    name: string;
}
export declare class FlyOrg extends StackConstruct {
    private config;
    private apps;
    constructor(stack: FlyStack, id: string, config: IFlyOrgConfig);
    addApp(app: FlyIoApp): void;
    deploy(): void;
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
