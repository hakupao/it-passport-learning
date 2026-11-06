# b41 B3 patch re-review — technology-13-35 u01–u05 (情報に関する理論 1/2, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 148 続)
- Scope: the B3 wording patches for technology-13-35 u01–u05. **26 are `active` and 0 retired**: u01 p01–p05 / u02 p01–p05 / u03 p01 / u04 p01–p04 / u05 p01–p11 (`patches/technology-13-35-u0{1..5}.json`).
  I checked each patch against the Rule A prescriptions in `technology-13-35-u0{1..5}.ruleA.md`. Every 建議修 is covered:
  - u01: L1 → p01 (en), L2 → p02 (en), L3 → p03–p05 (三語)
  - u02: L1 → p01–p03 (三語, + `definition_*`), L2 → p04–p05 (en, + `explanation_en`)
  - u03: L1 → p01 (en, + `memory_hook_en` / `summary.memory_hooks_en[2]`)
  - u04: L1 → p01–p03 (三語), L2 → p04 (en)
  - u05: L1 → p01–p03 (三語, + `explanation_*`), L2 → p04–p05 (zh / en), L3 → p06 (en), L4 → p07–p08 (zh), L5 → p09–p11 (三語)
  All 5 Rule A files report HIGH 0 / MEDIUM 0 (PASS, D-199). LOWs marked 記録のみ are not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256`. Each unit has one base shared by all its patches:
  - u01 `b41-u01-a2/…loc.**r1**.json` `dc71cb352667cd4b…`
  - u02 `b41-u02-a1/…loc.r0.json` `96211f545602ebc6…`
  - u03 `b41-u03-a2/…loc.r0.json` `e0612d997b778945…`
  - u04 `b41-u04-a2/…loc.r0.json` `f0b9cba111accafa…`
  - u05 `b41-u05-a1/…loc.r0.json` `1854a7da1096b953…`
  
  All are under `data/ip/textbook/.planning/v2/technology-13-35-u0N/parts/`.
- Merged units (current) `data/ip/textbook/units/technology-13-35-u0N.json` sha256: u01 `6198e480…` / u02 `458ee8c6…` / u03 `a2fd2b57…` / u04 `f73f6ab0…` / u05 `59e858d1…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208 (+ S143 addendum), D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars, except term names and the alias 符号化ビット数 (§3.1).

## 0. Method

The method is the same as `b40_patch_rereview.md` §0. No `unit.*` patch is in this batch. Topic technology-13-35 has 35 questions, so there are 175 source strings per language.

1. **Application check** (`b41rr/check.mjs`, run unchanged): `after` present; `before` once in base; replay in file order = unit field; no `before` remnant in the unit; every changed base-present path explained; before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (suffix match).
3. **D-198** (`b41rr/d198b.mjs`): whole-field LCS before → after, and LCS of the `after` span against the 175 sources per language. For jp: 12-char windows (≤2 substitutions), unmasked / masked, + wDice.
4. **Cited-question checks.** These items were re-read in `data/ip/quiz/questions.json`:
   - 2023r05-q091 (活性化関数, answer エ), 2026r08-q082 (BP, ア), 2022r04-q067 (DL, イ), 2010h22h-q060 (符号化ビット数, ア)
   - a whole-bank search for 活性 / しきい / 閾 / ステップ関数 / 学習不足 / 過学習 / 未学習 / 符号化ビット / 量子化ビット
   - `data/ip/textbook/zh_terms.json` for 学習不足 / 過学習 / 活性関数 / 機械学習 / JISコード
5. **Manual reading** of each patched field in context: the whole term (one / detail / hook / points / fig), plus goals, pairs and the overview row.
6. **Gates** (each run on all 5 units):
   - `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`
   - `scripts/textbook-v2-parity.mjs --unit`
   - `npx vitest run src/lib/textbook`
   - `node --test scripts/textbook-v2-patch.test.mjs`

**Not established** (same as b14–b40): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows two things only: the patches are present and correct in context, and nothing but the patches changed in base-present paths. Unit-only paths (u01 167 / u02 127 / u03 98 / u04 120 / u05 109) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-07)

