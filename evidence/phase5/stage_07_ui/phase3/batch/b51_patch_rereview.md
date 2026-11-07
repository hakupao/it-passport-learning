# b51 B3 patch re-review — technology-14-37 u01–u05 (制御構造と表現手法 / 式・代入・注釈 / 入出力と手続・関数 / データ型 / 探索と整列のアルゴリズム, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b51rv/`: `check.mjs` and `d198.mjs` are derived from `b50rv/` (only the unit map, the topic and the base parts changed); `mask.mjs` (whole-field jp windows, masked / unmasked), `full.mjs` (full Rule A after-sentence vs unit) and `u03.mjs` (u03 L1 Dice / ed) are new for b51.
- Date: 2026-11-08 (Session 150)
- Scope: the B3 wording patches for technology-14-37 u01–u05. **33 are `active`, 0 retired**: u01 p01–p09 / u02 p01–p11 / u03 p01–p03 / u04 p01–p04 / u05 p01–p06 (`patches/technology-14-37-u0{1..5}.json`). All 33 are part-level (no `unit.*` field).
  - Mapping to Rule A prescriptions:
    - u01 (**FAIL**, MEDIUM M1 / M2, 建議修 L3): M1 → p01–p03; M2 → p04–p06; L3 → p07–p09
    - u02 (PASS, 建議修 L1–L6 + optional L13): L1 → p01–p03; L2 → p04; L3 → p05–p07; L4 → p08; L5 → p09; L6 → p10; L13 → p11
    - u03 (PASS, 建議修 L1): L1 → p01–p03
    - u04 (PASS, 建議修 L1 / L2): L1 → p01–p03; L2 → p04
    - u05 (**FAIL**, MEDIUM M1, 建議修 L1): M1 → p01–p03; L1 → p04–p06
  Every 建議修, the optional L13 and the three MEDIUMs are covered. LOWs marked 記録のみ are not patched and not re-ruled here.
  - The main session shortened most `before` / `after` strings to the changed clause. For every prescription I checked that the **full** Rule A after-sentence is present in the merged unit (`full.mjs`, §1): 33 / 33 present, so each shortened patch is the same edit as prescribed.
- Pre-patch bases, located by sha256 = `base_sha256` (one base per unit):
  - u01 `data/ip/textbook/.planning/v2/technology-14-37-u01/parts/b51-u01-a2/technology-14-37-u01.loc.r0.json` `3d17aa151abc7e06…`
  - u02 `…/technology-14-37-u02/parts/b51-u02-a2/technology-14-37-u02.loc.r0.json` `4de57921f454887a…`
  - u03 `…/technology-14-37-u03/parts/b51-u03-a1/technology-14-37-u03.loc.r1.json` `d4384f7770ae1e29…`
  - u04 `…/technology-14-37-u04/parts/b51-u04-a1/technology-14-37-u04.loc.r0.json` `0d6d5ef8383d0a08…`
  - u05 `…/technology-14-37-u05/parts/b51-u05-a1/technology-14-37-u05.loc.r0.json` `b311e61c0d7e5fb9…`
