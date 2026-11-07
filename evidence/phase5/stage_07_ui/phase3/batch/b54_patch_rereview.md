# b54 B3 patch re-review — strategy-03-11-u01 (ビジネス戦略の目標設定と評価指標, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b54rv/`: `check.mjs` and `d198.mjs` are taken from `b51rv/` with only the topic, the base part and the unit list changed. `full.mjs` (whole-field LCS, 12-char windows unmasked / masked, wDice) and `ed.mjs` (edit-distance ratio for p01) are new for b54.
- Date: 2026-11-08 (Session 150)
- Scope: the B3 wording patches for strategy-03-11-u01. **10 are `active`, 0 retired** (p01–p10, `patches/strategy-03-11-u01.json`). All 10 are part-level.
  - Mapping to Rule A prescriptions (Rule A PASS, HIGH 0 / MEDIUM 0, 建議修 L1–L4):
    - L1 → p01 (`terms[0].one_jp`, jp only)
    - L2 → p02–p04 (`terms[1].detail_jp/zh/en`)
    - L3 → p05–p07 (`terms[2].analogy_jp/zh/en`)
    - L4 → p08 + p09 (`terms[5].one_zh`, two replacements in one field) / p10 (`terms[5].one_en`)
  Every 建議修 is covered. L5–L10 are marked 記録のみ (the optional wording for L6 / L9 was not taken); they are not patched and not re-ruled here.
- Pre-patch base, located by sha256 = `base_sha256` (all 10 patches):
  - `data/ip/textbook/.planning/v2/strategy-03-11-u01/parts/b54-u01-a1/strategy-03-11-u01.loc.r0.json` `589d72c07a9b45c2…`
- Merged unit (current) `data/ip/textbook/units/strategy-03-11-u01.json` sha256 `0e4f64d9d8e97713…`. Rule A read the pre-patch merge `9546db642bd9213c…`, which is no longer on disk. The current unit differs from the base part only by the 9 patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (part-level only; no unit-level patch in b54). Topic strategy-03-11 has 29 questions, so there are 145 source strings per language (stem + 4 choices).

1. **Application check** (`b54rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field (p08 → p09 chained on the same field); every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted), raw and after stripping `**` / `[[jp:]]`; before / after in the Rule A file.
   - The brief said the main session shortened some before / after strings. `check.mjs` tests this with `includes`, which a shortened sub-span would also pass. So I also compared each of the 10 pairs by **strict equality** against the `before` → `after` pairs in the Rule A L1–L4 修正案 cells.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b54rv/d198.mjs` + `b54rv/full.mjs`, all 10 patches): LCS of the before / after span and of the whole field against the 145 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked (katakana ≥4 and alphanumerics → □) + wDice; for p01 also the edit-distance ratio (`b54rv/ed.mjs`).
