import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, eachDate, isIsoDate, todaySast } from '../src/server/lib/dates';
import { newRef, slugify } from '../src/server/lib/ids';
import { describePrices, formatRand, quote } from '../src/server/lib/pricing';
import { rateLimit, resetRateLimits } from '../src/server/lib/rate-limit';
import { hashPassword, passwordProblem, verifyPassword } from '../src/server/auth/password';
import { can, canManageRole } from '../src/server/auth/session';
import { toCsv } from '../src/server/services/enquiries';

describe('dates', () => {
  it('accepts real dates only', () => {
    expect(isIsoDate('2026-12-24')).toBe(true);
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(isIsoDate('24/12/2026')).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });
  it('does date arithmetic across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(daysBetween('2026-12-24', '2027-01-02')).toBe(9);
    expect(eachDate('2026-02-27', '2026-03-02')).toEqual(['2026-02-27', '2026-02-28', '2026-03-01']);
  });
  it('uses the South African calendar day', () => {
    // 23:30 UTC is already tomorrow in Pennington
    expect(todaySast(new Date('2026-11-17T23:30:00Z'))).toBe('2026-11-18');
  });
});

describe('pricing', () => {
  it('uses published options and the configured deposit in public prices', () => {
    expect(describePrices([
      { kind: 'stay', rate: 225, minPeople: 2 },
      { kind: 'stay', rate: 175, minPeople: 2 },
      { kind: 'venue', rate: 90, minPeople: 12 },
    ], 600)).toEqual({
      accommodation: 'From R175 per person per night',
      venue: 'R90 per person (minimum 12 people, deposit R600)',
    });
    expect(describePrices([{ kind: 'venue', rate: 40, minPeople: 1 }], 75)).toEqual({
      accommodation: '',
      venue: 'R40 per person (minimum 1 person, deposit up to R75)',
    });
    expect(describePrices([], 0)).toEqual({ accommodation: '', venue: '' });
  });

  it('prices a stay per person per night with a rounded-up deposit', () => {
    expect(quote({ kind: 'stay', rate: 200, people: 4, nights: 3 })).toEqual({ nights: 3, total: 2400, deposit: 1200, balance: 1200 });
    // 50% of R480 is R240, rounded up to the next R50
    expect(quote({ kind: 'stay', rate: 160, people: 3, nights: 1 }).deposit).toBe(250);
  });
  it('prices the venue per person with a flat deposit', () => {
    expect(quote({ kind: 'venue', rate: 80, people: 25, nights: 0 })).toEqual({ nights: 0, total: 2000, deposit: 500, balance: 1500 });
  });
  it('never asks for a deposit larger than the total', () => {
    expect(quote({ kind: 'venue', rate: 10, people: 10, nights: 0 }).deposit).toBe(100);
  });
  it('follows the configured policy', () => {
    expect(quote({ kind: 'stay', rate: 200, people: 4, nights: 2 }, { stayDepositPercent: 25, venueDeposit: 0 }).deposit).toBe(400);
  });
  it('formats Rand with a space separator', () => {
    expect(formatRand(1200)).toBe('R1 200');
    expect(formatRand(80)).toBe('R80');
    expect(formatRand(1234567)).toBe('R1 234 567');
  });
});

describe('ids', () => {
  it('makes phone-friendly references', () => {
    expect(newRef('PAS')).toMatch(/^PAS-[A-HJ-KM-NP-Z2-9]{5}$/);
  });
  it('slugifies names', () => {
    expect(slugify("The Dove's Nest")).toBe('the-doves-nest');
    expect(slugify('  Venue & Day Events ')).toBe('venue-day-events');
  });
});

describe('rate limit', () => {
  it('blocks after the limit and recovers after the window', () => {
    resetRateLimits();
    expect(rateLimit('k', 2, 1000, 0).ok).toBe(true);
    expect(rateLimit('k', 2, 1000, 10).ok).toBe(true);
    const blocked = rateLimit('k', 2, 1000, 20);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBe(1);
    expect(rateLimit('k', 2, 1000, 1500).ok).toBe(true);
  });
});

describe('passwords', () => {
  it('verifies the right password and rejects the wrong one', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse battery', hash)).toBe(true);
    expect(await verifyPassword('correct horse batterz', hash)).toBe(false);
    expect(await verifyPassword('anything', 'not-a-hash')).toBe(false);
  });
  it('salts every hash', async () => {
    expect(await hashPassword('same password here')).not.toBe(await hashPassword('same password here'));
  });
  it('rejects weak passwords', () => {
    expect(passwordProblem('short')).toBeTruthy();
    expect(passwordProblem('rootpass-rootpass')).toBeTruthy();
    expect(passwordProblem('aaaaaaaaaaaa')).toBeTruthy();
    expect(passwordProblem('umdoni road milkwood')).toBeNull();
  });
});

describe('roles', () => {
  it('grants permissions by rank', () => {
    expect(can({ role: 'viewer' }, 'view')).toBe(true);
    expect(can({ role: 'viewer' }, 'edit')).toBe(false);
    expect(can({ role: 'editor' }, 'edit')).toBe(true);
    expect(can({ role: 'editor' }, 'manage-users')).toBe(false);
    expect(can({ role: 'admin' }, 'manage-users')).toBe(true);
    expect(can(null, 'view')).toBe(false);
  });
  it('stops admins from managing owners or other admins', () => {
    expect(canManageRole({ role: 'admin' }, 'editor')).toBe(true);
    expect(canManageRole({ role: 'admin' }, 'admin')).toBe(false);
    expect(canManageRole({ role: 'admin' }, 'owner')).toBe(false);
    expect(canManageRole({ role: 'owner' }, 'owner')).toBe(true);
    expect(canManageRole({ role: 'editor' }, 'viewer')).toBe(false);
  });
});

describe('csv export', () => {
  it('quotes awkward cells and defuses spreadsheet formulas', () => {
    const csv = toCsv([{ name: 'Dlamini, N', message: '=HYPERLINK("http://x")', note: 'line1\nline2' }]);
    expect(csv).toBe('name,message,note\r\n"Dlamini, N","\'=HYPERLINK(""http://x"")","line1\nline2"');
  });
});
