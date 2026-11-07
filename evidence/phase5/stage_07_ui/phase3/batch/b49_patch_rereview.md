# b49 B3 patch re-review — technology-13-34 u01–u05 (確率と場合の数 / 記述統計量 / 相関・回帰・推定・検定 / 尺度とデータの扱い / 線形代数・微積分と誤差, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b49rv/` (`check.mjs` new for b49, with unit-level replay against `manifest.v1`; `d198b.mjs` derived from `b48rv/`, only the topic, the base parts and the unit list changed).
- Date: 2026-11-08 (Session 149 続)
- Scope: the B3 wording patches for technology-13-34 u01–u05. **43 are `active`, 1 retired** (u02 p20): u01 p01–p05 / u02 p01–p19 + p21 / u03 p01–p11 / u04 p01–p03 / u05 p01–p04 (`patches/technology-13-34-u0{1..5}.json`).
  - **Correction to the brief**: in u02, **p01–p17** are part-level (p16 / p17 = Rule A L4, `terms[2]` / `terms[4].detail_en`) and only **p18 / p19 / p21** are unit-level (`unit.unit_summary_jp/zh/en`). The figure patches are **p07–p15** (not p10–p16). Count 20 active / 1 retired is right.
  - Mapping to Rule A prescriptions:
    - u01 (PASS, 建議修 L1–L3): L1 → p01; L2 → p02–p04; L3 → p05
    - u02 (PASS, 建議修 L1–L4 + out-of-scope O1): L1 → p01–p03; L2 → p04–p06; L3 → p07–p15; L4 → p16–p17; O1 → p18 / p19 / p21 (main-session text; p20 retired → p21)
    - u03 (PASS, 建議修 L1–L2): L1 → p01–p09; L2 → p10–p11
    - u04 (PASS, 建議修 L9a / L9b): L9a → p01; L9b → p02–p03
    - u05 (**FAIL**, MEDIUM M1): M1 → p01–p04
  Every 建議修 and the one MEDIUM are covered. LOWs marked 記録のみ are not patched and not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256` (part-level; one base per unit):
  - u01 `data/ip/textbook/.planning/v2/technology-13-34-u01/parts/b49-u01-a1/technology-13-34-u01.loc.r0.json` `5e4d031dbab9827f…`
  - u02 `…/technology-13-34-u02/parts/b49-u02-a1/technology-13-34-u02.loc.r0.json` `7a61162650c82be9…`
  - u03 `…/technology-13-34-u03/parts/b49-u03-a2/technology-13-34-u03.loc.r0.json` `cfe3f5c46d99b6e8…`
  - u04 `…/technology-13-34-u04/parts/b49-u04-a2/technology-13-34-u04.loc.r0.json` `e41b93b9bdd66fc1…`
  - u05 `…/technology-13-34-u05/parts/b49-u05-a1/technology-13-34-u05.loc.r0.json` `82014e690c83398c…`
  - u02 unit-level (p18 / p19 / p21): `v1Sha256(manifest)` of `…/technology-13-34-u02/manifest.json` = `58815ae5333af06c…` = `base_sha256` (computed with `scripts/textbook-v2-patch.mjs` `v1Sha256`).
- Merged units (current) `data/ip/textbook/units/technology-13-34-u0N.json` sha256: u01 `3d5c688df6f720b1…` / u02 `991815c1337acf9e…` / u03 `79d95f495459f417…` / u04 `32aa5e50481dc54e…` / u05 `55873b4b853d5609…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b48_patch_rereview.md` §0, with one addition: unit-level patches (`unit.*`) are replayed on `manifest.v1` and their base is checked against `v1Sha256(manifest)`. Topic technology-13-34 has 32 questions, so there are 160 source strings per language.

1. **Application check** (`b49rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b49rv/d198b.mjs`, all 43 active patches): whole-field LCS before → after and LCS of the `after` span against the 160 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + translations (stem_jp_clean): 2013h25h-q036 (paths between members, answer ア), 2024r06-q083 (die 3 throws, no 1 → answer エ 125/216), 2022r04-q059 (mean / median, answer エ).
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
6. **Gates** (each on all 5 units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b48): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 89 / u02 174 / u03 150 / u04 166 / u05 124) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u01
✓ technology-13-34-u01 unit: 0 issues (data/ip/textbook/units/technology-13-34-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u01
✓ technology-13-34-u01 parity: 22 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u02
✓ technology-13-34-u02 unit: 0 issues (data/ip/textbook/units/technology-13-34-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u02
✓ technology-13-34-u02 parity: 36 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u03
✓ technology-13-34-u03 unit: 0 issues (data/ip/textbook/units/technology-13-34-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u03
✓ technology-13-34-u03 parity: 32 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u04
✓ technology-13-34-u04 unit: 0 issues (data/ip/textbook/units/technology-13-34-u04.json), 9 warning(s)
  warn  zh-term  overview_rows[4].one_line_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  overview_rows[5].one_line_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  overview_rows[6].one_line_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  overview_rows[7].one_line_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[3](尺度).hook_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[4](名義尺度).one_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[5](順序尺度).one_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[6](間隔尺度).one_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[7](比例尺度).one_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u04
✓ technology-13-34-u04 parity: 33 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u05
✓ technology-13-34-u05 unit: 0 issues (data/ip/textbook/units/technology-13-34-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u05
✓ technology-13-34-u05 parity: 23 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#0 0 issues (sha256 5e4d031d… = base_sha256) EXIT=0
                        u02 loc#0 0 issues (sha256 7a611626… = base_sha256) EXIT=0
                        u03 loc#0 0 issues (sha256 cfe3f5c4… = base_sha256) EXIT=0
                        u04 loc#0 0 issues, 9 warning(s) (sha256 e41b93b9… = base_sha256) — the same 9 zh-term warns EXIT=0
                        u05 loc#0 0 issues (sha256 82014e69… = base_sha256) EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 5 ok 5 | u02 active 20 (retired 1) ok 20 | u03 active 11 ok 11 | u04 active 3 ok 3 | u05 active 4 ok 4 | issues [] for all 5
  part-level: base sha = base_sha256 for all 40; before count in base = 1 for all 40; replay mismatch 0
  unit-level (u02 p18/p19/p21): base_sha256 = v1Sha256(manifest) 58815ae5…; before count in manifest.v1 = 1; replay = unit.unit_summary_jp/zh/en
  changed base-present paths = patched fields + 'stage' (u01 5+1 / u02 17+1 / u03 11+1 / u04 3+1 / u05 4+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 39 / 72 / 69 / 75 / 57, mismatch 0 (u02 terms[2]/[4].explanation_en, u03 terms[0].explanation_* + memory_hook_zh/en, u04 terms[3].explanation_en, u05 terms[1].definition_zh: true)
  bold counts unchanged in all 43; [[jp:]] counts unchanged except u02 p16 / p17 (terms[2] / terms[4].detail_en 2→3) — intended (§3.5)
  memory_hooks hooked-terms pairing: u01 3/3, u02 4/4, u03 4/4, u04 6/6, u05 5/5 per language, bad 0
  net before remnant: 0 for all 43
  ruleA verbatim miss: u01 [] | u02 [p18, p19, p21] (main-session text for O1, §3.4) | u03 [p03 after] (§3.3) | u04 [] | u05 []
```

