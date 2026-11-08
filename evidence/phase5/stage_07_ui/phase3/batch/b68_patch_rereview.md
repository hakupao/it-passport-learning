# b68 / b69 B3 patch re-review — technology-20-52 u01〜u06 (マルチメディアの基礎・配信・権利保護、音声のデジタル表現とファイル形式、静止画のデータ表現方式、静止画・文書のファイル形式、動画の仕組みとファイル形式、データ圧縮の方式と特徴)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the six Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b68rv/`: `check.mjs` / `d198.mjs` / `same.mjs` copied from `b67rv/` with only the unit map changed (6 units; u01 base attempt `a2` round `r0`, u02 `a2` / `r1`, u03 `a1` / `r0`, u04 `a1` / `r0`, u05 `a2` / `r1`, u06 `b69-u06-a1` / `r0`). `same.mjs` reads the 46 Rule A before / after pairs from `b68rv/ra.json`, copied by hand from the six Rule A "修正案" cells (u03 from its "L1 / L2 / L3 置換" lists). For 9 pairs the Rule A string starts with an ellipsis "…" (u01 `terms[4].one_zh/en`, `terms[6].detail_zh/en`, `terms[7].points[0].text_zh/en`; u05 `terms[2].detail_jp/zh/en`); `ra.json` holds the text after the "…". `raverb.mjs` confirms all 92 strings verbatim in the Rule A files (miss 0; the 9 also verbatim with the leading "…"). Extra scratchpad scripts: `extra.mjs` (shortened count, old-wording greps, `[[jp:]]` origin), `tgt_run.mjs` (before → after LCS / Dice / ed / win12 against one cited question per field), `xgrep.mjs` (topic-wide field grep for the cross-unit check, §X). `mask.mjs` / `mask_run.mjs` / `qcite.mjs` were copied but not used (every cited question here is in topic technology-20-52, so `d198.mjs` / `tgt_run.mjs` cover them). One trial copy of u03 (`b68rv/u03_L3zh_trial.json`, §U3.3) was written in the scratchpad only. No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b68 + b69)
- Scope: the B3 wording patches for 6 units. **46 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (マルチメディアの基礎・配信・権利保護) | PASS, 建議修 L1 / L2 / L3 / L10 / L11 | p01–p09 | L1 → p01–p03 (`terms[4](デコード).one_*`); L2 → p04 (`terms[5](ストリーミング).fig.data.nodes[0].label.en`); L3 → p05–p06 (`terms[7](CPRM).points[0].text_zh/en`); L10 → p07 (`overview_rows[2].one_line_en`); L11 → p08–p09 (`terms[6](DRM).detail_zh/en`) | 4/9 (p01, p03, p08, p09) |
| u02 (音声のデジタル表現とファイル形式) | PASS, 建議修 L1–L3 | p01–p08 | L1 → p01–p03 (`pairs[0].rows[2].a_*`); L2 → p04–p06 (`terms[4](AAC).points[0].text_*`); L3 → p07–p08 (`terms[2](WAV).detail_jp/zh`; en unchanged per Rule A) | 0/8 |
| u03 (静止画のデータ表現方式) | PASS, 建議修 L1–L3 | p01–p11 | L1 → p01–p03 (`terms[1](ビットマップデータ).points[0].text_*`), p04–p06 (`key_points_*[1]`); L2 → p07–p09 (`terms[0](ラスターデータ).fig.steps[1].caption_*`); L3 → p10 (`terms[2](ベクターデータ).one_en`), p11 (`terms[2].analogy_en`). **L3 zh (`terms[0].detail_zh` 锯齿现象 → 锯齿) not adopted** (§U3.3) | 7/11 (p01–p03, p07–p09, p11) |
| u04 (静止画・文書のファイル形式) | PASS, 建議修 L1–L4 | p01–p10 | L1 → p01–p03 (`terms[1](GIF).analogy_*`); L2 → p04 (`terms[2](PNG).points[0].text_en`); L3 → p05–p07 (`terms[3](BMP).points[0].text_*`); L4 → p08–p10 (`terms[6](PDF).points[0].text_*`) | 1/10 (p04) |
| u05 (動画の仕組みとファイル形式) | PASS, 建議修 L1 / L2 | p01–p04 | L1 → p01–p03 (`terms[2](MPEG).detail_*`, one sentence appended); L2 → p04 (`terms[5](AVI).detail_en`) | 4/4 |
| u06 (データ圧縮の方式と特徴) | **FAIL M1**, 建議修 L8 | p01–p04 | M1 → p01–p03 (`terms[3](非可逆圧縮).points[1].text_*`, exam, 2013h25h-q079); L8 → p04 (`pairs[0].rows[2].label_en`) | 3/4 (p01–p03) |

  Every MEDIUM and every 建議修 is covered, except the one zh sub-item of u03 L3 that the main session chose not to adopt (§U3.3). 記録のみ LOWs (u01 L4–L9, u02 L4–L9, u03 L4–L6, u04 L5–L7, u05 L3–L12, u06 L1–L7) and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **19 of 46** (`before` / `after` are phrases inside the Rule A strings; counted by script as patch `before` ≠ `ra.json` before). `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **46/46**, so all shortened patches give the same result as the Rule A strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-20-52-u01/parts/b68-u01-a2/technology-20-52-u01.loc.r0.json` `9c862ff511770a1d…`
  - u02 `.../technology-20-52-u02/parts/b68-u02-a2/technology-20-52-u02.loc.r1.json` `e5f6d1ecc565b7fb…`
  - u03 `.../technology-20-52-u03/parts/b68-u03-a1/technology-20-52-u03.loc.r0.json` `9aa30f66b7dc8905…`
  - u04 `.../technology-20-52-u04/parts/b68-u04-a1/technology-20-52-u04.loc.r0.json` `b3bac1b9c046145e…`
  - u05 `.../technology-20-52-u05/parts/b68-u05-a2/technology-20-52-u05.loc.r1.json` `65c036ed9a659393…`
  - u06 `.../technology-20-52-u06/parts/b69-u06-a1/technology-20-52-u06.loc.r0.json` `be04cfc3d89669c6…`