```
validate --unit: u01 0 issues, 3 warnings | u02–u05 0 issues, 0 warnings | EXIT 0 ×5
validate --part (base): u01 loc#1 0 issues, 3 warnings (same 3, sha256 dc71cb35… = base_sha256);
                        u02–u05 loc#0 0 issues (sha256 = base_sha256)
parity --unit: u01 30 / u02 22 / u03 25 / u04 27 / u05 28 locations, 0 diff
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: pass 14, fail 0
check.mjs:
  u01 active 5 ok 5 issues 4 (4 'remnant', see below)
  u02 5/5 issues 0; u03 1/1 issues 0; u04 4/4 issues 0; u05 11/11 issues 0
  changed base-present paths = patched fields + 'stage' in every unit; unexplained besides 'stage': 0
  derived checked 72 / 51 / 45 / 60 / 60, mismatch 0
  memory_hooks suffix: u01 18 'bad' 9 (index shift, see below); u02 12 / u03 9 / u04 15 / u05 15 bad 0
  ruleA verbatim miss: [] in all 5
```

**Application.**
- All 26 `before` strings occur exactly once in their base field, and all 26 `after` strings are present. Replay in file order reproduces every patched field. u05 `terms[2].detail_zh` and `detail_en` each carry 2 patches (p02 + p04, p03 + p05), and the replay applies both in order.
- Changed base-present paths are the patched fields plus the removed `stage` meta key, as in b19–b40. The base-only top keys `stage / round / jp_round` are part metadata. Unexplained content diffs: 0.
- **u01 'remnant' ×4 = false positive.** p04 and p05 are append patches: `before` is a prefix of `after`, so the unchanged `before` is always found inside the new text. I walked the whole unit by hand:
  - 「这个比特数称为 **量化位数**」: 2 hits (detail_zh, explanation_zh), both followed by 「（也称编码位数）」
  - "quantization bit depth**": 2 hits (detail_en, explanation_en), both followed by " (also called the encoding bit count)"
  - The only other "quantization bit depth" hit is `overview_rows[5].extra_en[1]` ("The number of levels is set by …"). That is a separate summary sentence, not the patched sentence (obs. 3).
  - p03 jp is not a prefix patch and has 0 remnants.
  - Real remnants: 0.
- **u01 memory_hooks 'bad' ×9 = index shift.** `terms[2]` (情報量) has an empty hook. So `summary.memory_hooks_*` has 6 entries for 7 terms, and check.mjs compares by term index. Matching by suffix gives terms 0, 1, 3, 4, 5, 6 → summary 0, 1, 2, 3, 4, 5 in all three languages, 18/18 ok. No u01 patch touches a hook.
- **Other `before` remnants: 0.** Strings checked (unit-wide): 「学习不足」 in zh, 「多层に重ねて」, 「叠成多层」, "stacking a neural network", "Think of induction as building up", 「基準を超えた」, 「超过基准」, "exceeds a threshold", 「非直线」, "not a straight line", "One layer is enough", 「漢字やかなを」, "the kanji set", "the result is garbled text".
- **No new validate warning.**
  - u01's 3 warnings are identical in the base and the unit. They are the false positives the Rule A file names: スイッチ → 交换机, and ビット → 比特 ×2.
  - u02–u05 have 0 warnings, so the revert step of b38 §0-5 is not needed.

**Derived fields.** 288 checked, 0 mismatch:
- u02 p01–p03 → `terms[1].definition_*`; p04 / p05 → `explanation_en`
- u03 p01 → `memory_hook_en` and `summary.memory_hooks_en[2]`
- u04 p04 → `terms[1].explanation_en`
- u05 p01–p05 → `terms[2].explanation_*`
- u01 p02 → `terms[4].definition_en`; p03–p05 → `terms[5].explanation_*`
- Points, goals, pairs and fig cells feed no derived field.

**Notation.** Bold / `[[jp:]]` counts are unchanged in every patched field, with one intended exception: u04 p02 / p03 add one `[[jp:機械学習]]` each in zh / en (prescribed by L1, to match points[0] / [2]). Bold is unchanged in all 26 fields.

