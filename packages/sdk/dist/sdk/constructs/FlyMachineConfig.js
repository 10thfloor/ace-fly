import { StackConstruct } from "../core/StackConstruct";
export class FlyMachineConfig extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.initialize();
    }
    synthesize() {
        return {
            type: "machine-config",
            name: this.config.name || this.getId(),
            cpus: this.config.cpus,
            memoryMB: this.config.memoryMB,
            image: this.config.image,
            cmd: this.config.cmd,
            env: this.config.env,
            guest: this.config.guest,
            volumes: this.config.volumes.map((volume) => volume.getId()),
            internalPort: this.config.internalPort,
        };
    }
    validate() {
        return true;
    }
    getInternalPort() {
        return this.config.internalPort;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
