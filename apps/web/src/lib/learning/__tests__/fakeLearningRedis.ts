// D-180 test helper — in-memory stand-in for the narrow LearningRedis surface
// (not a *.test.ts so vitest does not run it). Tests seed `kv` directly to
// simulate what @upstash/redis `get` hands back (an object or a string).

import type { LearningRedis } from "../syncStore";

export function makeFakeLearningRedis(): LearningRedis & {
  kv: Map<string, unknown>;
  sets: number;
} {
  const kv = new Map<string, unknown>();
  const fake = {
    kv,
    sets: 0,
    async get(key: string) {
      return kv.has(key) ? structuredClone(kv.get(key)) : null;
    },
    async set(key: string, value: string) {
      fake.sets++;
      kv.set(key, value);
      return "OK";
    },
  };
  return fake;
}
