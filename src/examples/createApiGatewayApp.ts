import { AceSDK } from "../sdk/AceSDK.js";
import { ACEStack } from "../sdk/constructs/Stack.js";
import { HttpService } from "../sdk/constructs/HttpService.js";
import { Certificate } from "../sdk/constructs/Certificate.js";

class ApiGatewayDeployment extends ACEStack {
  constructor(scope: AceSDK) {
    super(scope, "ApiGatewayInfrastructure");

    // Create an organization
    const org = this.createOrg("my-org", {
      name: "My API Gateway Organization",
    });

    // Create an instance of HttpService
    const httpService = new HttpService(this, {
      name: "api-gateway-proxy",
      internalPort: 8080,
      forceHttps: true,
      autoStartMachines: true,
      autoStopMachines: true,
      minMachinesRunning: 1,
      concurrency: {
        type: "connections",
        softLimit: 200,
        hardLimit: 250,
      },
    });

    // Create a reusable certificate
    const certificate = new Certificate(this, "api-gateway-cert", {
      domains: ["api.example.com"],
      // acmeDnsConfigured: true,
      // acmeAlpnConfigured: true,
      // certificateAuthority: "letsencrypt",
      // dnsProvider: "cloudflare",
      // dnsValidationInstructions: "Follow the instructions in the console.",
      // dnsValidationHostname: "api.example.com",
      // dnsValidationTarget: "api.example.com",
      // source: "fly",
    });

    // Create an app within the organization with the certificate
    const app = org.createApp("api-gateway-app", {
      name: "api-gateway",
      region: "iad",
      env: {
        NODE_ENV: "production",
      },
      httpService: httpService,
      certificates: [certificate], 
    });

    // Add a machine to the application
    app.addMachine({
      name: "api-gateway-server",
      count: 1,
      regions: ["iad"],
      config: {
        cpus: 2,
        memoryMB: 2048,
        image: "my-api-gateway-image",
        env: {
          PORT: "8080",
        },
        cmd: ["npm", "start"],
      },
    });

    // Add a firewall rule to the application
    app.addFirewall({
      rules: [
        {
          action: "allow",
          protocol: "tcp",
          ports: [80, 443],
        },
      ],
    });

    // Add a secret to the application
    app.addSecret("API_KEY", "supersecretapikey");
    app.addSecret("ANOTHER_SECRET", "anothersecretvalue");
  }
}

// Initialize the SDK and add the stack
const ace = new AceSDK({ apiToken: "your-fly-api-token" });
const project = new ApiGatewayDeployment(ace);

// Synthesize and deploy the infrastructure
project
  .synth()
  .then((infra) => project.deploy(infra))
  .catch(console.error);

console.log("API Gateway application created and configured successfully.");