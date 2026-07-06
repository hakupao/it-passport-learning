# S104 裁決記録 — Quiz Phase 2 scale batch 3 (2020r02o + 2019r01a)

Session: 2026-07-06 Session 104。启动词「Phase 2 续批」。
ユーザー gate: batch=2 回 (2020r02o/2019r01a)。generate 完了後にユーザー指示「2020r02o做完这个就暂时暂停一下」で一時停止 → **同日ユーザー「2019r01a 继续」で再開、2/2 完走**。

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

## 所見 (2020r02o)

1. generate 11.8M tok/exam・一発完走 (S103 の 11.7–11.9M と一致、pacing 安定)。
2. **Rule A が in-pipeline reviewer をすり抜けた解説内容欠陥 2 件 (図矛盾文/数値笔误) を捕捉** — 写審分離 + 独立抽検の複利、S94 教訓 (fixer 図自読) を全适用。
3. suspect over-flag (figure_derivable=false 概念問) 3 件は既知パターン、backlog の絞り込み案は変更なし。

---

# 2019r01a (exam 2/2、ユーザー「2019r01a 继续」で再開)

## パイプライン実績

- prep: 100 問 / 14 図 [2,26,34,47,60,62,65,70,76,82,83,93,95,99] / tr 100/100 / id 連続 ✓ / 図資産欠落 0。
- **generate `wf_57a6c0db-eeb` は session limit 直撃 (resets 14:20 JST) で 1 回中断**: 初回 run = gen 100/100 落盘・rev 95/100、tr 100 全滅・persist 失敗 (301 agent/5.8M tok)。**14:20 に haiku probe = READY → `resumeFromRunId` で 195 cached + 210 live 完走** (405 agent/8.3M tok、error 0)。計 ~14.1M tok。
- 最終: **100/100・jp PASS 100・tr PASS 99 / CONCERNS 1・suspect 2 (q019/q064)**。

## 裁決 1: Persist agent の verbatim 契約違反 (Rule B 事案)

resume 後の Persist agent が **有損版** (45.9KB、全 note_jp 空・verdict/rounds 脱落) を書込。verify-result (構造検査のみ) は素通し → merge が有損 sidecar を消費。**主 context の note 走査 (q002 既知 note 不在) で発見** → workflow task output の `result` フィールド (権威コピー) から**決定的再構築** (node、151KB、empty note 0) → verify-result ✓ → re-merge (sidecar 復元確認)。
- **Rule B archive**: `failures/quiz_phase2_S104_2019r01a_persist_lossy.md` + defective merge 産物。
- **hardening 即日実装**: `verify-result` に語義 sanity check 追加 (note_jp 空率 >20% / jp_verdict 欠落 = FAIL)。負例テスト (有損複製) で FAIL 確認、正品 PASS 確認。

## 裁決 2: suspect 2 + tr CONCERNS 1

- **q019 (ハッカソン、ウ)・q064 (排他制御、エ) = benign over-flag** (figure_derivable=false 概念問、derived=key 一致、S102-S104 既知型) → **不動**。Rule A critic も両問 accurate 追認 (q019 の key_guard_valid=false は over-flag への批判で bad key ではない)。
- **q100 tr CONCERNS (2 round とも) = 受容**: XSS「入力欄」/なりすまし「電話」/「行動ミス」「shoulder surfing」の gloss 追加 = 技術的に正確な敷衍で意味保持 (S103 q005/q092 同型)。Rule A critic は q100 = accurate/none。

## 裁決 3: q026 stem「生産計画書→量」 (Rule A low 指摘 → 全層是正)

- Rule A critic (wf_5bbc1934-c5e) が源 page-12 照合で stem 冒頭「生産計画**書**」vs 源「生産計画**量**」の 1 字 OCR 転写差を捕捉 (in-pipeline も generator key_guard も見落とし)。
- **主 context 源実読 (page-12) = 冒頭・表ヘッダとも「生産計画量」確定** → stemfix-S104 拡張 (raw stem_jp) + **新 trfix-S104** (translations: stem_jp_clean / zh 生产计划书→生产计划量 / en production plan→planned production quantity) → build-quiz-corpus → re-merge。
- **invariants (git 確証)**: questions.json diff = **1 行 (q026 stem)**・correct_answer **0 変更**・quiz_index **不変**。translations 3 フィールド。
- **独立 post-patch 検証 (Rule D) = PASS**: agent が源自読 (「量」拡大確認・表ヘッダ一致)・4 フィールド三語整合・**独立検算 a = 20+a−40=10 → a=30=ア=stored key** (是正は key 無影響)。
- 検証 agent の補足 (backlog 登記、非 answer-affecting): 源「生産終了**後**」「生産開始**前**」vs corpus「終了**時**」「開始**時**」の微差残存 (モデル・計算結果不変、generator note も既認識)。

## Rule A 独立抽検 (2019r01a、`wf_5bbc1934-c5e`)

N=25 (全 14 図 + suspect 2 + **tr CONCERNS q100 手動追加** + plain 8)、critic=`pr-review-toolkit:code-reviewer` (Rule D 三互異)。25 audit / 1.0M tok / ~3 分。

- **accurate 25/25・none 18 / low 7・0 medium/high・全 25 independent_answer == stored key (プログラム照合、bad key 0)**。
- low 7 triage: q026 stem OCR (→ 裁決 3 で是正済) / q019 over-flag 批判 (不動) / q095 note_jp が sample に無い raw garble を言及 (sample 形状の artifact、guard 本質正 → 不動) / q002 受取配当金 zh 应收股利・q012 明文化/事业活动・q084 经营层 (zh 用語 polish backlog 合流) / q071 SDN 的な hedge (修辞、不動)。

## 検証 GREEN (最終データ)

tsc 0 / eslint 0 err (既存 warning 1=tTerm) / **vitest 463** (stemfix/trfix 後再走) / build exit 0 / **nft IPA-exams leak 0** (17 nft 走査、explanations 8 sidecar 正常 trace [+1=2019r01a])。

## 変更ファイル总覧 (2019r01a 分)

- `data/ip/quiz/questions.json`: 1 行 (q026 stem)。correct_answer 0 変更・quiz_index 不変。
- `data/ip/quiz/explanations/2019r01a.json`: 新規 (100 問解説、権威 key_guard sidecar)。
- `data/ip/quiz/translations/2019r01a.json`: 3 フィールド (q026 clean/zh/en)。
- scripts: `quiz-phase2-stemfix-S104.mjs` 拡張 / 新 `quiz-phase2-trfix-S104.mjs` / `quiz-phase2-verify-result.mjs` hardening。
- Rule B: `failures/quiz_phase2_S104_2019r01a_persist_lossy{.md,_defective_merge.json}`。
- raw bank (gitignored) 同期済。

## 所見 (S104 全体)

1. **Persist agent の verbatim 劣化 = 新故障モード** (resume 後の長大 JSON 転写で発生)。決定的 post-check の構造検査だけでは不十分 — 語義 sanity (空率/欠落率) を即日 hardening。恒久対策候補: Persist を LLM から主 context の決定的書込に置換 (次回検討)。
2. session limit 直撃 → probe + resumeFromRunId 回復は 3 session 連続で安定 (S102/S103/S104)。
3. **Rule A が今 batch も表示層欠陥を捕捉** (2020r02o 解説 2 件 + 2019r01a stem 1 件) — in-pipeline reviewer と独立抽検の役割分担が設計どおり機能。
