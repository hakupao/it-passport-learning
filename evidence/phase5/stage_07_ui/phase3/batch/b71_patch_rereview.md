# b71 B3 patch re-review — technology-19-51 u01〜u04 (インタフェース設計の基礎と入力操作、タッチ操作と GUI の基本要素、メニューと補助表示、Web のインタフェース実装)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the four Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b71rv/`: `check.mjs` / `d198.mjs` / `same.mjs` / `raverb.mjs` copied from `b68rv/` with only the unit map changed (4 units, all topic technology-19-51; u01 base attempt `b71-u01-a1` round `r0`, u02 `b71-u02-a1` / `r0`, u03 `b71-u03-a2` / `r0`, u04 `b71-u04-a1` / `r0`). `same.mjs` reads the 43 Rule A before / after pairs from `b71rv/ra.json`, copied by hand from the four Rule A "修正案" cells. One change to `same.mjs` beyond the map: u01 L5 prescribes two replacements in the same field (`terms[3].detail_zh`), so `ra.json` keys may carry a `#n` suffix and pairs on one field are applied in order before comparing with the unit field. For 2 pairs the Rule A string is cut by an ellipsis (u04 `terms[0].detail_en` leading "…", u04 `terms[1].one_zh` trailing "…"); `ra.json` holds the text without the "…". `raverb.mjs` confirms all 86 strings verbatim in the Rule A files (miss 0; the 2 also verbatim with their "…"). Extra scratchpad scripts: `extra.mjs` (shortened count, old-wording greps, `[[jp:]]` origin, D-200 counts), `tgt.mjs` (before → after LCS / Dice / ed / win12 against one cited question per field, plus a direct q059 choice-text search in u01), `xgrep.mjs` (u01〜u04 field grep for the cross-unit check, §X). No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b71)
- Scope: the B3 wording patches for 4 units. **43 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (インタフェース設計の基礎と入力操作) | **FAIL M1**, 建議修 L1–L5 | p01–p13 | M1 → p01 (`terms[4](タップ).detail_zh`); L1 → p02–p04 (`terms[5](スワイプ).analogy_*`); L2 → p05–p07 (`terms[3](マルチタッチインタフェース).hook_*`); L3 → p08 (`terms[1](人間中心設計).hook_en`); L5 → p09–p13 (`terms[3].detail_zh` ×2, `fig.data.rows[0..1].cells[0].zh`, `pairs[1].rows[2].b_zh`). **L4 (ISO 9241-11:2018 / JIS Z 8521:2020 edition sentence on `terms[0].detail_*`) not adopted** (§U1.3) | 2/13 (p02, p07) |
| u02 (タッチ操作と GUI の基本要素) | PASS, 建議修 L1–L6 | p01–p09 | L1 → p01–p03 (`terms[6](チェックボックス).points[0].text_*`); L2 → p04–p05 (`terms[4](アイコン).detail_en/zh`); L3 → p06 (`terms[2](ロングプレス).hook_zh`); L4 → p07 (`pairs[0].rows[0].a_zh`); L5 → p08 (`key_points_zh[4]`); L6 → p09 (`terms[2].fig.data.rows[2].cells[2].en`) | 4/9 (p04, p05, p06, p08) |
| u03 (メニューと補助表示) | PASS, 建議修 L1–L3 | p01–p10 | L1 → p01–p03 (`terms[1](メニューバー).detail_*`); L2 → p04–p06 (`terms[3](ポップアップメニュー).analogy_*`); L3 → p07 (`terms[0].points[0].text_zh`), p08 (`terms[6].points[0].text_zh`), p09 (`terms[3].hook_en`), p10 (`terms[4].hook_en`) | 0/10 |
| u04 (Web のインタフェース実装) | PASS, 建議修 L1–L3 | p01–p11 | L1 → p01–p03 (`terms[5](レスポンシブWebデザイン).points[0].text_*`, exam, 2026r08-q060); L2 (a)–(e) → p04 (`overview_rows[6].one_line_en`), p05 (`overview_rows[3].extra_en[0]`), p06 (`terms[0](ホバー).detail_en`), p07 (`terms[3](CSS).analogy_en`), p08 (`terms[1](ロールオーバー).one_zh`); L3 → p09–p11 (`terms[2](GUI).detail_*`) | 6/11 (p01–p03, p06–p08) |

  Every MEDIUM and every 建議修 is covered, except u01 L4, which the main session chose not to adopt (§U1.3). 記録のみ LOWs (u01 L6–L9, u02 L7–L12, u03 L4–L9, u04 L4–L7) and O-items are not patched and not re-ruled here. u01 L7 (loc-review r1 LOWs, "任意で同梱") was not bundled; it was optional.
  - **Shortened strings**: **12 of 43** (`before` / `after` are phrases inside the Rule A strings; counted by script as patch `before` ≠ `ra.json` before). `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **43/43 pairs (41 fields)**, so all shortened patches give the same result as the Rule A strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-19-51-u01/parts/b71-u01-a1/technology-19-51-u01.loc.r0.json` `bba691afba3e07ad…`
  - u02 `.../technology-19-51-u02/parts/b71-u02-a1/technology-19-51-u02.loc.r0.json` `5e3677d8774d4059…`
  - u03 `.../technology-19-51-u03/parts/b71-u03-a2/technology-19-51-u03.loc.r0.json` `2bca6f38f3c5b108…`
  - u04 `.../technology-19-51-u04/parts/b71-u04-a1/technology-19-51-u04.loc.r0.json` `019f1144a5f672fa…`
