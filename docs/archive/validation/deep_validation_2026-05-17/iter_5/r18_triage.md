# R18 Triage Report — Iter 5 Round 18

Triage agent: analyst (subagent_type=analyst, model=claude-opus-4-7[1m])
Triage at: 2026-05-18T00:30:00Z
Inputs: 9 R18 audit reports (3 perspectives × 3 languages) over the same 30-page sample.
Rule-D isolation respected: triage agent ≠ any of the 9 reviewers.

## 0. Cross-perspective summary

| # | Defect (one-line) | Page | FINAL severity | Perspectives flagging | Root cause | Fix class |
|---|---|---|---|---|---|---|
| 1 | White-box test demerit semantically inverted ("cannot find program errors") in all 3 languages | 249 | **RELEASE_IMPACTING** | 7/9 (ITPRO-JP, ITPRO-ZH, ITPRO-EN, EDU-JP, EDU-ZH, EDU-EN, READER-EN) | Source-faithful Stage-5 (JP source error mirrored to ZH+EN) | fixable_surgical (rewrite all 3 leaves) |
| 2 | Black-box test demerit garbled grammar in JP (missing particle) → faithfully broken ZH+EN | 249 | **RELEASE_IMPACTING** | 6/9 (ITPRO-JP, ITPRO-ZH, ITPRO-EN, EDU-JP, EDU-EN, READER-JP, READER-EN) | OCR or Stage-4/5 particle drop in JP; Stage-5 literal pass-through | fixable_surgical (rewrite all 3 leaves) |
| 3 | Sentence-as-term: p363::3 surface is a full sentence (all 3 languages) | 363 | **RELEASE_IMPACTING** | 7/9 (ITPRO-JP, ITPRO-EN, EDU-JP, EDU-ZH, EDU-EN, READER-JP, READER-ZH, READER-EN) | Stage-4 entity-boundary mis-extraction | fixable_structural (re-tag entity type OR rewrite surface to noun phrase) |
| 4 | Sentence-as-term: p392::6 surface is a full sentence (all 3 languages) | 392 | **RELEASE_IMPACTING** | 4/9 (EDU-JP, EDU-ZH, EDU-EN, READER-JP, READER-EN) | Stage-4 entity-boundary mis-extraction | fixable_structural (re-tag OR rewrite surface to noun phrase) |
| 5 | Page-225 zh internal RFP-name drift: 提案邀请书 vs 提案请求书 within same page | 225 | **RELEASE_IMPACTING** | 1/9 (ITPRO-ZH) HIGH confidence + corroborated by glossary cross-check | Stage-5 within-page consistency | fixable_surgical (normalize zh surface across 4 entities) |
| 6 | Glossary collapses ハウジング/ホスティング to same zh "主机托管服务" despite p199 distinguishing them | 199/glossary | **RELEASE_IMPACTING** | 1/9 (ITPRO-ZH) HIGH confidence | Glossary policy / Stage-5 polysemy collapse | fixable_glossary (per iter-4 F2 pattern) |
| 7 | Differential/Incremental backup definitions say "newly added" instead of "added or modified" — concept error for ITパスポート exam | 432 | **RELEASE_IMPACTING** | 5/9 (ITPRO-JP-WARN, ITPRO-ZH-W, ITPRO-EN-W, EDU-JP-W, EDU-EN, READER-EN absent — but corroborated by NIST/industry consensus) | Source-faithful Stage-5 mirror of JP under-spec | fixable_surgical (rewrite definitions in all 3 languages) |
| 8 | Page-327 zh AND/OR/XOR/NOT defined as "Japanese name for X operation" — zero teaching value to zh learner | 327 | **RELEASE_IMPACTING** | 2/9 (EDU-ZH × 4 entities FAIL, EDU-EN INFO/uninformative) | Stage-5 literal translation of JP-internal etymology gloss to zh | fixable_surgical (rewrite 4 definition.zh leaves with truth-table semantics) |
| 9 | p392::4 + p392::5 surface-definition mismatch (terms whose definitions are meta-narrative not concepts) | 392 | WARN | 2/9 (EDU-JP FAIL, EDU-ZH WARN) | Stage-4 entity-typing | deferred_phase2 OR fixable_structural |
| 10 | Page-179 嵌入式系統 = "通常指マイコン" misleading scope | 179 | WARN | 2/9 (ITPRO-ZH-I, EDU-JP-FAIL) | Source-faithful | deferred_phase2 |
| 11 | Page-179 firmware "not intended to be rewritten" overstated | 179 | WARN | 2/9 (EDU-JP, EDU-EN) | Source / Stage-5 | deferred_phase2 |
| 12 | Page-225 ZH missing Japan-jurisdiction context on 绿色采购法 | 225 | WARN | 2/9 (EDU-ZH FAIL, EDU-EN WARN) | Source / Stage-5 policy | fixable_surgical (small annotation) |
| 13 | Page-199 cloud-computing definition too narrow (defined by contrast only) | 199 | WARN | 4/9 (ITPRO-ZH-I, EDU-JP-FAIL, EDU-ZH-FAIL, EDU-EN-WARN, READER-EN-WARN) | Source-faithful Stage-5 mirror of textbook | deferred_phase2 (pedagogical, not concept-wrong) |
| 14 | Page-100 ISO 9002 row description ambiguous (ISO 9002 vs ISO/TS 9002) | 100 | WARN | 1/9 (EDU-EN FAIL) | Source ambiguity | deferred_phase2 (low exam frequency) |
| 15 | Page-75 1-Click patent year stated as 2018 (should be 2017) | 75 | WARN | 1/9 (ITPRO-EN FAIL) | Source factual error | source_defect (document; cannot fix without source change) |
| 16 | Page-128 zh within-page 顾客/客户 BSC inconsistency | 128 | WARN | 1/9 (READER-ZH) | Stage-5 | fixable_surgical (small) |
| 17 | Page-146 zh+en within-page 学习用数据/training data/learning data inconsistency | 146 | WARN | 2/9 (READER-ZH, READER-EN) | Stage-5 | fixable_surgical (small) |
| 18 | Page-179/225 zh retains Japanese 「」corner brackets | 179, 225 | WARN | 1/9 (READER-ZH, 6 instances) | Stage-5/7 punctuation normalization gap | deferred_phase2 (cosmetic-pervasive) |
| 19 | Page-292 SLA caption is run-on string with no separators (jp + en) | 292 | WARN | 2/9 (READER-JP, READER-EN) | Stage-5 / OCR table-flattening | deferred_phase2 (cosmetic) |
| 20 | Page-181/300/555 questions have no explanation/rationale field (systemic schema gap) | 181, 300, 555 | WARN | 2/9 (EDU-JP × 10 questions FAIL, EDU-EN INFO) | Schema design | deferred_phase2 (schema-level redesign) |
| 21 | Page-179 工业4.0 zh: 4th-revolution explicit framing missing + 起源国 Germany missing | 179 | WARN | 2/9 (EDU-ZH FAIL, EDU-EN WARN) | Source-faithful | deferred_phase2 (pedagogical enhancement) |
| 22 | Page-119 zh "风险企业" (HK/TW idiom) vs mainland "初创企业" preference | 119 | WARN | 1/9 (ITPRO-ZH-W) | Stage-5 dialect choice | deferred_phase2 (acceptable as policy) |
| 23 | Page-487 zh+en section title casing/scope inconsistency "Relationship between address and IP Address" | 487 | WARN | 2/9 (ITPRO-EN INFO, READER-EN WARN) | Stage-5 | fixable_surgical (small) |
| 24 | Page-484 IMAP definition mixes exam meta-commentary into definition field | 484 | WARN | 2/9 (EDU-ZH WARN, READER-EN INFO) | Stage-5 / schema | deferred_phase2 (schema-level) |
| 25 | Page-363 figure code-example romaji "Yamada-san Konnichiwa" inconsistency vs zh keeping JP literal | 363 | WARN | 2/9 (ITPRO-EN INFO, READER-EN WARN) | Stage-5 code-literal policy | deferred_phase2 |
| 26 | Page-100 ISO definition tautological in zh + en | 100 | WARN | 2/9 (EDU-ZH FAIL, EDU-EN WARN) | Source-faithful | deferred_phase2 |
| 27 | Page-179 智能工厂 self-reference loop in en ("Also called smart factory") | 179 | WARN | 1/9 (READER-EN) | Stage-5 / source | deferred_phase2 (cosmetic) |
| 28 | Page-181 zh choice-marker ア／イ vs A/B/C/D cross-lang asymmetry | 181 | INFO | 1/9 (READER-JP) | By design | not actioned |
| 29 | Page-100 INFO: ISO acronym pedantic note | 100 | INFO | 1/9 (ITPRO-EN) | n/a | not actioned |
| 30 | Page-487 entity-id ::1 skip-gap (cosmetic) | 487 | INFO | 1/9 (READER-JP) | Stage-4 numbering | not actioned |

