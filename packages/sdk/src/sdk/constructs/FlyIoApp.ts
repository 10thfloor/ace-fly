import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import type { FlyDomain } from "./FlyDomain";
import type { FlyCertificate } from "./FlyCertificate";
import type { FlySecret } from "./FlySecret";
import type { FlyHttpService } from "./FlyHttpService";
import type { FlyRegion } from "../types/FlyRegions";

export interface FlyIoAppConfig {
	name: string;
	org?: string;
	regions: FlyRegion[];
	services: Record<string, FlyHttpService>;
	env?: Record<string, string>;
	secrets?: FlySecret[];
	domain?: FlyDomain;
	certificate?: FlyCertificate;
}

export class FlyIoApp extends StackConstruct {
	private config: FlyIoAppConfig;

	constructor(stack: FlyStack, id: string, config: FlyIoAppConfig) {
		super(stack, id);
		this.config = config;
		this.validate();
	}

	addService(name: string, service: FlyHttpService): void {
		this.config.services[name] = service;
	}

	addSecret(secret: FlySecret): void {
		if (!this.config.secrets) {
			this.config.secrets = [];
		}
		this.config.secrets.push(secret);
	}

	setDomain(domain: FlyDomain): void {
		this.config.domain = domain;
	}

	setCertificate(certificate: FlyCertificate): void {
		this.config.certificate = certificate;
	}

	synthesize(): Record<string, any> {
		return {
			name: this.config.name,
			org: this.config.org,
			regions: this.config.regions,
			services: Object.fromEntries(
				Object.entries(this.config.services).map(([name, service]) => [
					name,
					service.synthesize(),
				])
			),
			env: this.config.env,
			secrets: this.config.secrets?.map(secret => secret.synthesize()),
			domain: this.config.domain?.synthesize(),
			certificate: this.config.certificate?.synthesize(),
		};
	}

	getConfig(): Record<string, any> {
		return {
			name: this.config.name,
			org: this.config.org,
			regions: this.config.regions,
			services: Object.fromEntries(
				Object.entries(this.config.services).map(([name, service]) => [
					name,
					service.getConfig()
				])
			),
			env: this.config.env,
			secrets: this.config.secrets?.map(secret => secret.getConfig()) || [],
			domain: this.config.domain?.getConfig(),
			certificate: this.config.certificate?.getConfig(),
		};
	}

	protected validate(): boolean {
		if (!this.config.name) {
			throw new Error("FlyIoApp name is required");
		}
		if (!this.config.regions || this.config.regions.length === 0) {
			throw new Error("At least one region is required for FlyIoApp");
		}
		return true;
	}

	getName(): string {
		return this.config.name;
	}
}
