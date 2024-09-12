import { StackConstruct } from "../core/StackConstruct";
export class FlyPostgresReplica extends StackConstruct {
    constructor(stack, name, config) {
        super(stack, name);
        this.config = config;
        this.initialize();
    }
    synthesize() {
        return {
            type: "postgres-replica",
            name: this.config.name || this.getId(),
            region: this.config.region,
            instanceType: this.config.instanceType,
            storage: this.config.storage,
        };
    }
    validate() {
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
