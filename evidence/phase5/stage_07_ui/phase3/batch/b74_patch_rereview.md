# b74 B3 patch re-review — technology-20-53 u01〜u03 (色と画像表現の基礎、3D・映像メディアの応用、xR・没入技術とメタバース)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the three Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b74rv/`: `check.mjs` / `same.mjs` / `d198.mjs` / `raverb.mjs` copied from `b73rv/` with only the unit map changed (3 units, topic technology-20-53; bases `b74-u01-a1` / `b74-u02-a2` / `b74-u03-a2`, all round `r0`). `same.mjs` reads the 26 Rule A before / after pairs from `b74rv/ra.json`, copied by hand from the three Rule A "修正案" cells (`b74rv/mkra.mjs` writes it). `raverb.mjs` confirms all 52 strings verbatim in the Rule A files (miss 0). Unit-wide greps, `[[jp:]]` origin, D-200 counts, the cited-question lookups and the cross-unit grep (§X) were run as one-off `node -e` commands (not saved). No scratch files in the repo.
- Date: 2026-11-09 (Session 152, b74)
- Scope: the B3 wording patches for 3 units. **26 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (色と画像表現の基礎) | PASS, 建議修 L1–L4 (L8 任意) | p01–p12 | L1 → p01–p03 (`terms[1](減法混色).points[0].text_*`, q073; p02 also removes the L2 zh bold); L2 → p04–p06 (`terms[0].points[1].text_zh`, `terms[1].points[1].text_zh`, `terms[5].points[0].text_zh`, zh bold); L3 → p07–p09 (`terms[0](加法混色).detail_*` 3rd sentence); L4 → p10–p12 (`terms[3](ppi).detail_*` 1st sentence) | 11/12 (all but p09) |
| u02 (3D・映像メディアの応用) | **FAIL M1**, 建議修 L5 / L6 | p01–p10 | M1 → p01–p03 (`terms[0](3D).fig.data.b.*`, compare heading); L5 → p04–p09 (`terms[3](4K).one_zh/en`, `terms[4](8K).one_zh/en`, `overview_rows[3].one_line_zh/en`); L6 → p10 (`key_points_en[0]`) | 6/10 (p04–p08, p10) |
| u03 (xR・没入技術とメタバース) | PASS, 建議修 L1 / L2 | p01–p04 | L1 → p01 (`terms[5](複合現実).detail_en`); L2 → p02–p04 (`terms[4](MR).detail_*` 1st sentence, second half) | 1/4 (p01) |

  Every MEDIUM and every 建議修 is covered. 記録のみ LOWs (u01 L5–L8, u02 L1–L4, u03 L3–L9) and O-items are not patched and not re-ruled here. u01 L8 has an optional ("任意") prescription; it is not patched, which the Rule A file allows.
  - **Shortened strings**: **18 of 26** (`before` / `after` are phrases inside the Rule A strings; counted by script as patch `before` ≠ `ra.json` before). `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **26/26**, so all shortened patches give the same result as the Rule A strings.
  - One Rule A string starts with "…" (u02 L5 `terms[4].one_zh`, with the note 「文中の「高清晰影像规格」→「超高清影像规格」のみ置換」). `ra.json` uses the text after the "…" (「、能表现比 4K 更精细影像的高清晰影像规格。」 → 「…超高清影像规格。」); it is verbatim in the Rule A file and occurs once in the base field.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-20-53-u01/parts/b74-u01-a1/technology-20-53-u01.loc.r0.json` `fb501385dde61e5c…`
  - u02 `.../technology-20-53-u02/parts/b74-u02-a2/technology-20-53-u02.loc.r0.json` `88094c241a60f9fb…`
  - u03 `.../technology-20-53-u03/parts/b74-u03-a2/technology-20-53-u03.loc.r0.json` `48e0140665a4daab…`
- Merged units (current) `data/ip/textbook/units/technology-20-53-u0N.json` sha256: u01 `52842b1c384c20b1…`, u02 `74a02cf7710f11b3…`, u03 `3bfb560119c33a56…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b73_patch_rereview.md` §0 (no unit-level patches in this batch). All 3 units share topic technology-20-53 (10 questions), so there are 50 source strings per language.