- Merged units (current) `data/ip/textbook/units/technology-20-52-u0N.json` sha256: u01 `b01bcf2f43f162d3…`, u02 `9bd92d439c05d09b…`, u03 `6af790f80974377a…`, u04 `5291cf716d83482f…`, u05 `6bbaa4bbdd996edd…`, u06 `0274a8b7ff79cd6f…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b67_patch_rereview.md` §0 (no unit-level patches in this batch). All 6 units share topic technology-20-52 (20 questions), so there are 100 source strings per language.

1. **Application check** (`b68rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b68rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b68rv/d198.mjs`, all 46 patches): whole-field LCS before → after and LCS of the `after` span against the 100 sources per language; jp also 12-char windows (unmasked / masked) and Dice. Plus `b68rv/tgt_run.mjs` (before → after against one named question): u06 `points[1]` vs 2013h25h-q079 stem and エ; u05 `detail_jp` vs 2009h21h-q078 stem / イ and 2013h25h-q079 stem; u01 `terms[4].one_jp` vs 2015h27a-q046 イ; u02 `pairs[0].rows[2].a_jp` vs 2012h24h-q064 ウ; u02 `terms[4].points[0]` vs 2009h21h-q078 イ; u03 `points[0]` / `key_points_jp[1]` vs 2016h28a-q078 stem; u04 GIF analogy vs 2018h30a-q086 ア; u04 BMP `points[0]` vs 2016h28a-q078 stem; u06 zh / en vs q079 stem and choices.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json`: 2013h25h-q079 (エ MPEG: compression method for video data or audio data; wrong ア BMP / イ GIF / ウ JPEG), 2009h21h-q078 (イ MP3 = audio compression format; wrong エ = digital video), 2018h30h-q084 (イ CPRM), 2015h27a-q046 (イ DRM), 2016h28a-q078 (ア 1/12), 2018h30a-q086 (ア GIF), 2012h24h-q064 (ウ MIDI).
5. **Cross-unit checks (key check of this batch)**: read u01〜u06 together in three languages on (a) what MPEG covers, (b) lossless / lossy and decode / 復号 terminology, (c) 伸長 aliases, plus the BMP capacity hedge (u03 L1 ↔ u04 L3) and MP3 ↔ MPEG (u02 hook ↔ u05 L1 ↔ u06) (§X).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording and a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b67): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 156 / u02 108 / u03 86 / u04 145 / u05 136 / u06 148) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-52-u01   → ✓ 0 issues               EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-20-52-u01   → ✓ 34 locations, 0 diff   EXIT=0
$ ... validate --unit technology-20-52-u02 → ✓ 0 issues  EXIT=0 | parity → ✓ 24 locations, 0 diff  EXIT=0
$ ... validate --unit technology-20-52-u03 → ✓ 0 issues  EXIT=0 | parity → ✓ 20 locations, 0 diff  EXIT=0
$ ... validate --unit technology-20-52-u04 → ✓ 0 issues  EXIT=0 | parity → ✓ 29 locations, 0 diff  EXIT=0
$ ... validate --unit technology-20-52-u05 → ✓ 0 issues  EXIT=0 | parity → ✓ 31 locations, 0 diff  EXIT=0
$ ... validate --unit technology-20-52-u06 → ✓ 0 issues  EXIT=0 | parity → ✓ 30 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 loc#0 counts {"terms":8,"figs":4,"steps":8,"points":8,"pairs":3,"key_points":4,"goals":3}  sha256 9c862ff511770a1d…  ✓ 0 issues  EXIT=0
  u02 loc#1 counts {"terms":5,"figs":2,"steps":4,"points":6,"pairs":2,"key_points":4,"goals":3}  sha256 e5f6d1ecc565b7fb…  ✓ 0 issues  EXIT=0
  u03 loc#0 counts {"terms":3,"figs":2,"steps":6,"points":4,"pairs":1,"key_points":4,"goals":3}  sha256 9aa30f66b7dc8905…  ✓ 0 issues  EXIT=0
  u04 loc#0 counts {"terms":7,"figs":2,"steps":4,"points":9,"pairs":3,"key_points":5,"goals":3}  sha256 b3bac1b9c046145e…  ✓ 0 issues  EXIT=0
  u05 loc#1 counts {"terms":7,"figs":3,"steps":8,"points":8,"pairs":3,"key_points":4,"goals":3}  sha256 65c036ed9a659393…  ✓ 0 issues  EXIT=0
  u06 loc#0 counts {"terms":6,"figs":5,"steps":7,"points":9,"pairs":2,"key_points":5,"goals":3}  sha256 be04cfc3d89669c6…  ✓ 0 issues  EXIT=0
  (all 6 sha256 = base_sha256 of every patch in that unit; warn lines 0 in all 12 validate runs)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 9 ok 9   | issues [] | changed base-present = 9 patched + 'stage'  | unexplained besides 'stage' 0 | derived 84, mismatch 0 | memory_hooks 24 bad 0, lens 8/8/8
  u02 active 8 ok 8   | issues [] | changed base-present = 8 patched + 'stage'  | unexplained 0 | derived 54, mismatch 0 | memory_hooks 15 bad 0, lens 4/4/4
  u03 active 11 ok 11 | issues [] | changed base-present = 11 patched + 'stage' | unexplained 0 | derived 39, mismatch 0 | memory_hooks 9 bad 0,  lens 3/3/3
  u04 active 10 ok 10 | issues [] | changed base-present = 10 patched + 'stage' | unexplained 0 | derived 78, mismatch 0 | memory_hooks 21 bad 0, lens 7/7/7
  u05 active 4 ok 4   | issues [] | changed base-present = 4 patched + 'stage'  | unexplained 0 | derived 72, mismatch 0 | memory_hooks 21 bad 0, lens 6/6/6
  u06 active 4 ok 4   | issues [] | changed base-present = 4 patched + 'stage'  | unexplained 0 | derived 69, mismatch 0 | memory_hooks 18 bad 0, lens 6/6/6
  base sha = base_sha256 for all 46; before count in base = 1 for all 46; replay mismatch 0
  base-only top keys (all 6): stage / round / jp_round (part metadata)
  net before remnant: 0 for 46/46 (raw and inline-stripped)
  bold counts unchanged in all 46; [[jp:]] counts unchanged in all 46
  derived followers (all true): u01 definition_jp/zh/en of terms[4] (p01–p03), explanation_zh/en of terms[6] (p08–p09);
      u02 explanation_jp/zh of terms[2] (p07–p08); u03 definition_en of terms[2] (p10), summary.key_points_*[1] (p04–p06);
      u05 explanation_jp/zh/en of terms[2] (p01–p03), explanation_en of terms[5] (p04)
  ruleA verbatim miss: [] in all 6 units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 46/46 (u01 9/9, u02 8/8, u03 11/11, u04 10/10, u05 4/4, u06 4/4)
  base.replace(Rule A before, Rule A after) == unit field: 46/46 true
raverb.mjs: 92 Rule A strings, verbatim miss 0
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 16 kinds miss 0 | u02 8 | u03 3 | u04 6 | u05 5 | u06 11 — miss 0 in all
D-200 (patched 考点, jp chars without spaces / sentences): u01 terms[7].points[0] (zh/en only patched; exam, 2018h30h-q084) jp 63 / 1;
  u02 terms[4].points[0] (p04, mix) 71 / 1; u03 terms[1].points[0] (p01, exam, 2016h28a-q078) 77 / 2; u04 terms[3].points[0] (p05, mix) 63 / 2;
  u04 terms[6].points[0] (p08, mix) 60 / 1; u06 terms[3].points[1] (p01, exam, 2013h25h-q079) 48 / 1. All ≤100 / ≤2.
grep in the units (old wording, expect 0):
  u01 "bit by bit" 0 / "严格按照" 0 / "strictly under" 0 / "get recorded" 0 / "images and sound included" 0 / "都采用技术保护" 0 / "online rely on" 0;
      "ともいう。" 2 (= terms[3](エンコード).one_jp 「符号化 ともいう。」 + definition_jp, not the decode field)
  u02 "再生する機器によって変わらない" 0 / "不因播放设备" 0 / "regardless of the playback device" 0 / "圧縮で情報を捨てない" 0 / "不会因压缩而舍弃" 0 /
      "、違いは同じ" 0 / "，区别在于" 0 / "the difference lies" 0
  u03 "値を1つずつ" 0 / "各保存一个" 0 / "one value for color" 0 / "curves and fills that connect" 0 / "such as draw a line" 0;
      "锯齿（**锯齿现象**）" 1 (terms[0].detail_zh, the non-adopted L3 zh item, §U3.3)
  u04 "決まった 256 本" 0 / "固定的 256" 0 / "fixed set of 256" 0 / "far better" 0 / "より大きくなる。" 0 / "它比压缩格式更大" 0 / "it is larger than" 0 /
      "複数ページの文書" 0 / "多页文档" 0 / "multi-page documents" 0
  u05 "Windows. It does not fix" 0; new sentence present: "音声だけの規格" / "只针对音频" / "audio-only standards" 2 each (detail + explanation)
  u06 "動画とその音声" 0 / "视频及其声音" 0 / "video and its audio" 0 / "Suited data" 0 / "方式标准" 0
  topic-wide (u01〜u06): "動画とその音声" 0 / "视频及其声音" 0 / "video and its audio" 0
```

