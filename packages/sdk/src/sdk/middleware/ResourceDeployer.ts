import { Middleware, DeploymentContext } from "./DeploymentPipeline";
import { FlyApiClient } from "../api/FlyApiClient";
import { Logger } from "../utils/Logger";
import { FlyIoApp } from "../constructs/FlyIoApp";
import { FlyHttpService } from "../constructs/FlyHttpService";
import { FlyPostgresDatabase } from "../patterns/FlyPostgresDatabase";
// Import other resource types as needed

export class ResourceDeployer implements Middleware {
  private deployableKeys = ['app', 'domain', 'certificate', 'firewall', 'arcjetProtection', 'services', 'processGroups', 'regions'];

  constructor(private apiClient: FlyApiClient) {}

  async process(context: DeploymentContext, next: () => Promise<void>): Promise<void> {
    const { config, dryRun } = context;

    if (!config) {
      Logger.warn("No config found to deploy.");
      await next();
      return;
    }

    // Iterate over deployable top-level properties
    for (const [key, value] of Object.entries(config)) {
      if (!this.deployableKeys.includes(key)) continue; // Skip non-deployable keys

      if (dryRun) {
        Logger.info(`Would deploy resource under key: ${key}`);
        Logger.info(JSON.stringify(value, null, 2));
      } else {
        try {
          Logger.info(`Deploying resource under key: ${key}`);
          await this.deployResource(key, value);
        } catch (error) {
          Logger.error(`Failed to deploy resource ${key}: ${error}`);
          throw error;
        }
      }
    }

    await next();
  }

  private async deployResource(key: string, config: any): Promise<void> {
    switch (key) {
      case 'app':
        await this.deployApp(config);
        break;
      case 'domain':
        await this.deployDomain(config);
        break;
      case 'certificate':
        await this.deployCertificate(config);
        break;
      case 'firewall':
        await this.deployFirewall(config);
        break;
      case 'arcjetProtection':
        await this.deployArcJetProtection(config);
        break;
      case 'services':
        await this.deployServices(config);
        break;
      case 'processGroups':
        await this.deployProcessGroups(config);
        break;
      case 'regions':
        await this.deployRegions(config);
        break;
      // Add more cases as needed for other resources
      default:
        throw new Error(`Unsupported deployable resource key: ${key}`);
    }
  }

  private async deployApp(appConfig: any): Promise<void> {
    // Implement your deployment logic for FlyIoApp
    Logger.info(`Deploying FlyIoApp: ${JSON.stringify(appConfig, null, 2)}`);
    // Example: await this.apiClient.createOrUpdateApp(appConfig);
  }

  private async deployDomain(domainConfig: any): Promise<void> {
    // Implement your deployment logic for FlyDomain
    Logger.info(`Deploying FlyDomain: ${JSON.stringify(domainConfig, null, 2)}`);
    // Example: await this.apiClient.createOrUpdateDomain(domainConfig);
  }

  private async deployCertificate(certificateConfig: any): Promise<void> {
    // Implement your deployment logic for FlyCertificate
    Logger.info(`Deploying FlyCertificate: ${JSON.stringify(certificateConfig, null, 2)}`);
    // Example: await this.apiClient.createOrUpdateCertificate(certificateConfig);
  }

  private async deployFirewall(firewallConfig: any): Promise<void> {
    // Implement your deployment logic for FlyFirewall
    Logger.info(`Deploying FlyFirewall: ${JSON.stringify(firewallConfig, null, 2)}`);
    // Example: await this.apiClient.createOrUpdateFirewall(firewallConfig);
  }

  private async deployArcJetProtection(arcjetConfig: any): Promise<void> {
    // Implement your deployment logic for ArcJetProtection
    Logger.info(`Deploying ArcJetProtection: ${JSON.stringify(arcjetConfig, null, 2)}`);
    // Example: await this.apiClient.createOrUpdateArcJetProtection(arcjetConfig);
  }

  private async deployServices(servicesConfig: any): Promise<void> {
    for (const [serviceName, serviceConfig] of Object.entries(servicesConfig)) {
      Logger.info(`Deploying Service: ${serviceName}`);
      // Example: await this.apiClient.createOrUpdateService(serviceConfig);
    }
  }

  private async deployProcessGroups(processGroupsConfig: any): Promise<void> {
    for (const [groupName, groupConfig] of Object.entries(processGroupsConfig)) {
      Logger.info(`Deploying Process Group: ${groupName}`);
      // Example: await this.apiClient.createOrUpdateProcessGroup(groupConfig);
    }
  }

  private async deployRegions(regionsConfig: any): Promise<void> {
    Logger.info(`Deploying Regions: ${JSON.stringify(regionsConfig, null, 2)}`);
    // Example: await this.apiClient.configureRegions(regionsConfig);
  }
}