// Bookings and availability. A booking request from the website holds its
// dates straight away (status "requested"); staff confirm or decline it.
// Online card payment is not wired up: the deposit is paid by EFT and staff
// mark it as received.
import { and, asc, desc, eq, gte, ilike, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, schema, type Db, type Tx } from '../db/client';
import type { BookingStatus, DepositStatus, StayOption } from '../db/schema';
import { addDays, daysBetween, eachDate, isIsoDate, todaySast } from '../lib/dates';
import { newId, newRef } from '../lib/ids';
import { quote, type PricingPolicy } from '../lib/pricing';
import { logActivity } from './activity';
import { getDocument } from './documents';

export const BOOKING_STATUSES: { value: BookingStatus; label: string; tone: string }[] = [
  { value: 'requested', label: 'Requested', tone: 'warning' },
  { value: 'confirmed', label: 'Confirmed', tone: 'success' },
  { value: 'completed', label: 'Completed', tone: 'neutral' },
  { value: 'declined', label: 'Declined', tone: 'danger' },
  { value: 'cancelled', label: 'Cancelled', tone: 'danger' },
];
export const DEPOSIT_STATUSES: { value: DepositStatus; label: string; tone: string }[] = [
  { value: 'unpaid', label: 'Deposit unpaid', tone: 'warning' },
  { value: 'paid', label: 'Deposit paid', tone: 'success' },
  { value: 'refunded', label: 'Deposit refunded', tone: 'neutral' },
];
export const bookingStatusMeta = (s: string) => BOOKING_STATUSES.find((x) => x.value === s) ?? BOOKING_STATUSES[0];
export const depositStatusMeta = (s: string) => DEPOSIT_STATUSES.find((x) => x.value === s) ?? DEPOSIT_STATUSES[0];

/** Statuses that keep dates off sale. */
const HOLDING: BookingStatus[] = ['requested', 'confirmed', 'completed'];
const MAX_NIGHTS = 60;
const MAX_ADVANCE_DAYS = 550;

export class BookingError extends Error {
  constructor(
    message: string,
    public code: 'invalid' | 'unavailable' | 'not-found' = 'invalid'
  ) {
    super(message);
  }
}

const isoDate = z.string().refine(isIsoDate, 'Choose a valid date.');

export const bookingInput = z.object({
  option: z.string().trim().min(1).max(100),
  startDate: isoDate,
  endDate: isoDate,
  people: z.coerce.number().int().min(1).max(500),
  guestName: z.string().trim().min(2, 'Please tell us your name.').max(120),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email('That email address does not look right.')),
  phone: z
    .string()
    .trim()
    .min(9, 'Please give a phone number we can reach you on.')
    .max(30)
    .regex(/^[0-9+()\s-]+$/, 'Use digits only for the phone number.'),
  notes: z.string().trim().max(2000).default(''),
});
export type BookingInput = z.infer<typeof bookingInput>;

/* ---------- availability ---------- */

/**
 * The dates on which `option` cannot be booked, between `from` and `to`
 * (inclusive). Rules:
 *  - an option clashes with its own bookings;
 *  - an "exclusive" stay (the whole house) clashes with every other stay,
 *    and every stay clashes with it;
 *  - the day venue only clashes with itself;
 *  - blocked dates apply to their option, or to everything when unscoped.
 */
