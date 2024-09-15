import { flyctlExecute } from '../utils/flyctl';
import { Logger } from '../utils/logger';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface VolumeProps {
  appName: string;
  name: string;
  sizeGB: number;
  region: string;
}

export class Volume {
  appName: string;
  name: string;
  sizeGB: number;
  region: string;
  logger: Logger;

  constructor(props: VolumeProps) {
    this.appName = props.appName;
    this.name = props.name;
    this.sizeGB = props.sizeGB;
    this.region = props.region;
    this.logger = new Logger();
  }

  async create() {
    this.logger.info(`Creating volume ${this.name} (${this.sizeGB}GB) in region ${this.region} for app ${this.appName}.`);
    const command = `flyctl volumes create ${this.name} --size ${this.sizeGB} --region ${this.region} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Volume ${this.name} created successfully.`);
  }

  async delete() {
    this.logger.info(`Deleting volume ${this.name} from app ${this.appName}.`);
    const command = `flyctl volumes destroy ${this.name} --app ${this.appName} --yes`;
    await flyctlExecute(command);
    this.logger.success(`Volume ${this.name} deleted successfully.`);
  }

  async list() {
    this.logger.info(`Listing volumes for app ${this.appName}.`);
    const command = `flyctl volumes list --app ${this.appName}`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  }
}