No validate warns in any of the 6 units (unit or part). `stage` meta is removed in all 6 units (as in b19–b67).

**Application.** All 46 `before` strings occur exactly once in their base field, all 46 `after` strings are present, and replay reproduces every patched field. Net `before` remnants are 0 for all 46 (several `after` strings contain their `before` — u03 p01–p06, u05 p01–p03, u02 p04–p06 — and the script subtracts those). 19 are shortened phrases of the Rule A strings; all 46 give exactly the Rule A after text (same.mjs 46/46).

## U1. technology-20-52-u01 (Rule A PASS, 建議修 L1 / L2 / L3 / L10 / L11)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → 4 (データを, 2011h23a-q089 stem) | 2; win12 0/0 → 0/0; Dice 0.15 → 0.12 |
| p02 | zh | 2 → **3** (的处理, 2011h23a-q089 stem) | 3 (same) |
| p03 | en | 10 → 10 (" the same ", 2010h22a-q085 stem) | 10 (same) |
| p04 | en | 5 → **7** (" small ", 2009h21a-q080 ウ) | 7 (same) |
| p05 | zh | 8 → 8 (的著作权保护技术, 2018h30h-q084 stem, unchanged text) | 2 |
| p06 | en | 33 → 33 (" copyright protection technology ", q084 stem, unchanged text) | " to be copied " (14) |
| p07 | en | 12 → **13** ("n, including ", 2011h23a-q090 stem) | 13 (same) |
| p08 | zh | 4 → 4 (数字数据, unchanged) | 2 |
| p09 | en | 13 → 13 ("igital data c", unchanged) | " protection" (11) |

