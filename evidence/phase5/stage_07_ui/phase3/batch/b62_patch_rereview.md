# b62 B3 patch re-review — technology-15-42 u01〜u05 (映像・シリアル / 無線 IF、センサー 2 単元、アクチュエーター)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the five Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b62rv/`: `check.mjs` / `d198.mjs` / `same.mjs` copied from `b61rv/` with only the unit map changed (now 5 units). `same.mjs` reads the 39 Rule A full before / after pairs from `b62rv/ra.json`, which I copied by hand from the Rule A files. No scratch files in the repo.
- Date: 2026-11-08 (Session 151, b62)
- Scope: the B3 wording patches for 5 units. **39 are `active`, 0 retired**, all part-level:

| Unit | Rule A | Patches | Mapping to Rule A prescriptions | Shortened |
|---|---|---|---|---|
| u01 (信号方式と映像インタフェース) | PASS, 建議修 L1–L3 | p01–p07 | L1 → p01–p03 (`key_points_jp/zh/en[1]`); L2 → p04–p06 (`terms[3].points[0].text_*`); L3 → p07 (`terms[4].points[0].text_en`) | 7/7 |
| u02 (シリアル・近距離無線) | **FAIL M1** + 建議修 L1/L2/L3/L5 | p01–p07 | M1 → p01 (`terms[1].analogy_en`); L1 → p02–p04 (`terms[1].hook_*`); L2 → p05 (`terms[2].points[1].text_en`); L3 → p06 (`overview_rows[3].one_line_zh`); L5 → p07 (`terms[2].points[0].text_jp`). Optional L12 not adopted | 4/7 (p02, p03, p05, p06) |
| u03 (光・赤外線・磁気・加速度・ジャイロ) | PASS, 建議修 L1–L6 | p01–p09 | L1 → p01–p03 (`terms[1].detail_*`); L2 → p04 (`terms[3].hook_zh`); L3 → p05 (`terms[1].hook_zh`); L4 → p06 (`pairs[0].rows[0].a_zh`); L5 → p07–p08 (`overview_rows[1].extra_zh[1]` / `pairs[0].rows[2].b_zh`); L6 → p09 (`terms[4].detail_en`) | 6/9 (p03, p04, p05, p07, p08, p09) |
| u04 (超音波・温度・湿度・圧力・煙) | PASS, 建議修 L1–L4 (L1 要適用) | p01–p08 | L1 → p01–p03 (`terms[3].points[0].text_*`); L2 → p04 (`terms[2].detail_en`); L3 → p05 (`terms[4].hook_en`); L4 → p06–p08 (`terms[1].points[0].text_*`) | 2/8 (p04, p05) |
| u05 (アクチュエーターとデバイス制御) | **FAIL M1** + 建議修 L1/L3/L4 | p01–p08 | M1 → p01–p03 (`terms[4].points[1].text_*`); L1 → p04 (`key_points_zh[1]`); L3 → p05 (`terms[2].detail_zh`); L4 → p06–p08 (`terms[3].analogy_*`) | 7/8 (all but p05) |

  Both M1s and every 建議修 are covered. 記録のみ LOWs and O-items are not patched and not re-ruled here.
  - **Shortened strings**: **26 of 39**. Each shortened `before` / `after` is a phrase inside the Rule A before / after string. `same.mjs` confirms that base.replace(Rule A before, Rule A after) = unit field for **39/39**, so the shortened patches give the same result as the Rule A full strings.
- Pre-patch bases, located by sha256 = `base_sha256` (validate --part prints the same sha):
  - u01 `data/ip/textbook/.planning/v2/technology-15-42-u01/parts/b62-u01-a2/technology-15-42-u01.loc.r0.json` `26afd1c980ac7c18…`
  - u02 `.../technology-15-42-u02/parts/b62-u02-a1/technology-15-42-u02.loc.r0.json` `d9c683db48cadf26…`
  - u03 `.../technology-15-42-u03/parts/b62-u03-a2/technology-15-42-u03.loc.r0.json` `199a3d407995229e…`
  - u04 `.../technology-15-42-u04/parts/b62-u04-a1/technology-15-42-u04.loc.r0.json` `774bcd005014dbc3…`
  - u05 `.../technology-15-42-u05/parts/b62-u05-a1/technology-15-42-u05.loc.r0.json` `8a48022a616add78…`
