# b04 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-10-29 (Session 138)
- Scope: 45 B3 wording patches replayed at merge for technology-23-62-u01 (p01–p07), u02 (p01–p10; p08–p10 = `unit_summary_*`),
  u03 (p01–p10), u04 (p01–p08), u05 (p01–p10) (`patches/technology-23-62-u0{1..5}.json`, all `status: active`), checked against the
  Rule A findings (`technology-23-62-u01.ruleA.md` §3 L1–L4; `u02` §3 L1–L5 + O1; `u03` §3 L1–L4; `u04` §3 L1–L4; `u05` §3 L1–L3)
  and the merged units `data/ip/textbook/units/technology-23-62-u0{1..5}.json`
  (sha256 u01 `82da0d06…`, u02 `f4299351…`, u03 `c973c185…`, u04 `c319a4bc…`, u05 `24f2520f…`).
- Severities: D-195 / D-198 / D-202 / D-203 (session-137 recalibration: §6 / §9 restatement = low; rule 7 = medium [fact error = high];
  rule 9 = high) and D-204 (session-138 §2: analogy / hook carrying content that the same term's points / detail deny = medium).
- No past-question text is quoted below (qid + paraphrase only).

## 0. Method

Same as `b03_patch_rereview.md` §0:

1. Application check (script): every string field of the unit is walked. For each patch, `after` (raw and notation-stripped: `**` and
   `[[jp:…]]` removed) must appear, and `before` must not survive anywhere outside a field that already contains `after`.
   For the u04 deletion patches (p01–p06, `after` ⊂ `before`) the deleted sentence / clause was grepped separately across the unit.
2. Derived-field check: the same walk lists every location of `after`, so derived compat fields (`memory_hook_*`, `summary.memory_hooks_*`,
   `explanation_*`, `definition_*`) are confirmed to follow. `summary.key_points_*` / `key_points_*` do not carry any patched sentence.
3. D-198: longest common substring (normalized, punctuation/whitespace/notation removed) and a 12-char sliding window with ≤2 substitutions,
   between each new/changed jp sentence and stem + choices of every cited qid of that term (u02 summary: all qids of the unit;
   u05 p01: the 2 topic qids named in the finding + the 3 u04 方針 qids) in `data/ip/quiz/questions.json`.
4. D-200: char count (whitespace removed) and sentence count for changed `points[].text_jp`.
5. Manual reading of each patched field in context (one / detail / points / pairs / fig captions / analogy / hook / key_points / goals /
   overview rows), plus the cited questions' correct answers, for rule 7, rule 9, D-204, trilingual parity, §9 phrases, naturalness.
6. `scripts/textbook-v2-validate.mjs --unit <id>` and `scripts/textbook-v2-parity.mjs --unit <id>` for all 5 units;
   regression: `npx vitest run src/lib/textbook` (apps/web).

## 1. Script results (fresh, 2026-10-29)

```
✓ technology-23-62-u01 unit: 0 issues (data/ip/textbook/units/technology-23-62-u01.json)   exit 0
✓ technology-23-62-u01 parity: 25 locations, 0 diff                                         exit 0
✓ technology-23-62-u02 unit: 0 issues (data/ip/textbook/units/technology-23-62-u02.json)   exit 0
✓ technology-23-62-u02 parity: 25 locations, 0 diff                                         exit 0
✓ technology-23-62-u03 unit: 0 issues (data/ip/textbook/units/technology-23-62-u03.json)   exit 0
✓ technology-23-62-u03 parity: 28 locations, 0 diff                                         exit 0
✓ technology-23-62-u04 unit: 0 issues (data/ip/textbook/units/technology-23-62-u04.json)   exit 0
✓ technology-23-62-u04 parity: 33 locations, 0 diff                                         exit 0
✓ technology-23-62-u05 unit: 0 issues (data/ip/textbook/units/technology-23-62-u05.json)   exit 0
✓ technology-23-62-u05 parity: 19 locations, 0 diff                                         exit 0
vitest src/lib/textbook: Test Files 13 passed (13) / Tests 162 passed (162)
```

Application check: 45/45 `after` present, 0/45 `before` remnants. u04 deleted text (「報告の連絡経路と仕組みは事前に整えておく」/
「それから処置に進む」 and zh/en equivalents): 0 remaining in `points[1]` / `analogy`; the only hit is `terms[3].fig.steps[0].caption_en`
(reporting route set up in advance), which is the intended surviving location (L1: duplicate removed, content kept in the figure).

| Patch | `after` found at |
|---|---|
| u01 p01 / p02 | `terms[3].detail_jp/zh`, `terms[3].explanation_jp/zh` |
| u01 p03–p05 | `terms[3].analogy_jp/zh/en` |
| u01 p06 | `terms[4].hook_en`, `terms[4].memory_hook_en`, `summary.memory_hooks_en[3]` (prefix "Risk evaluation: " kept) |
| u01 p07 | `terms[0].points[1].text_en` |
| u02 p01–p03 | `terms[0].fig.steps[2].caption_jp/zh/en` |
| u02 p04 | `overview_cols_en[1]` |
| u02 p05 | `overview_rows[5].extra_zh[1]` |
| u02 p06 | `terms[5].points[0].text_zh` |
| u02 p07 | `terms[1].detail_zh`, `terms[1].explanation_zh` |
| u02 p08–p10 | `unit_summary_jp/zh/en` (top level; no derived copy in the unit) |
| u03 p01 | `terms[3].hook_jp`, `terms[3].memory_hook_jp`, `summary.memory_hooks_jp[3]` (prefix 「真正性: 」 kept) |
| u03 p02–p04 | `terms[6].points[0].text_jp/zh/en` |
| u03 p05–p07 | `terms[2].points[0].text_jp/zh/en` |
| u03 p08 | `terms[5].fig.steps[1].caption_en` |
| u03 p09 | `terms[2].analogy_en` |
| u03 p10 | `terms[3].one_zh`, `terms[3].definition_zh` |
| u04 p01–p03 | `terms[3].points[1].text_jp/zh/en` |
| u04 p04–p06 | `terms[3].analogy_jp/zh/en` |
| u04 p07 | `terms[1].detail_en`, `terms[1].explanation_en` |
| u04 p08 | `terms[4].detail_en`, `terms[4].explanation_en` |
| u05 p01–p03 | `terms[0].detail_jp/zh/en`, `terms[0].explanation_jp/zh/en` |
| u05 p04–p09 | `pairs[1].rows[1].a_jp/b_jp/a_zh/b_zh/a_en/b_en` |
| u05 p10 | `overview_rows[2].extra_en[1]` |

D-198 (normalized LCS / 12-char window ≤2 substitutions) with cited qids:

| Text | qids | max LCS | near-match | Judgement |
|---|---|---|---|---|
| u01 p03 `terms[3].analogy_jp` | 2022r04-q086 / 2018h30h-q070 / 2014h26h-q072 / 2019h31h-q068 | 4 (function words) | 0 | no copying |
| u02 p08 `unit_summary_jp` | all 16 unit qids | 8 (リスクへの対処方 — 2017h29h-q063) | 0 | no copying (generic term phrase) |
| u02 p01 `terms[0].fig.steps[2].caption_jp` | 7 qids of terms[0] | 9 (リスクアセスメント, term name) | 0 | no copying |
| u03 p01 `terms[3].hook_jp` | 2020r02o-q087 / 2021r03-q067 | 3 | 0 | no copying |
| u03 p02 `terms[6].points[0].text_jp` | 2021r03-q067 / 2020r02o-q087 | 8 (情報セキュリティ) | 0 | no copying; the stem's fill-in sentence is not reproduced (paraphrased as "names … may be included") |
| u03 p05 `terms[2].points[0].text_jp` | 2013h25h-q075 / 2016h28h-q083 / 2009h21a-q081 | 8 (可用性が損なわれ) | 0 | no copying; q081's scene (cable cut) not used, generalised to 「人の操作の誤り」 |
| u04 p01 `terms[3].points[1].text_jp` | 6 qids of terms[3] | 11 (情報セキュリティ事象は — 2026r08-q070) | 2 (term name + は + 1 char) | false positive: term name + particle in the unchanged 1st sentence; the patch removes the sentence the Rule A flagged as the closest restatement of q070's correct choice → overlap reduced |
| u04 p04 `terms[3].analogy_jp` | 6 qids of terms[3] | 2 | 0 | no copying |
| u05 p01 `terms[0].detail_jp` | 2011h23a-q083 / 2011h23tokubetsu-q063 / 2015h27a-q062 / 2017h29a-q068 / 2018h30h-q093 | 8 (情報セキュリティ) | 0 | no copying (the correct choices' "top / management approves" idea is expressed in different words) |
| u05 p04 / p05 `pairs[1].rows[1]` | 2017h29h-q067 / 2018h30a-q098 / 2025r07-q068 | 2 | 0 | no copying |

en/zh-only patches (u01 p02, p05–p07; u02 p02–p07, p09–p10; u03 p03–p04, p06–p10; u04 p02–p03, p05–p08; u05 p02–p03, p06–p10) follow
jp text that is checked above or unchanged; questions are jp-only.

D-200: u03 T6 p0 = 64 chars / 1 sentence; u03 T2 p0 = 65 chars / 1 sentence; u04 T3 p1 = 47 chars / 1 sentence (was 2) → all within
≤2 sentences / ≤100 chars. u02 T5 p0 changed only in zh (jp 83 chars unchanged); u01 T0 p1 changed only in en.

## 2. Per-patch verdict

| Unit | ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[3].detail_jp` | L1 (分析の下位作業に「評価」) | Yes: 「見積もって」 | No (LOW-cosmetic: 見積り/見積もって twice in 2 sentences, §4 obs. 1) | OK |
| u01 | p02 | `terms[3].detail_zh` | L1 | Yes: 「估算」, no longer the アセスメント translation 「评估」 | No | OK |
| u01 | p03 | `terms[3].analogy_jp` | L2 (像が対応の程度に寄る) | Yes: output = how dangerous the typhoon is (= risk size); 「その台風」 has its antecedent in the same sentence | No | OK |
| u01 | p04 | `terms[3].analogy_zh` | L2 | Yes: 「估量这场台风有多危险」 = jp | No | OK |
| u01 | p05 | `terms[3].analogy_en` | L2 | Yes: "sizing up how dangerous" — now agrees with `terms[4].points[2]` (estimating the size is as far as analysis goes) | No | OK |
| u01 | p06 | `terms[4].hook_en` | L3 | Yes: "shares its root with value" = jp 「同じ語源を持つ」 / zh 「同源」; etymologically correct (e- + value) | No | OK |
| u01 | p07 | `terms[0].points[1].text_en` | L4 | Yes: "natural phenomena" = jp 自然現象 / zh 自然现象 | No | OK |
| u02 | p01 | `terms[0].fig.steps[2].caption_jp` | L1 (step caption 2 文) | Yes: 1 sentence with parenthetical; half-width " (…)" matches the unit's jp style | No | OK |
| u02 | p02 | `…caption_zh` | L1 | Yes: full-width （…） | No | OK |
| u02 | p03 | `…caption_en` | L1 | Yes | No | OK |
| u02 | p04 | `overview_cols_en[1]` | L2 ("Who" 付加) | Yes: "The burden when damage occurs" = jp 負担 / zh 负担; 回避行・分散行 now answer the column | No | OK |
| u02 | p05 | `overview_rows[5].extra_zh[1]` | L3 (「分出去」= 外へ手放す読み) | Yes: 「分开后的其中一部分」 = in-house split | No | OK |
| u02 | p06 | `terms[5].points[0].text_zh` | L4 | Yes: 「属于风险降低一类的对策」 (分散 = 低減側, clear) | No | OK |
| u02 | p07 | `terms[1].detail_zh` | L5 (「通常…才」の限定) | Yes: 「…时，会考虑采用这种方式」 = jp 「検討される」 / en "it is considered when" | No | OK |
| u02 | p08 | `unit_summary_jp` | O1 (分散を対処方針に並べ低減を欠く、観点 7) | Yes (see §3.1) | No | OK |
| u02 | p09 | `unit_summary_zh` | O1 | Yes: 「规避、降低、转移/共担、保留」+「风险分散的定位」 = jp | No | OK |
| u02 | p10 | `unit_summary_en` | O1 | Yes: "avoidance, reduction, transfer/sharing, retention" + "where risk diversification fits" = jp | No | OK |
| u03 | p01 | `terms[3].hook_jp` | L1 (「真(ほんもの)」= 義訓を読みの体裁で) | Yes (see §3.2) | No | OK |
| u03 | p02 | `terms[6].points[0].text_jp` | L2 (「含める場合がある」不明示・閉じた集合) | Yes (see §3.2) | No (64 chars / 1 sentence; D-198 ok) | OK |
| u03 | p03 | `…text_zh` | L2 | Yes: 「有时会包含的特性…可靠性等，并没有列出可维护性」 | No | OK |
| u03 | p04 | `…text_en` | L2 | Yes: "names reliability, among others, as a property that may be included on top of CIA; it does not name maintainability" | No | OK |
| u03 | p05 | `terms[2].points[0].text_jp` | L3 (誤操作が原因の停止が列挙に無い) | Yes (see §3.3) | No (65 chars / 1 sentence; D-198 ok) | OK |
| u03 | p06 | `…text_zh` | L3 | Yes: 「无论起因是…还是人的操作失误，只要系统停止、无法使用」 = jp | No | OK |
| u03 | p07 | `…text_en` | L3 | Yes: "Whatever the cause, be it … or a human operating error" = jp | No | OK |
| u03 | p08 | `terms[5].fig.steps[1].caption_en` | L4a ("in person" = 対面) | Yes: "really came from the sender" = jp 送信者本人から | No | OK |
| u03 | p09 | `terms[2].analogy_en` | L4b (懸垂修飾) | Yes: subject "Availability is like…: its value" — "its" now resolves | No (LOW-cosmetic: en names the term while jp/zh analogy do not, §4 obs. 2) | OK |
| u03 | p10 | `terms[3].one_zh` (+ `definition_zh`) | L4c (「真身」は人にしか使えない) | Yes: 「确实就是其所声称的那样、是真的」 applies to users / information / peers alike = jp 名乗っているとおりの本物 | No | OK |
| u04 | p01 | `terms[3].points[1].text_jp` | L1 (q070 正答の言い直し + fig step 0 と重複) | Yes: 2nd sentence deleted (D-204 delete-first); content survives in `fig.steps[0].caption_*` so the point q070 tests is still taught | No (see §3.4) | OK |
| u04 | p02 | `…text_zh` | L1 | Yes | No | OK |
| u04 | p03 | `…text_en` | L1 | Yes | No | OK |
| u04 | p04 | `terms[3].analogy_jp` | L2 (「まず…それから処置」が points[0] の「まず切り離す」と並ぶ) | Yes: 「運ばれてきた患者を診て、緊急度を判断する。」 | No (see §3.4) | OK |
| u04 | p05 | `terms[3].analogy_zh` | L2 | Yes: = jp | No | OK |
| u04 | p06 | `terms[3].analogy_en` | L2 | Yes: "only then does treatment begin" removed | No | OK |
| u04 | p07 | `terms[1].detail_en` | L3 (英語の別名が無意味) | Yes: "In Japanese it is also called [[jp:情報セキュリティ基本方針]]"; the jp original exists verbatim in `detail_jp` | No | OK |
| u04 | p08 | `terms[4].detail_en` | L4 ("check" が弱い) | Yes: "supervise the contractor to make sure it is following" = jp 監督 / zh 监督 | No | OK |
| u05 | p01 | `terms[0].detail_jp` (+ `explanation_jp`) | L1 (方針の確立者 = 経営トップとの関係が無い) | Yes (see §3.5) | No | OK |
| u05 | p02 | `…detail_zh` | L1 | Yes: 「经最高管理层批准后，传达给」 | No | OK |
| u05 | p03 | `…detail_en` | L1 | Yes: "approved by top management and then passed down" | No | OK |
| u05 | p04 | `pairs[1].rows[1].a_jp` | L2 (CSIRT = 平常時に活動しない組織と読める) | Yes: 「通報や検知の知らせを受けて対応に入る」 (axis = start of response) | No | OK |
| u05 | p05 | `pairs[1].rows[1].b_jp` | L2 | Yes: 「平常時から絶えず監視を続ける」 (axis = continuous monitoring); agrees with SOC `one` / `points[0]` / `key_points[2]` | No | OK |
| u05 | p06 | `…a_zh` | L2 | Yes: 「开始应对」 | No | OK |
| u05 | p07 | `…b_zh` | L2 | Yes: 「持续不断地监控」 | No | OK |
| u05 | p08 | `…a_en` | L2 | Yes | No (LOW-cosmetic: "Starts responding on reports" — "on" = "upon", slightly stiff, §4 obs. 3) | OK |
| u05 | p09 | `…b_en` | L2 | Yes: "Keeps monitoring constantly, even in normal times" | No | OK |
| u05 | p10 | `overview_rows[2].extra_en[1]` | L3 (語順) | Yes: "Works in shifts to keep constant watch" = jp 交代制で絶えず見張る | No | OK |

## 3. Focused checks

### 3.1 u02 new `unit_summary` vs the unit body

- 4 treatment classes: summary lists 回避・低減・移転/共有・保有 (zh 规避、降低、转移/共担、保留; en avoidance, reduction, transfer/sharing,
  retention). Body `terms[0].detail` gives exactly two 4-class schemes (回避・移転・低減・保有 / 移転の代わりに共有), `terms[0].points[2]`
  and pairs agree. The slash 「移転/共有」 reads as the one slot that differs between the two schemes — consistent with
  `terms[4].points[0]` (共有 replaces 移転) and `pairs[1].rows[1]` (共有 is the wider concept including 移転). No 5-class or 6-class reading.
- 分散: summary no longer places 分散 among the treatment classes; 「リスク分散の位置づけ」 is neutral and is answered by
  `terms[5].points[0]` (in-house split = 低減側, not 共有; splitting with another organization by agreement = 共有), `overview_rows[5]`
  and `goals_jp[2]` (拠点の分割がどの対応に分類されるか). Agreement confirmed; the O1 rule-7 mismatch (same type as a1 #1 M) is resolved.
- 「など」 removed: the summary now states a closed list, which matches the body's two closed 4-class schemes (no over-claim).
- `data/ip/textbook/unit_index.json` `summary_jp` for u02 still holds the old v1 wording (as the patch reason states). apps/web reads
  `unit_summary_*` from the unit file (`lib/sensei/textbookAnchors.ts`, `validateV2.ts`); `summary_jp` of the index appears only as a type
  field (`lib/textbook/types.ts:33`), no render use found → not shown to users. Recorded as a data-consistency observation (§4 obs. 4), not a finding.

### 3.2 u03 真(まこと) and ISMS "may be included"

- 真(まこと): まこと is a genuine kun reading of 真 (真に = まことに; 表外訓 like 否(いな)む in the same unit's hook). The added clause
  「本物で正しいことを表す」 carries the meaning the old 義訓 tried to give, so no information is lost and no false reading is taught. zh/en hooks
  were already meaning-glosses (finding: no change needed). `summary.memory_hooks_jp[3]` follows.
- ISMS wording: 「CIA に加えて含める場合がある特性として名前を挙げるのは信頼性などで、保守性は挙げていない」 matches both cited questions
  (the definition names reliability among properties that "may also be included"; maintainability is the wrong blank in both). Same
  qualifier as `terms[3].points[0]` (含める場合もある), `key_points_jp[2]` and `goals_jp[2]` (含める場合がある) → the four-field
  consistency the finding asked for now holds. 「など」 keeps the list open; 「挙げていない」 is a statement about the named list, not a claim
  that maintainability is excluded from security in general → no over-claim. Framing: no 「問題」「試験」「として…が挙が」.

### 3.3 u03 可用性 「原因を問わず」

- 2009h21a-q081 (an accidental physical cut of the access cable → which element dropped): correct answer = 可用性; wrong item = 完全性.
  The new point explicitly includes human operating error among causes of a stop → it now directly supports q081's answer and removes the
  room (finding L3) to classify an accidental stop under 完全性.
- Other fields: `terms[1].points[0]` (完全性: data wrong/lost, whether by malice or operating error) and `key_points_jp[1]` (classify by
  what was impaired: leak / wrong-missing content / stopped) are outcome-based in the same way; 「原因を問わず」 is scoped to the outcome
  「システムが止まって使えない状態」, so an operating error that corrupts data stays 完全性 and an error that stops the system is 可用性.
  No contradiction. 2013h25h-q075 (power cut → stop) and 2016h28h-q083 (DoS → unable to process) remain covered; their wrong items
  (bug mis-updates data = integrity; leaks = confidentiality) are not supported by the new wording because none of them is a stop.
- `terms[6]` (信頼性) / `pairs[1]`: reliability = behaviour/results while running; a stop of any cause = availability. Consistent.

### 3.4 u04 deletions — dangling references

- `terms[3].points[1]` is now the single sentence 「事象は報告の段階で自動的にインシデントになるのではなく、評価を経て分類される」 (jp/zh/en);
  it is self-contained. Nothing else in the unit referred to the deleted 2nd sentence (grep 0 outside `fig.steps[0].caption_en`, which states
  the same idea on its own). 2026r08-q070's tested point (reporting arrangements prepared beforehand) stays taught by `fig.steps[0].caption_*`
  (事前に決めた連絡経路で管理者へ知らせる), as Rule A L1 anticipated.
- `terms[3].analogy_*`: 「救急外来のトリアージに似ている。運ばれてきた患者を診て、緊急度を判断する。」 — both sentences are complete, no
  「それから」/「まず」 left hanging; zh/en have the same two-step structure. The image now maps only to the assess-and-classify step
  (`one`, `points[1]`, fig step 2), and no longer sets "first triage, then act" against `points[0]` ("first disconnect, then report") → the
  D-204 concern behind L2 is gone; the analogy carries no content that points/detail deny.

### 3.5 u05 「経営トップの承認を経て」 vs u04

- u04 `terms[1].one/detail/points[0]` and `key_points_jp[1]`: the policy is established by top management (3 cited qids). u05 detail now:
  the committee agrees on the policy → top management approves → passed down. Committee drafts/deliberates + top approves = top establishes;
  no conflict, and the previous reading "department heads' consensus decides the policy" is closed.
- Not overstated: the addition is scoped to 「決めた方針」 (policy), not to every measure the committee decides; it is supported by the topic's
  correct choices 2011h23a-q083 (approved by the organization's top) and 2011h23tokubetsu-q063 (approved by management). 経営トップ is
  the same term u04 uses (経営トップ (トップマネジメント)); zh 最高管理层 / en top management match u04's zh/en.
- Residual (pre-existing, not introduced): u05 `one_jp` / `key_points_jp[0]` still say the committee 「決める」 the policy; with the detail
  now naming the approver, this is the LOW cross-unit phrasing Rule A already accepted (u05 L1 / L4), not a contradiction.

### 3.6 §9 / framing on all `after` strings

No 「と覚える」/ 定型締め句 / 問題文・試験・出題 / "always" / "never" / "exam" introduced. u04 p01–p06 and u02 p01–p03 remove text only.

## 4. Observations (not blockers)

1. LOW-cosmetic, u01 p01: `terms[3].detail_jp` now has 「見積りには…」 and 「…見積もって大きさを求める」 in consecutive sentences; meaning clear,
   and it is the term the unit uses for analysis. Optional polish only.
2. LOW-cosmetic, u03 p09: `terms[2].analogy_en` opens with "Availability is like…", while jp/zh analogies do not name the term. Parity gate 0
   diff; meaning unchanged. Optional: "It is like a station ticket gate…: its value…" would also fix the dangling modifier.
3. LOW-cosmetic, u05 p08: "Starts responding on reports or detection alerts" — "on" (= upon) is slightly stiff; optional
   "Starts responding when reports or detection alerts come in".
4. Data consistency, u02: `unit_index.json` `summary_jp` keeps the old list (回避・共有・移転・分散・保有など). Not rendered (§3.1). If the index
   is ever surfaced, apply the same replacement as p08.
5. Pre-existing, out of scope: u05 `pairs[0].rows[1].b_*` (CSIRT 活動の形 = 通報を受けて動く実務のチーム) keeps the "acts on reports" wording that
   L2 corrected in `pairs[1].rows[1]`. In pairs[0] it contrasts with the committee's 「定期的に集まって審議する」 (form of activity), so it does
   not deny normal-time activity as directly; not a finding of u05 Rule A. Optional future polish: 「通報を受けて対応に入る実務のチーム」.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0 (u02 O1 rule-7 summary mismatch resolved)
- LOW introduced: cosmetic only (§4 obs. 1–3)
- validate 5/5 = 0 issues, parity 5/5 = 0 diff, vitest textbook 162/162

**PASS** — all 45 patches applied with derived fields following; each resolves its named finding faithfully across ja/zh/en; no new HIGH/MEDIUM.
