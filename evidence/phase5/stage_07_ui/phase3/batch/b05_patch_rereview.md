# b05 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-10-29 (Session 138)
- Scope: B3 wording patches replayed at merge for technology-23-62-u06 (p01–p10, all `active`) and u07 (active p01–p06, p08–p18;
  p07 `retired` = registration error, replaced by p18) (`patches/technology-23-62-u0{6,7}.json`), checked against the Rule A findings
  (`technology-23-62-u06.ruleA.md` §3 L1–L4; `technology-23-62-u07.ruleA.md` §3 M1 + L1–L4) and the merged units
  `data/ip/textbook/units/technology-23-62-u0{6,7}.json` (sha256 u06 `2a98337430f0204b…`, u07 `ef40ae03162609de…`).
- Severities: D-195 / D-198 / D-202 / D-203 (session-137) and D-204 (session-138 §2).
- No past-question text is quoted below (qid + paraphrase only; LCS strings shown are term names).

## 0. Method

Same as `b04_patch_rereview.md` §0:

1. Application check (script): every string field of the unit is walked; each patch's `after` (raw and notation-stripped) must appear, and
   `before` must not survive anywhere outside a field that already contains `after`. Retired p07: the defect it would have caused
   (「27002 , and」) grepped across the unit.
2. Derived-field check from the same walk (`explanation_*`, `overview.intro_*`; `definition_*` / `memory_hook_*` / `summary.*` carry no patched sentence).
3. D-198: normalized LCS + 12-char window with ≤2 substitutions between each new/changed jp text (patch fragment and the whole patched field)
   and stem + choices of every qid cited in the unit (points / quiz / challenge) in `data/ip/quiz/questions.json`.
4. D-195 展開 2〜3 文 / D-200 (no `points[]` changed by any patch).
5. Manual reading of each patched field in context (one / detail / points / pairs / fig / analogy / goals / intro), for rule 7, rule 9, D-204, parity, §9.
6. External fact check (u07 M1): METI 「情報セキュリティ管理基準」 R7 and H28 PDFs (meti.go.jp returns 403 to scripts; the same METI URLs were
   retrieved via Web Archive `id_` snapshots).
7. `scripts/textbook-v2-validate.mjs --unit <id>` / `scripts/textbook-v2-parity.mjs --unit <id>`; regression `npx vitest run src/lib/textbook`.

## 1. Script results (fresh, 2026-10-29)

```
✓ technology-23-62-u06 unit: 0 issues (data/ip/textbook/units/technology-23-62-u06.json)   exit 0
✓ technology-23-62-u06 parity: 36 locations, 0 diff                                         exit 0
✓ technology-23-62-u07 unit: 0 issues (data/ip/textbook/units/technology-23-62-u07.json)   exit 0
✓ technology-23-62-u07 parity: 31 locations, 0 diff                                         exit 0
vitest src/lib/textbook: Tests 162 passed (162)
```

Application check: 27/27 active `after` present, 0 `before` remnants (p09–p11 `before` = the bare term name, which legitimately remains
in `term` / `one_*` / `goals` etc.; the root label itself carries the new text). Retired p07: 「27002 ,」 0 hits; its `after` string occurs
only as a substring of p18's `after` (「JIS Q 27002, and its core is …」), i.e. p18 supersedes it as intended.

| Patch | `after` found at |
|---|---|
| u06 p01–p03 | `terms[2].analogy_jp/zh/en` |
| u06 p04–p06 | `pairs[0].rows[1].b_jp/zh/en` |
| u06 p07 | `terms[3].detail_en`, `terms[3].explanation_en` |
| u06 p08–p10 | `terms[6].detail_jp/zh/en`, `terms[6].explanation_jp/zh/en` |
| u07 p01–p03 | `goals_jp/zh/en[1]`, stripped in `overview.intro_jp/zh/en` |
| u07 p04 | `terms[0].detail_jp`, stripped in `explanation_jp` |
| u07 p05 / p06 | `terms[0].detail_zh`, `explanation_zh` |
| u07 p08 / p18 | `terms[0].detail_en`, stripped in `explanation_en` |
| u07 p09–p11 | `terms[0].fig.data.root.label.jp/zh/en` |
| u07 p12 | `terms[2].detail_jp`, `explanation_jp` (same phrase already in `terms[2].points[0].text_jp`, `key_points_jp[2]`, `summary.key_points_jp[2]`) |
| u07 p13–p15 | `terms[5].analogy_jp/zh/en` |
| u07 p16 | `pairs[1].rows[1].a_jp` |
| u07 p17 | `terms[1].fig.data.rows[2].cells[1].en` |

