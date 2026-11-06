# b22 B3 patch re-review — strategy-01-01 u06–u10 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 147)
- Scope: B3 wording patches for strategy-01-01-u06 (p01–p07), u07 (p01–p04), u08 (p01–p15), u09 (p01–p05), u10 (p01–p14)
  — **45 `active`, 0 retired** (`patches/strategy-01-01-u{06..10}.json`), checked against the Rule A prescriptions
  (`strategy-01-01-u06.ruleA.md` L1・L2・L3・L8 建議修; `-u07` L1・L2; `-u08` **M1** + L1・L2・L3・L5・L6・L7 (L4 not applied); `-u09` L1・L2・L3; `-u10` L1・L2・L3・L5・L6 (L4 not applied))
  and the merged units `data/ip/textbook/units/strategy-01-01-u{06..10}.json` (sha256 u06 `a75aab1c19b37f40…`, u07 `2ac029a950308ee3…`, u08 `a8fef9f215cedb47…`, u09 `0dc32b96ef9da6b7…`, u10 `c3f261ee05fb423f…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u06 `b22-u06-a2/…loc.r0.json` (`625d8f69…`), u07 `b22-u07-a1/…loc.r0.json` (`988d3817…`), u08 `b22-u08-a1/…loc.r0.json` (`7078834c…`), u09 `b22-u09-a1/…loc.r1.json` (`3fc04f20…`; r0 = `c3066bcc…` is not the base), u10 `b22-u10-a1/…loc.r0.json` (`24d0c11f…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210 and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b21_patch_rereview.md` §0 (= b20 / b19 §0), topic strategy-01-01 (62 questions; 310 source strings per language):

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly. Additionally each patch's `before` / `after` (bold stripped on both sides) was found verbatim in its unit's Rule A file (45/45).
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point of the 5 units; `summary.memory_hooks_*` for the 5 patched hooks (u08 terms[1] / [3], u09 terms[0] / [1]) by suffix match.
3. D-198 (jp patches: u07 p01; u08 p01, p04, p07, p10; u09 p01; u10 p01, p04, p07, p10): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every strategy-01-01 question. zh / en patches: LCS against the zh / en translation sidecars of all 62 topic questions, whole patched field before → after and the `after` span alone. Plus a per-choice + stem LCS (before → after) of the focus patches against the focus questions: u08 p01–p12 × 2012h24a-q021, 2026r08-q030, 2025r07-q015, 2016h28a-q025; u07 p01–p04 × 2012h24h-q044; u09 p01–p05 × 2014h26h-q008, 2010h22a-q017, 2017h29a-q023; u10 p01–p12 × 2023r05-q035, 2022r04-q018, 2026r08-q006.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + fig / mermaid labels); meaning judged against the cited / quiz questions' `correct_answer` and their zh / en sidecars (b18 u05 M1 type). For u08 the two "how to recognise the chart" hooks were applied by hand to the q025 chart, the q021 chart, the t02 mermaid (事業部 → 営業・製造・経理 ×3), the matrix table fig and the four q030 cases.
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b22rr/check.mjs`, `b22rr/d198.mjs`, `b22rr/focus2.mjs` (adapted from the b21 re-review scripts; only unit IDs / part paths / focus questions changed).

Not established: as in b14–b21, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u06 146, u07 100, u08 166, u09 72, u10 141) were checked for the derived copies (step 2) and for the patched texts. DX 推進ガイドライン (u10 L4) was not fetched from the primary source (see §3.5).

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-01-01-u06 unit: 0 issues   validate EXIT=0 | parity: 35 locations, 0 diff  EXIT=0
✓ strategy-01-01-u07 unit: 0 issues   validate EXIT=0 | parity: 25 locations, 0 diff  EXIT=0
✓ strategy-01-01-u08 unit: 0 issues   validate EXIT=0 | parity: 35 locations, 0 diff  EXIT=0
✓ strategy-01-01-u09 unit: 0 issues   validate EXIT=0 | parity: 18 locations, 0 diff  EXIT=0
✓ strategy-01-01-u10 unit: 0 issues   validate EXIT=0 | parity: 34 locations, 0 diff  EXIT=0
validate --part (bases): u06 loc#0 0 issues | u07 loc#0 0 | u08 loc#0 0 | u09 loc#1 0 | u10 loc#0 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 45/45 `before` occur exactly once in the base field; 45/45 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (5/5 units). Unexplained base → unit diffs in base-present paths: 0 per unit (changed paths u06 7, u07 4, u08 15, u09 5, u10 14 = exactly the patched fields; only the `stage` meta key removed, as in b19–b21; `round` / `jp_round` are non-string meta keys of the part). `before` remnants: 0 except u08 p15, where the `before` is the tail of the `after` (the patch prepends 日语的) — expected, same pattern as b21 u04 p05 / p06.