- Merged units (current) `data/ip/textbook/units/technology-19-51-u0N.json` sha256: u01 `408cc525868ee19c…`, u02 `7b2a007003707b6a…`, u03 `7186e74531f38488…`, u04 `0060567115c7a392…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments and one-word choice names (qid + paraphrase only).

## 0. Method

Same as `b68_patch_rereview.md` §0 (no unit-level patches in this batch). All 4 units share topic technology-19-51 (17 questions), so there are 85 source strings per language.

1. **Application check** (`b71rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field (u01 p09 → p10 on one field); every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b71rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b71rv/d198.mjs`, all 43 patches): whole-field LCS before → after and LCS of the `after` span against the 85 sources per language; jp also 12-char windows (unmasked / masked) and Dice. Plus `b71rv/tgt.mjs` (before → after against one named question): u04 `terms[5].points[0].text_jp` vs 2026r08-q060 ア and stem; u02 `terms[6].points[0].text_jp` vs 2011h23tokubetsu-q097 ウ / イ and 2014h26h-q093 エ; u01 `terms[3].hook_jp` vs 2017h29h-q059 ウ; u03 `terms[1].detail_jp` vs 2013h25h-q065 stem; u04 `terms[2].detail_jp` vs 2017h29a-q058 stem; and a direct search of the four q059 choice texts (jp / zh / en) in all u01 fields, base vs unit.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json`: 2017h29h-q059 (エ マルチタッチ; wrong ア タッチタイプ / イ ダブルクリック [zh 双击] / ウ マルチタスク [zh 多任务处理, en Multitasking]), 2014h26h-q093 (エ ラジオボタン; 4 種別から 1 つ), 2011h23tokubetsu-q097 (ウ 性別 2 択にラジオボタン; wrong イ 希望賞品 1 つにチェックボックス), 2009h21h-q067 (リストボックスで 7 都府県から 1 つ, 正答エ 前画面の値), 2026r08-q060 (ア 画面サイズなどに応じてレイアウトが変わる).
5. **Cross-unit checks (key check of this batch)**: read u01〜u04 together in three languages on (a) gesture terms tap / swipe / flick / pinch / long press / double tap and their zh terms, (b) single-choice widgets (radio button vs pull-down / list box), menu / context-menu terms, (c) hover wording (u03 tooltip ↔ u04 hover / rollover) (§X).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording and a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b68): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 147 / u02 140 / u03 141 / u04 156) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-19-51-u01   → ✓ 0 issues               EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-19-51-u01   → ✓ 33 locations, 0 diff   EXIT=0
$ ... validate --unit technology-19-51-u02 → ✓ 0 issues, 1 warning (zh-term リスト → 列表, terms[6].analogy_zh)  EXIT=0 | parity → ✓ 27 locations, 0 diff  EXIT=0
$ ... validate --unit technology-19-51-u03 → ✓ 0 issues  EXIT=0 | parity → ✓ 31 locations, 0 diff  EXIT=0
$ ... validate --unit technology-19-51-u04 → ✓ 0 issues  EXIT=0 | parity → ✓ 33 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 loc#0 counts {"terms":7,"figs":5,"steps":8,"points":9,"pairs":3,"key_points":4,"goals":3}   sha256 bba691afba3e07ad…  ✓ 0 issues  EXIT=0
  u02 loc#0 counts {"terms":7,"figs":2,"steps":3,"points":8,"pairs":1,"key_points":5,"goals":3}   sha256 5e3677d8774d4059…  ✓ 0 issues, 1 warning (same zh-term リスト)  EXIT=0
  u03 loc#0 counts {"terms":7,"figs":3,"steps":7,"points":5,"pairs":3,"key_points":3,"goals":3}   sha256 2bca6f38f3c5b108…  ✓ 0 issues  EXIT=0
  u04 loc#0 counts {"terms":7,"figs":5,"steps":10,"points":11,"pairs":2,"key_points":5,"goals":4} sha256 019f1144a5f672fa…  ✓ 0 issues  EXIT=0
  (all 4 sha256 = base_sha256 of every patch in that unit)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 13 ok 13 | issues [] | changed base-present = 12 patched fields + 'stage' | unexplained besides 'stage' 0 | derived 75, mismatch 0 | memory_hooks 21 bad 0, lens 7/7/7
  u02 active 9 ok 9   | issues [] | changed base-present = 9 patched + 'stage'  | unexplained 0 | derived 78, mismatch 0 | memory_hooks 21 bad 0, lens 7/7/7
  u03 active 10 ok 10 | issues [] | changed base-present = 10 patched + 'stage' | unexplained 0 | derived 72, mismatch 0 | memory_hooks 21 bad 0, lens 7/7/7
  u04 active 11 ok 11 | issues [] | changed base-present = 11 patched + 'stage' | unexplained 0 | derived 78, mismatch 0 | memory_hooks 21 bad 0, lens 7/7/7
  base sha = base_sha256 for all 43; before count in base = 1 for all 43; replay mismatch 0
  base-only top keys (all 4): stage / round / jp_round (part metadata)
  net before remnant: 0 for 41/43; u01 p11 「张开」 2, p12 「捏合」 2 (= key_points_zh[2] 「用两根手指张开、捏合等」 + its summary copy, kept on purpose by Rule A L5; §U1.3)
  bold counts unchanged in all 43; [[jp:]] counts unchanged in all 43
  derived followers (all true): u01 explanation_zh of terms[4] (p01) and terms[3] (p09–p10), memory_hook_jp/zh/en of terms[3] (p05–p07), memory_hook_en of terms[1] (p08);
      u02 explanation_en/zh of terms[4] (p04–p05), memory_hook_zh of terms[2] (p06), summary.key_points_zh[4] (p08);
      u03 explanation_jp/zh/en of terms[1] (p01–p03), memory_hook_en of terms[3] (p09) and terms[4] (p10);
      u04 explanation_en of terms[0] (p06), definition_zh of terms[1] (p08), explanation_jp/zh/en of terms[2] (p09–p11)
  ruleA verbatim miss: [] in all 4 units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 43/43 (u01 13/13, u02 9/9, u03 10/10, u04 11/11)
  base.replace(Rule A before, Rule A after) == unit field: 41/41 fields true (u01 12 fields incl. terms[3].detail_zh with 2 pairs in order)
