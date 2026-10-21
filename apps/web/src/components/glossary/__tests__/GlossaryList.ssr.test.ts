// Stage 6 (D-179 / D-180) Task 4 — glossary list page component.
// Same SSR approach as QuizFeedback.ssr.test.ts (node env, renderToStaticMarkup,
// createElement instead of JSX, NextIntlClientProvider with the real catalogs).
import { describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

// next-intl's createNavigation imports `next/navigation` without an extension,
// which vitest's ESM resolver rejects. The stand-in mirrors localePrefix "always"
// (src/i18n/routing.ts): the explicit `locale` prop becomes the path prefix.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    locale,
    children,
    className,
  }: {
    href: string;
    locale: string;
    children: React.ReactNode;
    className?: string;
  }) => h("a", { href: `/${locale}${href}`, className }, children),
}));

import { GlossaryList, filterItems } from "../GlossaryList";
import type { DictListGroup } from "@/lib/glossary/dictionary";
import { buildListGroups } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { loadReaderIndex } from "@/lib/textbook/reader";

const GROUPS: DictListGroup[] = [
  {
    category: "management",
    topicId: "m-01",
    major: "プロジェクトマネジメント",
    medium: "プロジェクトマネジメント",
    nameJp: "プロジェクトの管理",
    items: [
      {
        id: "t0123456789abcdef",
        term: "PDCA",
        gloss: "PDCA",
        search: "pdca\npdca循环\npdca cycle",
      },
      {
        id: "t1111111111111111",
        term: "ガントチャート",
        gloss: "ガントチャート",
        // second sense carries a different en headword
        search: "ガントチャート\n甘特图\ngantt chart\n甘特图\nbar chart (schedule)",
      },
    ],
  },
  {
    category: "technology",
    topicId: "t-01",
    major: "セキュリティ",
    medium: "情報セキュリティ",
    nameJp: "情報セキュリティ管理",
    items: [
      {
        id: "t2222222222222222",
        term: "ISO/IEC 27000",
        gloss: "ISO/IEC 27000",
        search: "iso/iec 27000\niso/iec 27000\niso/iec 27000",
      },
    ],
  },
];

function render(locale: "ja" | "zh" | "en", groups: DictListGroup[]): string {
  const messages = JSON.parse(
    readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"),
  );
  return renderToStaticMarkup(
    h(NextIntlClientProvider, { locale, messages, children: h(GlossaryList, { locale, groups }) }),
  );
}

const hrefs = (out: string): string[] => [...out.matchAll(/href="([^"]*)"/g)].map((m) => m[1] ?? "");

describe("GlossaryList (SSR)", () => {
  it("renders one locale-prefixed /glossary/<termId> link per item", () => {
    const out = render("ja", GROUPS);
    expect(hrefs(out)).toEqual([
      "/ja/glossary/t0123456789abcdef",
      "/ja/glossary/t1111111111111111",
      "/ja/glossary/t2222222222222222",
    ]);
    expect(out).toContain("PDCA");
    expect(out).toContain("ISO/IEC 27000");
    expect(out).toContain("プロジェクトの管理");
  });

  it("uses the active locale as the link prefix", () => {
    expect(hrefs(render("zh", GROUPS))[0]).toBe("/zh/glossary/t0123456789abcdef");
  });
});

describe("filterItems", () => {
  it("matches the JP headword case-insensitively and drops empty groups", () => {
    const r = filterItems(GROUPS, "pdca");
    expect(r).toHaveLength(1);
    expect(r[0]!.topicId).toBe("m-01");
    expect(r[0]!.items.map((i) => i.term)).toEqual(["PDCA"]);
  });

  it("matches zh / en headword substrings via the search field", () => {
    expect(filterItems(GROUPS, "甘特").flatMap((g) => g.items.map((i) => i.term))).toEqual(["ガントチャート"]);
    expect(filterItems(GROUPS, "GANTT").flatMap((g) => g.items.map((i) => i.term))).toEqual(["ガントチャート"]);
  });

  it("matches a later sense's en headword via the search field", () => {
    expect(filterItems(GROUPS, "Bar Chart").flatMap((g) => g.items.map((i) => i.term))).toEqual(["ガントチャート"]);
  });

  it("returns every group for a blank query and none for a miss", () => {
    expect(filterItems(GROUPS, "")).toEqual(GROUPS);
    expect(filterItems(GROUPS, "   ")).toEqual(GROUPS);
    expect(filterItems(GROUPS, "zzz-no-such-term")).toEqual([]);
  });
});

describe("GlossaryList on the real corpus", () => {
  it("searching ISO finds ISO/IEC 27000 and every entry gets a link", async () => {
    const [dict, index] = await Promise.all([loadDictionary(), loadReaderIndex()]);
    const groups = buildListGroups(dict, index, "ja");
    const hit = filterItems(groups, "ISO").flatMap((g) => g.items);
    expect(hit.map((i) => i.term)).toContain("ISO/IEC 27000");

    // Second-sense-only headwords (senses[0] has neither): RFID's 2nd en, MBO's 2nd zh.
    const ids = (q: string) => filterItems(groups, q).flatMap((g) => g.items.map((i) => i.id));
    expect(dict.byTerm.get("RFID")!.senses[0]!.term.term_en).not.toContain("Radio Frequency");
    expect(ids("Radio Frequency Identification")).toContain(dict.byTerm.get("RFID")!.id);
    expect(dict.byTerm.get("MBO")!.senses[0]!.term.term_zh).not.toContain("管理层收购");
    expect(ids("管理层收购")).toContain(dict.byTerm.get("MBO")!.id);

    const links = hrefs(render("ja", groups));
    expect(links).toHaveLength(dict.entries.length);
    expect(links.every((l) => /^\/ja\/glossary\/t[0-9a-f]{16}$/.test(l))).toBe(true);
  });
});
