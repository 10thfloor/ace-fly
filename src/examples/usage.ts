import { FlySDK, type IFlySDKConfig } from "../sdk/core/FlySDK.js";
import { FlyStack } from "../sdk/core/FlyStack.js";
import { FlyOrg } from "../sdk/core/FlyOrg.js";
import { Domain } from "../sdk/constructs/Domain.js";
import { Certificate } from "../sdk/constructs/Certificate.js";
import { FlySecret } from "../sdk/constructs/FlySecret.js";
import { FlyVolume } from "../sdk/constructs/FlyVolume.js";
import { FlyPostgres } from "../sdk/constructs/FlyPostgres.js";
import { FlyPostgresReplica } from "../sdk/constructs/FlyPostgresReplica.js";
import { AutoScalingConfig } from "../sdk/constructs/AutoScalingConfig.js";
import { TlsConfig } from "../sdk/constructs/TlsConfig.js";
import { LBConfig } from "../sdk/constructs/LBConfig.js";
import { FlyMachine } from "../sdk/constructs/FlyMachine.js";
import { FlyMachineConfig } from "../sdk/constructs/FlyMachineConfig.js";
import { FlyProxy } from "../sdk/constructs/FlyProxy.js";
import { AnycastIP } from "../sdk/constructs/AnycastIP.js";
import { FlyApp } from "../sdk/constructs/FlyApp.js";
import "reflect-metadata";

class FlyDeployment extends FlySDK {
  readonly stack: FlyStack;

  constructor(context: IFlySDKConfig) {
    super(context);

    this.stack = new FlyStack("my-stack");

    const devDomain = Domain.create(this.stack, "dev-domain", {
      name: "dev-domain",
      domainName: "my-app.dev.fly.dev",
    });

    const devDomainCertificate = Certificate.create(
      this.stack,
      "dev-certificate",
      {
        name: "my-certificate",
        domains: [devDomain],
      },
    );

    const secret = FlySecret.create(this.stack, "app-secret", {
      name: "my-secret",
      key: "my-secret",
    });

    const dbPassword = FlySecret.create(this.stack, "db-password", {
      name: "db-password",
      key: "password",
    });

    const webVolume = FlyVolume.create(this.stack, "web-volume", {
      name: "web-volume",
      size: "100GB",
    });

    const apiVolume = FlyVolume.create(this.stack, "api-volume", {
      name: "api-volume",
      size: "100GB",
    });

    const apiAutoScaling = new AutoScalingConfig(
      this.stack,
      "api-auto-scaling",
      {
        minMachines: 1,
        maxMachines: 5,
        targetCPUUtilization: 70,
        scaleToZero: true,
      },
    );

    const webAutoScaling = new AutoScalingConfig(
      this.stack,
      "web-auto-scaling",
      {
        minMachines: 1,
        maxMachines: 5,
        targetCPUUtilization: 70,
        scaleToZero: true,
      },
    );

    const APIdatabase = new FlyPostgres(this.stack, "api-database", {
      name: "my-database",
      region: "sfo",
      credentials: {
        username: "dbuser",
        password: dbPassword,
      },
      replicas: [
        new FlyPostgresReplica(this.stack, "api-database-replica", {
          name: "my-database-replica",
          region: "fra",
          instanceType: "db.t3.micro",
          storage: {
            size: 20,
            type: "gp2",
          },
        }),
      ],
      instanceType: "db.t3.micro",
      storage: {
        size: 20,
        type: "gp2",
      },
    });

    const apiMachine = new FlyMachine(this.stack, "api-server", {
      name: "my-api-server",
      count: 1,
      regions: ["sfo"],
      autoScaling: apiAutoScaling,
      link: [APIdatabase],
      machineConfig: new FlyMachineConfig(this.stack, "api-server-config", {
        cpus: 1,
        memoryMB: 512,
        image: "node:14",
        cmd: ["npm", "start"],
        env: {
          PORT: "{{ .internalPort }}",
          NODE_ENV: "production",
          APP_SECRET: "{{ app.env.MY_SECRET }}",
        },
        guest: {
          cpu_kind: "shared",
          memory_mb: 512,
        },
        volumes: [apiVolume],
        internalPort: 3000,
      }),
    });

    const webMachine = new FlyMachine(this.stack, "web-server", {
      name: "my-web-server",
      count: 1,
      regions: ["sfo"],
      autoScaling: webAutoScaling,
      machineConfig: new FlyMachineConfig(this.stack, "web-server-config", {
        cpus: 1,
        memoryMB: 512,
        image: "nginx:latest",
        cmd: ["nginx", "-g", "daemon off;"],
        env: {
          PORT: "{{ .internalPort }}",
        },
        guest: {
          cpu_kind: "shared",
          memory_mb: 512,
        },
        volumes: [webVolume],
        internalPort: 8080,
      }),
    });

    const tlsConfig = new TlsConfig(this.stack, "tls-config", {
      enabled: true,
      certificate: "path/to/cert.pem",
      privateKey: "path/to/key.pem",
      alpn: ["h2", "http/1.1"],
      versions: ["TLSv1.2", "TLSv1.3"],
    });

    const loadBalancingConfig = new LBConfig(
      this.stack,
      "load-balancing-config",
      {
        strategy: "round-robin",
        healthCheck: {
          path: "/health",
          interval: 30,
          timeout: 5,
        },
      },
    );

    const apiProxy = new FlyProxy(this.stack, "api-proxy", {
      name: "api-proxy",
      machines: {
        api: apiMachine,
      },
      ports: {
        3000: "{{ .api.internalPort }}",
      },
      loadBalancing: loadBalancingConfig,
    });

    const webProxy = new FlyProxy(this.stack, "web-proxy", {
      name: "web-proxy",
      machines: {
        web: webMachine,
      },
      ports: {
        80: "{{ .web.internalPort }}",
        443: "{{ .web.internalPort }}",
      },
      loadBalancing: loadBalancingConfig,
    });

    const publicWebsite = AnycastIP.create(this.stack, "my-new-ip", {
      type: "v4",
      shared: true,
      proxy: webProxy,
      tls: tlsConfig,
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
      privateServices: {
        api: apiProxy,
      },
    });
  }
}

const deployment = new FlyDeployment({
  apiToken: "my-api-token",
});

// This will now throw an error if the stack is invalid
console.log(JSON.stringify(deployment.stack.synthesize(), null, 2));
