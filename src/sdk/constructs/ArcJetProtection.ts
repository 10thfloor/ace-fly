import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyApp } from "./FlyIoApp";

export interface ArcJetProtectionConfig {
  apiKey: string;
  rules: ArcJetRule[];
}

export interface ArcJetRule {
  type: 'rateLimit' | 'botProtection' | 'ddosProtection';
  config: Record<string, any>;
}

export class ArcJetProtection extends StackConstruct {
  private app: FlyApp;
  private config: ArcJetProtectionConfig;

  constructor(stack: FlyStack, id: string, app: FlyApp, config: ArcJetProtectionConfig) {
    super(stack, id);
    this.app = app;
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: "arcjet-protection",
      appId: this.app.getId(),
      apiKey: this.config.apiKey,
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
}