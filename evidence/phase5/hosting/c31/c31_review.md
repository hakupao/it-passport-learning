# C31 Rule D review (S164)

- Writer = main. Reviewer = critic (opus), read-only (different subagent_type from C29/C30 verifier; writer ≠ reviewer).
- Round 1: **PASS** (HIGH 0, MEDIUM 1 → round 2). 10 fields / 6 questions, word-diff = patches 1:1, translations 0, baseline 8 rows = patches 1:1.
  - Labels q097/q099/q100 explanations → "[Situation of Company S]" read correctly.
  - 2014h26a-q089: dropping "the own" keeps meaning (jp 自IPアドレス, zh 本机 IP 地址).
  - 2020r02o-q032: quotes added; "(reasoning)" not needed (preceding sentence already "infers (reasons out)").
  - 2011h23tokubetsu-q065 three languages consistent and minimal; distractors.エ「感染者」 refers to the same person (no change needed).
  - 2010h22h-q099 d:ア: agreed not to add "Internet" (the jp explanation itself says only 通信販売システム) → C30 LOW closed as "jp has none".
  - MEDIUM: en stems of q097 (×2 lower-case), q098, q100 still used other label variants.
- Round 2 (`patches_r2.json`, 3 stems / 4 occurrences; stale upstream .phase1/.phase1.5 got label-only replacement, `upstream_sync_r2.json`): **PASS**. Only label text changed; both layers + upstream now only "[Situation of Company S]"; baseline +3 rows (stemTr q097/q098/q100).
- LOW (record only): "S Company" / "Company S" both used in 2010h22h q097–q100 explanation prose.
