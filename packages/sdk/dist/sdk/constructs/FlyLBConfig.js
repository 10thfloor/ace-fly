import { StackConstruct } from "../core/StackConstruct";
export class FlyLBConfig extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.initialize();
    }
    synthesize() {
        return {
            type: "lb-config",
            name: this.config.name || this.getId(),
            strategy: this.config.strategy,
            healthCheck: this.config.healthCheck,
        };
    }
    validate() {
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
