// Email notifications. Optional: with no SMTP_HOST configured nothing is
// sent and the portal's inbox is the only record. Sending never blocks or
// fails a guest's submission — problems are logged to the audit trail.
import type { Booking, Enquiry, StayOption } from '../db/schema';
import { formatDate } from '../lib/dates';
import { formatRand } from '../lib/pricing';
import { logActivity } from './activity';
import { getDocument } from './documents';
import { enquiryTypeLabel } from './enquiries';

export const mailConfigured = () => Boolean(process.env.SMTP_HOST);

interface Message {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

async function send(msg: Message) {
  if (!mailConfigured() || !msg.to) return;
  try {
    const { createTransport } = await import('nodemailer');
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
    const settings = await getDocument('settings');
    await transport.sendMail({
      from: process.env.SMTP_FROM || `${settings.siteName} <${settings.contact.email}>`,
      to: msg.to,
      replyTo: msg.replyTo,
      subject: msg.subject,
      text: msg.text,
    });
  } catch (err) {
    await logActivity({
      action: 'mail.failed',
      entityType: 'system',
      summary: `Could not send "${msg.subject}": ${err instanceof Error ? err.message : 'unknown error'}`,
    }).catch(() => {});
  }
}

const siteUrl = () => (process.env.SITE_URL || '').replace(/\/+$/, '');

async function staffAddress() {
  const s = await getDocument('settings');
  return s.notifications.email || s.contact.email;
}

export async function notifyEnquiry(enquiry: Enquiry) {
  const settings = await getDocument('settings');
  await Promise.all([
    send({
      to: await staffAddress(),
      replyTo: enquiry.email,
      subject: `New enquiry ${enquiry.ref}: ${enquiryTypeLabel(enquiry.type)} from ${enquiry.name}`,
      text: [
        `${enquiry.name} <${enquiry.email}>${enquiry.phone ? `, ${enquiry.phone}` : ''}`,
        '',
        enquiry.message,
        '',
        `Open it in the portal: ${siteUrl()}/admin/enquiries/${enquiry.id}`,
      ].join('\n'),
    }),
    send({
      to: enquiry.email,
      subject: `We have your message (${enquiry.ref})`,
      text: [
        `Hi ${enquiry.name},`,
        '',
        `Thanks for getting in touch with ${settings.siteName}. Your message has reached us and we will reply as soon as we can.`,
        settings.contact.phone ? `If it is urgent, call ${settings.contact.phone}.` : '',
        '',
        `Your reference is ${enquiry.ref}.`,
      ]
        .filter((l) => l !== '')
        .join('\n\n'),
    }),
  ]);
}

export async function notifyBooking(booking: Booking, option: StayOption) {
  const settings = await getDocument('settings');
  const when =
    option.kind === 'venue'
      ? formatDate(booking.startDate)
      : `${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`;
  const lines = [
    `${option.name}`,
    `${when}, ${booking.people} people`,
    `Total ${formatRand(booking.total)}, deposit ${formatRand(booking.deposit)}`,
  ];
  await Promise.all([
    send({
      to: await staffAddress(),
      replyTo: booking.email,
      subject: `New booking request ${booking.ref}: ${option.name}, ${when}`,
      text: [
        `${booking.guestName} <${booking.email}>, ${booking.phone}`,
        ...lines,
        booking.notes ? `Notes: ${booking.notes}` : '',
        '',
        `Confirm or decline it in the portal: ${siteUrl()}/admin/bookings/${booking.id}`,
      ].join('\n'),
    }),
    send({
      to: booking.email,
      subject: `Your booking request ${booking.ref}`,
      text: [
        `Hi ${booking.guestName},`,
        `Thanks for your booking request at ${settings.siteName}. We are holding these dates for you and will confirm shortly.`,
        lines.join('\n'),
        settings.booking.paymentInstructions
          ? `Paying the deposit:\n${settings.booking.paymentInstructions}\nUse ${booking.ref} as your payment reference.`
          : '',
        settings.contact.phone ? `Questions? Call ${settings.contact.phone} and quote ${booking.ref}.` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    }),
  ]);
}
