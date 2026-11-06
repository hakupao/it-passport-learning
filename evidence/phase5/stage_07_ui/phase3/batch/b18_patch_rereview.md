# b18 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer and of the per-unit Rule A auditors' context; Rule D)
- Date: 2026-11-06 (Session 146)
- Scope: B3 wording patches for management-11-29-u01 (p01–p05), u02 (p01–p04), u03 (p01–p12), u04 (p01–p04), u05 (p01–p14)
  — 39 `active`, 0 retired (`patches/management-11-29-u01.json` … `-u05.json`), checked against the Rule A findings
  (`management-11-29-u01.ruleA.md` L1–L4; `-u02` L1, L2; `-u03` L1–L4; `-u04` L1–L3; `-u05` **M1**, L1) and the merged units
  `data/ip/textbook/units/management-11-29-u0{1..5}.json` (sha256 u01 `cabeb6bca388e80b…`, u02 `6eaa31283feb5d87…`, u03 `755d82d9548ea8ec…`,
  u04 `d1a1de7ff521e7d9…`, u05 `a23fa5470ee4728d…`).
- Pre-patch bases located by sha256 = `base_sha256`: `.planning/v2/<U>/parts/b18-u01-a2/…loc.r1.json` (`fd1ae5d8…`), `b18-u02-a3/…loc.r1.json` (`2af59f57…`), `b18-u03-a3/…loc.r0.json` (`4fd7e6c2…`), `b18-u04-a3/…loc.r0.json` (`a2d3b99b…`), `b18-u05-a2/…loc.r0.json` (`6c5e6696…`) (all 5 match).
- Severities: D-195 / D-198 / D-202 / D-203, D-204, D-205, D-208, D-209, and the HIGH / MEDIUM / LOW definitions in the Rule A files.
- No past-question text is quoted below (qid + paraphrase only; strings shown are unit text, patch text or term names).

## 0. Method

Same as `b17_patch_rereview.md` §0 (= `b16_patch_rereview.md` §0), topic management-11-29:

1. Application check (script): every string field of base and merged unit is walked. Each `after` (raw and notation-stripped) must appear in its field; `before` must not survive anywhere; every string that differs between base and unit (for paths present in the base) must be explained by a patch.
2. Derived-field check from the same walk (`definition_*`, `explanation_*`, `memory_hook_*`, `summary.key_points_*`, `summary.memory_hooks_*`) — every term and key point of the 5 units, not only the patched ones.
3. D-198 (jp patches: u02 p02, u03 p01 / p04 / p07): LCS, 12-char window with ≤2 substitutions with and without masking (katakana runs ≥4 and alnum masked), semi-global edit distance normalised by unit-text length (ed), best same-length-window bigram Dice (wDice). Sources: stem (`stem_jp_clean`, fallback `stem_jp`) + all choices of every management-11-29 question (77), plus 2025r07-q037 **with the blanks filled by the correct answer** (a = SLA / b = SLM), 2009h21a-q044 as the filled ordered sequence (受付 → 評価 → 指示 → 反映), and **stem + correct choice** for every question whose correct choice is a short term name (classification-type, e.g. 2025r07-q046 + ソフトウェア導入); 421 source strings. 2024r06-q046 and 2023r05-q047 are item-list combination stems (items already in the stem). Normalisation differs from the Rule A scripts, so absolute values differ from the Rule A files; before → after is measured with one script. zh / en patches: LCS against the zh / en translation sidecars of all topic questions.
4. D-195 / D-200 via validate.
5. Manual reading of each patched field in context (whole term + overview row + pairs + key_points + goals); meaning judged against the cited questions' `correct_answer`. u05 M1: full-unit regex walk of every string (incl. derived / summary / overview.intro) for 渠道 / 途径 / 手段 / 管道 / 频道 / channel.
6. `scripts/textbook-v2-validate.mjs --unit` / `scripts/textbook-v2-parity.mjs --unit` per unit; `npx vitest run src/lib/textbook`.

