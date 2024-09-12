import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
export interface RemixSiteConfig {
    projectDir: string;
    sourceDir?: string;
    buildCommand?: string;
    startCommand?: string;
    nodeVersion?: string;
    port?: number;
    customEnv?: Record<string, string>;
}
export declare class RemixSite extends StackConstruct {
    private config;
    constructor(stack: FlyStack, id: string, config: RemixSiteConfig);
    getInternalPort(): number;
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
