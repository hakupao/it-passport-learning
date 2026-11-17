# C28 調査 (S163、0 token)

- script `scripts/suspects.cjs` → `suspects.json` (84 行: final / round1 の figure_derivable・derived_answer・matches_key、note)。
- suspect の定義 (`scripts/quiz-phase2-merge.mjs`): round1 ∪ final で `matches_key === false || figure_derivable === false` (anti-masking)。UI: `ExplanationPane.tsx` が `suspect` で「解説作成時の検算で公表解答を確認しきれませんでした。判定は IPA 公表の解答どおりです。」を表示。anchor = `explanationSuspect.test.ts` の 84。
- 84 題の内訳: has_figure 37 / なし 47。final の derived_answer = 正解キー **81**、unsure 3 (2015h27a-q091・q095・q098、matches_key false)。round1 で不一致 5 (stem の OCR 是正などで final が一致)。
- 多くは「図だけからは導けない」(概念問で外部知識が要る、中問の共通前文が当時の入力に無い = linkage gap) を figure_derivable=false にしたもの。final note の大半は知識または原典ページから独立導出してキーと一致と書く。
- unsure 3 題の今の表示: q091・q095 は has_figure=true で図あり (`public/quiz-figures/`)、q091 の stem_jp_clean は表を含む。q098 は stem_jp_clean に〔Aさんが処分する機器〕〔Aさんが調べた結果〕を含む (C27 で解説も 3,240+4,320=7,560 = ウ に修正済)。→ 3 題とも利用者が見る情報で解ける。
- 結論 (事実): 84 題とも「検算で確認しきれなかった」は生成当時の入力 (図・前文の欠落、外部知識) の記録で、今の表示内容とは合っていない可能性が高い。解説層は全 2,900 題 opus 監査済 (S131)・crosscheck A1〜A7 で キーと解説の整合は別に担保。
