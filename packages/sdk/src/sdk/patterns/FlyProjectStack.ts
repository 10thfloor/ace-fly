import { StackConstruct } from "../core/StackConstruct";
import type { FlyStack } from "../core/FlyStack";
import { FlyIoApp, FlyIoAppConfig } from "../constructs/FlyIoApp";
import { FlyDomain } from "../constructs/FlyDomain";
import { FlyCertificate } from "../constructs/FlyCertificate";
import { FlySecret } from "../constructs/FlySecret";
import { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyFirewall, FirewallRule } from "../constructs/FlyFirewall";
import { ArcJetProtection, ArcJetProtectionConfig } from "../constructs/ArcJetProtection";
import type { FlyRegion } from "../types/FlyRegions";
import { FlyMachine } from "../constructs/FlyMachine";
import { FlyMachineType } from "../types/FlyMachineTypes";
import { FlyAutoScalingConfig } from "../constructs/FlyAutoScalingConfig";
import { FlyMachineConfig } from "../constructs/FlyMachineConfig";
import { FlyHttpServiceConcurrencyType } from "../types/FlyHttpServiceConcurrencyTypes";
import { FlyApplication } from "../constructs/FlyApplication";

export interface ProcessGroupConfig {
  name: string;
  command: string[];
  scaling: {
    minMachines: number;
    maxMachines: number;
    autoScaleStrategy?: 'cpu' | 'requests';
    targetUtilization?: number;
  };
  machineConfig: {
    cpus: number;
    memoryMB: number;
    machineType: FlyMachineType;
  };
}

export interface FlyProjectConfig {
  name: string;
  organization: string;
  primaryRegion: FlyRegion;
  additionalRegions?: FlyRegion[];
  domain: string;
  secretNames: string[];
  env?: Record<string, string>;
  processGroups: ProcessGroupConfig[]
}

export class FlyProjectStack extends StackConstruct {
  private app: FlyIoApp;
  private domain: FlyDomain;
  private certificate: FlyCertificate;
  private firewall: FlyFirewall;
  private arcjetProtection?: ArcJetProtection;
  private httpServices: Record<string, FlyHttpService> = {};
  private processGroups: Record<string, FlyMachine[]> = {};

  constructor(
    stack: FlyStack,
    id: string,
    private readonly config: FlyProjectConfig
  ) {
    super(stack, id);

    this.app = {} as FlyIoApp;
    this.domain = {} as FlyDomain;
    this.certificate = {} as FlyCertificate;
    this.firewall = {} as FlyFirewall;

    this.initializeComponents();
  }

  private initializeComponents(): void {
    this.initializeDomainAndCertificate();
    this.initializeApp();
    this.initializeFirewall();
    this.initializeSecrets();
    this.initializeProcessGroups();
  }

  private initializeDomainAndCertificate(): void {
    this.domain = new FlyDomain(this.getStack(), `${this.getId()}-domain`, {
      name: `${this.config.name}-domain`,
      domainName: this.config.domain,
    });

    this.certificate = new FlyCertificate(
      this.getStack(),
      `${this.getId()}-certificate`,
      {
        name: `${this.config.name}-certificate`,
        domains: [this.domain],
      }
    );
  }

  private initializeApp(): void {
    const appConfig: FlyIoAppConfig = {
      name: this.config.name,
      org: this.config.organization,
      regions: [this.config.primaryRegion, ...(this.config.additionalRegions || [])],
      services: {},
      env: this.config.env,
      secrets: this.config.secretNames.map(
        (name) =>
          new FlySecret(this.getStack(), `${this.getId()}-secret-${name}`, {
            key: name,
          })
      ),
      domain: this.domain,
      certificate: this.certificate,
    };

    this.app = new FlyIoApp(this.getStack(), `${this.getId()}-app`, appConfig);
  }

  private initializeFirewall(): void {
    this.firewall = new FlyFirewall(this.getStack(), this.getId(), {
      app: this.app,
    });
    this.applyDefaultFirewallRules();
  }

  private initializeSecrets(): void {
    for (const secretName of this.config.secretNames) {
      this.app.addSecret(new FlySecret(this.getStack(), `${this.getId()}-secret-${secretName}`, {
        key: secretName,
      }));
    }
  }

  private initializeProcessGroups(): void {
    this.config.processGroups.forEach((groupConfig, index) => {
      const machines = this.createMachinesForProcessGroup(groupConfig, index);
      this.processGroups[groupConfig.name] = machines;

      // Create an HTTP service for each process group
      const httpService = new FlyHttpService(
        this.getStack(),
        `${this.getId()}-${groupConfig.name}-service`,
        {
          name: `${groupConfig.name}-service`,
          internal_port: 8080, // Assuming a default port, adjust as needed
          auto_stop_machines: groupConfig.scaling.minMachines === 0,
          auto_start_machines: true,
          min_machines_running: groupConfig.scaling.minMachines,
          max_machines_running: groupConfig.scaling.maxMachines,
          regions: [this.config.primaryRegion, ...(this.config.additionalRegions || [])], // Add this line
        }
      );

      // Attach machines to the HTTP service
      machines.forEach(machine => machine.attachToHttpService(httpService));

      // Add the HTTP service to the project
      this.addHttpService(groupConfig.name, httpService);
    });
  }