D-198:

| Text | qids | max LCS | 12-char ≤2 near-match | Judgement |
|---|---|---|---|---|
| u06 p01 `terms[2].analogy_jp` | 2018h30h-q082 | 3 (function word) | 0 | no copying |
| u06 p04 `pairs[0].rows[1].b_jp` | all 7 unit qids | 6 (ソフトウェア) | 0 | no copying |
| u06 p08 `terms[6].detail_jp` | all 7 unit qids | 5 (Japan / JCRAT) | 0 | no copying |
| u07 p01 `goals_jp[1]` / p09 root label | all 10 unit qids | 8 (情報セキュリティ) | 0 | no copying |
| u07 p04 `terms[0].detail_jp` (whole field) | 2015h27h-q075 / 2020r02o-q084 / 2026r08-q070 / 2025r07-q059 / 2016h28h-q091 | 11 (ISMS適合性評価制度, term name) | 2 (term name + particle, unchanged 3rd sentence) | no copying |
| u07 p12 `terms[2].detail_jp` (whole field) | 2021r03-q079 | 14 (SECURITY ACTION, term name; alnum masked under D-198) | 7, all windows inside the term name + 1–2 adjacent chars | **L1 resolved**: the 1-char-substitution near-match of the declaration phrase is gone |
| u07 p13 `terms[5].analogy_jp` | all 10 unit qids | 3 | 0 | no copying |
| u07 p16 `pairs[1].rows[1].a_jp` | all 10 unit qids | 4 (経営者が) | 0 | no copying |

zh/en-only patches follow jp text checked above or unchanged; questions are jp-only.

D-195 / D-200: u07 `terms[0].detail_jp` = 3 sentences (the 2025 note is a parenthetical inside sentence 1, not a new sentence); u06 `terms[6].detail_jp`
= 2 sentences. No `points[]` touched. validate 0 issues (incl. D-197 / D-200 checks).

## 2. Per-patch verdict

