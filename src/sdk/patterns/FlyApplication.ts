import { StackConstruct } from "../core/StackConstruct";
import { FlyApp } from "../constructs/FlyApp";
import { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyDomain } from "../constructs/FlyDomain";
import { FlySecret } from "../constructs/FlySecret";
import { FlyCertificate } from "../constructs/FlyCertificate";
import type { FlyStack } from "../core/FlyStack";
import { FlyAnycastIP } from "../constructs/FlyAnycastIP";
import {
	FlyPostgresDatabase,
	type DatabaseScalingConfig,
} from "./FlyPostgresDatabase";
import { FlyApi, type ApiRoute } from "./FlyApi";
import { FlyFirewall, type FirewallRule } from '../constructs/FlyFirewall';
import { ArcJetProtection, type ArcJetProtectionConfig } from "../constructs/ArcJetProtection";

export interface ScalingRule {
	metric: "cpu" | "memory";
	threshold: number;
	action: "scale_up" | "scale_down";
}

export interface ScalingConfig {
	minMachines: number;
	maxMachines: number;
	autoScaling: boolean;
	scaleToZero: boolean;
}

export interface HttpServiceConfig {
	service: {
		getInternalPort: () => number;
	};
	concurrency?: {
		type: "connections" | "requests";
		soft_limit: number;
		hard_limit: number;
	};
	scaling?: ScalingConfig;
}

export interface FlyApplicationConfig {
	name: string;
	organization: string;
	regions: string[];
	domain: string;
	secretNames: string[];
	env?: Record<string, string>; // Add this line
	api?: {
		routes: ApiRoute[];
	};
	database?: {
		name: string;
		primaryRegion: string;
		scaling?: DatabaseScalingConfig;
	};
	scaling?: ScalingConfig;
}

export class FlyApplication extends StackConstruct {
	private app: FlyApp;
	private domain: FlyDomain;
	private certificate: FlyCertificate;
	private scalingConfig?: ScalingConfig;
	private httpServices: Record<string, FlyHttpService> = {};
	private secrets: Record<string, FlySecret> = {};
	private secretNames: string[];
	private env: Record<string, string> = {};
	private api?: FlyApi;
	private database?: FlyPostgresDatabase;
	private databases: Record<string, FlyPostgresDatabase> = {};
	private scaling: {
		minMachines: number;
		maxMachines: number;
		autoScaling: boolean;
		scaleToZero: boolean;
	};
	private defaultScaling: ScalingConfig;
	private firewall: FlyFirewall;
	private arcjetProtection?: ArcJetProtection;

	constructor(stack: FlyStack, id: string, config: FlyApplicationConfig) {
		super(stack, id);
		this.domain = new FlyDomain(stack, `${id}-domain`, {
			name: `${config.name}-domain`,
			domainName: config.domain,
		});
		this.certificate = new FlyCertificate(stack, `${id}-certificate`, {
			name: `${config.name}-certificate`,
			domains: [this.domain],
		});

		this.app = new FlyApp(stack, `${id}-app`, {
			name: config.name,
			domain: this.domain,
			certificate: this.certificate,
			secrets: [],
			publicServices: {},
			privateServices: {},
			regions: config.regions,
			env: {},
		});

		this.secretNames = config.secretNames;

		// Initialize secrets (now just references, not values)
		for (const secretName of this.secretNames) {
			this.addSecretReference(secretName);
		}

		this.env = config.env || {};

		if (config.api) {
			this.addApi(config.api.routes);
		}

		if (config.database) {
			this.addDatabase({
				name: config.database.name,
				primaryRegion: config.database.primaryRegion,
				scaling: config.database.scaling,
			});
		}

		this.initialize();
		this.defaultScaling = {
			minMachines: 1,
			maxMachines: 1,
			autoScaling: false,
			scaleToZero: true,
		};
		this.scaling = config.scaling || {
			minMachines: 1,
			maxMachines: 1,
			autoScaling: false,
			scaleToZero: false,
		};

		this.firewall = new FlyFirewall(this.getStack(), `${this.getId()}-firewall`, {
			app: this.app,
		});

		// Add default firewall rule to block all traffic
		this.addDefaultFirewallRules();
	}

	private addDefaultFirewallRules(): void {
		const defaultRules: FirewallRule[] = [
			{
				action: 'deny',
				protocol: 'tcp',
				ports: '1-65535',
				source: '0.0.0.0/0',
				destination: '0.0.0.0/0',
				description: 'Default deny all traffic',
				priority: 2000
			}
		];

		for (const rule of defaultRules) {
			this.firewall.addRule(rule);
		}
	}

	setScalingConfig(config: ScalingConfig): void {
		this.scalingConfig = config;
		// TODO: Apply scaling config to the underlying FlyApp or machines
	}