1. **Application check** (`b74rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b74rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b74rv/d198.mjs`, all 26 patches): whole-field LCS before → after and LCS of the `after` span against the 50 sources per language; jp also 12-char windows (unmasked / masked) and Dice.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json`: 2014h26a-q073 (正答 ウ 黒; CMY を減法混色で混ぜた理論上の色), 2012h24h-q072 (光の三原色; 正答 エ RGB, wrong ア = CMY の 3 色), 2014h26h-q080 (正答 ウ 白), 2025r07-q019 (VR の事例; 正答 ア ゴーグル内の仮想空間, wrong イ = スマホ越しに自室へ家具を試し置き / ウ 史跡 / エ 図鑑).
5. **Cross-unit checks (key check of this batch)**: read u01〜u03 together in jp (all fields) and in zh / en for the patched fields, on (a) colour model (加法 / 減法、光を出す機器), (b) 画素 and image data (画素の定義、圧縮しないデータ量、画像形式), (c) 3D / 3DCG / 3 次元 CG and 4K / 8K naming (高精細 / 超高清 / UHD), (d) VR / AR / MR terminology and the AR / MR boundary (§X).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording and a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b73): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 124 / u02 99 / u03 140) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-09)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-53-u01   → ✓ 0 issues               EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-20-53-u01   → ✓ 26 locations, 0 diff   EXIT=0
$ ... validate --unit technology-20-53-u02 → ✓ 0 issues  EXIT=0 | parity → ✓ 24 locations, 0 diff  EXIT=0
$ ... validate --unit technology-20-53-u03 → ✓ 0 issues  EXIT=0 | parity → ✓ 29 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 loc#0 counts {"terms":6,"figs":3,"steps":0,"points":9,"pairs":2,"key_points":4,"goals":3}  sha256 fb501385dde61e5c…  ✓ 0 issues  EXIT=0
  u02 loc#0 counts {"terms":5,"figs":2,"steps":4,"points":5,"pairs":2,"key_points":4,"goals":3}  sha256 88094c241a60f9fb…  ✓ 0 issues  EXIT=0
  u03 loc#0 counts {"terms":7,"figs":3,"steps":4,"points":4,"pairs":2,"key_points":4,"goals":3}  sha256 48e0140665a4daab…  ✓ 0 issues  EXIT=0
  (all 3 sha256 = base_sha256 of every patch in that unit; warn lines 0 in all 6 validate runs)
vitest src/lib/textbook: Test Files 1 failed | 12 passed (13), Tests 1 failed | 161 passed (162)
  failed: v1-snapshot.test.ts "every current v1 unit matches its recorded dictionary senses and unit anchors"
          → AssertionError: expected 0 to be greater than 0 (Object.keys(v1Fingerprint(...)).length)
  cause: data/ip/textbook/units/ now holds 244 units, all schema_version textbook-unit-v2 (0 v1 units);
          v1Fingerprint filters schema_version === v1, so the test's non-empty precondition fails. The 3 b74 units
          are v2 in both base and unit (patches change no schema), so the failure does not depend on these patches (§5 Obs. 1).
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 12 ok 12 | issues [] | changed base-present = 12 patched + 'stage' | unexplained besides 'stage' 0 | derived 60, mismatch 0 | memory_hooks 18 bad 0, lens 4/4/4
  u02 active 10 ok 10 | issues [] | changed base-present = 10 patched + 'stage' | unexplained 0 | derived 51, mismatch 0 | memory_hooks 15 bad 0, lens 3/3/3
  u03 active 4 ok 4   | issues [] | changed base-present = 4 patched + 'stage'  | unexplained 0 | derived 72, mismatch 0 | memory_hooks 21 bad 0, lens 6/6/6
  base sha = base_sha256 for all 26; before count in base = 1 for all 26; replay mismatch 0
  base-only top keys (all 3): stage / round / jp_round (part metadata)
  net before remnant: 0 for 26/26 (raw and inline-stripped)
  bold counts: unchanged in 21 of 26; u01 p02 / p04 / p06 1 → 0 and p05 2 → 0 (the L2 zh bold removal, intended); [[jp:]] counts unchanged in all 26
  derived followers (all true): u01 explanation_jp/zh/en of terms[0] (p07–p09) and terms[3] (p10–p12);
      u02 definition_zh/en of terms[3] (p04–p05) and terms[4] (p06–p07), summary.key_points_en[0] (p10);
      u03 explanation_en of terms[5] (p01), explanation_jp/zh/en of terms[4] (p02–p04)
  ruleA verbatim miss: [] in all 3 units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 26/26 (u01 12/12, u02 10/10, u03 4/4)
  base.replace(Rule A before, Rule A after) == unit field: 26/26 true
raverb.mjs: 52 Rule A strings, verbatim miss 0
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 8 kinds miss 0 | u02 4 | u03 8 — miss 0 in all
D-200 (patched 考点, jp chars without spaces / sentences): u01 terms[1].points[0] (p01–p03, exam, qids [2014h26a-q073]) jp 36 / 1;
  u01 terms[0].points[1] (p04, exam, [2014h26h-q080]) jp 25 / 1, terms[1].points[1] (p05, mix) 44 / 1, terms[5].points[0] (p06, mix) 35 / 1
  (jp of p04–p06 not patched). All ≤100 / ≤2.
grep in the units (old wording, expect 0; derived / summary copies excluded):
  u01 "混ぜ合わせ" 0 / "混合在一起" 0 / "mixing cyan" 0 / "自ら光" 0 / "自己发光" 0 / "emit their own" 0 /
      "画面に表示される画像" 0 / "屏幕上显示图像" 0 / "image shown on a screen" 0; `**` in any points[].text_zh 0 (bold jp/zh/en = 0/0/0 in all 9 考点)
  u02 "立体の表現" 0 / "立体表现" 0 / "Solid representation" 0; "高清晰" 0; "高清" not in 全高清 / 超高清: 1 (= unit_summary_zh, v1 field, §5 Obs. 2);
      "high-definition" not in ultra-: 1 (= unit_summary_en, same); "超高清" / "ultra-high" 6 (the 6 L5 fields)
  u03 "机の上" 0 / "放在桌面" 0 / "on a desk" 0 / 'which means "compound"' 0; "混ぜ合わせ" 1 (= terms[4].hook_jp "mixed は「混ぜ合わせた」", unrelated)
```