| Unit | ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u06 | p01 | `terms[2].analogy_jp` | L1 (建物 = Web サイトと読め、利用者へ告知 = サイトの弱点も公表の像) | Yes (§3.2) | No | OK |
| u06 | p02 | `…analogy_zh` | L1 | Yes: 市售家电 / 受理窗口 / 厂家安排好修理 = jp | No | OK |
| u06 | p03 | `…analogy_en` | L1 | Yes: household appliance / contact point / maker = jp | No | OK |
| u06 | p04 | `pairs[0].rows[1].b_jp` | L2 (公表されるのが弱点であることの省略) | Yes: 「ソフトウェア製品の弱点は JVN で公表する」 = detail 2 文目 | No | OK |
| u06 | p05 | `…b_zh` | L2 | Yes | No | OK |
| u06 | p06 | `…b_en` | L2 | Yes: "weaknesses in software products are published on JVN" — product itself no longer the subject | No | OK |
| u06 | p07 | `terms[3].detail_en` (+ `explanation_en`) | L3 (確認不要の言い切り) | Yes: "spend less effort" = jp 手間を減らせる / zh 减少…工作 | No | OK |
| u06 | p08 | `terms[6].detail_jp` (+ `explanation_jp`) | L4 (正式名が本文に無く確かめられない) | Yes: official name given; 「(against targeted attack)」 points at the phrase | No (name matches IPA's J-CRAT official name) | OK |
| u06 | p09 | `…detail_zh` | L4 | Yes = jp | No | OK |
| u06 | p10 | `…detail_en` | L4 + loc "supports against" | Yes: "which kind of attack it helps organizations deal with" | No | OK |
| u07 | p01 | `goals_jp[1]` (+ intro) | M1 | Yes (§3.1) | No | OK |
| u07 | p02 | `goals_zh[1]` (+ intro) | M1 | Yes: 作为…核心的两项基准 | No | OK |
| u07 | p03 | `goals_en[1]` (+ intro) | M1 | Yes: "two core standards within" | No | OK |
| u07 | p04 | `terms[0].detail_jp` (+ expl) | M1 | Yes (§3.1) | No | OK |
| u07 | p05 / p06 | `terms[0].detail_zh` (+ expl) | M1 | Yes: 核心是两部分 + 2025 年修订版…治理基准（[[jp:ガバナンス基準]]），共三部分 | No (LOW-cosmetic §4 obs. 1) | OK |
| u07 | p07 | — | (retired) | n/a — not present; defect 「27002 ,」 absent | — | n/a |
| u07 | p08 / p18 | `terms[0].detail_en` (+ expl) | M1 | Yes: "its core is …" + "(the 2025 revision also adds governance standards ([[jp:ガバナンス基準]]) …, making three parts in all)" | No | OK |
| u07 | p09–p11 | `terms[0].fig.data.root.label.*` | M1 | Yes: 「(中心の二つ)」/「（核心的两项）」/ "(two core parts)" — tree with 2 children no longer presents itself as the whole composition | No | OK |
| u07 | p12 | `terms[2].detail_jp` (+ expl) | L1 (D-198 1 字置換近似) | Yes: 「対策への取組みを自ら宣言する」, aligned with `points[0]` / `key_points_jp[2]`; near-match 0 outside the term name | No | OK |
| u07 | p13 | `terms[5].analogy_jp` | L2 (1 組織内規程の像) | Yes (§3.3) | No | OK |
| u07 | p14 / p15 | `…analogy_zh/en` | L2 | Yes: 各家银行共同约定 / "agreed among banks", 无论哪家银行 / "Every bank" | No | OK |
| u07 | p16 | `pairs[1].rows[1].a_jp` | L3 (§9 grep 「押さえ」) | Yes: 「認識し」 = `terms[1].detail_jp` 「経営者が認識すべき 3 原則」; zh 把握 / en grasp unchanged and equivalent | No | OK |
| u07 | p17 | `terms[1].fig.data.rows[2].cells[1].en` | L4 (平時に限る読み) | Yes: "starting in normal times" = jp 平時から / zh 平时就 | No (LOW-cosmetic §4 obs. 2) | OK |

## 3. Focused checks

### 3.1 u07 M1 — composition of 情報セキュリティ管理基準

- Primary source (METI PDFs, Web Archive copies of the meti.go.jp URLs):
  `IS_Management_Standard_R7.pdf` 「情報セキュリティ管理基準（令和７年改正版）」 Ⅱ. 構成: 「本管理基準は、ガバナンス基準、マネジメント基準及び管理策基準から
  構成される。」; 2.1: ガバナンス基準 = 「情報セキュリティガバナンスを確立するための目的及びプロセス」 (ISO/IEC 27014:2020 参考).
  `IS_Management_Standard_H28.pdf` (平成２８年改正版): 「本管理基準は、マネジメント基準と管理策基準から構成される。」
  → 令和 7 年 = 2025 revision adds ガバナンス基準; "2025 年の改正版では … も加わり、三つから成る" is accurate, and the description
  「情報セキュリティガバナンスを確立するための」 matches R7 2.1.
- Unit-wide grep for 二つ / 两 / two / consist / から成 / 構成 in u07: the only count claims about 管理基準 are goals[1] (「中心となる二つ」),
  detail sentence 1 (中心 = 2 + 2025 で 3) and the root label (「中心の二つ」) — all three languages consistent. `hook_en` "the two differ by role"
  refers to 監査基準 vs 管理基準 (unrelated). `one_*`, `points[]`, `key_points_*[0]` (「PDCA の進め方と実施する管理策を示す」), overview_rows,
  pairs do not claim a closed two-part composition. No field states "only two standards".
- `[[jp:ガバナンス基準]]` (zh p06, en p08): origin present in `terms[0].detail_jp` as **ガバナンス基準** (same field, same sentence).
  zh 治理基准 is consistent with the unit's 治理 rendering; en "governance standards" parallels "management-system standards" / "control standards".
- Naturalness: jp 「中心は、…と、…である (2025 年の改正版では…三つから成る)。」 reads naturally; en sentence is long but grammatical
  (main clause + "which …" relatives + closing parenthetical); zh has two adjacent full-width parentheses (§4 obs. 1). Length: 3 sentences (D-195 2〜3).
- Teaching effect: a learner now learns マネジメント基準 / 管理策基準 as the core and that the current version has 3 parts; no cited question asks the
  composition, so the answer path of the 4 exam points + challenge 2016h28h-q091 is unchanged.

### 3.2 u06 L1 — appliance analogy vs 考点 / detail (D-204)

- Mapping: appliance = software product, 窓口 = IPA (受付), maker = developer, user notice after the fix is arranged = JVN publication after
  coordination. This is exactly the product route of `detail_*` sentences 1–2.
- It does not depict a website, so it no longer suggests that website weaknesses are announced to users/public; `detail` sentence 3 (Web サイト →
  IPA notifies the operator) and `pairs[0].rows[1].b_*` (product weaknesses → JVN) are not contradicted. The analogy covers one route only, which
  an analogy may do; nothing in it is denied by `one` / `detail` / `points[0]` (JVN publishes weaknesses + countermeasures with JVN# IDs). D-204: no.
- 「窓口」 is not a named actor that conflicts with JPCERT/CC's go-between role (the reporter-facing contact is IPA, consistent with `pairs[0].rows[2]`).

### 3.3 u07 L2 — PCI DSS analogy as an industry-wide standard

- New image: vault rules agreed among banks, each bank follows the same rules. Now an inter-organization (industry) agreement rather than one bank's
  internal branch rules → aligned with `one` (業界のセキュリティ基準) and `detail` (法律ではなく業界の基準). Nothing the detail denies is carried
  (the analogy does not suggest a law or a single company's rule). Residual imprecision: in the image the rule-makers and followers are the same
  banks, whereas PCI DSS is set by the card brands' body and imposed on merchants by contract — the analogy does not claim otherwise; LOW-cosmetic at
  most, not a D-204 case (§4 obs. 3).

### 3.4 §9 / framing on all `after` strings

No 「と覚える」/ 定型締め句 / 問題文・試験・出題 / "always" / "never" / "exam" introduced; 「押さえ」 removed (p16).

## 4. Observations (not blockers)

1. LOW-cosmetic, u07 p06 `terms[0].detail_zh`: 「…**管理措施基准**（[[jp:管理策基準]]）（2025 年的修订版…，共三部分）。」 — two full-width parentheticals
   back to back. Optional: 「…（[[jp:管理策基準]]）。2025 年的修订版还加入了…**治理基准**（[[jp:ガバナンス基準]]），共三部分。」 (would make zh 4 sentences vs jp 3;
   parity gate unaffected, but keep as is unless jp is restructured too).
2. LOW-cosmetic, u07 p17: "Share information with stakeholders starting in normal times" is slightly stiff; optional
   "Share information with stakeholders from normal times on".
3. LOW, u07 p13–p15: analogy makers = followers (banks) vs PCI DSS (card brands' body sets, merchants comply by contract). Not a contradiction; optional.
4. u06 p08–p10: the English official name is inserted into jp/zh body text; appropriate here because the point is the wording of that name.

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0 (u07 M1 resolved, fact verified against METI R7 / H28 originals)
- LOW introduced: cosmetic only (§4 obs. 1–3)
- validate 2/2 = 0 issues, parity 2/2 = 0 diff (36 / 31 locations), vitest textbook 162/162

**PASS** — all 27 active patches applied with derived fields following, retired p07 absent; each resolves its named finding faithfully across ja/zh/en; no new HIGH/MEDIUM.