raverb.mjs: 86 Rule A strings, verbatim miss 0
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 15 kinds miss 0 | u02 15 | u03 11 | u04 9 — miss 0 in all
D-200 (patched 考点, jp chars without spaces / sentences): u02 terms[6].points[0] (p01, mix, qids 2014h26h-q093 / 2011h23tokubetsu-q097) 71 / 1;
  u04 terms[5].points[0] (p01, exam, 2026r08-q060) 60 / 1; u03 terms[0].points[0] (zh only, exam, 2009h21h-q067) 46 / 1; u03 terms[6].points[0] (zh only, mix) 53 / 1. All ≤100 / ≤2.
grep in the units (old wording, expect 0):
  u01 "双击" 0 / "すっと払って" 0 / "轻轻一拂" 0 / "quick sweep" 0 / "マルチタスク" 0 / "多任务" 0 / "multitasking" 0 / "Human-Centred Design (HCD)." 0 / "**张开**" 0 / "**捏合**" 0
  u01 q059 choice texts (strip inline, case-insensitive): イ zh 双击 base 1 (terms[4].detail_zh) → unit 0; ウ en Multitasking base 1 (terms[3].hook_en) → unit 0; ウ jp / zh, イ jp / en, ア all 0 → 0
  u02 "選べる数が 1 つに決まる項目には" 0 / "选择数固定为一个的输入项用 **" 0 / "Use **radio" 0 / "is what makes a GUI" 0 / "易用性的支撑" 0 / "“长押”" 0 / "只能一个" 0 / "输入的工夫" 0 / "Hold still" 0
  u03 "どの機能にも" 0 / "任何功能" 0 / "any function" 0 / "作业" 0 / "手続きだけ" 0 / "只告诉你" 0 / "told only" 0 / "所出现的显示" 0 / "toaster right where" 0 / "size of a thumbnail" 0
  u04 "画面の幅に応じて" 0 / "screen width, so" 0 / "moves an access" 0 / "Description language" 0 / "may never" 0 / "print order" 0 / "rollover，" 0 / "GUI には、文字の入力" 0 / "GUI 还提供" 0 / "A GUI also offers" 0;
      "屏幕宽度改变" 3 (overview_rows[5].one_line_zh, terms[5].points[1].text_zh, pairs[1].rows[1].b_zh — definition-side fields that Rule A L1 keeps on 画面幅 on purpose, not the qid 考点)
```

The only validate warn is the u02 zh-term `リスト → 列表` warn on `terms[6].analogy_zh`, present in the base part as well and ruled a false positive by Rule A u02 L12 (日常語の持ち物リスト = 清单); no patch touches that field. `stage` meta is removed in all 4 units (as in b19–b68).

**Application.** All 43 `before` strings occur exactly once in their base field, all 43 `after` strings are present, and replay reproduces every patched field (u01 p09 and p10 both edit `terms[3].detail_zh` and replay in order). Net `before` remnants are 0 except u01 p11 / p12, whose one- / two-character `before` (「张开」「捏合」) also occurs as a verb in `key_points_zh[2]`, which Rule A L5 says to leave (§U1.3). 12 are shortened phrases of the Rule A strings; all 43 pairs give exactly the Rule A after text (same.mjs 41/41 fields).

## U1. technology-19-51-u01 (Rule A FAIL M1, 建議修 L1 / L2 / L3 / L5; L4 not adopted)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | zh | 3 → 3 (于选择, 2009h21h-q067 stem; the span is in the unchanged 1st sentence) | 2 (，即) |
| p02 | jp | 2 → 2 (れた) | 2; win12 0/0 → 0/0; Dice 0.04 → 0.03 |
| p03 | zh | 2 → 2 (过去) | 2 |
| p04 | en | 7 → **8** (" across ", 2012h24a-q074 ア) | 8 (same) |
| p05 | jp | **6 → 4** (マルチタスク, 2017h29h-q059 ウ → gone) | マルチ (3); win12 0/0 → 0/0; Dice 0.19 → **0.08** (q059 ウ) |
| p06 | zh | 6 → 6 (" multi", unchanged) | 6 |
| p07 | en | 12 → 12 (" is the same", unchanged) | 9 |
| p08 | en | 12 → 12 (" the design ", unchanged) | "It is " (6) |
| p09–p13 | zh | 1–3 → 1–3 (single characters / ，以及) | 1 |

- **Rise**: p04 +1 (the common word " across "). No other rise. p05 removes the only real overlap the unit had with a q059 choice.
- **Targeted** (`tgt.mjs`): `terms[3].hook_jp` vs q059 ウ LCS 6 → 3, Dice 0.19 → 0.08, ed 0.88 → 0.93, win12 0/0. Direct choice-text search: q059 イ zh 「双击」 1 field → 0, q059 ウ en "Multitasking" 1 field → 0; no q059 choice text in any u01 field after patching except エ (the correct answer, マルチタッチ / 多点触控 / Multi-touch, the headword).

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[4](タップ).detail_zh` (+ explanation_zh) | M1 | Yes (§U1.3) | No | OK |
| p02–p04 | `terms[5](スワイプ).analogy_*` | L1 | Yes: 「指先で触れたまま横へ滑らせて脇へよける」/「用指尖按着…朝旁边滑过去」/ "sliding a sheet of paper across a desk with your fingertip pressed on it" — the image is now "keep contact and slide" = スワイプ one 「触れた指を離さずに一方向へ滑らせる」 and u02 flick 考点 「スワイプ は指を触れたまま画面上を滑らせる操作」; the u02 flick definition words (素早く払って離す / 快速一划 / quickly brushed) are gone from the analogy in all three languages | No (Obs. 3) | OK |
| p05–p07 | `terms[3](マルチタッチインタフェース).hook_*` (+ memory_hook_*, summary.memory_hooks_*[3]) | L2 | Yes: 「マルチメディアなどと同じ接頭語で」/「与多媒体等词中的 multi」/ "the same prefix as in multimedia" — the q059 wrong option ウ (マルチタスク / 多任务处理 / Multitasking) is no longer used as a memory cue. The hook still ends 「ここでは触れる点が複数」, so q059 エ is still the cue | No | OK |
| p08 | `terms[1](人間中心設計).hook_en` (+ memory_hook_en, summary.memory_hooks_en[1]) | L3 | Yes: "It is abbreviated HCD." The summary line is now "Human-Centered Design: It is abbreviated HCD. …" — one spelling (= `term_en`) | No (Obs. 4) | OK |
| p09–p13 | `terms[3].detail_zh` (×2), `fig.data.rows[0..1].cells[0].zh`, `pairs[1].rows[2].b_zh` | L5 | Yes: ピンチアウト = 向外张开 / ピンチイン = 向内捏合 in all five places, = u02 `terms[1].detail_zh` / `points[1].text_zh` (向外张开 / 向内捏合), so 「捏合」 alone keeps one meaning across u01〜u02 as an operation name (u02 headword ピンチ = 捏合（Pinch）, both directions). Bold 2 → 2 and `[[jp:]]` 2 → 2 in detail_zh; table cells and pair cell plain as before | No (Obs. 5) | OK |

