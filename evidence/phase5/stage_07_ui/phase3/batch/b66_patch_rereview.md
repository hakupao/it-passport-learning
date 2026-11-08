# b66 B3 patch re-review — strategy-05-17 u01〜u04 (IoT・組込みシステムの基礎概念、IoTデバイスと情報端末、自動車・モビリティのIoT、スマート化と産業・社会のIoT応用)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the four Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b66rv/`: `check.mjs` / `d198.mjs` / `same.mjs` copied from `b64rv/` with only the unit map changed (4 units; all bases are round `r0`; u01 / u04 bases are attempt `a2`). `same.mjs` reads the 31 Rule A before / after pairs from `b66rv/ra.json`, which I copied by hand from the Rule A files (all 62 strings confirmed verbatim in the Rule A files by script). One extra targeted script `qcite.mjs` reuses the `q099b.mjs` functions with a qid list instead of a topic (needed because 2024r06-q078 is in topic strategy-05-14). No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b66)
- Scope: the B3 wording patches for 4 units. **31 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (IoT・組込みシステムの基礎概念) | PASS, 建議修 L1–L3 | p01–p06 | L1 → p01–p03 (`terms[0].detail_*`); L2 → p04 (`terms[0].fig.steps[1].caption_en`); L3 → p05–p06 (`terms[3].detail_zh` / `analogy_zh`) | 4/6 (p01–p04) |
| u02 (IoTデバイスと情報端末) | FAIL M1, 建議修 0 | p01–p06 | M1 → p01–p03 (`terms[6](スマートスピーカー).one_*`) + p04–p06 (`terms[6].fig.data.nodes[1].label.jp/zh/en`) | 1/6 (p01); p02 / p03 extended (see below) |
| u03 (自動車・モビリティのIoT) | FAIL M1, 建議修 L6–L10 | p01–p11 | M1 → p01–p03 (`terms[5](ワイヤレス給電).points[0].text_*`); L6 → p04 (`terms[0].analogy_zh`); L7 → p05 (`terms[3].one_en`); L8 → p06–p07 (`terms[4].detail_zh`, `pairs[1].rows[1].b_zh`); L9 → p08–p10 (`terms[5].analogy_*`); L10 → p11 (`terms[2].detail_zh`) | 4/11 (p08–p11) |
| u04 (スマート化と産業・社会のIoT応用) | FAIL M1 + M2, 建議修 L1 / L11 / L13 | p01–p08 | M1 → p01 (`terms[5](HEMS).detail_zh`); M2 → p02–p03 (`terms[0](スマートシティ).hook_jp/zh`; en unchanged, as Rule A prescribed); L1 → p04–p06 (`terms[4](スマート農業).detail_*`); L11 → p07 (`terms[0].detail_zh`); L13 → p08 (`terms[6](ドローン).detail_en`) | 2/8 (p01, p08) |

  Every MEDIUM and every 建議修 is covered. 記録のみ LOWs and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **11 of 31** (`before` / `after` are phrases inside the Rule A strings). In u02, p02 / p03 go the other way: Rule A named the replacement target as a phrase (「听懂人说的话」 / "picks up what you say"), and the patch strings carry that phrase plus surrounding context (`[[jp:音声認識]]…，` / "speaker that … through **speech recognition**"). In u03 p01–p07 and u04 p02–p07, Rule A itself prescribed phrases, so "Rule A full string" means that phrase. `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **31/31**, so all shortened / extended patches give the same result as the Rule A strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/strategy-05-17-u01/parts/b66-u01-a2/strategy-05-17-u01.loc.r0.json` `0557154ba9d19f4b…`
  - u02 `.../strategy-05-17-u02/parts/b66-u02-a1/strategy-05-17-u02.loc.r0.json` `6ff673209fc71119…`
  - u03 `.../strategy-05-17-u03/parts/b66-u03-a1/strategy-05-17-u03.loc.r0.json` `4b414a245793a80b…`
  - u04 `.../strategy-05-17-u04/parts/b66-u04-a2/strategy-05-17-u04.loc.r0.json` `858abd012eb0c536…`
- Merged units (current) `data/ip/textbook/units/strategy-05-17-u0N.json` sha256: u01 `c00e4cdd7b7fcd06…`, u02 `e30119040002e9a8…`, u03 `f3147feec04589c0…`, u04 `6aa132555bf0cbe2…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b64_patch_rereview.md` §0 (no unit-level patches in this batch). All 4 units share topic strategy-05-17 (22 questions), so there are 110 source strings per language.

