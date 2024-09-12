import { StackConstruct } from "../core/StackConstruct";
export class FlySecret extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.initialize();
    }
    synthesize() {
        return {
            type: "secret",
            name: this.config.name || this.getId(),
            key: this.config.key,
        };
    }
    validate() {
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