### U1.3 Focused checks — M1 (zh ダブルタップ) and L4 (not adopted)

- **M1 after**: 「…也有改变触碰方式的衍生操作，比如**连点两下**[[jp:ダブルタップ]]，即在同一位置连续轻触两次。」 = the Rule A text exactly. 「双击」 (= q059 イ ダブルクリック zh) is gone from u01 (0 fields) and from u02〜u04 (0 fields, §X). The first sentence 「它相当于鼠标的单击」 (tap ≈ a mouse single click) is unchanged and is correct. jp 「**ダブルタップ**」 / en "**double tap**" unchanged, bold 1 → 1, `[[jp:]]` 1 → 1. A zh reader now learns the touch operation as 连点两下 (two taps), a different word from q059 イ's 双击, so q059 イ no longer reads as a touch-screen input; q059 エ (多点触控) is still the only option the unit supports. `zh_terms.json` has no entry for ダブルタップ; validate 0.
- **L4 not adopted — confirmed**: the patch file has **no** patch on `terms[0].*` and no patch whose `before` / `after` contains ISO / JIS / 9241 / 8521 (script: 0 of 13). `terms[0].detail_jp/zh/en` are byte-identical to the base (not in the changed-path list). The session log (S151 b71 u01 Rule A line) records the non-adoption with the reason: primary source not obtainable (iso.org 403), 3 elements unchanged across editions, management-09-26-u04 precedent.
- **Is leaving it acceptable? Yes.** (1) Rule A itself ranks L4 LOW (not MEDIUM) and makes the patch conditional on a primary-source check before patching (「補丁前に ISO OBP / JISC で一次確認すること」); that check could not be done, so not adopting is the conservative reading of Rule A. (2) Adding the sentence would add a new standard-edition claim (D-205 / D-210 — exactly the claim type that needs a source) without a primary source, which is a larger risk than the current unversioned statement. (3) The unit's 3 elements (有効さ・効率・満足度) are the same in ISO 9241-11:1998 and :2018 and in JIS Z 8521:1999 and :2020 (my own knowledge, agreeing with Rule A; primary text not fetched by me either), and none of the cited / quiz / challenge questions (2009h21h-q067, 2017h29a-q058, 2017h29h-q059, 2014h26h-q032) depends on the edition. So the unversioned statement teaches no wrong fact and misleads on no question. It stays a 記録のみ-level LOW (Obs. 6).
- **L5 remnant**: `key_points_zh[2]` 「可以进行用两根手指张开、捏合等多点同时接触的操作」 keeps 「张开、捏合」 as verbs (open / pinch the fingers), as Rule A L5 says (「操作名でないので据え置き」). Read with u02, where 捏合 is the headword ピンチ (both directions), the verb pair is not a conflicting operation name. Not a defect (Obs. 5).
- No 考点 changed in u01 (all 13 patches are detail / analogy / hook / fig / pairs). Parity 33 / 0 diff. **u01: M1, L1, L2, L3, L5 resolved; L4 left as recorded.**

## U2. technology-19-51-u02 (Rule A PASS, 建議修 L1–L6)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 8 → **9** (チェックボックスを, 2011h23tokubetsu-q097 イ) | 9 (same); win12 0/0 → 0/0; Dice 0.26 → **0.19** (2014h26h-q093 イ) |
| p02 | zh | 4 → **6** (用单选按钮，, 2011h23tokubetsu-q097 ウ) | 6 (same) |
| p03 | en | 17 → 15 (" radio buttons ", q097 ウ) | 15 |
| p04 | en | 19 → 19 (" without reading an", unchanged) | " easy to u" (10) |
| p05 | zh | 4 → 4 (" GUI") | 4 |
| p06 | zh | 6 → 6 (" press", unchanged) | 相同， (3) |
| p07 | zh | 2 → 2 (一个) | 2 |
| p08 | zh | 4 → 3 | 输入时 (3) |
| p09 | en | 9 → 9 (" without ", unchanged) | 9 |