1. **Application check** (`b66rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b66rv/same.mjs`: Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b66rv/d198.mjs`, all 31 patches): whole-field LCS before → after and LCS of the `after` span against the 110 sources per language; jp also 12-char windows (unmasked / masked) and Dice. Plus `b66rv/qcite.mjs`: before → after LCS / win12 / Dice / best-window edit distance against the cited question only, for u02 M1 (2024r06-q078, topic strategy-05-14), u03 M1 (2020r02o-q074) and u04 M1 (2023r05-q098, incl. its zh / en translation).
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json` (stem_jp_clean / zh / en): 2024r06-q078 (answer ア = step (1) voice → text data; イ = (2) text analysis / meaning) and 2016h28h-q100 (AR question; wrong ウ describes speech analysis → digitization) for u02; 2020r02o-q074 (answer ウ エネルギーハーベスティング; stem: 光や熱 (温度差) など) for u03; 2023r05-q098 (answer イ: 電気やガスなど → 供給事業者; zh 「供应商」, en "the supplier") for u04.
5. **Cross-unit checks**: u02 M1 against `data/ip/textbook/units/strategy-05-14-u07.json` (音声認識 = 話し声を文字データに変える); u03 M1 against `data/ip/textbook/units/strategy-05-17-u01.json` `terms[0].points[1]` (EH 考点).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording, a unit-wide `[[jp:]]` origin check (space-normalized, all jp strings), and for u04 M2 a unit-wide enumeration of every スマート〜 / 智慧〜・智能〜 / smart 〜 occurrence.
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b65): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 119 / u02 133 / u03 114 / u04 123) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-17-u01   → ✓ 0 issues               EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit strategy-05-17-u01   → ✓ 32 locations, 0 diff   EXIT=0
$ ... validate --unit strategy-05-17-u02 → ✓ 0 issues  EXIT=0 | parity → ✓ 28 locations, 0 diff  EXIT=0
$ ... validate --unit strategy-05-17-u03 → ✓ 0 issues  EXIT=0 | parity → ✓ 27 locations, 0 diff  EXIT=0
$ ... validate --unit strategy-05-17-u04 → ✓ 0 issues  EXIT=0 | parity → ✓ 33 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 counts {"terms":6,"figs":5,"steps":11,"points":8,"pairs":3,"key_points":4,"goals":3}  sha256 0557154ba9d19f4b…  ✓ 0 issues  EXIT=0
  u02 counts {"terms":7,"figs":2,"steps":4,"points":5,"pairs":2,"key_points":5,"goals":3}   sha256 6ff673209fc71119…  ✓ 0 issues  EXIT=0
  u03 counts {"terms":6,"figs":3,"steps":3,"points":9,"pairs":2,"key_points":5,"goals":3}   sha256 4b414a245793a80b…  ✓ 0 issues  EXIT=0
  u04 counts {"terms":7,"figs":5,"steps":10,"points":3,"pairs":2,"key_points":3,"goals":3}  sha256 858abd012eb0c536…  ✓ 0 issues  EXIT=0
  (all 4 sha256 = base_sha256 of every patch in that unit)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 6 ok 6   | issues [] | changed base-present = 6 patched + 'stage'  | unexplained besides 'stage' 0 | derived 66, mismatch 0 | memory_hooks 18 bad 0, lens 6/6/6
  u02 active 6 ok 6   | issues [] | changed base-present = 6 patched + 'stage'  | unexplained 0 | derived 78, mismatch 0 | memory_hooks 21 bad 0, lens 7/7/7
  u03 active 11 ok 11 | issues [] | changed base-present = 11 patched + 'stage' | unexplained 0 | derived 63, mismatch 0 | memory_hooks 18 bad 0, lens 4/4/4
  u04 active 8 ok 8   | issues [] | changed base-present = 8 patched + 'stage'  | unexplained 0 | derived 69, mismatch 0 | memory_hooks 21 bad 0, lens 6/6/6
  base sha = base_sha256 for all 31; before count in base = 1 for all 31; replay mismatch 0
  base-only top keys (all 4): stage / round / jp_round (part metadata)
  net before remnant: 0 for all 31 (raw and stripped)
  bold counts unchanged in all 31; [[jp:]] counts unchanged in all 31
  derived followers (all true): u01 explanation_jp/zh/en of terms[0] (p01–p03), explanation_zh of terms[3] (p05);
      u02 definition_jp/zh/en of terms[6] (p01–p03); u03 definition_en of terms[3] (p05), explanation_zh of terms[4] (p06),
      explanation_zh of terms[2] (p11); u04 explanation_zh of terms[5] (p01), memory_hook_jp/zh of terms[0] (p02–p03) and
      summary.memory_hooks_jp/zh[0] (pairing 0 bad), explanation_jp/zh/en of terms[4] (p04–p06), explanation_zh of terms[0] (p07),
      explanation_en of terms[6] (p08)
  ruleA verbatim miss: [] in all 4 units
