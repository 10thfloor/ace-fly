import { flyctlExecute } from "../utils/flyctl";
import type { Logger } from "../utils/logger";
import type { Volume } from "./Volume";

export class Security {
  constructor(private appName: string, private logger: Logger) {
    this.appName = appName;
    this.logger = logger;
  }

  async enableTLS() {
    this.logger.info(`Enabling TLS for app ${this.appName}`);
    const command = `flyctl certs add ${this.appName}.fly.dev`;
    await flyctlExecute(command);
    this.logger.success(`TLS enabled for app ${this.appName}`);
  }

  async configureAccessControls(allowedIPs: string[]) {
    this.logger.info(`Configuring access controls for app ${this.appName}`);
    const command = `flyctl firewall configure --app ${
      this.appName
    } --allow ${allowedIPs.join(",")}`;
    await flyctlExecute(command);
    this.logger.success(`Access controls configured for app ${this.appName}`);
  }

  async addSecret(key: string, value: string) {
    this.logger.info(`Adding secret ${key} to app ${this.appName}`);
    const command = `flyctl secrets set ${key}=${value} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Secret ${key} added successfully.`);
  }

  async removeSecret(key: string) {
    this.logger.info(`Removing secret ${key} from app ${this.appName}`);
    const command = `flyctl secrets unset ${key} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Secret ${key} removed successfully.`);
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
  }

  async disableVolumeEncryption(volume: Volume) {
    this.logger.info(
      `Disabling encryption for volume ${volume.name} in app ${this.appName}`
    );
    const command = `flyctl volumes update ${volume.name} --no-encryption --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Encryption disabled for volume ${volume.name}.`);
  }

  async renewTLS() {
    this.logger.info(`Renewing TLS certificate for app ${this.appName}`);
    const command = `flyctl certs renew ${this.appName}.fly.dev`;
    await flyctlExecute(command);
    this.logger.success(
      `TLS certificate renewed successfully for app ${this.appName}.`
    );
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
    this.logger.info(`Adding firewall rule to allow ${ipOrCidr} for app ${this.appName}`);
    const command = `flyctl firewall add allow ${ipOrCidr} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Firewall rule added: allow ${ipOrCidr}`);
  }

  async removeFirewallRule(ipOrCidr: string) {
    this.logger.info(`Removing firewall rule for ${ipOrCidr} from app ${this.appName}`);
    const command = `flyctl firewall remove allow ${ipOrCidr} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Firewall rule removed: allow ${ipOrCidr}`);
  }

  async listFirewallRules() {
    this.logger.info(`Listing firewall rules for app ${this.appName}`);
    const command = `flyctl firewall list --app ${this.appName}`;
    await flyctlExecute(command, 0);
    this.logger.success(`Firewall rules listed successfully for app ${this.appName}.`);
  }

  async configureRateLimiting(maxRequests: number, interval: number) {
    this.logger.info(`Configuring rate limiting: ${maxRequests} requests per ${interval} seconds for app ${this.appName}`);
    const command = `flyctl rate-limit set --max ${maxRequests} --interval ${interval} --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Rate limiting configured: ${maxRequests} requests per ${interval} seconds.`);
  }

  async removeRateLimiting() {
    this.logger.info(`Removing rate limiting from app ${this.appName}`);
    const command = `flyctl rate-limit remove --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Rate limiting removed from app ${this.appName}.`);
  }

  async enableMFA() {
    this.logger.info(`Enabling Multi-Factor Authentication for app ${this.appName}`);
    const command = `flyctl auth enable-mfa --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Multi-Factor Authentication enabled for app ${this.appName}.`);
  }

  async disableMFA() {
    this.logger.info(`Disabling Multi-Factor Authentication for app ${this.appName}`);
    const command = `flyctl auth disable-mfa --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`Multi-Factor Authentication disabled for app ${this.appName}.`);
  }

  async enforceHTTPS() {
    this.logger.info(`Enforcing HTTPS for app ${this.appName}`);
    const command = `flyctl certs enforce-https --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`HTTPS enforcement enabled for app ${this.appName}.`);
  }

  async disableHTTPS() {
    this.logger.info(`Disabling HTTPS enforcement for app ${this.appName}`);
    const command = `flyctl certs disable-https --app ${this.appName}`;
    await flyctlExecute(command);
    this.logger.success(`HTTPS enforcement disabled for app ${this.appName}.`);
  }


}