- **Rises**: p01 +1 is the term name + particle (チェックボックス + を); p02 +2 is 用 + term name + comma, matching the correct option ウ of q097 (radio buttons for a two-way single choice). Targeted (`tgt.mjs`): `terms[6].points[0].text_jp` vs q097 ウ (正答) LCS 6 → 6, Dice 0.19 → 0.15, ed 0.90 → 0.84; vs q097 イ (誤答, チェックボックス for one prize) LCS 9 → 9, Dice 0.20 → 0.18, ed 0.79 → 0.79; vs 2014h26h-q093 エ LCS 6 → 6, Dice 0.19 → 0.14; win12 0/0 in all. The 考点 does not use q097's scenes (希望賞品 / 性別) and does not list the q093 choice set.

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[6](チェックボックス).points[0].text_*` (mix, qids 2014h26h-q093 / 2011h23tokubetsu-q097) | L1 | Yes (§U2.3) | No | OK |
| p04–p05 | `terms[4](アイコン).detail_en/zh` (+ explanation_*) | L2 | Yes: "helps make a GUI easy to use" /「是 GUI 好用的重要基础」 = jp 「GUI の使いやすさを支えている」 (one factor, not the only reason); zh noun string also simpler | No | OK |
| p06 | `terms[2](ロングプレス).hook_zh` (+ memory_hook_zh, summary) | L3 | Yes: 「构词方式与日语的 [[jp:長押し]] 相同，中文“长按”也是同样的结构」 — the non-word 「长押」 is gone; the original 長押し stays as a `[[jp:]]` tag (count 1 → 1) and appears in jp text (origin check miss 0) | No | OK |
| p07 | `pairs[0].rows[0].a_zh` | L4 | Yes: 「只能选一个」 = `overview_rows[5].extra_zh` | No | OK |
| p08 | `key_points_zh[4]` (+ summary.key_points_zh[4]) | L5 | Yes: 「减少用户输入时的麻烦和错误」 | No | OK |
| p09 | `terms[2].fig.data.rows[2].cells[2].en` | L6 | Yes: "Press and hold without moving" = jp 「動かさずに押し続ける」 | No | OK |

### U2.3 Focused checks — L1 (radio button / checkbox, LOW / MEDIUM boundary)

- **After (三語)**: 「**ラジオボタン** と **チェックボックス** は選べる数で使い分け、1 つに決まる項目にはラジオボタン、0 個以上いくつでも選べる項目にはチェックボックスを使う。」/「**单选按钮**（[[jp:ラジオボタン]]）和 **复选框**（[[jp:チェックボックス]]）按可选数量区分使用：…」/ "**Radio buttons** (…) and **checkboxes** (…) are chosen by how many selections a field allows: radio buttons where…, checkboxes where…".
- **Does it still imply that every single-choice field uses radio buttons? No.** The sentence topic is now the pair of the two widgets and the rule is stated as how one chooses *between them* (使い分け / 区分使用 / "are chosen by"); the two clauses after the comma / colon are the two branches of that choice. A reader is no longer told "a one-choice field → radio button" as a stand-alone rule. This agrees with the other single-choice parts in the topic: u03 `terms[2](プルダウンメニュー)` one 「表示された項目の中から 1 つを選ばせるメニュー」 and exam 考点 (2013h25h-q065) 「そこから 1 つを選ばせる部品」, u03 `terms[0](リストボックス)` one (候補を一覧で並べて選ばせる部品) and 2009h21h-q067 (a one-of-seven prefecture choice made with a list box) — none of these now conflicts with u02. The radio-button exam 考点 (`terms[5].points[0]`, unchanged) also says 「…1 つに絞って入力させる項目に**適した**部品」, not "the only part".
- **Cited questions still answered**: 2014h26h-q093 (one of four 種別 → エ ラジオボタン) and 2011h23tokubetsu-q097 (ウ correct: 2-way 性別 with radio buttons; イ wrong: one desired prize with checkboxes) — the 考点 still gives "one allowed → radio button, any number → checkbox" between the two, so both correct answers are reached and q097 イ is rejected. 71 chars, 1 sentence, qids kept; bold 2 → 2 (jp), `[[jp:]]` 2 → 2 (zh / en).
- Residual: the branch 「1 つに決まる項目にはラジオボタン」 is still unconditional inside its clause. Read with the new topic phrase and with u03, this is not an over-general rule; I record it as resolved at LOW level, no new issue. Parity 27 / 0 diff. **u02: L1–L6 resolved.**

## U3. technology-19-51-u03 (Rule A PASS, 建議修 L1–L3)

### U3.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 9 → 9 (プルダウンメニュー, 2013h25h-q065 stem, term name in an unchanged sentence) | 利用者 (3); win12 0/0 → 0/0; Dice 0.23 → 0.22 |
| p02 | zh | 4 → 4 (下拉菜单, unchanged) | 在画面 (3) |
| p03 | en | 16 → 16 ("a pull-down menu", unchanged) | "ctions from " (12) |
| p04 | jp | 4 → 4 (るような) | 4; win12 0/0 → 0/0; Dice 0.14 → 0.08 |
| p05 | zh | 3 → 2 | 2 |
| p06 | en | 8 → **9** ("k to the ", 2011h23tokubetsu-q099 イ) | 9 (same) |
| p07 | zh | 3 → **4** (录入工作, 2014h26a-q093 stem) | 4 (same) |
| p08 | zh | 3 → **6** (后显示出来的, 2025r07-q079 ア) | 6 (same) |
| p09 | en | 8 → 7 | 7 |
| p10 | en | 15 → 10 (" of a thumbnail" gone) | "e size of " (10) |

- **Rises**: p06 +1 ("back to the" generic), p07 +1 (录入工作 = data-entry work, vs a spreadsheet question's stem), p08 +3 (后显示出来的 "displayed after", a generic verb phrase; 2025r07-q079 is the サムネイル question, whose correct ア describes a different object). None carries a question's frame. Targeted: `terms[1].detail_jp` vs 2013h25h-q065 stem LCS 9 → 9 (the term name), Dice 0.23 → 0.22, ed 0.84 → 0.85, win12 0/0.

### U3.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[1](メニューバー).detail_*` (+ explanation_*) | L1 | Yes: 「利用者は多くの機能にここからたどり着ける」/「大多数功能」/ "most functions" — no universal claim; zh 作业 → 使用 (loc-review item) also fixed. First sentence (File / Edit / View, pull-down) unchanged | No | OK |
| p04–p06 | `terms[3](ポップアップメニュー).analogy_*` | L2 | Yes: 「本を手に取ったその場に司書が来て、受付まで戻らなくても手続きを教えてくれる」 / zh / en same — the image is now "appears where you are" (= one 「操作をした位置に、その場で現れる」, detail 「画面上端までマウスを動かす手間が省ける」, 受付 = menu bar); the "only that book's procedures" = context-dependence for all pop-ups is gone, so the analogy no longer widens what detail / `pairs[1].rows[2]` limit to the right-click case | No | OK |
| p07 | `terms[0].points[0].text_zh` (exam, 2009h21h-q067) | L3 | Yes: 「在连续输入相同值的录入工作中」 — 作业 gone; the q067 condition (same values entered in a row) kept; 46 chars jp unchanged, 1 sentence | No | OK |
| p08 | `terms[6].points[0].text_zh` (mix) | L3 | Yes: 「工具提示…是这一操作后显示出来的说明的名称」 = jp 「その操作で出る表示の名前」; the cause / result frame kept | No | OK |
| p09 | `terms[3].hook_en` | L3 | Yes: "…like toast jumping out of a toaster, the menu appears right where you are." — "right where you are" now attaches to the menu | No | OK |
| p10 | `terms[4].hook_en` | L3 | Yes: "a picture shrunk to about the size of a fingernail" — the thumbnail-by-thumbnail loop is gone and the jp 「爪」 cue stands | No | OK |

