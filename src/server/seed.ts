// First-run content. On an empty database this loads the photos in
// seed/photos into the media library and creates the starting content, so a
// fresh deployment is a complete site. It never runs again once content exists.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { developmentOwnerEmail, initialOwnerPasswordProblem } from './auth/password';
import { getDb, schema } from './db/client';
import { newId } from './lib/ids';
import { logActivity } from './services/activity';
import { bumpContentVersion } from './services/cache';
import { saveDocument } from './services/documents';
import { importImage } from './services/media';
import { createInitialOwner, userCount, userInput } from './services/users';

interface SeedPhoto {
  key: string;
  file: string;
  category: string;
  alt: string;
  caption: string;
  /** region of the original to keep: [left, top, width, height] */
  crop?: [number, number, number, number];
  needsConsent?: boolean;
}

// Crops follow the photo map in docs/superpowers/specs/2026-11-17-brand-identity.md:
// they trim grey sky and clutter, and remove an identifiable child from one frame.
const PHOTOS: SeedPhoto[] = [
  {
    key: 'bigTree',
    file: 'grounds/garden-big-tree.jpg',
    category: 'grounds',
    alt: 'A huge spreading tree shading the lawn, with an adult and child walking beneath it',
    caption: 'The big tree on the main lawn',
    crop: [90, 60, 870, 1088],
  },
  {
    key: 'lawn',
    file: 'grounds/garden-lawn-canopy.jpg',
    category: 'grounds',
    alt: 'A wide green lawn under a canopy of old trees',
    caption: 'Shaded lawns under the old trees',
    crop: [0, 60, 1280, 853],
  },
  {
    key: 'pool',
    file: 'pool/pool-waterslides.jpg',
    category: 'pool',
    alt: 'The swimming pool with pink, blue, green and yellow waterslides, seen from the lawn',
    caption: 'The pool and waterslides',
    crop: [200, 430, 1080, 720],
  },
  {
    key: 'golfCourse',
    file: 'mini-golf/mini-golf-course.jpg',
    category: 'mini-golf',
    alt: 'The mini-golf course laid out on the lawn in dappled shade',
    caption: 'Mini-golf under the big trees',
    crop: [0, 180, 860, 1075],
  },
  {
    key: 'golfFamily',
    file: 'mini-golf/mini-golf-family.jpg',
    category: 'mini-golf',
    alt: 'A family lining up a putt on the mini-golf course',
    caption: 'A round of mini-golf',
  },
  {
    key: 'lapa',
    file: 'venue/lapa-party-wide.jpg',
    category: 'venue',
    alt: 'The covered lapa set up for a party, with the waterslides behind it',
    caption: 'The lapa, right beside the pool',
    crop: [0, 250, 1280, 853],
  },
  {
    key: 'birthdayTable',
    file: 'celebrations/lapa-birthday-table.jpg',
    category: 'celebrations',
    alt: 'A birthday table with a gingham cloth, balloons and a banner under the lapa',
    caption: 'A birthday under the lapa',
    crop: [0, 0, 1200, 1120],
  },
  // Held back: recognisable children. Not placed anywhere until consent is recorded.
  {
    key: 'childPutting',
    file: 'mini-golf/mini-golf-child-putting.jpg',
    category: 'mini-golf',
    alt: 'A young child putting on the mini-golf course',
    caption: 'Mini-golf for every age',
    needsConsent: true,
  },
  {
    key: 'balloons',
    file: 'celebrations/lapa-birthday-balloons.jpg',
    category: 'celebrations',
    alt: 'Party balloons tied to a pole of the lapa',
    caption: 'Party decorations at the lapa',
    needsConsent: true,
  },
  {
    key: 'birthdayBoy',
    file: 'celebrations/lapa-birthday-boy.jpg',
    category: 'celebrations',
    alt: 'A smiling boy holding a birthday present under the lapa',
    caption: 'Birthday at the lapa',
    needsConsent: true,
  },
];

async function importPhotos() {
  const ids: Record<string, string> = {};
  for (const p of PHOTOS) {
    try {
      const original = await readFile(path.resolve('seed/photos', p.file));
      let img = sharp(original).rotate();
      if (p.crop) img = img.extract({ left: p.crop[0], top: p.crop[1], width: p.crop[2], height: p.crop[3] });
      // one light grade so the phone photos read as a set (brand spec 6.1)
      const graded = await img
        .modulate({ saturation: 0.92, brightness: 1.03 })
        .gamma(1.05)
        .jpeg({ quality: 95 })
        .toBuffer();
      const { media } = await importImage(graded, {
        filename: path.basename(p.file),
        alt: p.alt,
        caption: p.caption,
        category: p.category,
        needsConsent: p.needsConsent,
      });
      ids[p.key] = media.id;
    } catch (err) {
      console.warn(`[seed] skipped ${p.file}:`, err instanceof Error ? err.message : err);
    }
  }
  return ids;
}

