# Rule A 全数抽検 — technology-15-40-u01 (コンピュータの5大機能)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S150 b58)、repo HEAD `1cf1dd1e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b58-u01-a1` merge 結果、sha256 先頭 `586b6adf2e0ca9c5`)。
- **対象**: `data/ip/textbook/units/technology-15-40-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (演算 / 制御 / 記憶 / 入力 / 出力) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202、D-203、D-204 / D-205、D-208〜D-210、テンプレートの既知失敗型 (1)〜(10)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-15-40-u01/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` は v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* (演算・制御のみ。記憶・入力・出力は jp-review r1 の LOW [定義の言い換え] を受けて hook なし) / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) は本体から `**` 除去・`[[jp:X]]` → X の変換版であることをスクリプトで確認 (不一致 0。hook の無い 3 用語の `memory_hook_*` は "" でパイプラインの規約どおり)。
2. **考点 × 引用題 (考点 全 6 件 = exam 4 + mix 2、qid 付き 4 件、引用 qid 4 題)** と quiz 枠 (計 7 枠 = 異なり 6 題) + challenge 5 題: `data/ip/quiz/questions.json` の選択肢・`correct_answer` と `translations/<exam>.json` の `stem_jp_clean` を再読 (全題 topic `technology-15-40`)。考点が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないことを 1 件ずつ確認。manifest `term_questions` の未引用題 2011h23tokubetsu-q067 (正答エ = 同構造ならクロック周波数が高いほど速い; 誤答イ = 演算機能は制御機能の一部) も照合: `terms[0].detail_jp` (演算装置は制御装置と合わせて CPU を形づくる) と `pairs[0]` が誤答イを否定し、矛盾なし。
3. **ユニット固有点検 (依頼事項)**:
   - **5 機能の列挙**: `key_points[0]`・`unit_summary`・`goals[0]` の「演算・制御・記憶・入力・出力の 5 つ」は 5 大機能の標準の分類そのもので、閉じた列挙として正しい (落ちなし)。
   - **データ / 制御の流れ図**: 現行の単元には 5 機能間の流れ図は **無い**。v1 で制御に付いていた構成図 (制御装置から他の 4 機能へ矢印) は jp-review r1 の MEDIUM (演算に付け替えられた飾りの図・未定義の「制御」を先に見せる) を受けて r1 で `terms[0].fig = null` になった (解消を確認)。現存の図は 制御 = flow steps 4 (取り出し→解読→実行→次の命令へ) と 記憶 = static table (レジスタ / 主記憶 / 補助記憶 × 位置・速さ・容量) の 2 つ。r1 の 2 件目 MEDIUM (step caption で未定義のプログラムカウンタ・番地を使う) も三語とも caption から消えており解消 (zh「从存储中取出下一条要处理的指令」/ en "Fetch the next instruction to process from storage")。5 機能の流れを描く図の欠如は §0-8 により最大 low で、指摘しない。流れは本文で判定した (下記 2009h21a-q072)。
   - **2009h21a-q072 (challenge、manifest で 5 用語すべてに紐づく)**: 正答ア = 演算機能は制御機能の指示で演算を行う。本文の `terms[0].points[0]`・`pairs[0].rows[2]`・制御 `fig.steps[2].caption`・制御 `one` が三語とも正答を肯定形で述べる。誤答 = イ 演算が制御・入力・出力とデータを受け渡す / ウ 記憶が演算に演算を依頼する / エ 記憶が出力に出力を依頼する。ウ・エは「指示を出すのは制御」(制御 one・pairs[0].rows[2]) で否定できる。イに対しては、入力 analogy (受付 → 奥の作業場)・出力 analogy (作業場 → 受け渡し口) は外 ↔ 内の向きだけを述べ「作業場」はコンピュータ内部一般で演算を名指ししない。出力 `detail` 2 文目「送り出される内容は、演算の結果や記憶に保持されたデータである」は**内容**の説明で経路を言っていないが、「演算の結果」と「記憶のデータ」を並べるため、演算から出力へ直接渡ると読める余地がある (jp-review r2 の LOW と同じ観察)。どの欄も「演算が入力・出力と直接やり取りする」とは言わず、この文を q072 に当てはめてもイを選ぶ根拠にはならない (型 9 に当たらない) → **L1 (LOW 建议修)**。入力 detail「主記憶などへ渡される」は「など」で CPU 内部の記憶 (レジスタ) も含みうる開いた言い方で、事実として正しい。
   - **閉じた列挙 (型 10)**: 記憶の場所 `key_points[3]`「記憶の場所には CPU 内部のレジスタ、主記憶、補助記憶があり」は キャッシュメモリ を含まない閉じた列挙に読める。法令・規格の分類ではなく、引用題・challenge の選択肢 (2021r03-q064 の GPU / SSD / 主記憶 / レジスタ、2011h23tokubetsu-q067 アのキャッシュは別理由で誤り) を誤らせないため型 10 の MEDIUM には当たらない → **L2 (LOW 建议修)**。表 (3 行) は「最も速い = レジスタ」でキャッシュを入れても真。演算 detail の 算術演算 / 論理演算 は「例えば」付きで閉じていない。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 90 本 (派生・summary・source_figures 除く) を topic 内全 26 題の stem_jp_clean + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外) → **0 件**。遮蔽なし → **1 件**: `terms[1].detail_jp` ↔ 2012h24a-q076「アドレスをプログラムカウ」= 見出し級の 2 語 (アドレス・プログラムカウンタ) を「を」で結んだだけの連なりで、表現の写しではない (偽陽性)。近似照合 (14 字窓・編集距離 ≤2) → 同じ 1 件のみ (距離 0)。カタカナの多い文 (制御 detail / points[0]、記憶 points[0]、入力 points[0]) を目視: 2012h24h-q061 正答ア (次に実行する命令が入っている主記憶のアドレスを保持) に対し考点は「これから処理される命令が置かれている主記憶上の位置 (アドレス) を指し示す、CPU 内の記憶場所」、2021r03-q064 の題文 (CPU 内部の高速小容量の記憶回路…) に対し考点は「CPU の中に置かれた記憶場所で、主記憶よりはるかに速く読み書きできるが、保持できる量はごく小さい」、2014h26h-q062 の題文 (CPU とメモリ・入出力装置の間などでデータを受け渡す) に対し考点は「CPU と主記憶や入出力装置を結び、装置どうしでデータをやり取りするための共通の伝送路」 — いずれも標準の定義の言い換えで語順・語彙とも別。
   - (iii) 選択肢なぞり: 4 考点はすべて正答の内容を見出し語の一般定義として述べ、誤答肢の否定・選択肢集合の再現はない (D-209 の分類題・定義題の除外に当たり、選択肢の文言・順序も再現していない)。2012h24a-q076 (穴埋め、正答ウ = a 読込み・b 解読) は、空欄を埋めた題文 (PC 参照 → 命令の読込み → 次のアドレスを PC にセット → 解読 → 実行 → 戻る) と照合: 単元は 取り出し / 解読 / 実行 の標準の 3 段サイクルを述べ (制御 fig・detail・key_points[2])、語は「読込み」ではなく「取り出し」、比較相手 (書込み) は一度も出さない。detail の「命令を取り出すたびにその値を次の命令の位置へ進める」は題の手順 (3) の時期と整合 (矛盾なし)。答え + 比較相手の再現ではない。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文 (2/3/2/2/2 文)、比喩・フック (演算 = 計算係 / 演じる役者、制御 = 指揮者 / 「制」の字、記憶 = 手元のメモ・机・書庫、入力 = 受付、出力 = 受け渡し口) は定義の言い換えでない別の手がかり (r1 LOW の hook 3 件は削除で解消)。定義前使用: 主記憶 = 制御 one・detail で先に出るが総表の記憶行で名前が出ており基礎語 (r1/r2 LOW、記録のみ)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `terms[4].points[0].text_jp`「内から外へ**出る**か」(動詞の通常用法) と `source_figures[0].figure_description`「選択肢」(パイプラインのメタデータで本文に出ない) のみ、いずれも偽陽性。zh・en の grep ヒット (overview_cols_en / pairs label 内 "Example" の exam、analogy_en の always、表セル Very、points の kind "exam") は全て通常の用法。図の型: flow steps 4 / static table 1 / 図なし 3 = 全て登録内。pair 配置: 演算↔制御 は制御の後、入力↔出力 は出力の後、各組 key 行あり。
