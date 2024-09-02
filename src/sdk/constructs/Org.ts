import { Construct } from "./Construct.js";
import { App, type AppConfig } from "./App.js";

export class Org extends Construct {
	private apps: App[] = [];

	constructor(
		scope: Construct,
		id: string,
		private config: OrgConfig,
	) {
		super(scope, id);
		this.config = config;
	}

	createApp(
		id: string,
		props: AppConfig,
	): App {
		const app = new App(this, id, { ...props });
		this.apps.push(app);
		return app;
	}
}

export interface OrgConfig {
	name: string;
	members?: {
		email: string;
		role: "owner" | "member";
	}[];
	logging?: {
		centralizedLogging: boolean;
		logRetentionDays: number;
	};
	networking?: {
		privateNetworkEnabled: boolean;
	};
	sshKeys?: {
		name: string;
		publicKey: string;
	}[];
	settings?: {
		allowPublicIpv6?: boolean;
		allowCustomDomains?: boolean;
		allowVolumeAttachment?: boolean;
	};
}
