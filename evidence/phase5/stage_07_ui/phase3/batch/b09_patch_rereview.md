# b09 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-10-30 (Session 139)
- Scope: B3 wording patches replayed at merge for strategy-01-02-u11 (p01–p11), u12 (p01–p06), u13 (p01), u14 (p01–p06, p08), u15 (p01–p08)
  — 33 `active`; u14 p07 `retired` (`patches/strategy-01-02-u11.json` … `-u15.json`), checked against the Rule A findings
  (`strategy-01-02-u11.ruleA.md` L1–L7; `-u12` L1–L4; `-u13` L1; `-u14` L1–L3; `-u15` L1–L3) and the merged units
  `data/ip/textbook/units/strategy-01-02-u{11..15}.json` (sha256 u11 `d7d012b85a3989ac…`, u12 `b71bb17c6feed3f8…`, u13 `e7333c95f2419285…`,
  u14 `e6fbee8f0fdddee3…`, u15 `8e44e938b4f6bf7f…`).
- Severities: D-195 / D-198 / D-202 / D-203 (session-137), D-204 (session-138 §2), D-205 (session-138 §6).
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text or term names).

## 0. Method

Same as `b08_patch_rereview.md` §0 (= `b07` / `b06` §0):

1. Application check (script): every string field of the unit is walked; each patch's `after` (raw and notation-stripped) must appear, and
   `before` (raw and stripped) must not survive anywhere outside a field that already contains `after`.
