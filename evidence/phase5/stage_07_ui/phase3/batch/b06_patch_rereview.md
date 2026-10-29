# b06 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-10-29 (Session 138)
- Scope: B3 wording patches replayed at merge for management-08-25-u01 (p01–p12), u02 (p01–p03), u03 (p01–p14), u04 (p01–p06),
  u05 (p01–p04) — 39 patches, all `active`, none retired (`patches/management-08-25-u0{1..5}.json`), checked against the Rule A findings
  (`management-08-25-u01.ruleA.md` §3 M1 / M2 / L1; `-u02` L1; `-u03` L1–L4; `-u04` L1–L3; `-u05` L1–L2) and the merged units
  `data/ip/textbook/units/management-08-25-u0{1..5}.json` (sha256 u01 `f6b8bb70aaea00ba…`, u02 `3fe848d4b4f3b529…`, u03 `4c57af9c2868a25b…`,
  u04 `4b3fe5c2477c7b4b…`, u05 `eae7a2e3ef7dcc0c…`).
- Severities: D-195 / D-198 / D-202 / D-203 (session-137) and D-204 (session-138 §2).
- No past-question text is quoted below (qid + paraphrase only; LCS / near-match strings shown are term names).

## 0. Method

Same as `b05_patch_rereview.md` §0:

1. Application check (script): every string field of the unit is walked; each patch's `after` (raw and notation-stripped) must appear, and
   `before` (raw and stripped) must not survive anywhere outside a field that already contains `after`.
2. Derived-field check from the same walk (`explanation_*`, `definition_*`, `overview.intro_*`, `memory_hook_*`, `summary.*`).
3. D-198: normalized LCS, 12-char window with ≤2 substitutions, both **with and without** katakana / alnum masking, between each changed jp text
   (patch fragment and the whole patched field) and stem + choices of every qid cited anywhere in the unit (points / quiz / inline_quiz /
   challenge); LCS and masked near-match also against all 125 questions of topic management-08-25. Semi-global edit distance (per patch char)
   and character-bigram Dice against each stem / choice separately. The tool reproduces the Rule A calibration point (u04 L1 *before* ↔
   2011h23tokubetsu-q054 ア: ed 0.19 / Dice 0.70, identical to `management-08-25-u04.ruleA.md`).
4. D-195 展開 2〜3 文 / D-200 考点 ≤2 文 (validate) + manual count.
5. Manual reading of each patched field in context (one / detail / points / pairs / fig / overview / key_points), rule 7, rule 9, D-204, parity, §9.
6. External fact check (u01 M2): JIS X 25010 edition history.
7. `scripts/textbook-v2-validate.mjs --unit <id>` / `scripts/textbook-v2-parity.mjs --unit <id>`; regression `npx vitest run src/lib/textbook`.

## 1. Script results (fresh, 2026-10-29)

