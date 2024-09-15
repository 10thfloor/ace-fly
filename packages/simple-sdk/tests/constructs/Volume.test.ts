import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Volume } from '../../src/constructs/Volume';
import { flyctlExecute } from '../../src/utils/flyctl';
import { Logger } from '../../src/utils/logger';

describe('Volume Construct', () => {
  let volume: Volume;
  let logger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new Logger();
    volume = new Volume({
      appName: 'test-app',
      name: 'test-volume',
      sizeGB: 10,
      region: 'iad'
    });
  });

  it('should create a volume successfully', async () => {
    (flyctlExecute as any).mockResolvedValue({ stdout: '', stderr: '' });

    await volume.create();

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl volumes create test-volume --size 10 --region iad --app test-app');
  });

  it('should handle errors during volume creation', async () => {
    (flyctlExecute as any).mockRejectedValue(new Error('Creation failed'));

    await expect(volume.create()).rejects.toThrow('Creation failed');
    expect(flyctlExecute).toHaveBeenCalledWith('flyctl volumes create test-volume --size 10 --region iad --app test-app');
  });

  it('should delete a volume successfully', async () => {
    (flyctlExecute as any).mockResolvedValue({ stdout: '', stderr: '' });

    await volume.delete();

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl volumes destroy test-volume --app test-app --yes');
  });

  it('should list volumes successfully', async () => {
    const mockVolumes = JSON.stringify([
      { id: 'vol-1', name: 'test-volume', size_gb: 10, region: 'iad' },
      { id: 'vol-2', name: 'orphan-volume', size_gb: 5, region: 'iad' },
    ]);
    (flyctlExecute as any).mockResolvedValue({ stdout: mockVolumes, stderr: '' });

    await volume.list();

    expect(flyctlExecute).toHaveBeenCalledWith('flyctl volumes list --app test-app');
  });
});