export async function unavailableDates(
  option: Pick<StayOption, 'id' | 'kind' | 'exclusive'>,
  from: string,
  to: string,
  opts: { ignoreBookingId?: string; db?: Db | Tx } = {}
): Promise<Set<string>> {
  const db = opts.db ?? (await getDb());
  const taken = new Set<string>();

  const rows = await db
    .select({
      id: schema.bookings.id,
      optionId: schema.bookings.optionId,
      startDate: schema.bookings.startDate,
      endDate: schema.bookings.endDate,
      kind: schema.stayOptions.kind,
      exclusive: schema.stayOptions.exclusive,
    })
    .from(schema.bookings)
    .innerJoin(schema.stayOptions, eq(schema.bookings.optionId, schema.stayOptions.id))
    .where(
      and(
        inArray(schema.bookings.status, HOLDING),
        lte(schema.bookings.startDate, to),
        gte(schema.bookings.endDate, from)
      )
    );

  for (const b of rows) {
    if (b.id === opts.ignoreBookingId) continue;
    const same = b.optionId === option.id;
    const stayClash = option.kind === 'stay' && b.kind === 'stay' && (option.exclusive || b.exclusive);
    if (!same && !stayClash) continue;
    // a stay occupies the nights from arrival up to (not including) departure
    const dates = b.kind === 'venue' ? [b.startDate] : eachDate(b.startDate, b.endDate);
    for (const d of dates) if (d >= from && d <= to) taken.add(d);
  }

  const blocks = await db
    .select()
    .from(schema.blockedDates)
    .where(
      and(
        or(isNull(schema.blockedDates.optionId), eq(schema.blockedDates.optionId, option.id)),
        lte(schema.blockedDates.startDate, to),
        gte(schema.blockedDates.endDate, from)
      )
    );
  for (const b of blocks) {
    for (const d of eachDate(b.startDate, addDays(b.endDate, 1))) if (d >= from && d <= to) taken.add(d);
  }
  return taken;
}

/** The dates a booking would occupy. */
export const occupiedDates = (kind: 'stay' | 'venue', startDate: string, endDate: string) =>
  kind === 'venue' ? [startDate] : eachDate(startDate, endDate);

async function pricingPolicy(): Promise<PricingPolicy> {
  const { booking } = await getDocument('settings');
  return { stayDepositPercent: booking.stayDepositPercent, venueDeposit: booking.venueDeposit };
}

/* ---------- creating ---------- */

export interface CreateOptions {
  source: 'website' | 'phone' | 'admin';
  status?: BookingStatus;
  actor?: { id: string; name: string };
  /** staff may book dates in the past (capturing history) */
  allowPast?: boolean;
  today?: string;
}

export async function createBooking(raw: BookingInput, opts: CreateOptions) {
  const input = bookingInput.parse(raw);
  const db = await getDb();
  const policy = await pricingPolicy();
  const today = opts.today ?? todaySast();

  return db.transaction(async (tx) => {
    // One booking is written at a time, so two guests cannot both pass the
    // availability check for the same night.
    await tx.execute(sql`select pg_advisory_xact_lock(7405)`);

    const [option] = await tx
      .select()
      .from(schema.stayOptions)
      .where(or(eq(schema.stayOptions.slug, input.option), eq(schema.stayOptions.id, input.option)))
      .limit(1);
    if (!option || (!option.published && opts.source === 'website')) {
      throw new BookingError('That option is no longer available.', 'not-found');
    }

    const startDate = input.startDate;
    const endDate = option.kind === 'venue' ? startDate : input.endDate;
    const nights = option.kind === 'stay' ? daysBetween(startDate, endDate) : 0;

    if (!opts.allowPast && startDate < today) throw new BookingError('Those dates are in the past.');
    if (option.kind === 'stay' && nights < 1) throw new BookingError('Departure must be after arrival.');
    if (nights > MAX_NIGHTS) throw new BookingError(`Stays are limited to ${MAX_NIGHTS} nights. Call us for longer visits.`);
    if (daysBetween(today, startDate) > MAX_ADVANCE_DAYS) throw new BookingError('That is too far ahead to book online. Call us instead.');
    if (input.people < option.minPeople || input.people > option.maxPeople) {
      throw new BookingError(`${option.name} takes ${option.minPeople} to ${option.maxPeople} people.`);
    }

    const wanted = occupiedDates(option.kind, startDate, endDate);
    const taken = await unavailableDates(option, wanted[0], wanted[wanted.length - 1], { db: tx });
    if (wanted.some((d) => taken.has(d))) {
      throw new BookingError('Some of those dates have just been taken. Please choose another stretch.', 'unavailable');
    }

    const price = quote({ kind: option.kind, rate: option.rate, people: input.people, nights }, policy);
    const [booking] = await tx
      .insert(schema.bookings)
      .values({
        id: newId(),
        ref: newRef('PAS'),
        optionId: option.id,
        status: opts.status ?? 'requested',
        startDate,
        endDate,
        people: input.people,
        guestName: input.guestName,
        email: input.email,
        phone: input.phone,
        notes: input.notes,
        rate: option.rate,
        total: price.total,
        deposit: price.deposit,
        source: opts.source,
      })
      .returning();

    await logActivity(
      {
        actorId: opts.actor?.id,
        action: 'booking.created',
        entityType: 'booking',
        entityId: booking.id,
        summary: opts.actor
          ? `${opts.actor.name} added booking ${booking.ref} for ${booking.guestName} (${option.name})`
          : `New booking request ${booking.ref} from ${booking.guestName} (${option.name})`,
      },
      tx
    );
    return { booking, option, price };
  });
}

