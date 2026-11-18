import type { APIRoute } from 'astro';
import { SESSION_COOKIE, destroySession } from '../../server/auth/session';

// POST only: a link or image on another site cannot sign someone out.
export const POST: APIRoute = async ({ cookies, redirect }) => {
  await destroySession(cookies.get(SESSION_COOKIE)?.value);
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return redirect('/admin/login', 303);
};

export const GET: APIRoute = ({ redirect }) => redirect('/admin');
