import type { FlyStack } from "../core/FlyStack";
import type { FlyProxy } from "./FlyProxy";
import type { TlsConfig } from "./TlsConfig";
import { StackConstruct } from "./StackConstruct";
import type { ResourceOrReference } from "../../types";
import { Dependency } from "../utils/DependencyDecorator";
import { HttpService } from "./HttpService";

export interface IAnycastIPConfig {
	name?: string;
	type: string;
	shared: boolean;
	proxy: ResourceOrReference<FlyProxy | HttpService>;
	tls?: ResourceOrReference<TlsConfig>;
}

export class AnycastIP extends StackConstruct {
	config: IAnycastIPConfig;

	@Dependency()
	proxy: ResourceOrReference<FlyProxy | HttpService>;

	@Dependency(true)
	tls?: ResourceOrReference<TlsConfig>;

	constructor(stack: FlyStack, id: string, config: IAnycastIPConfig) {
		super(stack, id);
		this.config = config;
		this.proxy = config.proxy;
		this.tls = config.tls;
		this.initialize();
	}

	synthesize(): Record<string, any> {
		const result: Record<string, any> = {
			type: "anycast-ip",
			name: this.config.name || this.getId(),
			ipType: this.config.type,
			shared: this.config.shared,
			proxy: this.getResource(this.proxy).getId(),
		};

		if (this.tls) {
			result.tls = this.getResource(this.tls).getId();
		}

		return result;
	}

	protected validate(): boolean {
		const proxyResource = this.getResource(this.proxy);
		if (proxyResource instanceof HttpService && this.tls) {
			console.warn(
				"TLS configuration is ignored when using HttpService as proxy.",
			);
		}
		if (!(proxyResource instanceof HttpService) && !this.tls) {
			console.warn(
				"TLS configuration is recommended when not using HttpService as proxy.",
			);
		}
		return true;
	}
}
