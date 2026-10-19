// D-149 test helper — in-memory stand-in for the narrow FeedbackRedis surface
// (shared by the lib + route tests; not a *.test.ts so vitest does not run it).

import type { FeedbackRedis, FeedbackTx } from "../feedback";

export function makeFakeRedis(): FeedbackRedis & {
  kv: Map<string, unknown>;
  zsets: Map<string, Map<string, number>>;
} {
  const kv = new Map<string, unknown>();
  const zsets = new Map<string, Map<string, number>>();
  return {
    kv,
    zsets,
    multi() {
      const queued: Array<() => void> = [];
      const tx: FeedbackTx = {
        set(key, value) {
          queued.push(() => kv.set(key, structuredClone(value)));
          return tx;
        },
        zadd(key, entry) {
          queued.push(() => {
            const z = zsets.get(key) ?? new Map<string, number>();
            z.set(entry.member, entry.score);
            zsets.set(key, z);
          });
          return tx;
        },
        async exec() {
          for (const op of queued) op();
          return queued.map(() => "OK");
        },
      };
      return tx;
    },
    async zrange(key, _start, _stop, opts) {
      const z = zsets.get(key);
      if (!z) return [];
      const sorted = [...z.entries()].sort((a, b) => a[1] - b[1]).map(([m]) => m);
      return opts?.rev ? sorted.reverse() : sorted;
    },
    async mget<T>(...keys: string[]) {
      return keys.map((k) => (kv.has(k) ? (structuredClone(kv.get(k)) as T) : null));
    },
  };
}