6. **D-200**: 考点数 1/1/2/1/1 (≤3 ✓)、各 JP 1〜2 文・35〜65 字 (≤100 ✓)。**framing 件数** (`validateV2.ts` の `POINT_FRAMING` 正規表現と全考点の三語を照合): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合): 演算 analogy「何を計算するかは係の外から渡される」・hook「命令を受け取って初めて舞台に立つ」と pairs[0].rows[2]「指示を受けて動く側」・points[0] は一致。制御 analogy「指揮者自身は楽器を鳴らさない」と pairs[0].rows[0] 一致。記憶 analogy (近いほど速いが少ない) と表・key_points[3] 一致。入力 detail「主記憶などへ」と 出力 detail (L1) を除き不整合 0。書き方 8 (対比の出現欄) → 下記、L4。書き方 9 (限定条件) → §2 に考点ごとに記載、落ち 0。D-205 (改訂される文書の構成要素数): 該当なし (5 大機能は規格・法令の改訂対象ではない)。D-210: 該当なし。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・表セル・比較行・caption の三語一致 (parity 24 箇所 0 diff)、`[[jp:…]]` 原語 15 種 (演算 / 制御 / 記憶 / 入力 / 出力 / プログラムカウンタ / 主記憶 / アドレス / レジスタ / 補助記憶 / バス / タッチパネル ほか) を**欄ごと**に照合 → `terms[3].points[0].text_zh / text_en` の `[[jp:入力]]` だけがその欄の jp (「入出力装置」は「入力」を部分文字列に含まない) に無い (単元全体では実在するため validate の jp-origin warn は出ない) → L3。one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり。zh 訳語は `zh_terms.json` に従う (運算器 / 控制器 / 主存储器 / 辅助存储器 / 寄存器 / 程序计数器 / 总线 一致)、唯一の warn は L3 で判定。前回指摘の zh / en 退行 (型 5): r1 の図削除・caption 修正・論理演算の説明修正 (zh「用 AND、OR 等把真假值组合起来」/ en "combine true/false values with AND, OR") は三語とも保持。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 演算 | OK — exam 1 / 1 題: 演算は制御から受けた指示に従って計算・比較を実行する側 (2009h21a-q072 正答ア; 誤答イ〜エを支持しない、§1-3)。one「足し算などの計算や大小の比較」・detail「例えば算術演算・論理演算」は標準事実で正しく、「例えば」で閉じていない。detail「制御装置と合わせて CPU を形づくる」は 2011h23tokubetsu-q067 の誤答イ (演算は制御の一部) を否定 | OK (図なし = 定義型、r1 で飾りの図を削除) | OK (en detail 冒頭の "Computation" は term_en の範囲内、記録のみ) | L4 (対比の反復) / L5 (hook) |
| 2 | 制御 | OK — exam 1 / 1 題: PC は次に処理する命令が置かれた主記憶上の位置 (アドレス) を指す CPU 内の記憶場所 (2012h24h-q061 正答ア; 誤答エ「データのアドレス」・イ「領域の大きさ」・ウ「命令数」を支持しない)。quiz 2012h24a-q076 (正答ウ 読込み・解読) は fig / detail の 取り出し→解読→実行 と整合 (§1-4)。quiz 2021r03-q090 (クロック、正答エ = 命令実行のタイミング調整) は本単元で扱わないが、誤答ウ (次の命令の格納位置を記録) は本単元の PC 考点で否定でき、正答は同 topic の u02 (用語 クロック周波数、同題を引用) が教える | OK (flow steps 4、caption は未定義語なし) | OK (analogy_zh「打出入拍手势」は loc LOW、記録のみ) | なし (quiz q090 は記録のみ、範囲外 O2) |
| 3 | 記憶 | OK — exam 1 / 1 題 + mix 1: レジスタは CPU の中の記憶場所で主記憶よりはるかに速いが量はごく小さい (2021r03-q064 正答エ; 誤答 GPU は記憶でない・SSD は表の補助記憶 = 遅い・主記憶は表で CPU の外 → いずれも本文で区別できる) / mix: 主記憶は実行中のプログラム・データを置き電源断で消える、補助記憶は残る (IT パスポートの水準で正しい)。detail「プログラム内蔵方式」正しい。table (位置・速さ・容量) は points・key_points[3]・analogy と一致 | OK (static table) | OK (detail_zh「存储程序方式」・points[1].text_en "programs and data currently running" は loc LOW、記録のみ) | L2 (key_points[3]) / L4 (対比の反復) |
| 4 | 入力 | OK — exam 1 / 1 題: バスは CPU と主記憶や入出力装置を結び装置どうしでデータをやり取りする共通の伝送路 (2014h26h-q062 正答ア; 誤答 ハブ・ポート・ルータを支持しない)。題文の「など」(CPU とメモリの間や CPU と入出力装置の間など) は考点の「や」「装置どうしで」で範囲が開いたまま保たれ、型 2 に当たらない。考点が入力機能そのものでなくバスである点は r1/r2 LOW (manifest の terms タグ上は正当、記録のみ) | OK | **zh / en の入出力の分割と `[[jp:入力]]` の原語欠如 (L3)** | L3 |
| 5 | 出力 | OK — mix 1: 入力と出力はデータの向き (外→内 / 内→外) で分かれ、タッチパネルのように両方を受け持つ装置もある — 正しい。quiz 2014h26h-q062 (バス) は入力と共用 (r1 LOW、記録のみ)。detail 2 文目は §1-3 の通り L1 | OK | OK | L1 |

