# b48 B3 patch re-review — strategy-02-07 u01–u04 (企業倫理と組織の行動規範 / ネット上の行動規範と有害情報への対処 / 情報環境の歪みと対策技術 / 企業統治と行政・環境関連の法令, Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5). I did not write the patches or the Rule A audits, and I share no context with them (Rule D). My scripts are my own copies under scratchpad `b48rv/` (derived from `b47rv/`; only the topic, the base parts and the unit list changed). Primary-source pulls: `b48rv/egov/` (e-Gov 法令 API v2), `b48rv/mofa/` (内閣官房 PDFs).
- Date: 2026-11-08 (Session 149 続)
- Scope: the B3 wording patches for strategy-02-07 u01–u04. **34 are `active` and 0 retired**: u01 p01–p06 / u02 p01–p08 / u03 p01–p05 / u04 p01–p15 (`patches/strategy-02-07-u0{1,2,3,4}.json`).
  I checked each patch against the Rule A prescriptions in `strategy-02-07-u0N.ruleA.md`:
  - u01 (Rule A PASS, 建議修 L1–L4): L1 → p01 (jp) / p02 (zh) hook; L3 → p03–p05 (パワハラ図 cell, 三語); L4 → p06 (zh hook). **L2 (行動計画 2025 年改定) not patched** by main-session decision (§3.5).
  - u02 (Rule A PASS, 建議修 L1 / L3 / L7): L1 → p01–p06 (points[1] + key_points[1], 三語); L3 → p07 (detail_en など); L7 → p08 (pairs[1].rows[1].a_en)
  - u03 (Rule A PASS, 建議修 L1–L3): L1 → p01–p03 (key_points[2], 三語); L2 → p04 (hook_zh); L3 → p05 (detail_zh)
  - u04 (Rule A PASS, 建議修 L1, L2, L3, L5, L6, L7, L11 (zh 句読点), L12): L1 → p01–p03; L2 → p04; L3 → p05–p07; L5 → p08; L6 → p09; L7 → p10; L11 → p11–p12; L12 → p13–p15
  Every 建議修 except u01 L2 is covered. LOWs marked 記録のみ (u01 L5–L9, u02 L2/L4/L5/L6/L8/L9, u03 L4–L7, u04 L4/L8/L9/L10/L11 rest) are not patched and not re-ruled here.
- Pre-patch bases, located by sha256 = `base_sha256` (one base per unit, shared by all its patches):
  - u01 `data/ip/textbook/.planning/v2/strategy-02-07-u01/parts/b48-u01-a2/strategy-02-07-u01.loc.r1.json` `cd2c6a96cabd8346…`
  - u02 `…/strategy-02-07-u02/parts/b48-u02-a1/strategy-02-07-u02.loc.r0.json` `fca3e17f7d7a561a…`
  - u03 `…/strategy-02-07-u03/parts/b48-u03-a1/strategy-02-07-u03.loc.r0.json` `4f0d8cb798f72857…`
  - u04 `…/strategy-02-07-u04/parts/b48-u04-a2/strategy-02-07-u04.loc.r0.json` `055c847a727f1e76…`
- Merged units (current) `data/ip/textbook/units/strategy-02-07-u0N.json` sha256: u01 `e0e4d9b9b097c290…` / u02 `175429ae42266575…` / u03 `44c997d7aafbe7b3…` / u04 `e2bcb716ec505d32…`. They differ from their bases only by the patched fields (+ derived copies) and the removed `stage` meta key (§1).
- Severities: D-195 / D-198 / D-200 / D-202 / D-203, D-204, D-205, D-208, D-209, D-210, plus the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below beyond matched fragments (qid + paraphrase only). Strings shown are unit text, patch text, law text or term names.

## 0. Method

Same as `b47_patch_rereview.md` §0. No `unit.*` patch and no multi-patch field in this batch. Topic strategy-02-07 has 32 questions, so there are 160 source strings per language.

