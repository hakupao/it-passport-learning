# b70 B3 patch re-review — technology-17-45 u01〜u02 (OS の役割と基本機能、代表的な OS の種類)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the two Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b70rv/`: `check.mjs` / `d198.mjs` / `same.mjs` copied from `b67rv/` with only the unit map changed (2 units; u01 base attempt `a1` round `r0`, u02 `a1` / `r0`, topic technology-17-45). `same.mjs` reads the 28 Rule A before / after pairs from `b70rv/ra.json` (written by hand by `b70rv/mkra.mjs` from the Rule A tables); all 56 strings are confirmed verbatim in the Rule A files by script (u01 10/10, u02 46/46, miss 0). Extra scratchpad scripts: `extra.mjs` (shortened count, old-wording greps, `[[jp:]]` origin incl. the tags new in the patches, D-200), `tgt_run.mjs` (u01 `terms[1].points[1].text_jp` vs 2020r02o-q059 stem / ウ; u02 all 23 patched fields against the 8 OSS questions outside the topic: 2018h30a-q081 + technology-17-48 2021r03-q078 / 2024r06-q080 / 2017h29a-q100 / 2011h23tokubetsu-q074 / 2022r04-q063 / 2024r06-q097 / 2016h28h-q059). `mask_run.mjs` / `mask.mjs` / `qcite.mjs` / `q099b.mjs` were copied but not used. No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b70)
- Scope: the B3 wording patches for 2 units. **28 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (OS の役割と基本機能) | PASS, 建議修 L1–L3 | p01–p05 | L1 → p01–p03 (`terms[1](仮想記憶).points[1].text_*`); L2 → p04 (`terms[0](OS).points[1].text_zh`); L3 → p05 (`terms[2](ユーザー管理).hook_zh`) | 1/5 (p04) |
| u02 (代表的な OS の種類) | FAIL M1, 建議修 L1–L3 | p01–p23 | M1 ① → p01–p03 (`goals_*[2]`), ② → p04–p06 (`key_points_*[3]`), ③ → p07–p09 (`pairs[2].rows[1].b_*`, key 行), ④ → p10–p12 (`pairs[1].rows[1].b_*`), ⑤ → p13–p15 (`terms[5](iOS).points[0].text_*`), ⑥ → p16–p18 (`terms[6](Android).detail_*`); L1 → p19–p21 (`terms[4](Linux).detail_*`); L2 → p22 (`pairs[2].rows[2].a_en`); L3 → p23 (`pairs[1].rows[2].b_en`) | 9/23 (p01–p06, p13–p15) |

  Every MEDIUM and every 建議修 is covered. 記録のみ LOWs (u01 L4–L11, u02 L4–L11) and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **10 of 28** (`before` / `after` are phrases inside the Rule A strings; counted by script as patch `before` ≠ Rule A `before`). `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **28/28**, so all shortened patches give the same result as the Rule A strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-17-45-u01/parts/b70-u01-a1/technology-17-45-u01.loc.r0.json` `fb027d87b9b23eb1…`
  - u02 `.../technology-17-45-u02/parts/b70-u02-a1/technology-17-45-u02.loc.r0.json` `becefdc7e32c16c3…`
- Merged units (current) `data/ip/textbook/units/technology-17-45-u0N.json` sha256: u01 `5f2a72ff8616e28b…`, u02 `0c7e7135733b25d2…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b67_patch_rereview.md` §0 (no unit-level patches in this batch). Both units share topic technology-17-45 (18 questions), so there are 90 source strings per language. u02 M1 is about the OSS definition, whose questions sit in topic technology-17-48, so u02 was also measured against those (step 3).