- Merged units (current) `data/ip/textbook/units/technology-15-42-u0N.json` sha256: u01 `d85eaec3e15a718e…`, u02 `f724b5fd4fdd976e…`, u03 `d0931a2a7eae3888…`, u04 `345c7564809158a2…`, u05 `14f32e44b513440f…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b61_patch_rereview.md` §0 (no unit-level patches in this batch). All 5 units share topic technology-15-42 (25 questions), so there are 125 source strings per language.

1. **Application check** (`b62rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b62rv/same.mjs`: full Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b62rv/d198.mjs`, all 39 patches): whole-field LCS before → after and LCS of the `after` span against the 125 sources per language; jp also 12-char windows (unmasked / masked) and Dice.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + `translations/<exam>.json` (en / zh choice wording): 2013h25a-q021 (answer ア = one console, two controllers by wireless; wrong エ = IC transit card at a gate) for u02 M1; 2019r01a-q058 (answer ア = drivers installed separately from the OS must be reinstalled after HDD init + OS reinstall), 2017h29h-q064 (answer イ = PnP installs the matching driver into the OS), 2011h23a-q076 (answer ウ = PnP, "installs drivers into the system automatically") for u05 M1; 2026r08-q078 (answer エ センサー) / 2020r02o-q099 (answer エ = the actuator opens / closes the window; wrong ウ = converts temperature to an electrical signal) for u04 L4.
5. **Cross-unit check** for u04 L1: `data/ip/textbook/units/technology-15-42-u03.json` (加速度センサー `detail_*`, `points[0]`, `pairs[1].rows[0]`).
6. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (per-unit §3), plus unit-wide greps for old wording.
7. **Gates**: `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit` (per unit), `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b63): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 114 / u02 117 / u03 92 / u04 103 / u05 124) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-42-u01   → ✓ 0 issues                EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs   --unit technology-15-42-u01   → ✓ 27 locations, 0 diff    EXIT=0
$ ... validate --unit technology-15-42-u02 → ✓ 0 issues   EXIT=0 | parity → ✓ 23 locations, 0 diff  EXIT=0
$ ... validate --unit technology-15-42-u03 → ✓ 0 issues   EXIT=0 | parity → ✓ 25 locations, 0 diff  EXIT=0
$ ... validate --unit technology-15-42-u04 → ✓ 0 issues, 3 warning(s)   EXIT=0 | parity → ✓ 25 locations, 0 diff  EXIT=0
  warn  zh-term  overview_rows[2].extra_zh[1]  自動運転 → 自动驾驶 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[2](湿度センサー).detail_zh  自動運転 → 自动驾驶 not in the zh text
  warn  zh-term  pairs[0].rows[2].b_zh  自動運転 → 自动驾驶 not in the zh text
$ ... validate --unit technology-15-42-u05 → ✓ 0 issues   EXIT=0 | parity → ✓ 28 locations, 0 diff  EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --part <base>   (one per unit)
  u01 counts {"terms":6,"figs":2,"steps":3,"points":6,"pairs":3,"key_points":5,"goals":3}  sha256 26afd1c980ac7c18…  ✓ 0 issues  EXIT=0
  u02 counts {"terms":5,"figs":1,"steps":3,"points":12,"pairs":2,"key_points":5,"goals":3} sha256 d9c683db48cadf26…  ✓ 0 issues  EXIT=0
  u03 counts {"terms":5,"figs":2,"steps":6,"points":5,"pairs":2,"key_points":3,"goals":3}  sha256 199a3d407995229e…  ✓ 0 issues  EXIT=0
  u04 counts {"terms":5,"figs":2,"steps":8,"points":7,"pairs":2,"key_points":5,"goals":3}  sha256 774bcd005014dbc3…  ✓ 0 issues, same 3 zh-term warns  EXIT=0
  u05 counts {"terms":6,"figs":3,"steps":8,"points":7,"pairs":2,"key_points":4,"goals":3}  sha256 8a48022a616add78…  ✓ 0 issues  EXIT=0
  (all 5 sha256 = base_sha256 of every patch in that unit)
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs (per unit):
  u01 active 7 ok 7 | issues [] | changed base-present = 7 patched + 'stage' | unexplained besides 'stage' 0 | derived 66, mismatch 0 | memory_hooks 18 bad 0, lens 5/5/5
  u02 active 7 ok 7 | issues [] | changed base-present = 7 patched + 'stage' | unexplained 0 | derived 60, mismatch 0 | memory_hooks 15 bad 0, lens 5/5/5
  u03 active 9 ok 9 | issues [] | changed base-present = 9 patched + 'stage' | unexplained 0 | derived 48, mismatch 0 | memory_hooks 15 bad 0, lens 3/3/3
  u04 active 8 ok 8 | issues [] | changed base-present = 8 patched + 'stage' | unexplained 0 | derived 60, mismatch 0 | memory_hooks 15 bad 0, lens 5/5/5
  u05 active 8 ok 8 | issues [] | changed base-present = 8 patched + 'stage' | unexplained 0 | derived 63, mismatch 0 | memory_hooks 18 bad 0, lens 5/5/5
  base sha = base_sha256 for all 39; before count in base = 1 for all 39; replay mismatch 0
  base-only top keys (all 5): stage / round / jp_round (part metadata)
  net before remnant: 0 for all 39 (raw and stripped)
  bold counts unchanged in all 39; [[jp:]] counts unchanged in all 39
  derived followers (all true): u02 memory_hook_jp/zh/en of terms[1] (p02–p04); u03 explanation_jp/zh/en of terms[1] (p01–p03), memory_hook_zh of terms[3] / terms[1] (p04 / p05), explanation_en of terms[4] (p09); u04 explanation_en of terms[2] (p04), memory_hook_en of terms[4] (p05); u05 explanation_zh of terms[2] (p05); summary.key_points_* follow p01–p03 (u01) and p04 (u05)
  ruleA verbatim miss: [] in all 5 units
