# Rule A 全数抽検 — strategy-05-14-u03 (先進システムと業務パッケージ)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148〜149 第 33 批 b33)、repo HEAD `9eac988c` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b33-u03-a1` merge 結果、sha256 先頭 `060151147c897faa`)。
- **対象**: `data/ip/textbook/units/strategy-05-14-u03.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (サイバーフィジカルシステム / CPS / デジタルツイン / 業務別ソフトウェアパッケージ / 業種別ソフトウェアパッケージ / DTP) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/strategy-05-14-u03/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 `v1_terms` と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) は本体の記法除去版 (目視 + parity 0 diff)。
2. **考点 × 引用題**: 考点 全 5 件、**全て kind = mix で qid 引用 0**。manifest の `term_questions` は 6 語とも空。全 2900 題の題文 + 選択肢を grep (CPS / デジタルツイン / サイバーフィジカル / 業務別 / 業種別 / DTP / パッケージソフト / ソフトウェアパッケージ) → 本単元の見出し語を問う題は **0 題** (ヒットは別 topic の「ソフトウェアパッケージ」一般 14 題: 2009h21h-q076 導入目的 = 開発コスト削減 等。いずれも本単元 detail「一から開発するより短い期間と少ない費用で導入しやすい」・mix 考点と整合し、誤答肢 [開発スキル向上 等] を支持しない)。従って「引用題が支持しない排他的な区分」「限定条件落ち」は判定対象の題が無く、事実は一般知識 (IPA シラバスの用語水準) で照合した。
3. **quiz / challenge_questions**: quiz 全用語 0 枠。challenge 5 題 (2015h27a-q013 RFID / 2015h27h-q013 SFA / 2016h28a-q018 POS / 2017h29h-q022 IC タグ / 2018h30a-q034 SFA) は本単元の見出し語を問わず (v1 継承、jp-review r1 で LOW 既出)、本文と矛盾もしない。
4. **D-198 写し**: validate copy guard 0 件。独立照合: 単元 JP 文字列 112 本 (派生除く) × topic strategy-05-14 の全 39 題 (題文は stem_jp_clean がある 20 題はそれを使用) + 選択肢、12 字連続窓 (句読点・記号・空白除去) を **カタカナ 4 字以上・英数遮蔽あり / 遮蔽なし** の両方で照合 → ヒット **0 / 0**。1〜2 字置換の近似一致 (12 字窓・ハミング ≤2) → **0**。カタカナの多い文 (サイバーフィジカル・デジタルツイン・ソフトウェアパッケージ・DTP 各 one/detail) を目視 → 題の表現の流用なし。(iii) 選択肢なぞり: 引用題 0、`warn choice-echo` 0 行 → 該当なし。
5. **D-195**: one = 1 文 × 6 (太字あり)、detail 2〜3 文 (3/2/2/3/2/2)、図 = CPS flow steps 4・デジタルツイン compare static・業種別 tree static・DTP flow steps 4・CPS 略称 / 業務別 = 図なし (全て登録 6 種内)。定義前使用: フィジカル空間 / サイバー空間 = one の括弧注、IoT = CPS mix 考点で定義、スクラッチ開発 = 考点内同格説明、カスタマイズ = 括弧注 (「追加の開発」)。版面・組版・版下は未定義 (L5)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 考试 / 务必 / exam / tested / must / make sure) → 「覚え」3 (CPS hook + 派生 2、記憶フックの言い方)、「選ぶ」3 (業務別 hook + 派生 2、通常語)、"exam" 3 (example 内)、"tested" 1 (図セル "Can be tested"、通常語) → 全て偽陽性。pair 配置: pairs[0] (CPS / デジタルツイン) はデジタルツインの後、pairs[1] (業務別 / 業種別) は業種別の後、各組 key 行 1。
6. **D-200**: 考点数 2/0/2/1/0/0 (≤3 ✓)、各 JP 1 文・55〜70 字 (≤100 ✓)。**framing 件数**: jp 0 / zh 0 / en 0 (考点に試験・考试・exam の語なし)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合) → L1 / L4。書き方 8 (対比の出現欄) → 下記列挙。書き方 9 (限定条件) → 引用題 0 のため対象なし。§6 / §9 → L3 / 既出 LOW。
8. **三語**: zh・en が jp と同じ事実 (追加・欠落なし)、図ラベル・表セル・caption の三語一致 (parity 29 locations 0 diff)、`[[jp:…]]` 原語 10 種 (サイバーフィジカルシステム / CPS / デジタルツイン / 業務別ソフトウェアパッケージ / 業種別ソフトウェアパッケージ / DTP / ソフトウェアパッケージ / スクラッチ開発 / 業務別 / 業種) が全て jp 本文に実在 (スクリプト)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり、zh 訳語は `zh_terms.json` (デジタルツイン = 数字孪生、ソフトウェアパッケージ = 软件包) と一致 (validate B6 warn 0)。
9. **D-205 / D-210 / 観点 (10)**: 改訂される文書の構成要素数・法令の閉じた列挙なし → 該当なし。
10. **D-208 既知失敗型 (1)〜(10) の個別確認**: (1) 引用題 0 → 該当なし / (2) 引用題 0 → 該当なし / (3) CPS とサイバーフィジカルシステムは CPS one・detail・overview_rows[1].extra「サイバーフィジカルシステムと同じ」で同一物と明示 → OK / (4) 比喩: デジタルツインの「縮小模型」は mix 考点「一度作って終わる模型とは異なる」と衝突しうるが、比喩自身が「ただし…自動で更新され続ける」と差を明記 → OK (L3 記録) / (5) 前ラウンド HIGH/MEDIUM なし (jp-review r1 / loc-review r1 とも PASS・LOW のみ) → 回帰なし / (6) zh / en の語が誤答肢を読ませる例: 引用題なし。zh「定制开发」の語の衝突 → L2 / (7) 該当なし / (8) 比喩・フックの鍵語: 業務別 analogy「どの職業の人も使う電卓や手帳」・業種別 analogy「料理人の包丁や大工ののこぎり」はいずれも他の見出し語の語幹ではなく、職業 = 業種の写像も対比と同方向 → OK / (9) 業務別 hook「部署の仕事ごとに選ぶ製品」は、病院の医事 (医療費計算) のような業界固有の部署業務に当てると業務別を選ばせうる (業種別 detail が医療費の計算を業種別の例に挙げる)。引用・challenge の題に該当場面が無いため MEDIUM 要件 (題の場面で誤答肢を選ぶ) は満たさない → L1 建議修 / (10) 該当なし。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | サイバーフィジカルシステム | OK — 引用題なし。現実のデータを集め → 仮想空間で分析 → 現実へ戻す循環、IoT = 収集・AI = 分析の手段 (「よく組み合わされる」「手段の一つ」で閉じない)。flow steps 4 は one・detail と一致。mix 考点 2 件 (結果を現実へ戻すまで含む / IoT はデータ収集の一手段) は一般知識として正しい | OK (points[0] は one の言い直し = jp-review 既出 LOW) | OK | なし (既出 LOW) |
| 2 | CPS | OK — Cyber-Physical System の略、中身はサイバーフィジカルシステムと同じ (別物として教えない、失敗型 (3) OK)。図なし = 略称型 | OK (hook は #1 hook と同じ手がかり = 既出 LOW) | OK | なし (既出 LOW) |
| 3 | デジタルツイン | OK — 現実の対象をデータで仮想空間に写し、センサーで更新し続け、実物を止めずにシミュレーション。CPS との関係は「上位の考え方 / それを形にする手法の**一つ**」(pairs[0].rows[2]・goals[1]・mix 考点) で、CPS を形にする唯一の手段とも、デジタルツインが CPS 外では成り立たないとも言わない → 排他的な区分なし。pairs[0].rows[1]「含む働き」は CPS = 戻すまで / デジタルツイン = 状態把握・シミュレーションと分けるが、fig rows[2].a (双子で確かめた改善を現実の設備へ反映) と矛盾せず (L4 記録)。compare 図 3 行は one・detail と一致 | OK | zh「双胞胎」(技術記述で「孪生体」の方が標準 = loc-review 既出 LOW) | L3 / L4 (記録のみ) |
| 4 | 業務別ソフトウェアパッケージ | OK — 業種を問わず共通する業務 (会計・人事・給与計算) 向けの市販ソフト、短期間・低費用で導入しやすく、合わない部分は業務の進め方の変更かカスタマイズ。分類例 (会計ソフト・給与計算ソフト) は正しく、業種別の例と混ざらない。mix 考点 (パッケージ ≠ スクラッチ開発) は 2009h21h-q076 (別 topic、導入目的 = 開発コスト削減) と整合 | OK | zh「定制开发」の語衝突 L2 | L1 建議修 / L2 建議修 |
| 5 | 業種別ソフトウェアパッケージ | OK — 特定業種に特有の業務向け (病院の診療記録・医療費計算・電子カルテ、建設業の工事原価管理、銀行の勘定系)。いずれも業界固有の処理で業務別との区分は正しい (工事原価管理は「原価管理」一般ではなく工事ごとの原価 = 建設業固有)。「別の業界の会社がそのまま使うのには向かない」は正しい | OK (tree 図は pairs[1] とほぼ重複・例の不揃い = jp-review 既出 LOW) | OK | なし (既出 LOW) |
| 6 | DTP | OK — パソコンで印刷物の版面を作る作業 (とそのソフト)、DeskTop Publishing、P = Publishing。flow steps 4 一致 | OK | OK | L5 記録 |

**単元レベル**: goals 4・overview_cols 2 (種類 / 主な対象)・overview_rows 6・pairs 2 組 (各 3 行 key 1)・key_points 4 (業務別 / 業種別の区別が要点に無い = jp-review 既出 LOW)・summary (記法除去版と一致)・challenge 5 (§1-3)。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 5 (うち 建議修 2)** + 既出 LOW (jp-review r1 / loc-review r1、未修のまま、回帰なし)

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[3].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[3]`) | フックが「部署の仕事ごとに選ぶ製品」だけを手がかりにし、one の判別基準「業種を問わず共通」を落としている。業種別 detail が例に挙げる医療費の計算 (病院の医事部門の仕事) に当てると業務別を選ばせうる (失敗型 (9) の形。引用・challenge 題に該当場面が無いため LOW) | jp「業務別の務は事務・職務の務。経理課や人事課のような部署の仕事ごとに選ぶ製品と、漢字一字から読む。」→「業務別の務は事務・職務の務。経理課や人事課のように、どの業界の会社にもある部署の仕事ごとに選ぶ製品と、漢字一字から読む。」/ zh「从这一个汉字读出：这是按会计科、人事科这类部门的工作来选的产品。」→「从这一个汉字读出：这是按会计科、人事科这类任何行业的公司都有的部门的工作来选的产品。」/ en "That one character tells you the product is chosen by department tasks, like those of an accounting or HR section." → "That one character tells you the product is chosen by department tasks found in companies of every industry, like those of an accounting or HR section." |
| L2 | LOW **建議修** | `terms[3].points[0].text_zh` | スクラッチ開発を「定制开发」と訳し、同単元でカスタマイズを「定制」(detail_zh「追加开发（定制）」・key_points_zh[2]「定制来弥补」) と訳すため、パッケージの手直しと一からの開発が同じ語になる (loc-review r1 既出 LOW、未修) | zh「从零开始制作的定制开发（[[jp:スクラッチ開発]]）」→「从零开始制作的全新开发（[[jp:スクラッチ開発]]）」(jp / en 変更なし) |
| L3 | LOW | `terms[2].analogy_jp/zh/en` | 縮小模型の比喩は mix 考点「一度作って終わる模型とは異なる」の否定側の像だが、比喩 2 文目が「ただし…自動で更新され続ける」と差を明示しており、結論は考点と一致 (D-204 の矛盾には当たらない) | 記録のみ |
| L4 | LOW | `pairs[0].rows[1].b_jp/zh/en` | 「含む働き」でデジタルツインを状態把握・シミュレーションまでとし、現実への反映を CPS 側だけに置く。fig rows[2].a (双子で確かめた改善を現実の設備に反映) とは「反映するのは現実側」の書き分けで矛盾しないが、デジタルツインを現実へのフィードバックを含まないものと読む余地がある。引用題なし | 記録のみ |
| L5 | LOW | `terms[5].one_jp` / `detail_jp` | 版面・組版・版下が未定義 (jp-review r1 既出 LOW)。DTP の中身は正しい | 記録のみ |

