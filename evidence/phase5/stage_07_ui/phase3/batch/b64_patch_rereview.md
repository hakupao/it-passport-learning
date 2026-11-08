# b64 B3 patch re-review — technology-18-49 u01〜u04 (コンピュータの種類、ポインティング装置、文字・画像の入力装置、出力装置)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the four Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b64rv/`: `check.mjs` / `d198.mjs` / `same.mjs` copied from `b62rv/` with only the unit map changed (now 4 units; u02 base is round `r1`). `same.mjs` reads the 48 Rule A before / after pairs from `b64rv/ra.json`, which I copied by hand from the Rule A files (all 96 strings confirmed verbatim in the Rule A files by script). One extra targeted script `q099b.mjs` reuses the `d198.mjs` functions with a qid filter. No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b64)
- Scope: the B3 wording patches for 4 units. **48 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (コンピュータの種類と特徴) | PASS, 建議修 L1–L4 | p01–p09 | L1 → p01 (`terms[4].detail_zh`); L2 → p02–p03 (`pairs[1].rows[0].b_zh/en`); L3 → p04–p06 (`terms[5].analogy_*`); L4 → p07–p09 (`terms[6].analogy_*`) | 6/9 (p04–p09) |
| u02 (ポインティング・手操作入力装置) | PASS, 建議修 L1–L4 | p01–p10 | L1 → p01–p03 (`terms[0].analogy_*`); L2 → p04–p06 (`terms[0].points[1].text_*`); L3 → p07 (`terms[2].points[1].text_en`); L4 → p08–p10 (`terms[2].fig.steps[0].caption_*`) | 7/10 (p01–p07) |
| u03 (文字・画像を取り込む入力装置) | PASS, 建議修 L1–L8 | p01–p20 | L1 → p01–p03 (`terms[1].points[1].text_*`); L2 → p04 (`terms[1].one_en`); L3 → p05–p07 (`terms[2].one_*`); L4 → p08–p10 (`terms[2].hook_*`); L5 → p11–p13 (`terms[1].fig.steps[3].caption_*`); L6 → p14 (`terms[1].hook_en`); L7 → p15–p17 (`pairs[1].rows[2].a_*`); L8 → p18–p20 (`terms[1].points[0].text_*`) | 13/20 (p04–p12, p14, p18–p20) |
| u04 (出力装置(表示・印刷)) | PASS, 建議修 L1–L2 | p01–p09 | L1 → p01–p06 (`key_points_*[3]`, `terms[0].detail_*`); L2 → p07–p09 (`terms[0].points[1].text_*`) | 1/9 (p06) |

  Every 建議修 is covered. 記録のみ LOWs and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **27 of 48**. Each shortened `before` / `after` is a phrase inside the Rule A before / after string. For u01 L1 / L2, u02 L2 and u04 L1 (detail) / L2, Rule A itself prescribed a phrase (「…」 or a sentence fragment), so "Rule A full string" there means that phrase. `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **48/48**, so the shortened patches give the same result as the Rule A strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-18-49-u01/parts/b64-u01-a2/technology-18-49-u01.loc.r0.json` `4db8b5a4e476edee…`
  - u02 `.../technology-18-49-u02/parts/b64-u02-a2/technology-18-49-u02.loc.r1.json` `251cd83be87164c0…` (loc#1, not r0)
  - u03 `.../technology-18-49-u03/parts/b64-u03-a1/technology-18-49-u03.loc.r0.json` `9f34cc775f358c1e…`
  - u04 `.../technology-18-49-u04/parts/b64-u04-a1/technology-18-49-u04.loc.r0.json` `9ef0843dd7ccb6f7…`
- Merged units (current) `data/ip/textbook/units/technology-18-49-u0N.json` sha256: u01 `2bbe85e985488c65…`, u02 `c7cfa864d2c277e6…`, u03 `7033f71c132e19aa…`, u04 `eda733af958080a1…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b62_patch_rereview.md` §0 (no unit-level patches in this batch). All 4 units share topic technology-18-49 (24 questions), so there are 120 source strings per language.

1. **Application check** (`b64rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b64rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b64rv/d198.mjs`, all 48 patches): whole-field LCS before → after and LCS of the `after` span against the 120 sources per language; jp also 12-char windows (unmasked / masked) and Dice. Plus `b64rv/q099b.mjs`: before → after LCS / win12 / Dice / best-window edit distance against the cited question only, for u03 L1 (2026r08-q099), L5 / L8 (2015h27a-q047) and L7 (2016h28h-q014).
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json` (stem_jp_clean / en stem): 2026r08-q099 (answer イ = イメージスキャナー / dpi; wrong = bps, スクリーンリーダー), 2016h28h-q014 (answer イ スキャナ; wrong ウ ディジタイザ), 2015h27a-q047 (answer ウ OCR, asked as a **device**; wrong エ OMR), 2024r06-q059 / 2025r07-q081 (OCR role / technology) for u03; 2024r06-q076 (answer ウ 静電容量方式) and 2013h25h-q056 (answer = touch panel has several methods) for u02 L4; 2018h30a-q092 (answer ウ ディスプレイの解像度) and the topic-外 2012h24h-q084 / 2013h25h-q054 (dpi = scanner / printer resolution unit; q054 wrong ウ pixel) for u04; 2019r01a-q075 / 2020r02o-q014 (activity tracker / smartwatch) for u01 L3. (The caller's "2015h27a?-q014" for u03 L7 is 2016h28h-q014, as in the Rule A file.)
5. **Cross-unit checks**: u02 L2 against `data/ip/textbook/units/technology-18-49-u03.json` (headword イメージスキャナー, `[[jp:イメージスキャナー]]`); u04 L1 against u03 `terms[1].detail_jp` / `points[1]` (dpi) and `data/ip/textbook/units/technology-20-53-u01.json` (dpi term).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording and a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b63): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 135 / u02 107 / u03 94 / u04 122) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-18-49-u01   → ✓ 0 issues                EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-18-49-u01   → ✓ 27 locations, 0 diff    EXIT=0
$ ... validate --unit technology-18-49-u02 → ✓ 0 issues, 1 warning(s)   EXIT=0 | parity → ✓ 24 locations, 0 diff  EXIT=0
  warn  zh-term  pairs[0].rows[2].a_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
$ ... validate --unit technology-18-49-u03 → ✓ 0 issues, 2 warning(s)   EXIT=0 | parity → ✓ 22 locations, 0 diff  EXIT=0
  warn  zh-term  terms[1](イメージスキャナー).analogy_zh  PC → PC（个人计算机） not in the zh text
  warn  zh-term  terms[3](Webカメラ).analogy_zh  PC → PC（个人计算机） not in the zh text
$ ... validate --unit technology-18-49-u04 → ✓ 0 issues   EXIT=0 | parity → ✓ 28 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 counts {"terms":7,"figs":2,"steps":0,"points":9,"pairs":2,"key_points":4,"goals":3}  sha256 4db8b5a4e476edee…  ✓ 0 issues  EXIT=0
  u02 counts {"terms":5,"figs":2,"steps":4,"points":7,"pairs":2,"key_points":5,"goals":3}  sha256 251cd83be87164c0…  ✓ 0 issues, same 1 zh-term warn  EXIT=0
  u03 counts {"terms":4,"figs":2,"steps":4,"points":6,"pairs":2,"key_points":4,"goals":3}  sha256 9f34cc775f358c1e…  ✓ 0 issues, same 2 zh-term warns  EXIT=0
  u04 counts {"terms":6,"figs":3,"steps":8,"points":6,"pairs":2,"key_points":5,"goals":3}  sha256 9ef0843dd7ccb6f7…  ✓ 0 issues  EXIT=0
  (all 4 sha256 = base_sha256 of every patch in that unit)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 9 ok 9   | issues [] | changed base-present = 9 patched + 'stage'  | unexplained besides 'stage' 0 | derived 75, mismatch 0 | memory_hooks 21 bad 0, lens 7/7/7
  u02 active 10 ok 10 | issues [] | changed base-present = 10 patched + 'stage' | unexplained 0 | derived 60, mismatch 0 | memory_hooks 15 bad 0, lens 5/5/5
  u03 active 20 ok 20 | issues [] | changed base-present = 20 patched + 'stage' | unexplained 0 | derived 48, mismatch 0 | memory_hooks 12 bad 0, lens 4/4/4
  u04 active 9 ok 9   | issues [] | changed base-present = 9 patched + 'stage'  | unexplained 0 | derived 69, mismatch 0 | memory_hooks 18 bad 0, lens 6/6/6
  base sha = base_sha256 for all 48; before count in base = 1 for all 48; replay mismatch 0
  base-only top keys (all 4): stage / round / jp_round (part metadata)
  net before remnant: 0 for all 48 (raw and stripped)
  bold counts unchanged in all 48; [[jp:]] counts unchanged in all 48
  derived followers (all true): u01 explanation_zh of terms[4] (p01); u03 definition_en of terms[1] (p04), definition_jp/zh/en of terms[2] (p05–p07), memory_hook_jp/zh/en of terms[2] (p08–p10), memory_hook_en of terms[1] (p14); u04 explanation_jp/zh/en of terms[0] (p04–p06); summary.key_points_*[3] follow p01–p03 (u04); summary.memory_hooks_* pairing 0 bad (u03 hooks)
  ruleA verbatim miss: [] in all 4 units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 48/48 (u01 9/9, u02 10/10, u03 20/20, u04 9/9)
  base.replace(Rule A before, Rule A after) == unit field: 48/48 true
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 15 kinds miss 0 | u02 10 miss 0 | u03 6 miss 0 | u04 17 miss 0
D-200 (patched 考点, jp chars without spaces / sentences): u03 points[1] (p01) 50 / 1; u03 points[0] (p18) 65 / 1; u04 points[1] (p07) 52 / 1; u02 points[1] (p04, mix) 67 / 1; u02 terms[2].points[1] (p07, en only) jp 73 / 1 unchanged
grep in the units (old wording, expect 0):
  u01 "店内点餐" 0 / "展开来看" 0 / "spread-out" 0 / "腕のそば" 0 / "手腕边" 0 / "トラック" 0 / "卡车" 0 / "truck" 0;  "wrist" 1 (= terms[5].one_en "wristwatch-type" + definition_en, not the analogy)
  u02 "何を書く" 0 / "写什么" 0 / "what to write" 0 / "barely" 0 / "就是电容式。" 0 / "The capacitive method reads" 0 / イメージスキャナ (without ー) 0;  "静電容量方式である" 1 (= p08 after)
  u03 "どれだけ細かく" 0 / "暗号" 0 / "暗码" 0 / "cipher" 0 / "だけ、OCR" 0 / "只有" 0 / "Only when" 0 / "originally" 0 / "図面" 0 / "图纸" 0 / "技術である。" 0 / "数字を読み取る" 0 / "这些数字" 0 / "reads the digits" 0 / "a paper original" 0;
      "drawings" 2 (= overview_rows[1].extra_en[0] / pairs[0].rows[1].a_en "Text, drawings and photos on paper" = reading target 図, not L7's 用途 cell); "細かく読み取れ" 1 (= terms[1].detail_jp + explanation_jp, §U3.3)
  u04 "画面の細かさ" 0 / "画面精细程度" 0 / "screen fineness" 0 / "每种" 0 / "Each width" 0;  "組ごとに" 1 (= p07 after)
```

The validate warns (u02 1, u03 2; zh-term PC → 电脑 / 台式电脑) are the false positives the Rule A files recorded (u02 L8, u03 L9). They appear on the base parts too and no patch touches those fields (`pairs[0].rows[2].a_zh` in u02, `terms[1/3].analogy_zh` in u03), so they are not caused by the patches. u01 / u04 have 0 warns.

**Application.** All 48 `before` strings occur exactly once in their base field, all 48 `after` strings are present, and replay reproduces every patched field. 27 are shortened phrases of the Rule A strings, and all 48 give exactly the Rule A after text (same.mjs 48/48). In u02, p05 / p06 `before` `[[jp:イメージスキャナ]]` is not a substring of the `after` `[[jp:イメージスキャナー]]` (the `]]` differs), so the count-1 check is meaningful.

## U1. technology-18-49-u01 (Rule A PASS, 建議修 L1–L4)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | zh | 3 → 3 (使用，, unchanged text) | 1 |
| p02 | zh | 2 → 1 | 1 |
| p03 | en | 6 → 6 (", for " → "owing ", generic) | "owing " (6) |
| p04 | jp | 3 → 3 (のよう, unchanged text) | って (2); win12 0/0 → 0/0; Dice 0.10 → 0.13 |
| p05 | zh | 1 → 1 | 1 |
| p06 | en | 8 → 8 ("s the mo", unchanged text) | "r side " (7) |
| p07 | jp | 3 → 3 (ラック → まとめ) | まとめ (3); win12 0/0 → 0/0; Dice 0.10 → 0.06 |
| p08 | zh | 2 → 2 (称为) | 称为 (2) |
| p09 | en | 8 → 8 (" called ", unchanged text) | " called " (8) |

No patch adds any overlap (no field LCS rises).

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[4](タブレット端末).detail_zh` (+ explanation_zh) | L1 | Yes: 「所以在门店受理订单、上门讲解等」 = jp 「店頭の注文受付」 / en "taking orders in a shop" (no longer narrowed to restaurant ordering) | No | OK |
| p02–p03 | `pairs[1].rows[0].b_zh/en` | L2 | Yes: 「更大，能一次看到更多内容」/ "Larger, showing more at once" — no fold-open reading; = jp 「より大きく、広げて見られる」 (larger screen, more visible at once). a 側 (片手に収まる) and key=true unchanged; parity 27 / 0 diff | No | OK |
| p04–p06 | `terms[5](ウェアラブル端末).analogy_*` | L3 | Yes: 「いつも体に寄り添っていて」/「一直贴身跟着」/ "stays close by your side" — no longer wrist-only, so it covers the glasses type in `one_*` (「腕時計型や眼鏡型」 / "wristwatch-type or glasses-type"). The attendant image and the conclusion clause are unchanged | No | OK |
| p07–p09 | `terms[6](スマートデバイス).analogy_*` | L4 | Yes: 「りんごもみかんもまとめて果物と呼ぶのと同じ、一段上の呼び名」 (三語 same image). The car image is gone (grep トラック / 卡车 / truck 0), so PC's 自家用車 analogy (`terms[0]`, grep 1) no longer reads as PC ⊂ スマートデバイス. Fruit does not repeat any other analogy in the unit (自家用車 / 図書館カウンター / 発電所 / 道具箱 / 画板 / 付き人) | No | OK |

### U1.3 Focused checks

- No 考点 and no qid in the patched fields (all four are detail / pairs / analogy). D-200 not affected. D-204: p04–p06 widen the analogy to the scope of `one_*`; they do not add a claim. 2019r01a-q075 (answer エ, wearable with sensors) and 2020r02o-q014 (answer イ, smartwatch measuring) are solved by `one` / `detail` / `points[0]` (unchanged); the analogy now fits both a watch and glasses, and it still does not point to q014 エ (a bed-mounted sensor is not "close by your side" as something worn; `one_*` 「体に着けたまま使う」 decides).
- p07–p09: the "one level up" conclusion (総称) is unchanged and agrees with `one_*` (総称) and the tree (「その他」 branch kept).
- Parity 27 / 0 diff. **u01: all L1–L4 resolved.**

## U2. technology-18-49-u02 (Rule A PASS, 建議修 L1–L4)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → 4 (のように, unchanged text) | の文字を (4); win12 0/0 → 0/0; Dice 0.11 → 0.10 |
| p02 | zh | 2 → 2 (激光, unchanged) | 什么 (2) |
| p03 | en | 9 → 12 (" pointer " → " characters ", generic word) | 12 (same) |
| p04 | jp | 8 → 10 (画面上の位置を指 → イメージスキャナー␣, headword; 2026r08-q099 c0) | 10 (same); win12 **1/1 → 1/1** (pre-existing, unchanged text: 「画面上の位置を指定する」 ~ 2013h25h-q056 c0 d2); Dice 0.23 → 0.24 |
| p05 | zh | 5 → 5 (图像扫描仪, term) | 0 (tag only) |
| p06 | en | **26 → 26** ("s a position on the screen", 2013h25a-q078 c3 = wrong エ, unchanged text) | 0 (tag only) |
| p07 | en | 15 → 15 ("s the position ", unchanged) | " respond " (9) |
| p08 | jp | 6 → 7 (の表面に近づ → タッチパネルの, term + particle; 2024r06-q076 stem) | タッチパネルの (7); win12 0/0 → 0/0; **Dice 0.18 → 0.27** (vs q076 stem) |
| p09 | zh | 3 → 3 (会发生, unchanged) | 触摸屏 (3) |
| p10 | en | 12 → 12 (" the screen ", unchanged) | "The capacit" (11, term) |

- **p08** is the only patch here that moves its field toward its own cited question (q076 is the qid of `terms[2].points[1]`; the caption is the fig of the same term). The rise is the term name 「タッチパネルの」 plus the generic classification phrase 「検出方式の一つ」. win12 stays 0/0 (masked and unmasked), Dice 0.27 is far below the HIGH calibration (Dice 0.52 / ed 0.14), and validate's copy guard (it covers captions) is 0. The caption does not restate q076's judgement items (広く採用 / 表面に近づく → 位置を検出 as one chain); it only says that 静電容量方式 is one of the detection methods, a positive definition (D-209), and it agrees with 2013h25h-q056's answer (several methods exist). Not a D-198 issue.
- **p04**: the win12 1/1 hit is the near-match Rule A §1-3 already ruled a false positive (generic 6-char function phrase, unchanged text). The LCS rise 8 → 10 is the headword イメージスキャナー + space (term names are outside D-198).
- p03 +3 is a generic word. p06's 26 is unchanged text (Obs. 4).

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[0](ポインティングデバイス).analogy_*` | L1 | Yes: 「どの文字を打つかではなく「どこか」を」/「而不是“打什么字”」/ "rather than \"which characters to type.\"" — the contrast is now typing (= `points[0]` キーボード 「文字や数字を入力する」), so it no longer rubs against ペンタブレット detail (手書き文字の入力・イラスト). Handwriting with a pen is not "typing which character", so no new conflict | No | OK |
| p04–p06 | `terms[0].points[1].text_*` | L2 | Yes (§U2.3) | No | OK |
| p07 | `terms[2](タッチパネル).points[1].text_en` | L3 | Yes: "so it tends not to respond when pressed with a non-conductive object" = jp 「反応しにくい」 / zh 「不容易产生反应」. Exam 考点, qid 2024r06-q076 kept; answer ウ 静電容量方式 still matches | No | OK |
| p08–p10 | `terms[2].fig.steps[0].caption_*` | L4 | Yes: 「この変化を読むのが、タッチパネルの検出方式の一つである静電容量方式である。」/「…就是触摸屏检测方式之一的电容式。」/ "The capacitive method, one of several touch-panel detection methods, reads this change." — the figure is now marked as one method's flow (D-204 prevention); = `detail_*` 「静電容量方式や感圧式などがある」. First sentence of the caption and steps 1–3 unchanged | No | OK |

### U2.3 Focused checks — L2 (イメージスキャナ → イメージスキャナー) and the jp-origin rule

- After (三語): jp 「**イメージスキャナー** は紙に描かれた絵や文字を画像データとして取り込む装置で、…」, zh 「**图像扫描仪**（[[jp:イメージスキャナー]]）…」, en "An **image scanner** ([[jp:イメージスキャナー]]) …". The jp bold term and both `[[jp:]]` origins changed together in the same field set, as Rule A L2 (and u01 Rule A L8's note on 表記 changes) requires.
- **jp-origin rule (D-202)**: unit-wide script, all `[[jp:]]` tags vs all jp strings (space-normalized): u02 10 kinds, miss **0**. The new origin イメージスキャナー occurs in `terms[0].points[1].text_jp`. 「イメージスキャナ」 without ー: 0 in u02 (it was only in this field). Bold 1 → 1, `[[jp:]]` 2 → 2 in zh / en.
- **u03 consistency**: `data/ip/textbook/units/technology-18-49-u03.json` headword is イメージスキャナー and its zh / en carry `[[jp:イメージスキャナー]]`; 「イメージスキャナ」 without ー is 0 in u03 (and 0 in u01 / u04). The two units now use the same form; this also closes u03 Rule A O1. q078 (answer ア, scanner) is unaffected; the claim (image capture, different purpose from pointing) is unchanged.
- D-200: mix 考点, 1 sentence, 67 chars (was 66). Parity 24 / 0 diff. **u02: all L1–L4 resolved.**

## U3. technology-18-49-u03 (Rule A PASS, 建議修 L1–L8)

### U3.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 9 → 10 (イメージスキャナー → イメージスキャナーで, headword; 2025r07-q081 stem) | 10 (same); win12 **0/0 → 1/0** (unmasked 「イメージスキャナーでは値」 ~ q081 stem 「イメージスキャナーで読み」 d2 = headword window; masked 0); Dice 0.30 → 0.32 |
| p02 | zh | 5 → 5 (图像扫描仪, term) | 5 |
| p03 | en | 19 → 18 (" an image scanner ", term) | 18 |
| p04 | en | 16 → 16 ("n image scanner ", unchanged) | "shines light on" (15, q099 stem, unchanged verb phrase) |
| p05 | jp | 5 → 5 (を読み取る, unchanged) | 5; win12 0/0 → 0/0; Dice 0.20 → 0.17 |
| p06 | zh | 4 → 4 (输入设备) | 4 |
| p07 | en | 16 → 16 (" shines light on", unchanged) | " characters a" (13) |
| p08 | jp | 3 → 3 | を表す (3); win12 0/0 → 0/0; Dice 0.06 → 0.08 |
| p09 | zh | 3 → 3 ("ar ") | 2 |
| p10 | en | 9 → 9 (" and the ", unchanged) | " for the " (9) |
| p11 | jp | 6 → 6 (文字コードに, unchanged; 2015h27a-q047 stem) | たいとき (4); win12 0/0 → 0/0; Dice 0.31 → 0.27 |
| p12 | zh | 5 → 5 (" OCR ") | 5 |
| p13 | en | 16 → 16 (" character codes", term) | 16 |
| p14 | en | 9 → 9 | " means " (7) |
| p15 | jp | 3 → 3 (電子化) | 3; win12 0/0 → 0/0; Dice 0.09 → 0.09 |
| p16 | zh | 3 → 3 (电子化) | 3 |
| p17 | en | **16 → 10** (" documents and d", 2016h28h-q014 stem → "igitizing ") | 10 |
| p18 | jp | 5 → 5 (文字コード) | 5; win12 0/0 → 0/0; Dice 0.23 → 0.25 |
| p19 | zh | 4 → 4 (字符编码) | 4 |
| p20 | en | **24 → 24** (" and converts them into ", 2024r06-q059 c1 = correct イ, unchanged text) | " character codes" (16) |

- **p01** win12 0 → 1 (unmasked only) is the headword window that Rule A L1 measured in advance (「最長一致 10 字 = 見出し語 + 助詞、近似 1 件も見出し語窓」). My measurement matches it. Not a copy.
- Targeted against the cited question (`q099b.mjs`, filter = 2026r08-q099 stem + choices): `terms[1].points[1].text_jp` LCS 9 「細かく読み取れるか」 (stem) → 9 「イメージスキャナー」 (c0, headword); against stem sentence 2 alone: ed 0.75 → **0.96**, Dice 0.18 → **0.05**, LCS 9 → 3 (「す単位」). **L1's 措辞 moved away from q099** (the 「どれだけ細かく読み取れるか」 frame is gone; only 単位 and the headword remain). 2016h28h-q014 for p15: ed 0.67 → 0.75, Dice 0.03 → 0.03, win12 0. 2015h27a-q047 for p18: ed 0.79 → 0.76, Dice 0.18 → 0.19, LCS 5 (文字コード) unchanged; for p11: Dice 0.31 → 0.27. All far from the HIGH calibration.
- p20's 24 is unchanged text and matches the **correct** option (Obs. 4).

### U3.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[1](イメージスキャナー).points[1].text_*` | L1 | Yes (§U3.3) | No | OK |
| p04 | `terms[1].one_en` (+ definition_en) | L2 | Yes: "shines light on an original such as a sheet of paper" = jp 「紙などの原稿」 / zh 「纸张等原稿」 / q099 「紙など」 | No | OK |
| p05–p07 | `terms[2](バーコードリーダー).one_*` (+ definition_*) | L3 | Yes: 「線で数字などを表した…その内容を読み取る」/「表示数字等信息的…读出其内容」/ "encodes digits and other characters … reads them" — no longer digits-only. `detail` / `pairs[0].rows[2].b` 「番号」 (物を見分ける番号) unchanged, which Rule A L3 explicitly kept as the use description; no conflict (a number is one kind of content) | No | OK |
| p08–p10 | `terms[2].hook_*` (+ memory_hook_*, summary.memory_hooks_*[2]) | L4 | Yes: 「そのまま数字を表す符号になっている」/「表示数字的编码」/ "a code for the digits" — 暗号 / 暗码 / cipher gone (grep 0 / 0 / 0), so the hook no longer leans to "barcode = encryption = hard to forge" (2009h21a-q020 エ, topic-外). The hook keeps "digits" as the typical (JAN) image; that is a memory hook, not the definition, and `one` now says 数字など | No | OK |
| p11–p13 | `terms[1].fig.steps[3].caption_*` | L5 | Yes: 「文字をテキストとして扱いたいときは、OCR が…」/「需要把文字当作文本处理时，由 OCR…」/ "When the characters are to be handled as text, OCR …" — the exclusive だけ / 只有…才 / Only when is gone; = `overview_rows[1].extra_jp[1]` 「文字として扱うには」 and q047 (文字コードに変換したいとき). Step 3 「この時点ではまだ文字を編集できない」 unchanged and still agrees | No | OK |
| p14 | `terms[1].hook_en` (+ memory_hook_en, summary.memory_hooks_en[1]) | L6 | Yes: "To scan means to run your eyes over something line by line" = jp 「という意味」 / zh 「有…的意思」; the etymology claim "originally" is gone | No | OK |
| p15–p17 | `pairs[1].rows[2].a_*` | L7 | Yes: 「紙の原稿の電子化」/「把纸质原稿电子化」/ "Digitizing paper originals" — the two-item scene of 2016h28h-q014 (文書や設計図) is gone, and 図面 (the hook toward q014 wrong ウ ディジタイザ) is gone (grep 図面 0 / 图纸 0). It still describes a scanner use and still contrasts with Webカメラ's b 側 | No | OK |
| p18–p20 | `terms[1].points[0].text_*` | L8 | Yes (§U3.3) | No | OK |

### U3.3 Focused checks

- **L1 (p01–p03, dpi 考点, qid 2026r08-q099).** After (三語): jp 「**dpi** は 1 インチあたりの点の数を表す単位で、イメージスキャナーでは値が大きいほど原稿の細部まで写る。」 zh 「**dpi** 是表示每英寸点数的单位；对图像扫描仪（[[jp:イメージスキャナー]]）来说，数值越大，原稿的细节就呈现得越清楚。」 en "**dpi** is a unit for the number of dots per inch; for an image scanner ([[jp:イメージスキャナー]]), a larger value means more of the original's fine detail is captured." The 考点 now starts from the unit (dpi) instead of retelling q099's sentence 2 with the blanks filled; distance to q099 sentence 2 rose (ed 0.96, Dice 0.05, §U3.1). q099 (re-read; answer イ = イメージスキャナー / dpi; wrong = bps, スクリーンリーダー): the 考点 still supports イ and names neither bps nor スクリーンリーダー. Fact correct (dpi = dots per inch; larger = finer), and it agrees with `detail_jp` 3rd sentence (「1 インチの長さを何個の点に分けて読むか」). D-200: 1 sentence, 50 chars; kind exam, qid kept. `[[jp:イメージスキャナー]]` 1 → 1 in zh / en; bold 1 → 1. **D-198 on the new strings**: masked win12 0, unmasked 1 = headword window (above); no new overlap with q099.
- **L7 (p15–p17, pairs row vs 2016h28h-q014).** Re-read: the stem scene is digitizing past paper documents and design drawings; answer イ スキャナ, wrong ウ ディジタイザ (drawing input). The new cell 「紙の原稿の電子化」 keeps only the generic act (電子化) and the medium (紙), shares no two-item sequence with the stem (LCS 2 「電子」, Dice 0.03), and drops 図面. A reader applying it to q014 still picks イ. D-198 resolved.
- **L8 (p18–p20, OCR also names the device, qids 2015h27a-q047 / 2024r06-q059 / 2025r07-q081).** After: jp 「…文字コードのテキストに置き換える技術で、この働きをする装置も OCR と呼ぶ。」 zh 「…的技术，具备这一功能的装置也称为 OCR。」 en "…; a device that does this (an optical character reader) is also called OCR." q047 (re-read) asks for the **device** used to read handwriting into character codes, answer ウ OCR, wrong エ OMR (mark reader): the 考点 now names the device, so it fits q047 directly. q081 (asks for the technology, answer エ) and q059 (OCR's role, answer イ) still fit the first clause. Fact correct (OCR = optical character recognition / reader). D-200: 1 sentence, 65 chars (= Rule A's pre-measurement). **D-198 on the new strings**: jp vs q047 LCS 5 (文字コード, unchanged), win12 0/0, Dice 0.18 → 0.19, ed 0.79 → 0.76 (the added clause shares only the term OCR with the stem). en adds the expansion "(an optical character reader)" that jp / zh do not carry; this is the text Rule A L8 prescribed and the same lineage as Rule A L15 (記録のみ), so recorded in §5, not a defect.
- **dpi wording left in `terms[1].detail_jp`.** 「値が大きいほど細かく読み取れる」 keeps the 8-char run 「細かく読み取れる」 with the q099 stem (LCS 8, win12 0/0, Dice 0.13, ed 0.89 — unchanged by the patches). Rule A L1 named `detail` as the place the 考点 restated but prescribed only `points[1]`, and the 「どれだけ…か」 frame that made the 考点 close to q099 is only in `points[1]`. Out of scope; recorded in §5.
- Siblings: `overview_rows[1]`, `pairs[0]` (reading target 「紙面の文字・図・写真」 / "Text, drawings and photos on paper"), `key_points_*[1]` unchanged and agree with p04 / p11–p13. Parity 22 / 0 diff. **u03: all L1–L8 resolved.**

## U4. technology-18-49-u04 (Rule A PASS, 建議修 L1–L2)

### U4.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → 4 (" dpi" → の解像度; 2018h30a-q092 c2 = correct ウ) | の解像度 (4); win12 0/0 → 0/0; Dice 0.10 → 0.12 |
| p02 | zh | 4 → 4 (" dpi" → 的分辨率; q092 c2) | 4 |
| p03 | en | 12 → 12 (" resolution ", term) | 12 |
| p04 | jp | 3 → 4 (解像度 → の解像度, q092 c2) | 4; win12 0/0 → 0/0; Dice 0.05 → 0.06 |
| p05 | zh | 3 → 4 (分辨率 → 的分辨率, q092 c2) | 4 |
| p06 | en | 16 → 16 (" the number of p", unchanged) | " resolution " (12) |
| p07 | jp | 4 → 4 (VGA␣, unchanged) | の解像度 (4); win12 0/0 → 0/0; Dice 0.08 → 0.11 |
| p08 | zh | 4 → 4 (VGA␣) | 分辨率 (3) |
| p09 | en | 16 → 12 (" combination of " → " resolution ") | 12 |

The +1 rises (p04 / p05) are the term 解像度 / 分辨率 with a particle, matching q092's **correct** option (ディスプレイの解像度; D-209 term). No meaningful overlap.

### U4.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `key_points_*[3]` (+ summary.key_points_*[3]) | L1 | Yes (§U4.3) | No | OK |
| p04–p06 | `terms[0](液晶ディスプレイ).detail_*` (+ explanation_*) | L1 | Yes: 「横×縦に並ぶ画素の数を画面の**解像度**という。」/「叫作画面的**分辨率**（[[jp:解像度]]）」/ "is called the screen's **resolution** ([[jp:解像度]])" — the pixel-count definition is now scoped to the screen; bold 3 → 3, `[[jp:]]` 3 → 3 | No | OK |
| p07–p09 | `terms[0].points[1].text_*` | L2 | Yes: 「画面の**解像度**には、よく使われる横×縦の画素数の組ごとに規格名があり、」/「画面**分辨率**中常用的…组合都有规格名称」/ "Common width × height pixel combinations of screen **resolution** have standard names;" — the universal claim (every combination has a name) is gone in zh / en, and jp / zh / en now agree. 2018h30a-q092 (answer ウ ディスプレイの解像度): still supported; VGA 640×480 example and qid unchanged. D-200: 1 sentence, 52 chars | No | OK |

### U4.3 Focused checks — L1 (解像度 scope; dpi is also a resolution unit)

- After (三語): jp 「印刷の速さは ppm、印刷の細かさ (解像度) は dpi で表し、画面の解像度は横×縦の画素数で表す。」 zh 「打印速度用 ppm 表示，打印的精细程度（分辨率）用 dpi 表示，画面的分辨率则用横×纵的像素数表示。」 en "Print speed is given in ppm and print fineness (resolution) in dpi, while screen resolution is given as pixels in width × height." dpi is now named as a resolution unit, and pixel count is tied to the **screen**, so the key point no longer sets dpi and 解像度 against each other.
- Topic-外 questions (re-read): 2012h24h-q084 (unit of the resolution of scanners / printers, answer イ dpi) and 2013h25h-q054 (unit of resolution when a scanner reads photos, answer ア dpi; wrong ウ pixel). Both now follow from the patched key point (印刷の細かさ (解像度) は dpi); q054's wrong option pixel is no longer favoured, because pixel count is now said only for the screen.
- **Cross-unit**: u03 `terms[1].detail_jp` 「読取りの細かさは **dpi** (1 インチの長さを何個の点に分けて読むか) で表し」 and the new u03 `points[1]` (dpi = 1 インチあたりの点の数の単位) do not use 解像度 for dpi and do not conflict with it. `data/ip/textbook/units/technology-20-53-u01.json` (term dpi) defines dpi as 「…を表す解像度の単位」, mainly for printers / scanners. The three units now agree (u04: print resolution = dpi; u03: scanner fineness = dpi; 20-53: dpi = resolution unit for printing / reading).
- Unit-wide 解像度 / 分辨率 / resolution: the remaining uses (`goals_*[2]` 「画面の**解像度**の意味」, `terms[0].points[0]` (q073, 画面の大きさを変えずに解像度を下げる), `overview.intro_*`) are all in a screen context and already scoped (goals says 画面の). `terms[4].detail_*` / `points[2]` (ppm / dpi = 細かさ) are unchanged and agree with the new key point. `[[jp:解像度]]` origin present (u04 17 kinds, miss 0).
- Parity 28 / 0 diff. **u04: L1–L2 resolved.**

## 4. F-fix

No required F-fix in any of the 4 units. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: u02 has 1 zh-term warn (PC → 台式电脑, Rule A L8) and u03 has 2 (PC → 电脑 in analogies, Rule A L9), the recorded false positives, on the base parts too. u01 / u04 have 0 warns.
   - `stage` meta is removed in all 4 units (as in b19–b63).
   - ruleA verbatim miss = none. 27 of 48 patches use shortened phrases; same.mjs shows all 48 give the same field as the Rule A strings.
   - u02 base is `loc.r1` (loc#1); the other three are `loc.r0`. u02 / u04 patches mix labelled (`terms[0](ポインティングデバイス)…`) and unlabelled paths; both resolve in check.mjs / d198.mjs / same.mjs.
2. u03 `terms[1].detail_jp` (+ explanation_jp) keeps 「細かく読み取れる」 (8 chars) with the 2026r08-q099 stem (LCS 8, win12 0, Dice 0.13, unchanged). Rule A L1 prescribed only `points[1]`, and the close 「どれだけ…か」 frame is gone. If the detail is touched later, 「値が大きいほど細部まで読み取れる」 would remove the run; nothing requires it.
3. u03 L8 en now carries both expansions ("optical character recognition" and "(an optical character reader)") in one sentence; jp / zh carry neither for the device clause. This is the text Rule A L8 prescribed, the fact is correct, and it is the same kind as Rule A L15 (記録のみ).
4. Unchanged long en spans: u02 `terms[0].points[1].text_en` 26 chars ("s a position on the screen") with 2013h25a-q078 エ (wrong; touch input) — the sentence gives that property to the pointing device, which is correct and leads away from エ for a scanner question; u03 `terms[1].points[0].text_en` 24 chars (" and converts them into ") with 2024r06-q059 イ (the **correct** option). Both are unchanged by the patches (26 → 26 / 24 → 24) and en-only.
5. u03 hook (p08–p10) still speaks of digits (数字を表す符号) while `one_*` now says 数字など. The hook is the typical JAN image and does not claim exclusivity; consistent, no action.
6. u02 L2 also closes u03 Rule A O1 (イメージスキャナ / イメージスキャナー drift between u02 and u03): 「イメージスキャナ」 without ー is now 0 in u01–u04.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-18-49-u01 | PASS | **9/9** | — | 0 / 0 / 0 | **PASS** |
| technology-18-49-u02 | PASS | **10/10** | — (L2 jp-origin 10/10, consistent with u03) | 0 / 0 / 0 | **PASS** |
| technology-18-49-u03 | PASS | **20/20** | — (L1 moved away from q099, L7 / L8 checked against q014 / q047) | 0 / 0 / 0 | **PASS** |
| technology-18-49-u04 | PASS | **9/9** | — (L1 解像度 scope consistent with u03 and 20-53-u01) | 0 / 0 / 0 | **PASS** |

- **Application:** 48/48 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (252 checked, 0 mismatch), memory_hooks pairing 0 bad. 27/48 shortened, and all 48 give the same field as the Rule A string (same.mjs). Every 建議修 is covered.
- **D-198:** no patch adds a meaningful overlap. The rises are u02 p03 +3 (generic word), u02 p04 +2 / u03 p01 +1 (headword イメージスキャナー), u02 p08 +1 (term タッチパネル; Dice 0.27 vs q076, §U2.1), u04 p04 / p05 +1 (term 解像度 / 分辨率 = q092 correct option). u03 p17 (16 → 10) and u04 p09 (16 → 12) drop. u03 p01 vs q099 sentence 2: Dice 0.18 → 0.05. u02 p06's 26 and u03 p20's 24 are unchanged text (Obs. 4).
- **D-200:** no 考点 claim reversed; patched 考点 all 1 sentence (u03 50 / 65, u04 52, u02 67 chars). qids and kinds unchanged. **D-202:** `[[jp:]]` origin miss 0 in all 4 units (u02 イメージスキャナー changed together with the jp bold term). **D-204:** u01 p04–p06 and u02 p08–p10 bring analogy / figure scope in line with `one` / `detail`. **D-205 / D-210:** no new law, standard, version or numeric claim; u04 p07–p09 remove a universal claim.
- **Gates:**
  - validate --unit ×4: 0 issues / EXIT 0 (u02 1 warn, u03 2 warns, pre-existing false positives)
  - validate --part ×4: 0 issues, sha256 = base_sha256 for each
  - parity ×4: 0 diff (27 / 24 / 22 / 28 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for all 4 units.** All 48 active patches are applied exactly, and every 建議修 LOW is resolved in context in all three languages:
- u02 p04–p06: 「イメージスキャナー」 now in the jp bold term and both `[[jp:]]` origins, matching u03; jp-origin check miss 0.
- u03 p01–p03: the dpi 考点 starts from the unit and no longer retells 2026r08-q099's sentence (Dice 0.05); p15–p17 drop the q014 two-item scene and 図面; p18–p20 name the OCR device, which fits 2015h27a-q047 directly.
- u04 p01–p09: dpi is named as the print resolution unit and pixel count is scoped to the screen, consistent with u03 and technology-20-53-u01; the zh / en universal claim on standard names is gone.

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