No validate warns in any of the 3 units (unit or part). `stage` meta is removed in all 3 units (as in b19–b73).

**Application.** All 26 `before` strings occur exactly once in their base field, all 26 `after` strings are present, and replay reproduces every patched field. Net `before` remnants are 0 for all 26. 18 are shortened phrases of the Rule A strings; all 26 give exactly the Rule A after text (same.mjs 26/26).

## U1. technology-20-53-u01 (Rule A PASS, 建議修 L1–L4)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 7 → **6** (混ぜ合わせると, 2014h26a-q073 stem → の 3 色を, 2014h26h-q080 stem) | 6 (same); **win12 4/4 → 0/0**; **Dice 0.52 → 0.39** (q073 stem) |
| p02 | zh | 10 → 8 (混合在一起，理论上会 → 在一起，理论上会, q073 stem) | 减法混色 (4, term name) |
| p03 | en | 25 → 25 (" subtractive color mixing", q073 stem, unchanged term name) | " the three colors cyan" (22, 2012h24h-q072 ア en) |
| p04 | zh | 5 → 5 (红、绿、蓝, q080 stem, unchanged) | 加法混色 (4) |
| p05 | zh | 4 → 4 (减法混色) | 4 |
| p06 | zh | 5 → 5 (计算机图形, 2020r02o-q083 stem, term name) | 5 |
| p07 | jp | 6 → 6 (ディスプレイ, q080 stem, unchanged) | のよう (3); win12 0/0 → 0/0; Dice 0.20 → 0.22 |
| p08 | zh | 4 → 4 (三种颜色, unchanged) | 色的 (2) |
| p09 | en | 11 → 11 ("ed together", unchanged sentence 1) | ", such as " (10) |
| p10 | jp | 8 → 8 (スマートフォンの, unchanged) | ディスプレイ (6); win12 0/0 → 0/0; Dice 0.21 → 0.13 |
| p11 | zh | 4 → 4 (智能手机, unchanged) | 图像 (2) |
| p12 | en | 12 → 12 (" that makes ", unchanged) | 12 |

