import type { APIRoute } from 'astro';
import type { EnquiryStatus, EnquiryType } from '../../../server/db/schema';
import { todaySast } from '../../../server/lib/dates';
import { logActivity } from '../../../server/services/activity';
import { ENQUIRY_STATUSES, ENQUIRY_TYPES, enquiryStatusMeta, enquiryTypeLabel, listEnquiries, toCsv } from '../../../server/services/enquiries';

// Exports the current filter as a spreadsheet. Personal information leaves the
// portal here, so each export is written to the audit trail.
export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user!;
  const statusParam = url.searchParams.get('status') ?? 'active';
  const status = statusParam === 'all' ? undefined : statusParam === 'active' ? 'active' : ENQUIRY_STATUSES.find((s) => s.value === statusParam)?.value;
  const type = ENQUIRY_TYPES.find((t) => t.value === url.searchParams.get('type'))?.value as EnquiryType | undefined;

  const { rows } = await listEnquiries({
    status: status as EnquiryStatus | 'active' | undefined,
    type,
    q: url.searchParams.get('q') ?? '',
    limit: 5000,
  });

  const csv = toCsv(
    rows.map((e) => ({
      Reference: e.ref,
      Received: e.createdAt,
      Status: enquiryStatusMeta(e.status).label,
      Topic: enquiryTypeLabel(e.type),
      Name: e.name,
      Email: e.email,
      Phone: e.phone,
      Message: e.message,
      'Assigned to': e.assignee?.name ?? '',
      'Sent from': e.source,
    }))
  );
  await logActivity({ actorId: user.id, action: 'enquiry.exported', entityType: 'enquiry', summary: `${user.name} exported ${rows.length} enquiries to CSV` });

  // the BOM makes Excel read the file as UTF-8
  return new Response(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pas-place-enquiries-${todaySast()}.csv"`,
    },
  });
};
