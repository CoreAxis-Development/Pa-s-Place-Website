// Single-instance content ("documents"): site settings and per-page copy.
// Each document has a zod schema (the stored shape, with defaults) and a list
// of field descriptors that the admin portal turns into an edit form — adding
// an editable field is one line in each.
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, schema } from '../db/client';
import { bumpContentVersion } from './cache';

const text = (fallback = '') => z.string().trim().max(2000).default(fallback);
const mediaRef = () => z.string().max(64).nullable().default(null);
const lines = (fallback: string[] = []) => z.array(z.string().trim().min(1).max(300)).max(30).default(fallback);

export const settingsSchema = z.object({
  siteName: text("Pa's Place"),
  tagline: text('Affordable family holidays and venue hire in Pennington, KwaZulu-Natal'),
  organisation: z
    .object({
      legalName: text("Pa's Place NPC"),
      registration: text(''),
    })
    .prefault({}),
  contact: z
    .object({
      person: text(''),
      phone: text(''),
      phoneLink: text(''),
      email: text(''),
      address: text(''),
      mapUrl: text(''),
    })
    .prefault({}),
  pricing: z
    .object({
      accommodation: text(''),
      venue: text(''),
    })
    .prefault({}),
  booking: z
    .object({
      stayDepositPercent: z.coerce.number().int().min(0).max(100).default(50),
      venueDeposit: z.coerce.number().int().min(0).max(100000).default(500),
      checkIn: text('14:00'),
      checkOut: text('10:00'),
      paymentInstructions: text(''),
    })
    .prefault({}),
  notifications: z
    .object({
      email: text(''),
    })
    .prefault({}),
  social: z
    .object({
      facebook: text(''),
      instagram: text(''),
    })
    .prefault({}),
  announcement: z
    .object({
      enabled: z.boolean().default(false),
      text: text(''),
      href: text(''),
    })
    .prefault({}),
});

export const homepageSchema = z.object({
  heroEyebrow: text(''),
  heroTitle: text(''),
  heroSubtitle: text(''),
  heroImageId: mediaRef(),
  groundsTitle: text(''),
  groundsIntro: text(''),
  planTitle: text('Come for the day or stay the night'),
  roomsTitle: text('Find a room that fits'),
  roomsIntro: text('Bunks, family rooms or the whole house. Choose what suits your group and check your dates.'),
  directionsTitle: text('Getting here'),
  directionsIntro: text('In Kelso, Pennington, about an hour south of Durban and a two-minute walk from the beach.'),
  venueTitle: text(''),
  venueIntro: text(''),
  venueImageId: mediaRef(),
  missionTitle: text(''),
  missionText: text(''),
  missionImageId: mediaRef(),
});

export const stayPageSchema = z.object({
  title: text(''),
  intro: text(''),
  imageId: mediaRef(),
  included: lines(),
});

const partyScene = (title: string, description: string) => z.object({
  title: text(title),
  text: text(description),
}).prefault({});

const birthdaySchema = z.object({
  title: text('A birthday under the big trees'),
  intro: text('Where do we start? Here’s one way to play the day.'),
  cake: partyScene('Cake this way!', 'Meet your friends under the lapa. Where should the birthday cake go?'),
  golf: partyScene('Your turn to play', 'Try for a hole-in-one or bring a ball for a game on the lawn.'),
  slide: partyScene('Ready, set, splash', 'Bring your towel if you want a turn on the waterslides. Grown-ups keep watch at the pool.'),
  planningTitle: text('Planning for the grown-ups'),
  planningText: text('Pick a date and work out how many guests you’ll invite. Ask us about anything you need for the day, from setting up the lapa to planning pool time.'),
}).prefault({});

export const venuePageSchema = z.object({
  title: text(''),
  intro: text(''),
  imageId: mediaRef(),
  secondaryImageId: mediaRef(),
  included: lines(),
  occasions: lines(),
  birthday: birthdaySchema,
});

export type Settings = z.infer<typeof settingsSchema>;
export type Homepage = z.infer<typeof homepageSchema>;
export type StayPage = z.infer<typeof stayPageSchema>;
export type VenuePage = z.infer<typeof venuePageSchema>;

/* ---------- form descriptors ---------- */

export type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'url' | 'checkbox' | 'image' | 'lines';

export interface Field {
  /** dotted path into the document, e.g. "contact.phone" */
  name: string;
  label: string;
  type: FieldType;
  help?: string;
}

export interface FieldGroup {
  title: string;
  description?: string;
  fields: Field[];
}

export interface DocumentDef<T extends z.ZodType = z.ZodType> {
  key: string;
  title: string;
  description: string;
  /** where the content appears, linked from the edit screen */
  preview: string;
  schema: T;
  groups: FieldGroup[];
}

