# b29 B3 patch re-review — technology-16-44 u01–u04 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 148)
- Scope: B3 wording patches for technology-16-44-u01 (p01–p08), u02 (p01), u03 (p01–p18) and u04 (p01–p07)
  — **34 `active`, 0 retired** (`patches/technology-16-44-u0{1,2,3,4}.json`), checked against the Rule A prescriptions
  (`technology-16-44-u01.ruleA.md` L1・L2・L3・L6 建議修; `-u02` L1 建議修; `-u03` **M1** (12 fields) + optional same-direction hook proposal (3 fields) + L1 建議修; `-u04` **M1** + L1・L4 建議修 — every MEDIUM and 建議修 of the 4 files, none left unapplied; u01 8 = 3 + 1 + 3 + 1, u02 1, u03 18 = 12 + 3 + 3, u04 7 = 3 + 1 + 3)
  and the merged units `data/ip/textbook/units/technology-16-44-u0{1,2,3,4}.json` (sha256 u01 `b227c5d940850f51…`, u02 `4ee1f209ad6c1cab…`, u03 `2eb56aeec1f5a388…`, u04 `89a0200d09c2a62a…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u01 `b29-u01-a1/…loc.r0.json` (`385302cc…`), u02 `b29-u02-a2/…loc.r0.json` (`156efaeb…`, B5 loc-only run on a1 jp.r1), u03 `b29-u03-a1/…loc.r1.json` (`76b7bdef…`), u04 `b29-u04-a1/…loc.r1.json` (`c3b5dea8…`).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211 and the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (`docs/templates/ruleA_unit_audit.md`). u03 p13–p15 (`terms[0](デュアルシステム).hook_*`) apply the Rule A file's *optional* same-direction proposal on purpose (consistency with M1) and are judged on content.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b27_patch_rereview.md` §0 (= b26 / b25 / b24 §0), topic technology-16-44 (46 questions) **plus 2017h29a-q087, 2016h28h-q075, 2009h21h-q073 (technology-16-43, the dual / duplex / cluster questions outside the topic)** = 49 questions, 245 source strings per language:

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere in the unit (derived copies included); every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly. Additionally each patch's `before` / `after` (bold stripped) was found verbatim in its unit's Rule A file (34/34).
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point of the 4 units; `summary.memory_hooks_*` by suffix match (index-matched and order-matched over hooked terms).
3. D-198 (jp patches: u01 p01, p05; u03 p01, p04, p07, p10, p13, p16; u04 p01, p05): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of the 49 questions. zh / en patches: LCS against the zh / en translation sidecars of the same 49 questions, whole patched field before → after and the `after` span alone. Plus a per-choice + stem LCS (before → after) against the focus questions (cited / quiz / challenge qids of the patched term, plus the M1 trigger questions): u01 p04 × 2009h21a-q061, 2010h22a-q086; p01–p03, p08 × 2020r02o-q063; p05–p07 × 2011h23tokubetsu-q066, 2017h29h-q077, 2026r08-q062, 2012h24a-q075; u02 p01 × 2009h21h-q061, 2014h26h-q069, 2010h22h-q057; **u03 p01–p15 × every dual / duplex / standby question of 16-44 and 16-43** (2017h29a-q087, 2016h28h-q075, 2015h27a-q082, 2009h21a-q086, 2012h24a-q057, 2014h26h-q056, 2009h21h-q073); p16–p18 × 2015h27h-q064, 2019h31h-q090, 2009h21h-q033, 2013h25a-q047, 2016h28a-q067; u04 p01–p03, p05–p07 × 2019r01a-q096, 2021r03-q100, 2015h27a-q053, 2010h22h-q084, 2016h28h-q022; p04 × 2016h28h-q022, 2015h27a-q053, 2019r01a-q096.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison.
5. Manual reading of each patched field in context (whole term: one / detail / analogy / hook / points / fig; overview rows; goals; pairs; key_points); meaning judged against the cited / quiz / challenge questions' `correct_answer` and their zh / en sidecars and the S147 types (8)(9)(10). For u03 M1 the new axis was applied to all 17 questions of the bank that name デュアル / デュプレックス / ホット・コールドスタンバイ / 待機系 (10 of them are デュアルコア CPU or other-topic distractor mentions, checked by grep context; the 7 relevant ones are listed in step 3).
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b29rr/check.mjs` (pre-adapted), `b29rr/d198b.mjs`, `b29rr/focus2b.mjs` (new copies adapted from `b29rr/d198.mjs` / `focus2.mjs` = the b27 scripts; only unit IDs / part paths / topic / extra 16-43 qids / focus lists changed), `b24rr/q.cjs` (question reader, unchanged).

Not established: as in b14–b27, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 74, u02 120, u03 129, u04 90) were checked for the derived copies (step 2) and for `before` remnants (step 1). No law / standard is touched (D-205 / D-210 not applicable).

## 1. Script results (fresh, 2026-11-06)

```
✓ technology-16-44-u01 unit: 0 issues, 1 warning(s)  validate EXIT=0 | ✓ parity: 20 locations, 0 diff  EXIT=0
    warn  zh-term  terms[1](応答時間).hook_zh  応答時間 → 应答时间 not in the zh text   (introduced by p02; obs. 1)
✓ technology-16-44-u02 unit: 0 issues   validate EXIT=0 | ✓ parity: 23 locations, 0 diff  EXIT=0
✓ technology-16-44-u03 unit: 0 issues   validate EXIT=0 | ✓ parity: 35 locations, 0 diff  EXIT=0
✓ technology-16-44-u04 unit: 0 issues   validate EXIT=0 | ✓ parity: 17 locations, 0 diff  EXIT=0
validate --part (bases): ✓ u01 loc#0 / u02 loc#0 / u03 loc#1 / u04 loc#1: 0 issues (sha256 = base_sha256 ×4)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 34/34 `before` occur exactly once in the base field; 34/34 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (4/4 units). Unexplained base → unit diffs in base-present paths: 0 per unit (changed paths u01 8, u02 1, u03 18, u04 7 = exactly the patched fields, one patch per field; only the `stage` meta key removed, as in b19–b27; `round` / `jp_round` are non-string meta keys of the part). `check.mjs` "ruleA verbatim miss": [] for all 4 units.

`before` remnants reported by `check.mjs`:
- u01 p05–p07 and u03 p07–p09, p16–p18 (at `detail_*` and their `explanation_*` copies): false positives of the substring test — these patches only append a sentence, so `before` is a prefix of `after` (as b27 u04 p09–p11). Each such `before` occurs only inside its own `after` (+ its stripped derived copy).
- **u03 p11 / p12 at `overview_rows[1].one_line_zh / _en`**: real occurrences, but not a patch defect — the strings 只有主系统处理 / "Only the primary system processes" also stand in the *unpatched* sibling field `overview_rows[1](デュプレックスシステム).one_line_*` (jp 主系だけが処理し、待機系が控える構成), which the u03 Rule A M1 note explicitly keeps (「one_jp・overview_rows[1]・goals[0] は…据え置き可」). Judged on content in §3.1 / obs. 2: no type (9) effect. In the patched field `pairs[0].rows[0].b_*` the old strings are gone (count 0 for 主系だけが処理する).
- Old M1 strings elsewhere in u03: 0 hits for 平常時に 2 系統とも処理するか / 不做处理 / "does no work" / いつも働いている / 一直都在工作 / "always at work".

Derived fields follow: u01 p01–p03 → `terms[1].memory_hook_*` (true ×3), p05–p08 → `explanation_*` (true ×4); u03 p07–p09 / p16–p18 → `explanation_*` (true ×6), p13–p15 → `terms[0].memory_hook_*` (true ×3); u04 p01–p03 → `terms[1].definition_*` (true ×3), p04 → `terms[2].explanation_zh` (true). Full walk: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u01 36, u02 48, u03 66, u04 39 checked (189), 0 mismatches.

`summary.memory_hooks_*` suffix check: index-matched, the script reports `bad` u01 jp/zh/en[1] and u03 jp/zh/en[2], [4] — the same script artifact as b27 u02: u01 `terms[0]`(レスポンスタイム) and u03 `terms[1]`(デュプレックス) / `terms[3]`(コールド) have no `hook_*`, so the summary array has one entry per hooked term only and index matching is shifted. Order-matched over hooked terms: u01 2 / u02 4 / u03 5 / u04 3 terms × 3 languages = 42 entries, 0 bad (incl. the patched u01 応答時間 hook and u03 デュアル hook). No derived-copy defect.

Notation counts (bold, `[[jp:]]`), before → after, every patched field: bold unchanged in 34 of 34; `[[jp:]]` unchanged except the intended +1 in u01 p06 / p07 (`[[jp:ベンチマークテスト]]`) and u03 p17 / p18 (`[[jp:フォールトトレランス]]`) — the jp original exists in the jp field (u01 p05 / u03 p16); parity 0 diff.

D-198, before → after (`d198b.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | **jp** | 2009h21a-q061 エ | 5 → 5 (レスポンス, term) | 応答時間 (4, headword) | 0 / 0 → 0 / 0; 0.17 → 0.15 |
| u01 p02 | zh | 2009h21a-q086 イ | 2 → 2 | 2 | — |
| u01 p03 | en | 2010h22h-q057 stem → 2009h21a-q086 イ | 13 → 10 | "response" (8, word) | — |
| u01 p04 | zh | 2014h26h-q041 イ | 5 → 5 (unchanged) | 为止的 (3) | — |
| u01 p05 | **jp** | → 2010h22a-q086 イ | 6 → 9 | ベンチマークテスト (9, the alias L3 asked for) | 0 / 0 → 0 / 0; 0.22 → 0.20 |
| u01 p06 | zh | 2012h24a-q057 エ | 5 → 5 (unchanged) | 该系统的 (4) | — |
| u01 p07 | en | → 2011h23tokubetsu-q066 stem | 15 → 17 | " a benchmark test" (17, alias) | — |
| u01 p08 | en | 2010h22a-q086 stem → 2017h29h-q077 ア | 12 → 12 | " the inter" (10) | — |
| u02 p01 | zh | 2009h21h-q070 stem | 5 → 5 | 修复时间 (4, unchanged) | — |
| u03 p01 | **jp** | 2009h21h-q073 ウ | 11 → 11 (デュプレックスシステム, term) | 結果を照合する (7; 2016h28h-q075 ア correct) | 11 / 0 → 11 / 0 (term names); 0.35 → 0.29 |
| u03 p02 | zh | → 2014h26h-q056 イ | 4 → 7 | 执行相同处理并 (7) | — |
| u03 p03 | en | → 2012h24a-q057 エ (correct) | 21 → 25 | " the same processing and " (25) | — |
| u03 p04 | **jp** | 2015h27h-q064 ウ | 3 → 4 | の処理を (4) | 0 / 0 → 0 / 0; 0.27 → 0.26 |
| u03 p05 | zh | — | 3 → 3 | 的处理 (3) | — |
| u03 p06 | en | 2012h24a-q057 ア | 20 → 20 ("in normal operation ", unchanged) | same (20) | — |
| u03 p07 | **jp** | 2013h25h-q083 ア | 5 → 5 (unchanged) | したときに (5) | 0 / 0 → 0 / 0; 0.18 → 0.17 |
| u03 p08 | zh | 2015h27a-q082 stem | 7 → 7 (unchanged) | 7 | — |
| u03 p09 | en | 2016h28h-q075 ウ | 23 → 23 (" to the standby system ", unchanged) | " the standby system " (20) | — |
| u03 p10 | **jp** | 2015h27h-q064 ウ | 3 → 4 | の処理を (4) | 0 / 0 → 0 / 0; 0.25 → 0.27 (short cell) |
| u03 p11 | zh | 2026r08-q062 エ | 3 → 5 | 执行该处理 (5) | — |
| u03 p12 | en | 2017h29a-q087 stem | 20 → 20 (" the primary system ", unchanged) | same (20) | — |
| u03 p13 | **jp** | 2012h24a-q057 エ (correct) | 4 → 5 | 同じ処理を (5) | 0 / 0 → 0 / 0; 0.14 → 0.16 |
| u03 p14 | zh | 2012h24a-q057 エ (correct) | 4 → 5 | 相同的处理 (5) | — |
| u03 p15 | en | 2014h26h-q056 イ | 10 → 23 | "ing the same processing" (23) | — |
| u03 p16 | **jp** | 2015h27h-q064 ウ (correct) | 5 → 11 | フォールトトレランスと (11 = headword's noun form, L1) | 0 / 0 → 4 / **0**; 0.17 → 0.23 |
| u03 p17 | zh | 2015h27h-q064 エ | 3 → 3 | 3 | — |
| u03 p18 | en | 2016h28h-q075 ウ | 21 → 21 (unchanged) | " fault tolerance" (16, term) | — |
| u04 p01 | **jp** | 2013h25h-q083 ウ (correct) | 11 → 11 (システムが稼働している, unchanged prefix) | same (11) | 4 / 7 → 4 / 7 (unchanged span); 0.37 → 0.31 |
| u04 p02 | zh | 2010h22h-q057 stem | 4 → 4 | 系统运行 (4) | — |
| u04 p03 | en | 2021r03-q100 ア | 15 → 15 ("operating cost ", term) | " and maintain" (13) | — |
| u04 p04 | zh | 2015h27a-q053 stem | 5 → 5 | 使用 (2) | — |
| u04 p05 | **jp** | 2021r03-q100 stem | 9 → 9 (unchanged) | 費用に比べて (6; q100 イ correct) | 0 / 0 → 0 / 0; 0.25 → 0.30 |
| u04 p06 | zh | 2021r03-q100 イ (correct) | 6 → 6 (unchanged) | 的费用 (3) | — |
| u04 p07 | en | 2016h28h-q022 stem → 2021r03-q100 ア | 14 → 17 | " relative to the " (17; equal in q100 ア and イ*) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52) as a sentence-frame copy; masked 12-char windows 0 → 0 in 9 of the 10 jp patches, and u04 p01's 7 masked windows are pre-existing and lie in the unchanged prefix (the inserted その運用や維持のために adds none; Rule A u04 validated the field). Unmasked windows in u03 p01 (11 → 11) and p16 (0 → 4) are katakana headword names only (masked 0). The u03 M1 after-spans (同じ処理 / 結果を照合 / "the same processing and compare") overlap the correct dual choices (q086 イ, q057 エ, q075 ア) and q056 イ (a dual description used as a distractor for hot standby): this is the standard definition stated as a general principle, ≤7 jp / ≤25 en chars, no choice frame copied (D-198 側 per D-211 (ii)); the added detail sentence 控えている間の待機系が、別の処理を受け持つこともある has LCS ≤4 with q087 stem and q075 ウ (の処理を / 故障した) — it does not trace their 待機しつつ…実行 / バッチ処理などを行いながら wording.

Per-choice check (LCS before → after vs each choice; `focus2b.mjs`):
- **2017h29a-q087** (correct ウ duplex): u03 p01–p15 0 → 0 jp, 2 → 2 zh, 7 → 7 en for every choice alike (choices are system names); stem jp 2–3 → 4 (の処理を / している, generic).
- **2016h28h-q075** (correct ア dual): p01–p03 / p13–p15 rise toward **ア (correct)** (jp 2 → 7, zh 2 → 6, en 10 → 25); toward ウ (the duplex distractor) jp ≤3, zh ≤2, en 17 ("e processing and ", generic) — less than ア in every language.
- 2009h21a-q086 (correct イ) / 2012h24a-q057 (correct エ): p01–p03 / p13–p15 rise toward the correct choice only (jp ≤5, zh ≤6, en ≤25); wrong choices ≤3 jp / ≤3 zh / ≤13 en (generic "processing").
- **2014h26h-q056** (hot standby, correct ウ): p01–p03 / p13–p15 rise toward イ (jp 2 → 5, zh → 7, en → 25) — イ is the dual description (2 machines, same processing, mutual check); the unit now names that description as *dual*, so it is pushed away from being chosen as hot standby (§3.1). ウ unchanged.
- 2015h27a-q082 / 2009h21h-q073: all choices equal before → after (system names / ordering letters).
- u03 p16–p18 vs 2015h27h-q064 / 2019h31h-q090: rise only on the term name フォールトトレランス / "fault tolerance" (q064 ウ correct; q090 ウ is a distractor whose content is FT — the alias itself, not a frame).
- u01 / u02: ≤3 jp / zh, ≤12 en (" the system ", unchanged) vs every choice; stems rise only on 応答時間 / ベンチマークテスト / "a benchmark test" (the names the L1 / L3 fixes add).
- u04 p01–p03 vs 2019r01a-q096 (choices are item numbers) 0 → 0; p05–p07 vs 2021r03-q100: jp イ (correct) 2 → 6 vs ア 2 → 4; en " relative to the " 17 equal in ア and イ (generic connective; direction is carried by "share paid continuously after it goes live grew relative to the share paid at introduction" = イ).

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[1](応答時間).hook_jp / _zh / _en` (+ memory_hook) | L1 建議修 | Yes: 応答 is now "the word used to render" response, not a coinage from it | LOW (obs. 1: zh-term warn) | OK |
| u01 | p04 | `terms[0](レスポンスタイム).analogy_zh` | L2 建議修 | Yes: 回出第一句话 → 说出第一句回应 | No | OK |
| u01 | p05–p07 | `terms[2](ベンチマーク).detail_*` (+ explanation) | L3 建議修 | Yes: the cited questions' name ベンチマークテスト / benchmark test now appears in 3 languages; detail 3 sentences (D-195) | No | OK |
| u01 | p08 | `terms[1].detail_en` (+ explanation_en) | L6 建議修 | Yes: "which way counts as better (shorter is better)" = jp 評価の向き; 2020r02o-q063 unaffected | No | OK |
| u02 | p01 | `terms[1](MTBF).points[0].text_zh` | L1 建議修 | Yes: 运行时间 (= 稼働時間 elsewhere in zh) → 总运用时间 (= `terms[3].one_zh` etc.); 只留下正常运行时间 kept, so 2014h26h-q069 still → イ | No | OK |
| u03 | p01–p12 | `terms[1](デュプレックス).points[0]・fig.steps[0].caption・detail`, `pairs[0].rows[0].b_*` | **M1** (MEDIUM, type 9) | **Yes** (§3.1) | LOW only (obs. 2, 3) | OK |
| u03 | p13–p15 | `terms[0](デュアル).hook_*` (+ memory_hook, summary) | optional same-direction proposal of M1 | Yes: いつも働いている → いつも同じ処理をしている; hook now carries the same axis as points[0] / pairs | No | OK |
| u03 | p16–p18 | `terms[4](フォールトトレラント).detail_*` (+ explanation) | L1 建議修 | Yes: noun form フォールトトレランス / fault tolerance shown (2015h27h-q064, 2019h31h-q090); detail 3 sentences | No | OK |
| u04 | p01–p03 | `terms[1](運用コスト).one_*` (+ definition) | **M1** (MEDIUM, types 9 / 10) | **Yes** (§3.2) | LOW only (obs. 4) | OK |
| u04 | p04 | `terms[2](TCO).detail_zh` (+ explanation_zh) | L1 建議修 | Yes: 被反超 → 反而更高 = jp 総額が逆転する / en "can end up costing more" | No | OK |
| u04 | p05–p07 | `terms[1].points[0].text_*` | L4 建議修 | Yes: 大きくなった / 超过了 / "grew larger than" → 比べて増した / 有所上升 / "grew relative to" = 2021r03-q100 イ (change of share, no level inversion); ア (reverse direction) not supported | No | OK |

## 3. Focused checks

### 3.1 u03 p01–p12 (M1) — dual vs duplex axis moved to "same processing + compare results"

- After: points[0] jp 「平常時に 2 系統とも**同じ処理をして結果を照合する**か、主系だけが**その処理**をするかで分かれる」/ zh 执行相同处理并核对结果 / 执行该处理 / en "both systems run the same processing and compare the results, or only the primary system runs it"; caption 「主系だけが**本来の処理**を受け持ち、待機系は**その処理**をせずに控えている」(zh 本来的处理 / 不执行这项处理, en "the main processing … does not run it"); detail + 「控えている間の待機系が、別の処理を受け持つこともある」(zh 也可能承担别的处理, en "may also be given other work"); pairs key row b 主系だけがその処理をする / 只有主系统执行该处理 / "Only the primary system runs it" (= M1 text verbatim, 12/12). The unconditional 待機系は処理をせずに / "does no work" is gone.
- Type (9), new axis applied to every relevant question:
  - **2017h29a-q087** (16-43; primary in use, secondary standing by *while running other processing*): both systems do *not* run the same processing and compare → not dual; standby doing other work is now explicitly allowed by detail → **ウ duplex (correct)**; イ dual no longer evoked (the old "2 系統とも処理するか" axis had pointed to イ).
  - **2016h28h-q075** (16-43; which describes dual): ア (same processing ×2, compare, cut off the failed one) = the new axis + `terms[0].points[1]` → **ア (correct)**; ウ (standby doing batch while waiting, switch over) is now classified duplex by both the axis and the new detail sentence — under the old axis it would have read as "both process" → dual, so the patch removes a pull toward ウ.
  - 2009h21a-q086 (correct イ) / 2012h24a-q057 (correct エ): same processing + compare = dual; ウ / ア (switch to a waiting standby) = duplex, unaffected.
  - **2014h26h-q056** (hot standby, correct ウ): イ (2 machines, same processing, mutual check) = dual by the new axis and by the new dual hook → rejected for hot standby; ウ (standby ready, immediate switch) matches `terms[2]`; エ (operator boots the spare) = cold. The new caption 待機系は**その**処理をせずに控えている is compatible with hot standby (booted but not running the main processing) and with cold (`terms[3].detail` 電源を切った、または処理を始めていない状態).
  - 2015h27a-q082: ordering dual < hot < cold unchanged (`terms[0].points[1]` / `terms[1].points[1]`) → ア.
  - 2009h21h-q073 (16-43, cluster, correct ア): the old axis "2 系統とも処理する" was closer to イ dual; the new axis (same processing + compare) does not fit the cluster's load-sharing scene, so it no longer suggests イ; duplex (primary only runs the main processing) does not fit either → neutral / improved. (Cluster is not a headword of 16-44.)
  - Other bank hits (2013h25a-q066, 2016h28a-q060, 2017h29a-q075, 2017h29h-q057, 2019h31h-q097, 2022r04-q081 デュアルコア CPU; 2017h29h-q073, 2018h30a-q082, 2019r01a-q078, 2021r03-q086 distractor mentions in other topics) are not answered by this axis.
- Consistency: `overview_rows[0]` (dual: same processing at once, compare) / `pairs[0].rows[2]` (照合 行わない for duplex) / `terms[0].one` / `terms[0].points[0]` / new hook all agree with the axis. `terms[1].one_*` (主系だけが処理を受け持ち / "handles the work") and `overview_rows[1].one_line_*` (主系だけが処理し、待機系が控える) are kept per the Rule A note; read with the new detail they say the primary alone carries *the* work, not that the standby is idle — applied to q087 they still point to duplex (primary used, standby waiting). Type (8): 主系 / 待機系 / 照合 are this unit's own role words, no other headword. Sentence counts: detail 2 → 3 (≤3), points jp 68 chars (≤100). **M1 resolved.**

### 3.2 u04 p01–p03 (M1) — 運用コスト restricted to running / maintaining the system

- After: jp 「システムが稼働している間、**その運用や維持のために**継続して発生する費用」/ zh 为运行和维护系统而持续发生的费用 / en "money that keeps being spent to run and maintain a system for as long as it is in use" (= M1 text verbatim, 3/3).
- Type (9) / (10) on **2019r01a-q096** (TCO items; quiz of 運用コスト and TCO): ① 仕入高 / ② 配送費 arise continuously while the sales system runs but are not for operating / maintaining the system → not 運用コスト; with `terms[2].points[1]` (business-transaction costs excluded) they are outside TCO; ③ / ④ 保守費 = maintenance → 運用コスト → TCO → **エ ③④ (correct)**; ア / イ (containing ①) no longer supported. 2010h22h-q084 (TCO = introduction + post-introduction operation / management costs) → ウ unchanged; 2021r03-q100 → イ (with p05–p07). `overview_rows[1].one_line_*` (稼働中に継続してかかる費用) stays time-only by the Rule A decision; its `extra_*` examples (保守費、電気代) and the `one` right below carry the restriction (obs. 4). **M1 resolved.**

## 4. Observations

No F-fix from this re-review (all 34 patches are the auditors' prescribed texts, applied exactly, and correct in context).

Records only, no fix:

1. LOW, u01 p02 (zh, introduced by the patch): validate `warn zh-term terms[1](応答時間).hook_zh 応答時間 → 应答时间 not in the zh text` (base part: no warning). The hook explains the Japanese word, so 「応答時間」 in jp form is intentional (the same field already quoted 「応答」/「レスポンス」), and the headword's zh (应答时间) is in term_zh / one_zh. WARN class only (exit 0, "never an issue" by the validator's contract). Optional: 「応答時間」中的「応答」→「応答時間」（应答时间）中的「応答」.
2. LOW, u03 (unpatched sibling fields kept by the Rule A M1 note): `goals_*[0]` (平常時に処理を受け持つ系統の数で分けられる / 承担处理的系统数量 / "by how many systems handle the work") and `overview_rows[1].one_line_*` (主系だけが処理し… / 只有主系统处理… / "Only the primary system processes …") still phrase the distinction as "how many systems process". Read literally against the new detail sentence (待機系が別の処理を受け持つ), the goal's count could be 2 for a q087-type duplex. Not MEDIUM: neither field is a 考点 / cue with qids, both are qualified by `one` / the new points[0] / pairs key row / detail, and §3.1 shows q087 / q075 are answered correctly from the unit. Optional same-direction follow-up (not required): goals jp 「平常時に処理を受け持つ系統の数で分けられる」→「平常時に 2 系統が同じ処理をして結果を照合するかどうかで分けられる」.
3. LOW, u03 p12 (en): pairs key row b "Only the primary system runs it" — "it" refers back to the a cell "the same processing" (label "Systems processing in normal operation"); readable in the side-by-side table, slightly elliptical on its own. jp その処理 / zh 该处理 have the same anaphora.
4. LOW, u04 (unpatched, kept by the Rule A M1 note): `overview_rows[1].one_line_*` 稼働中に継続してかかる費用 remains time-only; mitigated by `extra_*` examples and the corrected `one` / `terms[2].points[1]`.
5. LOW, D-198 notes: u04 p01 masked windows 7 → 7 are pre-existing in the unchanged prefix (システムが稼働している間, vs 2013h25h-q083 ウ); u03 p01 / p16 unmasked windows are headword names (masked 0); u04 p05 「費用に比べて」 (6) and u03 結果を照合する (7) are the correct choices' principle in general form (D-211 (ii) / D-198 "not a copy" side), no choice order / frame reproduced.
6. Script notes (no content issue): `check.mjs` remnant reports u01 p05–p07, u03 p07–p09 / p16–p18 = before ⊂ after (append-only patches); u03 p11 / p12 = the unpatched `overview_rows[1].one_line_zh / _en` (obs. 2); `memory_hooks suffix check` bad u01 [1] / u03 [2], [4] = index misalignment from hookless terms, order-matched check passes 42/42.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 2 in scope (u03 M1, u04 M1) — **all resolved**; **0 introduced**
- LOW introduced: 建議修 0; 記録のみ obs. 1 (patch-introduced zh-term WARN) + obs. 3; pre-existing / kept-by-decision obs. 2, 4, 5; script notes obs. 6
- Application 34/34 exact (replay), 34/34 = the Rule A prescribed text, every MEDIUM and 建議修 of the 4 Rule A files covered (u01 8 / u02 1 / u03 18 incl. the optional hook ×3 / u04 7), derived fields follow (189 checked + summary.memory_hooks 42 order-matched, 0 real mismatch), 0 unexplained base → unit diffs, 0 real `before` remnants in patched fields
- D-198: masked 12-char windows 0 → 0 in 9 of 10 jp patches, u04 p01 7 → 7 pre-existing in the unchanged prefix; zh after-spans ≤7 chars, en after-spans ≤25 chars, all unchanged words, term names / aliases or the correct principle in general form, none from a wrong choice's frame
- validate 4/4 = 0 issues (u01 1 WARN, obs. 1), parity 4/4 = 0 diff (20 / 23 / 35 / 17 locations), validate --part bases 4/4 = 0 issues, vitest textbook 162/162

**PASS** — all 34 active patches of technology-16-44 u01–u04 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. u03 M1: dual / duplex are now told apart by "same processing + compare results" and the duplex standby may do other work, so 2017h29a-q087 → ウ duplex and 2016h28h-q075 → ア dual (its duplex-like ウ no longer reads as dual); applied to q086 / q057 / q056 / q082 / 2009h21h-q073 the new axis picks the correct option or is neutral, and the added detail sentence does not trace q087 / q075 wording. u04 M1: 運用コスト is again "for running and maintaining the system", so 2019r01a-q096 ①② fall outside → エ. The LOW fixes (応答 as a rendering, 说出第一句回应, ベンチマークテスト alias, en "shorter is better", zh 总运用时间, dual hook, フォールトトレランス, 反而更高, 比重 increase only) close their field / language mismatches without new HIGH / MEDIUM.
