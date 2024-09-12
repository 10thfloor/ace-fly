var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { StackConstruct } from "../core/StackConstruct";
import { Dependency } from "../utils/DependencyDecorator";
import { FlyMachine } from "./FlyMachine";
import { FlyMachineConfig } from "./FlyMachineConfig";
import { FlyAutoScalingConfig } from "./FlyAutoScalingConfig";
export class RemixConstruct extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.machine = {};
        this.initialize();
        this.createResources();
    }
    getName() {
        return this.config.name || this.getId();
    }
    createResources() {
        const machineConfig = new FlyMachineConfig(this.stack, `${this.getId()}-machine-config`, {
            cpus: 1,
            memoryMB: 256,
            image: "flyio/remix:latest",
            cmd: ["npm", "run", "start"],
            env: {
                PORT: "{{ .internalPort }}",
                NODE_ENV: "production",
                ...this.config.env,
            },
            internalPort: 8080,
            guest: {
                cpu_kind: "hobby",
                memory_mb: 256,
            },
            volumes: [],
        });
        // this.database = new FlyPostgres(this.stack, `${this.getId()}-database`, {
        //     name: `${this.config.name}-database`,
        //     region: "iad",
        //     credentials: {
        //         username: "postgres",
        //         password: new FlySecret(this.stack, "postgres-password", {
        //             key: "postgres-password",
        //         }),
        //     },
        //     replicas: [],
        //     instanceType: "postgres-medium",
        //     storage: {
        //         size: 10240,
        //         type: "storage_performance",
        //     }
        // })
        const autoScaling = new FlyAutoScalingConfig(this.stack, `${this.getId()}-auto-scaling`, {
            minMachines: 1,
            maxMachines: 3,
            targetCPUUtilization: 70,
            scaleToZero: false,
        });
        this.machine = new FlyMachine(this.stack, `${this.getId()}-machine`, {
            name: `${this.config.name}-machine`,
            count: 1,
            regions: ["iad"], // Default to US East
            autoScaling: autoScaling,
            machineConfig: machineConfig,
            // link: [this.database],
        });
        // const proxy = new FlyProxy(this.stack, `${this.getId()}-proxy`, {
        //   name: `${this.config.name}-proxy`,
        //   machines: {
        //     web: this.machine,
        //   },
        //   ports: {
        //     8080: "{{ .web.internalPort }}",
        //   },
        //   loadBalancing: new FlyLBConfig(this.stack, `${this.getId()}-lb-config`, {
        //     strategy: "round-robin",
        //     healthCheck: {
        //       path: "/health",
        //       interval: 30,
        //       timeout: 5,
        //     },
        //   }),
        // });
        // const certificate = new FlyCertificate(this.stack, `${this.getId()}-certificate`, {
        //   name: `${this.config.name}-certificate`,
        //   domains: [this.domain],
        // });
        // const tlsConfig = new TlsConfig(this.stack, `${this.getId()}-tls-config`, {
        //     name: `${this.config.name}-tls-config`,
        //     enabled: true,
        //     certificate: certificate,
        //     privateKey: "tls-key.pem",
        //     alpn: ["http/1.1", "http/2"],
        //     versions: ["TLSv1.2", "TLSv1.3"],
        //   });
        // const anycastIp = new AnycastIP(this.stack, `${this.getId()}-anycast-ip`, {
        //   name: `${this.config.name}-anycast-ip`,
        //   proxy: proxy,
        //   tls: tlsConfig,
        //   type: "v4",
        //   shared: true,
        // });
        // this.app = new FlyApp(this.stack, `${this.getId()}-app`, {
        //   name: this.config.name || this.getId(),
        //   domain: this.domain,
        //   certificate: certificate,
        //   secrets: [],
        //   env: this.config.env || {},
        //   publicServices: {
        //     web: anycastIp,
        //   },
        //   privateServices: {},
        // });
    }
    getStack() {
        return this.stack;
    }
    synthesize() {
        return {
            type: "remix-site",
            name: this.config.name,
            machine: this.getResource(this.machine),
        };
    }
    validate() {
        // Add Remix-specific validation if needed
        return true;
    }
}
__decorate([
    Dependency(),
    __metadata("design:type", FlyMachine)
], RemixConstruct.prototype, "machine", void 0);
