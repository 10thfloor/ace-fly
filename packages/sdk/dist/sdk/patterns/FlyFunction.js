import { StackConstruct } from "../core/StackConstruct";
import { FlyMachine } from "../constructs/FlyMachine";
import { FlyMachineConfig } from "../constructs/FlyMachineConfig";
import { FlyAutoScalingConfig } from "../constructs/FlyAutoScalingConfig";
export class FlyServerlessFunction extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        const machineConfig = new FlyMachineConfig(this.getStack(), `${this.getId()}-config`, {
            name: this.config.name,
            image: this.getRuntimeImage(),
            cpus: 1,
            memoryMB: this.config.memory,
            env: {
                ...this.config.environment,
                FLY_FUNCTION_HANDLER: this.config.handler,
                FLY_FUNCTION_TIMEOUT: this.config.timeout.toString(),
            },
            cmd: ["node", "serverless-runner.js"],
            guest: {
                cpu_kind: "performance",
                memory_mb: this.config.memory,
            },
            volumes: [],
            internalPort: 8080,
        });
        this.machine = new FlyMachine(this.getStack(), `${this.getId()}-machine`, {
            name: this.config.name,
            machineConfig,
            regions: ["iad"],
            count: 1,
            autoScaling: new FlyAutoScalingConfig(this.getStack(), `${this.getId()}-auto-scaling`, {
                minMachines: 0,
                maxMachines: 10,
                targetCPUUtilization: 0.7,
                scaleToZero: true,
            }),
        });
        this.initialize();
    }
    getRuntimeImage() {
        switch (this.config.runtime) {
            case "node":
                return "flyio/serverless-node:latest";
            case "elixir":
                return "flyio/serverless-elixir:latest";
            case "python":
                return "flyio/serverless-python:latest";
            case "go":
                return "flyio/serverless-go:latest";
            default:
                throw new Error(`Unsupported runtime: ${this.config.runtime}`);
        }
    }
    synthesize() {
        return {
            type: "serverless-function",
            ...this.config,
            machine: this.machine.synthesize(),
        };
    }
    validate() {
        // Add validation logic here
        return true;
    }
    getName() {
        return this.config.name;
    }
}
