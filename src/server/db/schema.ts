// Database schema (Postgres). Runs on real Postgres when DATABASE_URL is set
// and on embedded PGlite otherwise, so local dev needs no database install.
import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const id = () => text('id').primaryKey();
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

/* ---------- people ---------- */

export const userRole = pgEnum('user_role', ['owner', 'admin', 'editor', 'viewer']);

export const users = pgTable(
  'users',
  {
    id: id(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    role: userRole('role').notNull().default('editor'),
    passwordHash: text('password_hash').notNull(),
    active: boolean('active').notNull().default(true),
    mustChangePassword: boolean('must_change_password').notNull().default(false),
    failedLogins: integer('failed_logins').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('users_email_idx').on(sql`lower(${t.email})`)]
);

export const sessions = pgTable(
  'sessions',
  {
    // sha-256 of the cookie token; the raw token never touches the database
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: createdAt(),
  },
  (t) => [index('sessions_user_idx').on(t.userId), index('sessions_expires_idx').on(t.expiresAt)]
);

/* ---------- content ---------- */

// Singletons (site settings, homepage copy, page copy) stored as validated JSON.
export const documents = pgTable('documents', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: updatedAt(),
  updatedBy: text('updated_by').references(() => users.id, { onDelete: 'set null' }),
});

export const media = pgTable(
  'media',
  {
    id: id(),
    filename: text('filename').notNull(),
    alt: text('alt').notNull().default(''),
    caption: text('caption').notNull().default(''),
    category: text('category').notNull().default('general'),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    bytes: integer('bytes').notNull(),
    // average colour, painted behind the image while it loads
    color: text('color').notNull().default('#d9d2c3'),
    // [{ w, h, key }] — webp renditions on disk, smallest first
    variants: jsonb('variants').$type<MediaVariant[]>().notNull(),
    // sha-256 of the original upload, so the same photo is never stored twice
    checksum: text('checksum').notNull(),
    // flags a photo that still needs sign-off before prominent use
    // (identifiable children, third-party artwork)
    needsConsent: boolean('needs_consent').notNull().default(false),
    uploadedBy: text('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('media_checksum_idx').on(t.checksum), index('media_category_idx').on(t.category)]
);

export interface MediaVariant {
  w: number;
  h: number;
  key: string;
}

export const optionKind = pgEnum('option_kind', ['stay', 'venue']);

export const stayOptions = pgTable(
  'stay_options',
  {
    id: id(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    blurb: text('blurb').notNull().default(''),
    description: text('description').notNull().default(''),
    kind: optionKind('kind').notNull().default('stay'),
    // an exclusive stay takes the whole property: it clashes with every other stay
    exclusive: boolean('exclusive').notNull().default(false),
    capacityLabel: text('capacity_label').notNull().default(''),
    minPeople: integer('min_people').notNull().default(2),
    maxPeople: integer('max_people').notNull().default(12),
    // whole Rand, per person per night (stay) or per person per day (venue)
    rate: integer('rate').notNull().default(200),
    imageId: text('image_id').references(() => media.id, { onDelete: 'set null' }),
    position: integer('position').notNull().default(0),
    published: boolean('published').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('stay_options_slug_idx').on(t.slug)]
);

export const amenities = pgTable('amenities', {
  id: id(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  icon: text('icon').notNull().default('sun'),
  imageId: text('image_id').references(() => media.id, { onDelete: 'set null' }),
  position: integer('position').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const galleryItems = pgTable(
  'gallery_items',
  {
    id: id(),
    mediaId: text('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    caption: text('caption').notNull().default(''),
    category: text('category').notNull().default('grounds'),
    position: integer('position').notNull().default(0),
    published: boolean('published').notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index('gallery_position_idx').on(t.position)]
);

export const faqs = pgTable('faqs', {
  id: id(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  // which page(s) show it: stays | venue | general
  topic: text('topic').notNull().default('general'),
  position: integer('position').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* ---------- enquiries ---------- */

export const enquiryType = pgEnum('enquiry_type', ['general', 'stay', 'venue', 'sponsor', 'volunteer']);
export const enquiryStatus = pgEnum('enquiry_status', ['new', 'open', 'waiting', 'resolved', 'spam']);

export const enquiries = pgTable(
  'enquiries',
  {
    id: id(),
    ref: text('ref').notNull(),
    type: enquiryType('type').notNull().default('general'),
    status: enquiryStatus('status').notNull().default('new'),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    message: text('message').notNull(),
    // page the form was submitted from
    source: text('source').notNull().default(''),
    assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('enquiries_ref_idx').on(t.ref),
    index('enquiries_status_idx').on(t.status),
    index('enquiries_created_idx').on(t.createdAt),
  ]
);

/* ---------- bookings ---------- */

export const bookingStatus = pgEnum('booking_status', [
  'requested',
  'confirmed',
  'completed',
  'declined',
  'cancelled',
]);
export const depositStatus = pgEnum('deposit_status', ['unpaid', 'paid', 'refunded']);
export const bookingSource = pgEnum('booking_source', ['website', 'phone', 'admin']);

export const bookings = pgTable(
  'bookings',
  {
    id: id(),
    ref: text('ref').notNull(),
    optionId: text('option_id')
      .notNull()
      .references(() => stayOptions.id, { onDelete: 'restrict' }),
    status: bookingStatus('status').notNull().default('requested'),
    // stays: startDate = arrival, endDate = departure (that night is not occupied)
    // venue: startDate = endDate = the event day
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    people: integer('people').notNull(),
    guestName: text('guest_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    notes: text('notes').notNull().default(''),
    // money in whole Rand, frozen at the time of booking
    rate: integer('rate').notNull(),
    total: integer('total').notNull(),
    deposit: integer('deposit').notNull(),
    depositStatus: depositStatus('deposit_status').notNull().default('unpaid'),
    source: bookingSource('source').notNull().default('website'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('bookings_ref_idx').on(t.ref),
    index('bookings_dates_idx').on(t.startDate, t.endDate),
    index('bookings_status_idx').on(t.status),
  ]
);

// Dates taken off sale by staff (maintenance, sponsored retreats, private use).
export const blockedDates = pgTable(
  'blocked_dates',
  {
    id: id(),
    // null = the whole property, every option
    optionId: text('option_id').references(() => stayOptions.id, { onDelete: 'cascade' }),
    // inclusive on both ends
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    reason: text('reason').notNull().default(''),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [index('blocked_dates_idx').on(t.startDate, t.endDate)]
);

/* ---------- notes + audit trail ---------- */

// Internal staff notes on an enquiry or booking.
export const notes = pgTable(
  'notes',
  {
    id: id(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('notes_entity_idx').on(t.entityType, t.entityId)]
);

// Append-only record of who did what.
export const activity = pgTable(
  'activity',
  {
    id: id(),
    // null = the public site or the system
    actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull().default(''),
    summary: text('summary').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('activity_entity_idx').on(t.entityType, t.entityId), index('activity_created_idx').on(t.createdAt)]
);

/* ---------- relations ---------- */

export const stayOptionsRelations = relations(stayOptions, ({ one }) => ({
  image: one(media, { fields: [stayOptions.imageId], references: [media.id] }),
}));
export const amenitiesRelations = relations(amenities, ({ one }) => ({
  image: one(media, { fields: [amenities.imageId], references: [media.id] }),
}));
export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  media: one(media, { fields: [galleryItems.mediaId], references: [media.id] }),
}));
export const bookingsRelations = relations(bookings, ({ one }) => ({
  option: one(stayOptions, { fields: [bookings.optionId], references: [stayOptions.id] }),
}));
export const blockedDatesRelations = relations(blockedDates, ({ one }) => ({
  option: one(stayOptions, { fields: [blockedDates.optionId], references: [stayOptions.id] }),
}));
export const enquiriesRelations = relations(enquiries, ({ one }) => ({
  assignee: one(users, { fields: [enquiries.assigneeId], references: [users.id] }),
}));
export const notesRelations = relations(notes, ({ one }) => ({
  author: one(users, { fields: [notes.authorId], references: [users.id] }),
}));
export const activityRelations = relations(activity, ({ one }) => ({
  actor: one(users, { fields: [activity.actorId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Media = typeof media.$inferSelect;
export type StayOption = typeof stayOptions.$inferSelect;
export type Amenity = typeof amenities.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type BlockedDate = typeof blockedDates.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Activity = typeof activity.$inferSelect;
export type Role = (typeof userRole.enumValues)[number];
export type EnquiryStatus = (typeof enquiryStatus.enumValues)[number];
export type EnquiryType = (typeof enquiryType.enumValues)[number];
export type BookingStatus = (typeof bookingStatus.enumValues)[number];
export type DepositStatus = (typeof depositStatus.enumValues)[number];
