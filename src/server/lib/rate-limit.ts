// Small in-memory sliding-window limiter for public forms and sign-in.
// Per-process, which is right for a single-instance deployment; behind
// several instances put a shared limiter (or the platform's) in front.

const store = globalThis as typeof globalThis & { __pasPlaceHits?: Map<string, number[]> };
const hits = (store.__pasPlaceHits ??= new Map<string, number[]>());

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): { ok: boolean; retryAfter: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

export function resetRateLimits() {
  hits.clear();
}