```
✓ management-08-25-u01 unit: 0 issues (data/ip/textbook/units/management-08-25-u01.json)                exit 0
✓ management-08-25-u01 parity: 25 locations, 0 diff                                                      exit 0
✓ management-08-25-u02 unit: 0 issues (data/ip/textbook/units/management-08-25-u02.json), 1 warning(s)   exit 0
  warn  zh-term  terms[3](デバッグ).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
✓ management-08-25-u02 parity: 27 locations, 0 diff                                                      exit 0
✓ management-08-25-u03 unit: 0 issues (data/ip/textbook/units/management-08-25-u03.json)                exit 0
✓ management-08-25-u03 parity: 27 locations, 0 diff                                                      exit 0
✓ management-08-25-u04 unit: 0 issues (data/ip/textbook/units/management-08-25-u04.json)                exit 0
✓ management-08-25-u04 parity: 26 locations, 0 diff                                                      exit 0
✓ management-08-25-u05 unit: 0 issues (data/ip/textbook/units/management-08-25-u05.json)                exit 0
✓ management-08-25-u05 parity: 20 locations, 0 diff                                                      exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

(u02 zh-term warn = known false positive, `management-08-25-u02.ruleA.md` O3; field not touched by any patch.)

Application check: 39/39 `after` present, 0 `before` remnants.

| Patch | `after` found at |
|---|---|
| u01 p01–p03 | `terms[0].detail_jp/zh/en`, stripped in `explanation_jp/zh/en` |
| u01 p04–p06 | `terms[2].detail_jp/zh/en`, `explanation_jp/zh/en` |
| u01 p07–p09 | `terms[2].fig.data.cols[0].jp/zh/en` (jp and zh header strings are identical by design) |
| u01 p10–p12 | `terms[3].points[0].text_jp/zh/en` |
| u02 p01–p03 | `terms[2].points[2].text_jp/zh/en` |
| u03 p01–p03 | `terms[4].points[2].text_jp/zh/en` |
| u03 p04–p06 | `terms[2].points[0].text_jp/zh/en` |
| u03 p07 / p08 | `terms[1].detail_zh` / `detail_en`, stripped in `explanation_zh` / `explanation_en` |
| u03 p09 | `terms[1].fig.data.nodes[1].label.en` ("Integration testing"; also a substring of term_en etc., «(link)» 0 hits in unit) |
| u03 p10 | `key_points_en[1]`, `summary.key_points_en[1]` |
| u03 p11 / p12 | `overview_rows[3].one_line_en` / `pairs[0].rows[0].b_en` |
| u03 p13 | `terms[3].fig.data.nodes[3].label.en` |
| u03 p14 | `terms[2].detail_en`, `explanation_en` |
| u04 p01–p03 | `terms[2].fig.steps[1].caption_jp/zh/en` |
| u04 p04–p06 | `terms[1].detail_jp/en/zh`, `explanation_jp/en` (+ zh stripped) |
| u05 p01–p03 | `terms[0].points[1].text_jp/zh/en` |
| u05 p04 | `terms[2].one_en`, stripped in `terms[2].definition_en` |

Residual grep: u03 `link` / `breaks` / `Breaking` / `beyond functions` 0 hits (remaining "beyond" = load-test "beyond the maximum", legitimate);
u05 `times larger` 0; u01 `分かれ` / `splits into` / `分为`(工序) 0.

D-198 (jp texts; zh/en-only patches follow jp or touch no question wording, questions are jp-only):

| Text | Cited qids | max LCS (unmasked / masked) | 12-char ≤2 near-match unmasked / masked | min ed / max Dice | Judgement |
|---|---|---|---|---|---|
| u01 p01 `terms[0].detail_jp` (frag + field) | 28 | 10 / 6 (ソフトウェア要件定義) | 18 / 0 — all windows = term name ± 1–2 adjacent chars | 0.62 / 0.41 (frag), 0.77 / 0.32 (field) | no copying |
| u01 p04 `terms[2].detail_jp` | 28 | 5 / 5 | 0 / 0 | 0.84 / 0.11 | no copying |
| u01 p07 fig col header | 28 | 2 / 2 | 0 / 0 | 0.80 / 0.03 | no copying |
| u01 p10 `terms[3].points[0].text_jp` | 28 | 5 / 5 (was 14 unmasked) | 0 / 0 | vs 2013h25h-q049 stem: before 0.52 / 0.37 → after 0.78 / 0.21; best over all cited 0.72 / 0.34 (2014h26h-q049 ア, standard 画面・帳票の項目 phrase, cf. u02 L3) | **L1 resolved** |
| u02 p01 `terms[2].points[2].text_jp` | 19 | 6 / 4 | 0 / 0 | 0.80 / 0.27 | **L1 resolved** (題文の枠 gone) |
| u03 p01 `terms[4].points[2].text_jp` | 20 | 9 / 6 | 0 / 0 | 0.70 / 0.25 (field) | no copying |
| u03 p04 `terms[2].points[0].text_jp` | 20 | 8 / 5 | 0 / 0 | 0.77 / 0.23 | **L2 resolved** (q044 / q042 具体像 removed) |
| u04 p01 `terms[2].fig.steps[1].caption_jp` | 23 | 4 / 4 (開発者が) | 0 / 0 | vs 2011h23tokubetsu-q054 ア: before **0.19 / 0.70** → after **0.62 / 0.27**; field 0.76 / 0.22 | **L1 resolved** — clears HIGH (0.14 / 0.52) and 建議修 (0.40 / 0.32) calibration |
| u04 p04 `terms[1].detail_jp` | 23 | 4 / 4 | 0 / 0 | 0.86 / 0.10 | no copying |
| u05 p01 `terms[0].points[1].text_jp` | 10 | 12 / 4–7 | 12 / 0 — all = ファンクションポイント法 ± 1–2 chars | 0.43 / 0.49 (frag, dominated by term name), 0.69 / 0.28 (field) | no copying (term-name false positive) |

Topic-wide (125 questions): masked 12-char near-match 0 for every text above.

D-195 / D-200: validate 0 issues on all five units. u01 `terms[0].detail_jp` 3 sentences, `terms[2].detail_jp` 3, u04 `terms[1].detail_jp` 2;
every patched `points[]` ≤2 sentences (u01 t3.p0 1, u02 t2.p2 1, u03 t4.p2 1, u03 t2.p0 1, u05 t0.p1 2).

## 2. Per-patch verdict

| Unit | ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[0].detail_jp` (+ expl) | M1 | Yes (§3.1) | No | OK |
| u01 | p02 | `…detail_zh` | M1 | Yes: 有…以及…等工序 (no 分为) | No | OK |
| u01 | p03 | `…detail_en` | M1 | Yes: "The finer naming scheme … includes" | No | OK |
| u01 | p04–p06 | `terms[2].detail_*` (+ expl) | M2 | Yes (§3.2) | No | OK |
| u01 | p07–p09 | `terms[2].fig.data.cols[0].*` | M2 | Yes: header 「特性 (JIS X 25010:2013)」 ×3 | No | OK |
| u01 | p10 | `terms[3].points[0].text_jp` | L1 | Yes: 14-char run gone (max 5) | No (items + 配置/様式 = same content, still 外部設計 = 機能設計) | OK |
| u01 | p11 / p12 | `…text_zh/en` | L1 | Yes = jp | No | OK |
| u02 | p01 | `terms[2].points[2].text_jp` | L1 | Yes: no 題文の枠; 「方法の一つ」 removes the "review only" reading | No; still supports q031's answer (review) | OK |
| u02 | p02 / p03 | `…text_zh/en` | L1 | Yes = jp | No | OK |
| u03 | p01 | `terms[4].points[2].text_jp` | L1 | Yes: headword tied in (§3.3) | No restriction (LOW-cosmetic §4 obs. 1) | OK |
| u03 | p02 / p03 | `…text_zh/en` | L1 | Yes: 也是其中之一 / "among them" | No | OK |
| u03 | p04 | `terms[2].points[0].text_jp` | L2 | Yes: 応答時間・スループット = one_jp's own metrics; 「主に」「開発者が」 kept, all 5 qids still support | No (LOW-cosmetic §4 obs. 2) | OK |
| u03 | p05 / p06 | `…text_zh/en` | L2 | Yes = jp, [[jp:スループット]] origin in jp text | No | OK |
| u03 | p07 | `terms[1].detail_zh` (+ expl) | L3 | Yes: 在日语中也叫 — same style as 回帰 detail_zh | No | OK |
| u03 | p08 | `terms[1].detail_en` (+ expl) | L3 | Yes in substance ("link testing" gone, Japanese origin stated) | Wording awkward — LOW-cosmetic, §3.4 | OK (optional fix) |
| u03 | p09 / p10 | fig node en / `key_points_en[1]` (+ summary) | L3 | Yes: "(link)" removed; jp/zh 「統合 (結合)」 kept as Rule A intended | No | OK |
| u03 | p11–p13 | ov3 one_line_en / pairs b_en / fig node en | L4 ① | Yes: "where its limit lies" / "Limit point" = jp 限界 / 限界点, = one_en "limit" | No | OK |
| u03 | p14 | `terms[2].detail_en` (+ expl) | L4 ② | Yes: "conditions other than functions, such as performance and reliability" | No | OK |
| u04 | p01–p03 | `terms[2].fig.steps[1].caption_*` | L1 | Yes (§3.5) | No | OK |
| u04 | p04 | `terms[1].detail_jp` (+ expl) | L2 | Yes (§3.6) | No | OK |
| u04 | p05 | `…detail_en` (+ expl) | L2 | Yes: "rather than one particular phase of testing" | No | OK |
| u04 | p06 | `…detail_zh` (+ expl) | L2 + L3 | Yes: 「**验证**（[[jp:検証]]）」 no longer 确认-prefixed; 与其说…不如说 = jp というより | No | OK |
| u05 | p01–p03 | `terms[0].points[1].text_*` | L1 | Yes: まず / 首先 / first → consistent with detail 3rd sentence (工数 = 規模 ÷ 生産性) and fig | No; 2nd sentence (期間・工数は結果) unchanged and consistent | OK |
| u05 | p04 | `terms[2].one_en` (+ definition_en) | L2 | Yes: "how many times as large … as" admits fractions, = detail_en "multiple or a fraction" | No | OK |

