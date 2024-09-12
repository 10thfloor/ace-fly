import type { FlyStack } from "../core/FlyStack";
import type { FlyVolume } from "./FlyVolume";
import { StackConstruct } from "../core/StackConstruct";
export interface IFlyMachineConfigConfig {
    name?: string;
    cpus: number;
    memoryMB: number;
    image: string;
    cmd: string[];
    env: Record<string, string>;
    guest: {
        cpu_kind: string;
        memory_mb: number;
    };
    volumes: FlyVolume[];
    internalPort: number;
}
export declare class FlyMachineConfig extends StackConstruct {
    private config;
    constructor(stack: FlyStack, id: string, config: IFlyMachineConfigConfig);
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    getInternalPort(): number;
    protected getName(): string;
}