- Merged units (current) `data/ip/textbook/units/technology-14-37-u0N.json` sha256: u01 `c743b7bed771be8f…` / u02 `f7b65b6e418abc7a…` / u03 `28a1cba59a661b81…` / u04 `c746c1764d548840…` / u05 `fc76136d700c7410…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only). Answer keys are read from `correct_answer` in `data/ip/quiz/questions.json`.

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches in this batch, so the `manifest.v1` replay is not exercised). Topic technology-14-37 has 32 questions, so there are 160 source strings per language.

1. **Application check** (`b51rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim in the Rule A file. Plus `full.mjs`: the full Rule A after-sentence of each prescription is a substring of a unit string.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b51rv/d198.mjs`, all 33 patches): LCS of the `before` span and of the `after` span against the 160 sources per language; jp 12-char windows (≤2 substitutions) on the spans. `mask.mjs`: the same windows on the **whole** jp field before → after, unmasked and masked (katakana ≥4 and alphanumerics → □). **Deviation from b49**: b49's `d198b.mjs` (whole-field LCS + wDice) is not in this scratchpad, so wDice is not reported; for u03 L1 (the only D-198-driven patch) I give a bigram Dice / normalised edit distance against the targeted choice instead (`u03.mjs`). My normalisation differs from Rule A's, so only the direction is claimed.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + translations (stem_jp_clean): 2010h22h-q053 (swap via TMP, key イ), 2026r08-q067 (selection sort, state after j = 3, key イ), 2013h25h-q053 (definition of algorithm, key イ), 2025r07-q099 (nested selection, key ウ), 2009h21a-q090 (one-sided nested flow, key イ).
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
6. **Gates** (each on all 5 units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b50): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 171 / u02 139 / u03 140 / u04 128 / u05 117) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u01
✓ technology-14-37-u01 unit: 0 issues (data/ip/textbook/units/technology-14-37-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-37-u01
✓ technology-14-37-u01 parity: 30 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u02
✓ technology-14-37-u02 unit: 0 issues (data/ip/textbook/units/technology-14-37-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-37-u02
✓ technology-14-37-u02 parity: 27 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u03
✓ technology-14-37-u03 unit: 0 issues (data/ip/textbook/units/technology-14-37-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-37-u03
✓ technology-14-37-u03 parity: 29 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u04
✓ technology-14-37-u04 unit: 0 issues (data/ip/textbook/units/technology-14-37-u04.json), 1 warning(s)
  warn  zh-term  terms[3](論理型).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-37-u04
✓ technology-14-37-u04 parity: 23 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-14-37-u05
✓ technology-14-37-u05 unit: 0 issues (data/ip/textbook/units/technology-14-37-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-14-37-u05
✓ technology-14-37-u05 parity: 31 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#0 0 issues (sha256 3d17aa15… = base_sha256)
                        u02 loc#0 0 issues (sha256 4de57921… = base_sha256)
                        u03 loc#1 0 issues (sha256 d4384f77… = base_sha256)
                        u04 loc#0 0 issues, 1 warning (sha256 0d6d5ef8… = base_sha256) — the same スイッチ zh-term warn
                        u05 loc#0 0 issues (sha256 b311e61c… = base_sha256)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 9 ok 9 | u02 active 11 ok 11 | u03 active 3 ok 3 | u04 active 4 ok 4 | u05 active 6 ok 6 | issues [] for all 5
  base sha = base_sha256 for all 33; before count in base = 1 for all 33; replay mismatch 0
  changed base-present paths = patched fields + 'stage' (u01 9+1 / u02 11+1 / u03 3+1 / u04 4+1 / u05 6+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 60 / 57 / 54 / 60 / 54, mismatch 0 (u01 terms[2].memory_hook_jp/zh/en, u02 terms[1].memory_hook_en + terms[4].explanation_zh,
    u04 terms[4].explanation_jp/zh/en + terms[3].explanation_en, u05 terms[2].definition_en: true)
  bold counts unchanged except u04 p01–p03 (terms[4].detail_* 2→3, **文字列型** added) — intended (Rule A u04 L1)
  [[jp:]] counts unchanged except u04 p04 (terms[3].detail_en 0→2) — intended (Rule A u04 L2, §3.6)
  memory_hooks hooked-terms pairing: u01 4/4, u02 5/5, u03 4/4, u04 5/5, u05 5/5 per language, bad 0
  net before remnant: 0 for 31; u02 p05 / p06 = 3 (§ note below)
  ruleA verbatim miss: u01 [] | u02 [p08] (false miss, note below) | u03 [] | u04 [] | u05 []
full.mjs: Rule A full after-sentence present in the unit: u01 M1 3/3, M2 3/3, L3 3/3 | u02 L1 3/3, L2 1/1, L3 3/3, L4 1/1, L5 1/1, L6 1/1, L13 1/1
  | u03 L1 3/3 | u04 L1 3/3, L2 1/1 | u05 M1 3/3, L1 3/3 — 33/33 (u01 M2 jp: regex stopped at the inner 「」; checked by eye, hook_jp = Rule A after exactly)
```

