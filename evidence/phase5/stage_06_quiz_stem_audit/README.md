# Pre-Phase-2 STEM-quality audit — evidence

> Session 97 (2026-06-20), after the Phase 2 pilot found stem-driven explanation defects (q034/q066).
> Question: are the DISPLAYED stems faithful enough to base 2900 explanations on?
> Method: stratified N=54 + 4 controls; figure Q audited vs the figure, non-figure Q vs its
> original-OCR `stem_jp_corrupted_backup` + answer-derivability; flags adversarially verified.
> Manifest: `manifest.json`. Raw: `audit_results.json`. Workflow: `scripts/audit-stem.workflow.mjs` (`wf_64cd3e68-819`, 83 agents).

## Headline

- **Confirmed answer-affecting bad-stem rate = 2/54 = 3.7%** (Wilson 95% CI [1.0%, 12.5%]; projected to 2900 ≈ **107**, 95% upper ≈ 364).
- **CAVEAT — under-count**: the instrument **under-detects figure-table corruption** (control q066, genuinely corrupt, was judged CLEAN by both auditor and verifier). So the true figure-stem corruption rate is **higher** than 3.7%; **figure-table faithfulness cannot be certified by sampling**.
- **Answer KEYS remain clean** (separate axis; S97 figkey + Phase 2 both 0 bad keys). The problem is stem fidelity, not keys.
- **Verdict: stems are NOT clean enough to scale Phase 2 on as-is.** A stem reconstruction-from-source pass is needed first (esp. the 467 figure questions).

## Confirmed bad stems (rate sample, verified by independent critics reading source)

| id | stratum | corruption | answer impact |
|---|---|---|---|
| **2026r08-q050** | **figure_clean** | figure: D←B, E←C (二本鎖); displayed stem: D←A, E←(none). Critical path collapses. | **正解 ウ→ア に反転** (15日→9日). **Phase 1 clean-stem 自体が figure と不一致** = clean 化が誤りを残した。 |
| **2014h26a-q090** | nonfig_stem_marked | s7x repair replaced the clause "旧PC通信『と』現PC通信は『同時にはできない』" with "現PCと『同じ条件で行える』" — dropped the second subject + predicate. | 「同時不可」条件消失 → 設問の核心が変わる。garble 数字 (49Mbps→40) の修復自体は正だが過程で意味脱落 (q034 級)。 |

## Controls (instrument scorecard)

| control | expect | got | verdict |
|---|---|---|---|
| q034 (nonfig: 「あと」dropped by repair) | BAD | **CONFIRMED_BAD_STEM** ✓ | sensitivity OK for non-figure word-drop (backup-comparison works) |
| q001 (nonfig clean) | CLEAN | CLEAN_VERIFIED ✓ | specificity OK |
| q026 (figure, Phase 1 clean-stem) | CLEAN | CLEAN_VERIFIED ✓ | specificity OK |
| **q066** (figure: table scrambled vs figure) | BAD | **COSMETIC_ONLY ✗ MISSED** | **sensitivity GAP on figure-table corruption.** Main-context 3.5× read confirms corruption: figure has 12 rows, corpus 11; `09:32:19 10002` figure 成功/corpus 失敗; employee 10001↔10011, 10008↔10001 diffs; corpus dropped `10:00:02 10011 001 失敗`. Both auditor+verifier misread (claimed "11 rows match"). Answer イ is robust → they rated it cosmetic. |

## Other findings

- **q022 / q035 (UNCERTAIN)**: NOT bad stems. The `stem_jp_corrupted_backup` for these is a *different question* (OCR captured an adjacent/wrong question); the DISPLAYED stem is correct (verifiers read the IPA source page and confirmed it supports the key). **Lesson: the backup is not always a reliable ground truth** — for these, the displayed stem (s7x-repaired) is the good one and the backup is the artifact.
- **q026(2019r01a) / q087 (COSMETIC_ONLY)**: stems faithful; q087 has *distractor* (choices, not stem) digit corruption noted for a separate choices-fix track.

## Root causes (upstream, all 3 mechanisms observed)

1. **s7x repair drops/alters meaning-bearing content** while fixing OCR garble numbers (q034 「あと」, q090 clause). Same mechanism as S96 q002 choices swap.
2. **Phase 1 clean-stem can itself be wrong vs the figure** (q050 is in figure_*clean*). Phase 1 de-garble was not figure-verified per-cell.
3. **Figure questions without a clean stem show the raw corrupted table** (q066). 213/467 figure Q have no clean stem.

## Recommendation

**A stem reconstruction-from-source remediation (Phase 1.5) before Phase 2 scale:**
- **Figure questions (467)**: regenerate each stem FROM its figure with **per-cell verification** (figure is authoritative). Do NOT rely on sampling — the q066 miss shows figure-table fidelity isn't sample-certifiable; every figure stem needs a figure-grounded rebuild + an independent figure-vs-stem check (writer≠checker).
- **Non-figure stem-marked (71)**: backup-comparison works (q034/q090 caught) → targeted writer pass reconciling repaired-stem vs backup vs answer-derivability.
- **Non-figure plain**: low risk; light sample monitoring.
- Then re-audit, then Phase 2. (Keys are clean, so no key work.)

This is bigger than "fix q050/q090/q066" because the figure-table corruption class is broad (213 no-clean + figure_clean-but-wrong like q050) and not sample-certifiable.

## 教訓 (fix-checklist 追記)
6. **figure-table の stem 忠実度は標本監査で certify 不能**: 答案 robust な表 scramble は監査 agent が「忠実」と誤判定しやすい (q066 = auditor+verifier 双方が miss、行数すら誤読)。→ figure 問は全数 figure-grounded 再構成 + 独立 figure↔stem 照合が必要。
7. **backup は万能の真相源ではない**: 一部問で backup OCR が別問を捕捉 (q022/q035)。非figure stem 監査は backup + 答案導出 + (可能なら) 公式源の三点で。
