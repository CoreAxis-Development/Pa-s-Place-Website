// Serves photo renditions from the media folder. File names are immutable
// (<id>/<width>.webp), so browsers may cache them for a year.
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { mediaDir } from '../../server/db/client';

export const GET: APIRoute = async ({ params }) => {
  const key = params.path ?? '';
  // exactly "<uuid>/<width>.webp" — nothing else can reach the file system
  if (!/^[0-9a-f-]{36}\/\d{2,5}\.webp$/.test(key)) return new Response('Not found', { status: 404 });
  try {
    const file = await readFile(path.join(mediaDir(), key));
    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