same.mjs (Rule A before → after on the base field):
  Rule A before occurs once in the base field: 31/31 (u01 6/6, u02 6/6, u03 11/11, u04 8/8)
  base.replace(Rule A before, Rule A after) == unit field: 31/31 true
[[jp:]] origin (all tags vs all jp strings, space-normalized): u01 9 kinds miss 0 | u02 15 miss 0 | u03 16 miss 0 | u04 8 miss 0
D-200 (patched 考点, jp chars without spaces / sentences): u03 terms[5].points[0] (p01, mix) 92 / 1 (≤100; Rule A M1 counted 95 with spaces). No other patch touches a 考点.
grep in the units (old wording, expect 0):
  u01 "センサー**で状態" 0 / "传感器**掌握" 0 / "sensors** that measure" 0 / "press a button" 0 / "拥有设备" 0 / "设备的所有者" 0
  u02 "音声認識**で聞き取り" 0 / "听懂" 0 / "picks up what you say" 0 / "音声を聞き取る" 0 / "接收语音" 0 / "It picks up the voice" 0 / "聞き取" 0;
      "picks up" 2 (= p06 after "The microphone picks up the voice" + fig.steps[1].caption_en, both the capture step); "文字データ" 2 (= one_jp + definition_jp)
  u03 "振動や光" 0 / "振动、光线" 0 / "vibration or light" 0 / "原本只是用来行驶的机器，如今" 0 / "expresses where" 0 / "利用者可以" 0 / "出行的利用者" 0 /
      "給水トレー" 0 / "供水托盘" 0 / "tray" 0 / "规定系统可以驾驶的场景" 0
  u04 "供电企业" 0 / "スマート〜という語" 0 / "这类词" 0 / "とされる" 0 / "被看作弥补" 0 / "are seen as" 0 / "各地政府" 0 /
      "high places that are hard for people to reach and wide" 0
