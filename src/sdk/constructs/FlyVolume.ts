import type { FlyStack } from "../core/FlyStack";
import { StackConstruct } from "./StackConstruct";

export interface IFlyVolumeConfig {
  name: string;
  size: string;
}

export class FlyVolume extends StackConstruct {
  private config: IFlyVolumeConfig;

  constructor(stack: FlyStack, name: string, config: IFlyVolumeConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'volume',
      name: this.name,
      size: this.config.size
    };
  }

  protected validate(): boolean {
    return true;
  }
}