same.mjs (full Rule A before → after on the base field):
  Rule A before occurs once in the base field: 39/39 (u01 7/7, u02 7/7, u03 9/9, u04 8/8, u05 8/8)
  base.replace(Rule A before, Rule A after) == unit field: 39/39 true
grep in the units (old wording, expect 0):
  u01 "comes as" 0 / "DVI-I がある" 0;  "only HDMI" 1 (= p07 after "of the two, only HDMI")
  u02 "one particular" 0 / "北欧" 0 / "Scandinavia" 0 / "face-up" 0 / "一碰" 0;  "非接触型の IC" 2 (key_points_jp[2] + summary copy, not in scope, §U2.3)
  u03 "接收部" 0 / "exact" 0 / "posture" 0 / 汉字“加速” 0 / 日语“赤外” 0 / "整体" 0
  u04 "Flip" 0 / "It runs" 0 / "(傾き・振動など)" 0
  u05 "OS の一部" 0 / "不属于操作系统" 0 / "part of the OS" 0 / "气缸" 0 / 風船・风船・气球・balloon 0
```

The 3 validate warns on u04 (zh-term 自動運転 → 自动驾驶) are the false positives the Rule A file recorded (O1: 家電の自動運転 = 自动运行, not 自动驾驶). They appear on the base part too and no u04 patch touches a zh field with 自動運転 (p02 / p07 are `points[0].text_zh` of 圧力 / 温度センサー), so they are not caused by the patches.

**Application.** All 39 `before` strings occur exactly once in their base field, all 39 `after` strings are present, and replay reproduces every patched field. 26 are shortened phrases of the Rule A strings, and all 39 give exactly the Rule A after text (same.mjs 39/39). In u03, p07 and p08 have the same `before` (遥控器的接收部), each once in its own field.

## U1. technology-15-42-u01 (Rule A PASS, 建議修 L1–L3)

### U1.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → 4 (の信号を, function words) | B は (3); win12 0/0 → 0/0; Dice 0.09 → 0.09 |
| p02 | zh | 3 → 3 (使用 → 接口，, words) | 接口 (3) |
| p03 | en | 11 → 11 (" connector ", word) | " connector" (10) |
| p04 | jp | 4 → 4 (がある。) | がある。 (4); win12 0/0 → 0/0; Dice 0.11 → 0.11 |
| p05 | zh | 3 → 3 (信号的) | 信号的 (3) |
| p06 | en | 8 → 15 ("es such as the ", generic) | 15 (same) |
| p07 | en | 8 → 8 (" video, " → " of the ", generic) | 8 |

No patch adds a meaningful overlap (p06 +7 on the generic phrase "such as the").

### U1.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `key_points_jp/zh/en[1]` (+ summary) | L1 | Yes: 「主に D-sub 15 ピンの VGA 端子を使い」/「主要使用」/ "mainly uses" — now as strong as `terms[2].detail_jp` 「代表的な端子は」 | No | OK |
| p04–p06 | `terms[3](DVI).points[0].text_*` | L2 | Yes: 「DVI-I などがある」/「DVI-I 等类型」/ "comes in types such as … DVI-D and DVI-I" — open list, = `terms[3].detail_jp` 「DVI-I などの種類」; 2nd sentence (「すべてデジタル専用とみなすと…見落とす」) unchanged | No | OK |
| p07 | `terms[4](HDMI).points[0].text_en` | L3 | Yes: "but of the two, only HDMI also carries audio" — scoped to DVI vs HDMI like jp 「HDMI のほう」, so no conflict with DisplayPort (audio) | No | OK |

### U1.3 Focused checks

- No exam 考点 and no qid in the patched fields (Rule A: all 6 考点 are mix). D-200: p04 adds 2 chars to a 2-sentence 考点 (still well under 100). D-205: the open 「など」 removes the closed-list form (failure type 10); no number / version claim added.
- Siblings: `overview_rows[3]` / `pairs[1]` (DVI-D / DVI-I) and DisplayPort `points[0]` (映像専用ではない) are unchanged and agree. Parity 27 / 0 diff.
- **u01: all L1–L3 resolved.**

## U2. technology-15-42-u02 (Rule A FAIL M1 + 建議修 L1/L2/L3/L5)

### U2.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | en | 7 → 13 (" it has been ", generic; 2019r01a-q058 c2) | 13 (same) |
| p02 | jp | 5 → 5 (れている。, unchanged text) | まとめた (4); win12 0/0 → 0/0; Dice 0.12 → 0.12 |
| p03 | zh | 4 → 4 (" 10 ") | "10 " (3) |
| p04 | en | 12 → 12 ("\"Bluetooth\",", headword) | "k and " (6) |
| p05 | en | 12 → 12 (" communicate", unchanged text) | " to the " (8) |
| p06 | zh | 4 → 4 (通信标准) | 可通信 (3) |
| p07 | jp | 7 → 11 (非接触型 IC カード, term name; 2010h22h-q078 stem) | 11 (same); win12 0/0 → 0/0; Dice 0.19 → 0.19 |

p01 / p07 rise on a generic phrase and a term name (term names are outside D-198, as Rule A L5 states). No meaningful overlap.

### U2.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01 | `terms[1](Bluetooth).analogy_en` | **M1** | Yes (§U2.3) | No | OK |
| p02–p04 | `terms[1].hook_jp/zh/en` (+ memory_hook_*, summary) | L1 | Yes: 「デンマークとノルウェーをまとめた」/「统一丹麦与挪威」/ "united Denmark and Norway" — the usual account of Harald I (Jelling stone: Denmark and Norway); three languages agree | No | OK |
| p05 | `terms[2](RFID).points[1].text_en` | L2 | Yes: "shown to the scanner in turn" = jp 「1 つずつ見せる」 (no added face-up) | No | OK |
| p06 | `overview_rows[3].one_line_zh` | L3 | Yes: 「靠近即可通信的近场通信标准」 — no 碰 (contact), now agrees with `extra_zh[0]` 「无线（非接触）」 and jp 「かざして」 | No | OK |
| p07 | `terms[2].points[0].text_jp` | L5 | Yes: 「非接触型 IC カードは…」 — the zh / en `[[jp:非接触型ICカード]]` now matches the jp text (space-normalized, the same convention as `[[jp:USBハブ]]` / `[[jp:ICタグ]]` / `[[jp:IC乗車券]]`). Script: u02 `[[jp:]]` tags 16, space-normalized miss 0 (was 1) | No | OK |

### U2.3 Focused checks

- **M1 (p01, analogy count vs 2013h25a-q021).** After (三語): jp 「近くにいる決まった相手とだけ話せるトランシーバーのようなもの。」 zh 「就像一部只能与身边固定对象通话的对讲机。」 en "Think of a walkie-talkie that only talks to the partners it has been set up with, as long as they are nearby." The en no longer limits the partner to one; "partners it has been set up with" = jp 決まった相手 / zh 固定对象 (number-neutral) and matches the pairing step in `terms[1].detail_*`. q021 (re-read): answer ア = one home console with **two** controllers by wireless (en "Wirelessly connecting two controllers to a single home game console"); wrong エ = reading an IC transit card at an automatic gate. Applying the en image to ア now supports ア (several set-up partners nearby), and it does not point to エ (the analogy is about paired devices, not holding a card to a reader). `terms[1].points[1]` (qid 2013h25a-q021, "wireless earphones and keyboards", 「例えば」) is unchanged and agrees. Grep "one particular" 0. **M1 resolved in all three languages** (jp / zh were already correct; en now agrees).
- p07 / L5 scope: `key_points_jp[2]` (+ summary copy) still says 「非接触型の IC カード」. Rule A L5 named only `terms[2].points[0].text_jp`, and `key_points_zh/en[2]` carry no `[[jp:]]` tag (「非接触式 IC 卡」 / "contactless IC cards"), so the D-202 origin check is satisfied unit-wide. Notation drift only; recorded in §5, not a patch defect.
- Optional L12 (IrDA analogy 「テレビのリモコンと同じで」) not adopted, as the caller stated; Rule A rated it 記録のみ. Not re-ruled.
- Parity 23 / 0 diff; qids kept. **u02: M1 + L1/L2/L3/L5 resolved.**

## U3. technology-15-42-u03 (Rule A PASS, 建議修 L1–L6)

### U3.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 8 → 8 (ることができる。, unchanged text) | の信号を受 (5); win12 0/0 → 0/0; Dice 0.13 → 0.12 |
| p02 | zh | 4 → 4 (红外线的) | 信号的 (3) |
| p03 | en | 15 → 15 (" infrared light", unchanged text) | "emote control" (13, 2019h31h-q093 c1, object name) |
| p04 | zh | 3 → 3 (不会变) | 速度 (2) |
| p05 | zh | 1 → 2 (红外, term) | 2 |
| p06 | zh | 1 → 1 | 1 |
| p07 / p08 | zh | 2 → 2 (的接 → 信号) | 2 |
| p09 | en | 11 → 11 (" device is ", unchanged text) | " a device" (9) |

No patch adds a meaningful overlap.

### U3.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[1](赤外線センサー).detail_*` 3rd sentence (+ explanation_*) | L1 | Yes: 「人感センサーに使われるほか、リモコンが出す赤外線の信号を受けるテレビの受光部にも使われる」/ zh 「…就用到了它；电视上接收遥控器所发红外信号的接收器也用到了它」/ en "…and also in the part of a TV that picks up the infrared signal sent by the remote control" — the receiver now reads the remote's IR signal, not body heat; the heat-radiation sentences 1–2 are unchanged | No | OK |
| p04 | `terms[3](加速度センサー).hook_zh` (+ memory_hook_zh, summary) | L2 | Yes: 「“加速度”的“加速”在这里指速度发生变化（变快或变慢都算）」 — no longer asserts the Chinese word 加速 means "increase or decrease"; = jp 「速さが加わる (変わる)」 / en "accelerating means changing speed" | No | OK |
| p05 | `terms[1].hook_zh` (+ memory_hook_zh, summary) | L3 | Yes: 「“红外”就是彩虹中红色的更外侧」 — uses the zh word directly | No | OK |
| p06 | `pairs[0].rows[0].a_zh` | L4 | Yes: 「泛指光的有无或强弱（亮度）」 = jp 「全般」 / en "in general" (non-exclusive) | No | OK |
| p07–p08 | `overview_rows[1].extra_zh[1]` / `pairs[0].rows[2].b_zh` | L5 | Yes: 「遥控器信号接收器」 in both; = p02's 接收器 and en "remote-control receiver(s)" | No | OK |
| p09 | `terms[4](ジャイロセンサー).detail_en` (+ explanation_en) | L6 | Yes: "to work out a device's orientation" — no added "exact"; = jp 姿勢 / zh; the same detail already uses "orientation" in sentences 1–2 | No | OK |

