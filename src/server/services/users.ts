// Staff accounts.
import { asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { hashPassword, passwordProblem, verifyPassword } from '../auth/password';
import { canManageRole, destroyUserSessions } from '../auth/session';
import { getDb, schema } from '../db/client';
import type { Role, User } from '../db/schema';
import { newId } from '../lib/ids';
import { logActivity } from './activity';

export class UserError extends Error {}

type Actor = Pick<User, 'id' | 'name' | 'role'>;

const password = z.string().superRefine((v, ctx) => {
  const problem = passwordProblem(v);
  if (problem) ctx.addIssue({ code: 'custom', message: problem });
});

export const userInput = z.object({
  name: z.string().trim().min(2, 'Enter the person’s name.').max(120),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email('That email address does not look right.')),
  role: z.enum(['owner', 'admin', 'editor', 'viewer']),
});

export async function listUsers() {
  const db = await getDb();
  return db.select().from(schema.users).orderBy(asc(schema.users.name));
}

export async function getUser(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return row ?? null;
}

async function emailTaken(email: string, ignoreId?: string) {
  const db = await getDb();
  const [row] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(sql`lower(${schema.users.email})`, email.toLowerCase()))
    .limit(1);
  return Boolean(row && row.id !== ignoreId);
}

async function activeOwnerCount() {
  const db = await getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.users)
    .where(sql`${schema.users.role} = 'owner' and ${schema.users.active}`);
  return count;
}

/** Create an account with a temporary password the person must change at first sign-in. */
export async function createUser(input: z.infer<typeof userInput> & { password: string }, actor: Actor | null) {
  const data = userInput.parse(input);
  const pw = password.parse(input.password);
  if (actor && !canManageRole(actor, data.role)) throw new UserError('You cannot create an account with that role.');
  if (await emailTaken(data.email)) throw new UserError('Someone already has an account with that email address.');

  const db = await getDb();
  const [user] = await db
    .insert(schema.users)
    .values({
      id: newId(),
      ...data,
      passwordHash: await hashPassword(pw),
      mustChangePassword: true,
    })
    .returning();
  await logActivity({
    actorId: actor?.id,
    action: 'user.created',
    entityType: 'user',
    entityId: user.id,
    summary: actor ? `${actor.name} added ${user.name} as ${user.role}` : `Account created for ${user.name} (${user.role})`,
  });
  return user;
}

export async function updateUser(id: string, input: z.infer<typeof userInput> & { active: boolean }, actor: Actor) {
  const data = userInput.parse(input);
  const target = await getUser(id);
  if (!target) throw new UserError('That account no longer exists.');
  if (!canManageRole(actor, target.role) || !canManageRole(actor, data.role)) {
    throw new UserError('You do not have permission to change this account.');
  }
  if (await emailTaken(data.email, id)) throw new UserError('Someone already has an account with that email address.');
  if (id === actor.id && (!input.active || data.role !== target.role)) {
    throw new UserError('You cannot change your own role or deactivate yourself.');
  }
  const losesOwner = target.role === 'owner' && target.active && (data.role !== 'owner' || !input.active);
  if (losesOwner && (await activeOwnerCount()) <= 1) {
    throw new UserError('There must always be at least one active owner.');
  }

  const db = await getDb();
  await db
    .update(schema.users)
    .set({ ...data, active: input.active, updatedAt: new Date() })
    .where(eq(schema.users.id, id));
  if (!input.active) await destroyUserSessions(id);
  await logActivity({
    actorId: actor.id,
    action: 'user.updated',
    entityType: 'user',
    entityId: id,
    summary: `${actor.name} updated the account for ${data.name}`,
  });
}

/** Staff reset: sets a temporary password and signs the person out everywhere. */
export async function resetPassword(id: string, newPassword: string, actor: Actor) {
  const target = await getUser(id);
  if (!target) throw new UserError('That account no longer exists.');
  if (!canManageRole(actor, target.role)) throw new UserError('You do not have permission to reset this password.');
  const pw = password.parse(newPassword);
  const db = await getDb();
  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(pw), mustChangePassword: true, failedLogins: 0, lockedUntil: null, updatedAt: new Date() })
    .where(eq(schema.users.id, id));
  await destroyUserSessions(id);
  await logActivity({
    actorId: actor.id,
    action: 'user.password-reset',
    entityType: 'user',
    entityId: id,
    summary: `${actor.name} reset the password for ${target.name}`,
  });
}

/** Self-service change. Other devices are signed out; the current session is kept. */
export async function changeOwnPassword(userId: string, current: string, next: string, sessionToken?: string) {
  const user = await getUser(userId);
  if (!user) throw new UserError('That account no longer exists.');
  if (!(await verifyPassword(current, user.passwordHash))) throw new UserError('Your current password is not correct.');
  const problem = passwordProblem(next);
  if (problem) throw new UserError(problem);
  if (current === next) throw new UserError('Choose a password you have not used here before.');
  const db = await getDb();
  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(next), mustChangePassword: false, updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
  await destroyUserSessions(userId, sessionToken);
  await logActivity({
    actorId: userId,
    action: 'user.password-changed',
    entityType: 'user',
    entityId: userId,
    summary: `${user.name} changed their password`,
  });
}

export async function deleteUser(id: string, actor: Actor) {
  const target = await getUser(id);
  if (!target) return;
  if (id === actor.id) throw new UserError('You cannot delete your own account.');
  if (!canManageRole(actor, target.role)) throw new UserError('You do not have permission to delete this account.');
  if (target.role === 'owner' && target.active && (await activeOwnerCount()) <= 1) {
    throw new UserError('There must always be at least one active owner.');
  }
  const db = await getDb();
  await db.delete(schema.users).where(eq(schema.users.id, id));
  await logActivity({
    actorId: actor.id,
    action: 'user.deleted',
    entityType: 'user',
    entityId: id,
    summary: `${actor.name} deleted the account for ${target.name}`,
  });
}

export async function userCount() {
  const db = await getDb();
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.users);
  return count;
}

export type { Role };
