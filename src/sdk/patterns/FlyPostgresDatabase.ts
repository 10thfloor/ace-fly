import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";

export interface DatabaseScalingConfig {
  volumeSize: number; // in GB
  highAvailability: boolean;
  machineType?: 'shared' | 'dedicated';
}

export interface IFlyPostgresDatabaseProps {
  name: string;
  region: string;
  isReplica?: boolean;
  primaryName?: string;
  scaling?: DatabaseScalingConfig;
}

export class FlyPostgresDatabase extends StackConstruct {
  private props: IFlyPostgresDatabaseProps;
  private scaling: DatabaseScalingConfig;

  constructor(stack: FlyStack, id: string, props: IFlyPostgresDatabaseProps) {
    super(stack, id);
    this.props = props;
    this.scaling = props.scaling || {
      volumeSize: 10,
      highAvailability: false,
      machineType: 'shared',
    };
    this.initialize();
  }

  getConnectionString(): string {
    return `postgres://${this.getId()}.internal:5432/app`;
  }

  validate(): boolean {
    return true;
  }

  getName(): string {
    return this.props.name;
  }

  synthesize(): Record<string, any> {
    return {
      type: "fly-postgres-database",
      name: this.props.name,
      region: this.props.region,
      isReplica: this.props.isReplica || false,
      primaryName: this.props.primaryName,
      scaling: this.scaling,
    };
  }
}