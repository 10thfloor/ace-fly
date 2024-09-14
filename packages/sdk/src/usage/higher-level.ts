import { FlyProjectStack } from "../sdk/patterns/FlyProjectStack";
import { FlyStack } from "../sdk/core/FlyStack";
import { FlyApiClient } from "../sdk/api/FlyApiClient";
import { FlyDeployment } from "../sdk/deployment/FlyDeployment";
import { RemixSite } from "../sdk/patterns/RemixSite";
import { ArcJetRuleBuilder } from "../sdk/utils/ArcJetRuleBuilder";
import { FlyRegion } from "../sdk/types/FlyRegions";
import { FlyProtocol } from "../sdk/types/FlyProtocols";

const stack = new FlyStack("my-stack");
const deployment = new FlyDeployment(new FlyApiClient(process.env.FLY_API_TOKEN!));

const remixSite = new RemixSite(stack, "remix-site", {
	name: "my-remix-site",
	projectDir: "./remix-app"
});

const project = new FlyProjectStack(stack, "my-project", {
	name: "my-app",
	organization: "my-org",
  primaryRegion: FlyRegion.LONDON,
  additionalRegions: [FlyRegion.NEW_YORK],
	domain: "my-app.fly.dev",
  secretNames: ["SESSION_SECRET"],
  processGroups: [remixSite.getProcessGroupConfig()]
});

project.addFirewallRule({
	action: "allow",
	protocol: FlyProtocol.TCP,
	ports: 22,
	source: "10.0.0.0/8",
	description: "Allow SSH from internal network",
	priority: 50,
});

project.addArcJetProtection({
	rules: [
		ArcJetRuleBuilder.rateLimit(100),
		ArcJetRuleBuilder.botProtection("medium"),
		ArcJetRuleBuilder.ddosProtection(1000),
	],
});



console.log(JSON.stringify(project.synthesize(), null, 2));

deployment.dryRun(project);