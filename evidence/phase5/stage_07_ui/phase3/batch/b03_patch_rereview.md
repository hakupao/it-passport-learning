# b03 B3 patch re-review (Rule A, scope-limited)

- Reviewer: verifier (Opus 5.5, independent of the patch writer; Rule D)
- Date: 2026-10-29 (Session 138)
- Scope: 16 B3 wording patches replayed at merge for technology-23-63-u11 (p01–p10) and technology-23-63-u12 (p01–p06)
  (`patches/technology-23-63-u{11,12}.json`, all `status: active`), checked against the Rule A findings
  (`technology-23-63-u11.ruleA.md` §3 M1 / L1 / L2 / L6; `technology-23-63-u12.ruleA.md` §3 L1 / L2) and the merged units
  `data/ip/textbook/units/technology-23-63-u{11,12}.json` (sha256 u11 `18e20fc1…`, u12 `53857dad…`).
- Severities: D-195 / D-198 / D-199 / D-202 / D-203 (session-137 recalibration: rule 8 / §6 / §9 restatement = low; rule 7 = medium [fact error = high]; rule 9 = high; analogy/hook vs exam point conflict = rule 7 medium, S137 u07 M1 precedent).
- No past-question text is quoted below (qid + paraphrase only).

## 0. Method

Same as `b02_patch_rereview.md` §0:

1. Application check (script): every string field of the unit is walked. For each patch, `after` (raw and notation-stripped: `**` and `[[jp:…]]` removed) must appear, and `before` must not survive anywhere outside a field that already contains `after`.
2. Derived-field check: the same walk lists every location of `after`, so derived compat fields (`memory_hook_*`, `summary.memory_hooks_*`, `explanation_*`, `definition_*`) are confirmed to follow.
3. D-198: longest common substring (normalized, punctuation/whitespace/notation removed) between each new/changed exam-point or analogy sentence and the full JSON (stem + choices) of every cited qid in `data/ip/quiz/questions.json`.
4. D-200: char count (whitespace removed) and sentence count for changed `points[].text_jp`.
5. Manual reading of each patched field in context (one / detail / points / pairs / fig captions / other analogies and hooks of the same unit) for rule 7, rule 9, trilingual parity, §9 phrases, naturalness.
6. `scripts/textbook-v2-validate.mjs --unit <id>` and `scripts/textbook-v2-parity.mjs --unit <id>` for both units.

## 1. Script results (fresh, 2026-10-29)

```
✓ technology-23-63-u11 unit: 0 issues (data/ip/textbook/units/technology-23-63-u11.json)   exit 0
✓ technology-23-63-u11 parity: 36 locations, 0 diff                                         exit 0
✓ technology-23-63-u12 unit: 0 issues (data/ip/textbook/units/technology-23-63-u12.json)   exit 0
✓ technology-23-63-u12 parity: 22 locations, 0 diff                                         exit 0
```

Application check: 16/16 `after` present, 0/16 `before` remnants. Derived locations found:

| Patch | `after` found at |
|---|---|
| u11 p01–p03 | `terms[6].analogy_*` (no derived analogy field exists) |
| u11 p04–p06 | `terms[1].detail_*`, `terms[1].explanation_*` |
| u11 p07 | `terms[1].one_en`, `terms[1].definition_en` |
| u11 p08 | `terms[5].one_en`, `terms[5].definition_en` |
| u11 p09 | `terms[3].points[0].text_zh` |
| u11 p10 | `terms[3].points[0].text_en` |
| u12 p01–p03 | `terms[1].points[1].text_*` |
| u12 p04–p06 | `terms[1].hook_*`, `terms[1].memory_hook_*`, `summary.memory_hooks_*[1]` (summary prefix 「認証局: 」/「认证中心：」/ "Certificate Authority (Japanese term): " kept) |

D-198 longest common substring with cited qids (normalized):

| Text | qid | LCS | Judgement |
|---|---|---|---|
| u11 p01 `terms[6].analogy_jp` | 2010h22a-q080 / 2018h30h-q057 / 2010h22h-q071 | できる (3) / 証明 (2) / られる (3) | no copying; the analogy uses none of the q080 scene or items |
| u12 p01 `terms[1].points[1].text_jp` | 2016h28h-q057 / 2026r08-q090 | るPKI (4) / 認証局が (4) | no copying (term names only) |

D-200: changed exam point u12 T1 p1 = 70 chars / 2 sentences → within ≤2 sentences / ≤100 chars. u11 T3 p0 changed only in zh/en (jp unchanged).

## 2. Per-patch verdict

