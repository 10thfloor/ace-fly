import { flyctlExecute } from "../utils/flyctl";
import { Logger } from "../utils/logger";
import { exec, spawn } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

interface AppProps {
  name: string;
  region: string[];
  envVars?: { [key: string]: string };
  environment?: "development" | "staging" | "production";
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

  constructor(props: AppProps) {
    this.name = props.name;
    this.regions = props.region;
    this.envVars = props.envVars || {};
    this.logger = new Logger();
    this.environment = props.environment || "development";
  }

  async deploy() {
    this.logger.info(
      `Deploying ${this.environment} app ${
        this.name
      } to regions: ${this.regions.join(", ")}`
    );
    const command = `flyctl deploy --app ${this.name}-${
      this.environment
    } --regions ${this.regions.join(", ")} --env ${JSON.stringify(
      this.envVars
    )}`;
    await flyctlExecute(command);
    this.logger.success(
      `${this.environment} app ${this.name} deployed successfully.`
    );
  }

  async scale(machines: number) {
    this.logger.info(`Scaling app ${this.name} to ${machines} machines.`);
    const command = `flyctl scale count ${machines} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`App ${this.name} scaled to ${machines} machines.`);
  }

  async setEnv(key: string, value: string) {
    this.envVars[key] = value;
    this.logger.info(
      `Setting environment variable ${key}=${value} for app ${this.name}.`
    );
    const command = `flyctl secrets set ${key}=${value} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Environment variable ${key} set successfully.`);
  }

  async addRegion(region: string) {
    this.logger.info(`Adding region ${region} to app ${this.name}.`);
    const command = `flyctl regions add ${region} --app ${this.name}`;
    await flyctlExecute(command);
    this.regions.push(region);
    this.logger.success(`Region ${region} added successfully.`);
  }

  async removeRegion(region: string) {
    this.logger.info(`Removing region ${region} from app ${this.name}.`);
    const command = `flyctl regions remove ${region} --app ${this.name}`;
    await flyctlExecute(command);
    this.regions = this.regions.filter((r) => r !== region);
    this.logger.success(`Region ${region} removed successfully.`);
  }

  async addCustomDomain(domain: string) {
    this.logger.info(`Adding custom domain ${domain} to app ${this.name}`);
    const command = `flyctl domains create ${domain} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Custom domain ${domain} added successfully.`);
  }

  async removeCustomDomain(domain: string) {
    this.logger.info(`Removing custom domain ${domain} from app ${this.name}`);
    const command = `flyctl domains delete ${domain} --app ${this.name} --yes`;
    await flyctlExecute(command);
    this.logger.success(`Custom domain ${domain} removed successfully.`);
  }

  async addSecret(key: string, value: string) {
    this.logger.info(`Adding secret ${key} to app ${this.name}`);
    const command = `flyctl secrets set ${key}=${value} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Secret ${key} added successfully.`);
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
    const command = `flyctl scale autoscale --app ${this.name} --metric ${policy.metric} --threshold ${policy.threshold} --adjustment ${policy.adjustment}`;
    await flyctlExecute(command);
    this.logger.success(`Scaling policy set: ${JSON.stringify(policy)}`);
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
  }

  async addVolume(volumeName: string, size: string) {
    this.logger.info(
      `Adding volume ${volumeName} of size ${size} to app ${this.name}`
    );
    const command = `flyctl volumes create ${volumeName} --size ${size} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Volume ${volumeName} added successfully.`);
  }

  async attachVolume(volumeName: string, mountPath: string) {
    this.logger.info(
      `Attaching volume ${volumeName} to path ${mountPath} for app ${this.name}`
    );
    const command = `flyctl volumes attach ${volumeName} --mount-path ${mountPath} --app ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(
      `Volume ${volumeName} attached to ${mountPath} successfully.`
    );
  }

  async startLocalDev() {
    this.logger.info(`Starting local development for ${this.name}`);
    const command = `flyctl dev --app ${this.name}`;
    const subprocess = spawn(command, { shell: true, stdio: "inherit" });

    subprocess.on("close", (code: number) => {
      if (code !== 0) {
        this.logger.error(`Local development process exited with code ${code}`);
      }
    });
  }
}
