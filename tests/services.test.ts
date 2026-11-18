// Service-level tests against a real (in-memory) Postgres.
import { beforeAll, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { freshDatabase } from './setup-db';
import { authenticate, createSession, destroySession, getSessionUser } from '../src/server/auth/session';
import { getDb, schema } from '../src/server/db/client';
import { newId } from '../src/server/lib/ids';
import { entityActivity } from '../src/server/services/activity';
import {
  BookingError,
  createBlock,
  createBooking,
  setBookingStatus,
  unavailableDates,
  type BookingInput,
} from '../src/server/services/bookings';
import { getSite } from '../src/server/services/content';
import { getDocument, saveDocument } from '../src/server/services/documents';
import { createEnquiry, enquiryCounts, enquiryInput, listEnquiries, updateEnquiry } from '../src/server/services/enquiries';
import { deleteMedia, importImage, mediaUsage, MediaError } from '../src/server/services/media';
import { changeOwnPassword, createUser, deleteUser, updateUser, UserError } from '../src/server/services/users';

const TODAY = '2026-11-17';
const actor = { id: '', name: 'Thandi', role: 'owner' as const };

const guest = (over: Partial<BookingInput> = {}): BookingInput => ({
  option: 'family-room',
  startDate: '2026-12-10',
  endDate: '2026-12-13',
  people: 3,
  guestName: 'Nomsa Dlamini',
  email: 'nomsa@example.co.za',
  phone: '073 000 0000',
  notes: '',
  ...over,
});

beforeAll(async () => {
  freshDatabase();
  const db = await getDb();
  await db.insert(schema.stayOptions).values([
    { id: 'house', slug: 'the-whole-house', name: 'The whole house', kind: 'stay', exclusive: true, minPeople: 4, maxPeople: 12, rate: 200 },
    { id: 'family', slug: 'family-room', name: 'Family room', kind: 'stay', minPeople: 2, maxPeople: 4, rate: 200 },
    { id: 'bunk', slug: 'bunk-room', name: 'Bunk room', kind: 'stay', minPeople: 2, maxPeople: 6, rate: 160 },
    { id: 'venue', slug: 'venue-day-hire', name: 'Venue day hire', kind: 'venue', minPeople: 10, maxPeople: 40, rate: 80 },
  ]);
  const owner = await createUser({ name: 'Thandi', email: 'thandi@pasplace.co.za', role: 'owner', password: 'umdoni road milkwood' }, null);
  actor.id = owner.id;
});

describe('bookings', () => {
  it('stores a request with the price frozen from the option and settings', async () => {
    const { booking, price } = await createBooking(guest(), { source: 'website', today: TODAY });
    expect(booking.ref).toMatch(/^PAS-/);
    expect(booking.status).toBe('requested');
    expect(price).toEqual({ nights: 3, total: 1800, deposit: 900, balance: 900 });
    expect(booking.total).toBe(1800);
    const log = await entityActivity('booking', booking.id);
    expect(log[0].action).toBe('booking.created');
  });

  it('refuses dates that overlap an existing booking for the same room', async () => {
    await expect(
      createBooking(guest({ startDate: '2026-12-12', endDate: '2026-12-14' }), { source: 'website', today: TODAY })
    ).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('lets the next guest arrive on the day the last one leaves', async () => {
    const { booking } = await createBooking(guest({ startDate: '2026-12-13', endDate: '2026-12-15' }), { source: 'website', today: TODAY });
    expect(booking.startDate).toBe('2026-12-13');
  });

  it('treats the whole house as clashing with any room, and the reverse', async () => {
    await expect(
      createBooking(guest({ option: 'the-whole-house', people: 8, startDate: '2026-12-11', endDate: '2026-12-12' }), { source: 'website', today: TODAY })
    ).rejects.toMatchObject({ code: 'unavailable' });

    await createBooking(guest({ option: 'the-whole-house', people: 8, startDate: '2027-01-05', endDate: '2027-01-08' }), { source: 'website', today: TODAY });
    await expect(
      createBooking(guest({ option: 'bunk-room', startDate: '2027-01-06', endDate: '2027-01-07' }), { source: 'website', today: TODAY })
    ).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('lets two different rooms be booked for the same nights', async () => {
    const { booking } = await createBooking(guest({ option: 'bunk-room', startDate: '2026-12-10', endDate: '2026-12-13' }), { source: 'website', today: TODAY });
    expect(booking.optionId).toBe('bunk');
  });

  it('keeps venue hire independent of stays, but one event per day', async () => {
    const day = { option: 'venue-day-hire', people: 20, startDate: '2026-12-11', endDate: '2026-12-11' };
    const { booking, price } = await createBooking(guest(day), { source: 'website', today: TODAY });
    expect(price).toEqual({ nights: 0, total: 1600, deposit: 500, balance: 1100 });
    expect(booking.endDate).toBe('2026-12-11');
    await expect(createBooking(guest(day), { source: 'website', today: TODAY })).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('validates party size, date order and past dates', async () => {
    const opts = { source: 'website' as const, today: TODAY };
    await expect(createBooking(guest({ people: 9, startDate: '2027-02-01', endDate: '2027-02-03' }), opts)).rejects.toThrow(/2 to 4 people/);
    await expect(createBooking(guest({ startDate: '2027-02-03', endDate: '2027-02-03' }), opts)).rejects.toThrow(/after arrival/);
    await expect(createBooking(guest({ startDate: '2026-11-01', endDate: '2026-11-03' }), opts)).rejects.toThrow(/past/);
    await expect(createBooking(guest({ option: 'nope' }), opts)).rejects.toBeInstanceOf(BookingError);
    await expect(createBooking(guest({ email: 'not-an-email' }), opts)).rejects.toThrow();
  });

  it('frees the dates when a booking is declined, and guards re-opening', async () => {
    const dates = { startDate: '2027-03-01', endDate: '2027-03-04' };
    const first = await createBooking(guest(dates), { source: 'website', today: TODAY });
    await setBookingStatus(first.booking.id, 'declined', actor);
    const second = await createBooking(guest(dates), { source: 'website', today: TODAY });
    expect(second.booking.status).toBe('requested');
    await expect(setBookingStatus(first.booking.id, 'requested', actor)).rejects.toMatchObject({ code: 'unavailable' });
    await expect(setBookingStatus(second.booking.id, 'completed', actor)).rejects.toThrow(/cannot be moved/);
    await setBookingStatus(second.booking.id, 'confirmed', actor);
  });

  it('honours blocked dates, scoped to an option or to the whole property', async () => {
    await createBlock({ optionId: 'bunk', startDate: '2027-04-10', endDate: '2027-04-12', reason: 'Repairs' }, actor);
    await createBlock({ optionId: null, startDate: '2027-04-20', endDate: '2027-04-20', reason: 'Sponsored retreat' }, actor);
    const bunk = await unavailableDates({ id: 'bunk', kind: 'stay', exclusive: false }, '2027-04-01', '2027-04-30');
    expect([...bunk].sort()).toEqual(['2027-04-10', '2027-04-11', '2027-04-12', '2027-04-20']);
    const venue = await unavailableDates({ id: 'venue', kind: 'venue', exclusive: false }, '2027-04-01', '2027-04-30');
    expect([...venue]).toEqual(['2027-04-20']);
    await expect(
      createBooking(guest({ option: 'bunk-room', startDate: '2027-04-12', endDate: '2027-04-14' }), { source: 'website', today: TODAY })
    ).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('does not double-book when two requests race for the same night', async () => {
    const dates = { startDate: '2027-05-01', endDate: '2027-05-03' };
    const results = await Promise.allSettled([
      createBooking(guest(dates), { source: 'website', today: TODAY }),
      createBooking(guest({ ...dates, guestName: 'Sipho Nkosi' }), { source: 'website', today: TODAY }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });
});

describe('enquiries', () => {
  it('validates and stores a message, then tracks its workflow', async () => {
    expect(enquiryInput.safeParse({ name: 'A', email: 'x', message: 'hi' }).success).toBe(false);
    const input = enquiryInput.parse({ type: 'venue', name: 'Sipho Nkosi', email: 'Sipho@Example.com', message: 'Is the lapa free on 6 December?' });
    const enquiry = await createEnquiry(input);
    expect(enquiry.email).toBe('sipho@example.com');
    expect(enquiry.status).toBe('new');
    expect((await enquiryCounts()).new).toBe(1);

    const updated = await updateEnquiry(enquiry.id, { status: 'resolved', assigneeId: actor.id }, actor);
    expect(updated?.status).toBe('resolved');
    expect(updated?.resolvedAt).toBeInstanceOf(Date);
    expect(updated?.assignee?.name).toBe('Thandi');

    expect((await listEnquiries({ q: 'lapa' })).total).toBe(1);
    expect((await listEnquiries({ status: 'active' })).total).toBe(0);
  });
});

describe('accounts and sessions', () => {
  it('signs in, resolves the session, and signs out', async () => {
    const result = await authenticate('THANDI@pasplace.co.za', 'umdoni road milkwood');
    expect(result.ok).toBe(true);
    const token = await createSession(actor.id, { ip: '127.0.0.1' });
    expect((await getSessionUser(token))?.email).toBe('thandi@pasplace.co.za');
    expect(await getSessionUser('forged-token')).toBeNull();
    await destroySession(token);
    expect(await getSessionUser(token)).toBeNull();
  });

  it('locks the account after five wrong passwords', async () => {
    const user = await createUser({ name: 'Lock Test', email: 'lock@pasplace.co.za', role: 'editor', password: 'umdoni road milkwood' }, actor);
    for (let i = 0; i < 4; i++) expect(await authenticate(user.email, 'wrong')).toMatchObject({ ok: false, reason: 'invalid' });
    expect(await authenticate(user.email, 'wrong')).toMatchObject({ ok: false, reason: 'locked' });
    // even the right password is refused while locked
    expect(await authenticate(user.email, 'umdoni road milkwood')).toMatchObject({ ok: false, reason: 'locked' });
    expect(await authenticate('nobody@example.com', 'whatever')).toMatchObject({ ok: false, reason: 'invalid' });
  });

  it('protects the last owner and enforces role boundaries', async () => {
    await expect(updateUser(actor.id, { name: 'Thandi', email: 'thandi@pasplace.co.za', role: 'admin', active: true }, actor)).rejects.toBeInstanceOf(UserError);
    const admin = await createUser({ name: 'Admin', email: 'admin2@pasplace.co.za', role: 'admin', password: 'umdoni road milkwood' }, actor);
    await expect(deleteUser(actor.id, admin)).rejects.toThrow(/permission/);
    await expect(createUser({ name: 'X Y', email: 'x@pasplace.co.za', role: 'owner', password: 'umdoni road milkwood' }, admin)).rejects.toThrow(/role/);
    await expect(createUser({ name: 'Dup', email: 'ADMIN2@pasplace.co.za', role: 'viewer', password: 'umdoni road milkwood' }, actor)).rejects.toThrow(/already/);
  });

  it('changes a password, signing out other devices and blocking deactivated users', async () => {
    const user = await createUser({ name: 'Pw Test', email: 'pw@pasplace.co.za', role: 'editor', password: 'umdoni road milkwood' }, actor);
    const here = await createSession(user.id, {});
    const elsewhere = await createSession(user.id, {});
    await expect(changeOwnPassword(user.id, 'wrong', 'kelso beach sunrise', here)).rejects.toThrow(/current password/);
    await changeOwnPassword(user.id, 'umdoni road milkwood', 'kelso beach sunrise', here);
    expect(await getSessionUser(here)).not.toBeNull();
    expect(await getSessionUser(elsewhere)).toBeNull();
    expect((await authenticate(user.email, 'kelso beach sunrise')).ok).toBe(true);

    await updateUser(user.id, { name: 'Pw Test', email: 'pw@pasplace.co.za', role: 'editor', active: false }, actor);
    expect(await getSessionUser(here)).toBeNull();
    expect(await authenticate(user.email, 'kelso beach sunrise')).toMatchObject({ ok: false, reason: 'inactive' });
  });
});

describe('media and content', () => {
  it('stores renditions, de-duplicates, reports usage and cleans up', async () => {
    const jpeg = await sharp({ create: { width: 1400, height: 900, channels: 3, background: '#2C6239' } }).jpeg().toBuffer();
    const { media, duplicate } = await importImage(jpeg, { filename: 'lawn.jpg', alt: 'Lawn', category: 'grounds' });
    expect(duplicate).toBe(false);
    expect(media.width).toBe(1400);
    expect(media.variants.map((v) => v.w)).toEqual([480, 960, 1400]);
    expect((await importImage(jpeg, { filename: 'again.jpg' })).duplicate).toBe(true);

    await expect(importImage(Buffer.from('not an image'), { filename: 'x.jpg' })).rejects.toBeInstanceOf(MediaError);

    await saveDocument('homepage', { heroTitle: 'A holiday garden', heroImageId: media.id }, actor.id);
    const db = await getDb();
    await db.insert(schema.galleryItems).values({ id: newId(), mediaId: media.id, category: 'grounds' });
    expect(await mediaUsage(media.id)).toEqual(['The photo gallery', 'Page content: homepage']);

    const site = await getSite();
    expect(site.homepage.heroTitle).toBe('A holiday garden');
    expect(site.homepage.heroImage?.srcset).toContain('480w');
    expect(site.gallery).toHaveLength(1);
    expect(site.options.map((o) => o.slug)).toContain('family-room');

    await deleteMedia(media.id);
    expect((await getSite()).gallery).toHaveLength(0);
  });

  it('fills documents from defaults and rejects invalid settings', async () => {
    const settings = await getDocument('settings');
    expect(settings.booking.stayDepositPercent).toBe(50);
    await expect(saveDocument('settings', { booking: { stayDepositPercent: 400 } }, actor.id)).rejects.toThrow();
    await saveDocument('settings', { contact: { phoneLink: '+27 73 436 5056' } }, actor.id);
    expect((await getSite()).whatsappUrl).toBe('https://wa.me/27734365056');
  });
});