- **Rises**: p02 +1 (的处理, a generic particle + noun), p04 +2 (the word " small "), p07 +1 (", including "). None carries a question's frame or element order.
- **Targeted** (`tgt_run.mjs`): `terms[4].one_jp` vs 2015h27a-q046 イ (DRM, the nearest exam question that mentions encryption): LCS 1 → 1, Dice 0.00 → 0.00, ed 0.91 → 0.92, win12 0/0. p06 (CPRM en) vs q084 stem: the 14-char span " to be copied " is a common phrase; the old frame ("makes … get recorded strictly") is gone and the 33-char LCS is the unchanged term description.

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[4](デコード).one_*` (+ definition_*) | L1 | Yes: 「**復号** ともいう (暗号を解く意味の「復号」とは別の処理)」/「日语中也称作 [[jp:復号]]（但在密码学中这个词指“解密”，是不同的处理）」/ "…also called [[jp:復号]], though in cryptography the same word means decryption, a different process." The alias is kept, and it now says the cryptographic 復号 (technology-23-63-u06: 暗号文を鍵で平文に戻す; zh_terms 復号 → 解密) is a different process. So the pair with the エンコード 考点 (暗号化 needs a key / エンコード does not) no longer suggests 「復号 = 鍵不要」. jp does not use the undefined word 暗号文 (as Rule A asked). One sentence each; bold 2/1/1 and `[[jp:]]` 0/2/2 unchanged | No | OK |
| p04 | `terms[5](ストリーミング).fig.data.nodes[0].label.en` | L2 | Yes: "Sender sends in small pieces" = jp 「少しずつ送る」/ zh 「一点点发送」; the "1 bit at a time" reading is gone. The other 3 nodes (Receiver holds a little / Play from what is held / Receive the rest while playing) read in the same register | No | OK |
| p05–p06 | `terms[7](CPRM).points[0].text_zh/en` (exam, 2018h30h-q084) | L3 | Yes: zh 「会让设备按照该条件进行录制」/ en "ensures content permitted to be copied only once is recorded in line with that condition" = jp 「その条件どおりに記録させる」; the added emphasis (严格 / strictly) and the make + get nesting are gone. 「例えば」/「例如」/ "for example" still keeps CPRM from being limited to copy-once; q084 イ still supported | No | OK |
| p07 | `overview_rows[2](ハイパーメディア).one_line_en` | L10 | Yes: "links information, including images and sound, so users can move back and forth between it" = jp 「画像や音声も含む情報をリンクで結び、利用者が行き来して見られる」 | No (Obs. 3) | OK |
| p08–p09 | `terms[6](DRM).detail_zh/en` (+ explanation_*) | L11 | Yes: 「通常采用技术保护」/ "often rely on technical protection" = jp 「技術による保護が使われる」 (tendency, not "all"). The second sentence (例えば…) is unchanged | No | OK |

### U1.3 Focused checks

- L1 vs the encoding 考点 (`terms[3].points[0]`, unchanged): 暗号化 = secrecy, needs a key; エンコード = no key, back to the original form. After p01–p03 the decode one says that the cryptographic 復号 is a different thing, so the two senses are separated in all three languages. No field in u01〜u06 uses 復号 in the cryptographic sense (§X (b)).
- No 考点 claim changed (p05–p06 change only zh / en strength). Parity 34 / 0 diff. **u01: L1 / L2 / L3 / L10 / L11 resolved.**

## U2. technology-20-52-u02 (Rule A PASS, 建議修 L1–L3)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 3 → **4** (のデータ, 2015h27h-q076 エ) | 4 (same); win12 0/0 → 0/0; Dice 0.13 → 0.12 |
| p02 | zh | 3 → 3 (记录的, 2016h28a-q078 stem) | 3 |
| p03 | en | 15 → 9 (" data as ", 2012h24a-q095 stem) | 9 |
| p04 | jp | 7 → 7 (" MP3 はど", 2009h21h-q078 stem, unchanged text) | データ量 (4); win12 0/0 → 0/0; Dice 0.15 → 0.13 |
| p05 | zh | 5 → 5 (" MP3 ", unchanged) | 数据量 (3) |
| p06 | en | 19 → 19 (" compression format", 2009h21h-q078 ア, unchanged text) | " quality" (8) |
| p07 | jp | 5 → 5 (ファイルの, unchanged) | しないので (5); win12 0/0 → 0/0; Dice 0.18 → 0.17 |
| p08 | zh | 3 → 3 (文件的, unchanged) | 编辑 (2) |

- **Rise**: p01 +1 (の + データ). p03 drops (15 → 9; the old " regardless of " is gone). Targeted: `pairs[0].rows[2].a_jp` vs 2012h24h-q064 ウ LCS 0 → 0, Dice 0.00 → 0.00; `terms[4].points[0].text_jp` vs 2009h21h-q078 イ LCS 3 → 3, Dice 0.08 → 0.07, ed 0.93 → 0.94.

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `pairs[0].rows[2].a_*` (PCM / MIDI, 再生される音) | L1 | Yes: 「記録した波形のデータどおりに鳴り、音源の違いに左右されない」/「按记录的波形数据发声，不受音源不同的影响」/ "Plays back the recorded waveform data as is, unaffected by which sound source is used". The claim is now about the sound source, not the playback device, and it is the exact opposite of the b cell 「受け取った側の音源によって変わる」/ "Changes with the receiver's sound source". 音源 is defined earlier in the MIDI detail (音を作り出す装置やソフトウェア). Key row (rows[0]) unchanged | No | OK |
| p04–p06 | `terms[4](AAC).points[0].text_*` (mix) | L2 | Yes: 「使ううえでの主な違いは…」/「使用上的主要区别在于…」/ "the main practical difference lies in…" — no longer says that sound quality per data size is the only difference, so it agrees with the AAC detail (MPEG-2 / MPEG-4) and the MP3 hook (MPEG-1). 「なりやすい」 hedge kept; 71 chars, 1 sentence | No | OK |
| p07–p08 | `terms[2](WAV).detail_jp/zh` (+ explanation_*) | L3 | Yes: 「圧縮しないので情報が捨てられず…」/「因为不经压缩，信息不会被舍弃…」 = en "Because it is not compressed, no information is discarded" (unchanged). The reading "WAV compression keeps the information" is gone; agrees with WAV one 「圧縮せずに収める」 and the tree (圧縮しない: WAV) | No | OK |

### U2.3 Focused checks

- Not a 考点 except p04–p06 (mix, no qid). Bold and `[[jp:]]` counts unchanged. Parity 24 / 0 diff. **u02: L1–L3 resolved.**

## U3. technology-20-52-u03 (Rule A PASS, 建議修 L1–L3)

### U3.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 6 → 6 (ビットマップ, 2021r03-q087 ウ, term name) | 6; win12 0/0 → 0/0; Dice 0.23 → 0.22 |
| p02 | zh | 5 → 5 (的情况下，, unchanged) | 不压缩 (3) |
| p03 | en | 10 → **20** ("ithout compression, ", 2011h23a-q089 stem) | 20 (same) |
| p04 | jp | 6 → 6 (term name) | のビット (4); win12 0/0 → 0/0; Dice 0.18 → 0.17 |
| p05 | zh | 5 → 5 (每个像素的, 2016h28a-q078 stem, unchanged) | 5 |
| p06 | en | 13 → 13 (" the pixel co", unchanged) | 13 |
| p07 | jp | 3 → 3 (画像を) | の値を (3); win12 0/0 → 0/0; Dice 0.17 → 0.19 |
| p08 | zh | 5 → 5 (来表示图像, unchanged) | 颜色 (2) |
| p09 | en | 22 → 22 (" color and brightness ", 2013h25a-q061 イ, unchanged words) | 22 |
| p10 | en | 22 → 22 (" information such as t", unchanged) | "onnect the" (10) |
| p11 | en | 13 → 13 (" this point t", unchanged) | 13 |

- **Rise**: p03 +10 is the phrase "Without compression, " that L1 adds on purpose; 2011h23a-q089 is a different (compression-rate) question and the phrase carries no frame. p07 Dice +0.02 (vs 2013h25a-q061 イ, the correct option that says color and brightness are set per pixel — the caption describes the same correct content and lost a word). Targeted vs 2016h28a-q078 stem: `points[0]` LCS 4 → 4, Dice 0.23 → 0.22, ed 0.85 → 0.86; `key_points_jp[1]` LCS 4 → 4, Dice 0.18 → 0.17, ed 0.85 → 0.87; win12 0/0.

### U3.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[1](ビットマップデータ).points[0].text_*` (exam, 2016h28a-q078) | L1 | Yes: 「圧縮しない**ビットマップデータ**の容量は「画素数 × 1画素のビット数」で決まる」/「不压缩时，…」/ "Without compression, …". The formula is now scoped to uncompressed data, like u04 BMP (「基本的に圧縮せず」「ほぼ決まる」). q078 is an uncompressed calculation, so ア 1/12 is still reached; the limit 「1画素のビット数が同じなら」 is kept. 77 chars, 2 sentences | No | OK |
| p04–p06 | `key_points_*[1]` (+ summary.key_points_*[1]) | L1 | Yes: 「圧縮しない場合の容量は…」/「不压缩时的容量…」/ "its uncompressed size is…" — same scope as p01–p03 | No | OK |
| p07–p09 | `terms[0](ラスターデータ).fig.steps[1].caption_*` | L2 | Yes: 「マス目ごとに色と明るさの値を持たせて」/「每个方格都保存颜色和亮度的值」/ "Give every square its color and brightness values" — the "one value each / one value for both" ambiguity is gone; agrees with one 「画素ごとに色の値を記録」 and with q061 イ | No | OK |
| p10 | `terms[2](ベクターデータ).one_en` (+ definition_en) | L3 | Yes: "the lines and curves that connect them and the fills inside them" = jp 「それを結ぶ線や曲線・塗りつぶし」; fills are no longer something that "connects" points | No | OK |
| p11 | `terms[2].analogy_en` | L3 | Yes: the instruction is now quoted (“draw a line from this point to that one,”) | No | OK |