**単元レベル**: goals 3 点・overview_cols 2 (受け持つ装置の例 / データの動き)・overview_rows 5 行 (演算・制御・記憶 = 内部、入力 = 外→内、出力 = 内→外)・pairs 2 組 (演算 / 制御 3 行 key 1、入力 / 出力 2 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2009h21a-q072 / 2012h24a-q076 / 2012h24h-q061 / 2014h26h-q062 / 2021r03-q064 — 本文と矛盾なし)。v1 の challenge 3 題 (2010h22a-q057 / 2011h23tokubetsu-q060 = クロック計算、2013h25a-q066 = マルチコア) は u02 の範囲 (クロック周波数・マルチコアプロセッサ) で、外したのは妥当。事実誤りなし、三語一致 (L3 を除く)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 5 (うち 建议修 3)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建议修** | `terms[4](出力).detail_jp / detail_zh / detail_en` 2 文目 (+ 派生 `explanation_*`) | 「送り出される内容は、演算の結果や記憶に保持されたデータである」は内容の説明として正しいが、「演算の結果」と「記憶のデータ」を並べるため演算 → 出力の直接の経路と読める余地がある。challenge 2009h21a-q072 の誤答イ (演算が入力・出力とデータを受け渡す) を支持するとまでは言えない (経路を述べない) ため LOW。単元は 5 機能間のデータの流れ (記憶を介する) をどこにも述べないので、この 1 文で記憶経由を示すと誤答イへの手がかりにもなる | jp before「送り出される内容は、演算の結果や記憶に保持されたデータである。」→ after「送り出される内容は、演算の結果など、記憶に保持されたデータである。」/ zh before「送出的内容是运算结果或存储中保存的数据。」→ after「送出的内容是运算结果等保存在存储中的数据。」/ en before "What they send out is the result of computation or data held in storage." → after "What they send out is data held in storage, such as the results of computation." |
| L2 | LOW **建议修** | `key_points_jp[3] / key_points_zh[3] / key_points_en[3]` (+ 派生 `summary.key_points_*[3]`) | 「記憶の場所には CPU 内部のレジスタ、主記憶、補助記憶があり」はキャッシュメモリを含まない閉じた列挙に読める (型 10 の形だが法令・規格の分類でなく、引用題の選択肢も誤らせないため LOW)。後続単元でキャッシュを学ぶときの食い違いを避ける | jp before「記憶の場所には CPU 内部のレジスタ、主記憶、補助記憶があり、CPU に近いほど速いが容量は小さい。」→ after「記憶の場所には、例えば CPU 内部のレジスタ、主記憶、補助記憶があり、CPU に近いほど速いが容量は小さい。」/ zh before「存储位置包括 CPU 内部的寄存器、主存储器和辅助存储器，离 CPU 越近速度越快，但容量越小。」→ after「存储位置包括 CPU 内部的寄存器、主存储器和辅助存储器等，离 CPU 越近速度越快，但容量越小。」/ en before "Storage locations are the registers inside the CPU, main memory and auxiliary storage; the closer to the CPU, the faster but the smaller." → after "Storage locations include the registers inside the CPU, main memory and auxiliary storage; the closer to the CPU, the faster but the smaller." |
| L3 | LOW **建议修** | `terms[3](入力).points[0].text_zh / text_en` | **merge warn の判定**: `warn zh-term terms[3](入力).points[0].text_zh 入出力 → 输入输出 not in the zh text`。jp「入出力装置」(引用題 2014h26h-q062 の表記) を zh「输入[[jp:入力]]和输出[[jp:出力]]装置」/ en "input ([[jp:入力]]) and output ([[jp:出力]]) devices" と 2 語に分けている。意味は正しく、誤答肢 (ハブ・ポート・ルータ) にも似ないので型 6 ではないが、(a) 訳語表 入出力 → 输入输出 から外れ、(b) `[[jp:入力]]` の原語がこの欄の jp に無い (「入出力」は「入力」を含まない)。loc-review r1 の LOW 修正案が未適用のまま → 適用を推奨。zh の「设备」は同用語 detail_zh「输入设备」と揃う | zh before「总线[[jp:バス]]是连接 CPU 与主存储器[[jp:主記憶]]、输入[[jp:入力]]和输出[[jp:出力]]装置，供各装置之间交换数据的公共传输通路。」→ after「总线[[jp:バス]]是连接 CPU 与主存储器[[jp:主記憶]]、输入输出设备[[jp:入出力装置]]，供各装置之间交换数据的公共传输通路。」/ en before "A bus ([[jp:バス]]) is a shared pathway that links the CPU with main memory ([[jp:主記憶]]) and input ([[jp:入力]]) and output ([[jp:出力]]) devices so the units can exchange data." → after "A bus ([[jp:バス]]) is a shared pathway that links the CPU with main memory ([[jp:主記憶]]) and input/output devices ([[jp:入出力装置]]) so the units can exchange data." (jp は変更なし。after の zh は「输入输出」を含むので warn は消える) |
| L4 | LOW | `terms[0].analogy_* / hook_* / points[0]`、`pairs[0].rows[2]`; `terms[2].points[0]`・`fig`・`analogy_*`、`key_points[3]` | 書き方 8 / D-203 §9: 「演算 = 指示を受ける側 / 制御 = 指示を出す側」が 考点・pairs・比喩・フックの 4 欄、「レジスタ・主記憶・補助記憶の速さと容量」が 考点・表・比喩・要点の 4 欄に出る (r2 LOW と同じ)。比喩・フックはそれぞれ別の像 (計算係・役者 / 手元のメモ) で食い違いなし | 記録のみ |
| L5 | LOW | `terms[0](演算).hook_jp / hook_zh / hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[0]`) | 「台本にあたる**命令**を受け取って」: 本文では命令を取り出して解読するのは制御で、演算が受けるのは制御の**指示** (points[0]・pairs[0].rows[2])。フックの語が「演算が命令を直接受け取る」と読め、欄同士の言葉がずれる (q072 の誤答ウ [記憶が演算に依頼] を選ばせるほどではない)。「演」の語義 (推し広める) と違う字の連想である点は r2 LOW (「結びつける」で連想と示しており記録のみ) | 任意: jp before「「演」は演じるの演。台本にあたる命令を受け取って初めて舞台に立つ役者と結びつける。」→ after「「演」は演じるの演。台本にあたる指示を受け取って初めて舞台に立つ役者と結びつける。」/ zh before「日文「演」是表演的「演」。可以联想到拿到剧本（指令）后才登台的演员。」→ after「日文「演」是表演的「演」。可以联想到拿到剧本（指示）后才登台的演员。」/ en before "The kanji 演 means "to perform", as on a stage: picture an actor who goes on only after receiving the script, which here is the instruction." → after "The kanji 演 means "to perform", as on a stage: picture an actor who goes on only after receiving the script, which here is the direction from control." |

