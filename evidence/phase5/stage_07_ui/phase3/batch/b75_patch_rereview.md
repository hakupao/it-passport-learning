# b75 B3 patch re-review — technology-19-50 u01〜u02 (デザインの基本原則と情報整理、UX手法・認知と視覚表現)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the two Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b75rv/`: `check.mjs` / `same.mjs` / `d198.mjs` / `raverb.mjs` copied from `b73rv/` with only the unit map changed (2 units; bases `b75-u01-a1` / `b75-u02-a2`, round `r0`). `same.mjs` reads the 12 Rule A before / after pairs from `b75rv/ra.json`, copied by hand from the two Rule A "修正案" cells (`b75rv/mkra.mjs` writes it). `raverb.mjs` confirms all 24 strings verbatim in the Rule A files (miss 0). Unit-wide greps, `[[jp:]]` origin, the cited-question lookup and the cross-unit term count (§X) were run as one-off `node -e` commands (not saved). No scratch files in the repo.
- Date: 2026-11-09 (Session 151, b75)
- Scope: the B3 wording patches for 2 units. **12 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (デザインの基本原則と情報整理) | PASS, 建議修 L1 / L2 | p01–p06 | L1 → p01–p03 (`terms[5](LATCH).detail_*` 3rd sentence, recipe example); L2 → p04–p06 (`terms[0](デザインの原則).analogy_*`, proximity image) | 0/6 |
| u02 (UX手法・認知と視覚表現) | PASS (a1 MEDIUM 3 resolved in a2), 建議修 L1–L4 | p01–p06 | L1 → p01 (`terms[0](シグニファイア).detail_en`); L2 → p02 (`terms[4].one_zh`), p03 (`overview_rows[4].one_line_zh`), p04 (`key_points_zh[3]`); L3 → p05 (`terms[0].one_zh`); L4 → p06 (`terms[5].analogy_zh`) | 3/6 (p01, p04, p05) |

  Every 建議修 is covered. 記録のみ LOWs (u01 L3–L9, u02 L5–L10) and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **3 of 12** (counted by script as patch `before` ≠ `ra.json` before: u02 p01 drops the sentence tail ", or the text on a display.", p04 drops the leading `**象形图**`, p05 drops the leading `让人察觉到`). `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **12/12**, so all shortened patches give the same result as the Rule A strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-19-50-u01/parts/b75-u01-a1/technology-19-50-u01.loc.r0.json` `0dc1ac6b7145d377…`
  - u02 `.../technology-19-50-u02/parts/b75-u02-a2/technology-19-50-u02.loc.r0.json` `f2cacb52793637dc…`
- Merged units (current) `data/ip/textbook/units/technology-19-50-u0N.json` sha256: u01 `0c52876060b768c3…`, u02 `eee2a1bef7df7c60…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b73_patch_rereview.md` §0 (no unit-level patches in this batch). Both units share topic technology-19-50 (8 questions), so there are 40 source strings per language.

