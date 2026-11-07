# Rule A 全数抽検 — technology-15-41-u02 (メモリ階層と DRAM 規格・モジュール)

- **Auditor**: `oh-my-claudecode:verifier` (opus)。Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別の agent・別の context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S149 b43)。repo HEAD `bcca0ad3` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b43-u02-a2` の merge 結果、sha256 先頭 `db95e559656a5582`)。
- **対象**: `data/ip/textbook/units/technology-15-41-u02.json` (textbook-unit-v2)。用語 **8 / 8 = 全数** (キャッシュメモリ / 主記憶 / 補助記憶 / DDR3 SDRAM / DDR4 SDRAM / DDR5 SDRAM / DIMM / SO-DIMM) と単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`ruleA_template.md` の既知失敗型 (1)〜(10)。比較対象: `v1-original.json` (用語 8 語、`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち。MEDIUM = 誤解を招く・規則違反・欄同士の不整合。LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid と言い換えのみ)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes・caption・table cell) / quiz` と、単元レベルの全フィールドを三語とも読んだ。図 SVG 2 枚 (`figures/technology-15-41-u02-t01.svg` / `t02.svg`) のラベルも抽出した (v1 から引き継いだ mermaid の描画で、ラベルは jp のみ)。派生フィールド (`definition_* / memory_hook_*`) が本体から記法を除いたものと一致することをスクリプトで確認した (不一致 0)。
2. **考点 × 引用題** (考点は全 10 件 = exam 9 + mix 1、引用 qid は 15 題): 各題の題文 (stem_jp_clean 優先)・選択肢・`correct_answer` を `questions.json` から読み直した (全題 topic `technology-15-41`)。quiz にだけ載る 2013h25h-q070 も確認し、計 16 題。
3. **quiz / challenge_questions**: challenge 5 題 (2017h29h-q092 / 2018h30a-q065 / 2019r01a-q060 / 2011h23a-q079 / 2019h31h-q070) はすべて本文の考点で引用済み。2013h25h-q070 (DVD 装置は複数の種類のメディアを使える。誤答 = CD-ROM が読めない・ノート PC に載らない・磁気で書く) は補助記憶の detail「光ディスク」と矛盾せず、誤答を支持する記述もない。
4. **D-198 写し**: validate の copy guard は 0 件で、`warn choice-echo` 行も出なかった。独立照合として、単元の JP 文字列 104 本 (派生フィールドと summary は除く) を、topic 内全 35 題の題文と選択肢 175 本に対して 12 字連続で照合した (句読点・記号・空白は除去)。照合は **カタカナ 4 字以上と英数を遮蔽する版・遮蔽しない版** の両方で行った。さらに **12 字窓で 1〜2 字が置き換わった近似一致**、および文単位の正規化編集距離・bigram Dice (ed ≤0.5 または Dice ≥0.45 を抽出。HIGH の較正例は ed 0.14 / Dice 0.52) も調べた。
   - 完全一致は 1 件: `terms[1].detail_jp` と 2020r02o-q079 の題文 (本単元では未引用) が「内容が消える揮発性のメモリ」で一致した。これは揮発性の標準的な定義の表現 (D-198「標準的な定義・原則の一般表現は写しではない」) なので偽陽性とした。
   - 近似一致は 7 件で、すべて偽陽性:
     - `goals_jp[0]` / `overview.intro_jp` / `terms[2].detail_jp` と 2019r01a-q060 の題文: 一致しているのは見出し語の連なり「キャッシュメモリ→主記憶→補助記憶」で、用語名は表現ではない。
     - `terms[0].one_jp` / `key_points_jp[0]` と 2017h29a-q067 のイ: 一致は「…は CPU と主記憶の」という短い連なりだけ。
     - `terms[1].one_jp` と 2010h22h-q066 のア: 一致は「読み書きする…メモリ」という一般語だけ。
     - `terms[1].points[0]` と 2017h29a-q067 のウ: 一致は「(不)揮発性のメモリである」という一般語だけ。
     - SIM で抽出された 2015h27a-q100 (表の中の「デスクトップ PC」) と 2014h26h-q065 のア: どれも ed 0.47 以上で、内容も別物。
   - 未引用題の誤答肢も確認した。2017h29a-q067 の誤答イ (フラッシュメモリをキャッシュに使う) とエ (リフレッシュが要るのはフラッシュメモリ) は、本文の「キャッシュ = SRAM、主記憶 = DRAM (リフレッシュ)、SSD = フラッシュメモリ」と食い違わず、本文はどちらも支持しない。2010h22h-q066 は正答アと one が整合している。2020r02o-q079 (揮発性 = DRAM・SRAM) は本文の「DRAM は揮発性」と整合し、SRAM の揮発性については本文で触れていない。
   - カタカナの多い文 (DDR / SDRAM / DIMM / SO-DIMM) は目で確認した。topic 内にこれらを問う題は無い (freq 0〜1、DIMM は 2016h28a-q084 のメモリスロットのみ) ので、写しの元になる題が無い。
5. **D-208 既知失敗型** (§2 の表に用語ごとに記載):
   - (1) option tracing: §2 の表のとおり。
   - (2) 限定条件の落ち: 0。
   - (3) 別名を別物として教えていないか: キャッシュメモリ / キャッシュ、主記憶 / メインメモリ は同じ語として扱っており問題なし。
   - (4) 比喩の範囲: M1。
   - (5) zh / en の回帰: a1 の指摘箇所について zh / en も確認した。§3 の a1 解消表のとおり。
   - (6) zh / en の語の選び方が誤答肢に読めないか: 0。
   - (7) D-210 (改正前の版): 該当なし (法令は扱わない)。
   - (8) 比喩の鍵の語が他の見出し語に当たらないか: 0。
   - (9) フックを題の場面に当てると誤答肢を選ぶか: M1。
   - (10) 閉じた列挙の欠け: 0。補助記憶の detail「HDD や SSD、光ディスクなど」は「など」で開いている。
6. **D-195 / D-200**:
   - 結論が先にあるか: one はすべて 1 文で、太字あり。
   - 定義してから使っているか: SRAM と SO-DIMM の前方使用は L8。
   - 図の型: flow steps ×1 (キャッシュの読出し順)、svg static ×2 (v1 から引き継ぎ: 記憶階層・DIMM)、table static ×1 (DDR3/4/5 の電圧)、図なし ×4。すべて登録内。
   - §9 禁止句の grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が): ヒットは `terms[0].hook_jp` (と、その派生の summary) の「と覚える」1 件だけで、記憶フックの言い方として許容範囲。zh / en (必须 / 考试 / 选项 / must / exam / important / choice) のヒットは、`kind:"exam"` と通常の用法の偽陽性だけ。
   - **D-200**: 考点数は 3/2/3/0/0/0/2/0 (≤3 ✓)。各 JP は 1〜2 文・43〜74 字 (≤100 ✓、最大は `terms[6].points[1]` mix の 74 字)。
   - **framing 件数** (validateV2 `pointFraming` を全考点に実行): jp 0 / zh 0 / en 0。
7. **D-202 / 三語**:
   - `[[jp:]]` の原語は 16 種 (キャッシュメモリ / 主記憶 / 1 次キャッシュ [図ラベル] / アクセス時間 / リフレッシュ / 揮発性 / アドレス / 補助記憶 / 記憶階層 / レジスタ / フラッシュメモリ / 磁気ディスク / ランダムアクセス / メモリモジュール / マザーボード / メモリスロット) で、すべて jp 本文に実在する。
   - one_zh / one_en の見出し語の併記: 漢字・かなを含む 3 語は 3/3 で併記あり。DDR3/4/5 SDRAM・DIMM・SO-DIMM は、三語とも同じ表記なので validateV2 の D-202 除外 (かな・漢字を含まない見出し語) に当たり、N/A。
   - zh の訳語は `zh_terms.json` のとおり (高速缓存 / 主存储器 / 辅助存储器 / 闪存 / 服务器 / DIMM・SO-DIMM の括弧注)。validate の B6 warn / jp-origin warn は 0。
8. **D-205 (規格の数値)**: `terms[5].fig` の表「標準の電源電圧」DDR3 1.5V / DDR4 1.2V / DDR5 1.1V を一次情報で確認した。
   - DDR3 1.5V: JEDEC の DDR3 標準公開告知 (2007) が key feature に「1.5V power supply」を挙げている (https://www.jedec.org/news/pressreleases/publication-jedec-ddr3-sdram-standard)。1.35V の DDR3L (JESD79-3-1) と 1.25V の DDR3U (JESD79-3-2) は追補 (addendum) で、本体の 1.5V を置き換えるものではない (https://www.jedec.org/news/pressreleases/jedec-publishes-widely-anticipated-ddr3l-low-voltage-memory-standard)。
   - DDR4 1.2V: JEDEC のモジュール仕様の名称が「288-Pin, 1.2 V (VDD) … DDR4 SDRAM Unbuffered DIMM」(https://www.jedec.org/standards-documents/docs/module4_20_26)。
   - DDR5 1.1V: JEDEC の DDR5 公開告知 (2020) が、DDR4 比で Vdd が 1.2V から 1.1V に下がったと述べている (https://www.jedec.org/news/pressreleases/jedec-publishes-new-ddr5-standard-advancing-next-generation-high-performance)。本文は検索結果の抜粋で確認した (ページ本体は 403)。
   - 公称電圧は本体規格の改訂 (JESD79-3F / 4D / 5D) を通じて変わっておらず、列見出しの「標準の」が低電圧版を除く限定になっている。したがって版の明記は不要と判断した。
   - DDR5 の「電源を管理する回路をモジュールの上に載せる」は「など」付きの構成の例示で、数や構成の言い切りではない (D-205 の対象外)。内容は DDR5 モジュールの PMIC 搭載という公知の事実と一致する。
   - 端子数は「異なる」と述べるだけで、具体的な数は書いていない。
9. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件、D-208) | D-195 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | キャッシュメモリ | **考点 3 件とも事実は正しい**。<br>**考点 1** (目的 = CPU が主記憶を待つ時間を平均として短く見せ、処理効率を上げる。容量は主記憶より小さい): 2009h21h-q069 正答ウ (見かけ上の短縮) / 2015h27h-q052 正答ウ / 2017h29h-q092 正答イ (実効アクセス時間) と一致する。2 文目は q092 の誤答ア (主記憶以上の大きさ) の否定にも読めるが、one の「小容量」と同じ標準的な定義を正の形で述べたもので、4 肢の組・順序は再現していない (D-209 により (iii) ではない) → L9。<br>**考点 2** (1 次 → 2 次 → 主記憶の順に探す): 2014h26h-q065 正答ウ / 2018h30a-q065 正答ウ と一致する。正答肢の内容を一般的な仕組みとして述べたもので、誤答 (1 次のほうが低速・用途別・1 次のほうが大容量・全データが事前に存在) は支持しない。<br>**考点 3** (素子は DRAM より速い SRAM。主記憶とその下の層よりアクセス時間が短い): 2019r01a-q060 正答ウ (SRAM / DRAM / SSD の組) / 2019h31h-q070 正答ウ と一致する。組合せ題を見出し語の一般的な定義 (素子の区別) として述べており、補助記憶 = SSD の組までは再現していないので D-209 の除外に当たる。<br>**比喩**: 調味料を人が選んで脇に並べておく静的な配置で、q092 の誤答エ (利用者が指定して常駐させる) に読める → **M1**。 | 考点は 2/2/2 文、61〜64 字 | OK | **M1**、L7、L8、L9 |
| 2 | 主記憶 | **OK**。<br>**考点 1** (主に DRAM、リフレッシュで保持、揮発性): 2009h21a-q083 正答イ (主記憶に利用。誤答ウ「停電しても保持」を否定するが、揮発性という標準的な定義の正の記述) / 2018h30h-q076 正答ア (定期的な再書込み + 主記憶。考点では順序が逆で、文言の 12 字一致もない) と一致する。<br>**考点 2** (アドレスを指定して取り出す): 2012h24h-q078 正答ア と一致する。分類題 (どれか) の答えを見出し語の仕組みとして述べたもの (D-209)。a1 の M1 (ハイバネーション / スタンバイの穴埋め題をなぞった考点) は削除済み。 | OK | one_en「data currently running」L5 | L5、L7 |
| 3 | 補助記憶 | **OK**。<br>**考点 1** (CPU に近い層ほど速く、補助記憶が最も遅い、レジスタが最上位): 2011h23a-q079 正答ウ (レジスタ → 主記憶 → 補助記憶) と一致する。並べ替え題の答えを、階層の一般原理として述べている。<br>**考点 2** (SSD = フラッシュメモリに記録し、電気的に読み書きし、媒体を回転させる仕組みを持たない): 2016h28h-q072 正答エ と一致する。題文の特徴の組 (機械的な可動部分が無い + 電力消費も少ない) のうち、消費電力は落とし、可動部分は記録の仕組み (回転させる機構を持たない) という定義の側から言い換えている。組・順序・「〜も少ない」の形は再現していない → a1-r2 の M1 は解消。<br>**考点 3** (HDD は磁気ディスクを回し、ヘッドを直接動かしてランダムアクセスできる): 2012h24h-q063 正答エ と一致する。誤答 (CD-ROM より遅い・主記憶としても使う・保持に電力が要る) は支持しない。<br>**hook**「メモリ 16GB / ストレージ 512GB」は例示で、「ことが多い」の限定もある。 | OK | OK | L6、L7 |
| 4 | DDR3 SDRAM | **OK** (引用題なし)。one は「DDR 方式の SDRAM の系列の第 3 世代」で、a1 の M2 は解消 (DDR → DDR2 → DDR3 で第 3 世代、事実どおり)。detail の SDRAM = クロック同期、DDR = 立ち上がり・立ち下がりの両方で転送 (1 周期 2 回) も正しい。比喩 (メトロノームのカチ・コチ) は D-204 と矛盾しない。 | OK | OK | L10 (hook) |
| 5 | DDR4 SDRAM | **OK** (引用題なし)。one は系列内の第 4 世代 (a1 の M2 は解消)。detail の「転送速度が上がり、電圧を下げた。端子数・ノッチ位置が異なり、DDR3 のスロットに差せない」は正しい (DIMM で 240 ピンに対し 288 ピン。本文は数を書いていない)。 | OK | OK | なし |
| 6 | DDR5 SDRAM | **OK** (引用題なし)。one は系列内の第 5 世代 (a1 の M2 は解消)。table 1.5 / 1.2 / 1.1V は一次情報と一致し (§1-8)、DDR3 行の「DDR2 の後継」も正しい。 | OK | `rows[2].cells[2].zh` で「さらに」が落ちている (L1) | L1 |
| 7 | DIMM | **OK**。<br>**考点 1** (メモリモジュールはマザーボード上のメモリスロットに差して装着する): 2016h28a-q084 正答エ と一致する。分類題の答えを装着の仕組みとして述べたもので、誤答 (PC カードスロット・フラッシュメモリ・メモリインタリーブ) には触れない。<br>**考点 2** (mix: DDR 番号 = DRAM の世代、DIMM / SO-DIMM = 外形の規格で、別の軸): 正しい。a1-r2 の L (「名前が大きさを表す」) は「外形の規格」に直してあり、解消。<br>**名前の由来・SIMM の hook** (表と裏の端子が同じ信号) も正しい。 | OK | OK | L8、L10 |
| 8 | SO-DIMM | **OK** (引用題なし)。Small Outline の意味、基板が短く端子数が DIMM と異なるのでデスクトップ用 DIMM スロットに差せない、は正しい (DDR4 では 260 ピン / 288 ピン)。 | OK | detail_en「limited room inside」で意味がずれている (L2) | L2 |

**単元レベル**:
- goals 3 点、overview_cols 2、overview_rows 8 行。
- pairs 2 組: 主記憶 / 補助記憶 は 4 行 (key 1)、DIMM / SO-DIMM は 2 行 (key 1)。a1-r2 の L (「載せる DRAM」が両側同じ行) は削除済み。
- key_points 5 点。a1 の L (補助記憶・DIMM が要点に無い) は、key_points[1] (補助記憶) と [4] (メモリモジュール) で解消。
- summary は記法を除いた版と一致する。challenge 5 題は本文と矛盾しない。
- **D-205**: §1-8 のとおり。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 10 (うち建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[0].analogy_jp` / `analogy_zh` / `analogy_en` | 比喩「よく使う調味料だけをコンロの脇に並べ、残りは奥の棚にしまっておく」は、使う本人が「よく使うもの」を選んで固定の場所に置き続ける像になっている。引用題であり challenge でもある 2017h29h-q092 の誤答エ (ヒット率を上げるため、よく使うプログラムを **利用者が指定して常駐** させる) に、この比喩を当てるとエが正しく見える (既知失敗型 (9))。detail は、ヒット率と LRU による自動の入れ替え (使っていないものから追い出す) を述べており、比喩の「選んで常駐させる」はこれと合わない (D-204 / 観点 7)。jp・zh・en とも同じ像。 | jp「台所で、使った調味料はそのままコンロの脇に残り、脇が埋まると、いちばん長く使っていないものから奥の棚へ戻していくようなもの。」<br>zh「就像在厨房里，用过的调料就留在灶台旁；灶台旁放满时，就把最久没用的调料先放回里面的柜子。」<br>en "Like a kitchen where any seasoning you just used stays next to the stove, and when that space fills up, the one left unused the longest goes back to the shelf at the back." |
| L1 | LOW **建議修** | `terms[5].fig.data.rows[2].cells[2].zh`、`overview_rows[5].extra_zh[1]` | jp「DDR4 よりさらに高速・低電圧」の「さらに」(en は Even) が zh で落ちており、DDR4 行の「比 DDR3 更快、电压更低」と同じ形になっている (loc-review の L が未反映)。 | zh「比 DDR4 更快、电压更低」→「比 DDR4 进一步提速、电压更低」(2 か所とも) |
| L2 | LOW **建議修** | `terms[7].detail_en` | jp「設置場所の限られる小型のデスクトップ PC」(置く場所が限られる) が、en では「machines with limited room inside」(筐体内部の余裕) に意味がずれている (loc-review の L が未反映)。 | en "It also appears in small desktop PCs and other machines with limited room inside." → "It also appears in small desktop PCs and other machines meant for places with limited space." |
| L3 | LOW | `overview_rows[6].extra_zh[1]`、`overview_rows[7].extra_zh[1]`、`terms[6].detail_zh`、`terms[7].one_zh`、`terms[7].detail_zh`、`pairs[1].rows[1].a_zh` / `b_zh` | 「台式 PC」「笔记本 PC」は日本語のデスクトップ PC・ノート PC をそのまま写した言い方 (zh_terms の PC 表記には合う)。 | 記録のみ (任意で 台式机 / 笔记本电脑 に統一) |
| L4 | LOW | `goals_zh[0]` | 「从靠近 CPU 的一侧起 高速缓存→…→辅助存储器 的顺序」に jp の空白区切りが残っている。 | 記録のみ |
| L5 | LOW | `terms[1].one_en` | 「holds the programs and data currently running」で、data も running にかかって読める。 | 記録のみ (任意で "holds the programs being run and their data") |
| L6 | LOW | `goals_jp[0]` / `overview.intro_jp`、`title_jp` | 「CPU に近い側から キャッシュメモリ→主記憶→補助記憶」は見出し語の順序であり、階層の最上位を述べてはいないが、`terms[2].detail` の「レジスタが最上位」と並べると一番上がキャッシュに読める。title は「メモリ階層」、本文は「記憶階層」で呼び方がそろっていない。 | 記録のみ |
| L7 | LOW | `terms[0].points[1]` と `terms[0].fig.steps[1..3]`、`terms[1].points[0..1]` と `terms[1].detail_jp`、`terms[2].points[0]` と `terms[2].detail_jp` 2〜3 文目 | 考点が同じ用語の detail / 図の caption の言い直しになっている (D-203 §9)。事実は引用題の正答と一致している。 | 記録のみ |
| L8 | LOW | `terms[0].points[2]` (SRAM)、`terms[6].points[1]` / `terms[6].fig` (SO-DIMM) | SRAM は本単元で定義されない (前提単元 u01 で扱う)。SO-DIMM は terms[7] で定義される前に使われている (総表には先に出る)。 | 記録のみ |
| L9 | LOW | `terms[0].points[0].text_jp` 2 文目 | 「容量は主記憶より小さい」は 2017h29h-q092 の誤答アの打ち消しにも読める。ただし、one と同じ標準的な定義を正の形で述べたもので、肢の組・順序の再現はない (D-209 により (iii) ではない)。 | 記録のみ |
| L10 | LOW | `terms[3].hook_*`、`terms[6].hook_*` / `analogy_*`、`terms[1].fig` (t01.svg) | hook の「Double は 1 拍で 2 回」と「Dual は両面」は detail の名前の由来と同じ手がかりで、DIMM の比喩 (カートリッジ) は one に近い (D-203 §6)。t01 はレジスタの無い階層図 (中速・中容量) で、主記憶の one / detail には階層の説明が無い。SVG 2 枚は v1 から引き継いだもので、ラベルは jp のみ。 | 記録のみ |