### U3.3 Focused checks

- p07 / p08 are zh-only changes in 考点; no claim changed, qid (q067) kept. The pop-up analogy now agrees with `pairs[1].rows[2]` (「右クリックで出す場合は、指している対象に合わせて変わる」). Parity 31 / 0 diff. **u03: L1–L3 resolved.**

## U4. technology-19-51-u04 (Rule A PASS, 建議修 L1–L3)

### U4.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 6 → 6 (レスポンシブ, 2026r08-q060 stem, term name) | などに応じて (6, q060 ア); win12 4/0 → 4/0 (all 4 = the term name レスポンシブWebデザイン, masked 0); Dice 0.29 → 0.28 |
| p02 | zh | 10 → 10 (响应式 Web 设计, term name) | 屏幕 (2) |
| p03 | en | 22 → 22 (" responsive web design", term name) | "t the screen " (13) |
| p04 | en | 7 → 7 | 7 |
| p05 | en | 12 → 7 ("Description " gone) | 7 |
| p06 | en | 13 → 13 (" the user is ", unchanged) | " the user" (9) |
| p07 | en | 12 → **14** (" instructions ", 2011h23tokubetsu-q097 stem) | 14 (same) |
| p08 | zh | 4 → 3 ("roll" gone) | 1 |
| p09 | jp | 7 → 7 (リストボックス, unchanged sentence) | されている (5); win12 0/0 → 0/0; Dice 0.14 → 0.14 |
| p10 | zh | 4 → 4 (的列表框, unchanged) | 4 |
| p11 | en | 15 → 13 | " screens " (9) |

- **Rises**: p07 +2 (the common word " instructions "). p01's after-span 「などに応じて」 is the qualifier that L1 restores on purpose from q060 ア (D-208 (2): the qid 考点 must not be narrower than the correct answer). Targeted vs q060 ア: LCS 4 → 6, Dice 0.11 → 0.14, ed 0.95 → 0.96, win12 0/0 — far from the HIGH calibration (Dice 0.52 / ed 0.14); vs q060 stem Dice 0.29 → 0.28. `terms[2].detail_jp` vs 2017h29a-q058 stem LCS 6 → 4, Dice 0.12 → 0.10.

### U4.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[5](レスポンシブWebデザイン).points[0].text_*` (exam, 2026r08-q060) | L1 | Yes: 「画面の幅などに応じて」/「按屏幕宽度等」/ "the screen width and other display conditions" — the 考点 is no longer narrower than q060 ア (画面サイズなど); ア still selected, イ (配信サーバ) / ウ (センサー) / エ (ホバーでポップアップ) get no support. Definition-side fields keep 画面幅 as Rule A intends. 60 chars, 1 sentence, qid kept; bold 1 → 1 | No | OK |
| p04 | `overview_rows[6](リダイレクト).one_line_en` | L2 (a) | Yes: "automatically sends a visitor on to another URL" | No | OK |
| p05 | `overview_rows[3](CSS).extra_en[0]` | L2 (b) | Yes: "Style language" | No | OK |
| p06 | `terms[0](ホバー).detail_en` (+ explanation_en) | L2 (c) | Yes: "may not reach the user" = jp 「伝わらないことがある」 | No | OK |
| p07 | `terms[3](CSS).analogy_en` | L2 (d) | Yes: "the printing instructions that say which typeface and colors…" | No | OK |
| p08 | `terms[1](ロールオーバー).one_zh` (+ definition_zh) | L2 (e) | Yes: 「**翻转**（[[jp:ロールオーバー]]）是指…」 = the other one_zh (e.g. `terms[0].one_zh` 「**悬停**（[[jp:ホバー]]）」); `term_zh` 「翻转（rollover）」 unchanged | No | OK |
| p09–p11 | `terms[2](GUI).detail_*` 3rd sentence (+ explanation_*) | L3 | Yes: 「GUI の画面でも文字を打ち込む場面はあり、その手間を減らす補助の機能が用意されている」 / zh / en same — input help is no longer presented as a GUI feature as opposed to CUI; the next mix 考点 (CUI はキーボードで命令を打ち込む) no longer reads as "keyboard help = GUI only". The lead-in to オートコンプリート is kept | No | OK |