  private addProcessGroup(config: ProcessGroupConfig): void {
   // TODO: implement
  }

  private createMachinesForProcessGroup(groupConfig: ProcessGroupConfig, index: number): FlyMachine[] {
    const machines: FlyMachine[] = [];

    for (let i = 0; i < groupConfig.scaling.minMachines; i++) {
      const autoScalingConfig = new FlyAutoScalingConfig(
        this.getStack(),
        `${this.getId()}-${groupConfig.name}-autoscaling-${index}-${i}`,
        {
          minMachines: groupConfig.scaling.minMachines,
          maxMachines: groupConfig.scaling.maxMachines,
          targetCPUUtilization: groupConfig.scaling.targetUtilization || 70,
          scaleToZero: groupConfig.scaling.minMachines === 0,
        }
      );

      const machineConfig = new FlyMachineConfig(
        this.getStack(),
        `${this.getId()}-${groupConfig.name}-machine-config-${index}-${i}`,
        {
          cpus: groupConfig.machineConfig.cpus,
          memoryMB: groupConfig.machineConfig.memoryMB,
          image: "your-docker-image:tag", // You'll need to set this appropriately
          cmd: groupConfig.command,
          env: this.config.env || {},
          guest: {
            cpu_kind: groupConfig.machineConfig.machineType === FlyMachineType.SHARED_CPU_1X ? "shared" : "performance",
            memory_mb: groupConfig.machineConfig.memoryMB,
          },
          volumes: [],
          internalPort: 8080, // Assuming a default port, adjust as needed
        }
      );

      const machine = new FlyMachine(
        this.getStack(),
        `${this.getId()}-${groupConfig.name}-machine-${index}-${i}`,
        {
          name: `${groupConfig.name}-machine-${index}-${i}`,
          count: 1,
          regions: [this.config.primaryRegion, ...(this.config.additionalRegions || [])],
          autoScaling: autoScalingConfig,
          machineConfig: machineConfig,
        }
      );

      machines.push(machine);
    }

    return machines;
  }

  addFirewallRule(rule: FirewallRule): void {
    this.firewall.addRule(rule);
  }

  addArcJetProtection(config: ArcJetProtectionConfig): void {
    this.arcjetProtection = new ArcJetProtection(
      this.getStack(),
      `${this.getId()}-arcjet`,
      this.app,
      config
    );
  }

  private applyDefaultFirewallRules(): void {
    this.addFirewallRule({
      action: "allow",
      protocol: "tcp",
      ports: [80, 443],
      source: "0.0.0.0/0",
      description: "Allow inbound HTTP and HTTPS traffic",
      priority: 100,
    });
  }

  addHttpService(name: string, service: FlyHttpService): void {
    this.httpServices[name] = service;
    this.app.addService(name, service);
  }

  synthesize(): Record<string, any> {
    const appConfig = this.app.getConfig();
    const synthesized: Record<string, any> = {
      type: "fly-project-stack",
      name: this.config.name,
      organization: this.config.organization,
      app: {
        name: appConfig.name,
        org: appConfig.org,
        regions: appConfig.regions,
      },
      domain: this.domain.getConfig(),
      certificate: this.certificate.getConfig(),
      secrets: this.config.secretNames.map(name => ({ key: name })),
      firewall: {
        rules: this.firewall.getConfig().rules,
      },
      arcjetProtection: this.arcjetProtection ? {
        apiKey: "PLACEHOLDER_API_KEY", // Actual key should be set during deployment
        rules: this.arcjetProtection.getConfig().rules,
      } : undefined,
      services: Object.fromEntries(
        Object.entries(this.httpServices).map(([name, service]) => [
          name,
          {
            name: service.getConfig().name,
            internal_port: service.getConfig().internal_port,
            auto_stop_machines: service.getConfig().auto_stop_machines,
            auto_start_machines: service.getConfig().auto_start_machines,
            min_machines_running: service.getConfig().min_machines_running,
            max_machines_running: service.getConfig().max_machines_running,
            concurrency: service.getConfig().concurrency,
            regions: service.getConfig().regions,
          }
        ])
      ),
      processGroups: Object.fromEntries(
        this.config.processGroups.map(group => [
          group.name,
          {
            name: group.name,
            command: group.command,
            scaling: group.scaling,
            machines: this.processGroups[group.name].map(machine => {
              const machineConfig = machine.getConfig().machineConfig || {};
              return {
                name: machine.getConfig().name,
                config: {
                  cpus: machineConfig.cpus,
                  memoryMB: machineConfig.memoryMB,
                  image: machineConfig.image,
                  cmd: machineConfig.cmd,
                  env: machineConfig.env,
                  guest: machineConfig.guest,
                  volumes: machineConfig.volumes,
                  internalPort: machineConfig.internalPort,
                },
                count: machine.getConfig().count,
                regions: machine.getConfig().regions,
                autoScaling: machine.getConfig().autoScaling,
              };
            }),
          },
        ])
      ),
      regions: {
        primary: this.config.primaryRegion,
        additional: this.config.additionalRegions || [],
      },
    };

    return synthesized;
  }

  getApplication(): FlyIoApp {
    return this.app;
  }

  protected validate(): boolean {
    // Implement validation logic
    return true;
  }

  getName(): string {
    return this.config.name || this.getId();
  }
}
