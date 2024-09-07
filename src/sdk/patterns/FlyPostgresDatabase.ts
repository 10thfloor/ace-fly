import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";

export interface FlyPostgresDatabaseProps {
  name: string;
  region: string;
  isReplica?: boolean;
  primaryName?: string;
}

export class FlyPostgresDatabase extends StackConstruct {
  private props: FlyPostgresDatabaseProps;

  constructor(stack: FlyStack, id: string, props: FlyPostgresDatabaseProps) {
    super(stack, id);
    this.props = props;
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
    };
  }
}