1. **Application check** (`b48rv/check.mjs`): `after` present; `before` once in base; replay in file order = unit field; every changed base-present path explained; before / after verbatim in the Rule A file. Plus `b48rv/extra.mjs` (net `before` remnant count, subtracting occurrences inside `after`).
2. **Derived fields** (`definition_* / explanation_* / memory_hook_*`, `summary.key_points_*`) and `summary.memory_hooks_*` (index pairing and hooked-terms pairing).
3. **D-198** (`b48rv/d198b.mjs` for all 34 patched fields; `win.mjs` on u02 points[1].text_jp and key_points_jp[1]): whole-field LCS before → after and LCS of the `after` span against the 160 sources per language; jp 12-char windows (≤2 substitutions) unmasked / masked + wDice.
4. **Cited-question checks.** Re-read in `data/ip/quiz/questions.json` + translations: 2018h30h-q009 (disclosure request to board operator; both parties reachable; answer ウ = hear the poster's opinion; wrong = meeting with both / NDA / unconditional disclosure), 2011h23a-q028 / 2018h30h-q030 / 2021r03-q017 (scope of the Act), 2022r04-q013 (情報公開法: answer エ = administrative documents of administrative organs; wrong = legislative / judicial / listed-company documents).
5. **Primary sources.** e-Gov 法令 API v2 `413AC0000000137`: current (`…_20260717_508AC1000000058`, CurrentEnforced), last pre-rename (`…_20230614_505AC0000000053`), 2013 (`…_20130526_425AC0000000010`), scheduled (`…_20270301_…`, `…_20280613_…`). 内閣官房 `cas.go.jp/jp/seisaku/business_jinken/` (MOFA PDFs return 403).
6. **Manual reading** of each patched field in context (三語) and of every sibling field the patch must agree with (listed in §2 / §3).
7. **Gates** (each on all 4 units): `scripts/textbook-v2-validate.mjs --unit` and `--part <base>`, `scripts/textbook-v2-parity.mjs --unit`, `npx vitest run src/lib/textbook`, `node --test scripts/textbook-v2-patch.test.mjs`.

**Not established** (same as b14–b47): each unit file carries the whole uncommitted v1 → v2 rewrite. This review shows only that the patches are present and correct in context, and that nothing but the patches changed in base-present paths. Unit-only paths (u01 102 / u02 98 / u03 116 / u04 134) were checked only for derived copies and `before` remnants.

## 1. Script results (fresh, 2026-11-08)

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-07-u01
✓ strategy-02-07-u01 unit: 0 issues (data/ip/textbook/units/strategy-02-07-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-07-u01
✓ strategy-02-07-u01 parity: 25 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-07-u02
✓ strategy-02-07-u02 unit: 0 issues (data/ip/textbook/units/strategy-02-07-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-07-u02
✓ strategy-02-07-u02 parity: 25 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-07-u03
✓ strategy-02-07-u03 unit: 0 issues (data/ip/textbook/units/strategy-02-07-u03.json), 2 warning(s)
  warn  zh-term  terms[3](フィルタリング).points[0].text_zh  リスト → 列表 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[3](フィルタリング).fig.data.rows[0].label.zh  リスト → 列表 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-07-u03
✓ strategy-02-07-u03 parity: 32 locations, 0 diff
EXIT=0
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-02-07-u04
✓ strategy-02-07-u04 unit: 0 issues (data/ip/textbook/units/strategy-02-07-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-02-07-u04
✓ strategy-02-07-u04 parity: 35 locations, 0 diff
EXIT=0
validate --part (base): u01 loc#1 0 issues (sha256 cd2c6a96… = base_sha256) EXIT=0
                        u02 loc#0 0 issues (sha256 fca3e17f… = base_sha256) EXIT=0
                        u03 base: the same 2 zh-term warns (points[0].text_zh / fig rows[0].label.zh), 0 issues, EXIT=0
                        u04 loc#0 0 issues (sha256 055c847a… = base_sha256) EXIT=0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
node --test scripts/textbook-v2-patch.test.mjs: tests 14, pass 14, fail 0
check.mjs:
  u01 active 6 ok 6 | u02 active 8 ok 8 | u03 active 5 ok 5 | u04 active 15 ok 15 | replay mismatch 0 | before count in base = 1 for all 34
  changed base-present paths = patched fields + 'stage' (u01 6+1 / u02 8+1 / u03 5+1 / u04 15+1); unexplained besides 'stage': 0
  base-only top keys: stage / round / jp_round (part metadata)
  derived checked 57 / 54 / 66 / 72, mismatch 0 (each patched hook / detail → memory_hook_* / explanation_* true; key_points → summary.key_points true)
  bold counts unchanged in all 34; [[jp:]] counts unchanged except u01 p06 (0→1, コンプライアンス) and u04 p08 (0→1, 役員) — intended (§3.4)
  memory_hooks hooked-terms pairing: u01 4/4, u02 4/4, u03 5/5, u04 6/6 per language, bad 0
    (u02 index-pairing "bad jp/zh/en[2..3]" = known index shift: ネチケット has no hook, so summary.memory_hooks_* is one shorter; false positive, as in b19–b47)
  ruleA verbatim miss: u01 [] | u02 [] | u03 [] | u04 []
extra.mjs: net before remnant 0 for all 34; Rule A file contains every before and after
```

The 2 u03 `zh-term` warns are in fields no patch touches (フィルタリング points[0] / fig label) and are already present in the base part, so they predate the patches (Rule A u03 counted them as pre-existing).

**Application.** All 34 `before` strings occur exactly once in their base field, all 34 `after` strings are present, replay reproduces every patched field. Each before / after is the Rule A prescription (sub-span of the Rule A full text); verbatim check passes.

D-198, before → after (`d198b.mjs`, 160 sources per language; jp fields only carry the window columns):

| Patch | Lang | LCS before → after (nearest source) | Longest `after`-span overlap | jp windows unmasked / masked; wDice |
|---|---|---|---|---|
| u01 p01 | **jp** | 2 → 4 (に関する) | に関する (4) | 0 / 0 → 0 / 0; 0.04 → 0.08 |
| u01 p02 | zh | 2 → 2 (称为) | 称为 (2) | — |
| u01 p03 | **jp** | 4 → 2 (する) | する (2) | 0 / 0 → 0 / 0; 0.11 → 0.07 |
| u01 p04 | zh | 2 → 2 (关系) | 关系 (2) | — |
| u01 p05 | en | 9 → 15 ("t is necessary ") | 15 (generic) | — |
| u01 p06 | zh | 4 → 9 (ompliance) | compliance (term) | — |
| u02 p01 | **jp** | 11 → 11 (発信者情報の開示を請求, unchanged legal term) | same (11) | 14 / 14 → 14 / 14; 0.32 → 0.30 |
| u02 p02 | zh | 8 → 8 (提供商责任限制法, law name) | same (8) | — |
| u02 p03 | en | 43 → 43 (law name phrase, unchanged) | "d under the " (12) | — |
| u02 p04 | **jp** | 11 → 11 (unchanged legal term) | プロバイダ責任制限法 (10, law name) | 12 / 12 → 12 / 12; 0.34 → 0.29 |
| u02 p05 | zh | 8 → 8 (law name) | law name (8) | — |
| u02 p06 | en | 38 → 40 (law name + ", ") | law name (40) | — |
| u02 p07 | en | 38 → 38 (law name, unchanged) | " social media p" (15) | — |
| u02 p08 | en | 14 → 13 ("e information") | 13 | — |
| u03 p01 | **jp** | 6 → 6 (Webサイト) | Webサイト (6) | 0 / 0 → 0 / 0; 0.10 → 0.09 |
| u03 p02 | zh | 3 → 3 (的机制) | 3 | — |
| u03 p03 | en | 13 → 14 (" information a") | 14 | — |
| u03 p04 | zh | 2 → 2 | 2 | — |
| u03 p05 | zh | 5 → 5 (unchanged part) | 方式 (2) | — |
| u04 p01 | **jp** | 5 → 5 | リサイクル (5, term) | 0 / 0 → 0 / 0; 0.12 → 0.11 |
| u04 p02 | zh | 5 → 5 (リサイクル in [[jp:]]) | 5 | — |
| u04 p03 | en | 10 → 10 | " as the " (8) | — |
| u04 p04 | **jp** | 4 → 4 | 個人を (3) | 0 / 0 → 0 / 0; 0.14 → 0.14 |
| u04 p05 | **jp** | 4 → 5 (行政機関の) | 行政機関の (5) | 0 / 0 → 0 / 0; 0.16 → 0.22 |
| u04 p06 | zh | 4 → 4 (行政机关) | 4 | — |
| u04 p07 | en | 16 → 16 | " administrative " (16) | — |
| u04 p08 | zh | 5 → 5 (unchanged part) | 的人员 (3) | — |
| u04 p09 | en | 13 → 13 | " government " (12) | — |
| u04 p10 | en | 24 → 24 (unchanged part) | " management" (11) | — |
| u04 p11 | zh | 2 → 2 | 2 | — |
| u04 p12 | zh | 1 → 1 | 1 | — |
| u04 p13 | **jp** | 3 → 3 | 表した (3) | 0 / 0 → 0 / 0; 0.07 → 0.04 |
| u04 p14 | zh | 5 → 5 (ation) | 5 | — |
| u04 p15 | en | 11 → 11 (formation) | 9 | — |

No patch adds a copy-level overlap. The only jp fields with windows are u02 points[1].text_jp (14) and key_points_jp[1] (12), counts unchanged before → after. `win.mjs` on both: every window is the law name プロバイダ責任制限法 ± 1–2 chars (2011h23a-q028 / 2018h30h-q009 / -q030 / 2021r03-q017 stems) or the legal phrase 発信者情報の開示を請求 (2018h30h-q009 stem) — law name / statutory wording, false positive (as Rule A u02 §1-4). The new text (でも改称後の現行法でも / から現行法まで変わらない) adds no window. wDice ≤ 0.30, far from the HIGH calibration (ed 0.14 / Dice 0.52).

## 2. Per-patch verdict

| Unit / IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|
| u01 p01–p02 | `terms[1](ビジネスと人権).hook_jp/zh` | L1 | Yes: the subject is now the UN Guiding Principles (国連の「ビジネスと人権に関する指導原則」は… / 联合国《工商业与人权指导原则》以…命名), matching en "The Guiding Principles are also called…" and detail. summary.memory_hooks_jp/zh[1] (「ビジネスと人権: 国連の…」) no longer reads as if the concept is called ラギー原則. zh title 《工商业与人权指导原则》 = the form already used in detail_zh (Rule A L9 record-only on the official zh title; not new) | No | OK |
| u01 p03–p05 | `terms[2](ハラスメント).fig.data.rows[0].cells[1].jp/zh/en` | L3 | Yes: 優越的な関係を背景に / 業務上必要かつ相当な範囲 = 労働施策総合推進法 30 条の 2 wording, and agrees with points[0] (業務上必要で相当な範囲 / 业务上必要且适当 / necessary and appropriate). Broader than 上司 only, so it no longer reads as rank-only. 三語 parity ✓ | No (en "advantageous relationship", obs. 2) | OK |
| u01 p06 | `terms[0](コンプライアンス).hook_zh` | L4 | Yes: the subject is the jp katakana word, taken directly from English compliance = noun of comply; matches en "The Japanese term is simply the English word, the noun form of comply" and jp. Headword 合规 no longer reads as derived from comply. D-202: `[[jp:コンプライアンス]]` origin is in jp (term name, one_jp) ✓ | No | OK |
| u02 p01–p06 | `terms[0](情報流通プラットフォーム対処法).points[1].text_jp/zh/en`, `key_points_jp/zh/en[1]` (+ summary) | L1 (D-210) | Yes, and verified against e-Gov myself (§3.1): the opinion-hearing duty with the exception (cannot contact / other special circumstances) is in current §6① and in the pre-rename text. points[1] keeps the qualifier 連絡が取れない等の場合を除き, so 2018h30h-q009 (both reachable) still resolves to ウ; ア / イ / エ get no support. key_points now says the rule is unchanged, consistent with the version-free fig steps[1]. D-200: points[1] 1 sentence / **89 chars** ≤ 100 ✓. zh / en parity ✓ (无论…还是改名后的现行法律 / "and under the current law alike") | No | OK |
| u02 p07 | `terms[0].detail_en` | L3 | Yes: "large operators such as major social media platforms" restores jp など / zh 等; scope no longer limited to SNS. explanation_en follows | No | OK |
| u02 p08 | `pairs[1].rows[1].a_en` | L7 | Yes (§3.2): with row label "If the content is true" the cell reads as a complete statement = jp 偽情報としての問題は生じない / zh 不存在作为虚假信息的问题; parallel to b_en "Still a problem if…". Not an overgeneralisation (as false information keeps the scope) | No (style, obs. 1) | OK |
| u03 p01–p03 | `key_points_jp/zh/en[2]` (+ summary) | L1 | Yes: あらかじめ決めた条件に従って / 按照预先设定的条件 / according to conditions set in advance = one_* wording, neutral between blacklist and whitelist (both listed in the same sentence). 三語 ✓ | No | OK |
| u03 p04 | `terms[3](フィルタリング).hook_zh` | L2 | Yes: "filter 就是净水器“过滤器”（滤芯）的那个词" = jp 「浄水器の「フィルター」と同じ語」 / en "the same filter as in a water purifier"; no longer claims filter and 滤芯 are one word | No | OK |
| u03 p05 | `terms[3].detail_zh` (+ explanation_zh) | L3 | Yes: 有很多种 removed; 例如有 = jp 例えば…がある / en "include, for example" | No | OK |
| u04 p01–p03 | `terms[5](リサイクル法).points[0].text_jp/zh/en` | L1 | Yes: ふつう / 通常 / usually softens the universal denial (資源有効利用促進法 and its predecessor have been called (新)リサイクル法); the collective-name usage stays the main claim, matching one and pairs[1].rows[1]. D-200: 1 sentence / 58 chars ✓ | No | OK |
| u04 p04 | `terms[3](情報公開法).fig.steps[1].caption_jp` | L2 | Yes: 識別できる = detail_jp / key_points_jp and 法 5 条 1 号; zh 可识别 / en identifies already matched | No | OK |
| u04 p05–p07 | `terms[3].hook_jp/zh/en` (+ memory_hook_*) | L3 | Yes: 国の行政機関の側 / 国家行政机关一方 / national administrative organ — now excludes 2022r04-q013 ア (legislative) / イ (judicial) and supports エ (administrative organs); second sentence (文書を持つ行政) consistent. Detail (地方公共団体は条例) unchanged and consistent | No (en article, obs. 3) | OK |
| u04 p08 | `terms[1](公益通報者保護法).detail_zh` | L5 | Yes: 董事、监事等高级职员（[[jp:役員]]） covers 法 2 条 役員 (取締役・監査役・理事・監事 等) better than 高管; 等 keeps it open. D-202: 役員 is in detail_jp (「…退職後 1 年以内の人と役員にも広げられた」) ✓. Same rendering as strategy-01-01-u02 (董事和监事（[[jp:役員]]）). en "officers" unchanged | No | OK |
| u04 p09 | `terms[6](GX推進法).detail_en` | L6 | Yes: "provides for, among other things," = jp 例えば / zh 等内容; list no longer exhaustive | No | OK |
| u04 p10 | `terms[0](コーポレートガバナンス).detail_en` | L7 | Yes: "unchecked" = 独走 (acting without checks); reckless dropped | No | OK |
| u04 p11–p12 | `terms[6].fig.data.nodes[1].label.zh`, `overview_rows[6].extra_zh[0]` | L11 (zh 句読点) | Yes: 、 replaces ・ in zh; jp keeps ・; en unchanged. Parity 0 diff | No | OK |
| u04 p13–p15 | `terms[6].hook_jp/zh/en` (+ memory_hook_*) | L12 | Yes (§3.3): trans = across (not 交差), X stands for cross, which has the same sense — accurate. Agrees with strategy-01-01-u10 DX detail (Trans- を cross になぞらえて X) | No | OK |

## 3. Focused checks

### 3.1 u02 p01–p06: 意見聴取 unchanged in the current law (e-Gov, checked myself)

- Current revision `413AC0000000137_20260717_508AC1000000058` (`current_revision_status` = CurrentEnforced; title 特定電気通信による情報の流通によって発生する権利侵害等への対処に関する法律; abbrev includes プロバイダ責任制限法). **§6①**: 開示関係役務提供者は、前条第一項又は第二項の規定による開示の請求を受けたときは、当該開示の請求に係る侵害情報の発信者と連絡することができない場合その他特別の事情がある場合を除き、当該開示の請求に応じるかどうかについて当該発信者の意見（…理由を含む。）を聴かなければならない。
- Last pre-rename revision `…_20230614_505AC0000000053` (title 特定電気通信役務提供者の損害賠償責任の制限及び発信者情報の開示に関する法律): §6① **same text**.
- 2013 revision `…_20130526_425AC0000000010` (era of the 2018 cited question): §4② 「…発信者と連絡することができない場合その他特別の事情がある場合を除き、開示するかどうかについて当該発信者の意見を聴かなければならない。」 — same rule.
- Scheduled revisions `…_20270301_508AC1000000058` and `…_20280613_505AC0000000053` (UnEnforced): §6① same text, so the claim stays true after them.
- Reading: 「改称前のプロバイダ責任制限法でも改称後の現行法でも」 is accurate; it no longer implies the rule changed. The exception is kept as 連絡が取れない等, which matches the statute (等 = その他特別の事情). 2018h30h-q009 (both reachable, answer = hear the poster's opinion) still resolves to ウ.
- **Resolved, claim verified.**

### 3.2 u02 p08: "It is not a problem as false information"

- Context: pairs[1] (フェイクニュース vs ヘイトスピーチ), row label_en "If the content is true", a_en this cell, b_en "Still a problem if it stirs up discrimination, even with true facts in it".
- Read with the label, the cell is a complete and correct statement: true content raises no problem *as false information* (= jp 偽情報としての問題は生じない, zh 不存在作为虚假信息的问题). "as false information" keeps the jp limitation, so it does not say true content is harmless in general, and the contrast with column b is clear.
- Residual: "as" can be read as "because" out of context. In the table the label rules that out, so this is style only (obs. 1). The old text ("No problem as false information arises") was the defect; the new one is grammatical.
- **Resolved, no F-fix.**

### 3.3 u04 p13–p15: trans / cross etymology

- trans- (Latin) = across / beyond (越えて・横切って / 跨越 / across) — correct; the old 交差 / 交叉 / crossing was wrong for trans.
- X as shorthand: in English X stands for cross (e.g. Xing = crossing), and Wiktionary lists `x-` as an abbreviation of both trans- and cross-. Reading trans as cross (same sense, to go across) and writing X is the usual explanation of DX / GX. The hook says this and no more.
- Cross-unit: strategy-01-01-u10 detail (DX) says 英語圏では接頭辞の Trans- を、交差を意味する cross になぞらえて X と略す — same mechanism (trans → cross → X); GX says 「DX と同じ書き方」. No contradiction (u10 glosses cross as 交差, GX glosses trans as 越えて; both are true of the respective words).
- **Resolved, accurate.**

### 3.4 D-202 [[jp:]] origins added by patches

| Patch | Added marker | jp origin present | Where |
|---|---|---|---|
| u01 p06 | `[[jp:コンプライアンス]]` | Yes | term name, `terms[0].one_jp` (**コンプライアンス**) |
| u04 p08 | `[[jp:役員]]` | Yes | `terms[1].detail_jp` 「…退職後 1 年以内の人と役員にも広げられた」 |

Derived text strips to 日语 コンプライアンス… / …高级职员（役員） (summary.memory_hooks_zh[0] checked). validate: 0 issues.

### 3.5 u01 L2 (行動計画 2025 年改定) — not adopted; primary source now available

- MOFA PDFs (100956579.pdf / 100998970.pdf) return HTTP 403 to me as well.
- The same documents are on the **Cabinet Secretariat (内閣官房)** page of the 関係府省庁施策推進・連絡会議, which is a primary government source:
  - `https://www.cas.go.jp/jp/seisaku/business_jinken/dai14/kaisaikekka.pdf` — 令和７年１２月２４日, 局長級第１４回会合: 「外務省から「ビジネスと人権」に関する行動計画（改定版）（新計画）について説明があり、新計画は承認されました」; 参考１: 2020 年 10 月 策定 → 2024 年 5 月 改定作業着手 → 2025 年 5 月 原案 → 同年 10 月 パブコメ → 「２０２５年１２月２４日、連絡会議において、新計画が承認された。新計画は２０２６年度から実施される。」
  - `https://www.cas.go.jp/jp/seisaku/business_jinken/dai14/kaiteikeikaku.pdf` — title page 「「ビジネスと人権」に関する行動計画（改定版） 2025 年 12 月 ビジネスと人権に関する行動計画の実施に係る関係府省庁施策推進・連絡会議」.
  - Index: `https://www.cas.go.jp/jp/seisaku/business_jinken/index.html` (第14回 令和7年12月24日: 行動計画の改定版の概要 / 行動計画（改定版）).
- So "the national action plan was revised in 2025" is confirmed from a primary source; S138 §6's bar is met and Rule A L2 **can** be adopted. Note the plan applies from FY2026; "2025 年に改定" (decided / approved 2025-12-24) is accurate.
- The current text (2020 年に行動計画を定め) is not wrong, so leaving L2 out is not a defect; adopting it is optional (F-fix 1 below).

## 4. F-fix

No required F-fix. No patch introduces a HIGH, MEDIUM or LOW defect.

Optional F-fix 1 (LOW, 建議修 from Rule A u01 L2, now backed by a primary source, §3.5). `terms[1](ビジネスと人権)` in `strategy-02-07-u01` (derived `explanation_*` follow):
- `detail_jp`: 「日本政府も 2020 年に行動計画を定め、2022 年には企業向けのガイドラインを公表している。」→「日本政府も 2020 年に行動計画を定め (2025 年に改定)、2022 年には企業向けのガイドラインを公表している。」
- `detail_zh`: 「日本政府也于 2020 年制定了行动计划，并于 2022 年发布了面向企业的指南。」→「日本政府也于 2020 年制定了行动计划（2025 年修订），并于 2022 年发布了面向企业的指南。」
- `detail_en`: "The Japanese government adopted a national action plan in 2020 and published guidelines for companies in 2022." → "The Japanese government adopted a national action plan in 2020 (revised in 2025) and published guidelines for companies in 2022."

If adopted, register it as patches with the cas.go.jp URLs as source, and re-run validate / parity on u01.

## 5. Observations (record only)

1. LOW (style), u02 p08: "as" in "It is not a problem as false information" can be read as "because" out of context. The row label rules it out. If a later pass touches the row, "It raises no false-information problem" is an option. Not required.
2. LOW (style), u01 p05: en "advantageous relationship" for 優越的な関係 is the Rule A text verbatim and correct in meaning; "superior relationship" is closer to the usual English for 30 条の 2. Not required.
3. LOW (style), u04 p07: "the national administrative organ" (singular + the) reads slightly stiff; "national administrative organs" would be more natural. Meaning correct and matches the second sentence. Not required.
4. Script notes:
   - u02 index-pairing memory_hooks "bad" = ネチケット has no hook (index shift); hooked-terms pairing 4/4 ok.
   - u03 validate 2 zh-term warns predate the patches (same in base).
   - `stage` meta is removed in all 4 units (as in b19–b47).

## 6. Overall verdict

- HIGH introduced: **0**
- MEDIUM: 0 in scope; **0 introduced**
- LOW introduced: 0 that need a fix. Recorded: obs. 1–3. Obs. 4 is script notes.
- **Application:** 34/34 exact (replay). 0 unexplained diffs, 0 net `before` remnants, derived fields follow (249 checked, 0 mismatch), all 34 match the Rule A text. Every 建議修 except u01 L2 is covered. Leaving L2 out was a deliberate main-session decision; it is now backed by a primary source and offered as optional F-fix 1.
- **D-198:** no patch adds a copy-level overlap; 0 new jp windows (u02's 14 / 12 existing windows = law name / statutory phrase, unchanged).
- **D-200:** u02 points[1] 1 sentence / 89 chars; u04 terms[5].points[0] 1 sentence / 58 chars (≤ 100).
- **D-210 / primary source:** u02 p01–p06 verified against e-Gov (current §6① = pre-rename §6① = 2013 §4② = scheduled 2027 / 2028 texts).
- **D-202:** both added `[[jp:]]` markers have their origin in jp text.
- **Gates:**
  - validate --unit: 0 issues / EXIT 0 ×4 (u03: 2 pre-existing zh-term warns)
  - validate --part: 0 issues ×4 (sha256 = base_sha256)
  - parity: 0 diff ×4 (25 / 25 / 32 / 35 locations)
  - vitest textbook: 162/162
  - patch tests: 14/14

**PASS.** All 34 active patches of strategy-02-07 u01–u04 are applied exactly. Each resolves its Rule A finding, and none introduces a HIGH, MEDIUM or LOW that needs a fix. No required F-fix. One optional F-fix (u01 L2, 2025 行動計画改定, primary source cas.go.jp) is available.
