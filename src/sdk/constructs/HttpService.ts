import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";

export interface HttpServiceProps {
	name?: string;
	internal_port: number;
	force_https?: boolean;
	auto_stop_machines?: boolean;
	auto_start_machines?: boolean;
	min_machines_running?: number;
	processes?: string[];
	concurrency?: {
		type: "connections" | "requests";
		hard_limit: number;
		soft_limit: number;
	};
}

export class HttpService extends StackConstruct {
	private config: HttpServiceProps;

	constructor(stack: FlyStack, id: string, props: HttpServiceProps) {
		super(stack, id);
		this.config = props;
		this.initialize();
	}

	synthesize(): Record<string, any> {
		return {
			type: "http_service",
			name: this.config.name || this.getId(),
			internal_port: this.config.internal_port,
			force_https: this.config.force_https ?? true,
			auto_stop_machines: this.config.auto_stop_machines ?? true,
			auto_start_machines: this.config.auto_start_machines ?? true,
			min_machines_running: this.config.min_machines_running ?? 0,
			processes: this.config.processes,
			concurrency: this.config.concurrency,
		};
	}

	getInternalPort(): number {
		return this.config.internal_port;
	}

	protected validate(): boolean {
		// Add validation logic if needed
		return true;
	}

	protected getName(): string {
		return this.config.name || this.getId();
	}
}