Not established: as in b14–b17, the unit files carry the whole uncommitted v1 → v2 rewrite; this review shows the patches are present and correct in context and that, relative to the loc base, nothing but the patches changed in base-present paths. Paths existing only in the merged unit (derived / meta: u01 100, u02 107, u03 108, u04 112, u05 111) were checked for the derived copies (step 2) and for the patched texts. The ISO/IEC 20000-1:2018 wording for 既知の誤り (§3.2) was not checked against the primary text.

## 1. Script results (fresh, 2026-11-06)

```
✓ management-11-29-u01 unit: 0 issues, 1 warning   validate exit 0 | parity: 25 locations, 0 diff  exit 0
✓ management-11-29-u02 unit: 0 issues              validate exit 0 | parity: 25 locations, 0 diff  exit 0
✓ management-11-29-u03 unit: 0 issues              validate exit 0 | parity: 29 locations, 0 diff  exit 0
✓ management-11-29-u04 unit: 0 issues              validate exit 0 | parity: 25 locations, 0 diff  exit 0
✓ management-11-29-u05 unit: 0 issues              validate exit 0 | parity: 25 locations, 0 diff  exit 0
vitest src/lib/textbook: Test Files 13 passed (13), Tests 162 passed (162)
```

u01 warning: `zh-term terms[4](サービスカタログ).fig.data.rows[1].cells[0].zh  PC → PC（个人计算机） not in the zh text`. It is present identically in the pre-patch base (`validate --part b18-u01-a2/…loc.r1.json`: 0 issues, the same 1 warning) and lies in a field no patch touches — pre-existing, not patch-introduced (obs. 5).

Application: 39/39 `after` present in their fields. `before` remnants anywhere in the units (raw or stripped): 0. Unexplained base → unit diffs in base-present paths: 0 per unit (only the `stage` meta key removed).

Derived fields follow: u01 p04 → `terms[4].definition_zh`, p05 → `summary.key_points_zh[3]`; u02 p01 → `terms[2].explanation_en`, p02–p04 → `terms[3].explanation_*`; u03 p07–p09 → `terms[2].explanation_*`, p10 → `terms[1].memory_hook_en` + `summary.memory_hooks_en[1]`; u04 p04 → `terms[4].definition_zh`; u05 p01 → `overview.intro_zh`, p04 / p05 → `terms[1].definition_zh / _en`, p06–p09 → `terms[1].explanation_zh / _en`, p12 → `summary.key_points_zh[1]`. Full walk of all terms: `definition / explanation / memory_hook` = notation-stripped `one / detail / hook` — 0 mismatches in all 5 units; `summary.key_points_*` = stripped `key_points_*` — 0 mismatches. `points[*]`, `fig.*`, `pairs`, `overview_rows`, `overview_cols`, `goals` have no derived copy (except goals → `overview.intro_*`, which follows).

Notation counts, before → after, every patched field: bold and `[[jp:]]` unchanged in all 39 (no patch changes any count). Trilingual counts at the patched locations are equal except one pre-existing difference: `u02 terms[2](インシデント管理).detail` bold jp 3 / zh 3 / en 2 both before and after p01 (en carries ワークアラウンド as `[[jp:]]`, not bold); parity 0 diff (obs. 6).

D-198, before → after (one script; jp patches only; topic-wide + filled stems + stem+correct):

| Patch | Nearest source | LCS | ed | wDice | 12-char windows unmasked / masked | Longest overlap after patch |
|---|---|---|---|---|---|---|
| u02 p02 (L2) | 2009h21a-q031 stem / 2013h25a-q044 stem | 7 → 7 | 0.78 → 0.78 | 0.22 → 0.22 | 0 / 0 → 0 / 0 | `の連絡を受けた` (unchanged sentence) |
| u03 p01 (L1) | **2011h23a-q039 ウ (correct)** → 2009h21a-q053 ア / 2011h23tokubetsu-q040 エ | **8 → 4** | **0.57 → 0.77** | **0.47 → 0.21** | 0 / 0 → 0 / 0 | `管理する` |
| u03 p04 (L2) | 2025r07-q046 stem / stem+correct | 11 → 10 | 0.73 → 0.77 | 0.33 → 0.31 | **10 / 0 → 6 / 0** | `たソフトウェアを本番` (obs. 1) |
| u03 p07 (L3) | 2018h30a-q049 ア / 2015h27a-q034 stem | 9 → 9 | 0.83 → 0.84 | 0.24 → 0.25 | 0 / 0 → 0 / 0 | `新しいソフトウェア` (unchanged part) |

