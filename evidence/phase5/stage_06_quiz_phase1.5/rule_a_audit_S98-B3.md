# Quiz Phase 1.5 (stem 源再構成) — Batch S98-B3 audit

> Session 98 (2026-06-20〜21) / D-138. 全 29 回 scale の第 3 バッチ。
> 範囲: 7 回 (2014h26a / 2014h26h / 2013h25a / 2013h25h / 2012h24a / 2012h24h / 2011h23tokubetsu)、124 問 (figure 115 / nonfig 9)。

## reconstruct (WF `wf_f30fdda0-6d0`、270 agent / 12.1M tok)
- **124/124 done、PASS 119 / CONCERNS 4 / FAIL 1**。changed 47。**derived(単字)≠correct_answer = 0** (B2 と違い key mismatch surface 0)。

## triage (主 context 図/源 実読 + 独立 Rule A)

### 修正した stem (faithfulness 欠陥)
- **`2012h24a-q096`** (Rule A high、source_faithful=false、答案不変): 項目(2)の n/m 定義を修復で改悪 (「桁数を n とし」=n を桁数と再定義 → 同 stem の例「値 n は『10100』」と自己矛盾、リテラル解答者誤導)。**backup「値 n に対して」が正** → jp/zh/en 同期是正。①規則・白始まり前提は auditor が妥当と判定し保持。Rule B: `failures/..._2012h24a-q096_nm_definition`。正解ア不変。
- **`2014h26a-q093`** (JSON 直列化): writer が `"stem"` オブジェクトの閉じ `}` 脱落 → unparseable → merge validation で捕捉 → 構造修復 (内容0改変) → 再 merge。Rule B: `failures/..._2014h26a-q093_malformed_json`。

### FAIL 1 = `2013h25a-q052` — 主 context 高倍率実読 (3 度目の自己訂正)
- 当初の主 context page-level 読みで「stem が『ここで…正常稼働とみなす』文を捏造・ウ=0.18」と疑う → **page-18 を crop+2x 拡大実読**で覆る: 図は実際に「ここで，図1の装置Aはどちらか一方が稼働していれば正常稼働とみなす。」を含み、「システムがある」「値とする」も図どおり → **再構成 stem は完全に忠実**。choices **ウ=0.10** も高解像度で確認 (S94/S97 結論=0.10 を再々確認)。**writer が change_summary で「page=0.18」と逆読みし input scratch の choices_jp.ウ を 0.10→0.18 編集していた (= recurring hallucination)** が、**merge は stem のみ書込のため committed sidecar の choices は 0.10 のまま無傷**。2013h25a を re-prep して input scratch も清浄化。stem 忠実 → ACCEPT。**低解像度読みは本 session 3 度目の誤判 (q092 cell・q052 文・q052 値) → crop+zoom が権威**。

### CONCERNS / 別軸 backlog (stem 忠実)
- **`2014h26h-q090`** (Rule A high、keyMismatch、source_faithful=false、auditor indep=ア vs key=ウ): 「どのグラフか」問。stem 本文 (問題文) は忠実だが **choices_jp のグラフ説明文が図と系統的取り違い**。auditor が図グラフを読み ア を導出 (key ウ と相違)。**choices/key 軸の問題で stem スコープ外**。グラフ位相照合は誤読しやすく (q092 教訓) D-138 で断定せず → **choices/key backlog (要検証)**。stem ACCEPT。
- **`2011h23tokubetsu-q070`** (Rule A medium): choices_jp が図に無い「並列ブロック×2並列」位相を捏造 (図=単純並列)。stem 忠実、change_summary が既に上流是正記録。→ choices backlog。
- **`2011h23tokubetsu-q099`** (Rule A medium): choices_jp が別問の座標範囲式 (0≦J+K≦20 等) で汚染。stem は figure (page-41) 忠実。→ choices 汚染 backlog。
- **`2014h26a-q090`** (Rule A medium、incomplete-source): 非figure。計算必須のファイルサイズ「2,400Mバイト」が backup/raw 双方に無く writer が canonical 知識から復元。同時不可条件は backup 由来で確証、2,400MB は key ウ=80 と整合だが **corpus 源では非検証**。除去すると解けないため保持 + **incomplete-source backlog** (IPA 源照合要)。

## merge / 回帰
- 7 回 (q093/q096 修復後の 2014h26a/2012h24a 再 merge 含む) すべて **missing 0** (updated 124)。choices/answer keys/questions.json/quiz_index/figure 不変。回帰 (選択肢表混入) = 全 124 **leak 0**。

## 独立 Rule A (WF `wf_c03f48ee-4e6`、auditor=code-reviewer ≠ critic ≠ writer、N=24、強制 8)
- **faithful 22/24** (raw)、severity none8/low10/medium3/high3、**leak 0**、keyMismatch 1 (q090-26h)。
- source_faithful=false 2 = q096 (n/m 改悪 → **修正済**) + q090-26h (choices グラフ取り違い、stem 本文は忠実)。**修正後の実効 stem 欠陥 ≈ 0** (q096 是正、q090-26h は choices 軸)。

## 検証
- 修復 2 件 (q093 JSON / q096 n/m) 後の sidecar JSON valid。diff は stem フィールドのみ。tsc/eslint/vitest/build/nft は code+トレース file-set 不変につき B1 full GREEN 継続。

## backlog (D-138 stem scope 外、要ユーザー判断 — B3 追加分)
- **choices/key (要検証)**: `2014h26h-q090` (choices グラフ説明文が図と取り違い、auditor 図読み=ア vs key=ウ → key 妥当性要確認)。
- **choices 汚染**: `2011h23tokubetsu-q099` (別問の座標式混入)・`2011h23tokubetsu-q070` (並列位相 choices、上流是正記録あり)。
- **incomplete-source**: `2014h26a-q090` (ファイルサイズ 2,400MB が corpus 源に無く canonical 復元、IPA 源照合要)。
- (B2 から継続) key: `2015h27h-q100` bad key / choices: `2017h29a-q092`・`2015h27h-q086` / incomplete: `2015h27a-q100`。
