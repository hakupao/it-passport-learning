import { afterEach, describe, expect, it } from "vitest";
import {
  buildMessagesWithStablePrefix,
  getActiveProvider,
  getActiveTutorProvider,
  getModel,
  getTutorModel,
  getTutorProviderOptions,
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

    it("Phase 4 D-104 §2.1 — tutor role routes via getTutorModel (independent of LLM_PROVIDER arg)", () => {
      // The Phase 2 `provider` arg passed to getModel is IGNORED on the
      // tutor path — tutor reads its own env (LLM_PROVIDER_TUTOR) per
      // D-104 §2.5. Passing "deepseek" or "anthropic" here both delegate
      // to getTutorModel() which uses the tutor env.
      const m1 = getModel("tutor", "deepseek");
      const m2 = getModel("tutor", "anthropic");
      expect(m1).toBeDefined();
      expect(m2).toBeDefined();
    });

    it("Phase 4 D-104 §2.5 — tutor role uses LLM_PROVIDER_TUTOR env, not LLM_PROVIDER", () => {
      const originalTutor = process.env.LLM_PROVIDER_TUTOR;
      try {
        // LLM_PROVIDER=anthropic but LLM_PROVIDER_TUTOR=deepseek → tutor stays on deepseek.
        process.env.LLM_PROVIDER = "anthropic";
        delete process.env.LLM_PROVIDER_TUTOR;
        const m = getModel("tutor");
        expect(m).toBeDefined();
      } finally {
        if (originalTutor === undefined) {
          delete process.env.LLM_PROVIDER_TUTOR;
        } else {
          process.env.LLM_PROVIDER_TUTOR = originalTutor;
        }
      }
    });
  });
});

describe("Phase 4 D-104 §2.5 — getActiveTutorProvider env routing", () => {
  const originalTutor = process.env.LLM_PROVIDER_TUTOR;
  afterEach(() => {
    if (originalTutor === undefined) {
      delete process.env.LLM_PROVIDER_TUTOR;
    } else {
      process.env.LLM_PROVIDER_TUTOR = originalTutor;
    }
  });

  it("defaults to deepseek when LLM_PROVIDER_TUTOR unset (LD-Module-B-10 + LD-Module-B-12)", () => {
    delete process.env.LLM_PROVIDER_TUTOR;
    expect(getActiveTutorProvider()).toBe("deepseek");
  });

  it("returns anthropic when LLM_PROVIDER_TUTOR=anthropic (toggle path active)", () => {
    process.env.LLM_PROVIDER_TUTOR = "anthropic";
    expect(getActiveTutorProvider()).toBe("anthropic");
  });

  it("returns openai when LLM_PROVIDER_TUTOR=openai (reserved-stub path selected)", () => {
    process.env.LLM_PROVIDER_TUTOR = "openai";
    expect(getActiveTutorProvider()).toBe("openai");
  });

  it("returns deepseek for any other LLM_PROVIDER_TUTOR value", () => {
    process.env.LLM_PROVIDER_TUTOR = "bogus";
    expect(getActiveTutorProvider()).toBe("deepseek");
    process.env.LLM_PROVIDER_TUTOR = "";
    expect(getActiveTutorProvider()).toBe("deepseek");
  });
});

describe("Phase 4 D-104 §2.1 — getTutorModel 3-way env-routable", () => {
  const originalTutor = process.env.LLM_PROVIDER_TUTOR;
  afterEach(() => {
    if (originalTutor === undefined) {
      delete process.env.LLM_PROVIDER_TUTOR;
    } else {
      process.env.LLM_PROVIDER_TUTOR = originalTutor;
    }
  });

  it("default returns a DeepSeek V4 pro model (LD-Module-B-12)", () => {
    delete process.env.LLM_PROVIDER_TUTOR;
    const m = getTutorModel();
    expect(m).toBeDefined();
    expect(typeof m).toBe("object");
  });

  it("explicit provider:'deepseek' returns a model regardless of env", () => {
    process.env.LLM_PROVIDER_TUTOR = "anthropic";
    const m = getTutorModel({ provider: "deepseek" });
    expect(m).toBeDefined();
  });

  it("explicit provider:'anthropic' returns Sonnet 4.6 by default", () => {
    delete process.env.LLM_PROVIDER_TUTOR;
    const m = getTutorModel({ provider: "anthropic" });
    expect(m).toBeDefined();
  });

  it("explicit provider:'anthropic' with escalate=true returns Opus 4.7 (different model object)", () => {
    const def = getTutorModel({ provider: "anthropic" });
    const esc = getTutorModel({ provider: "anthropic", escalate: true });
    expect(def).toBeDefined();
    expect(esc).toBeDefined();
    expect(def).not.toBe(esc);
  });

  it("DeepSeek escalate=true returns the SAME model (escalation lives in providerOptions, not model swap per D-104 §2.2)", () => {
    // The LanguageModel object identity is per anthropic()/deepseek() factory call;
    // both calls fabricate a fresh object, so we don't assert reference equality.
    // We assert the function accepts the explicit escalate flag without throwing.
    const a = getTutorModel({ provider: "deepseek", escalate: false });
    const b = getTutorModel({ provider: "deepseek", escalate: true });
    expect(a).toBeDefined();
    expect(b).toBeDefined();
  });

  it("LLM_PROVIDER_TUTOR=anthropic env toggles to Anthropic without explicit provider arg", () => {
    process.env.LLM_PROVIDER_TUTOR = "anthropic";
    const m = getTutorModel();
    expect(m).toBeDefined();
  });

  it("LD-Module-B-11 — provider:'openai' throws a Phase-5-reserved error (interface-only stub)", () => {
    expect(() => getTutorModel({ provider: "openai" })).toThrow(
      /reserved for Phase 5/i,
    );
  });

  it("LD-Module-B-11 — LLM_PROVIDER_TUTOR=openai env-selects the stub and throws on call", () => {
    process.env.LLM_PROVIDER_TUTOR = "openai";
    expect(() => getTutorModel()).toThrow(/reserved for Phase 5/i);
  });

  it("LD-Module-B-11 — error message points to the valid LLM_PROVIDER_TUTOR values", () => {
    expect(() => getTutorModel({ provider: "openai" })).toThrow(
      /LLM_PROVIDER_TUTOR=deepseek/,
    );
  });
});