```

No validate warns in any of the 4 units (unit or part). `stage` meta is removed in all 4 units (as in b19–b65).

**Application.** All 31 `before` strings occur exactly once in their base field, all 31 `after` strings are present, and replay reproduces every patched field. 11 are shortened phrases and 2 (u02 p02 / p03) are extended phrases of the Rule A strings; all 31 give exactly the Rule A after text (same.mjs 31/31). No `after` contains its own `before`, so the count-1 check is meaningful for all 31; net remnant 0 for all.

## U1. strategy-05-17-u01 (Rule A PASS, 建議修 L1–L3)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 7 → 7 (アクチュエータ, term; 2022r04-q097 c0, unchanged text) | センサー (4); win12 0/0 → 0/0; Dice 0.14 → 0.14 |
| p02 | zh | 6 → 6 ("IoT 设备", unchanged) | 的传感器 (4) |
| p03 | en | 18 → 18 ("ic control of the ", unchanged) | "s and similar p" (15, generic) |
| p04 | en | 17 → 17 (" over the network", unchanged) | " the device" (11) |
| p05 | zh | 6 → 6 ("在 IoT ", unchanged) | 这些设 (3) |
| p06 | zh | 4 → 4 (电力公司, unchanged) | 使用 (2) |

No patch adds any overlap (no field LCS rises).

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[0](IoT).detail_*` 1st sentence (+ explanation_*) | L1 | Yes: 「**センサー**などで状態をつかみ」/「**传感器**等掌握状态」/ "with **sensors** and similar parts that measure" — the universal claim (every IoT device has a sensor) is gone, and the wording now matches `points[0]` 「センサーなど」/「传感器等」/ "sensors or similar parts" and 2019r01a-q013 (answer: センサを搭載した機器や制御装置など). No frequency claim added (as Rule A required). The actuator sentence (制御まで行う機器は…) is unchanged | No | OK |
| p04 | `terms[0].fig.steps[1].caption_en` | L2 | Yes: "without waiting for anyone to operate the device" = jp 「人の操作を待たずに」 / zh 「不必等人操作」; no longer narrowed to pressing a button. Agrees with `points[0]` "without human operation" | No | OK |
| p05–p06 | `terms[3](クラウドサービス).detail_zh` (+ explanation_zh), `analogy_zh` | L3 | Yes: 「用户不必自己拥有这些设施」/「设施的所有者和使用者是分开的」 — 設備 is now 设施, so it no longer reads as "the user need not own IoT devices" (设备 is the unit's word for IoT / embedded devices, 43 uses). 「这些」 adds a demonstrative that jp does not have; its antecedent is the storage / analysis place in the sentence before, so the sense is the same as jp 設備 (servers etc.) | No | OK |

### U1.3 Focused checks

- No 考点 and no qid in the patched fields (detail / fig caption / analogy). D-200 not affected. The IoT recognition 考点 (`points[0]`, 5 qids) is unchanged and now agrees in wording with detail (both 「センサーなど」).
- en p03 "sensors and similar parts" is the same phrase family as `points[0]` "sensors or similar parts" (6 occurrences of "and similar parts" in the unit, incl. derived copies). Parity 32 / 0 diff. **u01: all L1–L3 resolved.**

## U2. strategy-05-17-u02 (Rule A FAIL M1, 建議修 0)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 11 → 11 (インターネットにつなが, 2019r01a-q013 c1, unchanged text) | データ (3); win12 **4/1 → 4/1** (pre-existing, unchanged text 「インターネットにつながった」 ~ q013 c1, generic phrase); Dice 0.23 → 0.21 |
| p02 | zh | 4 → 4 (，它通过) | 数据， (3) |
| p03 | en | 20 → 20 (" internet-connected ", unchanged) | " through " (9) |
| p04 | jp | 1 → 3 (マイク; 2013h25h-q021 c2 マイクロコンピュータ) | マイク (3); win12 0/0 → 0/0; Dice 0.00 → 0.25 (short 8-char label; shared bigrams = マイ / イク only) |
| p05 | zh | 2 → 1 | 1 |
| p06 | en | 6 → 6 (" the v" → " micro", 2013h25h-q021 stem) | 6 |

- Targeted against the cited question (`qcite.mjs`, 2024r06-q078 stem incl. steps (1)–(4)): `one_jp` LCS 9 (スマートスピーカー, headword) → 9; win12 0/0 → 0/0; Dice 0.19 → 0.23; ed-best 0.84 → 0.82. `nodes[1].label.jp` LCS 3 → 2, Dice 0.02 → 0.01. `one_zh` LCS 4 (智能音箱) → 4; `one_en` LCS 19 (" speech recognition", term) → 19. The new 「文字データに変え」 does not take q078 step (1)'s wording (テキストデータに変換する); it uses strategy-05-14-u07's own term 文字データ. No meaningful overlap.
- p01's win12 4/1 is unchanged text (one_jp's closing 「インターネットにつながったスピーカー」, a generic phrase shared with a topic choice) and was already measured by Rule A §1-4. p04's Dice 0.25 is a katakana prefix coincidence (マイク vs マイクロコンピュータ) on a short label.

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[6](スマートスピーカー).one_*` (+ definition_*) | M1 | Yes (§U2.3) | No | OK |
| p04–p06 | `terms[6].fig.data.nodes[1].label.jp/zh/en` | M1 | Yes (§U2.3) | No | OK |

### U2.3 Focused checks — M1 (音声認識 tied to the capture step)

- After (三語): one_jp 「**スマートスピーカー**は、話しかけた言葉を**音声認識**で文字データに変え、**音声アシスタント**が声で答えたり機器を操作したりする、…」; one_zh 「…它通过**语音识别**[[jp:音声認識]]把人说的话转换成文字数据，再由**语音助手**…」; one_en "…speaker that turns what you say into text data through **speech recognition** [[jp:音声認識]], and its **voice assistant** …". fig node[1]: 「マイクで声を拾う」/「用麦克风收音」/ "The microphone picks up the voice". The verb 聞き取る / 听懂 / picks up no longer joins 音声認識 (one) to the capture node: the word 聞き取 is 0 in u02, and "picks up" now occurs only in the capture step (node[1] + steps[1] caption "The built-in microphone picks up the voice and turns it into audio data"), which matches the new node label in all three languages.
- **vs 2024r06-q078** (re-read; answer ア = step (1) voice → text data; イ = (2) analyze text and understand meaning): one now gives 音声認識 the function voice → text data, i.e. step (1). The fig sequence is now 話しかける → マイクで声を拾う (capture) → ネット上で意味を解析 (= q078 step (2)) → 声で答える・家電を動かす, so 音声認識 (one) and 意味の解析 (fig step 3, detail 1st sentence) are separate; a reader applying the unit to q078 picks ア and not イ. 2016h28h-q100 (AR question, answer イ) is unaffected; its wrong ウ (speech analysis → digitization) is a description of speech recognition and is not supported as AR anywhere in the unit.
- **vs strategy-05-14-u07** (`data/ip/textbook/units/strategy-05-14-u07.json`): 「話し声を文字データに変える**音声認識**」/「把说话声转换为文字数据的**语音识别**」/ "speech recognition, which turns spoken voice into text data", and its points 「…発話を書き起こした文字データを出力する認識処理」. u02 one now uses the same function and the same word (文字データ / 文字数据 / text data) in all three languages. The two units agree.
- No new universal claim: the patch does not say where the conversion runs (device or online), as Rule A required (D-205). detail (受け取った音声はネット上で意味が解析され) and steps[1..3] are unchanged and do not conflict with one. Bold 3 → 3 and `[[jp:]]` 3 → 3 in zh / en; the headword pair (スマートスピーカー / 智能音箱 / smart speaker) is unchanged. Node id `recog` is kept; it is only a React key in `apps/web/src/components/textbook/figures/FlowFig.tsx` (not shown text).
- Parity 28 / 0 diff. **u02: M1 resolved in all three languages.**

## U3. strategy-05-17-u03 (Rule A FAIL M1, 建議修 L6–L10)

### U3.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 13 → 13 (エネルギーハーベスティング, 2020r02o-q074 c2 = correct ウ, term) | なエネルギー (6); win12 **2/0 → 2/0** (term-name windows only, masked 0); Dice 0.25 → 0.24 |
| p02 | zh | 5 → 5 (转换为电力, unchanged) | 从周围 (3) |
| p03 | en | **19 → 23** (" amounts of energy " → "temperature differences", 2020r02o-q074 stem) | 23 (same) |
| p04 | zh | 4 → 4 (智能手机, unchanged) | 联网的 (3) |
| p05 | en | 9 → 10 (" in which ", generic) | 10 |
| p06 | zh | 4 → 4 (路线，并, unchanged) | 用户 (2) |
| p07 | zh | 2 → 2 | 用户 (2) |
| p08 | jp | 4 → 4 (のような) | 4; win12 0/0 → 0/0; Dice 0.11 → 0.11 |
| p09 | zh | 2 → 3 (的容器) | 3 |
| p10 | en | 13 → 13 (", instead of ", unchanged) | " container " (11) |
| p11 | zh | 3 → 3 | 驾驶的 (3) |

- **p03** +4 is the noun phrase "temperature differences": the 熱 (温度差) item that M1 restores is the cited question's own 限定 content, and the phrase is a term-level noun (the same words are in u01's EH 考点 en). jp / zh carry it as 温度差 / 温差 (2 chars); jp field LCS stays 13 (the term name). Targeted (`qcite.mjs`, q074): jp LCS 13 → 13 (term), win12 2/0 → 2/0, Dice 0.25 → 0.24, ed-best 0.83 → **0.80**; zh LCS 5 → 5. Far from the HIGH calibration (Dice 0.52 / ed 0.14). The 考点 does not restate q074's frame (IoT への電力供給でも用いられ…集めて変換する技術はどれか); it contrasts the power source of two technologies (mix).
- Other rises are generic (p05 " in which ", p09 的容器).

### U3.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[5](ワイヤレス給電).points[0].text_*` | M1 | Yes (§U3.3) | No | OK |
| p04 | `terms[0](コネクテッドカー).analogy_zh` | L6 | Yes: 「…一样，汽车也从原本只是用来行驶的机器，变成了联网的终端。」 — subject 汽车 restored, = jp 「車が」 / en "the car" | No | OK |
| p05 | `terms[3](CASE).one_en` (+ definition_en) | L7 | Yes: "a term that sums up the directions in which the auto industry is changing" = jp 「変化の方向を…表した言葉」 / zh 「表示汽车产业变化方向的词」 | No | OK |
| p06–p07 | `terms[4](MaaS).detail_zh` (+ explanation_zh), `pairs[1].rows[1].b_zh` | L8 | Yes: 用户 replaces the Japanese loan 利用者 in both zh fields (grep 利用者可以 0 / 出行的利用者 0). Meaning unchanged; parity 27 / 0 diff (b cell jp 「移動する利用者」 / en "People who travel") | No | OK |
| p08–p10 | `terms[5].analogy_*` | L9 | Yes: 「給水台に置いておくだけで台の側から水が注がれて満ちていく器」/「只要放在供水台上，水就会从台子那一侧注入、慢慢装满的容器」/ "a container that fills with water just by being set on a supply stand that pours it in" — the water now comes from the stand (= 送る側の装置, `one` / detail coil-pad / points[0]), so the image no longer fits EH (energy gathered from the surroundings). Tray image gone (grep 0 / 0 / 0). The opening clause (コンセントに差し込む代わりに) is unchanged | No | OK |
| p11 | `terms[2](自動運転).detail_zh` (+ explanation_zh) | L10 | Yes: 「…规定系统在哪些场景下可以驾驶的规则。」 — 決まり is now the noun 规则 and 规定 no longer reads as the main verb; = jp 「システムが運転してよい場面の決まりを指す」 / en "the rules for when the system may drive" | No | OK |