## 1. Release-impacting (FINAL severity = RELEASE_IMPACTING)

### F1 — Page 249, table::p249::2, White-Box demerit row inversion (3 languages)

- **Perspectives**: 7/9 (ITPRO-JP, ITPRO-ZH, ITPRO-EN, EDU-JP, EDU-ZH, EDU-EN, READER-EN)
- **Evidence (verified against output/pages/page_249.json)**:
  - jp: `プログラムの誤りを見つけられない`
  - zh: `无法发现程序的错误`
  - en: `Cannot find errors in the program`
- **Root cause**: Source textbook has imprecise JP wording; Stage-5 produced source-faithful zh+en. Net effect = concept inversion for learner.
- **Fix class**: `fixable_surgical`
- **Proposed fix**: Rewrite the cell across all 3 languages to articulate the actual demerit (cannot find spec-coverage / requirements-omission errors):
  - jp: `仕様自体の誤りや要求漏れは検出できない`
  - zh: `无法发现规格说明书本身的错误或需求遗漏`
  - en: `Cannot detect specification errors or missing functionality (errors of omission)`
- **Regen MD**: yes (page_249.md must be regenerated from updated translated/page_249.json and output/pages/page_249.json)

### F2 — Page 249, table::p249::2, Black-Box demerit row grammar (3 languages)

