# step_10_audit — acceptance + pre-close self-check

Session 42 · Phase 2 Module C 2/4 · 2026-05-20.

## Acceptance criteria (per PLAN.md §1 Step 10 row)

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `<QuizExplain />` modal renders on `?qid=` URL state | ✅ | `screenshot_2_modal_busy.png` + `screenshot_3_modal_done.png`; modal opens with `role="dialog"` `aria-modal="true"` at uid `14_0` after click. |
| 2 | Busy state during 22-42s TTFT envelope | ✅ | Skeleton (4× `animate-pulse` rows) + `role="progressbar"` keyframe animation + bilingual "AI が回答を生成しています…/AI 正在分析…" hint; rendered during `phase==='loading'` (`screenshot_2_modal_busy.png`). Actual R1 wall this run = ~5-7s (within budget). |
| 3 | `<QuizList />` lists all question entities in corpus order | ✅ | 254 cards rendered (matches `idx.entity_by_id` filter `type==='question'`); ordered by `(page, entity_index)`; first 5 entries verified: 第42页問1-4 → 第43页問1 (per `wait_for` snapshot). |
| 4 | Click → URL state update | ✅ | `evaluate_script` confirms `window.location.search === '?qid=page_042_entity_0'` post-click. |
| 5 | Close → URL state clean + modal unmount | ✅ | `evaluate_script` confirms `{search:'', dialogPresent:false}` post-click of "閉じる / 关闭" button. |
| 6 | D-097 firewall still gating | ✅ | Pre-deploy probe HTTP 401 + WWW-Authenticate; post-deploy probe identical; both `/quiz` and `/api/quiz/explain` paths gated. |
| 7 | β cache hit ≥ 50% (no D-091 §2.5(β) fire) | ✅ | 99.81% × 2 calls. |
| 8 | 0 [tripwire] fires under healthy operation | ✅ | `vercel logs --json \| grep '\\[tripwire\\]'` empty. |
| 9 | Cost within D-090 α-silent $5/$5 envelope | ✅ | Cumulative Phase 2 真 ≈ $0.082 (60× headroom). |
| 10 | Module B 5/5 not regressed | ✅ | 4 API routes + middleware unchanged; build size diff identical except `/quiz` 4.16 kB added. |

## Pre-close self-check (per D-027 §5)

| Item | Status | Evidence |
|---|---|---|
| 0 new ADR lock | ✅ | Session 42 in-source amendments only (resolveEndpoint + defensive strip carry-over); NOT D-NNN-worthy. |
| Code green (vitest + lint + tsc + build) | ✅ | 193/193 vitest + lint exit 0 + tsc strict exit 0 + Next.js build 11 routes / 4.16 kB /quiz + Middleware 37.6 kB unchanged. |
| Vercel env vars unchanged | ✅ | DEEPSEEK_API_KEY + FIREWALL_BASIC_AUTH untouched (Step 8 carry-over). |
| Preview deploy | ✅ | `dpl_GvjtDzicvsLMW6hG2jxdfwAFD7ht` (target=null preview). |
| Production deploy | ✅ | prod-v1 `dpl_32KMSnDfUY6fNUBUMhreetCSGLJm` → prod-v2 `dpl_FcrwVPJuLNUEKexBaN7AfST3rXCm` (defensive strip) → prod-v3 final `dpl_BqdybbaGeBEqmvX9vv5zUVwKmHEL` (target=production, aliased canonical `web-mu-sandy-78.vercel.app`, absolute-URL fix included). |
| Firewall still gating post-promote | ✅ | HTTP 401 + WWW-Authenticate on both `/quiz` + `/api/quiz/explain`. |
| 2 真 LLM UI smoke ✅ | ✅ | `ui_smoke_2026-05-20.md` Call A + Call B; both 99.81% hit; ~$0.0033 真 billed. |
| 0 [tripwire] fires under healthy operation | ✅ | `vercel logs` grep empty. |
| Module B 5/5 ✅ retained (no regression) | ✅ | All 4 API endpoints + middleware unchanged; new code is purely additive (3 new components + 2 new lib modules + 1 new page). |
| PLAN.md Step 10 ✅ DONE | ✅ | row amended with full narrative + `actual ~145 min` |
| STATE.md sync | ✅ | 4 anchors touched (最后更新 + 当前阶段 + 已锁定决定数 + 下一会话). |
| Session log on disk | ✅ | `docs/discussion/2026-05-20-session-42.md` complete. |
| Evidence on disk | ✅ | `evidence/phase2/step_10_quiz_ui/` 7 docs + 4 screenshots; tripwire_log row #7 appended; 1 Rule B archive in `failures/`. |
| Rule A 抽检 | n/a → wiring + UI smoke; informal coherence audit on N=1 R1 reply quoted verbatim in `ui_smoke_2026-05-20.md`. |
| Rule B 失败归档 | ✅ 1 (document.baseURI credentials pollution, fixed same wall). |
| Rule C (Phase retro) | n/a | mid-Phase; Module C 2/4 second-data-point retro in `cache_audit §5`. NOT Rule C Phase-end retro. |
| Rule D Writer ≠ Reviewer | ✅ | Writer = main session; Reviewer = user terminal (4Q ACK + `授权 vercel --prod` × 3 ACK + `授权 decode firewall pass` ACK + `go UI smoke` ACK); commit ACK pending per Sessions 27-41 pattern. |
| OPEN OQ count | 3 unchanged | Phase 1 后续 / Phase 3-4 范围. |

## NOT covered (Module C+D backlog carried forward)

- R1 reasoning-stream consumption (`onReasoning` callback for `result.reasoningStream` in case `text` deltas empty).
- AI SDK `allowSystemInMessages: true` cosmetic warning suppression.
- Step 11 Glossary Term Popover (inline trigger on words; smaller payload).
- Step 12 3-tab Layout + i18n catalog extraction.
- Cluster monitoring of QUIZ_SYSTEM_INSTRUCTION 600-tok soft cap (Call B emitted 621 — 3.5% over).
