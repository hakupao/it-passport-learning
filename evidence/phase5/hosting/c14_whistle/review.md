# C14 公益通報者保護法 令和 7 年改正 — Rule D review (S164)

- Writer = main (B3 patches p19・p21・p22 on terms[1] detail_jp/en/zh; p08・p16・p17・p18・p20 retired with reasons). Reviewer = verifier (opus), read-only.
- Verdict: **PASS** (HIGH 0, MEDIUM 0, LOW 3).
- Evidence (reviewer): unit diff = detail ×3 + explanation ×3 only; explanation = detail without markup (3 langs); 3 sentences per language (D-195 §1); 5 cited questions + 5 challenge questions still agree (the amendment does not change what they test).
- Facts vs 要綱 (`source_excerpt.md`): フリーランス (特定受託業務従事者) added (第一 一); 刑事罰 only on 解雇等特定不利益取扱い = 解雇・懲戒 (第五 一) → "解雇や懲戒が刑事罰の対象" accurate, not overstated. The 1-year presumption (第二 一 3) omitted (omission, not error).
- Tense: non-past + explicit 施行日 in all three languages → true before and after 2026-12-01.
- LOW-1 p08 retired_reason pointed to retired p18 → fixed (p18 → p20 → p22). LOW-2 zh「也被纳入」lacked an object → p22「也被纳入保护范围」. LOW-3 (penalty applies to employer's dismissal/discipline of workers; juxtaposition with freelancers could be over-read) → kept: 解雇・懲戒 are employment concepts, low risk at textbook granularity.
- After LOW-2: merge --journal --write validate 0 / parity 0, zh-terms 0 warning in this unit (corpus-wide 2 known since S158: 尺度・応答時間), gate:content PASS.
