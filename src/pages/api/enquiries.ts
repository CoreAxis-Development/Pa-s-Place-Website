// Receives messages from the public contact forms. Accepts JSON (enhanced
// form) or a plain form post (no JavaScript), which redirects back.
import type { APIRoute } from 'astro';
import { clientIp, fieldErrors, json } from '../../server/http/request';
import { rateLimit } from '../../server/lib/rate-limit';
import { createEnquiry, enquiryInput } from '../../server/services/enquiries';
import { notifyEnquiry } from '../../server/services/mail';

export const POST: APIRoute = async (ctx) => {
  const wantsJson = (ctx.request.headers.get('content-type') ?? '').includes('application/json');
  let body: Record<string, unknown>;
  try {
    body = wantsJson ? await ctx.request.json() : Object.fromEntries(await ctx.request.formData());
  } catch {
    return json({ error: 'We could not read that message.' }, 400);
  }

  const back = (state: string) => {
    const source = typeof body.source === 'string' && body.source.startsWith('/') && !body.source.startsWith('//') ? body.source : '/contact';
    return ctx.redirect(`${source.split('?')[0]}?sent=${state}#enquiry`, 303);
  };

  const limited = rateLimit(`enquiry:${clientIp(ctx)}`, 5, 10 * 60_000);
  if (!limited.ok) {
    return wantsJson
      ? json({ error: 'Too many messages. Please wait a few minutes, or call us.' }, 429, { 'Retry-After': String(limited.retryAfter) })
      : back('slow');
  }

  // honeypot: bots fill every field; pretend it worked
  if (typeof body.website === 'string' && body.website) return wantsJson ? json({ ok: true, ref: 'ENQ-00000' }) : back('ok');

  const parsed = enquiryInput.safeParse(body);
  if (!parsed.success) {
    return wantsJson
      ? json({ error: 'Please check the highlighted details.', fields: fieldErrors(parsed.error) }, 422)
      : back('invalid');
  }

  try {
    const enquiry = await createEnquiry(parsed.data);
    void notifyEnquiry(enquiry);
    return wantsJson ? json({ ok: true, ref: enquiry.ref }, 201) : back('ok');
  } catch (err) {
    console.error('[enquiries] failed to save a message', err);
    return wantsJson ? json({ error: 'We could not send your message. Please try again, or call us.' }, 500) : back('error');
  }
};