1. **Application check** (`b70rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b70rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`, `overview.intro_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b70rv/d198.mjs`, all 28 patches): whole-field LCS before → after and LCS of the `after` span against the 90 topic sources per language; jp also 12-char windows (unmasked / masked) and Dice. Plus `b70rv/tgt_run.mjs`: u01 L1 field vs 2020r02o-q059 stem / stem + ウ / ウ (LCS, Dice, best-window ed, win12), and u02 every patched field vs the 8 OSS questions (40 strings per language; LCS, and for jp win12 / Dice / ed).
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json` (stem_jp_clean): 2020r02o-q059 (ウ 主記憶の増設; wrong ア CPU 交換 / イ 仮想記憶の容量増 / エ 補助記憶の大容量化; limit: 補助記憶装置 1 台), 2018h30a-q081 (ア = Android only), 2022r04-q063 (ア Android) / 2024r06-q097 (イ, iOS excluded) / 2016h28h-q059 (ウ), and the OSS-definition questions whose wrong options M1 was about: 2021r03-q078 (wrong ア = ソース公開なら全て OSS, ウ = 個人が無償で開発), 2024r06-q080 (wrong b = 同旨), 2017h29a-q100 (wrong ウ = 公開されてさえいれば再頒布禁止でも OSS, エ = 有償販売不可), 2011h23tokubetsu-q074 (wrong ア = サポート有料不可, ウ = ネットからダウンロードできる必要).
5. **Cross-unit checks (key check of this batch)**: after u02 M1, read every u02 field that says what makes an OS open source / OSS against `technology-17-48-u01` `terms[0](OSS)` one / detail / points (三語), and u01 ↔ u02 (§X).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording and a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings).
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b67): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 121 / u02 139) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-17-45-u01   → ✓ 0 issues               EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-17-45-u01   → ✓ 27 locations, 0 diff   EXIT=0
$ ... validate --unit technology-17-45-u02 → ✓ 0 issues, 1 warning (zh-term PC, terms[2](Chrome OS).detail_zh)  EXIT=0
$ ... parity   --unit technology-17-45-u02 → ✓ 27 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 loc#0 counts {"terms":5,"figs":5,"steps":7,"points":9,"pairs":1,"key_points":4,"goals":3}  sha256 fb027d87b9b23eb1…  ✓ 0 issues  EXIT=0
  u02 loc#0 counts {"terms":7,"figs":1,"steps":0,"points":7,"pairs":3,"key_points":4,"goals":3}  sha256 becefdc7e32c16c3…  ✓ 0 issues, 1 warning (same zh-term PC)  EXIT=0
  (both sha256 = base_sha256 of every patch in that unit)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 5 ok 5    | issues [] | changed base-present = 5 patched + 'stage'  | unexplained besides 'stage' 0 | derived 57, mismatch 0 | memory_hooks 15 bad 0, lens 5/5/5
  u02 active 23 ok 23  | issues [] | changed base-present = 23 patched + 'stage' | unexplained besides 'stage' 0 | derived 75, mismatch 0 | memory_hooks 21 bad 0, lens 7/7/7
  base sha = base_sha256 for all 28; before count in base = 1 for all 28; replay mismatch 0
  base-only top keys (both): stage / round / jp_round (part metadata)
  net before remnant: 0 for 28/28
  bold counts unchanged in all 28
  [[jp:]] counts unchanged in 24/28; changed: u01 p02 / p03 1 → 2 (補助記憶 out, スラッシング + 主記憶 in, as Rule A L1 prescribes),
      u02 p14 2 → 1 / p15 1 → 0 ([[jp:ソースコード]] out with the source-disclosure clause, as Rule A M1 ⑤ prescribes)
  derived followers (all true): u01 memory_hook_zh of terms[2] (p05) + summary.memory_hooks_zh[2] 「用户管理：登录界面就是…」;
      u02 explanation_jp/zh/en of terms[6] (p16–p18) and terms[4] (p19–p21); summary.key_points_*[3] (p04–p06);
      overview.intro_* (goals p01–p03, now 「ソースコードが公開され改変・再配布もできる OSS の OS を見分けられる」/「公开源代码、允许修改和再分发的 开源软件(OSS)」/ "…whose source code is public and may be modified and redistributed")
  ruleA verbatim miss: [] in both units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 28/28 (u01 5/5, u02 23/23)
  base.replace(Rule A before, Rule A after) == unit field: 28/28 true
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 19 kinds miss 0 | u02 9 kinds miss 0
  new tags in patches: u01 p02 / p03 スラッシング (jp hits: terms[1].detail_jp, terms[1].points[1].text_jp), 主記憶 (jp hits 15); u02 none
D-200 (patched 考点, jp chars without spaces / sentences): u01 terms[1].points[1] (p01, exam, qid 2020r02o-q059) 35 / 1;
  u02 terms[5](iOS).points[0] (p13, mix, qid 2018h30a-q081) 85 / 2 (Rule A counted 94 with its own counting). Both ≤100 / ≤2.
grep in the units (old wording, expect 0):
  u01 "仮想記憶を使うコンピュータで" 0 / "頻発して遅くなっている" 0 / "その原因を取り除く" 0 / "频繁换入换出而变慢" 0 / "消除这一原因" 0 /
      "removes the cause" 0 / "slows down because of frequent" 0 / "多个处理" 0 / "登录画面" 0
  u02 "ソースコードを公開する" 0 / "公開するかどうか" 0 / "是否公开源代码" 0 / "is made public" 0 / "whose source code is public," 0 /
      "由于源代码是公开的" 0 / "Because its source code is public," 0 / "公開する (OSS)" 0 / "公開されている (オープンソース)" 0 /
      "Public (OSS)" 0 / "Public (open source)" 0 / "費用をかけずに" 0 / "不需要花钱" 0 / "导入" 0 / "at no cost" 0 / "and similar" 0;
      "公开源代码的 **" 1 (= terms[4](Linux).one_zh 「公开源代码的 **开源** 操作系统」, outside M1 by Rule A decision, see §X)
```