- **Perspectives**: 7/9 (ITPRO-JP, ITPRO-ZH, ITPRO-EN, EDU-JP, EDU-EN, READER-JP, READER-EN)
- **Evidence**:
  - jp: `すべての複雑なテストしないので、発生頻度が低い不具合（バグ）が見つけられない可能性がある` (missing particle)
  - zh: `由于不进行所有复杂的测试，可能无法发现发生频率较低的缺陷（程序错误（Bug））` (nested-paren mess)
  - en: `Since not all complex tests are performed, there is a possibility that low-frequency defects (Bug) may not be found` (singular/plural mismatch)
- **Root cause**: OCR or Stage-4/5 particle drop in JP source; Stage-5 propagated brokenness.
- **Fix class**: `fixable_surgical`
- **Proposed fix**:
  - jp: `すべての分岐や条件を網羅的にテストするわけではないので、発生頻度が低い不具合（バグ）が見つけられない可能性がある`
  - zh: `由于无法穷举所有代码路径，可能漏掉低频触发的缺陷（Bug）`
  - en: `Because it does not exercise every internal execution path, rarely triggered defects (bugs) may go undetected`
- **Regen MD**: yes

### F3 — Page 363, term::p363::3, sentence-as-term (3 languages)

- **Perspectives**: 7/9 (ITPRO-JP, ITPRO-EN, EDU-JP, EDU-ZH, EDU-EN, READER-JP, READER-ZH, READER-EN; ITPRO-ZH did not flag explicitly but glossary cross-check would catch)
- **Evidence (verified against output/pages/page_363.json)**:
  - surface.jp: `関数の呼び出し時に引数を指定すると、その引数が関数に渡されます。` (full sentence)
  - surface.zh: `调用函数时指定参数，该参数会被传递给函数。`
  - surface.en: `When you specify an argument when calling a function, that argument is passed to the function.`
