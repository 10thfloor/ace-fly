import { FlyApplication } from "../sdk/patterns/FlyApplication";
import { FlyStack } from "../sdk/core/FlyStack";
import { FlyApiClient } from "../sdk/api/FlyApiClient";
import { RemixSite } from "../sdk/patterns/RemixSite";
import { ArcJetRuleBuilder } from "../sdk/utils/ArcJetRuleBuilder";

const stack = new FlyStack("my-stack", new FlyApiClient("my-api-token"));

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
	scaling: {
		min_machines: 1,
		max_machines: 5,
		auto_scale_up: true,
		auto_scale_down: true,
		scale_to_zero: false,
		target_cpu_percent: 70
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

app.addHttpService("WebService", {
	service: remixSite,
	concurrency: {
		type: "connections",
		soft_limit: 20,
		hard_limit: 25,
	},
	scaling: {
		min_machines: 2,
		max_machines: 10,
		auto_scale_up: true,
		auto_scale_down: true,
		scale_to_zero: false,
		target_cpu_percent: 70
	},
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
