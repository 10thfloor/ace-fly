import { StackConstruct } from "../core/StackConstruct";
import { FlySecret } from "./FlySecret";
import type { FlyStack } from "../core/FlyStack";
import type { IFlyHttpServiceProps } from "./FlyHttpService";
export interface ScalingRule {
    metric: 'cpu' | 'memory';
    threshold: number;
    action: 'scale_up' | 'scale_down';
}
export interface ScalingConfig {
    minMachines: number;
    maxMachines: number;
    scalingRules: ScalingRule[];
}
export interface HttpServiceConfig extends IFlyHttpServiceProps {
    service: {
        getInternalPort: () => number;
    };
    scaling?: {
        scaleToZero?: boolean;
        minMachines?: number;
        maxMachines?: number;
        targetCpuUtilization?: number;
    };
}
export interface FlyApplicationConfig {
    name: string;
    organization: string;
    regions: string[];
    domain: string;
    secretNames: string[];
    env?: Record<string, string>;
}
export declare class FlyApplication extends StackConstruct {
    private app;
    private domain;
    private certificate;
    private scalingConfig?;
    private httpServices;
    private secrets;
    private secretNames;
    private env;
    constructor(stack: FlyStack, id: string, config: FlyApplicationConfig);
    setScalingConfig(config: ScalingConfig): void;
    addHttpService(name: string, config: HttpServiceConfig): void;
    addSecretReference(secretName: string): void;
    getSecretReference(name: string): FlySecret | undefined;
    addEnv(key: string, value: string): void;
    getEnv(): Record<string, string>;
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
}
