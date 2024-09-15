import { flyctlExecute } from "../utils/flyctl";
import { Logger } from "../utils/logger";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { CleanupManager } from "../utils/cleanup";

const execAsync = promisify(exec);

interface AppProps {
  name: string;
  region: string[];
  envVars?: { [key: string]: string };
  environment?: "development" | "staging" | "production";
  cleanupManager?: CleanupManager;
}

interface ScalingPolicy {
  metric: string;
  threshold: number;
  adjustment: number;
}

export class App {
  name: string;
  regions: string[];
  envVars: { [key: string]: string };
  logger: Logger;
  environment: "development" | "staging" | "production";
  private createdResources: string[] = [];
  private cleanupManager?: CleanupManager;

  constructor(props: AppProps) {
    this.name = props.name;
    this.regions = props.region;
    this.envVars = props.envVars || {};
    this.logger = new Logger();
    this.environment = props.environment || "development";
    this.cleanupManager = props.cleanupManager;
  }

  async create() {
    if (this.regions.length === 0) {
      throw new Error(`No regions specified for app ${this.name}`);
    }

    const primaryRegion = this.regions[0];
    this.logger.info(`Creating app ${this.name} in primary region: ${primaryRegion}`);
    const launchCommand = `flyctl launch --name ${this.name} --region ${primaryRegion} --no-deploy --yes --auto-confirm`;

    try {
      const { stdout } = await flyctlExecute(launchCommand);
      this.logger.success(`App ${this.name} created successfully in ${primaryRegion}.`);
      this.createdResources.push(`app:${this.name}`);

      // Extract the actual app name from the 'Created app' line
      const createdAppRegex = /Created app '([^']+)' in organization/i;
      const match = stdout.match(createdAppRegex);

      if (match?.[1]) {
        const actualName = match[1];
        if (actualName !== this.name) {
          this.logger.info(`Updated app name to ${actualName}`);
          this.name = actualName;
        }
      } else {
        this.logger.warn("Created app name not found in launch output. Using the original app name.");
      }

      // Deploy initial machine to ensure fly.toml is generated
      await this.deployInitialMachine();

