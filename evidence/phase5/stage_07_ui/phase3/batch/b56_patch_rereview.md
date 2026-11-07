# b56 B3 patch re-review — technology-13-33 u01–u02 (2進数と基数 / 集合と論理演算, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b56rv/` (`check.mjs` adapted from `b53rv/` — only the unit map and topic changed; `d198.mjs` adapted from `b53rv/` with the topic changed, field-level before → after, and an added near-match pass [windowed ed / bigram Dice, masked and unmasked] for the H1 field).
- Date: 2026-11-08 (Session 150)
- Scope: the B3 wording patches for technology-13-33 u01–u02. **12 are `active`, 0 retired**: u01 p01–p03 / u02 p01–p09 (`patches/technology-13-33-u0{1,2}.json`). All are part-level; there are no unit-level (`unit.*`) patches.
  - Mapping to Rule A prescriptions:
    - u01 (PASS, 建議修 L1): L1 → p01–p03
    - u02 (**FAIL**, HIGH H1 / MEDIUM M1, 建議修 L1–L2): H1 → p01–p03; M1 → p04–p06; L1 → p07; L2 → p08–p09
  Every 建議修, the HIGH and the MEDIUM are covered. LOWs marked 記録のみ (u01 L2–L6, u02 L3–L6) are not patched and not re-ruled here.
  - The main session shortened `before` / `after` to the replaced sentence(s). I checked that the whole resulting field equals the Rule A after text (§1).
- Pre-patch bases, located by sha256 = `base_sha256` (one base per unit):
  - u01 `data/ip/textbook/.planning/v2/technology-13-33-u01/parts/b56-u01-a2/technology-13-33-u01.loc.r1.json` `8f864a482b8e1c5d…`
  - u02 `…/technology-13-33-u02/parts/b56-u02-a1/technology-13-33-u02.loc.r1.json` `247b5f8858d4a853…`
- Merged units (current) `data/ip/textbook/units/technology-13-33-u0N.json` sha256: u01 `9e7e63582199d8b0…` / u02 `0b7696c02f825b3a…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches this time). Topic technology-13-33 has 28 questions, so there are 140 source strings per language (stem + 4 choices).

1. **Application check** (`b56rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim in the Rule A file; plus whole-field = Rule A after text.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b56rv/d198.mjs`, all 12 active patches): whole-field LCS before → after and LCS of the `after` span against the 140 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked (katakana ≥4 and alphanumerics → □, windows with <6 real chars skipped). For the H1 field `terms[0].points[0].text_*` in all three languages, sentence-level near-match against every source of normalized length ≥8: windowed normalized edit distance and bigram Dice (jp also masked). Calibration HIGH: ed 0.14 / Dice 0.52.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + translations: 2010h22h-q069 (answer イ, A∩B ⊆ A), 2015h27h-q062 (answer ウ, A∩B ⊆ A∪B), 2014h26h-q057 (answer エ; wrong ア is the en after-span hit of p06), 2009h21a-q064 (u01 L1 example).
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
6. **Gates** (each on both units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b55): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 91 / u02 207) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-33-u01
✓ technology-13-33-u01 unit: 0 issues (data/ip/textbook/units/technology-13-33-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-33-u01
✓ technology-13-33-u01 parity: 23 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-33-u02
✓ technology-13-33-u02 unit: 0 issues (data/ip/textbook/units/technology-13-33-u02.json), 12 warning(s)
  warn  zh-term  overview_rows[0].extra_zh[1]  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](集合).fig.data.rows[0].cells[0].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](集合).fig.data.rows[1].cells[0].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](集合).fig.data.rows[2].cells[0].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[1](ベン図).fig.data.rows[1].cells[3].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[1](ベン図).fig.data.rows[3].cells[3].zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[2](真理値表).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[3](論理演算).detail_zh  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[7](XOR).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  pairs[0].rows[1].a_zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  pairs[0].rows[1].b_zh  集合 → 集合 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  key_points_zh[3]  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-33-u02
✓ technology-13-33-u02 parity: 32 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#1 0 issues (sha256 8f864a48… = base_sha256) EXIT=0
                        u02 loc#1 0 issues, 12 warning(s) (sha256 247b5f88… = base_sha256) — the same 12 zh-term warns EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 3 ok 3 | u02 active 9 ok 9 | issues [] for both
  part-level: base sha = base_sha256 for all 12; before count in base = 1 for all 12; replay mismatch 0
  changed base-present paths = patched fields + 'stage' (u01 3+1 / u02 9+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 42 / 84, mismatch 0 (u02 terms[7].explanation_zh/en: true; summary.key_points_jp[3] = key_points_jp[3])
  bold counts unchanged in all 12; [[jp:]] counts unchanged except u02 p02 / p03 (terms[0].points[0].text_zh/en 4→3: [[jp:部分集合]] dropped) — intended (§3.1)
  memory_hooks hooked-terms pairing: u01 3/3 (減算 has no hook), u02 8/8 per language, bad 0
  net before remnant: 0 for all 12 (raw and markup-stripped)
  ruleA verbatim miss: u01 [] | u02 []
whole-field = Rule A after: u02 all 9 patched fields appear verbatim as whole fields in the Rule A file;
  u01 Rule A gives the patched sentence only — sentence 1 of each field = Rule A after, sentence 2 unchanged from base.
```

