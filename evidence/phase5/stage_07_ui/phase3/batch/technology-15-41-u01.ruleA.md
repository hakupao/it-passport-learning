# Rule A 全数抽検 — technology-15-41-u01 (半導体メモリの基礎 — RAM・ROMと揮発性)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S149 b43)、repo HEAD `bcca0ad3` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b43-u01-a1` merge 結果、git diff +604/−138、sha256 先頭 `8c55e627e1c79be0`)。
- **対象**: `data/ip/textbook/units/technology-15-41-u01.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (RAM / ROM / 揮発性メモリ / 不揮発性メモリ / フラッシュメモリ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205 (S138 §2・§6)、D-208 / D-209 / D-210 と S147 追加の失敗型 (8)〜(10)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-15-41-u01/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。先行審査: `journal.b43-u01-a1.jsonl` (jp-review r1 REVISE [MEDIUM 2] → r2 PASS [LOW 6]、loc-review r1 PASS [LOW 5])。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (tree の label) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`、`summary.key_points_* / memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`overview.intro_*` は goals の記法除去版で一致。
2. **考点 × 引用題 (考点 全 10 件 = exam 8 + mix 2、qid 付き 8 件、引用 qid 延べ 17 = 異なり 13 題)**: `data/ip/quiz/questions.json` から各題の題文 (`translations/<exam>.json` の `stem_jp_clean`)・選択肢・`correct_answer` を再読 (全題 topic `technology-15-41`)。考点が正答と一致し、誤答肢を支持せず、支持のない一般化・限定をせず、限定条件を落としていないことを 1 件ずつ確認 (§2 表)。
3. **quiz / challenge_questions** (quiz 計 11 枠 = 異なり 9 題、うち本文未引用 2 題 = 2010h22h-q081 / 2017h29a-q067; challenge 4 題 = 2018h30h-q076 / 2024r06-q056 / 2012h24a-q061 / 2022r04-q084、全て考点で引用済み): 本文と矛盾しないことを確認。2010h22h-q081 (フラッシュは保持に電力不要; 誤答 = 一度だけ書込み・小型化困難・レーザ光) は不揮発性 detail と flash one で解ける。2017h29a-q067 (フラッシュ = 電気的に書換え可能な不揮発性メモリ; 誤答 = 紫外線消去・キャッシュ向き・リフレッシュ要) は flash one・SRAM 考点・DRAM detail で区別でき、どの誤答も支持しない。2018h30h-q076 (正答 = DRAM は再書込みが要り主記憶; 誤答 = ROM がキャッシュ・SRAM が不揮発で USB メモリ・フラッシュは利用者が変更不可) は RAM detail・SRAM 考点・揮発性考点・ROM mix 考点と整合。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 行 0。独立照合: 単元の JP 文字列 88 本 (派生除く) を topic 内全 35 題の題文 + 選択肢 (175 本) と 12 字連続照合 — **カタカナ 4 字以上・英数遮蔽あり 0 件 / 遮蔽なし 0 件**。近似照合 (14 字窓 × 編集距離 ≤2) → **1 件**: `terms[0].detail_jp` 3 文目 (キャッシュメモリの定義) ↔ 2017h29a-q067 誤答イ、窓「CPUと主記憶の速度差を埋め」↔「CPUと主記憶の性能差を埋め」(窓 ed 2/14 = 0.14、文全体 ed 0.82 / Dice 0.49; キャッシュの題 2010h22h-q066・2017h29h-q092 とは 12 字一致なし)。キャッシュメモリの標準的な定義の定型句で、引用題でもない flash 題の誤答肢 (キャッシュの説明自体は正しく、フラッシュではない点で誤り) の文言をなぞったものではない → D-198「標準的な定義の一般表現」= 偽陽性 (L5)。文全体 Dice 0.4 以上の上位 (pairs[1].rows[2].b_jp ↔ 2013h25h-q063 エ 0.67 ほか) は見出し語の連なりで表現ではない (§3 L6)。カタカナの多い文 (flash points[0]・pairs 例の行・tree label) は目視でも題文・選択肢の言い回しの借用なし。`terms[4].points[1]` 末尾「書込み回数の上限がある」は 2009h21a-q057 正答アと 9 字一致 (12 字ガード未満) — SSD の標準的な留意点の一般表現で写しではない。
5. **D-208 失敗型の個別確認**: (1) option tracing → §3 L6・L7 (いずれも (iii) に当たらない、引用付き)。(2) 引用題の「など」等の限定語 — 該当題に「など」なし; 比較の限定「HDD と比較して」は L1。(3) 別名を別物として教える — なし (VRAM = グラフィックスメモリは括弧で同一物として示す)。(4) 比喩・図の範囲 — tree は root を「半導体メモリ」と明示しており、不揮発性 points[0] の「半導体に限らない」と矛盾しない (部分集合の図)。(5) zh / en の回帰 — r1 の MEDIUM 2 件の修正が三語とも反映 (下記 9)。(6) zh / en の語が誤答肢寄り — なし。(7) D-210 — 法令・規格の改正前文言の題なし。(8) 比喩の鍵語が他見出し語の語幹 — RAM の「作業机」・ROM の「本」・風船・ノート・鉛筆ノートはいずれも他見出し語と衝突しない。(9) hook を引用題 / challenge に当てて誤答を選ぶか — RAM hook (Random Access = どの番地にもほぼ同時間) と ROM hook (Only = 読むだけ、RAM の R は Random) を 2018h30h-q076 / 2009h21a-q083 / 2024r06-q056 に当てても誤答に導かない。名前に RAM / ROM を含む光ディスク (DVD-RAM・CD-ROM) が 2024r06-q056・2025r07-q075・2012h24a-q061 の誤答肢にあるが、どの hook も「名前に RAM が付けば揮発性」の形をとらず、各題は本文 (DRAM は揮発性 / SSD・USBメモリは半導体) だけで一意に解ける → 範囲外観察 O2。(10) 法的・規格上の区分の閉じた列挙 — なし (例はすべて「や / など / 例」の開いた列挙)。
6. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文 (3/2/2/2/2 文)、比喩・フックが定義の言い換えでないこと (語源 [Random Access・Read Only・揮発・不+揮発・カメラのフラッシュ] で別の手がかり)、定義前使用 (主記憶・DRAM・SRAM・リフレッシュ・キャッシュメモリ = RAM detail で定義後に考点で使用; EEPROM = 「など」の例名; SSD / HDD は名前のみ → L8)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 決めつけ → `覚え` 1 件 [不揮発性 hook「字の組み立てで覚えられる」+ 派生 2]、`とされる` 1 件 [flash hook の名前の由来の伝聞、+ 派生 2]、`決めつけ` 1 件 [ROM mix 考点「『ROM = 一切書けない』と決めつけない」]、`freq_badge`「標準」のみ。いずれも定型締め句ではない: 「覚えられる」は 5 フック中 1 件、「とされる」は由来が伝聞であることの正しい留保 (東芝の命名の逸話)、「決めつけない」は誤解の否定で framing 判定 0。zh / en の grep [记住 1・Examples / example 内の exam・detail_en の must] は通常の用法で偽陽性)。図の型: 不揮発性メモリ = tree static ×1、他 4 用語 = 図なし (全て登録内; r0 の図 3 → r1 で RAM 比較図と flash SVG を削除)。pair 配置: RAM / ROM は ROM の後、揮発性 / 不揮発性 は不揮発性の後、各組 key 行あり。
7. **D-200**: 考点数 3/2/2/1/2 (≤3 ✓)、各 JP 1〜2 文・36〜83 字 (≤100 ✓、最大は ROM `points[1]` 83 字 2 文)。**framing 件数** (validateV2 `pointFraming` を直接呼び出し、全考点): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ない」の照合: ROM one / overview / pairs[0].rows[0] の「原則として」と ROM mix 考点「一切書けないと決めつけない」が一致; 揮発性 mix 考点「書き換えとは別の軸」と overview_rows[2..3].extra[2]「この軸では問わない」が一致; tree の「揮発性 (RAM)」は L3; pairs[0].rows[2].b「変えないデータ」は L2) → MEDIUM 級の不整合 0。書き方 8 → 下記 §3 の列挙。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0 (L1 は比較の明示化)。§6 → フック・比喩とも定義の言い換えなし。§9 言い直し → r1 LOW の flash 考点 3・要点 4 は r1 で削除済み、残りは L 項目なし。
9. **先行審査の解消確認**: jp-review r1 MEDIUM ① `terms[1].hook_jp` (A→O の 1 文字入れ替え記法) → 現 hook は「Only の 1 語が読むだけ、RAM の R は Random で別の語」で三語とも修正済み、回帰なし ✓。② `terms[0].fig` (主記憶・キャッシュを定義前に使う比較図) → `terms[0].fig = null` で削除 ✓。r1 LOW の要点不足 (揮発性の要点) → key_points[0] に RAM の揮発性を追加 ✓、flash SVG の SD カード → 図削除 ✓。r2 LOW のうち tree の枝名 (L3)・SSD/HDD 未定義 (L8)・ROM quiz (L9)・ノート比喩 (L10) は未修。loc-review LOW 5 件は全件未修 (L4・L11)。
10. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、tree label・総表・対比表の三語一致 (parity 22 箇所 0 diff)、`[[jp:…]]` 原語 13 種 (主記憶 / リフレッシュ / キャッシュメモリ / グラフィックスメモリ / 不揮発性 / フラッシュメモリ / 揮発性メモリ / 揮発 / 揮発性 / 不揮発性メモリ / 磁気ディスク / 光ディスク / USBメモリ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` = 3 / 5 (揮発性メモリ / 不揮発性メモリ / フラッシュメモリ はあり; RAM / ROM は英字見出しで三語同綴り = 不要、OJT / CEO / CNN の前例どおり)、zh 訳語が `zh_terms.unit.json` に従うこと (validate の B6 warn 0 / jp-origin warn 0; 主存储器（内存） / 高速缓存 / 闪存 / U 盘（USB 闪存盘） / 易失性存储器 / 非易失性存储器 一致; SSD・HDD は zh 本文で略称のみ → L8)。
11. **D-205**: 本単元は規格・法令・知識体系の構成要素の数、媒体容量、インタフェース規格の数値を一切述べない (数値は「1 語」のみ、列挙はすべて「や / など / 例」の開いた形)。**D-205 該当箇所なし、数値引用なし → 一次資料照合は不要**。技術事実 (DRAM のリフレッシュと 1 素子構造、SRAM の高速・高価、VRAM、EEPROM 系統のフラッシュ、ブロック単位の消去、書込み回数の上限、名前の由来の逸話) は IT パスポートの水準で正しい。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | RAM | OK — exam 3 / 5 題: DRAM は構造が単純・安価・大容量で主記憶 (2009h21a-q083 正答イ 主記憶; 誤答ア「SRAM より高速」は points[1] が否定、ウ「電源断でも保持」は揮発性考点が否定、エ「読出し専用」は one が否定 / 2018h30h-q076 正答ア 再書込み要・主記憶 = detail のリフレッシュ + 本考点) / SRAM は DRAM より高速・容量単価が高くキャッシュ (2019r01a-q060 正答ウ キャッシュ SRAM・主記憶 DRAM・補助 SSD、本考点 + points[0] で一意) / 画面表示専用メモリ = VRAM (グラフィックスメモリ) (2026r08-q061 正答イ VRAM / 2013h25a-q053 正答エ グラフィックスメモリ; 別名を括弧で同一物と示す)。hook「Random Access = どの番地にもほぼ同じ時間、名前に読み書きの語はない」は正しい | OK (図なし; r1 で比較図削除) | VRAM zh 訳 L4 | L4, L5 |
| 2 | ROM | OK — exam 1 / 2 題: ROM は不揮発性 (2013h25h-q063 正答エ ROM とフラッシュ / 2020r02o-q079 正答イ ①③ = ROM は揮発性でない) / mix: ROM 系統にも電気的に消去・書き直せる種類 (EEPROM など) があり、フラッシュもこの系統、「一切書けない」と決めつけない — 正しく、2018h30h-q076 誤答エ (フラッシュは利用者が変更不可) と 2010h22h-q081 誤答ア (一度だけ書込み) を支持しない。「電気的に」と限定しており 2017h29a-q067 誤答ア (紫外線消去) も支持しない。限定条件「原則として」は one・overview・pairs で保持 | OK | detail_zh 語順 L11 | L9 |
| 3 | 揮発性メモリ | OK — exam 1 / 3 題 + mix 1: DRAM も SRAM も RAM の一種で揮発性 (2020r02o-q079 正答イ ①③ / 2024r06-q056 正答イ DRAM / 2013h25h-q063 = 揮発の 2 つを除くと正答エ) / mix: 揮発性は「電源断後に残るか」の軸で「書き換えられるか」とは別 — 2018h30h-q076 誤答ウ (SRAM は不揮発) を否定。detail「停電で未保存の作業データが消える」は one の帰結で正しい | OK | OK | L6 |
| 4 | 不揮発性メモリ | OK — exam 1 / 1 題: 不揮発性は半導体に限らず、磁気ディスク・光ディスクも不揮発性の媒体 (2012h24a-q058 正答ウ ②DVD・④磁気ディスク・⑤フラッシュ; 考点は DVD を「光ディスク」に一般化し、フラッシュは detail で補完)。tree (半導体メモリ → 揮発性: DRAM・SRAM / 不揮発性: ROM・フラッシュ) は detail・各 one と一致 (root を「半導体メモリ」と明示しているため考点の「半導体に限らない」と矛盾しない)。quiz 2010h22h-q081 は detail で解ける | OK (tree static) | OK | L3, L6, L10 |
| 5 | フラッシュメモリ | OK — exam 2 / 4 題: SSD・USBメモリの記憶素子はフラッシュ、SSD は可動部品がなく衝撃に強く消費電力も小さい (2012h24a-q061 正答エ USB メモリ / 2025r07-q075 正答ウ c RAM・d SSD・e USB メモリ [RAM は RAM one の「半導体メモリ」で補完] / 2022r04-q084 正答エ SSD; 題の比較「HDD と比較して」は「HDD のような可動部品をもたないので」で比較対象を保持するが、結論が絶対表現 → L1) / 書き換えのたびに素子が劣化し SSD に書込み回数の上限 (2009h21a-q057 正答ア; 誤答ウ「振動・衝撃に弱い」は points[0] が否定)。detail「ブロック単位で消去してから書き直す」・hook (カメラのフラッシュの逸話、「とされる」で留保) は正しい | OK | detail_en「fixed units」L11 | L1, L7, L8 |