- **Fall (the L1 point)**: p01 removes the only q073 near-match: the 12-char windows on 「…を混ぜ合わせると理論上は…」 (4 unmasked / 4 masked, d1–d2) go to 0/0, field Dice 0.52 → 0.39, LCS 7 → 6; zh LCS 10 → 8.
- **Rise**: p03 en after-span 22 " the three colors cyan" = the start of **2012h24h-q072 ア** en (the CMY choice, wrong for 光の三原色). The shared text is the generic list head "the three colors" + the first colour name, and the jp / zh sides do not share it (jp win12 0/0; zh LCS ≤8 with q073). The sentence starts "In subtractive color mixing", which is the true place of CMY (= `terms[1].one_en` "the three primary colors of ink"); q072's point is light vs ink, and `terms[0].points[0]` (exam, q072) still gives RGB for light. It does not support ア. p07 Dice +0.02 is the unchanged ディスプレイ / プロジェクタ. No patch adds a question's frame or element order.

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[1](減法混色).points[0].text_*` (exam, 2014h26a-q073) | L1 (+ L2 for zh) | Yes: 「シアン・マゼンタ・イエローの **3 色を重ねる**と、理論上は黒になる」/「把青、品红、黄**三色叠加**在一起」/ "**layering** the three colors cyan, magenta and yellow" = the unit's own verb 重ねる (one / detail / mix 考点 / pairs / key_points). q073 正答 ウ 黒 still read directly; 限定条件「理論上は」/「理论上」/ "in theory" kept; wrong 青・赤・緑 get no support. zh bold removed (= jp / en) | No (Obs. 3) | OK |
| p04–p06 | `terms[0].points[1].text_zh`, `terms[1].points[1].text_zh`, `terms[5].points[0].text_zh` | L2 | Yes: the headword bold is gone in zh, so all 9 考点 have bold 0/0/0 in jp / zh / en. `[[jp:]]` tags kept (1 / 2 / 1). Wording otherwise unchanged | No | OK |
| p07–p09 | `terms[0](加法混色).detail_*` 3rd sentence (+ explanation_*) | L3 | Yes: 「ディスプレイやプロジェクタのように**光を出して色を見せる**機器」/「这类**发出光来呈现颜色**的设备」/ "Devices that **show colors by giving off light**" — no longer says the device itself is self-luminous, so it no longer reads against technology-18-49-u04 (液晶そのものは光らない、バックライトが要る): a backlit LCD does give off light. The additive fact (光を足す → 白) in sentences 1–2 is unchanged; `overview_rows[0].extra[0]` / `pairs[0].rows[3].a` (ディスプレイ、プロジェクタ) agree | No | OK |
| p10–p12 | `terms[3](ppi).detail_*` 1st sentence (+ explanation_*) | L4 | Yes: (a) 「画素は**デジタル画像**を作る最小の単位」/「构成**数字图像**的最小单位」/ "makes up a **digital image**" — no longer screen-only, so it covers the scanned-image pixels of `terms[2].detail`「読み取った点 1 つが画像の画素 1 つ」 and the dpi table; (b) jp now names the subject 「**ppi は**主にディスプレイ…を表すのに使う」, = zh / en, which already had ppi. 「主に」 kept (not exclusive, = pairs[1].rows[1]) | No | OK |

### U1.3 Focused checks

- 考点 jp p01: 36 字 / 1 文, qid kept. The other exam 考点 (`terms[0].points[1]` q080 「同じ強さで重ねると白」, `terms[2].points[1]` q098 「圧縮しない画像のデータ量」) unchanged; the jp-review r1 HIGH fix (圧縮の前提) is intact in三語.
- After p10, 画素 is defined in u01 as 「デジタル画像を作る最小の単位」 and used for both scanner (dpi) and screen (ppi) images; `goals[1]` 「数える単位 (点か画素か)」 and `terms[3].points[0]` (mix) 「dpi は点の数、ppi は画素の数」 unchanged and consistent.
- O2 (SVG 「黒(全て最大)」, also in the v1 `terms[1].figure.mermaid`) is outside the patches and unchanged (Rule A O2).
- Parity 26 / 0 diff. **u01: L1 / L2 / L3 / L4 resolved.**

## U2. technology-20-53-u02 (Rule A FAIL M1, 建議修 L5 / L6)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 2 → **7** ("(3" → コンピュータで, 2016h28h-q100 ウ) | 7 (same); win12 0/0 → 0/0; Dice 0.03 → **0.20** (q100 ウ) |
| p02 | zh | 2 → 3 (立体 → 计算机, q100 イ) | 3 |
| p03 | en | 10 → 8 (" represent" → "omputer-") | 8 |
| p04 | zh | 2 → 2 (unchanged) | 影像 (2) |
| p05 | en | 7 → 7 ("d with ", unchanged) | "is an " (6) |
| p06 | zh | 2 → 2 | 影像 (2) |
| p07 | en | 13 → 13 ("er images tha", q100 イ, unchanged) | "is an " (6) |
| p08 | zh | 2 → 2 | 影像 (2) |
| p09 | en | 7 → 7 ("d with ", unchanged) | 7 |
| p10 | en | 14 → 14 (" based on the ", 2014h26h-q080 stem, unchanged) | 13 |

- **Rise**: p01 +5 / Dice +0.17 is the generic word コンピュータで in a 4-word table heading, shared with a wrong choice ウ of the AR question 2016h28h-q100 (speech recognition, “コンピュータで解析”). The heading text 「コンピュータで描く…(3DCG)」 is the unit's own phrase (`terms[0].detail_jp`「コンピュータで描く 3D (**3DCG**)」, `key_points_jp[0]`); it carries no question frame. p02 +1 (计算机). No other rise.

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[0](3D).fig.data.b.*` (compare heading) | M1 | Yes (§U2.3) | No | OK |
| p04–p09 | `terms[3](4K).one_zh/en`, `terms[4](8K).one_zh/en`, `overview_rows[3].one_line_zh/en` (+ definition_*) | L5 | Yes: zh 「超高清影像规格」 ×3 / en "an ultra-high-definition video standard" ×3; with `terms[3].detail` 「全高清 / Full HD (1,920 × 1,080) の縦横 2 倍、総数約 4 倍」 and `pairs[1].rows[2]` (FHD 比 約 4 / 16 倍) the names now line up (FHD < UHD). jp 「高精細映像の規格」 unchanged (jp not in scope). `overview_rows[4].one_line_*` (8K) has no HD word in any language, so nothing is left behind there. Remaining 「高清」/ "high-definition" only in v1 `unit_summary_zh/en` (Obs. 2) | No (Obs. 2) | OK |
| p10 | `key_points_en[0]` (+ summary.key_points_en[0]) | L6 | Yes: "…based on the viewing position and light direction, **and draws them on screen**." = jp 「見え方を計算して描く」/ zh 「算出看上去的样子再绘制」 and `terms[0].detail_en` "before it is drawn on screen". Bold 1 / 1 | No | OK |

