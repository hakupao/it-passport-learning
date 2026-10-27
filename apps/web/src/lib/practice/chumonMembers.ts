// Stage 7 Phase 3 (D-196 §0-1 / §0-6) — the chumon group registry, server only.
//
// Reads ONLY data/ip/quiz/chumon_groups.json: the textbook unit route imports
// this, and must not import quizReader / practiceReader (their loaders read
// questions.json + the ~30 MB translation / explanation sidecars, which nft
// would then trace into the textbook route bundle). The path resolves straight
// to the file, like textbookRoot() / quizDataRoot() resolve straight to their
// dirs, so nothing else under data/ip is traced.

import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export interface ChumonRegistry {
  groups: { key: string; exam_id: string; member_ids: string[] }[];
}

/** Every chumon group member id. Branded: only loadChumonMembers produces one (§0-1 invariant). */
export type ChumonMembers = ReadonlySet<string> & { readonly __brand: "ChumonMembers" };

// Keep in sync with quiz/quizReader.ts quizDataRoot() (QUIZ_DATA_ROOT → <root>/quiz, else
// <cwd>/../../data/ip/quiz). Not shared on purpose: resolving straight to the file (not the
// quiz dir) keeps nft from latching onto data/ip/quiz and tracing the ~30 MB sidecars.
function registryFile(): string {
  const env = process.env.QUIZ_DATA_ROOT;
  return env
    ? path.join(env, "quiz", "chumon_groups.json")
    : path.resolve(process.cwd(), "../../data/ip/quiz/chumon_groups.json");
}

let registryPromise: Promise<ChumonRegistry> | null = null;

/** data/ip/quiz/chumon_groups.json, once per lambda lifetime; a rejection is not memoized. */
export function loadChumonRegistryFile(): Promise<ChumonRegistry> {
  return (registryPromise ??= fs
    .readFile(registryFile(), "utf-8")
    .then((s) => JSON.parse(s) as ChumonRegistry)
    .catch((err: unknown) => {
      registryPromise = null;
      throw err;
    }));
}

let membersPromise: Promise<ChumonMembers> | null = null;

/** Every member id of every chumon group (the textbook drops them from confirm / per-term quiz). */
export function loadChumonMembers(): Promise<ChumonMembers> {
  return (membersPromise ??= loadChumonRegistryFile()
    .then((r) => new Set(r.groups.flatMap((g) => g.member_ids)) as ReadonlySet<string> as ChumonMembers)
    .catch((err: unknown) => {
      membersPromise = null;
      throw err;
    }));
}