Masked windows: 0 on every patched jp text before and after. The calibration HIGH (ed 0.14 / Dice 0.52) is not approached by any patched text. u03 p01 leaves 2011h23a-q039 entirely (nearest source moves to other questions, generic `管理する`). u03 p04's 6 remaining unmasked windows are all inside one span 「(出来上がっ)たソフトウェアを本番の環(境)」 — the term's object + particles; the stem's frame (install → 手順を明確に → 実施, in that order) is not reproduced (§3.4).

zh / en after-spans: longest overlaps with the sidecars are generic phrases or term names (u03 p03 "change management " = term; u03 p06 "…ed software into the " 21 chars vs 2025r07-q046 stem en, the object phrase; u04 p01 " the agreed service " 20 chars vs 2025r07-q036 stem en; u04 p02 "e delivery results " 19 chars vs 2019r01a-q048 イ en; u05 p09 "a single point of contact " = the expansion of SPOC, vs 2018h30h-q041 ウ en; u05 others 窗口 / " of contact " ≤12). No answer-choice sentence frame.

## 2. Per-patch verdict

| Unit | IDs | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u01 | p01 | `terms[0](SMS).fig.steps[1].caption_zh` | L1 | Yes: 每天提供服务 = jp 日々提供する; = auditor's text | No | OK |
| u01 | p02 | `terms[1](サービスの要求事項).analogy_en` | L2 | Yes: US spelling (real estate agent / apartment), consistent with unit's catalog; 2nd sentence unchanged | No | OK |
| u01 | p03 | `terms[3](SLM).points[1].text_en` | L3 | Yes: "The final letters differ: M … A …" covers both words = jp 最後の文字の M は…、A は… | No | OK |
| u01 | p04, p05 | `terms[4].one_zh` (+ definition), `key_points_zh[3]` (+ summary) | L4 | Yes: 清单 replaces noun 一览 in both; `[[jp:サービスカタログ]]` 1 → 1, bold 2 → 2 | No | OK |
| u02 | p01 | `terms[2](インシデント管理).detail_en` (+ explanation) | L1 | Yes: "in exam questions" (§9 exam-oriented addition, not in jp) removed; `[[jp:回避策]]` / `[[jp:ワークアラウンド]]` kept | No (obs. 6) | OK |
| u02 | p02–p04 | `terms[3](問題管理).detail_*` (+ explanation) | L2 | **Yes** (§3.2) | No (obs. 2) | OK |
| u03 | p01–p03 | `terms[1](変更管理).points[1].text_*` | L1 | **Yes** (§3.3) | No (obs. 3) | OK |
| u03 | p04–p06 | `terms[3](サービスの移行).points[0].text_*` | L2 | **Yes** (§3.4) | No (obs. 1) | OK |
| u03 | p07–p09 | `terms[2](リリース及び展開管理).detail_*` (+ explanation) | L3 | Yes: 一度に / 一次 / "in one go" (readable as 2015h27a-q034 wrong エ: all users at once) replaced by ひとまとめにして / 打包 / "packaged together" = release as a bundle of changes; q034 correct イ untouched; no "simultaneously to all" reading in any language | No (obs. 4) | OK |
| u03 | p10 | `terms[1].hook_en` (+ memory_hook, summary) | L4 | Yes: filler "which is exactly what it is" → "the request every change starts from" = jp 入口の書類 | No | OK |
| u03 | p11 | `terms[1].fig.steps[0].caption_en` | L4 | Yes: "adding a feature or revising a setting" = jp 機能追加や設定の見直し, aligned with detail_en "revising a setting" | No | OK |
| u03 | p12 | `overview_cols_zh[1]` | L4 | Yes: 交付物 (mainland term) for 成果物 | No | OK |
| u04 | p01, p02 | `terms[3](継続的改善).points[0].text_en`, `terms[2](サービスの報告).fig.steps[0].caption_en` | L1 | Yes: "against" (evaluative; Rule A u04 L1: leans toward the q031 wrong choice 実績の評価) → "on" / "for" = jp 指標について; monitoring / measuring stays description, not evaluation; zh 针对 unchanged | No | OK |
| u04 | p03 | `terms[0](可用性管理).points[2].text_en` | L2 | Yes: "uptime" = jp 稼働時間 = 2023r05-q047 item a (server running time); "operating hours" (service hours) misreading gone | No | OK |
| u04 | p04 | `terms[4](PDCA).one_zh` (+ definition) | L3 | Yes: Japanese 中黒 → 、 | No | OK |
| u05 | p01–p12 | SPOC zh / en (goals, overview row, one, detail ×2, pairs b, key_points) | **M1** | **Yes** (§3.1) | No | OK |
| u05 | p13, p14 | `terms[2](FAQ).points[1].text_zh / _en` | L1 | Yes: 首次回答率 / "first-contact answer rate" = jp 一次回答率 (answered, not resolved); explanatory clause before the bracket unchanged and correct; `[[jp:一次回答率]]` kept; 一次回答率 has no `zh_terms.json` entry, so no conflict | No | OK |

