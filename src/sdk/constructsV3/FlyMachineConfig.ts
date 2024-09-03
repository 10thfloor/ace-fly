import type { FlyStack } from './FlyStack';
import type { FlyVolume } from './FlyVolume';
import type { FlyPostgres } from './FlyPostgres';

export class FlyMachineConfig {
  private stack: FlyStack;
  private config: IFlyMachineConfigOptions;

  constructor(stack: FlyStack, config: IFlyMachineConfigOptions) {
    this.stack = stack;
    this.config = config;
  }
}

export interface IFlyMachineConfigOptions {
  cpus: number;
  memoryMB: number;
  image: string;
  cmd: string[];
  env: Record<string, string>;
  guest: {
    cpu_kind: string;
    memory_mb: number;
  };
  volumes: FlyVolume[];
  internalPort: number;
}