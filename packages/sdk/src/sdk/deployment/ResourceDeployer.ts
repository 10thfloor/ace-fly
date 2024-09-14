import { FlyApiClient } from "../api/FlyApiClient";
import { StackConstruct } from "../core/StackConstruct";
import { FlyApplication } from "../constructs/FlyApplication";
import { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyPostgresDatabase } from "../patterns/FlyPostgresDatabase";
import { Logger } from "../utils/Logger";

export class ResourceDeployer {
  constructor(private apiClient: FlyApiClient) {}

  async deployResource(resource: StackConstruct): Promise<void> {
    const config = resource.synthesize();

    if (resource instanceof FlyApplication) {
      await this.deployApplication(config);
    } else if (resource instanceof FlyHttpService) {
      await this.deployHttpService(config);
    } else if (resource instanceof FlyPostgresDatabase) {
      await this.deployDatabase(config);
    } else {
      throw new Error(`Unsupported resource type: ${resource.constructor.name}`);
    }
  }

  private async deployApplication(config: any): Promise<void> {
    // Use apiClient to create or update the Fly application
    // Example: await this.apiClient.createApp(config);
  }

  private async deployHttpService(config: any): Promise<void> {
    // Use apiClient to create or update the HTTP service
    // Example: await this.apiClient.createService(config);
  }

  private async deployDatabase(config: any): Promise<void> {
    // Use apiClient to create or update the Postgres database
    // Example: await this.apiClient.createDatabase(config);
  }

  async rollbackResource(key: string, config: any): Promise<void> {
    switch (key) {
      case 'app':
        await this.rollbackApp(config);
        break;
      case 'domain':
        await this.rollbackDomain(config);
        break;
      // Handle other cases similarly
      default:
        Logger.warn(`No rollback method defined for resource key: ${key}`);
    }
  }

  private async rollbackApp(appConfig: any): Promise<void> {
    Logger.info(`Rolling back FlyIoApp: ${JSON.stringify(appConfig, null, 2)}`);
    // Example: await this.apiClient.deleteApp(appConfig.id);
  }

  private async rollbackDomain(domainConfig: any): Promise<void> {
    Logger.info(`Rolling back FlyDomain: ${JSON.stringify(domainConfig, null, 2)}`);
    // Example: await this.apiClient.deleteDomain(domainConfig.id);
  }
}