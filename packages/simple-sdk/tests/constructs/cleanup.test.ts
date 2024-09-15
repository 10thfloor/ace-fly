import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CleanupManager } from '../../src/utils/cleanup';
import { App } from '../../src/constructs/App';
import { flyctlExecute } from '../../src/utils/flyctl';
import { Logger } from '../../src/utils/logger';

describe('CleanupManager', () => {
  let cleanupManager: CleanupManager;
  let logger: Logger;
  let app: App;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new Logger();
    app = new App({
      name: 'test-app',
      region: ['iad'],
      envVars: {},
    });
    cleanupManager = new CleanupManager([app], logger);
  });

  it('should identify and delete orphaned volumes', async () => {
    const mockVolumes = JSON.stringify([
      { name: 'attached-volume-1', size_gb: 10, region: 'iad' },
      { name: 'orphan-volume-1', size_gb: 5, region: 'iad' },
      { name: 'orphan-volume-2', size_gb: 5, region: 'iad' },
    ]);

    const mockMachines = JSON.stringify([
      { name: 'machine-1', status: 'running', region: 'iad', volume_names: ['attached-volume-1'] },
    ]);

    (flyctlExecute as any)
      .mockImplementationOnce(() => Promise.resolve({ stdout: mockVolumes, stderr: '' })) // List volumes
      .mockImplementationOnce(() => Promise.resolve({ stdout: mockMachines, stderr: '' })) // List machines
      .mockImplementationOnce(() => Promise.resolve({ stdout: '', stderr: '' })) // Machine show for machine-1
      .mockImplementationOnce(() => Promise.resolve({ stdout: '', stderr: '' })) // Destroy orphan-volume-1
      .mockImplementationOnce(() => Promise.resolve({ stdout: '', stderr: '' })); // Destroy orphan-volume-2

    await cleanupManager.cleanupOrphanedResources();

    expect(flyctlExecute).toHaveBeenNthCalledWith(1, 'flyctl volumes list --app test-app --json');
    expect(flyctlExecute).toHaveBeenNthCalledWith(2, 'flyctl machines list --app test-app --json');
    expect(flyctlExecute).toHaveBeenNthCalledWith(3, 'flyctl machines show machine-1 --app test-app --json');
    expect(flyctlExecute).toHaveBeenNthCalledWith(4, 'flyctl volumes destroy orphan-volume-1 --app test-app --yes');
    expect(flyctlExecute).toHaveBeenNthCalledWith(5, 'flyctl volumes destroy orphan-volume-2 --app test-app --yes');
  });

  it('should handle no orphaned volumes gracefully', async () => {
    const mockVolumes = JSON.stringify([
      { name: 'attached-volume-1', size_gb: 10, region: 'iad' },
    ]);

    const mockMachines = JSON.stringify([
      { name: 'machine-1', status: 'running', region: 'iad', volume_names: ['attached-volume-1'] },
    ]);

    (flyctlExecute as any)
      .mockImplementationOnce(() => Promise.resolve({ stdout: mockVolumes, stderr: '' })) // List volumes
      .mockImplementationOnce(() => Promise.resolve({ stdout: mockMachines, stderr: '' })) // List machines
      .mockImplementationOnce(() => Promise.resolve({ stdout: '', stderr: '' })); // Machine show for machine-1

    await cleanupManager.cleanupOrphanedResources();

    expect(flyctlExecute).toHaveBeenCalledTimes(3);
    expect(flyctlExecute).toHaveBeenNthCalledWith(1, 'flyctl volumes list --app test-app --json');
    expect(flyctlExecute).toHaveBeenNthCalledWith(2, 'flyctl machines list --app test-app --json');
    expect(flyctlExecute).toHaveBeenNthCalledWith(3, 'flyctl machines show machine-1 --app test-app --json');
  });

  it('should continue cleanup even if one deletion fails', async () => {
    const mockVolumes = JSON.stringify([
      { name: 'orphan-volume-1', size_gb: 5, region: 'iad' },
      { name: 'orphan-volume-2', size_gb: 5, region: 'iad' },
    ]);

    const mockMachines = JSON.stringify([
      { name: 'machine-1', status: 'running', region: 'iad', volume_names: [] },
    ]);

    (flyctlExecute as any)
      .mockImplementationOnce(() => Promise.resolve({ stdout: mockVolumes, stderr: '' })) // List volumes
      .mockImplementationOnce(() => Promise.resolve({ stdout: mockMachines, stderr: '' })) // List machines
      .mockImplementationOnce(() => Promise.resolve({ stdout: '', stderr: '' })) // Machine show for machine-1
      .mockImplementationOnce(() => Promise.reject(new Error('Deletion failed'))) // Destroy orphan-volume-1
      .mockImplementationOnce(() => Promise.resolve({ stdout: '', stderr: '' })); // Destroy orphan-volume-2

    await cleanupManager.cleanupOrphanedResources();

    expect(flyctlExecute).toHaveBeenCalledTimes(5);
    expect(flyctlExecute).toHaveBeenNthCalledWith(4, 'flyctl volumes destroy orphan-volume-1 --app test-app --yes');
    expect(flyctlExecute).toHaveBeenNthCalledWith(5, 'flyctl volumes destroy orphan-volume-2 --app test-app --yes');
  });
});