4. **Cited-question checks** in `data/ip/quiz/questions.json` + translations (stem_jp_clean):
   - p01: 2010h22a-q016 (4th perspective, answer ア 顧客), 2017h29a-q014 (BSC description, answer イ), 2022r04-q019 (業務プロセス (内部ビジネスプロセス) theme, answer エ)
   - p02–p04: 2018h30a-q018 (what is clarified per strategic goal, answer ウ 重要成功要因), 2009h21a-q012 (step ④ = 重要成功要因の抽出, answer ア)
   - p05–p07: 2013h25a-q014 (direct indicator for a CSF, answer ウ 欠品率), 2014h26h-q001 (analysis for a CSF, answer ア RFM), 2015h27h-q005 (KPI description, answer ア; イ = CSF description), 2010h22a-q029 (CSF, answer ア)
   - p08–p10: 2009h21a-q027 / 2016h28h-q028 (VE as a 手法, answers イ / ウ)
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3). For L2 I checked the page render order in `apps/web/src/components/textbook/UnitReader.tsx` / `UnitHeader.tsx`.
6. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b52): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. The 127 unit-only paths were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-03-11-u01
✓ strategy-03-11-u01 unit: 0 issues (data/ip/textbook/units/strategy-03-11-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-03-11-u01
✓ strategy-03-11-u01 parity: 28 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part data/ip/textbook/.planning/v2/strategy-03-11-u01/parts/b54-u01-a1/strategy-03-11-u01.loc.r0.json
counts {"terms":6,"figs":3,"steps":8,"points":11,"pairs":2,"key_points":4,"goals":3}
sha256 589d72c07a9b45c223e6ff9331f478d483a8e87ebc6bd580fea58b9eae5ddfef
✓ strategy-03-11-u01 part loc#0: 0 issues (…/b54-u01-a1/strategy-03-11-u01.loc.r0.json)
EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  active 10 ok 10 | issues []
  part-level: base sha = base_sha256 for all 10; before count in base = 1 for all 10; replay mismatch 0
  changed base-present paths = 9 patched fields + 'stage'; unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata); unit-only paths 127
  derived checked 66, mismatch 0 (terms[0].definition_jp, terms[1].explanation_jp/zh/en, terms[5].definition_zh/en: true)
  bold counts unchanged in all 9 fields; [[jp:]] counts unchanged in all 9 fields
  memory_hooks hooked-terms pairing: 6/6 per language (18), bad 0
  net before remnant: raw 0 for all 10; stripped 0 except p01 = 3 (§3.1, obs. 1)
  ruleA verbatim miss []
