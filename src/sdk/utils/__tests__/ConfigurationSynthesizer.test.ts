import { ConfigurationSynthesizer } from "../ConfigurationSynthesizer";
import { FlyStack } from "../../core/FlyStack";
import { AnycastIP } from "../../constructs/AnycastIP";
import { FlyProxy } from "../../constructs/FlyProxy";
import { TlsConfig } from "../../constructs/TlsConfig";
import { ResourceReference } from "../ResourceReference";
import { LBConfig } from "../../constructs/LBConfig";
import { FlyMachineConfig } from "../../constructs/FlyMachineConfig";
import { FlyMachine } from "../../constructs/FlyMachine";
import { AutoScalingConfig } from "../../constructs/AutoScalingConfig";

// @ts-expect-error: bun:test is not install it's local via `bun test` command
// This is just here to make the type errors go away.
import { expect, describe, it, beforeEach } from "bun:test";

describe("ConfigurationSynthesizer", () => {
  let stack: FlyStack;
  let synthesizer: ConfigurationSynthesizer;

  beforeEach(() => {
    stack = new FlyStack("test-stack");
    synthesizer = new ConfigurationSynthesizer();
  });

  it("should synthesize a simple resource", () => {
    // Create an AutoScalingConfig
    const autoScalingConfig = new AutoScalingConfig(stack, "auto-scaling", {
      minMachines: 1,
      maxMachines: 5,
      targetCPUUtilization: 70,
      scaleToZero: true,
    });

    // Create a LBConfig
    const lbConfig = new LBConfig(stack, "lb-config", {
      strategy: "round_robin",
      healthCheck: {
        path: "/health",
        interval: 30,
        timeout: 5,
      },
    });

    // Create a FlyMachineConfig
    const machineConfig = new FlyMachineConfig(stack, "machine-config", {
      cpus: 1,
      memoryMB: 256,
      image: "nginx:latest",
      env: {
        PORT: "8080",
      },
      cmd: ["nginx", "-g", "daemon off;"],
      guest: {
        cpu_kind: "shared",
        memory_mb: 256,
      },
      volumes: [],
      internalPort: 8080,
    });

    // Create a FlyMachine
    const machine = new FlyMachine(stack, "machine", {
      name: "test-machine",
      count: 1,
      regions: ["sfo"],
      autoScaling: new ResourceReference(autoScalingConfig),
      machineConfig: new ResourceReference(machineConfig),
    });

    // Create a FlyProxy
    const proxy = new FlyProxy(stack, "proxy", {
      machines: {
        "test-machine": new ResourceReference(machine),
      },
      ports: {
        80: "{{ .internalPort }}",
        443: "{{ .internalPort }}",
      },
      loadBalancing: new ResourceReference(lbConfig),
    });

    // Create a TlsConfig
    const tls = new TlsConfig(stack, "tls-config", {
      enabled: true,
      certificate: "cert-id",
      privateKey: "key-id",
      alpn: ["h2", "http/1.1"],
      versions: ["TLSv1.2", "TLSv1.3"],
    });

    // Create the AnycastIP resource
    const anycastIP = new AnycastIP(stack, "anycast-ip", {
      type: "v4",
      shared: true,
      proxy: new ResourceReference(proxy),
      tls: new ResourceReference(tls),
    });

    // Synthesize the configuration
    const config = synthesizer.synthesize(stack);

    // Assertions
    expect(config).toEqual({
      app: "test-stack",
      resources: {
        "auto-scaling": {
          type: "auto-scaling-config",
          name: "auto-scaling",
          minMachines: 1,
          maxMachines: 5,
          targetCPUUtilization: 70,
          scaleToZero: true,
        },
        "lb-config": {
          type: "lb-config",
          name: "lb-config",
          strategy: "round_robin",
          healthCheck: {
            path: "/health",
            interval: 30,
            timeout: 5,
          },
        },
        "machine-config": {
          type: "machine-config",
          name: "machine-config",
          cpus: 1,
          memoryMB: 256,
          image: "nginx:latest",
          env: {
            PORT: "8080",
          },
          cmd: ["nginx", "-g", "daemon off;"],
          guest: {
            cpu_kind: "shared",
            memory_mb: 256,
          },
          volumes: [],
          internalPort: 8080,
        },
        machine: {
          type: "machine",
          name: "test-machine",
          count: 1,
          regions: ["sfo"],
          autoScaling: "auto-scaling",
          machineConfig: "machine-config",
          link: [],
        },
        proxy: {
          type: "proxy",
          name: "proxy",
          machines: {
            "test-machine": "machine",
          },
          ports: {
            80: "{{ .internalPort }}",
            443: "{{ .internalPort }}",
          },
          loadBalancing: "lb-config",
        },
        "tls-config": {
          type: "tls-config",
          name: "tls-config",
          enabled: true,
          certificate: "cert-id",
          alpn: ["h2", "http/1.1"],
          versions: ["TLSv1.2", "TLSv1.3"],
          privateKey: "key-id",
        },
        "anycast-ip": {
          type: "anycast-ip",
          name: "anycast-ip",
          ipType: "v4",
          shared: true,
          proxy: "proxy",
          tls: "tls-config",
        },
      },
    });

    // Additional specific assertions
    expect(config.resources["anycast-ip"].proxy).toBe("proxy");
    expect(config.resources["anycast-ip"].tls).toBe("tls-config");
    expect(config.resources["proxy"].loadBalancing).toBe("lb-config");
    expect(config.resources["proxy"].machines["test-machine"]).toBe("machine");
  });

  it("should handle nested resources correctly", () => {
    // TODO
  });

  it("should handle arrays of resources correctly", () => {
    // TODO
  });

  it("should synthesize a complex FlyApp resource", () => {
    // TODO
  });

  it("should handle empty configurations", () => {
    // TODO
  });

  it("should handle resources with no dependencies", () => {
    // TODO
  });
});
