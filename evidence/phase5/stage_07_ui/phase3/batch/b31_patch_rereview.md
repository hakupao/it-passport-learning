# b31 B3 patch re-review — strategy-03-10 u06–u07 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 148)
- Scope: B3 wording patches for strategy-03-10-u06 (p01–p06) and u07 (p01–p02)
  — **8 `active`, 0 retired** (`patches/strategy-03-10-u0{6,7}.json`), checked against the Rule A prescriptions
  (`strategy-03-10-u06.ruleA.md` L1・L2 建議修; `-u07` L5 建议修 — every 建議修 of the 2 files (MEDIUM 0 in both), none left unapplied; u06 6 = 3 + 3, u07 2)
  and the merged units `data/ip/textbook/units/strategy-03-10-u0{6,7}.json` (sha256 u06 `9557b9b9da93b9ca…`, u07 `b9cac816aa94d831…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; both match):
  u06 `b31-u06-a2/…loc.r0.json` (`03f1b3d3…`), u07 `b31-u07-a1/…loc.r1.json` (`74041a55…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211 and the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (`docs/templates/ruleA_unit_audit.md`).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars).

## 0. Method

Same as `b30_patch_rereview.md` §0 (= b26–b29 §0), topic strategy-03-10 = 43 questions (2026r08-q023, the listing-ads question Rule A u06 cross-checked, is itself in this topic; no extra out-of-topic qids needed — the only out-of-topic SEO hits are distractor names, step 4) = 215 source strings per language.