      // Add additional regions if any
      for (let i = 1; i < this.regions.length; i++) {
        const region = this.regions[i];
        await this.addRegion(region);
      }
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        this.logger.info(`App ${this.name} already exists. Retrieving actual app name.`);
        await this.retrieveActualAppName();
      } else {
        this.logger.error(`Failed to create app ${this.name}: ${error.message}`);
        throw error;
      }
    }
  }

  private async deployInitialMachine() {
    this.logger.info(`Deploying initial machine for app ${this.name}`);
    const deployCommand = `flyctl deploy --app ${this.name}`;
    try {
      await flyctlExecute(deployCommand);
      this.logger.success(`Initial machine deployed successfully for app ${this.name}.`);
      this.createdResources.push(`deploy:${this.name}`);
      this.cleanupManager?.registerResource(this.getCreatedResources());
    } catch (error: any) {
      this.logger.error(`Failed to deploy initial machine for app ${this.name}: ${error.message}`);
      throw error;
    }
  }

  private async retrieveActualAppName() {
    try {
      const infoCommand = `flyctl info --json --app ${this.name}`;
      const { stdout } = await flyctlExecute(infoCommand);
      const appInfo = JSON.parse(stdout);
      if (appInfo.Hostname) {
        const actualName = appInfo.Hostname.split('.fly.dev')[0];
        if (actualName !== this.name) {
          this.logger.info(`Actual app name retrieved: ${actualName}`);
          this.name = actualName;
        }
      } else {
        this.logger.warn("Hostname not found in app info. Using the original app name.");
      }
    } catch (err: any) {
      this.logger.error(`Failed to retrieve actual app name for ${this.name}: ${err.message}`);
      throw err;
    }
  }

  async deploy() {
    this.logger.info(
      `Deploying ${this.environment} app ${this.name} to regions: ${this.regions.join(", ")}`
    );
    const command = `flyctl deploy --app ${this.name}-${this.environment} --env ${JSON.stringify(this.envVars)}`;
    await flyctlExecute(command);
    this.logger.success(`${this.environment} app ${this.name} deployed successfully.`);
    this.createdResources.push(`deploy:${this.name}-${this.environment}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async scale(machines: number, region?: string) {
    this.logger.info(`Scaling app ${this.name} to ${machines} machine(s)${region ? ` in region ${region}` : ''}.`);
    const regionFlag = region ? ` --region ${region}` : '';
    const command = `flyctl scale count ${machines} --app ${this.name}${regionFlag}`;
    await flyctlExecute(command);
    this.logger.success(`App ${this.name} scaled to ${machines} machine(s)${region ? ` in region ${region}` : ''}.`);
    this.createdResources.push(`scale:${this.name}${region ? `:${region}` : ''}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async setEnv(key: string, value: string) {
    this.envVars[key] = value;
    this.logger.info(`Setting environment variable ${key}=${value} for app ${this.name}.`);
    const command = `flyctl secrets set ${key}=${value} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Environment variable ${key} set successfully.`);
    this.createdResources.push(`env:${key}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async addRegion(region: string) {
    this.logger.info(`Adding region ${region} to app ${this.name}.`);
    const machines = 1; // Define the number of machines per additional region
    const command = `flyctl scale count ${machines} --app ${this.name} --region ${region}`;
    try {
      await flyctlExecute(command);
      this.regions.push(region);
      this.logger.success(`Region ${region} added successfully.`);
      this.createdResources.push(`region:${region}`);
      this.cleanupManager?.registerResource(this.getCreatedResources());
    } catch (error: any) {
      this.logger.error(`Failed to add region ${region} to app ${this.name}: ${error.message}`);
      throw error;
    }
  }

  async removeRegion(region: string) {
    this.logger.info(`Removing region ${region} from app ${this.name}.`);
    // Scale down to 0 machines before removing the region
    await this.scale(0, region);
    this.logger.info(`Region ${region} scaled down to 0 machines.`);
    this.regions = this.regions.filter((r) => r !== region);
    this.logger.success(`Region ${region} removed successfully.`);
  }

  async addCustomDomain(domain: string) {
    this.logger.info(`Adding custom domain ${domain} to app ${this.name}`);
    // Check if the domain already exists
    const checkCommand = `flyctl domains list --app ${this.name}`;
    const { stdout } = await execAsync(checkCommand);
    if (stdout.includes(domain)) {
      this.logger.info(`Custom domain ${domain} already exists.`);
      return;
    }
    const command = `flyctl domains create ${domain} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Custom domain ${domain} added successfully.`);
    this.createdResources.push(`domain:${domain}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());

    // Update the app name to the custom domain
    this.logger.info(`Updating app name to custom domain: ${domain}`);
    this.name = domain;
  }

  async removeCustomDomain(domain: string) {
    this.logger.info(`Removing custom domain ${domain} from app ${this.name}`);
    const command = `flyctl domains remove ${domain} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Custom domain ${domain} removed successfully.`);
    this.cleanupManager?.registerResource([`custom-domain:${domain}`]);
  }

  async addSecret(key: string, value: string) {
    this.logger.info(`Adding secret ${key} to app ${this.name}`);
    const command = `flyctl secrets set ${key}=${value} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Secret ${key} added successfully.`);
    this.createdResources.push(`secret:${key}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async removeSecret(key: string) {
    this.logger.info(`Removing secret ${key} from app ${this.name}`);
    const command = `flyctl secrets unset ${key} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Secret ${key} removed successfully.`);
  }

  async listSecrets() {
    this.logger.info(`Listing secrets for app ${this.name}`);
    const command = `flyctl secrets list --app ${this.name}`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  }

  async setScalingPolicy(policy: ScalingPolicy) {
    this.logger.info(
      `Setting scaling policy for app ${this.name}: ${JSON.stringify(policy)}`
    );
    const command = `flyctl scale autoscale --app ${this.name} --target CPU=${policy.threshold}`;
    await flyctlExecute(command);
    this.logger.success(`Scaling policy set: ${JSON.stringify(policy)}`);
    this.createdResources.push(`scalingPolicy:${JSON.stringify(policy)}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async removeScalingPolicy() {
    this.logger.info(`Removing scaling policy from app ${this.name}`);
    const command = `flyctl scale autoscale remove --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Scaling policy removed: ${this.name}`);
  }

  async addRoutingRule(sourceRegion: string, targetRegion: string) {
    this.logger.info(
      `Adding routing rule from ${sourceRegion} to ${targetRegion} for app ${this.name}`
    );
    const command = `flyctl regions route add ${sourceRegion} ${targetRegion} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(
      `Routing rule added: ${sourceRegion} -> ${targetRegion}`
    );
    this.createdResources.push(`routingRule:${sourceRegion}-${targetRegion}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async removeRoutingRule(sourceRegion: string, targetRegion: string) {
    this.logger.info(
      `Removing routing rule from ${sourceRegion} to ${targetRegion} for app ${this.name}`
    );
    const command = `flyctl regions route remove ${sourceRegion} ${targetRegion} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(
      `Routing rule removed: ${sourceRegion} -> ${targetRegion}`
    );
    this.createdResources.push(`routingRule:${sourceRegion}-${targetRegion}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async addVolume(volumeName: string, size: string) {
    this.logger.info(`Adding volume ${volumeName} to app ${this.name}`);
    const checkCommand = `flyctl volumes list --app ${this.name}`;
    const { stdout } = await execAsync(checkCommand);
    if (stdout.includes(volumeName)) {
      this.logger.info(`Volume ${volumeName} already exists.`);
      return;
    }
    const command = `flyctl volumes create ${volumeName} --size ${size} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Volume ${volumeName} added successfully.`);
    this.createdResources.push(`volume:${volumeName}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async attachVolume(volumeName: string, mountPath: string) {
    this.logger.info(
      `Attaching volume ${volumeName} to path ${mountPath} for app ${this.name}`
    );
    const command = `flyctl volumes attach ${volumeName} --mount-path ${mountPath} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Volume ${volumeName} attached to ${mountPath} successfully.`);
    this.createdResources.push(`attachVolume:${volumeName}:${mountPath}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  getCreatedResources(): string[] {
    return this.createdResources;
  }
}