## 3. Focused checks

### 3.1 u01 M1 — 要件定義 and the finer phase names

- New jp 3rd sentence: 「工程を細かく分ける呼び方**には**、…**システム要件定義**や、…**ソフトウェア要件定義**がある。」 — a non-exhaustive listing (や…がある)
  of finer-scheme names; it no longer says the coarse 要件定義 *splits into* (only) these two. zh 「在…叫法中，有…以及…等工序」, en "The finer naming scheme
  for phases includes …" carry the same open listing.
- Unit-wide grep (システム要件定義 / ソフトウェア要件定義 / 分かれ / 分为 / split / include): the only statement mapping coarse ↔ fine is `key_points_*[2]`
  (「両者の区切りは一対一には対応しないので、工程の順序はどちらか一方の呼び方の中で考える」) — the detail sentence no longer duplicates or contradicts it.
  The figure (`terms[3].fig` 要件定義 → 機能設計 → …) is the coarse scheme; with the containment claim gone, nothing places システム方式設計 inside 要件定義.
  Remaining uses of 「システム要件定義」 in goals[0] / overview_rows[0..1] / points[0] / t1.points[0] are the Rule A L3 record-only items (exam usage).
- Teaching effect: detail sentence 1 (要件定義 analyzes workflows) and sentence 3 (finer names exist) are now independent; points[0] / [1] (システム要件定義 /
  ソフトウェア要件定義 each with its own content + qids) are unaffected. **M1 resolved.**

