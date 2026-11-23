import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dataDir, mediaDir } from '../src/server/db/client';

describe('storage paths', () => {
  const mount = path.resolve('test-volume');

  beforeEach(() => {
    vi.stubEnv('DATA_DIR', undefined);
    vi.stubEnv('MEDIA_DIR', undefined);
    vi.stubEnv('RAILWAY_VOLUME_MOUNT_PATH', undefined);
  });

  afterEach(() => vi.unstubAllEnvs());

  it('uses local storage outside Railway', () => {
    expect(dataDir()).toBe(path.resolve('data'));
    expect(mediaDir()).toBe(path.resolve('data', 'media'));
  });

  it('defaults both paths to the mounted Railway volume', () => {
    vi.stubEnv('RAILWAY_VOLUME_MOUNT_PATH', mount);
    expect(dataDir()).toBe(mount);
    expect(mediaDir()).toBe(path.join(mount, 'media'));
  });

  it('accepts directories on the mounted volume', () => {
    const appData = path.join(mount, 'site');
    vi.stubEnv('RAILWAY_VOLUME_MOUNT_PATH', mount);
    vi.stubEnv('DATA_DIR', appData);
    vi.stubEnv('MEDIA_DIR', path.join(mount, 'photos'));
    expect(dataDir()).toBe(appData);
    expect(mediaDir()).toBe(path.join(mount, 'photos'));
  });

  it('rejects storage outside the mounted volume', () => {
    vi.stubEnv('RAILWAY_VOLUME_MOUNT_PATH', mount);
    vi.stubEnv('DATA_DIR', './data');
    expect(() => dataDir()).toThrow('DATA_DIR');
    vi.stubEnv('MEDIA_DIR', `${mount}-other`);
    expect(() => mediaDir()).toThrow('MEDIA_DIR');
  });
});