1. **Application check** (`b75rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b75rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b75rv/d198.mjs`, all 12 patches): whole-field LCS before → after and LCS of the `after` span against the 40 sources per language; jp also 12-char windows (unmasked / masked) and Dice.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json`: 2025r07-q072 (4 原則の穴埋め, u01 の唯一の内容題; 誤答の相手 操作 / 価値), 2015h27a-q061 (UD; zh stem lists 文化・语言・年龄… — source of the u02 p02 after-span `语言`), 2024r06-q068 (シグニファイア), 2022r04-q033 / 2011h23a-q062 (アクセシビリティ).
5. **Cross-unit checks (key check of this batch)**: read u01〜u02 together with technology-19-51 u01〜u04 (インタフェース設計), already v2, in jp / zh / en (all body fields, derived / summary excluded from the counts) on (a) UX / UX デザイン, (b) usability / ユーザビリティ, (c) accessibility / アクセシビリティ, (d) universal design / ユニバーサルデザイン and バリアフリー, (e) signifier / affordance (§X).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording and a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b73): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 122 / u02 124) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-09)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-19-50-u01   → ✓ 0 issues               EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-19-50-u01   → ✓ 25 locations, 0 diff   EXIT=0
$ ... validate --unit technology-19-50-u02 → ✓ 0 issues, 1 warning  EXIT=0 | parity → ✓ 28 locations, 0 diff  EXIT=0
      warn  zh-term  terms[1](構造化シナリオ法).analogy_zh  スイッチ → 交换机（Switch） not in the zh text
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 loc#0 counts {"terms":6,"figs":2,"steps":0,"points":6,"pairs":2,"key_points":5,"goals":4}  sha256 0dc1ac6b7145d377…  ✓ 0 issues  EXIT=0
  u02 loc#0 counts {"terms":6,"figs":4,"steps":3,"points":8,"pairs":2,"key_points":4,"goals":4}  sha256 f2cacb52793637dc…  ✓ 0 issues, 1 warning (same zh-term warn)  EXIT=0
  (both sha256 = base_sha256 of every patch in that unit; the u02 warn is present in the pre-patch base too = not introduced by
   a patch; Rule A u02 O1 rules it a false positive: 家のスイッチ = 开关, not network 交换机)
vitest src/lib/textbook, run 1: Test Files 1 failed | 12 passed (13), Tests 1 failed | 161 passed (162)
  FAIL src/lib/textbook/__tests__/v1-snapshot.test.ts > every current v1 unit matches its recorded dictionary senses and unit anchors
       AssertionError: expected 0 to be greater than 0   (expect(Object.keys(now).length).toBeGreaterThan(0))
  cause: the working tree now has 0 v1 units (schema_version: textbook-unit-v2 244/244). The last v1 unit,
         technology-21-54-u01, is `stage4-unit-v1-trilingual` at HEAD and v2 in the tree (uncommitted b77 merge).
         v1Snapshot.ts selects `schema_version === V1_SCHEMA` only; both 19-50 units are v2 in base and unit, so no b75 patch
         can reach this test (§5 Obs. 2). b73 recorded 162/162 on 2026-11-08, before that flip.
vitest src/lib/textbook, run 2 (after the test was edited in the working tree in parallel, not by me — S152 b78, uncommitted:
  `expect(Object.keys(now).length).toBeGreaterThan(0)` → `expect(units.length).toBeGreaterThan(0)` + v1 row count = non-v2 unit count):
  Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 6 ok 6 | issues [] | changed base-present = 6 patched + 'stage' | unexplained besides 'stage' 0 | derived 66, mismatch 0 | memory_hooks 18 bad 0, lens 5/5/5
  u02 active 6 ok 6 | issues [] | changed base-present = 6 patched + 'stage' | unexplained 0 | derived 66, mismatch 0 | memory_hooks 18 bad 0, lens 6/6/6
  base sha = base_sha256 for all 12; before count in base = 1 for all 12; replay mismatch 0
  base-only top keys (both): stage / round / jp_round (part metadata)
  net before remnant: 0 for 12/12 (raw and inline-stripped)
  bold counts unchanged in all 12; [[jp:]] counts unchanged in all 12
  derived followers (all true): u01 explanation_jp/zh/en of terms[5] (p01–p03) (analogy has no derived copy);
      u02 explanation_en of terms[0] (p01), definition_zh of terms[4] (p02), definition_zh of terms[0] (p05),
      summary.key_points_zh[3] (p04; kp check mismatch 0)
  ruleA verbatim miss: [] in both units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 12/12 (u01 6/6, u02 6/6)
  base.replace(Rule A before, Rule A after) == unit field: 12/12 true
raverb.mjs: 24 Rule A strings, verbatim miss 0
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 5 kinds miss 0 | u02 15 kinds miss 0
D-200: no 考点 (points[]) is patched in b75 → N/A (u01 / u02 考点 text identical to base).
grep in the units (old wording, expect 0):
  u01 "調理時間" 0 / "烹饪时间" 0 / "cooking time" 0 / "寄せて盛" 0 / "聚拢" 0 / "heap" 0;
      new: "五十音順" 2 (terms[5].detail_jp + explanation_jp) / "读音顺序" 2 / "alphabetical order" 4 (= also one_en + definition_en,
      unchanged) / "皿を分け" 1 / "分盘" 1 / "its own plate" 1
  u02 "对待" 0 / "宣传" 0; "不依赖文字" 0; "语言" 7 (3 patched fields + definition_zh / summary copy + terms[4].detail_zh / explanation_zh
      「使用不同语言的人」, unchanged); "for example" 2 (p01 field + explanation_en);
      "文字" in zh: terms[4].detail_zh / analogy_zh keep 文字 where jp is 文字を読まなくても / 言葉の読めない (reading sense, correct; §U2.3)
```

