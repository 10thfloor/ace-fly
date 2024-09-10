import { StackConstruct } from "../core/StackConstruct";
import { FlyIoApp } from "../constructs/FlyIoApp";
import { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyDomain } from "../constructs/FlyDomain";
import type { FlySecret } from "../constructs/FlySecret";
import { FlyCertificate } from "../constructs/FlyCertificate";
import type { FlyStack } from "../core/FlyStack";
import type {
	FlyPostgresDatabase,
	DatabaseScalingConfig,
} from "./FlyPostgresDatabase";
import type { FirewallRule } from "../constructs/FlyFirewall";
import { FlyFirewall } from "../constructs/FlyFirewall";
import {
	ArcJetProtection,
	type ArcJetProtectionConfig,
} from "../constructs/ArcJetProtection";
import type { IFlyHttpServiceProps } from "../constructs/FlyHttpService";
import type { IFlyAutoScalingConfig } from "../constructs/FlyAutoScalingConfig";
export interface FlyApplicationConfig {
	name: string;
	organization: string;
	regions: string[];
	domain: string;
	secretNames: string[];
	env?: Record<string, string>;
}

export interface HttpServiceConfig {
	service: {
		getInternalPort: () => number;
	};
	forceHttps?: boolean;
	concurrency?: {
		type: "connections" | "requests";
		soft_limit: number;
		hard_limit: number;
	};
	scaling?: {
		autoStartMachines?: boolean;
		scaleToZero?: boolean;
		minMachines?: number;
		maxMachines?: number;
	};
}

export class FlyApplication extends StackConstruct {
	private app: FlyIoApp;
	private domain: FlyDomain;
	private certificate: FlyCertificate;
	private httpServices: Record<string, FlyHttpService> = {};
	private secrets: Record<string, FlySecret> = {};
	private databases: Record<string, FlyPostgresDatabase> = {};
	private firewall: FlyFirewall;
	private arcjetProtection?: ArcJetProtection;

	constructor(
		stack: FlyStack,
		id: string,
		private readonly config: FlyApplicationConfig,
	) {
		super(stack, id);

		this.certificate = {} as FlyCertificate;
		this.domain = {} as FlyDomain;
		this.firewall = {} as FlyFirewall;
		this.app = {} as FlyIoApp;

		this.initializeComponents();
	}

	private initializeComponents(): void {
		this.domain = new FlyDomain(this.getStack(), `${this.getId()}-domain`, {
			name: `${this.config.name}-domain`,
			domainName: this.config.domain,
		});

		this.certificate = new FlyCertificate(
			this.getStack(),
			`${this.getId()}-certificate`,
			{
				name: `${this.config.name}-certificate`,
				domains: [this.domain],
			},
		);

		this.app = new FlyIoApp(this.getStack(), `${this.getId()}-app`, {
			name: this.config.name,
			domain: this.domain,
			certificate: this.certificate,
			secrets: [],
			publicServices: {},
			privateServices: {},
			regions: this.config.regions,
			env: this.config.env || {},
		});

		this.firewall = new FlyFirewall(this.getStack(), this.getId(), {
			app: this.app,
		});

		for (const secretName of this.config.secretNames) {
			this.addSecretReference(secretName);
		}
	}

	addHttpService(
		name: string,
		config: Partial<IFlyHttpServiceProps> & {
			service: {
				getInternalPort: () => number;
			};
		}
	): void {
		const defaultConfig: IFlyHttpServiceProps = {
			name: name,
			internal_port: config.service.getInternalPort(),
			force_https: true,
			auto_start_machines: true,
			auto_stop_machines: false,
			min_machines_running: 1,
			max_machines_running: 1,
			processes: ["web"],
			concurrency: {
				type: "connections",
				soft_limit: 25,
				hard_limit: 30,
			},
		};

		const mergedConfig = { ...defaultConfig, ...config };

		const httpService = new FlyHttpService(
			this.getStack(),
			`${this.getId()}-${name}`,
			mergedConfig
		);

		this.httpServices[name] = httpService;
		this.app.addPublicService(name, httpService);
	}

	addDefaultHttpFirewallRules(): void {
		this.firewall.addRule({
			action: "allow",
			protocol: "tcp",
			ports: [80, 443],
			source: "0.0.0.0/0",
			description: "Allow inbound HTTP and HTTPS traffic",
			priority: 100,
		});
	}

	addDatabase(config: {
		name: string;
		primaryRegion: string;
		scaling?: DatabaseScalingConfig;
	}): void {
		// Implementation remains the same
	}

	addFirewallRules(rules: FirewallRule[]): void {
		// Implementation remains the same
	}

	addArcJetProtection(config: ArcJetProtectionConfig): void {
		this.arcjetProtection = new ArcJetProtection(
			this.getStack(),
			`${this.getId()}-arcjet`,
			this.app,
			config,
		);
	}

	addSecretReference(secretName: string): void {
		// Implementation remains the same
	}

	synthesize(): Record<string, any> {
		const synthesized = {
			app: this.app.synthesize(),
			domain: this.domain.synthesize(),
			certificate: this.certificate.synthesize(),
			httpServices: Object.fromEntries(
				Object.entries(this.httpServices).map(([name, service]) => [
					name,
					service.synthesize(),
				]),
			),
			secrets: Object.fromEntries(
				Object.entries(this.secrets).map(([key, secret]) => [
					key,
					secret.synthesize(),
				]),
			),
			databases: Object.fromEntries(
				Object.entries(this.databases).map(([key, db]) => [
					key,
					db.synthesize(),
				]),
			),
			firewall: this.firewall.synthesize(),
			arcjetProtection: this.arcjetProtection?.synthesize(),
		};

		console.log("Synthesized FlyApplication:", synthesized);

		return synthesized;
	}

	protected validate(): boolean {
		// Implement validation logic
		return true;
	}

	protected getName(): string {
		return this.config.name;
	}
}
