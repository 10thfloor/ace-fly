import { flyctlExecute } from "../utils/flyctl";
import type { Logger } from "../utils/logger";
import type { Volume } from "./Volume";
import type { CleanupManager } from "../utils/cleanup";

interface SecurityProps {
  appName: string;
  logger: Logger;
  cleanupManager?: CleanupManager;
}

export class Security {
  appName: string;
  logger: Logger;
  private cleanupManager?: CleanupManager;

  constructor(props: SecurityProps) {
    this.appName = props.appName;
    this.logger = props.logger;
    this.cleanupManager = props.cleanupManager;
  }

  async enableTLS() {
    this.logger.info(`Enabling TLS for app ${this.appName}`);
    const command = `flyctl certs add ${this.appName}.fly.dev`;
    await flyctlExecute(command);
    this.logger.success(`TLS enabled for app ${this.appName}`);
    this.cleanupManager?.registerResource([`tls:${this.appName}`]);
  }

  async configureAccessControls(allowedIPs: string[]) {
    this.logger.info(`Configuring access controls for app ${this.appName}`);
    const command = `flyctl firewall configure --app ${
      this.appName
    } --allow ${allowedIPs.join(",")}`;
    await flyctlExecute(command);
    this.logger.success(`Access controls configured for app ${this.appName}`);
    this.cleanupManager?.registerResource([`access-controls:${this.appName}`]);
  }

