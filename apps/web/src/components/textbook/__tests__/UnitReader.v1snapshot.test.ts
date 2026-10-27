// Stage 7 Phase 3 Task 8 (D-196 §0-9) — v1 units render byte-identically through the v2 reader
// work: for 40 units with a figure × ja / zh / en, a hash of the term index, every <article>
// and the key-points section (the parts TermBlock / UnitHeader render; the AI 先生 slot and the
// client islands are left out). Recorded before Task 8; re-record only on purpose:
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
import { loadAllUnits, loadReaderIndex, neighbors, normalizeUnit, unitPlace } from "@/lib/textbook/reader";
import { V2_SCHEMA } from "@/lib/textbook/types";

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
  it("40 figure-bearing v1 units × 3 locales match the recorded hashes", async () => {
    const [index, members, units] = await Promise.all([loadReaderIndex(), loadChumonMembers(), loadAllUnits()]);
    const picked = units.filter((u) => u.schema_version !== V2_SCHEMA && u.terms.some((t) => t.figure)).slice(0, 40);
    const now: Record<string, string> = {};
    for (const raw of picked) {
      const unit = normalizeUnit(raw, members);
      for (const locale of LOCALES) {
        const el = await UnitReader({
          unit,
          place: unitPlace(index, raw.unit_id, locale),
          neighbors: neighbors(index, raw.unit_id),
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
    expect(Object.keys(now)).toHaveLength(120);
    if (process.env.UNIT_READER_V1_WRITE === "1") writeFileSync(FILE, `${JSON.stringify(now, null, 1)}\n`);
    expect(existsSync(FILE)).toBe(true);
    const saved = JSON.parse(readFileSync(FILE, "utf-8")) as Record<string, string>;
    for (const [k, v] of Object.entries(now)) expect(saved[k], k).toBe(v);
  });
});