**既出 LOW (jp-review r1 / loc-review r1、引き続き未修・記録のみ)**: challenge 5 題が見出し語を問わない (書き手側では直せない) / key_points に業務別・業種別の区別なし / 業種別 tree 図が pairs[1] とほぼ重複・業種別の例が欄ごとに不揃い (one・overview = 銀行・病院、図 = 病院・建設業、pairs = 病院・銀行勘定系) / デジタルツインの呼称「技術」(one) と「手法」(他欄) / CPS points[0] は one の言い直し / CPS hook と サイバーフィジカルシステム hook が同じ手がかり / パッケージ vs 一からの開発の対比 3 箇所 / zh「双胞胎」vs「孪生体」/ fig rows[2].a.zh「反映在…」の直訳調 / goals_zh[2] の直訳調 / tree root.label.en "Ways to classify" で「例」が落ちる。いずれも事実誤り・誤答誘導なし。

**対比の出現欄 (書き方 8)**: ① CPS = 仕組み全体 / デジタルツイン = その中の手法: `pairs[0].rows[0]`・`rows[2]`、デジタルツイン points[1] (mix)、goals[1] は予告 → pairs + mix 考点の 2 箇所 = 許容。② 業務別 = 業務の種類 / 業種別 = 業界の種類: `pairs[1].rows[0]`、各 one (定義そのもの)、各 hook (漢字の手がかり、D-195 §6 の対比で反復に数えない)、tree 図 (既出 LOW) → 許容。③ パッケージ vs スクラッチ: 既出 LOW。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **5** (建議修 2: L1 / L2、記録のみ 3: L3〜L5) + 既出 LOW 11 (記録のみ) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 5 件 (全て mix、qid 引用 0)。全 2900 題に本単元の見出し語を問う題は無く、引用題に照らした排他的区分・限定条件落ち・選択肢なぞりは発生しようがない。CPS / デジタルツインの関係は「手法の一つ」で閉じておらず、業務別 / 業種別の分類例は全て正しい側に置かれている。LOW 建議修 2 件 (L1・L2) は補丁 (B3) で修正推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-14-u03
✓ strategy-05-14-u03 unit: 0 issues (data/ip/textbook/units/strategy-05-14-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-14-u03
✓ strategy-05-14-u03 parity: 29 locations, 0 diff
EXIT=0
```
