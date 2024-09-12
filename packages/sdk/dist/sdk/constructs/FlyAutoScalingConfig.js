import { StackConstruct } from "../core/StackConstruct";
export class FlyAutoScalingConfig extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.initialize();
    }
    synthesize() {
        return {
            type: "auto-scaling-config",
            name: this.config.name || this.getId(),
            minMachines: this.config.minMachines,
            maxMachines: this.config.maxMachines,
            targetCPUUtilization: this.config.targetCPUUtilization,
            scaleToZero: this.config.scaleToZero,
        };
    }
    validate() {
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
