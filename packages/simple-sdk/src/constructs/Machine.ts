import type { Database } from './Database';
import { Logger } from '../utils/logger';
import { flyctlExecute } from '../utils/flyctl';
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { CleanupManager } from '../utils/cleanup';

interface MachineProps {
  appName: string;
  name: string;
  image: string;
  envVars?: { [key: string]: string };
  databases?: Database[];
  cleanupManager?: CleanupManager;
}

export class Machine {
  appName: string;
  name: string;
  image: string;
  envVars: { [key: string]: string };
  databases: Database[];
  logger: Logger;
  private createdResources: string[] = [];
  private cleanupManager?: CleanupManager;

  constructor(private props: MachineProps) {
    this.appName = props.appName;
    this.name = props.name;
    this.image = props.image;
    this.envVars = props.envVars || {};
    this.databases = props.databases || [];
    this.logger = new Logger();
    this.cleanupManager = props.cleanupManager;

    // Automatically set DATABASE_URL if databases are provided
    if (props.databases) {
      props.databases.forEach((db, index) => {
        const envVarName = index === 0 ? 'DATABASE_URL' : `DATABASE_URL_${index + 1}`;
        this.envVars[envVarName] = db.getConnectionString();
      });
    }
  }

  async prepareDockerImage() {
    if (this.image) {
      this.logger.info(`Using provided Docker image: ${this.image}`);
      return;
    }

    const cwd = process.cwd();
    const dockerfilePath = path.join(cwd, 'Dockerfile');

    // Generate Dockerfile if it doesn't exist
    if (!existsSync(dockerfilePath)) {
      this.logger.info('Dockerfile not found. Generating using dockerfile-node...');
      try {
        execSync('npx --yes @flydotio/dockerfile@latest', { stdio: 'inherit' });
        this.logger.success('Dockerfile generated successfully.');
      } catch (error) {
        this.logger.error('Failed to generate Dockerfile.');
        throw error;
      }
    } else {
      this.logger.info('Dockerfile already exists. Skipping generation.');
    }

    // Build Docker image
    // const imageTag = `${this.props.appName}-machine:latest`;
    // this.logger.info(`Building Docker image: ${imageTag}`);
    
    // try {
    //   execSync(`docker build -t ${imageTag} .`, { stdio: 'inherit' });
    //   this.logger.success(`Docker image ${imageTag} built successfully.`);
    // } catch (error) {
    //   this.logger.error('Docker build failed.');
    //   throw error;
    // }

    // Push Docker image to a registry (e.g., Docker Hub)
    // For simplicity, assuming Docker Hub and user is already logged in
    // You may enhance this by allowing registry configuration
    // const dockerHubUsername = process.env.DOCKER_HUB_USERNAME;
    // if (!dockerHubUsername) {
    //   this.logger.error('DOCKER_HUB_USERNAME environment variable is not set.');
    //   throw new Error('Docker Hub username is required to push images.');
    // }
    // const dockerImageFullTag = `${dockerHubUsername}/${this.props.appName}-machine:latest`;
    // this.logger.info(`Tagging Docker image as ${dockerImageFullTag}`);
    // try {
    //   execSync(`docker tag ${imageTag} ${dockerImageFullTag}`, { stdio: 'inherit' });
    //   this.logger.info(`Pushing Docker image to Docker Hub: ${dockerImageFullTag}`);
    //   execSync(`docker push ${dockerImageFullTag}`, { stdio: 'inherit' });
    //   this.logger.success(`Docker image pushed to Docker Hub: ${dockerImageFullTag}`);
    //   this.image = dockerImageFullTag;
    // } catch (error) {
    //   this.logger.error('Failed to push Docker image to Docker Hub.');
    //   throw error;
    // }
  }

  async create() {
    await this.prepareDockerImage();

    this.logger.info(`Creating machine ${this.name} for app ${this.appName}.`);
    const envVarsString = Object.entries(this.envVars)
      .map(([key, value]) => `--env ${key}=${encodeURIComponent(value)}`)
      .join(' ');
    const command = `flyctl machines create ${this.name} --app ${this.appName} --image ${this.image} ${envVarsString} --no-confirm`;
    await flyctlExecute(command);
    this.logger.success(`Machine ${this.name} created successfully.`);
    this.createdResources.push(`machine:${this.name}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  async deploy() {
    this.logger.info(`Deploying machine ${this.name} for app ${this.appName}.`);
    const command = `flyctl machines deploy ${this.name} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Machine ${this.name} deployed successfully.`);
    this.createdResources.push(`deploy-machine:${this.name}`);
    this.cleanupManager?.registerResource(this.getCreatedResources());
  }

  getCreatedResources(): string[] {
    return this.createdResources;
  }

  // Additional methods as needed...
}