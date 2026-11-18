// The audit trail: an append-only log of who did what, plus staff notes.
import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb, schema, type Db, type Tx } from '../db/client';
import { newId } from '../lib/ids';

export interface LogEntry {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
}

export async function logActivity(entry: LogEntry, tx?: Db | Tx) {
  const db = tx ?? (await getDb());
  await db.insert(schema.activity).values({
    id: newId(),
    actorId: entry.actorId ?? null,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? '',
    summary: entry.summary.slice(0, 500),
  });
}

const withActor = {
  id: schema.activity.id,
  action: schema.activity.action,
  entityType: schema.activity.entityType,
  entityId: schema.activity.entityId,
  summary: schema.activity.summary,
  createdAt: schema.activity.createdAt,
  actorName: schema.users.name,
};

export async function listActivity(opts: { limit?: number; offset?: number; entityType?: string } = {}) {
  const db = await getDb();
  const where = opts.entityType ? eq(schema.activity.entityType, opts.entityType) : undefined;
  const rows = await db
    .select(withActor)
    .from(schema.activity)
    .leftJoin(schema.users, eq(schema.activity.actorId, schema.users.id))
    .where(where)
    .orderBy(desc(schema.activity.createdAt))
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.activity).where(where);
  return { rows, total: count };
}

export async function entityActivity(entityType: string, entityId: string) {
  const db = await getDb();
  return db
    .select(withActor)
    .from(schema.activity)
    .leftJoin(schema.users, eq(schema.activity.actorId, schema.users.id))
    .where(and(eq(schema.activity.entityType, entityType), eq(schema.activity.entityId, entityId)))
    .orderBy(desc(schema.activity.createdAt))
    .limit(100);
}

export async function addNote(entityType: string, entityId: string, authorId: string, body: string) {
  const db = await getDb();
  await db.insert(schema.notes).values({ id: newId(), entityType, entityId, authorId, body: body.trim().slice(0, 4000) });
}

export async function listNotes(entityType: string, entityId: string) {
  const db = await getDb();
  return db
    .select({
      id: schema.notes.id,
      body: schema.notes.body,
      createdAt: schema.notes.createdAt,
      authorName: schema.users.name,
    })
    .from(schema.notes)
    .leftJoin(schema.users, eq(schema.notes.authorId, schema.users.id))
    .where(and(eq(schema.notes.entityType, entityType), eq(schema.notes.entityId, entityId)))
    .orderBy(desc(schema.notes.createdAt));
}