The 9 u04 `zh-term` warns (尺度 → 测量尺度) are in fields no patch touches and appear identically on the base part, so they predate the patches (Rule A u04 L10, 記録のみ).

**Application.** All 43 `before` strings occur exactly once in their base field, all 43 `after` strings are present, replay reproduces every patched field. 39 of 43 before / after pairs are the Rule A text verbatim. The 4 that are not are explained in §3.3 (u03 p03) and §3.4 (u02 p18 / p19 / p21).

D-198, before → after (`d198b.mjs`, 160 sources per language; jp fields only carry the window columns):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | en | 22 → 22 (" the probabilities of ", generic) | " the probability that " (22, 2024r06-q083 stem, generic) | — |
| u01 p02 | **jp** | 6 → 6 (が大きいほど) | 増えると (4) | 0 / 0 → 0 / 0; 0.19 → 0.15 |
| u01 p03 | zh | 4 → 3 | 增加到 (3) | — |
| u01 p04 | en | 18 → 18 | ", the number of pa" (18, 2013h25h-q036 イ — see note) | — |
| u01 p05 | en | 16 → 11 | 11 (generic) | — |
| u02 p01 | **jp** | 3 → 3 | 3 | 0 / 0 → 0 / 0; 0.09 → 0.07 |
| u02 p02 | zh | 2 → 2 | 2 | — |
| u02 p03 | en | 11 → 11 | "s from the " (11) | — |
| u02 p04 | **jp** | 4 → 4 (標準偏差, term) | は変わ (3) | 0 / 0 → 0 / 0; 0.22 → 0.21 |
| u02 p05 | zh | 5 → 5 (标准差不同, unchanged part) | 偏差值 (3, term) | — |
| u02 p06 | en | 24 → 24 (" the standard deviation ", term) | "t deviation value" (17, term) | — |
| u02 p07–p09 | jp / zh / en | 3 / 3 / 6 → same | の場合 / 的情况 / " data " | jp 0 / 0 → 0 / 0; 0.33 → 0.30 |
| u02 p10–p12 | jp / zh / en | 2 / 2 / 3 → same (numerals) | "20" | jp 0 / 0 → 0 / 0; 0.33 → 0.33 |
| u02 p13–p15 | jp / zh / en | 2 / 2 / 8 → same | の値 / 第3 / "d value " | jp 0 / 0 → 0 / 0; 0.17 → 0.17 |
| u02 p16 | en | 11 → 10 | " the same " (10) | — |
| u02 p17 | en | 12 → 12 (unchanged part) | " the same " (10) | — |
| u02 p18 | **jp** (unit) | 4 → 4 (ばらつき) | 標準偏差 (4, term) | 0 / 0 → 0 / 0; 0.26 → 0.20 |
| u02 p19 | zh (unit) | 5 → 5 (离散程度的) | 5 | — |
| u02 p21 | en (unit) | 19 → 19 (" standard deviation", term) | 19 (term) | — |
| u03 p01 | **jp** | 4 → 4 | 増えると (4) | 0 / 0 → 0 / 0; 0.09 → 0.08 |
| u03 p02 | zh | 3 → 3 | 相关 (2) | — |
| u03 p03 | en | 16 → 16 (unchanged part) | " the other" (10) | — |
| u03 p04 / p07 | **jp** | 4 → 4 | 増えると (4) | 0 / 0 → 0 / 0; 0.19 → 0.17 / 0.20 → 0.18 |
| u03 p05 / p08 | zh | 2 → 2 | 相关 (2) | — |
| u03 p06 / p09 | en | 10 → 10 | " the other" (10) | — |
| u03 p10 / p11 | zh / en | 2 / 10 → same | 表示 / " with the " | — |
| u04 p01 | en | 16 → 16 (" and ratio scale", term) | 13 | — |
| u04 p02 / p03 | zh / en | 4 / 11 → same (比例尺度 / ratio scale, term) | term | — |
| u05 p01–p04 | zh | 4 → 3 (排成一列 → 排成一) | 排成一 (3) | — |

