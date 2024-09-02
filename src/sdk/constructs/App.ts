import { Construct } from './Construct.js';
import type { Org } from './Org.js';
import type { MachineProps } from './Machine.js';
import type { HttpService } from './HttpService.js';

export class App extends Construct {
  private secrets: Set<string> = new Set();
  private proxy?: HttpService;

  constructor(scope: Org, id: string, config: AppConfig) {
    super(scope, id);

    if(config.httpService) {
      this.proxy = config.httpService
    }

    // Handle IP allocation
    if (config.ips) {
      console.log(`Allocating IPs: IPv4=${config.ips.allocateIpv4}, IPv6=${config.ips.allocateIpv6}`);
      // Implement IP allocation logic
    }

    // Handle certificates
    if (config.certificates) {
      for (const cert of config.certificates) {
        this.addCertificate(cert);
      }
    }

    // Handle custom domains
    if (config.customDomains) {
      console.log(`Adding custom domains: ${config.customDomains.join(', ')}`);
      // Implement custom domain logic
    }

    // Handle secrets
    if (config.secrets) {
      for (const [key, value] of Object.entries(config.secrets)) {
        this.addSecret(key, value);
      }
    }

    // Handle volumes
    // if (config.volumes) {
    //   config.volumes.forEach(volume => {
    //     console.log(`Adding volume: ${volume.name}, size: ${volume.size}`);
    //     // Implement volume creation logic
    //   });
    // }
  }

  addMachine(config: MachineProps) {
    console.log(`Adding machine to app: ${JSON.stringify(config)}`);
    // Existing implementation...
  }

  addFirewall(config: FirewallConfig) {
    console.log(`Adding firewall rules to app: ${JSON.stringify(config)}`);
    // Implementation to add firewall rules
    // You'll need to integrate with Fly.io's API here
  }

  addCertificate(config: CertificateConfig) {
    console.log(`Adding certificate for domains: ${config.domains.join(', ')}`);
    // Implementation to add SSL/TLS certificate
    // You'll need to integrate with Fly.io's API here
  }

  addSecret(key: string, value: string) {
    console.log(`Adding secret to app: ${key} = ${value}`);
    this.secrets.add(key);
    // Implementation to add secret
  }

  listSecrets(): string[] {
    return Array.from(this.secrets);
  }

  removeSecret(key: string) {
    this.secrets.delete(key);
    console.log(`Removing secret from app: ${key}`);
    // Implementation to remove secret
  }
}

export interface AppConfig {
  name: string;
  region: string;
  ips?: {
    allocateIpv4?: boolean;
    allocateIpv6?: boolean;
  };
  certificates?: CertificateConfig[];
  customDomains?: string[];
  secrets?: Record<string, string>;
  volumes?: Array<{
    name: string;
    size: string;
  }>;
  services?: unknown;
  httpService?: HttpService;
  env?: Record<string, string> | Record<string, SecretReference<string>>;
  auto_start_machines?: boolean;
  auto_stop_machines?: boolean;
  min_machines_running?: number;
  concurrency?: {
    type: "connections" | "requests";
    soft_limit: number;
    hard_limit: number;
  };
}

// This is the service config for a machine
// It is used to define the ports, protocol, and internal port for a machine
// eg to expose a webserver on port 80, you would use the following config:
// {
//   ports: [{ port: 80, handlers: ["http"] }],
//   protocol: "tcp",
//   internal_port: 8080
// }

export interface ServiceConfig {
  ports: PortConfig[];
  protocol: string;
  internal_port: number;
}

// This is the port config for a service
// It is used to define the port, handlers, and protocol for a service
// eg to expose a webserver on port 80, you would use the following config:
// {
//   port: 80,
//   handlers: ["http"]
// }
// The handlers are the protocols that the port will be exposed on
// eg ["http"] means the port will be exposed on http
// ["http", "https"] means the port will be exposed on http and https
export interface PortConfig {
  port: number;
  handlers: Array<"http" | "https" | "tls" | "http2">;
}

// New type for secret references
export type SecretReference<T extends string> = `{{ secrets.${T} }}`;

export interface FirewallConfig {
  rules: {
    action: string;
    protocol: string;
    ports: number[];
  }[];
}

export interface CertificateConfig {
  domains: string[];
}