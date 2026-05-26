import { describe, expect, it } from "vitest";
import type { ChapterSummary } from "@/lib/data/chapterScope";
import type { TutorContext } from "@/lib/tutor/tutorContext";
import {
  TUTOR_SYSTEM_INSTRUCTION,
  buildTutorMessages,
  formatTutorPreamble,
} from "../tutorPrompt";

function makeChapter(nn: string, title: string): ChapterSummary {
  return {
    nn,
    chapterId: `chapter_${nn}`,
    title,
    firstPage: 1,
    lastPage: 30,
    pageCount: 30,
  };
}

function makeContext(overrides: Partial<TutorContext> = {}): TutorContext {
  return {
    completedChapters: [],
    inProgressChapters: [],
    pendingChapters: [],
    recentQuiz: [],
    ...overrides,
  };
}

describe("TUTOR_SYSTEM_INSTRUCTION — D-088 §2.3 / D-103 §2.4 byte-stability + LD-Module-B-13 size", () => {
  it("is a non-empty string", () => {
    expect(typeof TUTOR_SYSTEM_INSTRUCTION).toBe("string");
    expect(TUTOR_SYSTEM_INSTRUCTION.length).toBeGreaterThan(0);
  });

  it("LD-Module-B-13 — SYSTEM is ≥3000 characters (rough ≥1024 token proxy for Anthropic ephemeral cache minimum cacheable prefix)", () => {
    // Empirical Session 56 B.3 attempt-1: Anthropic Sonnet 4.6's
    // cache_control:ephemeral does NOT engage when the marked prefix is
    // below ~1024 tokens. SYSTEM was ~150 tokens originally → 0% cache hit.
    // LD-Module-B-13 supersedes LD-Module-B-6 with bulked SYSTEM crossing
    // the threshold via curriculum framework + style guide + grounding
    // rules. Character-count proxy ≥3000 ≈ ≥1024 tokens (mixed En/Ja text
    // tokenises ~2.5-3 chars per token avg).
    expect(TUTOR_SYSTEM_INSTRUCTION.length).toBeGreaterThan(3000);
  });

  it("byte-stable across calls (cache key invariant)", () => {
    // Importing the constant twice should yield identical bytes; this is
    // tautological in JS but worth pinning to flag any accidental tagged-
    // template-literal interpolation slip that would break the cache key.
    const a = TUTOR_SYSTEM_INSTRUCTION;
    const b = TUTOR_SYSTEM_INSTRUCTION;
    expect(a).toBe(b);
    expect(a.length).toBe(b.length);
  });

  it("mentions IT Passport (ITパスポート) — domain anchor", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("ITパスポート");
  });

  it("references the 16-chapter textbook structure", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("16-chapter");
  });

  it("instructs Japanese-by-default language posture", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("Japanese by default");
  });

  it("LD-Module-B-13 — covers the 3 ITパスポート syllabus areas", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("ストラテジ系");
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("マネジメント系");
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("テクノロジ系");
  });

  it("LD-Module-B-13 — references IPA (the issuing body)", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("IPA");
  });

  it("LD-Module-B-13 — includes pedagogical style framing (3-step explanation pattern)", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("Pedagogical style");
    expect(TUTOR_SYSTEM_INSTRUCTION).toMatch(/three-step|3-step/i);
  });

  it("LD-Module-B-13 — includes citation conventions section", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("Citation conventions");
  });

  it("LD-Module-B-13 — includes anti-hallucination guards section", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("Anti-hallucination guards");
  });

  it("LD-Module-B-13 — chapter citation format pinned to two-digit nn (`00`..`15`)", () => {
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("`00`");
    expect(TUTOR_SYSTEM_INSTRUCTION).toContain("`15`");
  });
});

describe("formatTutorPreamble — deterministic projection", () => {
  it("emits stable headings + (none) markers for the empty context", () => {
    const text = formatTutorPreamble(makeContext());
    expect(text).toContain("## User Learning Snapshot");
    expect(text).toContain("Total chapters: 0");
    expect(text).toContain("### Completed (0)");
    expect(text).toContain("### In progress (0)");
    expect(text).toContain("### Pending (0)");
    expect(text).toContain("### Recent quiz attempts (0)");
    // Empty buckets get the (none) marker so the tutor sees consistent
    // structure across cold / warm states.
    const noneOccurrences = (text.match(/\(none\)/g) ?? []).length;
    expect(noneOccurrences).toBe(4);
  });

  it("includes total = sum of all 3 chapter buckets", () => {
    const ctx = makeContext({
      completedChapters: [makeChapter("00", "情報処理の基礎")],
      inProgressChapters: [makeChapter("01", "ハードウェア")],
      pendingChapters: [
        makeChapter("02", "ソフトウェア"),
        makeChapter("03", "システム構成"),
      ],
    });
    expect(formatTutorPreamble(ctx)).toContain("Total chapters: 4");
  });

  it("renders chapter entries as `- nn: title` lines verbatim (Japanese title preserved)", () => {
    const ctx = makeContext({
      completedChapters: [makeChapter("00", "情報処理の基礎")],
      pendingChapters: [makeChapter("15", "システム監査")],
    });
    const text = formatTutorPreamble(ctx);
    expect(text).toContain("- 00: 情報処理の基礎");
    expect(text).toContain("- 15: システム監査");
  });

  it("preserves source order within each bucket (no resorting)", () => {
    const ctx = makeContext({
      pendingChapters: [
        makeChapter("03", "C-title"),
        makeChapter("01", "A-title"),
        makeChapter("02", "B-title"),
      ],
    });
    const text = formatTutorPreamble(ctx);
    const idx3 = text.indexOf("- 03: C-title");
    const idx1 = text.indexOf("- 01: A-title");
    const idx2 = text.indexOf("- 02: B-title");
    expect(idx3).toBeLessThan(idx1);
    expect(idx1).toBeLessThan(idx2);
  });

  it("renders recent quiz attempts with `correct` / `wrong` literals", () => {
    const ctx = makeContext({
      recentQuiz: [
        {
          questionId: "page_001_entity_3",
          lastAnswered: "2026-05-22T15:00:00.000Z",
          correct: true,
        },
        {
          questionId: "page_010_entity_1",
          lastAnswered: "2026-05-22T14:30:00.000Z",
          correct: false,
        },
      ],
    });
    const text = formatTutorPreamble(ctx);
    expect(text).toContain(
      "- 2026-05-22T15:00:00.000Z | page_001_entity_3 | correct",
    );
    expect(text).toContain(
      "- 2026-05-22T14:30:00.000Z | page_010_entity_1 | wrong",
    );
  });

  it("is byte-stable: same input → byte-identical output (cache invariant)", () => {
    const ctx = makeContext({
      completedChapters: [makeChapter("00", "情報処理の基礎")],
      pendingChapters: [makeChapter("01", "ハードウェア")],
      recentQuiz: [
        {
          questionId: "page_001_entity_3",
          lastAnswered: "2026-05-22T15:00:00.000Z",
          correct: true,
        },
      ],
    });
    expect(formatTutorPreamble(ctx)).toBe(formatTutorPreamble(ctx));
  });
});

