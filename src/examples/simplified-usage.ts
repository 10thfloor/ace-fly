import { FlySDK, type IFlySDKConfig } from "../sdk/core/FlySDK.js";
import { FlyStack } from "../sdk/core/FlyStack.js";
import { FlyOrg } from "../sdk/core/FlyOrg.js";
import { FlyDomain } from "../sdk/constructs/FlyDomain.js";
import { FlyCertificate } from "../sdk/constructs/FlyCertificate.js";
import { FlySecret } from "../sdk/constructs/FlySecret.js";
import { FlyPostgres } from "../sdk/constructs/FlyPostgres.js";
import { HttpService } from "../sdk/constructs/HttpService.js";
import { AnycastIP } from "../sdk/constructs/FlyAnycastIP.js";
import { FlyApp } from "../sdk/constructs/FlyApp.js";
import "reflect-metadata";

class FlyDeployment extends FlySDK {
  readonly stack: FlyStack

  constructor(context: IFlySDKConfig) {
    super(context);

    this.stack = new FlyStack("my-stack");
    const devOrg = new FlyOrg(this.stack, "dev-org");

    const devDomain = new FlyDomain(this.stack, "dev-domain", {
      name: "dev-domain",
      domainName: "my-app.dev.fly.dev",
    });

    const devDomainCertificate = new FlyCertificate(
      this.stack,
      "dev-certificate",
      {
        name: "my-certificate",
        domains: [devDomain],
      },
    );

    const secret = new FlySecret(this.stack, "app-secret", {
      name: "my-secret",
      key: "my-secret",
    });

    const webService = new HttpService(this.stack, "web-service", {
      name: "my-web-service",
      internal_port: 8080,
      auto_stop_machines: true,
      auto_start_machines: true,
      min_machines_running: 1,
      processes: ["web"],
      concurrency: {
        type: "connections",
        hard_limit: 25,
        soft_limit: 20,
      },
    });

    const publicWebsite = new AnycastIP(this.stack, "my-new-ip", {
      type: "v4",
      shared: true,
      proxy: webService
    });

    const devApp = new FlyApp(this.stack, "dev-app", {
      name: "my-dev-app",
      domain: devDomain,
      certificate: devDomainCertificate,
      secrets: [secret],
      env: {
        MY_SECRET: "{{ .secrets.my-secret }}",
      },
      publicServices: {
        website: publicWebsite,
      },
      privateServices: {}
    });


    // devOrg.addApp(devApp);

  }
}

const deployment = new FlyDeployment({
  apiToken: "my-api-token",
});