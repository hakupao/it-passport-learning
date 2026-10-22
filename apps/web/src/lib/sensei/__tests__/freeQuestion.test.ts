// D-181 Phase C (§0-9) — the free-question thread: its anchorId, its title, and the
// anchor derived from the thread's FIRST question (at send time and again when the
// thread is reopened from /sensei — the two must be byte-equal).

import type { UIMessage } from "ai";
import { describe, expect, it, vi } from "vitest";

import type { TermCard, TermIndexEntry } from "@/lib/glossary/dictionary";

import { FREE_NO_MATCH, freeAnchor } from "../anchors";
import { deriveFreeAnchor, fetchTermCards, firstUserText, freeAnchorId, freeThreadTitle } from "../freeQuestion";

const INDEX: TermIndexEntry[] = [
  { id: "t0000000000000001", jp: "機能要件", zh: "功能需求", en: "Functional requirement" },
  { id: "t0000000000000002", jp: "非機能要件", zh: "非功能性需求", en: "Non-functional requirements" },
];

const card = (id: string, term: string): TermCard => ({
  id,
  term,
  gloss: term,
  definition: `${term} の定義`,
  memoryHook: `${term} の覚え方`,
  senseCount: 1,
  questionCount: 0,
});

const msg = (id: string, role: "user" | "assistant", text: string): UIMessage => ({
  id,
  role,
  parts: [{ type: "text", text }],
});

describe("freeAnchorId", () => {
  it("is `free:` + the epoch ms in base 36", () => {
    expect(freeAnchorId(1_700_000_000_000)).toBe("free:loyw3v28");
    expect(freeAnchorId(0)).toBe("free:0");
  });
});

describe("freeThreadTitle", () => {
  it("collapses whitespace and keeps a short question whole", () => {
    expect(freeThreadTitle("  機能要件と\n非機能要件の  違いは？ ")).toBe("機能要件と 非機能要件の 違いは？");
  });

  it("cuts after 40 characters (code points) with an ellipsis", () => {
    const long = "あ".repeat(41);
    expect(freeThreadTitle(long)).toBe(`${"あ".repeat(40)}…`);
    expect(freeThreadTitle("あ".repeat(40))).toBe("あ".repeat(40));
    expect(freeThreadTitle(`${"𠮷".repeat(41)}`)).toBe(`${"𠮷".repeat(40)}…`);
  });
});

describe("firstUserText", () => {
  it("is the text of the first user message", () => {
    expect(firstUserText([msg("1", "user", "最初の質問"), msg("2", "assistant", "答え"), msg("3", "user", "次の質問")])).toBe(
      "最初の質問",
    );
  });

  it("joins the text parts and ignores the others", () => {
    const m: UIMessage = {
      id: "1",
      role: "user",
      parts: [
        { type: "text", text: "前半" },
        { type: "step-start" },
        { type: "text", text: "後半" },
      ],
    };
    expect(firstUserText([m])).toBe("前半後半");
  });

  it("is empty when there is no user message", () => {
    expect(firstUserText([])).toBe("");
    expect(firstUserText([msg("1", "assistant", "答え")])).toBe("");
  });
});

describe("deriveFreeAnchor", () => {
  it("fetches the matched ids' cards and builds the anchor from them", async () => {
    const fetchCards = vi.fn(async (ids: string[]) => ids.map((id) => card(id, id === INDEX[0]!.id ? "機能要件" : "非機能要件")));
    const text = await deriveFreeAnchor("非機能要件と機能要件", INDEX, "ja", fetchCards);
    expect(fetchCards).toHaveBeenCalledTimes(1);
    expect(fetchCards).toHaveBeenCalledWith(["t0000000000000002", "t0000000000000001"]);
    expect(text).toBe(
      freeAnchor([card("t0000000000000002", "非機能要件"), card("t0000000000000001", "機能要件")], "ja"),
    );
  });

  it("no match: no fetch, the 「該当する教材の項目なし」 anchor", async () => {
    const fetchCards = vi.fn(async () => [] as TermCard[]);
    const text = await deriveFreeAnchor("今日はいい天気ですね", INDEX, "en", fetchCards);
    expect(fetchCards).not.toHaveBeenCalled();
    expect(text).toBe(freeAnchor([], "en"));
    expect(text).toContain(FREE_NO_MATCH);
  });

  it("reopen: the stored first question gives the byte-equal anchor", async () => {
    const fetchCards = async (ids: string[]) => ids.map((id) => card(id, "機能要件"));
    const question = "機能要件とは？";
    const atSend = await deriveFreeAnchor(question, INDEX, "zh", fetchCards);
    const stored = [msg("u1", "user", question), msg("a1", "assistant", "答え"), msg("u2", "user", "非機能要件は？")];
    const atReopen = await deriveFreeAnchor(firstUserText(stored), INDEX, "zh", fetchCards);
    expect(atReopen).toBe(atSend);
  });

  it("propagates a failed fetch (the caller shows a notice; no anchor is guessed)", async () => {
    await expect(
      deriveFreeAnchor("機能要件", INDEX, "ja", async () => {
        throw new Error("terms 500");
      }),
    ).rejects.toThrow("terms 500");
  });
});

describe("fetchTermCards", () => {
  it("GETs /api/sensei/terms with the ids and the locale and returns the cards", async () => {
    const cards = [card("t0000000000000001", "機能要件")];
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ cards }), { status: 200 }));
    expect(await fetchTermCards(["t0000000000000001", "t0000000000000002"], "zh", fetchImpl)).toEqual(cards);
    expect(fetchImpl).toHaveBeenCalledWith("/api/sensei/terms?ids=t0000000000000001%2Ct0000000000000002&locale=zh");
  });

  it("throws on a non-2xx status or a body without a cards array", async () => {
    await expect(fetchTermCards(["t0000000000000001"], "ja", async () => new Response("{}", { status: 500 }))).rejects.toThrow();
    await expect(fetchTermCards(["t0000000000000001"], "ja", async () => new Response("{}", { status: 200 }))).rejects.toThrow();
    await expect(fetchTermCards(["t0000000000000001"], "ja", async () => new Response("not json", { status: 200 }))).rejects.toThrow();
  });
});