### U3.3 Focused checks — M1 (energy-harvesting sources)

- After (三語): jp 「**ワイヤレス給電** は送る側の装置から非接触で電力を受け取る技術で、周囲の光や振動、温度差などから取り出したわずかなエネルギーを電力にする **エネルギーハーベスティング** とは電力の出どころが違う。」 zh 「…而**能量收集**[[jp:エネルギーハーベスティング]]是把从周围的光、振动、温差等获取的微弱能量转换为电力，两者电力的来源不同。」 en "…whereas **energy harvesting** [[jp:エネルギーハーベスティング]] turns small amounts of energy taken from surrounding light, vibration, temperature differences and the like into electricity, so the source of the power differs." The sources are no longer limited to vibration / light: 温度差 / 温差 / temperature differences is back, and the open marker など / 等 / "and the like" is present in all three languages (zh / en no longer read as a closed list).
- **vs 2020r02o-q074** (re-read; answer ウ エネルギーハーベスティング; stem: 光や熱 (温度差) など; wrong PLC / PoE / スマートグリッド): the 考点 now covers the stem's items (光 / 熱 = 温度差) with など, adds 振動 (standard fact, does not favour any wrong option), and still contrasts EH with ワイヤレス給電 (送る側の装置から受け取る) by power source. qid kept, kind mix, 1 sentence, 92 chars without spaces (≤100; Rule A pre-measured 95, counting spaces).
- **vs u01** (`data/ip/textbook/units/strategy-05-17-u01.json` `terms[0].points[1]`): 「周囲の光や振動、温度差などにあるわずかなエネルギー」/「周围的光、振动、温差等所含的微弱能量」/ "surrounding light, vibration, temperature differences and the like". u03's list now has the same three items in the same order with the same open marker in all three languages, so the two units agree.
- Siblings: `terms[5].one` / `detail` (coil, magnetic field, pad, EV parking) and the new analogy (supply stand pours in) all describe receiving power from a sending device, consistent with the first half of the 考点. Bold 2 → 2, `[[jp:]]` 2 → 2 in zh / en. Parity 27 / 0 diff. **u03: M1 and L6–L10 resolved.**