The 12 u02 `zh-term` warns are in fields no patch touches and appear identically on the base part and in the Rule A gate output, so they predate the patches (Rule A u02 §4: all false positives).

**Application.** All 12 `before` strings occur exactly once in their base field, all 12 `after` strings are present, replay reproduces every patched field. All 12 before / after pairs are the Rule A text verbatim, and the shortened before / after give whole fields equal to the Rule A after text.

D-198, before → after (`d198.mjs`, 140 sources per language; jp fields only carry the window columns):

| Patch | Lang | Field LCS before → after (nearest source) | Longest `after`-span overlap | jp 12-char windows unmasked / masked |
|---|---|---|---|---|
| u01 p01 | **jp** | 7 → 7 (16進数の A, term + letter, unchanged sentence 2) | 2進数に (4) | 0 / 0 → 0 / 0 |
| u01 p02 | zh | 5 → 5 (十六进制数, term) | " 4 位" (4) | — |
| u01 p03 | en | 13 → 13 (" hexadecimal ", term) | " the right " (11, generic) | — |
| u02 p01 | **jp** | **11 → 4** (つの集合 A と B → はすべて) | はすべて (4, generic) | **9 / 14 → 0 / 0** (all before hits = q069 イ / ウ / エ and q062 イ / ウ) |
| u02 p02 | zh | 7 → 4 (A 和 B → 两个集合) | 两个集合 (4) | — |
| u02 p03 | en | **20 → 16** (" is a subset of the " q069 ア → "the intersection" q069 stem, term) | 16 (term) | — |
| u02 p04 | **jp** | 4 → 4 (決まった) | 決まった (4) | 0 / 0 → 0 / 0 |
| u02 p05 | zh | 9 → 9 (“是”或“否”回答, unchanged part) | “是”或“否” (7) | — |
| u02 p06 | en | 11 → 13 | " one or more " (13, 2014h26h-q057 ア — see note) | — |
| u02 p07 | **jp** | 6 → 6 (ビットごとの, unchanged part) | 反転する。(5) | 0 / 0 → 0 / 0 |
| u02 p08 | zh | 5 → 5 (两个输入都, unchanged part) | XOR (3) | — |
| u02 p09 | en | 17 → 17 (" both inputs are ", unchanged part) | " such as " (9) | — |

Near-match of the H1 field `terms[0].points[0].text_*` (sentence level, sources of normalized length ≥8):

| Lang | Before: best (q069) | After: best overall | After: best vs 2010h22h-q069 | After: max Dice |
|---|---|---|---|---|
| jp | q069 イ wed **0.08** / Dice 0.43 (masked same) | q069 イ / エ, q062 イ wed 0.69 / Dice 0.07 (masked same) | イ wed 0.69 / Dice 0.07 | 0.16 (q069 ア); masked max 0.16 |
| zh | q069 イ wed 0.25 / Dice 0.23 | q069 ア wed 0.81 / Dice 0.08 | ア wed 0.81 / Dice 0.08 | 0.16 (q062 stem) |
| en | q069 イ wed 0.30 / Dice 0.26 | 2013h25a-q064 ウ wed 0.55 (generic) | イ wed 0.65 / Dice 0.15 | 0.45 (2012h24h-q052 stem = 0.45 = q069 stem — see note) |