### U3.3 Focused checks — L3 zh not adopted

- **Confirmed**: the patch file has **no** patch on `terms[0].detail_zh` and no patch whose `before` / `after` contains 锯齿 (script: 0 of 11). `terms[0].detail_zh` is byte-identical to the base (「…阶梯状的锯齿（**锯齿现象**）。」), bold count of the field 2 → 2, unit-wide bold total 69 → 69 (base vs unit), `explanation_zh` follows. The session log (S151 b68) records the non-adoption.
- The session log gives "太字数が変わる" as the reason. A scratch trial (`b68rv/u03_L3zh_trial.json`: the Rule A L3 zh after applied, explanation_zh regenerated) gives bold 2 → 2 in that field (the bold moves from 锯齿现象 to 锯齿), validate --file 0 issues and parity 20 / 0 diff. So the per-field count would not change; the stated reason is imprecise. Not adopting it is still acceptable: the current zh bolds the parenthetical term, which is how jp bolds 「ギザギザ(**ジャギー**)」, and the left-over item is only the 锯齿 / 锯齿现象 repetition, a 記録のみ-level LOW (Obs. 4). No defect follows.
- Parity 20 / 0 diff. **u03: L1, L2 and the two en items of L3 resolved; L3 zh left as recorded.**

## U4. technology-20-52-u04 (Rule A PASS, 建議修 L1–L4)

### U4.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 3 → 3 (なもの) | 256 (3); win12 0/0 → 0/0; Dice 0.06 → 0.06 |
| p02 | zh | 3 → 3 (的颜色) | 256 (3) |
| p03 | en | 10 → 10 (" with the ") | "with a c" (8) |
| p04 | en | 12 → 12 (" each pixel ", unchanged) | "to the " (7) |
| p05 | jp | 7 → 7 (ファイル容量は, 2013h25a-q061 ウ, unchanged) | 圧縮形式 (4); win12 0/0 → 0/0; Dice 0.21 → 0.21 |
| p06 | zh | 4 → 4 (压缩格式) | 4 |
| p07 | en | 15 → 15 (" the number of ", unchanged) | " compressed " (12) |
| p08 | jp | 5 → 4 (の形式で) | 4; win12 0/0 → 0/0; Dice 0.11 → 0.08 |
| p09 | zh | 3 → 3 (的格式) | 3 |
| p10 | en | 9 → 9 ("s as a co", unchanged) | ", and it" (8) |

- No rises. Targeted: GIF analogy vs 2018h30a-q086 ア LCS 0 → 0, Dice 0.00 → 0.00; BMP `points[0]` vs 2016h28a-q078 stem LCS 4 → 4, Dice 0.12 → 0.11, ed 0.89 → 0.92.

### U4.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[1](GIF).analogy_*` | L1 | Yes: 「選んだ 256 本までの色鉛筆だけで」/「只用挑好的最多 256 支彩色铅笔」/ "a chosen set of up to 256 colored pencils" = detail 「使う色をあらかじめ 256 色以内の色の一覧 (パレット) にまとめ」 (palette chosen per image, at most 256). The rest of the analogy (photos only approximated) still matches `points[1]` | No | OK |
| p04 | `terms[2](PNG).points[0].text_en` | L2 | Yes: "…blend smoothly into the background better" = jp 「PNG のほうが得意である」 | No | OK |
| p05–p07 | `terms[3](BMP).points[0].text_*` (mix) | L3 | Yes: 「大きくなりやすい」/「往往…更大」/ "usually larger" = BMP detail 「ファイルは大きくなりやすい」. The first sentence (「ほぼ決まる」) is unchanged; 63 chars, 2 sentences | No | OK |
| p08–p10 | `terms[6](PDF).points[0].text_*` (mix) | L4 | Yes: 「**PDF** は文書を完成形のまま配って読むための形式で、複数ページもまとめられる」 — single-page PDFs are no longer excluded; matches `pairs[2].rows[1].b` 「複数ページをまとめられる」/ "Can combine many pages". The EPS half (他の文書に貼り込む図版用) is unchanged; 60 chars, 1 sentence | No | OK |

