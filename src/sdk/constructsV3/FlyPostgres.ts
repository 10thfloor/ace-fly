import type { FlyStack } from './FlyStack';
import type { FlySecret } from './FlySecret';
import type { FlyPostgresReplica } from './FlyPostgresReplica';

export class FlyPostgres {
  private stack: FlyStack;
  private config: IFlyPostgresConfig;

  constructor(stack: FlyStack, config: IFlyPostgresConfig) {
    this.stack = stack;
    this.config = config;
  }
}

export interface IFlyPostgresConfig {
  name: string;
  region: string;
  credentials: {
    username: string;
    password: FlySecret;
  };
  replicas?: FlyPostgresReplica[];
  instanceType: string;
  storage: {
    size: number;
    type: string;
  };
}