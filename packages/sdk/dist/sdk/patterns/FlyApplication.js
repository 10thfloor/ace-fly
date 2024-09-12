import { StackConstruct } from "../core/StackConstruct";
import { FlyIoApp } from "../constructs/FlyIoApp";
import { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyDomain } from "../constructs/FlyDomain";
import { FlyCertificate } from "../constructs/FlyCertificate";
import { FlyFirewall } from "../constructs/FlyFirewall";
import { ArcJetProtection, } from "../constructs/ArcJetProtection";
import { DefaultConfigs } from "../config/DefaultConfigs";
export class FlyApplication extends StackConstruct {
    constructor(stack, id, config) {
        super(stack, id);
        this.config = config;
        this.httpServices = {};
        this.secrets = {};
        this.databases = {};
        this.certificate = {};
        this.domain = {};
        this.firewall = {};
        this.app = {};
        this.initializeComponents();
        this.applyDefaultFirewallRules(); // Add this line
    }
    initializeComponents() {
        this.domain = new FlyDomain(this.getStack(), `${this.getId()}-domain`, {
            name: `${this.config.name}-domain`,
            domainName: this.config.domain,
        });
        this.certificate = new FlyCertificate(this.getStack(), `${this.getId()}-certificate`, {
            name: `${this.config.name}-certificate`,
            domains: [this.domain],
        });
        this.app = new FlyIoApp(this.getStack(), `${this.getId()}-app`, {
            name: this.config.name,
            domain: this.domain,
            certificate: this.certificate,
            secrets: [],
            publicServices: {},
            privateServices: {},
            regions: this.config.regions,
            env: this.config.env || {},
        });
        this.firewall = new FlyFirewall(this.getStack(), this.getId(), {
            app: this.app,
        });
        for (const secretName of this.config.secretNames) {
            this.addSecretReference(secretName);
        }
    }
    applyDefaultFirewallRules() {
        for (const rule of DefaultConfigs.FlyFirewall.defaultRules) {
            this.firewall.addRule(rule);
        }
    }
    addHttpService(name, config) {
        const mergedConfig = {
            ...DefaultConfigs.FlyHttpService,
            ...config,
            name,
            internal_port: config.service.getInternalPort(),
            concurrency: {
                ...DefaultConfigs.FlyHttpService.concurrency,
                ...config.concurrency,
            },
        };
        const httpService = new FlyHttpService(this.getStack(), `${this.getId()}-${name}`, mergedConfig);
        this.httpServices[name] = httpService;
        this.app.addPublicService(name, httpService);
    }
    addDefaultHttpFirewallRules() {
        this.firewall.addRule({
            action: "allow",
            protocol: "tcp",
            ports: [80, 443],
            source: "0.0.0.0/0",
            description: "Allow inbound HTTP and HTTPS traffic",
            priority: 100,
        });
    }
    addDatabase(config) {
        // Implementation remains the same
    }
    addFirewallRules(rules) {
        // Implementation remains the same
    }
    addArcJetProtection(config) {
        this.arcjetProtection = new ArcJetProtection(this.getStack(), `${this.getId()}-arcjet`, this.app, config);
    }
    addSecretReference(secretName) {
        // Implementation remains the same
    }
    synthesize() {
        const synthesized = {
            app: this.app.synthesize(),
            domain: this.domain.synthesize(),
            certificate: this.certificate.synthesize(),
            httpServices: Object.fromEntries(Object.entries(this.httpServices).map(([name, service]) => [
                name,
                service.synthesize(),
            ])),
            secrets: Object.fromEntries(Object.entries(this.secrets).map(([key, secret]) => [
                key,
                secret.synthesize(),
            ])),
            databases: Object.fromEntries(Object.entries(this.databases).map(([key, db]) => [
                key,
                db.synthesize(),
            ])),
            firewall: this.firewall.synthesize(),
            arcjetProtection: this.arcjetProtection?.synthesize(),
        };
        console.log("Synthesized FlyApplication:", synthesized);
        return synthesized;
    }
    validate() {
        // Implement validation logic
        return true;
    }
    getName() {
        return this.config.name;
    }
    addFirewallRule(rule) {
        this.firewall.addRule(rule);
    }
}
