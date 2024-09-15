import type { App } from "../constructs/App";
import type { Logger } from "./logger";
import { flyctlExecute } from "./flyctl";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Define interfaces if not already defined
interface Volume {
  name: string;
  size_gb: number;
  region: string;
}

interface Machine {
  name: string;
  status: string;
  region: string;
  volume_names?: string[];
}

export class CleanupManager {
  private resources: string[] = [];
  private apps: App[];
  private logger: Logger;

  constructor(apps: App[], logger: Logger) {
    this.apps = apps;
    this.logger = logger;
  }

  // Register resources for deployment-specific cleanup
  registerResource(resource: string[]) {
    this.resources.push(...resource);
  }

  // Cleanup all registered resources (Deployment-specific)
  async cleanup() {
    this.logger.info('Starting deployment-specific cleanup of created resources...');
    for (const resource of this.resources.reverse()) { // Reverse to handle dependencies
      try {
        if (resource.startsWith('region:')) {
          const region = resource.split(':')[1];
          this.logger.info(`Scaling down region ${region}`);
          const command = `flyctl scale count 0 --app test-app --region ${region}`;
          await flyctlExecute(command);
          this.logger.success(`Region ${region} scaled down successfully.`);
        } else if (resource.startsWith('deploy:')) {
          const app = resource.split(':')[1];
          this.logger.info(`Rolling back deployment for app ${app}`);
          // Implement rollback logic if applicable
        } else if (resource.startsWith('app:')) {
          const app = resource.split(':')[1];
          this.logger.info(`Destroying app ${app}`);
          const command = `flyctl apps destroy ${app} --yes`;
          await flyctlExecute(command);
          this.logger.success(`App ${app} destroyed successfully.`);
        } else if (resource.startsWith('env:')) {
          const key = resource.split(':')[1];
          this.logger.info(`Removing environment variable ${key}`);
          const command = `flyctl secrets unset ${key} --app test-app`;
          await flyctlExecute(command);
          this.logger.success(`Environment variable ${key} removed successfully.`);
        }
        // Add more conditions for different resource types as needed
      } catch (error: any) {
        this.logger.error(`Failed to cleanup resource ${resource}: ${error.message}`);
      }
    }
    this.logger.info('Deployment-specific cleanup completed.');
  }

  // General Cleanup: Orphaned Volumes
  async cleanupOrphanedResources() {
    this.logger.info('Starting cleanup of orphaned resources...');
    for (const app of this.apps) {
      this.logger.info(`Processing cleanup for app: ${app.name}`);
      
      // Step 1: List all volumes associated with the app
      const volumesCommand = `flyctl volumes list --app ${app.name} --json`;
      let allVolumes: Volume[] = [];
      try {
        const { stdout: volumesStdout } = await execAsync(volumesCommand);
        allVolumes = JSON.parse(volumesStdout);
        this.logger.info(`Found ${allVolumes.length} volumes for app ${app.name}.`);
      } catch (error: any) {
        this.logger.error(`Error listing volumes for app ${app.name}: ${error.message}`);
        continue; // Skip to the next app if there's an error
      }

      // Step 2: List all machines within the app
      const machinesCommand = `flyctl machines list --app ${app.name} --json`;
      let machines: Machine[] = [];
      try {
        const { stdout: machinesStdout } = await execAsync(machinesCommand);
        machines = JSON.parse(machinesStdout);
        this.logger.info(`Found ${machines.length} machines for app ${app.name}.`);
      } catch (error: any) {
        this.logger.error(`Error listing machines for app ${app.name}: ${error.message}`);
        continue; // Skip to the next app if there's an error
      }

      // Step 3: Aggregate all volumes attached to machines using machine names
      const attachedVolumeNames = new Set<string>();
      for (const machine of machines) {
        const machineName = machine.name;
        const machineShowCommand = `flyctl machines show ${machineName} --app ${app.name} --json`;
        try {
          const { stdout: machineShowStdout } = await execAsync(machineShowCommand);
          const machineInfo = JSON.parse(machineShowStdout);
          if (machineInfo.volume_names && Array.isArray(machineInfo.volume_names)) {
            for (const volName of machineInfo.volume_names) {
              attachedVolumeNames.add(volName);
            }
            this.logger.info(`Machine ${machine.name} is attached to volumes: ${machineInfo.volume_names.join(', ')}`);
          }
        } catch (error: any) {
          this.logger.error(`Error retrieving details for machine ${machine.name}: ${error.message}`);
        }
      }

      // Step 4: Identify orphaned volumes (not attached to any machine)
      const orphanedVolumes = allVolumes.filter(volume => !attachedVolumeNames.has(volume.name));
      this.logger.info(`Identified ${orphanedVolumes.length} orphaned volumes for app ${app.name}.`);

      // Step 5: Delete orphaned volumes
      for (const orphanVolume of orphanedVolumes) {
        this.logger.info(`Deleting orphaned volume: ${orphanVolume.name}`);
        try {
          await flyctlExecute(`flyctl volumes destroy ${orphanVolume.name} --app ${app.name} --yes`);
          this.logger.success(`Successfully deleted orphaned volume: ${orphanVolume.name}`);
        } catch (error: any) {
          this.logger.error(`Failed to delete volume ${orphanVolume.name}: ${error.message}`);
        }
      }
    }
    this.logger.info('Cleanup of orphaned resources completed.');
  }
}