# b07 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-10-29 (Session 138)
- Scope: B3 wording patches replayed at merge for strategy-01-02-u01 (p01–p06), u02 (p01–p08), u03 (p01–p06), u04 (p01–p04),
  u05 (p01–p14) — 38 patches, all `active`, none retired (`patches/strategy-01-02-u0{1..5}.json`), checked against the Rule A findings
  (`strategy-01-02-u01.ruleA.md` §3 L2; `-u02` M1 / L1 / L7 / L8(a); `-u03` L5 / L6 / L8; `-u04` L1 / L2; `-u05` L1–L4) and the merged units
  `data/ip/textbook/units/strategy-01-02-u0{1..5}.json` (sha256 u01 `9d604abc7c89f4eb…`, u02 `610f33a71a3ecaf1…`, u03 `d01f9bb167bfa9b0…`,
  u04 `e9fe6dc6496b65c1…`, u05 `eece325efc092905…`).
- Severities: D-195 / D-198 / D-202 / D-203 (session-137), D-204 (session-138 §2), D-205 (session-138 §6).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text or term names).

## 0. Method

Same as `b06_patch_rereview.md` §0:

1. Application check (script): every string field of the unit is walked; each patch's `after` (raw and notation-stripped) must appear, and
   `before` (raw and stripped) must not survive anywhere outside a field that already contains `after`.
2. Derived-field check from the same walk (`explanation_*`, `definition_*`, `memory_hook_*`, `summary.*`).
3. D-198: normalized LCS, 12-char window with ≤2 substitutions, both **with and without** katakana / alnum masking, between each changed jp text
   (patch fragment and the whole patched field) and stem + choices of every qid cited anywhere in the unit; LCS and masked near-match also
   against all 98 questions of topic strategy-01-02. Semi-global edit distance (per patch char) and character-bigram Dice against each stem / choice
   separately. u05 L2 additionally at sentence / clause / sliding-window granularity and 12-char-window edit distance against 2016h28h-q032; the tool
   reproduces the Rule A calibration point for the *before* text (sentence Dice 0.40 / ed 0.62 exactly; clause 0.54 / 0.56 vs audit 0.51 / 0.55;
   12-char window min ed 2).
4. D-195 展開 2〜3 文 / D-200 考点 JP ≤2 文・≤100 字 (validate) + manual count.
5. Manual reading of each patched field in context (one / detail / points / pairs / fig / overview / key_points / hook), D-203 §6, D-204, D-205, parity.
6. `scripts/textbook-v2-validate.mjs --unit <id>` / `scripts/textbook-v2-parity.mjs --unit <id>`; regression `npx vitest run src/lib/textbook`.

## 1. Script results (fresh, 2026-10-29)