## 3. Focused checks

### 3.1 u05 M1 — resolved; no residual 渠道 / channel reading of SPOC

- All 12 replacements equal the auditor's §3 M1 prescriptions verbatim (incl. pairs b_zh 集中为一个 grammar fix). jp unchanged (L2 records-only, as the auditor decided).
- Full-unit walk (every string incl. `definition_*`, `explanation_*`, `summary.*`, `overview.intro_*`, `memory_hook*`): 渠道 0, channel / channeling 0, 途径 / 管道 / 频道 0. The only regex hits are 手段 in `unit_summary_zh` / `_jp` (支援手段 = "support means" for FAQ / chatbot / AIOps) and `terms[4].points[0].text_zh` (用 AIOps 等手段) — neither concerns SPOC. No other unit of the topic contains 渠道 / channel.
- zh term: `terms[1].term_zh` = `SPOC（单一联系窗口）` = `data/ip/textbook/zh_terms.json` `"SPOC": "SPOC（单一联系窗口）"`; body now consistently 联系窗口 / 一个窗口 / 要联系的地方 (= place, not means). en: "points of contact" / "one point of contact" / "a single point" / "directing all user contact to a single point" / "into one point" — consistent with `term_en` (Single Point of Contact) and with `terms[0].one_en` "point of contact"; the earlier mix "one point of contact" + "contact channels" inside one `one_en` is gone.
- Against SPOC's own quiz 2014h26h-q037: wrong ウ (unify the contact means to one, whose en sidecar uses "channel") is no longer the reading of any zh / en field; correct イ remains taught by `terms[0].points[0]`. 2019h31h-q036 (`terms[1].points[0]`, SD placed in the incident-management department) untouched. `hook_zh` 联系的接点 / `hook_en` "where you get in touch" are place readings (Rule A L9 records-only for 接点).
- D-208 (5) regression check: the a1 deletion of 「受付の手段は複数用意してよい」 (wrong-choice negation) is not reintroduced in any language by the patch.

### 3.2 u02 L2 — 既知の誤り「原因や / 或 / or 回避策」: correct, consistent