`stage` meta is removed in both units (as in b19–b73).

**Application.** All 12 `before` strings occur exactly once in their base field, all 12 `after` strings are present, and replay reproduces every patched field. Net `before` remnants are 0 for all 12. 3 are shortened phrases of the Rule A strings; all 12 give exactly the Rule A after text (same.mjs 12/12).

## U1. technology-19-50-u01 (Rule A PASS, 建議修 L1 / L2)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → 4 (利用者の, 2022r04-q033 stem, unchanged text) | 1; win12 0/0 → 0/0; Dice 0.05 → 0.05 |
| p02 | zh | 5 → 5 ("ation", 2011h23a-q062 choice, unchanged axis names) | 1 |
| p03 | en | 14 → 14 ("e information ", 2011h23a-q062 choice, unchanged text) | " order" (6) |
| p04 | jp | 3 → 3 (統一し, 2011h23a-q062 choice, unchanged text) | ごとに (3, 2025r07-q072 stem); win12 0/0 → 0/0; Dice 0.04 → 0.04 |
| p05 | zh | 2 → 2 (统一, unchanged) | 1 |
| p06 | en | 10 → 10 (" the same ", 2010h22a-q071 choice, unchanged text) | " each " (6) |

- No rises. p04 after-span ごとに (3) is a function word; 2025r07-q072 is the 4-principles question, but the analogy does not take any of its wording (win12 0/0).

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[5](LATCH).detail_*` 3rd sentence (+ explanation_*) | L1 | Yes (§U1.3) | No | OK |
| p04–p06 | `terms[0](デザインの原則).analogy_*` | L2 | Yes (§U1.3) | No (Obs. 3) | OK |

### U1.3 Focused checks — L1 (LATCH example axis) and L2 (proximity image)

- **L1 after (三語)**: 「例えば料理のレシピ集なら、材料の種類で分けるか、**料理名の五十音順**に並べるかで使い勝手が変わる。」/「…是按食材种类分类，还是**按菜名的读音顺序**排列…」/ "…split by type of ingredient or **listed by dish name in alphabetical order**." The two choices are now C (材料の種類) and A (五十音順) with no T / H boundary case. They match the same term's table rows in all three languages: A = 「五十音・アルファベット順 / 名前の読みの順で並べる」/「五十音、字母顺序 / 按名称读音的顺序排列」/ "Alphabetical or kana order / By how names are read"; C = 「種類ごとにまとめる」/「按种类归在一起」/ "Grouped by type". one_en "alphabetical order (kana order in Japanese)" = en "alphabetical order"; zh 读音顺序 = table zh 名称读音. The 考点 `terms[5].points[0]` (H = 程度 vs C = 種類, unchanged) is no longer next to an example that a reader can file under the wrong axis. Old example 0 in the unit (三語).
- **L2 after (三語)**: 「料理の盛り付けで、**料理ごとに皿を分けて盛り**、器の向きをそろえ、同じ食器で統一し、主菜だけを大きく盛る」/「按菜分盘盛放、让餐具朝向一致、统一用同一套餐具、只把主菜盛得特别大」/ "serve each dish on its own plate, turn the plates the same way, use one matching set of tableware and give only the main course a large portion". The 4 clauses still map in order to 近接 → 整列 → 反復 → 対比 (= `terms[0].detail` 4 原則 order and the tree fig). The proximity clause now carries the "separate what is not related" side (one dish = one plate, different dishes apart), which is what `terms[1].one`「関係の薄い要素とは間をあける」 and `terms[1].points[0]`「近接は関係の薄い要素を離すことも含む」 require; en regains a grouping meaning (each dish together on its own plate) that "heap each dish neatly" had lost. Nothing in it reads as 「すべてを寄せる」 (the misconception the 考点 denies).
- vs 2025r07-q072 (unchanged relation): no clause names 操作 / 価値 (the wrong-choice partners), and the analogy does not reproduce the question's descriptions. Parity 25 / 0 diff. **u01: L1 / L2 resolved.**

## U2. technology-19-50-u02 (Rule A PASS, 建議修 L1–L4)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | en | 12 → 12 (" people can ", 2022r04-q033 stem, unchanged 3rd sentence) | " shape o" (8, 2024r06-q068 stem) |
| p02 | zh | 2 → 2 (表示 → 语言, 2015h27a-q061 stem) | 语言 (2) |
| p03 | zh | 2 → 2 (简单, unchanged) | 语言 (2) |
| p04 | zh | 2 → 2 (就能, unchanged) | 就能 (2) |
| p05 | zh | 10 → 10 ("Signifier）", 2024r06-q068 choice = the term name, unchanged) | 如何 (2) |
| p06 | zh | 4 → 4 (的说明，, 2011h23a-q062 stem, unchanged) | 说明 (2) |

- No rises. p02 / p03 nearest shifts to 语言 (2), a single generic word in the attribute list of the 2015h27a-q061 zh stem (UD question); pictograms are not that question's subject and no frame is taken. p01 " shape o" (8) is the word "shape" (q068 stem's door-knob example is not used).

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[0](シグニファイア).detail_en` 2nd sentence (+ explanation_en) | L1 | Yes: "Cues can take the form of, **for example**, a part's shape or color, or the text on a display." = jp 「**例えば**部品の形や色、表示の文字**など**で示される」/ zh 「…等来呈现」; the list is now marked as examples, so it no longer reads as a closed visual list (the a1 r1 MEDIUM area stays resolved in en too, with one_en "perceivable cue") | No | OK |
| p02–p04 | `terms[4](ピクトグラム).one_zh`, `overview_rows[4].one_line_zh`, `key_points_zh[3]` (+ definition_zh, summary.key_points_zh[3]) | L2 | Yes: 不依赖**语言** ×3 = jp 「言葉に頼らず」 / en "without (relying on) words"; key_points_zh[3]「不依赖语言就能传达含义，因此也能把信息传递给使用不同语言的人」 now has a sound cause → effect (as jp「使う言語が違う人にも」). = v1 zh wording (Rule A) | No (Obs. 4) | OK |
| p05 | `terms[0].one_zh` (+ definition_zh) | L3 | Yes: 「应当如何**操作**某个物体」 = `overview_rows[0].one_line_zh`「该如何操作」; jp 「どう扱えばよいか」/ en "how they should handle" — 操作 is the natural zh for handling an object; 「对待」 0 | No | OK |
| p06 | `terms[5](インフォグラフィック).analogy_zh` | L4 | Yes: 「就像一张**说明海报**」 = jp 「案内ポスター」 / en "information poster"; the advert sense of 宣传 is gone (「宣传」 0) | No (Obs. 5) | OK |