### U3.3 Focused checks

- L1 tension with `pairs[0].rows[1].b_*` (熱を持つ物体の存在や温度, no など; Rule A L12 記録のみ) is unchanged and was not in scope; p01–p03 make the detail no longer imply the receiver reads heat, so the tension is smaller, not larger.
- Accelerometer wording that u04 L1 must match (re-read, unchanged): `terms[3].detail_jp` 「速度の変化に加えて、止まっていても常にかかる重力の向きも測れるので、機器の傾きが分かる」; `points[0]` 「重力を含む加速度を測るので、止まっていても傾きが分かる」; `pairs[1].rows[0].a` 「速度の変化 (加速度) と重力の向き」/「速度的变化（加速度）和重力的方向」/ "Change in speed (acceleration) and the direction of gravity". Used in §U4.3.
- Parity 25 / 0 diff. **u03: all L1–L6 resolved.**

## U4. technology-15-42-u04 (Rule A PASS, 建議修 L1–L4, L1 要適用)

### U4.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 4 → 4 (センサー, word) | など (2); win12 0/0 → 0/0; Dice 0.12 → 0.10 |
| p02 | zh | 3 → 3 (传感器) | 速度 (2) |
| p03 | en | 10 → 11 ("ed and the ", generic) | 11 |
| p04 | en | 15 → 13 (" automatically " → " is used for ") | 13 |
| p05 | en | 8 → 8 | " is a " (6) |
| p06 | jp | 9 → 9 (IoT デバイス, term) | IoT デバイス (8); win12 0/0 → 0/0; Dice 0.28 → 0.27 |
| p07 | zh | 7 → 7 (IoT 设备, term) | 7 |
| p08 | en | **38 → 38** (" temperature into an electrical signal", 2020r02o-q099 c2 = wrong ウ, unchanged text) | " an IoT device " (15, stem term) |

