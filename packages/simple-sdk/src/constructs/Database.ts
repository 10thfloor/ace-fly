import { flyctlExecute } from '../utils/flyctl';
import { Logger } from '../utils/logger';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface DatabaseProps {
  appName: string;
  name: string;
  engine: string;
  version: string;
  region: string;
}

export class Database {
  appName: string;
  name: string;
  engine: string;
  version: string;
  region: string;
  logger: Logger;

  constructor(props: DatabaseProps) {
    this.appName = props.appName;
    this.name = props.name;
    this.engine = props.engine;
    this.version = props.version;
    this.region = props.region;
    this.logger = new Logger();
  }

  async create() {
    this.logger.info(`Creating database ${this.name} for app ${this.appName}.`);
    const command = `flyctl postgres create ${this.name} --app ${this.appName} --image ${this.engine}:${this.version} --region ${this.region}`;
    await flyctlExecute(command);
    this.logger.success(`Database ${this.name} created successfully.`);
  }

  async connect() {
    this.logger.info(`Connecting to database ${this.name} for app ${this.appName}.`);
    const command = `flyctl postgres connect ${this.name} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Connected to database ${this.name}.`);
  }

  async delete() {
    this.logger.info(`Deleting database ${this.name} from app ${this.appName}.`);
    const command = `flyctl postgres delete ${this.name} --app ${this.appName} --yes`;
    await flyctlExecute(command);
    this.logger.success(`Database ${this.name} deleted successfully.`);
  }

  async backup() {
    this.logger.info(`Initiating backup for database ${this.name}`);
    const command = `flyctl postgres backup create --app ${this.appName} --db ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Backup initiated for database ${this.name}`);
  }

  async restore(backupId: string) {
    this.logger.info(`Restoring database ${this.name} from backup ${backupId}`);
    const command = `flyctl postgres backup restore ${backupId} --app ${this.appName} --db ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Database ${this.name} restored from backup ${backupId}`);
  }

  async enableMonitoring() {
    this.logger.info(`Enabling monitoring for database ${this.name}`);
    const command = `flyctl postgres metrics enable --app ${this.appName} --db ${this.name}`;
    await flyctlExecute(command);
    this.logger.success(`Monitoring enabled for database ${this.name}.`);
  }

  async getMetrics() {
    this.logger.info(`Fetching metrics for database ${this.name}`);
    const command = `flyctl postgres metrics get --app ${this.appName} --db ${this.name}`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  }
}