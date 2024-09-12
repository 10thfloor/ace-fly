import { StackConstruct } from "../core/StackConstruct";
import { FlyMachineType } from "../types/FlyMachineTypes";
export class FlyPostgresDatabase extends StackConstruct {
    constructor(stack, id, props) {
        super(stack, id);
        this.props = props;
        this.scaling = props.scaling || {
            volumeSize: 10,
            highAvailability: false,
            machineType: FlyMachineType.SHARED_CPU_1X,
        };
        this.initialize();
    }
    getConnectionString() {
        return `postgres://${this.getId()}.internal:5432/app`;
    }
    validate() {
        return true;
    }
    getName() {
        return this.props.name;
    }
    synthesize() {
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