p08's whole-field 38 is in the unchanged first half of the sentence (sensor = temperature → electrical signal). It is not caused by the patch (38 → 38), it is the en layer only, and the jp 考点 had win12 0 (Rule A). In q099 ウ is wrong only because the question asks for the actuator's role; the textbook gives that role to the sensor, which is correct and points the reader away from ウ. Recorded in §5.

### U4.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[3](圧力センサー).points[0].text_*` | L1 | Yes (§U4.3) | No | OK |
| p04 | `terms[2](湿度センサー).detail_en` (+ explanation_en) | L2 | Yes: "It is used for automatic humidifier and dehumidifier operation and to help prevent…" — the sensor is no longer the subject that runs the devices; = jp 「…などに使われる」 and the sensor = input / actuator = output split in `terms[1].points[1]` | No | OK |
| p05 | `terms[4](煙センサー).hook_en` (+ memory_hook_en, summary.memory_hooks_en[4]) | L3 | Yes: "Put the saying \"where there's smoke, there's fire\" to work: the sensor is a lookout that suspects fire as soon as it sees smoke." — no "Flip", so the logic is smoke → fire, consistent with the English proverb's direction; jp / zh (逆から読む / 倒过来读) are right for their own proverb 火のない所に煙は立たぬ | No | OK |
| p06–p08 | `terms[1](温度センサー).points[0].text_*` | L4 | Yes: 「IoT デバイスなどの入力とする部品」/「IoT 设备等的输入的部件」/ "feeds it as input into an IoT device or other equipment" — no longer reads as IoT-only; = detail (エアコン・冷蔵庫・IoT). The exam 考点 keeps qid 2026r08-q078 and still matches its answer エ (センサー, IoT scenario); kind exam / qids unchanged | No | OK |