The single validate warn (u02 zh-term PC in Chrome OS detail_zh 「笔记本电脑」) is present in the base part as well, is not in a patched field, and is Rule A L4 (記録のみ, false positive). `stage` meta is removed in both units (as in b19–b67).

**Application.** All 28 `before` strings occur exactly once in their base field, all 28 `after` strings are present, and replay reproduces every patched field. 10 are shortened phrases of the Rule A strings; all 28 give exactly the Rule A after text (same.mjs 28/28). No net `before` remnant anywhere in either unit.

## U1. technology-17-45-u01 (Rule A PASS, 建議修 L1–L3)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | **9 → 4** (主記憶と補助記憶の, 2020r02o-q059 stem → 主記憶の, 2009h21a-q059 ア) | 4; win12 **9/9 → 0/0**; Dice 0.32 (q059 stem) → 0.18 |
| p02 | zh | **10 → 4** (使用虚拟存储的计算机, q059 stem → 主存储器) | 4 |
| p03 | en | **42 → 16** (" between main memory and auxiliary storage", q059 stem → " of main memory ") | 16 |
| p04 | zh | 5 → 5 (操作系统的, unchanged text) | 3 (给多个) |
| p05 | zh | 2 → 2 | 2 |

- **Targeted** (`tgt_run.mjs`, `terms[1].points[1].text_jp` vs 2020r02o-q059): vs stem LCS 16 「コンピュータで主記憶と補助記憶の」 → **4** 「で主記憶」, Dice 0.32 → 0.09, ed 0.58 → **0.88**, win12 9/9 → 0/0; vs stem + ウ Dice 0.32 → 0.10, ed 0.58 → 0.85; vs ウ alone LCS 3 → 3 (主記憶), Dice 0.09 → 0.14, ed 0.88 → 0.79 (the shared word is 主記憶 = the answer's content). The stem-order skeleton (仮想記憶を使うコンピュータで / 入れ替えが頻発 / 遅くなっている場合 / 原因を取り除く) is gone in all three languages (greps 0). This is the purpose of L1 and it is achieved.
- No patch adds any overlap.

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[1](仮想記憶).points[1].text_*` (exam, 2020r02o-q059) | L1 | Yes (§U1.3) | No | OK |
| p04 | `terms[0](OS).points[1].text_zh` | L2 | Yes: 「轮流分给多个任务」 = en "passes it to several tasks in turn"; 多任务 / 任务 now one word family; jp 「複数の処理」 meaning unchanged. Bold 1 / `[[jp:マルチタスク]]` 1 kept | No | OK |
| p05 | `terms[2](ユーザー管理).hook_zh` (+ memory_hook_zh, summary.memory_hooks_zh[2]) | L3 | Yes: 「登录界面就是用户管理的入口。」 (mainland term) = jp 「ログイン画面」 / en "login screen"; pairing 0 bad | No | OK |

### U1.3 Focused checks — L1 (スラッシング 考点)

- **After (三語)**: 「スラッシングは主記憶の不足から起きるので、主記憶を増設すると解消する。」/「抖动（[[jp:スラッシング]]）源于主存储器（[[jp:主記憶]]）不足，因此增加主存储器即可消除。」/ "Thrashing ([[jp:スラッシング]]) comes from a shortage of main memory ([[jp:主記憶]]), so adding main memory removes it." Same fact, cause → remedy, in all three; `qids` still `["2020r02o-q059"]`, kind exam.
- **Term defined before use**: スラッシング is defined in `terms[1].detail_*` 3rd sentence (出し入れが頻繁になりすぎて処理が極端に遅くなる状態 / 调出调入过于频繁…叫作 抖动 / "When swapping becomes so frequent that processing slows to a crawl … thrashing"). The zh / en 考点 use the same word as the detail (抖动 / thrashing). So a learner maps the q059 situation (frequent swapping → performance drop) to スラッシング through the detail and then to the remedy through the 考点.
- **vs 2020r02o-q059** (re-read): correct ウ (increase main memory) = the 考点's remedy, stated as the result of a main-memory shortage. Wrong options: ア (faster CPU) — no field connects thrashing to the CPU; イ (increase virtual-memory capacity) — the 考点 names 主記憶 as the shortage and the detail says 「主記憶そのものが増えるわけではない」, so enlarging virtual memory is not supported; エ (larger auxiliary storage) — nothing says auxiliary capacity is the cause. The limit 「補助記憶装置は 1 台だけ」 does not change the answer (Rule A §2 #2); the new text does not depend on it. hook (virtual = 実物の主記憶ではない) unchanged and still points away from イ.
- **`[[jp:]]`**: zh / en drop 補助記憶 (the clause is gone) and add スラッシング and 主記憶; both originals are in jp text (スラッシング: detail_jp + points[1].text_jp; 主記憶: 15 jp fields). This also closes the loc LOW 「主記憶 の `[[jp:]]` 不揃い」 Rule A tied to L1. zh 主存储器 follows `zh_terms` 主記憶 → 主存储器（内存） (validate B6 0 warns).
- D-200: 1 sentence, 35 chars. Parity 27 / 0 diff. **u01: L1–L3 resolved.**

## U2. technology-17-45-u02 (Rule A FAIL M1, 建議修 L1–L3)

### U2.1 D-198

Topic sources (technology-17-45, `d198.mjs`):

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 6 → 6 (ソースコード, 2010h22h-q056 エ) | 6; win12 0/0 → 0/0; Dice 0.24 → 0.24 |
| p02 | zh | 5 → 5 (的操作系统) | 4 (开源软件, q081 stem) |
| p03 | en | 19 → 19 (" operating systems ", q081 stem) | 18 |
| p04 | jp | 9 → 9 (" Android ", q081 stem) | 8 (" の OS には"); win12 0/0 → 0/0; Dice 0.24 → 0.22 |
| p05 | zh | 8 → 8 (" Android") | 4 |
| p06 | en | 18 → 18 (" operating systems") | 17 |
| p07 | jp | 3 → 3 | 3; win12 0/0 → 0/0; Dice 0.18 → 0.11 |
| p08 | zh | 3 → 3 (OSS) | 3 |
| p09 | en | 3 → **7** (" and re", 2013h25h-q066 stem) | 7 |
| p10 | jp | 5 → 4 | 4; win12 0/0 → 0/0; Dice 0.16 → 0.12 |
| p11 | zh | 2 → 2 | 2 |
| p12 | en | 7 → 7 (" source") | 7 |
| p13 | jp | 9 → 9 (" Android ", unchanged text) | 6 ("る OSS "); win12 0/0 → 0/0; Dice 0.17 → 0.18 |
| p14 | zh | 8 → 8 (" Android", unchanged text) | 4 (开源软件) |
| p15 | en | 16 → 16 (" its source code", unchanged text) | 7 (" and re") |
| p16 | jp | 7 → 7 (スマートフォン, unchanged text) | 6 (ソースコード); win12 0/0 → 0/0; Dice 0.18 → 0.18 |
| p17 | zh | 6 → 6 | 3 |
| p18 | en | 18 → 18 ("se its source code", unchanged text) | 18 (same) |
| p19 | jp | 5 → 5 | 5 ("Web サ"); win12 0/0 → 0/0; Dice 0.10 → 0.11 |
| p20 | zh | 5 → 5 (" Web ") | 2 |
| p21 | en | 19 → 14 | 10 |
| p22 | en | 6 → **10** ("le devices", q081 stem "mobile devices") | 10 |
| p23 | en | 10 → 10 (", and the ", unchanged text) | 10 |

OSS questions outside the topic (`tgt_run.mjs`, 8 questions, 40 strings per language):

- jp: p01 LCS 9 → 11, win12 0/0 → **4/4**; p04 9 → 11, win12 0/0 → **2/2**; p16 11 → 11, win12 2/3 → 2/2; p13 win12 2/2 → 2/2; p10 win12 0/3 → 0/0, ed-best 0.64 → 0.80 (vs 2017h29a-q100 ウ); p07 ed-best 0.43 → 0.73. All windows are 「(と)ソースコードが公開され(改/改変)」 ~ 2024r06-q080 stem item b 「ソースコードが公開された(ソ)」 (d1–d2), i.e. the 11-char noun phrase ソースコードが公開され plus one character. That phrase is the generic definition wording also used by `technology-17-48-u01` `terms[0].one_jp` (「ソースコード が公開され」), and in every hit our text goes on with 改変・再配布, which is exactly what item b lacks; the item's frame (「…は全て OSS である」) is not reproduced. Best Dice 0.21–0.27, best ed 0.69–0.81 (far from HIGH calibration Dice 0.52 / ed 0.14).
- zh: no rise above 9 (开源软件(OSS), the term). en: p09 / p12 3–7 → 12 (" redistribut", 2011h23tokubetsu-q074 エ = the correct answer's word), p21 12 → 15 (" free of charge", 2021r03-q078 ウ — that option says individuals develop all OSS free of charge; our cell says many distributions can be obtained free of charge, a different claim), p22 5 → 10 ("le devices"), p23 8 → 9 (" Android ").
- **Rises**: all are the term words of the definition (ソースコードが公開され / redistribut / free of charge / 开源软件) or letter-boundary coincidences ("Apple devices" ~ "mobile devices", " and re"). None carries a question's frame, item set or element order, and none restates a wrong option (the new text contradicts 2021r03-q078 ア, 2024r06-q080 b and 2017h29a-q100 ウ). Not a D-198 issue.

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `goals_*[2]` (+ overview.intro_*) | M1 ① | Yes (§U2.3) | No | OK |
| p04–p06 | `key_points_*[3]` (+ summary.key_points_*[3]) | M1 ② | Yes (§U2.3) | No | OK |
| p07–p09 | `pairs[2](iOS/Android).rows[1].b_*` (key 行) | M1 ③ | Yes (§U2.3) | No | OK |
| p10–p12 | `pairs[1](UNIX/Linux).rows[1].b_*` | M1 ④ | Yes (§U2.3) | No | OK |
| p13–p15 | `terms[5](iOS).points[0].text_*` 2nd sentence (mix, 2018h30a-q081) | M1 ⑤ | Yes (§U2.3) | No | OK |
| p16–p18 | `terms[6](Android).detail_*` 1st sentence (+ explanation_*) | M1 ⑥ | Yes (§U2.3) | No | OK |
| p19–p21 | `terms[4](Linux).detail_*` 3rd sentence (+ explanation_*) | L1 | Yes: 「無償で入手できるディストリビューションも多く」/「许多发行版可以免费获取」/ "Many distributions are available free of charge" — "many", not all, so it no longer reads as Linux (OSS) = 無償 (2011h23tokubetsu-q074 ア / 2021r03-q078 ウ side) and agrees with `technology-17-48-u01` `points[2]` (OSS ≠ 無料, 有償サポートも可). The subject is the distributions just defined in the previous sentence (ディストリビューション, bold kept). zh 日式「导入」 gone (grep 0) | No | OK |
| p22 | `pairs[2].rows[2].a_en` | L2 | Yes: "iPhone and other Apple devices" = jp 「アップル製の iPhone など」 (など inside Apple products) and iOS detail "ships only on Apple devices"; no longer suggests other makers' devices | No | OK |
| p23 | `pairs[1].rows[2].b_en` | L3 | Yes: "…and the base of Android and others" restores jp 「Android などの土台」 (Chrome OS too, as the UNIX tree shows). See §5 Obs. 4 on the attachment of "and others" | No | OK |

### U2.3 Focused checks — M1 (OSS distinguished by source disclosure only)

- **Definition to agree with** (`technology-17-48-u01` `terms[0](OSS)`, re-read 三語): one 「ソースコード が公開され、ライセンスの条件の下で誰でも 利用・改変・再配布 できる」/「源代码 公开、在许可证条件下任何人都可以 使用、修改、再分发」/ "source code is made public and that anyone may use, modify and redistribute under the terms of its license"; detail 「ソースコードを読めるだけでなく、改変や再配布の自由までライセンスで認められている」; points[2] 「OSS は『無料のソフト』と同じ意味ではない」.
- **After (三語), each M1 field**:
  - ① goals[2]: 「ソースコードが公開され改変・再配布もできる **OSS** の OS」/「公开源代码、允许修改和再分发的 **开源软件(OSS)**」/ "…whose source code is public and may be modified and redistributed"; overview.intro follows in all three.
  - ② key_points[3]: 「ソースコードが公開され、改変・再配布も認められた **OSS** の OS には、例えば Linux や Android がある」 (例えば kept = open list) / zh 「公开源代码、并允许修改和再分发的」/ en "whose source code is public and may be modified and redistributed"; summary copy follows.
  - ③ key row pairs[2].rows[1] (label ソースコード): a 「公開しない」 (iOS, unchanged) vs b 「公開し、改変・再配布も認める (OSS)」/「公开，并允许修改和再分发（OSS）」/ "Public, and may be modified and redistributed (OSS)". The OSS label now sits on public + modify + redistribute, not on "public".
  - ④ pairs[1].rows[1] (Linux side): 「公開され、改変・再配布もできる (オープンソース)」 / zh / en same content. a 「製品ごとに扱いが異なる」 (UNIX) unchanged.
  - ⑤ iOS points[0]: 1st sentence unchanged (アップルが自社端末にだけ載せ、ソースコードは公開されない = product fact); 2nd sentence 「同じモバイル OS の **Android** とは、改変・再配布まで認める OSS かどうかで分かれる」/「…的区别在于是否属于允许修改和再分发的开源软件(OSS)」/ "…is whether it is OSS that may be modified and redistributed". The dividing line is now OSS-ness with modification / redistribution, not source disclosure. Bold 2 kept; zh / en `[[jp:ソースコード]]` removed with the clause, and the tag remains in Android `points[0]` zh / en (`[[jp:]]` origin miss 0).
  - ⑥ Android detail: 「ソースコードが公開され、改変・再配布も認められているため、多くのメーカーが自社のスマートフォンに組み込んで販売している」 — the cause of many makers shipping it now includes the freedoms they actually use (modify, redistribute), in all three languages.
  - Wording matches `17-48-u01` in all three languages: jp 改変・再配布, zh 修改 / 再分发, en modify / redistribute. `17-48-u01` adds 「ライセンスで」; u02 says 認められた / 允许 / may be, which is the same permission without naming the instrument — consistent, not narrower.
- **Remaining OSS-describing fields in u02** (all fields grep'd for OSS / オープンソース / 开源 / open source / 公開 / source code): `terms[4](Linux).one_*` 「ソースコードが公開されている オープンソース の OS」 (describes Linux, true, not a criterion; Rule A M1 put it outside on purpose), `overview_rows[4] / [6].one_line_*` 「オープンソースの OS」 (no criterion), `terms[4].analogy_*` (誰でも閲覧して書き足せる…店ごとに手を加えた版が出回っている = read + modify + redistribute), `terms[6].points[0]` (exam, q081: 「ソースコードが公開された OSS のモバイル OS で、メーカーはそれを基に手を加えて自社の端末に搭載できる」 = modification + shipping; unchanged), `terms[5].detail_*` 「ソースコードも公開されていない」 (iOS product fact). None of these now states that source disclosure alone makes something OSS. **Discriminating test**: is there any u02 field from which a learner would pick 2021r03-q078 ア / 2024r06-q080 b / 2017h29a-q100 ウ (source public ⇒ OSS, even without redistribution)? After the patches, no: every field that sets the OSS line includes 改変・再配布 (三語), and the old exclusive wording is 0 (greps §1).
- **vs cited questions** (re-read):
  - 2018h30a-q081 (ア = ① Android only): Android = OSS (points[0], pairs[2] b, key_points[3], detail); iOS ≠ OSS (iOS points[0] 1st sentence + 2nd sentence, detail, pairs[2] a); ③ Thunderbird is not an OS and ④ Windows Phone is not in the unit, so nothing supports イ / ウ / エ. Still answerable. 2022r04-q063 (Android) / 2024r06-q097 (Android, Linux, FreeBSD; iOS excluded) agree.
  - technology-17-48 OSS questions: 2021r03-q078 ア / 2024r06-q080 b / 2017h29a-q100 ウ are now contradicted by ①–⑥; 2011h23tokubetsu-q074 ア / 2021r03-q078 ウ (OSS = 無償) are not supported (L1 says "many distributions" are free); 2017h29a-q100 エ (有償販売不可) and 2011h23tokubetsu-q074 ウ (download required) have no support in u02.
- **D-200**: iOS points[0] 2 sentences, 85 chars without spaces (Rule A's count 94), ≤100 / ≤2. Other u02 考点 unchanged (Chrome OS 91 by the same counting, Rule A L11 "do not lengthen" respected — not touched).
- Bold counts unchanged in all 23; parity 27 / 0 diff. **u02: M1 and L1–L3 resolved.**

## X. Cross-unit check — OSS definition (u02 ↔ technology-17-48-u01) and u01 ↔ u02 (三語)

| Axis | technology-17-48-u01 | u02 (after patch) | Contradiction? |
|---|---|---|---|
| What makes software OSS | source public + use / modify / redistribute under the licence (one, detail) | goals[2] / key_points[3] / pairs[2].rows[1].b / pairs[1].rows[1].b / iOS points[0] / Android detail: source public + 改変・再配布 allowed | No — u02 states the same two conditions in the same words (改変・再配布 / 修改・再分发 / modify・redistribute) |
| OSS ≠ free of charge | points[2]: 再配布に代金を取ることも有償サポートも可 | Linux detail: 無償で入手できるディストリビューション**も多く** (many, not all) | No — the old 「費用をかけずに導入でき」 is gone |
| Which OSes are OSS | fig OS row: Linux, Android, FreeBSD | Linux, Android (key_points 例えば); iOS / Windows not OSS | No |
| u01 ↔ u02 | u01 (OS 一般, マルチタスク / 仮想記憶 / アクセス権) | UNIX detail マルチタスク 「複数のプログラムを並行して動かす」 | No — u01 patches touch only 仮想記憶 points[1], OS points[1].zh (任务) and ユーザー管理 hook_zh; u01 zh 多任务 / 任务 and u02 zh UNIX 多项任务 now use the same word family |

- u01 patches do not touch anything u02 relies on, and u02 patches do not touch OS-function content. 2010h22h-q056 エ (OS must disclose source; cited by u01 OS points[0], challenge question in u02) stays unsupported: u02 still says iOS source is not public and UNIX 「製品ごとに扱いが異なる」, and treats disclosure as a property of OSS only.

## 4. F-fix

No required F-fix in either unit. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: u01 0 warns; u02 1 warn (zh-term PC in Chrome OS detail_zh), present in the base part too and not in a patched field = Rule A L4 (false positive).
   - `stage` meta is removed in both units (as in b19–b67).
   - ruleA verbatim miss = none. 10 of 28 patches use shortened phrases; same.mjs shows all 28 give the same field as the Rule A strings.
   - Net `before` remnants 0 in all 28.
   - Bases: u01 `a1` / `loc.r0`, u02 `a1` / `loc.r0`. u02 patch paths p13–p21 carry a label (`terms[5](iOS)…`); it resolves in check.mjs / d198.mjs / same.mjs.
2. u02 `terms[4](Linux).one_*` still reads 「ソースコードが公開されている オープンソース の OS」 / zh 「公开源代码的 **开源** 操作系统」. It describes Linux and sets no criterion; Rule A kept it outside M1 on purpose, and the Linux row of pairs[1] now carries 改変・再配布. If Linux is touched again, 「改変・再配布もできる」 could be added there too; nothing requires it.
3. u02 pairs key cells are worded as properties of the source code (row label ソースコード / 源代码 / Source code → "Public, and may be modified and redistributed"). Read as "the software's source is public and it may be modified and redistributed", which is how all three languages read in context. Not a defect.
4. u02 p23 en "Servers, embedded devices, and the base of Android and others": "and others" can attach to the list rather than to Android. Either reading is true (Linux is the base of Android and Chrome OS, and has other uses); jp 「Android などの土台」 is the intended one. Not re-ruled.
5. D-198 rises: u02 p09 / p15 +4 (" and re"), p22 +4 ("le devices"); vs the OSS questions outside the topic, jp 12-char windows on the generic phrase ソースコードが公開され (2024r06-q080 item b, which our text contradicts) and en term words (redistribut / free of charge). All analysed in §U2.1. u01 L1 lowers overlap with 2020r02o-q059 sharply (win12 9 → 0, ed 0.58 → 0.88).
6. u01 L1 states the cause (主記憶の不足) and remedy without naming the q059 situation; the learner needs the detail's definition of スラッシング to connect them. That definition is in the same term (detail 3rd sentence, 三語), so the chain is complete.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-17-45-u01 | PASS | **5/5** | — | 0 / 0 / 0 | **PASS** |
| technology-17-45-u02 | FAIL (M1) | **23/23** | M1 resolved (every field that sets the OSS line — goals[2] / key_points[3] / pairs[2].rows[1] / pairs[1].rows[1] / iOS points[0] / Android detail — now requires source public + 改変・再配布, 三語, = technology-17-48-u01; 2018h30a-q081 still answered; 17-48 wrong options ア / b / ウ no longer supported) | 0 / 0 / 0 | **PASS** |

- **Application:** 28/28 exact (replay, part-level). 0 unexplained diffs, net `before` remnants 0, derived fields follow (132 checked, 0 mismatch), memory_hooks pairing 0 bad. 10/28 shortened, and all 28 give the same field as the Rule A string (same.mjs). Every MEDIUM and 建議修 is covered.
- **D-198:** no patch adds a meaningful overlap. u01 L1 moves away from 2020r02o-q059's stem order (LCS 16 → 4, Dice 0.32 → 0.09, ed 0.58 → 0.88, win12 9 → 0). u02 rises are the definition's own words or letter-boundary coincidences; the 2024r06-q080 windows are on the generic phrase ソースコードが公開され and the text contradicts that item.
- **D-200:** patched 考点 u01 `terms[1].points[1]` (exam, qid kept) 1 sentence 35 chars; u02 `terms[5].points[0]` (mix, qid kept) 2 sentences 85 chars; no 考点 claim reversed. **D-202:** `[[jp:]]` origin miss 0 in both units; new tags スラッシング / 主記憶 exist in jp; removed `[[jp:ソースコード]]` remains elsewhere; bold counts unchanged in all 28. **D-204 / 書き方 7:** u02 ↔ 17-48-u01 OSS definition no longer conflicts (§X); u02 Linux no longer reads as OSS = 無償. **D-205 / D-210:** no new law, standard, version or numeric claim.
- **Gates:**
  - validate --unit ×2: 0 issues / EXIT 0 (u01 0 warns, u02 1 pre-existing warn = Rule A L4)
  - validate --part ×2: 0 issues, sha256 = base_sha256 for each
  - parity ×2: 0 diff (27 / 27 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for both units.** All 28 active patches are applied exactly, and the MEDIUM and every 建議修 LOW are resolved in context in all three languages:
- u01 p01–p03: the スラッシング 考点 states cause (主記憶の不足) and remedy (主記憶の増設) instead of following 2020r02o-q059's stem; it supports ウ and none of ア / イ / エ; zh / en `[[jp:]]` now スラッシング + 主記憶, both present in jp.
- u01 p04–p05: zh 多个任务 and 登录界面.
- u02 p01–p18: OSS is now marked by public source plus permission to modify and redistribute in all six fields, matching technology-17-48-u01; 2018h30a-q081 remains answerable.
- u02 p19–p23: Linux free-of-charge is limited to "many distributions"; en "iPhone and other Apple devices" and "Android and others" restore the jp scope.

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