2. Derived-field check from the same walk (`explanation_*`, `definition_*`, `memory_hook_*`, `overview.intro_*`, `summary.*`).
3. D-198: normalized LCS, 12-char window with ≤2 substitutions, both **with and without** katakana / alnum masking, between each changed jp text
   (patch fragment and the whole patched field) and stem + choices of every qid cited anywhere in the unit; the same against all 98 questions of
   topic strategy-01-02. Semi-global edit distance (per patch char) and character-bigram Dice against each stem / choice. Stems are
   `stem_jp_clean` from `data/ip/quiz/translations/<exam>.json`; 21 of the 98 have no `stem_jp_clean` and use `stem_jp` (the display layer's fallback)
   — among the qids below, 2009h21a-q004, 2019h31h-q028 and 2026r08-q010 are in that group.
4. D-195 展開 2〜3 文 / D-200 考点 JP ≤2 文・≤100 字 (validate) + manual count.
5. Manual reading of each patched field in context (one / detail / points / pairs / fig / overview / key_points / hook), rule 7, D-203 §6, D-204, D-205;
   meaning judged against the cited question and its `correct_answer`.
6. Cross-unit zh (all 15 units of the topic, authored zh fields): the zh word preceding each `[[jp:X]]` tag for the terms the patches touch, plus a
   count per unit of the patched words and their alternatives (§3.6).
7. `scripts/textbook-v2-validate.mjs --unit <id>` / `scripts/textbook-v2-parity.mjs --unit <id>`; regression `npx vitest run src/lib/textbook`.

## 1. Script results (fresh, 2026-10-30)

```
✓ strategy-01-02-u11 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u11.json)   exit 0
✓ strategy-01-02-u11 parity: 25 locations, 0 diff                                       exit 0
✓ strategy-01-02-u12 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u12.json)   exit 0
✓ strategy-01-02-u12 parity: 34 locations, 0 diff                                       exit 0
✓ strategy-01-02-u13 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u13.json)   exit 0
✓ strategy-01-02-u13 parity: 37 locations, 0 diff                                       exit 0
✓ strategy-01-02-u14 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u14.json)   exit 0
✓ strategy-01-02-u14 parity: 30 locations, 0 diff                                       exit 0
✓ strategy-01-02-u15 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u15.json)   exit 0
✓ strategy-01-02-u15 parity: 22 locations, 0 diff                                       exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

Application check: 33/33 `after` present (raw); 33/33 `after` strings occur verbatim in the Rule A 修正案 of their unit. `before` remnants: 31 patches 0; u15 p05 / p06 `发散` remains in `unit_summary_zh` only, by design: that field says
发散技法 / 收敛技法 for jp 発散技法 / 収束技法, the formal term also defined in `terms[0].detail_zh` and `pairs[1]`. Rule A L3 did not target it (§3.2).
u14 p07 retired: `after` 0 hits, `before` still in `terms[1].detail_zh` / `explanation_zh`, consistent with `zh_terms.json` 販売促進 → 销售促进 (file unchanged).

| Patch | `after` found at |
|---|---|
| u11 p01–p03 | `terms[2].hook_jp/zh/en`, `terms[2].memory_hook_jp/zh/en`, `summary.memory_hooks_jp/zh/en[2]` |
| u11 p04 | `terms[2].detail_en`, `explanation_en` |
| u11 p05 | `overview_rows[4].extra_en[1]` |
| u11 p06 / p07 | `terms[1].detail_zh`, `explanation_zh` / `terms[1].detail_en`, `explanation_en` |
| u11 p08 / p09 | `terms[4].points[0].text_zh` / `text_en` |
| u11 p10 / p11 | `terms[0].fig.data.cols[0].en` / `overview_rows[0].one_line_zh` |
| u12 p01 | `terms[2].one_jp`, `definition_jp` |
| u12 p02 | `terms[1].points[0].text_jp` |
| u12 p03–p05 | `key_points_jp/zh/en[3]`, `summary.key_points_jp/zh/en[3]` |
| u12 p06 | `terms[5].detail_zh`, `explanation_zh` |
| u13 p01 | `terms[1].points[1].text_jp` |
| u14 p01–p03 | `terms[0].fig.data.root.children[2].label.jp/zh/en` |
| u14 p04 / p05 | `terms[0].fig.data.root.children[0/1].label.zh` |
| u14 p06 | `terms[0].one_en`, `definition_en` |
| u14 p08 | `goals_zh[0]`, `overview.intro_zh` |
| u15 p01–p03 | `terms[2].points[0].text_jp/zh/en` |
| u15 p04 | `terms[0].points[0].text_jp` |
| u15 p05 / p06 / p07 | `overview_rows[0/1/2].extra_zh[0]` (the short strings also occur in fields that already used them) |
| u15 p08 | `goals_zh[2]`, `overview.intro_zh` |

D-198 (jp texts; zh/en-only patches touch no question wording, questions are jp-only). "win" = 12-char ≤2 near-match window count.

| Text | Cited qids | max LCS (unmasked / masked) | win unmasked / masked | min ed / max Dice | Topic-wide (98) LCS / win masked | Judgement |
|---|---|---|---|---|---|---|
| u11 p01 `terms[2].hook_jp` (frag / field) | 7 | 2 / 2, 3 / 3 | 0 / 0 | 0.70 / 0.06, 0.88 / 0.07 | 3 / 0 | no copying |
| u12 p01 `terms[2].one_jp` | 13 | 8 / 8 | 0 / 0 | 0.73 / 0.27 | 8 / 0 | no copying |
| u12 p02 `terms[1].points[0].text_jp` | 13 | 9 / 4 | 0 / 0 | 0.82 / 0.28 | 9 / 0 | no copying (the 9 is the term name in a choice) |
| u12 p03 `key_points_jp[3]` | 13 | 7 / 7 | 0 / 0 | 0.63 / 0.24 | 7 / 0 | no copying |
| u13 p01 `terms[1].points[1].text_jp` | 13 | 8 / 8 | 0 / 0 | 0.61 / 0.03 | 8 / 0 | no copying |
| u14 p01 fig label | 21 | 2 / 2 | 0 / 0 | 0.78 / 0.05 | 4 / 0 | no copying |
| u15 p01 `terms[2].points[0].text_jp` | 6 | 4 / 4 | 0 / 0 | 0.84 / 0.13 | 4 / 0 | no copying |
| u15 p04 `terms[0].points[0].text_jp` (frag / field) | 6 | 5 / 5, 10 / 5 | 0 / 0, 3 / 0 | 0.44 / 0.11, 0.68 / 0.40 | 10 / 0 | no copying (the 10 and the 3 windows are the term name ブレーンストーミング; Dice with katakana masked ≤ 0.14 against the three closest questions; the fragment is the 4-char rule name) |

Near-match resolved, before → after against the named question's stem:

| Patch | Question | LCS | win (unmasked) | ed | Dice |
|---|---|---|---|---|---|
| u12 p01 | 2009h21a-q004 | 11 → 8 | 4 → 0 | 0.65 → 0.75 | 0.34 → 0.27 |
| u12 p02 | 2010h22a-q009 | 8 → 4 | 4 → 0 | 0.63 → 0.82 | 0.29 → 0.17 |
| u13 p01 | 2011h23a-q100 | 11 → 8 | 4 → 0 | 0.48 → 0.61 | 0.03 → 0.03 |
| u15 p01 | 2020r02o-q053 | 6 → 2 | 0 → 0 | 0.68 → 0.86 | 0.34 → 0.08 |

D-195 / D-200: validate 0 issues on all five units. Patched 考点 JP (字数 without `**`): u12 t1.p0 1 文 / 54 字; u13 t1.p1 1 文 / 30 字; u15 t2.p0 1 文 / 46 字;
u15 t0.p0 1 文 / 40 字 (≤2 文・≤100 字). Patched `detail_*` (u11 t1 zh/en, t2 en; u12 t5 zh) keep their sentence count; the edits stay inside one sentence.

## 2. Per-patch verdict

| Unit | ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u11 | p01–p03 | `terms[2].hook_*` (+ memory_hook, summary) | L1 | Yes: 軍用機 / 军机 / "military planes" does not name a type (§3.3) | No | OK |
| u11 | p04 | `terms[2].detail_en` (+ expl) | L2 | Yes: "everyone in the population"; "members" now only means site members | No | OK |
| u11 | p05 | `overview_rows[4].extra_en[1]` | L3 | Yes: complete phrase = jp 反対の根拠の確認 = zh 核对相反的依据 | No | OK |
| u11 | p06 / p07 | `terms[1].detail_zh` / `_en` (+ expl) | L4 | Yes: 例如 / "for example" = jp 例えば | No | OK |
| u11 | p08 / p09 | `terms[4].points[0].text_zh` / `_en` | L5 | Yes: 毫无偏差 / "without bias" = jp 偏りなく (偏差 / bias are this unit's words for 偏り) | No | OK |
| u11 | p10 | `terms[0].fig.data.cols[0].en` | L6 | Yes: "Example" = jp 例 = zh 示例 | No | OK |
| u11 | p11 | `overview_rows[0].one_line_zh` | L7 | Yes: 离散程度小 = `terms[0].one_zh` = jp 小ささ | No | OK |
| u12 | p01 | `terms[2].one_jp` (+ definition) | L1 | Yes: win 4 → 0, meaning kept (§3.4) | No (LOW-cosmetic §4 obs. 3) | OK |
| u12 | p02 | `terms[1].points[0].text_jp` | L2 | Yes: win 4 → 0, meaning kept (§3.4) | No | OK |
| u12 | p03–p05 | `key_points_*[3]` (+ summary) | L3 | Yes: hedge now matches `detail_*` and `points[0]` (§3.1) | No | OK |
| u12 | p06 | `terms[5].detail_zh` (+ expl) | L4 | Yes: 共现 shown, doubled 共起 gone, = `term_zh` 共现关键词 | No | OK |
| u13 | p01 | `terms[1].points[1].text_jp` | L1 | Yes: win 4 → 0, mathematically equal (§3.4) | No | OK |
| u14 | p01–p03 | `terms[0].fig…children[2].label.*` | L1 | Yes: three groups now cover 会員全体 (§3.5) | No | OK |
| u14 | p04 / p05 | `terms[0].fig…children[0/1].label.zh` | L2 | Yes: 到店 = unit's detail / pairs | No (cross-unit note §3.6) | OK |
| u14 | p06 | `terms[0].one_en` (+ definition) | L2 | Yes: "groups" | No | OK |
| u14 | p07 | `terms[1].detail_zh` | L2 | Retired: 销售促进 is the registered `zh_terms.json` term, stays | No | Retired OK |
| u14 | p08 | `goals_zh[0]` (+ intro) | L3 | Yes: 归类分组 = term 分组; 汇总 now only in the 考点's sum sense | No | OK |
| u15 | p01–p03 | `terms[2].points[0].text_*` | L1 | Yes: structure no longer follows the stem (§3.1) | No (LOW record §4 obs. 2) | OK |
| u15 | p04 | `terms[0].points[0].text_jp` | L2 | Yes: 質より量 = fig / `key_points_jp[0]` / zh·en `[[jp:質より量]]` | No | OK |
| u15 | p05–p08 | `overview_rows[0..2].extra_zh[0]`, `goals_zh[2]` (+ intro) | L3 | Yes: 铺开 / 归拢 throughout the plain-word layer (§3.2) | No | OK |

## 3. Focused checks

### 3.1 (a) u12 3V and u15 親和図法 — no unsupported restriction, no inconsistency

- **u12 p03–p05**: 「三要素を 3V とする考え方があり」/「有一种说法把…称为 3V」/ "One view calls …" now agrees with `terms[3].detail_*` (考え方がある / 有一种说法 / "One common framing")
  and `terms[3].points[0].text_*` (考え方があり / 有一种说法 / "One view defines"), and with 2026r08-q025's own hedge (correct 3V). 2019h31h-q028 (correct ビッグデータ, three attributes, no hedge) is not
  contradicted: a hedge does not deny it. A hedge adds no restriction. The second clause (文字以外の形式にも及ぶ) is unchanged and = `detail`. `one_*` still gives the three traits. D-205: moves toward not asserting a count outright.
- **u15 p01–p03**: the new sentence says what the method handles (sorting and organizing ideas already produced by several people), not idea generation.
  - Unsupported restriction? 複数人 / 几个人 / "a group" carries the group premise of 2020r02o-q053 (correct 親和図法) and is no narrower than the old 集団で. It is not a new subject restriction. `terms[0].one_zh` uses the same 几个人, so zh is unit-consistent.
  - 「案を出す作業そのものではない」: supported by the question's structure (the stem presupposes ideas already produced; ブレーンストーミング is a distractor) and by `pairs[1]` 出発点 (テーマ vs 出そろった案や意見) and `terms[2].detail_*` (出そろった案をまとめる). 「そのもの」 keeps it from denying that insights arise (`detail`: 想定していなかったまとまりに気づく). D-205 ③ not triggered.
  - Trilingual parity: jp 出し終えた / zh 已经提出 / en "already produced"; negative clause in all three. `one_*` and `key_points_*[2]` unchanged and compatible.
  - Two wording tensions, neither a contradiction, recorded in §4 obs. 2: `fig.steps[0].caption_jp` 書き出す; 仕分け / 分门别类 next to 枠を先に決めない.

### 3.2 (b) u15 zh 铺开 / 归拢

- zh plain-word layer now all one pair: `overview_rows[0/1].extra_zh[0]` 铺开, `[2]` 归拢; `overview_rows[2].one_line_zh` 归拢; `goals_zh[2]`; `terms[0].detail_zh` 把点子铺开; `terms[2].detail_zh` 归拢;
  `pairs[1].rows[0].a_zh/b_zh` 发散（把点子铺开）/ 收敛（把点子归拢）; derived `overview.intro_zh` follows. 归纳 in u15 = 0 (the one topic hit, u04 主成分分析, is unrelated).
- Parity: jp 広げる / まとめる, en Widen / Pull together, column 阶段 / 段階 / Stage. `goals_zh[2]` = `goals_jp[2]` = `goals_en[2]`.
- Formal terms kept: **发散** / **收敛** with `[[jp:]]` in `detail_zh`, `pairs[1]`, `unit_summary_zh` 发散技法 / 收敛技法 (= jp 発散技法 / 収束技法). This is the same term / plain-word split jp has. Not an inconsistency.
- `overview_rows[2].extra_zh[1]` 把卡片聚拢排列 says 聚拢 of cards, en "gathered"; it is a different cell (how it runs), not a competing rendering of the stage.

### 3.3 (c) u11 軍用機

- Same claim in jp 軍用機 / zh 军机 / en "military planes"; `memory_hook_*` and `summary.memory_hooks_*[2]` follow. The rest of the sentence (撃墜された機 / 被击落的飞机 / "those shot down") names no type.
- Residual: `戦闘機` / `战斗机` / `fighter plane` 0 in **all** production units (grep over `data/ip/textbook/units/`); `爆撃機` / `轰炸` / "bomber" 0 in u11. The story is used only in this hook.
- Rule A L1 records that the type is unverified from a primary source; 軍用機 is true under either reading.

### 3.4 (d) u12 p01 / p02, u13 p01 near-match and meaning

- u12 p01: 「人がまだ気づいていない」 = `one_zh` 此前没有察觉 = `one_en` "no one had noticed" = `overview_rows[2].one_line_jp` 未知. 「結びつき」 = 关联 / relationships.
- u12 p02: 全社 / 過去の記録 / 経営戦略 all kept. 部門をまたいで is supported by 2010h22a-q009 (correct データウェアハウス; the stem speaks of data scattered by department) and aligns the jp with the existing zh 跨部门 / en "cross-departmental". 「材料として使える」 fits the same term's `points[2]` (材料を貯める土台).
- u13 p01: E[金額 − 費用] = E[金額] − 費用, so 「費用を差し引いた後の金額の期待値」 equals the old wording, zh 金额的期望值减去成本后的值, en "expected value minus that cost", and 2011h23a-q100's definition (recomputed from `stem_jp_clean`: maximum at the correct ウ). `[[jp:期待値]]` tag still has its word in jp. `terms[1].detail_*` unchanged.

### 3.5 (e) derived fields, and u14 fig

- Every derived field follows its source (table in §1): `memory_hook_*`, `summary.memory_hooks_*`, `explanation_*`, `definition_*`, `summary.key_points_*`, `overview.intro_*`. `points[*]`, `overview_rows`, `fig` have no derived copy; none of the old strings remains.
- u14 fig: よく来店 + 購入額多 / 来店少 + 購入額多 / 購入額少 now partitions 会員全体 in three languages; compatible with `terms[0].detail_*` and `pairs[0].rows[2]`. No 考点 depends on it.

### 3.6 (f) Cross-unit zh within strategy-01-02 (u01–u15)

| jp tag | zh rendering (units) | Result |
|---|---|---|
| データウェアハウス | 数据仓库 (u08 / u12 / u14) | one name |
| データマイニング | 数据挖掘 (u12 / u14) | one name |
| 母集団 | 总体 (u09 / u11) | one name |
| 選択 / 情報 / 統計的 / 認知バイアス | 选择偏倚 / 信息偏倚 / 统计偏倚 / 认知偏差 (u11 only) | = `zh_terms.json` |
| グルーピング / 親和図法 / ビッグデータ / 共起キーワード | 分组 (u14) / 亲和图法 (u15) / 大数据 (u12) / 共现关键词 (u12) | one unit each |
| 発散 / 収束 | 发散 / 收敛 (u15) | one unit; 铺开 / 归拢 only in u15 |

军机 u11 only. 期望值 u13 only. No patch introduces a new divergence (unlike b08 u08 L3). One pre-existing word difference outside the terms: §4 obs. 1.

## 4. Observations

1. LOW 記録のみ (pre-existing, cross-unit, not patch-introduced): zh 来店人数 in u05 `terms[5].detail_zh`, u06 `terms[3/4].fig` (9 strings), u08 `terms[0].detail_zh`, while u14 uses 到店 (`detail_zh` and `pairs[0].rows[2].a_zh` before these patches; now also fig). Not a registered term; meaning is clear. u14 p04 / p05 fix within-unit only. Severity differs from b08 §3.3 (LOW 建議修) for two reasons: there the two strings were chart names a zh reader could take for two different charts, and the patch created the split; here 来店 / 到店 are interchangeable everyday words for one action, no concept is at stake, and u14 prose already used 到店 before the patch. No fix required for b09; a later corpus pass could unify.
2. LOW 記録のみ, u15 `terms[2]`: (i) `fig.steps[0].caption_*` 案や意見をカードへ書き出す vs the patched 案を出す作業そのものではない: the step writes out existing ideas, `pairs[1]` 出発点 disambiguates. (ii) 仕分け / 分门别类 could suggest preset bins beside `detail_*` 枠を先に決めない; `one_*` and the fig steps state the actual procedure. A rewording back to グループ分け would return toward the stem Rule A L1 moved away from. No fix.
3. LOW-cosmetic, u12 `terms[2].one_jp` 結びつき vs `overview_rows[2].one_line_jp` 関連 and `detail_jp` 関連: synonyms, no term status. No fix.
4. u14 L2 is resolved except its 销售促进 part, which is retired on purpose (p07): the registered term outranks the loc-review preference. Rule A's patch text conflicted with `zh_terms.json`; the retirement is correct.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0
- LOW introduced: 0 建議修; LOW 記録のみ / cosmetic 3 (§4 obs. 1–3; obs. 1 pre-existing)
- D-205: no patch adds a version-bound count / structure claim. u12 L3 reduces one; u15 p01's negative clause is supported by the cited question, not a new limit (§3.1)
- D-198: no copying (masked windows 0 for all patched jp texts, cited and topic-wide; unmasked windows only the term name in u15 t0.p0); the three named near-matches are at win 0
- validate 5/5 = 0 issues, parity 5/5 = 0 diff (25 / 34 / 37 / 30 / 22 locations), vitest textbook 162/162

**PASS** — all 33 active patches applied with derived fields following; each resolves its named finding faithfully across ja/zh/en; u14 p07's retirement is correct; no new HIGH/MEDIUM. No fix required.