| Unit | ID | Field | Finding | Resolves? | New issue? | Verdict |
|---|---|---|---|---|---|---|
| u11 | p01 | `terms[6].analogy_jp` | **M1** (analogy = financial-institution licence → conveys operator trustworthiness) | Yes (see §3) | No | OK |
| u11 | p02 | `terms[6].analogy_zh` | M1 | Yes; 「由可信第三方核实过店名和地址」/「看不出这家店的口碑好坏」= jp | No | OK |
| u11 | p03 | `terms[6].analogy_en` | M1 | Yes; "a trusted third party confirms the shop's name and address … but not whether the shop has a good reputation" = jp | No | OK |
| u11 | p04 | `terms[1].detail_jp` | L1 (「問題文では」= exam-framing, §9 family) | Yes: 「文書では」, matches 信頼の基点 detail「文書によって」 | No | OK |
| u11 | p05 | `terms[1].detail_zh` | L1 | Yes: 「文档里也常」 | No | OK |
| u11 | p06 | `terms[1].detail_en` | L1 | Yes: "Documents often show" | No | OK |
| u11 | p07 | `terms[1].one_en` | L2 (English word read as "the Japanese-language name") | Yes: subject is now `[[jp:公開鍵基盤]]` with the gloss in parentheses; D-202 head word kept | No | OK |
| u11 | p08 | `terms[5].one_en` | L2 | Yes: subject `[[jp:信頼の基点]]` (point of trust) | No | OK |
| u11 | p09 | `terms[3].points[0].text_zh` | L6 (「随手」adds a carelessness nuance) | Yes: 「自行制作」= jp「自作しただけ」 | No | OK |
| u11 | p10 | `terms[3].points[0].text_en` | L6 ("made alone" unnatural) | Yes: "simply made themselves"; also matches u12 T1 p2 en "a certificate the sender made themselves" | No | OK |
| u12 | p01 | `terms[1].points[1].text_jp` | L1 (2nd sentence generalised beyond PKI) | Yes: 「PKI では、」scopes the claim; no longer denies non-CA methods such as the web of trust (2026r08-q090 wrong item) | No (70 chars / 2 sentences; D-198 ok) | OK |
| u12 | p02 | `terms[1].points[1].text_zh` | L1 | Yes: 「在 PKI 中，」 | No | OK |
| u12 | p03 | `terms[1].points[1].text_en` | L1 | Yes: "Within PKI," | No (LOW-cosmetic: "PKI. Within PKI," mild repetition, §4 obs. 2) | OK |
| u12 | p04 | `terms[1].hook_jp` | L2 (「役所」→ CA read as government office) | Yes: 「ある仕事を受け持つ部署」/「本人だと認める部署」; no longer implies 官公庁, consistent with one「利害のない第三者」 | No | OK |
| u12 | p05 | `terms[1].hook_zh` | L2 | Yes: 「负责某项事务的部门」; tail「认定本人身份的部门」already neutral | No | OK |
| u12 | p06 | `terms[1].hook_en` | L2 | Yes: "a bureau or office"; tail "the bureau that confirms identity" is a neutral literal gloss of 局 (no "government") | No | OK |

## 3. u11 M1 focused check

- New image: 店の入口に、信頼できる第三者が確かめた店名と所在地の証明 / 客は看板どおりの本物の店だと確かめられるが、店の評判までは分からない (zh/en equivalent).
- `terms[6].points[0]` (2010h22a-q080): with SSL/TLS and a certificate confirmed as the intended operator's, one can judge that the destination is genuine and the traffic is encrypted, but the certificate does not vouch for whether the operator is a trustworthy business (= wrong item a of q080, operator soundness, is NOT knowable). The old analogy (banking licence → 「安心して手続きできる」) carried exactly that denied side. The new analogy carries identity only (third party confirmed name and address → real shop as on the sign) and explicitly closes the denied side (「評判までは分からない」). Same direction as points[0] sentence 2; it no longer supports wrong item a. **Conflict resolved.**
- No new conflict:
  - `one_*` (proves the destination is genuine) — consistent (real shop as on the sign).
  - `detail_*` (certificate holds server name, operator information, public key, CA signature) — 「店名と所在地」 maps to name / operator information; no claim beyond it.
  - "trusted third party" = CA; consistent with `terms[0](PKI).analogy` (third-party registration certifies the seal) and u12 CA `one`「利害のない第三者」.
  - The analogy is silent on encryption; it does not deny it, so it does not support q080 wrong choice that denies c. An analogy covering one facet is acceptable.
  - `terms[7](クライアント証明書).analogy` (the shop checks the customer's membership card) — with the new image, server cert = the shop shows its proof to the customer, client cert = the shop checks the customer. Direction matches `pairs[1].rows[0..1]`; the shared 店 setting makes the contrast clearer, no rule-7 conflict.
  - `fig` steps / captions (connect → send cert → verify chain → encrypted) — no contradiction.
- Guard: the analogy does not contain the term's own operation (証明書の検証 / 暗号化). The closing clause is close to a restatement of points[0] sentence 2 (§6/§9 family) → LOW at most, as the Rule A M1 proposal itself anticipated.

## 4. Observations (not blockers)

1. LOW-cosmetic, u11 p01–p03: 「評判までは分からない」overlaps points[0] sentence 2 (§6 / §9 restatement family = LOW per D-203). Intended by the M1 fix; no action needed.
2. LOW-cosmetic, u12 p03: "…an indispensable part of PKI. Within PKI, without an authority…" repeats "PKI" in adjacent sentences; jp/zh have the same structure, meaning clear. Optional polish only.
3. u12 `terms[0](CA).analogy_*` still uses the 役所 / government-office seal registration image. Out of scope (not flagged as a finding in u12 Rule A; L2 targeted the hook). With the hook neutralised, the 「認証局 = 官公庁」 reinforcement L2 described no longer stacks from two fields.
4. §9 phrase check on all `after` strings: no 「と覚える」 / 定型締め句 / 試験・問題文 / "always" / "never" / "exam" introduced (u11 p04–p06 remove one exam-framing phrase).

## 5. Overall verdict

- HIGH introduced or remaining from patched findings: 0
- MEDIUM introduced or remaining: 0 (u11 M1 resolved)
- LOW introduced: cosmetic only (§4 obs. 1–2)
- validate 2/2 = 0 issues, parity 2/2 = 0 diff

**PASS** — all 16 patches applied with derived fields following; each resolves its named finding; no new HIGH/MEDIUM.
