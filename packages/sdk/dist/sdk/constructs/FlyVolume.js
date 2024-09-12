import { StackConstruct } from "../core/StackConstruct";
export class FlyVolume extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.initialize();
    }
    synthesize() {
        return {
            type: "volume",
            name: this.config.name || this.getId(),
            size: this.config.size,
        };
    }
    validate() {
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
