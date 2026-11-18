// Receives a booking request from the public booking form.
import type { APIRoute } from 'astro';
import { clientIp, fieldErrors, json } from '../../server/http/request';
import { formatDate } from '../../server/lib/dates';
import { rateLimit } from '../../server/lib/rate-limit';
import { BookingError, bookingInput, createBooking } from '../../server/services/bookings';
import { getDocument } from '../../server/services/documents';
import { notifyBooking } from '../../server/services/mail';

export const POST: APIRoute = async (ctx) => {
  const limited = rateLimit(`booking:${clientIp(ctx)}`, 6, 10 * 60_000);
  if (!limited.ok) {
    return json({ error: 'Too many requests. Please wait a few minutes, or call us to book.' }, 429, {
      'Retry-After': String(limited.retryAfter),
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await ctx.request.json();
  } catch {
    return json({ error: 'We could not read that request.' }, 400);
  }
  // a hidden field real visitors never fill in
  if (typeof body.website === 'string' && body.website) return json({ ok: true, ref: 'PAS-00000' });

  const parsed = bookingInput.safeParse(body);
  if (!parsed.success) return json({ error: 'Please check the highlighted details.', fields: fieldErrors(parsed.error) }, 422);

  try {
    const { booking, option, price } = await createBooking(parsed.data, { source: 'website' });
    // email in the background: a slow mail server must not hold up the guest
    void notifyBooking(booking, option);
    const settings = await getDocument('settings');
    return json(
      {
        ok: true,
        ref: booking.ref,
        option: option.name,
        when:
          option.kind === 'venue'
            ? formatDate(booking.startDate)
            : `${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`,
        people: booking.people,
        total: price.total,
        deposit: price.deposit,
        balance: price.balance,
        paymentInstructions: settings.booking.paymentInstructions,
      },
      201
    );
  } catch (err) {
    if (err instanceof BookingError) return json({ error: err.message, code: err.code }, err.code === 'unavailable' ? 409 : 422);
    console.error('[bookings] failed to save a booking request', err);
    return json({ error: 'We could not save your booking. Please try again, or call us.' }, 500);
  }
};
