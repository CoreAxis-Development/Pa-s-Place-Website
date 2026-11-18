// The enquiries inbox: every message sent through a public form.
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, schema } from '../db/client';
import type { EnquiryStatus, EnquiryType } from '../db/schema';
import { newId, newRef } from '../lib/ids';
import { logActivity } from './activity';

export const ENQUIRY_TYPES: { value: EnquiryType; label: string }[] = [
  { value: 'general', label: 'General question' },
  { value: 'stay', label: 'Accommodation' },
  { value: 'venue', label: 'Venue hire' },
  { value: 'sponsor', label: 'Sponsoring a holiday' },
  { value: 'volunteer', label: 'Volunteering' },
];

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string; tone: string }[] = [
  { value: 'new', label: 'New', tone: 'warning' },
  { value: 'open', label: 'In progress', tone: 'info' },
  { value: 'waiting', label: 'Waiting on guest', tone: 'neutral' },
  { value: 'resolved', label: 'Resolved', tone: 'success' },
  { value: 'spam', label: 'Spam', tone: 'danger' },
];

export const enquiryTypeLabel = (t: string) => ENQUIRY_TYPES.find((x) => x.value === t)?.label ?? t;
export const enquiryStatusMeta = (s: string) => ENQUIRY_STATUSES.find((x) => x.value === s) ?? ENQUIRY_STATUSES[0];

export const enquiryInput = z.object({
  type: z.enum(['general', 'stay', 'venue', 'sponsor', 'volunteer']).default('general'),
  name: z.string().trim().min(2, 'Please tell us your name.').max(120),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email('That email address does not look right.')),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\s-]*$/, 'Use digits only for the phone number.')
    .default(''),
  message: z.string().trim().min(10, 'Please add a few words so we know how to help.').max(4000),
  source: z.string().trim().max(200).default(''),
});

export async function createEnquiry(input: z.infer<typeof enquiryInput>) {
  const db = await getDb();
  const [row] = await db
    .insert(schema.enquiries)
    .values({ id: newId(), ref: newRef('ENQ'), ...input })
    .returning();
  await logActivity({
    action: 'enquiry.received',
    entityType: 'enquiry',
    entityId: row.id,
    summary: `New ${enquiryTypeLabel(row.type).toLowerCase()} enquiry from ${row.name} (${row.ref})`,
  });
  return row;
}

export interface EnquiryFilter {
  status?: EnquiryStatus | 'active';
  type?: EnquiryType;
  q?: string;
  limit?: number;
  offset?: number;
}

function enquiryWhere(f: EnquiryFilter) {
  const q = f.q?.trim();
  return and(
    f.status === 'active'
      ? sql`${schema.enquiries.status} in ('new', 'open', 'waiting')`
      : f.status
        ? eq(schema.enquiries.status, f.status)
        : undefined,
    f.type ? eq(schema.enquiries.type, f.type) : undefined,
    q
      ? or(
          ilike(schema.enquiries.name, `%${q}%`),
          ilike(schema.enquiries.email, `%${q}%`),
          ilike(schema.enquiries.message, `%${q}%`),
          ilike(schema.enquiries.ref, `%${q}%`)
        )
      : undefined
  );
}

export async function listEnquiries(f: EnquiryFilter = {}) {
  const db = await getDb();
  const where = enquiryWhere(f);
  const rows = await db.query.enquiries.findMany({
    where,
    with: { assignee: { columns: { id: true, name: true } } },
    orderBy: [desc(schema.enquiries.createdAt)],
    limit: f.limit ?? 25,
    offset: f.offset ?? 0,
  });
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.enquiries).where(where);
  return { rows, total: count };
}

export async function getEnquiry(id: string) {
  const db = await getDb();
  return (
    (await db.query.enquiries.findFirst({
      where: eq(schema.enquiries.id, id),
      with: { assignee: { columns: { id: true, name: true } } },
    })) ?? null
  );
}

export async function updateEnquiry(
  id: string,
  patch: { status?: EnquiryStatus; assigneeId?: string | null },
  actor: { id: string; name: string }
) {
  const db = await getDb();
  const current = await getEnquiry(id);
  if (!current) return null;

  const set: Partial<typeof schema.enquiries.$inferInsert> = { updatedAt: new Date() };
  const changes: string[] = [];
  if (patch.status && patch.status !== current.status) {
    set.status = patch.status;
    set.resolvedAt = patch.status === 'resolved' ? new Date() : null;
    changes.push(`marked ${enquiryStatusMeta(patch.status).label.toLowerCase()}`);
  }
  if (patch.assigneeId !== undefined && patch.assigneeId !== current.assigneeId) {
    set.assigneeId = patch.assigneeId;
    changes.push(patch.assigneeId ? 'reassigned' : 'unassigned');
  }
  if (!changes.length) return current;

  await db.update(schema.enquiries).set(set).where(eq(schema.enquiries.id, id));
  await logActivity({
    actorId: actor.id,
    action: 'enquiry.updated',
    entityType: 'enquiry',
    entityId: id,
    summary: `${actor.name} ${changes.join(' and ')} enquiry ${current.ref}`,
  });
  return getEnquiry(id);
}

export async function deleteEnquiry(id: string, actor: { id: string; name: string }) {
  const db = await getDb();
  const current = await getEnquiry(id);
  if (!current) return;
  await db.delete(schema.notes).where(and(eq(schema.notes.entityType, 'enquiry'), eq(schema.notes.entityId, id)));
  await db.delete(schema.enquiries).where(eq(schema.enquiries.id, id));
  await logActivity({
    actorId: actor.id,
    action: 'enquiry.deleted',
    entityType: 'enquiry',
    entityId: id,
    summary: `${actor.name} deleted enquiry ${current.ref} from ${current.name}`,
  });
}

export async function enquiryCounts() {
  const db = await getDb();
  const rows = await db
    .select({ status: schema.enquiries.status, count: sql<number>`count(*)::int` })
    .from(schema.enquiries)
    .groupBy(schema.enquiries.status);
  const by = Object.fromEntries(rows.map((r) => [r.status, r.count])) as Partial<Record<EnquiryStatus, number>>;
  return {
    new: by.new ?? 0,
    open: by.open ?? 0,
    waiting: by.waiting ?? 0,
    resolved: by.resolved ?? 0,
    spam: by.spam ?? 0,
  };
}

/** Spreadsheet export. Cells that start with a formula character are neutralised. */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const cell = (v: unknown) => {
    let s = v instanceof Date ? v.toISOString() : String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headers = Object.keys(rows[0]);
  return [headers.join(','), ...rows.map((r) => headers.map((h) => cell(r[h])).join(','))].join('\r\n');
}
