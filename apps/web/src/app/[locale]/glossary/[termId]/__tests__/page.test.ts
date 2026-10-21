// Stage 6 (D-179 / D-180 §0-3) — /[locale]/glossary/[termId] page guard.
// notFound() fires for a path-traversal-shaped id and for a valid-shaped id that is
// not in the dictionary; a real headword renders TermDetail. Uses the real
// dictionary (committed corpus); only Next's notFound / setRequestLocale and the
// next-intl Link (needs the Next runtime) are stubbed.
import { describe, expect, it, vi } from "vitest";

const NOT_FOUND = new Error("NEXT_NOT_FOUND (test sentinel)");

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw NOT_FOUND;
  },
}));
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {} }));
vi.mock("@/i18n/navigation", () => ({ Link: () => null }));

import { TermDetail } from "@/components/glossary/TermDetail";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { termId } from "@/lib/glossary/termId";

import TermPage from "../page";

const call = (id: string) => TermPage({ params: Promise.resolve({ locale: "ja", termId: id }) });

describe("TermPage", () => {
  it("calls notFound() for an id not shaped like termId()", async () => {
    await expect(call("../x")).rejects.toBe(NOT_FOUND);
  });

  it("calls notFound() for a valid-shaped id absent from the dictionary", async () => {
    const id = "t0000000000000000";
    expect((await loadDictionary()).byId.has(id)).toBe(false);
    await expect(call(id)).rejects.toBe(NOT_FOUND);
  });

  it("renders TermDetail for a real headword", async () => {
    const el = await call(termId("機能要件"));
    expect(el.type).toBe(TermDetail);
    expect((el.props as { entry: { term: string } }).entry.term).toBe("機能要件");
  });
});