export const DOCUMENTS = {
  settings: {
    key: 'settings',
    title: 'Site settings',
    description: 'Contact details, deposit rules and the announcement bar.',
    preview: '/',
    schema: settingsSchema,
    groups: [
      {
        title: 'Identity',
        fields: [
          { name: 'siteName', label: 'Site name', type: 'text' },
          { name: 'tagline', label: 'Tagline', type: 'text', help: 'Used in page titles and search results.' },
          { name: 'organisation.legalName', label: 'Registered name', type: 'text' },
          { name: 'organisation.registration', label: 'NPC registration number', type: 'text', help: 'Shown in the footer when filled in.' },
        ],
      },
      {
        title: 'Contact details',
        description: 'Shown in the header, footer and on every booking page.',
        fields: [
          { name: 'contact.person', label: 'Contact person', type: 'text' },
          { name: 'contact.phone', label: 'Phone (as displayed)', type: 'text', help: 'e.g. 073 436 5056' },
          { name: 'contact.phoneLink', label: 'Phone (international format)', type: 'text', help: 'e.g. +27734365056 — used for tap-to-call and WhatsApp.' },
          { name: 'contact.email', label: 'Public email address', type: 'email' },
          { name: 'contact.address', label: 'Physical address', type: 'textarea' },
          { name: 'contact.mapUrl', label: 'Google Maps link', type: 'url' },
        ],
      },
      {
        title: 'Booking rules',
        description: 'Change room and venue rates or guest limits in Booking options. Prices displayed to visitors use those values and the deposit set here.',
        fields: [
          { name: 'booking.stayDepositPercent', label: 'Deposit for stays (%)', type: 'number', help: 'Share of the total asked for up front. Rounded up to the next R50.' },
          { name: 'booking.venueDeposit', label: 'Deposit for venue hire (Rand)', type: 'number' },
          { name: 'booking.checkIn', label: 'Check-in from', type: 'text' },
          { name: 'booking.checkOut', label: 'Check-out by', type: 'text' },
          { name: 'booking.paymentInstructions', label: 'How to pay the deposit', type: 'textarea', help: 'Shown to guests after they send a booking request, and in their confirmation email. Put banking details here.' },
        ],
      },
      {
        title: 'Notifications',
        fields: [
          { name: 'notifications.email', label: 'Send new enquiries and bookings to', type: 'email', help: 'Leave empty to use the public email address.' },
        ],
      },
      {
        title: 'Social links',
        fields: [
          { name: 'social.facebook', label: 'Facebook page', type: 'url' },
          { name: 'social.instagram', label: 'Instagram profile', type: 'url' },
        ],
      },
      {
        title: 'Announcement bar',
        description: 'A single line across the top of every page — for specials or closures.',
        fields: [
          { name: 'announcement.enabled', label: 'Show the announcement bar', type: 'checkbox' },
          { name: 'announcement.text', label: 'Message', type: 'text' },
          { name: 'announcement.href', label: 'Link (optional)', type: 'text', help: 'e.g. /book-a-stay' },
        ],
      },
    ],
  },
  homepage: {
    key: 'homepage',
    title: 'Home page',
    description: 'The hero and the section introductions on the front page.',
    preview: '/',
    schema: homepageSchema,
    groups: [
      {
        title: 'Hero',
        fields: [
          { name: 'heroEyebrow', label: 'Small line above the headline', type: 'text' },
          { name: 'heroTitle', label: 'Headline', type: 'text' },
          { name: 'heroSubtitle', label: 'Supporting text', type: 'textarea', help: 'Use {{stay_price}} or {{venue_price}} to show the current rates.' },
          { name: 'heroImageId', label: 'Hero photo', type: 'image' },
        ],
      },
      {
        title: 'The grounds',
        fields: [
          { name: 'groundsTitle', label: 'Heading', type: 'text' },
          { name: 'groundsIntro', label: 'Introduction', type: 'textarea' },
        ],
      },
      {
        title: 'Planning a visit',
        fields: [
          { name: 'planTitle', label: 'Section heading', type: 'text' },
          { name: 'roomsTitle', label: 'Room options heading', type: 'text' },
          { name: 'roomsIntro', label: 'Room options introduction', type: 'textarea' },
          { name: 'directionsTitle', label: 'Directions heading', type: 'text' },
          { name: 'directionsIntro', label: 'Directions introduction', type: 'textarea' },
        ],
      },
      {
        title: 'Venue hire teaser',
        fields: [
          { name: 'venueTitle', label: 'Heading', type: 'text' },
          { name: 'venueIntro', label: 'Introduction', type: 'textarea' },
          { name: 'venueImageId', label: 'Photo', type: 'image' },
        ],
      },
      {
        title: 'Our cause',
        fields: [
          { name: 'missionTitle', label: 'Heading', type: 'text' },
          { name: 'missionText', label: 'Text', type: 'textarea' },
          { name: 'missionImageId', label: 'Photo', type: 'image' },
        ],
      },
    ],
  },
  stayPage: {
    key: 'stayPage',
    title: 'Book a stay page',
    description: 'Heading, introduction and the "what’s included" list.',
    preview: '/book-a-stay',
    schema: stayPageSchema,
    groups: [
      {
        title: 'Page header',
        fields: [
          { name: 'title', label: 'Heading', type: 'text' },
          { name: 'intro', label: 'Introduction', type: 'textarea' },
          { name: 'imageId', label: 'Photo', type: 'image' },
        ],
      },
      {
        title: 'What’s included',
        fields: [{ name: 'included', label: 'One item per line', type: 'lines' }],
      },
    ],
  },
  venuePage: {
    key: 'venuePage',
    title: 'Venue hire page',
    description: 'Venue wording, inclusions, occasions and the kids’ birthday playbook.',
    preview: '/venue-hire',
    schema: venuePageSchema,
    groups: [
      {
        title: 'Page header',
        fields: [
          { name: 'title', label: 'Heading', type: 'text' },
          { name: 'intro', label: 'Introduction', type: 'textarea' },
          { name: 'imageId', label: 'Main photo', type: 'image' },
          { name: 'secondaryImageId', label: 'Birthday playbook photo', type: 'image' },
        ],
      },
      {
        title: 'What’s included',
        fields: [{ name: 'included', label: 'One item per line', type: 'lines' }],
      },
      {
        title: 'Occasions',
        fields: [{ name: 'occasions', label: 'One occasion per line', type: 'lines' }],
      },
      {
        title: 'Birthday playbook',
        fields: [
          { name: 'birthday.title', label: 'Heading', type: 'text' },
          { name: 'birthday.intro', label: 'Introduction', type: 'textarea' },
          { name: 'birthday.cake.title', label: 'Lapa scene heading', type: 'text' },
          { name: 'birthday.cake.text', label: 'Lapa scene text', type: 'textarea' },
          { name: 'birthday.golf.title', label: 'Games scene heading', type: 'text' },
          { name: 'birthday.golf.text', label: 'Games scene text', type: 'textarea' },
          { name: 'birthday.slide.title', label: 'Pool scene heading', type: 'text' },
          { name: 'birthday.slide.text', label: 'Pool scene text', type: 'textarea' },
          { name: 'birthday.planningTitle', label: 'Planning notes heading', type: 'text' },
          { name: 'birthday.planningText', label: 'Planning notes text', type: 'textarea' },
        ],
      },
    ],
  },
} satisfies Record<string, DocumentDef>;

