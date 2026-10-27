// Stage 7 Phase 3 Task 8 (D-196 §0-9) — v1 units render byte-identically through the v2 reader
// work: a hash of the term index, every <article> and the key-points section (the parts
// TermBlock / UnitHeader render; the AI 先生 slot and the client islands are left out), in
// ja / zh / en, for a stratified sample: 14 units of each 分野 (evenly spaced in unit_id order)
// plus one synthetic v1 unit whose terms lack an analogy / a memory hook (no corpus unit does).
//
// How the snapshot was recorded: from the pre-Task-8 code — a temporary git worktree at 7ebc950
// (outside the repo), this same test file copied in, TEXTBOOK_DATA_ROOT / QUIZ_DATA_ROOT pointed
// at the main checkout's data/ip, UNIT_READER_V1_WRITE=1; the JSON was copied back and then
// verified on HEAD. Re-record only on purpose:
//   UNIT_READER_V1_WRITE=1 pnpm exec vitest run src/components/textbook/__tests__/UnitReader.v1snapshot.test.ts
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale, namespace }: { locale: string; namespace: string }) =>
    createTranslator({ locale, messages: messages(locale), namespace: namespace as never }),
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, locale, children, className }: { href: string; locale?: string; children: React.ReactNode; className?: string }) =>
    h("a", { href: `/${locale ?? "_"}${href}`, className }, children),
  useRouter: () => ({ push: () => {} }),
}));

import { UnitReader } from "../UnitReader";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { loadChumonMembers } from "@/lib/practice/chumonMembers";
import { pickConfirm } from "@/lib/textbook/confirm";
import { loadAllUnits, loadReaderIndex, neighbors, normalizeUnit, unitPlace, type TextbookUnit } from "@/lib/textbook/reader";
import { V2_SCHEMA } from "@/lib/textbook/types";

const PER_CATEGORY = 14;

/** 14 evenly spaced v1 units per 分野 (unit_id order) + a synthetic one without analogy / hook. */
function sample(units: TextbookUnit[]): TextbookUnit[] {
  const v1 = units.filter((u) => u.schema_version !== V2_SCHEMA).sort((a, b) => a.unit_id.localeCompare(b.unit_id));
  const out: TextbookUnit[] = [];
  for (const cat of ["technology", "management", "strategy"]) {
    const list = v1.filter((u) => u.category === cat);
    for (let i = 0; i < PER_CATEGORY; i++) out.push(list[Math.floor((i * list.length) / PER_CATEGORY)]!);
  }
  const base = v1.find((u) => u.category === "management" && u.terms.length >= 2)!;
  const blank = { analogy_jp: "", analogy_zh: "", analogy_en: "" };
  const noHook = { memory_hook_jp: "", memory_hook_zh: "", memory_hook_en: "" };
  out.push({
    ...base,
    unit_id: `${base.unit_id}-nohook`,
    terms: base.terms.map((t, i) => (i === 0 ? { ...t, ...blank } : i === 1 ? { ...t, ...noHook } : t)),
  });
  return out;
}

const FILE = path.join(__dirname, "__snapshots__", "unit-reader-v1.json");
const LOCALES = ["ja", "zh", "en"] as const;

/** The reader parts under test, in page order. */
function parts(out: string): string {
  const idx = out.match(/<nav[^>]*data-part="term-index"[\s\S]*?<\/nav>/)?.[0] ?? "";
  const articles = [...out.matchAll(/<article[\s\S]*?<\/article>/g)].map((m) => m[0]).join("\n");
  const keys = out.match(/<section[^>]*data-part="key-points"[\s\S]*?<\/section>/)?.[0] ?? "";
  return `${idx}\n${articles}\n${keys}`;
}

describe("UnitReader v1 output is unchanged", () => {
  it("a stratified v1 sample × 3 locales matches the hashes recorded on the pre-Task-8 code", async () => {
    const [index, members, units] = await Promise.all([loadReaderIndex(), loadChumonMembers(), loadAllUnits()]);
    const picked = sample(units);
    expect(new Set(picked.map((u) => u.unit_id)).size).toBe(3 * PER_CATEGORY + 1);
    const now: Record<string, string> = {};
    for (const raw of picked) {
      const unit = normalizeUnit(raw, members);
      for (const locale of LOCALES) {
        const el = await UnitReader({
          unit,
          place: unitPlace(index, unit.id, locale),
          neighbors: neighbors(index, unit.id),
          locale,
          senseiAnchorText: "A",
          confirm: pickConfirm(unit, members),
        });
        const out = renderToStaticMarkup(
          h(NextIntlClientProvider, { locale, messages: messages(locale), children: h(LearningRecordProvider, { isOwner: false, children: el }) }),
        );
        now[`${raw.unit_id}:${locale}`] = createHash("sha256").update(parts(out)).digest("hex").slice(0, 16);
      }
    }
    expect(Object.keys(now)).toHaveLength((3 * PER_CATEGORY + 1) * 3);
    if (process.env.UNIT_READER_V1_WRITE === "1") writeFileSync(FILE, `${JSON.stringify(now, null, 1)}\n`);
    expect(existsSync(FILE)).toBe(true);
    const saved = JSON.parse(readFileSync(FILE, "utf-8")) as Record<string, string>;
    for (const [k, v] of Object.entries(now)) expect(saved[k], k).toBe(v);
  });
});
