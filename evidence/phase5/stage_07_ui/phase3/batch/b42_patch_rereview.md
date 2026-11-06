# b42 B3 patch re-review — technology-13-35 u06–u07 (情報に関する理論 2/2, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D)
- Date: 2026-11-07 (Session 148 続)
- Scope: the B3 wording patches for technology-13-35 u06–u07. **23 are `active` and 0 retired**: u06 p01–p14 / u07 p01–p09 (`patches/technology-13-35-u0{6,7}.json`).
  I checked each patch against the Rule A prescriptions in `technology-13-35-u0{6,7}.ruleA.md`. Every 建議修 is covered:
  - u06: **M1** → p01–p06 (fig branch label 三語 + mix point 三語), L1 → p07–p09 (三語), L2 → p10–p12 (三語, + `explanation_*`), L3 → p13–p14 (en)
  - u07: L1 → p01–p03 (三語), L2 → p04–p05 (jp / zh; en unchanged as prescribed), L3 → p06 (zh, + `memory_hook_zh`), L9 → p07–p09 (三語, + `memory_hook_*`)
  Rule A verdicts: u06 **FAIL (MEDIUM 1 = M1, 補丁で解消可能)**, u07 PASS (HIGH 0 / MEDIUM 0). LOWs marked 記録のみ are not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256`. Each unit has one base shared by all its patches:
  - u06 `b42-u06-a1/…loc.r0.json` `41a5d755217ce079…`
  - u07 `b42-u07-a1/…loc.r0.json` `7dff5563958fed23…`

  Both are under `data/ip/textbook/.planning/v2/technology-13-35-u0N/parts/`.
- Merged units (current) `data/ip/textbook/units/technology-13-35-u0N.json` sha256: u06 `73dfe8ed…` / u07 `c2fe23ee…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208 (+ S143 addendum), D-209, D-210, D-211, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only). Strings shown are unit text, patch text or term names. Matched fragments are ≤12 chars.

## 0. Method

The method is the same as `b41_patch_rereview.md` §0. No `unit.*` patch is in this batch. Topic technology-13-35 has 35 questions, so there are 175 source strings per language.

1. **Application check** (`b42rr/check.mjs`, run unchanged): `after` present; `before` once in base; replay in file order = unit field; no `before` remnant in the unit; every changed base-present path explained; before / after verbatim in the Rule A file.
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (suffix match).
3. **D-198** (`b42rr/d198b.mjs`): whole-field LCS before → after, and LCS of the `after` span against the 175 sources per language. For jp: 12-char windows (≤2 substitutions), unmasked / masked, + wDice.
4. **Cited-question checks.** Re-read in `data/ip/quiz/questions.json`: 2025r07-q080 (基盤モデル, answer ウ; wrong ア アノテーション / イ エキスパートシステム / エ CNN) and 2026r08-q098 (プロンプトエンジニアリング, answer ウ; wrong イ = an on-screen symbol showing the system is waiting for input). Cross-unit: `data/ip/textbook/units/technology-23-61-u12.json` (敵対的サンプル).
5. **Manual reading** of each patched field in context: for u06 the whole of 事前学習 / ファインチューニング / 転移学習 (one / detail / hook / analogy / points / fig) plus pairs[0], key_points, goals and overview rows 0–2; for u07 the whole of 敵対的生成ネットワーク / LLM / プロンプトエンジニアリング.
6. **Gates** (each run on both units):
   - `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`
   - `scripts/textbook-v2-parity.mjs --unit`
   - `npx vitest run src/lib/textbook`
   - `node --test scripts/textbook-v2-patch.test.mjs`

**Not established** (same as b14–b41): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows two things only: the patches are present and correct in context, and nothing but the patches changed in base-present paths. Unit-only paths (u06 141 / u07 113) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-07)

