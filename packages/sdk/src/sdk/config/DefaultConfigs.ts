import type { IFlyHttpServiceProps } from "../constructs/FlyHttpService";
import type { FirewallRule } from "../constructs/FlyFirewall";
import type { IFlyAutoScalingConfig } from "../constructs/FlyAutoScalingConfig";
import { FlyHttpServiceConcurrencyType } from "../types/FlyHttpServiceConcurrencyTypes";
import { FlyMachineType } from "../types/FlyMachineTypes";
import type { RemixSiteConfig } from "../patterns/RemixSite";

export const DefaultConfigs = {
  FlyHttpService: {
    force_https: true,
    auto_start_machines: true,
    auto_stop_machines: false,
    min_machines_running: 1,
    max_machines_running: 1,
    concurrency: {
      type: FlyHttpServiceConcurrencyType.CONNECTIONS,
      soft_limit: 25,
      hard_limit: 30,
    },
  } satisfies Partial<IFlyHttpServiceProps>,

  FlyFirewall: {
    defaultRules: [
      {
        action: "allow",
        protocol: "tcp",
        ports: [80, 443],
        source: "0.0.0.0/0",
        description: "Allow inbound HTTP and HTTPS traffic",
        priority: 100,
      },
      {
        action: "deny",
        protocol: "tcp",
        ports: "1-65535",
        source: "0.0.0.0/0",
        destination: "0.0.0.0/0",
        description: "Default deny all other traffic",
        priority: 2000,
      },
    ] satisfies FirewallRule[],
  },
  FlyAutoScalingConfig: {
    minMachines: 1,
    maxMachines: 1,
    scaleToZero: false,
    targetCPUUtilization: 70,
  } satisfies IFlyAutoScalingConfig,

  RemixSite: {
    sourceDir: "app",
    buildCommand: "npm run build",
    startCommand: "npm run start",
    nodeVersion: "18",
    port: 3000,
    scaling: {
      minMachines: 1,
      maxMachines: 1,
      autoScaleStrategy: 'cpu' as const,
      targetUtilization: 70,
    },
    machineConfig: {
      cpus: 1,
      memoryMB: 256,
      machineType: FlyMachineType.SHARED_CPU_1X,
    },
  },
};