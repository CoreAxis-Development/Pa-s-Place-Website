// Small helpers shared by pages and API routes.
import type { APIContext, AstroGlobal } from 'astro';
import type { ZodError } from 'zod';
import { can, type Permission, type SessionUser } from '../auth/session';

type Ctx = Pick<APIContext | AstroGlobal, 'request' | 'cookies' | 'locals' | 'url' | 'redirect'> & { clientAddress?: string };

export function clientIp(ctx: { request: Request; clientAddress?: string }): string {
  // behind Railway's proxy the first forwarded address is the visitor
  const forwarded = ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  try {
    return ctx.clientAddress ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });

/** First message per field, for showing beside form inputs. */
export function fieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    out[key] ??= issue.message;
  }
  return out;
}

/* ---------- flash messages (shown once, after a redirect) ---------- */

const FLASH = 'pp_flash';
export type FlashTone = 'success' | 'danger' | 'info' | 'warning';

export function setFlash(ctx: Pick<Ctx, 'cookies' | 'url'>, text: string, tone: FlashTone = 'success') {
  ctx.cookies.set(FLASH, JSON.stringify({ text, tone }), {
    path: '/admin',
    httpOnly: true,
    sameSite: 'lax',
    secure: ctx.url.protocol === 'https:',
    maxAge: 60,
  });
}

export function takeFlash(ctx: Pick<Ctx, 'cookies'>): { text: string; tone: FlashTone } | null {
  const raw = ctx.cookies.get(FLASH)?.value;
  if (!raw) return null;
  ctx.cookies.delete(FLASH, { path: '/admin' });
  try {
    const v = JSON.parse(raw);
    return typeof v?.text === 'string' ? { text: v.text, tone: v.tone ?? 'success' } : null;
  } catch {
    return null;
  }
}

/* ---------- guards ---------- */

/** The signed-in user. The middleware guarantees one on every /admin page but login. */
export function currentUser(ctx: Pick<Ctx, 'locals'>): SessionUser {
  const user = ctx.locals.user;
  if (!user) throw new Error('No signed-in user on a protected route');
  return user;
}

/** Returns a redirect Response when the user lacks the permission, otherwise null. */
export function deny(ctx: Pick<Ctx, 'locals' | 'cookies' | 'url' | 'redirect'>, permission: Permission, to = '/admin'): Response | null {
  if (can(ctx.locals.user, permission)) return null;
  setFlash(ctx, 'Your account does not have permission to do that.', 'danger');
  return ctx.redirect(to);
}

export const str = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === 'string' ? v : '';
};

/** Only allow redirects back into the admin portal (no open redirects). */
export const safeNext = (next: string | null) => (next && /^\/admin(\/|$|\?)/.test(next) && !next.startsWith('//') ? next : '/admin');

export function pageParams(url: URL, perPage = 25) {
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  return { page, perPage, offset: (page - 1) * perPage };
}