## U4. strategy-05-17-u04 (Rule A FAIL M1 + M2, 建議修 L1 / L11 / L13)

### U4.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | zh | **4 → 6** (智能电表 → 发送给供应商, 2023r05-q098 c1 = correct イ, zh translation) | 6 (same) |
| p02 | jp | 4 → 4 (スマート, unchanged) | 4; win12 0/0 → 0/0; Dice 0.12 → 0.10 |
| p03 | zh | 5 → 5 ("smart", unchanged) | " IoT " (5) |
| p04 | jp | 5 → 5 (センサで計, unchanged) | ている。 (4); win12 0/0 → 0/0; Dice 0.08 → 0.07 |
| p05 | zh | 4 → 4 (传感器测, unchanged) | 老龄化 (3) |
| p06 | en | 15 → 15 (" automatically ", unchanged) | " an aging " (10) |
| p07 | zh | 4 → 4 (的传感器, unchanged) | 企业 (2) |
| p08 | en | 13 → 13 (" equipment in", unchanged) | "s that a" (8) |

- **p01** +2: the new span 「发送给供应商」 is the generic "send to the supplier" with the term 供应商, matching q098's **correct** option zh (イ) — the very wording Rule A M1 cited as the target. jp 「通信で供給事業者へ送る」 and en " to the supplier " (17 chars, unchanged, also q098 イ) already carried the same element before the patch, so zh only catches up with jp / en. Targeted (`qcite.mjs`, q098): jp detail LCS 8 (スマートメーター) unchanged, win12 0/0, Dice 0.18, ed-best 0.83; zh LCS 4 → 6; en 17 → 17. Rule A L2 (記録のみ) already ruled on this definition's closeness to q098 イ; the patch adds no new element (no 回線 name, no 電気・ガス pair, no 設置場所). Not a D-198 issue.

### U4.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[5](HEMS).detail_zh` (+ explanation_zh) | M1 | Yes (§U4.3) | No | OK |
| p02–p03 | `terms[0](スマートシティ).hook_jp/zh` (+ memory_hook_jp/zh, summary.memory_hooks_jp/zh[0]) | M2 | Yes (§U4.3) | No | OK |
| p04–p06 | `terms[4](スマート農業).detail_*` (+ explanation_*) | L1 | Yes: 「…補う手段になっている。」/「成为弥补…的手段。」/ "and these tools help make up for…" — §9 とされる gone (grep とされる 0 in the unit); the claim stays a role statement, no new universal | No | OK |
| p07 | `terms[0].detail_zh` (+ explanation_zh) | L11 | Yes: 「各地的地方政府和企业都在推进。」 = jp 「各地の自治体」, and now matches `pairs[0].rows[2].a_zh` 「地方政府」 (grep 各地政府 0, 地方政府 3) | No | OK |
| p08 | `terms[6](ドローン).detail_en` (+ explanation_en) | L13 | Yes: "survey wide areas and high places that are hard for people to reach" — the relative clause now attaches to high places only, = jp 「人が近づきにくい高い所や広い範囲」 | No | OK |

