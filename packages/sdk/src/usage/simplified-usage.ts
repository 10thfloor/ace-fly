import { FlySDK, type IFlySDKConfig } from "../sdk/core/FlySDK.js";
import { FlyStack } from "../sdk/core/FlyStack.js";
import { FlyOrg } from "../sdk/core/FlyOrg.js";
import { FlyDomain } from "../sdk/constructs/FlyDomain.js";
import { FlyCertificate } from "../sdk/constructs/FlyCertificate.js";
import { FlySecret } from "../sdk/constructs/FlySecret.js";
import { FlyHttpService } from "../sdk/constructs/FlyHttpService.js";
import { FlyIoApp } from "../sdk/constructs/FlyIoApp.js";
import { RemixConstruct } from "../sdk/constructs/RemixConstruct.js";
import { FlyApiClient } from "../sdk/api/FlyApiClient.js";
import { FlyHttpServiceConcurrencyType } from "../sdk/types/FlyHttpServiceConcurrencyTypes.js";
import "reflect-metadata";

class FlyDeployment extends FlySDK {
	readonly stack: FlyStack;

	constructor(context: IFlySDKConfig) {
		super(context);

		const apiClient = new FlyApiClient(context.apiToken);
		this.stack = new FlyStack("my-stack", apiClient);
		
		const devOrg = new FlyOrg(this.stack, "dev-org", {
			name: "My Development Organization"
		});

		const devDomain = new FlyDomain(this.stack, "dev-domain", {
			name: "dev-domain",
			domainName: "my-app.dev.fly.dev",
			// ... other domain configuration ...
		});

		const devDomainCertificate = new FlyCertificate(
			this.stack,
			"dev-certificate",
			{
				name: "my-certificate",
				domains: [devDomain],
				// ... other certificate configuration ...
			},
		);

		const sessionSecret = new FlySecret(this.stack, "app-secret", {
			name: "my-secret",
			key: "SESSION_SECRET",
		});

		const remixSite = new RemixConstruct(this.stack, "remix-site", {
			name: "my-remix-site",
		});

		const webService = new FlyHttpService(this.stack, "web-service", {
			name: "my-web-service",
			internal_port: remixSite.machine.getInternalPort(),
			auto_stop_machines: true,
			auto_start_machines: true,
			min_machines_running: 1,
			processes: ["web"],
			concurrency: {
				type: FlyHttpServiceConcurrencyType.CONNECTIONS,
				hard_limit: 25,
				soft_limit: 20,
			},
		});

		const remixApp = new FlyIoApp(this.stack, "dev-app", {
			name: "my-dev-app",
			domain: devDomain,
			certificate: devDomainCertificate,
			secrets: [sessionSecret],
			regions: ["iad", "lhr"],
			env: {
				SESSION_SECRET: "{{ .secrets.SESSION_SECRET }}",
			},
			publicServices: {
				[remixSite.getName()]: webService,
			},
			privateServices: {},
		});

		devOrg.addApp(remixApp);

		// Deploy all apps in the organization
		devOrg.deploy();
	}
}
