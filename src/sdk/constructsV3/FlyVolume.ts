import type { FlyStack } from './FlyStack';

export class FlyVolume {
  private stack: FlyStack;
  private name: string;
  private config: IFlyVolumeConfig;

  constructor(stack: FlyStack, name: string, config: IFlyVolumeConfig) {
    this.stack = stack;
    this.name = name;
    this.config = config;
  }
}

export interface IFlyVolumeConfig {
  name: string;
  size: string;
}