D-198, before → after (`d198b.mjs`, 175 sources per language):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | en | 15 → 15 (2012h24a-q093 stem) | " quantization" (13, term) | — |
| u01 p02 | en | 12 → 12 | " the value t" (12, generic; 2023r05-q091 エ correct) | — |
| u01 p03 | **jp** | 5 → 7 (2010h22h-q060 stem) | 符号化ビット数 (7, the alias term; intended, §3.1) | 0 / 0 → 0 / 0; 0.15 → 0.19 |
| u01 p04 | zh | 4 → 4 | 编码位数 (4, alias) | — |
| u01 p05 | en | 20 → 20 (unchanged part) | "s is called the " (16, generic) | — |
| u02 p01 | **jp** | 5 → 5 | 2バイトで (5) | 0 / 0 → 0 / 0; 0.33 → 0.30 |
| u02 p02 | zh | 5 → 5 | 字节表示 (4) | — |
| u02 p03 | en | 18 → 18 (unchanged part) | " 2 bytes " (9) | — |
| u02 p04 | en | 14 → 19 (2009h21a-q097 stem) | " characters in jis " (19, generic + standard name) | — |
| u02 p05 | en | 20 → 20 (unchanged part) | " and similar " (13, generic) | — |
| u03 p01 | en | 18 → 18 (2022r04-q057 stem) | "e individual cases" (18, already in base) | — |
| u04 p01 | **jp** | 11 → 11 | ニューラルネットワーク (11, term) | 16 / 0 → 16 / 0 (term-driven, unchanged); 0.32 → 0.31 |
| u04 p02 | zh | 8 → 8 (unchanged part) | 脑神经回路的模型 (8, already in base) | — |
| u04 p03 | en | 20 → 19 | "e machine learning " (19, term) | — |
| u04 p04 | en | 22 → 22 (unchanged part) | " methods " (9) | — |
| u05 p01 | **jp** | 6 → 6 | したとき (4) | 0 / 0 → 0 / 0; 0.15 → 0.15 |
| u05 p02 | zh | 4 → 4 | 信号 (2) | — |
| u05 p03 | en | 25 → 25 (unchanged part, term) | "y when the " (11, generic) | — |
| u05 p04 | zh | 4 → 4 | 激活函数 (4, term) | — |
| u05 p05 | en | 25 → 25 | " the activation function " (25, term phrase, already in base) | — |
| u05 p06 | en | 7 → 7 | "can be " (7) | — |
| u05 p07 | zh | 2 → 1 | 合 (1) | — |
| u05 p08 | zh | 4 → 4 (unchanged part) | 的状态 (3) | — |
| u05 p09 | **jp** | 9 → 11 | ニューラルネットワーク (11, term) | 0 / 0 → 18 / 0 (term name; masked 0); 0.31 → 0.31 |
| u05 p10 | zh | 5 → 5 | 深度学习的 (5) | — |
| u05 p11 | en | 14 → 15 | " neural network" (15, term) | — |

