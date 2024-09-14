import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyIoApp } from "./FlyIoApp";

export interface ArcJetProtectionConfig {
  rules: ArcJetRule[];
}

export interface ArcJetRule {
  type: 'rateLimit' | 'botProtection' | 'ddosProtection';
  config: Record<string, any>;
}

export class ArcJetProtection extends StackConstruct {
  private app: FlyIoApp;
  private config: ArcJetProtectionConfig;

  constructor(stack: FlyStack, id: string, app: FlyIoApp, config: ArcJetProtectionConfig) {
    super(stack, id);
    this.app = app;
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: "arcjet-protection",
      appId: this.app.getId(),
      rules: this.config.rules,
    };
  }

  protected validate(): boolean {
    // Add validation logic for ArcJet configuration
    return true;
  }

  protected getName(): string {
    return `${this.app.getId()}-arcjet-protection`;
  }

  getConfig(): Record<string, any> {
    return {
      rules: this.config.rules,
    };
  }
}