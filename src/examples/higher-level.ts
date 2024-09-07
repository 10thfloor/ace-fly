import { FlyApplication } from "../sdk/patterns/FlyApplication";
import { FlyStack } from "../sdk/core/FlyStack";
import { FlyApiClient } from "../sdk/api/FlyApiClient";
import { RemixSite } from "../sdk/patterns/RemixSite";
import { FlyPostgresDatabase } from "../sdk/patterns/FlyPostgresDatabase"; // New import

const stack = new FlyStack("my-stack", new FlyApiClient("my-api-token"));

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

const remixSite = new RemixSite(stack, "remix-site", {
	projectDir: "./remix-app",
});

app.addHttpService("WebService", {
	service: remixSite,
	concurrency: {
		type: "connections",
		soft_limit: 20,
		hard_limit: 25,
	},
});

app.addApi([
	{
		path: "/",
		method: "GET",
		handlerFile: "src/handlers/hello.js",
	},
]);

// Attach the database to the application
app.addDatabase({
	name: "my-app-db",
	primaryRegion: "iad"
});

console.log(app.synthesize());