```
validate --unit: u06 0 issues | u07 0 issues | EXIT 0 ×2 (no warnings)
validate --part (base): u06 loc#0 0 issues (sha256 41a5d755… = base_sha256)
                        u07 loc#0 0 issues (sha256 7dff5563… = base_sha256)
parity --unit: u06 32 / u07 26 locations, 0 diff
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: pass 14, fail 0
check.mjs:
  u06 active 14 ok 14 issues 0 | u07 active 9 ok 9 issues 0
  changed base-present paths = patched fields + 'stage' (u06 14 + 1 / u07 9 + 1); unexplained besides 'stage': 0
  derived checked 72 / 57, mismatch 0
  memory_hooks suffix: u06 18 / u07 15, bad 0
  ruleA verbatim miss: [] in both
```

**Application.**
- All 23 `before` strings occur exactly once in their base field, and all 23 `after` strings are present. Replay in file order reproduces every patched field (one patch per field in this batch).
- Changed base-present paths are the patched fields plus the removed `stage` meta key, as in b19–b41. Base-only top keys `stage / round / jp_round` are part metadata. Unexplained content diffs: 0.
- **`before` remnants: 0** (check.mjs, unit-wide, raw + stripped). Literal counts (node `split`, not regex): 「モデル全体」 / "whole model" / 「整个模型」 0 in u06 and u07; "rows and columns" 0 in u06; 「形でと」 / 「条目」 0 in u07; 「敌对的」 0 in u06, 3 in u07 (all inside the p06 gloss 字面意为“敌对的” and its derived copies).
- No validate warning in either unit or base, so the revert step of b38 §0-5 is not needed.

**Derived fields.** 129 checked, 0 mismatch:
- u06 p10–p12 → `terms[0].explanation_*`. Points, fig labels and pairs feed no derived field.
- u07 p04–p05 → `terms[4].explanation_jp / _zh`; p06 → `terms[1].memory_hook_zh`; p07–p09 → `terms[4].memory_hook_*`; summary.memory_hooks_* follow (suffix 33/33 ok).

**Notation.** Bold and `[[jp:]]` counts are unchanged in all 23 fields (check.mjs per-field table: e.g. u06 points 2→2 / 2→2, detail 1→1 / 1→1; u07 hook_zh jp 1→1).

D-198, before → after (`d198b.mjs`, 175 sources per language):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u06 p01 | **jp** | 3 → 3 | の重み (3, generic; 2026r08-q082 ア correct, BP) | 0 / 0 → 0 / 0; 0.33 → 0.21 |
| u06 p02 | zh | 2 → 3 | 的权重 (3, generic) | — |
| u06 p03 | en | 11 → 9 | " trained " (9, generic) | — |
| u06 p04 | **jp** | 10 → 10 (term) | の重みを調整 (6, generic) | 3 / 0 → 3 / 0 (term ファインチューニング); 0.20 → 0.18 |
| u06 p05 | zh | 2 → 2 | 训练 (2) | — |
| u06 p06 | en | 13 → 13 (term) | "sting the " (10) | — |
| u06 p07 | **jp** | 10 → 12 (2025r07-q080 stem) | ファインチューニングなど (12, term + など; intended, §3.2) | 3 / 1 → 5 / 0; 0.26 → 0.24 |
| u06 p08 | zh | 4 → 4 (unchanged part) | 通过微调 (4, term) | — |
| u06 p09 | en | 21 → 21 (unchanged part) | "through fine-tuning " (20, term phrase already in base) | — |
| u06 p10 | **jp** | 7 → 7 (unchanged part) | モデルを (4) | 0 / 0 → 0 / 0; 0.16 → 0.16 |
| u06 p11 | zh | 4 → 4 (unchanged part) | 作为 (2) | — |
| u06 p12 | en | 27 → 27 (unchanged part) | "the result" (10) | — |
| u06 p13 | en | 22 → 22 (unchanged part) | "e image" (7) | — |
| u06 p14 | en | 11 → 10 | "data in a " (10, generic) | — |
| u07 p01 | **jp** | 7 → 7 | のネットワーク (7, term part) | 0 / 0 → 0 / 0; 0.18 → 0.14 |
| u07 p02 | zh | 4 → 4 | 的学习方 (4) | — |
| u07 p03 | en | 27 → 11 | " refers to " (11, generic) | — |
| u07 p04 | **jp** | 4 → 4 | すよう (3) | 0 / 0 → 0 / 0; 0.09 → 0.11 |
| u07 p05 | zh | 3 → 3 | 的形式 (3) | — |
| u07 p06 | zh | 4 → 4 | 的字 (2) | — |
| u07 p07 | **jp** | 5 → 5 (term part) | という (3) | 0 / 0 → 0 / 0; 0.09 → 0.12 |
| u07 p08 | zh | 6 → 6 (term) | 向AI (3; 2026r08-q098 ウ correct) | — |
| u07 p09 | en | 13 → 12 | " a person " (10, generic) | — |