### U4.3 Focused checks

- The only patched 考点 is p01–p03 (exam). Parity 33 / 0 diff. **u04: L1–L3 resolved.**

## X. Cross-unit check — gesture terms, widget / menu terms, hover wording (u01〜u04, 三語)

| Axis | u01 (after patch) | u02 (after patch) | u03 (after patch) | u04 (after patch) | Contradiction? |
|---|---|---|---|---|---|
| (a1) tap / double tap | タップ / 轻点 / Tap; ダブルタップ / **连点两下** / double tap (p01) | タップ / 轻点 (ロングプレス 考点) | — | — | No — 双击 0 in all 4 units, so q059 イ's zh word is never used for a touch operation |
| (a2) swipe vs flick | スワイプ / 滑动 / Swipe = 触れたまま滑らせる (one, pairs, 考点, **analogy p02–p04**) | フリック / 轻扫 / Flick = 素早く払って離す; 考点: スワイプ = 触れたまま滑らせる, フリック = 短く素早く払って離す | — | — | No — u01 analogy now matches u02's description of swipe; u02's flick words (払って離す / 一划 / brush) appear in u01 only in the swipe `hook` (dictionary sense of swipe, Rule A L9 ③ 記録のみ, Obs. 3) |
| (a3) pinch | ピンチアウト 向外张开 / ピンチイン 向内捏合 (**p09–p13**); key_points_zh[2] verbs 张开、捏合 | ピンチ = 捏合（Pinch）; ピンチアウト 向外张开 / ピンチイン 向内捏合 | — | — | No — operation names now identical in u01 / u02; 捏合 as a name means ピンチ only in u02 (headword) |
| (a4) long press | 長押し / 长按 [[jp:長押し]] (タップ 考点) | ロングプレス / 长按 [[jp:ロングプレス]], 「長押しとも呼ぶ」; hook_zh (p06) 「与日语的 [[jp:長押し]] 相同，中文“长按”…」 | — | — | No — same zh word 长按, the jp alias explained in u02 |
| (a5) multi-touch | マルチタッチインタフェース / 多点触控界面; hook (p05–p07) no マルチタスク | マルチタッチ / 多点触控 (ピンチ 考点, same qid q059) | — | — | No |
| (b1) single choice widgets | — | radio / checkbox 考点 (p01–p03) = choice between the two by count | プルダウンメニュー 1 つを選ばせる; リストボックス 一覧から選ばせる (q067 = list box one-of-seven) | GUI detail: リストボックスやメニューは GUI の部品 | No — u02 no longer states "one choice → always radio button" (§U2.3) |
| (b2) menus / context | ロングプレス detail: 補助メニュー / zh 辅助菜单 / en "context menu", ≈ 右クリック | — | メニューバー 多くの機能 (p01–p03); ポップアップ = 右クリックなど, その場で現れる (analogy p04–p06); 右クリックで出すもの = コンテキストメニュー | — | No — u03 analogy now matches u03 one and is consistent with u02's "≈ right-click" (Obs. 7 for the u02 en term) |
| (c) hover | — | — | ツールチップ detail: ポインタを重ね、クリックせずに止める**操作**を ホバー / 悬停 / hovering; 考点 zh (p08) 「这一操作后显示出来的说明」 | ホバー one: クリックせずにとどめている**状態**; detail_en (p06) "may not reach"; ホバー / ロールオーバー = 状態 / 効果 | No — both say "rest the pointer without clicking"; u03 calls it an operation (操作), u04 a state (状態) — pre-existing, untouched by these patches except p08 zh which keeps u03 jp's 操作 (Obs. 8) |

- **Gesture zh terms are now one set across u01 / u02**: 轻点 (tap), 连点两下 (double tap, u01 only), 滑动 (swipe), 轻扫 (flick), 捏合 (pinch), 向外张开 / 向内捏合 (pinch out / in), 长按 (long press), 多点触控 (multi-touch). en: tap / double tap / swipe / flick / pinch / long press / multi-touch. jp terms unchanged.
- u01 patches remove both q059 wrong options from the unit text (イ zh 双击, ウ マルチタスク三語), while q059 エ remains the only option named. u02's q059 考点 (`terms[1].points[0]`, unchanged) is unaffected.
- u03 / u04 patches do not touch gesture terms; u04 GUI L3 now agrees with u03 (list box, menus) and with u01's オートコンプリート 考点 (the input help is not GUI-only).

## 4. F-fix

No required F-fix in any of the 4 units. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: the only warn is u02 zh-term リスト → 列表 on `terms[6].analogy_zh` (base and unit, Rule A L12 false positive, field not patched). 0 warns in u01 / u03 / u04.
   - `stage` meta is removed in all 4 units (as in b19–b68).
   - ruleA verbatim miss = none. 12 of 43 patches use shortened phrases; same.mjs shows all 43 pairs give the same field as the Rule A strings. 2 Rule A strings are cut by "…" (u04 `terms[0].detail_en`, `terms[1].one_zh`) and were used without it. `same.mjs` gained `#n` keys for u01 `terms[3].detail_zh` (2 pairs in one field).
   - net remnant 0 for 41/43; u01 p11 / p12 = 「张开」「捏合」 in `key_points_zh[2]` (+ summary), kept by Rule A L5.
   - Bases: all `loc.r0`; u03 is attempt `a2` (a1 jp-rejected, Rule B archived), others `a1`. Patch paths in u01 / u02 / u04 carry labels (`terms[4](タップ)…`); they resolve in check.mjs / d198.mjs / same.mjs.
   - d198.mjs zh / en choice sources for this topic are the stringified `{zh, en}` choice objects (translation shape `choices.ア.zh`), so zh / en LCS against choices runs on a string that holds both languages; the q059 choice check was therefore re-done by direct text search (§1, §U1.1).