Note on u01 p04: the 18-char en overlap is with a **wrong** option (2013h25h-q036 イ, "always +1"). The match is "…, the number of pa(irs)" vs "…, the number of pa(ths)": generic English, already present before the patch (18 → 18), and the sentence says the count grows by n, which supports ア and contradicts イ (§3.1). Not a copy and not support of a wrong option.

No patch adds a copy-level overlap; 0 jp windows before and after in every jp field; wDice ≤ 0.33, far from the HIGH calibration (ed 0.14 / Dice 0.52). u05 lowers the zh overlap (2010h22a-q082 zh stem has 排成一列; the patch removes it).

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01 | `terms[0](確率).points[0].text_en` | L1 | Yes: "multiplying together, once per trial, the probability that it does not occur in one trial" = p^k (one factor per trial), no longer readable as k+1 factors. 2024r06-q083: (5/6)^3 = 125/216 = エ; no wrong option supported. jp / zh unchanged and agree | No | OK |
| u01 p02–p04 | `terms[2](組合せ).points[1].text_jp/zh/en` | L2 | Yes (§3.1): increment is now tied to the count before the increase (n → n+1 adds n), and ずつ (constant step) is gone. Math verified. 2013h25h-q036 ア supported, イ not. en "pairs of 2" redundancy removed. D-200: jp 1 sentence / 54 chars | No | OK |
| u01 p05 | `terms[2].analogy_en` | L3 | Yes: subject / predicate fixed ("the same ingredients make the same pot"); = jp 選んだ具材が同じなら同じ鍋 | No | OK |
| u02 p01–p03 | `terms[5](分散).analogy_jp/zh/en` | L1 | Yes: reference point is now the centre of the cluster of darts (= mean), matching detail (各値から平均値を引いた差). zh 靶心 / en bullseye (fixed external target) are gone. 大きく離れた矢ほど重く = squaring ✓. 三語 same image | No | OK |
| u02 p04–p06 | `terms[7](偏差値).points[0].text_jp/zh/en` | L2 | Yes: 変わりうる / 也可能不同 / can give — no longer claims the value always changes (a score exactly at the mean stays 50). First sentence (差 ÷ 標準偏差) unchanged. 2023r05-q077 unaffected. D-200: 2 sentences / 61 chars | No | OK |
| u02 p07–p15 | `terms[3](最頻値).fig.data.cols[2]`, `rows[0].cells[2]`, `rows[1].cells[2]` (三語) | L3 | Yes (§3.2): all cells recomputed; mean 4 / median 3 / mode 2 now differ, so the table separates the three rules. Unrelated to 2022r04-q059 data | No | OK |
| u02 p16–p17 | `terms[2](メジアン).detail_en`, `terms[4](モード).detail_en` (+ explanation_en) | L4 | Yes: "the same as for 中央値" / "the same way as 最頻値" restore the jp identity (和名 = 英語名); no more median = median tautology. D-202: 中央値 / 最頻値 are in the jp detail and one_en already glosses them (§3.5) | No | OK |
| u02 p18 / p19 / p21 | `unit.unit_summary_jp/zh/en` | O1 (out of scope, main-session text) | Yes (§3.4): 偏差値 is no longer listed under 散布度; it is "a position within the group", matching terms[7].one, overview_rows[7].extra, goals[2]. 三語 parity ✓. p20 → p21 restores the comma | No (unit_index drift, obs. 1) | OK |
| u03 p01–p09 | `terms[0](相関係数).detail_jp/zh/en` (+ explanation), `fig.data.rows[0].cells[1]`, `rows[2].cells[1]` (三語) | L1 | Yes: 傾向 / 倾向 / tends to on both positive and negative, in detail and fig. No sibling field keeps the deterministic wording (grep). p03 en wording differs from Rule A and is accepted (§3.3) | No | OK |
| u03 p10–p11 | `terms[0].hook_zh/en` (+ memory_hook, summary) | L2 | Yes: 常用 / often = jp 書かれることが多い | No | OK |
| u04 p01 | `terms[3](尺度).detail_en` | L9a | Yes: "In that order" = jp この順に | No | OK |
| u04 p02–p03 | `terms[3].fig.data.nodes[3].label.zh/en` | L9b | Yes: 比值有意义 / "ratios make sense" = jp 比が言える (ratio meaningful); parallel to other nodes; jp unchanged | No | OK |
| u05 p01–p04 | `overview_rows[1].one_line_zh`, `overview_rows[1].extra_zh[0]`, `terms[1](ベクトル).one_zh` (+ definition_zh), `pairs[0].rows[0].a_zh` | **M1 (MEDIUM)** | Yes (§3.6): no 排成一列 left anywhere in the unit; 一串 = a single sequence, no row / column sense; = jp 一本の並び / en in a single line | No | OK |

