import { describe, expect, it } from "vitest";

import type { UIMessage } from "ai";

import { shouldEscalate } from "../escalation";

function userMsg(text: string): UIMessage {
  return {
    id: crypto.randomUUID(),
    role: "user" as const,
    parts: [{ type: "text" as const, text }],
  };
}

function assistantMsg(text: string): UIMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant" as const,
    parts: [{ type: "text" as const, text }],
  };
}

// ===========================================================================
// Keyword escalation
// ===========================================================================

describe("shouldEscalate — keyword triggers", () => {
  it("Japanese keyword わからない → true", () => {
    expect(shouldEscalate([userMsg("わからない")])).toBe(true);
  });

  it("Chinese keyword 详细解释 → true", () => {
    expect(shouldEscalate([userMsg("详细解释してください")])).toBe(true);
  });

  it("English 'don't understand' → true", () => {
    expect(shouldEscalate([userMsg("I don't understand this")])).toBe(true);
  });

  it("English 'why is' → true", () => {
    expect(shouldEscalate([userMsg("why is this important?")])).toBe(true);
  });

  it("keyword embedded in longer sentence → true", () => {
    expect(shouldEscalate([userMsg("この部分がわからないです")])).toBe(true);
  });

  it("no keyword present → false", () => {
    expect(shouldEscalate([userMsg("Please tell me about TCP/IP.")])).toBe(false);
  });

  it("case-insensitive English DON'T UNDERSTAND → true", () => {
    expect(shouldEscalate([userMsg("DON'T UNDERSTAND the concept")])).toBe(true);
  });

  it("Chinese keyword 不懂 → true", () => {
    expect(shouldEscalate([userMsg("不懂这个概念")])).toBe(true);
  });

  it("Japanese keyword なぜ in question → true", () => {
    expect(shouldEscalate([userMsg("なぜこうなるのですか？")])).toBe(true);
  });

  it("English 'confused' → true", () => {
    expect(shouldEscalate([userMsg("I'm confused about this topic")])).toBe(true);
  });
});

// ===========================================================================
// Retry-after-short-response
// ===========================================================================

describe("shouldEscalate — retry-after-short heuristic", () => {
  it("short assistant reply + user re-asks similar CJK topic → true", () => {
    const msgs: UIMessage[] = [
      userMsg("IPアドレスについて教えて"),
      assistantMsg("はい"),
      userMsg("IPアドレスをもっと教えて"),
    ];
    expect(shouldEscalate(msgs)).toBe(true);
  });

  it("short assistant reply + user re-asks similar English topic → true", () => {
    const msgs: UIMessage[] = [
      userMsg("Explain network protocols"),
      assistantMsg("Sure."),
      userMsg("Tell me more about network protocols"),
    ];
    expect(shouldEscalate(msgs)).toBe(true);
  });

  it("short assistant reply + user asks completely different topic → false", () => {
    const msgs: UIMessage[] = [
      userMsg("IPアドレスについて教えて"),
      assistantMsg("はい"),
      userMsg("What is the capital of France?"),
    ];
    expect(shouldEscalate(msgs)).toBe(false);
  });

  it("long assistant reply + user re-asks → false (substantial answer given)", () => {
    const longAnswer = "A".repeat(200);
    const msgs: UIMessage[] = [
      userMsg("Explain protocols"),
      assistantMsg(longAnswer),
      userMsg("Tell me more about protocols"),
    ];
    expect(shouldEscalate(msgs)).toBe(false);
  });

  it("only 2 messages (not ≥3) → false", () => {
    const msgs: UIMessage[] = [
      userMsg("IPアドレスについて"),
      userMsg("IPアドレスについて教えて"),
    ];
    expect(shouldEscalate(msgs)).toBe(false);
  });

  it("assistant reply exactly 99 chars triggers retry heuristic on same topic → true", () => {
    const shortAnswer = "B".repeat(99);
    const msgs: UIMessage[] = [
      userMsg("Explain routing tables"),
      assistantMsg(shortAnswer),
      userMsg("More about routing tables please"),
    ];
    expect(shouldEscalate(msgs)).toBe(true);
  });

  it("assistant reply exactly 100 chars does not trigger retry heuristic → false", () => {
    const borderAnswer = "C".repeat(100);
    const msgs: UIMessage[] = [
      userMsg("Explain routing tables"),
      assistantMsg(borderAnswer),
      userMsg("More about routing tables please"),
    ];
    expect(shouldEscalate(msgs)).toBe(false);
  });
});

// ===========================================================================
// Edge cases
// ===========================================================================

describe("shouldEscalate — edge cases", () => {
  it("empty messages array → false", () => {
    expect(shouldEscalate([])).toBe(false);
  });

  it("single user message with no keywords → false", () => {
    expect(shouldEscalate([userMsg("Tell me about OSI model")])).toBe(false);
  });

  it("messages ending with assistant message (no user at end) → false", () => {
    const msgs: UIMessage[] = [
      userMsg("Tell me about TCP"),
      assistantMsg("TCP stands for Transmission Control Protocol."),
    ];
    expect(shouldEscalate(msgs)).toBe(false);
  });

  it("user message with no text parts → false", () => {
    const msg: UIMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      parts: [],
    };
    expect(shouldEscalate([msg])).toBe(false);
  });
});
