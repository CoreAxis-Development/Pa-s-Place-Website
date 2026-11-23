// Server-side sessions. The browser holds a random token in an httpOnly
// cookie; the database holds only its SHA-256, so a leaked database cannot be
// replayed as a login.
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, lt, ne, sql } from 'drizzle-orm';
import { getDb, schema } from '../db/client';
import type { Role, User } from '../db/schema';
import { developmentOwnerEmail, hashPassword, isDevelopmentOwner, verifyPassword } from './password';

export const SESSION_COOKIE = 'pp_session';
const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 86_400_000;
const MAX_FAILED = 5;
const LOCK_MS = 15 * 60_000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export type SessionUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'mustChangePassword'>;

export const cookieOptions = (secure: boolean) =>
  ({
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: SESSION_DAYS * 86_400,
  }) as const;

export async function createSession(userId: string, meta: { ip?: string; userAgent?: string }) {
  const db = await getDb();
  const token = randomBytes(32).toString('base64url');
  await db.insert(schema.sessions).values({
    id: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_MS),
    ip: meta.ip ?? null,
    userAgent: meta.userAgent?.slice(0, 300) ?? null,
  });
  // opportunistic clean-up of expired sessions
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  return token;
}

export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const db = await getDb();
  const id = hashToken(token);
  const [row] = await db
    .select({
      expiresAt: schema.sessions.expiresAt,
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      mustChangePassword: schema.users.mustChangePassword,
      active: schema.users.active,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.id, id), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  if (!row || !row.active) return null;

  // sliding expiry: extend once the session is past its halfway point
  if (row.expiresAt.getTime() - Date.now() < SESSION_MS / 2) {
    await db
      .update(schema.sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_MS) })
      .where(eq(schema.sessions.id, id));
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role, mustChangePassword: row.mustChangePassword && !isDevelopmentOwner(row) };
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  const db = await getDb();
  await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
}

/** Sign a user out everywhere — optionally keeping the session they are using now. */
export async function destroyUserSessions(userId: string, exceptToken?: string) {
  const db = await getDb();
  await db
    .delete(schema.sessions)
    .where(
      exceptToken
        ? and(eq(schema.sessions.userId, userId), ne(schema.sessions.id, hashToken(exceptToken)))
        : eq(schema.sessions.userId, userId)
    );
}

// A real hash to burn the same time when the email is unknown, so response
// timing does not reveal which addresses have accounts.
let dummyHash: Promise<string> | undefined;

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'invalid' | 'locked' | 'inactive'; retryMinutes?: number };

export async function authenticate(identifier: string, password: string): Promise<LoginResult> {
  const login = identifier.trim().toLowerCase();
  const ownerAlias = login === 'admin' ? developmentOwnerEmail() : undefined;
  const email = ownerAlias ?? login;
  const db = await getDb();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(sql`lower(${schema.users.email})`, email), ownerAlias ? eq(schema.users.role, 'owner') : undefined))
    .limit(1);

  if (!user) {
    await verifyPassword(password, await (dummyHash ??= hashPassword('not-a-real-account')));
    return { ok: false, reason: 'invalid' };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, reason: 'locked', retryMinutes: Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000) };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const failed = user.failedLogins + 1;
    const lock = failed >= MAX_FAILED;
    await db
      .update(schema.users)
      .set({ failedLogins: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + LOCK_MS) : null })
      .where(eq(schema.users.id, user.id));
    return lock ? { ok: false, reason: 'locked', retryMinutes: LOCK_MS / 60_000 } : { ok: false, reason: 'invalid' };
  }
  if (!user.active) return { ok: false, reason: 'inactive' };

  await db
    .update(schema.users)
    .set({ failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(schema.users.id, user.id));
  return { ok: true, user };
}

/* ---------- roles ---------- */

export type Permission = 'view' | 'edit' | 'manage-users';

const RANK: Record<Role, number> = { viewer: 0, editor: 1, admin: 2, owner: 3 };

export function can(user: Pick<User, 'role'> | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  const rank = RANK[user.role];
  if (permission === 'view') return rank >= RANK.viewer;
  if (permission === 'edit') return rank >= RANK.editor;
  return rank >= RANK.admin;
}

export const ROLE_LABELS: Record<Role, { label: string; summary: string }> = {
  owner: { label: 'Owner', summary: 'Full access, including other owners' },
  admin: { label: 'Admin', summary: 'Everything, plus managing staff accounts' },
  editor: { label: 'Editor', summary: 'Content, photos, enquiries and bookings' },
  viewer: { label: 'Viewer', summary: 'Read-only access' },
};

/** Can `actor` create, edit or remove an account holding `targetRole`? */
export function canManageRole(actor: Pick<User, 'role'>, targetRole: Role): boolean {
  if (!can(actor, 'manage-users')) return false;
  return actor.role === 'owner' || RANK[targetRole] < RANK.admin;
}
