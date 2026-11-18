// Collections (booking options, grounds features, gallery, FAQs) and the
// cached snapshot that public pages render from.
import { asc, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, schema } from '../db/client';
import type { Amenity, Faq, StayOption } from '../db/schema';
import { newId, slugify } from '../lib/ids';
import { formatRand } from '../lib/pricing';
import { bumpContentVersion, cached } from './cache';
import { getDocument, type Homepage, type Settings, type StayPage, type VenuePage } from './documents';
import { toPicture, type Picture } from './media';

/* ---------- validation ---------- */

const checkbox = z.preprocess((v) => v === true || v === 'on' || v === 'true', z.boolean());
const mediaId = z.preprocess((v) => (typeof v === 'string' && v ? v : null), z.string().max(64).nullable());
const position = z.coerce.number().int().min(0).max(9999).default(0);

export const optionInput = z
  .object({
    name: z.string().trim().min(2, 'Give the option a name.').max(80),
    blurb: z.string().trim().max(160).default(''),
    description: z.string().trim().max(2000).default(''),
    kind: z.enum(['stay', 'venue']),
    exclusive: checkbox,
    capacityLabel: z.string().trim().max(60).default(''),
    minPeople: z.coerce.number().int().min(1, 'Minimum people must be at least 1.').max(500),
    maxPeople: z.coerce.number().int().min(1).max(500),
    rate: z.coerce.number().int().min(0, 'The rate cannot be negative.').max(100000),
    imageId: mediaId,
    position,
    published: checkbox,
  })
  .refine((o) => o.maxPeople >= o.minPeople, { message: 'Maximum people cannot be less than the minimum.', path: ['maxPeople'] });

export const ICONS = ['sun', 'pool', 'golf', 'lapa', 'tree', 'beach', 'braai', 'play', 'bed', 'heart'] as const;

export const amenityInput = z.object({
  title: z.string().trim().min(2, 'Give the feature a title.').max(80),
  description: z.string().trim().max(600).default(''),
  icon: z.enum(ICONS).default('sun'),
  imageId: mediaId,
  position,
  published: checkbox,
});

export const FAQ_TOPICS = [
  { value: 'stays', label: 'Stays' },
  { value: 'venue', label: 'Venue hire' },
  { value: 'general', label: 'General' },
] as const;

export const faqInput = z.object({
  question: z.string().trim().min(5, 'Write the question.').max(200),
  answer: z.string().trim().min(5, 'Write the answer.').max(2000),
  topic: z.enum(['stays', 'venue', 'general']),
  position,
  published: checkbox,
});

export const GALLERY_CATEGORIES = [
  { value: 'pool', label: 'Pool & slides' },
  { value: 'grounds', label: 'Gardens' },
  { value: 'mini-golf', label: 'Mini golf' },
  { value: 'venue', label: 'Lapa & venue' },
  { value: 'celebrations', label: 'Celebrations' },
  { value: 'beach', label: 'Beach' },
  { value: 'retreats', label: 'Retreats' },
] as const;

export const galleryInput = z.object({
  mediaId: z.string().min(1, 'Choose a photo.').max(64),
  caption: z.string().trim().max(200).default(''),
  category: z.enum(GALLERY_CATEGORIES.map((c) => c.value) as [string, ...string[]]),
  position,
  published: checkbox,
});

/* ---------- booking options ---------- */

export async function listOptions(opts: { publishedOnly?: boolean } = {}) {
  const db = await getDb();
  return db.query.stayOptions.findMany({
    where: opts.publishedOnly ? eq(schema.stayOptions.published, true) : undefined,
    with: { image: true },
    orderBy: [asc(schema.stayOptions.position), asc(schema.stayOptions.name)],
  });
}

export async function getOption(id: string) {
  const db = await getDb();
  return (await db.query.stayOptions.findFirst({ where: eq(schema.stayOptions.id, id), with: { image: true } })) ?? null;
}

export async function getOptionBySlug(slug: string) {
  const db = await getDb();
  return (await db.query.stayOptions.findFirst({ where: eq(schema.stayOptions.slug, slug) })) ?? null;
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const db = await getDb();
  const root = slugify(base) || 'option';
  for (let n = 1; ; n++) {
    const slug = n === 1 ? root : `${root}-${n}`;
    const [hit] = await db
      .select({ id: schema.stayOptions.id })
      .from(schema.stayOptions)
      .where(eq(schema.stayOptions.slug, slug))
      .limit(1);
    if (!hit || hit.id === ignoreId) return slug;
  }
}

