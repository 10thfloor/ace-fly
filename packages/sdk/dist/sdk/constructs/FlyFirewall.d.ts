import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyIoApp } from "./FlyIoApp";
export interface FirewallRule {
    action: 'allow' | 'deny';
    protocol: 'tcp' | 'udp' | 'icmp';
    ports?: number | string | (number | string)[];
    source?: string;
    destination?: string;
    description?: string;
    priority?: number;
}
interface FlyFirewallProps {
    app: FlyIoApp;
}
export declare class FlyFirewall extends StackConstruct {
    private app;
    private rules;
    constructor(stack: FlyStack, id: string, props: FlyFirewallProps);
    addRule(rule: FirewallRule): void;
    synthesize(): Record<string, any>;
    protected validate(): boolean;
    protected getName(): string;
    clearRules(): void;
}
export {};
