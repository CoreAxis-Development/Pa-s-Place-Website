// What a booking costs. One place, shared by the public quote and the server,
// so the price a guest sees is the price that gets stored.

export interface PricingPolicy {
  /** share of a stay's total taken as deposit, e.g. 50 */
  stayDepositPercent: number;
  /** flat deposit for a day-venue booking, in Rand */
  venueDeposit: number;
}

export const DEFAULT_POLICY: PricingPolicy = { stayDepositPercent: 50, venueDeposit: 500 };

export interface Quote {
  nights: number;
  total: number;
  deposit: number;
  balance: number;
}

export function quote(
  input: { kind: 'stay' | 'venue'; rate: number; people: number; nights: number },
  policy: PricingPolicy = DEFAULT_POLICY
): Quote {
  const nights = input.kind === 'stay' ? Math.max(0, input.nights) : 0;
  const total = input.kind === 'stay' ? nights * input.people * input.rate : input.people * input.rate;
  // stays: the percentage, rounded up to the next R50 so it is easy to pay by EFT
  const raw =
    input.kind === 'stay' ? Math.ceil((total * policy.stayDepositPercent) / 100 / 50) * 50 : policy.venueDeposit;
  const deposit = Math.min(total, raw);
  return { nights, total, deposit, balance: total - deposit };
}

/** R1 200 — a space as the thousands separator, the South African convention. */
export const formatRand = (n: number) => `R${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
