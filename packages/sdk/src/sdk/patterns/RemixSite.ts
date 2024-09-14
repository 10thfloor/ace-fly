import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyMachineType } from "../types/FlyMachineTypes";
import { ProcessGroupConfig } from "./FlyProjectStack";
import { DefaultConfigs } from "../config/DefaultConfigs";

export interface RemixSiteConfig {
  name: string;
  projectDir: string;
  sourceDir?: string;
  buildCommand?: string;
  startCommand?: string;
  nodeVersion?: string;
  port?: number;
  customEnv?: Record<string, string>;
  scaling?: Partial<{
    minMachines: number;
    maxMachines: number;
    autoScaleStrategy: 'cpu' | 'requests';
    targetUtilization: number;
  }>;
  machineConfig?: Partial<{
    cpus: number;
    memoryMB: number;
    machineType: FlyMachineType;
  }>;
}

export class RemixSite extends StackConstruct {
  private config: RemixSiteConfig;

  constructor(stack: FlyStack, id: string, config: RemixSiteConfig) {
    super(stack, id);
    this.config = {
      ...DefaultConfigs.RemixSite,
      ...config,
      scaling: {
        ...DefaultConfigs.RemixSite.scaling,
        ...config.scaling,
      },
      machineConfig: {
        ...DefaultConfigs.RemixSite.machineConfig,
        ...config.machineConfig,
      },
    };
    this.initialize();
  }

  getProcessGroupConfig(): ProcessGroupConfig {
    return {
      name: this.getName(),
      command: [this.config.startCommand || DefaultConfigs.RemixSite.startCommand],
      scaling: {
        minMachines: this.config.scaling?.minMachines ?? DefaultConfigs.RemixSite.scaling.minMachines,
        maxMachines: this.config.scaling?.maxMachines ?? DefaultConfigs.RemixSite.scaling.maxMachines,
        autoScaleStrategy: this.config.scaling?.autoScaleStrategy,
        targetUtilization: this.config.scaling?.targetUtilization,
      },
      machineConfig: {
        cpus: this.config.machineConfig?.cpus ?? DefaultConfigs.RemixSite.machineConfig.cpus,
        memoryMB: this.config.machineConfig?.memoryMB ?? DefaultConfigs.RemixSite.machineConfig.memoryMB,
        machineType: this.config.machineConfig?.machineType ?? DefaultConfigs.RemixSite.machineConfig.machineType,
      },
    };
  }

  getInternalPort(): number {
    return this.config.port || DefaultConfigs.RemixSite.port;
  }

  synthesize(): Record<string, any> {
    return {
      type: "remix-site",
      name: this.config.name,
      projectDir: this.config.projectDir,
      sourceDir: this.config.sourceDir,
      buildCommand: this.config.buildCommand,
      startCommand: this.config.startCommand,
      nodeVersion: this.config.nodeVersion,
      port: this.config.port,
      customEnv: this.config.customEnv,
      processGroup: this.getProcessGroupConfig(),
    };
  }

  protected validate(): boolean {
    return true;
  }

  getName(): string {
    return this.config.name || this.getId()
  }
}