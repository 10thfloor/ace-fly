import type { FlyStack } from './FlyStack';

export class FlyPostgresReplica {
  private stack: FlyStack;
  private config: IFlyPostgresReplicaConfig;

  constructor(stack: FlyStack, config: IFlyPostgresReplicaConfig) {
    this.stack = stack;
    this.config = config;
  }
}

export interface IFlyPostgresReplicaConfig {
  name: string;
  region: string;
  instanceType: string;
  storage: {
    size: number;
    type: string;
  };
}