/* ---------- reading ---------- */

export interface BookingFilter {
  status?: BookingStatus | 'active';
  optionId?: string;
  q?: string;
  /** only bookings that end on or after this date */
  from?: string;
  limit?: number;
  offset?: number;
  order?: 'newest' | 'arrival';
}

function bookingWhere(f: BookingFilter) {
  const q = f.q?.trim();
  return and(
    f.status === 'active'
      ? inArray(schema.bookings.status, ['requested', 'confirmed'])
      : f.status
        ? eq(schema.bookings.status, f.status)
        : undefined,
    f.optionId ? eq(schema.bookings.optionId, f.optionId) : undefined,
    f.from ? gte(schema.bookings.endDate, f.from) : undefined,
    q
      ? or(
          ilike(schema.bookings.guestName, `%${q}%`),
          ilike(schema.bookings.email, `%${q}%`),
          ilike(schema.bookings.phone, `%${q}%`),
          ilike(schema.bookings.ref, `%${q}%`)
        )
      : undefined
  );
}

export async function listBookings(f: BookingFilter = {}) {
  const db = await getDb();
  const where = bookingWhere(f);
  const rows = await db.query.bookings.findMany({
    where,
    with: { option: { columns: { id: true, name: true, kind: true } } },
    orderBy: f.order === 'arrival' ? [asc(schema.bookings.startDate)] : [desc(schema.bookings.createdAt)],
    limit: f.limit ?? 25,
    offset: f.offset ?? 0,
  });
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.bookings).where(where);
  return { rows, total: count };
}

export async function getBooking(id: string) {
  const db = await getDb();
  return (await db.query.bookings.findFirst({ where: eq(schema.bookings.id, id), with: { option: true } })) ?? null;
}

/** Bookings and blocks that touch a date range — feeds the admin calendar. */
export async function calendarEntries(from: string, to: string) {
  const db = await getDb();
  const bookings = await db.query.bookings.findMany({
    where: and(
      inArray(schema.bookings.status, HOLDING),
      lte(schema.bookings.startDate, to),
      gte(schema.bookings.endDate, from)
    ),
    with: { option: { columns: { id: true, name: true, kind: true } } },
    orderBy: [asc(schema.bookings.startDate)],
  });
  const blocks = await db.query.blockedDates.findMany({
    where: and(lte(schema.blockedDates.startDate, to), gte(schema.blockedDates.endDate, from)),
    with: { option: { columns: { id: true, name: true } } },
    orderBy: [asc(schema.blockedDates.startDate)],
  });
  return { bookings, blocks };
}

/* ---------- changing ---------- */

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ['confirmed', 'declined', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  declined: ['requested'],
  cancelled: ['requested'],
};
export const nextStatuses = (s: BookingStatus) => TRANSITIONS[s];

