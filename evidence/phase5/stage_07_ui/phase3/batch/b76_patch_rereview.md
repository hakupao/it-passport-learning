# b76 B3 patch re-review — technology-14-36-u01 (データ構造の基本)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audit, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b76rv/`: `check.mjs` / `d198.mjs` / `same.mjs` / `raverb.mjs` copied from `b72rv/` (the version with the per-language choice fix) with only the unit map changed (1 unit, topic technology-14-36; base attempt `b76-u01-a1`, round `r0`) and `ra.json` replaced by the 11 Rule A before / after pairs, copied by hand from the Rule A L1 / L2 / L3 "修正案" cells. Extra one-off `node -e` checks (remnant greps, tree / analogy context dump, 14-37 term scan, unit revert + sha, q062 / q076 en context) were run from the shell; no scratch files in the repo.
- Date: 2026-11-09 (Session 151, b76)
- Scope: the B3 wording patches for 1 unit. **11 are `active`, 0 retired**, part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (データ構造の基本) | **PASS** (HIGH 0 / MEDIUM 0 / LOW 8), 建議修 L1–L3 (L4–L8 記録のみ) | p01–p11 | L1 → p01–p03 (`terms[3].points[0].text_jp/zh/en`, 「1 つだけ」→「1 つまで」/ 只连着 → 最多连着 / only one → at most one) + p04–p06 (`pairs[1].rows[0].a_jp/zh/en`); L2 → p07–p09 (`terms[4].analogy_jp/zh/en`, tournament bracket → yes/no diagnostic chart); L3 → p10–p11 (`overview_rows[1].extra_en[1]`, `overview_rows[2].extra_en[1]`) | 3/11 (p01–p03: `before` / `after` are the clause inside the `points[0]` sentence; the Rule A 修正案 itself is written as this same clause). p04–p11 are whole-field strings |

  All three 建議修 are covered (L1 both locations × 三語, L2 × 三語, L3 en × 2). 記録のみ LOWs L4–L8 (including the optional L4 wording offer and the L2 hook note) and O1 / O2 are not patched and not re-ruled here.
  - **Shortened strings**: `same.mjs` confirms that each Rule A before occurs exactly once in its base field and base.replace(Rule A before, Rule A after) = unit field for all 11 fields, so the shortened patches give the same result as the Rule A strings.
