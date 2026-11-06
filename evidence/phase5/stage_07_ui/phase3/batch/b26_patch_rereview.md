# b26 B3 patch re-review — technology-21-55 u01–u03 (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 147)
- Scope: B3 wording patches for technology-21-55-u01 (p01–p05), u02 (p01–p11) and u03 (p01–p07)
  — **23 `active`, 0 retired** (`patches/technology-21-55-u0{1,2,3}.json`), checked against the Rule A prescriptions
  (`technology-21-55-u01.ruleA.md` **M1** + L1・L2 建議修; `-u02` **M1** + L1〜L4 建議修; `-u03` L1〜L3 建議修 — every MEDIUM and 建議修 of the 3 files, none left unapplied)
  and the merged units `data/ip/textbook/units/technology-21-55-u0{1,2,3}.json` (sha256 u01 `d73a1537fab41574…`, u02 `b57c37f4b06df288…`, u03 `81de3018ba6dd3c9…`).
- Pre-patch bases located by sha256 = `base_sha256` (all patches of a unit share one base; all match):
  u01 `b26-u01-a2/…loc.r0.json` (`3cead4a7…`), u02 `b26-u02-a2/…loc.r0.json` (`0554d17b…`), u03 `b26-u03-a1/…loc.r0.json` (`13a8e4d7…`); a1 parts of u01 / u02 are not the base.
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210 and the HIGH / MEDIUM / LOW definitions in the Rule A files; S147 additional types (8)(9)(10) (scratchpad `ruleA_template.md`).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names; matched fragments ≤12 chars except en sidecar overlaps, which are project translations and are quoted as the unit's own after-span).

## 0. Method

Same as `b25_patch_rereview.md` §0 (= b24 / b22 / b21 / b20 §0), topic technology-21-55 (55 questions; 275 source strings per language):

1. Application check (script): every string field of base and merged unit is walked. Each `after` must appear in its field; `before` (raw and notation-stripped) must not survive anywhere in the unit (derived copies included); every string that differs between base and unit (for paths present in the base) must be explained by a patch; the patches replayed in file order on the base must reproduce the unit's field exactly. Additionally each patch's `before` / `after` (bold stripped) was found verbatim in its unit's Rule A file (23/23).
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`) for every term and key point of the 3 units; `summary.memory_hooks_*` by suffix match.
3. D-198 (jp patches: u01 p02, p03; u02 p01, p07; u03 p01, p04): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked; masked windows with <6 real chars excluded), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every technology-21-55 question. zh / en patches: LCS against the zh / en translation sidecars of all 55 topic questions, whole patched field before → after and the `after` span alone. Plus a per-choice + stem LCS (before → after) of the patches against the focus questions: u01 p01 × 2025r07-q095, 2020r02o-q057; p02 × 2014h26h-q083, 2015h27a-q052; p03–p05 × 2018h30a-q100, 2024r06-q060, 2019r01a-q066; **u02 p01–p03 × every primary / foreign-key question of the topic** (2023r05-q059, 2011h23a-q057, 2013h25h-q055, 2010h22a-q079, 2026r08-q072, 2017h29a-q088, 2018h30a-q085, 2018h30a-q073, 2011h23tokubetsu-q072, 2014h26h-q064, 2023r05-q078, 2009h21a-q084, 2016h28a-q095, 2019r01a-q066, 2022r04-q065, 2010h22h-q083, 2014h26h-q060, 2024r06-q081, 2016h28h-q094, 2018h30h-q086); p04 × 2017h29a-q088, 2018h30a-q085, 2013h25a-q051; p05–p06 × 2014h26a-q068, 2026r08-q069, 2009h21a-q063; p07–p09 × 2021r03-q001, 2015h27a-q054, 2016h28h-q084, 2012h24a-q053; p10–p11 × 2019r01a-q066, 2018h30h-q086, 2025r07-q065; u03 p01–p03 × 2009h21a-q014; p04–p07 × 2010h22a-q088.
4. D-195 / D-200 via validate; `validate --part <base>` for comparison.
5. Manual reading of each patched field in context (whole term: one / detail / analogy / hook / points / fig; overview rows; pairs; key_points); meaning judged against the cited / quiz / challenge questions' `correct_answer` and their zh / en sidecars (b18 u05 M1 type) and the S147 types (8) analogy key word = another term's role, (9) cue applied to a cited / challenge scenario picks a wrong option, (10) closed enumeration dropping members.
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Scripts: scratchpad `b26rr/check.mjs`, `b26rr/d198.mjs`, `b26rr/focus2.mjs` (adapted from the b25 re-review scripts; only unit IDs / part paths / topic / focus questions changed), `b24rr/q.cjs` (question reader, unchanged).

Not established: as in b14–b25, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 161, u02 143, u03 84) were checked for the derived copies (step 2) and for `before` remnants (step 1).

## 1. Script results (fresh, 2026-11-06)

```
✓ technology-21-55-u01 unit: 0 issues   validate EXIT=0 | ✓ parity: 25 locations, 0 diff  EXIT=0
✓ technology-21-55-u02 unit: 0 issues, 1 warning(s)  validate EXIT=0 | ✓ parity: 27 locations, 0 diff  EXIT=0
    warn  choice-echo  terms[1](主キー).points[0].text_jp  2014h26h-q064 イ・エ   (pre-existing, unpatched field; Rule A u02 L5 記録のみ)
