# b35 B3 patch re-review — strategy-04-13 u01–u04 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the per-unit Rule A audits, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 149)
- Scope: B3 wording patches for strategy-04-13-u01 (p01–p03), u02 (p01–p03), u03 (p01–p03) and u04 (p01–p04)
  — **13 `active`, 0 retired** (`patches/strategy-04-13-u0{1,2,3,4}.json`). Each patch was checked against the Rule A prescriptions:
  `-u01` L1 建議修; `-u02` L1 建議修; `-u03` L1 建議修; `-u04` L1・L2 建議修. Nothing left out.
  The 4 Rule A files report MEDIUM 0 / HIGH 0. Coverage: u01 3 = L1 p01–p03; u02 3 = L1 p01–p03; u03 3 = L1 p01–p03; u04 4 = L1 p01–p03 / L2 p04.
  Also checked against the merged units `data/ip/textbook/units/strategy-04-13-u0{1..4}.json` (sha256 u01 `09dcd4462e390f28…`, u02 `12e14a29374273a6…`, u03 `e362910d7d0bdac2…`, u04 `91a10feda1f91d90…`).
- Pre-patch bases, located by sha256 = `base_sha256`. All patches of a unit share one base, and all match:
  u01 `b35-u01-a1/…loc.r0.json` (`f49492d8…`), u03 `b35-u03-a2/…loc.r0.json` (`6b2cd256…`), u04 `b35-u04-a2/…loc.r0.json` (`3cf1a5fb…`).
  **u02 is unit-level** (`unit.unit_summary_*`, registered with `--manifest`): base = `v1Sha256(manifest)` = sha256 of canon(`manifest.v1`) = `10e5ae33…` (recomputed with `scripts/textbook-v2-patch.mjs` `v1Sha256`; `manifest.v1` deep-equals `v1-original.json`). The u02 loc part `b35-u02-a1/…loc.r0.json` (`98d3d139…`) is not the base of any patch.
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars, except en overlaps, which are project translations.

## 0. Method

Same as `b34_patch_rereview.md` §0. Topic strategy-04-13 has 38 questions, 190 source strings per language.

1. **Application check** (`b35rr/check.mjs`, run unchanged): `after` present; `before` once in base; replay in file order = unit field; no `before` remnant (raw and stripped) anywhere in the unit; every changed base-present path explained; before / after verbatim in the Rule A file.
2. **u02 unit-level** (`b35rr/u02.mjs`, new): base sha = `v1Sha256(manifest)`; `before` once in `manifest.v1.unit_summary_<l>`; replay = unit field; remnant scan over the whole unit; stage-terminology walk over every unit string (事業化 / 産業化 / 商业化 / 产业化 / commercializ / industrializ).
3. **Derived fields** (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) and `summary.memory_hooks_*` (suffix match, in check.mjs).
4. **D-198** (`b35rr/d198c.mjs` = `d198b.mjs` with u02 base read from `manifest.v1`): whole-field LCS before → after and `after`-span LCS vs 190 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice. Per-choice + stem LCS before → after (`b35rr/focus.mjs`) against 2025r07-q009, 2019r01a-q019, 2026r08-q004, 2020r02o-q035 (u03); 2015h27h-q022, 2015h27h-q023, 2018h30a-q022 (u01); 2024r06-q005 (u04).
5. **Manual reading** of each patched field in context (whole term; overview_rows; pairs; key_points; quiz qids; for u02 every stage-bearing field).
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` / `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

Not established (as in b14–b34): the unit files carry the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 126, u02 126, u03 138, u04 120) were checked for derived copies and `before` remnants. No law text is touched.

## 1. Script results (fresh, 2026-11-07)

```
✓ strategy-04-13-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 26 locations, 0 diff
✓ strategy-04-13-u02 unit: 0 issues   validate EXIT=0 | ✓ parity: 29 locations, 0 diff
✓ strategy-04-13-u03 unit: 0 issues   validate EXIT=0 | ✓ parity: 35 locations, 0 diff
✓ strategy-04-13-u04 unit: 0 issues   validate EXIT=0 | ✓ parity: 27 locations, 0 diff
validate --part (loc r0): ✓ u01 / u02 / u03 / u04 loc#0: 0 issues (sha256 = base_sha256 for u01 / u03 / u04)
u02: canon(manifest.v1) sha 10e5ae33… = base_sha256 ×3; before count 1 ×3; replay == unit ×3; remnant 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: 14 pass, 0 fail
check.mjs: active 3/3/3/4, ok 3/0/3/4, issues 0 / 3 / 0 / 2 (all explained below)
```