```
✓ strategy-01-02-u01 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u01.json)   exit 0
✓ strategy-01-02-u01 parity: 29 locations, 0 diff                                       exit 0
✓ strategy-01-02-u02 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u02.json)   exit 0
✓ strategy-01-02-u02 parity: 27 locations, 0 diff                                       exit 0
✓ strategy-01-02-u03 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u03.json)   exit 0
✓ strategy-01-02-u03 parity: 24 locations, 0 diff                                       exit 0
✓ strategy-01-02-u04 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u04.json)   exit 0
✓ strategy-01-02-u04 parity: 23 locations, 0 diff                                       exit 0
✓ strategy-01-02-u05 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u05.json)   exit 0
✓ strategy-01-02-u05 parity: 30 locations, 0 diff                                       exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application check: 38/38 `after` present (raw), 0 `before` remnants.

| Patch | `after` found at |
|---|---|
| u01 p01–p03 | `terms[5].detail_jp/zh/en`, `terms[5].explanation_jp/zh/en` |
| u01 p04–p06 | `key_points_jp/zh/en[3]`, `summary.key_points_jp/zh/en[3]` |
| u02 p01–p03 | `terms[1].hook_jp/zh/en`, `terms[1].memory_hook_jp/zh/en`, `summary.memory_hooks_jp/zh/en[1]` |
| u02 p04–p06 | `terms[2].points[0].text_jp/zh/en` |
| u02 p07 / p08 | `terms[1].points[1].text_en` / `terms[4].analogy_zh` |
| u03 p01 / p02 | `terms[2].analogy_jp` / `analogy_zh` |
| u03 p03 / p04 | `terms[2].fig.data.nodes[3].label.en` / `terms[0].fig.data.nodes[3].label.en` |
| u03 p05 / p06 | `terms[3].fig.data.cols[0].en` / `terms[3].fig.data.rows[2].cells[0].en` |
| u04 p01–p03 | `terms[1].one_jp/zh/en`, `terms[1].definition_jp/zh/en` |
| u04 p04 | `terms[0].fig.data.rows[3].cells[1].en` |
| u05 p01–p03 | `terms[5].one_jp/zh/en`, `terms[5].definition_jp/zh/en` |
| u05 p04–p06 | `overview_rows[5].one_line_jp/zh/en` |
| u05 p07–p09 | `terms[3].points[0].text_jp/zh/en` |
| u05 p10–p12 | `terms[4].hook_jp/zh/en`, `terms[4].memory_hook_jp/zh/en`, `summary.memory_hooks_jp/zh/en[3]` |
| u05 p13 / p14 | `terms[3].fig.steps[0].caption_zh` / `terms[2].hook_zh`, `memory_hook_zh`, `summary.memory_hooks_zh[1]` |

Residual grep (authored fields): u01 `without gaps` / `no cause` / 漏れなく(特性要因図) 0; u02 `上から下` / `从上到下` / `top to bottom` / `父子` /
`it has no control` 0, `Upper` / `Center` only in the new hook; u03 `手間` / `工夫` / `usage time` / `is the shortest` (fig) 0 (remaining
"that total is the shortest possible overall duration" in `key_points_en[2]` is a full, correct sentence), `＼` remains only in jp / zh header
(jp table convention, finding was en-only); u04 `両者` / `两个变量` / `two variables` / `disappear`(残差表) 0; u05 `表に並` / `横から` / `侧面` / `通学`(zh) 0.

D-198 (jp texts; zh/en-only patches touch no question wording, questions are jp-only):

| Text | Cited qids | max LCS (unmasked / masked) | 12-char ≤2 near-match unmasked / masked | min ed / max Dice | Judgement |
|---|---|---|---|---|---|
| u01 p01 `terms[5].detail_jp` (frag / field) | 19 | 3 / 3 (frag), 8 / 8 (field) | 0 / 0 | 0.81 / 0.06 (frag), 0.84 / 0.13 (field) | no copying |
| u02 p01 `terms[1].hook_jp` (frag / field) | 10 | 4 / 4 | 0 / 0 | 0.90 / 0.07, 0.91 / 0.06 | no copying |
| u02 p04 `terms[2].points[0].text_jp` | 10 | 3 / 3 (frag), 4 / 4 (field) | 0 / 0 | 0.76 / 0.07, 0.79 / 0.07 | no copying |
| u03 p01 `terms[2].analogy_jp` | 7 | 2 / 2, 3 / 3 | 0 / 0 | 0.70 / 0.02, 0.87 / 0.05 | no copying |
| u04 p01 `terms[1].one_jp` | 5 | 3 / 3, 4 / 4 | 0 / 0 | 0.67 / 0.12, 0.76 / 0.14 | no copying |
| u05 p01 `terms[5].one_jp` | 14 | 4 / 4 | 0 / 0 | 0.67 / 0.11, 0.79 / 0.09 | no copying |
| u05 p04 `overview_rows[5].one_line_jp` | 14 | 3 / 3 | 0 / 0 | 0.67 / 0.11, 0.75 / 0.09 | no copying |
| u05 p07 `terms[3].points[0].text_jp` | 14 | 6 / 5 (2016h28h-q032) | 0 / 0 | 0.69 / 0.25 | **L2 resolved** (below) |
| u05 p10 `terms[4].hook_jp` | 14 | 2 / 2, 3 / 3 | 0 / 0 | 0.78 / 0.05, 0.82 / 0.09 | no copying |

Topic-wide (98 questions): max LCS ≤ 8, masked 12-char near-match 0 for every text above.

u05 L2 vs 2016h28h-q032 (before → after):

| Granularity | before (ed / Dice) | after (ed / Dice) |
|---|---|---|
| whole sentence vs stem sentence | 0.62 / 0.40 | **0.69 / 0.20** |
| clause (patch text without the 「は ヒストグラム である」 tail) vs stem, best window | 0.56 / 0.54 | **0.58 / 0.36** |
| whole text vs best stem window (±8 chars) Dice | 0.49 | **0.29** |
| 12-char window, min edit distance / min Hamming (unmasked / masked) | 2 / 4 / 4 | **3 / 3 / 6** |
| best vs choices | ed 0.86 / Dice 0.22 | ed 0.83 / Dice 0.25 (term-name only) |

The HIGH calibration is the pair ed 0.14 ∧ Dice 0.52 (the *before* clause Dice 0.54 came with ed 0.56, ≈4× the calibration ed, hence LOW in Rule A).
After the patch both axes clear at every granularity, far from the HIGH calibration and the 建議修 band; the 12-char ≤2 near-match count is 0 both masked and unmasked.
The shared material is only the term name and the generic word 度数. **L2 resolved.**

D-195 / D-200: validate 0 issues on all five units. u01 `terms[5].detail_jp` 3 sentences (unchanged). Patched 考点: u02 t2.p0 jp 2 文 / 61 字,
u05 t3.p0 jp 1 文 / 38 字 (≤2 文・≤100 字). u02 t1.p1 jp unchanged (2 文 / 69 字); its en is now 3 sentences (see §4 obs. 2).

## 2. Per-patch verdict

| Unit | ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[5].detail_jp` (+ expl) | L2 | Yes: 漏れなく → 漏れの少ないよう (degree, not guarantee) = u02 フィッシュボーン「抜けに気づきやすい」 | No (LOW-cosmetic §4 obs. 1) | OK |
| u01 | p02 / p03 | `…detail_zh/en` (+ expl) | L2 | Yes: 能更全面地 / "more thoroughly" | No | OK |
| u01 | p04–p06 | `key_points_*[3]` (+ summary) | L2 | Yes: 見落としを減らす / 减少…遗漏 / "fewer causes are overlooked" | No | OK |
| u02 | p01–p03 | `terms[1].hook_*` (+ memory_hook, summary) | **M1** | **Yes** (§3.1) | No | OK |
| u02 | p04–p06 | `terms[2].points[0].text_*` | L1 | Yes: direction (上から下) removed; 段を重ねて続いていく / 一层层延续下去 / "continues level by level" | No; still states a fact (§3.2) | OK |
| u02 | p07 | `terms[1].points[1].text_en` | L7 | Yes: subject of "no control limits" is explicitly the Pareto chart = jp | No (sentence-count obs. §4 obs. 2) | OK |
| u02 | p08 | `terms[4].analogy_zh` | L8(a) | Yes: 亲子 = jp 親子 / en "parent and child" | No | OK |
| u03 | p01 / p02 | `terms[2].analogy_jp/zh` | L5 | Yes: 時間 / 时间 = en "time-consuming" = CP = longest duration | No | OK |
| u03 | p03 | CP fig node[3] en | L6 | Yes: "That total = shortest overall time" = jp その合計が全体の最短期間; no longer reads as largest-vs-shortest | No | OK |
| u03 | p04 | PERT fig node[3] en | L6 | Yes: "Draw it, find the total time" = jp 全体の期間を求める | No | OK |
| u03 | p05 / p06 | マトリックス図 table en | L8 | Yes: ASCII "/" header; "Long battery life" (row maps ◎ to 電池の容量, consistent) | No | OK |
| u04 | p01 / p02 | `terms[1].one_jp/zh` (+ definition) | L1 | Yes: 変数どうし / 变量之间 — no longer two-variable-only | No (§3.3) | OK |
| u04 | p03 | `terms[1].one_en` (+ definition) | L1 | Yes; "explanatory variables" (writer's deviation from the audit's "clue variables") matches the unit's en name for 説明変数 (§3.3) | No | OK |
| u04 | p04 | 残差表 total en | L2 | Yes: "cancel out" = jp ずれが見えない (gaps exist, sum hides them) = detail_en "cancel out" | No | OK |
| u05 | p01–p03 | `terms[5].one_*` (+ definition) | L1 | Yes: など / 等形式 / "or similar grid" | No; detail example (曜日×時間帯) and overview extra (マス) still fit | OK |
| u05 | p04–p06 | `overview_rows[5].one_line_*` | L1 | Yes: same hedge as one | No | OK |
| u05 | p07–p09 | `terms[3].points[0].text_*` | L2 | Yes (§1 table) | No; 考点 still correct (§3.4) | OK |
| u05 | p10–p12 | `terms[4].hook_*` (+ memory_hook, summary) | L3 | Yes: 正面から / 从正面 / "from the front" (§3.5) | No | OK |
| u05 | p13 | ヒストグラム fig step 0 caption_zh | L4(a) | Yes: 40 名学生上学路上所花的时间 (no 通学 loanword) | No | OK |
| u05 | p14 | `terms[2].hook_zh` (+ memory_hook, summary) | L4(b) | Yes: etymology tied to 日语名「散布図」, zh reader knows why 撒种子 | No | OK |

