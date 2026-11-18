// The media library. Every upload is decoded, auto-rotated, stripped of
// metadata (camera GPS never reaches the public site) and stored as a ladder
// of WebP renditions; pages pick the right one with srcset.
import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import sharp, { type Metadata } from 'sharp';
import { getDb, mediaDir, schema } from '../db/client';
import type { Media, MediaVariant } from '../db/schema';
import { newId } from '../lib/ids';
import { bumpContentVersion } from './cache';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const WIDTHS = [480, 960, 1600, 2400];
const ACCEPTED = new Set(['jpeg', 'png', 'webp', 'avif', 'tiff', 'heif']);

export const MEDIA_CATEGORIES = [
  { value: 'pool', label: 'Pool & slides' },
  { value: 'grounds', label: 'Gardens & grounds' },
  { value: 'mini-golf', label: 'Mini golf' },
  { value: 'venue', label: 'Lapa & venue' },
  { value: 'celebrations', label: 'Celebrations' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'beach', label: 'Beach & coast' },
  { value: 'retreats', label: "Children's retreats" },
  { value: 'general', label: 'General' },
] as const;

export const categoryLabel = (value: string) =>
  MEDIA_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export class MediaError extends Error {}

export interface ImportOptions {
  filename: string;
  alt?: string;
  caption?: string;
  category?: string;
  needsConsent?: boolean;
  uploadedBy?: string | null;
}

/** Store an image. Uploading the same file twice returns the existing record. */
export async function importImage(input: Buffer, opts: ImportOptions): Promise<{ media: Media; duplicate: boolean }> {
  if (input.byteLength === 0) throw new MediaError('That file is empty.');
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new MediaError('Photos must be 15 MB or smaller.');

  const db = await getDb();
  const checksum = createHash('sha256').update(input).digest('hex');
  const [existing] = await db.select().from(schema.media).where(eq(schema.media.checksum, checksum)).limit(1);
  if (existing) return { media: existing, duplicate: true };

  let meta: Metadata;
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new MediaError('That file is not an image we can read. Use JPEG, PNG or WebP.');
  }
  if (!meta.format || !ACCEPTED.has(meta.format) || !meta.width || !meta.height) {
    throw new MediaError('Unsupported image type. Use JPEG, PNG or WebP.');
  }

  // .rotate() with no angle applies the EXIF orientation, then drops the tag
  const upright = sharp(input, { failOn: 'error' }).rotate();
  // EXIF orientations 5-8 are the sideways ones: width and height trade places
  const sideways = (meta.orientation ?? 1) >= 5;
  const width = sideways ? meta.height : meta.width;
  const height = sideways ? meta.width : meta.height;

  const id = newId();
  const dir = path.join(mediaDir(), id);
  await mkdir(dir, { recursive: true });

  const targets = WIDTHS.filter((w) => w < width);
  // always keep one rendition at (or capped to) the original width
  targets.push(Math.min(width, WIDTHS[WIDTHS.length - 1]));
  const widths = [...new Set(targets)].sort((a, b) => a - b);

  const variants: MediaVariant[] = [];
  try {
    for (const w of widths) {
      const out = await upright
        .clone()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toBuffer({ resolveWithObject: true });
      const key = `${id}/${w}.webp`;
      await writeFile(path.join(mediaDir(), key), out.data);
      variants.push({ w: out.info.width, h: out.info.height, key });
    }

    const { dominant } = await upright.clone().resize(64).stats();
    const hex = (n: number) => n.toString(16).padStart(2, '0');

    const row = {
      id,
      filename: opts.filename.slice(0, 200),
      alt: opts.alt?.trim() ?? '',
      caption: opts.caption?.trim() ?? '',
      category: opts.category ?? 'general',
      width,
      height,
      bytes: input.byteLength,
      color: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
      variants,
      checksum,
      needsConsent: opts.needsConsent ?? false,
      uploadedBy: opts.uploadedBy ?? null,
    };
    const [media] = await db.insert(schema.media).values(row).returning();
    bumpContentVersion();
    return { media, duplicate: false };
  } catch (err) {
    await rm(dir, { recursive: true, force: true });
    throw err;
  }
}

export async function listMedia(opts: { category?: string; q?: string; limit?: number; offset?: number } = {}) {
  const db = await getDb();
  const q = opts.q?.trim();
  const where = and(
    opts.category ? eq(schema.media.category, opts.category) : undefined,
    q
      ? or(
          ilike(schema.media.alt, `%${q}%`),
          ilike(schema.media.caption, `%${q}%`),
          ilike(schema.media.filename, `%${q}%`)
        )
      : undefined
  );
  const rows = await db
    .select()
    .from(schema.media)
    .where(where)
    .orderBy(desc(schema.media.createdAt), desc(schema.media.id))
    .limit(opts.limit ?? 200)
    .offset(opts.offset ?? 0);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.media).where(where);
  return { rows, total: count };
}

export async function getMedia(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(schema.media).where(eq(schema.media.id, id)).limit(1);
  return row ?? null;
}

export async function updateMedia(
  id: string,
  patch: { alt: string; caption: string; category: string; needsConsent: boolean }
) {
  const db = await getDb();
  await db
    .update(schema.media)
    .set({
      alt: patch.alt.trim().slice(0, 300),
      caption: patch.caption.trim().slice(0, 300),
      category: patch.category,
      needsConsent: patch.needsConsent,
    })
    .where(eq(schema.media.id, id));
  bumpContentVersion();
}

/** Where a photo is used, so staff are told before they delete it. */
export async function mediaUsage(id: string): Promise<string[]> {
  const db = await getDb();
  const uses: string[] = [];
  const options = await db
    .select({ name: schema.stayOptions.name })
    .from(schema.stayOptions)
    .where(eq(schema.stayOptions.imageId, id));
  uses.push(...options.map((o) => `Booking option “${o.name}”`));
  const amenities = await db
    .select({ title: schema.amenities.title })
    .from(schema.amenities)
    .where(eq(schema.amenities.imageId, id));
  uses.push(...amenities.map((a) => `Grounds feature “${a.title}”`));
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.galleryItems)
    .where(eq(schema.galleryItems.mediaId, id));
  if (count) uses.push('The photo gallery');
  const docs = await db.select().from(schema.documents);
  for (const d of docs) if (JSON.stringify(d.value).includes(id)) uses.push(`Page content: ${d.key}`);
  return uses;
}

export async function deleteMedia(id: string) {
  const db = await getDb();
  await db.delete(schema.media).where(eq(schema.media.id, id));
  await rm(path.join(mediaDir(), id), { recursive: true, force: true });
  bumpContentVersion();
}

/* ---------- what pages render ---------- */

export interface Picture {
  id: string;
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  color: string;
  category: string;
}

export const variantUrl = (v: MediaVariant) => `/media/${v.key}`;

export function toPicture(m: Media): Picture {
  const variants = [...m.variants].sort((a, b) => a.w - b.w);
  // a mid-size default for browsers that ignore srcset
  const fallback = variants.find((v) => v.w >= 960) ?? variants[variants.length - 1];
  return {
    id: m.id,
    src: variantUrl(fallback),
    srcset: variants.map((v) => `${variantUrl(v)} ${v.w}w`).join(', '),
    width: fallback.w,
    height: fallback.h,
    alt: m.alt,
    caption: m.caption,
    color: m.color,
    category: m.category,
  };
}

/** Smallest rendition, for admin thumbnails. */
export const thumbUrl = (m: Pick<Media, 'variants'>) =>
  variantUrl([...m.variants].sort((a, b) => a.w - b.w)[0]);