Derived fields follow: u06 p05 → `terms[5].definition_zh`, p06 → `terms[7].explanation_en`, p07 → `terms[2].definition_zh`; u07 p04 → `terms[1].definition_zh`; u08 p01–p03 → `terms[1].memory_hook_*` (+ `summary.memory_hooks_*[1]`), p04–p06 → `terms[3].memory_hook_*` (+ `summary.memory_hooks_*[3]`), p14 → `summary.key_points_en[4]`, p15 → `terms[2].explanation_zh`; u09 p01–p03 → `terms[1].memory_hook_*` (+ `summary.memory_hooks_*[1]`), p05 → `terms[0].memory_hook_en` (+ `summary.memory_hooks_en[0]`); u10 p04–p06 → `terms[2].definition_*`, p13 → `terms[4].explanation_zh`, p14 → `terms[3].definition_en`. Full walk: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u06 84, u07 54, u08 87, u09 36, u10 78 checked (339), 0 mismatches. (u10 `summary.memory_hooks_*` has 5 entries for 8 terms — only terms with a hook — and no u10 hook was patched.)

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 45 of 45 (e.g. u06 `terms[5].one_zh` bold 2 → 2 / `[[jp:]]` 1 → 1; u07 `terms[1].one_zh` bold 2 → 2 / `[[jp:動機づけ]]` kept; u08 `terms[2].detail_zh` `[[jp:]]` 2 → 2; u10 `terms[4].detail_zh` `[[jp:]]` 2 → 2, `terms[2].one_*` bold 2 → 2). Parity 0 diff.

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u06 p01 | en | 2011h23a-q001 エ | 11 → 11 | " objectives" (11, unchanged part) | — |
| u06 p02 | en | 2021r03-q026 stem | 16 → 16 | " evaluation and " (16, unchanged part) | — |
| u06 p03 | en | 2021r03-q026 stem | 16 → 16 | " evaluation and " (16, unchanged part) | — |
| u06 p04 | en | 2026r08-q006 ア | 14 → 14 | " opportunities" (14, unchanged part) | — |
| u06 p05 | zh | 2011h23a-q001 stem | 4 → 4 | 员工的技 (4, unchanged part) | — |
| u06 p06 | en | 2016h28h-q034 stem | 21 → 21 (unchanged part) | " to perform " (12; 2013h25h-q022 エ correct) | — |
| u06 p07 | zh | 2016h28h-q024 ア | 4 → 4 | 员工的 (3) | — |
| u07 p01 | **jp** | 2012h24h-q044 stem → q044 ア (correct, term name) | 7 (望ましい行動を) → 7 (インセンティブ = term) | インセンティブ (7, term) | 0 / 0 → 0 / 0; 0.28 → 0.23 |
| u07 p02 | zh | 2012h24h-q044 stem | 5 → 5 | 行为的机制 (5) | — |
| u07 p03 | en | 2012h24h-q044 stem | **30 → 19** | "s a mechanism that " (19, generic) | — |
| u07 p04 | zh | 2012h24a-q006 エ | 4 → 4 (unchanged part) | 激发 (2) | — |
| u08 p01 | **jp** | 2010h22a-q005 stem → 2010h22a-q022 ウ | 3 → 3 | ように (3) | 0 / 0 → 0 / 0; 0.11 → 0.10 |
| u08 p02 | zh | 2009h21a-q009 ウ | 3 → 3 | 职能制 (3, term) | — |
| u08 p03 | en | 2012h24h-q018 イ (correct) | 23 → 23 | "functional organization" (23, term) | — |
| u08 p04 | **jp** | 2009h21a-q009 ア | 4 → 4 | 事業部制 (4, term) | 0 / 0 → 0 / 0; 0.15 → 0.10 |
| u08 p05 | zh | 2026r08-q030 stem | 5 → 5 | 是事业部制 (5, term) | — |
| u08 p06 | en | 2009h21h-q029 stem | 24 → 23 | " a divisional structure" (23, term) | — |
| u08 p07 | **jp** | 2011h23a-q001 ア (correct) | 4 → 4 (unchanged part) | それぞれ (4) | 0 / 0 → 0 / 0; 0.19 → 0.17 |
| u08 p08 | zh | 2011h23a-q001 ア (correct) | 2 → 2 | 下的 (2) | — |
| u08 p09 | en | 2016h28h-q024 イ | 12 → 12 (unchanged part) | " the same " (10) | — |
| u08 p10 | **jp** | 2009h21a-q009 ア | 4 → 4 (term) | の事業を (4) | 0 / 0 → 0 / 0; 0.12 → 0.13 |
| u08 p11 | zh | 2009h21a-q009 ア | 4 → 4 (term) | 业务所需 (4) | — |
| u08 p12 | en | 2009h21h-q029 stem | 24 → 24 (term) | "s a divisional structure" (24, term) | — |
| u08 p13 | en | 2026r08-q030 イ | 15 → 15 (unchanged part) | " functions are " (15) | — |
| u08 p14 | en | 2010h22a-q022 イ → 2013h25h-q022 エ (both correct) | 17 → 17 | " responsibility a" (17) | — |
| u08 p15 | zh | 2009h21h-q029 イ | 3 → 3 (unchanged part) | 的专业 (3) | — |
| u09 p01 | **jp** | 2010h22a-q022 ウ | 5 → 5 (unchanged part) | では (2) | 0 / 0 → 0 / 0; 0.12 → 0.14 |
| u09 p02 | zh | 2010h22h-q019 stem | 5 → 5 (unchanged part) | 语 (1) | — |
| u09 p03 | en | 2010h22a-q022 ウ | 13 → 13 | " a company's " (13) | — |
| u09 p04 | zh | 2009h21a-q003 stem | 2 → 2 | 是哪 (2) | — |
| u09 p05 | en | 2013h25h-q026 stem | 11 → 11 (unchanged part) | "ers and " (8) | — |
| u10 p01 | **jp** | 2011h23a-q001 ア (correct) | 4 → 4 (unchanged part) | てきた (3) | 0 / 0 → 0 / 0; 0.14 → 0.14 |
| u10 p02 | zh | 2010h22a-q005 stem → 2023r05-q035 ア (correct) | 3 → 3 | 业的 (2) | — |
| u10 p03 | en | 2023r05-q035 stem | 12 → 12 (" the fourth ", unchanged part) | "the fourth " (11) | — (obs. 2) |
| u10 p04 | **jp** | 2019h31h-q021 イ (correct) | 5 → 5 (unchanged part) | である (3) | 0 / 0 → 0 / 0; 0.10 → 0.12 |
| u10 p05 | zh | 2011h23tokubetsu-q008 ア → 2011h23a-q001 エ | 4 → 3 | 的社会 (3) | — |
| u10 p06 | en | 2009h21h-q029 stem → 2010h22a-q005 stem | 12 → 15 | " refers to the " (15, generic) | — |
| u10 p07 | **jp** | 2023r05-q035 エ | 5 → 5 (エネルギー) | エネルギー (5) | 0 / 0 → 0 / 0; 0.33 → 0.50 (obs. 1) |
| u10 p08 | zh | 2023r05-q035 エ | 2 → 2 | 能源 (2) | — |
| u10 p09 | en | 2016h28h-q026 ア → 2010h22a-q005 stem | 13 → 7 | " energy" (7) | — |
| u10 p10 | **jp** | 2024r06-q029 stem → 2023r05-q035 エ | 5 → 5 | エネルギー (5) | 0 / 0 → 0 / 0; 0.14 → 0.12 |
| u10 p11 | zh | 2023r05-q035 エ | 3 → 3 (unchanged part) | 的动力 (3) | — |
| u10 p12 | en | 2010h22a-q005 stem → 2021r03-q026 stem | 16 → 11 | " digital t" (10, unchanged part) | — |
| u10 p13 | zh | 2024r06-q029 stem | 5 → 5 (unchanged part) | 数字化 (3) | — |
| u10 p14 | en | 2023r05-q011 stem | 17 → 17 (unchanged part) | " world and " (11) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52) as a sentence-frame copy; jp 12-char windows: 0 / 0 before and after in all 10 jp patches. The only wDice rise (u10 p07, 0.50) is a 9-char table cell = the GX one's own katakana term クリーンエネルギー sharing エネルギー with a 2023r05-q035 choice (obs. 1). u07 p01–p03 do what L1 asked: jp field LCS with the q044 stem's definition clause 7 (望ましい行動を) → only the term name; stem LCS jp 7 → 4 (る仕組み), en 30 → 19 (generic "s a mechanism that ").