### U4.3 Focused checks

- BMP after p05–p07 and u03 after p01–p06: u03 「圧縮しない…容量は…決まる」, u04 「基本的に圧縮せず」「ほぼ決まる」「大きくなりやすい」 — same scope, no conflict (§X). Parity 29 / 0 diff. **u04: L1–L4 resolved.**

## U5. technology-20-52-u05 (Rule A PASS, 建議修 L1 / L2)

### U5.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 5 → **6** (" MP3 は", 2009h21h-q078 stem) | 6 (same); win12 0/0 → 0/0; Dice 0.14 → 0.12 |
| p02 | zh | 5 → 5 (" MP3 ", q078 stem) | 5 (same) |
| p03 | en | 18 → 18 (" file format that ", 2018h30a-q086 stem, unchanged text) | 18 |
| p04 | en | 21 → 21 (" video and audio data", 2015h27a-q046 ア, unchanged text) | "ows, and " (9) |

- **Rise**: p01 +1 is the term name MP3 + particle. Targeted (`tgt_run.mjs`) for the new sentence: `detail_jp` vs 2009h21h-q078 stem LCS 4 → 5, Dice 0.10 → 0.12, ed 0.94 → 0.91; vs q078 イ (正答) LCS 4 → 4, Dice 0.12 → 0.10; vs 2013h25h-q079 stem LCS 3 → 3, Dice 0.09 → 0.08; win12 0/0 in all. The sentence names a fact (MP3 comes from the MPEG-1 audio standard), not a choice's wording.

### U5.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[2](MPEG).detail_*` (+ explanation_*) | L1 | Yes: appended 「音声だけの規格も含まれ、例えば MP3 は MPEG-1 の音声の規格から生まれた形式である。」/「其中也包括只针对音频的标准，例如 MP3 就是由 MPEG-1 的音频标准而来的格式。」/ "The family also includes audio-only standards; MP3, for example, comes from the audio part of MPEG-1." This blocks the 「MP〜 = 動画」 reading of the hook (Moving Picture) + MP4 for challenge 2009h21h-q078 (正答 イ = audio; wrong エ = digital video). Fact check: MP3 = MPEG-1 Audio Layer III — the same fact as u02 MP3 hook (「MPEG-1 Audio Layer-3 の略で、映像と音声の圧縮規格 MPEG の音声部分から生まれた」). Detail is now 3 sentences in all 3 languages (Rule A: within limit); bold 0 → 0. MP3 is u02's headword (u02 precedes u05), so no definition-before-use | No (Obs. 5) | OK |
| p04 | `terms[5](AVI).detail_en` (+ explanation_en) | L2 | Yes: "…created for Windows, and it does not fix which coding method the video inside must use." — 2 sentences = jp / zh | No | OK |

### U5.3 Focused checks

- §2-1 of the u05 Rule A (13 MPEG fields, all "compression methods at the centre, file-format parts included, video and audio") still holds; the new sentence adds that the family includes audio-only parts, which agrees with `points[0]` (映像の圧縮方式と音声の圧縮方式の両方を含む規格群) and with u02 AAC detail (MPEG-2 / MPEG-4 の一部). No 考点 touched. Parity 31 / 0 diff. **u05: L1 / L2 resolved.**

## U6. technology-20-52-u06 (Rule A FAIL M1, 建議修 L8)

### U6.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 6 → **9** (データを圧縮する方, 2012h24a-q094 stem) | 9 (same); win12 0/0 → 0/0; Dice 0.22 → **0.28** (now vs 2013h25h-q079 stem) |
| p02 | zh | 4 → **6** (或音频数据的, 2013h25h-q079 stem) | 6 (same) |
| p03 | en | 19 → **23** (" video and audio data, ", 2015h27a-q046 ア) | 22 (same) |
| p04 | en | 7 → 6 ("ed for") | 6 |

- **Rises**: these are the M1 content itself. 2013h25h-q079's stem is one short question phrase that asks for the compression method of video or audio data; M1 asks the 考点 to keep exactly that scope, so the new 考点 states the correct answer's content (D-209 「正答の内容を定義として述べる」). Targeted (`tgt_run.mjs`) vs q079 stem: jp LCS 3 → 3 (や音声), Dice 0.16 → 0.28, ed 0.88 → **0.78**, win12 0/0 (far from the HIGH calibration Dice 0.52 / ed 0.14); vs q079 エ (MPEG) LCS 4 → 4 (the term), Dice 0.13 → 0.13. zh vs q079 stem LCS 2 → 6, en 13 → 13 (" compression "). The 考点 does not list or order the choices (BMP / GIF / JPEG are not named), and its wording is u05's own (`terms[2].one_jp` 「映像や音声のデータを圧縮する方式を中心とした規格群」), as Rule A noted. p02 / p03 spans: 2012h24a-q094 is a run-length question and 2015h27a-q046 ア is a wrong DRM option; both are generic noun phrases.

### U6.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[3](非可逆圧縮).points[1].text_*` (exam, 2013h25h-q079) | M1 | Yes (§U6.3) | No | OK |
| p04 | `pairs[0].rows[2].label_en` | L8 | Yes: "Best suited for" with values "Documents, programs" / "Photos, audio, video" reads as English; jp 「向いているデータ」 / zh 「适合的数据」 unchanged; other labels (Data after decompression / How much it can shrink / Example formats) consistent | No | OK |

### U6.3 Focused checks — M1 (MPEG no longer limited to "video and its audio")

- **After (三語)**: 「**MPEG** は映像や音声のデータを圧縮する方式の規格群で、非可逆圧縮によってデータ量を大きく減らす。」/「**MPEG** 是压缩视频或音频数据的方式的标准群，通过有损压缩（[[jp:非可逆圧縮]]）大幅减少数据量。」/ "**MPEG** is a family of standards for compressing video and audio data, and it uses lossy compression ([[jp:非可逆圧縮]]) to cut the data size sharply." Audio is no longer subordinate to video (「その音声」/「其声音」/ "its audio" 0 topic-wide), and 「規格」 → 「規格群」/「标准群」/ "family of standards" matches u05 one / points[0] / key_points[1] / goals[1].
- **vs 2013h25h-q079** (エ MPEG = compression method for video data or audio data): the 考点 now has the same scope (映像や音声のデータ); エ is still selected, and ア BMP / イ GIF / ウ JPEG (still-image formats) get no support. 48 chars, 1 sentence, qid kept; bold 1 / `[[jp:]]` 0 / 1 / 1 unchanged.
- **vs 2009h21h-q078** (`points[0]`, unchanged): MP3 = audio, lossy — still consistent; the MPEG 考点 does not take MP3 out of MPEG.
- The 2nd half (非可逆圧縮によって大きく減らす) is unchanged and agrees with `one` / detail / u05 (MPEG video compression = difference coding, lossy).
- Parity 30 / 0 diff. **u06: M1 and L8 resolved.**