### U4.3 Focused checks — L1 vs u03

- After (三語): jp 「**加速度センサー**は速さの変化や重力の向き (動き・傾き・振動など) を測る。」 zh 「测量速度的变化和重力的方向（运动、倾斜、振动等）」 en "measures changes in speed and the direction of gravity (movement, tilt, vibration and so on)". Tilt is now listed next to the direction of gravity, so it no longer reads as a "change in speed".
- **u03 consistency** (§U3.3): u03 says the accelerometer measures speed change plus the direction of gravity, so it can tell tilt (detail / points[0] / pairs[1].rows[0]). The u04 after names the same two quantities in the same order (zh 速度的变化和重力的方向 = u03 pairs zh word for word; en "the direction of gravity" = u03 pairs en). **Consistent in all three languages.** Minor differences: jp 速さ (u04) vs 速度 (u03), and en "acceleration sensor" (u04) vs "accelerometer" (u03, 9×). Both are pre-existing outside the patched spans, both use the same `[[jp:加速度センサー]]`, and neither changes meaning. Recorded in §5.
- The 考点's conclusion (測る量が違う) and the pressure-sensor side are unchanged. Bold 2 → 2, [[jp:]] unchanged. Parity 25 / 0 diff. **u04: L1–L4 resolved; L1 (要適用) applied.**

## U5. technology-15-42-u05 (Rule A FAIL M1 + 建議修 L1/L3/L4)

### U5.1 D-198

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap |
|---|---|---|---|
| p01 | jp | 6 → 6 (を初期化して, 2019r01a-q058 c0 = correct ア, unchanged 2nd sentence) | ドライバは (5); win12 unmasked 0 → 0, masked 3 → 3 (all in the unchanged 2nd sentence vs q058 ア); Dice 0.28 → 0.28 |
| p02 | zh | 5 → 5 (与操作系统, unchanged) | 驱动程序， (5) |
| p03 | en | 23 → 23 (" separately from the OS", q058 c0 = correct ア, unchanged span) | "separately from the OS" (22, same) |
| p04 | zh | 2 → 2 | 利用 (2) |
| p05 | zh | 3 → 3 | 的位置 (3) |
| p06 | jp | 4 → 4 (である。) | トロー (3); win12 0/0 → 0/0; Dice 0.06 → 0.06 |
| p07 | zh | 4 → 4 (的机制。) | 1 |
| p08 | en | 7 → 9 (" into a s", generic) | 9 |

