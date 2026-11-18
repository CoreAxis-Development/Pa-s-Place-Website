// Each test file gets its own throwaway in-memory database and media folder.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { resetDbForTests } from '../src/server/db/client';
import { resetRateLimits } from '../src/server/lib/rate-limit';

export function freshDatabase() {
  process.env.DATABASE_URL = 'memory://';
  process.env.MEDIA_DIR = mkdtempSync(path.join(tmpdir(), 'pasplace-media-'));
  resetDbForTests();
  resetRateLimits();
}