## 3. Focused checks

### 3.1 u02 M1 — 管理図 hook expansions

- jp: 「CL は Center Line (中心線)、UCL と LCL は Upper / Lower Control Limit (上方 / 下方の管理限界線) の頭文字。」
  zh: 「CL 取自 Center Line（中心线），UCL 和 LCL 取自 Upper / Lower Control Limit（上 / 下控制界限）的首字母。」
  en: "CL stands for Center Line, and UCL and LCL for Upper and Lower Control Limit."
- Expansions correct (CL = Center Line; UCL / LCL = Upper / Lower Control Limit); the old letter-by-letter reading (U-C-L = Upper Center Lower) is gone in all three.
- Naming consistency with the same term's `detail_*`: jp 中心線 (CL) / 上方管理限界線 (UCL) / 下方管理限界線 (LCL) = hook 中心線 / 上方・下方の管理限界線;
  zh 中心线（CL）/ 上控制界限（UCL）/ 下控制界限（LCL） = hook 中心线 / 上・下控制界限; en center line (CL) / upper control limit (UCL) / lower control limit (LCL)
  = hook. `one_*` (中心線・管理限界線 / 中心线・控制界限 / center line・control limits) also agrees.
- Derived `memory_hook_*` and `summary.memory_hooks_*[1]` carry the new text. jp 2 文 / 84 字, same shape as before. **M1 resolved.**

