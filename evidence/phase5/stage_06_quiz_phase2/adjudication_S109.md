# Session 109 — Quiz Phase 2 裁決記録 (2015h27h) + s7x 表示テキスト保真核験 (2015h27h / 2014h26a)

启动词「Phase 2 续批」。ユーザー gate: batch = 2 回 (2015h27h → 2014h26a) / commit gate = 「commit + push 自動」。
本 session 途中で **新しい欠陥クラスが発見され**、ユーザー判断により scope が拡張された (下記 §3)。

---

## §1. 2015h27h — Phase 2 生成と通常裁決

| 項目 | 結果 |
|---|---|
| generate | `wf_a8439d8b-cb1` **100/100・jp PASS 100・tr PASS 98 / CONCERNS 2・error 0**、422 agent / 12.53M tok / ~66 分、一発完走 |
| 決定的 persist | empty-note 0 / jp_verdict 欠 0 |
| verify-result | 100/100 |
| merge (pre-fix) | **SUSPECT 6** (q087/q088/q090/q092/q094/q099)・**STEM-CORRUPTION 9** (q017/q051/q053/q064/q086/q087\*/q091/q092\*/q099\*) |
| merge (post-fix) | **SUSPECT 6** (全て linkage-gap)・**STEM-CORRUPTION 1** (q099 = scenario-gap) |

### 裁決 (主 context 源実読: page-07 / 20 / 21 / 24 / 25 / 34 / 35 / 40)

| 問 | 裁決 | 層 |
|---|---|---|
| q017 ア | 「他社商品で」→「他社商品が追随して」/ 英単語 `competition`→「競争」 | stemfix + trfix + explfix |
| q017 イ | 「既存の自社商品**の売上**が」を復元 (**generator 未 flag**) | stemfix + trfix |
| q017 エ | 「頻繁に**変更が生じた**」→「頻繁に**安売りした**」(**generator 未 flag**、意味的置換) | stemfix + trfix + explfix |
| q051 ア | 字形 OCR `05`→`OS` (正解肢)。zh/en は既に OS で訳出済 | stemfix + explfix (注記 strip) |
| q053 エ | 末尾 junk「こう」strip (正解肢) | stemfix |
| q062 ア/ウ/エ | **§2 参照 (本 session 最重要の発見の 1 つ)** | stemfix + trfix + explfix |
| q064 ア/イ | 「など」脱落 ×2 + **否定反転**「下げない」→「下げていく」 | stemfix + trfix + explfix |
| q086 イ/ウ/エ | **下線注記が全て誤り = 表示上 answer-affecting** | stemfix + trfix |
| q087 イ | 正解肢 a 欄「入退室区分を集計」→「入退室区分の値を合計」 | stemfix |
| q091 / q092 | stem の Z 脱落・OCR `d`→`B`・語句復元 | stemfix + trfix |

**q086 の重大性**: 下線注記が イ=区画番号 / ウ=許可区分 / エ=社員番号,区画番号 と誤っていた。腐敗版のままだと
**エ が真の複合キー {社員番号, 区画番号} に見え、正解肢 イ は単独キーに見える**。source page-34 を 6 倍拡大で実読し
ア=社員番号 / イ=社員番号+区画番号 / ウ=社員番号+許可区分 / エ=3列すべて を確定。key イ は不変 (公式解答と一致)。

### linkage-gap クラスタ (テキスト是正では直せない = backlog)

`q087 / q088 / q090 / q092 / q094 / q099` の 6 問。中問 A (〔入退室管理の概要〕・図1)、中問 B (〔Zプロジェクトの状況〕
前文)、中問 D (表1) が配信 stem に未添付。S108 の 2015h27a と同根。key は公式解答で確定済み、解説は自己完結ゆえ ship。
key_guard は `figure_derivable=false` を維持し、SUSPECT として正直に残した (OCR flag のみ解決)。

---

## §2. 新発見の欠陥クラス — 「意味的に成立するが源と異なる」表示テキスト

