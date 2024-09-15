import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Volume } from '../../src/constructs/Volume';
import { flyctlExecute } from '../../src/utils/flyctl';
import { Logger } from '../../src/utils/logger';

describe('Volume Construct', () => {
  let volume: Volume;
  let logger: Logger;

  beforeEach(() => {
    mock.restore(); // Changed from resetAllMocks to restore
    logger = new Logger();
    volume = new Volume({
      appName: 'test-app',
      name: 'test-volume',
      sizeGB: 10,
      region: 'iad',
    });

    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.resolve({ stdout: '', stderr: '' }),
    }));
  });

  it('should create a volume successfully', async () => {
    await volume.create();

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl volumes create test-volume --size 10 --region iad --app test-app');
  });

  it('should handle errors during volume creation', async () => {
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.reject(new Error('Creation failed')),
    }));

    await expect(volume.create()).rejects.toThrow('Creation failed');
    expect(flyctlExecute).toHaveBeenCalledWith('flyctl volumes create test-volume --size 10 --region iad --app test-app');
  });

  it('should delete a volume successfully', async () => {
    await volume.delete();

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl volumes destroy test-volume --app test-app --yes');
  });

  it('should list volumes successfully', async () => {
    const mockVolumes = JSON.stringify([
      { id: 'vol-1', name: 'test-volume', size_gb: 10, region: 'iad' },
      { id: 'vol-2', name: 'orphan-volume', size_gb: 5, region: 'iad' },
    ]);
    mock.module('../../src/utils/flyctl', () => ({
      flyctlExecute: () => Promise.resolve({ stdout: mockVolumes, stderr: '' }),
    }));

    await volume.list();
  });
});