- Pre-patch base, located by sha256 = `base_sha256` (validate --part prints the same sha): `data/ip/textbook/.planning/v2/technology-14-36-u01/parts/b76-u01-a1/technology-14-36-u01.loc.r0.json` `44157a92520fc991…`
- Merged unit (current) `data/ip/textbook/units/technology-14-36-u01.json` sha256 `0432823fd2ee99f4…` (= `.planning/v2/technology-14-36-u01/merged.json`, deep-equal). It differs from the base only by the 11 patched fields and the removed `stage` meta key (§1). Reverting the 11 patch texts in the unit file (1 occurrence each, p01 before p04) gives sha `591eb01b394235e6…`; with `overview.est_minutes` also put back from 27 to 26 it gives `20b77c6c590618f3…` = the unit sha the Rule A audit states. So the Rule A subject is exactly this file minus p01–p11, and the only other change is `est_minutes` 26 → 27, recomputed by the patch tool from the longer analogy text (`textbook-v2-patch.mjs` header: "compat fields and est_minutes follow the patched text"; `unit_minutes.json` also says 27).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A file.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b72_patch_rereview.md` §0 (no unit-level patches). Topic technology-14-36 has 7 questions, so there are 35 source strings per language (7 stems + 28 choices).

1. **Application check** (`b76rv/check.mjs`): base sha256; `before` once in the base field; replay = unit field; every changed base-present path explained; net `before` remnant count; before / after verbatim (substring) in the Rule A file. Plus `b76rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field. `b76rv/raverb.mjs`: all 22 Rule A strings verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing). None of the 11 patched fields has a derived copy (points / pairs / analogy / overview_rows are not copied).
3. **D-198** (`b76rv/d198.mjs`, per-language choices): whole-field LCS before → after and LCS of the `after` span against the 35 sources of the patch language; for jp also 12-char windows and Dice.
4. **Cited-question check**: the patched terms (リスト `terms[0]` context, 木構造 `terms[3]`, 2分木 `terms[4]`) have no cited questions (quiz `[]` for terms[0] / [3] / [4]; all 7 topic questions are stack / queue). p10 / p11 touch the stack / queue rows of the overview, so they were checked against 2018h30a-q076 (正答イ = the last stored item comes out first), 2011h23tokubetsu-q058 / 2018h30h-q096 (k-th out = k-th stored), and the stack-order questions 2010h22h-q085 / 2016h28a-q092 / 2019r01a-q062 (Rule A §1-2 traces).
5. **Tree-structure check of the new analogy**: read p07–p09 against `terms[3]` (root = no parent, leaf = no children, every non-root node has one parent, one root) and `terms[4]` (at most two children, left / right distinct, a node may have one child or none; fig = root → left child [2 leaves] + right child [1 leaf]; points[0] "2 is an upper limit, not exactly 2").
6. **Remnant / wording greps** unit-wide: 「1 つだけ」/「只有 1 个」/ "only one", 「1 つまで」/「最多 1 个」/ "at most one", トーナメント / 淘汰 / tournament / bracket, 診断 / 诊断 / quiz chart, 二股 / 两股, ちょうど / 正好 / exactly.
7. **Cross-unit**: technology-14-37 u01–u05 (擬似言語・配列, v2) scanned for 配列 / 数组 / array, リスト / 列表 / list, スタック / 栈 / stack, キュー / 队列 / queue, 要素 / 元素 / element in all three languages.
8. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b72): the unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches (and the recomputed `est_minutes`) changed relative to the Rule A subject. Unit-only paths (121 string paths) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-09)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-36-u01
  → ✓ 0 issues   EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-36-u01   → ✓ 29 locations, 0 diff   EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>
  counts {"terms":5,"figs":5,"steps":11,"points":8,"pairs":2,"key_points":4,"goals":3}
  sha256 44157a92520fc991aefb3bea3ff740ccd3c70666a61afe270a174495bc507a8a (= base_sha256 of p01–p11)   ✓ 0 issues   EXIT=0
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
vitest src/lib/textbook: Test Files 1 failed | 12 passed (13), Tests 1 failed | 161 passed (162)
  FAIL v1-snapshot.test.ts > "every current v1 unit matches its recorded dictionary senses and unit anchors"
       AssertionError: expected 0 to be greater than 0  (line 25: expect(Object.keys(now).length).toBeGreaterThan(0))
check.mjs:
  active 11 ok 11 | issues [] | changed base-present = stage + the 11 patched fields | unexplained besides 'stage' 0
  base-only top keys: stage / round / jp_round (part metadata) | unit-only paths 121
  derived 57, mismatch 0 | memory_hooks 15 checked, bad 0, lens 5/5/5
  net before remnant: p01–p03, p06–p11 raw 0 / stripped 0; p04 「1 つだけ」 6, p05 「只有 1 个」 4 (see §U1.3: all tree-side facts, not list claims)
  bold: terms[3].points[0] jp/zh/en 2→2; all others 0→0 | [[jp:]]: terms[3].points[0] zh/en 2→2; all others 0→0
  ruleA verbatim miss: []
same.mjs: Rule A before occ in base 1 (11/11); base.replace(Rule A before, Rule A after) == unit field: true (11/11)
raverb.mjs: 22 Rule A strings, verbatim miss 0
d198.mjs (per-language choices): topic qs 7, sources jp 35 / zh 35 / en 35
  p01 jp 4 → 4 ("る要素は", q058 stem) win12 0/0 → 0/0 | p02 zh 3 → 3 | p03 en 12 → 12 (" structure (", q085 stem) after-span 11
  p04 jp 2 → 2 | p05 zh 2 → 2 | p06 en 7 → 6 (" most ", q076 cイ)
  p07 jp 3 → 3 win12 0/0 → 0/0, Dice 0.07 → 0.05 | p08 zh 2 → 2
  p09 en 7 → 12 ("n only one s", 2019r01a-q062 stem) | p10 / p11 en 13 → 10 (" out first", 2016h28a-q092 stem)
unit revert: p01–p11 after → before, 1 occurrence each → sha 591eb01b…; + est_minutes 27 → 26 → sha 20b77c6c590618f3 (= Rule A stated sha)
  reverted unit vs base: base-present diff 0