### U2.3 Focused checks

- **L2 scope**: the three patched zh fields are the definitional "without words" statements. The other zh 文字 in the pictogram term stay correct: `terms[4].detail_zh`「即使不读文字也能理解含义…难以阅读文字的人」 = jp 「文字を読まなくても…文字を読みにくい人」, and `analogy_zh`「看不懂当地文字的国家」 = jp 「言葉の読めない国」 (読めない = written script; 文字 is fine). So the unit now uses 语言 for 言葉に頼らず and 文字 for 文字を読む — the same split as jp.
- **L1 / L3**: signifier one (三語) = perceivable cue for how to handle / operate; detail (三語) lists examples with an example marker; overview_rows[0] = 操作. The Norman distinction (affordance = possibility for action / signifier = cue for it) in `points` is unchanged. 2024r06-q068 正答 still supported; wrong NUI / ウィザード / マルチタッチ not mentioned.
- No 考点 touched; bold / `[[jp:]]` counts unchanged in all 6. Parity 28 / 0 diff. **u02: L1 / L2 / L3 / L4 resolved.**

## X. Cross-unit check — UX / usability / accessibility / universal design / signifier (19-50 u01〜u02 + 19-51 u01〜u04, 三語)

Body-field counts (derived / summary / quiz / challenge / source_figures excluded): 19-50-u01 and 19-51-u02 / u03 / u04 contain **none** of these terms in any language. They appear only in 19-50-u02 and 19-51-u01:

| Axis | 19-50-u02 | 19-51-u01 | Contradiction? |
|---|---|---|---|
| (a) UX | UXデザイン 7 / ユーザーエクスペリエンス 3 (jp); UX 设计 3 / 用户体验 1 (zh); UX design 3 / user experience 1 (en). UX = 体験全体 (使う前〜使った後), UI = 接点 (points[0] mix) | — | No — single unit; one name per language |
| (b) usability | — | ユーザビリティ 17 / 易用性 11 (+ term_zh 「易用性（可用性）」) / usability 10: 有効さ・効率・満足 (ISO 9241-11 型) | No — single unit |
| (c) accessibility | アクセシビリティ 15; zh **可访问性** 8 (one_zh 「也称无障碍设计」, term_zh 「无障碍设计（可访问性）」); en accessibility 9. = 多様な人が等しく使える **度合い** | points[2]: アクセシビリティ = 高齢者や障害のある人を含め誰もが利用できるかどうか; zh **无障碍设计**[[jp:アクセシビリティ]]; en accessibility | Content: no (度合い vs かどうか, both "everyone incl. older / disabled people"; usability = intended users vs accessibility = everyone, consistent with u02). zh primary rendering differs (可访问性 vs 无障碍设计) = Rule A u02 **L9** (記録のみ) + **O2** (upstream zh_terms / quiz q061 ア). No b75 patch touches these strings → no regression |
| (d) universal design / バリアフリー | ユニバーサルデザイン 10 / 通用设计 6 / universal design 6: 違いをはじめから前提に、できるだけ多くの人; バリアフリー = 特定の人の既存の障壁を除く (zh 无障碍化, en barrier-free) | — | No — single unit; 无障碍化 (barrier-free) ≠ 无障碍设计 (accessibility alias) is the deliberate split noted in L9 |
| (e) signifier / affordance | シグニファイア 12 / 指示符 7 / signifier 9; アフォーダンス 8 / 可供性 4 / affordance 4. p05 one_zh 操作 = overview_rows[0] 操作 | — (19-51-u02〜u04 GUI parts / hover / rollover give feedback cues but do not use the word) | No |

- The b75 patches touch only u01 LATCH / analogy and u02 signifier detail_en / one_zh, pictogram zh, infographic analogy_zh. None changes the strings on axes (a)–(d); (e) changes only 对待 → 操作 (zh) and adds "for example" (en), both toward the jp. Consistency across the 6 units is the same as recorded by the two Rule A audits.
- u01 L2 analogy now agrees with u01 `terms[1].points[0]` (近接 includes separating); u01 L1 example agrees with the LATCH table. Neither touches u02 or 19-51.
- Rule A u01 L5 (整列 analogy 行列の床の線 ↔ u02 signifier 床の足跡) is unchanged by p04–p06 (the analogy changed is `terms[0]`, not `terms[2]`).

## 4. F-fix

No required F-fix in either unit. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: u01 0 warns (unit and part); u02 1 warn on both unit and part base (`zh-term スイッチ → 交换机`), pre-existing, Rule A u02 O1 = false positive (家の電灯スイッチ = 开关). Not caused by a patch.
   - `stage` meta is removed in both units (as in b19–b73).
   - ruleA verbatim miss = none. 3 of 12 patches use shortened phrases; same.mjs shows all 12 give the same field as the Rule A strings. No Rule A string in this batch starts with "…".
   - net remnant 0 for all 12.
   - Bases: u01 `a1` / `loc.r0`, u02 `a2` / `loc.r0` (a1 r1 / r2 REVISE, a2 PASS). Patch paths carry labels (`terms[5](LATCH)…`, `terms[0](シグニファイア)…`) on some patches; they resolve in check.mjs / d198.mjs / same.mjs.
