// D-089 §2.1 corpus boot loader — module-level singleton per Q3=b (Session 34).
//
// Lazy-initialized FsDataSource; first loadIndex()/loadGlossary() call warms
// the FsDataSource in-memory cache. `warmUp()` is a Promise.all helper that an
// upstream caller (e.g. Next.js instrumentation.ts in Step 4+) may invoke for
// explicit pre-warm.
//
// In a Next.js server runtime, this module is reused across Route Handlers /
// Server Components / Server Actions on the same lambda instance — so the
// singleton stays warm for that lambda's lifetime per Vercel serverless model.

import { FsDataSource } from "./FsDataSource";
import type { DataSource } from "./DataSource";

let singleton: DataSource | null = null;

/** Return the process-wide DataSource singleton. Constructs on first call. */
export function getDataSource(): DataSource {
  if (!singleton) {
    singleton = new FsDataSource();
  }
  return singleton;
}

/** Eagerly warm the index + glossary cache. Safe to call multiple times. */
export async function warmUp(): Promise<void> {
  const ds = getDataSource();
  await Promise.all([ds.loadIndex(), ds.loadGlossary()]);
}

/** Test-only: swap the singleton with a stub DataSource. */
export function __setDataSourceForTesting(ds: DataSource): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "__setDataSourceForTesting must only be called in test env",
    );
  }
  singleton = ds;
}

/** Test-only: clear the singleton (next getDataSource() rebuilds). */
export function __resetDataSourceForTesting(): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "__resetDataSourceForTesting must only be called in test env",
    );
  }
  singleton = null;
}

export { FsDataSource };
export type { DataSource };