**Application.**
- u01 / u03 / u04: all 10 `before` strings occur exactly once in their base field; all 10 `after` present; replay reproduces every patched field. Each field carries one patch.
- u02: check.mjs reports `p01–p03 field missing unit.unit_summary_*` — **script limitation**, not a defect: it replays on the loc part, which has no `unit.` root. Verified separately (§0 step 2): `before` once in `manifest.v1`, replay = unit `unit_summary_jp/zh/en`, base sha = `v1Sha256(manifest)`. `textbook-v2-patch.mjs --list` shows the 3 patches active on base `10e5ae33c0a3…`.
- Changed base-present paths: u01 3, u03 3, u04 4 = exactly the patched fields, plus the removed `stage` meta key (as in b19–b34). u02: only `stage` (its patches live in `unit_summary_*`, which are unit-only paths relative to the loc part). Unexplained diffs: 0.
- `before` remnants: u01 / u02 / u03 0. **u04 p01 / p02 remnants are a script artifact** (confirmed): the after only prepends 主な / 主要, so `before` is a suffix of `after` (`after.endsWith(before)` true; `before` count in field 1 = `after` count 1; field with `after` removed contains no `before`). en p03 inserts "main" mid-string, so no hit. Real remnants: 0.
- `check.mjs` "ruleA verbatim miss": u01 / u02 / u04 []; **u03 [p01–p03] = the deliberate deviation** (§3.1). 10/13 = Rule A prescribed text exactly; u03 3/3 = prescribed reorder minus one clause.

**Derived fields.** Full walk 63 + 66 + 78 + 60 = 267 derived strings, 0 mismatch. u04 p04 `terms[0].memory_hook_zh` = stripped hook_zh (true), `summary.memory_hooks_zh[0]` ends with it. `summary.memory_hooks_*` suffix check 18 / 18 / 21 / 12 = 69, 0 bad. Points / unit_summary have no derived copy.

**Notation.** bold / `[[jp:]]` counts unchanged in all 13 fields.

D-198, before → after (`d198c.mjs`):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | **jp** | 2015h27h-q023 stem | 12 → 12 (headword プロダクトイノベーション) | プロセスイノベーション (11, headword) | 11 / 0 → 11 / 0 (headwords only); 0.54 → 0.52 |
| u01 p02 | zh | 2015h27h-q023 stem | 4 → 4 (产品创新) | 的是 (2) | — |
| u01 p03 | en | 2015h27h-q023 stem | 20 → 20 (" process innovation ") | "changes " (8) | — |
| u02 p01 | **jp** | 2020r02o-q003 イ (term name) | 7 → 7 (ダーウィンの海, unchanged part) | 事業化 (3) | 0 / 0 → 0 / 0; 0.19 → 0.19 |
| u02 p02 | zh | 2020r02o-q003 イ | 5 → 5 (达尔文之海) | 产业化 (3) | — |
| u02 p03 | en | 2020r02o-q003 stem | 19 → 19 (" commercialization ") | same (19, stage name; obs. 2) | — |
| u03 p01 | **jp** | **2025r07-q009 ウ** → 2019r01a-q019 ウ (term name) | **6 → 5** | ハッカソン (5, headword) | 0 / 0 → 0 / 0; 0.25 → 0.19 |
| u03 p02 | zh | 2019r01a-q019 stem | 8 → 8 (并比拼成果的活动) | same (8, unchanged part) | — |
| u03 p03 | en | 2019r01a-q019 stem → 2026r08-q004 stem | 20 → 21 | " and competing on the" (21, generic; obs. 3) | — |
| u04 p01 | **jp** | 2024r06-q005 stem | 10 → 10 (headword) | である (3) | 1 / 0 → 1 / 0 (headword); 0.21 → 0.21 |
| u04 p02 | zh | 2021r03-q031 ア | 4 → 4 (企业提供, unchanged part) | 的是在 (3) | — |
| u04 p03 | en | 2023r05-q031 stem | 16 → 16 (unchanged part) | " selling " (9) | — |
| u04 p04 | zh | — | 2 → 2 | 业务 (2) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52 for full-field copy; the u01 jp wDice 0.52 is the two headwords in a 1-sentence contrast, masked windows 0). Masked 12-char windows: 0 → 0 in all 4 jp patches.