```

**vitest failure — not caused by the patches.** The failing test asserts that at least one v1 unit exists. At HEAD 12 units are still `stage4-unit-v1-trilingual` (strategy-06-21-u01, technology-14-36-u01, technology-14-38-u01/u02/u03, technology-14-39-u01, technology-19-50-u01/u02, technology-20-53-u01/u02/u03, technology-21-54-u01); in the working tree all 12 are v2 (all 244 units `textbook-unit-v2`), so the v1 set is empty and the `> 0` check fails. It depends only on schema_version, not on any patched text; with p01–p11 reverted it would fail the same way. It is a batch-level gate issue for the commit of the last v1 → v2 units (b72–b77), not an F-fix for this unit (§5 O1).

`validate --unit` prints 0 warns (no `choice-echo`), as the Rule A §1-4 states. `stage` meta is removed in the unit (as in b19–b72).

**Application.** Each `before` string occurs exactly once in its base field, each `after` string is present, replay reproduces all 11 patched fields, net `before` remnant 0 for p01–p03 / p06–p11. p04 / p05 remnants are other fields (§U1.3). p01–p03 are shortened phrases equal to the Rule A strings and give exactly the Rule A after text (same.mjs true).

## U1. technology-14-36-u01 (Rule A PASS, 建議修 L1–L3)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → 4 (q058 stem), win12 0 → 0 | 4 |
| p02 | zh | 3 → 3 | 3 |
| p03 | en | 12 → 12 (" structure (", q085 stem; unchanged part of the sentence) | 11 ("ch element ", q058 stem) |
| p04 / p05 | jp / zh | 2 → 2 | 2 |
| p06 | en | 7 → 6 (" most ", q076 choice イ "most recently") | 6 |
| p07 / p08 | jp / zh | 3 → 3 (win12 0 → 0, Dice 0.07 → 0.05) / 2 → 2 | 3 / 2 |
| p09 | en | **7 → 12** ("n only one s", 2019r01a-q062 stem) | 12 |
| p10 / p11 | en | 13 → 10 (" out first", q092 stem) | 10 |

- **One rise, not copying.** p09 "continue on **only one s**ide" shares 12 characters with the q062 stem "when **only one s**uch device is used". The overlap is a common function-word phrase with a different meaning (one side of a question vs. one stack device), it carries no option content, and the 2分木 analogy has no cited question (q062 is a stack question; its 正答ウ is about output order). Not D-198 (i)–(iii). All other patches are flat or fall; jp 12-char windows are 0 before and after.
- p06 " most " (q076 イ "most recently") is a function word; the meaning ("at most one next element") is unrelated to LIFO.

### U1.2 Per-patch verdict

| ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[3].points[0].text_jp` | L1 | Yes (§U1.3) | No | OK |
| p02 | `terms[3].points[0].text_zh` | L1 | Yes | No | OK |
| p03 | `terms[3].points[0].text_en` | L1 | Yes | No | OK |
| p04 | `pairs[1].rows[0].a_jp` | L1 | Yes | No | OK |
| p05 | `pairs[1].rows[0].a_zh` | L1 | Yes | No | OK |
| p06 | `pairs[1].rows[0].a_en` | L1 | Yes | No | OK |
| p07 | `terms[4].analogy_jp` | L2 | Yes (§U1.4) | No | OK |
| p08 | `terms[4].analogy_zh` | L2 | Yes | No | OK |
| p09 | `terms[4].analogy_en` | L2 | Yes | No (D-198 rise, §U1.1, not copying) | OK |
| p10 | `overview_rows[1].extra_en[1]` | L3 | Yes (§U1.5) | No | OK |
| p11 | `overview_rows[2].extra_en[1]` | L3 | Yes | No | OK |

### U1.3 Focused checks — L1 (list "next element" count)