### U2.3 Focused checks — M1 (compare heading = 3DCG)

- **After (三語)**: b = 「コンピュータで描く立体 (3DCG)」/「计算机绘制的立体（3DCG）」/ "Computer-drawn solid (3DCG)". rows[1].b 「視点を回り込ませて見られる」 and rows[2].b 「視点と光の当たり方から計算して表示」 are now stated of 3DCG, which is where they are true (a stereoscopic 2-camera 3D video has neither). rows[0].b 「縦・横に奥行きを加えた形」 = `overview_rows[0].extra[1]` 「3DCG では奥行きを含む形状データを持つ」.
- The heading now agrees with every other 3DCG-scoped field: `terms[0].detail_*` (コンピュータで描く 3D (3DCG)), `terms[0].points[0]` (mix, 「3DCG かどうかは…」), `key_points_*[0]`, `overview_rows[0].extra_*[1]`. `terms[0].one_*` (3D in general, 縦・横 + 奥行き) stays broader, as Rule A requires; the a1 r1 MEDIUM fix is no longer reversed in the figure.
- The heading defines 3DCG inside itself (コンピュータで描く), so the a1 r2 LOW (3DCG appears in the figure before its definition) is also gone. a = 「平面の表現 (2D)」 unchanged; the pair is 2D vs 3DCG (not strictly parallel), but rows a 「描いた向きに決まる」/「平面の図をそのまま表示」 still read as the flat-drawing contrast. Rule A prescribed no change to a / rows.
- L1 (粘土の模型 analogy, 記録のみ) now matches the figure and detail, as Rule A expected.
- Parity 24 / 0 diff. **u02: M1 / L5 / L6 resolved.**

## U3. technology-20-53-u03 (Rule A PASS, 建議修 L1 / L2)

### U3.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | en | 14 → 14 (" are combined ", 2014h26h-q080 stem, unchanged) | " of the " (8) |
| p02 | jp | 4 → 4 (できる。, 2025r07-q019 イ → unchanged) | が現実の (4, q019 ウ); win12 0/0 → 0/0; Dice 0.10 → 0.09 |
| p03 | zh | 2 → 3 (的位 → 与现实, 2024r06-q025 stem) | 与现实 (3) |
| p04 | en | 9 → 9 ("al object", 2020r02o-q083 stem, unchanged) | 9 |

- **Rise**: p03 +1 (与现实, generic). p02 Dice down (0.10 vs q019 イ → 0.09); the nearest jp source is no longer q019 イ (the furniture choice). No patch adds a question's frame.