All overlaps are unchanged spans or generic. p01–p03 do not raise any count. The q058 spans they keep are the **correct** option ア and were already judged by Rule A (L10-level, below calibration).

### U5.2 Per-patch verdict

| IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| p01–p03 | `terms[4](デバイスドライバ).points[1].text_*` | **M1** | Yes (§U5.3) | No | OK |
| p04 | `key_points_zh[1]` (+ summary) | L1 | Yes: 「利用流体的液压缸、气压缸」 — registered zh terms (油圧シリンダ → 液压缸, 空気圧シリンダ → 气压缸), order = term order; grep 气缸 0 | No | OK |
| p05 | `terms[2](油圧シリンダ).detail_zh` (+ explanation_zh) | L3 | Yes: 「容易在想停的位置准确地保持住」 = jp 「止めたい位置で正確に保ちやすい」 (hold, not stop) and = `pairs[0].rows[2].a_zh` 「容易准确保持位置」 | No | OK |
| p06–p08 | `terms[3](空気圧シリンダ).analogy_*` | L4 | Yes: straw + paper wad shooting out (三語 same image) — a one-direction, quick push by air pressure, which fits `one_*` 「ピストンを押し、直線的な動き」 and pairs (素早く軽い往復); the balloon (all-direction swelling) is gone (grep 0). The conclusion clause (空気の圧力で手早く押し出す) is unchanged | No | OK |

### U5.3 Focused checks — M1 (driver "not part of the OS")

- After (三語): jp 「OS と別に後から入れたドライバは、OS を入れ直しても一緒には戻らない。ディスクを初期化して OS を入れ直した後は、ドライバも入れ直す。」 zh 「…后来安装的驱动程序，不会随着操作系统的重装一起恢复。…」 en "A driver installed later, separately from the OS, does not come back when the OS is reinstalled. After you initialize the disk…, you have to reinstall the driver as well." The membership claim (OS の一部ではない / 不属于操作系统的一部分 / is not part of the OS) is gone in all three languages (grep 0 / 0 / 0, unit-wide).
- **2019r01a-q058** (re-read; answer ア = drivers installed separately from the OS must be reinstalled after HDD init + OS reinstall): the new sentence 1 states the reason ア gives (they are not restored with the OS) and sentence 2 states ア itself. It does not support イ (reinstall on new application), ウ (cannot delete) or エ (one printer driver for all). The qid is kept. D-200: still 2 sentences; jp 66 chars (≤100).
- **Sibling agreement**: `terms[5](プラグアンドプレイ).points[0]` 「…デバイスドライバを OS に組み込み、設定する」 (qids 2011h23a-q076 / 2015h27h-q082 / 2017h29h-q064) and fig step 3 「その機器に合うドライバを OS が組み込み」 are unchanged. They no longer conflict with the driver 考点: a driver can be installed into the OS and still not come back when the OS is reinstalled. q064 イ (PnP installs the matching driver into the OS) and q076 ウ (PnP, installs drivers into the system) both agree with the unit. `key_points_zh[2]` (与操作系统分开安装的驱动程序在重装操作系统后需要重新安装) and `pairs[1]` are unchanged and agree. `terms[4].fig` (アプリ → OS → ドライバ → 機器) is unchanged and is not a membership claim.
- Parity 28 / 0 diff; bold 0 → 0; [[jp:OS]] 1 → 1 in zh. **M1 resolved in all three languages.**
- L1 / L3 / L4 resolved (§U5.2). Parity 28 / 0 diff.

## 4. F-fix

No required F-fix in any of the 5 units. No patch introduces a HIGH, MEDIUM or LOW defect.

## 5. Observations (record only)

1. Script notes:
   - validate: u04 has 3 zh-term warns (自動運転 → 自动驾驶), the Rule A O1 false positive, on the base part too. u01 / u02 / u03 / u05 have 0 warns.
   - `stage` meta is removed in all 5 units (as in b19–b63).
   - ruleA verbatim miss = none. 26 of 39 patches use shortened phrases; same.mjs shows all 39 give the same field as the Rule A full strings.
   - u04 / u05 patches use labelled paths (`terms[3](圧力センサー)…`), u01–u03 unlabelled. Both forms resolve in check.mjs / d198.mjs / same.mjs.
