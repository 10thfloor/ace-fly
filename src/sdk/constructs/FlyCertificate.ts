import { StackConstruct } from "./StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import type { FlyStack } from "../core/FlyStack";
import type { FlyDomain } from "./FlyDomain";
import type { ResourceOrReference } from "../../types";

export interface ICertificateConfig {
	name?: string;
	domains: ResourceOrReference<FlyDomain>[];
}

export class FlyCertificate extends StackConstruct {
	@Dependency()
	private domains: FlyDomain[];

	private config: ICertificateConfig;

	constructor(stack: FlyStack, id: string, config: ICertificateConfig) {
		super(stack, id);
		this.config = config;
		this.domains = config.domains.map((domain) => this.getResource(domain));
		this.initialize();
	}

	synthesize(): Record<string, any> {
		return {
			type: "certificate",
			name: this.config.name || this.getId(),
			domains: this.domains.map((domain) => domain.getDomainName()),
		};
	}

	protected validate(): boolean {
		return this.domains.length > 0;
	}
}
