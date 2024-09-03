import type { FlyStack } from "../core/FlyStack";
import type { FlySecret } from "./FlySecret";
import type { FlyPostgresReplica } from "./FlyPostgresReplica";
import { StackConstruct } from "./StackConstruct";

export interface IFlyPostgresConfig {
  name: string;
  region: string;
  credentials: {
    username: string;
    password: FlySecret;
  };
  replicas: FlyPostgresReplica[];
  instanceType: string;
  storage: {
    size: number;
    type: string;
  };
}

export class FlyPostgres extends StackConstruct {
  private config: IFlyPostgresConfig;

  constructor(stack: FlyStack, name: string, config: IFlyPostgresConfig) {
    super(stack, name);
    this.config = config;
  }

  synthesize(): Record<string, any> {
    return {
      type: 'postgres',
      name: this.name,
      region: this.config.region,
      instanceType: this.config.instanceType,
      storage: this.config.storage,
      replicas: this.config.replicas.map(replica => replica.synthesize())
    };
  }

  protected validate(): boolean {
    return true;
  }
}