- **After (三語)**: `terms[3].points[0]` jp 「**リスト**では各要素の次につながる要素は 1 つまでだが、**木構造**では 1 つの節の下に複数の子がつながる。」 / zh 「……每个元素后面最多连着 1 个元素；而在**树结构**……可以连着多个子节点。」 / en "… each element links to at most one next element, whereas in a **tree structure** … one node can have several children below it." `pairs[1].rows[0]` (label 次につながる要素 / 后面连着的元素 / Elements linked next, key row): a = 「1 つまで」/「最多 1 个」/ "At most one", b = 「複数の子がつながりうる」/「可以连着多个子节点」/ "Several children can be linked".
- **Agrees with the list figure now**: `terms[0].fig` (table) has the tail row ぶどう with pointer 「なし (末尾)」/「无（末尾）」/ "None (tail)". "At most one" covers both the inner elements (1) and the tail (0), so the key-point / pair claim no longer contradicts the figure. The contrast with the tree side stays sharp (at most one vs. several), and the three languages carry the same upper-limit wording (まで / 最多 / at most), which also matches the 2分木 wording 「2 つ以下」/「最多 2 个」/ "at most two" in the same unit.
- **Remnants are tree facts, not list claims**: the 6 remaining 「1 つだけ」 are `terms[3].detail_jp` (+ explanation) "every non-root node has one parent", `terms[3].points[1].text_jp` "one root per tree", `terms[3].fig.steps[0].caption_jp` "one top node", `terms[4].detail_jp` (+ explanation) "a node with only one child is allowed". The 4 「只有 1 个」 are the zh of the same three facts (points[1], fig caption, terms[4] detail + explanation). All are correct with 「だけ」 (exactly one), so none needs the L1 change. No other field says a list element has "only one" next element (`terms[0]` one / detail / points / overview_rows[0] / key_points[0] read in full).
- p01–p03 keep bold 2 and `[[jp:]]` 2 (zh / en). Derived fields: none for these paths.

### U1.4 Focused checks — L2 (2分木 analogy) and tree structure