## X. Cross-unit check — MPEG scope, compression / decode terminology, 伸長 aliases (u01〜u06, 三語)

| Axis | u01 | u02 | u03 | u04 | u05 | u06 (after patch) | Contradiction? |
|---|---|---|---|---|---|---|---|
| (a) What MPEG covers | — (not named) | MP3 hook: 「映像と音声の圧縮規格 MPEG の音声部分」; AAC detail: MPEG-2 / MPEG-4 の一部 | — | JPEG `points[0]`: 「**MPEG** は動画と音声の圧縮方式」 (+ 2nd sentence 止まった絵か動く映像か, u05 O2) | one: 映像や音声の圧縮方式を中心とした規格群; points[0]: 映像と音声の両方; detail: video difference coding, numbered standards, MPEG-4 file format, **+ audio-only parts / MP3 from MPEG-1 audio (p01–p03)**; MP4 = MPEG-4 Part 14 container | `points[1]`: 映像や音声のデータを圧縮する方式の規格群; detail: 「写真の JPEG、音声の **MP3**、動画の **MPEG** が代表的な形式」; key_points[2]: 「音声の MP3、動画の MPEG がその例」 | No — every unit now includes audio in MPEG; codecs (u05 / u06) and, for MPEG-4, the file format (u05 detail / MP4) are covered; no field says MPEG is video only |
| (b1) lossless / lossy | 可逆 = 伸長で完全に戻る / 非可逆 = 一部を捨てる (デコード `points[0]`); 无损 / 有损; lossless / lossy | MP3 points[1]: 非可逆 = 完全には戻らず、ZIP のような可逆は完全に戻る | 「圧縮しない」 only (p01–p06) | JPEG 非可逆, GIF / PNG 可逆, BMP 基本は無圧縮 | H.265 「再生 (伸長)」 only | 可逆 one: 完全に元どおり; 非可逆 one: 完全には戻らない | No — jp 可逆 / 非可逆, zh 无损压缩 / 有损压缩, en lossless / lossy compression in all units (no 不可逆 / reversible variant except u06 可逆 hook_en, which explains the jp word as "reversible" and links it to "lossless") |
| (b2) decode / 復号 | デコード = 元の形式へ戻す, 別名 復号, **cryptographic 復号 marked as a different process (p01–p03)**; zh 解码, en decoding | — | — | — | — | — | No — 復号 appears only in u01; no field in the topic uses 復号 for decryption. Cross-topic: technology-23-63-u06 復号 = 鍵で平文に戻す (zh 解密 / en Decryption), which is what u01 now names as the other sense |
| (c) 伸長 aliases | detail: 「**伸長** (解凍)」; zh 解压缩; en decompression | MP3 detail: 「**伸長** (元の形式に戻す処理)」; zh 解压 ([[jp:伸長]]); en decompressed | — | — | 伸長 (H.265 detail, MP4 fig) | ZIP detail: 「**伸長** (展開)」; zh 解压缩 ([[jp:伸長]], 也叫[[jp:展開]]); en decompression ([[jp:伸長]], also [[jp:展開]]) | No — the jp head word is 伸長 everywhere; the aliases differ (u01 解凍 / u06 展開), both correct = u01 L9 (記録のみ), untouched by these patches. zh 解压 (u02) vs 解压缩 (others) is the same word |
| BMP / bitmap capacity | — | — | 「圧縮しない…容量は画素数 × 1画素のビット数で決まる」 (p01–p06) | 「基本的に圧縮せず」「ほぼ決まる」「大きくなりやすい」 (p05–p07) | — | PNG / GIF 可逆 (detail) | No — u03 and u04 now both scope the formula to uncompressed data and both hedge the size comparison |

- **(a) u05 O1 / u06 `terms[3].detail_jp`「動画の **MPEG**」 and `key_points_jp[2]`「動画の MPEG」 — main-session judgment confirmed.** Both are three-item (detail) / two-item (key_points) listings by medium, marked 「代表的な形式」 / 「その例」, with the same structure in zh (「视频的 **MPEG**」/「视频的 MPEG」) and en ("**MPEG** for video" / "MPEG for video"). They name a representative format for each medium; they do not say MPEG handles only video, and the same term's `points[1]` (after p01) says 映像や音声 in the next field the reader meets. Discriminating test: would a learner who reads only these two fields answer 2013h25h-q079 wrongly? No — q079 asks which of four formats compresses video or audio, and both fields still pick MPEG over the still-image formats; nothing in them supports BMP / GIF / JPEG. Nor do they contradict u05 (MPEG includes audio) — listing MP3 for audio next to MPEG for video is a list of format names, and u02 hook / u05 detail (after p01–p03) say where MP3 comes from. No new MEDIUM or LOW (Obs. 6).
- **u04 JPEG `points[0]`** (u05 O2, Rule A u04 PASS, not patched): 「MPEG は動画と音声の圧縮方式」 includes audio as an equal item (と, not その音声), so after u06 M1 it is not the restricted form; its 2nd sentence leans MPEG toward moving images. This is the earlier record-only point; no change in severity.
- **zh / en wording of the MPEG family**: u05 一系列标准 / family of standards, u06 标准群 / family of standards; u05 视频和音频, u06 视频或音频 (jp や covers both). Same meaning; not a defect (Obs. 7).
- u01〜u04 were not changed on axis (a); u05 / u06 changes widen MPEG to audio, which removes the only conflict (u06 vs u05 / q079). All other axes are unchanged by these patches except u01 (b2) and u03 / u04 (BMP), which become more consistent.

## 4. F-fix

