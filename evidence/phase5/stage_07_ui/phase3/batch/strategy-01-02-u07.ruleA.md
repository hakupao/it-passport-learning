# Rule A 全数抽検 — strategy-01-02-u07 (データ形式と発生源によるデータ種類)

- **Auditor**: `oh-my-claudecode:verifier` (opus)。Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別の agent・別の context。単元ファイルは変更していない (本ファイルだけを新規作成)。
- **Date**: 2026-10-30 (S138 第 8 批 b08)。repo HEAD `ae614bf` + 作業ツリー。単元 JSON は未コミットの書き直し版 (`b08-u07-a1` の merge 結果、sha256 先頭 `70dbbffe3f892eca`)。
- **対象**: `data/ip/textbook/units/strategy-01-02-u07.json` (textbook-unit-v2)。用語 **8 / 8 = 全数** (CSV / シェープファイル / GISデータ / 調査データ / 実験データ / 行動ログデータ / 稼働ログデータ / チャートジャンク) と単元レベル (goals / overview_cols / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、S135 補足の D-197 (羅列) / D-198 (写し) / D-199 (HIGH 0 かつ MEDIUM 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202、D-203 (`docs/discussion/2026-10-29-session-137.md`)、D-204 / D-205 (`docs/discussion/2026-10-29-session-138.md` §2・§6)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録された 6 種だけ)。比較対象: `data/ip/textbook/.planning/v2/strategy-01-02-u07/v1-original.json` (用語 8 語・`term_zh`・`term_en` はすべて v1 / manifest `v1_terms` と一致)。前段の審査: `journal.b08-u07-a1.jsonl` (jp-review r1 **PASS** low 8 / loc-review r1 **PASS** low 5。HIGH・MEDIUM の前歴なし → 回帰の確認対象は low の扱いのみ)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を教える・引用題の限定条件が落ちている / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文と選択肢は引用しない (qid と言い換えだけを書く)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: 考点 全 6 件 (exam 2 + mix 4)、qid 付き 2 件 (2011h23tokubetsu-q073 / 2011h23tokubetsu-q025)。`data/ip/quiz/questions.json` から題文・選択肢・`correct_answer` を再読。主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、題の前提 (限定条件) を外していないことを 1 件ずつ確認。用語 GISデータ / 調査データ / チャートジャンク は manifest `term_questions` が空で考点 0 件 (D-200 の上限内)。
3. **quiz / challenge_questions**: quiz 2 枠 (CSV・行動ログデータ) + challenge 4 題 (2011h23tokubetsu-q073 / q025 / 2012h24a-q005 / 2011h23tokubetsu-q009)。q005 (購買履歴の分析で有用な情報を抽出する手法 = データマイニング) と q009 (データマイニングの事例 = 一緒に買われる商品の発見) は本単元の用語ではないが、本文に矛盾する記述は無い (行動ログ detail「商品の推薦に役立てる」とは整合)。v1 の inline quiz 6 題 (2009h21a-q002 パレート図 / q004 データマイニング / q007 発注量計算 / q091 在庫引当 / 2014h26a-q100 作業短縮時間の計算 / 2009h21h-q095 円グラフの項目) は各用語と無関係で、v2 で外したのは妥当 (manifest は q100 を稼働ログデータに付けるが題の中身は交通費精算の時間計算で中問組員、使わないのが正しい)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 170 本 (派生フィールド・source_figures 除く) を topic `strategy-01-02` の全 98 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去) — (a) カタカナ 4 字以上と英数を □ 1 字に遮蔽、遮蔽後の実字 6 未満の窓は除外: **0 件** / (b) 遮蔽なし: **0 件** / (c) 近似一致 (12 字窓どうし編集距離 ≤2 = 1〜2 字の置換): **0 件**。目視: カタカナの多い文 (行動ログ points[0]「アクセスログ分析」、CSV の考点・図) — 「アクセスログ分析」は q025 の正答肢の用語名で表現の写しではない。q025 の題の言い回し (閲覧回数・移動履歴・閲覧者の行動を分析) は「ページの見られた回数 / ページを移った道筋の記録 / 利用者の動きを読み解く」と語ごとに言い換えられている。CSV の図 (店舗 / 来客数 / 本店 120 / 駅前店 85) は q073 の表 (月・売上高・500・600) の値も形も使わない自作。CSV points[0] の「列ごとに縦に読んで並べ替えるのではなく」は誤答 イ の形を一般語で否定するだけで選択肢文字列は無い。
5. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、detail 2〜3 文、§6 比喩・フック (L5)、定義前使用 (レコード = CSV one で太字導入、地物 = シェープ one の括弧 (点・線・面) と detail の例 [JP 審査 low、記録のみ]、GIS = GIS one で展開、アクセスログ分析 = 考点内で定義的に述べる)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → JP 本文 0 件、`overview.freq_badge`「頻出」のみ。zh [必须 / 重要 / 考试 / 常考 / 记住] 0 件、en [exam / must / important / remember / always / never] は `terms[5].analogy_en` の "never thought about it" 1 件で通常用法 = 偽陽性)、図の型 (CSV = table static、シェープ = tree static、GIS・実験 = flow steps 4/4、行動ログ = table static、チャートジャンク = compare static 3 行 key 1、調査・稼働 = 図なし; 全て登録内)。
6. **D-200**: 考点数 2/1/0/0/1/1/1/0 (≤3 ✓)、各 JP 文数 1〜2・字数 41〜87 (≤100 ✓、最大は CSV `points[0]` の 87 字 2 文)。**framing 件数** (validateV2 `EXAM_FRAMING`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合): GIS one「位置と結び付いたデータの総称」= `pairs[0].rows[0].b`「位置と結び付いたデータ全体」、シェープ = 「形式の一つ」(GIS detail 末文・`pairs[0].rows[0].a`・`rows[1].a`「器」) が一致、行動ログ detail「本人に尋ねなくても」と調査 detail (人に質問) は対比として整合、稼働 one「機械・設備・サーバ」と `pairs[2].rows[0].b`「機器や設備」一致 → 事実の不整合 0、措辞の不整合 1 (L1 総表の列名)。書き方 8 → L4。書き方 9 (限定条件) → §2 表、落ち 0。§6 → L5。§9 言い直し → 該当なし (考点 6 件は one / detail の言い直しではない; 稼働 mix 考点は pairs[2].rows[0] と同内容だが mix 考点 + pairs の 2 箇所で上限内)。
8. **D-205 (版)**: 単元が改正される文書の構成・数・名称を言うかを確認。① CSV: RFC 4180 は存在するが、単元は RFC の構成要素の数・名前を言わず、カンマ区切り・1 行 1 レコードという形式の一般的性質だけ → 対象外。② シェープファイル: 図 tree が `.shp / .shx / .dbf` の 3 拡張子を挙げる。根拠文書は ESRI Shapefile Technical Description (1998 年、改版なし) で D-205 の「改正される文書 (規格・法令・ガイドライン・知識体系)」に当たらない。3 つは必須ファイルの組で事実どおり、本文 (detail) は「拡張子の違う複数のファイルが組になって」と数を言い切らず、図も「3 つだけ」とは言わない → 対象外・問題なし。③ チャートジャンク: タフテの命名 (1983 年の著書) は人名・由来で構成・数ではない → 対象外。→ D-205 指摘 0。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、図ラベル・表セル・比較行・caption の三語一致 (parity 36 箇所 0 diff)、`[[jp:…]]` 原語 10 種 (レコード / シェープファイル / GISデータ / 調査データ / 実験データ / 行動ログデータ / アクセスログ分析 / 稼働ログデータ / 稼働 / チャートジャンク) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` 7/8 (CSV は三語同形で併記不要、validate D-202 は 0 issue)、zh 訳語が `zh_terms.unit.json` に従う (CSV / Shapefile（形状文件） / GIS 数据 / 调查数据 / 实验数据 / 行为日志数据 / 运行日志数据 / 图表垃圾（chartjunk） / 记录 / 数据库 / 电子表格软件 / 服务器 / 服务 / 文件 / 问卷; validate の B6 warn 0 / jp-origin warn 0)。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | CSV | OK — exam 1 / 1 題: 表を CSV で出すと同じ行の値がカンマでつながり行末ごとにレコード区切り、列方向に並べ替えない (2011h23tokubetsu-q073 正答ア = 行ごとカンマ区切り; 誤答イ = 列ごと・ウ / エ = スラッシュ区切り を全て否定)。題の限定「レコード区切りは CR とする」は考点が「レコード区切りが入る」と一般化し、改行コードの種類を言い切らない → 落ちではない。mix: 区切りはカンマ、スラッシュ区切りは CSV と呼ばない — q073 の誤答ウ・エを否定する方向で正答を支持 (L3)。detail「セルの色や数式は保存されず値だけ」は事実。図 (店舗 / 来客数) は one・考点と一致 | OK (図 table static) | OK (zh 図セル「来客数」L7) | L3 / L5 (analogy) |
| 2 | シェープファイル | OK — 考点 mix 1 (CSV は値だけの表、シェープは点・線・面の図形を記録できる) は事実。exam 題なし。one (形状 + 属性)・detail (複数ファイルの組、点 / 線 / 面の例)・図 tree (.shp 形状 / .shx 索引 / .dbf 属性) は事実どおり (D-205 は §1-8 で対象外) | OK (tree static) | OK | なし |
| 3 | GISデータ | OK — 考点 0 (題なし)。one「位置と結び付いたデータの総称」、detail (重ねて表示し分布・距離を分析、出店検討、シェープは形式の一つ)、flow 4 段 (位置 → 属性 → 層を重ねる → 分析) は相互に一致し事実どおり | OK (flow steps 4) | OK | なし |
| 4 | 調査データ | OK — 考点 0 (題なし)。one「手を加えず現状を調べる」、detail「因果は確かめにくい」は事実。比喩 (町で数える・尋ねる) は用語の場面で誤学習なし | OK (図なし) | OK | L4 (detail の対比) |
| 5 | 実験データ | OK — mix 1 (条件を操作 → 因果を確かめやすい / 調査は現状把握) は事実。detail の A/B テスト例・flow 4 段 (肥料の量だけを変える) は one と一致 | OK (flow steps 4) | OK | L4 |
| 6 | 行動ログデータ | OK — exam 1 / 1 題: ページの閲覧回数・サイト内の移動の記録から利用者の動きを読む手法 = アクセスログ分析 (2011h23tokubetsu-q025 正答ウ; 誤答 ABC 分析・SWOT 分析・バリューチェーン分析を支持しない)。題の「など」に対し考点は 2 つの記録を例として挙げる形で、記録をこの 2 つに限るとは言わない → 支持されない限定ではない。図 table (会員 017 の 3 行の操作記録) は one と一致 | OK (table static) | OK (en 図「top page」L7) | L6 (考点の主語) / L2 (hook) |
| 7 | 稼働ログデータ | OK — mix 1 (記録の対象が人の操作なら行動ログ、機器の動作なら稼働ログ) は事実。detail (運転時間・停止・エラー・温度、故障の前ぶれ・点検時期) は事実 | OK (図なし) | OK | L5 (hook) |
| 8 | チャートジャンク | OK — 考点 0 (題なし)。detail「タフテが名付けた」(1983 年、*The Visual Display of Quantitative Information*) は事実、立体円グラフの手前が大きく見える誤読も事実。compare 3 行 (立体 / 背景 / 目盛り線) は detail と一致 | OK (compare static) | OK (hook_en「in English」L7) | なし |

**単元レベル**: goals 3 点・overview_cols 2 (L1)・overview_rows 8 行・pairs 3 組 (シェープ / GIS 2 行 key 1、調査 / 実験 3 行 key 1、行動ログ / 稼働ログ 2 行 key 1)・key_points 4 (L8)・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3、矛盾なし)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `overview_cols_jp[0]` / `overview_cols_zh[0]` / `overview_cols_en[0]` | 総表の列名が「分ける軸」だが、値に「位置情報の有無」(GISデータ)・「見せ方の注意」(チャートジャンク) があり、後者はデータを分ける軸ではない。goals_jp[0] の「2 つの軸」とも数が合わない (JP 審査 low の継続、措辞級の欄同士の食い違いで事実誤りではない) | jp「分ける軸」→「位置づけ」/ zh「分类维度」→「定位」/ en "Axis of classification" → "Where it fits" |
| L2 | LOW **建議修** | `terms[5].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`, `summary.memory_hooks_*[5]`) | 「ログ (log) はもとは航海日誌のこと」は語源として不正確 (log のもとの意味は丸太で、船の速さを測る chip log → その記録帳 logbook → コンピュータのログ)。記憶の手がかりとしては有効なので、「由来する」に弱める | jp「ログ (log) はもとは航海日誌のことで、」→「ログ (log) は航海日誌 (logbook) に由来する言葉で、」/ zh「日志（log）原本指航海日志，」→「日志（log）一词来自航海日志（logbook），」/ en "A log was originally a ship's logbook, so" → "The word log comes from a ship's logbook, so" |
| L3 | LOW | `terms[0].points[1].text_jp/zh/en` | 「スラッシュなど別の記号で区切ったものは CSV とは呼ばない」は言い切りが強い (実務では地域設定によりセミコロン区切りも CSV と呼ばれる)。ただし RFC 4180 の定義どおりで、引用題 q073 の正答を支持し誤答を否定する方向 (JP 審査 low の継続) | 記録のみ |
| L4 | LOW | `terms[3].detail_*` 3 文目、`terms[4].detail_*` 1 文目 | 調査 / 実験の「因果を確かめやすいか」の対比が `pairs[1].rows[1]`・`terms[4].points[0]` (mix) に加え両 detail にも出る (書き方 8、計 4 箇所)。各 detail は用語自身の性質の説明として自然 | 記録のみ (削ると調査データの限界 / 実験データの利点が本文から消える) |
| L5 | LOW | `terms[6].hook_*`、`terms[0].analogy_*` | §6: 稼働 hook「稼働 = 機械が動いて働く → 働きぶりの日誌」は one の言い換えに近い。CSV analogy「読点で区切り 1 人 1 行の名簿」は CSV の操作そのもの。誤学習には至らない (JP 審査 low の継続 + 追加 1) | 記録のみ |
| L6 | LOW | `terms[5].points[0].text_*` | 考点の主語が単元外の語「アクセスログ分析」で、アクセスログが行動ログデータの一種であることを言わない。事実は q025 正答と一致 (JP 審査 low の継続) | 記録のみ (任意: 文頭に「行動ログデータの一つであるアクセスログについて、」を足す案があるが、考点の字数 67 → 約 85 字、改稿しなくてよい) |
| L7 | LOW | `terms[0].fig.data.rows[0].cells[0..1].zh`、`terms[5].fig.data.rows[0].cells[2].en`、`terms[7].hook_en`、`key_points_zh[3]` | loc 審査 low の未修: zh「来客数」は日式 (到店人数 が自然)、en "top page" は和製英語寄り (home page)、hook_en "Junk means rubbish in English" の in English は英語読者に不要。加えて `key_points_zh[3]` は「**图表垃圾**」で訳語表の（chartjunk）を省く (他の箇所は全形)。いずれも意味のずれなし | 記録のみ (任意: zh「店铺 \| 来客数」「店铺,来客数」→「店铺 \| 到店人数」「店铺,到店人数」/ en "Opens the top page" → "Opens the home page") |
| L8 | LOW | `key_points_jp/zh/en[2]` | 発生源の要点が一般論 (どこでどう生まれたかで向く分析が変わる) で、具体の対比 (条件を操作するか / 記録対象が人か機器か) を含まない (JP 審査 low の継続) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① シェープ = 形式の一つ / GIS = データ全体: `pairs[0].rows[0..1]`、GIS detail 末文 → 2 箇所で許容。② 調査 = 条件を変えない・現状把握 / 実験 = 条件を変える・因果: `pairs[1].rows[0..1]`、`terms[4].points[0]`、両 detail → L4 (各 one は定義そのもので数えない)。③ 行動ログ = 人 / 稼働ログ = 機器: `pairs[2].rows[0]`、`terms[6].points[0]` → 2 箇所で許容。④ CSV = 値だけ / シェープ = 図形: `terms[1].points[0]` のみ → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 challenge の 2012h24a-q005 / 2011h23tokubetsu-q009 はデータマイニング (後の単元の用語) の題。中問組員を除くと本単元の用語に直接対応する題が 2 題しかなく、確認題 3〜5 題の下限によるもの (JP 審査 low と同判断)。本文と矛盾なし。
- O2 manifest `term_questions` は 2014h26a-q100 を稼働ログデータに付けるが、題は交通費精算の作業短縮時間の計算で用語と無関係 (中問組員、v2 は使わない = 正しい)。v1 の inline quiz 6 題も各用語と無関係で、v2 で外したのは改善。
- O3 `terms[1].one_zh` / `terms[7].one_zh` の括弧の重なり (訳語表の全角括弧 +（[[jp:]]））、`terms[1].points[0]`・`terms[4].points[0]` の zh/en で見出し語自身にも `[[jp:]]` — loc 審査 low、規則どおりで害なし。

確認済みで問題なし: 限定条件 (考点 2 件の qid 付き考点で保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤87 字)、D-198 写し (validate 0、独立照合 遮蔽あり 0 / 遮蔽なし 0 / 近似 0)、D-205 (対象文書なし、§1-8)、`[[jp:]]` 原語 (10 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (7/8、CSV は三語同形)、zh 訳語表 (B6 warn 0)、図種 (table ×2 / tree / flow steps ×2 / compare / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。前段審査に HIGH / MEDIUM の前歴なし、low は L1・L3〜L8 として継続記録 (回帰なし)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 2: L1・L2 / 記録のみ 6: L3〜L8、うち L6・L7 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 6 件 (qid 付き 2 件)・引用 2 題 + 未引用の challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。D-198 写しは独立照合 3 方式とも 0、D-205 は対象文書なし。LOW 建議修 2 件 (L1 総表の列名・L2 log の語源) は補丁 (B3) で修正推奨、L3〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-02-u07
✓ strategy-01-02-u07 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u07.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-02-u07
✓ strategy-01-02-u07 parity: 36 locations, 0 diff
EXIT=0
```
