import type { ModelMessage } from "ai";
import { describe, expect, it } from "vitest";

import { buildSenseiMessages, SENSEI_SYSTEM_INSTRUCTION } from "../prompt";

const EPHEMERAL = { anthropic: { cacheControl: { type: "ephemeral" } } };

const conversation: ModelMessage[] = [
  { role: "user", content: "なぜアが正解？" },
  { role: "assistant", content: "結論から言うと…" },
  { role: "user", content: "もう少し" },
];

const breakpoints = (msgs: ModelMessage[]) =>
  msgs.flatMap((m, i) => (m.providerOptions?.anthropic?.cacheControl ? [i] : []));

describe("buildSenseiMessages", () => {
  it("puts the instruction, then the anchor, each cache-marked, before the conversation (§0-4)", () => {
    const out = buildSenseiMessages("ANCHOR", conversation);
    expect(out).toHaveLength(5);
    expect(out[0]).toEqual({ role: "system", content: SENSEI_SYSTEM_INSTRUCTION, providerOptions: EPHEMERAL });
    expect(out[1]).toEqual({ role: "system", content: "ANCHOR", providerOptions: EPHEMERAL });
    expect(out.slice(2, -1)).toEqual(conversation.slice(0, -1));
    expect(out.at(-1)).toEqual({ ...conversation.at(-1), providerOptions: EPHEMERAL });
  });

  it("marks exactly 3 cache breakpoints: instruction, anchor, last conversation message (R2, ≤ 4)", () => {
    expect(breakpoints(buildSenseiMessages("ANCHOR", conversation))).toEqual([0, 1, 4]);
    expect(breakpoints(buildSenseiMessages("ANCHOR", conversation.slice(0, 1)))).toEqual([0, 1, 2]);
    // no conversation: only the two system breakpoints
    expect(breakpoints(buildSenseiMessages("ANCHOR", []))).toEqual([0, 1]);
  });

  it("merges into the last message's existing providerOptions instead of replacing them", () => {
    const last: ModelMessage = {
      role: "user",
      content: "q",
      providerOptions: { anthropic: { foo: "bar" }, other: { x: 1 } },
    };
    const out = buildSenseiMessages("ANCHOR", [last]);
    expect(out.at(-1)!.providerOptions).toEqual({
      anthropic: { foo: "bar", cacheControl: { type: "ephemeral" } },
      other: { x: 1 },
    });
  });

  it("the earlier turns stay byte-identical when a follow-up is appended (cached history prefix)", () => {
    const first = buildSenseiMessages("ANCHOR", conversation.slice(0, 1));
    const next = buildSenseiMessages("ANCHOR", conversation);
    expect(JSON.stringify(next.slice(0, 2))).toBe(JSON.stringify(first.slice(0, 2)));
    expect(next[2]!.content).toEqual(first[2]!.content);
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
    const withOptions: ModelMessage[] = [{ role: "user", content: "q", providerOptions: { anthropic: { foo: "bar" } } }];
    const before = structuredClone(withOptions);
    buildSenseiMessages("ANCHOR", withOptions);
    expect(withOptions).toEqual(before);
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
