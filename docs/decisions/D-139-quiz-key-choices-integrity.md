# D-139 — Quiz Phase 1.6: 答案键 + 選択肢 完整性審計 & 確定 bad key 是正

> Session 98 (2026-06-21) / Phase 5 Stage 6 / Status: **LOCKED** (ユーザー選択「先审键再上Phase2(推荐)」)
> 親: D-135 (Quiz サブ段階)・D-136 (Phase 1 翻訳)・D-137 (Phase 2 解析)・D-138 (Phase 1.5 stem 源再構成)。

## 文脈 (なぜ)
Phase 1.5 (D-138) で全 29 回の stem を figure/源から忠実に再構成した過程で、**stem スコープ外の上流欠陥**を多数捕捉した。**stem は全て忠実**だが、以下は別軸:
- **確定 bad key 3 件** (figure/源から独立導出 + 独立 Rule A auditor 一致 + Phase 1.5 derived_answer 零成本筛査でも全 537 中この 3 件のみ surface):
  - `2015h27h-q100`: 包除原理 `w−x−y+z=|価格=1∩性能=0∩デザイン=0|` → **ア** (stored エ)。
  - `2009h21a-q091`: 引当 (前日在庫100・注文80/10/40、FIFO/優先先取り両経路) → **イ=10** (stored ウ=14)。
  - `2011h23a-q100`: 期待値 (大0.2/中0.5/小0.3 − 費用) 最大 → **ウ=4.5** (stored イ)。
- bad key 疑い 1 (`2014h26h-q090`、グラフ問、要検証)。
- choices_jp 腐敗群 (figure と不一致、key は正、配信文面が誤): q092(17h29a)/q086(15h27h)/q099/q070(11h23tokubetsu)/q061(10h22a)/q077(10h22h) + S96 既存。
- incomplete-source・図 crop ミスマッチ。

**S97 figkey 監査 (40/247 図題抽様、strict 坏键率 0/40) はこの 3 件 (図題含む) を全て捕捉できなかった** = 抽様が小さすぎた。Phase 2 (D-137) は解説で keyed answer を正当化し各 distractor に言及するため、**錯键/坏選択肢の上で 2900 解説を生成すると「自信のある誤り」を量産**する (返工最高コスト)。

→ **Phase 2 scale 前に key + choices の完整性を確保する (Phase 1.6)**。

## 決定

### D-139-A 確定 bad key 3 件を是正 (ユーザー承認済)
- 是正対象: 上記 3 件のみ (derived/independent audit/零成本筛査の三者一致、確定性計算)。
- **方式 = drift-proof**: raw bank `data/ip/exams/question_bank.json` (gitignored 源) の `correct_answer` を編集 → `build-quiz-corpus.mjs` 再生成 → committed `data/ip/quiz/questions.json` の correct_answer のみ更新。quiz_index.json は answer key を持たない / 翻訳 sidecar も key を持たないため波及なし。
- 不変: stem/choices/figure/topic は不変 (git diff で correct_answer 3 フィールドのみを確証)。

### D-139-B 全量 key + choices 完整性審計 (盲推、写審分離)
- 範囲: 図題 467 を full sweep (S97 抽様が漏らしたため)。各図題で auditor が figure + 忠実 stem から**答案を盲推** (stored key を渡さない) → key 比対 + choices↔figure 照合。非図題は Phase 1.5 derived_answer を初筛とし、mismatch 候補を targeted 検証。
- 写審分離 (Rule D): deriver ≠ verifier ≠ 裁決 (主 context 高倍率実読、低解像度誤読を防ぐ=S98 教訓)。
- 出力: 確定 bad key 一覧 (→ ユーザー承認後 D-139-A 同方式で是正) + choices 腐敗一覧 (→ choices-fidelity 是正トラック)。

### D-139-C 順序
Phase 1.6 (本決定) 完了 → Phase 2 (D-137) を figure-fidelity hardening + **全問 key-guard** 込みで再 pilot → scale。

## 影響
- questions.json の correct_answer 3 件更新 (committed)。raw bank (gitignored) も編集。
- 新規: key/choices 審計 scripts + evidence。是正は Rule B archive (`failures/quiz_phase1.5_S98_*answerkey_mismatch.md` 既存) + 本 ADR で追跡。
- answer key 変更は本プロジェクト初 (D-138 は keys 不変だった) → 確定性の高い 3 件に限定し、全量審計で網羅性を担保。

## 検証
- 是正後: questions.json diff = correct_answer 3 件のみ (stem/choices 不変)。tsc/eslint/vitest/build/nft GREEN。
- 全量審計後: bad key 率を実測し、残りを是正 → Phase 2 へ。

## 執行結果 (Session 99、D-139-B 全量、路由词「Phase 1.6 全量」)
- **図題 467/467 盲推審計完了** (deriver=general-purpose、stored key 非開示)。compare: bad-key 候補 **5** / choices_faithful=false **28** / underivable **3**。
- **写審分離 3 層裁決** (deriver ≠ verifier=critic×3 [`wf_491d0f03-4dd`] ≠ 主 context 高倍率実読)。各候補 5 独立パス。
- **確定 bad key = 2 件 (5/5 一致、ユーザー承認後是正済)**:
  - `2009h21a-q012`: ア → **ウ** (④ 実行計画策定直前 = 戦略立案; CSF抽出 ア = ③)。
  - `2010h22a-q091`: ア → **エ** (表2 = 4×3×3 = 36 全組合せ穷举 = 網羅; **全量 net-new**、S97 抽様外)。
- **deriver 偽陽性 3 件 (key 正、是正回避)**: `2014h26h-q090` (=本 ADR「疑い1」→ ウ 同截距+急傾き正、deriver 低解像度誤読) / `2012h24h-q091` (c=2 正、No.4 コースR 無テキスト代) / `2009h21h-q096` (ア・イ 双方 figure-true の曖昧問)。**疑い1 (q090) は CLEAR — 誤是正回避が写審分離の核心価値**。
- **是正**: drift-proof (`quiz-keyaudit-fix-S99.mjs` 現値 assert → raw bank → 再生成)。questions.json diff = correct_answer 2 件のみ。**検証 GREEN** (tsc/eslint0err/vitest463/build/nft IPA0)。
- **D-139-B 完了**。choices 腐敗 28 + underivable 3 = **choices-fidelity track (別 track、ユーザー承認の defer)**。証拠 `evidence/phase5/stage_06_quiz_keyaudit/rule_a_audit_S99_fullsweep.md`。
- **D-139-C 順序**: Phase 1.6 完了 → 次 = Phase 2 (D-137) 全問 key-guard 込み再 pilot。