describe("buildTutorMessages — D-103 §2.4 cache-block layout", () => {
  const emptyCtx = makeContext();

  it("emits exactly `2 + conversation.length` messages", () => {
    const conv = [
      { role: "user", content: "こんにちは" } as const,
      { role: "assistant", content: "やあ" } as const,
    ];
    const msgs = buildTutorMessages(emptyCtx, conv);
    expect(msgs).toHaveLength(2 + conv.length);
  });

  it("orders prefix: [system SYSTEM_INSTRUCTION, system preamble, ...conversation]", () => {
    const msgs = buildTutorMessages(emptyCtx, [
      { role: "user", content: "u1" },
    ]);
    expect(msgs[0]?.role).toBe("system");
    expect(msgs[0]?.content).toBe(TUTOR_SYSTEM_INSTRUCTION);
    expect(msgs[1]?.role).toBe("system");
    expect(msgs[1]?.content).toBe(formatTutorPreamble(emptyCtx));
    expect(msgs[2]?.role).toBe("user");
    expect(msgs[2]?.content).toBe("u1");
  });

  it("attaches cache_control:ephemeral to BOTH system messages (outer + inner breakpoints)", () => {
    const msgs = buildTutorMessages(emptyCtx, []);
    const m0 = msgs[0] as { providerOptions?: unknown };
    const m1 = msgs[1] as { providerOptions?: unknown };
    expect(m0.providerOptions).toEqual({
      anthropic: { cacheControl: { type: "ephemeral" } },
    });
    expect(m1.providerOptions).toEqual({
      anthropic: { cacheControl: { type: "ephemeral" } },
    });
  });

  it("does NOT attach cache_control to conversation messages", () => {
    const conv = [
      { role: "user", content: "u1" } as const,
      { role: "assistant", content: "a1" } as const,
      { role: "user", content: "u2" } as const,
    ];
    const msgs = buildTutorMessages(emptyCtx, conv);
    for (let i = 2; i < msgs.length; i++) {
      const m = msgs[i] as { providerOptions?: unknown };
      expect(m.providerOptions).toBeUndefined();
    }
  });

  it("conversation order is preserved verbatim (no resorting / dedup)", () => {
    const conv = [
      { role: "user", content: "u1" } as const,
      { role: "assistant", content: "a1" } as const,
      { role: "user", content: "u2" } as const,
      { role: "assistant", content: "a2" } as const,
    ];
    const msgs = buildTutorMessages(emptyCtx, conv);
    expect(msgs.slice(2)).toEqual(conv);
  });

  it("empty conversation emits a 2-message stable prefix only", () => {
    const msgs = buildTutorMessages(emptyCtx, []);
    expect(msgs).toHaveLength(2);
    expect(msgs[0]?.role).toBe("system");
    expect(msgs[1]?.role).toBe("system");
  });

  it("preamble content reflects the supplied TutorContext", () => {
    const ctx = makeContext({
      completedChapters: [makeChapter("00", "テスト章")],
    });
    const msgs = buildTutorMessages(ctx, []);
    expect(msgs[1]?.content).toContain("### Completed (1)");
    expect(msgs[1]?.content).toContain("- 00: テスト章");
  });

  it("two calls with the same context produce byte-identical system messages (cache key invariant)", () => {
    const ctx = makeContext({
      pendingChapters: [makeChapter("01", "A"), makeChapter("02", "B")],
      recentQuiz: [
        {
          questionId: "page_001_entity_3",
          lastAnswered: "2026-05-22T15:00:00.000Z",
          correct: false,
        },
      ],
    });
    const a = buildTutorMessages(ctx, []);
    const b = buildTutorMessages(ctx, []);
    expect(a[0]?.content).toBe(b[0]?.content);
    expect(a[1]?.content).toBe(b[1]?.content);
  });
});