	addHttpService(
		name: string,
		config: HttpServiceConfig,
		dedicatedIp?: boolean,
	): void {
		const scaling = config.scaling || this.defaultScaling;
		const httpService = new FlyHttpService(
			this.getStack(),
			`${this.getId()}-${name}`,
			{
				name: name,
				internal_port: config.service.getInternalPort(),
				auto_stop_machines: scaling.scaleToZero,
				auto_start_machines: scaling.autoScaling,
				min_machines_running: scaling.scaleToZero ? 0 : scaling.minMachines,
				max_machines_running: scaling.maxMachines,
				processes: ["web"],
				concurrency: config.concurrency,
			},
		);

		if (dedicatedIp) {
			const anycastIp = new FlyAnycastIP(
				this.getStack(),
				`${this.getId()}-ip-${name}`,
				{
					type: "v4",
					shared: false,
					proxy: httpService,
				},
			);
			// Add logic to associate this IP with the service
		}

		this.httpServices[name] = httpService;
		// TODO: Add the HTTP service to the underlying FlyApp

		// Add default firewall rule for the service
		this.firewall.addRule({
			action: 'allow',
			protocol: 'tcp',
			ports: config.service.getInternalPort(),
			source: '0.0.0.0/0',
			description: `Allow inbound traffic to ${name} service`,
			priority: 100
		});
	}

	addSecretReference(secretName: string): void {
		const secret = new FlySecret(
			this.getStack(),
			`${this.getId()}-secret-${secretName}`,
			{
				name: secretName,
				key: secretName, // Add this line to satisfy the IFlySecretConfig interface
			},
		);
		this.secrets[secretName] = secret;
		this.app.addSecret(secret);
	}

	getSecretReference(name: string): FlySecret | undefined {
		return this.secrets[name];
	}

	addEnv(key: string, value: string): void {
		this.env[key] = value;
	}

	getEnv(): Record<string, string> {
		return { ...this.env };
	}

	synthesize(): Record<string, any> {
		const synthesis = {
			type: "fly-application",
			app: this.app.synthesize(),
			domain: this.domain.synthesize(),
			certificate: this.certificate.synthesize(),
			scalingConfig: this.scalingConfig,
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
			env: this.env,
			api: this.api?.synthesize(),
			database: this.database?.synthesize(),
			databases: Object.fromEntries(
				Object.entries(this.databases).map(([region, db]) => [
					region,
					db.synthesize(),
				]),
			),
			scaling: this.scaling,
			firewall: this.firewall.synthesize(),
			arcjetProtection: this.arcjetProtection?.synthesize(),
		};
		return synthesis;
	}

	protected validate(): boolean {
		// Add validation logic
		return true;
	}

	protected getName(): string {
		return this.app.getId(); // Use getId() instead of getName()
	}

	addDatabase(config: {
		name: string;
		primaryRegion: string;
		scaling?: DatabaseScalingConfig;
	}): void {
		const primaryDb = new FlyPostgresDatabase(
			this.getStack(),
			`${this.getId()}-db-primary`,
			{
				name: config.name,
				region: config.primaryRegion,
				scaling: config.scaling,
			},
		);

		this.databases[config.primaryRegion] = primaryDb;

		// Create read replicas in other regions
		const appRegions = this.app.getRegions();
		for (const region of appRegions) {
			if (region !== config.primaryRegion) {
				const replicaDb = new FlyPostgresDatabase(
					this.getStack(),
					`${this.getId()}-db-${region}`,
					{
						name: `${config.name}-${region}`,
						region: region,
						isReplica: true,
						primaryName: config.name,
						scaling: config.scaling, // Use the same scaling config for replicas
					},
				);
				this.databases[region] = replicaDb;
			}
		}

		// Add connection logic to the application's environment
		this.addEnv("DATABASE_URL", this.getDatabaseConnectionString());

		if (this.api) {
			this.connectApiToDatabase();
		}

		// Remove the default firewall rule for the database
		// Database access should be managed through Fly.io's private networking
	}

	private getDatabaseConnectionString(): string {
		// TODO: Implement this method
		return "";
	}

	addApi(routes: ApiRoute[]): void {
		this.api = new FlyApi(this.getStack(), `${this.getId()}-api`, { routes });
		this.addHttpService("ApiService", {
			service: this.api,
			concurrency: {
				type: "connections",
				soft_limit: 25,
				hard_limit: 30,
			},
		});

		if (Object.keys(this.databases).length > 0) {
			this.connectApiToDatabase();
		}
	}

	private connectApiToDatabase(): void {
		if (!this.api || Object.keys(this.databases).length === 0) {
			throw new Error(
				"Both API and database must be initialized before connecting",
			);
		}

		this.api.addEnv("DATABASE_URL", this.getDatabaseConnectionString());
	}

	addFirewallRules(rules: FirewallRule[]): void {
		// Clear existing rules before adding new ones
		this.firewall.clearRules();
		
		// Add the new rules
		for (const rule of rules) {
			this.firewall.addRule(rule);
		}

		// Re-add the default deny rule with the lowest priority
		this.firewall.addRule({
			action: 'deny',
			protocol: 'tcp',
			ports: '1-65535',
			source: '0.0.0.0/0',
			destination: '0.0.0.0/0',
			description: 'Default deny all traffic',
			priority: 2000
		});
	}

	addArcJetProtection(config: ArcJetProtectionConfig): void {
		this.arcjetProtection = new ArcJetProtection(
			this.getStack(),
			 `${this.getId()}-arcjet`,
			this.app,
			config
		);
	}
}
