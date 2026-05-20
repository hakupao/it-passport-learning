# Step 9 cache audit — first UI data point (Phase 2, Session 41)

> Scope: `/api/chat` AI SDK v6 data-stream migration + `<Chat />` UI surface on
> prod canonical `https://web-mu-sandy-78.vercel.app/chat`. Two 真 LLM calls
> issued via Chrome DevTools MCP using the deployed UI; per-call cache usage
> read from `vercel logs --json | grep "[chat]"`.

## §1 Raw cache data

| # | Turn | UI input | Wall* | inputTok | outTok | hit | miss | hit% | UX |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | t=1 (cold session, 1 user msg) | "DNS是什么" (zh-CN) | n/a† | 92 808 | 91 | 92 800 | 8 | **99.99 %** | Streaming render 流畅; assistant zh-CN reply with `第489ページ` citation grounded in glossary entry |
| 2 | t=3 (multi-turn: u/a/u) | "それは何の階層で動いていますか？" (ja) | n/a† | 92 914 | 94 | 92 800 | 114 | **99.88 %** | Language mirror zh→ja; "それ" correctly resolved to DNS; OSI 7-layer + UDP port 53 grounded |

\*Wall not captured per-call by the AI SDK UI message stream (no equivalent of
the Step 5-8 curl `--max-time` timer); both responses began streaming within
~2 s of click per Chrome DevTools observation.

†Per the `Vercel logs` snippet timestamps: call #1 at 06:57:14, call #2 at
06:58:40 → 86 s wall between calls. Sub-second TTFT not directly logged.

## §2 Cumulative β cache-hit data (D-091 §2.5β)

|       | Step  | Scope        | inputTok | hit%   | Source              |
|------:|------:|--------------|---------:|-------:|---------------------|
| #1    | 4     | glossary     | ~58 K    | 99.98% | Session 35 curl     |
| #2    | 5     | wholebook    | 92 815   | 99.98% | Session 37 curl     |
| #3    | 5     | wholebook    | 92 800   | 99.98% | Session 37 curl     |
| #4    | 6     | question     |  2 693   | 99.81% | Session 38 curl     |
| #5    | 7     | term-hover   |    400   | 96.00% | Session 39 curl     |
| #6    | 8     | hello-ai     | 57 993   | 99.98% | Session 40 curl     |
| #7    | 8     | wholebook    | 92 815   | 99.98% | Session 40 curl     |
| #8    | 8     | question     |  2 693   | 99.81% | Session 40 curl     |
| #9    | 8     | term-hover   |    400   | 96.00% | Session 40 curl     |
| #10   | 8     | question 2nd |  2 271   | 95.80% | Session 40 cold attempt → warm |
| **#11** | **9** | **wholebook UI t=1** | **92 808** | **99.99 %** | **Session 41 UI smoke** |
| **#12** | **9** | **wholebook UI t=3** | **92 914** | **99.88 %** | **Session 41 UI smoke** |

**All 12 data points ≥ 95.80 % hit ⇒ D-091 §2.5(β) tripwire never fires under
healthy operation.** The 50 % floor + 1000-tok input floor in `evaluateCacheTripwire`
(`apps/web/src/lib/ai/tripwire.ts`) is the right shape: it catches genuine
provider-side caching regressions, not normal variance.

The newly added data points #11/#12 ratify the stable-prefix invariant
**under multi-turn conversation**. Turn-count 3 in #12 added only ~114 miss
tokens vs ~92 800 hit — the conversation suffix grows linearly while the
corpus + system prefix stays byte-identical, exactly as D-095 §2.3 designed.

## §3 [tripwire] log inspection

```
$ vercel logs https://web-mu-sandy-78.vercel.app --json | grep '\[tripwire\]'
(no matches)
```

0 fires under healthy operation = correct silent design per Step 8 Q3=a.
The fire branch (`cache_low_hit`) remains covered by `tripwire.test.ts` unit
tests, exercised at unit level, not at runtime.

## §4 Module C — first UI data point retro (D-094 §2.4)

| metric | value |
|---|---|
| Step 9 estimate (PLAN.md row) | 1.5 day ≈ 720 min |
| Step 9 actual wall | ~110 min |
| Drift | **−85 %** (−83 % rounded) |
| γ-tripwire data point #9 | extends Module A+B "implementation cruise" sub-pattern to UI work |

### §4.1 Sub-step wall breakdown (informal)