**a1 / a2 の指摘の解消確認**:

| 指摘 | 解消状況 |
|---|---|
| a1-r1 M1 (穴埋め題 2011h23tokubetsu-q069 をなぞった考点) | 主記憶の考点 3 を削除し、同題の引用も消えている。`source_figures[0]` には同題が残っているが、v1-original と同一の継承データで、UI の components / app では描画していない (grep で確認)。 |
| a1-r1 M2 (「DRAM 規格の第 n 世代」) | terms[3..5].one と overview_rows[3..5].one_line を、jp / zh / en とも「DDR 方式の SDRAM の系列」の中の世代に限定してある。 |
| a1-r2 M1 (SSD の 2 特徴の組) | §2 #3 のとおり解消。 |
| a1 / a2 の LOW | 未反映のものは L6〜L10 に記録した。 |
| a2 loc-review の LOW 5 件 | すべて未反映で、L1〜L5 として記録した。 |

**対比の出現欄 (書き方 8 の列挙)**:
1. 揮発 / 不揮発: `pairs[0].rows[0]` (key) と `terms[1].detail_jp` 3 文目 (両側) の 2 か所。考点・one・overview は片側か定義そのもの → 許容。
2. 速さ・容量: `pairs[0].rows[1..2]`、`terms[2].detail_jp` (階層全体の原理)、`key_points[1]` (補助記憶の片側) → 許容。
3. DDR 世代の速さ・電圧: `terms[4].detail`、`terms[5].detail`、`terms[5].fig`、overview の extra、`key_points[3]`。2 項の対比ではなく世代の進み方の記述 → 許容。
4. DIMM / SO-DIMM: `pairs[1]` と `terms[7].detail_jp` (端子数・差せない)。one は定義、overview は構造 → 許容。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **10** (建議修 2: L1・L2 / 記録のみ 8: L3〜L10) |

## 5. 判定

**FAIL (REVISE)**。D-199 の基準 (HIGH 0 かつ MEDIUM 0) を満たさない。原因は MEDIUM 1 件 (M1: キャッシュの比喩が、引用題かつ challenge の 2017h29h-q092 の誤答エに読める) で、文字列の置き換え 1 フィールド × 三語で直せる。M1 の補丁 (B3) を当て、検証を再実行すれば HIGH 0 / MEDIUM 0 になる見込み。

全 8 用語・考点 10 件・引用 15 題 + quiz のみの 1 題では、考点の主張は正答と一致し、誤答肢を支持する考点は無い。引用題の限定条件の落ち、D-198 の写し、D-205 の版の問題も無い。a1 の MEDIUM 3 件はすべて解消し、zh / en にも回帰は無い。L1・L2 は同じ補丁での修正を推奨し、L3〜L10 はバッチ証拠の「未修 LOW」表へ回す。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-41-u02
✓ technology-15-41-u02 unit: 0 issues (data/ip/textbook/units/technology-15-41-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-41-u02
✓ technology-15-41-u02 parity: 32 locations, 0 diff
EXIT=0
```