No patched text comes near the calibration HIGH (ed 0.14 / Dice 0.52). Every masked jp window count is 0 (u06 p07 drops 1 → 0). Unmasked hits come only from the katakana term ファインチューニング. Every after-span overlap is a term name, an unchanged base part or a generic fragment. u07 p03 lowers the en LCS from 27 to 11 (the base phrase "a learning method in which" is gone). None leans toward a wrong option.

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u06 p01–p06 | `terms[2](転移学習).fig.data.root.children[1].label.*`, `terms[2].points[0].text_*` | **M1** | Yes (§3.1) | No (obs. 1 LOW) | OK |
| u06 p07–p09 | `terms[1](ファインチューニング).points[0].text_*` | L1 | Yes (§3.2) | No | OK |
| u06 p10–p12 | `terms[0](事前学習).detail_*` (+ `explanation_*`) | L2 | Yes: 「こうして作った**学習済みモデル**を、後から…土台として使う」 no longer defines 学習済みモデル as only the pre-training product; zh「这样做出来的**已训练模型**…之后被作为…基础来使用」 / en "The resulting **trained model** … later serves as the base" match. FT one keeps 「事前学習済みのモデル」 | No | OK |
| u06 p13–p14 | `terms[3](CNN).points[0].text_en`, `pairs[1].rows[0].a_en` | L3 | Yes: "a two-dimensional grid, like images" = jp 縦横に並んだ / zh 纵横排列 (pixel grid); no spreadsheet reading. Pair b side (sequence data) unchanged | No | OK |
| u07 p01–p03 | `terms[1](敵対的生成ネットワーク).points[0].text_*` | L1 | Yes (§3.3) | No | OK |
| u07 p04–p05 | `terms[4](プロンプトエンジニアリング).detail_jp / _zh` (+ `explanation_*`) | L2 | Yes: 「形で出すよう指定する」 removes the particle clash; 「分条列表」 is natural zh; both = en "specifying that the answer come as a table or bullet points" (unchanged, as prescribed) | No | OK |
| u07 p06 | `terms[1].hook_zh` (+ `memory_hook_zh`) | L3 | Yes: 「“对抗”（[[jp:敵対的]]，字面意为“敌对的”）在前」 = term_zh / detail_zh / points 对抗; the literal gloss keeps the word-order cue | No | OK |
| u07 p07–p09 | `terms[4].hook_*` (+ `memory_hook_*`) | L9 | Yes (§3.4) | No | OK |

## 3. Focused checks

### 3.1 u06 p01–p06 (M1): 転移学習 tree vs mix point

- After:
  - fig branch 2 jp「学習済みの部分の重みも調整する」 / zh「已训练部分的权重也调整」 / en "Also adjust the trained part's weights" (child unchanged: 「ファインチューニングで重みを少しずつ更新」)
  - point jp「…**ファインチューニング**は移した先で学習済みの重みを調整する具体的な手順を指す。」 / zh「…调整已训练权重的具体步骤。」 / en "…adjusting the already-trained weights at the destination."
