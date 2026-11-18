import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, getSessionUser } from './server/auth/session';
import { ensureReady } from './server/seed';

const PUBLIC_ADMIN = new Set(['/admin/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  // migrations + first-run content; resolves instantly after the first request
  await ensureReady();

  const path = context.url.pathname.replace(/\/+$/, '') || '/';
  const isAdmin = path === '/admin' || path.startsWith('/admin/');
  context.locals.user = null;

  if (isAdmin) {
    const user = await getSessionUser(context.cookies.get(SESSION_COOKIE)?.value);
    context.locals.user = user;

    if (!user && !PUBLIC_ADMIN.has(path)) {
      const back = context.request.method === 'GET' ? `?next=${encodeURIComponent(path + context.url.search)}` : '';
      return context.redirect(`/admin/login${back}`);
    }
    // a temporary password must be replaced before anything else is allowed
    if (user?.mustChangePassword && path !== '/admin/account' && path !== '/admin/logout') {
      return context.redirect('/admin/account');
    }
  }

  const response = await next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (context.url.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  if (isAdmin) {
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
});
