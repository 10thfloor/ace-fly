import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyApp } from "./FlyApp";

export interface FirewallRule {
  action: 'allow' | 'deny';
  protocol: 'tcp' | 'udp' | 'icmp';
  ports?: number | string | (number | string)[]; // Single port, range, or array
  source?: string;
  destination?: string;
  description?: string;
  priority?: number;
}

interface FlyFirewallProps {
  app: FlyApp;
}

export class FlyFirewall extends StackConstruct {
  private app: FlyApp;
  private rules: FirewallRule[] = [];

  constructor(stack: FlyStack, id: string, props: FlyFirewallProps) {
    super(stack, id);
    this.app = props.app;
  }

  addRule(rule: FirewallRule): void {
    this.rules.push(rule);
  }

  synthesize(): Record<string, any> {
    return {
      type: "fly-firewall",
      appId: this.app.getId(),
      rules: this.rules,
    };
  }

  protected validate(): boolean {
    return true;
  }

  protected getName(): string {
    return `${this.app.getId()}-firewall`;
  }

  clearRules(): void {
    this.rules = [];
  }
}