No patched text comes near the calibration HIGH (ed 0.14 / Dice 0.52). Every masked jp window count is 0. The unmasked hits in u04 p01 / u05 p09 come only from the 11-char katakana term ニューラルネットワーク and its particles. Every after-span overlap is a term name, an unchanged base part, or a generic fragment. None leans toward a wrong option.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01 | `terms[6](A/D変換).points[0].text_en` | L1 | Yes: "is made of the level numbers … lined up in order" (plural, = jp 時刻ごとの番号の列) | No | OK |
| u01 p02 | `terms[4](標本化).one_en` (+ `definition_en`) | L2 | Yes: "at that moment" now attaches to "the value … has", and "once every fixed time interval" attaches to "taking" | No | OK |
| u01 p03–p05 | `terms[5](量子化).detail_*` (+ `explanation_*`) | L3 | Yes (§3.1) | No (obs. 3 LOW) | OK |
| u02 p01–p03 | `terms[1](JISコード).one_*` (+ `definition_*`) | L1 | Yes (§3.2) | No | OK |
| u02 p04 | `terms[1].detail_en` (+ `explanation_en`) | L2 | Yes: "the set of kanji and other characters in JIS X 0208" = jp 漢字などの集合 | No | OK |
| u02 p05 | `terms[0](符号化).detail_en` (+ `explanation_en`) | L2 | Yes: "can be garbled text and similar errors" = jp 文字化けなど | No | OK |
| u03 p01 | `terms[2](帰納推論).hook_en` (+ derived ×2) | L1 | Yes (§3.3) | No | OK |
| u04 p01–p03 | `terms[1](機械学習).points[1].text_*` | L1 | Yes (§3.4) | No | OK |
| u04 p04 | `terms[1].detail_en` (+ `explanation_en`) | L2 | Yes: "the three main methods" = jp 3 つ / zh 这 3 种, and three methods follow | No | OK |
| u05 p01–p03 | `terms[2](活性関数).detail_*` (+ `explanation_*`) | L1 | Yes (§3.5) | No | OK |
| u05 p04–p05 | `terms[2].detail_zh / _en` | L2 | Yes: 非线性 / "non-linear conversion" are the standard terms; jp 直線的でない is kept (Rule A: jp は可) | No | OK |
| u05 p06 | `pairs[0].rows[1].a_en` | L3 | Yes: "Can be just one layer" = jp 1 層でもよい / zh 1 层也可以, and b = "Many stacked layers" | No | OK |
| u05 p07–p08 | `terms[3](過学習).fig…cells[0].zh`, `points[0].text_zh` | L4 | Yes (§3.6) | No | OK |
| u05 p09–p11 | `goals_*[2]` | L5 | Yes (§3.7) | No | OK |

## 3. Focused checks

### 3.1 u01 p03–p05 (L3): alias 符号化ビット数

- After:
  - jp「このビット数を **量子化ビット数** (符号化ビット数ともいう) という」
  - zh「这个比特数称为 **量化位数**（也称编码位数）」
  - en "this number of bits is called the **quantization bit depth** (also called the encoding bit count)"
- **This fits 2010h22h-q060.** The stem uses 符号化ビット数 for the bits per sample and asks what changes when it goes 8 → 16 at the same sampling frequency; the answer ア is "amplitude recorded more finely". The unit says 「段階の数は 1 つの標本を何ビットで表すかで決まり」 in detail. points[0] already cites q060 and says 「ビット数を増やすと段階数が増え、値の大きさを細かく記録できる」. With the alias, the stem's word now links to this point. Wrong options イ (less data), ウ (less CPU) and エ (higher frequency limit) get no support: frequency belongs to 標本化 in terms[4].
- The alias is a parenthesis, not bold, so the heading term stays 量子化ビット数. zh_terms.json has no entry for 符号化ビット数 / 量子化ビット数, so there is no conflict.
- The only overlap with the q060 stem is the 7-char term name itself (D-198: a term name, not stem wording).
- **Resolved.**

### 3.2 u02 p01–p03 (L1): JISコード「ひらがな・全角カナ」

- After:
  - jp「英数字などを 1 バイト、漢字やひらがな・全角カナを 2 バイトで表す」
  - zh「汉字、平假名和全角假名用 2 字节表示」
  - en "2 bytes for kanji, hiragana and full-width kana"
- **The facts are correct.** JIS X 0208 contains kanji, hiragana and (full-width) katakana, plus symbols, and is coded in 2 bytes. Half-width katakana belong to JIS X 0201, coded in 1 byte. The narrow JIS code (ISO-2022-JP, detail sentence 2) switches between 1-byte and 2-byte sets, and its 2-byte set is JIS X 0208.
- **It now matches the same term's fig table cell for cell:**
  - X 0201 = 英数字・記号・半角カナ = 1 バイト
  - X 0208 = 漢字・ひらがな・全角カナ = 2 バイト (key row)
  
  The SJIS overview row (英数字や半角カナは 1 バイト) also no longer conflicts.
- 「英数字など」 still covers symbols and half-width kana on the 1-byte side. The base already said this; the patch does not touch it.
- No cited question asks about kana byte counts. 2009h21a-q097 is a capacity calculation that gives each field as JIS 1-byte or 2-byte code, so its answer depends only on the 1-byte / 2-byte split, which is unchanged. 2012h24a-q093 is an image-to-character mapping and does not depend on kana.
- **Resolved.**

### 3.3 u03 p01 (L1): Latin "lead into"