2. **vitest run 1 = 161/162 — batch-level, not b75; run 2 = 162/162 after a parallel test edit.** `v1-snapshot.test.ts` asserts `Object.keys(now).length > 0` (at least one v1 unit). With technology-21-54-u01 merged as v2 in the working tree (b77, uncommitted), the units directory has 244/244 `textbook-unit-v2` and 0 v1 units, so the assertion fails. `v1Snapshot.ts` selects `schema_version === V1_SCHEMA` only; the 19-50 units are v2 in base and unit, and `__snapshots__/v1-units.json` (244 rows, incl. technology-21-54-u01) is unchanged. Without a test change it would fail for every batch from now on: the old precondition (≥1 v1 unit, D-196 §0-9) has expired with the last v1 → v2 merge. While I was writing this file, `v1-snapshot.test.ts` was changed in the working tree by another session (S152 b78, uncommitted; not by me): it now asserts the loader returns units and that the v1 fingerprint count = the non-v2 unit count (0 = 0). Re-run: 162/162. That test edit is outside this review (not reviewed here); it should be committed / reviewed with b78. I did not change the tree.
3. u01 p04 jp: 「料理の盛り付けで、料理ごとに皿を分けて盛り」 has 料理 twice in one clause. Style only; it is the Rule A L2 text. Not re-ruled.
4. u02 p04 zh key_points[3]: 语言 twice (不依赖语言 … 使用不同语言的人). The repeat is the cause → effect link and matches jp (言葉 … 言語). Not a defect.
5. u02 p06 zh: 「就像一张说明海报，用一幅图代替冗长的说明」 has 说明 twice in one sentence. Style only; the Rule A L4 text. Not re-ruled.
6. D-198: no rises in either unit; win12 0/0 in both jp patches.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-19-50-u01 | PASS | **6/6** | — (L1 LATCH example = C vs A, matches table; L2 proximity image now separates) | 0 / 0 / 0 | **PASS** |
| technology-19-50-u02 | PASS (a1 MEDIUM 3 resolved in a2) | **6/6** | — (L1 en example marker; L2 zh 语言 ×3; L3 zh 操作; L4 zh 说明海报) | 0 / 0 / 0 | **PASS** |

- **Application:** 12/12 exact (replay, part-level). 0 unexplained diffs, net `before` remnants 0, derived fields follow (132 checked, 0 mismatch), memory_hooks pairing 0 bad. 3/12 shortened, and all 12 give the same field as the Rule A string (same.mjs). Every 建議修 is covered.
- **D-198:** no patch adds overlap; the only new nearest tokens are single generic words (u02 p02 / p03 语言, u01 p04 ごとに); win12 0/0 in all jp patches.
- **D-200:** N/A (no 考点 patched). **D-202:** `[[jp:]]` origin miss 0 in both units; bold / tag counts unchanged in all 12. **D-204 / 書き方 7:** u01 LATCH example ↔ table and H / C 考点, u01 analogy ↔ 近接 考点, u02 signifier one_zh ↔ overview_rows[0], pictogram zh ↔ jp 言葉 agree; cross-unit UX / usability / accessibility / UD / signifier unchanged and consistent in content (§X; zh accessibility primary split = Rule A u02 L9 / O2, record only). **D-205 / D-210:** no new law, standard version or numeric claim.
- **Gates:**
  - validate --unit ×2: 0 issues / EXIT 0 (u02 1 pre-existing warn, false positive)
  - validate --part ×2: 0 issues, sha256 = base_sha256 for each
  - parity ×2: 0 diff (25 / 28 locations)
  - vitest textbook: run 1 **161/162** (`v1-snapshot.test.ts`: 0 v1 units left after the b77 merge of technology-21-54-u01, not reachable from b75); run 2 **162/162** after the parallel S152 test edit (§5 Obs. 2)
  - patch tests: 14/14

**PASS for both units.** All 12 active patches are applied exactly, and every 建議修 LOW is resolved in context in all three languages:
- u01 p01–p06: LATCH example 材料の種類 (C) / 料理名の五十音順 (A) = table rows, no T / H boundary case; 4-principles analogy proximity clause = 料理ごとに皿を分けて盛り (groups and separates).
- u02 p01–p06: signifier detail_en "for example" (= jp 例えば…など); pictogram zh 不依赖语言 ×3 (= jp 言葉); signifier one_zh 操作 (= overview_rows[0]); infographic analogy_zh 说明海报 (= jp 案内).

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix. Batch-level note: the v1-snapshot assertion failed once (0 v1 units left) and passes after the uncommitted S152 test edit (§5 Obs. 2); independent of b75.