strict equality vs Rule A 修正案 cells: p01–p10 all EQUAL
```

**Application.** All 10 `before` strings occur exactly once in their base field, all 10 `after` strings are present, replay reproduces every patched field. All 10 before / after pairs are **character-identical** to the Rule A 修正案 (strict equality, not substring). So no before / after in b54 is shortened against Rule A; each is the same edit as prescribed.

D-198, before → after (`full.mjs` whole-field / `d198.mjs` after-span, 145 sources per language; jp fields only carry the window columns):

| Patch | Lang | LCS whole field before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| p01 | **jp** | 10 → 19 (バランススコアカード 2010h22a-q016 stem → 「業務プロセス (内部ビジネスプロセス)」 2022r04-q019 stem) | 19 (same, perspective name) | **2 / 0 → 11 / 0**; 0.38 → 0.44 (2010h22a-q016 stem; ed 0.82 → 0.83; masked Dice 0.27 → 0.30) — see note |
| p02 | **jp** | 10 → 10 (視点ごとに戦略目標を, unchanged part) | 具体的な (4) | 4 / 3 → 4 / 3 (pre-existing, Rule A §1-4); 0.23 → 0.20 |
| p03 | zh | 5 → 5 (企业的愿景 → （CSF）) | （CSF） (5, term) | — |
| p04 | en | 30 → 30 (" company's vision and strategy", unchanged part) | " concrete actions" (17, unchanged part) | — |
| p05 | **jp** | 4 → 4 | 込み (2) | 0 / 0 → 0 / 0; 0.10 → 0.09 |
| p06 | zh | 3 → 3 (的关键) | 的关键 (3) | — |
| p07 | en | 11 → 11 | "own in the " (11, generic) | — |
| p08 / p09 | zh | 5 → 5 (产品或服务, unchanged part) | 产品 (2) / 的步骤来 (4) | — |
| p10 | en | 36 → 36 ("s the value of a product or service ", unchanged part) | " is a method that " (18, 2016h28h-q028 stem en, generic) | — |

Note on p01: the 9 new unmasked windows are all runs of perspective names: 「成長業務プロセス内部ビジ…」 to 「…ロセス内部ビジネスプロセ」 vs 2022r04-q019 stem, and 「…セス内部ビジネスプロセス(顧客)」 vs 2010h22a-q016 stem (2 substitutions, 顧客 vs 及び). The 2 old windows are the headword バランススコアカード. With the katakana masked, windows are 0 → 0, and the wDice rise (0.38 → 0.44) comes from the added katakana name (masked 0.27 → 0.30). ed 0.83 is far from the HIGH calibration (ed 0.14 / Dice 0.52); 0.44 is the same Dice level Rule A recorded as LOW 記録のみ (L6). The added string is the official alias of a perspective name (a term name, not an expression: the class Rule A §1-4 already treats as a false positive). Rule A L1 prescribed exactly this spelling and cites q019 / q016 / q014 as using it. No wrong option is supported: q016 イ 情報 / ウ 戦略 / エ 品質, and q019 ア 売上高 / イ 顧客ロイヤルティ / ウ 従業員の技術力 (財務 / 顧客 / 学習と成長), get no support. Not a copy.

Note on p10: " is a method that " (18) vs the 2016h28h-q028 en stem is generic English; that question's answer is VE (ウ), so the overlap supports the correct side. Not a copy.

No patch adds a copy-level overlap; masked jp windows unchanged in every jp field (0 → 0 / 3 → 3 / 0 → 0); wDice ≤ 0.44.

## 2. Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[0](バランススコアカード).one_jp` (+ definition_jp) | L1 | Yes: jp now says 業務プロセス (内部ビジネスプロセス), so the jp name and the exam name are linked (2010h22a-q016 / 2017h29a-q014 内部ビジネスプロセス; 2022r04-q019 業務プロセス (内部ビジネスプロセス)). Matches zh 内部业务流程 / en internal business process. Still 1 sentence; bold 6 → 6 | No (D-198 note §1) | OK |
| p02–p04 | `terms[1](BSC).detail_jp/zh/en` (+ explanation_*) | L2 | Yes (§3.2): the steps are now 戦略目標 → CSF → 指標・目標値・施策, which matches 2018h30a-q018 ウ, 2009h21a-q012 ④ and the sibling fields. CSF is glossed in place in all three languages. en 3-clause list is grammatical | No | OK |
| p05–p07 | `terms[2](CSF).analogy_jp/zh/en` | L3 | Yes (§3.3): CSF = 走り込みを積むこと / 积累足够的跑量 / putting in enough training mileage; KPI = 毎週の走行距離 / 每周跑量 / weekly mileage → the KPI now tracks the state of the CSF directly (= CSF points[1], fig step 3). No wrong option implied | No | OK |
| p08 + p09 | `terms[5](バリューエンジニアリング).one_zh` (+ definition_zh) | L4 | Yes: 「…（VE）是把产品或服务带来的价值看作功能除以成本的比值，并按一定的步骤来提高它的方法。」 = jp 手法である. Grammatical (是 … 的方法 encloses both verb phrases). 2009h21a-q027 / 2016h28h-q028 (VE = 手法) supported | No | OK |
| p10 | `terms[5].one_en` (+ definition_en) | L4 | Yes: "VE) is a method that treats the value … and raises it through a set procedure." Same type word as jp / zh | No | OK |

## 3. Focused checks

### 3.1 p01: alias in jp one, and the other mentions of 業務プロセス

- After: 「…学習と成長・業務プロセス (内部ビジネスプロセス)・顧客・財務の 4 つの視点に分けて…」. The format (space + half-width parentheses) is the same as elsewhere in the unit (e.g. 「CSF (Critical Success Factor、…)」). Derived definition_jp follows.
- Stripped remnant 3 = the bare name 「顧客・業務プロセス・学習と成長」 in `terms[0].points[0].text_jp`, `key_points_jp[0]` and its derived `summary.key_points_jp[0]`. Rule A L1 limited the fix to jp `one` (「jp のみ」, one field). The alias is given once at the definition and the short name is used after it, so these are not remnants of the edit. No fix (obs. 1).
- zh / en unchanged (they already carried the wider name). No `[[jp:]]` count change.

### 3.2 p02–p04: CSF in terms[1] before terms[2] defines it (Rule A L2 warning)