No required F-fix in any of the 6 units. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: 0 warns in all 6 units (unit and part).
   - `stage` meta is removed in all 6 units (as in b19–b67).
   - ruleA verbatim miss = none. 19 of 46 patches use shortened phrases; same.mjs shows all 46 give the same field as the Rule A strings. 9 Rule A strings start with "…" and were used without it (§header).
   - net remnant 0 for all 46.
   - Bases: u01 `a2` / `loc.r0`, u02 `a2` / `loc.r1`, u03 `a1` / `loc.r0`, u04 `a1` / `loc.r0`, u05 `a2` / `loc.r1`, u06 `b69-u06-a1` / `loc.r0`. Patch paths in u01 / u03 / u04 carry labels (`terms[4](デコード)…`); they resolve in check.mjs / d198.mjs / same.mjs.
2. u01 `terms[3](エンコード).one_jp` still ends 「**符号化** ともいう。」 (the encode alias); it is correct and is not the L1 field.
3. u01 p07 en "…so users can move back and forth between it": "between it" is slightly odd for one mass noun ("information"). It is the text Rule A L10 prescribed and the meaning is clear. Not re-ruled.
4. u03 L3 zh (锯齿（**锯齿现象**） repetition) stays as recorded; the session-log reason "太字数が変わる" does not match a trial (count 2 → 2, validate 0, parity 0 diff, §U3.3). If u03 is touched again, the Rule A text could be adopted, or the reason corrected in the log; nothing requires it.
5. u05 detail is now 3 sentences in all three languages (the new sentence is about MPEG's audio parts). It names MP3 (u02's headword, defined earlier in the topic). Not a defect.
6. u06 detail / key_points list 「音声の MP3、動画の MPEG」 and call MPEG a 「形式」, while u05 separates 符号化方式 / 規格群 from コンテナ形式 (MP4). u06 uses 形式 loosely for JPEG / MP3 too (as everyday names of formats). Pre-existing, not touched, no learner-facing conflict with a cited question.
7. u06 zh `points[1]` 「标准群」 / 「视频或音频」 vs u05 「一系列标准」 / 「视频和音频」: same meaning, different words. Not a defect.
8. D-198 rises: u01 p02 +1, p04 +2, p07 +1; u02 p01 +1; u03 p03 +10 ("Without compression", the content L1 adds); u05 p01 +1 (MP3 + particle); u06 p01 +3 / p02 +2 / p03 +4 (the M1 content, vs q079 ed 0.88 → 0.78, Dice 0.28). All analysed in the per-unit §.1. Several patches lower overlap (u02 p03 15 → 9, u04 p08 5 → 4, u06 p04 7 → 6).

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-20-52-u01 | PASS | **9/9** | — | 0 / 0 / 0 | **PASS** |
| technology-20-52-u02 | PASS | **8/8** | — | 0 / 0 / 0 | **PASS** |
| technology-20-52-u03 | PASS | **11/11** (L3 zh not adopted, recorded) | — | 0 / 0 / 0 | **PASS** |
| technology-20-52-u04 | PASS | **10/10** | — | 0 / 0 / 0 | **PASS** |
| technology-20-52-u05 | PASS | **4/4** | — | 0 / 0 / 0 | **PASS** |
| technology-20-52-u06 | FAIL (M1) | **4/4** | M1 resolved (MPEG 考点 = 映像や音声のデータを圧縮する方式の規格群 / 视频或音频…标准群 / family of standards for video and audio data; matches 2013h25h-q079 and u05; 「その音声」 0 topic-wide) | 0 / 0 / 0 | **PASS** |

- **Application:** 46/46 exact (replay, part-level). 0 unexplained diffs, net `before` remnants 0, derived fields follow (396 checked, 0 mismatch), memory_hooks pairing 0 bad. 19/46 shortened, and all 46 give the same field as the Rule A string (same.mjs). Every MEDIUM and 建議修 is covered except u03 L3 zh (deliberately not adopted; LOW).
- **D-198:** no patch adds a meaningful overlap. The rises are generic phrases (u01 p02 / p04 / p07, u02 p01, u05 p01) or the content the fix adds on purpose (u03 "Without compression"; u06 M1 = the q079 scope in u05's words, ed 0.78, win12 0/0).
- **D-200:** patched 考点 u01 `terms[7].points[0]` (zh / en only), u02 `terms[4].points[0]` 71 / 1, u03 `terms[1].points[0]` 77 / 2, u04 `terms[3].points[0]` 63 / 2, `terms[6].points[0]` 60 / 1, u06 `terms[3].points[1]` 48 / 1; qids kept; no 考点 claim reversed. **D-202:** `[[jp:]]` origin miss 0 in all 6 units; bold / tag counts unchanged in all 46. **D-204 / 書き方 7:** u05 ↔ u06 MPEG scope no longer conflicts, u03 ↔ u04 BMP capacity scoped alike, u01 decode alias separated from cryptographic 復号, u02 PCM / MIDI row now a true opposite (§X). **D-205 / D-210:** no new law, standard version or numeric claim; u05 adds one factual standards claim (MP3 from MPEG-1 audio) that matches u02.
- **Gates:**
  - validate --unit ×6: 0 issues / EXIT 0 (0 warns)
  - validate --part ×6: 0 issues, sha256 = base_sha256 for each
  - parity ×6: 0 diff (34 / 24 / 20 / 29 / 31 / 30 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for all 6 units.** All 46 active patches are applied exactly, and the MEDIUM and every adopted 建議修 LOW are resolved in context in all three languages:
- u06 p01–p03: MPEG 考点 covers video and audio data as a family of standards, the same scope as 2013h25h-q079 and u05; p04 en label fixed.
- u05 p01–p03: MPEG detail says the family includes audio-only parts (MP3 from MPEG-1 audio = u02 hook); p04 en sentence count = jp / zh.
- u01 p01–p09: 復号 alias separated from decryption; en "bit by bit", zh / en CPRM and DRM over-strength, en overview row fixed.
- u02 p01–p08: PCM row now "unaffected by the sound source"; AAC difference is "the main practical" one; WAV jp / zh = "not compressed".
- u03 p01–p11: capacity formula scoped to uncompressed data (= u04); raster caption and two en items fixed; zh 锯齿 item left as recorded.
- u04 p01–p10: GIF palette analogy, PNG en strength, BMP "tends to be larger", PDF not limited to multi-page.

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