1. Application check (`b31rr/check.mjs`): every string field of base and merged unit is walked; each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere in the unit (derived copies included); every base-present path that differs must be explained by a patch; patches replayed in file order on the base must reproduce the unit's field exactly. Each patch's `before` / `after` searched verbatim in its unit's Rule A file.
2. Derived-field check (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point; `summary.memory_hooks_*` suffix check.
3. D-198 (jp patches: u06 p01, p04): LCS, 12-char window ≤2 substitutions with / without masking, wDice, vs stem + all choices of the pool. zh / en: LCS vs the zh / en sidecars, whole field before → after and the `after` span. Per-choice + stem LCS (before → after) vs the patched term's cited / quiz qids (`b31rr/focus2b.mjs`, auto-collected from `points[].qids` + `quiz`; u06 p01–p03 additionally 2022r04-q034 explicitly).
4. Bank-wide grep for A/B テスト and SEO in `choices_jp` / stems: A/B — **2022r04-q034 is the only A/B testing question in all 2900** (the other regex hit, 2016h28h-q018, is a production-planning calculation with column labels A / B, irrelevant); SEO — in-topic 2015h27h-q019, 2017h29h-q011, 2018h30a-q003, 2019r01a-q029, out-of-topic 2018h30a-q071 / 2024r06-q087 (SEO as a distractor name only).
5. Manual reading of each patched field in context: u06 `terms[1]` (A/Bテスト) whole term (one / detail / analogy / hook / points / fig 4 nodes + 4 captions / quiz), `pairs[0]` (A/B vs レコメンデーション, 3 rows), `goals[1]`, `key_points[1]`; u06 `terms[0]` (SEO) one / detail / fig nodes + captions, key_points[0]; u07 `terms[0]` / `terms[1]` detail_zh vs detail_jp / detail_en, `explanation_zh`, and every zh string for remaining 「…」-quoted Japanese alias. Meaning judged against q034's `correct_answer` and sidecars and types (8)(9)(10).
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `--part` for both bases; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b31rr/check.mjs` (pre-adapted), `b31rr/d198b.mjs` (copy of `b30rr/d198b.mjs`, only extra qids / unit-part list changed), `b31rr/focus2b.mjs` (copy of `b30rr/focus2b.mjs`, only extra qids / unit list changed), `b24rr/q.cjs` (question reader, unchanged).

Not established: as in b14–b30, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u06 90, u07 71) were checked for the derived copies (step 2) and for `before` remnants (step 1). No law / standard is touched (D-205 版 / D-210 not applicable).

## 1. Script results (fresh, 2026-11-06)

```
✓ strategy-03-10-u06 unit: 0 issues   validate EXIT=0 | ✓ parity: 25 locations, 0 diff
✓ strategy-03-10-u07 unit: 0 issues   validate EXIT=0 | ✓ parity: 20 locations, 0 diff
validate --part (bases): ✓ u06 loc#0 / u07 loc#1: 0 issues (sha256 = base_sha256 ×2)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 8/8 `before` occur exactly once in the base field; 8/8 `after` present; replay in file order reproduces every patched field exactly (2/2 units). Changed base-present paths u06 6, u07 2 = exactly the patched fields (one patch per field) + the `stage` meta key removed (as in b19–b30; `round` / `jp_round` are non-string part meta). Unexplained diffs 0. `before` remnants anywhere in the units (raw or stripped): **0** (u06: 持ち帰 / 店先 / 店门口 / "alternating" / "shop entrance" 0 hits; u07: zh strings with 「上澄み / 「市場浸透 0 — the 7 remaining hits are jp fields `detail_jp` / `hook_jp` / derived, where 「」 is the normal jp quotation).

`check.mjs` "ruleA verbatim miss": [] for u06 and u07 — 8/8 `before` / `after` = the Rule A prescribed text verbatim.

Derived fields: u06 48, u07 39 = 87 derived strings, 0 mismatch (u07 `explanation_zh` ×2 = stripped `detail_zh`: true ×2; `[[jp:]]` count 0 → 1 in both u07 fields, the intended change). `summary.memory_hooks_*` suffix check u06 12 / u07 9, **0 bad** (no hook patched this batch).

Notation counts: bold 0 → 0 in 8/8; `[[jp:]]` 0 → 0 in u06 ×6, 0 → 1 in u07 ×2 (the patch's purpose); parity 0 diff.

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u06 p01 | **jp** | 2022r04-q034 stem | 5 → 5 (デザインの, unchanged) | デザインの (5) | 0 / 0 → 0 / 0; 0.11 → 0.14 |
| u06 p02 | zh | 2015h27h-q019 ア → 2021r03-q016 エ | 2 → 3 | 在同一 (3, generic) | — |
| u06 p03 | en | 2009h21a-q022 stem → 2011h23a-q008 stem | 11 → 10 | " into the " (10, generic) | — |
| u06 p04 | **jp** | 2011h23tokubetsu-q029 イ | 6 → 5 | したページ (5) | 0 / 0 → 0 / 0; 0.42 → 0.27 |
| u06 p05 | zh | 2011h23tokubetsu-q029 イ | 3 → 3 (unchanged) | 的页面 (3) | — |
| u06 p06 | en | 2018h30a-q003 stem | 9 → 10 | " rank high" (10; stem wording of the SEO definition question, generic) | — |
| u07 p01 | zh | 2011h23a-q008 イ | 3 → 3 (unchanged) | 策略 (2) | — |
| u07 p02 | zh | 2019h31h-q005 stem | 5 → 5 (略市场渗透 = term name, unchanged) | same (5) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52); masked 12-char windows 0 → 0 in both jp patches, wDice falls for p04 (0.42 → 0.27). Longest after-span overlap jp ≤5, zh ≤5 (term name), en ≤10 (generic).

Per-choice check (LCS before → after vs each choice; `focus2b.mjs`):
- **2022r04-q034** (A/B, correct ア) × u06 p01–p03: every choice flat (jp 0 → 0 / ≤1, zh 0 → 0, en ≤4 "ting" for ア and エ alike = suffix of "testing"); stem jp 5 → 5 (デザインの, unchanged), zh 2 → 2, en 10 → 10 (unchanged). No choice frame traced, no rise.
- SEO cited / quiz / challenge qids (2015h27h-q019, 2017h29h-q011, 2018h30a-q003, 2019r01a-q029) × u06 p04–p06: jp / zh flat (≤3, before = after); en ≤6 per choice (generic " to " / " high"), stem 2018h30a-q003 9 → 10 (" rank high", the general definition wording). Wrong choices: no rise beyond generic connectives.
- u07 has no cited qid (Rule A u07: no question in the bank asks these headwords); pool max 5 = term name.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u06 | p01–p03 | `terms[1](A/Bテスト).analogy_*` | L1 建議修 (D-204 措辞級) | **Yes** (§3.1): same period + per-person alternating hand-out = detail / fig step 2 parallel split; outcome = shop visits (a conversion), = one 成果 / fig step 3 / points[0] | LOW only (obs. 1–2) | OK |
| u06 | p04–p06 | `terms[0](SEO).fig.data.nodes[2].label.*` | L2 建議修 (観点 7 措辞級) | Yes: 並びやすい / 更易 / "tends to" = step 3 caption 並びやすくなる / 更容易 / "more likely"; one 「上位に並ぶよう工夫する」 (purpose form) consistent | No | OK |
| u07 | p01–p02 | `terms[0](スキミング).detail_zh`, `terms[1](ペネトレーション).detail_zh` (+ explanation_zh) | L5 建议修 (表記統一) | Yes: zh alias now `[[jp:…]]` like en and the precedent units; derived explanation_zh is the stripped text; no 「」-quoted jp alias left in any zh field | No | OK |

## 3. Focused checks

### 3.1 u06 p01–p03 (L1) — A/B analogy "same-period alternating hand-out, count who comes into the shop"

- After (= Rule A L1 text verbatim, 3/3): jp 「同じ期間に、道行く人へデザインの違う 2 種類のチラシを 1 人 1 枚ずつ交互に配り、どちらのチラシを持って来店した人が多いかを数えて、次から多い方を刷るようなもの。」/ zh 在同一时期…轮流发给路人、每人一张，数一数拿着哪种传单来店的人更多 / en "handing out two flyer designs in turn, one per passerby, over the same period, counting which flyer brings more people into the shop".
- Field consistency, each A/B-bearing field read:
  - `detail` (無作為に振り分け、同じ期間に並行して試す; 案の違い以外の条件をそろえる): 同じ期間 / 同一时期 / "over the same period" now explicit; 1 人 1 枚ずつ交互 splits *people* (each passerby sees one version), not *time slots* — the sequential reading L1 named is gone. The old 店先に交互に置き (both piles at one spot, time-alternated) is removed in all 3 languages.
  - `fig` steps 2–4 (same period, random 2 groups, measure share clicking / buying, adopt higher share): image maps step 2 → hand-out, step 3 → count of flyer-holders coming in, step 4 → print the winner. Count vs share: with one-per-person alternating hand-out the two groups are equal size, so comparing counts = comparing shares (obs. 2).
  - `one` (出し分け, クリックや購入などの成果) / `points[0]` exam (並行して試し, 購入や会員登録などの成果の数値): 来店 is a conversion-type outcome, closer to 成果 than the old "taken more" (which was nearer to mere interest / click). No narrowing: the analogy is one example.
  - `pairs[0]` (A/B = 無作為に分けた組 vs レコメンデーション = その人の閲覧・購入の記録): the hand-out assigns by turn, not by the passerby's history → stays on the A/B side; nothing leans toward recommendation (type 8: no other headword's role; flyers are not digital signage's 掲示物, the u06 signage contrast is screen vs paper poster, not touched).
  - `goals[1]`, `key_points[1]` (無作為に分けた利用者の反応を数値で比べ): consistent.
  - `hook` (A 案・B 案 name origin): unaffected.
- Type (9), every A/B question in the bank (= only **2022r04-q034**, correct ア; the scenario: new vs old site design run in parallel, compare which leads more users to a paid sign-up): the analogy now has both elements of the scenario's general form (two designs in parallel over the same period; outcome = an action after exposure), so it points to ア; it offers nothing toward the distractors (ABC 分析 = ranking by share of value, cluster analysis = grouping by similarity, regression test = re-testing after change). Per-choice LCS flat (§1), stem overlap デザインの (5) unchanged from base → D-198 (iii) / D-208 (b): not traced; the elements are the headword's general definition already in detail / points[0] (D-211 (ii) side).
- Residual (obs. 1, LOW): 交互に (alternating) is systematic, not strictly random assignment as detail / fig say 無作為. At analogy level the alternating one-per-passerby hand-out gives two comparable groups in the same period, which is the point L1 asked for; the random wording stays in detail / fig / pairs / key_points, and no question asks random vs systematic assignment. Record only. **L1 resolved, no new MEDIUM.**

### 3.2 u06 p04–p06 (L2) — SEO figure node hedge

- After: jp 「対策したページは上位に並びやすい」/ zh 做过优化的页面更易排在前面 / en "Optimized page tends to rank high". Step 3 caption (unchanged) 「…整えたページほど、上位に並びやすくなる。」/ 更容易排到前面 / "more likely to rank near the top" — node and caption now carry the same strength in 3 languages. `one` 「上位に並ぶよう工夫する」, detail 「上位に並ぶほど」, key_points[0] 「順位を上げる取組み」 — no field claims a guaranteed rank. SEO questions (2015h27h-q019 / 2017h29h-q011 / 2018h30a-q003 / 2019r01a-q029, all definition / naming questions) are not affected by the hedge; wrong choices get no support. en node length 32 chars, still a short label like siblings. **L2 resolved.**

### 3.3 u07 p01–p02 (L5) — zh alias notation

- `terms[0].detail_zh` / `terms[1].detail_zh` now open with 在日语中也叫[[jp:上澄み吸収価格戦略]]（撇取上层定价策略）/ [[jp:市場浸透価格戦略]]（市场渗透定价策略）; en already used `[[jp:…]]`, jp keeps 「」 (native quotation). The `[[jp:]]` originals exist in the jp text (detail_jp), as Rule A required; `explanation_zh` = stripped text (alias without 「」), no derived mismatch; validate 0 (no `[[jp:]]` rule issue), parity 0 diff. Meaning unchanged; no question involved. **L5 resolved.**

## 4. Observations

No F-fix from this re-review (all 8 patches are the auditors' prescribed texts, applied exactly, and correct in context).

Records only, no fix:

1. LOW, u06 p01–p03 (analogy): 交互に配り / 轮流 / "in turn" is alternating (systematic) assignment, while detail / fig / pairs / key_points say 無作為; analogy-level simplification, same-period two-group split preserved, no question distinguishes random vs systematic assignment.
2. LOW, u06 p01–p03 (analogy): the analogy compares counts of shop visitors, fig step 3 compares shares; equal-size groups from the one-per-person hand-out make the two equivalent; no contradiction.
3. LOW, D-198 notes: u06 p01 デザインの (5) vs 2022r04-q034 stem, unchanged from base; u06 p06 " rank high" (10) vs 2018h30a-q003 stem = general SEO wording; u07 p02 略市场渗透 (5) = term name, unchanged.
4. Script note (no content issue): the 7 remaining 「上澄み / 「市場浸透 hits in u07 are jp fields (`detail_jp`, `hook_jp`, derived jp, `summary.memory_hooks_jp[0]`), where 「」 is correct.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (Rule A u06 / u07 MEDIUM 0); **0 introduced**
- LOW introduced: 建議修 0; 記録のみ obs. 1–2 (analogy-level simplifications of a prescribed text); D-198 / script notes obs. 3–4
- Application 8/8 exact (replay), 8/8 = the Rule A prescribed text verbatim, every 建議修 of the 2 Rule A files covered (u06 L1 3 + L2 3, u07 L5 2), derived fields follow (87 checked, memory_hooks 21 suffix-checked, 0 mismatch), 0 unexplained base → unit diffs, 0 `before` remnants
- D-198: masked 12-char windows 0 → 0 in 2 of 2 jp patches; after-span overlaps jp ≤5 / zh ≤5 / en ≤10, all unchanged words, term names or generic wording; per-choice flat for 2022r04-q034 and the 4 SEO questions
- validate 2/2 = 0 issues, parity 2/2 = 0 diff (25 / 20 locations), validate --part bases 2/2 = 0 issues, vitest textbook 162/162

**PASS** — all 8 active patches of strategy-03-10 u06–u07 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. u06 L1: the A/B analogy now splits passers-by within the same period and counts shop visits per flyer, matching detail / fig (same period, two groups, measured outcome) / points[0] / pairs[0] (assignment not by personal record) and pointing 2022r04-q034 (the bank's only A/B question) to ア without tracing any option. u06 L2 brings the SEO node to the caption's "likely" strength; u07 L5 unifies the zh alias notation to `[[jp:]]`. No new HIGH / MEDIUM.