- **The two branches are now mutually exclusive and jointly match the definition.** Branch 1 (unchanged) =「学習済みの部分はそのまま使う」→「出力に近い層だけを新しいデータで学習」: the pretrained weights are frozen and only the output-side layers learn. Branch 2 = the pretrained part's weights are updated as well (「も」 = in addition to the output side). The point now ties FT to updating 学習済みの重み, so branch 1 no longer meets it and branch 2 does. The base problem (branch 1 also "adjusts weights at the destination") is gone.
- **The unfounded "whole model" limit is gone.** 「学習済みの部分の重みも」 says the pretrained part is updated, without claiming every layer is; this covers both full and partial fine-tuning. 「モデル全体」 / "whole model" / 「整个模型」: 0 hits in u06 and u07.
- **Every other field agrees:**
  - 事前学習: one / detail (now 「こうして作った学習済みモデルを…土台として使う」) / points[0] / hook — the pretrained model is the base; nothing about which weights move. No conflict.
  - ファインチューニング: one「事前学習済みのモデルに…追加の学習…調整」; detail「すでに身につけた特徴を生かしたまま、重みなどのパラメータを目的に合わせて動かす」; fig「追加学習で重みを調整」 / caption 3「重みを目的に合わせて動かす」; points[0] (exam) / points[1] (mix, 先 / 後). All describe moving the pretrained model's weights = branch 2.
  - pairs[0] (事前学習 / FT: order, data, result) — no weight-scope claim; consistent.
  - key_points[1] jp「学習済みの重みを目的に合わせて調整する」 / zh「已训练好的权重」 / en "already-trained weights" — now worded the same as the point.
  - 転移学習 one / detail / overview row「学習済みモデルを使い回す考え方」 — consistent.
  - u07: LLM detail「追加の学習 (ファインチューニング) で特定の用途に合わせる」 and PE points[1]「ファインチューニングは追加の学習でモデルのパラメータを変える」 — both true of branch 2 and silent on scope. The other u07 fields naming 基盤モデル / ファインチューニング (goals[1], key_points[1] + summary copy, overview.intro: 「事前学習の後に追加の学習で用途に合わせられる基盤モデルの一種」) make no weight-scope claim. No conflict.
- **Containment holds.** detail 3rd sentence「学習済みモデルを土台にしたファインチューニングは、転移学習を実現する代表的なやり方の一つ」 + fig root「転移学習のやり方の例」 with FT as one of two branches. FT ⊂ TL, not an exclusive split.
- **Technical claim is correct.** Fine-tuning = continuing to train a pretrained model so that (some or all of) its pretrained weights are updated; the alternative of freezing the pretrained weights and training only a new output head is feature extraction / transfer learning in the narrow sense. This is the usual split between transfer learning in the narrow sense and fine-tuning.
- **2025r07-q080 is still answerable.** The question asks for the name of a model trained on broad data and adaptable by fine-tuning etc. (answer ウ 基盤モデル). The patched fig / point do not mention 基盤モデル or the wrong options; terms[0].points[0] and terms[1].points[0] still give the 基盤モデル definition. エ (CNN) gets no support: the CNN fields talk only of grid features / image recognition. ア / イ do not appear.
- **Resolved.** M1 is fully closed.

### 3.2 u06 p07–p09 (L1): 「など」 restored

- After: jp「**基盤モデル**は、**ファインチューニング**などの追加の学習で用途ごとに調整することで、…」 / zh「通过**微调**（…）等追加训练…」 / en "through **fine-tuning** (…) or other additional training".
- Matches q080's "ファインチューニングなど" (the adaptation means is open). The 12-char overlap with the q080 stem is the term name + など, foreseen by Rule A; masked jp windows go 1 → 0. It is not stem wording (D-198).
- 「追加の学習」 also matches FT one「追加の学習」 and u07 LLM point「追加の学習で多くの用途に転用」.
- **Resolved.**

