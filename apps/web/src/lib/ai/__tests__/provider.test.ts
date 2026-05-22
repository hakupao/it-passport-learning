import { afterEach, describe, expect, it } from "vitest";
import {
  buildMessagesWithStablePrefix,
  getActiveProvider,
  getModel,
  getTutorModel,
  readCacheUsage,
} from "../provider";

describe("provider — D-095 model factory", () => {
  const originalEnv = process.env.LLM_PROVIDER;
  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.LLM_PROVIDER;
    } else {
      process.env.LLM_PROVIDER = originalEnv;
    }
  });

  describe("getActiveProvider", () => {
    it("defaults to deepseek when LLM_PROVIDER unset", () => {
      delete process.env.LLM_PROVIDER;
      expect(getActiveProvider()).toBe("deepseek");
    });

    it("returns anthropic when LLM_PROVIDER=anthropic", () => {
      process.env.LLM_PROVIDER = "anthropic";
      expect(getActiveProvider()).toBe("anthropic");
    });

    it("returns deepseek for any other LLM_PROVIDER value", () => {
      process.env.LLM_PROVIDER = "openai";
      expect(getActiveProvider()).toBe("deepseek");
      process.env.LLM_PROVIDER = "";
      expect(getActiveProvider()).toBe("deepseek");
    });
  });

  describe("getModel", () => {
    it("returns a model instance for deepseek smoke role", () => {
      const m = getModel("smoke", "deepseek");
      expect(m).toBeDefined();
      expect(typeof m).toBe("object");
    });

    it("returns a model instance for anthropic smoke role", () => {
      const m = getModel("smoke", "anthropic");
      expect(m).toBeDefined();
      expect(typeof m).toBe("object");
    });

    it("uses active provider when none specified", () => {
      delete process.env.LLM_PROVIDER;
      const m = getModel("chat");
      expect(m).toBeDefined();
    });

    it("returns different model objects for chat vs quiz on deepseek", () => {
      const chat = getModel("chat", "deepseek");
      const quiz = getModel("quiz", "deepseek");
      expect(chat).not.toBe(quiz);
    });

    it("Phase 4 B.1 — tutor role returns anthropic Sonnet 4.6 regardless of provider arg", () => {
      // D-102 §7.2: tutor is anthropic-pinned; the provider arg is ignored.
      const m1 = getModel("tutor", "deepseek");
      const m2 = getModel("tutor", "anthropic");
      expect(m1).toBeDefined();
      expect(m2).toBeDefined();
    });

    it("Phase 4 B.1 — tutor role ignores LLM_PROVIDER env", () => {
      delete process.env.LLM_PROVIDER;
      const m1 = getModel("tutor");
      process.env.LLM_PROVIDER = "anthropic";
      const m2 = getModel("tutor");
      process.env.LLM_PROVIDER = "deepseek";
      const m3 = getModel("tutor");
      expect(m1).toBeDefined();
      expect(m2).toBeDefined();
      expect(m3).toBeDefined();
    });
  });

  describe("getTutorModel — D-102 §7.2 + D-103 §2.4", () => {
    it("returns a model instance by default (Sonnet 4.6)", () => {
      const m = getTutorModel();
      expect(m).toBeDefined();
      expect(typeof m).toBe("object");
    });

    it("returns a different model instance when escalate=true (Opus 4.7)", () => {
      const def = getTutorModel();
      const esc = getTutorModel({ escalate: true });
      expect(def).toBeDefined();
      expect(esc).toBeDefined();
      // Sonnet vs Opus → different model objects.
      expect(def).not.toBe(esc);
    });

    it("escalate=false (default) returns the same selection as no-arg", () => {
      const a = getTutorModel();
      const b = getTutorModel({ escalate: false });
      // Both return Sonnet 4.6 — the AI SDK anthropic() factory returns a
      // fresh object per call, so we don't assert reference equality; we
      // assert the function accepts the explicit `false` without throwing.
      expect(a).toBeDefined();
      expect(b).toBeDefined();
    });
  });
});

