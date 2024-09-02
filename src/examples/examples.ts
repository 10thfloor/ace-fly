import type { AceSDK } from "../sdk/AceSDK.js";
import { ACEStack } from "../sdk/constructs/Stack.js";
import { Org } from "../sdk/constructs/Org.js"
import { HttpService } from "../sdk/constructs/HttpService.js";

class FlyDeployment extends ACEStack {
  constructor(scope: AceSDK) {
    super(scope, "MyInfrastructure");

    // Create an organization
    const myOrg = new Org(this, "my-org", {
      name: "my-awesome-org"
    });

    // HttpService for the app
    const httpService = new HttpService(this, {
      name: "my-awesome-proxy",
      internalPort: 8080,
      forceHttps: true,
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
          DATABASE_URL: "{{ secrets.DATABASE_URL }}", // TypeScript will autocomplete this
          API_KEY: "{{ secrets.API_KEY }}", // And this
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
      },
    });

    // ... rest of the existing code ...
  }
}