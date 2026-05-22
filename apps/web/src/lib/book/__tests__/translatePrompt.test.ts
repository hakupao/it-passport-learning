// Phase 3 Step 2 — vitest coverage for translatePrompt.ts pure helpers.

import { describe, it, expect } from "vitest";

import {
  TRANSLATE_SOURCE_MAX_CHARS,
  applyChapterScope,
  clampTranslateSource,
  composeChapterScopePreface,
  composeTranslatePrompt,
} from "../translatePrompt";

describe("composeTranslatePrompt", () => {
  it("targets zh with the full target label and source between fences", () => {
    const out = composeTranslatePrompt({
      source: "ネットワークとは",
      target: "zh",
    });
    expect(out).toContain("Simplified Chinese (zh)");
    expect(out).toContain("ネットワークとは");
    expect(out).toContain("---");
    expect(out.split("---").length - 1).toBe(2);
  });

  it("targets en with the full target label", () => {
    const out = composeTranslatePrompt({
      source: "OSI 参照モデル",
      target: "en",
    });
    expect(out).toContain("English (en)");
    expect(out).toContain("OSI 参照モデル");
  });

  it("instructs the model to emit ONLY the translation (no romaji / no preamble)", () => {
    const out = composeTranslatePrompt({ source: "テスト", target: "zh" });
    expect(out).toMatch(/no preamble/i);
    expect(out).toMatch(/no romaji/i);
    expect(out).toMatch(/ONLY the translation/);
  });

  it("trims whitespace from source", () => {
    const out = composeTranslatePrompt({
      source: "   ネットワーク   ",
      target: "zh",
    });
    expect(out).toContain("ネットワーク");
    expect(out).not.toMatch(/---\s+\s+ネットワーク/);
  });

  it("throws on empty / whitespace-only source", () => {
    expect(() =>
      composeTranslatePrompt({ source: "", target: "zh" }),
    ).toThrow(/non-empty/);
    expect(() =>
      composeTranslatePrompt({ source: "   ", target: "en" }),
    ).toThrow(/non-empty/);
  });
});

describe("clampTranslateSource", () => {
  it("passes through short text unchanged", () => {
    const r = clampTranslateSource("短い文章");
    expect(r.text).toBe("短い文章");
    expect(r.truncated).toBe(false);
  });

  it("trims surrounding whitespace before measuring", () => {
    const r = clampTranslateSource("   abc   ");
    expect(r.text).toBe("abc");
    expect(r.truncated).toBe(false);
  });

  it("truncates at the hard cap and reports truncated=true", () => {
    const long = "あ".repeat(TRANSLATE_SOURCE_MAX_CHARS + 50);
    const r = clampTranslateSource(long);
    expect(r.truncated).toBe(true);
    expect(r.text.length).toBe(TRANSLATE_SOURCE_MAX_CHARS);
  });

  it("exact cap is not flagged as truncated", () => {
    const exact = "a".repeat(TRANSLATE_SOURCE_MAX_CHARS);
    const r = clampTranslateSource(exact);
    expect(r.truncated).toBe(false);
    expect(r.text.length).toBe(TRANSLATE_SOURCE_MAX_CHARS);
  });
});

describe("composeChapterScopePreface", () => {
  it("emits the canonical [Scope: 第NN章「title」 p.A-B] marker", () => {
    const preface = composeChapterScopePreface({
      nn: "07",
      titleJp: "ネットワーク",
      firstPage: 150,
      lastPage: 180,
    });
    expect(preface).toBe("[Scope: 第07章「ネットワーク」 p.150-180] ");
  });

  it("preserves zero-padded nn (does NOT strip leading zero)", () => {
    const p = composeChapterScopePreface({
      nn: "00",
      titleJp: "序章",
      firstPage: 7,
      lastPage: 24,
    });
    expect(p).toContain("第00章");
  });
});

describe("applyChapterScope", () => {
  const scope = {
    nn: "07",
    titleJp: "ネットワーク",
    firstPage: 150,
    lastPage: 180,
  };

  it("prepends the scope marker when missing", () => {
    const out = applyChapterScope("DNS とは何ですか？", scope);
    expect(out).toBe(
      "[Scope: 第07章「ネットワーク」 p.150-180] DNS とは何ですか？",
    );
  });

  it("is idempotent — does not double-stamp when already prefixed", () => {
    const once = applyChapterScope("question", scope);
    const twice = applyChapterScope(once, scope);
    expect(twice).toBe(once);
  });

  it("treats different chapters as distinct prefixes (no cross-collision)", () => {
    const otherScope = { ...scope, nn: "08", titleJp: "セキュリティ" };
    const once = applyChapterScope("question", scope);
    const stamped = applyChapterScope(once, otherScope);
    // The other scope marker IS prepended because the existing prefix
    // belongs to scope #07, not #08.
    expect(stamped.startsWith("[Scope: 第08章")).toBe(true);
  });
});
