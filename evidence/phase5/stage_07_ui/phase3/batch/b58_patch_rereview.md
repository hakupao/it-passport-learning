# b58 B3 patch re-review — technology-15-40 u01 / u02 (コンピュータの5大機能 / プロセッサの種類と性能, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b58rv/` (`check.mjs` = `b53rv/check.mjs` with only the unit map changed; `d198.mjs` derived from `b57rv/d198.mjs`, multi-unit, plus a stop-rule block for u02; `same.mjs` replays the full Rule A before → after on the base field; `short.mjs` lists which patches carry shortened strings).
- Date: 2026-11-08 (Session 150 続)
- Scope: the B3 wording patches for technology-15-40-u01 and technology-15-40-u02. **19 are `active`, 0 retired**, all part-level (`patches/technology-15-40-u01.json` p01–p08, `patches/technology-15-40-u02.json` p01–p11).
  - Mapping to Rule A prescriptions:
    - u01 (PASS, 建議修 L1–L3): L1 → p01–p03 (`terms[4](出力).detail_jp/zh/en`); L2 → p04–p06 (`key_points_jp/zh/en[3]`); L3 → p07–p08 (`terms[3](入力).points[0].text_zh/en`)
    - u02 (PASS, attempt **a3** after the D-207 stop rule, 建議修 L1–L5): L1 → p01–p03 (`terms[1].points[2]`, multithread); L2 → p04–p06 (`terms[1].points[1]`, core count, near-copy of 2016h28a-q060 イ); L3 → p07–p09 (`terms[2].points[0]`, GPU); L4 → p10 (`overview_rows[0].one_line_zh`); L5 → p11 (`overview_rows[2].one_line_en`)
  Every 建議修 is covered. u01 L4 / L5 and u02 L6–L9 (記録のみ) and the O-items are not patched and not re-ruled here.
  - **Shortened strings** (`short.mjs`): u01 p01 and p04–p08, u02 p04 / p05 / p09 / p10 / p11 carry a shortened `before` / `after` (a part of the Rule A string); u01 p02 / p03 and u02 p01–p03 / p06–p08 are the Rule A strings as given. For all 19, replaying the **full** Rule A before → after on the base field gives exactly the unit field (§1 `same.mjs`), so each shortened patch is the same edit as prescribed.
- Pre-patch bases, located by sha256 = `base_sha256`:
  - u01 `data/ip/textbook/.planning/v2/technology-15-40-u01/parts/b58-u01-a1/technology-15-40-u01.loc.r0.json` `1ca4bb24b0763423…`
  - u02 `data/ip/textbook/.planning/v2/technology-15-40-u02/parts/b58-u02-a3/technology-15-40-u02.loc.r1.json` `c5704e9d0f53fc72…` (loc **r1** of a3; validate prints `part loc#1`)
- Merged units (current) `data/ip/textbook/units/technology-15-40-u01.json` sha256 `e99bdc70ca551cb5…` / `…-u02.json` `377103871f841fac…`. Each differs from its base only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-207, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only).

## 0. Method

Same as `b49_patch_rereview.md` §0 (no unit-level patches in this batch), with the `same.mjs` replay of b57. Topic technology-15-40 has 26 questions, so there are 130 source strings per language.