2. u01 L7 (loc-review r1 LOWs: 滑动…滑动 loop, "answers with sound", "Its strength is", etc.) was optional in Rule A and is not bundled; still 記録のみ.
3. u01 `terms[5].hook_*` still glosses swipe as 「さっとこする・払う」/「迅速擦过、拂过」/ "rub or sweep quickly" (the English dictionary sense). With the analogy fixed it is a word-origin note, not the image of the gesture (Rule A L9 ③, 記録のみ).
4. u01 `terms[1].hook_jp/zh` keep the British spelling 「Human-Centred Design (HCD)」 as the English-name note; Rule A L3 says jp / zh need no change. After p08 the en summary line no longer shows two spellings; jp / zh summary lines show the jp / zh headword, not `term_en`.
5. u01 `key_points_zh[2]` 「张开、捏合」 are finger verbs, not operation names (Rule A L5); u02 uses 捏合 as the ピンチ headword. Read in order (u01 → u02) this is not a conflict.
6. u01 L4 (ISO 9241-11 / JIS Z 8521 edition) stays a 記録のみ-level LOW: no primary source, 3 elements identical in both editions, no cited question depends on the edition (§U1.3). If a primary text (ISO OBP / JISC) becomes available, the Rule A sentence could be added then; nothing requires it now.
7. u02 `terms[2].detail_en` says "context menu" for jp 補助メニュー; u03 (later unit) defines コンテキストメニュー. Pre-existing, not patched, meaning correct.
8. Hover is an 操作 in u03 (ツールチップ detail / 考点) and a 状態 in u04 (one, ロールオーバー 考点 「状態 / 効果」). Both describe the same thing (pointer resting without a click); u04 goals word it as 「操作の状態」. Pre-existing, no question depends on the difference.
9. D-198 rises: u01 p04 +1; u02 p01 +1 / p02 +2 (term name + particle, toward q097 ウ = correct); u03 p06 +1 / p07 +1 / p08 +3; u04 p07 +2; u04 p01 after-span = the restored 「など」 from q060 ア (Dice 0.14, ed 0.96). Several patches lower overlap (u01 p05 6 → 4 = q059 ウ gone, u03 p10 15 → 10, u04 p05 12 → 7, u04 p11 15 → 13).

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-19-51-u01 | FAIL (M1) | **13/13** (L4 not adopted, recorded) | M1 resolved (zh ダブルタップ = 连点两下; 双击 = q059 イ zh 0 fields in u01〜u04) | 0 / 0 / 0 | **PASS** |
| technology-19-51-u02 | PASS | **9/9** | — (L1 at the LOW / MEDIUM boundary resolved, §U2.3) | 0 / 0 / 0 | **PASS** |
| technology-19-51-u03 | PASS | **10/10** | — | 0 / 0 / 0 | **PASS** |
| technology-19-51-u04 | PASS | **11/11** | — | 0 / 0 / 0 | **PASS** |

- **Application:** 43/43 exact (replay, part-level). 0 unexplained diffs, net `before` remnants 0 except the two kept zh verbs (u01 p11 / p12), derived fields follow (303 checked, 0 mismatch), memory_hooks pairing 0 bad. 12/43 shortened, and all 43 give the same field as the Rule A string (same.mjs). Every MEDIUM and 建議修 is covered except u01 L4 (deliberately not adopted; LOW, primary source unobtainable).
- **D-198:** no patch adds a meaningful overlap. The rises are generic words or term name + particle (u01 p04, u02 p01 / p02, u03 p06–p08, u04 p07) or the qualifier L1 restores on purpose (u04 「など」, Dice 0.14 / ed 0.96, win12 0/0). u01 p05 removes the q059 ウ overlap.
- **D-200:** patched 考点 u02 `terms[6].points[0]` 71 / 1, u04 `terms[5].points[0]` 60 / 1, u03 `terms[0].points[0]` (zh only) 46 / 1, `terms[6].points[0]` (zh only) 53 / 1; qids kept; no 考点 claim reversed. **D-202:** `[[jp:]]` origin miss 0 in all 4 units; bold / tag counts unchanged in all 43. **D-204 / 書き方 7:** u01 swipe analogy = u02 swipe description, u01 / u02 pinch zh terms identical, u02 radio / checkbox no longer conflicts with u03 single-choice parts, u03 pop-up analogy = one / pairs, u04 GUI input help = u03 / u01 (§X). **D-205 / D-210:** no new law, standard version or numeric claim (u01 L4's edition claim deliberately not added).
- **Gates:**
  - validate --unit ×4: 0 issues / EXIT 0 (1 known false-positive warn in u02)
  - validate --part ×4: 0 issues, sha256 = base_sha256 for each
  - parity ×4: 0 diff (33 / 27 / 31 / 33 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for all 4 units.** All 43 active patches are applied exactly, and the MEDIUM and every adopted 建議修 LOW are resolved in context in all three languages:
- u01 p01: zh ダブルタップ = 连点两下, no longer the q059 イ zh word 双击; p02–p13: swipe analogy = keep contact and slide, マルチタスク (q059 ウ) removed from the hook, one en HCD spelling, pinch out / in zh = u02. L4 left as recorded (acceptable, §U1.3).
- u02 p01–p09: radio / checkbox 考点 is now a choice between the two widgets (no "every one-choice field" reading), icon zh / en strength, 长押 → [[jp:長押し]] + 长按, three zh / en wording items.
- u03 p01–p10: menu bar "most functions", pop-up analogy = appears where you are, zh 作业 and two en hooks fixed.
- u04 p01–p11: RWD 考点 「画面の幅など」 = q060 ア's scope, five zh / en items, GUI input help not GUI-only.

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