- **After (三語)**: jp 「はい / いいえで進む診断チャートのようなもの。1 つの質問から先は「はい」と「いいえ」の 2 方向までに分かれ、片方にしか続きがない質問や、そこで結果が出て終わる質問もある。」 / zh 「就像按"是 / 否"往下走的诊断流程图。每个问题往下最多分成"是"和"否"两个方向，也有只有一边接着往下走的问题，或者到此给出结果、不再往下的问题。」 / en "Think of a yes/no quiz chart. Each question leads on in at most two directions, yes and no; some questions continue on only one side, and some end there with a result."
- **Mapping to the tree, consistent in all three languages**: question = node; yes / no = the two child slots, which are distinct (= `terms[4].detail` "left and right children are treated as distinct"); "at most two directions" = `one` 「2 つ以下」 and `points[0]` "2 is an upper limit"; "continue on only one side" = a node with one child (detail 「子が 1 つだけの節…があってもよい」, and the fig's right child with one leaf); "ends there with a result" = a leaf with no children (detail, `terms[3].points[1]`). The image no longer suggests that every inner node has exactly two children, which is the reading `points[0]` rejects. Reading downward from one first question also fits a single root.
- **Nothing misdescribed**: the analogy says nothing about the number of parents, the number of roots, or more than two children, so it does not contradict `terms[3]` (one root, each non-root node one parent, leaves = no children) or the 木構造 vs 2分木 contrast. 2分木 has no cited question (quiz `[]`, no challenge question about trees), so no 正答 can be contradicted. jp 「2 方向まで」 = zh 「最多…两个方向」 = en "at most two directions".
- **Unchanged and noted**: hook_jp/zh/en (「二股に分かれる枝」 / 分成两股的树枝 / "a branch that forks into two") are Rule A L2 記録のみ and not patched; the new analogy's "up to two / one side / none" now carries the upper-limit reading next to it. "Tournament / bracket / 淘汰" 0 fields remain. Derived fields: analogy has no derived copy (compat strips analogy_*).

### U1.5 Focused checks — L3 (overview en, stack / queue)

- `overview_rows[1].extra_en[1]` (スタック) "Last item stacked comes out first" = jp 「最後に積んだものから取り出す」 = LIFO = q076 正答イ (the last stored item comes out first), and fits the stack-order traces of q085 / q092 / q062 (Rule A §1-2). `overview_rows[2].extra_en[1]` (キュー) "First item added comes out first" = jp 「最初に入れたものから取り出す」 = FIFO = q058 正答イ / q096 正答ア (k-th out = k-th stored). The doubled "first first" and the "stacked last first" reading problem are gone; the jp / zh cells are unchanged. Column 2 of the other rows (リスト / 木構造 / 2分木) is in imperative form ("Follow the pointers…", "Go from the top node…"), so stack / queue are now declarative. This is a small style difference in a table cell and the meaning is clear. Not a defect (§5 O3).

### U1.6 Cross-unit — technology-14-37 (擬似言語・配列)

- Terms in this unit: リスト / 列表 / List, スタック / 栈 / Stack, キュー / 队列 / Queue (zh 栈 18, 队列 11, 列表 11 occurrences, no 堆栈 / 链表 variants). 配列 / 数组 / array in `terms[0].points[0]` matches 14-37 u03 `terms[3].points[1]` and u04 `terms[1].detail` (配列 / 数组 / array, 要素 / 元素 / element). 14-37 has no term-level use of list / stack / queue (en "stack of numbered tickets" in u05 analogy, "whole list" in a u05 caption, "stacked vertically" in u01 are plain English), so there is no conflict. The patches touch no array / stack / queue term names.
- Small note (unpatched, out of scope): 14-36 `terms[0].points[0]` says 「番号で直接参照」 / 按编号 / "by index", while 14-37 u03 says 要素番号 / 元素编号 / "element number". Both are correct; not a terminology conflict (§5 O2).
- Parity 29 / 0 diff. **u01: L1–L3 resolved; no new HIGH / MEDIUM / LOW.**

## 4. F-fix

No required F-fix. The patches introduce no HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. **Gate O1 — v1-snapshot test (batch-level, not this unit)**: `apps/web/src/lib/textbook/__tests__/v1-snapshot.test.ts` fails (`expected 0 to be greater than 0`) because the working tree converts the last 12 v1 units to v2, so no v1 unit is left. The test needs a change before the b72–b77 units are committed (for example, pass when the current v1 set is empty, or retire the test now that the v1 phase is over). This is a test-file decision for the writer / owner; it is not a unit F-fix and it does not depend on p01–p11. vitest without this test: 161 / 161 pass.
2. O2: 14-36 "by index" / 番号 vs 14-37 "element number" / 要素番号 (both correct, unpatched).
3. O3: overview column 2 is now declarative for スタック / キュー and imperative for the other three rows (en only, meaning clear).
4. O4: a real diagnostic chart can merge paths (two answers leading to the same result), which a tree cannot. The analogy does not say this, so it does not misdescribe the tree. Record only.
5. Script notes: copied from `b72rv/` (per-language choice fix kept); `ra.json` = 11 pairs. `est_minutes` 26 → 27 is the patch tool's recompute (explains the Rule A sha difference). `stage` meta removed (as in b19–b72). Base is `b76-u01-a1` / `loc.r0`.
6. Rule A L4–L8 (「と覚える」, key_points restating, tree fig all ≤2 children, goals pre-use / zh 根（[[jp:根]]）, q058 shape) and O1 / O2 stay 記録のみ, not re-ruled. L6 note: the 木構造 fig example still has no node with 3+ children; the new 2分木 analogy does not change that.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-14-36-u01 | PASS | **11/11** | — (Rule A MEDIUM 0) | 0 / 0 / 0 | **PASS** |

- **Application:** 11/11 exact (replay, part-level). 0 unexplained diffs, net `before` remnant 0 (p04 / p05 remnants are other, correct tree facts), derived fields 57 checked 0 mismatch, memory_hooks pairing 0 bad. p01–p03 are shortened and give the same field as the Rule A strings (same.mjs 11/11). Reverting p01–p11 plus the recomputed `est_minutes` reproduces the Rule A unit sha `20b77c6c590618f3`.
- **D-198:** one rise (p09 en 7 → 12, common phrase "only one s…", different meaning, no option content, term without cited questions); all others flat or lower; jp windows 0. **D-202:** bold / tag counts unchanged. **D-204:** the 2分木 image now shows "up to two, one, or none", in line with `one` / `detail` / `points[0]` / fig. **D-204 / 書き方 7:** list "at most one" now matches the tail row 「なし (末尾)」 and the 2分木 「2 つ以下」 wording. **D-205 / D-210:** no new claim.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 (0 warns)
  - validate --part: 0 issues, sha256 = base_sha256
  - parity: 29 locations, 0 diff
  - patch tests: 14/14
  - vitest textbook: **161/162**. The 1 failure is `v1-snapshot.test.ts` (no v1 units left in the working tree; O1). It is independent of these patches but must be fixed in the test file before the batch commit.

**PASS** (patch re-review). All 11 active patches are applied exactly. L1 (list "at most one", both locations × 三語), L2 (2分木 analogy → yes/no chart, correct about root / child / leaf and at most two children, no cited question contradicted) and L3 (en LIFO / FIFO cells, consistent with q076 / q058 / q096) are resolved in context. No required F-fix. Batch-level blocker for the commit (not this unit): the v1-snapshot vitest needs updating now that the v1 set is empty.