**単元レベル**: goals 3・overview_cols 3 (分類の軸 / 電源を切ると / 書き換え)・overview_rows 5・pairs 2 組 (RAM / ROM 3 行 key 1、揮発性 / 不揮発性 3 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge 4 題 (§1-3、本文と矛盾なし)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 11 (うち 建議修 4: L1〜L4)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[4].points[0].text_jp/zh/en` (2 文目) | 2022r04-q084 は「HDD と比較して」低消費電力・耐衝撃と言うが、考点の結論は「衝撃に強く消費電力も小さい」と絶対表現 (比較対象 HDD は理由節に残るので限定条件落ちには当たらない; ただし高性能 SSD は絶対値で HDD 並み以上の電力を使うこともあり、比較を明示する方が正確) | jp「衝撃に強く消費電力も小さい。」→「HDD より衝撃に強く消費電力も小さい。」/ zh「因此抗冲击，功耗也小。」→「因此比 HDD 更抗冲击，功耗也更小。」/ en "so it resists shock and uses little power." → "so it resists shock better and uses less power than an HDD." (jp 76 字、D-200 内) |
| L2 | LOW **建議修** | `pairs[0].rows[2].b_jp/zh/en` | 「起動用プログラムなど変えないデータ」は ROM detail「めったに変えないデータ」・key_points[1]「書き換えの少ないデータ」・ROM mix 考点 (書き換えられる種類もある) より強い言い切り (観点 7 の措辞級; 行 0 の「原則として」があるため誤学習には至らない) | jp「起動用プログラムなど変えないデータ」→「起動用プログラムなどめったに変えないデータ」/ zh「启动用程序等不变更的数据」→「启动用程序等很少变更的数据」/ en "Data that does not change, such as startup programs" → "Rarely changed data, such as startup programs" |
| L3 | LOW **建議修** | `terms[3].fig.data.root.children[0].label.jp/zh/en` | tree の揮発性の枝を「揮発性 (RAM)」と書き、書き換えの軸の名前 (RAM) を揮発性の軸の枝名に使う。揮発性 mix 考点「書き換えとは別の軸」と並べると軸が混ざって読め、不揮発性側は ROM とフラッシュを兄弟に置くため ROM mix 考点「フラッシュも ROM の系統」とも揃わない (jp-review r2 LOW の未修; よくある簡略化で事実誤りではない → 前例 [23-63-u06 L1 呼び名の食い違い] どおり LOW)。子節点 DRAM・SRAM が RAM の 2 種であることは RAM detail で既に定義済み | jp「揮発性 (RAM)」→「揮発性」/ zh「易失性（RAM）」→「易失性」/ en "Volatile (RAM)" → "Volatile" |
| L4 | LOW **建議修** | `overview_rows[1].extra_en[2]`、`pairs[1].rows[1].label_zh`、`terms[0].points[2].text_zh` | loc-review r1 LOW の未修 3 件: 表セル "Not, in principle" が不自然 / 見出し「保持存储所需的电力」と値「需要 / 不需要」が重なる / VRAM の zh が quiz 訳層 (2013h25a-q053 エ「图形存储器（显存）」) の通称「显存」を欠く | en "Not, in principle" → "In principle, no" / zh「保持存储所需的电力」→「保持存储是否需要电力」/ zh「（图形存储器，[[jp:グラフィックスメモリ]]）」→「（图形存储器，即显存，[[jp:グラフィックスメモリ]]）」 |
| L5 | LOW | `terms[0].detail_jp` 3 文目 | 近似照合 1 件: 2017h29a-q067 誤答イと 14 字窓 ed 2 (「速度差」↔「性能差」)、文全体 ed 0.82 / Dice 0.49 (HIGH 較正 ed 0.14 / Dice 0.52 は文単位で、本件は窓単位のみ)。キャッシュメモリの標準定義の定型句、引用題ではない flash 題の誤答肢で、内容もその誤答 (フラッシュ = キャッシュ向き) を支持しない | 記録のみ |
| L6 | LOW | `terms[2].points[0].text_jp`、`pairs[1].rows[2].a_jp/b_jp`、`terms[3].points[0].text_jp` | D-198 (iii) 確認: ① 揮発性考点「DRAM も SRAM も RAM の一種であり、どちらも揮発性」は 2020r02o-q079 の正答の組 {①DRAM・③SRAM} と 2013h25h-q063 誤答ア「DRAM と SRAM」の 2 語・同順。ただし RAM の 2 種 (RAM detail で定義) がどちらも揮発性という見出し語の一般的な分類で (D-209 分類型の免除)、題の他の判断項目 (ROM・SSD) も ①〜④ の並びも再現しない。② pairs 例の行「DRAM、SRAM」/「ROM、フラッシュメモリ、磁気ディスク」は 2012h24a-q058 の判断項目 {①DRAM・③SRAM・④磁気ディスク・⑤フラッシュメモリ} のうち 4 つを含み、b の先頭 2 語は 2013h25h-q063 正答エと同じ並び (Dice 0.67) だが、ROM を加え DVD を欠き、題の ①〜⑤ の順でもない — 各分類の標準例の見出し語の連なり (23-63-u06 goals_jp[1] の前例)。③ 不揮発性考点は 2012h24a-q058 の DVD を「光ディスク」に一般化し、組を再現しない | 記録のみ (任意: ① の qids から 2013h25h-q063 を外すと、この題は ROM points[0] のみの引用になり (iii) の疑いが消える) |
| L7 | LOW | `terms[4].points[0].text_jp` 2 文目、`terms[4].points[1].text_jp` | ① SSD「可動部品をもたない → 衝撃に強く消費電力も小さい」は 2022r04-q084 題文と同じ因果の並び (文全体 Dice 0.22、12 字一致なし)。q084 は識別型 (どれか) で、正答 SSD の標準的特徴を見出し語側の一般表現で述べる (D-209 免除、jp-review r2 も記録のみ)。② 「書込み回数の上限がある」は 2009h21a-q057 正答アと 9 字一致 (ガード 12 字未満)、SSD の標準的留意点 | 記録のみ |
| L8 | LOW | `terms[4].detail_jp/zh/en`、`terms[4].points[0]`、`key_points_*[2]` | SSD・HDD は名前だけで定義されず (detail「ハードディスクに代わる記憶装置」が SSD と結び付かない)、jp 本文で「ハードディスク」と「HDD」が混在。zh は SSD / HDD を略称のみで書き、`zh_terms` の「SSD（固态硬盘）」「HDD（硬盘驱动器）」の括弧注がない (validate B6 warn 0)。後続単元の見出し語のため誤学習には至らない (jp-review r2 LOW の未修) | 記録のみ (直すなら detail_jp「ハードディスクに代わる記憶装置」→「ハードディスク (HDD) に代わる記憶装置 (SSD)」と zh / en 同様) |
| L9 | LOW | `terms[1].quiz[1]` / `inline_quiz[1]` = 2013h25a-q053 | ROM の確認題だが、この題で ROM は誤答肢の一つで正答はグラフィックスメモリ (RAM 節 VRAM 考点の題)。ROM の性質を問う 2024r06-q056 / 2018h30h-q076 が term_questions にある (jp-review r2 LOW の未修)。本文で解けるため矛盾ではない | 記録のみ (構造変更のため B3 対象外) |
| L10 | LOW | `terms[3].analogy_*`、`terms[4].analogy_*` | 不揮発性 (ノートのメモ) と フラッシュ (鉛筆で書くノート) が同じノートの像で、続けて読むと区別の手がかりが弱い (jp-review r2 LOW の未修)。フラッシュ側は「消しすぎると紙が傷む」で書込み上限の像を足しており、内容の矛盾はない | 記録のみ |
| L11 | LOW | `terms[1].detail_zh` 1 文目、`terms[4].detail_en` 1 文目 | loc-review LOW の未修 2 件: zh「它读取在制造时等阶段写入的内容来使用」が jp 語順の直訳調 / en "in fixed units (blocks)" (jp は「まとまった単位」; ブロックは実際に固定長なので事実誤りではない) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 揮発性 = 消える / 不揮発性 = 残る: `pairs[1].rows[0..1]` (対比そのもの)、`pairs[0].rows[1]` (RAM / ROM の側面として)、overview 総表の列 (D-195 §3 の構造)、各 one (定義)、key_points[0..1] (各 1 側) → pairs 2 箇所まで = 許容。② DRAM / SRAM: RAM detail 2 文目 (リフレッシュの要否)、RAM points[0] / points[1] (points[1] のみ比較形「DRAM より高速」)、tree は名前のみ → r1 の 6 箇所から縮小、許容。③ ROM = 原則読み出しだけ / フラッシュ = 電気で書き換え可: overview_rows[1] と [4] の書き換え列、tree label、ROM mix 考点 → 許容。④ RAM / ROM の読み書き・用途: `pairs[0].rows[0]`・`rows[2]`、goals_jp[0] (予告) → 許容。

**範囲外の観察**:
- O1 `unit_summary_jp/zh/en`・`title_*` は v1 と同文 (未改稿)。「(RAM/ROM、揮発性/不揮発性)とフラッシュメモリ」は見出し語の連なりだが validate の D-197 対象外フィールドで、事実は正しい。
- O2 名前に RAM / ROM を含む光ディスク (DVD-RAM・CD-ROM) が 2024r06-q056・2025r07-q075・2012h24a-q061 の誤答肢にある。本単元は不揮発性 points[0] で光ディスク = 不揮発性と述べるのみで、DVD-RAM・CD-ROM が光ディスクであることは扱わない。どの題も本文で一意に解け、特定の誤答肢を名指しで否定すると (iii) に近づくため本単元では指摘しない。記録媒体を扱う後続単元で拾うことを推奨。
- O3 `terms[4].hook_jp` の「とされる」は §9 grep の候補語だが、名前の由来が伝聞 (開発者の同僚の命名の逸話) であることの正しい留保で、定型の締め句ではない。

確認済みで問題なし: 先行 MEDIUM 2 件の解消 (三語とも回帰なし)、限定条件 (考点 8 件全て保持、L1 は明示化の推奨)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤83 字)、写し (遮蔽あり 0 / 遮蔽なし 0 / 近似 1 = 偽陽性 L5)、choice-echo warn 0、`[[jp:]]` 原語 13 種実在、one_zh / one_en の見出し語併記 (片仮名・漢字 3/3、英字 2 は同綴り)、zh 訳語表 (B6 warn 0)、図種 (tree static ×1 / 図なし ×4 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、D-205 該当なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **11** (建議修 4: L1〜L4 / 記録のみ 7: L5〜L11) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 10 件 (qid 付き 8 件)・引用 13 題 + 未引用の quiz 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。先行 jp-review の MEDIUM 2 件は解消済み。LOW 建議修 4 件 (L1〜L4) は補丁 (B3) で修正推奨、L5〜L11 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-41-u01
✓ technology-15-41-u01 unit: 0 issues (data/ip/textbook/units/technology-15-41-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-41-u01
✓ technology-15-41-u01 parity: 22 locations, 0 diff
EXIT=0
```
