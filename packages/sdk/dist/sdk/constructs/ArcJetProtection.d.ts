import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyIoApp } from "./FlyIoApp";
export interface ArcJetProtectionConfig {
    apiKey: string;
    rules: ArcJetRule[];
}
export interface ArcJetRule {
    type: 'rateLimit' | 'botProtection' | 'ddosProtection';
    config: Record<string, any>;
}
export declare class ArcJetProtection extends StackConstruct {
    private app;
    private config;
    constructor(stack: FlyStack, id: string, app: FlyIoApp, config: ArcJetProtectionConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