- **Root cause**: Stage-4 entity-boundary mis-extraction; a body paragraph was tagged as a term.
- **Fix class**: `fixable_structural` (surgical via surface rewrite is acceptable as iter-5 patch; full re-extraction can wait for Phase 2)
- **Proposed fix**: Rewrite surface to a noun phrase. Definition is already paragraph-like and acceptable.
  - surface.jp: `引数を指定した関数の呼び出し`
  - surface.zh: `带参数的函数调用`
  - surface.en: `Function call with arguments`
- **Regen MD**: yes

### F4 — Page 392, term::p392::6, sentence-as-term (3 languages)

- **Perspectives**: 5/9 (EDU-JP, EDU-ZH, EDU-EN, READER-JP, READER-EN)
- **Evidence (verified)**:
  - surface.jp: `コンピュータを区別する境界線が曖昧になっている`
  - surface.zh: `区分计算机的边界正在变得模糊`
  - surface.en: `The Boundaries That Distinguish Computers Are Becoming Blurry`
- **Root cause**: Stage-4 entity-boundary mis-extraction (same pattern as F3).
- **Fix class**: `fixable_structural` (surgical surface rewrite acceptable)
- **Proposed fix**: Rewrite surface to a noun phrase.
  - surface.jp: `コンピュータ分類境界の曖昧化`
  - surface.zh: `计算机分类边界的模糊化`
  - surface.en: `Blurring of Computer-Category Boundaries`
- **Regen MD**: yes

### F5 — Page 225, within-page zh terminology drift (提案邀请书 vs 提案请求书)

- **Perspectives**: 1/9 (ITPRO-ZH; HIGH confidence with cross-entity evidence across 4 entities)
- **Evidence**:
  - section.zh, term::p225::1 (提案依頼書) zh surface, figure caption: 提案邀请书（RFP）
  - term::p225::4 (RFP) zh surface: 提案请求书（RFP）
  - glossary RFP surface.zh: 提案请求书（RFP）
- **Root cause**: Stage-5 within-page consistency miss (RFP and 提案依頼書 are the same concept but two entities exist with different zh surfaces).
- **Fix class**: `fixable_surgical` + glossary alignment
- **Proposed fix**: Normalize all 4 within-page zh occurrences + glossary RFP zh surface to a single phrase. Recommended: `提案邀请书（RFP）` (mainland-PRC IT-vendor usage; matches the figure caption already). Update term::p225::4 surface.zh and glossary g_RFP surface.zh.
- **Regen MD**: yes

### F6 — Glossary: ハウジング/ホスティング both map to "主机托管服务" in zh

- **Perspectives**: 1/9 (ITPRO-ZH HIGH confidence)
- **Evidence**:
  - p199 figure::p199::2 panel "ハウジングサービス" → "主机托管服务" (correct)
  - p199 figure::p199::2 panel "ホスティングサービス" → "主机租用服务" (correct)
  - glossary maps BOTH JP terms → zh surface "主机托管服务" (verified via spec)
- **Root cause**: Glossary policy / Stage-5 polysemy collapse — two distinct JP concepts merged to one zh surface in glossary.
- **Fix class**: `fixable_glossary` (matches iter-4 F2 surgical-override pattern; g_524 流程→进程 case)
- **Proposed fix**: Update glossary ホスティングサービス surface.zh from "主机托管服务" to "主机租用服务". Keep ハウジングサービス as "主机托管服务". This restores the disambiguation already correctly drawn on page 199.
- **Regen MD**: glossary-only (page MDs already correct)

### F7 — Page 432, differential/incremental backup definitions miss "modified" (3 languages)

- **Perspectives**: 5/9 (ITPRO-JP-WARN, ITPRO-ZH-W, ITPRO-EN-W, EDU-JP-W, EDU-EN; cross-corroborated)
- **Evidence**:
  - jp: `フルバックアップ以降、新たに追加されたデータをバックアップする` (only "added")
  - zh: `对完全备份之后新增的数据进行备份。` (only "新增")
  - en: `Backing up data that has been newly added since the full backup` (only "added")
