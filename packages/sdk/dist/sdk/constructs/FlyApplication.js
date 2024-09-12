import { StackConstruct } from "../core/StackConstruct";
import { FlyIoApp } from "./FlyIoApp";
import { FlyHttpService } from "./FlyHttpService";
import { FlyDomain } from "./FlyDomain";
import { FlySecret } from "./FlySecret";
import { FlyCertificate } from "./FlyCertificate";
export class FlyApplication extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.httpServices = {};
        this.secrets = {};
        this.env = {};
        this.domain = new FlyDomain(stack, `${id}-domain`, {
            name: `${config.name}-domain`,
            domainName: config.domain,
        });
        this.certificate = new FlyCertificate(stack, `${id}-certificate`, {
            name: `${config.name}-certificate`,
            domains: [this.domain],
        });
        this.app = new FlyIoApp(stack, `${id}-app`, {
            name: config.name,
            domain: this.domain,
            certificate: this.certificate,
            regions: config.regions,
            secrets: [],
            env: config.env || {},
            publicServices: {},
            privateServices: {},
        });
        this.secretNames = config.secretNames;
        // Initialize secrets (now just references, not values)
        for (const secretName of this.secretNames) {
            this.addSecretReference(secretName);
        }
        this.env = config.env || {};
        this.initialize();
    }
    setScalingConfig(config) {
        this.scalingConfig = config;
        // TODO: Apply scaling config to the underlying FlyApp or machines
    }
    addHttpService(name, config) {
        const httpService = new FlyHttpService(this.getStack(), `${this.getId()}-${name}`, {
            name: name,
            internal_port: config.service.getInternalPort(),
            force_https: config.force_https ?? true,
            auto_start_machines: config.auto_start_machines ?? true,
            auto_stop_machines: config.scaling?.scaleToZero ?? false,
            min_machines_running: config.scaling?.minMachines ?? 1,
            max_machines_running: config.scaling?.maxMachines ?? 1,
            processes: ["web"],
            concurrency: config.concurrency,
        });
        this.httpServices[name] = httpService;
        this.app.addPublicService(name, httpService);
    }
    addSecretReference(secretName) {
        const secret = new FlySecret(this.getStack(), `${this.getId()}-secret-${secretName}`, {
            name: secretName,
            key: secretName, // Add this line to satisfy the IFlySecretConfig interface
        });
        this.secrets[secretName] = secret;
        this.app.addSecret(secret);
    }
    getSecretReference(name) {
        return this.secrets[name];
    }
    addEnv(key, value) {
        this.env[key] = value;
    }
    getEnv() {
        return { ...this.env };
    }
    synthesize() {
        return {
            type: "fly-application",
            app: this.app.synthesize(),
            domain: this.domain.synthesize(),
            certificate: this.certificate.synthesize(),
            scalingConfig: this.scalingConfig,
            httpServices: Object.fromEntries(Object.entries(this.httpServices).map(([name, service]) => [name, service.synthesize()])),
            secrets: Object.fromEntries(Object.entries(this.secrets).map(([key, secret]) => [key, secret.synthesize()])),
            env: this.env,
        };
    }
    validate() {
        // Add validation logic
        return true;
    }
    getName() {
        return this.app.getId(); // Use getId() instead of getName()
    }
}
