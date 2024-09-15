import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Security } from '../../src/constructs/Security';
import { flyctlExecute } from '../../src/utils/flyctl';
import { Logger } from '../../src/utils/logger';
import { Volume } from '../../src/constructs/Volume';

describe('Security Construct', () => {
  let security: Security;
  let logger: Logger;
  let volume: Volume;

  beforeEach(() => {
    mock.restore();
    logger = new Logger();
    security = new Security('test-app', logger);
    volume = new Volume({
      appName: 'test-app',
      name: 'test-volume',
      sizeGB: 10,
      region: 'iad',
    });
  });

  it('should add a secret successfully', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.resolve({ stdout: '', stderr: '' }),
    }));

    await security.addSecret('API_KEY', 'supersecret');

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl secrets set API_KEY=supersecret --app test-app');
  });

  it('should handle errors when adding a secret', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.reject(new Error('Failed to add secret')),
    }));

    await expect(security.addSecret('API_KEY', 'supersecret')).rejects.toThrow('Failed to add secret');
    expect(flyctlExecute).toHaveBeenCalledWith('flyctl secrets set API_KEY=supersecret --app test-app');
  });

  it('should list secrets successfully', async () => {
    const mockSecrets = JSON.stringify([
      { key: 'API_KEY', value: '********' },
      { key: 'DB_PASSWORD', value: '********' },
    ]);
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.resolve({ stdout: mockSecrets, stderr: '' }),
    }));

    await security.listSecrets();

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl secrets list --app test-app');
  });

  it('should rotate a secret successfully', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.resolve({ stdout: '', stderr: '' }),
    }));

    await security.rotateSecret('OLD_API_KEY', 'NEW_API_KEY', 'newsecret');

    expect(flyctlExecute).toHaveBeenNthCalledWith(1, 'flyctl secrets unset OLD_API_KEY --app test-app');
    expect(flyctlExecute).toHaveBeenNthCalledWith(2, 'flyctl secrets set NEW_API_KEY=newsecret --app test-app');
  });

  it('should enforce HTTPS successfully', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.resolve({ stdout: '', stderr: '' }),
    }));

    await security.enforceHTTPS();

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl certs enforce-https --app test-app');
  });

  it('should handle errors when enforcing HTTPS', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.reject(new Error('Failed to enforce HTTPS')),
    }));

    await expect(security.enforceHTTPS()).rejects.toThrow('Failed to enforce HTTPS');
    expect(flyctlExecute).toHaveBeenCalledWith('flyctl certs enforce-https --app test-app');
  });
});