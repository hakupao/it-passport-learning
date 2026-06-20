# Quiz Phase 1.5 (stem 源再構成) — Batch S98-B2 audit

> Session 98 (2026-06-20) / D-138. 全 29 回 scale の第 2 バッチ。
> 範囲: 8 回 (2018h30a / 2018h30h / 2017h29a / 2017h29h / 2016h28a / 2016h28h / 2015h27a / 2015h27h)、130 問 (figure 104 / nonfig 26)。

## reconstruct (WF `wf_49f7cb1e-b44`)
- **途中 session limit 直撃** (22:00 JST reset)。writer (recon) 130/130 はディスク確定、check (critic) 112 が limit で null。
- **`resumeFromRunId` で再開** (task w0qhu22lu): cached writer 130 + 18 既 PASS は instant、null 112 check のみ再走 (S96 weekly-limit recovery と同型)。
- 最終: **130/130 done、PASS 126 / FAIL 1 / CONCERNS 3**。changed 34。

## triage (主 context 図/源 実読 + 独立 Rule A)

### 修正した stem (faithfulness 欠陥、答案不変)
- **`2015h27a-q086`** (Rule A medium、faithful=false): 再構成が raw_stem の前置文ドリフトを継承 (『その』脱落 + 『アンケート集計表から』→『行ごとに』捏造)。**backup + page-37 が権威で『その質問項目の…をアンケート集計表から抽出し』**を支持 → jp/zh/en の前置文を主 context が backup どおり是正 (独立 auditor が page-37 で特定+訂正案を提示、答案ウ不変)。再 merge で適用。

### FAIL 1 = `2017h29a-q092` — 主 context 高倍率実読で裁決 (誤判の自己訂正)
- 当初の主 context page-level 読みで「答案 イ が正・key エ は誤 (bad key)」と判断 → **独立 Rule A auditor が「key エ は正・choices_jp が腐敗」と反証** → 主 context が **page-35 を crop+3x 拡大実読**で再確認:
  - 図エ行 = 所有者○○○ / グループ **R○W−X○** / その他 R−W−X○ = 条件 (全実行・所有者+グループ読出・所有者のみ書込) を**満たす唯一の設定** → **答案エ は正**。
  - 当初の主 context 読み (グループ R−) は低解像度誤読。**bad-key 主張を撤回**。
- **真因 = choices_jp の R/W/X セル腐敗** (corpus エ のグループ R が ○→− 等、ウ/イ の その他セルも反転) → **choices トラック backlog** (stem でもキーでもない)。**多段独立検証 (主 context 初読→独立 auditor→主 context 高倍率再読) が誤判を捕捉=Rule D/q066 型の網兜の再実証**。stem は忠実 → ACCEPT。

### CONCERNS / keyMismatch (stem 忠実、別軸 backlog)
- **`2015h27h-q100` = 確定 bad key**: 非figure。再構成 stem は page-46 の手続 (w=|価格=1|, x=|性能∩価格|, y=|価格∩デザイン|, z=|triple|, w−x−y+z) に逐字忠実。包除原理で `w−x−y+z = |価格=1 ∩ 性能=0 ∩ デザイン=0|` = **選択肢ア**。corpus choices も page-46 と一致 (ア=該当式)。**独立 auditor も独立に ア を導出**。stored key=**エ** は誤 → **key トラック backlog (HIGH、答案影響)**。stem 忠実 → ACCEPT。
- **`2015h27h-q086`** (Rule A high、faithful=true、supports_key=false): stem は page-34 と逐字忠実。だが **choices_jp の下線注記が源と不一致 (4 中 3 誤)**。auditor が page-34 を 8x 実読: 真の下線 = ア社員番号 / イ社員番号+区画番号 / ウ社員番号+許可区分 / エ全列。複合主キー{社員番号,区画番号}=真の イ → key イ は正。**choices トラック backlog (HIGH)**。stem 忠実 → ACCEPT。
- **`2015h27a-q100`** (Rule A medium、faithful=true、supports_key=false): figure (処理速度表のみ) に逐セル忠実だが、正答 140(イ) 算出に必須の **HDD 容量・台数表が上流 OCR で欠落** (bank s027=ocr_garble_critical 既記録)。stem 単独で導出不能 = 源不完全。key イ は IPA 公式で正。**incomplete-source backlog**。stem は源忠実 (q066 型の再構成腐敗ではない) → ACCEPT。

## 回帰 (解答選択肢表混入)
- 全 130 の stem_jp_clean/zh/en を `\|\s*[アイウエ]\s*\|` 走査 → **leak 0** (B1 で hardening した nonfig 組合せ問の選択肢表除去が機能、change_summary でも q021/q065/q007 等で「選択肢表は stem に含めず」を確認)。

## merge (各 exam、stem フィールドのみ)
- 8 回 + q086 fix 後の 2015h27a 再 merge、すべて **missing 0** (updated 130)。choices/answer keys/questions.json/quiz_index/figure 不変 (git diff で choices/correct_answer 変更 0 を確証)。

## 独立 Rule A (WF `wf_43ad65ca-5cf`、auditor=code-reviewer ≠ critic ≠ writer、N=26、強制 8)
- **faithful 24/26** (raw)、severity none13/low8/medium2/high3、**choice-table-leak 0**、keyMismatch 4。
- not-faithful 2 = `2015h27a-q086` (前置文ドリフト → **修正済**) + `2017h29a-q092` (auditor が choices 腐敗を source 扱い → 実際は stem 忠実・choices 問題)。**修正後の実効 = stem 欠陥 0/26** (q086 是正、q092 は stem 忠実)。
- keyMismatch 4 は全て stem 忠実: q100(27h)=bad key / q086(27h)=choices 下線腐敗 / q100(27a)=源不完全 / q092=choices R/W/X 腐敗。**いずれも stem スコープ外**。

## 検証
- 8 sidecar JSON valid + provenance flag。diff は stem_jp_clean/stem.{zh,en} のみ (choices/keys 不変)。
- tsc/eslint/vitest/build/nft は **コード+トレース file-set 不変につき B1 の full GREEN が継続** (apps/web 無変更、scripts/ は build 対象外、sidecar は既存トレース集合の内容更新のみ)。B1: tsc0/eslint0err/vitest463/build0/nft IPA0。

## backlog (D-138 stem scope 外、要ユーザー判断)
- **key トラック (HIGH)**: `2015h27h-q100` = 確定 bad key (stored エ → 正 ア、包除原理で確証、独立 auditor 一致)。**注: S97 figkey 抽様 40/247 はこれ系を捕捉できず — nonfig key + 図 key の再監査拡張を推奨** (q092 では writer が key に寄せて derive したため非surface、写審分離 critic+主 context 高倍率実読で初めて adjudicate 可能だった)。
- **choices トラック (HIGH/MEDIUM)**: `2017h29a-q092` (choices_jp R/W/X セル腐敗、key エ は正)・`2015h27h-q086` (choices_jp 下線注記 3/4 腐敗、key イ は正)。配信 choices 文面が図と不一致 → 再 OCR/figure 照合推奨。
- **incomplete-source**: `2015h27a-q100` (figure に HDD 容量・台数表が欠落、正答 140 算出不能)。

## 成果物
- translations サイドカー stem 更新 8 回 (committed)。evidence: `S98-B2/{ruleA_result,ruleA_samples,items_batch}.json` + 本ファイル。