Per-choice check (LCS before → after; `focus.mjs`):
- **2025r07-q009** (hackathon, correct ウ) × u03 p01–p03: jp stem 5 → 5, ア 2 → 1, イ 2 → 1, **ウ* 6 → 4**, エ 2 → 2; zh ウ* **7 → 5**, others ≤2 flat; en ウ* **18 → 13**, ア 11 → 11, イ 8 → 8, エ 5 → 5. The phrase order (team → theme → prototype → short term → compete in ウ) is no longer followed. §3.1.
- **2019r01a-q019 / 2026r08-q004 / 2020r02o-q035** (term-identification, all → ハッカソン) × u03: jp ≤5 flat (成果を競 / headword); zh flat; en q019 stem 20 → 12, q004 stem 18 → 21 (obs. 3), q035 13 → 12.
- **2015h27h-q023** (product-innovation factor, correct ウ) × u01: jp flat (headword only), choices ≤1; zh / en ≤5 flat. **2018h30a-q022** (process innovation direct result, correct イ): flat (≤5). **2015h27h-q022** is a compliance question (a〜d set) unrelated to the patched point: 0–2, flat.
- **2024r06-q005** (VC, correct イ) × u04 p01–p03: jp イ* 3 → 3 (る利益), zh 2 → 2, en イ* 9 → 9 (" selling "); flat — the added 主な / 主要 / "main" adds no source words.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01–p03 | `terms[5](プロダクトイノベーション).points[1].text_*` | L1 | Yes (§3.2) | No | OK |
| u02 | p01–p03 | `unit.unit_summary_*` (unit-level, base manifest.v1) | L1 | Yes (§3.3) | No (obs. 1 pre-existing title_zh) | OK |
| u03 | p01–p03 | `terms[0](ハッカソン).points[0].text_*` | L1 | Yes (§3.1), deviation justified | No (obs. 3 record) | OK |
| u04 | p01–p03 | `terms[3](ベンチャーキャピタル).points[0].text_*` | L1 | Yes (§3.4) | No | OK |
| u04 | p04 | `terms[0](ビジネスモデルキャンバス).hook_zh` (+ memory_hook, summary) | L2 | Yes: 「用这个画面来记」 = jp「描き込むイメージで覚える」; the added assertion 「这样记就不会忘」 is gone; en unchanged ("Picture …") | No | OK |

## 3. Focused checks

### 3.1 u03 p01–p03 (L1) — ハッカソン reorder, deviation from Rule A text

- Rule A L1 asked for the D-211 (ii) form: change the phrase order away from 2025r07-q009 ウ. Its proposed after also added 「テーマは主催者が示し」 / 主题由主办方给出 / "the organizer sets the theme". The main session dropped that clause and applied: jp 「ハッカソンは、短期間で試作品を作り上げて成果を競う催しで、職種の違う人どうしがチームを組み、テーマに沿って取り組む。」 / zh 「…是在短时间内做出原型并比拼成果的活动，由不同职业的人组成团队，围绕主题进行。」 / en "…is an event for building a prototype in a short time and competing on the results, in which people from different roles form teams and work on a theme."
- **Reorder purpose achieved.** The applied order is short term → prototype → compete → mixed roles → team → theme; ウ's order is teams → theme → prototype → short term → compete. Overlap with ウ falls in all three languages (jp 6 → 4, zh 7 → 5, en 18 → 13), masked windows 0 → 0, wDice 0.25 → 0.19. Residue: the applied text keeps 「チームを組み、テーマに沿って」 (team → theme), the same adjacency as ウ and the base; Rule A’s text had put theme before team. So 2 of the 5 elements stay in ウ order, against the full 5-element sequence that Rule A rated LOW 建議修. The residue is strictly below the original LOW and cannot be a new MEDIUM.
- **Answerability kept.** All five ウ elements (mixed-role teams, theme, prototype, short period, competing on results) are still stated, so q009 → ウ; none of ア (debate), イ (security camp), エ (gamification) is cued (≤2). The three term-identification questions (2019r01a-q019, 2026r08-q004, 2020r02o-q035) still match on short term + team + compete on results. quiz / inline_quiz (q019, q035) unchanged.
- **Nothing unsupported added; nothing lost.** The applied text adds no element absent from the base. 「職種の違う人どうし」 = base 「職種の違う人」. Dropping the organizer clause loses nothing, because `terms[0].detail_*` already states 「主催者が示したテーマに沿って」 (unpatched), so the unit still carries it in one place, which is enough under 書き方 8.
- **On the stated reason.** The patch reason says no cited question supports the organizer clause. That is slightly overstated: q009 ウ says the theme is *given* (与えられた) and q019 / q004 frame the theme as a set goal, which implies someone sets it. But no question names the organizer, and the detail already covers it. So dropping the clause is a valid choice, not a loss of a cited 限定条件. **Deviation justified; L1 resolved; no MEDIUM / HIGH.**

