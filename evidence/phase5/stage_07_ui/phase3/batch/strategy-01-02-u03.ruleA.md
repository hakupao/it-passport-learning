# Rule A 全数抽検 — strategy-01-02-u03 (日程計画とアローダイアグラム)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-29 (S138 b07)、repo HEAD `d9e6216` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b07-u03-a1` merge 結果、sha256 先頭 `d08ca68fccc10683`)。
- **対象**: `data/ip/textbook/units/strategy-01-02-u03.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (PERT / アローダイアグラム / クリティカルパス分析 / マトリックス図) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/strategy-01-02-u03/v1-original.json` (用語 4 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 8 件 = exam 5 + mix 3、うち qid 付き 7 件、引用 qid 延べ 7 件 = 異なり 4 題)**: `data/ip/quiz/questions.json` (+ 表示層 `translations/*.json` の `stem_jp_clean`) から各題を再読、全題 topic `strategy-01-02`。**計算題 2 題を自分で解き直し、単元の規則で正答に至ることを確認**:
   - 2016h28h-q052 (正答ウ = 2): 経路 A 単独 7 / B→E 5 / C→D→E 4 → 全体 7 日。E を通る最長経路 5 との差 = 2。単元 `terms[2].points[0]`「その作業を通る最も長い経路とクリティカルパスとの日数の差まで」でそのまま 2 が出る。`apps/web/src/lib/textbook/criticalPath` でも E=1,2,3 → 総日数 7、E=4 → 8 を確認。`terms[1].points[0]` (合流点では入る作業がすべて終わるまで待つ = E は B と D の両方待ち) も同題で支持。
   - 2021r03-q050 (正答ア = 223 秒): 表示用 `stem_jp_clean` (移動 片道 60 秒・C 10 秒) で、PC 側 A3+B150+C10+D60 = 223、プリンタ側 (移動 60 + E3 + 移動 60 = 123、A 後 3 秒から開始して 126 秒で帰着) は自動処理 B (3〜153 秒) の間に収まる → 最長経路 = PC 側 223。`terms[2].points[1]`「並行する作業は別の経路として扱い、全体は最も長い経路で決まる」で正答。`terms[0].points[1]` (単位は日に限らない) も同題で支持。