### 発端: q062

正解肢ウが源の「（A∩B）は，（A∪B）の部分集合である」から「(A∩B)は，**B**の部分集合である」に置換されていた。
**両方とも数学的に真** (A∩B ⊆ B も A∩B ⊆ A∪B も常に成立) であり、key ウ とも矛盾しない。したがって

- generate の key-guard: 矛盾が無いので `stem_corruption_suspected=false`
- in-pipeline reviewer: 解説は腐敗版に対して整合しているので PASS
- Rule A critic: stem/choices を **与えられたまま** 評価するので検出不能

の**三重すり抜け**が成立した。解説本文も A∩B ⊆ B を論じており、正解肢の説明が源の主張と別物になっていた
(explfix-S109 で A∩B ⊆ A∪B に書き換え)。**この問は正規表現の誤検出から偶然浮上した**——つまり既存の
どのゲートも構造的にこのクラスを見られない。

### 根本原因

Phase 2 の 3 ゲート (key-guard / in-pipeline reviewer / Rule A) は、いずれも **非図問について源ページを再読しない**。
S101 の決定的 detector も `0→O` 等の字形シグナルに依存するため、意味的置換は捕捉できない。

### 対策 (本 session で新設)

| スクリプト | 役割 |
|---|---|
| `quiz-s7x-fidelity-prep.mjs` | s7x resource 由来 (`stem_resourced_s7x` / `choices_resourced_s7x`) の高リスク問を抽出 |
| `quiz-s7x-fidelity.workflow.mjs` | 源ページ PNG を実読し表示テキストと**逐字 diff**。`agent_type` で独立二読が可能 |
| `quiz-fidfix-S109{,-2014h26a}.mjs` | 保真是正 (raw / clean / choices、assert-once) |
| `quiz-fidfix-repair-{prep,apply}.mjs` + `.workflow.mjs` | 是正後の zh/en・解説の連帯修復 (書込パスに LLM なし) |

### 2015h27h の保真核験結果

- pass 1 (`general-purpose`): 35 問中 **19 問 DISCREPANT / 40 件** (semantic 32, cosmetic 7, **answer_affecting 1**, 正解肢上 6)
- pass 2 (`pr-review-toolkit:code-reviewer`, 独立): **39/40 を再現**。唯一の pass1-only (q062 stem「AとB」) は主 context が page-24 で確認
- 主 context 実読による抽検: **q014 / q027 / q100 / q062 / q086 の 5 問すべてで agent 判読が正確**と確認

**確定した answer-affecting = q014 ウ**: 源「鉱工業の分野ごとに，**民間団体が定めた**標準を集めた規格である」が
「**国が定める**標準を集めた規格である」に置換されていた。JIS は実際に国 (主務大臣) が制定する国家規格なので、
**腐敗版のウは真になり正解肢アと並立していた**。生成された解説はこの真の記述を「JIS は国が*一方的に*定めたものではない」
と無理に否定しており、腐敗の症状がそのまま出力に現れていた (explfix で素直な論証に書き直し)。

**注目すべき失効モード = 隣接問からの逐字混入**: q027 ア「作業間の順序関係**とともに解散する**最短の…」は、
同ページ 問26 ア「問題解決**とともに解散する**組織」からの混入 (主 context page-11 実読で確認)。OCR 誤読ではなく
Phase 1 抽出側の欠陥。

### 2014h26a の保真核験結果 (Phase 2 生成前に実施 = ユーザー判断)

- pass 1: 24 問中 **10 問 DISCREPANT / 16 件**、pass 2 (別 agentType) が同一 10 問を再現
- pass 2 は追加で **answer_affecting 2** を認定:
  - **q046** — 源の 4 肢はいずれも**図** (バーチャート / フロー図 / R-C マトリクス / 階層図)。dataset は生成ラベル
    (「ガントチャート」…「組織図」) に置換。正解肢ウが「RAM（役割分担マトリクス）」と名指しされ、**図を読んで判別する
    出題構造が消滅**
  - **q086** — 源の 4 肢は費用累計の階段グラフ。dataset は「費用累計グラフ（ア）」…（エ）という**識別不能な
    プレースホルダ**で、表示テキストだけでは解答不能
  - いずれも図 linkage-gap であり**テキストでは修復不可** → 図/シナリオ再抽出 track