### 3.2 u01 p01–p03 (L1) — process side 「作り届ける」

- After: jp 「プロダクトイノベーションは何を作るかを変え、プロセスイノベーションはどう作り届けるかを変える。」 / zh 「…改变的是怎么做、怎么交付。」 / en "…changes how it is made and delivered."
- Matches the rest of the unit: `terms[4].one_*` 「作り・届ける工程」 / 制造和交付 / "making and delivering"; `overview_rows[4]` 「作り方・届け方の工程」; `pairs[1].rows[0].a_*` 「作り方・届け方の工程」 / 制造与交付的流程 / "How things are made and delivered"; `terms[4].detail` (サービス提供の業務手順も含む). The mix point no longer reads narrower than one / pairs.
- 2015h27h-q023 (factor of product innovation → market needs): the wrong options are a production method and supply / value chain management. With 「届ける」 the process side now visibly covers supply and delivery, so those options sort to the process side. This helps reject them and does not support any of them for product innovation. 2018h30a-q022 (process innovation → quality up) is unaffected. 2015h27h-q022 is a compliance question with no link to this point.
- Style: the point writes 「作り届ける」 without the 中黒 used in one (「作り・届ける」). It reads naturally as one compound verb and is the Rule A prescribed text. Not a finding. **Resolved.**

### 3.3 u02 p01–p03 (L1) — unit_summary stage order (unit-level)

- Base (manifest.v1 = v1-original): jp 「研究→開発→事業化→市場」, zh 「研究→开发→产业化→市场」, en "research → development → commercialization → market".
- After: jp 「研究→開発→事業化→産業化」, zh 「研究→开发→商业化→产业化」, en "research → development → commercialization → industrialization". This matches 2020r02o-q003's four stages (research, development, 事業化, 産業化), which define the Darwinian Sea as the barrier from 事業化 to 産業化.
- Body terminology (full walk): jp 事業化 / 産業化, zh 商业化 / 产业化, en commercialization / industrialization are used consistently in `terms[3].detail_*`, `terms[3].points[0]`, `terms[4].one/detail`, `terms[5].one/points[0]`, `terms[5].fig` nodes and captions, `overview_rows[4..5]`, `pairs[0].rows[1]`, `pairs[1].rows[2]`. The new zh summary removes the old inversion (产业化 used for 事業化). The three barriers in the parenthesis (魔の川・死の谷・ダーウィンの海) are unchanged and still sit between the four stages.
- `unit_index.json` summary_jp still reads 「…事業化→市場…」. The patch reason records this as a known non-sync: the web does not show it, and the patch tool targets `unit.unit_summary_*` only (`textbook-v2-patch.mjs` header). Accepted as in the tool design.
- **Resolved.** One pre-existing item outside the patch: obs. 1.

### 3.4 u04 p01–p03 (L1) — VC 「主な」ねらい

