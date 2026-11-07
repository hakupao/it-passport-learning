# Rule A 全数抽検 — technology-13-34-u06 (グラフ理論の基礎)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 補丁案の検証用コピーは scratchpad のみ)。
- **Date**: 2026-11-08 (S149 b50)、repo HEAD `be49bdf9` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b50-u06-a1` merge 結果、sha256 先頭 `b4832d9ca2ad7fff`)。
- **対象**: `data/ip/textbook/units/technology-13-34-u06.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (頂点 / ノード / 辺 / エッジ / 有向グラフ / 無向グラフ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `.planning/v2/technology-13-34-u06/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致; 有向 / 無向の svg 図 2 枚は v1 の図をそのまま継承)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig / figure / quiz / inline_quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) であることをスクリプトで確認 (87 照合、不一致 0)。
2. **考点 × 引用題**: 考点 全 9 件 (exam 5 + mix 4)、qid 付き 5 件、引用 qid 異なり 3 題 (2016h28h-q033 / 2010h22a-q066 / 2009h21a-q046)。`questions.json` + `translations/<exam>.json` の stem_jp_clean と原図 (`data/ip/exams/figures/2016h28h-q033.png`、`2010h22a-q066.png`) で題文・図・選択肢・`correct_answer` を再読。**計算・数え上げの再計算** (全て自分で):
   - **2016h28h-q033** (X 出発、A・B・C を全て経由して Y、順不同、表は始点→終点の所要時間、A→Y と X→Y は不可): Y の手前は B か C のみ (各 60)。全順序を列挙 — X→A→B→C→Y = 20+40+20+60 = 140 / **X→A→C→B→Y = 20+30+20+60 = 130** / X→B→A→C→Y = 20+40+30+60 = 150 / X→C→A→B→Y = 40+30+40+60 = 170 / A が最後の 2 順 (X→B→C→A、X→C→B→A) は A→Y 不可で再訪が必要 (例 X→B→C→A→C→Y = 160) → 最短 **130 分 = 正答イ 一致**。注: raw `stem_jp` の表は B→A が「−」(OCR 損傷)、clean と原図は 40。B→A を使わなくても最短は 130 で答えは変わらない。原図の辺は 8 本 (X–A, X–B, X–C, A–B, A–C, B–C, B–Y, C–Y) で表の可/不可と一致。
   - **2010h22a-q066** (順序関係 (A,B)・(A,C)・(B,D) の図): 原図で各肢を確認 — エ = A→B, A→C, B→D (**正答エ 一致**)。誤答 ア = A→B, C→A, D→B / イ = A→B, A→C, D→B / ウ = B→A, A→C, B→D で、どれも 4 頂点・3 本で本数は同じ、向きの一部が逆。
   - **2009h21a-q046** (6 人が 1 対 1 で伝達、経路の最少数): C(6,2) = 6·5/2 = **15 = 正答ウ 一致** (誤答 30 = /2 を忘れた n(n−1)、6 = n)。
   - **2013h25h-q076** (challenge のみ、8 人で共通鍵の数): C(8,2) = 8·7/2 = **28 = 正答ウ 一致** (誤答 16 = 2n、32、12)。題の例 4 人 → 6 個も 4·3/2 = 6 で一致。
   - **単元内の数値例**: `terms[2].points[1]` 頂点 5 個 → 5·4/2 = **10 本** ✓ (引用題の 6 / 15、challenge の 4 / 6・8 / 28 を避けた自作値)。図 t02 (無向、頂点 3) の辺 3 本 = 3·2/2 = 3 ✓。図 t01 (有向) の矢印 3 本 = 順序付きの組 3 つ ✓ (`terms[3].points[0]`「組 1 つ = エッジ 1 本」と一致)。
3. **図の自己整合 (三語)**: `figures/technology-13-34-u06-t01.svg` (有向) — 頂点ラベル 頂点A / 頂点B / 頂点C 各 1、リンク `L_A_B` / `L_B_C` / `L_A_C` 3 本とも `marker-end` (矢じり) あり = A→B, B→C, A→C で、`figure.mermaid` と一致。有向グラフ one (辺に向き・矢印で描く)・detail (逆向きは別の矢印がない限り成り立たない; 図に逆向きの矢印なし)・pairs[1].rows[0]「ある (矢印で描く)」と整合。`t02.svg` (無向) — 同じ 3 頂点・3 本、`marker` 0 = 矢じりなし。無向 one (矢じりのない線)・pairs[1].rows[0]「ない (線で描く)」と整合。t01 は t02 を有向化した図だという caption / 本文は無く、`terms[5].points[0]` (無向の辺 1 本 = 逆向きの矢印 2 本) と衝突しない。どちらの図も q066 の肢 (4 頂点 A〜D) とも q033 の図 (X・A・B・C・Y) とも別の図。svg 図はラベルが jp のみで zh / en でも同じ図を出す (svg 種の仕様、v1 継承) → 三語の本文はどれも「頂点 A〜C を矢印 / 線で結ぶ」とは書いておらず、図の固有ラベルに依存する文は無い (L7)。
4. **quiz / challenge_questions**: quiz = 頂点・辺 → q033、ノード・エッジ・有向グラフ → q066、無向グラフ → なし (freq 0)。challenge = q066 / q033 / q046 / q076 (v1 の challenge 5 題 [q082・q067・q056・q076・q095] は q076 以外が本単元の用語で解けない題だったが、本版で置換済み)。本文はどの題の誤答肢も支持しない: q033 の誤答 (140 / 150 / 110) を誘う記述なし (考点は「経路の所要時間 = 通る辺の重みの和」のみ); q066 の誤答 (逆向きの矢印) は 有向 points[0]「根元と先を入れ替えると別の関係」で退けられる; q046 / q076 の誤答 (n(n−1)・2n・n) は n(n−1)/2 で退けられる。
5. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn も出力なし)。独立照合: 単元の JP 文字列 78 本 (派生フィールド・source_figures・summary 除く) を topic 内全 32 題の stem_jp_clean + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去) — **カタカナ 4 字以上と英数を □ に遮蔽 (実字 6 未満の窓除外): 0 件 / 遮蔽なし: 0 件 / 1〜2 字置換の近似一致 (編集距離 1〜2): 0 件**。カタカナの多い文 (ノード / エッジ の one・detail・hook、ネットワーク・データ構造) を目視 — 題文に該当句なし。(iii) 選択肢なぞり: q066 の正答は図の肢で、考点は肢の集合・順序を再現しない。有向 points[0] は (P, Q) という自作の文字で順序付きの組の描き方 (= q066 の題文が前提として与える記法そのものは標準の約束事) を述べ、題の組 (A,B)・(A,C)・(B,D) も誤答肢の矢印も再現しない — 退けるのは「向きを逆にすると別の関係」という肯定の定義 (D-209 免除内)。頂点 points[0] の「出発地・経由地・目的地」は q033 の場面の骨格に沿うが、題の地点名・所要時間・順不同の条件は使わない (L2)。辺 points[0] は q033 の数値を使わない。辺 points[1] は q046 の 6 人 / 15 を使わず 5 → 10。
6. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、detail 2〜3 文 (3/2/3/2/2/2 文)、比喩 (待ち合わせの印 / 道路 / 一方通行の道路網 / 握手; ノード・エッジ は空) と hook (三角形の字形 2・語源 2・「有」「無」の字 2)。定義前使用: グラフ = 頂点 detail で太字定義、重み = 辺 detail で太字定義、根元 / 先 = 有向 detail で導入、木構造・リスト = ノード detail の例示のみ。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が; zh 必须 / 考试 / 一定 / 务必 / 重要; en must / always / exam / every / important / be sure): 「選ぶ」1 = 頂点 detail「どの頂点を選ぶか」(通常語)、「必ず」/「一定」/ always 各 1 = 辺 detail「両端には必ず頂点」(定義上の事実で定型締め句ではない)、「覚え」2 = 辺 hook「〜と覚える」・エッジ hook「結び付けて覚える」(+ 派生 4) → L4、every 2 / Exam 1 = 「every pair」「Examples」(偽陽性)、`kind: "exam"` はデータ値。図種: 有向・無向 = svg static (登録内)、他 4 用語は図なし。pair 配置: 頂点 / 辺 (3 行、key 1)、有向 / 無向 (3 行、key 1)。
7. **D-200**: 考点数 2/1/2/2/1/1 (≤3 ✓)、各 JP 1〜2 文・字数 28〜74 (≤100 ✓、最大は辺 `points[1]` の 74 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0。
8. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (欄同士の照合: ノード・エッジ を「呼び名が違うだけ」と言う one / points / overview_rows[1]・[3] / pairs[0].rows[2] / key_points[1] は一貫; 有向 detail「逆向きは別の矢印がない限り成り立たない」と 無向 points[0]「無向の辺 1 本 = 逆向きの矢印 2 本」は整合; overview_rows[4..5] と pairs[1] 一致) → 本文同士の不整合 0。比喩の範囲 (D-204 / 既知型 4): 辺 analogy「道路があれば 2 つの町は行き来でき」は辺一般に両方向の通行を結び付ける像で、同じ単元の 有向グラフ (辺に向き・逆向きは成り立たない) と範囲がずれる → L1。書き方 8 → L3。書き方 9 (限定条件): q033 の「全てを経由」「順不同」は考点が主張しない (考点は重みの和という一般則のみで、限定を外した一般化ではない); q046 の「1 対 1」「少なくとも」は「どの 2 つの頂点も 1 本ずつの辺で結ぶと」で保持; q066 の「X から Y へ」の向きは「P を根元、Q を先」で保持 → 落ち 0。
9. **既知失敗型 (D-208) の個別確認**: (1) option tracing → §1-5、該当なし。(2) 「など」落ち → 引用題に「など」なし。(3) 別名を別物として教える → ノード = 頂点・エッジ = 辺を全欄で「同じもの」と明言、逆の失敗なし。ただし エッジ detail の「ネットワーク分野ではエッジ = 回線・接続」はエッジコンピューティングの「エッジ」(末端) と別義で、IT パスポートでは後者が頻出 (2019r01a-q071 / 2023r05-q071 等、別 topic) → L5。(4) 比喩・図の範囲 → L1 (図は §1-3 で整合)。(5) zh / en の回帰 → loc-review r1 MEDIUM 2 件 (エッジ detail_en・key_points_en[1] の edge = edge の同語反復) は解消済み、回帰なし。(6) zh / en の語の選び方が誤答肢寄り → なし (zh「方向相反的两条箭头」、en "tail / head" とも正しい)。(7) / D-210 法令改正 → 対象外。(8) 比喩の鍵語が他の見出し語 → 頂点 hook「辺と辺が出会う角の点」・辺 hook「角の点 (頂点) と角の点を結ぶ線」は単元内の定義と同じ向きで衝突なし。(9) hook を引用題に当てる → 有向 hook (矢じりの有無) は q066 の全肢に矢じりがあるので誤答を選ばせない; 頂点 / 辺 hook は q033 の図で X・A・B・C・Y = 頂点、結ぶ線 = 辺 を正しく選ばせる。(10) 法令・規格カテゴリの閉じた列挙 → 対象外。D-205 → 改訂される文書の構成要素の数・名称なし、対象外。
10. **三語**: zh・en が jp と同じ事実か、表セル・比較行の三語一致 (parity 0 diff)、`[[jp:…]]` 原語 8 種 (頂点 / グラフ / 辺 / ノード / 重み / エッジ / 有向グラフ / 無向グラフ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり、zh 訳語は `zh_terms.json` (顶点 / 节点 / 边 / 边（edge） / 有向图 / 无向图) に一致。en は 辺・エッジ が共に edge になる問題を loanword / [[jp:]] で処理 (L6 は平文セルの残り)。
11. **前回指摘の解消確認** (journal `b50-u06-a1` type:"result"): jp-review r1 PASS (LOW 7: 頂点考点の助言調・mix 考点の言い直し・key_points[2] 言い直し・頂点/辺 対比 3 箇所・key_points に有向/無向なし・有向 analogy = detail の例・エッジのエッジコンピューティング誤読) → §3 に継承 / 再判定。loc-review r1 REVISE MEDIUM 2 (`terms[3].detail_en` / `key_points_en[1]`) → 両方とも r1 の修正案どおり [[jp:]] で日本語表記を区別する文に修正済み ✓。r1 LOW (one_en "in this sense"、頂点 detail_en "lines" → "railway lines (routes)"、辺 hook_en の字、エッジ detail_zh、頂点 points[0] en) → 修正済み ✓。loc-review r2 PASS の LOW 7 件 → L6 に継承 (hook_en の「辺」二重表示は L8 で建议修)。
12. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 頂点 | OK — exam 1 / 1 題: 経路の問題では出発・経由・目的の各地点を頂点、道を辺とみなす (2016h28h-q033 正答イ 130、原図で地点 = 丸・経路 = 線を確認; 主張は解き方の整理で数値に触れず、誤答を支持しない) / mix: 頂点 = 対象そのもの、辺 = 関係 (点か線か)。detail「駅も路線も頂点にできる」は正しい (路線を頂点にすれば乗換駅が辺)。hook (三角形の頂点) 正しい | OK (図なし) | OK | L2 / L3 |
| 2 | ノード | OK — mix 1: 頂点と呼び名が違うだけ。detail「ネットワーク機器・木構造・リストの要素もノード」正しい。hook (node = 結び目) 正しい。quiz q066 (題の terms タグ由来、順序関係の図示) と矛盾なし | OK | zh「源自英语的叫法」は L6 | L3 |
| 3 | 辺 | OK — exam 2 / 2 題: 所要時間を重みとした経路の時間 = 通る辺の重みの和 (2016h28h-q033、再計算 130 で正答一致) / どの 2 頂点も 1 本ずつ結ぶと n(n−1)/2 本、例 5 → 10 (2009h21a-q046 正答ウ 15、再計算一致; 限定条件「1 対 1」=「1 本ずつ」保持、誤答 30 を支持しない)。detail (両端に頂点・重み) 正しい | OK | hook_en の字の二重表示 (L8) | L1 / L4 / L8 |
| 4 | エッジ | OK — exam 1 / 1 題: 順序関係の組 1 つ = エッジ 1 本で本数は組の数と一致 (2010h22a-q066 正答エ 3 本; 全肢 3 本なので判別点ではないが事実は正しく誤答を支持しない) / mix: 辺と呼び名が違うだけ。hook (edge = へり) 正しい | OK | OK (r1 MEDIUM 解消) | L3 / L4 / L5 |
| 5 | 有向グラフ | OK — exam 1 / 1 題: (P, Q) は P を根元・Q を先とする矢印 1 本、入れ替えると別の関係 (2010h22a-q066 正答エ; 誤答 ア・イ・ウ = 一部の矢印が逆、を退ける)。detail (逆向きは別の矢印がない限り成り立たない; 作業の前後関係・Web リンク・一方通行) 正しい。図 t01 (A→B, B→C, A→C) は one・detail と一致 | OK (svg static) | OK | L3 (analogy = detail の例) / L7 |
| 6 | 無向グラフ | OK — mix 1: 無向の辺 1 本 = 逆向きの矢印 2 本 (標準の対応で正しい)。detail (両端対等・知り合い関係・両方向の道路網)・analogy (握手の対称性) 正しい。図 t02 (三角形 3 辺、矢じりなし) と一致。quiz なし (freq 0) | OK (svg static) | OK | L7 |

**単元レベル**: goals 3 点・overview_cols 2・overview_rows 6 行 (別名行は相互参照、対になる語は有向 ↔ 無向)・pairs 2 組・key_points 5・summary (記法除去版と一致)・challenge_questions 4 題 (§1-4、全て本文で解け矛盾なし)。key_points[4] の n(n−1)/2 は辺 points[1] と q046 / q076 の再計算に一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建议修 3: L1 / L5 / L8)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建议修** | `terms[2].analogy_jp` / `analogy_zh` / `analogy_en` | 辺 (向きを問わない一般の辺) の比喩が「道路があれば 2 つの町は行き来でき」と両方向の通行を結論にしており、同じ単元の 有向グラフ (辺に向きがあり逆向きは成り立たない、比喩は一方通行の道路網) と像の範囲がずれる (D-204 / 既知型 4)。辺 one は向きに中立で、有向グラフ側で一方通行を明示的に導入しており、引用・quiz 題の誤答も選ばせない (q066 は題文が向きを定義、q033 の表は対称) ため MEDIUM には当たらない | jp「町と町を結ぶ道路のようなもの。道路があれば 2 つの町は行き来でき、道路ごとに所要時間を書き込んでおけば遠回りかどうかも分かる。」→「町と町を結ぶ道路のようなもの。道路があれば 2 つの町がつながり、道路ごとに所要時間を書き込んでおけば遠回りかどうかも分かる。」/ zh「就像连接城镇与城镇的公路。有公路，两座城镇就能往来；在每条公路上写上所需时间，就能看出是不是绕了远路。」→「就像连接城镇与城镇的公路。有公路，两座城镇就连在了一起；在每条公路上写上所需时间，就能看出是不是绕了远路。」/ en "Think of the roads between towns. A road lets you travel between two towns, and if you write the travel time on each road, you can tell whether a route is a detour." → "Think of the roads between towns. A road connects two towns, and if you write the travel time on each road, you can tell whether a route is a detour." |
| L2 | LOW 記録のみ | `terms[0].points[0].text_jp/zh/en` (qids 2016h28h-q033) | 「見通しがよくなる」は事実の言い切りでなく解き方の助言。「出発地・経由地・目的地」は q033 の場面の骨格に沿うが、地点名・数値・順不同の条件は使わず写しではない (jp-review r1 LOW 継承) | 記録のみ |
| L3 | LOW 記録のみ | `terms[1].points[0]`・`terms[3].points[1]`・`key_points_*[1]` / `terms[0].points[1]`・`pairs[0].rows[0..1]`・`key_points_*[0]` / `key_points_*[2]` / `terms[4].analogy_*` | §9 / 書き方 8: ノード・エッジ の mix 考点は one・key_points[1] の言い直し; 頂点 = 点・対象 / 辺 = 線・関係 の対比が mix 考点・pairs[0]・key_points[0] の 3 箇所; key_points[2] は有向 points[0] の言い直し (key_points に「有向 / 無向」の語は無いが、[2] が矢印で描く関係を述べ、overview・pairs[1] が区別を担う); 有向 analogy「一方通行の道路網」は同 detail の例と同じ (§6)。誤学習なし (jp-review r1 LOW 継承) | 記録のみ |
| L4 | LOW 記録のみ | `terms[2].hook_jp`・`terms[3].hook_jp` (+ 派生 `memory_hook_jp`、`summary.memory_hooks_jp[2..3]`) | 「〜と覚える」「結び付けて覚える」で結ぶ hook が 2 つ (6 フック中 2; 記憶フックの言い方で定型締め句ではない、前例どおり) | 記録のみ |
| L5 | LOW **建议修** | `terms[3].detail_jp` / `detail_zh` / `detail_en` (派生 `explanation_*` は自動追随) | 既知型 (3) 近傍 (jp-review r1 LOW 継承・再判定): 「ネットワークの分野では … 回線や接続をエッジとみなすことがある」は、IT パスポートで頻出のエッジコンピューティング (ネットワークの末端・利用者や機器に近い側で処理) の「エッジ」と別義で、「ネットワーク分野のエッジ = 回線」と読まれうる (別 topic の 2019r01a-q071 / 2023r05-q071 等)。本単元の引用・quiz 題の誤答には寄らないので LOW。detail は 2 文 → 3 文 (D-195 上限内)、修正後コピーで validate 0 issues を確認済み | jp「…エッジとみなすことがある。」→「…エッジとみなすことがある。なお、エッジコンピューティングの「エッジ」は、ネットワークの末端 (利用者や機器に近い側) という別の意味である。」/ zh「…看作边（edge）。」→「…看作边（edge）。另外，边缘计算[[jp:エッジコンピューティング]]中的“边缘”是另一种意思，指网络的末端（靠近用户或设备的一侧）。」(zh_terms: エッジコンピューティング = 边缘计算) / en "…are sometimes treated as edges." → "…are sometimes treated as edges. The edge in edge computing [[jp:エッジコンピューティング]] is a different sense: the outer end of a network, close to the users and devices." |
| L6 | LOW 記録のみ | `terms[1].one_zh`・`overview_rows[1].one_line_zh`・`pairs[0].rows[2].label_zh/a_zh`・`key_points_zh[1]` / `goals_en[1]`・`overview_rows[2].extra_en[1]`・`pairs[0].rows[2].b_en` / `terms[4].detail_zh`・`pairs[1].rows[2].a_zh` / `terms[4].points[0].text_zh`・`key_points_zh[2]` | loc-review r2 LOW 継承: zh「节点 … 源自英语的叫法」(节点自体は中国語、[[jp:ノード]] で意図は通じる)、key_points_zh[1] の省略構文、goals_en の素の丸括弧 (エッジ)、平文セル Edge / "Also called an edge" の循環感、「作业」、「带顺序的组」(有序对が標準)。いずれも事実誤りなし | 記録のみ |
| L7 | LOW 記録のみ | `terms[4].fig` / `terms[5].fig` (svg t01 / t02) | 図ラベル「頂点A / 頂点B / 頂点C」が jp のみで、zh / en でも同じ svg を出す (svg 種は言語別ラベルを持たない、v1 継承)。図の内容 (向き・本数) は三語の本文と整合 (§1-3) | 記録のみ |
| L8 | LOW **建议修** | `terms[2].hook_en` (派生 `memory_hook_en`、`summary.memory_hooks_en[2]` は自動追随) | 「The kanji 辺 [[jp:辺]]」で平文の 辺 と jp ラベルの 辺 が並び、派生欄では "The kanji 辺 辺 is …" と二重表示になる (loc-review r2 LOW、未修)。修正後コピーで validate 0 issues を確認済み | en "The kanji 辺 [[jp:辺]] is the one used for a side of a triangle; remember it as the line joining one corner (vertex) to another." → "The kanji [[jp:辺]] is the one used for a side of a triangle; remember it as the line joining one corner (vertex) to another." |

**対比の出現欄 (書き方 8 の列挙)**: ① 頂点 = 点・対象 / 辺 = 線・関係: `terms[0].points[1]` (mix)、`pairs[0].rows[0..1]`、`key_points[0]`、頂点 analogy の後半 → L3。② ノード ↔ 頂点 / エッジ ↔ 辺 (別名): 各 one (定義)、mix 考点 2、`overview_rows[1]`・`[3]`、`pairs[0].rows[2]`、`key_points[1]` → 別名の単元構造上の反復で L3 に含める。③ 有向 = 矢印 / 無向 = 線: 各 one (定義)、`pairs[1].rows[0]`、`overview_rows[4..5]`、hook 2 つ (「有」「無」の対比手がかり、D-195 §6 で反復に数えない) → 許容。④ 一方向 / 対等: 各 detail、`pairs[1].rows[1]`、無向 points[0] → 許容 (points[0] は矢印 2 本という新情報)。

**範囲外の観察**:
- O1 `source_figures[2..6]` (2009h21h-q007 / 2009h21h-q080 / 2010h22h-q067 / 2011h23tokubetsu-q056 / 2014h26a-q095) は v1 の challenge 由来で、本版の challenge・quiz とは対応しない (本文外、未改稿)。
- O2 `unit_summary_*` は v1 と同文 (未改稿)。「頂点(ノード)と辺(エッジ)」は事実として正しい。

確認済みで問題なし: 計算・数え上げ 6 件の再計算 (q033 = 130 / q066 = エ / q046 = 15 / q076 = 28 / 5 頂点 = 10 本 / 図 3 頂点 = 3 本・3 矢印)、限定条件 (考点 5 件全て保持)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (≤2 文・≤74 字)、写し (validate 0、独立照合 遮蔽あり 0 / なし 0 / 近似 0)、`[[jp:]]` 原語 (8 種実在)、one_zh / one_en の見出し語併記 (6/6)、zh 訳語表、図種 (svg static ×2 = 登録内)、派生フィールド一致 (87/87)、用語・`term_zh`・`term_en` の v1 不変量、loc-review r1 MEDIUM 2 件の解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建议修 3: L1 / L5 / L8 / 記録のみ 5: L2・L3・L4・L6・L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 9 件 (qid 付き 5 件)・引用 3 題 + challenge のみ 1 題で、考点の主張は正答と一致し (計算・数え上げは全て再計算で一致)、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。図 2 枚は頂点・辺・矢じりとも本文三語と整合。LOW 建议修 3 件 (L1 / L5 / L8) は補丁 (B3) で修正推奨、L2〜L4・L6・L7 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u06
✓ technology-13-34-u06 unit: 0 issues (data/ip/textbook/units/technology-13-34-u06.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u06
✓ technology-13-34-u06 parity: 25 locations, 0 diff
EXIT=0
```

(補丁案 L1 / L5 / L8 を適用した scratchpad コピー: `textbook-v2-validate.mjs --file <copy>` → `0 issues`、EXIT=0。)