1. **Application check** (`b58rv/check.mjs`): base sha256; `before` once in the base field; replay in file order = unit field; every changed base-present path explained; net `before` remnant count (occurrences inside `after` subtracted); before / after verbatim (substring) in the Rule A file. Plus `b58rv/same.mjs`: full Rule A before occurs once in the base field, and base.replace(Rule A before, Rule A after) = unit field.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (hooked-terms pairing).
3. **D-198** (`b58rv/d198.mjs`, all 19 patches): whole-field LCS before → after and LCS of the `after` span against the 130 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked (カタカナ 4+ and 英数 → □, windows with < 6 real chars skipped) + wDice. For u02, a **stop-rule block**: the two D-207 spots (`terms[2].points[0]`, `terms[1].points[2]`) measured base → unit against only 2019r01a-q095 / 2025r07-q067 / 2016h28a-q058 (GPU) and 2015h27h-q065 (multithread) — LCS, 12-char windows, Dice, best-window normalised edit distance — and a unit-wide jp window scan against those 4 questions.
4. **Cited-question checks** in `data/ip/quiz/questions.json` + translations (stem_jp_clean): 2009h21a-q072 (functions of a computer; answer ア = 演算 works on 制御's instruction; wrong イ = 演算 exchanges data with 制御 / 入力 / 出力), 2014h26h-q062 (what carries data between CPU and memory / I/O devices; answer ア バス), 2016h28a-q060 (catalog items; answer イ = core count definition), 2015h27h-q065 (answer ウ マルチスレッド), 2013h25a-q066 (multi-core; answer エ, wrong イ "4 倍"), plus the GPU questions above.
5. **Manual reading** of each patched field in context (三語) and of the sibling fields it must agree with (§3).
6. **Gates** (each unit): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b57): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 101 / u02 125) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-40-u01
✓ technology-15-40-u01 unit: 0 issues (data/ip/textbook/units/technology-15-40-u01.json), 2 warning(s)
  warn  jp-origin  terms[3](入力).points[0].text_zh  出力: headword named in text_jp without [[jp:出力]] at its first 考点 occurrence (D-202)
  warn  jp-origin  terms[3](入力).points[0].text_en  出力: headword named in text_jp without [[jp:出力]] at its first 考点 occurrence (D-202)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-40-u01
✓ technology-15-40-u01 parity: 24 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-40-u02
✓ technology-15-40-u02 unit: 0 issues (data/ip/textbook/units/technology-15-40-u02.json), 4 warning(s)
  warn  zh-term  goals_zh[0]  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  overview_rows[0].extra_zh[1]  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](CPU).detail_zh  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](CPU).points[1].text_zh  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-40-u02
✓ technology-15-40-u02 parity: 26 locations, 0 diff
EXIT=0
validate --part (base):
  u01 loc#0 0 issues, 1 warning(s): zh-term terms[3](入力).points[0].text_zh 入出力 → 输入输出 (sha256 1ca4bb24… = base_sha256) EXIT=0
  u02 loc#1 0 issues, 4 warning(s): the same 4 ビット → 比特 warns (sha256 c5704e9d… = base_sha256) EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 8 ok 8 issues [] | u02 active 11 ok 11 issues []
  base sha = base_sha256 for all 19; before count in base = 1 for all 19; replay mismatch 0
  changed base-present paths = patched fields + 'stage' (u01 8+1 / u02 11+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata); unit-only paths u01 101 / u02 125
  derived checked u01 48 / u02 57, mismatch 0 (u01 terms[4].explanation_jp/zh/en follow p01–p03: true; summary.key_points_*[3] follow p04–p06)
  bold counts unchanged in all 19; [[jp:]] counts unchanged except u01 p07 / p08 (terms[3].points[0].text_zh/en 4 → 3: [[jp:入力]] + [[jp:出力]] → [[jp:入出力装置]]) — intended (§3.3)
  memory_hooks hooked-terms pairing: u01 15 checked / u02 15 checked, bad 0
  net before remnant: 0 for all 19 (raw and stripped)
  ruleA verbatim miss: u01 [] | u02 []
same.mjs (full Rule A before → after on the base field):
  Rule A before occurs once in the base field: 19/19
  base.replace(Rule A before, Rule A after) == unit field: 19/19 true
