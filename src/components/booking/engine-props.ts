// Shapes server content into the props the booking island needs
// (only what the browser has to know).
import type { SiteContent } from '../../server/services/content';
import type { EngineOption } from './BookingEngine';

export function engineProps(site: SiteContent) {
  const options: EngineOption[] = site.options.map((o) => ({
    slug: o.slug,
    name: o.name,
    blurb: o.blurb,
    capacityLabel: o.capacityLabel,
    minPeople: o.minPeople,
    maxPeople: o.maxPeople,
    rate: o.rate,
    rateLabel: o.rateLabel,
    kind: o.kind,
    image: o.image ? { src: o.image.src, alt: o.image.alt, color: o.image.color } : null,
  }));
  const { booking, contact } = site.settings;
  return {
    options,
    policy: { stayDepositPercent: booking.stayDepositPercent, venueDeposit: booking.venueDeposit },
    phone: contact.phone,
    phoneLink: contact.phoneLink,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
  };
}
