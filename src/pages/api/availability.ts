// Which dates are taken for a booking option. Read by the public booking form.
import type { APIRoute } from 'astro';
import { addDays, isIsoDate, todaySast } from '../../server/lib/dates';
import { json } from '../../server/http/request';
import { unavailableDates } from '../../server/services/bookings';
import { getOptionBySlug } from '../../server/services/content';

export const GET: APIRoute = async ({ url }) => {
  const option = await getOptionBySlug(url.searchParams.get('option') ?? '');
  if (!option || !option.published) return json({ error: 'Unknown option.' }, 404);

  const today = todaySast();
  const fromParam = url.searchParams.get('from');
  const from = isIsoDate(fromParam) && fromParam > today ? fromParam : today;
  const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 120, 1), 400);
  const to = addDays(from, days);

  const taken = await unavailableDates(option, from, to);
  return json({ option: option.slug, from, to, today, unavailable: [...taken].sort() }, 200, {
    'Cache-Control': 'no-store',
  });
};