**対比の出現欄 (書き方 8 の列挙)**: ① 演算 = 指示を受ける / 制御 = 指示を出す: `pairs[0].rows[2]`、`terms[0].points[0]`、演算 analogy・hook → L4。② 演算 = 計算・比較 / 制御 = 解読・指示: `pairs[0].rows[0]`、各 one (定義そのもの)、総表 → 許容。③ 入力 = 外→内 / 出力 = 内→外: `pairs[1].rows[0]`、`terms[4].points[0]` (mix)、総表の「データの動き」列 (D-195 §3 の構造)、`goals[2]` は予告 → 許容。④ 主記憶 = 電源断で消える / 補助記憶 = 残る: `terms[2].points[1]` (mix) のみ (r1 LOW の 4 欄反復は表の「電源を切ると」列の削除で解消) → 許容。⑤ 速さ・容量: L4。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。5 機能名の列挙は分類そのもので D-197 の例外に当たる。
- O2 quiz `terms[1].quiz[2]` = 2021r03-q090 (クロック) は本単元で正答を導けないが、誤答ウは PC 考点で否定でき、同 topic の u02 が クロック周波数 で同題を引く (r2 LOW、記録のみ)。`terms[4].quiz` が バスの題 1 題のみである点 (r1 LOW) も記録のみ。
- O3 loc-review r1 の未適用 LOW (zh「存储程序方式」→「存储程序原理」、zh の 装置 / 部件 / 设备 の揺れ、zh「入拍」、en "comparisons of size"、en detail 冒頭 "Computation"、en "programs and data currently running") はいずれも意味を変えない措辞で、記録のみ (L3 のみ訳語表 warn と原語の欠如を伴うため建议修に上げた)。