Per-choice check of the focus patches (LCS before → after vs each choice; `focus2.mjs`):
- 2012h24a-q021 (chart; correct ア 事業部制; wrong イ 職能別): u08 p01–p03 vs イ jp 2 → 2, zh 2 → 2, en 13 → 13 (" organization"); p04–p06 vs ア = term only (4 / 4 / 11). No new overlap with any choice.
- 2026r08-q030 (case for 事業部制; correct ア, wrong イ = one org per function across businesses, ウ = two bosses, エ = disbanding team): u08 p06 en vs イ 8 → 12 (" their own s"), vs エ 11 → 12 (" departments") — generic words; all other ≤4 (jp / zh). p07 jp vs イ それぞれ (4, unchanged).
- 2025r07-q015 / 2016h28a-q025: overlaps = term names only (functional organization 23 = q025 correct ウ / q015 wrong イ's name; unchanged).
- 2012h24h-q044 (correct ア インセンティブ): u07 p01–p04 vs all choices ≤3 except the term name (ア 7); vs stem see above.
- 2014h26h-q008 / 2010h22a-q017 / 2017h29a-q023 (CIO / CIO / CFO): u09 p01–p05 ≤2 vs every choice (choices are codes / one-word areas); p01 / p02 vs q008 ア (CEO) 1 → 0.
- 2023r05-q035 (4th IR; correct ア = internet / AI across life domains): u10 p03 en vs wrong イ / ウ / エ 3–4 → 8 (" industr" / "industry"; obs. 2); p07 / p10 jp vs エ 1–2 → 5 (エネルギー; obs. 1); everything else ≤4.
- 2022r04-q018 / 2026r08-q006: ≤4 except en generic (" industry" 9 vs q018 イ, " the same s" 11 vs q018 エ for u10 p06 — the phrase "the same society"; " digital " 9, unchanged).

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u06 | p01–p04 | `terms[1](MBO).fig.data.nodes[3].label.en`, `fig.steps[3].caption_en`, `pairs[0].rows[1].a_en`, `pairs[1].rows[1].b_en` | L1 建議修 | Yes: 処遇 "pay" → "compensation" (= `terms[0].one_en`); the unit's remaining "pay" (`terms[6](リテンション).detail_en` + explanation_en) translates 報酬 and stays, as the auditor prescribed | No | OK |
| u06 | p05 | `terms[5](タレントマネジメント).one_zh` (+ definition_zh) | L2 建議修 | Yes: 适应性 (adaptability) → 资质 (aptitude) = jp 適性 / en "aptitudes" | No (§3.6) | OK |
| u06 | p06 | `terms[7](DE&I).detail_en` (+ explanation_en) | L3 建議修 | Yes: "does not let them perform well" → "makes it hard for them to perform well" (= jp 発揮しにくい / zh 难以) | No | OK |
| u06 | p07 | `terms[2](CDP).one_zh` (+ definition_zh) | L8 建議修 | Yes: 每位员工 → 每位员工的 (grammatical; bold 3 → 3) | No | OK |
| u07 | p01–p03 | `terms[1](モチベーション).points[0].text_jp / _zh / _en` | L1 建議修 | **Yes** (§3.2) | No | OK |
| u07 | p04 | `terms[1].one_zh` (+ definition_zh) | L2 建議修 | Yes: 動機づけ 激励 → 动机激发 (= title_zh 动机激发与领导力); 激励 now only in 激励机制 = インセンティブ (detail_zh, points zh) and the v1 `unit_summary_zh` (out of B3 scope, Rule A O1) — matches q044's zh correct 激励（Incentive） | No | OK |
| u08 | p01–p03 | `terms[1](機能別組織).hook_jp / _zh / _en` (+ derived) | **M1 (MEDIUM)** | **Yes** (§3.1) | No | OK |
| u08 | p04–p06 | `terms[3](事業部制).hook_jp / _zh / _en` (+ derived) | L1 建議修 | **Yes** (§3.1) | No (obs. 5) | OK |
| u08 | p07–p09 | `terms[3].analogy_jp / _zh / _en` | L2 建議修 | Yes: 商店街の (independent) shops → shops owned by one owner (1人のオーナー / 同一位老板 / "owned by the same person") = one enterprise with self-contained units; no longer leans toward separate companies (持株会社 side); 持株会社 analogy (御者) unaffected | No | OK |
| u08 | p10–p12 | `terms[3].points[1].text_jp / _zh / _en` | L3 建議修 | **Yes** (§3.1) | No | OK |
| u08 | p13 | `pairs[0].rows[3].b_en` | L5 建議修 | Yes: "causing waste" → "which tends to cause waste" (= jp 無駄が出やすい, detail_en "tends to waste") | No | OK |
| u08 | p14 | `key_points_en[4]` (+ summary) | L6 建議修 | Yes: "self-supporting responsibility" → "responsibility as self-supporting units" (= `terms[6].one_en` "responsibility as a self-supporting unit", `overview_rows[6].extra_en[1]`) | No | OK |
| u08 | p15 | `terms[2](職能別組織).detail_zh` (+ explanation_zh) | L7 建議修 | Yes: 日语的“职能” — the 职能 / 机能 contrast is now explicitly about the Japanese words, no longer reads as a claim about zh 职能制 (= 機能別); 2nd sentence unchanged | No | OK |
| u09 | p01–p03 | `terms[1](CEO).hook_jp / _zh / _en` (+ derived) | L1 建議修 | **Yes** (§3.3) | No | OK |
| u09 | p04 | `terms[0](CxO).analogy_zh` | L2 建議修 | **Yes** (§3.3) | No | OK |
| u09 | p05 | `terms[0](CxO).hook_en` (+ derived) | L3 建議修 | Yes: "middle letter" → "middle letters" (= jp 真ん中の部分; CISO = IS) | No | OK |
| u10 | p01–p03 | `terms[0](第4次産業革命).analogy_jp / _zh / _en` | L1 建議修 | **Yes** (§3.4) | No (obs. 2) | OK |
| u10 | p04–p06 | `terms[2](超スマート社会).one_jp / _zh / _en` (+ definition) | L2 建議修 | Yes: Society5.0 is no longer the "subject that aims for" a society; one now says the same society named from its content = `points[0]` (別々の社会ではない) and Society5.0 one (社会そのもの) | No (obs. 6) | OK |
| u10 | p07–p12 | `pairs[1].rows[0].b_*`, `terms[7](グリーントランスフォーメーション).analogy_*` | L3 建議修 | **Yes** (§3.4) | No (obs. 1) | OK |
| u10 | p13 | `terms[4](DX).detail_zh` (+ explanation_zh) | L5 建議修 | Yes: 数字化（信息，[[jp:デジタイゼーション]]） — same 訳语（[[jp:…]]） format as the rest of the unit; `[[jp:]]` 2 → 2 | No | OK |
| u10 | p14 | `terms[3](データ駆動型社会).one_en` (+ definition_en) | L6 建議修 | Yes: "analyzes, in cyberspace, data gathered from the real world" — in cyberspace now modifies analyzes (= jp サイバー空間で分析し) | No | OK |

Not applied (judged §3.5): u08 L4 (challenge_questions qid swap), u10 L4 (DX 推進ガイドライン edition note).

## 3. Focused checks

### 3.1 u08 p01–p06 (M1 + L1) and p10–p12 (L3) — organization-chart hooks vs 2016h28a-q025, 2012h24a-q021, 2026r08-q030, 2025r07-q015

- p01–p03 after (機能別 hook): 「営業部・経理部のように『何をする部か』が分かる部署が会社に1つずつ並び、事業ごとのまとまりが無ければ機能別。」 / zh 「…在公司里各只有一个、也没有按业务归组的，就是职能制。」 / en "If departments named for what they do … each appear only once and nothing is grouped by business, it is a functional organization." (= auditor's M1 text verbatim, 3/3). The hook now carries the discriminator that `points[0]` already states (事業ごとのまとまりが無い), plus "one of each".
- Applied by hand:
  - q025 chart (president → 5 function departments side by side, each once, no business grouping): both conditions hold → fires → correct ウ 職能別組織. 事業部制 hook (repeated departments under named divisions) does not fire. Correct.
  - q021 chart (president → 2 corporate functions → 2 business heads → 研究開発 / 販売 / 生産 under each): 研究開発 / 販売 / 生産 appear twice and there is grouping by business → 機能別 hook **does not fire** (the old hook fired on the department names and pointed to wrong イ 職能別). 事業部制 hook: the same sales / production departments are repeated under each business unit → fires → correct ア. The product / place-name example (家電・関西) is an example in parentheses, not a condition, so the generic "A 事業担当" does not block it.
  - t02 mermaid (家電 / 自動車 / 食品事業部 → 営業・製造・経理 each): 機能別 hook does not fire, 事業部制 hook fires — the M1 contradiction with `terms[3].fig` is gone.
  - matrix table fig (開発部長 / 販売部長 once each × 製品 A / B leads): no department repeated per division → 事業部制 hook does not fire (the old product-name cue did, L1); 機能別 hook: function departments once each but there *is* a product axis, so "nothing is grouped by business" fails → does not fire. Neither hook misfires on the matrix.
  - q030 (case for 事業部制): ア (each business has its own purchasing organization) → 事業部制 hook fires (repetition per business; 営業や製造 is an open list); イ (one HR organization across several businesses, each function its own org) → 機能別 hook fires, i.e. the reader classifies イ as functional and rejects it for 事業部制 — the right outcome; ウ (two bosses) / エ (disbanding cross-department team) fire neither hook and are identified by the matrix / project definitions.
  - q015 (カンパニー制, correct ア; wrong イ 機能別): the 機能別 hook does not fit an organization with independent business areas → no lean toward イ.
- p10–p12 (事業部制 `points[1]`, qids q021 / q030): 「その事業を進める仕事の機能ごとの部門が置かれる」 drops ひとそろい / 一整套 / "a full set", so the 考点 no longer demands a complete set under each business — now true of q021 (corporate 総務・人事 / 経理・財務 sit at HQ). Second sentence (同じ機能でも事業が違えば別の部門) unchanged. Restriction loosened only to what the cited chart shows; nothing that would admit the matrix (two bosses) or the project team (disbanding) is added.
- zh / en: zh hook uses 职能制 (= zh term of 機能別組織 per zh_terms; q021 sidecar's wrong イ is 职能型组织, a different string); en "functional organization" = term. No zh / en rewrite moves toward a wrong choice (per-choice LCS §1). **M1 resolved; L1 / L3 resolved.**

### 3.2 u07 p01–p03 (L1) — インセンティブ point vs 2012h24h-q044

- After: 「…報酬や表彰などの誘因を示して、組織が求める行動へ人の意欲を向けさせる仕組みである。」 / zh 「…通过提示报酬、表彰等诱因，把人的干劲引向组织所要求的行为的机制。」 / en "…offers inducements such as rewards or awards to steer people's willingness toward the behavior the organization wants." (= auditor's text verbatim, 3/3).
- The near-paraphrase of the q044 stem's definition clause (Rule A L1: ed 0.20 / Dice 0.74) is broken: jp LCS with the stem 7 → 4, en 30 → 19, zh 5 → 5 (行为的机制, generic). jp 12-char windows 0 / 0.
- Meaning: still the standard definition of incentive (inducement → steers behaviour), consistent with detail (報酬などで意欲を引き出すために用意する仕組み = インセンティブ) and the 外発的動機づけ examples (給与・昇進・表彰; 表彰 is therefore not new to the term). q044 is still answered by ア; the new wording does not echo コンピテンシ (traits of high performers), コンプライアンス (rule / law observance — 組織が求める行動 is reached by an inducement, not by obligation) or コンフリクト. zh 干劲 = one_zh's own word for 意欲; 激励机制 head kept.

### 3.3 u09 p01–p04 (L1・L2) — CEO hook without "execute", CxO zh analogy

- p01–p03: the etymology clause (execute = 実行する / 执行 / "carry out") is deleted in all three languages; the hook is now 「英語では企業の経営幹部を executive と呼ぶ。その Chief (長) が CEO である。」 (2 sentences, as before). The image "実行 = CEO" that collided with COO 最高**執行**責任者 (the CEO mix 考点 gives 執行 to the COO) is gone; the hook still gives the word clue (executive's chief) and agrees with one (最終責任) and `points[0]`. zh 首席执行官 in one_zh remains the standard term name (Rule A: not an independent problem). 2014h26h-q008 / 2010h22a-q017 (CIO; CEO / COO wrong): the patch reduces the CEO overlap 1 → 0; no lean.
- p04: zh 社团的“社长” → 兴趣小组的“组长” (×4 / 小组 ×5, all in this analogy_zh; grep finds no other 组长 / 小组 in the unit). The collision with `terms[1].detail_zh` 社长 (= the company 社長 who may also be CEO) is gone; 组长 is a generic group-leader word that names no company post, so the analogy again says "a common title for the head of each group" (= CxO 总称) as jp 部長 / en captain do. Not 队长 (CEO's analogy), as the auditor required. 2017h29a-q023 (CFO = 財務): unaffected.

### 3.4 u10 p01–p03 (L1) and p07–p12 (L3)

- p01–p03: 社会 / 社会 / society → 産業 / 产业 / industry. The analogy no longer counts "waves that reshaped society" (the Society 1.0 → 5.0 counting that `terms[1].points[0]` and `pairs[0].rows[1]` distinguish); it now counts industrial revolutions, which is what the term counts. The driver (ネット・データ・AI) is unchanged and is exactly what separates 2023r05-q035's correct ア (internet / AI) from the wrong choices (electronics robots / conveyor belts / steam). 産業 is not 製造業: `points[0]` (影響は製造業に限らず社会全体に及ぶ) still stands next to it and does not conflict. en "industry" shares a generic word with q035's wrong choices (obs. 2) — not their frame.
- p07–p09: 対比表「変革の原動力」 GX cell 「脱炭素とクリーンエネルギー」 → 「クリーンエネルギー」 (zh 清洁能源 / en "Clean energy"). 脱炭素 (a goal) no longer duplicates the next row 主なねらい (温室効果ガスの削減と経済成長の両立); the cell = GX one's own term (**クリーンエネルギー** 中心へ転換).
- p10–p12: analogy 「変革の原動力をデジタルから環境に」 → 「…クリーンエネルギーに」 (zh 清洁能源 / en "clean energy") — now the same name as the pairs cell and one. GX has no cited / quiz question, so no wrong-choice reading to drift toward; the shared エネルギー / energy with q035 エ (steam energy) is the generic word (obs. 1).

### 3.5 Deviations from the prescriptions

- **u06 p05 (bold markers).** The auditor's L2 text shows 「…经验、**适应性**等 **人才信息**」 with bold around 适应性, but the base `one_zh` has no bold there (base: 每位员工的技能、经验、适应性等 **人才信息**). The patch was registered against the real text without bold (before 「每位员工的技能、经验、适应性等」 → after 「…资质等」); bold count 2 → 2 (only 人才管理 / 人才信息). Registering the auditor's bold would either fail to match or add an unwarranted bold on a non-term word. Correct handling; the meaning fix is exactly the prescribed one. **Acceptable.**
- **u08 L4 (challenge_questions[2] 2016h28h-q034 → 2012h24a-q021) not applied.** B3 patches are 1-field string replacements and do not change qids. Is u08 still correct without it? Yes: q034 (correct = network organization, not a unit term) is a v1-inherited challenge item that the text cannot fully answer (it only rules out wrong エ マトリックス) but does not contradict — Rule A rated it LOW. The question the swap would have added, 2012h24a-q021, is already in `terms[3].quiz` and `inline_quiz`, so the M1-fixed hooks are exercised in the unit. No fact, 考点 or hook depends on the swap. **Acceptable as an open LOW** (carry to a later qid-level pass; obs. 4).
- **u10 L4 (DX 推進ガイドライン 2018 edition note) not applied.** The auditor's own ruling: the sentence names no count, the list is open (〜や / 〜まで), it is a subset of the definition, and the definition wording carried over from the 2018 guideline into the Digital Governance Code 2.0 / 3.0 (secondary-source check) — "版なしの言い切り (MEDIUM) には当たらない", LOW, with a condition that the patch be checked against the primary source. Applying it without that check would itself add an unverified edition / year claim; leaving it keeps a claim that is true today in every edition. Under D-205 this is LOW (no version-bound number or structure claim, no cited question on the METI wording — 2026r08-q006's correct エ is the generic Stolterman-side description). **Acceptable as an open LOW** pending a primary-source check (obs. 3).

### 3.6 Other requested checks

- Dropped qualifiers / new restrictions: none. u08 p10–p12 loosen an over-strong 考点 to the cited chart; u06 p06, u08 p13 soften to the jp tendency; u09 p01–p03 remove an image only; u10 p07–p09 remove a goal from a driver cell.
- D-204: u08 hooks now agree with `points[0]` / `points[1]` / t02 / matrix table; u08 analogy no longer shows separate businesses with no common owner; u10 analogies agree with the 考点 / pairs naming.
- D-205: no patch adds a version-bound claim (u10 L4 deliberately not applied, §3.5).
- D-200 / D-195: validate 0 issues in all 5 units; sentence counts unchanged in every patched field (u09 hook_jp 2 → 2).
- b18 u05 M1 type: 0 — zh / en after-spans reproduce no wrong choice's wording (longest wrong-choice overlaps: " their own s" / " departments" 12 vs q030 イ / エ, " industr" 8 vs q035 イ / ウ / エ, エネルギー 5 vs q035 エ — all generic words). u06 p05 资质 no longer resembles 2022r04-q004's correct 自适应学习 (not a cited question; Rule A note).

## 4. Observations

No F-fix (no 建議修) from this re-review.

Records only, no fix:

1. LOW, u10 p07 / p10: jp after-span クリーンエネルギー shares エネルギー (5) with 2023r05-q035 wrong エ (steam energy for 1st IR); for the 9-char pairs cell this lifts wDice 0.33 → 0.50, with 0 / 0 windows (masked: katakana run excluded). The cell is the GX one's own term; q035 is a 第4次産業革命 question with no GX option — no drift.
2. LOW, u10 p03: en "industry" (8) shared with q035 wrong イ / ウ / エ and 2022r04-q018 イ — the generic word of the term's own name (Industrial Revolution); the distinguisher in q035 (internet / AI) stays in the analogy, and `points[0]` keeps "not just manufacturing".
3. LOW, open: u10 L4 (DX 推進ガイドライン edition) not applied — needs a primary-source (METI DX 推進ガイドライン Ver.1.0) check before any edition / year is written; acceptable meanwhile (§3.5).
4. LOW, open: u08 L4 (challenge_questions[2] 2016h28h-q034 is not answerable from the unit) not applied — B3 cannot change qids; v1-inherited, not contradicted; q021 already in the 事業部制 quiz (§3.5).
5. LOW, u08 p06: en "each with their own sales and manufacturing departments" is slightly closed vs jp 営業や製造の部署 (open list); the hook is a 目印, and `points[1]` (function departments, open) still covers cases such as q030 ア (purchasing). Auditor's prescribed text.
6. LOW, pre-existing: u10 `terms[2].detail_jp` 「第5期科学技術基本計画では、Society5.0 で実現する社会の姿としてこの言葉が使われている」 still frames Society5.0 as the means; the patched one ("same society, named from its content") and `points[0]` are compatible with it (Rule A L2: both usages exist in the source).
7. LOW, u07 p04: 激励 for モチベーション remains in the v1 `unit_summary_zh` (学习领导力、激励、…) — outside B3 scope (Rule A O1).
8. LOW, u06: the unit's remaining en "pay" (`terms[6].detail_en` + `explanation_en`, リテンション) translates 報酬 and is correct; kept per the prescription.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: in-scope **1 resolved** (u08 M1 by p01–p03); **0 introduced**
- LOW introduced: 建議修 0; 記録のみ 8 (obs. 1–8; obs. 3–4 are the two not-applied prescriptions, obs. 6–8 pre-existing)
- Application 45/45 exact (replay), 45/45 = the Rule A prescribed text (u06 p05 registered without the auditor's stray bold, judged correct), derived fields follow (339 checked, 0 mismatch), 0 unexplained base → unit diffs
- D-198: 0 jp windows before / after in all 10 jp patches; u07 p01–p03 break the q044 definition-clause paraphrase (jp stem LCS 7 → 4, en 30 → 19); zh after-spans ≤5 chars (term or generic); en after-spans ≤24 chars, all term names or generic phrases, none from a wrong choice's frame
- validate 5/5 = 0 issues, parity 5/5 = 0 diff (35 / 25 / 35 / 18 / 34 locations), vitest textbook 162/162

**PASS** — all 45 active patches of strategy-01-01 u06–u10 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. The MEDIUM is resolved: the 機能別組織 hook now requires each function department to appear once with no business grouping, so on the cited charts it fires for 2016h28a-q025 (correct 職能別) and no longer for 2012h24a-q021 (where it used to point to wrong イ), while the reworded 事業部制 hook (repeated departments per division) fires for q021, the t02 figure and 2026r08-q030 ア but not for the matrix table or q030 ウ / エ; the 事業部制 考点 no longer demands a full set of functions. The インセンティブ point no longer paraphrases the q044 stem, the CEO hook drops the execute image that belonged to the COO, the CxO zh analogy no longer uses 社长, and the u10 analogies / pairs cell name industry and clean energy consistently with the 考点. The two not-applied prescriptions (u08 qid swap, u10 edition note) are LOW and leave the units correct. No new HIGH / MEDIUM.