```

**Validate warns.**
- u02: the 4 ビット → 比特 warns are in fields no patch touches and appear identically on the base part, so they predate the patches (Rule A u02 O1: false positive, 32 位 / 64 位 is the standard zh).
- u01: **the warn set changed because of p07 / p08** (base: 1 zh-term; unit: 0 zh-term, 2 jp-origin). The zh-term warn is gone, as Rule A L3 predicted (输入输出 is now in the zh). The 2 jp-origin warns are **new, introduced by p07 / p08**, and Rule A did not predict them. They are a false positive of the validator, not a content defect (§3.3). There is no precedent in b49–b57 for a patch that adds a warn.

**Application.** All 19 `before` strings occur exactly once in their base field, all 19 `after` strings are present, replay reproduces every patched field. All 19 are the Rule A text (11 as shortened parts, 8 whole), and the shortened ones make exactly the Rule A edit (same.mjs 19/19).

D-198, before → after (`d198.mjs`, 130 sources per language; jp fields only carry the window columns):

| Patch | Lang | Whole-field LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | **jp** | 6 → 6 (ディスプレイ, term, unchanged part) | である。(4) | 0 / 0 → 0 / 0; 0.16 → 0.16 |
| u01 p02 | zh | 4 → 5 (中的数据。, 2009h21a-q072 エ, generic) | 中的数据。(5) | — |
| u01 p03 | en | 17 → 15 (" of computation", generic) | 15 | — |
| u01 p04 | **jp** | 8 → 8 (" CPU 内部の", unchanged part) | 8 | 0 / 0 → 0 / 0; 0.23 → 0.23 |
| u01 p05 | zh | 8 → 8 (" CPU 内部的", unchanged part) | 主存储器 (4, term) | — |
| u01 p06 | en | 18 → 18 (" closer to the CPU", unchanged part) | "torage location" (15, generic) | — |
| u01 p07 | zh | 10 → 10 (" CPU 与主存储器", unchanged part) | 输入输出设备 (6, term; 2014h26h-q062 zh stem) | — |
| u01 p08 | en | **13 → 25** (" and input/output devices", 2014h26h-q062 en stem) | 24 (same) | — |
| u02 p01 | **jp** | 7 → 7 (マルチスレッド, term) | が同時に (4, 2013h25a-q066 エ = correct) | 0 / 0 → 0 / 0; 0.22 → 0.21 (2015h27h-q065 stem) |
| u02 p02 | zh | 4 → 4 (让多个核 → 多线程（, term) | 不同的 (3) | — |
| u02 p03 | en | 14 → 14 (" in parallel i", unchanged sentence 1) | " the same t" (11, generic) | — |
| u02 p04 | **jp** | **9 → 6** (を担う中核部分の数, 2016h28a-q060 イ → デュアルコア, term) | 中核部分の数 (6, q060 イ) | 0 / 0 → 0 / 0; **0.44 → 0.38** (q060 イ) |
| u02 p05 | zh | 4 → 4 (的核心部) | 4 | — |
| u02 p06 | en | 24 → 24 (" the number of central ", q060 イ en, unchanged part) | 22 (same) | — |
| u02 p07 | **jp** | 6 → 6 (プロセッサで) | 6 | 0 / 0 → 0 / 0; 0.18 → 0.18 |
| u02 p08 | zh | 4 → 4 (的处理器) | 4 | — |
| u02 p09 | en | 18 → 16 (" is a processor de" → " is a processor ", 2019r01a-q095 stem, generic) | "a processor " (12) | — |
| u02 p10 | zh | 5 → 5 (的核心部件) | 执行指令 (4) | — |
| u02 p11 | en | 14 → 12 (generic) | processes (9) | — |

Stop-rule block (u02, against only the named questions):

```
STOP terms[2].points[0].text_jp base: LCS 6 "プロセッサで" (2019r01a-q095 stem) | win12 0/0 | Dice 0.12 (2016h28a-q058 c1) | ed-best 0.85 (2016h28a-q058 stem)
STOP terms[2].points[0].text_jp unit: LCS 6 "プロセッサで" (2019r01a-q095 stem) | win12 0/0 | Dice 0.13 (2025r07-q067 stem) | ed-best 0.83 (2016h28a-q058 stem)
STOP terms[1].points[2].text_jp base: LCS 7 "マルチスレッド" (2015h27h-q065 c2) | win12 0/0 | Dice 0.22 (2015h27h-q065 stem) | ed-best 0.89 (2015h27h-q065 stem)
STOP terms[1].points[2].text_jp unit: LCS 7 "マルチスレッド" (2015h27h-q065 c2) | win12 0/0 | Dice 0.21 (2015h27h-q065 stem) | ed-best 0.84 (2015h27h-q065 stem)
unit-wide jp windows vs the 4 stop-rule qs: unmasked [] / masked []
STOP terms[2].points[0].text_zh: LCS 4 "GPU " -> 4 | text_en: 18 " is a processor de" -> 16 " is a processor " (2019r01a-q095 stem)
STOP terms[1].points[2].text_zh: LCS 4 "多线程（" -> 4 | text_en: 14 " in parallel i" -> 14 (2015h27h-q065 stem, unchanged sentence 1)
```

No patch adds a copy-level overlap. wDice ≤ 0.38 in every jp field, below the HIGH calibration (ed 0.14 / Dice 0.52). The one rise (u01 p08 en, 13 → 25) is the term "input/output devices", judged in §3.3.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01–p03 | `terms[4](出力).detail_jp/zh/en` 2nd sentence (+ explanation_*) | L1 | Yes (§3.1): 「演算の結果など、記憶に保持されたデータ」 / 运算结果等保存在存储中的数据 / "data held in storage, such as the results of computation" — output now takes data held in storage; the results of computation are an example of that data, not a second source. No direct 演算 → 出力 path. 2009h21a-q072 ア supported, イ not supported | No | OK |
| u01 p04–p06 | `key_points_jp/zh/en[3]` (+ summary.key_points_*[3]) | L2 | Yes: 例えば / 等 / include open the list (キャッシュメモリ not excluded). Rest of the sentence (CPU に近いほど速いが容量は小さい) unchanged and still true with a cache | No | OK |
| u01 p07–p08 | `terms[3](入力).points[0].text_zh/en` | L3 | Yes (§3.3): 输入输出设备 = zh_terms 入出力 → 输入输出 (zh-term warn gone); `[[jp:入出力装置]]` origin is in the same field's jp (「…主記憶や入出力装置を結び…」, exact string). Meaning unchanged; 2014h26h-q062 ア バス supported | No content issue; 2 new **jp-origin warns** (validator false positive, obs. 1); en overlap with q062 stem 25 (term, obs. 2) | OK |
| u02 p01–p03 | `terms[1](マルチコア).points[2].text_jp/zh/en` 2nd clause | L1 (stop-rule spot b) | Yes (§3.4): 「分けたスレッドは別々のコアが同時に受け持てる」 — q065's closing element ⑤ (有効活用 → 無駄なく働かせられる) is gone; zh 都不闲着 / en "all of the cores are kept busy" gone, so nothing leans to 2013h25a-q066 イ (4 倍). D-200: 1 sentence / 63 chars | No | OK |
| u02 p04–p06 | `terms[1].points[1].text_jp/zh/en` | L2 | Yes (§3.5): 命令を処理する中核部分 = one_jp's own wording (zh 负责处理指令 = one_zh, en "process instructions" = one_en). jp LCS with q060 イ 9 → 6, wDice 0.44 → 0.38. q060 イ still supported (core = central part, dual / quad). D-200: 1 sentence / 51 chars | No | OK |
| u02 p07–p09 | `terms[2](GPU).points[0].text_jp/zh/en` | L3 (stop-rule spot a) | Yes (§3.4): 得意とする / 擅长 / excels at = pairs[0].rows[0] label 得意な処理; no longer reads as "drawing only", so GPGPU (terms[3]) and 2020r02o-q065 are not contradicted. D-200: 1 sentence / 49 chars | No (residual 专用 in sibling zh fields, obs. 3) | OK |
| u02 p10 | `overview_rows[0].one_line_zh` | L4 | Yes: 译码 = one_zh / fig / caption / key_points. No 解读 left anywhere in the unit (grep 0) | No | OK |
| u02 p11 | `overview_rows[2].one_line_en` | L5 | Yes: "processes, all at once, the mass of calculations needed for drawing" — all at once now modifies processes (= jp 一斉に処理する) | No | OK |

## 3. Focused checks

### 3.1 u01 p01–p03: what 出力 sends out

- Before: 「送り出される内容は、演算の結果や記憶に保持されたデータである。」 lists 演算の結果 and 記憶のデータ side by side, which can read as two sources (演算 → 出力 directly).
- After: 「送り出される内容は、演算の結果など、記憶に保持されたデータである。」 — one source (記憶), 演算の結果 is an example of the data held there. zh 「送出的内容是运算结果等保存在存储中的数据。」 and en "What they send out is data held in storage, such as the results of computation." say the same; 三語 parity ✓.
- 2009h21a-q072: ア (演算 works on 制御's instruction) is untouched (terms[0].points[0], pairs[0].rows[2]). イ (演算 exchanges data with 制御 / 入力 / 出力) is now less supported than before; ウ / エ (記憶 asking 演算 / 出力) are not supported — the sentence says what is output, not who requests it.
- Derived explanation_jp/zh/en = stripInline(detail_*) (check.mjs true). **Resolved.**

### 3.2 u01 p04–p06: open list of storage locations

- jp 「記憶の場所には、例えば CPU 内部のレジスタ、主記憶、補助記憶があり、…」 / zh 「…主存储器和辅助存储器等，…」 / en "Storage locations include the registers …". All three now open; summary.key_points_*[3] follow.
- Not a law / standard category (型 10 N/A); the 3-row table (terms[2].fig) is unchanged and still true. **Resolved.**

### 3.3 u01 p07–p08: 入出力装置 in zh / en, and the new jp-origin warns

- jp field (`terms[3].points[0].text_jp`, unchanged): 「バスは、CPU と主記憶や入出力装置を結び、…」 — the string 入出力装置 is present verbatim, so the new `[[jp:入出力装置]]` (zh and en) has its origin in the jp field (D-202 ✓). The removed `[[jp:入力]]` had no origin in this field (Rule A L3 (b)); the removed `[[jp:出力]]` likewise.
- zh 「输入输出设备[[jp:入出力装置]]」 matches zh_terms 入出力 → 输入输出; 设备 matches detail_zh 输入设备. en "input/output devices ([[jp:入出力装置]])".
- **New warns (validate --unit):** `jp-origin terms[3](入力).points[0].text_zh / text_en 出力: headword named in text_jp without [[jp:出力]]`. Cause, from `apps/web/src/lib/textbook/validateV2.ts`:
  - `jpOriginWarnings` (l. 396–440) scans text_jp for the unit's headwords, longest first. 出力 (terms[4]) is found inside 入出力装置.
  - `wordAt` (l. 359–367) blocks a match only when katakana touches katakana or alnum touches alnum; a kanji neighbour (入 before 出力) does not block it.
  - The function's own docstring says a headword inside a longer word is not counted (リスク inside プロジェクトリスクマネジメント). Here the jp does not name 出力 as a word; it names 入出力装置, whose origin is marked.
  - Before the patch the warn did not fire only because the zh / en carried `[[jp:出力]]` (from the split 输入 / 输出 wording that L3 removed).
  - The first 考点 that really names 出力 is `terms[4].points[0]`, and its zh / en carry `[[jp:出力]]`, so a reader still gets the jp word.
  - Adding `[[jp:出力]]` back to a sentence whose jp says 入出力装置 would mark a word that is not there, so no fix in the content. **False positive; LOW, record only** (obs. 1). It is warn-only (exit 0, 0 issues).
- D-198: en field LCS with the 2014h26h-q062 en stem rises 13 → 25 (" and input/output devices"); zh after-span 输入输出设备 (6) is in the q062 zh stem too. This is the term itself (入出力装置 = input/output devices, which L3 required), q062 is a name question (answer バス; wrong ハブ / ポート / ルータ), and the field keeps its own structure (links the CPU with main memory and I/O devices so the units can exchange data), not the stem's "between A and B, or between A and C". The same term was already in the q062 jp stem and the unit's jp before the patch. **Not a copy** (obs. 2).
- **Resolved.**

### 3.4 u02: the two D-207 stop-rule spots

**(a) GPU `terms[2].points[0]`** — after: 「GPU は描画のための計算を得意とするプロセッサで、その速さは多数のコアによる並行処理から生まれる。」

| Question (a1 / a2 copy element) | After | Measured |
|---|---|---|
| 2019r01a-q095 stem (processor developed for image processing; CPU 内蔵 → 拡張ボード flow) | No 開発された / 作られた, no flow | LCS 6 (プロセッサで, generic); 0 windows |
| 2025r07-q067 stem (3D image + video pair) | Not in the point | Dice 0.13 (best) |
| 2016h28a-q058 エ (runs fast instead of the CPU) | Not in the point | ed-best 0.83 |

zh 「GPU 是擅长绘图计算的处理器，它的速度来自大量核的并行处理。」 (LCS 4 "GPU "), en "…a processor that excels at the calculations for drawing, and its speed comes from many cores working in parallel." (LCS 16 " is a processor ", generic). 得意とする no longer says "only drawing". **The point traces none of the three GPU questions.**

**(b) Multithread `terms[1].points[2]`** — after: 「1 つのプログラムを複数のスレッドに分けて並行に進める方式を **マルチスレッド** といい、分けたスレッドは別々のコアが同時に受け持てる。」

| 2015h27h-q065 element (Rule A §3-2 (b)) | After |
|---|---|
| ① within one application | 1 つのプログラムを (minimal definition) |
| ② the parts that can run in parallel | absent |
| ③ split into processing units | 複数のスレッドに分けて (スレッド defined in detail) |
| ④ process concurrently | 並行に進める |
| ⑤ make effective use of the multi-core CPU | **absent** (無駄なく働かせられる removed) |

- Measured: LCS 7 (マルチスレッド, the answer term); 0 windows; Dice 0.22 → 0.21; ed-best 0.89 → 0.84. The ed drop is a length effect (shorter sentence, best-window normalisation), still far from 0.14. ①③④ are the minimal definition of the headword (D-209 classification exemption). The q065-specific elements ② and ⑤ are both gone.
- The new clause's nearest source is 2013h25a-q066 エ (**correct** option, "が同時に", 4 chars, generic). Wrong イ (4 倍) is no longer echoed by "all of the cores are kept busy" / 都不闲着. Wrong ア (the same job on each processor) is not supported (separate threads).
- zh 「分出的线程可以由不同的核同时承担。」 / en "Separate cores can then take on the separate threads at the same time." = jp. **The point no longer traces 2015h27h-q065.**

Unit-wide: no jp string in u02 has a 12-char window (≤2 subs, masked or unmasked) against any of the 4 stop-rule questions.

### 3.5 u02 p04–p06: core count

- After: 「コア数はプロセッサ内で命令を処理する中核部分の数で、2 個ならデュアルコア、4 個ならクアッドコアとなる。」 The 11-char near-copy 「演算を担う中核部分の数」 of 2016h28a-q060 イ is gone. The remaining 「中核部分の数」 (6) is the definition itself (the headword's what-it-counts).
- 命令を処理する中核部分 = terms[1].one_jp 「命令を処理する中核部分である コア」; zh 负责处理指令的核心部分 = one_zh; en "central parts that process instructions" = one_en. So the second half of L2 (field-to-field wording) is resolved too.
- en whole-field LCS 24 with q060 イ en (" the number of central ") is in the unchanged part and was there before (Rule A scoped L2 to the jp overlap; en is the natural rendering of the definition).
- Accuracy: a core is the unit that fetches and executes instructions — correct; q060 イ still supported; ア (inverse to frequency) / ウ (fewer threads faster) / エ (L2 closer than L1) not touched. **Resolved.**

### 3.6 u02 p10 / p11

- p10: overview_rows[0].one_line_zh 「译码并执行指令、控制其他部件的核心部件」 — 0 occurrences of 解读 left in the unit; = terms[0].one_zh 译码.
- p11: "A graphics unit that processes, all at once, the mass of calculations needed for drawing" — jp 「描画に必要な大量の計算を一斉に処理する…」, zh 一齐处理绘图所需大量计算; parity 0 diff. **Resolved.**

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect that needs a fix.

## 5. Observations (record only)

1. LOW (validator), u01 p07 / p08: 2 new `jp-origin` warns (出力 found inside 入出力装置 in text_jp). `wordAt` does not stop at kanji compounds. It is a false positive (§3.3), warn-only, exit 0. The content is right and needs no change. Possible tool follow-up, not a content F-fix: make `jpOriginWarnings` skip a headword that sits inside another marked jp word of the same field (here 入出力装置). It is the first patch-introduced warn in b49–b58; the warn list in the batch evidence should say so.
2. LOW (D-198, term), u01 p08: en field LCS with 2014h26h-q062 en stem 13 → 25 ("and input/output devices") — the term 入出力装置 as L3 required; not a copy (§3.3).
3. LOW (zh wording, pre-existing, outside L3's scope), u02: `terms[2].one_zh` 「图像处理专用处理器」 and `overview_rows[2].one_line_zh` 「图像处理专用部件」 keep 专用 (dedicated) where jp says 画像処理向け. This is the same tension L3 removed from points[0]. It is milder here, because one / overview are definitions and GPGPU follows in the same unit. Not required. If wanted: 「…的图像处理专用处理器」→「…的面向图像处理的处理器」 and 「…图像处理专用部件」→「…面向图像处理的部件」. hook_jp/zh 何を専門にするか / 专门做什么 is about the letter G, and the mermaid 特化 is Rule A O2. Both fine.
4. Script notes:
   - u02 validate: 4 ビット → 比特 warns predate the patches (same on base; Rule A O1).
   - `stage` meta is removed in both units (as in b19–b57).
   - ruleA verbatim miss = none. The 11 shortened patches are confirmed equal to the full Rule A edit by `same.mjs`.

## 6. Overall verdict

**u01 (technology-15-40-u01)**
- HIGH introduced: **0**. MEDIUM: 0 in scope; **0 introduced**.
- LOW introduced: 0 that need a fix. Recorded: obs. 1 (the jp-origin warn pair, validator false positive) and obs. 2.
- **Application:** 8/8 exact (6 shortened + 2 whole, all = Rule A edit). 0 unexplained diffs, 0 net remnants. Derived: 48 checked, 0 mismatch. L1–L3 covered.
- **D-202:** `[[jp:入出力装置]]` origin present verbatim in text_jp.

**u02 (technology-15-40-u02, a3)**
- HIGH introduced: **0**. MEDIUM: 0 in scope; **0 introduced**.
- LOW introduced: 0 that need a fix. Recorded: obs. 3 (pre-existing).
- **Application:** 11/11 exact (5 shortened + 6 whole, all = Rule A edit). 0 unexplained diffs, 0 net remnants. Derived: 57 checked, 0 mismatch. L1–L5 covered.
- **D-207 stop-rule spots:** both now trace none of 2019r01a-q095 / 2025r07-q067 / 2016h28a-q058 / 2015h27h-q065 (0 windows, LCS only term names, Dice ≤ 0.21, ed ≥ 0.83; unit-wide 0 windows).
- **D-198:** L2 near-copy reduced (jp LCS 9 → 6, wDice 0.44 → 0.38).
- **D-200:** points[1] 51 / points[2] 63 / GPU points[0] 49 chars, 1 sentence each.

**Gates**
- validate --unit: 0 issues / EXIT 0 ×2. u01 has 2 jp-origin warns, new from p07 / p08 (obs. 1); its base zh-term warn is gone. u02 has 4 pre-existing ビット warns.
- validate --part: 0 issues ×2 (sha256 = base_sha256).
- parity: 0 diff ×2 (24 / 26 locations).
- vitest textbook: 162/162.
- patch tests: 14/14.

**PASS.** All 19 active patches of technology-15-40 u01 / u02 are applied exactly. Each resolves its Rule A 建議修 (u01 L1–L3, u02 L1–L5), including the two D-207 stop-rule spots. None introduces a HIGH, MEDIUM or LOW that needs a fix. No required F-fix. Caveat: u01's validate warn list changed. The zh-term warn is gone, and 2 jp-origin false positives were added (obs. 1).