async function seedContent() {
  const db = await getDb();
  const photo = await importPhotos();
  const img = (key: string) => photo[key] ?? null;

  await saveDocument(
    'settings',
    {
      siteName: "Pa's Place",
      tagline: 'A family holiday garden and party venue, two minutes from the sea in Pennington, KwaZulu-Natal',
      organisation: { legalName: "Pa's Place NPC", registration: '' },
      contact: {
        person: 'Luke',
        phone: '073 436 5056',
        phoneLink: '+27734365056',
        email: 'info@pasplace.co.za',
        address: '35b Umdoni Road, Kelso, Pennington, KwaZulu-Natal, South Africa',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=35b+Umdoni+Road+Kelso+Pennington+KwaZulu-Natal',
      },
        booking: {
        stayDepositPercent: 50,
        venueDeposit: 500,
        checkIn: '14:00',
        checkOut: '10:00',
        paymentInstructions: '',
      },
    },
    null
  );

  await saveDocument(
    'homepage',
    {
      heroEyebrow: 'Kelso, Pennington · KZN South Coast',
      heroTitle: 'A holiday garden, two minutes from the sea',
      heroSubtitle:
        'Pool, waterslides, mini-golf and room for the whole family, under some of the biggest trees on the South Coast. {{stay_price}}.',
      heroImageId: img('bigTree'),
      groundsTitle: 'A garden built for long days outside',
      groundsIntro:
        'Shoes come off on day one. The pool and slides, the mini-golf course and the lawns are all yours for the stay, and the beach is a short walk down the road.',
      venueTitle: 'Your party, under the big trees',
      venueIntro:
        'Hire the lapa and the grounds for the day. Birthdays, church groups, year-end functions and family days, with the pool and slides right alongside.',
      venueImageId: img('lapa'),
      missionTitle: 'Every stay sends a child to the sea',
      missionText:
        "Pa's Place is a non-profit company. What you pay for your holiday or your party helps give a child who has never had a seaside holiday their first one.",
      missionImageId: null,
    },
    null
  );

  await saveDocument(
    'stayPage',
    {
      title: 'Book a stay',
      intro:
        'Choose your room or take the whole house, pick your dates and send the request. We hold your dates straight away and confirm by phone or email.',
      imageId: img('lawn'),
      included: [
        'Use of the pool and waterslides',
        'The mini-golf course',
        'Shaded lawns and gardens',
        'Braai facilities at the lapa',
        'The beach, two minutes away',
      ],
    },
    null
  );

  await saveDocument(
    'venuePage',
    {
      title: 'Gather under the big trees',
      intro:
        'Hire the lapa and gardens for the day. There’s a covered space with a braai, a pool, mini-golf and plenty of lawn for your group.',
      imageId: img('lapa'),
      secondaryImageId: img('birthdayTable'),
      included: [
        'The covered lapa with tables and chairs',
        'Braai facilities',
        'The pool and waterslides',
        'The mini-golf course',
        'Lawns and gardens for games',
      ],
      occasions: ['Birthday parties', 'Church and youth groups', 'Year-end functions', 'Family days', 'School outings'],
    },
    null
  );

  await db.insert(schema.stayOptions).values([
    {
      id: newId(),
      slug: 'the-whole-house',
      name: 'The whole house',
      blurb: 'Every room and the garden, for your family or group.',
      description: 'The full house for one group. The best fit for extended families, church groups and school holidays.',
      kind: 'stay',
      exclusive: true,
      capacityLabel: 'Sleeps up to 12',
      minPeople: 4,
      maxPeople: 12,
      rate: 200,
      imageId: img('lawn'),
      position: 1,
    },
    {
      id: newId(),
      slug: 'family-room',
      name: 'Family room',
      blurb: 'A quiet room for a small family.',
      description: 'A private room for two to four, with the whole garden to share.',
      kind: 'stay',
      exclusive: false,
      capacityLabel: 'Sleeps 2 to 4',
      minPeople: 2,
      maxPeople: 4,
      rate: 200,
      imageId: null,
      position: 2,
    },
    {
      id: newId(),
      slug: 'bunk-room',
      name: 'Bunk room',
      blurb: 'Bunk beds for friends and bigger families.',
      description: 'Backpacker-style bunks for up to six, at our lowest rate.',
      kind: 'stay',
      exclusive: false,
      capacityLabel: 'Sleeps 2 to 6',
      minPeople: 2,
      maxPeople: 6,
      rate: 160,
      imageId: null,
      position: 3,
    },
    {
      id: newId(),
      slug: 'venue-day-hire',
      name: 'Venue day hire',
      blurb: 'The lapa, pool, slides and lawns for the day.',
      description: 'Day hire of the lapa and grounds for parties and gatherings.',
      kind: 'venue',
      exclusive: false,
      capacityLabel: '10 to 40 guests',
      minPeople: 10,
      maxPeople: 40,
      rate: 80,
      imageId: img('lapa'),
      position: 4,
    },
  ]);

  await db.insert(schema.amenities).values([
    {
      id: newId(),
      title: 'Pool and waterslides',
      description: 'A fenced swimming pool with four slides. Bring towels and armbands.',
      icon: 'pool',
      imageId: img('pool'),
      position: 1,
    },
    {
      id: newId(),
      title: 'Mini-golf',
      description: 'A full course laid out on the lawn, in the shade all day.',
      icon: 'golf',
      imageId: img('golfCourse'),
      position: 2,
    },
    {
      id: newId(),
      title: 'The lapa',
      description: 'A big covered pavilion with a braai, tables and chairs, right beside the pool.',
      icon: 'lapa',
      imageId: img('lapa'),
      position: 3,
    },
    {
      id: newId(),
      title: 'Gardens and big trees',
      description: 'Wide lawns under old spreading trees. Room to run, or to do nothing at all.',
      icon: 'tree',
      imageId: img('bigTree'),
      position: 4,
    },
  ]);

  const gallery: [string, string][] = [
    ['bigTree', 'grounds'],
    ['pool', 'pool'],
    ['golfCourse', 'mini-golf'],
    ['lapa', 'venue'],
    ['lawn', 'grounds'],
    ['golfFamily', 'mini-golf'],
    ['birthdayTable', 'celebrations'],
  ];
  const galleryRows = gallery
    .filter(([key]) => photo[key])
    .map(([key, category], i) => ({ id: newId(), mediaId: photo[key], category, position: i + 1 }));
  if (galleryRows.length) await db.insert(schema.galleryItems).values(galleryRows);

  await db.insert(schema.faqs).values(
    [
      ['stays', 'How much does it cost to stay?', '{{stay_price}}. The price for your dates is shown before you send your request.'],
      ['stays', 'How do I pay?', 'Send a booking request and we hold your dates. We then confirm with you and send the details for paying the deposit by EFT. The balance is paid on arrival.'],
      ['stays', 'How far is the beach?', 'About two minutes on foot from the gate.'],
      ['stays', 'Can we use the pool, slides and mini-golf?', 'Yes. They are included for everyone staying with us.'],
      ['venue', 'What does venue hire cost?', '{{venue_price}}. Check a date to see the total before you send your request.'],
      ['venue', 'What is included with the venue?', 'The covered lapa with tables, chairs and a braai, plus the pool and waterslides, the mini-golf course and the lawns.'],
      ['venue', 'Can we bring our own food and decorations?', 'Yes. Most groups bring their own catering and decorate the lapa themselves.'],
      ['general', "Where does the money go?", "Pa's Place is a non-profit company. Income from stays and venue hire helps fund seaside holidays for children who have never had one."],
    ].map(([topic, question, answer], i) => ({ id: newId(), topic, question, answer, position: i + 1 }))
  );

  await logActivity({ action: 'system.seeded', entityType: 'system', summary: 'Starter content and photos loaded' });
  bumpContentVersion();
}