### U3.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[5](複合現実).detail_en` 2nd sentence (+ explanation_en) | L1 | Yes: "**The first word of the Japanese name** means "compound", reflecting how…" = jp 「「複合」という名前に表れている」 (a part of the name) and the same pattern as `terms[3](拡張現実).detail_en` "The first word of the Japanese name means "extend", reflecting how…". The whole name 複合現実 no longer reads as meaning "compound" | No | OK |
| p02–p04 | `terms[4](MR).detail_*` 1st sentence, 2nd half (+ explanation_*) | L2 | Yes: 「仮想の物体が現実の物の陰に入ると隠れて見えなくなるなど、現実の物との**前後関係**まで表せる」/「虚拟物体移到现实物体后面时会被挡住而看不见，连与现实物体的前后关系也能表现出来」/ "a virtual object that moves behind a real object is hidden from view, so even which one is in front can be shown". The 「机の上に載せる」 example (the q019 イ scene that the question counts as AR) is gone (机の上 / 放在桌面 / on a desk 0); the remaining example is occlusion = `pairs[1].rows[0].b` 「現実の物の陰に隠れるなど」 (key row). The first half (装置が壁や机の位置や形を認識する) and sentence 2 (歩き回る / 手で動かす) are unchanged | No (Obs. 4) | OK |

### U3.3 Focused checks — AR / MR boundary after L2

- vs **2025r07-q019**: 正答 ア (ゴーグル内の仮想空間 = VR) is still selected by `terms[0].points[0]` (現実が見えているか). イ (スマホ越しに自室へ家具を重ねて試し置き) now finds no MR example to match; it reads as AR from `terms[2].detail` 「重ねる情報は…立体の映像の場合もある」 and `key_points[1]`. ウ / エ (史跡・図鑑に重ねる) = AR. The question asks for VR, so no choice moves.
- MR fields now give one picture: `one` (空間の形を読み取り…融合…作用し合う), `detail` (認識 → 陰に隠れる・前後関係 → 別の角度・手で動かす), `points[0]` (mix, 度合いが強い), `pairs[1].rows[0]` (key: 弱い / 強い (陰に隠れるなど)), `overview_rows[4]`, `key_points[2]`, `goals[1]`. Rule A L3 (空間の認識は AR 端末にもある, 記録のみ) is not changed by these patches.
- Parity 29 / 0 diff. **u03: L1 / L2 resolved.**

## X. Cross-unit check — colour model, 画素 / image data, 3D / 4K·8K naming, VR·AR·MR (technology-20-53 u01〜u03, 三語)

| Axis | u01 | u02 | u03 | Contradiction? |
|---|---|---|---|---|
| (a) colour model | 加法 = 光の三原色 RGB を重ねる → 白、機器 = 「光を出して色を見せる」ディスプレイ・プロジェクタ (p07–p09); 減法 = インクの三原色 CMY を 3 色重ねる → 理論上は黒 (p01–p03), 印刷は CMYK; hook 画面の赤・緑・青の点 | 画素 = 「画面を作っている色の点」(4K detail) | (no colour model) | No — 「重ねる」 is now the one verb for both additive and subtractive in u01 (one / detail / 考点 / pairs / key_points); u02's coloured screen dots match the u01 hook and the additive display row. "自ら光" is gone, so nothing says the LCD itself shines (technology-18-49-u04) |
| (b) 画素 / image data / format | 画素 = デジタル画像を作る最小の単位 (p10–p12); dpi: 読み取った点 1 つ = 画素 1 つ; 圧縮しない画像のデータ量 = 縦 × 横 × 1 画素 (exam, q098); ppi は主に画面 | 画素 = 画面を作っている色の点 (screen sense, 4K / 8K); 8K: 画素が細かい → データ量大 → 機器の性能 | — | No — u01 now gives the general definition and u02 the screen instance; zh 像素 / en pixel in both. No unit says a compressed image size; no image-format names (JPEG / PNG / GIF / BMP) appear in u01〜u03 (they are in technology-20-52) |
| (c) 3D / 3DCG / 4K·8K naming | CG detail: **2 次元 CG** / **3 次元 CG** (奥行きのある立体を計算で描く); zh 二维 CG / 三维 CG, en 2D CG / 3D CG | 3D (one, general) / **3DCG** (detail, 考点, key_points, overview, fig b after p01–p03 = コンピュータで描く立体); 4K / 8K = jp 高精細, zh 超高清, en ultra-high-definition (p04–p09), FHD = 全高清 / Full HD | — | No — u01 3 次元 CG and u02 3DCG name the same thing (計算で描く奥行きのある立体); u02's heading now says コンピュータで描く, matching u01's 計算で描く. The FHD < UHD naming is consistent inside u02 except the v1 unit_summary (Obs. 2) |
| (d) VR / AR / MR | (no xR terms; VR is only a wrong choice in q083, not cited in text) | シミュレーター = 用途で決まる、3D 映像は手段の一つ | VR = 視界を仮想空間だけに (現実が見えない); AR = 現実に重ねる、立体の映像の場合もある; MR = 空間の形を読み取り作用し合う度合いが強い、例 = 陰に隠れる (p02–p04); 複合現実 = "The first word … means compound" (p01); メタバース = 場 | No — u03 VR detail 「危険を伴う作業を安全に練習」 and u02 シミュレーター (用途) coexist (VR = 体験の技術, simulator = 用途). After L2 no MR example duplicates the AR scene of q019 イ; the 3 Japanese-name detail_en sentences (仮想 / 拡張 / 複合) now share one pattern for 拡張 / 複合 |