Notes on the two script flags:
- u02 p05 / p06 remnants (記号 / 符号, 3 each): the remaining occurrences are `overview_rows[1].one_line_*`, `terms[1](演算子).one_*` and its derived `definition_*`, where 記号 / 符号 means operator symbols. None is a `pairs` label; the only label occurrence is the patched 「擬似言語での記号」 / 「伪代码中的符号」. Not remnants of the prescribed edit.
- u02 p08 verbatim miss: the Rule A row writes the en hook with backslash-escaped quotes (`\"atom\"`); the patch has plain quotes. With the escapes removed, `before` and `after` equal the Rule A text, and `full.mjs` finds the full after-sentence in `terms[1].hook_en`. False miss.

The u04 `zh-term` warn (スイッチ → 交换机) is in a field no patch touches and appears identically on the base part; Rule A u04 §1-9 judged it a false positive (light-switch analogy).

**Application.** All 33 `before` strings occur exactly once in their base field, all 33 `after` strings are present, replay reproduces every patched field. All 33 before / after pairs are the Rule A text verbatim (u02 p08 after unescaping), and every full Rule A after-sentence is in the unit.

D-198, before → after (`d198.mjs` spans, `mask.mjs` whole jp fields; 160 sources per language):

| Patch | Lang | LCS `before` span (nearest source) | LCS `after` span | jp whole-field windows unmasked / masked |
|---|---|---|---|---|
| u01 p01 | **jp** | 4 (側の条件, 2009h21a-q090 stem) | 4 (same) | 0 / 0 → 0 / 0 |
| u01 p02 | zh | 3 | 2 | — |
| u01 p03 | en | 15 | 18 (" condition on the ", 2009h21a-q090 stem — see note) | — |
| u01 p04 | **jp** | 4 | 4 (のように) | 0 / 0 → 0 / 0 |
| u01 p05 / p06 | zh / en | 3 / 13 | 2 / 11 | — |
| u01 p07–p09 | jp / zh / en | 4 / 2 / 8 | 4 / 2 / 8 (るように / 为了 / "so that ") | jp 0 / 0 → 0 / 0 |
| u02 p01 | **jp** | 8 (の値を入れ替える, 2023r05-q060 stem) | 8 (same, unchanged part) | 0 / 0 → 0 / 0 |
| u02 p02 | zh | 4 (两个变量) | 4 | — |
| u02 p03 | en | 20 (" swap the values of ", 2023r05-q060 stem) | 27 (" the value of the variable ", 2022r04-q096 stem — see note) | — |
| u02 p04 | **jp** | 4 (はどれか, generic) | 4 | 0 / 0 → 0 / 0 |
| u02 p05–p07 | jp / zh / en | 1 / 2 / 2 | 2 / 2 / 9 | jp 0 / 0 → 0 / 0 |
| u02 p08 | en | 12 ("e character ", 2024r06-q085 stem) | 12 (same) | — |
| u02 p09 | en | 13 | 12 (" value when ") | — |
| u02 p10 / p11 | zh | 3 / 3 (" 20" / "/* ") | 3 / 3 | — |
| u03 p01 | **jp** | 6 (アルゴリズム, term) | 6 (term) | 0 / 0 → 0 / 0 |
| u03 p02 | zh | **5 (的处理步骤, 2013h25h-q053 choice イ)** | 3 (的结果, generic) | — |
| u03 p03 | en | **18 (" processing steps ", 2013h25h-q053 choice イ)** | 14 ("et the result ", 2022r04-q079 stem) | — |
| u04 p01 / p02 | jp / zh | 4 / 4 (文字列 / 字符串) | 5 / 5 (文字列型 / 字符串型, term in 2024r06-q062 stem) | jp 0 / 0 → 0 / 0 |
| u04 p03 / p04 | en | 15 / 12 (" characters in " / "Boolean type") | 15 / 12 (same) | — |
| u05 p01 | en | **12 (" the end of ", 2024r06-q062 stem)** | 11 (" the value ") | — |
| u05 p02 | en | **15 (" to the end of ")** | 9 ("e end of ") | — |
| u05 p03 | en | 13 | 10 (" position ") | — |
| u05 p04–p06 | jp / zh / en | 2 / 2 / 11 | 3 / 2 / 11 | jp 0 / 0 → 0 / 0 |