/** Create the first owner account so someone can sign in. */
async function bootstrapOwner() {
  if ((await userCount()) > 0) return;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const owner = userInput.safeParse({ name: process.env.ADMIN_NAME?.trim() || 'Site owner', email, role: 'owner' });
    if (!owner.success) {
      const invalidFields = owner.error.issues.map((issue) => issue.path[0] === 'email' ? 'ADMIN_EMAIL' : 'ADMIN_NAME');
      console.warn(`[seed] owner account setup skipped: check ${[...new Set(invalidFields)].join(' and ')}.`);
      return;
    }
    const invalidPassword = initialOwnerPasswordProblem(password);
    if (invalidPassword) {
      console.warn(`[seed] owner account setup skipped: ADMIN_PASSWORD does not meet the password policy. ${invalidPassword}`);
      return;
    }
    await createInitialOwner({ ...owner.data, password });
    console.info(`[seed] owner account created for ${email}`);
    return;
  }
  // Only under `astro dev`. A built server never gets a default account, even
  // if NODE_ENV was left unset on the host.
  const localOwnerEmail = import.meta.env.DEV ? developmentOwnerEmail() : undefined;
  if (localOwnerEmail) {
    await createInitialOwner({ name: 'Admin', email: localOwnerEmail, password: 'rootpass' });
    console.info('[seed] local development owner account created.');
    return;
  }
  console.warn('[seed] no staff accounts exist. Verify ADMIN_EMAIL and ADMIN_PASSWORD are set on this service and redeploy.');
}

const store = globalThis as typeof globalThis & { __pasPlaceReady?: Promise<void> };

/** Migrate, seed and bootstrap once per process. Awaited by the middleware. */
export function ensureReady(): Promise<void> {
  return (store.__pasPlaceReady ??= (async () => {
    const db = await getDb();
    const [settings] = await db
      .select({ key: schema.documents.key })
      .from(schema.documents)
      .where(eq(schema.documents.key, 'settings'))
      .limit(1);
    if (!settings) await seedContent();
    await bootstrapOwner();
  })().catch((err) => {
    store.__pasPlaceReady = undefined;
    throw err;
  }));
}