- **(a)** p01–p03 and p07–p09 are in different terms of u01 but now read together cleanly: additive = 光を足す機器で色を見せる、subtractive = インクを 3 色重ねる (理論上黒). Neither patch touches the SVG labels (O2 of u01).
- **(c)** u02 `terms[3].one_jp` / `terms[4].one_jp` 「高精細映像の規格」 and `unit_summary_jp` 「高精細映像規格」 are jp and unchanged; 高精細 is the usual jp term and covers UHD, so only zh / en needed the fix.
- u01 and u02 do not use xR terms, and u03 does not use colour-model or 画素 terms, so axes (a)–(b) and (d) do not cross between units except through u02 シミュレーター ↔ u03 VR (unchanged by these patches).

## 4. F-fix

No required F-fix in any of the 3 units. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: 0 warns in all 3 units (unit and part).
   - `stage` meta is removed in all 3 units (as in b19–b73).
   - ruleA verbatim miss = none. 18 of 26 patches use shortened phrases; same.mjs shows all 26 give the same field as the Rule A strings. One Rule A string (u02 L5 `terms[4].one_zh`) starts with "…"; `ra.json` uses its tail (§ Scope).
   - net remnant 0 for all 26.
   - Bases: u01 `a1`, u02 / u03 `a2`, all `loc.r0`. u03 patch paths carry labels (`terms[5](複合現実)…`, `terms[4](MR)…`); they resolve in check.mjs / d198.mjs / same.mjs. u01 / u02 paths have no labels.
   - **vitest 161/162**: the one failure is `src/lib/textbook/__tests__/v1-snapshot.test.ts`, whose precondition `Object.keys(now).length > 0` needs at least one v1 unit. `data/ip/textbook/units/` now holds 244 units, all `textbook-unit-v2` (every unit modified in the working tree, including the 3 b74 units, is `stage4-unit-v1-trilingual` at HEAD and v2 now). `v1Fingerprint` keeps only v1 units, so the test fails whatever the b74 patch text is; the b74 bases are v2 too. This is a test-maintenance item for the batch owner (the test has no v1 units left to guard once all units are v2), not a b74 defect. It was 162/162 at b73.
