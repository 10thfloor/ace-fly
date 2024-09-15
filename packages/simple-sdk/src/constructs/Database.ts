import { flyctlExecute } from '../utils/flyctl';
import { Logger } from '../utils/logger';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { CleanupManager } from "../utils/cleanup";

const execAsync = promisify(exec);

interface DatabaseProps {
  appName: string;
  name: string;
  engine: string;
  version: string;
  region: string;
  cleanupManager?: CleanupManager;
}

export class Database {
  appName: string;
  name: string;
  engine: string;
  version: string;
  region: string;
  logger: Logger;
  private createdResources: string[] = [];
  private cleanupManager?: CleanupManager;

  // Added credential properties
  user!: string;
  password!: string;
  hostname!: string;
  port!: number;
  dbName!: string;

  constructor(props: DatabaseProps) {
    this.appName = props.appName;
    this.name = props.name;
    this.engine = props.engine;
    this.version = props.version;
    this.region = props.region;
    this.logger = new Logger();
    this.cleanupManager = props.cleanupManager;
  }

  async create() {
    this.logger.info(`Creating database ${this.name} for app ${this.appName}.`);
    const command = `flyctl postgres create ${this.name} --app ${this.appName} --image ${this.engine}:${this.version} --region ${this.region} --no-confirm`;
    try {
      await flyctlExecute(command);
      this.logger.success(`Database ${this.name} created successfully.`);
      this.createdResources.push(`database:${this.name}`);
      this.cleanupManager?.registerResource(this.getCreatedResources());
    } catch (error: any) {
      this.logger.error(`Failed to create database ${this.name}: ${error.message}`);
      throw error;
    }
  }

  async connect() {
    this.logger.info(`Connecting to database ${this.name} for app ${this.appName}.`);
    const command = `flyctl postgres connect ${this.name} --app ${this.appName} --no-launch-browser`;
    try {
      await flyctlExecute(command);
      this.logger.success(`Connected to database ${this.name}.`);
      this.createdResources.push(`connect:${this.name}`);
      this.cleanupManager?.registerResource(this.getCreatedResources());
      await this.applyCredentials();
    } catch (error: any) {
      this.logger.error(`Failed to connect to database ${this.name}: ${error.message}`);
      throw error;
    }
  }

  async applyCredentials() {
    this.logger.info(`Retrieving credentials for database ${this.name}.`);
    const command = `flyctl postgres credentials list --app ${this.appName} --db ${this.name} --json`;
    const { stdout } = await execAsync(command);
    const credentials = JSON.parse(stdout);

    if (credentials.length === 0) {
      throw new Error('No credentials found for the database.');
    }

    const primaryCredential = credentials.find((cred: any) => cred.role === 'app');
    if (!primaryCredential) {
      throw new Error('Primary credentials not found.');
    }

    this.user = primaryCredential.username;
    this.password = primaryCredential.password;
    this.hostname = primaryCredential.host;
    this.port = primaryCredential.port;
    this.dbName = primaryCredential.database;

    this.logger.success(`Credentials applied for database ${this.name}.`);
  }

  async delete() {
    this.logger.info(`Deleting database ${this.name} from app ${this.appName}.`);
    const command = `flyctl postgres delete ${this.name} --app ${this.appName} --yes`;
    try {
      await flyctlExecute(command);
      this.logger.success(`Database ${this.name} deleted successfully.`);
    } catch (error: any) {
      this.logger.error(`Failed to delete database ${this.name}: ${error.message}`);
      throw error;
    }
  }

  async backup() {
    this.logger.info(`Initiating backup for database ${this.name}`);
    const command = `flyctl postgres backup create --app ${this.appName} --db ${this.name}`;
    try {
      await flyctlExecute(command);
      this.logger.success(`Backup initiated for database ${this.name}`);
    } catch (error: any) {
      this.logger.error(`Failed to initiate backup for database ${this.name}: ${error.message}`);
      throw error;
    }
  }

  async restore(backupId: string) {
    this.logger.info(`Restoring database ${this.name} from backup ${backupId}`);
    const command = `flyctl postgres backup restore ${backupId} --app ${this.appName} --db ${this.name}`;
    try {
      await flyctlExecute(command);
      this.logger.success(`Database ${this.name} restored from backup ${backupId}`);
    } catch (error: any) {
      this.logger.error(`Failed to restore database ${this.name} from backup ${backupId}: ${error.message}`);
      throw error;
    }
  }

  async enableMonitoring() {
    this.logger.info(`Enabling monitoring for database ${this.name}`);
    const command = `flyctl postgres metrics enable --app ${this.appName} --db ${this.name}`;
    try {
      await flyctlExecute(command);
      this.logger.success(`Monitoring enabled for database ${this.name}.`);
    } catch (error: any) {
      this.logger.error(`Failed to enable monitoring for database ${this.name}: ${error.message}`);
      throw error;
    }
  }

  async getMetrics() {
    this.logger.info(`Fetching metrics for database ${this.name}`);
    const command = `flyctl postgres metrics get --app ${this.appName} --db ${this.name}`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  }

  getConnectionString(): string {
    return `postgres://${this.user}:${this.password}@${this.hostname}:${this.port}/${this.dbName}`;
  }

  getCreatedResources(): string[] {
    return this.createdResources;
  }
}