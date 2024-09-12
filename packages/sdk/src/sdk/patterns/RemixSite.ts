import { FlyMachine, IFlyMachineProps } from "../constructs/FlyMachine";
import { FlyMachineConfig } from "../constructs/FlyMachineConfig";
import type { FlyStack } from "../core/FlyStack";
import { FlyRegion } from "../types/FlyRegions";
import { DefaultConfigs } from "../config/DefaultConfigs";

export interface RemixSiteConfig {
  projectDir: string;
  sourceDir?: string;
  buildCommand?: string;
  startCommand?: string;
  nodeVersion?: string;
  port?: number;
  customEnv?: Record<string, string>;
}

export class RemixSite extends FlyMachine {
  private remixConfig: Required<RemixSiteConfig>;

  constructor(stack: FlyStack, id: string, config: RemixSiteConfig) {
    const defaultConfig = DefaultConfigs.RemixSite;
    const mergedConfig = {
      ...defaultConfig,
      ...config,
      customEnv: { ...defaultConfig.customEnv, ...config.customEnv },
    } as Required<RemixSiteConfig>;

    const machineConfig = new FlyMachineConfig(stack, `${id}-config`, {
      cpus: 1,
      memoryMB: 256,
      image: "remix:latest", // Adjust as needed
      cmd: [mergedConfig.startCommand],
      env: {
        PORT: `${mergedConfig.port}`,
        NODE_ENV: "production",
        ...mergedConfig.customEnv,
      },
      guest: {
        cpu_kind: "shared",
        memory_mb: 256,
      },
      internalPort: mergedConfig.port,
    });

    super(stack, id, {
      name: id,
      machineConfig,
      regions: [FlyRegion.WASHINGTON_DC],
      count: 1,
    });

    this.remixConfig = mergedConfig;
  }

  getInternalPort(): number {
    return this.remixConfig.port;
  }

  synthesize(): Record<string, any> {
    return {
      ...super.synthesize(),
      type: "remix-site",
      projectDir: this.remixConfig.projectDir,
      sourceDir: this.remixConfig.sourceDir,
      buildCommand: this.remixConfig.buildCommand,
      startCommand: this.remixConfig.startCommand,
      nodeVersion: this.remixConfig.nodeVersion,
      port: this.remixConfig.port,
      customEnv: this.remixConfig.customEnv,
    };
  }

  protected validate(): boolean {
    return !!this.remixConfig.projectDir;
  }

  protected getName(): string {
    return this.getId();
  }
}