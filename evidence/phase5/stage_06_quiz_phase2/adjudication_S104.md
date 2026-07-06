# S104 裁決記録 — Quiz Phase 2 scale batch 3 (2020r02o)

Session: 2026-07-06 Session 104。启动词「Phase 2 续批」。
ユーザー gate: batch=2 回 (2020r02o/2019r01a) だったが、**generate 完了後にユーザー指示「2020r02o做完这个就暂时暂停一下」→ 本 session は 2020r02o のみで停止** (2019r01a は prep 済のまま次回へ)。

## パイプライン実績 (2020r02o)

- prep: 100 問 / 13 図 [11,33,43,55,61,66,71,72,73,81,85,87,92] / tr 100/100 / id 連続 ✓ / 図資産欠落 0。
- generate `wf_79517f64-394`: 417 agent / 11.8M tok / ~63 分、一発完走・agent error 0。
  **100/100・jp PASS 99 / CONCERNS 1・tr PASS 97 / CONCERNS 3・suspect 3 (q015/q024/q025)**。
- Persist ✓ (self-write) → verify-result 100/100 ✓ → merge: explained 100/100・missing 0・STEM-CORRUPTION 0。

## 裁決 1: suspect 3 件 (key-guard)

全 3 件 = `figure_derivable=false` の図なし概念問で derived == stored key 一致 (S102 q058/q097・S103 q021/q038/q039/q049 と同型の benign over-flag)。

- **q015** (SCM、key イ): derived=イ=key。ただし generator が note で **choices_jp[エ] 末尾 OCR junk 「ag 8 ュー」** を申告 → 裁決対象 (下記 裁決 2)。
- **q024** (CAD、key エ): derived=エ=key、腐敗なし → **不動**。
- **q025** (サイバーセキュリティ基本法、key エ): derived=エ=key、腐敗なし → **不動**。
- Rule A critic 3 件とも accurate (q024/q025=none、q015=low[note 歴史記録指摘のみ]) で追認。

## 裁決 2: q015 choices_jp[エ] OCR junk (主 context 源実読)

- **源 page-08 実読**: 問15 選択肢エは「…経営資源の最適化と経営の効率化を図る。」で終わる。raw の「ag 8 ュー」= 頁脚「— 8 —」OCR 混入 (S103 q039 「の 18 ey」と同型)。
- **是正**: 新 `quiz-phase2-stemfix-S104.mjs` (assert-once) → raw bank → `build-quiz-corpus.mjs` 再生成。
- **invariants (git 確証)**: questions.json diff = **1 行 (q015 エ choice 値のみ)**・correct_answer **0 変更**・quiz_index **不変**。
- zh/en は Phase 1 訳が既正 (junk 伝播なし) → **trfix 不要**。
- key_guard.note_jp の junk 言及は腐敗の歴史記録として **保持** (S102/S103 惯例)。解説可視フィールド (correct/distractors/points) に junk 言及 0 確認済。

## Rule A 独立抽検 (`wf_d12ce866-9d2`)

N=24 (全 13 図 + suspect 3 [是正済 q015 含む] + plain 8)、critic=`pr-review-toolkit:code-reviewer` (writer=general-purpose / in-pipeline reviewer=feature-dev:code-reviewer と三互異、Rule D)。24 audit / 0.96M tok / ~4 分。

- **accurate 22/24・none 18 / low 4 / medium 2・全 24 independent_answer == stored key (プログラム照合、bad key 0)**。
- low 4 triage: q012 zh「指挥命令」日式借词 / q084 zh「雇用→雇佣」語形 / q033 ア「原価すら回収できない」修辞緩さ (結論正) / q015 note_jp 歴史記録指摘 → いずれも正解無影響、**不動** (zh 用語 polish は既存 backlog に合流)。

## 裁決 3: Rule A medium 2 件 → 解説是正 (explfix)

**q052 protocol 遵守: fix 前に主 context が図を自読して critic 主張を確認。**

1. **q011 (DFD、key エ) distractor ウ 解説の図矛盾**: 解説「さらに座席案内へ入る矢印が1本も無く」だが、**主 context 図実読 = パネル ウ に 受付→座席案内 の矢印が実在** (矢じり座席案内円内、choices_jp 自身も列挙)。→ jp/zh/en 三語を「座席案内へ入る矢印は受付→座席案内の1本だけで」に是正。ウ=不適切の結論・正解 エ の説明は図整合で不変。
2. **q055 (アローダイアグラム、key エ) correct_jp 数値笔误**: 「作業A→作業B（30〜50、50〜60）」の 30〜50 は**図 (A=30〜35) と矛盾**。同文の算術 (30+50=80 / 35+60=95) は正値使用、zh/en も 30〜35 で既正 = 三語不整合。→ jp のみ「（30〜35、50〜60）」に是正し三語一致回復。

- **是正**: 新 `quiz-phase2-explfix-S104.mjs` (assert-once、.phase2 expl_jp/expl_tr 4 フィールド) → re-merge。
- **独立 post-patch 検証 (Rule D: critic=pr-review-toolkit:code-reviewer ≠ fixer=主 context) = 2 件とも PASS** (agent が図を自読: ウ 3 矢印の実在と方向 / A=30〜35・B=50〜60・C=70〜100、算術 max(80,70)=80・max(95,100)=100=エ、三語同義、結論不変)。
- **実効 Rule A = accurate 24/24**。

## 検証 GREEN

tsc 0 / eslint 0 err (既存 warning 1=tTerm) / **vitest 463** (explfix 後再走) / build exit 0 / **nft IPA-exams leak 0** (17 nft 走査、quiz route trace = explanations 7 sidecar 正常 [+1=2020r02o])。

## 変更ファイル总覧

- `data/ip/quiz/questions.json`: 1 行 (q015 エ)。correct_answer 0 変更・quiz_index 不変。
- `data/ip/quiz/explanations/2020r02o.json`: 新規 (100 問解説 + explfix 済)。
- `data/ip/quiz/translations/2020r02o.json`: **不変** (trfix 不要)。
- 新 scripts: `quiz-phase2-stemfix-S104.mjs` / `quiz-phase2-explfix-S104.mjs`。
- raw bank (gitignored) 同期済。

## 所見

1. generate 11.8M tok/exam・一発完走 (S103 の 11.7–11.9M と一致、pacing 安定)。
2. **Rule A が in-pipeline reviewer をすり抜けた解説内容欠陥 2 件 (図矛盾文/数値笔误) を捕捉** — 写審分離 + 独立抽検の複利、S94 教訓 (fixer 図自読) を全适用。
3. suspect over-flag (figure_derivable=false 概念問) 3 件は既知パターン、backlog の絞り込み案は変更なし。