### 3.2 u01 M2 — JIS X 25010 edition

- `terms[2].detail_jp/zh/en` sentence 1 and `fig.data.cols[0].jp/zh/en` all carry 「JIS X 25010:2013」 with 8 characteristics; the figure lists exactly the
  8 characteristics of the 2013 edition.
- Unit-wide grep (25010 / 8 つ / 8 项 / 8 characteristics / 九 / 9): no other field states the 8-characteristic structure. Sentence 2 「前の規格の機能性は、
  JIS X 25010 の機能適合性にほぼ当たる」 is unqualified but makes no count claim and stays true for the 2025 edition (機能適合性 kept), and follows
  sentence 1 that fixes the edition. `points[0]` (使用性) / `points[1]` (機能性・信頼性) describe single characteristics by the names their qids use;
  they do not present the 8-structure. `key_points_jp[1]` lists properties (使いやすい / 故障に強い / 別の環境で動く), no structure claim.
- External check: secondary source TAC 出版 「JIS X 25010 規格改訂情報」 (2026-03-19 現在, bookstore.tac-school.co.jp …/1145_1.pdf): 「2025 年 12 月 22 日に
  JIS X 25010 が改訂され、製品品質モデルと利用時品質モデルが次の二つの JIS に分かれて制定された」 (JIS X 25010 製品品質モデル / JIS X 25019 利用時品質モデル);
  its table lists 9 characteristics (機能適合性, 性能効率性, 互換性, インタラクション容易性, 信頼性, セキュリティ, 保守性, 柔軟性, 安全性). A JSA public-comment
  draft (webdesk.jsa.or.jp, JIS X 25010 原案) and issoh.co.jp agree. The JISC database entry itself was not retrieved (no primary standard text fetched).
  This matches Rule A M2's premise (revised 2025-12-22, 9 characteristics). No content added — the edition qualifier is sufficient for the finding.
- **M2 resolved.**

### 3.3 u03 L1 — 「(回帰テストもその一つ)」 / "regression tests among them"

