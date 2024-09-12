import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import path from 'node:path';

export interface RemixSiteConfig {
  projectDir: string; // The directory where the Remix project is located
  sourceDir?: string;
  buildCommand?: string;
  startCommand?: string;
  nodeVersion?: string;
  port?: number;
  customEnv?: Record<string, string>;
}

export class RemixSite extends StackConstruct {
  private internalPort = 3000; // Default port for Remix apps

  constructor(stack: FlyStack, id: string, private config: RemixSiteConfig) {
    super(stack, id);
  }

  getInternalPort(): number {
    return this.internalPort;
  }

  synthesize(): Record<string, any> {
    return {
      type: "remix-site",
      projectDir: this.config.projectDir,
      sourceDir: this.config.sourceDir,
      buildCommand: this.config.buildCommand,
      startCommand: this.config.startCommand,
      nodeVersion: this.config.nodeVersion,
      port: this.config.port,
      customEnv: this.config.customEnv,
    };
  }

  protected validate(): boolean {
    // Basic validation
    return !!this.config.projectDir;
  }

  protected getName(): string {
    return this.getId();
  }
}