export async function createOption(input: z.infer<typeof optionInput>) {
  const db = await getDb();
  const [row] = await db
    .insert(schema.stayOptions)
    .values({ id: newId(), slug: await uniqueSlug(input.name), ...input })
    .returning();
  bumpContentVersion();
  return row;
}

export async function updateOption(id: string, input: z.infer<typeof optionInput>) {
  const db = await getDb();
  // the slug is the option's public address and is left alone on rename
  await db
    .update(schema.stayOptions)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schema.stayOptions.id, id));
  bumpContentVersion();
}

/** Options with bookings cannot be deleted (history must stay intact) — unpublish instead. */
export async function deleteOption(id: string): Promise<{ ok: boolean; reason?: string }> {
  const db = await getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.bookings)
    .where(eq(schema.bookings.optionId, id));
  if (count > 0) {
    return { ok: false, reason: `This option has ${count} booking${count === 1 ? '' : 's'} on record. Unpublish it instead so the history is kept.` };
  }
  await db.delete(schema.stayOptions).where(eq(schema.stayOptions.id, id));
  bumpContentVersion();
  return { ok: true };
}

/* ---------- grounds features ---------- */

export async function listAmenities(opts: { publishedOnly?: boolean } = {}) {
  const db = await getDb();
  return db.query.amenities.findMany({
    where: opts.publishedOnly ? eq(schema.amenities.published, true) : undefined,
    with: { image: true },
    orderBy: [asc(schema.amenities.position), asc(schema.amenities.title)],
  });
}

export async function getAmenity(id: string) {
  const db = await getDb();
  return (await db.query.amenities.findFirst({ where: eq(schema.amenities.id, id), with: { image: true } })) ?? null;
}

export async function saveAmenity(id: string | null, input: z.infer<typeof amenityInput>) {
  const db = await getDb();
  if (id) await db.update(schema.amenities).set({ ...input, updatedAt: new Date() }).where(eq(schema.amenities.id, id));
  else await db.insert(schema.amenities).values({ id: (id = newId()), ...input });
  bumpContentVersion();
  return id;
}

export async function deleteAmenity(id: string) {
  const db = await getDb();
  await db.delete(schema.amenities).where(eq(schema.amenities.id, id));
  bumpContentVersion();
}

/* ---------- FAQs ---------- */

export async function listFaqs(opts: { publishedOnly?: boolean } = {}) {
  const db = await getDb();
  return db
    .select()
    .from(schema.faqs)
    .where(opts.publishedOnly ? eq(schema.faqs.published, true) : undefined)
    .orderBy(asc(schema.faqs.topic), asc(schema.faqs.position), asc(schema.faqs.createdAt));
}

export async function getFaq(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(schema.faqs).where(eq(schema.faqs.id, id)).limit(1);
  return row ?? null;
}

export async function saveFaq(id: string | null, input: z.infer<typeof faqInput>) {
  const db = await getDb();
  if (id) await db.update(schema.faqs).set({ ...input, updatedAt: new Date() }).where(eq(schema.faqs.id, id));
  else await db.insert(schema.faqs).values({ id: (id = newId()), ...input });
  bumpContentVersion();
  return id;
}

export async function deleteFaq(id: string) {
  const db = await getDb();
  await db.delete(schema.faqs).where(eq(schema.faqs.id, id));
  bumpContentVersion();
}

/* ---------- gallery ---------- */

export async function listGallery(opts: { publishedOnly?: boolean } = {}) {
  const db = await getDb();
  return db.query.galleryItems.findMany({
    where: opts.publishedOnly ? eq(schema.galleryItems.published, true) : undefined,
    with: { media: true },
    orderBy: [asc(schema.galleryItems.position), asc(schema.galleryItems.createdAt)],
  });
}

export async function getGalleryItem(id: string) {
  const db = await getDb();
  return (await db.query.galleryItems.findFirst({ where: eq(schema.galleryItems.id, id), with: { media: true } })) ?? null;
}

export async function saveGalleryItem(id: string | null, input: z.infer<typeof galleryInput>) {
  const db = await getDb();
  if (id) await db.update(schema.galleryItems).set(input).where(eq(schema.galleryItems.id, id));
  else await db.insert(schema.galleryItems).values({ id: (id = newId()), ...input });
  bumpContentVersion();
  return id;
}

