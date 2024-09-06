import { FlyStack } from "../sdk/core/FlyStack";
import { RemixSite } from "../sdk/constructs/RemixConstruct";

const RemixDeployment = new RemixSite(new FlyStack(), "remix-site", {
    name: "Awesome Website",
    domain: "awesome.website",
    env: {
        NODE_ENV: "production",
    }
});

console.log(JSON.stringify(RemixDeployment.getStack().synthesize(), null, 2));
// RemixDeployment.getStack().deploy();