確認済みで問題なし: 限定条件 (考点 4 件全て保持、2014h26h-q062 の「など」保持)、5 機能の列挙 (落ちなし)、2009h21a-q072 の正答肯定と誤答ウ・エの否定、2012h24a-q076 穴埋め (答え + 比較相手の再現なし)、§9 禁止句 grep (偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤65 字)、写し (validate 0、独立照合は用語の連なり 1 件の偽陽性のみ)、`[[jp:]]` 原語 (L3 以外は欄ごとに実在)、one_zh / one_en の見出し語併記 (5/5)、図種 (flow steps ×1 / static table ×1 / 図なし ×3 = 登録内)、jp-review r1 MEDIUM 2 件の解消と zh / en の非退行、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **5** (建议修 3: L1・L2・L3 / 記録のみ 2: L4・L5、うち L5 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 6 件 (qid 付き 4 件)・引用 4 題 + quiz / challenge / term_questions の未引用 3 題 (2012h24a-q076 / 2021r03-q090 / 2011h23tokubetsu-q067) で、考点の主張は正答と一致し、誤答肢を選ばせる記述・限定条件の落ち・閉じた列挙の落ち (型 10) は無い。merge の zh-term warn は L3 (LOW 建议修) と判定。L1〜L3 は補丁 (B3) で修正推奨、L4・L5 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-40-u01
✓ technology-15-40-u01 unit: 0 issues (data/ip/textbook/units/technology-15-40-u01.json), 1 warning(s)
  warn  zh-term  terms[3](入力).points[0].text_zh  入出力 → 输入输出 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-40-u01
✓ technology-15-40-u01 parity: 24 locations, 0 diff
EXIT=0
```
