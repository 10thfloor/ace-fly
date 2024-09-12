import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { DatabaseScalingConfig } from "./FlyPostgresDatabase";
import type { FirewallRule } from "../constructs/FlyFirewall";
import { type ArcJetProtectionConfig } from "../constructs/ArcJetProtection";
import type { IFlyHttpServiceProps } from "../constructs/FlyHttpService";
import type { FlyRegion } from "../types/FlyRegions";
import type { FlyMachineType } from "../types/FlyMachineTypes";
import type { FlyHttpServiceConcurrencyType } from "../types/FlyHttpServiceConcurrencyTypes";
export interface FlyApplicationConfig {
    name: string;
    organization: string;
    regions: FlyRegion[];
    domain: string;
    secretNames: string[];
    env?: Record<string, string>;
}
export interface HttpServiceConfig {
    service: {
        getInternalPort: () => number;
    };
    forceHttps?: boolean;
    concurrency?: {
        type: FlyHttpServiceConcurrencyType;
        soft_limit: number;
        hard_limit: number;
    };
    scaling?: {
        autoStartMachines?: boolean;
        scaleToZero?: boolean;
        minMachines?: number;
        maxMachines?: number;
        machineType?: FlyMachineType;
    };
}
export declare class FlyApplication extends StackConstruct {
    private readonly config;
    private app;
    private domain;
    private certificate;
    private httpServices;
    private secrets;
    private databases;
    private firewall;
    private arcjetProtection?;
    constructor(stack: FlyStack, id: string, config: FlyApplicationConfig);
    private initializeComponents;
    private applyDefaultFirewallRules;
    addHttpService(name: string, config: Partial<IFlyHttpServiceProps> & {
        service: {
            getInternalPort: () => number;
        };
    }): void;
    addDefaultHttpFirewallRules(): void;
    addDatabase(config: {
        name: string;
        primaryRegion: string;
        scaling?: DatabaseScalingConfig;
    }): void;
    addFirewallRules(rules: FirewallRule[]): void;
    addArcJetProtection(config: ArcJetProtectionConfig): void;
    addSecretReference(secretName: string): void;
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
    addFirewallRule(rule: FirewallRule): void;
}
