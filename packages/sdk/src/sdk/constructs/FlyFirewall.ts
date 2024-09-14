import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyIoApp } from "./FlyIoApp";

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
  app: FlyIoApp;
}

export class FlyFirewall extends StackConstruct {
  private app: FlyIoApp;
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
      type: "firewall",
      appId: this.app.getId(),
      rules: this.rules.length > 0 ? this.rules : [
        {
          action: "deny",
          protocol: "tcp",
          ports: "1-65535",
          source: "0.0.0.0/0",
          destination: "0.0.0.0/0",
          description: "Default deny all traffic",
          priority: 2000
        }
      ]
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

  getConfig(): Record<string, any> {
    return {
      rules: this.rules.map(rule => ({
        action: rule.action,
        protocol: rule.protocol,
        ports: rule.ports,
        source: rule.source,
        description: rule.description,
        priority: rule.priority,
      })),
    };
  }
}