### U4.3 Focused checks — M1 (zh 送り先) and M2 (スマート〜 hook)

- **M1 after**: zh 「自动计量用量并通过通信发送给**供应商**的计量表叫作**智能电表**[[jp:スマートメーター]]，HEMS 也能导入它的计量值。」; jp 「…通信で供給事業者へ送る計量器を **スマートメーター** といい…」 and en "…sends it to the supplier over a network…" are unchanged. The destination is no longer limited to the electricity supplier (供电企业 0 in the unit); all three languages now say "supplier" without naming the energy type. **vs 2023r05-q098** (re-read; answer イ: 電気やガスなど の使用量 → 供給事業者; zh 「供应商」): consistent, and the zh term is the one the translation layer uses for the same option. `one_zh` 「对家庭使用的电等能源」 and `pairs[0].rows[1].b_zh` keep 等, as Rule A noted. Bold 1 → 1, `[[jp:]]` 1 → 1.
- **M2 after**: jp 「smart は英語で「賢い」、city は「都市」。この単元の見出し語のうちスマート〜の 3 語は、後ろに付く語 (都市・工場・農業) が IoT を当てはめる場や分野を表す。」; zh 「…本单元标题词中的 3 个「智慧～」，后面接的词（城市、工厂、农业）表示 IoT 应用的场所或领域。」; en (unchanged) "In this unit, the word that follows "smart" (city, factory, agriculture) names the place where IoT is put to work."
- **Every スマート〜 term in the unit** (unit-wide enumeration, non-derived fields):
  - Headwords: スマートシティ (11 occurrences), スマートファクトリー (9), スマート農業 (`terms[4].term` + one) — exactly the 3 words the hook now names; the suffixes 都市 / 工場 / 農業 are a place or field. The other 4 headwords (マシンビジョン / 産業用ロボット / HEMS / ドローン) are not スマート〜.
  - **スマートメーター** (`terms[5].detail_jp/zh/en`, 3): not a headword (it is defined inside HEMS detail), so the hook no longer claims it; the counter-example Rule A M2 found is now outside the hook's scope.
  - スマート化 (`title_jp`, `terms[1].detail_jp` 「工場のスマート化」, `key_points_jp[2]` 「街や農業のスマート化」): not a headword and not a スマート + place word; outside the hook's scope, and its use (making a place / field smart) does not contradict it.
  - zh: 智慧城市 / 智慧工厂 / 智慧农业 are the only 智慧〜 words (the hook's 「3 个「智慧～」」 is exact); スマートメーター is 智能电表 and スマート化 is 智能化, so even the zh surface form does not fall under 智慧～.
  - en: smart city / smart factory / smart agriculture (term + one + points) and "smart meter" (HEMS detail, 1). The en hook already limits itself to "(city, factory, agriculture)", so smart meter was never claimed in en; en stays consistent with the narrowed jp / zh scope.
- **en consistency**: jp / zh now say 「場や分野」/「场所或领域」, en says "names the place". The scope (3 words) is the same in all three languages; en's "place" is narrower than 「場や分野」 only for agriculture, which still reads as where IoT is put to work (farms / fields), so it is not a contradiction (§5 Obs. 3). Rule A M2 prescribed en unchanged.
- D-197: the parenthesis lists the suffix words (都市・工場・農業 / 城市、工厂、农业), not headwords, as Rule A designed; validate 0. Derived memory_hook_jp/zh and summary.memory_hooks_jp/zh[0] follow (pairing 0 bad). Parity 33 / 0 diff. **u04: M1, M2 and L1 / L11 / L13 resolved.**

## 4. F-fix

No required F-fix in any of the 4 units. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: 0 warns in all 4 units (unit and part).
   - `stage` meta is removed in all 4 units (as in b19–b65).
   - ruleA verbatim miss = none. 11 of 31 patches use shortened phrases and 2 (u02 p02 / p03) use extended phrases; same.mjs shows all 31 give the same field as the Rule A strings.
   - u01 / u04 bases are attempt `a2`, u02 / u03 attempt `a1`; all `loc.r0`. u03 / u04 patches mix labelled (`terms[5](ワイヤレス給電)…`) and unlabelled paths; both resolve in check.mjs / d198.mjs / same.mjs.
2. u02 fig: node[1] keeps the id `recog` (React key only, not rendered). The fig has no explicit "voice → text" node; 音声認識 is now carried by `one` alone and the fig no longer contradicts it. Rule A prescribed no fig step change. If the fig is touched later, labelling step 3 as text analysis would mirror q078's (1) / (2) split; nothing requires it.
3. u04 M2: jp / zh hook now say 「場や分野」/「场所或领域」 while en (unchanged per Rule A) says "names the place". Same 3-word scope in all three languages; only the noun differs for agriculture. Not a contradiction.
4. u04 `terms[0].detail_zh` keeps 「它也被看作维持公共服务的手段」 (被看作 = a とされる-like hedge in zh) where jp says 「…手段として…取り組んでいる」. Untouched by p07 (which changes only 各地政府 in the next clause); zh is not covered by the §9 grep. Rule A did not flag it. Recorded.
5. u04 zh hook uses 「标题词」 for 見出し語 (only occurrence in the repo; 词条 is more common). Meaning is clear; this is the text Rule A M2 prescribed.
6. u01 p05 zh 「这些设施」 adds a demonstrative absent in jp 設備; it points back to the storage / analysis place in the sentence before, so the sense is unchanged.
7. D-198 rises: u04 p01 +2 (「发送给供应商」 = q098 correct option zh; jp / en already had it), u03 p03 +4 ("temperature differences" = q074 stem item that M1 restores), u02 p04 1 → 3 (マイク vs マイクロコンピュータ, coincidence), u03 p05 / p09 +1 (generic). All analysed in §U2.1 / §U3.1 / §U4.1.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| strategy-05-17-u01 | PASS | **6/6** | — | 0 / 0 / 0 | **PASS** |
| strategy-05-17-u02 | FAIL (M1) | **6/6** | M1 resolved (one → voice to text data; fig node = mic capture; = q078 ア and strategy-05-14-u07) | 0 / 0 / 0 | **PASS** |
| strategy-05-17-u03 | FAIL (M1) | **11/11** | M1 resolved (光や振動、温度差など in 三語; = q074 and u01) | 0 / 0 / 0 | **PASS** |
| strategy-05-17-u04 | FAIL (M1, M2) | **8/8** | M1 resolved (zh 供应商; = jp / en / q098); M2 resolved (hook scoped to the 3 スマート〜 headwords; スマートメーター / スマート化 outside; en consistent) | 0 / 0 / 0 | **PASS** |

- **Application:** 31/31 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (276 checked, 0 mismatch), memory_hooks pairing 0 bad. 11/31 shortened and 2/31 extended, and all 31 give the same field as the Rule A string (same.mjs). Every MEDIUM and 建議修 is covered.
- **D-198:** no patch adds a meaningful overlap. The rises are u04 p01 +2 (q098 correct option zh, already in jp / en), u03 p03 +4 (q074's 温度差 item, term-level noun; jp / zh Dice / ed unchanged or farther), u02 p04 +2 (katakana coincidence), u03 p05 / p09 +1 (generic). u02 one_jp vs q078: win12 0, Dice 0.23, ed 0.82.
- **D-200:** the only patched 考点 (u03 `terms[5].points[0]`, mix, qid kept) is 1 sentence, 92 chars; no 考点 claim reversed. **D-202:** `[[jp:]]` origin miss 0 in all 4 units; bold / tag counts unchanged in all 31. **D-204 / 書き方 7:** u02 one ↔ fig and u04 hook ↔ HEMS detail no longer conflict; u03 analogy now matches `one`. **D-205 / D-210:** no new law, standard, version or numeric claim; u01 p01–p03 and u03 p01–p03 remove a universal / closed-list reading; u02 adds no claim about where recognition runs.
- **Gates:**
  - validate --unit ×4: 0 issues / EXIT 0 (0 warns)
  - validate --part ×4: 0 issues, sha256 = base_sha256 for each
  - parity ×4: 0 diff (32 / 28 / 27 / 33 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for all 4 units.** All 31 active patches are applied exactly, and every MEDIUM and 建議修 LOW is resolved in context in all three languages:
- u02 p01–p06: 音声認識 now converts speech to text data (one 三語) and the capture node says microphone pickup, matching 2024r06-q078 ア and strategy-05-14-u07.
- u03 p01–p03: EH sources are 光や振動、温度差など / 光、振动、温差等 / "light, vibration, temperature differences and the like", matching 2020r02o-q074 and u01's EH 考点.
- u04 p01: zh destination is 供应商 (= jp 供給事業者 / en supplier / q098 zh). p02–p03: the hook speaks only of the 3 スマート〜 headwords (シティ / ファクトリー / 農業); スマートメーター (HEMS detail) and スマート化 fall outside it, and en's existing "(city, factory, agriculture)" scope is the same.

None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
