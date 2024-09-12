import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
export interface IFlyServerlessFunctionConfig {
    name: string;
    handler: string;
    runtime: "node" | "python" | "go" | "elixir";
    memory: number;
    timeout: number;
    environment?: Record<string, string>;
}
export declare class FlyServerlessFunction extends StackConstruct {
    private config;
    private machine;
    constructor(stack: FlyStack, id: string, config: IFlyServerlessFunctionConfig);
    private getRuntimeImage;
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
