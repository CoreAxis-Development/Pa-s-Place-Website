// Password hashing with scrypt (node:crypto, no native add-ons).
// Stored form: scrypt$N$r$p$salt$hash — parameters travel with the hash so
// they can be raised later without invalidating existing passwords.
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const N = 32768; // 2^15, OWASP's interactive-login floor for scrypt with r=8
const R = 8;
const P = 1;
const KEYLEN = 64;

const derive = (password: string, salt: Buffer, n: number, r: number, p: number, len: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, len, { N: n, r, p, maxmem: 128 * n * r * 2 }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P, KEYLEN);
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, salt, hash] = parts;
  const expected = Buffer.from(hash, 'base64');
  try {
    const actual = await derive(password, Buffer.from(salt, 'base64'), Number(n), Number(r), Number(p), expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export const MIN_PASSWORD_LENGTH = 10;

/** Returns a problem description, or null when the password is acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > 200) return 'Use at most 200 characters.';
  if (/^(.)\1+$/.test(password)) return 'Choose something less repetitive.';
  if (['password', 'pasplace', 'rootpass', 'changeme', '1234567890'].some((w) => password.toLowerCase().includes(w)))
    return 'That password is too easy to guess.';
  return null;
}

export function usesDevelopmentOwner(): boolean {
  const environmentId = process.env.RAILWAY_ENVIRONMENT_ID;
  return environmentId === '80d2e529-f064-4c5b-8fc7-9f27d82245c7' || (!environmentId && import.meta.env.DEV);
}

export function developmentOwnerEmail(): string | undefined {
  if (!usesDevelopmentOwner()) return undefined;
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || (import.meta.env.DEV ? 'admin@test.co' : undefined);
}

export function isDevelopmentOwner(user: { email: string; role: string }): boolean {
  return user.role === 'owner' && user.email.toLowerCase() === developmentOwnerEmail();
}

/** Development owner credentials come from the operator and are changed on demand. */
export function initialOwnerPasswordProblem(value: string): string | null {
  if (!usesDevelopmentOwner()) return passwordProblem(value);
  return value.length > 0 && value.length <= 200 ? null : 'Use between 1 and 200 characters.';
}