2. u02 `unit_summary_zh` 「以及高清影像规格（4K、8K）」 / `unit_summary_en` "and high-definition video standards (4K, 8K)" are v1 fields (= manifest `v1.unit_summary_*`, Rule A O2 「v1 と同文、未改稿」) and keep the L5 wording that p04–p09 replaced elsewhere. Same type as L5 (LOW, 誤りではない). If the unit is touched again, a unit-level patch could change zh 「高清影像规格」 → 「超高清影像规格」 and en "high-definition video standards" → "ultra-high-definition video standards" (jp 「高精細映像規格」 unchanged). Nothing requires it.
3. u01 p03 en after-span shares " the three colors cyan" (22) with 2012h24h-q072 ア en (the CMY choice). The sentence names subtractive mixing (ink), where CMY is correct; q072 (light) is solved by `terms[0].points[0]` (RGB). jp / zh have no matching window. Not a defect.
4. u03 p02–p04: jp 「陰に入ると隠れて見えなくなる**など**、…前後関係**まで**表せる」 is example → generalization; zh 「…看不见，连…前后关系也能表现出来」 and en "…hidden from view, so even which one is in front can be shown" drop the explicit "など" and en uses "so". Both still give occlusion as one case of depth order; this is the Rule A L2 text. Not re-ruled.
5. u02 fig a / b are now 「平面の表現 (2D)」 vs 「コンピュータで描く立体 (3DCG)」 (not strictly parallel). Rule A prescribed only b; rows a still describe flat drawings. Not a defect.
6. D-198: falls u01 p01 (q073 win12 4/4 → 0/0, Dice 0.52 → 0.39, the L1 point), p02 (LCS 10 → 8), p10 (Dice 0.21 → 0.13), u03 p02 (Dice 0.10 → 0.09); rises u02 p01 (コンピュータで, Dice 0.03 → 0.20, generic word in a heading), p02 (+1 计算机), u03 p03 (+1 与现实), u01 p07 Dice +0.02 (unchanged ディスプレイ). All analysed in the per-unit §.1.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-20-53-u01 | PASS | **12/12** | — | 0 / 0 / 0 | **PASS** |
| technology-20-53-u02 | FAIL (M1) | **10/10** | M1 resolved (compare heading b = コンピュータで描く立体 (3DCG) / 计算机绘制的立体（3DCG）/ Computer-drawn solid (3DCG); rows 視点・光 are now 3DCG-only, = detail / 考点 / key_points / overview) | 0 / 0 / 0 | **PASS** |
| technology-20-53-u03 | PASS | **4/4** | — | 0 / 0 / 0 | **PASS** |

- **Application:** 26/26 exact (replay, part-level). 0 unexplained diffs, net `before` remnants 0, derived fields follow (183 checked, 0 mismatch), memory_hooks pairing 0 bad. 18/26 shortened, and all 26 give the same field as the Rule A string (same.mjs). Every MEDIUM and 建議修 is covered.
- **D-198:** no patch adds a meaningful overlap. p01 (u01) removes the q073 near-match (win12 4/4 → 0/0). The rises are generic words (u02 p01 コンピュータで, p02 计算机, u03 p03 与现实) or a colour-list head in en (u01 p03, Obs. 3); win12 0/0 in all jp patches after the patch.
- **D-200:** patched 考点 u01 `terms[1].points[0]` (三語, exam, 2014h26a-q073) jp 36 / 1; `terms[0].points[1]` (zh only, exam, q080) 25 / 1, `terms[1].points[1]` (zh only, mix) 44 / 1, `terms[5].points[0]` (zh only, mix) 35 / 1; qids kept; no 考点 claim reversed (限定条件「理論上は」 kept). **D-202:** `[[jp:]]` origin miss 0 in all 3 units; `[[jp:]]` counts unchanged in all 26; bold changed only where L2 asked (u01 p02 / p04–p06, zh 考点 now = jp / en). **D-204 / 書き方 7:** u02 figure heading ↔ 3DCG fields, u01 additive detail ↔ technology-18-49-u04 LCD, u01 ppi 画素 ↔ dpi 画素, u03 MR example ↔ q019 AR scene no longer conflict (§X). **D-205 / D-210:** no new law, standard version or numeric claim; 4K / 8K numbers unchanged.
- **Gates:**
  - validate --unit ×3: 0 issues / EXIT 0 (0 warns)
  - validate --part ×3: 0 issues, sha256 = base_sha256 for each
  - parity ×3: 0 diff (26 / 24 / 29 locations)
  - vitest textbook: **161/162** — 1 failure in `v1-snapshot.test.ts` (0 v1 units remain in the repo; independent of these patches, Obs. 1)
  - patch tests: 14/14

**PASS for all 3 units.** All 26 active patches are applied exactly, and the one MEDIUM and every 建議修 LOW are resolved in context in all three languages:
- u01 p01–p12: 減法 exam 考点 uses 「3 色を重ねる」 (q073 near-match gone, 理論上 kept); zh 考点 bold removed (= jp / en); additive devices 「光を出して色を見せる」 (no self-luminous claim); 画素 = デジタル画像の最小単位 and jp subject ppi.
- u02 p01–p10: compare heading = コンピュータで描く立体 (3DCG) (a1 MEDIUM fix no longer reversed in the figure); zh 超高清 / en ultra-high-definition for 4K / 8K; en key point adds "draws them on screen".
- u03 p01–p04: 複合現実 en "The first word of the Japanese name"; MR example = occlusion / 前後関係 (no 机の上に載せる AR scene).

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix. The vitest failure (v1-snapshot precondition) needs separate handling by the batch owner.
