import { FlyApplication } from "../sdk/patterns/FlyApplication";
import { FlyStack } from "../sdk/core/FlyStack";
import { FlyApiClient } from "../sdk/api/FlyApiClient";
import { FlyDeployment } from "../sdk/deployment/FlyDeployment";
import { RemixSite } from "../sdk/patterns/RemixSite";
import { ArcJetRuleBuilder } from "../sdk/utils/ArcJetRuleBuilder";
import { FlyRegion } from "../sdk/types/FlyRegions";
import { FlyProtocol } from "../sdk/types/FlyProtocols";
import { FlyMachineType } from "../sdk/types/FlyMachineTypes";
const apiClient = new FlyApiClient("my-api-token");
const stack = new FlyStack("my-stack", apiClient);
const deployment = new FlyDeployment(apiClient);
const remixSite = new RemixSite(stack, "remix-site", {
    projectDir: "./remix-app",
});
const app = new FlyApplication(stack, "my-app", {
    name: "my-app",
    organization: "my-org",
    regions: [FlyRegion.WASHINGTON_DC, FlyRegion.LONDON],
    domain: "my-app.fly.dev",
    secretNames: [], // Add this line to fix the error
});
// Add HTTP service with defaults
app.addHttpService("WebSite", { service: remixSite });
// Add custom firewall rule
app.addFirewallRule({
    action: "allow",
    protocol: FlyProtocol.TCP,
    ports: 22,
    source: "10.0.0.0/8",
    description: "Allow SSH from internal network",
    priority: 50,
});
app.addDatabase({
    name: "my-app-db",
    primaryRegion: FlyRegion.WASHINGTON_DC,
    scaling: {
        volumeSize: 50,
        highAvailability: true,
        machineType: FlyMachineType.DEDICATED_CPU_1X,
    }
});
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