export async function deleteGalleryItem(id: string) {
  const db = await getDb();
  await db.delete(schema.galleryItems).where(eq(schema.galleryItems.id, id));
  bumpContentVersion();
}

/* ---------- the public snapshot ---------- */

export interface PublicOption {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  description: string;
  kind: 'stay' | 'venue';
  capacityLabel: string;
  minPeople: number;
  maxPeople: number;
  rate: number;
  /** "R200 pp / night" */
  rateLabel: string;
  image: Picture | null;
}

export interface PublicAmenity extends Pick<Amenity, 'id' | 'title' | 'description' | 'icon'> {
  image: Picture | null;
}

export interface PublicGalleryItem {
  id: string;
  caption: string;
  category: string;
  categoryLabel: string;
  image: Picture;
}

export type PublicFaq = Pick<Faq, 'id' | 'question' | 'answer' | 'topic'>;

export interface SiteContent {
  settings: Settings;
  homepage: Homepage & { heroImage: Picture | null; venueImage: Picture | null; missionImage: Picture | null };
  stayPage: StayPage & { image: Picture | null };
  venuePage: VenuePage & { image: Picture | null; secondaryImage: Picture | null };
  options: PublicOption[];
  amenities: PublicAmenity[];
  gallery: PublicGalleryItem[];
  galleryCategories: { value: string; label: string; count: number }[];
  faqs: PublicFaq[];
  /** wa.me link built from the contact number, or null */
  whatsappUrl: string | null;
}

export const toPublicOption = (o: StayOption & { image: Parameters<typeof toPicture>[0] | null }): PublicOption => ({
  id: o.id,
  slug: o.slug,
  name: o.name,
  blurb: o.blurb,
  description: o.description,
  kind: o.kind,
  capacityLabel: o.capacityLabel,
  minPeople: o.minPeople,
  maxPeople: o.maxPeople,
  rate: o.rate,
  rateLabel: `${formatRand(o.rate)} pp / ${o.kind === 'venue' ? 'day' : 'night'}`,
  image: o.image ? toPicture(o.image) : null,
});

async function loadSite(): Promise<SiteContent> {
  const db = await getDb();
  const [settings, homepage, stayPage, venuePage, options, amenities, gallery, faqs] = await Promise.all([
    getDocument('settings'),
    getDocument('homepage'),
    getDocument('stayPage'),
    getDocument('venuePage'),
    listOptions({ publishedOnly: true }),
    listAmenities({ publishedOnly: true }),
    listGallery({ publishedOnly: true }),
    listFaqs({ publishedOnly: true }),
  ]);

  const refs = [
    homepage.heroImageId,
    homepage.venueImageId,
    homepage.missionImageId,
    stayPage.imageId,
    venuePage.imageId,
    venuePage.secondaryImageId,
  ].filter((id): id is string => Boolean(id));
  const rows = refs.length ? await db.select().from(schema.media).where(inArray(schema.media.id, refs)) : [];
  const pictures = new Map(rows.map((m) => [m.id, toPicture(m)]));
  const pic = (id: string | null) => (id ? (pictures.get(id) ?? null) : null);

  const galleryItems = gallery.map((g) => ({
    id: g.id,
    caption: g.caption || g.media.caption,
    category: g.category,
    categoryLabel: GALLERY_CATEGORIES.find((c) => c.value === g.category)?.label ?? g.category,
    image: toPicture(g.media),
  }));

  const digits = settings.contact.phoneLink.replace(/\D/g, '');

  return {
    settings,
    homepage: {
      ...homepage,
      heroImage: pic(homepage.heroImageId),
      venueImage: pic(homepage.venueImageId),
      missionImage: pic(homepage.missionImageId),
    },
    stayPage: { ...stayPage, image: pic(stayPage.imageId) },
    venuePage: { ...venuePage, image: pic(venuePage.imageId), secondaryImage: pic(venuePage.secondaryImageId) },
    options: options.map(toPublicOption),
    amenities: amenities.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      image: a.image ? toPicture(a.image) : null,
    })),
    gallery: galleryItems,
    galleryCategories: GALLERY_CATEGORIES.map((c) => ({
      ...c,
      count: galleryItems.filter((g) => g.category === c.value).length,
    })).filter((c) => c.count > 0),
    faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, topic: f.topic })),
    whatsappUrl: digits ? `https://wa.me/${digits}` : null,
  };
}

/** Everything the public site renders, cached until the next admin edit. */
export const getSite = cached(30_000, loadSite);
