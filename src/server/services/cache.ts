// Public pages read all site content through one cached snapshot. Any admin
// write bumps the version, so edits are live on the next request; the TTL is
// only a safety net for a multi-instance deployment.

const store = globalThis as typeof globalThis & { __pasPlaceContentVersion?: number };

export const contentVersion = () => store.__pasPlaceContentVersion ?? 0;

export function bumpContentVersion() {
  store.__pasPlaceContentVersion = contentVersion() + 1;
}

export function cached<T>(ttlMs: number, load: () => Promise<T>): () => Promise<T> {
  let entry: { version: number; at: number; value: Promise<T> } | undefined;
  return () => {
    const now = Date.now();
    if (!entry || entry.version !== contentVersion() || now - entry.at > ttlMs) {
      const value = load();
      entry = { version: contentVersion(), at: now, value };
      value.catch(() => {
        if (entry?.value === value) entry = undefined;
      });
    }
    return entry.value;
  };
}