## 3. Focused checks

### 3.1 u01 p02–p04: 「n 個が n + 1 個に増えると n 個増える」

- C(n+1, 2) − C(n, 2) = (n+1)n/2 − n(n−1)/2 = n·[(n+1) − (n−1)]/2 = **n**. Numeric: 3→4 members: 3 → 6 (+3); 4→5: 6 → 10 (+4). The claim is exact, and n is the count **before** the increase, which the new wording states (n 個が n + 1 個に / 在 n 个增加到 n + 1 个时 / When n items become n + 1).
- 2013h25h-q036 (1:1 paths between members; answer ア = the increment when one member joins is larger when the original number is larger): supported — "n が大きいほど増え方も大きい". イ (always one more path) contradicted; ウ (x!) / エ (x²) not supported.
- Old wording (n が 1 増えるたびに n 個ずつ) could read as a constant step; ずつ is gone.
- 三語 parity ✓. **Resolved, mathematically correct.**

### 3.2 u02 p07–p15: 最頻値 table with data 2, 2, 3, 5, 8

| Row | 求め方 | Recomputed | Cell (jp / zh / en) | OK |
|---|---|---|---|---|
| 平均値 | 合計 ÷ 個数 | 2+2+3+5+8 = 20; 20 ÷ 5 = 4 | 20 ÷ 5 = 4 (×3) | ✓ |
| 中央値 | 並べた真ん中 | sorted 2, 2, 3, 5, 8 (5 values, already sorted) → 3rd = 3 | 3 番目の値 = 3 / 第 3 个值 = 3 / 3rd value = 3 | ✓ |
| 最頻値 (unchanged, key) | 出現回数最多 | 2 appears twice, others once → 2 | 2 回現れる 2 / 出现 2 次的 2 / 2 (appears twice) | ✓ |