  async addSecret(key: string, value: string) {
    this.logger.info(`Adding secret ${key} to app ${this.appName}`);
    const command = `flyctl secrets set ${key}=${value} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Secret ${key} added successfully.`);
    this.cleanupManager?.registerResource([`secret:${key}`]);
  }

  async removeSecret(key: string) {
    this.logger.info(`Removing secret ${key} from app ${this.appName}`);
    const command = `flyctl secrets unset ${key} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Secret ${key} removed successfully.`);
    this.cleanupManager?.registerResource([`secret:${key}`]);
  }

  async listSecrets() {
    this.logger.info(`Listing secrets for app ${this.appName}`);
    const command = `flyctl secrets list --app ${this.appName}`;
    await flyctlExecute(command, 0);
    this.logger.success("Secrets listed successfully.");
  }

  async rotateSecret(oldKey: string, newKey: string, newValue: string) {
    this.logger.info(
      `Rotating secret ${oldKey} to ${newKey} for app ${this.appName}`
    );
    await this.removeSecret(oldKey);
    await this.addSecret(newKey, newValue);
    this.logger.success(
      `Secret rotated from ${oldKey} to ${newKey} successfully.`
    );
  }

  async enableVolumeEncryption(volume: Volume) {
    this.logger.info(
      `Enabling encryption for volume ${volume.name} in app ${this.appName}`
    );
    const command = `flyctl volumes update ${volume.name} --enable-encryption --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Encryption enabled for volume ${volume.name}.`);
    this.cleanupManager?.registerResource([`volume-encryption:${volume.name}`]);
  }

  async disableVolumeEncryption(volume: Volume) {
    this.logger.info(
      `Disabling encryption for volume ${volume.name} in app ${this.appName}`
    );
    const command = `flyctl volumes update ${volume.name} --no-encryption --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Encryption disabled for volume ${volume.name}.`);
    this.cleanupManager?.registerResource([`volume-encryption:${volume.name}`]);
  }

  async renewTLS() {
    this.logger.info(`Renewing TLS certificate for app ${this.appName}`);
    const command = `flyctl certs renew ${this.appName}.fly.dev`;
    await flyctlExecute(command);
    this.logger.success(
      `TLS certificate renewed successfully for app ${this.appName}.`
    );
    this.cleanupManager?.registerResource([`tls-renew:${this.appName}`]);
  }

  async checkTLSStatus() {
    this.logger.info(`Checking TLS certificate status for app ${this.appName}`);
    const command = `flyctl certs status ${this.appName}.fly.dev`;
    await flyctlExecute(command, 0);
    this.logger.success(
      `TLS certificate status checked for app ${this.appName}.`
    );
  }

  async addFirewallRule(ipOrCidr: string) {
    this.logger.info(
      `Adding firewall rule to allow ${ipOrCidr} for app ${this.appName}`
    );
    const command = `flyctl firewall add allow ${ipOrCidr} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Firewall rule added: allow ${ipOrCidr}`);
    this.cleanupManager?.registerResource([`firewall-rule:${ipOrCidr}`]);
  }

  async removeFirewallRule(ipOrCidr: string) {
    this.logger.info(
      `Removing firewall rule for ${ipOrCidr} from app ${this.appName}`
    );
    const command = `flyctl firewall remove allow ${ipOrCidr} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Firewall rule removed: allow ${ipOrCidr}`);
    this.cleanupManager?.registerResource([`firewall-rule:${ipOrCidr}`]);
  }

  async listFirewallRules() {
    this.logger.info(`Listing firewall rules for app ${this.appName}`);
    const command = `flyctl firewall list --app ${this.appName}`;
    await flyctlExecute(command, 0);
    this.logger.success(
      `Firewall rules listed successfully for app ${this.appName}.`
    );
  }

  async configureRateLimiting(maxRequests: number, interval: number) {
    this.logger.info(
      `Configuring rate limiting: ${maxRequests} requests per ${interval} seconds for app ${this.appName}`
    );
    const command = `flyctl rate-limit set --max ${maxRequests} --interval ${interval} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(
      `Rate limiting configured: ${maxRequests} requests per ${interval} seconds.`
    );
    this.cleanupManager?.registerResource([`rate-limit:${this.appName}`]);
  }

  async removeRateLimiting() {
    this.logger.info(`Removing rate limiting from app ${this.appName}`);
    const command = `flyctl rate-limit remove --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Rate limiting removed from app ${this.appName}.`);
    this.cleanupManager?.registerResource([`rate-limit:${this.appName}`]);
  }

  async enableMFA() {
    this.logger.info(
      `Enabling Multi-Factor Authentication for app ${this.appName}`
    );
    const command = `flyctl auth enable-mfa --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(
      `Multi-Factor Authentication enabled for app ${this.appName}.`
    );
    this.cleanupManager?.registerResource([`mfa:${this.appName}`]);
  }

  async disableMFA() {
    this.logger.info(
      `Disabling Multi-Factor Authentication for app ${this.appName}`
    );
    const command = `flyctl auth disable-mfa --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(
      `Multi-Factor Authentication disabled for app ${this.appName}.`
    );
    this.cleanupManager?.registerResource([`mfa:${this.appName}`]);
  }

  async enforceHTTPS() {
    this.logger.info(`Enforcing HTTPS for app ${this.appName}`);
    const command = `flyctl certs enforce-https --app ${this.appName}`;
    try {
      await flyctlExecute(command);
      this.logger.success(`HTTPS enforced for app ${this.appName}.`);
      this.cleanupManager?.registerResource([`https-enforce:${this.appName}`]);
    } catch (error: any) {
      this.logger.error(`Failed to enforce HTTPS for app ${this.appName}: ${error.message}`);
      throw error;
    }
  }

  async disableHTTPS() {
    this.logger.info(`Disabling HTTPS enforcement for app ${this.appName}`);
    const command = `flyctl certs disable-https --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`HTTPS enforcement disabled for app ${this.appName}.`);
    this.cleanupManager?.registerResource([`https-enforce:${this.appName}`]);
  }

  async addCustomDomain(domain: string) {
    this.logger.info(`Adding custom domain ${domain} to app ${this.appName}`);
    const command = `flyctl domains create ${domain} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(
      `Custom domain ${domain} added to app ${this.appName}.`
    );
    this.cleanupManager?.registerResource([`custom-domain:${domain}`]);
  }

  async removeCustomDomain(domain: string) {
    this.logger.info(
      `Removing custom domain ${domain} from app ${this.appName}`
    );
    const command = `flyctl domains remove ${domain} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(
      `Custom domain ${domain} removed from app ${this.appName}.`
    );
    this.cleanupManager?.registerResource([`custom-domain:${domain}`]);
  }

  async listCustomDomains() {
    this.logger.info(`Listing custom domains for app ${this.appName}`);
    const command = `flyctl domains list --app ${this.appName}`;
    await flyctlExecute(command, 0);
    this.logger.success(
      `Custom domains listed successfully for app ${this.appName}.`
    );
  }

  async getDNSVerification(domain: string): Promise<string> {
    const command = `flyctl domains list --app ${this.appName} --json`;
    try {
      const { stdout } = await flyctlExecute(command);
      const domains = JSON.parse(stdout);
      const targetDomain = domains.find((d: any) => d.name === domain);
      if (!targetDomain) {
        throw new Error(`Domain ${domain} not found in app ${this.appName}.`);
      }
      return `Please add the following DNS records to your domain registrar:
Type: CNAME
Name: www
Value: ${targetDomain.verification}`;
    } catch (error: any) {
      this.logger.error(
        `Failed to retrieve DNS verification for ${domain}: ${error.message}`
      );
      throw error;
    }
  }

  async getDNSRecords() {
    this.logger.info(`Getting DNS records for app ${this.appName}`);
    const command = `flyctl dns list --app ${this.appName}`;
    await flyctlExecute(command, 0);
    this.logger.success(
      `DNS records listed successfully for app ${this.appName}.`
    );
  }
}
