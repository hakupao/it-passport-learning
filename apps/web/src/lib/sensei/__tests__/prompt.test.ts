import type { ModelMessage } from "ai";
import { describe, expect, it } from "vitest";

import { buildSenseiMessages, SENSEI_SYSTEM_INSTRUCTION } from "../prompt";

const EPHEMERAL = { anthropic: { cacheControl: { type: "ephemeral" } } };

const conversation: ModelMessage[] = [
  { role: "user", content: "なぜアが正解？" },
  { role: "assistant", content: "結論から言うと…" },
  { role: "user", content: "もう少し" },
];

describe("buildSenseiMessages", () => {
  it("puts the instruction, then the anchor, each cache-marked, before the conversation (§0-4)", () => {
    const out = buildSenseiMessages("ANCHOR", conversation);
    expect(out).toHaveLength(5);
    expect(out[0]).toEqual({ role: "system", content: SENSEI_SYSTEM_INSTRUCTION, providerOptions: EPHEMERAL });
    expect(out[1]).toEqual({ role: "system", content: "ANCHOR", providerOptions: EPHEMERAL });
    expect(out.slice(2)).toEqual(conversation);
  });

  it("is byte-stable for the same input", () => {
    const a = JSON.stringify(buildSenseiMessages("ANCHOR", conversation));
    const b = JSON.stringify(buildSenseiMessages("ANCHOR", conversation));
    expect(a).toBe(b);
  });

  it("does not mutate the conversation", () => {
    const copy = structuredClone(conversation);
    buildSenseiMessages("ANCHOR", conversation);
    expect(conversation).toEqual(copy);
  });
});

describe("SENSEI_SYSTEM_INSTRUCTION (§0-5)", () => {
  it("is locale-free and carries the §0-5 rules", () => {
    expect(SENSEI_SYSTEM_INSTRUCTION).toContain("教材にない");
    expect(SENSEI_SYSTEM_INSTRUCTION).toContain("回答言語");
    expect(SENSEI_SYSTEM_INSTRUCTION).toContain("#");
    expect(SENSEI_SYSTEM_INSTRUCTION).toContain("300");
    expect(SENSEI_SYSTEM_INSTRUCTION).toContain("5 問");
    // no timestamp / locale-dependent text in the cached prefix
    expect(SENSEI_SYSTEM_INSTRUCTION).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
