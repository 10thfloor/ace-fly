import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { App } from '../../src/constructs/App';
import { flyctlExecute } from '../../src/utils/flyctl';
import { Logger } from '../../src/utils/logger';

describe('App Construct', () => {
  let app: App;
  let logger: Logger;

  beforeEach(() => {
    mock.restore();
    logger = new Logger();
    app = new App({
      name: 'test-app',
      region: ['iad'],
      envVars: {
        NODE_ENV: 'production',
      },
    });
  });

  it('should deploy the app successfully', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.resolve({ stdout: '', stderr: '' }),
    }));

    await app.deploy();

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl deploy --app test-app');
  });

  it('should handle deployment errors gracefully', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.reject(new Error('Deployment failed')),
    }));

    await expect(app.deploy()).rejects.toThrow('Deployment failed');
    expect(flyctlExecute).toHaveBeenCalledWith('flyctl deploy --app test-app');
  });

  it('should scale the app successfully', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.resolve({ stdout: '', stderr: '' }),
    }));

    await app.scale(3);

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl scale count 3 --app test-app');
  });

  it('should handle scaling errors gracefully', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.reject(new Error('Scaling failed')),
    }));

    await expect(app.scale(3)).rejects.toThrow('Scaling failed');
    expect(flyctlExecute).toHaveBeenCalledWith('flyctl scale count 3 --app test-app');
  });
});