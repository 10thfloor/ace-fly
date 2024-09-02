import { Construct } from "./Construct.js";
import type { SecretReference } from "./App.js";

export class Machine extends Construct {
	constructor(
		scope: Construct,
		private config: MachineProps,
	) {
		super(scope, config.name);
	}
}

export interface MachineProps {
	name: string;
	count: number;
	regions: string[];
  config: MachineConfig;
}

// This is the check config for a service
// It is used to define the type of check to perform
// eg to perform a tcp check on port 80, you would use the following config:
// {
//   port: 80,
//   type: "tcp",
//   interval: "10s",
//   timeout: "5s",
//   grace_period: "5s"
// }
export interface CheckConfig {
	port: number;
	type: string;
	interval: string;
	timeout: string;
	grace_period: string;
	method: string;
	path: string;
}

export interface MachineConfig {
	cpus: number;
	memoryMB: number;
	image: string;
	env?: Record<string, string>;
	cmd?: string[];
	exec?: string[];
	init?: {
		exec: string[];
		entrypoint?: string[];
		cmd?: string[];
	};
	guest?: {
		cpu_kind?: "shared" | "performance";
		cpus?: number;
		memory_mb?: number;
		gpu_kind?: string;
	};
	host?: {
		dedicated?: boolean;
		cpu_kind?: "shared" | "performance";
		cpus?: number;
		memory_mb?: number;
	};
	restart?: {
		policy?: "on-failure" | "always" | "no";
		max_retries?: number;
	};
	services?: Array<{
		ports: Array<{ port: number; handlers: string[] }>;
		internal_port?: number;
		protocol: string;
		force_https?: boolean;
	}>;
	metadata?: Record<string, string>;
}