- Before: 「原因と回避策が分かった問題」 (both required = ITIL v3: documented root cause **and** workaround). After: 原因や回避策 / 原因或规避措施 / "cause or workaround" — the inclusive form. ISO/IEC 20000-1:2018 (JIS Q 20000-1:2020) defines a known error as a problem with an identified root cause **or** a method of reducing or eliminating its impact; the auditor cited it from memory, and the reviewer's own recollection agrees; a secondary source (computable.nl, found by one web search) quotes the same "or" wording. Primary text not seen (§0). The patched form is the safer claim: it is true under both the ITIL v3 and the ISO 20000 definition, so it removes the version-dependent narrowing (D-205 spirit) without asserting anything false under either.
- Consistency with the unit's cited questions: no question in `questions.json` mentions 既知の誤り / 既知のエラー / known error (scan 0), so no cited answer constrains the conjunction. The problem-management points (root cause → permanent solution, 2011h23a-q047 / 2015h27h-q044 / 2026r08-q046 / 2014h26h-q040; permanent solution via change management) and incident management `points[1]` (known workaround used first, 2009h21a-q031 / 2020r02o-q047) do not depend on it and are consistent with "a problem with a known workaround is recorded" (workaround-known problems feed incident handling, which is what the next clause 次に同じ症状の連絡を受けたときの対応に役立てる says).
- Nuance: jp 「や」 is enumerative (one or both), zh 或 / en "or" disjunctive; both drop the "both required" restriction, as the auditor noted; no fix (obs. 2). D-198 metrics identical before / after. Bold 2 / 2 / 2 unchanged.

### 3.3 u03 L1 — 変更管理 `points[1]`: sentence-order tracing of 2011h23a-q039 ウ broken, qualifiers kept

- Before: 承認した変更を実施する計画を立て + 計画どおりに処理が進むよう管理・統制 = correct ウ's two halves in its order (LCS 8 / wDice 0.47). After: 「承認したら終わりではなく、認めた変更をいつ・どの順で行うかの段取りを決め、その段取りどおりに進むよう管理する。」 — the role is stated as scope (approval is not the end), q039 ウ's wording is gone (LCS 4, wDice 0.21, nearest source no longer q039). Not new tracing: the new opening 「承認したら終わりではなく」 is not any choice of q039 (ア incident, イ problem, エ asset management) and negates no wrong choice.
- Qualifiers: 承認 / 認めた変更 (approved change) kept; 計画 → 段取り (plan), 確実に処理 → 段取りどおりに進むよう管理 kept. q039 correct ウ still directly supported; 2010h22a-q040 (`points[0]`, impact assessment before implementation) unaffected. Does not add verification of implementation results (a1 M2 「見届ける」 not reintroduced). zh / en = jp (并不是批准了就结束… / "does not end at approval…").
- 「いつ・どの順で」 concretises the plan as schedule and order; a change implementation plan covers more (resources, back-out), so this is an illustration of 段取り, not a closed definition — obs. 3, no fix. 管理・統制 → 管理: 統制 dropped, meaning retained.

### 3.4 u03 L2 — ソフトウェア導入 `points[0]`: 2025r07-q046 stem order broken, qualifiers kept