- Claim structure: tests of changes to a running system — including regression tests of such changes — are run in a separate, production-equivalent
  test environment. It adds no 「だけ」/ only, does not say regression testing happens only after release or only in that environment; `one_jp`
  (修正・変更した後に…) and `detail_jp` keep the general definition. q045 (cited, tagged 回帰テスト) supports the environment claim for changes to a
  running system, and regression tests of those changes are inside that class. **No unsupported restriction** (the a1 #2 MEDIUM type is not re-created).
- Residual nuance: 「AもBの一つ」 can be read as classifying 回帰テスト in general under "tests of a running system". LOW-cosmetic, §4 obs. 1.

### 3.4 u03 L3 — en "joining test"

- "Also known by the Japanese name **joining test** ([[jp:結合テスト]])" reads as if "joining test" were itself the Japanese name; it is the literal gloss.
  Meaning recoverable (the [[jp:]] token shows the real name), no factual error → LOW-cosmetic. Proposed better rendering (parity counts unaffected;
  bold + [[jp:]] kept):
  `terms[1].detail_en` (+ `explanation_en`, stripped): "Also known by the Japanese name **joining test** ([[jp:結合テスト]]), it checks the seams,"
  → "Also called [[jp:結合テスト]] in Japanese (literally a **joining test**), it checks the seams,"
  (alternative: "In Japanese it is also called [[jp:結合テスト]] (literally **\"joining test\"**); it checks the seams, …").

### 3.5 u04 L1 — caption vs figure

- Step 2 shows nodes up to システムテスト (`state.show: 3`); new caption 「開発者が、すべてを組み上げた状態で機能や性能を確かめる。」 describes system testing
  (fully assembled, functions + performance, by developers) and keeps the 2nd sentence (委託先がここまで担当する場合の例 = a1 r1 #3 limitation). Step 1 caption
  (個々のプログラム + 組み合わせ) and step 3 (発注者が受け取るかを決める) still bracket it correctly. zh / en equivalent. Caption ↔ figure match: yes.

### 3.6 u04 L2 / L3 — 妥当性確認 wording

- jp 「名前は、特定の工程というより、確かめる観点を表している。」 / en "rather than one particular phase of testing" / zh 「与其说指某个特定工序，不如说表示确认的着眼点」:
  the exclusive 「工程ではなく」 is softened, so a question listing 妥当性確認 among phase names (2025r07-q046, uncited) no longer contradicts the text.
  The V&V framing (検証 = 仕様どおり / 妥当性確認 = 役に立つか) is intact. `pairs[0].rows[0]` (観点の名前 / 工程の名前) remains a contrast table row and is
  compatible with "rather than"; `overview_rows[1].extra_jp[1]` (システムを動かして使える段階) is now less in tension.
- zh L3: 「**验证**（[[jp:検証]]）」 replaces 「确认（**验证**，…）」, so 确认 no longer doubles as the verification term; 确认测试 stays the headword translation.

## 4. Observations (not blockers)

1. LOW-cosmetic, u03 p01 `terms[4].points[2].text_jp`: optional tighter wording that cannot be read as classifying all regression tests under running-system
   tests: 「稼働中のシステムに加えた変更を確かめるテスト (回帰テストもその一つ) は、」→「稼働中のシステムに加えた変更を確かめるテスト (その変更に対する回帰テストも含む) は、」
   / zh 「（回归测试（[[jp:回帰テスト]]）也是其中之一）」→「（包括针对该变更的回归测试（[[jp:回帰テスト]]））」/ en ", regression tests ([[jp:回帰テスト]]) among them," unchanged
   (already reads as membership of some regression tests).
2. LOW-cosmetic, u03 p04 `terms[2].points[0].text_jp`: 「性能の要件が目標値に届くか」 — the requirement is the target; optional
   「応答時間やスループットといった性能が要件の目標値に届くかは、」 (zh 「…等性能能否达到需求的目标值」, en "Whether performance such as response time … and
   throughput … reaches the required targets is checked …"). Meaning is clear as is.
3. LOW-cosmetic, u03 p08: see §3.4 proposal.
4. u01 M2 external: secondary (TAC errata, JSA draft) only; primary JISC entry not fetched. The patch does not depend on the 2025 details.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0 (u01 M1 resolved; u01 M2 resolved, revision fact cross-checked)
- LOW introduced: cosmetic only (§4 obs. 1–3)
- D-198: u01 L1 and u04 L1 near-matches cleared (u04 ed 0.19 → 0.62, Dice 0.70 → 0.27; u01 unmasked LCS 14 → 5); no new copying
- validate 5/5 = 0 issues (u02 1 known false-positive warn), parity 5/5 = 0 diff (25 / 27 / 27 / 26 / 20 locations), vitest textbook 162/162

**PASS** — all 39 patches applied with derived fields following; each resolves its named finding faithfully across ja/zh/en; no new HIGH/MEDIUM.