| Sub-step | Wall (min) | Notes |
|---|---:|---|
| 4Q slow-pace Q1-Q4 + ACK | 5 | a/a/a/a blanket Recommended |
| Context7 verify AI SDK v6 useChat + UIMessage protocol | 5 | needed to lock `convertToModelMessages` as Promise-returning |
| Batch B route migration + chat.ts trim + tests | 25 | core code change |
| Batch C `<Chat />` + Batch D page route + Batch E historyStore + tests | 20 | UI scaffolding |
| Batch F local green check (vitest+lint+tsc+build) | 5 | 1 tsc error caught + fixed |
| Batch G deploys — diversion: react@19.1.0 npm peer-dep | 35 | unplanned (see §6 below); React bump to 19.2.6 fixed |
| Batch G2 deploys — second diversion: Chrome fetch credentials-in-URL | 15 | unplanned (see §6 below); defensive replaceState fixed |
| Batch G3 UI smoke + screenshots + log inspection | 10 | 真 LLM calls + Resume verify + clear verify |
| Batch H evidence write | (pending at audit time) | this file + 6 siblings + tripwire row #6 + PLAN/STATE/session log |

### §4.2 Module C+D full re-estimate decision

**STILL NOT done this turn.** Decision: continue D-094 §2.1 amendment pattern
(inline `actual <N> min` in PLAN.md without bumping the estimate column); revisit
at Step 12 close when N=4 Module C data points are in hand.

Rationale:
- A single UI data point ratifies the sub-pattern fit but is N=1 for "UI work
  velocity" specifically.
- Steps 10-11 are visual QA + popover work, structurally different from Step 9's
  data-stream wiring; their velocity may diverge.
- Step 12 = layout + i18n base; structurally different again.
- A full re-estimate would re-commit on a single noisy data point; the
  per-step inline amend gives the right granularity without locking us in.

### §4.3 γ tripwire — 9th consecutive under-estimate

```
Step 1 –98 %  Step 2 –98 %  Step 3 –98 %  | Module A done
Step 4 –85 %  Step 5 –86 %  Step 6 –84 %  Step 7 –81 %  Step 8 –82 %  | Module B done
Step 9 –85 %                                                          | Module C in progress (data point 1 of 4)
```

Module A+B+C(t=1) sub-segments:
- A bootstrap (–98%): empty-greenfield velocity, scaffold
- B bootstrap (–85,–86) → clone-adapt (–84,–81) → composition (–82)
- C UI bootstrap (–85): re-enters bootstrap regime because AI SDK protocol +
  React component scaffolding are structurally new vs Module B API-route work

→ continues to satisfy `actual ≤ −30 %` D-091 §2.5(γ) tripwire condition; D-094
§2.4 mid-retro pattern continues with PLAN.md Step 9 wall column inline amend.

## §5 Observability findings

### §5.1 DeepSeek prefix cache TTL > 5 h (re-confirmed)

Session 40 last `/api/chat` call was at ~02:30 UTC on 2026-05-20. Session 41
call #1 was at ~06:57 UTC — gap > 4 h. The 99.99 % hit on call #1 confirms
the Step 8 Session 40 §5.1 finding: DeepSeek's automatic prefix-cache TTL
materially exceeds 5 minutes and is favourable for D-091 §2.1 cost projections.

### §5.2 AI SDK system-message-in-prompts warning (re-confirmed)

Same Step 8 finding: each `/api/chat` call emits:

```
AI SDK Warning: System messages in the prompt or messages fields can be a
security risk because they may enable prompt injection attacks. Use the system
option instead when possible. Set allowSystemInMessages to true to suppress
this warning, or false to throw an error.
```

Intentional per D-095 §2.3 stable-prefix layout (corpus as first system message
with `providerOptions.anthropic.cacheControl: ephemeral`). Mitigation =
`allowSystemInMessages: true` on the streamText call. Deferred as cosmetic —
the warning does not affect output and is purely informational on the server side.

### §5.3 Chrome `fetch` with credentials-in-URL restriction (NEW)

When the page is reached via a URL of the form `https://user:pass@host/chat`
(automated smoke harness OR a credential-bearing bookmark), Chrome's `fetch`
implementation throws:

> Failed to execute 'fetch' on 'Window': Request cannot be constructed from a
> URL that includes credentials: /api/chat

`useChat`'s default transport resolves the API path against `window.location.href`
and triggers exactly this branch.

