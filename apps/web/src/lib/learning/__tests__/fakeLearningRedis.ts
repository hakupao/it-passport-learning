// D-180 test helper — in-memory stand-in for the narrow LearningRedis surface
// (not a *.test.ts so vitest does not run it). Tests seed `kv` directly to
// simulate what is stored. Like @upstash/redis (automaticDeserialization on),
// `get` JSON.parses a stored string and hands back the raw string when it does
// not parse; set `autoDeserialize = false` to get the stored string as-is.

import type { LearningRedis } from "../syncStore";

export function makeFakeLearningRedis(): LearningRedis & {
  kv: Map<string, unknown>;
  gets: number;
  sets: number;
  autoDeserialize: boolean;
} {
  const kv = new Map<string, unknown>();
  const fake = {
    kv,
    gets: 0,
    sets: 0,
    autoDeserialize: true,
    async get(key: string) {
      fake.gets++;
      if (!kv.has(key)) return null;
      const value = structuredClone(kv.get(key));
      if (fake.autoDeserialize && typeof value === "string") {
        try {
          return JSON.parse(value) as unknown;
        } catch {
          return value;
        }
      }
      return value;
    },
    async set(key: string, value: string) {
      fake.sets++;
      kv.set(key, value);
      return "OK";
    },
  };
  return fake;
}
