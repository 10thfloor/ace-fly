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
  private config: Required<RemixSiteConfig>;

  constructor(stack: FlyStack, id: string, config: RemixSiteConfig) {
    super(stack, id);
    this.config = {
      projectDir: config.projectDir,
      sourceDir: config.sourceDir || "app",
      buildCommand: config.buildCommand || "npm run build",
      startCommand: config.startCommand || "npm run start",
      nodeVersion: config.nodeVersion || "18",
      port: config.port || 3000,
      customEnv: config.customEnv || {},
    };
    this.initialize();
  }

  getInternalPort(): number {
    return this.config.port;
  }

  synthesize(): Record<string, any> {
    return {
      type: "remix-site",
      projectDir: this.config.projectDir,
      sourceDir: path.join(this.config.projectDir, this.config.sourceDir),
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