✓ technology-21-55-u03 unit: 0 issues   validate EXIT=0 | ✓ parity: 20 locations, 0 diff  EXIT=0
validate --part (bases): ✓ u01 part loc#0: 0 issues | ✓ u02 part loc#0: 0 issues | ✓ u03 part loc#0: 0 issues
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application: 23/23 `before` occur exactly once in the base field; 23/23 `after` present in their fields; replay of the patches in file order on the base reproduces every patched field exactly (3/3 units). Unexplained base → unit diffs in base-present paths: 0 per unit (changed paths u01 5, u02 11, u03 7 = exactly the patched fields, one patch per field; only the `stage` meta key removed, as in b19–b25; `round` / `jp_round` are non-string meta keys of the part). `before` remnants anywhere in the units (raw or stripped): 0. `check.mjs` "ruleA verbatim miss": [] for all 3 units.

Derived fields follow: u02 p01–p03 → `terms[2].memory_hook_jp / _zh / _en` = stripped hook (true ×3) and `summary.memory_hooks_*[2]` ends with the new hook in 3 languages ("外部キー: 「外部」は自分の表の外を指すという意味。外部キーは、外の表への道しるべになる。" etc.); u03 p04–p06 → `summary.key_points_*[3]` = stripped new key point (3/3). Other patched fields (points, pairs, overview_rows.extra, fig cell) have no derived copy. Full walk: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook`, and `summary.key_points_*` = stripped `key_points_*` — u01 63, u02 60, u03 39 checked (162), 0 mismatches. `summary.memory_hooks_*` suffix check: u01 15 / u02 15 / u03 9 entries, 0 bad.

Notation counts (bold, `[[jp:]]`), before → after, every patched field: unchanged in 23 of 23 (u01 `terms[2].points[1].text_en` bold 1 → 1 / `[[jp:]]` 1 → 1; u03 `terms[0].points[0].text_*` bold 2 → 2, zh / en `[[jp:]]` 2 → 2; u03 `key_points_*[3]` bold 1 → 1; all others 0 → 0). Parity 0 diff. u03 p01 jp length 85 (≤100, D-200).

D-198, before → after (one script):

| Patch | Lang | Nearest source (whole field) | LCS before → after | Longest overlap of the `after` span | jp windows unmasked / masked; wDice |
|---|---|---|---|---|---|
| u01 p01 | en | 2025r07-q095 stem | 19 → 19 (" in database design", unchanged scope words = the cited stem's own setting) | 19 (same) | — |
| u01 p02 | **jp** | 2014h26h-q083 stem | **7 (項目の洗い出し) → 5 (データ項目 = term)** | データ項目 (5) | 0 / 0 → 0 / 0; 0.25 → 0.17 |
| u01 p03 | **jp** | 2009h21a-q099 stem | 4 → 3 (数える) | 数える (3) | 0 / 0 → 0 / 0; 0.33 → 0.20 |
| u01 p04 | zh | 2016h28h-q084 / 2010h22h-q093 stem | 2 → 2 | 的条 (2) | — |
| u01 p05 | en | 2009h21a-q084 ウ → 2012h24a-q053 ア | 11 → 11 | ", and so on" (11, unchanged words) | — |
| u02 p01 | **jp** | 2016h28a-q095 ウ → 2010h22a-q079 stem | 4 → 4 (外部キー = term) | 外部キー (4, term) | 0 / 0 → 0 / 0; 0.10 → 0.20 |
| u02 p02 | zh | 2016h28a-q095 ウ | 3 → 3 (其他表, unchanged) | 其他表 (3) | — |
| u02 p03 | en | 2016h28a-q095 ウ → 2018h30a-q073 イ | 15 → 18 | "a foreign key is " (17; obs. 2) | — |
| u02 p04 | en | 2009h21a-q099 → 2009h21a-q098 stem | 12 → 18 | " depending on the " (18, generic) | — |
| u02 p05 | zh | 2018h30a-q085 エ (correct) | 3 → 3 (unchanged) | 整理 (2) | — |
| u02 p06 | en | 2009h21a-q098 stem | 10 → 19 | " a business partner" (19, the sidecar's rendering of 取引先; obs. 5) | — |
| u02 p07 | **jp** | 2009h21a-q014 stem | 7 → 7 (データの構造を, unchanged) | データの構造を (7) | 0 / 0 → 0 / 0; **0.65 → 0.47** (obs. 3) |
| u02 p08 | zh | 2009h21a-q014 stem | 5 → 5 (unchanged) | 数据的结构 (5) | — |
| u02 p09 | en | 2009h21a-q014 stem | 20 → 14 | "organizes the " (14) | — |
| u02 p10 / p11 | zh | 2010h22h-q093 stem | 2 → 3 | 唯一的 (3) | — |
| u03 p01 | **jp** | 2009h21a-q014 イ (wrong) | 9 → 9 (データクレンジング = headword, unchanged) | レコードに (5, term) | 0 / 0 → 0 / 0; 0.19 → 0.18 |
| u03 p02 | zh | 2009h21a-q014 stem | 5 → 5 (unchanged 2nd sentence) | 数据的 (3) | — |
| u03 p03 | en | 2009h21a-q014 stem | 18 → 18 (unchanged 2nd sentence) | " inconsistencies " (17, generic word) | — |
| u03 p04 | **jp** | 2010h22a-q088 stem | 11 → 11 (チェックディジットを付, unchanged) | コードを (4) | **2 / 0 → 2 / 0** (unchanged katakana part; obs. 6); 0.29 → 0.23 |
| u03 p05 | zh | 2010h22a-q088 stem | 4 → 4 (校验位后, unchanged) | 计算 (2) | — |
| u03 p06 | en | 2010h22a-q088 stem | 15 → 15 (" a check digit ", unchanged) | " the result " (12, generic) | — |
| u03 p07 | zh | 2009h21a-q099 stem | 2 → 2 | 表示 (2) | — |

No patched text approaches the calibration HIGH (ed 0.14 / Dice 0.52) as a sentence-frame copy; masked 12-char windows 0 / 0 before and after in all 6 jp patches. u01 p02 does what L1 asked: the judgment-item word 洗い出し is gone from the jp point (LCS vs q083 stem 7 → 5; per-choice 0 → 0 for q083 / q052).

Per-choice check (LCS before → after vs each choice; `focus2.mjs`):
- 2025r07-q095 (correct ウ = enumerate needed items and organise their relations; wrong エ = statistical exploration of big data): u01 p01 en vs every choice 5 → 5 / 3 → 3 ("data ") — no move toward エ.
- 2014h26h-q083 / 2015h27a-q052 (order questions): u01 p02 jp 0 → 0 vs every choice.
- 2018h30a-q100 (correct イ = via corresponding field values; wrong ア = same row position): u01 p03 jp vs ア 2 → 2, p04 zh vs ア 1 → 1, p05 en vs ア 8 → 8 ("counted " — the unchanged word; obs. 1), vs イ 5 → 4.
- **2023r05-q059** (correct エ = 会員表 with PK 店舗コード + 会員番号 and FK 会員種別コード): u02 p01 jp ≤1 vs every choice, p02 zh ≤1, p03 en ≤4 alike for イ and エ (generic "er t").
- other PK / FK questions: u02 p01–p03 overlaps are the term 外部キー (4) / " foreign key" (12) / "a foreign key " (14) alike for all four choices of 2013h25h-q055, 2017h29a-q088, 2018h30a-q073 (イ 17 = obs. 2), and ≤3 jp / ≤3 zh / ≤15 en (" another table.", unchanged words) elsewhere; no choice is favoured.
- u02 p04 vs 2017h29a-q088 / 2018h30a-q085 / 2013h25a-q051: ≤7 en ("e table"), alike across choices.
- u02 p05–p06 vs 2014h26a-q068 / 2026r08-q069 / 2009h21a-q063: unchanged (≤8, words of the unchanged part such as "ed into ").
- u02 p07–p09 vs 2021r03-q001 (correct ウ; wrong ア / イ = grasp data flow / exchange of the business): jp vs ア / イ 4 → 4 (データの), vs ウ 2 → 3; en vs ウ 13 → 10, vs ア / イ 10 → 10 (" business ") — the patch moves the row away from "analysing the business" and toward no wrong choice. vs 2015h27a-q054 stem jp 7 → 3.
- u02 p10–p11 vs 2019r01a-q066 / 2018h30h-q086 / 2025r07-q065: ≤2 zh.
- u03 p01–p03 vs 2009h21a-q014: unchanged per choice (jp 3 → 3, zh 2 → 2, en 4 → 4 alike for all four).
- u03 p04–p07 vs 2010h22a-q088: 0 → 0 vs every choice (numeric); en stem 4 → 12 (" the result ", generic).

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[2](項目).points[1].text_en` | **M1** (MEDIUM) | **Yes** (§3.1) | No | OK |
| u01 | p02 | `terms[3](テーブル).points[1].text_jp` | L1 建議修 | Yes: 洗い出し ×2 → 列挙 ×2; now the same verb as `terms[2].points[1]` (列挙し); zh 梳理 / en "identified … listed out" unchanged and consistent | No | OK |
| u01 | p03–p05 | `pairs[0].rows[2].a_jp / _zh / _en` | L2 建議修 | Yes: ordinal "1 件目、2 件目" / "第 1 条" / "1st, 2nd" → count of entries "1 件、2 件と件数で" / "按 1 条、2 条的条数" / "Counted in entries: one entry, two entries"; no row position is implied any more (2018h30a-q100 ア) | No (obs. 1) | OK |
| u02 | p01–p03 | `terms[2](外部キー).hook_jp / _zh / _en` (+ memory_hook, summary.memory_hooks[2]) | **M1** (MEDIUM, type 9) | **Yes** (§3.2) | No (obs. 2, 4) | OK |
| u02 | p04 | `pairs[0].rows[2].b_en` | L1 建議修 | Yes: "one per referenced table" → "depending on the tables it refers to" = jp 参照先に応じて / zh 可按引用对象 | No | OK |
| u02 | p05–p06 | `terms[4](正規化).analogy_zh / _en` | L2 建議修 | Yes: zh 客户 → 往来单位 (×2), en supplier → business partner / partner list — both now = jp 取引先 (both directions), zh and en agree; the split image (切り出し / 单独整理成 / moved into a dedicated … list) unchanged | No (obs. 5) | OK |
| u02 | p07–p09 | `overview_rows[0](E-R図).extra_jp / _zh / _en[0]` | L3 建議修 | Yes: "業務を分析して" → "業務の分析結果から" (zh 根据业务分析的结果 / en "from the results of business analysis") = `terms[0].points[2]` (業務の分析結果をもとに描き); E-R図 no longer does the analysis itself (2021r03-q001 ア / イ side) | No (obs. 3) | OK |
| u02 | p10–p11 | `overview_rows[1].extra_zh[0]`, `pairs[1].rows[0].a_zh` | L4 建議修 | Yes: 把行锁定为一行 → 锁定唯一的一行 (2 places); = jp 行を1つに特定する / en "Pins down a single row" | No | OK |
| u03 | p01–p03 | `terms[0](データクレンジング).points[0].text_jp / _zh / _en` (1st sentence) | L1 建議修 | Yes (§3.3) | No | OK |
| u03 | p04–p06 | `key_points_jp / _zh / _en[3]` (+ summary.key_points[3]) | L2 建議修 | Yes (§3.3) | No (obs. 6) | OK |
| u03 | p07 | `terms[2](コード設計).fig.data.rows[2].cells[2].zh` | L3 建議修 | Yes: 后 2 位 → 接下来的 2 位 = jp 次の2桁 / en "next 2"; no "last 2 digits" reading | No | OK |