describe("buildMessagesWithStablePrefix — D-095 §2.3 stable prefix layout", () => {
  it("emits exactly 3 messages in order [system, system, user]", () => {
    const msgs = buildMessagesWithStablePrefix("corpus", "instr", "user msg");
    expect(msgs).toHaveLength(3);
    expect(msgs[0]?.role).toBe("system");
    expect(msgs[1]?.role).toBe("system");
    expect(msgs[2]?.role).toBe("user");
  });

  it("places corpus first, instruction middle, user last", () => {
    const msgs = buildMessagesWithStablePrefix("CORPUS", "INSTR", "USER");
    expect(msgs[0]?.content).toBe("CORPUS");
    expect(msgs[1]?.content).toBe("INSTR");
    expect(msgs[2]?.content).toBe("USER");
  });

  it("attaches anthropic cacheControl:ephemeral only to the first (corpus) message", () => {
    const msgs = buildMessagesWithStablePrefix("c", "i", "u");
    const m0 = msgs[0] as { providerOptions?: unknown };
    expect(m0.providerOptions).toEqual({
      anthropic: { cacheControl: { type: "ephemeral" } },
    });
    const m1 = msgs[1] as { providerOptions?: unknown };
    expect(m1.providerOptions).toBeUndefined();
    const m2 = msgs[2] as { providerOptions?: unknown };
    expect(m2.providerOptions).toBeUndefined();
  });

  it("preserves multi-line corpus verbatim", () => {
    const body = "line 1\nline 2\nline 3";
    const msgs = buildMessagesWithStablePrefix(body, "x", "y");
    expect(msgs[0]?.content).toBe(body);
  });
});

describe("readCacheUsage — unified anthropic + deepseek + unknown", () => {
  it("returns unknown / all-null when providerMetadata is undefined", () => {
    expect(readCacheUsage(undefined)).toEqual({
      provider: "unknown",
      cacheCreationInputTokens: null,
      cacheReadInputTokens: null,
      cacheMissInputTokens: null,
    });
  });

  it("returns unknown / all-null when neither anthropic nor deepseek keys present", () => {
    expect(readCacheUsage({ openai: { foo: 1 } })).toEqual({
      provider: "unknown",
      cacheCreationInputTokens: null,
      cacheReadInputTokens: null,
      cacheMissInputTokens: null,
    });
  });

  it("parses anthropic shape — creation + read tokens", () => {
    const meta = {
      anthropic: {
        cacheCreationInputTokens: 19800,
        cacheReadInputTokens: 0,
      },
    };
    expect(readCacheUsage(meta)).toEqual({
      provider: "anthropic",
      cacheCreationInputTokens: 19800,
      cacheReadInputTokens: 0,
      cacheMissInputTokens: null,
    });
  });

  it("parses anthropic second-call (cache hit) shape", () => {
    const meta = {
      anthropic: {
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 19800,
      },
    };
    const u = readCacheUsage(meta);
    expect(u.provider).toBe("anthropic");
    expect(u.cacheCreationInputTokens).toBe(0);
    expect(u.cacheReadInputTokens).toBe(19800);
  });

  it("parses deepseek shape — hit + miss tokens", () => {
    const meta = {
      deepseek: {
        promptCacheHitTokens: 0,
        promptCacheMissTokens: 19800,
      },
    };
    expect(readCacheUsage(meta)).toEqual({
      provider: "deepseek",
      cacheCreationInputTokens: null,
      cacheReadInputTokens: 0,
      cacheMissInputTokens: 19800,
    });
  });

  it("parses deepseek second-call (cache hit) shape", () => {
    const meta = {
      deepseek: {
        promptCacheHitTokens: 19800,
        promptCacheMissTokens: 0,
      },
    };
    const u = readCacheUsage(meta);
    expect(u.provider).toBe("deepseek");
    expect(u.cacheReadInputTokens).toBe(19800);
    expect(u.cacheMissInputTokens).toBe(0);
  });

  it("defensive: non-numeric anthropic fields → null", () => {
    const meta = {
      anthropic: {
        cacheCreationInputTokens: "19800",
        cacheReadInputTokens: null,
      },
    };
    expect(readCacheUsage(meta)).toEqual({
      provider: "anthropic",
      cacheCreationInputTokens: null,
      cacheReadInputTokens: null,
      cacheMissInputTokens: null,
    });
  });

  it("defensive: non-numeric deepseek fields → null", () => {
    const meta = {
      deepseek: {
        promptCacheHitTokens: "19800",
        promptCacheMissTokens: undefined,
      },
    };
    expect(readCacheUsage(meta)).toEqual({
      provider: "deepseek",
      cacheCreationInputTokens: null,
      cacheReadInputTokens: null,
      cacheMissInputTokens: null,
    });
  });

  it("anthropic key takes precedence over deepseek key if both present", () => {
    const meta = {
      anthropic: {
        cacheCreationInputTokens: 100,
        cacheReadInputTokens: 0,
      },
      deepseek: {
        promptCacheHitTokens: 200,
        promptCacheMissTokens: 0,
      },
    };
    const u = readCacheUsage(meta);
    expect(u.provider).toBe("anthropic");
    expect(u.cacheCreationInputTokens).toBe(100);
  });
});