- **Root cause**: Source-faithful Stage-5 mirror of JP under-specification.
- **Severity reclassification rationale**: Although each individual reviewer marked WARN, this is a concept-correctness defect on a high-frequency exam topic (full/diff/incremental are tested separately in ITパスポート). 5 perspectives flagging on same defect + concept error = elevate to RELEASE_IMPACTING.
- **Fix class**: `fixable_surgical`
- **Proposed fix** (both 差分バックアップ and 増分バックアップ):
  - 差分.jp: `前回のフルバックアップ以降に変更（追加・修正）されたすべてのデータをバックアップする方式。` (≈)
  - 差分.zh: `备份自上次完全备份以来发生变化（新增或修改）的所有数据。`
  - 差分.en: `Backing up all data that has changed (added or modified) since the last full backup.`
  - 増分.jp: `前回のバックアップ（フル・差分・増分いずれでも）以降に変更（追加・修正）されたデータのみをバックアップする方式。`
  - 増分.zh: `仅备份自上次备份（无论完全、差异或增量）以来发生变化（新增或修改）的数据。`
  - 増分.en: `Backing up only the data that has changed (added or modified) since the previous backup (full, differential, or incremental).`
- **Regen MD**: yes

### F8 — Page 327, zh definitions of AND/OR/XOR/NOT empty of semantics

- **Perspectives**: 2/9 (EDU-ZH × 4 FAIL flags + EDU-EN INFO acknowledging same problem)
- **Evidence**:
  - p327::0 definition.zh: `逻辑与（AND）运算的日语名称。`
  - p327::1 definition.zh: `逻辑或（OR）运算的日语名称。`
  - p327::2 definition.zh: `XOR运算的日语名称。`
  - p327::3 definition.zh: `NOT运算的日语名称。`
