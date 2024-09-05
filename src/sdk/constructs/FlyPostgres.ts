import type { FlyStack } from "../core/FlyStack";
import type { FlySecret } from "./FlySecret";
import type { FlyPostgresReplica } from "./FlyPostgresReplica";
import { StackConstruct } from "./StackConstruct";
import type { ResourceOrReference } from "../../types";
import { Dependency } from "../utils/DependencyDecorator";

export interface IFlyPostgresConfig {
  name?: string;
  region: string;
  credentials: {
    username: string;
    password: ResourceOrReference<FlySecret>;
  };
  replicas: ResourceOrReference<FlyPostgresReplica>[];
  instanceType: string;
  storage: {
    size: number;
    type: string;
  };
}

export class FlyPostgres extends StackConstruct {
  @Dependency()
  private password: FlySecret;

  @Dependency(true)
  private replicas?: FlyPostgresReplica[];

  private config: IFlyPostgresConfig;

  constructor(stack: FlyStack, id: string, config: IFlyPostgresConfig) {
    super(stack, id);
    this.config = config;
    this.password = this.getResource(config.credentials.password);
    this.replicas =
      config.replicas?.map((replica) => this.getResource(replica)) || [];
    this.initialize();
  }

  synthesize(): Record<string, any> {
    return {
      type: "postgres",
      name: this.config.name || this.getId(),
      region: this.config.region,
      instanceType: this.config.instanceType,
      storage: this.config.storage,
      replicas: this.replicas?.map((replica) => replica.getId()),
    };
  }

  protected validate(): boolean {
    return true;
  }
}