- q046 (classification type; correct イ ソフトウェア導入) stem order: completed software → production environment → install → make the procedure clear → carry it out. Before: 完成したソフトウェアを → 本番の環境に → 据え付ける → 工程, then 段取り (word-for-word synonym in near-stem order). After: 「作業の段取りを決めたうえで、出来上がったソフトウェアを本番の環境に入れて動く状態にする工程である。」 — the procedure element moved to the front, 据え付ける → 入れて動く状態にする; 12-char windows 10 → 6, LCS 11 → 10, masked 0. The 6 residual windows all lie in 「(出来上がっ)たソフトウェアを本番の環(境)」, i.e. the term's object + particles; the stem's frame 「本番環境にインストールする手順を明確にし」 is not reproduced. Not new tracing; D-209 (b) applies (the correct content stated as the term's general definition), and its invalidating condition (reproducing items / order) is not met.
- Qualifiers: 完了した → 出来上がった (kept), 手順を明確にし → 段取りを決めた (kept), それを実施する → 入れて動く状態にする (kept). 2nd sentence (移行の流れでは本番へ入れる段階) unchanged. Wrong choices (統合 / 妥当性確認 / 利用者教育) not touched. zh / en = jp (先确定作业步骤，再把做好的软件放入生产环境并使其可以运行 / "deciding the steps of the work and then putting the finished software into the live environment so that it runs"). jp 75 chars / 2 sentences (D-200 ok, validate 0).
- The reduction of overlap is modest (obs. 1) but the B3 aim of the finding — break the stem-order paraphrase while keeping the limits — is met.

### 3.5 Other requested checks

- Dropped qualifiers / new restrictions: none found beyond obs. 3 (illustrative 「いつ・どの順で」). u04 p01 / p02 remove an evaluative implication rather than add one; u04 p03 narrows nothing (uptime = 稼働時間).
- D-204: no analogy / hook now carries content the patched points deny (u01 estate-agent wish list unchanged in meaning; u03 RFC hook agrees with fig step 1).
- D-205: no patch adds a version-bound count / structure claim; u02 p02–p04 removes one.
- D-200: validate 0 issues in all 5 units.

## 4. Observations

No F-fix (no 建議修) from this re-review.

Records only, no fix:

1. LOW, u03 p04: 6 unmasked 12-char windows remain vs 2025r07-q046 stem / stem+correct (10 before), all inside 「(出来上がっ)たソフトウェアを本番の環(境)」 — term object + particles; masked 0, ed 0.77, wDice 0.31; stem order broken (§3.4).
2. LOW, u02 p02–p04: jp 「や」 (enumerative) vs zh 或 / en "or" (disjunctive); both remove the "both required" limit; ISO/IEC 20000-1:2018 wording corroborated only by memory + one secondary source.
3. LOW, u03 p01: 「いつ・どの順で行うかの段取り」 illustrates the implementation plan by timing and order; not a closed definition, q039 ウ still supported.
4. LOW, u03 p07: jp 「ひとまとめにして送り出す変更のまとまり」 repeats まとめ / まとまり (auditor's prescribed text; meaning clear; zh 打包 / en "packaged together" natural).
5. LOW, pre-existing: u01 validate warning `zh-term terms[4].fig.data.rows[1].cells[0].zh` (PC → PC（个人计算机）) present identically in the base part; outside every patched field.
6. LOW, pre-existing: u02 `terms[2].detail` bold jp 3 / zh 3 / en 2 before and after p01 (en ワークアラウンド as `[[jp:]]`, not bold); p01 changed no count; parity 0 diff.

## 5. Overall verdict

- HIGH introduced: **0**
- MEDIUM introduced or remaining from patched findings: **0** (u05 M1 §3.1 resolved)
- LOW introduced: 建議修 0; 記録のみ 6 (obs. 1–6, of which obs. 5–6 pre-existing)
- D-198: no copying in patched texts (masked windows 0 on all patched jp texts topic-wide incl. the filled stems and stem+correct); the 2011h23a-q039 ウ order paraphrase and the 2025r07-q046 stem-order paraphrase are broken
- validate 5/5 = 0 issues (1 pre-existing warning in u01), parity 5/5 = 0 diff (25 / 25 / 29 / 25 / 25 locations), vitest textbook 162/162

**PASS** — all 39 active patches are applied with derived fields following, the MEDIUM finding (u05 M1, SPOC 渠道 / channel) is resolved with no residual 渠道 / channel in any field of the unit and the zh body consistent with `zh_terms.json` 单一联系窗口, the 既知の誤り wording (原因や回避策) is correct under both the ITIL v3 and the ISO/IEC 20000-1:2018 definition and is not contradicted by any question, the two u03 restructurings break the question-order paraphrases without new tracing and keep their qualifiers, no patched text copies a question, trilingual parity and bold / `[[jp:]]` counts are unchanged by the patches, and no new HIGH / MEDIUM is introduced.