- Header cols[2] (三語) = 2, 2, 3, 5, 8. The table has no caption field; no other text in u02 refers to the old data (grep: 0 occurrences of `1, 2, 2, 4, 6` or `15 ÷ 5`; `2, 2, 3, 5, 8` × 3 = the 3 header cells).
- The three values are now distinct (4 / 3 / 2), which is the point of Rule A L3 (2022r04-q059 wrong option ウ puts a mode value in the median slot). q059 data (9 values, mean 300 / median 40) is unrelated, so no answer leak.
- Consistent with terms[3].one / detail / points[0] (出現回数を数えて決める) and with pairs[1].rows[1]. **Resolved, all cells correct.**

### 3.3 u03 p03 en: main-session wording vs Rule A

- jp (p01): 負なら一方が増えると他方が減る**傾向にある** → condition = one rises, tendency = the other falls.
- Rule A after: "where one tends to rise as the other falls". Main session: "where one **tends to fall as the other rises**".
- Correlation is symmetric, so both are true. The main-session form matches the jp structure (condition: increase; tendency: decrease), parallels the positive clause in the same sentence ("one variable tends to rise as the other rises"), and matches fig rows[2].cells[1].en ("as one rises, the other tends to fall") and zh (一方增加时另一方有减少倾向). Rule A's form is equivalent but no closer.
- **Accepted.** No F-fix.

### 3.4 u02 p18 / p19 / p21: unit_summary_* (偏差値 out of 散布度)

- After:
  - jp: データを要約する代表値(平均・中央・最頻)と、ばらつきを表す散布度(分散・標準偏差)、集団の中での位置を表す偏差値を学ぶ。
  - zh: 学习用于概括数据的集中趋势量（均值、中位数、众数），表示离散程度的散布度量（方差、标准差），以及表示在群体中所处位置的偏差值。
  - en: Learn the measures of central tendency that summarize data (mean, median, mode), the measures of dispersion that express variability (variance, standard deviation), and the deviation value, which shows a position within a group.