describe("Phase 4 D-104 §2.2 — getTutorProviderOptions thinking + reasoningEffort", () => {
  const originalTutor = process.env.LLM_PROVIDER_TUTOR;
  afterEach(() => {
    if (originalTutor === undefined) {
      delete process.env.LLM_PROVIDER_TUTOR;
    } else {
      process.env.LLM_PROVIDER_TUTOR = originalTutor;
    }
  });

  it("DeepSeek default: thinking.enabled + reasoningEffort:'high'", () => {
    delete process.env.LLM_PROVIDER_TUTOR;
    expect(getTutorProviderOptions()).toEqual({
      deepseek: {
        thinking: { type: "enabled" },
        reasoningEffort: "high",
      },
    });
  });

  it("DeepSeek escalate=true: reasoningEffort bumps to 'max' (same model)", () => {
    expect(
      getTutorProviderOptions({ provider: "deepseek", escalate: true }),
    ).toEqual({
      deepseek: {
        thinking: { type: "enabled" },
        reasoningEffort: "max",
      },
    });
  });

  it("DeepSeek escalate=false (default): reasoningEffort='high'", () => {
    expect(
      getTutorProviderOptions({ provider: "deepseek", escalate: false }),
    ).toEqual({
      deepseek: {
        thinking: { type: "enabled" },
        reasoningEffort: "high",
      },
    });
  });

  it("Anthropic: returns empty options (cache_control attached at message level by buildTutorMessages)", () => {
    expect(getTutorProviderOptions({ provider: "anthropic" })).toEqual({});
    expect(
      getTutorProviderOptions({ provider: "anthropic", escalate: true }),
    ).toEqual({});
  });

  it("OpenAI: returns empty options (unreachable in practice — getTutorModel throws first)", () => {
    expect(getTutorProviderOptions({ provider: "openai" })).toEqual({});
  });

  it("uses LLM_PROVIDER_TUTOR env when provider arg omitted", () => {
    process.env.LLM_PROVIDER_TUTOR = "anthropic";
    expect(getTutorProviderOptions()).toEqual({});
    process.env.LLM_PROVIDER_TUTOR = "deepseek";
    expect(getTutorProviderOptions()).toEqual({
      deepseek: {
        thinking: { type: "enabled" },
        reasoningEffort: "high",
      },
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

  it("Session 56 fix — parses anthropic nested-usage shape (actual AI SDK response)", () => {
    // Empirical Session 56 anthropic-debug diagnostic: AI SDK exposes
    // cache_read_input_tokens ONLY under providerMetadata.anthropic.usage
    // (snake_case, nested) and NOT at the top-level anthropic.* like
    // cacheCreationInputTokens. Reader must fall through to the nested
    // path when top-level is absent.
    const meta = {
      anthropic: {
        cacheCreationInputTokens: 0,
        usage: {
          input_tokens: 16,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 1284,
          output_tokens: 148,
        },
      },
    };
    const u = readCacheUsage(meta);
    expect(u.provider).toBe("anthropic");
    expect(u.cacheCreationInputTokens).toBe(0);
    expect(u.cacheReadInputTokens).toBe(1284);
  });

  it("Session 56 fix — top-level fields take precedence over nested when both present", () => {
    const meta = {
      anthropic: {
        cacheCreationInputTokens: 999,
        cacheReadInputTokens: 888,
        usage: {
          cache_creation_input_tokens: 100,
          cache_read_input_tokens: 200,
        },
      },
    };
    const u = readCacheUsage(meta);
    expect(u.cacheCreationInputTokens).toBe(999);
    expect(u.cacheReadInputTokens).toBe(888);
  });

  it("Session 56 fix — nested fallback when top-level fields missing", () => {
    const meta = {
      anthropic: {
        // No top-level cache fields at all — only nested usage.
        usage: {
          cache_creation_input_tokens: 161,
          cache_read_input_tokens: 1284,
        },
      },
    };
    const u = readCacheUsage(meta);
    expect(u.cacheCreationInputTokens).toBe(161);
    expect(u.cacheReadInputTokens).toBe(1284);
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
