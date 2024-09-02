import { AceSDK } from "../sdk/AceSDK.js";
import { ACEStack } from "../sdk/constructs/Stack.js";
import { HttpService } from "../sdk/constructs/HttpService.js";

class FlyDeployment extends ACEStack {
	constructor(scope: AceSDK) {
		super(scope, "MyInfrastructure");

		// Create an organization
		const myOrg = this.createOrg("my-org", {
			name: "My Awesome Organization",
		});

		const httpService = new HttpService(this, {
			name: "my-proxy", 
			forceHttps: true,
			internalPort: 8080,
			autoStopMachines: true,
			autoStartMachines: true,
			minMachinesRunning: 0,
			concurrency: {
				type: "requests",
				softLimit: 100,
				hardLimit: 200,
			},
		});

		// Create an app within the organization
		const myApp = myOrg.createApp("my-app", {
			name: "my-awesome-app",
			region: "ord",
			httpService: httpService,
		});

		 // Add secrets to the app
		 myApp.addSecret("DATABASE_URL", "postgres://user:password@host:5432/database");
		 myApp.addSecret("API_KEY", "your-api-key-here");

		// Add a web-server machine
		myApp.addMachine({
			name: "web-server",
			count: 3,
			regions: ["ord", "sfo", "dfw"],
			config: {
				cpus: 1,
				memoryMB: 256,
				image: "nginx:latest",
				env: {
					NGINX_HOST: "myapp.com",
					DATABASE_URL: "{{ secrets.DATABASE_URL }}",
					API_KEY: "{{ secrets.API_KEY }}"
				},
				cmd: ["nginx", "-g", "daemon off;"],
				guest: {
					cpu_kind: "shared",
					memory_mb: 256,
				},
				restart: {
					policy: "on-failure",
					max_retries: 3,
				}
			}
		});

		// Add another machine with different configuration
		myApp.addMachine({
			name: "worker",
			count: 1,
			regions: ["ord"],
			config: {
				cpus: 2,
				memoryMB: 512,
				image: "my-worker-image:latest",
				env: {
					WORKER_QUEUE: "high-priority",
				},
				cmd: ["node", "worker.js"],
				guest: {
					cpu_kind: "performance",
					memory_mb: 512,
				}
			}
		});

		// Create another app in the same organization
		const anotherApp = myOrg.createApp("another-app", {
			name: "another-awesome-app",
			region: "sfo",
			env: {
				APP_SECRET: "shh-its-a-secret",
			},
			httpService: httpService,
		});

		// Add a machine to the second app
		anotherApp.addMachine({
			name: "api-server",
			count: 1,
			regions: ["sfo"],
			config: {
				cpus: 1,
				memoryMB: 512,
				image: "node:14",
				cmd: ["npm", "start"],
				env: {
					PORT: "3000",
				},
				guest: {
					cpu_kind: "shared",
					memory_mb: 512,
				}
			},
		});
	}
}

// Initialize the SDK and add the stack
const ace = new AceSDK({ apiToken: "your-fly-api-token" });
const project = new FlyDeployment(ace);

// Synthesize and deploy the infrastructure
project
	.synth()
	.then((infra) => project.deploy(infra))
	.catch(console.error);

