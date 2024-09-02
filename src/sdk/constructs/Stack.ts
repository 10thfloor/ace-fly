import { Construct } from './Construct.js';
import { Org, type OrgConfig } from './Org.js';  // Add this import
import type { AppConfig } from './App.js';
import type { AceSDK } from '../AceSDK.js';
import type { MachineConfig } from './Machine.js';

export abstract class ACEStack extends Construct {
  private orgs: Org[] = [];
  protected config: StackConfig = {};

  constructor(scope: AceSDK, id: string) {
    super(scope, id);
    this.id = id;
  }

  protected createOrg(id: string, props: OrgConfig): Org {
    const org = new Org(this, id, props);
    this.orgs.push(org);
    this.config[id] = { type: 'org', ...props };
    return org;
  }

  synth(): Promise<StackConfig> {
    return this.sdk.synth();
  }

  async deploy(infra: StackConfig) {
    if (infra.apps) {
      for (const app of infra.apps) {
        // Type assertion to access 'secrets' and 'machines' properties
        const extendedApp = app as AppConfig & { 
          secrets: { key: string; value: string }[];
          machines: MachineConfig[];
        };
        
        // Deploy secrets first
        for (const secret of extendedApp.secrets) {
          await this.sdk.addSecret(app.name, secret.key, secret.value);
        }

        // Deploy machines 
        for (const machine of extendedApp.machines) {
          await this.deployMachine(app.name, machine);
        }
      }
    }
  }

  // Add this new method to handle machine deployment
  private async deployMachine(appName: string, machine: MachineConfig): Promise<void> {
    // TODO: Implement machine deployment logic
    console.log(`Deploying machine for app ${appName}:`, machine);
    // Example: await this.sdk.deployMachine(appName, machine);
  }

  getConfig(): Readonly<StackConfig> {
    return Object.freeze({ ...this.config });
  }

  protected get sdk(): AceSDK {
    return this.scope as AceSDK;
  }
}

export interface StackConfig {
  apps?: (AppConfig[] & {
    secrets: { key: string; value: string }[];
    machines: MachineConfig[];
  });
  [key: string]: unknown;
}



