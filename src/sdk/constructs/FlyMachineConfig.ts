import type { FlyStack } from "../core/FlyStack";
import type { FlyVolume } from "./FlyVolume";
import { StackConstruct } from "./StackConstruct";

export interface IFlyMachineConfig {
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

export class FlyMachineConfig extends StackConstruct {
  private config: IFlyMachineConfig;

  constructor(stack: FlyStack, name: string, config: IFlyMachineConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'machine-config',
      name: this.name,
      cpus: this.config.cpus,
      memoryMB: this.config.memoryMB,
      image: this.config.image,
      cmd: this.config.cmd,
      env: this.config.env,
      guest: this.config.guest,
      volumes: this.config.volumes.map(volume => volume.getName()),
      internalPort: this.config.internalPort
    };
  }

  protected validate(): boolean {
    return true;
  }
}