- After: "Induction comes from Latin for "lead into": the individual cases lead you into one general rule."
- **The etymology is correct.** *inductio* comes from *inducere* = *in-* ("into, in") + *ducere* ("to lead"), so "lead into / lead in" is the standard gloss. It now pairs with the deduction hook "Latin for "lead down"" (*de-* + *ducere*), as the Rule A file intends.
- **The direction matches the definition** (cases → general rule), so it does not lean toward deduction. It is a word-origin cue, not a restatement of the definition, which is the D-203 §6 point.
- jp / zh hooks (納 = おさめる) are unchanged. The en hook may use a different cue, as the jp-zh character hint does not carry over to en.
- **Resolved.**

### 3.4 u04 p01–p03 (L1): DL「層を何層にも重ねて」

- After:
  - jp「ニューラルネットワーク (…) の層を何層にも重ねて学ぶ」
  - zh「把神经网络（…）的层叠加成很多层来学习」
  - en "learns with a neural network (…), built from many stacked layers"
- **The sentence is now correct.** The layers are stacked, not several networks. This matches u05: the DL one says 中間層を何層にも深く重ねた, and pairs[0] contrasts 1 層でもよい with 何層も重ねる.
- It **agrees with 2022r04-q067 イ** (DL uses a neural network and finds patterns by itself) and supports none of the wrong options ア / ウ / エ (e-learning, expert system, adaptive learning).
- zh / en gain `[[jp:機械学習]]`, the same as points[0] / [2] of the same term (loc-review LOW closed).
- **Resolved.**

### 3.5 u05 p01–p03 (L1): 活性関数「基準に達したとき」

- After:
  - jp「合計が基準に達したときだけ信号を送る関数」
  - zh「只在总和达到基准时才发出信号」
  - en "only when the total reaches a threshold"
- **The boundary now agrees with the fig table.** The step function cell says jp「基準の値以上なら 1、未満なら 0」, zh「达到基准值则送出 1，低于则送出 0」 and en "1 at or above a threshold, 0 below it". 「達した」 / 达到 / "reaches" mean "at or above", so the case total = threshold sends a signal in both places. The base 「超えた」 / 超过 / "exceeds" excluded it. zh now uses the same verb 达到 in detail and fig.
- **No cited question uses this boundary.** 2023r05-q091 asks what an activation function does; the answer エ says it computes, inside one neuron, the value passed on. Wrong options ア / イ / ウ (confidence of the result, number of middle-layer neurons, optimal neuron count) are not supported. 2026r08-q082 (BP) names 活性化関数 only in wrong option イ, and the unit's mix point keeps BP = correcting weights. A whole-bank search finds no stem or choice with ステップ関数 / しきい値 / 閾値 in a neural-network context. The only しきい値 hit is management-11-29 (disk monitoring), which is unrelated.
- The sentence keeps 「例えば」 / "Some functions", so it does not claim every activation function is a step function. Sigmoid and ReLU in the same fig are unchanged.
- **Resolved.**

### 3.6 u05 p07–p08 (L4): zh 欠拟合

- After: fig cell zh「欠拟合」, points zh「两者都低的状态叫作欠拟合（[[jp:学習不足]]）」.
- 欠拟合 is the standard zh opposite of 过拟合. zh_terms.json has 過学習 → 过拟合, which is used throughout, and has **no entry for 学習不足**, so the validate zh-term check has nothing to conflict with (0 warnings). The `[[jp:学習不足]]` marker keeps the jp word and matches jp points[0]「両方とも低い状態は学習不足という」 and the jp fig cell 学習不足. en already says "underfitting".
- In the fig row, 欠拟合 | 低 | 低 is read against the rows 恰到好处 | 高 | 高 and 过拟合 | 非常高 | 低. This is the right three-way split.
- No question in the bank uses 学習不足 / 未学習 (search hits 0), so no cited answer is affected.
- **Resolved.**

### 3.7 u05 p09–p11 (L5): goals[2] now promises the NN–DL relation

- After:
  - jp「ニューラルネットワークと**ディープラーニング**の関係を含めて全体像を語れる」
  - zh「并结合神经网络与**深度学习**的关系讲清整体脉络」
  - en "including how neural networks relate to **deep learning**"
