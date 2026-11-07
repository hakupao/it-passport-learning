# Rule A 全数抽検 — technology-15-40-u02 (プロセッサの種類と性能)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser / jp-review / loc-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 照合スクリプトは scratchpad)。
- **Date**: 2026-11-08 (b58、attempt **a3** = D-207 停止規則後の再試行)、repo HEAD `1cf1dd1e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b58-u02-a3` merge 結果 [jp.r0 + loc.r1]、sha256 先頭 `34c28683be0aefc1`)。
- **対象**: `data/ip/textbook/units/technology-15-40-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (CPU / マルチコアプロセッサ / GPU / GPGPU / クロック周波数) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202 / D-203、D-204 / D-205、D-207〜D-210 (テンプレート既知失敗型 (1)〜(10))、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/technology-15-40-u02/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)、前回不合格 `failures/phase5/stage_07_ui/phase3/batch/technology-15-40-u02_attempt_1.md` / `_attempt_2.md`、a3 の journal (`journal.b58-u02-a3.jsonl`)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (flow node label・step caption・table cell・svg のテキスト) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)、`summary.*` / `overview.intro_*` も本体と一致。
2. **考点 × 引用題 (考点 全 11 件 = exam 10 + mix 1、qid 付き 10 件、引用 qid 異なり 20 題)**: `data/ip/quiz/questions.json` から題文 (translations の `stem_jp_clean`)・選択肢・`correct_answer` を再読 (全題 topic `technology-15-40`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題の限定条件を外していないことを 1 件ずつ確認。
3. **計算題・数値例の再計算** (全件一致):
   - 2010h22a-q057: 2 GHz → 1 クロック 0.5 ns、× 5 クロック = **2.5 ns** → 正答ウ。考点 `terms[4].points[0]` の「クロック数 ÷ 周波数」= 5 ÷ (2×10⁹) = 2.5×10⁻⁹ s で同じ。
   - 2011h23tokubetsu-q060: 1.6 GHz ÷ 4 クロック = 0.4×10⁹ = **4 億回** → 正答ウ。考点の「周波数 ÷ クロック数」で同じ。
   - `terms[4].detail_*` の例: 4 GHz → 0.25 ns × 8 クロック = **2 ns**、1 s ÷ 2 ns = **5 億回** (zh 5 亿次 / en 500 million) — 正しい。引用題の数値 (2 GHz・5 クロック / 1.6 GHz・4 クロック) を使わない自作例。
   - `terms[4].fig` (table): 1 GHz → 10 億回・1 ns、4 GHz → 40 億回・0.25 ns — 正しい (三語の数値一致)。`overview_rows[4]` / `pairs[1].rows[1]` / `key_points[3]` の「1 GHz = 毎秒 10 億回」も正しい (2019h31h-q097 正答アと一致)。
   - MIPS / CPI を直接扱う題は引用・quiz・challenge に無い (2016h28a-q058 誤答アの「1 秒に何十億回の命令」は指標の名前の誤答肢で、単元は MIPS を述べない)。
4. **quiz / challenge_questions** (quiz 計 13 枠 + challenge 5 題、うち本文で未引用 2 題): 2020r02o-q065 (表示用の画像処理チップで AI の計算にも使われる = GPU; 誤答 AR / DVI / MPEG) は GPGPU の one・mix 考点 (GPU = 装置、GPGPU = その使い方) と整合し、「GPGPU」を答えさせる方向には読めない。2021r03-q064 (CPU 内の高速小容量の記憶回路 = レジスタ; 誤答に GPU) は CPU detail「小さな記憶回路 (レジスタ)」で解ける。challenge 2016h28a-q060 (正答イ = コア数の定義; 誤答ア 周波数に反比例 / ウ スレッド数は小さいほど速い / エ 二次キャッシュの方がコアに近い) は クロック points[1]「周波数が高いほど速い」と矛盾せず、誤答を支持する記述なし。
5. **D-198 写し**: validate の copy guard / choice-echo = 0 件 (warn は zh-term 4 件のみ)。独立照合として単元の JP 文字列 93 本 (派生フィールド・summary・overview.intro 除く) を topic 内全 26 題の題文 (clean) + 選択肢と 12 字連続照合 — **カタカナ 4 字以上・英数を □ 遮蔽 (実字 6 未満の窓は除外) で 0 件、遮蔽なしでも 0 件**。近似照合 (文単位の最良窓 Levenshtein 比 ≤0.40 または bigram Dice ≥0.40; 較正 HIGH 例 = ed 0.14 / Dice 0.52) の自動ヒットは 1 件 (`terms[0].points[1]` ↔ 2018h30h-q074 項目 a、ed 0.69 / Dice 0.42 = 全項目判定題の正しい項目 a の内容を一般的な定義で述べたもので D-209 除外; 限定「理論上」保持)。正答肢・題文と同じ内容を述べる考点を個別に測った値 (全て ed ≥0.36、HIGH 較正値から遠い) は §2 と L6 / L1 / L2 に記載。カタカナの多い文 (マルチコア / マルチスレッド / ターボブースト / デュアル・クアッド) は目視で照合。
6. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文、定義前使用 (主記憶 = CPU one、レジスタ・プログラムカウンタ = CPU detail、コア = マルチコア one、スレッド = マルチコア detail (a2 #2 の指摘点、§4)、クロック信号・Hz = クロック one; キャッシュメモリは detail で名前のみ → O4)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が; zh 考试 / 必须 / 重要 / 一定要 / 常考 / 记住 / 选项; en exam / must / important / always / remember / option) → ヒットは全て通常の用法で偽陽性: jp「覚えておく」×2 (`terms[0].detail_jp` = プログラムカウンタが番地を保持する意味、`terms[0].analogy_jp` = しおりが行を保持)、zh「记住」×2 (同じ 2 欄)、en `terms[0].detail_en` "remembers the address"、`terms[1].detail_en` "does not always raise"、`terms[4].detail_en` "For **exam**ple"、`pairs[1].rows[2].a_en` "Work that must run in order"。図の型 (CPU = flow steps 4、マルチコア・GPGPU = svg static [v1 図を保持、validate の compat 条件を満たす]、クロック = static table、GPU = 図なし; 全て登録内)。pair 配置 (CPU / GPU は GPU の後、マルチコア / クロックはクロックの後、各組 key 行あり)。
7. **D-200**: 考点数 3/3/1/1/3 (≤3 ✓)、各 JP 文数 1〜2・字数 49〜79 (≤100 ✓、最大はマルチコア `points[2]` の 79 字)。**framing 件数** (`validateV2.pointFraming` を全考点に適用): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」「専門」の照合) → L1 (無駄なく) / L3 (専門に担う)、他の不整合 0。書き方 8 (対比の出現欄の列挙) → §3 末尾、L7。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 比喩・フックが定義の言い換えになっている欄なし。§9 言い直し → L7。
9. **D-205 / D-210 / 型 (10)**: 改訂される文書 (規格・法令・指針・知識体系) の構成要素の数・名前は本単元に出ない → N/A。法令改正前の文言で問う引用題なし → N/A。法令・規格の区分の閉じた列挙なし → N/A。
10. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 10 種 (プログラムカウンタ / 主記憶 / 互換CPU / マルチコアプロセッサ / デュアルコア / クアッドコア / スレッド / マルチスレッド / クロック周波数 / ターボブースト) が jp 本文に実在 (スクリプト、全 ok)。one_zh / one_en の見出し語 `[[jp:]]` はマルチコアプロセッサ・クロック周波数の 2 用語にあり、CPU / GPU / GPGPU の 3 用語は見出し語がラテン文字で三語同一表記のため併記不要 (validate 0 issues)。zh 訳語は `zh_terms.json` に従う (CPU（中央处理器）/ GPU（图形处理器）/ GPGPU（通用图形处理器）/ 多核处理器 / 时钟频率 / 主存储器（内存）/ 操作系统（OS）/ 高速缓存 / 机器学习)。**ビット → 比特 の warn ×4** は §3 O1 で判定。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | CPU | OK — exam 3 / 5 題: 取り出し → 解読 → 実行の繰り返し、次の命令の番地はプログラムカウンタが保持 (2012h24a-q076 穴埋め正答ウ = 読込み・解読: 考点は正答の語を標準の流れとして述べ、比較相手の「書込み」と組にしない → (iii) の穴埋め型に当たらない / 2012h24h-q061 正答ア: 誤答エ「データの番地」を支持しない) / 64 ビットは 32 ビットよりデータ幅が広く、番地で指定できる上限も理論上大きい (2018h30h-q074 正答ア = a のみ、限定「理論上」保持; 誤答 b・c [32 ビット OS 不可 / USB が 2 倍速] に触れない / 2022r04-q081 正答ア) / 互換 CPU = 同じ命令体系の別製品で元の OS・アプリが動く (2015h27h-q051 正答ア; 誤答イ〜エの場面を再現しない)。flow steps 4 は one・detail と一致 (q076 の手順のうち PC 更新段は図で「次の番地確認へ戻る」に含めた標準形) | OK | OK | なし |
| 2 | マルチコアプロセッサ | OK — exam 3 / 5 題: 各コアに異なる仕事を割り当て並行に進め、全体の処理量を増やす (2013h25a-q066 正答エ / 2014h26a-q053 正答ア / 2017h29h-q057 正答エ; 誤答 = 同じ処理を重ねて信頼性向上・4 倍の能力・一時的な周波数上昇・OS 不要・コア数だけに依存 を全て支持しない。detail「性能の伸びはコア数に比例するとは限らない」は q066 イを否定する一般事実で、誤答肢の場面の再演ではない) / コア数 = 中核部分の数、2 = デュアル・4 = クアッド (2016h28a-q060 正答イ; 正答肢の「など」は考点が「2 個なら…4 個なら…」で範囲を閉じないので落ちに当たらない) / マルチスレッドの定義と複数コアとの結び付き (2015h27h-q065 正答ウ; §4 で要素照合) | OK (L1・L2 は措辞級) | en "all of the cores" は L1 で同時修正 | L1 (建議修), L2 (建議修), L7 |
| 3 | GPU | OK — exam 1 / 3 題: 描画の計算を担うプロセッサで、速さは多数のコアの並行処理から (2016h28a-q058 正答エ / 2025r07-q067 正答イ / 2019r01a-q095 正答イ = GPU・画像; 穴埋めの比較相手 [暗号化・VGA] を述べない)。a1 #2 / a2 #2 の写し型は解消 (§4)。analogy (壁画の作業班) は detail の「単純なコアを多数」と同じ像で、引用題に無い場面 | OK | OK | L3 (建議修), L7, L9 |
| 4 | GPGPU | OK — mix 1 (qid なし): GPU = 装置そのもの、GPGPU = その使い方の技術 — 正しく、quiz 2020r02o-q065 (正答 GPU) を GPGPU 側へ誘わない (むしろ区別を補う)。detail「機械学習の学習処理や科学技術計算」「General-Purpose computing on GPU の略」は正しい。a1 #3 (q065 の題文 2 要素を同順でなぞった考点) は考点自体が mix に置き換わり解消 | OK | term_zh は v1 不変量 (O3) | なし |
| 5 | クロック周波数 | OK — exam 3 / 8 題: 1 命令の時間 = クロック数 ÷ 周波数、1 秒の回数 = 周波数 ÷ クロック数 (2010h22a-q057 / 2011h23tokubetsu-q060、再計算一致 §1-3) / クロックは命令実行のタイミングをそろえる信号、1 GHz = 毎秒 10 億回、同じ構造なら周波数が高いほど速い (2021r03-q090 正答エ; 誤答イ「間隔が短いほど時間が掛かる」は analogy「間隔が短いほど多くこげる」が否定 / 2019h31h-q097 正答ア / 2011h23tokubetsu-q067 正答エ / 2017h29a-q075 正答ウ; 限定「同じ構造の CPU どうしなら」保持) / 同じ種類なら周波数を上げるほど発熱が増え放熱対策が要る、ターボブースト = 発熱・消費電力に余裕があるときだけ一時的に周波数を上げる (2015h27a-q063 正答イ、限定「同じ種類の」保持 / 2018h30a-q095 正答イ; 「だけ」「一時的に」は正答肢より強いが技術の実際どおりで正答と矛盾しない → L6)。table 再計算一致 | OK | OK | L6, L7 |

**単元レベル**: goals 3 点・overview_cols 2 (分類 / 性能・用途の手がかり)・overview_rows 5 行・pairs 2 組 (CPU / GPU 3 行 key 1、マルチコア / クロック 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2016h28a-q060 / 2021r03-q064 / 2017h29a-q075 / 2015h27a-q063 / 2018h30a-q095 — 本文と矛盾なし、§1-4)。pairs[1].rows[2] (順番にしか進められない処理は分けられない / 上げるほど発熱と消費電力が増える) は マルチコア detail・クロック points[2] と一致。事実誤りなし。

## 3. 前回指摘の解消確認・指定 2 箇所の照合

### 3-1. a1 / a2 / a3 の HIGH・MEDIUM の解消 (回帰なし)

| 回 | 指摘 | 現状 | 判定 |
|---|---|---|---|
| a1 jp#1 medium | `terms[1].analogy_jp` 後半「1 人の客の会計そのものが速くなるわけではない」が detail / points[2] と食い違う | 当該文を削除。現 analogy は「並んだ客をそれぞれ別のレジで同時に会計できる」のみで、1 つのプログラムを分ける話 (points[2]) を否定しない。zh / en も同文 | 解消 |
| a1 jp#1 medium / a2 jp#2 medium | GPU 考点が 2019r01a-q095 の題文の流れ (CPU 内蔵 → 高度な処理 → 拡張ボード)、および 3 題 (q095 題文「画像処理用に開発された」/ q067 題文の 3 次元画像・動画の 2 特徴 / q058 正答エ「CPU に代わって高速に実行」) の記述を同組・同順でなぞる | §3-2 | 解消 |
| a1 jp#2 medium | GPGPU 考点が 2020r02o-q065 題文の 2 要素 (表示画面の画像処理チップ / AI の膨大な計算) を同順で言い直す | GPGPU の考点は mix「GPU = 装置、GPGPU = 技術」に置換、q065 の 2 要素の組を述べる考点は無い | 解消 |
| a2 jp#1 medium | マルチスレッド考点が 2015h27h-q065 題文の 5 要素を同順でなぞる | §3-2 (4 要素は残る → L1 建議修) | MEDIUM としては解消 |
| a2 jp#2 medium | マルチスレッド考点の「スレッド」が未定義、見出し語とのつながりが無い | `terms[1].detail_jp` 2 文目で「プログラムの中で実行される一続きの処理の流れの単位を **スレッド** という」と定義、考点に「分けたスレッドを別々のコアが受け持つ」を追加 | 解消 |
| a3 loc#1 medium | zh で instruction を「命令」と訳す | zh 全体で「命令」0 件、「指令」に統一 (取指令 / 指令译码 / 指令集) | 解消 |

### 3-2. 指定 2 箇所 (D-207 停止規則の対象)

**(a) GPU 考点 `terms[2].points[0].text_jp`**: 現文「GPU は描画のための計算を専門に担うプロセッサで、その速さは多数のコアによる並行処理から生まれる。」

| a1 / a2 でなぞった要素 (題側は言い換え) | 現文 | 判定 |
|---|---|---|
| q095 題文: (GPU は) 画像の処理用に開発されたプロセッサ (a2:「…専門に受け持つために作られたプロセッサ」) | 「描画のための計算を専門に担うプロセッサ」— 「開発された / 作られた」は消え、q095 の穴埋めの答 (GPU・画像) を比較相手 (暗号化・VGA) と組にしない | 定義の一般表現 (ed 0.74 / Dice 0.26) |
| q095 題文後半の流れ: CPU 内蔵 → 高度な処理 → 拡張ボード (a1) | なし | 解消 |
| q067 題文: 3 次元画像処理の高速化・動画をなめらかに の 2 特徴の組 (a2:「立体画像や動画」) | なし (考点から削除) | 解消 (one_jp 側の同じ組は L9) |
| q058 正答エ: CPU に代わって高速に実行 (a2:「CPU に代わって高速にこなす」) | なし (ed 0.94 / Dice 0.05) | 解消 |
| — | 「速さは多数のコアによる並行処理から生まれる」= どの引用題にも無い単元自身の事実 | 新しい事実 |

→ (iii) なし。残るのは a3 jp-review も挙げた「専門に担う」が「専ら描画だけ」とも読め、GPGPU (画像以外にも使う) と q065 (AI の計算にも使われる) と緊張する点のみ → **L3 (LOW 建議修)**。

**(b) マルチスレッド考点 `terms[1].points[2].text_jp`**: 現文「1 つのプログラムを複数のスレッドに分けて並行に進める方式を **マルチスレッド** といい、分けたスレッドを別々のコアが受け持つことで、複数のコアを無駄なく働かせられる。」

| 2015h27h-q065 題文の要素 (言い換え・題の順) | a2 (不合格) | a3 現文 | 判定 |
|---|---|---|---|
| ① 1 つのアプリケーションの中で | 1 つのアプリケーションの中で | 1 つのプログラムを | 定義の必須要素 |
| ② 並列処理が可能な部分を | 並行に動かせる部分を | **なし** | 題特有の要素は削除 |
| ③ 複数の処理単位に分け | 複数のスレッドに分けて | 複数のスレッドに分けて | 定義の必須要素 (スレッドは detail で定義済) |
| ④ 並行して処理する | 同時に処理する | 並行に進める | 定義の必須要素 |
| ⑤ マルチコアの処理能力の有効活用を図る | 複数のコアを生かす手段 | 分けたスレッドを別々のコアが受け持つことで、複数のコアを無駄なく働かせられる | 結び付きの仕組み (別々のコアが受け持つ) は単元自身の語。末尾「無駄なく働かせられる」は ⑤ の言い換えとして残る |

→ ① ③ ④ は見出し語の最小の定義 (分類題 = どれが X か; D-209 の除外)、⑤ の前半は a2 #2 が求めた見出し語とのつながりを単元の語で述べたもので、語句 (処理単位 → スレッド、有効活用 → 無駄なく働かせる) も一致しない (ed 0.89 / Dice 0.22)。a2 の 5 要素同順の写しには当たらないと判断する。ただし末尾「無駄なく働かせられる」は (i) 題の結び (有効活用) を残す唯一の要素で、(ii) 同じ用語の detail「順番にしか進められない部分があるため…比例するとは限らない」・pairs[1].rows[2] よりやや強く、en "all of the cores are kept busy" / zh「让多个核都不闲着」はさらに「全部が常に働く」と読める (2013h25a-q066 誤答イ「4 倍の能力」側へ寄る余地) → 末尾を削って仕組みだけを述べる **L1 (LOW 建議修)**。

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 5)** + 範囲外観察 5

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (各欄内の文字列置換、構造変更なし) |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1](マルチコアプロセッサ).points[2].text_jp` / `text_zh` / `text_en` | §3-2 (b)。末尾「複数のコアを無駄なく働かせられる」が 2015h27h-q065 題文の結び (有効活用) を残す唯一の要素で、detail の「比例するとは限らない」より強い (en "all of the cores are kept busy" / zh「都不闲着」はさらに強い)。書き方 7 の措辞級 + (iii) の残り香 | jp「分けたスレッドを別々のコアが受け持つことで、複数のコアを無駄なく働かせられる。」→「分けたスレッドは別々のコアが同時に受け持てる。」/ zh「让不同的核分别承担分出的线程，就能让多个核都不闲着。」→「分出的线程可以由不同的核同时承担。」/ en "When separate cores take on the separate threads, all of the cores are kept busy." → "Separate cores can then take on the separate threads at the same time." |
| L2 | LOW **建議修** | `terms[1](マルチコアプロセッサ).points[1].text_jp` / `text_zh` / `text_en` | 「演算を担う中核部分の数」が 2016h28a-q060 正答イの「演算処理を担う中核部分の数」から 2 字 (処理) を抜いただけの近似一致 (11 字の句; 12 字窓には届かず、文全体は ed 0.51 / Dice 0.44 で HIGH 較正から遠い)。正答の定義を述べる考点なので写しの重大度には当たらないが、同じ用語の one_jp は「命令を処理する中核部分」で、欄同士の言い方もずれる | jp「コア数はプロセッサ内で演算を担う中核部分の数で、」→「コア数はプロセッサ内で命令を処理する中核部分の数で、」/ zh「核数是处理器内负责运算的核心部分的数量，」→「核数是处理器内负责处理指令的核心部分的数量，」/ en "the number of central parts that do the computing inside a processor" → "the number of central parts that process instructions inside a processor" |
| L3 | LOW **建議修** | `terms[2](GPU).points[0].text_jp` / `text_zh` / `text_en` | 「描画のための計算を専門に担う」(zh 专门负责 / en dedicated to) は「専ら描画だけ」とも読め、GPGPU (画像以外の汎用計算) と quiz 2020r02o-q065 (AI の計算にも使われる) と緊張する (a3 jp-review low と同旨、観点 7 の措辞級)。pairs[0].rows[0] の見出し「得意な処理」に揃える | jp「描画のための計算を専門に担うプロセッサで、」→「描画のための計算を得意とするプロセッサで、」/ zh「GPU 是专门负责绘图计算的处理器，」→「GPU 是擅长绘图计算的处理器，」/ en "The GPU is a processor dedicated to the calculations for drawing," → "The GPU is a processor that excels at the calculations for drawing," |
| L4 | LOW **建議修** | `overview_rows[0].one_line_zh` | 「解読」の訳が総表だけ「解读」、本文 (one_zh・図ラベル・caption・key_points) は「译码」。CPU の段階名としては「译码」が標準 (a3 loc-review r2 low、未適用) | 「解读并执行指令、控制其他部件的核心部件」→「译码并执行指令、控制其他部件的核心部件」 |
| L5 | LOW **建議修** | `overview_rows[2].one_line_en` | "needed for drawing all at once" は all at once が drawing に掛かるとも読める (jp の「一斉に」は「処理する」に掛かる; a3 loc-review r2 low、未適用) | "A graphics unit that processes the mass of calculations needed for drawing all at once" → "A graphics unit that processes, all at once, the mass of calculations needed for drawing" |
| L6 | LOW | `terms[4](クロック周波数).points[1].text_jp` / `points[2].text_jp` | 正答肢と同じ内容を述べる考点の近似値: points[1] 1 文目前半 ↔ 2021r03-q090 正答エ (ed 0.36 / **Dice 0.60** = 単元内最大)、points[1]「同じ構造の CPU どうしなら…」↔ 2011h23tokubetsu-q067 正答エ (ed 0.46 / Dice 0.47)、points[2] 1 文目 ↔ 2015h27a-q063 正答イ (同種 CPU → 周波数を上げる → 発熱 → 放熱 の 4 要素同順、ed 0.50 / Dice 0.41)、ターボブースト文 ↔ 2018h30a-q095 正答イ (ed 0.56 / Dice 0.53)。いずれも誤答肢・判定項目の組・題の場面や数値を写さず、正答の内容を見出し語の一般的な定義・性質として述べたもの (「そろえる」は one_jp「歩調をそろえる」の語)。限定条件 (同じ構造 / 同じ種類) は保持が必要で保持している。ed は全て HIGH 較正値 0.14 から遠い。ターボブーストの「だけ」「一時的に」は正答肢より強い限定だが技術の実際どおりで正答と矛盾しない | 記録のみ (q063 の 4 要素は正答の因果そのもので、順を崩すと因果が読みにくくなる。§3-2 (b) の ⑤ のような題特有の結びは含まない) |
| L7 | LOW | `terms[1].points[1]`、`terms[2].points[0]`、`terms[4].points[0]`、「1 GHz = 毎秒 10 億回」の 6 欄 | D-203 §9 の言い直し / 書き方 8 の反復: コア 2 = デュアル・4 = クアッド が detail・points[1]・hook・pairs[1].rows[1] の 4 欄、GPU 考点が one の言い直し (新事実は「速さは多数のコアの並行処理から」のみ)、1 命令の時間の式が detail・points[0]・key_points[3]、「1 GHz = 毎秒 10 億回」が overview_rows[4]・fig・points[1]・pairs[1].rows[1]・hook・key_points[3] (a3 jp-review low 2 件と同旨)。事実は全て正しい | 記録のみ (計算題の単元で式・換算の反復は学習上の害が小さい) |
| L8 | LOW | `overview_rows[0..2].extra_zh[0]`、`terms[1].hook_zh`、`terms[2].one_zh` | a3 loc-review r2 の未適用 low: 分類列「装置」が本文の「部件 / 硬件」と揃わない、hook_zh に `[[jp:]]` なしのカタカナ (日语的デュアル（dual）…)、one_zh で「大量」が 1 文に 2 回 | 記録のみ (誤読の害なし) |
| L9 | LOW | `terms[2](GPU).one_jp` | 「立体画像の描画や動画の表示」が 2025r07-q067 題文の 2 特徴 (3 次元画像処理・動画) と同じ組・同じ順。考点ではなく one (定義) で、v1 から続く GPU の標準的な定義の言い方 (IPA の正答肢でも 3 次元グラフィックスが代表例; ed 0.85 / Dice 0.16)。a1・a2・a3 の 6 審査とも指摘なし | 記録のみ (定義の一般表現。考点からは a2 #2 の指摘どおり削除済み) |

**対比の出現欄 (書き方 8 の列挙)**: ① CPU = 少数の高機能コアで幅広い処理 / GPU = 多数の単純コアで同形の計算を一斉に: `pairs[0].rows[0..2]`、`overview_rows[2].extra` (pairs[0].rows[1].b と同文)、`terms[2].detail` (CPU から引き受け、CPU は制御に専念)、`goals[1]` (観点の予告) → pairs + detail の 2 箇所で許容 (GPU の定義の中核)。② マルチコア = 同時に進める数を増やす / クロック = 1 つを速く: `pairs[1].rows[0]`、`goals[1]` (予告のみ) → 許容。③ 伸ばすときの壁: `pairs[1].rows[2]` と各用語の detail / points[2] の片側ずつ → 許容。④ GPU = 装置 / GPGPU = 技術: `terms[3].points[0]` (mix)、`overview_rows[2..3].extra[0]` (分類列 = D-195 §3 の構造) → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- **O1 zh「位」/「比特」(validate warn zh-term ビット → 比特 ×4)**: jp の「ビット」4 箇所 (`goals_jp[0]`「32 ビット・64 ビット」、`overview_rows[0].extra_jp[1]`「ビット数」、`terms[0].detail_jp`「32 ビット CPU・64 ビット CPU」、`terms[0].points[1].text_jp`「64 ビット CPU は 32 ビット CPU より」) は全て CPU のビット幅の意味で、zh は 4 箇所とも「32 位 / 64 位 / 位数」と一貫して訳す。中国語で CPU のビット幅は「32 位 CPU」「64 位」が標準 (「32 比特 CPU」とは言わない)。単元内に「比特」は 0 件、データ量の単位としての「ビット」は本単元に出ない。訳語表の「比特」はデータ量の単位の意味で、`zh_terms.unit.json` の注 (「その語の専門の意味で使われるときだけ使う」) にも沿う → **訳は正しく一貫、warn は偽陽性** (a3 loc-review r1・r2 とも同判定)。補丁なし。
- O2 `terms[1].fig` / `terms[3].fig` は v1 の mermaid SVG (jp のみのラベル「並列処理で性能向上」「GPU(画像処理特化)」等) を保持。本文の「並行」と表記が揺れるが内容は矛盾しない (validate の svg compat 条件を満たす)。
- O3 `terms[3].term_zh`「GPGPU（通用图形处理器）」は装置名に読めるが v1 不変量・訳語表どおりで、one_zh「指的是一种技术」で打ち消している (a3 loc-review r2 low と同旨)。訳語表側の検討事項。
- O4 `terms[4].detail_jp` の「キャッシュメモリ」は性能要素の名前として出るのみで定義なし (前提単元・別単元の用語; a3 jp-review low)。
- O5 独立 copy 照合は 12 字窓 0 件 (遮蔽あり・なしとも)、近似照合の自動ヒット 1 件 (2018h30h-q074 項目 a、全項目判定題の正しい項目の一般表現 = D-209 除外)。

確認済みで問題なし: 限定条件 (考点 10 件全て保持、§2)、計算題 2 題・数値例 (detail 例・table・換算) の再計算一致、§9 禁止句 grep (定型締め句 0、ヒットは全て通常用法)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤79 字)、図の文字列の写し (validate 0、独立照合 0)、`[[jp:]]` 原語 (10 種全て jp 本文に実在)、zh 訳語表 (ビット warn は O1 の偽陽性のみ)、図種 (flow steps ×1 / svg static ×2 / static table ×1 / 図なし ×1 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、a1〜a3 の MEDIUM 7 件の解消 (§3-1)。

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 5: L1〜L5 / 記録のみ 4: L6〜L9) |

## 6. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 11 件 (qid 付き 10 件)・引用 20 題 + 未引用の quiz / challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。計算題 2 題と数値例は全て再計算で一致。D-207 停止の原因となった GPU 考点 (a1 #1・a2 #2) とマルチスレッド考点 (a2 #1・#2) はいずれも題文の写し型が解消している。マルチスレッド考点の末尾に q065 の結びが 1 要素残るため L1 として削除を推奨、L1〜L5 は補丁 (B3) で修正推奨、L6〜L9 はバッチ証拠の「未修 LOW」表へ。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-40-u02
✓ technology-15-40-u02 unit: 0 issues (data/ip/textbook/units/technology-15-40-u02.json), 4 warning(s)
  warn  zh-term  goals_zh[0]  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  overview_rows[0].extra_zh[1]  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](CPU).detail_zh  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](CPU).points[1].text_zh  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-40-u02
✓ technology-15-40-u02 parity: 26 locations, 0 diff
EXIT=0
```