export async function setBookingStatus(id: string, status: BookingStatus, actor: { id: string; name: string }) {
  const db = await getDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7405)`);
    const [booking] = await tx.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);
    if (!booking) throw new BookingError('Booking not found.', 'not-found');
    if (!TRANSITIONS[booking.status].includes(status)) {
      throw new BookingError(`A ${booking.status} booking cannot be moved to ${status}.`);
    }

    // re-opening a declined or cancelled booking must not double-book the dates
    if (status === 'requested') {
      const [option] = await tx.select().from(schema.stayOptions).where(eq(schema.stayOptions.id, booking.optionId));
      const wanted = occupiedDates(option.kind, booking.startDate, booking.endDate);
      const taken = await unavailableDates(option, wanted[0], wanted[wanted.length - 1], { db: tx, ignoreBookingId: id });
      if (wanted.some((d) => taken.has(d))) {
        throw new BookingError('Those dates have since been taken, so this booking cannot be re-opened.', 'unavailable');
      }
    }

    await tx.update(schema.bookings).set({ status, updatedAt: new Date() }).where(eq(schema.bookings.id, id));
    await logActivity(
      {
        actorId: actor.id,
        action: `booking.${status}`,
        entityType: 'booking',
        entityId: id,
        summary: `${actor.name} marked booking ${booking.ref} as ${bookingStatusMeta(status).label.toLowerCase()}`,
      },
      tx
    );
    return { ...booking, status };
  });
}

export async function setDepositStatus(id: string, depositStatus: DepositStatus, actor: { id: string; name: string }) {
  const db = await getDb();
  const booking = await getBooking(id);
  if (!booking) throw new BookingError('Booking not found.', 'not-found');
  if (booking.depositStatus === depositStatus) return;
  await db.update(schema.bookings).set({ depositStatus, updatedAt: new Date() }).where(eq(schema.bookings.id, id));
  await logActivity({
    actorId: actor.id,
    action: 'booking.deposit',
    entityType: 'booking',
    entityId: id,
    summary: `${actor.name} marked the deposit on ${booking.ref} as ${depositStatus}`,
  });
}

/* ---------- blocked dates ---------- */

export const blockInput = z
  .object({
    optionId: z.preprocess((v) => (typeof v === 'string' && v ? v : null), z.string().max(64).nullable()),
    startDate: isoDate,
    endDate: isoDate,
    reason: z.string().trim().max(200).default(''),
  })
  .refine((b) => b.endDate >= b.startDate, { message: 'The last day cannot be before the first day.', path: ['endDate'] })
  .refine((b) => daysBetween(b.startDate, b.endDate) <= 366, { message: 'Block at most a year at a time.', path: ['endDate'] });

export async function createBlock(input: z.infer<typeof blockInput>, actor: { id: string; name: string }) {
  const db = await getDb();
  const [row] = await db
    .insert(schema.blockedDates)
    .values({ id: newId(), ...input, createdBy: actor.id })
    .returning();
  await logActivity({
    actorId: actor.id,
    action: 'block.created',
    entityType: 'block',
    entityId: row.id,
    summary: `${actor.name} blocked ${row.startDate} to ${row.endDate}${row.reason ? ` (${row.reason})` : ''}`,
  });
  return row;
}

export async function listBlocks(from?: string) {
  const db = await getDb();
  return db.query.blockedDates.findMany({
    where: from ? gte(schema.blockedDates.endDate, from) : undefined,
    with: { option: { columns: { id: true, name: true } } },
    orderBy: [asc(schema.blockedDates.startDate)],
  });
}

export async function deleteBlock(id: string, actor: { id: string; name: string }) {
  const db = await getDb();
  const [row] = await db.delete(schema.blockedDates).where(eq(schema.blockedDates.id, id)).returning();
  if (row) {
    await logActivity({
      actorId: actor.id,
      action: 'block.removed',
      entityType: 'block',
      entityId: id,
      summary: `${actor.name} unblocked ${row.startDate} to ${row.endDate}`,
    });
  }
}

/* ---------- dashboard figures ---------- */

export async function bookingStats(today = todaySast()) {
  const db = await getDb();
  const soon = addDays(today, 30);
  const [row] = await db
    .select({
      requested: sql<number>`count(*) filter (where ${schema.bookings.status} = 'requested')::int`,
      upcoming: sql<number>`count(*) filter (where ${schema.bookings.status} = 'confirmed' and ${schema.bookings.startDate} >= ${today} and ${schema.bookings.startDate} <= ${soon})::int`,
      awaitingDeposit: sql<number>`count(*) filter (where ${schema.bookings.status} = 'confirmed' and ${schema.bookings.depositStatus} = 'unpaid')::int`,
      confirmedValue: sql<number>`coalesce(sum(${schema.bookings.total}) filter (where ${schema.bookings.status} = 'confirmed' and ${schema.bookings.startDate} >= ${today}), 0)::int`,
    })
    .from(schema.bookings);
  return row;
}