## 3. Focused checks

### 3.1 u01 p01 (M1) — en scope of データ分析

- After (whole field): "**Data analysis** ([[jp:データ分析]]) carried out as a step in database design lists the data items the business needs and sorts out how those items relate to one another." (= auditor's M1 text verbatim). The non-restrictive appositive ", a step in database design," is replaced by the restrictive participial phrase "carried out as a step in database design", which limits the subject: the sentence now says what data analysis *within database design* does, not that data analysis in general is a design step. jp 「データベース設計の工程で行う**データ分析**では」 and zh 「在数据库设计过程中进行的**数据分析**…中」 unchanged → the three languages now carry the same restriction (type (5) regression closed).
- Type (9) on 2025r07-q095 (correct ウ = enumerate the needed items and organise their relations; wrong エ = exploring large data with statistical methods, i.e. general "data analysis"; wrong ア / イ = extraction from a DWH / selection of rows): an en reader now learns the enumeration-and-relations task only for the design step → ウ; nothing in the point describes エ's statistical exploration as "data analysis in database design". The cited stem's own setting (" in database design", LCS 19) is the scope phrase itself, not a choice frame. No other en string of u01 uses "data analysis" (grep). Note (out of scope, unchanged v1 invariant): u03's title is データ分析と前処理 / "Data Analysis and Preprocessing"; it is a unit title, not a definition, and does not reach u01's point. **M1 resolved.**

### 3.2 u02 p01–p03 (M1) — foreign-key hook vs 2023r05-q059 and all PK / FK questions

- After: jp 「「外部」は自分の表の外を指すという意味。外部キーは、外の表への道しるべになる。」 / zh 「“外”指的是指向本表之外。外键就是通往其他表的路标。」 / en "Foreign means it points outside its own table: a foreign key is a signpost to another table." (= auditor's M1 text verbatim, 3/3). The negation 「自分の行を見分ける鍵ではなく」 / 不是用来区分本表各行的钥匙 / "it is not the key for telling its own rows apart" is gone from the hook and from all derived copies (memory_hook_* and summary.memory_hooks_*[2]; 0 remnants). The hook now states only the positive role, so it no longer separates FK columns from row identification.
- Type (9) on **2023r05-q059** (会員番号 is assigned per store; the 会員 table after normalisation): hook → every column that points to another table stays as a signpost → 店舗コード (to 店舗) and 会員種別コード (to 会員種別) both stay in the 会員 table → ア (neither), イ (no 店舗コード) and ウ (no 会員種別コード) are out → **エ (correct)**. Nothing in the hook now speaks against 店舗コード also being part of the PK; 主キー `points[1]` (1 つの列で行が決まらない表では列を 2 つ以上まとめて 1 つの主キー) gives 店舗コード + 会員番号, since 会員番号 repeats across stores, and 正規化 `points[1]` (元の表にはその列を残す) keeps the FK columns. `pairs[0].rows[1]` (PK value — the combined value for a multi-column key — cannot repeat / FK may appear in any number of rows) is consistent with 店舗コード being both (001 appears twice, the pair (001, 1) once). The remaining PK vs FK contrast `pairs[0].rows[0]` (役割: 自分の表の行を一意に識別する / ほかの表の主キーを参照して表を結び付ける) is a role contrast, not an exclusion, and is a required pair row.
- Other PK / FK questions (hook applied to each): 2013h25h-q055 → the FK is the many-side 部署コード, which points to 部署 → イ (correct); 社員コード points to no table → not an FK (ウ / エ out by `one` + `points[0]`; obs. 4). 2011h23a-q057 → many side holds the one side's PK → ウ. 2010h22a-q079 / 2026r08-q072 → the signpost must lead to an existing row → referenced table first → イ / イ (`points[1]`). 2017h29a-q088 / 2018h30a-q085 → several signposts to several tables → ウ / エ (`points[2]`). 2018h30a-q073 → hook says nothing on column count; `one` (列 (または列の組合せ)) → エ (correct), not イ (FK cannot repeat — contradicted by `pairs[0].rows[1]`). 2016h28a-q095 → ウ (a PK field cannot be referenced as an FK by another table) is contradicted by `one` (ほかの表の主キーの値を参照する列); hook neutral → エ (correct). 2014h26h-q064 / 2023r05-q078 / 2009h21a-q084 / 2019r01a-q066 / 2022r04-q065 / 2010h22h-q083 / 2018h30h-q086 / 2011h23tokubetsu-q072 (PK / index items) → hook neutral, answered by 主キー `one / points` and インデックス as before. 2014h26h-q060 / 2024r06-q081 / 2016h28h-q094 (normalisation with a kept key column) → the column left in the original table is a signpost to the new table → ウ / エ / ウ. No question is answered differently except q059 in the right direction.
- Type (8): 道しるべ / 路标 / signpost names no role another headword defines (u02 headwords: E-R図・主キー・外部キー・インデックス・正規化). Sentence count 2 → 2 (jp / zh), 1 → 1 (en). **M1 resolved.**

### 3.3 u03 p01–p06 — cleansing scope and check-digit key point

- p01–p03 after: 「**データクレンジング**はデータの値やレコードに含まれる誤りや不統一を正す作業である。」 / zh 「…纠正的是数据的值和记录中的错误和不统一。」 / en "…corrects errors and inconsistencies in the values and records of the data." (= L1 text verbatim). Now the same scope as `detail` (重複 = the same member registered twice), the fig (重複 row), `key_points[0]` and `pairs[0].rows[1].a_*` (値やレコード / 值和记录 / "values and records") — field mismatch closed in 3 languages. The contrast with データモデリング (structure into entities and relationships, 2nd sentence unchanged) still stands: records are data instances, not the structure, so 2009h21a-q014 (organising the structure with E-R diagrams) still points to エ データモデリング, not イ データクレンジング; per-choice LCS unchanged for all four. 85 chars ≤100, 2 sentences.
- p04–p06 after: jp 「**チェックディジット**を付けておくと、入力されたコードを計算し直し、結果が合わなければ打ち間違いと分かる。」 / zh 「加上**校验位**后，把输入的编码重新计算一遍，结果对不上就说明输错了。」 / en "With a **check digit** attached, recalculating an entered code shows a typing mistake whenever the result does not match." (= L2 text verbatim). The claim is now one-directional (mismatch ⇒ error) like the exam point `terms[2].points[0]`; "simply … reveals a typing mistake" / 只要…就能发现 (all mistakes found) is gone. Applied to 2010h22a-q088: recompute the digit sum and compare → ア / イ / ウ mismatch, エ matches → エ (correct); the key point no longer suggests that a digit-sum check finds transpositions. summary.key_points_*[3] follows.
- p07: see §2.

## 4. Observations

No F-fix from this re-review (all 23 patches are the auditors' prescribed texts, applied exactly, and correct in context).

Records only, no fix:

1. LOW, u01 p05 (en): "Counted in entries" keeps the word "counted", which the en sidecar of 2018h30a-q100 wrong ア also uses ("counted from the first row"; LCS 8, unchanged word). The new row says the number of entries, not a position; jp 件数で / zh 条数 make the same point; the correct イ is stated directly by フィールド `points[1]`.
2. LOW, u02 p03 (en): the new subject frame "a foreign key is " (17) equals the start of the en sidecar of 2018h30a-q073 wrong イ ("…on which a foreign key is defined"), and " foreign key" appears in every choice of q073 / q088 / q055 alike. Generic subject phrase; the predicate (signpost to another table) says nothing about duplicates or column count.
3. LOW, u02 p07 (jp): the 19-char row shares データの構造を (7, unchanged) with the stem of 2009h21a-q014; wDice falls 0.65 → 0.47 (the before value was high only because the field is short). q014's description is the data-modeling task that the E-R diagram serves, and its correct answer is データモデリング, so the overlap points to no wrong choice; jp 12-char windows 0 / 0.
4. LOW, u02 p01–p03 (residual of M1): no field of u02 says explicitly that an FK column may also be (part of) the PK. Not needed after the patch (q059 is solved by the hook + 主キー `points[1]` + 正規化 `points[1]`, §3.2); the old negation had also helped exclude 2013h25h-q055 ウ / エ (社員コード as FK), which `one` + `points[0]` still exclude. No change.
5. LOW, u02 p06 (en): " a business partner" (19) is the sidecar rendering of 取引先 in 2009h21a-q098 (a PK question about a contact-person table) — the word's translation, used in an analogy, not that question's frame.
6. LOW, u03 p04 (jp D-198 residual): unmasked 12-char windows 2 → 2 vs 2010h22a-q088 stem come from the unchanged opening 「チェックディジットを付け」 (headword + verb); masked 0 / 0; Rule A u03 already recorded this as a headword-only match.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 2 in scope (u01 M1, u02 M1) — **both resolved**; **0 introduced**
- LOW introduced: 建議修 0; 記録のみ 6 (obs. 1–6)
- Application 23/23 exact (replay), 23/23 = the Rule A prescribed text, derived fields follow (162 checked + summary.memory_hooks suffix 39, 0 mismatch), 0 unexplained base → unit diffs, 0 `before` remnants
- D-198: masked 12-char windows 0 / 0 before and after in all 6 jp patches; u01 p02 removes the judgment-item word 洗い出し (LCS vs 2014h26h-q083 stem 7 → 5); zh after-spans ≤5 chars, en after-spans ≤19 chars, all unchanged words, term translations or generic phrases, none from a wrong choice's frame
- validate 3/3 = 0 issues (u02 1 pre-existing warn on an unpatched field), parity 3/3 = 0 diff (25 / 27 / 20 locations), vitest textbook 162/162

**PASS** — all 23 active patches of technology-21-55 u01–u03 are applied exactly (replay reproduces every patched field, derived fields follow, no other base-present path changed) and each is the auditor's prescribed text. u01 M1: the en データ分析 point now limits the subject to data analysis carried out in database design, matching jp / zh and 2025r07-q095 ウ. u02 M1: the foreign-key hook keeps only the positive "signpost to another table"; applied to 2023r05-q059 it keeps both 店舗コード and 会員種別コード and no longer argues against 店舗コード being part of the primary key → エ, and every other primary / foreign-key question of the topic is answered as before or better. The LOW fixes (列挙, count of entries, partner / 往来单位, E-R図 from the analysis results, 锁定唯一的一行, values and records, one-directional check digit, 接下来的 2 位) close their field / language mismatches without new issues. No new HIGH / MEDIUM.