3. **アローダイアグラム図 (network widget) の再計算**: data = 結合点 1〜5、A 1→2 (3)・C 1→3 (4)・ダミー 2→3 (0, dashed)・B 2→4 (5)・D 3→4 (2)・E 4→5 (2)。最早結合点時刻 1:0 / 2:3 / 3:max(4,3)=4 / 4:max(8,6)=8 / 5:10、最遅 1:0 / 2:3 / 3:6 / 4:8 / 5:10 → クリティカルパス A→B→E、総日数 10、余裕 C 2・D 2・ダミー 3。widget の実装 `criticalPath()` を同データで実行し `{"total":10,"critical":[0,3,5],"es":{1:0,2:3,3:4,4:8,5:10},"lf":{1:0,2:3,3:6,4:8,5:10}}`、`criticalPaths` = 1 本 → 手計算と一致。`terms[2].fig.steps` の caption (3 経路 A→B→E / C→D→E / A→ダミー→D→E、10 / 8 / 7 日、A→B→E が CP、全体 10 日、C・D に余裕) も全て一致。ダミーは「作業の実体がなく順序関係だけ、点線、所要日数 0」(detail・key_points[1]) で、図でも D が A と C の両方の後になる依存だけを表し、widget では dashed・編集不可 — 本文と一致。
4. **quiz / challenge_questions** (quiz 計 7 枠、challenge 4 題 = 全て本文で引用済み): 2014h26h-q004 (魚の骨の形の図 = 特性要因図; 誤答 = アローダイアグラム・パレート図・マトリックス図) は `terms[1].points[1]` と整合、マトリックス図の quiz にも置かれるが本文と矛盾なし。2017h29a-q008 (件数の大きい順の棒 + 累積の折れ線 = パレート図; 誤答 = 管理図・系統図・マトリックス図) は `terms[3].points[0]` と整合。manifest の `term_questions` にあるマトリックス図の 2013h25a-q092 (評価表で最高評価の案を選ぶ計算題) は本文・quiz・challenge とも不使用 — マトリックス図の性質を問う題ではなく、不使用で正しい (v1 の challenge にはあった)。
5. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 93 本 (派生フィールド除く、図ラベル・caption・セル・総表・対比表を含む) を topic 内全 98 題の題文 (原文 + `stem_jp_clean`) + 選択肢と 12 字連続照合 (句読点・記号・空白除去) を **カタカナ 4 字以上・英数を遮蔽した場合 / 遮蔽しない場合の両方** で実施 → **0 件**。1〜2 字置換の近似一致 (14 字窓 × 編集距離 ≤2) → **0 件**。目視: マトリックス図 `points[0]` ↔ 2017h29a-q008 (Dice 0.20)、アローダイアグラム `points[1]` ↔ 2014h26h-q004 (Dice 0.43、共通部は「品質に影響」「魚の骨の形」= 特性要因図の標準的な説明句、校正例 HIGH 0.52 未満、12 字窓一致なし) → 写しではない。PERT `points[0]` ↔ 2016h28h-q052 (0.23)。2 つの計算題の数値 (7/4/2/1/1 日、3/150/10/60/3/60 秒) は本文・図に一切現れず、図の網と例は自作。比喩 (引っ越し・料理の分担・当番表) も引用題に無い場面。
6. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 3 文 × 4、比喩 3 (アローダイアグラムは空 = 前回 MEDIUM の解消策) は定義の言い換えでない、フック 4 は語源 (Review / arrow / critical / matrix) で別の手がかり。定義前使用: 前提作業 (PERT detail で定義)、結合点 (アロー one)、ダミー作業 (アロー detail)、クリティカルパス・余裕日数 (CP one・detail)、特性要因図・パレート図 (mix 考点内で説明)、新QC七つ道具 (名前のみ)。PERT fig caption 4 の「矢線の図」は次用語の見出し語を使うが detail で「矢線の図であるアローダイアグラム」と先に注 (前回 LOW は解消)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「頻出」、「結合点から**出る**作業」(通常の用法)、図ラベル「経路を**選ぶ**」(通常の用法) のみで定型締め句 0。zh・en (必须 / 重点 / must / Exam[ining]) も全て通常用法の偽陽性。図の型: PERT = flow steps 4、アロー = network widget、CP = flow steps 4、マトリックス = static table → 全て登録内。pair 1 組 (アロー / マトリックス、4 行 key 1) は マトリックス図 の後に配置。
7. **D-200**: 考点数 2/2/3/1 (≤3 ✓)、各 JP 文数 1〜2・字数 35〜70 (≤100 ✓)。framing (validateV2) = validate 0 issues。
8. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 → §3 L2 (矢線 1 本 = 1 作業 とダミー、同一欄内で直後に例外を明示) のみ、欄同士の不整合 0。書き方 8 (対比の出現欄) → アロー / マトリックス は `pairs[0]` のみ、アロー / 特性要因図・マトリックス / パレート図 は各 mix 考点 1 箇所、goals[2] は予告のみ → 反復なし。書き方 9 (限定条件) → §2 表に記載、落ち 0。§6 → 比喩 3 つとも別場面の像で、D-204 (比喩の像が考点の否定内容を運ぶ) に当たるものなし: 料理の分担 = 最も時間のかかる流れが全体を決める (最長経路と一致)、当番表 = 人 × 仕事の 2 種の要素群 (one の「2 つの要素群」と一致)、引っ越し = 前提作業と並行作業。
9. **D-205**: 改訂される文書 (規格・法令・ガイドライン・知識体系) の構成要素の数・名称の列挙なし。マトリックス図 detail「アローダイアグラムと同じく、新QC七つ道具の一つ」は手法集の所属を述べるだけで、数・全構成要素の列挙をしておらず、両手法は新QC七つ道具のどの版でも構成員 → 対象外。
10. **PERT / アローダイアグラムの呼び分け**: 単元は「PERT = 技法、その計画を描く図 = アローダイアグラム」とだけ言い、引用題が支持しない差 (例えば「PERT 図とアローダイアグラムは別の図」) は作っていない。引用題 2 題とも PERT・アローダイアグラム・クリティカルパス分析を同じ題の terms に持ち、区別を問わない → 問題なし。
11. **マトリックス図 vs マトリックスデータ解析法**: 単元はマトリックスデータ解析法に触れず、マトリックス図を「2 つの要素群 × 行列、交点に関係の有無・強さの記号」と定義 (数値データの多変量解析と混同する記述なし)。図 (要求 × 設計項目、◎ / ○ / －) と detail の記号説明が一致 (前回 LOW の「－」未説明は解消)。
12. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 6 種 (アローダイアグラム / 特性要因図 / クリティカルパス分析 / クリティカルパス / マトリックス図 / パレート図) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` (PERT は jp・zh・en 同形のため不要、他 3 用語あり)、zh 訳語 (`zh_terms.unit.json`: 箭线图 / 关键路径 / 关键路径分析 / 矩阵图 / 因果图 / 帕累托图 / 节点 / PERT（计划评审技术） 一致)。
13. **前回 journal (`journal.b07-u03-a1.jsonl`) の指摘**: jp-review r1 MEDIUM 2 件 → 解消を確認 (アロー analogy = 空、マトリックス analogy = 当番表で 2 要素群)。r1 LOW 5 件のうち「－」未説明・caption の定義前使用・アロー hook「矢線 1 本」は解消、PERT points[1] の薄さ・CP points[2] の言い直しは残る (下記 L1・L4)。r2 LOW 4 件・loc-review LOW 7 件は大半が未反映 (下記 L3・L5〜L8)。退行なし。
14. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | PERT | OK — exam 2 / 2 題: 前提作業と所要日数が分かれば全体の最短日数を計算できる (2016h28h-q052 正答ウ、全体 7 日を求めることが前提) / 単位は日に限らず秒・分の段取りにも同じ考え方 (2021r03-q050 正答ア、秒単位) — 両題を正しく支持。名称 Program Evaluation and Review Technique は正しい。flow steps 4 (洗い出し→前提作業→日数見積もり→図に描き期間) は detail と一致 | OK | en 図ラベル L6 | L1 (points[1] と one の語のずれ)、L6 |
| 2 | アローダイアグラム | OK — exam 1 / 1 題 + mix 1 / 1 題: 合流する結合点からの作業は入る作業すべての完了待ち (2016h28h-q052 で E が B・D 両方を待つ) / 魚の骨の形 = 特性要因図で別物 (2014h26h-q004 正答イ; 誤答ア のアローダイアグラムを否定)。detail のダミー (実体なし・順序のみ・点線・0 日) 正しい。network widget = §1-3 で全数値再計算一致 | OK | OK | L2 |
| 3 | クリティカルパス分析 | OK — exam 2 / 2 題 + mix 1: 非 CP 作業は「その作業を通る最長経路と CP の差」まで延ばせる (2016h28h-q052 → 2、再計算一致; 限定条件「全体の期間を延ばさずに」保持) / 並行作業は別経路、全体は最長経路 (2021r03-q050 → 223、再計算一致; 限定条件「並行して進められる場合」保持) / mix: 最長であって最短ではない — 正しい。detail「CP 上の作業が遅れると全体も同じ日数遅れる」「それ以外には余裕日数」正しい。flow steps caption 全数値一致 (§1-3)。※「非 CP 作業を短縮しても全体は縮まない」「CP 作業を縮めると CP が移り得る」は本単元では述べない (誤りではなく不在; management-10-27-u02 の考点が後者を扱う) | OK | analogy 語の幅 L5 / en 図ラベル L6 / zh 余裕日数 L7 | L3, L4, L5, L6, L7 |
| 4 | マトリックス図 | OK — mix 1 / 1 題: 大きい順の棒 + 累積比率の折れ線 = パレート図で、マトリックス図とは別 (2017h29a-q008 正答ウ; 誤答エ マトリックス図を否定)。one・detail・table (要求 × 設計項目、◎○－) 一致。新QC七つ道具の構成員である点は正しい (D-205 対象外、§1-9) | OK | en 表見出し L8 | L8 |

**単元レベル**: goals 3・overview_cols 2 (形 / 主な用途)・overview_rows 4・pairs 1 組 (アロー / マトリックス 4 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 4 件 (2016h28h-q052 / 2021r03-q050 / 2014h26h-q004 / 2017h29a-q008 — 本文と矛盾なし)。key_points[2]「日数合計が最大の経路が CP、その合計が全体の最短所要期間」・[3]「CP 上の遅れは全体の遅れに直結、それ以外には余裕日数」は再計算結果と一致。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 3: L5・L6・L8)** + 範囲外観察 4

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW 記録のみ | `terms[0].points[1].text_jp/zh/en` ↔ `terms[0].one_jp` | one・overview は「所要日数」で整理と書き、考点は「単位は日に限らない」。one は日に限るとは言っておらず矛盾ではない (jp-review r1 / r2 の LOW が残る)。考点は 2021r03-q050 の秒単位を支持し正しい | 記録のみ |
| L2 | LOW 記録のみ | `terms[1].detail_jp/zh/en` 1 文目 ↔ 3 文目 | 「矢線 1 本が 1 つの作業を表し」の直後にダミー (作業の実体がない矢線) を例外として示す。同一欄内で明示されており誤学習にはならない | 記録のみ |
| L3 | LOW 記録のみ | `overview_rows[0].extra_jp[0]` / `overview_rows[2].extra_jp[0]` (+ zh/en) | 列名「形」に対し PERT は「技法 (…)」、CP 分析は「経路の比較」で形を答えていない (jp-review r2 LOW、未反映) | 記録のみ |
| L4 | LOW 記録のみ | `terms[2].points[2].text_jp/zh/en` | mix 考点「最も長い経路であり、最も短い経路ではない」は one の言い直し (D-203 §9)。ただし「最短ではない」の否定が考点の価値 | 記録のみ |
| L5 | LOW **建議修** | `terms[2].analogy_jp` / `analogy_zh` | jp「一番**手間**のかかる料理」/ zh「最费**工夫**的那道菜」は労力の量で、en「most **time-consuming** dish」と語の幅がずれる。クリティカルパスは日数 (時間) の最長であり、労力最大と読まれると工数と期間の混同を招き得る | jp「一番手間のかかる料理ができたとき」→「一番時間のかかる料理ができたとき」/ zh「最费工夫的那道菜」→「最费时间的那道菜」/ en 変更なし |
| L6 | LOW **建議修** | `terms[2].fig.data.nodes[3].label.en`、`terms[0].fig.data.nodes[3].label.en` | CP 図の en「That total is the shortest」は直前の「Pick the largest total」と並んで「largest なのに shortest」と矛盾に読める (jp「その合計が全体の最短期間」の「全体の期間」が欠落)。PERT 図の en「Draw it and find the total」も何の合計か不明 (loc-review LOW、未反映) | CP: "That total is the shortest" → "That total = shortest overall time" / PERT: "Draw it and find the total" → "Draw it, find the total time" |
| L7 | LOW 記録のみ | `terms[2].detail_zh` ほか「富余天数」、`terms[0].hook_zh`「复查 / 修订」 | 余裕日数 = 富余天数 (平易語、標準は 浮动时间 / 总时差、zh_terms 未登録)。PERT hook_zh で Review が 复查 / 修订 の 2 語に割れる (loc-review LOW、未反映) | 記録のみ |
| L8 | LOW **建議修** | `terms[3].fig.data.cols[0].en`、`terms[3].fig.data.rows[2].cells[0].en` | en 表見出しに全角「＼」が残る、「Long usage time」は英語として不自然 (loc-review LOW、未反映) | "Requirement＼Design item" → "Requirement / Design item" / "Long usage time" → "Long battery life" |

**対比の出現欄 (書き方 8 の列挙)**: ① アロー / マトリックス: `pairs[0]` のみ (overview 総表の列は D-195 §3 の構造、goals[2] は予告) → 許容。② アロー / 特性要因図: `terms[1].points[1]` のみ。③ マトリックス / パレート図: `terms[3].points[0]` のみ。④ 最長 / 最短: `terms[2].points[2]` (L4) のみ。

**範囲外の観察** (書き直し対象外):
- O1 **既存 v2 単元との重なり**: `grep -l アローダイアグラム data/ip/textbook/units/*.json` → `management-10-27-u02` (スコープとスケジュールのマネジメント) のみ。同単元のアローダイアグラム用語 (矢線・結合点・合流点は遅い方に合わせる・余裕 = 通る最長経路と全体最長の差・CP 上の遅れ = 全体の遅れ・ダミー = 日数なし順序のみ) と本単元は**矛盾なし**。呼称は同単元が「矢印 / 丸」、本単元が「矢線 / 丸印の結合点」で、どちらも矢線・結合点を定義しており衝突しない。同単元の「CP を縮めても別経路が最長になれば縮めた分ほど縮まない」は本単元に無いが、本単元の記述と矛盾しない。
- O2 **2021r03-q050 の原文データ**: `questions.json` の `stem_jp` は「移動 片道 50 秒」「C 18 秒」で、その値では PC 側 231 秒となり選択肢に無い。表示層 `translations/2021r03.json` の `stem_jp_clean` と `source_figures` の記述は 60 秒・10 秒で正答ア 223 と一致 → 表示は clean 優先のため学習者影響なしと判断。本単元の考点は数値を使わないので影響なし。
- O3 `source_figures` に v1 由来の本単元と無関係な題 (2013h25a-q092 / 2009h21h-q095 / 2010h22h-q002) が残る (v1 と同一、未改稿フィールド)。
- O4 CP 図の caption (10 / 8 / 7 日) は前図 widget の既定値に依存し、読者が日数を書き換えると表示と食い違う (jp-review r2 LOW)。caption は「前の図」の既定値を前提とした説明で、widget に元に戻す操作 (`changed` 判定) がある → 記録のみ。

確認済みで問題なし: 計算題 2 題の再解答 (単元の規則で正答)、network widget の全数値 (最早・最遅結合点時刻、CP、総日数、余裕) 再計算一致、ダミー (dashed・0 日・依存のみ)、PERT / アローダイアグラムの呼び分け (創作の区別なし)、マトリックス図とマトリックスデータ解析法の混同なし、限定条件 (考点 7 件全て保持)、§9 禁止句 (定型締め句 0)、D-197 羅列 (validate 0)、D-200 (≤3 件、≤2 文、≤70 字)、D-198 写し (validate 0、独立照合 遮蔽あり / なし / 近似 とも 0)、D-205 (対象なし)、`[[jp:]]` 原語 (6 種全て実在)、zh 訳語表、図種 (flow steps ×2 / network widget ×1 / static table ×1 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 2 件の解消と退行なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 3: L5・L6・L8 / 記録のみ 5: L1〜L4・L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 4 用語・考点 8 件 (qid 付き 7 件)・引用 4 題 (計算題 2 題は再解答で単元の規則から正答) で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、限定条件の落ちも無い。アローダイアグラム widget とクリティカルパス段階図の数値は手計算と `criticalPath()` 実行の両方で一致。LOW 建議修 3 件 (L5・L6・L8) は補丁 (B3) で修正推奨、残りはバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-01-02-u03
✓ strategy-01-02-u03 unit: 0 issues (data/ip/textbook/units/strategy-01-02-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-01-02-u03
✓ strategy-01-02-u03 parity: 24 locations, 0 diff
EXIT=0
```