- **The body delivers this relation in four places:**
  - `pairs[0]` (NN vs DL, 3 rows): structure vs method that makes it multilayer / 1 層でもよい vs 何層も重ねる / 土台 vs 土台を深くした発展形
  - the DL mix point: NN = モデルの構造, DL = その中間層を深く重ねて学習させる手法
  - `terms[0].points[0]`: NN は DL の土台となる技術
  - the DL one: 中間層を何層にも深く重ねたニューラルネットワークを使い
- The old reading "relation between overfitting and DL", which the body never explains, is gone in all three languages. In en, the "it" that pointed at overfitting is replaced by "neural networks".
- The first half of the goal (過学習 from accuracy differences) is unchanged and still matches terms[3] (fig and points).
- ニューラルネットワーク is not bold, while **ディープラーニング** keeps the base bold. Bold count is unchanged (2 → 2), and the goal already bolds 過学習. Not an issue.
- **Resolved.**

## 4. Observations

No F-fix from this re-review. Records only:

1. Script note, u01 (no content issue): the 4 check.mjs 'remnant' hits are append patches (p04 / p05: `before` is a prefix of `after`). By hand, every occurrence is followed by the new parenthesis.
2. Script note, u01 (no content issue): the 9 memory_hooks 'bad' hits are an index shift caused by the empty hook of `terms[2]` (情報量). Matching by suffix gives 18/18 ok.
3. LOW, unpatched (not prescribed): u01 `overview_rows[5].extra_*[1]` (段階の数は量子化ビット数で決まる / quantization bit depth) does not carry the alias. It is a one-line summary, and the alias is defined once in detail, so this is enough. Separately, the alias contains 符号化, which is also the name of 工程 3 (encoding). The parenthesis 「ともいう」 marks it as another name for the same quantity, and terms[5] points[0] ties it to amplitude levels, so no misreading toward 工程 3 is expected. Record only.
4. LOW, unpatched (not prescribed): u05 jp detail keeps 「直線的でない変換」 while zh / en now say 非线性 / non-linear. The Rule A file judged the jp acceptable, and the meaning is the same in all three languages. Record only.
5. Script note: `stage` meta is removed in all 5 units (as in b19–b40). u01's base is loc **r1** (`dc71cb35…`). The Rule A file of u01 names the pre-patch merge `4688054c…`.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope (all 5 Rule A files have MEDIUM 0); **0 introduced**
- LOW introduced: 0. Recorded: obs. 3 and 4 (unprescribed, record only). Obs. 1, 2 and 5 are script notes.
- **Application:** 26/26 exact (replay). 26/26 match the Rule A prescribed text verbatim. Every 建議修 is covered, with no deviation: u01 L1–L3 / u02 L1–L2 / u03 L1 / u04 L1–L2 / u05 L1–L5. Derived fields follow (288 checked, 0 mismatch). 0 unexplained diffs. 0 real `before` remnants.
- **D-198:** masked jp windows are 0 in every jp patch. The unmasked hits come only from the term name ニューラルネットワーク. After-span overlaps are term names, unchanged base parts or generic fragments, and nothing leans toward a wrong option.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×5; warnings u01 3 (= base, false positives), others 0
  - validate --part: 0 issues ×5 (sha256 = base_sha256)
  - parity: 0 diff ×5
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 26 active patches of technology-13-35 u01–u05 are applied exactly. No patch introduces a MEDIUM or HIGH, and every 建議修 is applied.
- u05 L1: 「達した」 / 达到 / "reaches" = the fig's 以上 / "at or above". No cited question (q091 / q082) depends on the boundary.
- u05 L4: 欠拟合 is the standard zh term, zh_terms.json has no 学習不足 entry, and `[[jp:学習不足]]` = the jp text.
- u05 L5: the NN–DL relation is delivered by pairs[0], the DL mix point, the NN point and the DL one.
- u02 L1: kana split = JIS X 0208 (2 bytes) / JIS X 0201 half-width (1 byte) = the fig table.
- u04 L1: the layers are stacked, not the network.
- u03 L1: *inducere* = "lead into", correct, and it pairs with "lead down".
- u01 L3: the alias links 2010h22h-q060 to the quantization point without supporting any wrong option.
