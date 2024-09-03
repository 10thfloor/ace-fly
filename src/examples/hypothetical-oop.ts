import { FlySDK, type IFlySDKConfig } from "../sdk/constructsV3/FlySDK.js";
import { FlyStack } from "../sdk/constructsV3/FlyStack.js";
import { FlyOrg } from "../sdk/constructsV3/FlyOrg.js";
import { FlyDomain } from "../sdk/constructsV3/FlyDomain.js";
import { FlyCertificate } from "../sdk/constructsV3/FlyCertificate.js";
import { FlySecret } from "../sdk/constructsV3/FlySecret.js";
import { FlyVolume } from "../sdk/constructsV3/FlyVolume.js";
import { FlyPostgres } from "../sdk/constructsV3/FlyPostgres.js";
import { FlyPostgresReplica } from "../sdk/constructsV3/FlyPostgresReplica.js";
import { AutoScalingConfig } from "../sdk/constructsV3/AutoScalingConfig.js";
import { TlsConfig } from "../sdk/constructsV3/TlsConfig.js";
import { LBConfig } from "../sdk/constructsV3/LBConfig.js";
import { FlyMachine } from "../sdk/constructsV3/FlyMachine.js";
import { FlyMachineConfig } from "../sdk/constructsV3/FlyMachineConfig.js";
import { FlyProxy } from "../sdk/constructsV3/FlyProxy.js";
import { AnycastIP } from "../sdk/constructsV3/AnycastIP.js";
import { FlyApp } from "../sdk/constructsV3/FlyApp.js";


class FlyDeplyment extends FlySDK {
	constructor(context: IFlySDKConfig) {
		super("MyInfrastructure", context);

		const Stack = new FlyStack(this, "my-stack");

		const DevEnvironemnt = new FlyOrg(Stack, "dev");

		const devDomain = new FlyDomain(Stack, "my-domain", {
			domainName: "my-app.dev.fly.dev",
		});

		const devDomainCertificate = new FlyCertificate(Stack, "my-certificate", {
			name: "my-certificate",
			domains: devDomain.domainName,
		});

		const secret = new FlySecret(Stack, "my-secret", {
			key: "my-secret",
		});

		const dbPassword = new FlySecret(Stack, "db-password", {
			key: "password",
		});

		const webVolume = new FlyVolume(Stack, "my-volume", {
			name: "web-volume",
			size: "100GB",
		});

		const apiVolume = new FlyVolume(Stack, "my-volume", {
			name: "api-volume",
			size: "100GB",
		});

		const apiAutoScaling = new AutoScalingConfig(Stack, {
			minMachines: 1,
			maxMachines: 5,
			targetCPUUtilization: 70,
			scaleToZero: true, 
		});

		const webAutoScaling = new AutoScalingConfig(Stack, {
			minMachines: 1,
			maxMachines: 5,
			targetCPUUtilization: 70,
			scaleToZero: true, 
		});

		const APIdatabase = new FlyPostgres(Stack, {
			name: "my-database",
			region: "sfo",
			credentials: {
				username: "dbuser",
				password: dbPassword,
			},
			replicas: [
				new FlyPostgresReplica(Stack, {
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

		const apiMachine = new FlyMachine(Stack, {
			name: "api-server",
			count: 1,
			regions: ["sfo"],
			autoScaling: apiAutoScaling,
			link: [APIdatabase],
			machineConfig: new FlyMachineConfig(Stack, {
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

		const webMachine = new FlyMachine(Stack, {
			name: "web-server",
			count: 1,
			regions: ["sfo"],
			autoScaling: webAutoScaling,
			machineConfig: new FlyMachineConfig(Stack, {
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

		const tlsConfig = new TlsConfig(Stack, {
			enabled: true,
			certificate: "path/to/cert.pem",
			privateKey: "path/to/key.pem",
			alpn: ["h2", "http/1.1"],
			versions: ["TLSv1.2", "TLSv1.3"],
		});

        const loadBalancingConfig = new LBConfig(Stack, {
            strategy: "round-robin", 
            healthCheck: {
                path: "/health",
                interval: 30,
                timeout: 5,
            },
        });

		const apiProxy = new FlyProxy(Stack, {
			name: "api-proxy",
			machines: {
				api: apiMachine,
			},
			ports: {
				3000: "{{ .api.internalPort }}",
			},
			loadBalancing: loadBalancingConfig,
		});

		const webProxy = new FlyProxy(Stack, {
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

		const publicWebsite = new AnycastIP(Stack, {
			type: "v4",
			shared: true,
			proxy: webProxy,
			tls: tlsConfig,
		});

		const devApp = new FlyApp(Stack, {
			name: "my-dev-app",
			domain: devDomain.domainName,
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

		DevEnvironemnt.deploy(devApp);

	}
}