- Accuracy: 偏差値 = 50 + 10 × (値 − 平均) ÷ 標準偏差 is a standardized position, not a spread measure. The new text agrees with terms[7].one_jp (集団の中での位置を表す数), overview_rows[7].extra (集団内の位置 / Position in the group) and goals_jp[2] (集団の中での位置を読み取れる). 散布度 now lists only 分散 / 標準偏差 = terms[5] / [6].
- 三語 parity: three items in the same order and with the same qualifiers in all three; zh 以及 / en "and" before the last item. jp 「A と、B、C を学ぶ」 is a slightly loose list form but grammatical (obs. 2).
- p20 (retired) dropped the comma after "(mean, median, mode)"; p21 widens `before` to include it — confirmed in the replay (the en text has ", the measures of dispersion").
- Not verbatim Rule A (O1 left wording to the caller; the Rule A sample jp 「…と、ばらつきを表す散布度(分散・標準偏差)、集団内の位置を表す偏差値を学ぶ。」 is essentially the same as p18).
- Where it shows: in `apps/web/src`, `unit_summary_*` and unit_index `summary_jp` are only typed / validated (`types.ts`, `validate.ts`, `validateV2.ts`); `page.tsx` / `reader.ts` / `loader.ts` do not render them (UnitHeader's `<summary>` is the HTML element). So the patch reason "the web does not show it" holds for unit_index; the stale copy there is a sync debt, not a visible defect (obs. 1).
- **Resolved, accurate.**

### 3.5 u02 p16 / p17: D-202 [[jp:]] markers in en

| Patch | Added marker | jp origin present | en context |
|---|---|---|---|
| p16 | `[[jp:中央値]]` (terms[2] detail_en) | Yes: terms[2].detail_jp 「…中央値の手順そのまま」 | one_en / detail_en sentence 1 already introduce 中央値 as the native term |
| p17 | `[[jp:最頻値]]` (terms[4] detail_en) | Yes: terms[4].detail_jp 「求め方は最頻値と同じ」 | one_en: "another name for [[jp:最頻値]]"; sentence 2 already uses [[jp:最頻値]] |

Derived explanation_en strips to "…the same as for 中央値: …" / "…the same way as 最頻値: …" (checked). The bare-jp-noun use already exists in the same fields before the patch. validate: 0 issues.

### 3.6 u05 p01–p04: 排成一列 → 排成一串

- After the patch, a scan of every zh string in u05 finds **0** 一列. The 4 patched locations (+ derived terms[1].definition_zh) read 排成一串的数组.
- No clash: 列 is taught as column (terms[2].one_zh 纵向排列（列）, key_points_zh[1], pairs[0].rows[2] 只有 1 行或只有 1 列); 排 appears in terms[2].analogy_zh 第几排第几座 (= row of seats). 一串 has neither sense; 排成 is the verb "arrange into", already in the base. Rule A explicitly rejected 一排 for this reason; the patch follows that.
- 三語: jp 一本の並びにした組 / en "arranged in a single line" / zh 排成一串 — same meaning, no column restriction. pairs[0].rows[2].a_zh 可以看作只有 1 行或只有 1 列的矩阵 is now consistent (a vector is not only a column).
- D-198: lowers the zh overlap with 2010h22a-q082 (排成一列 4 → 3).
- **MEDIUM resolved.** Rule A u05's FAIL condition (M1) is met by these 4 replacements; validate 0 issues / parity 0 diff.

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect.

Optional F-fix 1 (LOW, sync only, not visible on the web): bring the index copies of the u02 summary in line with p18.
- `data/ip/textbook/unit_index.json` (u02 entry, `summary_jp`, around line 7904) and `data/ip/textbook/.planning/v2/technology-13-34-u02/manifest.json` `index_unit.summary_jp`:
  「データを要約する代表値(平均・中央・最頻)と、ばらつきを表す散布度(分散・標準偏差・偏差値)を学ぶ。」→「データを要約する代表値(平均・中央・最頻)と、ばらつきを表す散布度(分散・標準偏差)、集団の中での位置を表す偏差値を学ぶ。」
- Caution: changing `manifest.json` changes `v1Sha256(manifest)` only if `v1` changes; `index_unit` is outside `v1`, but re-run `node --test scripts/textbook-v2-patch.test.mjs` and the u02 apply / validate after editing either file.

## 5. Observations (record only)

1. LOW (sync), u02 p18: `unit_index.json` / `manifest.index_unit.summary_jp` keep the old classification (偏差値 under 散布度). Not rendered by the web (§3.4). Optional F-fix 1.
2. LOW (style), u02 p18: jp list 「代表値(…)と、散布度(…)、偏差値を学ぶ」 mixes と and 、; 「代表値(…)、散布度(…)、偏差値を学ぶ」 would be tidier. Meaning clear. Not required.
3. Script notes:
   - check.mjs prints the `unit.unit_summary_*` replay lines before the `== technology-13-34-u02` header (loop order); they belong to u02.
   - u04 validate: 9 zh-term warns predate the patches (same in base).
   - `stage` meta is removed in all 5 units (as in b19–b48).
   - ruleA verbatim misses = u02 p18 / p19 / p21 (main-session O1 text) and u03 p03 after (main-session en variant); both judged in §3.

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 1 in scope (u05 M1) — **resolved**; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1–2. Obs. 3 is script notes.
- **Application:** 43/43 exact (replay; 40 part-level + 3 unit-level against `manifest.v1`). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (312 checked, 0 mismatch). 39/43 match the Rule A text verbatim; the 4 that do not (u03 p03, u02 p18 / p19 / p21) are judged correct (§3.3, §3.4). Every 建議修 and the u05 MEDIUM are covered.
- **Math:** u01 nC2 increment = n (algebra + numeric); u01 p01 = p^k (2024r06-q083 エ); u02 table 4 / 3 / 2 recomputed.
- **D-198:** no patch adds a copy-level overlap; 0 jp windows before and after. The one wrong-option hit (u01 p04 vs 2013h25h-q036 イ, 18 chars) is generic and pre-existing; the text contradicts イ.
- **D-200:** u01 terms[2].points[1] 1 sentence / 54 chars; u01 terms[0].points[0] 2 sentences / 87 chars; u02 terms[7].points[0] 2 sentences / 61 chars (≤ 100).
- **D-202:** both added `[[jp:]]` markers (u02 p16 / p17) have their origin in jp text.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×5 (u04: 9 pre-existing zh-term warns)
  - validate --part: 0 issues ×5 (sha256 = base_sha256)
  - parity: 0 diff ×5 (22 / 36 / 32 / 33 / 23 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 43 active patches of technology-13-34 u01–u05 are applied exactly. Each resolves its Rule A finding (including the u05 MEDIUM that made Rule A u05 FAIL), and none introduces a HIGH, MEDIUM or LOW that needs a fix. No required F-fix. One optional F-fix (sync of the u02 summary in unit_index / manifest index_unit) is available.