- **Root cause**: Stage-5 literally translated the JP-internal etymology comment ("日本語名称") into zh, where the framing makes no sense (zh reader doesn't need to know the JP name for these). Result = zero teaching value.
- **Severity reclassification rationale**: 4 separate FAIL flags on foundational exam topics. Truth-table tables on the same page do exist and salvage understanding partially, but zh-side term definitions remain release-impacting (a zh learner looking up "逻辑与" should not see "the Japanese name for AND").
- **Fix class**: `fixable_surgical` (4 leaves)
- **Proposed fix**: Replace definition.zh for each with truth-table semantics:
  - 逻辑与: `两个布尔输入都为真（1）时输出真（1），否则输出假（0）的逻辑运算。日语称为「論理積」。`
  - 逻辑或: `两个布尔输入中至少有一个为真（1）时输出真（1），仅当两者都为假时输出假（0）的逻辑运算。日语称为「論理和」。`
  - 异或: `两个布尔输入不同（一真一假）时输出真（1），相同时输出假（0）的逻辑运算（XOR）。日语称为「排他的論理和」。`
  - 否定: `将单个布尔输入反转的一元运算（0→1，1→0）。日语称为「否定」。`
- Optionally apply same fix to en definitions (same content-free issue per ITPRO-EN INFO), but EN learners can fall back on truth-table tables — keep en out of scope unless trivial.
- **Regen MD**: yes

## 2. WARN — Phase 2 polish backlog

Grouped by theme:

### 2a. Pedagogical thin-definition (Phase 2 candidates)
- p075::0 商標権 narrow definition (EDU-JP)
- p075::1 ビジネスモデル特許 circular (EDU-JP)
- p100::1 ISO 9000 tautological (EDU-EN, EDU-ZH)
- p119::4 M&A no acronym expansion (EDU-JP, EDU-ZH, EDU-EN)
- p119::5 アライアンス boundary vs M&A unclear (EDU-JP)
- p146::4 ディープラーニング too terse (EDU-JP, EDU-ZH)
- p146::6 教師あり学習 missing counterparts (EDU-JP)
- p179::5 工业4.0 missing "4th revolution" framing + Germany origin (EDU-ZH, EDU-EN)
- p179::6 嵌入式系統 = マイコン misleading (ITPRO-ZH, EDU-JP)
- p179::9 firmware "not rewritable" overstated (EDU-JP, EDU-EN)
- p199::0 cloud computing definition too narrow (ITPRO-ZH, EDU-JP, EDU-ZH, EDU-EN, READER-EN)
- p225::1 RFP thin (EDU-JP, EDU-EN)
- p225::2 提案書 thin (EDU-JP)
- p225::5 検収 thin (EDU-JP, EDU-ZH)
- p327::0–3 also affects pedagogy on JP side (EDU-JP × 4 WARN)
- p392::4–5 terms-as-narrative (EDU-JP × 4 FAIL, EDU-ZH × 3 WARN) — see also F4
- p464::1 トランザクション no ACID (EDU-JP, EDU-ZH)
- p484::1 IMAP "doesn't download" oversimplification (ITPRO-ZH, EDU-JP, EDU-ZH)
- p487::2 ICANN role oversimplification (ITPRO-ZH, EDU-JP, EDU-ZH, ITPRO-EN, EDU-EN)

### 2b. Jurisdiction / cultural context (Phase 2 add Japan-tag policy)
- p225::6 グリーン購入/グリーン購入法 not labeled as Japanese law (EDU-ZH FAIL, EDU-EN WARN)
- p075::0 商標権 renewability is Japan-IP-specific (EDU-EN)
- p075::1 "Patent Act" unattributed jurisdiction (EDU-EN)

### 2c. Within-page consistency drift
- p128 zh 顾客/客户 BSC (READER-ZH) — small surgical fix
- p146 zh 学习用数据 vs 用于学习的数据; en training data vs learning data (READER-ZH, READER-EN) — small surgical fix
- p487 en "address" vs "IP Address" casing (READER-EN, ITPRO-EN) — small surgical fix
- p327::7 NOR header zh gloss inconsistency vs NAND (READER-ZH, ITPRO-EN) — cosmetic

### 2d. Cross-language punctuation / cosmetic
- p179, p225 zh retaining JP「」brackets across 6 leaves (READER-ZH) — pervasive cosmetic; Phase-2 normalization pass
- p292 SLA caption run-on string (jp + en + zh) (READER-JP, READER-EN)
- p199 em-dash style in jp caption (READER-JP)
- p363 figure code-example romaji style (ITPRO-EN, READER-EN, READER-ZH)
- p146 quoting-style single vs double (READER-EN)
- p146 missing terminal periods on en (READER-EN)

### 2e. Schema-level pedagogical gap
- Question entities (p181, p300, p555) lack `explanation`/`rationale` field — 10 question instances flagged FAIL by EDU-JP, INFO by EDU-EN. This is schema-level, not page-level; Phase 2 schema change.
- kana_helper globally null on JP terms (EDU-JP systemic WARN) — Phase 2 schema enhancement.

### 2f. Other terminology preferences (mainland zh)
- p119::1 风险企业 → 初创企业 (ITPRO-ZH MEDIUM) — optional dialect policy
- p225::3 信息请求书 → 信息征询书 (ITPRO-ZH MEDIUM)
- p363::0 引数 (实参/形参) suffix mis-suggests synonymy (ITPRO-ZH MEDIUM, EDU-ZH WARN)

## 3. INFO — noted, not actioned

- p181 jp ア/イ vs zh+en A/B/C/D marker asymmetry (READER-JP) — by design
- p100 ISO acronym pedantic ("ISO is not an acronym") (ITPRO-EN)
- p100 ISO 9002 row currency (ITPRO-EN)
- p128 BSC "Internal Business Process" qualifier (ITPRO-EN)
- p146 en "labels"/"ground truth" gloss (ITPRO-EN)
- p179 firmware etymology phrasing (ITPRO-EN)
- p210 mining etymology "金を掘る" narrowness (ITPRO-EN, EDU-JP)
- p249 white-box advantage "branch coverage" overstatement (ITPRO-EN)
- p327 NAND/NOR EN gloss "Negative AND" → "Negated AND" (ITPRO-EN)
- p392 EN cross-reference "(p.216)" anchor (ITPRO-EN, READER-JP)
- p484 POP/IMAP version-qualifier (POP3/IMAP4) (ITPRO-EN, EDU-ZH)
- p487 IP-address casing (ITPRO-EN)
- p487 ICANN broader role (ITPRO-EN, READER-EN; partly RELEASE-impacting in 2a)
- p555 WPA2/WPA3 currency note (ITPRO-EN)
- p555 NIST SP 800-88 modern guidance note (ITPRO-EN)

## 4. Systemic patterns (≥3 pages share defect class)

| Pattern | Pages | Count | Phase-2 backlog item |
|---|---|---|---|
| Sentence-as-term (Stage-4 entity-boundary leak) | 363::3, 392::6, 392::4, 392::5 | 4 entities × 3 languages = 12 leaves | Confirms iter-3/iter-4 finding that Stage-4 paragraph-vs-term classifier has a recall edge; Phase-2 re-train/prompt-revise needed |
| Source-faithful but concept-imprecise (JP source under-spec → faithful zh/en) | 249 white-box demerit, 249 black-box demerit, 432 backup defs, 199 cloud, 100 ISO 9000, 179 firmware, 179 工业4.0, 179 embedded, 75 trademark, 75 patent year, 225 RFP, 225 検収 | 12+ entities | Confirms iter-3 R6 "source-faithful is not always learner-correct" finding. Phase-2 needs a "concept-correctness override" pass with domain dictionary |
| Within-page zh/en terminology drift | 128 顾客/客户, 146 training/learning, 225 提案邀请/请求, 487 address/IP Address | 4+ pages | Phase-2 within-page consistency post-pass; or move to glossary-driven uniform surface lookup |
| Japan-jurisdiction context missing | 75 商標, 75 patent, 225 グリーン購入法 | 3+ entities | Phase-2 add Japan-law tagging policy; auto-prefix "Under Japanese law," or "日本法において" |
| Pervasive JP corner-bracket 「」 leak in zh | 179 (×4), 225 (×2), 199 (×1) | 7+ occurrences | Phase-2 zh punctuation-normalization Stage-7 step |
| Question schema lacks explanation/rationale | 181 (×4), 300 (×4), 555 (×2) | 10 question instances | Phase-2 schema change (add explanation: {jp/zh/en}) + back-fill |
| kana_helper null on JP terms | global | All JP term entities | Phase-2 add kana_helper enrichment step for katakana-heavy terms |

## 5. Statistics

- **Total raw findings across 9 audits**: 207 (ITPRO-JP 5 + ITPRO-ZH 13 + ITPRO-EN 29 + EDU-JP 60 + EDU-ZH 70 + EDU-EN 25 + READER-JP 13 + READER-ZH 15 + READER-EN 24, minus duplicates de-duped during reading = approx. 207 raw entries)
- **After cross-correlation deduplication**: ~115 unique defect-entities (30 multi-perspective canonical defects + ~85 single-perspective)
- **Final RELEASE_IMPACTING**: **8** (F1–F8)
- **WARN (Phase 2 backlog)**: ~52 entries grouped into 6 themes
- **INFO**: ~32 entries (not actioned)
- **Pages with ≥1 RELEASE_IMPACTING**: 6 (pages 199, 225, 249, 327, 363, 392, 432; plus glossary-level F6) → **6 page-level + 1 glossary-level = 7 fix targets**

## 6. Deferred to Phase 2 (backlog count)

- **deferred_phase2**: ~52 unique defects
- **source_defects (cannot fix in pipeline)**: 1 (p75 1-Click patent year 2018 → actually 2017 is a source-textbook error; pipeline can override or annotate but original wrong)

## 7. Triage decision

Recommend R19 surgical fix pass targeting F1–F8 (8 fixes across pages 199, 225, 249, 327, 363, 392, 432, plus 1 glossary). All 8 are surgical or glossary-overrides, no LLM re-runs needed. Regen 6 page MDs + glossary MD. Then dispatch R20 2-agent verification (different subagent_types from R18 and R19) per Rule D.
