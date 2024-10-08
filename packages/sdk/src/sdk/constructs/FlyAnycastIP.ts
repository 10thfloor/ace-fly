import type { FlyStack } from "../core/FlyStack";
import type { FlyProxy } from "./FlyProxy";
import type { TlsConfig } from "./TlsConfig";
import { StackConstruct } from "../core/StackConstruct";
import type { ResourceOrReference } from "../../types";
import { Dependency } from "../utils/DependencyDecorator";
import { FlyHttpService } from "./FlyHttpService";

export interface IFlyAnycastIPConfig {
	name?: string;
	type: string;
	shared: boolean;
	proxy: ResourceOrReference<FlyProxy | FlyHttpService>;
	tls?: ResourceOrReference<TlsConfig>;
}

export class FlyAnycastIP extends StackConstruct {
	config: IFlyAnycastIPConfig;

	@Dependency()
	proxy: ResourceOrReference<FlyProxy | FlyHttpService>;

	@Dependency(true)
	tls?: ResourceOrReference<TlsConfig>;

	constructor(stack: FlyStack, id: string, config: IFlyAnycastIPConfig) {
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
		if (proxyResource instanceof FlyHttpService && this.tls) {
			console.warn(
				"TLS configuration is ignored when using HttpService as proxy.",
			);
		}
		if (!(proxyResource instanceof FlyHttpService) && !this.tls) {
			console.warn(
				"TLS configuration is recommended when not using HttpService as proxy.",
			);
		}
		return true;
	}

	getName(): string {
		return this.config.name || this.getId();
	}
}
