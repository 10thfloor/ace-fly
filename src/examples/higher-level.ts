import { FlyApplication } from "../sdk/patterns/FlyApplication";
import { FlyStack } from "../sdk/core/FlyStack";
import { FlyApiClient } from "../sdk/api/FlyApiClient";
import { FlyDeployment } from "../sdk/deployment/FlyDeployment";
import { RemixSite } from "../sdk/patterns/RemixSite";
import { ArcJetRuleBuilder } from "../sdk/utils/ArcJetRuleBuilder";

const apiClient = new FlyApiClient("my-api-token");
const stack = new FlyStack("my-stack", apiClient);
const deployment = new FlyDeployment(apiClient);

const remixSite = new RemixSite(stack, "remix-site", {
	projectDir: "./remix-app",
});

const app = new FlyApplication(stack, "my-app", {
	name: "my-app",
	organization: "my-org",
	regions: ["iad", "lhr"],
	domain: "my-app.fly.dev",
	secretNames: ["SESSION_SECRET", "API_KEY"],
	env: {
		NODE_ENV: "production",
	},
});

app.addDatabase({
	name: "my-app-db",
	primaryRegion: "iad",
	scaling: {
		volumeSize: 50,
		highAvailability: true,
		machineType: "dedicated",
	},
});

app.addHttpService("WebSite", {
	service: remixSite,
	force_https: false,
	concurrency: {
		type: "requests",
		soft_limit: 50,
		hard_limit: 60,
	},
	min_machines_running: 2,
	max_machines_running: 5,
});

app.addFirewallRules([
	{
		action: "allow",
		protocol: "tcp",
		ports: [80, 443],
		source: "0.0.0/0",
		description: "Allow inbound HTTP and HTTPS traffic",
		priority: 100,
	},
]);

app.addArcJetProtection({
	apiKey: "your-arcjet-api-key",
	rules: [
		ArcJetRuleBuilder.rateLimit(100),
		ArcJetRuleBuilder.botProtection("medium"),
		ArcJetRuleBuilder.ddosProtection(1000),
	],
});

console.log(app.synthesize());
deployment.deploy(app);