Notes:
- u02 p03 (27 chars): the match is with the **stem** of 2022r04-q096 (not a choice, and not the cited q053). " the value of the variable " is generic English that the prescribed wording needs. Not a copy.
- u01 p03 (18 chars): " condition on the " vs the stem of 2009h21a-q090, generic. The text supports that question's one-sided nesting (§3.1).
- u03 L1 was the one D-198-driven patch. Against 2013h25h-q053 choice イ (the correct answer), the jp clause moves from Dice 0.44 / ed 0.78 to Dice 0.19 / ed 0.89 (`u03.mjs`; different normalisation from Rule A's ed 0.30 / Dice 0.63, so only the direction is claimed). The zh 5-char and en 18-char overlaps with イ (的处理步骤 / " processing steps ") are gone.
- u05 p01–p03 remove the en "the end of" overlaps.

No patch adds a copy-level overlap; 0 jp windows before and after in every jp field, masked and unmasked.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01–p03 | `terms[1](選択).points[0].text_jp/zh/en` | **M1 (MEDIUM)** | Yes (§3.1): the inner condition is placed on the side the outer condition leads to, not on every result. Agrees with the tree figure (only the 偽 branch is nested) in all three languages, with 2025r07-q099 (both branches nested, key ウ) and 2009h21a-q090 (one branch nested, key イ). D-200: 1 sentence / 56 chars | No | OK |
| u01 p04–p06 | `terms[2](繰返し).hook_jp/zh/en` (+ memory_hook, summary.memory_hooks[1]) | **M2 (MEDIUM)** | Yes (§3.2): "returns to the earlier check" is gone. The new image (arrow goes back up, the same range is passed again) holds for both 前判定 and 後判定 drawn with a decision symbol, and the hook is scoped away from ループ端 diagrams | No | OK |
| u01 p07–p09 | `terms[5](擬似言語).analogy_jp/zh/en` | L3 | Yes: 「どの店の厨房でも使える」 = usable in any kitchen = not bound to one programming language (one_jp 特定のプログラム言語の文法に縛られずに). No more "any country's cook" (natural-language independence). D-204: the image no longer carries a claim the one denies | No | OK |
| u02 p01–p03 | `terms[3](代入).points[0].text_jp/zh/en` | L1 | Yes (§3.3): the value to save is now the one about to be overwritten. Traced on 2010h22h-q053: supports イ, rules out ウ / エ (they save the side that is not overwritten next). 2nd sentence unchanged. D-200: 2 sentences / 75 chars | No | OK |
| u02 p04 | `key_points_jp[1]` (+ summary) | L2 | Yes: どれか一つでも = inclusive or, = terms[2].detail_jp and the truth table; zh / en already inclusive | No | OK |
| u02 p05–p07 | `pairs[1].rows[0].label_jp/zh/en` | L3 | Yes: = (compare) vs ← (assign) is now scoped to the pseudo-language, so the old flowchart use of ＝ as assignment (2011h23tokubetsu-q093) is not contradicted | No | OK |
| u02 p08 | `terms[1](演算子).hook_en` (+ memory_hook_en, summary.memory_hooks_en[1]) | L4 | Yes: 演算子 / 子 / 原子 / 因子 are now visible to an en reader; = hook_jp (原子・因子と同じ「子」). Bare jp in en without `[[jp:]]` (obs. 1) | No | OK |
| u02 p09 | `overview_rows[0].one_line_en` | L5 | Yes: "Code that yields one value when evaluated" = jp 記述 / one_en "a piece of code"; no circular definition | No | OK |
| u02 p10 | `terms[0](式).fig.steps[2].caption_zh` | L6 | Yes: 得到表达式唯一的值 20 = jp 式の値 20 が一つ得られる / en "single value, 20" | No | OK |
| u02 p11 | `terms[4](注釈).detail_zh` (+ explanation_zh) | L13 (optional) | Yes: duplicated 用 removed | No | OK |
| u03 p01–p03 | `terms[1](手続).points[0].text_jp/zh/en` | L1 | Yes: near-copy of 2013h25h-q053 イ removed (§1 note); the definition is still correct (which steps, in what order, to get the wanted result) and still selects イ over ア / ウ / エ. No conflict with u01 `terms[0].points[0]` (also defines アルゴリズム as the procedure itself). D-200: 1 sentence / 48 chars | No | OK |
| u04 p01–p03 | `terms[4](文字型).detail_jp/zh/en` (+ explanation) | L1 | Yes (§3.5): 文字列型 introduced as a separate type in pseudo-language. Consistent with the scoped list 「この単元で扱う基本型は…4 つ」 (terms[0].detail_jp) and the tree root 「データ型 (この単元の基本型)」 | No | OK |
| u04 p04 | `terms[3](論理型).detail_en` (+ explanation_en) | L2 | Yes (§3.6): jp words now in `[[jp:]]`, bold moved to the en "Boolean type" | No | OK |
| u05 p01–p03 | `terms[2](選択ソート).one_en` (+ definition_en), `overview_rows[2].one_line_en`, `terms[2].points[0].text_en` | **M1 (MEDIUM)** | Yes (§3.4): "one end" = jp 端 / zh 一端. No selection-sort field says "the end" any more. Re-traced 2026r08-q067: front reading gives イ (key); the old "end" reading (ウ) is no longer asserted, and points[1] / pairs[1].rows[2] / fig captions fix the front | No | OK |
| u05 p04–p06 | `pairs[1].rows[1].b_jp/zh/en` | L1 | Yes: swaps per bubble pass = pairs out of order **when compared**; e.g. 3 1 2 → 2 swaps (both pairs out of order at comparison), 1 out-of-order neighbour pair at start. 三語 same | No | OK |

## 3. Focused checks

### 3.1 u01 p01–p03 (M1): nesting vs the tree figure

- Tree (`terms[1].fig`, three languages): root 「点数は 80 以上か」 → 真: 評価 A (leaf) / 偽: 「点数は 60 以上か」 → 真: B / 偽: C. Only the 偽 branch holds an inner condition.
- New text: jp 「外側の条件で進んだ側にある内側の条件で、更に処理が分かれる」 / zh 「按外层条件进入的那一侧中的内层条件会把处理进一步分开」 / en "the inner condition on the side the outer condition leads to splits processing further". None says every result of the outer condition is split again. In the tree the outer 偽 side leads to the inner condition, which splits into B / C; the 真 side has no inner condition, and the text does not claim one.
- Siblings: detail_jp 「3 通り以上に処理を分けられる」, fig steps[1] / [2] captions, 流れ図 points[1] 「ある枝へ進んだデータは、別の枝にある判断を通らない」 — all consistent.
- Cited 2025r07-q099 (key ウ; both branches nested): still true, whichever side is taken has its inner condition. 2009h21a-q090 (one branch nested; key イ): now supported instead of being read as split on every branch.
- 三語 parity ✓ (same scope, same order). en sentence is long but grammatical (obs. 2).
- **MEDIUM resolved.**

### 3.2 u01 p04–p06 (M2): hook vs 前判定 / 後判定 diagrams

- Figures in the unit: `terms[2].fig` is the v1 SVG (mermaid source `A → B{継続条件は真か} → 真 → C[処理を実行] → B`, 偽 → D) = a 前判定 diagram only. There is no 後判定 figure, so the 後判定 side is checked against the texts: `terms[2].detail_*` (処理の後に調べる 後判定), `terms[3](流れ図).detail_jp` 「ループ端で挟む形 (または判断から上へ戻る形)」, `pairs[0].rows[0].b` (本体を実行して再び判定するか、抜ける).
- 前判定 drawn with a decision: after the body the arrow goes back up to the decision, then the body runs again → 「上へ戻り、同じ範囲をもう一度通る」 ✓.
- 後判定 drawn with a decision: the decision sits after the body; on continue the arrow goes back up to the top of the body, which runs again → ✓. The old text (「元の判定へ戻る」) was wrong here; the new text is not.
- ループ端 diagrams (no back arrow): excluded by 「判断の記号で描く図では」 / 用判断符号画的图中 / "in a diagram drawn with a decision". en "decision" = the unit's en term for 判断 (terms[1].detail_en, terms[3] table).
- Derived: memory_hook_jp/zh/en and summary.memory_hooks_*[1] = stripped hook (checked). L7 (zh ループ not in `[[jp:]]`) is unchanged, as Rule A noted.
- **MEDIUM resolved.**

### 3.3 u02 p01–p03 (L1): 2010h22h-q053 trace

- Key イ (from `correct_answer`): save A, then A ← B, then B ← TMP. The first assignment after saving overwrites A, so A is "the variable about to be overwritten" and it is the one saved ✓.
- ウ / エ save B, but the next step overwrites A → A is lost. The new rule rules them out (Rule A L1's gap).
- ア saves A (follows the rule) but its last step does not use TMP; the text never says saving alone is enough, and the 2nd sentence (the first assignment overwrites one value) still applies. Not supported.
- zh 即将被覆盖的那个变量 / en "the variable about to be overwritten" = jp これから上書きする変数.

### 3.4 u05 p01–p03 (M1): 2026r08-q067 re-trace with "one end"

- Program as paraphrased in Rule A: for j = 1 … n − 1, find the minimum of positions j … n and swap it into position j; output after each j. Key イ (from `correct_answer`).
- Front reading (script): {3,5,1,2,4} → j=1: 1,5,3,2,4 → j=2: 1,2,3,5,4 → j=3: 1,2,3,5,4 = **イ** ✓.
- The old en reading (swap the minimum to the **back** end of the unsorted part), traced the same way, gives 4,5,3,2,1 = wrong option ウ (Rule A M1). "one end" no longer states the back end, and the same en unit fixes the front: `terms[2].points[1]` "moves the minimum to the front", `pairs[1].rows[2].a_en` "front side", fig captions "position 1 / 2 / 3", `detail_en` "at one end", `key_points_en[1]` "from an end".
- Remaining "the end" in u05 en: 8, all in バブルソート fields (detail / analogy / hook / points / fig caption / summary), where the largest value really goes to the end in ascending order. None is a selection-sort field.
- jp 端 / zh 一端 unchanged and = "one end" ✓.
- **MEDIUM resolved.**

### 3.5 u04 p01–p03 (L1): 文字列型 vs the "4 basic types"

- terms[0](データ型).detail_jp: 「この単元で扱う基本型は整数型・実数型・論理型・文字型の 4 つである」; tree root 「データ型 (この単元の基本型)」; key_points / overview_rows list the four. All scoped to this unit's basic types.
- The new sentence 「擬似言語などでは **文字列型** という別の型で表す」 adds a type outside that scoped list, so no rule-7 conflict. It matches the pseudo-language questions in the topic (2024r06-q062 / q085 declare 文字列型). key_points_jp[4] 「複数の文字を並べた値は文字列として扱う」 still true.
- zh 字符串型 / en "string type": validate 0 issues (zh-term table), 三語 same.

### 3.6 u04 p04 and u02 p08: D-202 [[jp:]] markers in en

| Patch | Japanese in en | jp origin present | Form |
|---|---|---|---|
| u04 p04 | `[[jp:ブール型]]`, `[[jp:論理型]]` (terms[3].detail_en) | Yes: detail_jp 「**ブール型** とも呼ばれる」; 論理型 = the term | marked (Rule A L2) |
| u02 p08 | 演算子, 子, 原子, 因子 (terms[1].hook_en) | Yes: the term 演算子; hook_jp 「原子・因子と同じ「子」」 | bare (Rule A L4 wording) |

Derived explanation_en / memory_hook_en strip correctly. u02 p08 writes the Japanese bare, like the existing u01 hooks (`Flowchart: … you get 流れ図`, `擬似 means …`); it is a mention of the words themselves, and validate passes (obs. 1).

## 4. F-fix

No required F-fix. No patch introduces a HIGH or MEDIUM, and no LOW that needs a fix.

## 5. Observations (record only)

1. LOW (notation), u02 p08: `terms[1].hook_en` has bare 演算子 / 子 / 原子 / 因子, while u04 p04 wraps Japanese in `[[jp:]]`. Same bare style as the existing u01 en hooks; origins present; validate 0. If you want it uniform: wrap 演算子 / 原子 / 因子 in `[[jp:]]`. Not required.
2. LOW (style), u01 p03: en "the inner condition on the side the outer condition leads to splits processing further" is a long noun phrase before the verb. Grammatical and = jp / zh. Not required.
3. LOW (pre-existing), en name of 擬似言語: u01 uses "Pseudocode" (9), u02 / u03 already use "pseudo-language" in their bases (u02 base 2, u03 11). u02 p07 and u04 p03 add "pseudo-language", which follows the existing u02 / u03 usage. No new mix within a unit.
4. Script notes:
   - u02 p05 / p06 remnant 3 = operator 記号 / 符号 in 演算子 fields, not the label (§1).
   - u02 p08 verbatim miss = escaped quotes in the Rule A markdown (§1).
   - u04 validate: 1 zh-term warn (スイッチ) predates the patches (same on base).
   - `stage` meta is removed in all 5 units (as in b19–b50).
   - wDice not reported (b49's `d198b.mjs` not available); masked / unmasked whole-field windows were run instead (§0-3).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 3 in scope (u01 M1, u01 M2, u05 M1) — **all resolved**; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1–3. Obs. 4 is script notes.
- **Application:** 33/33 exact (replay, all part-level). 0 unexplained diffs, 0 net `before` remnants of the prescribed edits, derived fields follow (285 checked, 0 mismatch). 33/33 match the Rule A text verbatim (u02 p08 after unescaping), and the full Rule A after-sentence of every prescription (u01 9 / u02 11 / u03 3 / u04 4 / u05 6) is in the unit. Every 建議修, the optional u02 L13 and all three MEDIUMs are covered.
- **Traces:** 2026r08-q067 → イ with the front reading (old back reading → ウ, no longer stated); 2010h22h-q053 → イ, ウ / エ ruled out; 2025r07-q099 / 2009h21a-q090 agree with the new nesting text; 2013h25h-q053 still → イ.
- **D-198:** no patch adds a copy-level overlap; 0 jp windows (masked / unmasked) before and after. u03 L1 removes the near-copy of 2013h25h-q053 イ; u05 M1 removes the en "the end of" overlaps.
- **D-200:** u01 terms[1].points[0] 1 sentence / 56 chars; u02 terms[3].points[0] 2 / 75; u03 terms[1].points[0] 1 / 48; u05 terms[2].points[0] 2 / 94 (jp unchanged) (≤ 100).
- **D-202:** u04 p04 markers have jp origins; u02 p08 bare jp mention (obs. 1).
- **D-204:** u01 L3 analogy now matches the one (not tied to a programming language); u01 M2 hook image holds for both judgement positions.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×5 (u04: 1 pre-existing zh-term warn)
  - validate --part: 0 issues ×5 (sha256 = base_sha256)
  - parity: 0 diff ×5 (30 / 27 / 29 / 23 / 31 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 33 active patches of technology-14-37 u01–u05 are applied exactly and are the prescribed edits. Each resolves its Rule A finding, including the two MEDIUMs that made Rule A u01 FAIL and the MEDIUM that made Rule A u05 FAIL. None introduces a HIGH, a MEDIUM, or a LOW that needs a fix. No required F-fix.