Fix landed in `<Chat />` mount effect: if `window.location.href.includes("@")`,
call `window.history.replaceState({}, "", window.location.pathname + search + hash)`
to strip credentials from the URL before any fetch is constructed. The D-097
Basic Auth has already been honoured (Chrome's HTTP auth cache holds the
credentials per session by then), so this is purely a fetch-construction fix.

**Real-user flow is unaffected**: users type the clean URL into the browser,
get the Basic Auth dialog, fill it, and the URL never contains credentials.

### §5.4 Clear-then-empty-write churn (LOW severity)

`handleClear` calls `setMessages([])` then `clearChatHistory(...)` synchronously.
The save-effect (`useEffect [messages, restored]`) then runs and writes
`{version:1, messages:[], updatedAt: <now>}` back to localStorage, undoing the
delete. Functionally equivalent to a clear (empty messages = no Resume), but
churns localStorage by one extra write per clear. Not blocking for α-now; flag
for Step 12 layout cleanup.

## §6 Cost (real, this Session)

DeepSeek-chat pricing (2026-05-20 confirmed):
- input miss : $0.27 / 1M tok
- input hit  : $0.07 / 1M tok
- output      : $1.10 / 1M tok

|  | inputHit | inputMiss | output | $ |
|---|---:|---:|---:|---:|
| Call #1 | 92 800 × $0.07/1M | 8 × $0.27/1M | 91 × $1.10/1M | $0.006 596 |
| Call #2 | 92 800 × $0.07/1M | 114 × $0.27/1M | 94 × $1.10/1M | $0.006 624 |
| **Step 9 total** | | | | **~$0.013 真 billed** |

Cumulative Phase 2 真 billed:
- Session 35 Step 4 : ~$0.017
- Session 37 Step 5 : ~$0.030
- Session 38 Step 6 : ~$0.004
- Session 39 Step 7 : ~$0.0005
- Session 40 Step 8 : ~$0.014
- **Session 41 Step 9 : ~$0.013**
- **Phase 2 cumulative : ~$0.079** vs D-090 α-silent $5 cap = **63× headroom**

## §7 Rule A (semantic audit)

Step 9 is structural wiring + UI surface; no >50 % content compression / rewrite.
Informal coherence audit on the 2 LLM replies in §8 below.

## §8 Rule A informal sampling (N=2)

### Sample 1 — call #1

User: 「DNS是什么」 (zh-CN, single-shot user query)

Assistant reply (zh-CN, 218 chars):
> DNS是域名系统（Domain Name System）的缩写。它负责将人类易记的域名（如
> www.example.com）转换为计算机识别的IP地址（如 192.0.2.1）。DNS使用端口
> 号53，是互联网通信的基础协议之一。相关具体内容在书的第489页有详细介
> 绍，包括DNS解析过程和与IP地址的关系。如果用户想了解更具体的功能或相
> 关协议，可以进一步询问。

Audit:
- factual: domain → IP, port 53, foundational protocol — all standard
- corpus grounded: `第489页` citation matches `GlossaryEntry.first_page` for
  the DNS entry, same as Session 37 / 40 prod smoke results
- language mirror: zh-CN out (user wrote zh-CN) — matches SYSTEM_INSTRUCTION
- length: well under 200 token cap

VERDICT: PASS.

### Sample 2 — call #2 (multi-turn)

User: 「それは何の階層で動いていますか？」 (ja, references prior "DNS" topic)

Assistant reply (ja, ~95 chars):
> DNS（Domain Name System）は、**OSI参照モデルの第7層（アプリケーション
> 層）**で動作します。これは、アプリケーション（Webブラウザやメールソ
> フトなど）から直接利用されるプロトコルだからです。
>
> 実際の通信では、下位のトランスポート層（第4層）の**UDP**（主にポート
> 53）を使用して、高速に名前解決を行います。

Audit:
- factual: DNS at OSI layer 7 with UDP transport at layer 4, port 53 —
  textbook accurate
- multi-turn resolution: "それ" → DNS context preserved correctly
- language mirror: ja out (user switched to ja) — matches SYSTEM_INSTRUCTION
- corpus grounded: OSI 7-layer model + DNS/UDP layer mapping all present in
  the book's Network chapter
- length: well under cap

VERDICT: PASS.

**N=2 coherent + corpus-grounded + language-mirroring + multi-turn-aware ⇒
no Rule B failure archive.**
