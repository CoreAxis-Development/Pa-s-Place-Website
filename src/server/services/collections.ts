// Describes each editable collection once, so the admin portal can render the
// list and the edit form for all of them from the same two pages.
import type { ZodType } from 'zod';
import {
  FAQ_TOPICS,
  GALLERY_CATEGORIES,
  ICONS,
  amenityInput,
  createOption,
  deleteAmenity,
  deleteFaq,
  deleteGalleryItem,
  deleteOption,
  faqInput,
  galleryInput,
  getAmenity,
  getFaq,
  getGalleryItem,
  getOption,
  listAmenities,
  listFaqs,
  listGallery,
  listOptions,
  optionInput,
  saveAmenity,
  saveFaq,
  saveGalleryItem,
  updateOption,
} from './content';
import { formatRand } from '../lib/pricing';
import { thumbUrl } from './media';
import type { Media } from '../db/schema';

export interface CollectionField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'image';
  help?: string;
  options?: readonly { value: string; label: string }[];
  /** value used for a new item */
  initial?: string | number | boolean;
  wide?: boolean;
  required?: boolean;
}

export interface CollectionRow {
  id: string;
  title: string;
  detail: string;
  thumb: string | null;
  published: boolean;
  position: number;
}

type Item = Record<string, unknown> & { id: string };

export interface CollectionDef {
  key: string;
  title: string;
  singular: string;
  description: string;
  preview: string;
  schema: ZodType;
  fields: CollectionField[];
  list: () => Promise<CollectionRow[]>;
  get: (id: string) => Promise<Item | null>;
  save: (id: string | null, input: never) => Promise<string>;
  remove: (id: string) => Promise<{ ok: boolean; reason?: string }>;
}

const published: CollectionField = { name: 'published', label: 'Show on the website', type: 'checkbox', initial: true };
const position: CollectionField = { name: 'position', label: 'Order', type: 'number', help: 'Lower numbers come first.', initial: 10 };
const thumb = (m: Media | null | undefined) => (m ? thumbUrl(m) : null);
const ok = async (p: Promise<void>) => {
  await p;
  return { ok: true };
};

export const COLLECTIONS: Record<string, CollectionDef> = {
  options: {
    key: 'options',
    title: 'Booking options',
    singular: 'booking option',
    description: 'The rooms, the whole house and the venue: what guests can book, and at what rate.',
    preview: '/book-a-stay',
    schema: optionInput,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'kind', label: 'Type', type: 'select', initial: 'stay', options: [{ value: 'stay', label: 'Overnight stay (priced per night)' }, { value: 'venue', label: 'Day venue (priced per day)' }] },
      { name: 'blurb', label: 'One-line description', type: 'text', wide: true },
      { name: 'description', label: 'Longer description', type: 'textarea', wide: true },
      { name: 'rate', label: 'Rate per person (Rand)', type: 'number', initial: 200, required: true },
      { name: 'capacityLabel', label: 'Capacity label', type: 'text', help: 'e.g. Sleeps 2 to 4' },
      { name: 'minPeople', label: 'Minimum people', type: 'number', initial: 2, required: true },
      { name: 'maxPeople', label: 'Maximum people', type: 'number', initial: 6, required: true },
      { name: 'exclusive', label: 'Takes the whole property', type: 'checkbox', help: 'When ticked, booking this blocks every other stay for those nights, and any room booking blocks this.' },
      { name: 'imageId', label: 'Photo', type: 'image', wide: true },
      position,
      published,
    ],
    list: async () =>
      (await listOptions()).map((o) => ({
        id: o.id,
        title: o.name,
        detail: `${formatRand(o.rate)} pp per ${o.kind === 'venue' ? 'day' : 'night'} · ${o.minPeople} to ${o.maxPeople} people${o.exclusive ? ' · whole property' : ''}`,
        thumb: thumb(o.image),
        published: o.published,
        position: o.position,
      })),
    get: getOption,
    save: async (id, input) => {
      if (id) {
        await updateOption(id, input);
        return id;
      }
      return (await createOption(input)).id;
    },
    remove: deleteOption,
  },
  amenities: {
    key: 'amenities',
    title: 'Grounds features',
    singular: 'feature',
    description: 'The pool, mini-golf, lapa and gardens shown on the home page.',
    preview: '/#grounds',
    schema: amenityInput,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'select', initial: 'sun', options: ICONS.map((i) => ({ value: i, label: i.charAt(0).toUpperCase() + i.slice(1) })) },
      { name: 'description', label: 'Description', type: 'textarea', wide: true },
      { name: 'imageId', label: 'Photo', type: 'image', wide: true },
      position,
      published,
    ],
    list: async () =>
      (await listAmenities()).map((a) => ({ id: a.id, title: a.title, detail: a.description, thumb: thumb(a.image), published: a.published, position: a.position })),
    get: getAmenity,
    save: saveAmenity,
    remove: (id) => ok(deleteAmenity(id)),
  },
  gallery: {
    key: 'gallery',
    title: 'Photo gallery',
    singular: 'gallery photo',
    description: 'Which photos appear in the gallery, in what order and under which heading.',
    preview: '/gallery',
    schema: galleryInput,
    fields: [
      { name: 'mediaId', label: 'Photo', type: 'image', wide: true, required: true },
      { name: 'category', label: 'Category', type: 'select', initial: 'grounds', options: GALLERY_CATEGORIES },
      { name: 'caption', label: 'Caption', type: 'text', help: 'Eight words or fewer. Leave empty to use the photo’s own caption.' },
      position,
      published,
    ],
    list: async () =>
      (await listGallery()).map((g) => ({
        id: g.id,
        title: g.caption || g.media.caption || g.media.alt || g.media.filename,
        detail: `${GALLERY_CATEGORIES.find((c) => c.value === g.category)?.label ?? g.category}${g.media.needsConsent ? ' · consent not yet recorded' : ''}`,
        thumb: thumb(g.media),
        published: g.published,
        position: g.position,
      })),
    get: getGalleryItem,
    save: saveGalleryItem,
    remove: (id) => ok(deleteGalleryItem(id)),
  },
  faqs: {
    key: 'faqs',
    title: 'Questions and answers',
    singular: 'question',
    description: 'The frequently asked questions on the home, booking and venue pages.',
    preview: '/book-a-stay',
    schema: faqInput,
    fields: [
      { name: 'question', label: 'Question', type: 'text', wide: true, required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', help: 'Use {{stay_price}} or {{venue_price}} to insert the current public price.', wide: true, required: true },
      { name: 'topic', label: 'Shown on', type: 'select', initial: 'general', options: FAQ_TOPICS },
      position,
      published,
    ],
    list: async () =>
      (await listFaqs()).map((f) => ({
        id: f.id,
        title: f.question,
        detail: `${FAQ_TOPICS.find((t) => t.value === f.topic)?.label ?? f.topic} · ${f.answer}`,
        thumb: null,
        published: f.published,
        position: f.position,
      })),
    get: getFaq,
    save: saveFaq,
    remove: (id) => ok(deleteFaq(id)),
  },
};

/** Raw form values for the fields of a collection, ready for its schema. */
export function formValues(def: CollectionDef, form: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of def.fields) {
    const raw = form.get(f.name);
    out[f.name] = f.type === 'checkbox' ? raw === 'on' : typeof raw === 'string' ? raw : '';
  }
  return out;
}