- After:
  - jp: …視点ごとに戦略目標を置き、それぞれに成功の決め手 (CSF) を見極めたうえで、測る指標・目標値・具体的な施策を割り当てる。
  - zh: …在每个视角下设定战略目标，再为各目标找准成功的关键（CSF），并配上衡量指标、目标值和具体措施。
  - en: …a strategic goal is set for each perspective, the deciding factor for success (CSF) is identified for each goal, and each goal is then given a metric, a target value, and concrete actions.
- **Definition-before-use, judged acceptable:**
  - In all three languages the term is introduced by a plain-language gloss with the abbreviation in parentheses (成功の決め手 (CSF) / 成功的关键（CSF） / the deciding factor for success (CSF)). The gloss is the same wording as the unit's own CSF definitions (overview_rows[2].extra 成功の決め手 (要因) / 成功的关键（因素）; key_points[1] 成功の決め手 / 成功关键 / the deciding factor for success). A reader can follow terms[1] without terms[2].
  - Render order: `UnitHeader` renders goals (goals[1] **CSF** で成功の決め手を絞り…) and the overview table (`<details … open>`, row CSF = 成否を分ける決め手となる要因) before `UnitReader` maps `unit.terms`. So on the page CSF is introduced before terms[1].
  - This is the form Rule A itself prescribed and annotated (§1-5: 「L2 修正案は『成功の決め手 (CSF)』と注」). Not a D-195 violation. No LOW.
- **Order consistency**: 戦略目標 → CSF → 指標・目標値 = CSF points[0] (戦略目標が決まったあとに), CSF detail (決まったあとに…指標と目標値を設定), KPI detail (CSF ごとに設定), pairs[0].rows[1] (CSF ごとに後から), key_points[2] (KGI → CSF → KPI), terms[4].fig steps. Supported by 2018h30a-q018 ウ (CSF made clear for each strategic goal) and 2009h21a-q012 ア (step ④ after strategy). The wrong options ア 企業倫理 / イ 経営理念 / エ ビジョン get no support: ビジョン appears only as the starting point (unchanged first clause), not as the item made clear per goal.
- 三語 parity ✓ (the same three steps in the same order; en "then" = jp うえで / zh 再…并). zh 成功的关键 is a gloss, not a competing term (the zh headword 关键成功因素 stays in one_zh; validate zh-term 0 warn).

### 3.3 p05–p07: CSF analogy vs KPI analogy

| | jp | zh | en |
|---|---|---|---|
| KGI analogy (unchanged) | 4 時間以内に完走する目標タイム | 4 小时内跑完的目标成绩 | finishing within four hours |
| CSF analogy (after) | 後半に失速しないだけの**走り込みを積むこと**こそが決め手 | 关键在于**积累足够的跑量**，让后半程不掉速 | the real key is **putting in enough training mileage** not to slow down in the second half |
| KPI analogy (unchanged) | **毎週の走行距離**を記録して練習の進み具合を確かめる | 记录**每周跑量**来确认训练进度 | logging your **weekly mileage** to check how your training is going |

- **Pairing**: before, the KPI (weekly distance) did not directly show the CSF (stamina). Now the KPI is the number that tracks the CSF itself (走り込み ↔ 走行距離; zh 跑量 ↔ 跑量; en training mileage ↔ weekly mileage). This matches CSF points[1] (その要因の状態を直接表す指標), fig step 3 (決め手がどこまで実現できたかを直接表す数値を KPI) and the worked example (CSF 体験会に人を多く集めること → KPI 体験会の参加者数).
- **CSF vs KPI not blurred**: the new CSF is phrased as something to do, but it is still a condition that must hold (「何ができれば成功か」, CSF detail), not a number. The KPI is the logged number. This is the same shape as fig nodes[1..2]. 「こそが決め手」 / 真正的关键 / the real key stay the CSF marker.
- **Cited questions**:
  - 2013h25a-q014 (direct indicator for a CSF, ウ 欠品率) and 2014h26h-q001 (ア RFM): the analogy now models "pick the indicator that directly reflects the CSF". This supports the correct logic; the wrong options (indirect financial or new-customer indicators) are not implied.
  - 2015h27h-q005: イ (最も重要な要因) stays on the CSF side, ア (活動の実行状況を計る指標) on the KPI side.
  - 2009h21a-q012 / 2018h30a-q018: 「目標タイムを出すために…見極める」 keeps goal → CSF order.
  - 2010h22a-q029 (ア CSF vs ERP / MRP / SCM): unaffected.
