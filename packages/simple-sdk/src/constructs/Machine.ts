import { flyctlExecute } from '../utils/flyctl';
import { Logger } from '../utils/logger';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { Volume } from './Volume';
const execAsync = promisify(exec);

interface MachineProps {
  appName: string;
  name: string;
  image: string;
  envVars?: { [key: string]: string };
  volumes?: Volume[];
}

export class Machine {
  appName: string;
  name: string;
  image: string;
  envVars: { [key: string]: string };
  volumes: Volume[];
  logger: Logger;

  constructor(props: MachineProps) {
    this.appName = props.appName;
    this.name = props.name;
    this.image = props.image;
    this.envVars = props.envVars || {};
    this.volumes = props.volumes || [];
    this.logger = new Logger();
  }

  async create() {
    this.logger.info(`Creating machine ${this.name} for app ${this.appName}.`);
    
    // Create attached volumes first
    for (const volume of this.volumes) {
      await volume.create();
    }

    const envVarsString = Object.entries(this.envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    const volumeFlags = this.volumes.map(vol => `--volume ${vol.name}:/mnt/${vol.name}`).join(' ');
    const command = `flyctl machines create ${this.name} --app ${this.appName} --image ${this.image} ${volumeFlags} ${envVarsString}`;
    await flyctlExecute(command);
    this.logger.success(`Machine ${this.name} created successfully.`);
  }

  async deploy() {
    this.logger.info(`Deploying machine ${this.name} for app ${this.appName}.`);
    const command = `flyctl machines deploy ${this.name} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Machine ${this.name} deployed successfully.`);
  }

  async delete() {
    this.logger.info(`Deleting machine ${this.name} from app ${this.appName}.`);
    
    // Delete attached volumes first
    for (const volume of this.volumes) {
      await volume.delete();
    }

    const command = `flyctl machines delete ${this.name} --app ${this.appName} --yes`;
    await flyctlExecute(command);
    this.logger.success(`Machine ${this.name} deleted successfully.`);
  }

  async restart() {
    this.logger.info(`Restarting machine ${this.name} for app ${this.appName}.`);
    const command = `flyctl machines restart ${this.name} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Machine ${this.name} restarted successfully.`);
  }

  async list() {
    this.logger.info(`Listing machines for app ${this.appName}.`);
    const command = `flyctl machines list --app ${this.appName}`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  }

  async attachVolume(volume: Volume, mountPath: string) {
    this.logger.info(`Attaching volume ${volume.name} to machine ${this.name} at ${mountPath}.`);
    const command = `flyctl machines attach-volume ${volume.name} --app ${this.appName} --machine ${this.name} --mount-path ${mountPath}`;
    await flyctlExecute(command);
    this.logger.success(`Volume ${volume.name} attached to ${this.name} at ${mountPath} successfully.`);
  }

  async detachVolume(volumeName: string) {
    this.logger.info(`Detaching volume ${volumeName} from machine ${this.name}.`);
    const command = `flyctl machines detach-volume ${volumeName} --app ${this.appName} --machine ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Volume ${volumeName} detached from ${this.name} successfully.`);
  }
}