- テキスト是正 11 件を適用 (q009/q024/q051/q086 前文/q087/q089/q090/q091/q099)。特筆:
  - **q090** — 源に無い一文「Sさんが，2,400Mバイトの…転送したい。」が挿入されていた。2,400M は
    2M×2,000×0.6 の**受験者が導出すべき中間値**で、原文はこれを与えない → 削除
  - **q086 前文** — S社/製品X/「Xソフト」の定義/作業A〜H と「前作業」の定義節がまるごと要約に置換されていた
  - **q087 エ** — 数値がずれて**源のイと完全に同一文**になっていた

### 全 corpus の暴露面

`stem_resourced_s7x` または `choices_resourced_s7x` = **521 / 2900 問**。うち **276 問が Phase 2 完了済の 17 回**に含まれる。
本回の観測率 (2015h27h 54%、2014h26a 42%) を当てれば、corpus 全体で 200〜280 問の表示テキストが源と乖離している見込み。

---

## §3. Rule A 独立抽検 (2015h27h)

`wf_135c3c19-6a3` **N=36** (全図 6 + suspect 6 + 是正済 24 を強制包含):

- **accurate 33/36**・severity {none 8, low 25, **medium 2, high 1**}
- **bad key 0/36** (independent_answer == stored key 全数)・**keyGuardMismatch 0**

### medium/high 3 件はいずれも実在の欠陥 → `explfix2-S109` で是正 (3 問 × 3 言語 = 9 フィールド)

| 問 | 深刻度 | 内容 | 由来 |
|---|---|---|---|
| q087 エ | **high** | b=「偶数である」なのに「入室2回・退室0回 (個数2=偶数) は抽出できず見逃す」と記述 = **論理が逆**。真の見逃し例は個数が奇数になる 入室2回・退室1回 | **生成時からの論理誤り** (in-pipeline reviewer すり抜け) |
| q089 ア | medium | 「35日では作業4を開始できず」が、同じ解説の correct.jp「結合点4に到達できるのは 5+30=35日目」と**自己矛盾**。35日は作業4を開始**できる**時点 | **生成時からの論理誤り** |
| q017 エ | medium | 是正後の choice「頻繁に安売りした」に対し解説が是正前の「頻繁な変更」を引用 | **連帯修復の漏れ (S109 自身のミス)** |

low 25 = 非 answer-affecting backlog (zh 本土 polish が大半、en「」括弧、note artifact、figure-gap の透明性記録)。

### 独立再検証 (Rule D: explfix2 は主 context が執筆したので別 agent が検証)

`wf_0324e4c5-eb6` (q017 / q087 / q089): **accurate 3/3・severity {low 3}・keyGuardMismatch 0**、
independent_answer = ア / イ / ウ で stored key と全一致。low 3 は英文引用符の体裁不統一と説明の明瞭性に関する指摘のみ。

⇒ **Rule A 実効 = 36/36、bad key 0/36**。

---

## §4. invariants (git 確証)

- `questions.json`: 2900 問、**correct_answer 変更 0**、stem_jp 11 問 / choices 45 フィールド (全て本 session の 2 exam)
- `translations/`: 2015h27h + 2014h26a のみ
- `explanations/`: 新規 1 (2015h27h) → nft traced = **17**
- 検証 GREEN: tsc 0 / eslint 0 err (既存 warning 1) / **vitest 463** / build exit 0 / **nft IPA-source leak 0**

## §5. 証拠ファイル

- `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S109_2015h27h.json`
- `evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S109_2015h27h{,_pass2}.json`
- `evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S109_2014h26a{,_pass2}.json`