### 3.2 u02 L1 — 系統図 考点

- 「系統図 では、下の段の手段を実現することが、すぐ上の段の目的の達成につながる。目的と手段のこの連鎖が、段を重ねて続いていく。」 — both sentences
  are factual statements about the hierarchy (上 / 下の段 = levels, consistent with detail「その下の段から見ると目的になる」 and the tree figure);
  no layout direction is asserted any more. Supports the cited 2011h23a-q099 (目的 ↔ 手段の連鎖). zh / en equivalent.

### 3.3 u04 L1 — 回帰分析 one

- jp 「手がかりとなる変数の値から別の変数の値を説明・予測するために、変数どうしの関係を式で表す」: no longer limited to two variables; the
  手がかり変数 count is left open (jp has no number), so simple and multiple regression both fit. zh 「变量之间的关系」 likewise.
- en "…so that the value of one variable can be explained or predicted from the values of one or more explanatory variables": the unit's en name for
  説明変数 is **explanatory variable** everywhere (`terms[1].detail_en` bold term, `goals_en[1]`, `pairs[0].rows[2].a_en`, `key_points_en[1]`,
  `overview.intro_en`); "clue" survives only as a plain word in detail_en ("used as the clue") and fig step 0. So "explanatory variables" is the
  correct and more consistent choice than the audit's "clue variables" (which is not a term anywhere in the unit).
