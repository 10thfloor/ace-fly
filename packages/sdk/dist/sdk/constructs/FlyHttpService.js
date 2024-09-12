import { StackConstruct } from "../core/StackConstruct";
import { DefaultConfigs } from '../config/DefaultConfigs';
import { FlyMachineType } from "../types/FlyMachineTypes";
export class FlyHttpService extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = {
            ...DefaultConfigs.FlyHttpService,
            ...config,
            concurrency: {
                ...DefaultConfigs.FlyHttpService.concurrency,
                ...config.concurrency,
            },
        };
        this.initialize();
    }
    synthesize() {
        return {
            type: "http_service",
            name: this.config.name || this.getId(),
            internal_port: this.config.internal_port,
            force_https: this.config.force_https ?? true,
            auto_stop_machines: this.config.auto_stop_machines ?? true,
            auto_start_machines: this.config.auto_start_machines ?? true,
            min_machines_running: this.config.min_machines_running ?? 0,
            max_machines_running: this.config.max_machines_running ?? 1,
            processes: this.config.processes,
            concurrency: this.config.concurrency,
            machineType: this.config.machineType || FlyMachineType.SHARED_CPU_1X,
        };
    }
    getInternalPort() {
        return this.config.internal_port;
    }
    validate() {
        // Add validation logic if needed
        return true;
    }
    getName() {
        return this.config.name || this.getId();
    }
}
