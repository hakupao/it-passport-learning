# D-138 — Quiz Phase 1.5: stem 源再構成 (Phase 2 scale 前の必須前段)

> Session 97 (2026-06-20) / Phase 5 Stage 6 / Status: **LOCKED** (ユーザー「a」= 系统重建题干,再 Phase 2)
> 親: D-135 (Quiz サブ段階)・D-136 (Phase 1 翻訳)・D-137 (Phase 2 解析)。

## 文脈 (なぜ Phase 1.5 が要るか)

Phase 2 pilot (2025r07) で解説欠陥が出た根因は**上流 stem の OCR/s7x 腐敗が解説に伝播**。S97 stem 品質体検 (N=54+校正4):
- **answer-affecting 坏 stem 率 2/54 = 3.7%** (Wilson [1,12.5%]、2900 投影 ~107)。確診: q050 (figure_clean! 図と不一致で正解反転)・q090 (s7x が条件節を別意味化)。
- **figure-table 腐敗は標本監査で certify 不能**: 校正 q066 (真腐敗) を審計+検証が「忠実」と誤判 (答案 robust ゆえ、行数も誤読)。主 context 3.5×実読で確証。
- **答案KEY は clean** (別軸、S97 figkey + Phase2)。問題は **stem 忠実度**のみ。
- **根因 3 機構**: ①s7x 修復の意味脱落 (q034「あと」/q090 条件節) ②Phase1 clean-stem 自体の figure 不一致 (q050) ③図題 no-clean の raw 腐敗表 (q066、213 件)。

→ 解説を 2900 道生成する前に stem を源から再構成する (targeted 修正では figure-table 腐敗を取りこぼす)。

## 決定

### D-138-A 範囲
- **図題 467**: **全数** figure から stem を再構成 (標本 certify 不能ゆえ全数)。
- **非figure stem-marked 71** (`stem_resourced_s7x`/`stem_jp_corrupted_backup` 等): backup 照合 + 答案導出で reconcile (targeted、backup 照合は q034/q090 で有効実証)。
- **非figure plain**: 軽量サンプル監視 (低 risk)。

### D-138-B 出力先 = 翻訳サイドカーの更新 (reader 改修不要)
- 訂正済 **三語 stem** を `data/ip/quiz/translations/<exam>.json` の各 entry に書く: `stem_jp_clean` (figure/backup 忠実 JP) + `stem.{zh,en}` (それに整合)。
- reader は既に `stem_jp_clean` (mergeTranslation) と `stem.{zh,en}` (localizedStem) を表示に使う → **コード変更なし**。図題 no-clean には `stem_jp_clean` を新規付与、誤 clean (q050) は上書き訂正。
- 却下: ①新 stem サイドカー (plumbing 重複) ②raw bank `stem_jp` 直接修正のみ (zh/en 不整合を残す)。

### D-138-C 三語整合
- JP を figure (図題) / backup+源 (非fig) から再構成 → **値が変われば zh/en も再翻訳**して一致させる (q050/q066 は表の値変更 → 三語表も変更)。

### D-138-D プロセス (写審分離 Rule D + Rule A)
- パイプライン (Phase 1/2 踏襲): `prep` → Workflow `reconstruct` (writer=general-purpose が figure/backup から三語 stem 再構成 → **独立 checker=critic が figure↔stem を逐セル照合**、repair) → `merge` (サイドカー更新、決定的) → `ruleA` (独立 critic N-sample)。
- **figure↔stem 照合は独立 agent** (writer≠checker)。**主 context が confirmed bad の figure を実読裁決** (q066 で器具感度ギャップ実証 → 主 context 実読が網兜)。
- **pilot-first**: 2025r07 図題 (16、q066 含む) で pilot → ユーザー gate → 全 467 + 71 へ scale。

## 影響
- 新規: scripts `quiz-phase1.5-{prep,reconstruct.workflow,merge,ruleA}.mjs`。translations サイドカー更新 (figure stem 訂正)。
- questions.json / answer keys / figure / quiz_index 不変。reader/UI コード不変。
- Phase 1 の影響を受けた exam の Rule A 証拠は Phase 1.5 が部分的に更新 (再 audit)。
- 完了後 Phase 2 (D-137) を hardening (figure-fidelity 内蔵) 込みで再 pilot → scale。

## 検証
- 各バッチ Rule A 独立抽検 + figure↔stem 全数独立照合 (図題)。tsc/eslint/vitest/build/nft。
- pilot で q066/q050 等が訂正され再 audit で坏 stem 率が許容域に入ることを確認 → gate。