Notes:
- u02 p06: the 13-char en overlap " one or more " is with a **wrong** option (2014h26h-q057 ア, "one or more inputs For → For"). The analogy counts **inputs** (1 for NOT, 2+ for the others), not "yes" answers among them, and it is the general analogy of 論理演算, not AND (q057's subject). jp (1 つ以上 vs the choice's 一つ以上…賛成, LCS 4) and zh (一个或多个 vs 一个以上) do not share the phrase. Generic English, not a copy and not support of ア (obs. 2).
- en Dice 0.45 is the English character-bigram floor: the unrelated 2012h24h-q052 stem (2's complement) scores the same 0.45 as the q069 stem. Before the patch the q069 stem was 0.42 (shared vocabulary: two sets / intersection / union). Below the 0.52 calibration; windowed ed 0.65 vs q069 イ is far from 0.14.

**H1 is fully resolved**: 0 jp windows after (unmasked and masked), q069 イ jp wed 0.08 → 0.69, zh 0.25 → 0.88 (イ) / 0.81 (ア), en 0.30 → 0.65; no field LCS above 16 in any language, and 16 is the term "the intersection". No patch adds a copy-level overlap.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01–p03 | `terms[1](基数変換).points[1].text_jp/zh/en` | L1 | Yes (§3.3): 右端から / 从右端起 / "starting from the right end" fixes the grouping start. 2009h21a-q064: 55(8) → 101 101 → from the right 0010 1101 = 2D = ア. D-200: jp 2 sentences / 74 chars | No | OK |
| u02 p01–p03 | `terms[0](集合).points[0].text_jp/zh/en` | **H1 (HIGH, D-198)** | Yes (§3.1): the option sentence with its A / B notation is gone in all three languages; 0 windows; near-match far from calibration. Claim A∩B ⊆ A ⊆ A∪B kept, supports q069 イ and q062 ウ, no option set reproduced (D-208 (iii)). [[jp:]] origins kept. D-200: jp 2 sentences / 73 chars | No | OK |
| u02 p04–p06 | `terms[3](論理演算).analogy_jp/zh/en` | **M1 (MEDIUM, D-204)** | Yes (§3.2): 受け取った 1 つ以上の答えから…1 つ返す covers one-input NOT and multi-input operations; agrees with terms[3].detail, terms[6] one / detail, overview_rows[6].extra | No (obs. 2) | OK |
| u02 p07 | `key_points_jp[3]` (+ summary.key_points_jp[3]) | L1 | Yes: 相手が 0 / 1 の桁 = zh 对方为 0 的位 / en "in the other operand", = AND points[0] / XOR points[1] | No | OK |
| u02 p08–p09 | `terms[7](XOR).detail_zh/en` (+ explanation_zh/en) | L2 | Yes: error detection is now attributed to XOR itself (XOR 还用于 / "and XOR is also used"), not to the self-inverse property; = jp 誤りの検出などにも使われる (subject XOR) | No | OK |

## 3. Focused checks

### 3.1 u02 p01–p03: H1 (D-198 copy of 2010h22h-q069's correct option)

- After:
  - jp: どんな 2 つの集合でも、積集合の要素はすべてもとの集合に入り、もとの集合の要素はすべて和集合に入る。包含は「積集合 ⊆ もとの集合 ⊆ 和集合」の順に並ぶ。
  - zh: 对于任意两个集合（[[jp:集合]]），交集（[[jp:積集合]]）的元素都属于原集合，原集合的元素又都属于并集（[[jp:和集合]]）。包含关系按“交集 ⊆ 原集合 ⊆ 并集”的顺序排列。
  - en: For any two sets ([[jp:集合]]), every element of the intersection ([[jp:積集合]]) is in each original set, and every element of an original set is in the union ([[jp:和集合]]). Inclusion runs in the order "intersection ⊆ original set ⊆ union."
- Copy: the replaced clause (A∩B は A の部分集合であり) was the q069 イ sentence in its own notation; it and the A / B framing (どんな 2 つの集合 A と B でも ↔ the stem's 二つの集合 A と B について常に成立) are gone. The new wording uses no A / B, no ∩ / ∪, and not the option predicate 部分集合である. Results in §1: 0 / 0 windows, wed ≥0.65 in all three languages.
- Claim, against the cited questions (re-read, answers checked):
  - 2010h22h-q069 (answer イ, A∩B ⊆ A): "every element of the intersection is in each original set" = A∩B ⊆ A (and ⊆ B), so イ is supported. ア (⊆ not-A) is contradicted (the elements are in A). ウ (A∪B ⊆ A∩B) and エ (A∪B ⊆ A) run the other way from "original ⊆ union" and the chain, so neither is supported.
  - 2015h27h-q062 (answer ウ, A∩B ⊆ A∪B): follows from the chain 積集合 ⊆ もとの集合 ⊆ 和集合 (sentence 2, unchanged). イ (A∪B ⊆ A) and the complement options are not supported.
  - Limiting condition 「常に成立」 is kept by どんな 2 つの集合でも / 任意 / any.
- D-208 (iii): the point makes one general claim (the inclusion chain), stated as element membership. It does not list, negate or reorder the option set, and does not reuse the stem's definitions of ∩ / ∪.
- Agreement with the unit: the membership wording is exactly the 部分集合 definition in terms[0].detail_jp (集合 X の要素がすべて集合 Y にも入っているとき、X を Y の部分集合という), so the point still says "subset" in definitional form. Same fact as key_points_jp[0] (obs. 3).
- [[jp:]] markers: zh / en 4 → 3 (`[[jp:部分集合]]` dropped together with the word 子集 / subset, as in jp). The 11 marker kinds left in u02 (集合 / 積集合 / 和集合 / ベン図 / 論理式 / 否定 / 真理値表 / 論理積 / 論理演算 / 論理和 / 排他的論理和) all have their origin in jp text (script). No [[jp:部分集合]] remains anywhere in the unit, so no orphan; 部分集合 is still taught in terms[0].detail (jp **部分集合** / zh **子集** / en subset) and overview_rows[0].extra.
- 三語: same two facts in the same order. en "each original set" is more explicit than jp もとの集合 but states the same (true) fact. Parity 0 diff.
- **HIGH resolved.**

### 3.2 u02 p04–p06: M1 (D-204 analogy scope)

- After: jp 質問に「はい」か「いいえ」でしか答えない係が、受け取った 1 つ以上の答えから、決まった手順で「はい」か「いいえ」を 1 つ返す作業。/ zh …根据收到的一个或多个回答，按固定步骤返回一个“是”或“否”。/ en …and, from the one or more answers received, returns a single "yes" or "no" by a fixed procedure.
- Scope: "1 つ以上 / 一个或多个 / one or more" inputs includes the one-input case. The analogy no longer excludes a member that the unit says belongs to the category:
  - terms[3].detail_jp 入力を 1 つだけとる否定もある ✓
  - terms[6](NOT).one 1 つの入力の 0 と 1 を入れ替える ✓
  - terms[6].detail 入力を 1 つだけとる単項演算 ✓
  - overview_rows[6].extra [単項演算, 入力が 1 つだけ] ✓
- Output side: 「はい」か「いいえ」を 1 つ返す = terms[3].one 1 か 0 を返す ✓. Inputs being yes / no answers = only two values (真 / 偽) ✓.
- The image still fits AND / OR / XOR (several answers → one) and does not prefer one operation.
- 三語 same structure. D-204: the analogy no longer contradicts any member. **MEDIUM resolved.**

### 3.3 u01 p01–p03: L1 (grouping start)

- 右端から / 从右端起 / "starting from the right end": grouping binary digits in 3s or 4s from the least significant end is the correct procedure. Rule A's example: 101101 grouped from the left as 1011 / 01 gives a wrong value; from the right, 10 1101 → 0010 1101 = 2D.
- 2009h21a-q064 (55(8) → answer ア 2D(16)): supported. 2012h24a-q079 (A3(16) = 163) is unaffected (sentence 2 unchanged).
- jp 74 chars (Rule A's 70 → 74); 2 sentences. 三語 parity ✓; [[jp:8進数 / 16進数 / 2進数]] counts unchanged (zh / en 3 → 3).
- **Resolved.**

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect that needs a fix.

## 5. Observations (record only)

1. u02 zh-term warns (12): unchanged by the patches; same as the base part and the Rule A gate output. All judged false positives in Rule A u02 §4. The new zh point uses 交集 / 并集 / 集合, the same pattern as before.
2. LOW (no fix), u02 p06: en "from the one or more answers received" shares the 13-char phrase " one or more " with 2014h26h-q057 ア (a wrong option, "one or more inputs For → For"). The analogy counts inputs, not "yes" answers. It is the general 論理演算 analogy (AND is q057's subject; AND's own points[1] says すべて 1 のときだけ). jp / zh do not share the phrase. No misleading effect found; not a copy.
3. LOW (D-203 §9, pre-existing): terms[0].points[0] sentence 1 now restates key_points_jp[0] (積集合はもとの集合に含まれ、もとの集合は和集合に含まれる) almost word for word, and sentence 2 restates it as a chain. The same restatement existed before the patch, then with symbols. Not required.
4. Script notes:
   - `stage` meta is removed in both units (as in b19–b55).
   - check.mjs's "ruleA verbatim" test is a substring test. Because the main session shortened before / after, I also checked whole fields: u02 whole fields appear verbatim in Rule A, and u01 Rule A gives the sentence only (§1).
   - d198.mjs's near-match skips sources shorter than 8 normalized chars (single letters / numerals give a trivial ed 0). The jp masked columns skip sources with <6 real chars after masking.

## 6. Overall verdict

- HIGH: 1 in scope (u02 H1) — **resolved**; **0 introduced**
- MEDIUM: 1 in scope (u02 M1) — **resolved**; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 2–3. Obs. 1 and 4 are notes.
- **Application:** 12/12 exact (replay, all part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (126 checked, 0 mismatch). 12/12 match the Rule A text verbatim, and the shortened pairs give whole fields equal to the Rule A after text. Every 建議修, the HIGH and the MEDIUM are covered.
- **D-198:** H1 field 9 / 14 jp windows → 0 / 0; q069 イ wed 0.08 → 0.69 (jp), 0.25 → 0.88 (zh), 0.30 → 0.65 (en); max Dice after 0.16 jp / 0.16 zh / 0.45 en (= English floor). No other patch adds a copy-level overlap; 0 jp windows after in every jp field. The one wrong-option hit (u02 p06 vs 2014h26h-q057 ア, 13 chars, en only) is generic and does not support ア.
- **D-200:** u01 terms[1].points[1] 2 sentences / 74 chars; u02 terms[0].points[0] 2 sentences / 73 chars (≤ 100).
- **D-202:** no `[[jp:]]` added; `[[jp:部分集合]]` dropped with its word; all 11 remaining marker kinds have their jp origin.
- **D-204:** the M1 analogy now covers one-input NOT and agrees with terms[3].detail, terms[6].one / detail and overview_rows[6].
- **D-208 (iii):** the new H1 point states the inclusion chain supported by q069 イ / q062 ウ without reproducing or tracing an option set.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×2 (u02: 12 pre-existing zh-term warns)
  - validate --part: 0 issues ×2 (sha256 = base_sha256)
  - parity: 0 diff ×2 (23 / 32 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 12 active patches of technology-13-33 u01–u02 are applied exactly. Each resolves its Rule A finding, including the u02 HIGH (D-198 copy of 2010h22h-q069 イ) and MEDIUM (analogy excluding NOT) that made Rule A u02 FAIL. None introduces a HIGH, MEDIUM or LOW that needs a fix. No required F-fix.