### 3.3 u07 p01–p03 (L1): 「敵対的」 scoped to the name

- After: jp「この名称の「敵対的」は、GAN の中の 2 つのネットワークが競い合う学習のしかたを指す。外部からの攻撃や不正アクセスを表す語ではない。」 (zh / en same content).
- **Consistent with technology-23-61-u12.** That unit says 「敵対的」 in 敵対的サンプル translates adversarial and marks inputs crafted to deceive the AI. The old unscoped 「「敵対的」は…外部からの攻撃…とは関係がない」 contradicted that reading of the same word; the new 「この名称の」 / "In this name" / 「这个名称中的」 limits the claim to GAN, so both units can stand.
- GAN detail (「敵対的」 = generator vs discriminator rivalry) and the hook are inside the GAN term and agree.
- No cited question involves 敵対的 (the unit's mix point has no qid).
- **Resolved.**

### 3.4 u07 p07–p09 (L9): prompt hook direction

- After: jp「…ここでは人が AI に、書き出すきっかけの言葉を渡すという意味を持つ。」 / zh「在这里指人向 AI 递上一句引出下文的话。」 / en "here it means a person handing the AI a cue to start writing."
- **The direction is now human → AI.** 2026r08-q098 wrong option イ is the system showing the user a symbol that it is waiting for input (machine → human). The hook no longer fits イ. It matches the answer ウ (the person works out the questions / instructions given to the AI) and the term's one / detail / exam point.
- The prompter analogy (cue whispered to an actor) is kept. 「書き出す」 / "start writing" fits the LLM one (continuing a given text).
- **Resolved.**

## 4. Observations

No F-fix from this re-review. Records only:

1. LOW, unpatched (not prescribed): u06 fig branch 1 child「出力に近い層だけを新しいデータで学習」 does not say whether those output-side layers are new or part of the pretrained model. Its parent「学習済みの部分はそのまま使う」 and the contrast with branch 2 (「学習済みの部分の重みも」) make "new head, frozen pretrained part" the natural reading, so it does not reopen M1. Record only.
2. LOW, unpatched: zh branch 2「已训练部分的权重也调整」 is a terse topicalised label (「…也要调整」 would read more smoothly). Same meaning as jp / en. Record only.
3. Script note: `stage` meta is removed in both units (as in b19–b41).

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 1 in scope (u06 M1) → **resolved**; **0 introduced**
- LOW introduced: 0. Recorded: obs. 1 and 2 (unprescribed, record only). Obs. 3 is a script note.
- **Application:** 23/23 exact (replay). 23/23 match the Rule A prescribed text verbatim. Every 建議修 is covered, with no deviation: u06 M1 / L1–L3, u07 L1–L3 / L9. Derived fields follow (129 checked, 0 mismatch). 0 unexplained diffs. 0 `before` remnants.
- **D-198:** masked jp windows are 0 in every jp patch. Unmasked hits come only from the term ファインチューニング. After-span overlaps are term names, unchanged base parts or generic fragments; nothing leans toward a wrong option.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×2, 0 warnings
  - validate --part: 0 issues ×2 (sha256 = base_sha256)
  - parity: 0 diff ×2
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 23 active patches of technology-13-35 u06–u07 are applied exactly, u06 M1 is fully resolved, no patch introduces a MEDIUM or HIGH, and every 建議修 is applied.
- u06 M1: branch 1 = pretrained weights frozen / branch 2 = pretrained weights also updated = FT; the point now says FT adjusts 学習済みの重み; FT ⊂ TL holds; every field in u06 and u07 agrees; q080 still has one supported answer (ウ).
- u06 L1: 「など」 restored to match q080. L2: 学習済みモデル no longer limited to pre-training. L3: "two-dimensional grid".
- u07 L1: 「この名称の」 scope, consistent with technology-23-61-u12 敵対的サンプル. L9: hook direction human → AI, no fit for q098 イ. L2 / L3: wording / 对抗 unified.