2. u02 `key_points_jp[2]` (+ summary copy) still writes 「非接触型の IC カード」, while `terms[2].points[0].text_jp` now writes 「非接触型 IC カード」. This is outside Rule A L5's scope and has no `[[jp:]]` tag on the zh / en side, so D-202 holds. It is only notation drift. If anyone touches it later, align it with p07.
3. u04 en calls the accelerometer "acceleration sensor" (`terms[3].points[0].text_en`), while u03 uses "accelerometer" (9×). Both are pre-existing outside the patched span, both carry `[[jp:加速度センサー]]`, and the meaning is the same. Cross-unit en term drift only.
4. u04 `terms[1].points[0].text_en` keeps a 38-char en overlap (" temperature into an electrical signal") with 2020r02o-q099 ウ, a wrong option in an actuator question. The span is unchanged by p08 (38 → 38) and is en-only. It gives the role to the sensor, which is correct for the cited q078 (answer エ センサー) and leads away from ウ in q099. Not a patch defect. A later reword of the en (for example "converts the temperature it measures into an electrical signal") would lower it, but nothing requires it.
5. u03 `pairs[0].rows[1].b_*` (Rule A L12, 記録のみ) is unchanged; p01–p03 reduce the tension L12 noted.

## 6. Overall verdict

| Unit | Rule A | Applied | MEDIUM in scope | HIGH / MEDIUM / LOW introduced | Verdict |
|---|---|---|---|---|---|
| technology-15-42-u01 | PASS | **7/7** | — | 0 / 0 / 0 | **PASS** |
| technology-15-42-u02 | FAIL M1 | **7/7** | M1 → **resolved** (en; jp / zh already correct) | 0 / 0 / 0 | **PASS** |
| technology-15-42-u03 | PASS | **9/9** | — | 0 / 0 / 0 | **PASS** |
| technology-15-42-u04 | PASS | **8/8** | — (L1 要適用 applied, consistent with u03) | 0 / 0 / 0 | **PASS** |
| technology-15-42-u05 | FAIL M1 | **8/8** | M1 → **resolved** (jp / zh / en) | 0 / 0 / 0 | **PASS** |

- **Application:** 39/39 exact (replay, part-level). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (297 checked, 0 mismatch), memory_hooks pairing 0 bad. 26/39 shortened, and all 39 give the same field as the Rule A full string (same.mjs). Both M1s and every 建議修 are covered (u02 optional L12 not adopted, by design).
- **D-198:** no patch adds a meaningful overlap. The rises are u01 p06 +7 / u02 p01 +6 / u04 p03 +1 / u05 p08 +2 (generic phrases), u02 p07 +4 and u03 p05 +1 (term names). u04 p08's 38 is unchanged text (Obs. 4).
- **D-200:** no 考点 claim reversed; u05 p01–p03 restate the same q058 claim without the membership clause; u04 p06–p08 add 「など」 inside the q078 考点 (qid and answer kept). **D-202:** u02 `[[jp:]]` origin now 16/16 (space-normalized). **D-204 / D-205 / D-210:** no new law, standard, version or numeric claim; u01 p04–p06 remove a closed list.
- **Gates:**
  - validate --unit ×5: 0 issues / EXIT 0 (u04: 3 warns, pre-existing false positive)
  - validate --part ×5: 0 issues, sha256 = base_sha256 for each
  - parity ×5: 0 diff (27 / 23 / 25 / 25 / 28 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS for all 5 units.** All 39 active patches are applied exactly. Two MEDIUMs are resolved in context in all three languages:
- u02 p01: the Bluetooth analogy en now says "the partners it has been set up with", which fits 2013h25a-q021 ア (two controllers).
- u05 p01–p03: the driver 考点 now says a separately installed driver "does not come back when the OS is reinstalled" (= 2019r01a-q058 ア) instead of "not part of the OS", so it no longer conflicts with the PnP 考点 / fig (driver installed into the OS; 2017h29h-q064 イ, 2011h23a-q076 ウ).

u04 p01–p03 (L1) now say the accelerometer measures speed change and the direction of gravity, matching u03 (detail / points[0] / pairs[1].rows[0]) in all three languages. None of the patches introduces a HIGH, MEDIUM or LOW. No required F-fix.
