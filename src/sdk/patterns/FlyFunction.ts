import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyMachine } from "../constructs/FlyMachine";
import { FlyMachineConfig } from "../constructs/FlyMachineConfig";
import { AutoScalingConfig } from "../constructs/FlyAutoScalingConfig";

export interface IFlyServerlessFunctionConfig {
	name: string;
	handler: string;
	runtime: "node" | "python" | "go";
	memory: number;
	timeout: number;
	environment?: Record<string, string>;
}

export class FlyServerlessFunction extends StackConstruct {
	private config: IFlyServerlessFunctionConfig;
	private machine: FlyMachine;

	constructor(
		stack: FlyStack,
		id: string,
		config: IFlyServerlessFunctionConfig,
	) {
		super(stack, id);
		this.config = config;

		const machineConfig = new FlyMachineConfig(
			this.getStack(),
			`${this.getId()}-config`,
			{
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
			},
		);

		this.machine = new FlyMachine(this.getStack(), `${this.getId()}-machine`, {
			name: this.config.name,
			machineConfig,
			regions: ["iad"],
			count: 1,
			autoScaling: new AutoScalingConfig(
				this.getStack(),
				`${this.getId()}-auto-scaling`,
				{
					minMachines: 0,
					maxMachines: 10,
					targetCPUUtilization: 0.7,
					scaleToZero: true,
				},
			),
		});
	}

	private getRuntimeImage(): string {
		switch (this.config.runtime) {
			case "node":
				return "flyio/serverless-node:latest";
			case "python":
				return "flyio/serverless-python:latest";
			case "go":
				return "flyio/serverless-go:latest";
			default:
				throw new Error(`Unsupported runtime: ${this.config.runtime}`);
		}
	}

	synthesize(): Record<string, any> {
		return {
			type: "serverless-function",
			...this.config,
			machine: this.machine.synthesize(),
		};
	}

	protected validate(): boolean {
		// Add validation logic here
		return true;
	}

	protected getName(): string {
		return this.config.name;
	}
}