- **D-204 scope**: the analogy claims no more than the definition (one key factor chosen for a target; detail allows 少数). The singular 決め手 is unchanged from the base. No new scope claim.
- 三語 parity ✓ (same image and same causal link 「失速しないための積み上げ」 in all three).

### 3.4 p08–p10: type word

- zh after the chained replay: 「**价值工程**[[jp:バリューエンジニアリング]]（VE）是把产品或服务带来的**价值**看作**功能**除以成本的比值，并按一定的步骤来提高它的方法。」. 是 … 的方法 encloses 把…看作… and 并…提高它, so the sentence is a definition with a type word = jp 「…高める手法である」.
- en: "**Value Engineering** ([[jp:バリューエンジニアリング]], VE) is a method that treats the **value** … as the ratio of its **function** to its cost, and raises it through a set procedure." Grammatical; = jp 手法.
- Bold 3 → 3, `[[jp:]]` 1 → 1 in both; derived definition_zh / en follow. 2009h21a-q027 / 2016h28h-q028 (価値を機能とコストの関係で…手法) supported; wrong options (重要成功要因, バリューチェーン, SCM, リバースエンジニアリング …) not implied.

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. p01: the alias 内部ビジネスプロセス is only in `terms[0].one_jp` (as Rule A L1 prescribed). `terms[0].points[0].text_jp`, `key_points_jp[0]` and `summary.key_points_jp[0]` use the short 業務プロセス. This is consistent (alias at definition, short name after it) and needs no change.
2. p01 D-198: the 9 new unmasked windows / Dice 0.44 come from the added official perspective name (§1 note). Masked 0 → 0, ed 0.83. Not a copy.
3. Script notes:
   - check.mjs `ruleA verbatim` uses `includes`; strict equality was checked separately (10/10 EQUAL).
   - `stage` meta is removed in the unit (as in b19–b52).
   - Rule A's unit sha (`9546db64…`) is the pre-patch merge; the current unit is `0e4f64d9…`.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM introduced: **0** (none in scope; Rule A had 0)
- LOW introduced: 0 that need a fix. Recorded: obs. 1–2. Obs. 3 is script notes.
- **Application:** 10/10 exact (replay, part-level). 0 unexplained diffs, 0 raw net `before` remnants (p01 stripped 3 = other fields outside L1's scope, obs. 1), derived fields follow (66 checked, 0 mismatch; memory_hooks 18/18). 10/10 are character-identical to the Rule A 修正案 (strict equality). Every 建議修 (L1–L4) is covered.
- **L2:** CSF used in terms[1] before terms[2] is acceptable: glossed in place in all three languages, and already introduced by goals[1] / the overview table, which render before the terms.
- **L3:** CSF (走り込み / 跑量 / training mileage) and KPI (走行距離 / 跑量 / weekly mileage) now pair directly; no wrong option of 2013h25a-q014 / 2014h26h-q001 / 2015h27h-q005 / 2009h21a-q012 / 2018h30a-q018 is implied.
- **D-198:** no patch adds a copy-level overlap. p01's rise is the official perspective name (masked windows 0 → 0, ed 0.83). p10's 18-char en overlap is generic and on the correct-answer side.
- **D-200:** no `points[]` field is patched (unchanged).
- **D-202:** no `[[jp:]]` marker added or removed.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0
  - validate --part: 0 issues (sha256 = base_sha256)
  - parity: 0 diff (28 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 10 active patches of strategy-03-11-u01 are applied exactly and match the Rule A prescriptions character for character. Each resolves its Rule A 建議修 (L1–L4), and none introduces a HIGH, MEDIUM or LOW that needs a fix. No required F-fix.
