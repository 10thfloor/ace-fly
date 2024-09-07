import { FlyStack } from "../sdk/core/FlyStack";
import { RemixConstruct } from "../sdk/constructs/RemixConstruct";

const RemixDeployment = new RemixConstruct(new FlyStack(), "remix-site", {
	name: "Awesome Website",
});

console.log(JSON.stringify(RemixDeployment.getStack().synthesize(), null, 2));

// RemixDeployment.getStack().deploy();