export type DocumentKey = keyof typeof DOCUMENTS;
export const isDocumentKey = (k: string): k is DocumentKey => Object.hasOwn(DOCUMENTS, k);

type DocValue<K extends DocumentKey> = z.infer<(typeof DOCUMENTS)[K]['schema']>;

/** Read a document; missing or outdated stored values are filled from schema defaults. */
export async function getDocument<K extends DocumentKey>(key: K): Promise<DocValue<K>> {
  const db = await getDb();
  const [row] = await db.select().from(schema.documents).where(eq(schema.documents.key, key)).limit(1);
  const parsed = DOCUMENTS[key].schema.safeParse(row?.value ?? {});
  return (parsed.success ? parsed.data : DOCUMENTS[key].schema.parse({})) as DocValue<K>;
}

export async function saveDocument<K extends DocumentKey>(key: K, value: unknown, userId: string | null) {
  const data = DOCUMENTS[key].schema.parse(value);
  const db = await getDb();
  await db
    .insert(schema.documents)
    .values({ key, value: data, updatedBy: userId })
    .onConflictDoUpdate({
      target: schema.documents.key,
      set: { value: data, updatedBy: userId, updatedAt: new Date() },
    });
  bumpContentVersion();
  return data as DocValue<K>;
}

/* ---------- dotted-path helpers for the generated forms ---------- */

export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let target = obj;
  for (const k of keys.slice(0, -1)) {
    if (!target[k] || typeof target[k] !== 'object') target[k] = {};
    target = target[k] as Record<string, unknown>;
  }
  target[keys[keys.length - 1]] = value;
}

/** Turn a submitted admin form into a plain object ready for schema validation. */
export function formToDocument(def: DocumentDef, form: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of def.groups.flatMap((g) => g.fields)) {
    const raw = form.get(field.name);
    const str = typeof raw === 'string' ? raw : '';
    let value: unknown = str;
    if (field.type === 'checkbox') value = raw === 'on' || raw === 'true';
    else if (field.type === 'image') value = str || null;
    else if (field.type === 'lines')
      value = str
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    setPath(out, field.name, value);
  }
  return out;
}