- After: jp 「…主なねらいは出資先が育った後に持ち株を売却して得る利益である。」 / zh 「主要目的是…」 / en "their main aim is …".
- 2024r06-q005 イ gives profit from share sales *among other aims* (など). The point no longer closes the aim to sale profit alone, so the 限定条件 is kept. The pick is unchanged: q005 → イ (the company that invests in market entrants), and ア (joint venture), ウ (open innovation), エ (project team) stay uncued (per-choice flat).
- Consistency: `pairs[0].rows[1]` 主な目的 「持ち株の売却で得る金銭的な利益」 and `terms[5].points[0]` (mix) 「ベンチャーキャピタルは…金銭的な利益を主な目的とする」 now use the same 「主な」 wording. The VC / CVC contrast is intact: VC = mainly financial return, CVC = mainly strategic synergy. 「主な」 on both sides keeps it a contrast of emphasis, which the CVC point already used. `one_*` (成長後に株式を売って利益を得る投資会社) is a definition and does not conflict. **Resolved; no new issue.**

## 4. Observations

No F-fix from this re-review. Records only:

1. LOW, pre-existing (not patched, not flagged by Rule A): u02 `title_zh` 「创新理论与产业化的三道关口」 uses 产业化 where `title_jp` has 事業化 (en "Commercialization"). This is the same v1 zh choice that L1 fixed in `unit_summary_zh`. It is not wrong in substance, since the three barriers lie on the road to 产业化, but it is the one zh field left using 产业化 for 事業化. The patch tool cannot target `title_*` (unit_summary only), so this would need a manifest or v1 touch. Optional follow-up.
2. LOW (prescribed u02 p03): en after-span " commercialization " (19) = the 2020r02o-q003 en stem's stage name. It is a stage term from the standard four-stage model and was already in the before. Not a copy.
3. LOW (u03 p03): en after " and competing on the" (21) vs 2026r08-q004 en stem (18 → 21). Generic phrasing on a term-identification stem, and the answer is the term name. Overlap with 2019r01a-q019's en stem (the same jp stem) falls 20 → 12. Not MEDIUM.
4. Script notes (no content issue): u02 `field missing` ×3 = unit-level patches outside check.mjs's loc replay (verified manually, §3.3); u04 `remnant` p01 / p02 = before is a suffix of after; u03 `ruleA verbatim miss` p01–p03 = the justified deviation (§3.1); `stage` meta removed (as in b19–b34). `d198b.mjs` crashes on `unit.*` fields; `d198c.mjs` reads the u02 base from `manifest.v1`.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (all 4 Rule A files MEDIUM 0); **0 introduced**
- LOW introduced: obs. 2 and obs. 3 (record only); pre-existing obs. 1; script notes obs. 4.
- **Application:** 13/13 exact (replay; u02 against manifest.v1). 10/13 = Rule A prescribed text; u03 3/3 = prescribed reorder with the organizer clause dropped, justified (§3.1). Every 建議修 covered (u01 L1, u02 L1, u03 L1, u04 L1・L2). Derived fields follow (267 + memory_hooks 69, 0 mismatch). 0 unexplained diffs, 0 real `before` remnants.
- **D-198:** the targeted overlap falls (u03 vs q009 ウ: jp 6 → 4, zh 7 → 5, en 18 → 13). No after-span traces a choice frame. Masked jp windows 0 → 0 ×4.
- **Gates:** validate 4/4 = 0 issues, parity 4/4 = 0 diff (26 / 29 / 35 / 27 locations), validate --part 4/4 = 0 issues (sha256 = base_sha256 for u01 / u03 / u04; u02 base = canon manifest.v1 sha), vitest textbook 162/162, patch tests 14/14.

**PASS.** All 13 active patches of strategy-04-13 u01–u04 are applied exactly. No patch introduces a MEDIUM or HIGH, and every 建議修 is applied.
- u01 L1: the process side now reads 「作り届ける」, matching one / overview / pairs and the q023 option split.
- u02 L1: unit_summary has the four stages 研究→開発→事業化→産業化 (zh 商业化→产业化), matching the body and 2020r02o-q003.
- u03 L1: the reorder breaks the 2025r07-q009 ウ sequence in all three languages and every cited question stays answerable. The dropped organizer clause is justified, since the detail already carries it and no question names it.
- u04 L1: 主な / 主要 / main keeps q005 イ's など and matches pairs and the CVC point. u04 L2: the zh hook no longer adds an assertion.