- Consistency: detail (単回帰 = 1 変数・直線 / 重回帰 = 複数) now *instantiates* the one instead of widening it; `points[0]` (2 つの量・直線の式) and the
  fig (y = a + bx) present the simple case, compatible with the broader one. No new restriction (D-205 ③ N/A — patch widens).

### 3.4 u05 L2 — ヒストグラム 考点 correctness

- 「測った値を区間ごとに数え、その度数を棒の高さで表した図は ヒストグラム である。」 — correct: counts per interval (= 度数), bar height = 度数.
  Consistent with one (階級・度数・棒の高さ), detail, fig steps (区切る → 数える → 棒の高さ), `points[1..2]`. Supports 2016h28h-q032 (answer = ヒストグラム).
  Still largely a restatement of one (Rule A L7(c), record-only — unchanged class).

### 3.5 u05 L3 — box-plot hook image

- 「正面から見た猫の顔: 箱が顔、左右に伸びる線がひげ。」 — from the front, whiskers do extend left and right; the unit's figure is horizontal
  (`terms[4].fig` rows: 左のひげの端 / 箱の左端 / 箱の中の線 / 箱の右端 / 右のひげの端), so image and figure agree. zh / en equivalent.

## 4. Observations (not blockers)

1. LOW-cosmetic, u01 p01 `terms[5].detail_jp` (+ `explanation_jp`): 「…漏れの少ないよう洗い出せ、根本の原因を…」 — 可能動詞「洗い出せる」の連用中止で
   文法上は正しいが、命令形「洗い出せ」と同形で一瞬つまずく (wording came from the Rule A proposal). Optional:
   「思い付いた原因だけで済ませずに漏れの少ないよう洗い出せ、」→「思い付いた原因だけで済ませずに、漏れの少ないよう洗い出すことができ、」.
2. LOW-cosmetic, u02 p07 `terms[1].points[1].text_en`: now 3 sentences against jp 2 (D-200 counts JP only; parity 0 diff). Optional 2-sentence form that
   keeps the subject unambiguous: "ABC analysis ([[jp:ABC分析]]) also uses this chart. A Pareto chart has no control limits." →
   "ABC analysis ([[jp:ABC分析]]) also uses this chart, a chart that has no control limits." (or leave as is).
3. u02 p01 hook length: new `terms[1].hook_jp` 2 文 / 84 字 (before 2 文, shorter); sentence count unchanged, validate hook check 0 → not a new issue
   (D-203 §6 prefers one line; the 2-sentence shape predates the patch).
4. Out of patch scope (pre-existing, not introduced): u02 `terms[2](系統図).detail_jp`「目的に対して取りうる施策を漏れなく並べ」/ zh「无遗漏地列出来」/
   en "lists every measure" carries the same 言い切り type as u01 L2, but Rule A u02 did not flag it and 系統図 is a different tool. Record only.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0 (u02 M1 resolved; expansions correct and consistent with detail in ja/zh/en)
- LOW introduced: cosmetic only (§4 obs. 1–2, do not change the verdict); obs. 4 pre-existing, out of scope
- D-205 N/A for all 38: no patch adds a version-bound count / structure claim and none adds a qid-tied restriction (u04 L1 and u05 L1 widen,
  u02 L1 removes a direction, the rest are wording / translation fixes)
- D-198: u05 L2 near-match cleared (sentence ed 0.62 → 0.69, Dice 0.40 → 0.20; clause Dice 0.54 → 0.36; 12-char min ed 2 → 3); no new copying
- validate 5/5 = 0 issues, parity 5/5 = 0 diff (29 / 27 / 24 / 23 / 30 locations), vitest textbook 162/162

**PASS** — all 38 patches applied with derived fields following; each resolves its named finding faithfully across ja/zh/en; no new HIGH/MEDIUM.
