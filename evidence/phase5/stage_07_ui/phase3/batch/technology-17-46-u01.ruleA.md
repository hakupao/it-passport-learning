# Rule A 全数抽検 — technology-17-46-u01 (ファイルシステムの基礎 — ディレクトリ管理とバックアップ)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S150 b59)、repo HEAD `1cf1dd1e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b59-u01-a2` merge 結果、`merged.json` と同一、sha256 先頭 `21417c53b1893abd`)。
- **対象**: `data/ip/textbook/units/technology-17-46-u01.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (ルートディレクトリ / カレントディレクトリ / ファイル拡張子 / フラグメンテーション / アーカイブ / バックアップ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 / D-203、D-204 / D-205、D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/technology-17-46-u01/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`summary.key_points_*` = `key_points_*`、`summary.memory_hooks_*` = 「用語: hook」で一致。
2. **考点 × 引用題 (考点 全 11 件 = exam 9 + mix 2、qid 付き 9 件、引用 qid 延べ 13 件 = 異なり 12 題)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` の stem_jp_clean で各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-17-46`)。**パス題・バックアップ題は全て手で解き直した** (§2a)。考点の主張が正答と一致し、誤答肢を支持せず、限定条件を外していないことを 1 件ずつ確認。
3. **quiz / challenge_questions** (quiz 計 12 枠 = 異なり 12 題 + challenge 5 題、うち本文で未引用 6 題 = 2022r04-q090 / 2012h24h-q081 / 2011h23a-q074 / 2009h21h-q057 / 2017h29a-q073 / 2015h27a-q079; challenge の 2016h28a-q075 は current p0 で引用): 本文と矛盾しないこと、本文の手がかり (hook・図・比喩) を題の場面に当てたとき誤答肢を選ばせないことを確認 (D-208 (9))。
4. **D-198 写し**: validate の copy guard = 0 件 (`warn choice-echo` 行も 0)。独立照合として単元の JP 文字列 118 本 (派生・summary・source_figures 除く) を topic 内全 26 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。カタカナ 4 字以上と英数を □ 遮蔽 (実字 6 未満の窓は除外) → **0 件**。**遮蔽なし** → 2 件、近似照合 (14 字窓・編集距離 ≤2) → 10 件、全て偽陽性:
   - `terms[0].one_jp` ↔ 2011h23a-q074 (遮蔽なし 12 字 + 近似 ed 2): 一致部は「階層型ディレクトリ構造の」= シラバス上の構造名そのもの。表現の写しではない。
   - `terms[5].points[1].text_jp` ↔ 2026r08-q086 (遮蔽なし + 近似 ed 2): 一致部「(は) 最後のフルバックアップ」は差分方式の標準的な定義句。題の曜日 (土曜フル・火曜差分) は一切使わず、正答の内容を一般規則として述べる (D-209 の正答一般化に当たる。誤答肢 [差分を複数日分・差分だけ・フルなし] の組や順をなぞらない)。限定「最低限」は題の問い方どおり保持。
   - `goals_jp[0]` / `overview.intro_jp` ↔ 2009h21h-q057 / 2011h23a-q074 / 2016h28a-q075 (ed 1〜2): 見出し語 2 つ (ルートディレクトリとカレントディレクトリ) の連なり。用語名は表現ではない。
   - `terms[1].detail_jp` ↔ 2012h24a-q063 (「カレントディレクトリが変わる/異なる」ed 2)・2019r01a-q083 (「カレントディレクトリを起点に/基点と」ed 2): 見出し語 + 1 語の一般表現。校正値 (HIGH 例 ed 0.14 / Dice 0.52) の水準には遠い (14 字中 2 字差は見出し語 10 字を含む窓)。
   - 目視: カタカナの多い文 (`terms[5].detail_jp` の 3 方式の定義、`terms[5].points[0..1]`、`terms[3].points[0]`、`terms[2].points[0]`) を 2016h28h-q092 / 2026r08-q086 / 2012h24h-q081 / 2011h23tokubetsu-q080 / 2018h30h-q085 と並べて読んだ。2016h28h-q092 の増分の但し書き (前回のフル又は増分以降) と detail の増分定義「直前のバックアップ以降の変更だけ」は語が異なる標準定義。ワイルドカードの「?」= 1 文字・「*」= 0 文字以上は 2018h30h-q085 の但し書きと同じ内容だが、記号の標準的な意味の一般表現 (写しではない)。
   - (iii) 選択肢のなぞり: 2009h21a-q087 (適切なもの 1 つ) に対し `terms[0].points[1]` は正答 ア の事実だけを一般則で述べ、誤答 イ (カレント = 常に最上位)・ウ・エ を並べて打ち消していない (イの否定は mix 考点・pairs が定義の対比として正の形で述べる = D-209 非該当)。2012h24h-q081 の誤答側 (サーバ内部に置く) を打ち消す旧 `terms[5].points[2]` は a1 r2 の MEDIUM で削除済みで、`key_points_jp[3]` / one の「別の媒体や場所」は一般原則 (題の曜日・フォルダの場面なし)。比喩 (住所・道案内・封筒の表書き・駐車場・段ボール箱・合鍵) はいずれも引用題に無い場面。図の木 (home/taro/memo.txt・work/data.csv)・段階図 (2026→photo→home→music/b.mp3)・拡張子表・バックアップ表はいずれも自作で、題の構造 (A/B の同名木、DIRA/DIRB、d1/d2、D1〜D5、日曜/土曜起点の曜日) を使っていない。
5. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2〜3 文 (2/3/3/3/2/2 文)、比喩・フックが定義の言い換えでないこと (英語の語源・別場面のたとえ)、定義前使用 (絶対パス = root detail、相対パス・「.」「..」= current detail、ワイルドカード = 拡張子 detail [a2 r1 LOW を解消]、デフラグ = 断片化 detail、リストア・3 方式 = backup detail; 「ノード」は本文から消えた)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → **「〜と覚える」6 件** [`terms[2]` / `terms[3]` の `hook_jp` 2 + 派生 `memory_hook_jp` 2 + `summary.memory_hooks_jp[2..3]` 2] のみ → L6。zh・en 相当語 grep のヒット [`kind: exam`、example 内の exam、every 内の very、always (root points[0].text_en の「同じ場所は常に同じ表記」)] は全て通常の用法で偽陽性)、図の型 (root = tree static、current = flow steps 4、拡張子 = static table、断片化 = flow steps 4、backup = static table、アーカイブ = 図なし; 全て登録内)、pair 配置 (ルート→カレントはカレントの後、アーカイブ→バックアップはバックアップの後、各組 key 行あり)。
6. **D-200**: 考点数 2/3/1/1/2/2 (≤3 ✓)、各 JP 文数 1〜2・字数 40〜78 (≤100 ✓、最大は断片化 `points[0]` の 78 字 2 文)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-205 単元全体点検**: 書き方 7 (欄同士の照合: 断片化の HDD 限定は one〔装置を限らない状態の定義〕・detail・points[0]・fig step 4・key_points[2] で「影響はハードディスクで」と揃う; 増分の復元範囲は fig rows[2]・points[0] とも「戻したい時点まで」で揃う [a1 r1 MEDIUM 解消]; 差分は fig rows[1]・points[1] とも「戻したい時点の差分」; pairs[0].rows[1]「ルートは動かない / カレントは移動で変わる」と current one・mix 考点一致; backup one「別の媒体や場所」と key_points[3]・pairs[1].rows[1] 一致) → 不整合 0。書き方 8 → L3 で列挙。書き方 9 (限定条件) → §2 表、落ち 0。D-205: 方式の列挙は「例えば」(backup detail)、ZIP は「例えば」(archive detail) 付き。改訂文書の構成要素の数は本単元に無し。D-210: 法令・規格に依る題なし。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 82 タグ全てが対応 jp 欄と単元 jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` に従うこと (根目录 / 当前目录 / 文件扩展名 / 碎片化 / 归档 / 备份 / 操作系统 / 误操作 / 文件 一致; validate の B6 warn 0 / jp-origin warn 0)。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。
10. **前段レビューの HIGH / MEDIUM の解消確認** (journal `b59-u01-a1` / `a2`): a1 r1 HIGH (断片化考点の HDD 限定落ち) → `terms[3].points[0]` に「ハードディスクのように読み取り位置を動かして読む記憶装置では」、zh「像硬盘这样要移动读取位置来读数据的存储设备」、en "On storage devices that read by moving a read position, such as hard disks" で三語とも解消。a1 r1 MEDIUM (増分の復元範囲が時点で区切られない) → fig rows[2].cells[2]・points[0] 三語とも「戻したい時点まで」で解消。a1 r2 MEDIUM (2012h24h-q081 の保管場所の選択肢なぞり) → 該当考点削除、回帰なし。a2 r1 MEDIUM (2022r04-q090 の節/葉の組なぞり) → `terms[0].points[1]` は同名ディレクトリの規則に差し替え済みで節・葉・空ディレクトリの語は単元に無い、回帰なし (副作用は L5)。loc r1 の LOW 6 件は未修のまま (L1・L2・L8 に記録)。

## 2a. 手計算 (パス題・バックアップ題・図)

| qid | 用途 | 手計算 | 正答 | 単元との関係 |
|---|---|---|---|---|
| 2014h26h-q068 | root p0 / current p1 / quiz | 現在 \B\A\A → `..` \B\A → `..` \B → `B` \B\B → `B` \B\B\B | エ ✓ | current p0 (「..」1 つで 1 階層上、続く名前を下る) と p1 (行き先をルートから書き直す = 絶対パス) で解ける |
| 2012h24a-q063 | root p1 | U0002 の現在 \A\B\A → `..` ×3 でルート → B\f = ..\..\..\B\f | エ ✓ | root p1 は「同名ディレクトリが親違いで並存」の前提を支える (題の計算は current p0 で解ける) |
| 2014h26a-q075 | current p0 / quiz | B → `..` A → D/E/img.jpg = ../D/E/img.jpg (上がった先の A を再度書かない) | イ ✓ | p0「そこから下位のディレクトリ名を順にたどる」は ア (A を重ねる) を支持しない |
| 2019h31h-q096 | current p0 / quiz | d1 → `..` ルート → d2/f2.html = ../d2/f2.html | ウ ✓ | 一致 |
| 2016h28a-q075 | current p0 / challenge | 現在 \DIRB\DIRA\DIRB → `..` \DIRB\DIRA → `..` \DIRB → DIRB\Fn.txt = 上の DIRB の下の DIRB 直下 = ④ | エ ✓ | 一致 (同名 DIRB の取り違えを root p1 の「経路全体で場所が決まる」が防ぐ) |
| 2009h21h-q057 | challenge | D3 → `..` D1 → D2\D4\a = ..\D2\D4\a (ウ は規則 (5) で .\D1… の相対になり不可) | イ ✓ | 一致。単元の手がかりは ウ を選ばせない |
| 2011h23a-q074 | challenge | ルート = a、絶対パス = b、カレント = c | ウ ✓ | 3 用語の one / root detail と一致 |
| 2019r01a-q083 | root p0 / quiz | 最上位 = ルート、ルート起点 = 絶対 | ウ ✓ | 一致 |
| 2018h30h-q085 | 拡張子 p0 | `*A*.te??`: ① A.text = (空)A(空).te+xt ✓ / ② AA.tex は `??` に 1 字しかない ✗ / ③ B.Atex は A の後に `.te` が来ない ✗ / ④ BA.Btext は `.` の直後が B で `.te` にならない ✗ | ア ✓ | p0 (「?」ちょうど 1 文字・「*」0 文字以上、拡張子部分にも働く) で解ける |
| 2016h28h-q092 | backup p0 / quiz | 日曜フル + 月〜土増分、火曜終了時点へ → 日曜フル + 月増分 + 火増分 | ア ✓ | p0「基準のフルと、戻したい時点までの増分すべて」と一致 (イ = 火曜増分だけを否定) |
| 2026r08-q086 | backup p1 / quiz | 土曜フル + 日〜金差分 (累積)、火曜終了時点へ → 土曜フル + 火曜差分 (日・月分は火曜差分に含まれる) | エ ✓ | p1「最低限…最後のフルと、戻したい時点の差分」と一致 (ウ = 差分を全日分は最低限でない) |
| 2012h24h-q081 | quiz | 前日終了時点へ戻すには毎日の取得が要る (ア・イ 不可)、障害対象のサーバ内に置くと一緒に失われる (エ 不可) | ウ ✓ | one / key_points[3]「別の媒体や場所」・差分の定義で解ける |
| 2017h29a-q073 | challenge | 月〜木: 1,000 個 × 3MB = 3,000MB ÷ 10MB/s = 300 秒 = 5 分 × 4 日 = 20 分 / 金: 6,000 × 3MB = 18,000MB ÷ 10 = 1,800 秒 = 30 分 / 計 50 分 | ウ ✓ | 月〜木は「その日の更新分だけ」= 直前 (前日) 以降の分 = 増分型 (日量一定 3,000MB)。差分型なら日ごとに累積して増える、が fig「毎回複製する範囲」と整合。本文と矛盾なし |
| 2015h27a-q079 | challenge | 変更内容の特定 = 複製を取って照合 | イ ✓ | backup の「複製」と矛盾なし (つながりは弱い、L9) |

**図の点検 (三語)**: root の木 (ルート/根/Root → home → taro → memo.txt、work → data.csv) はラベル三語一致、枝分かれ正しい。current の段階図は ../../music/b.mp3 を 2026 (現在) → photo → home → music/b.mp3 とたどり、home/photo/2026 と home/music/b.mp3 の階層を前提に `..` 2 回 + 下り 1 段で正しい (caption 4 段・node 4 つの三語とも同じ経路、「親の photo / 上一级 photo / Parent: photo」等一致)。断片化の段階図 4 段は one・detail と一致。拡張子表 (.txt / .png / .mp4 / .zip) とバックアップ表 (毎回複製する範囲 / 復元に使うもの) の各セル三語一致 (en の 1 セルの曖昧さ → L1)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ルートディレクトリ | OK — exam 2 / 4 題: 絶対パスはルート起点なのでカレントの位置によらず同じ表記 (2019r01a-q083 正答ウ / 2014h26h-q068 正答エ、§2a) / 場所は経路全体で決まり、親が違えば同名ディレクトリを置ける (2009h21a-q087 正答ア「階層が異なれば同名可」: 親違いの条件は階層違いを含むので ア を支持し、誤答 イ〜エ を支持しない / 2012h24a-q063 の同名木の前提)。quiz 2022r04-q090 (正答ア) とも矛盾なし | OK | OK | L3 (p0) / L5 (図) / L9 (p0 の定義前使用) |
| 2 | カレントディレクトリ | OK — exam 2 / 3 題 + mix 1: 「..」1 つで 1 階層上、そこから下位を順に (2014h26a-q075 イ / 2019h31h-q096 ウ / 2016h28a-q075 エ、全て再計算一致) / 相対パスの行き先をルートから書き直すと絶対パス (2014h26h-q068 エ) / mix: カレントは動き、ルートは固定 (2009h21a-q087 誤答イ を否定する正の対比)。detail「多くの場合」「変わることがある」で限定を保持 (a1 r2 LOW 解消) | OK | analogy_en の付加 L8 | L3 (p1) / L7 |
| 3 | ファイル拡張子 | OK — exam 1 / 1 題: 「?」= ちょうど 1 文字、「*」= 0 文字以上、拡張子部分にも同じ (2018h30h-q085 正答ア、§2a)。detail「書き換えても形式は変換されない」は標準事実 | OK | OK | L6 (hook) / L7 |
| 4 | フラグメンテーション | OK — exam 1 / 1 題: HDD のように読み取り位置を動かす装置では放置で読み出しが遅く、デフラグで解消 (2011h23tokubetsu-q080 正答エ; 誤答 イ 書き込めない・ウ 読み取れない を支持しない、限定「PC のハードディスク」を保持)。図 4 段一致 | OK | en 直訳調 L8 | L3 (p0) / L6 (hook) |
| 5 | アーカイブ | OK — exam 1 / 1 題 + mix 1: 多数のファイルを保存・保管しやすく 1 つに束ねる (2021r03-q083 正答ア) / mix: 束ねる = 個数、圧縮 = データ量、働きは別 — 正しい | OK (p0 の並び L4) | one_en 文型 L8 | L3 / L4 |
| 6 | バックアップ | OK — exam 2 / 2 題: 増分 = 基準のフル + 戻したい時点までの増分すべて (2016h28h-q092 ア) / 差分 = 最低限、最後のフル + 戻したい時点の差分 (2026r08-q086 エ、限定「最低限」保持)。題ごとの方式定義 (q092 の増分 = 前回のフル又は増分以降、q086 の差分 = 最後のフルから当日まで) と detail の定義一致。quiz 2012h24h-q081 (ウ) と one / key_points[3] 整合 | OK | en 1 セル L1、one_en L2、detail_zh L8 | L1 / L2 / L3 |

**単元レベル**: goals 3 点・overview_cols 1 (関係する語)・overview_rows 6 行・pairs 2 組 (ルート / カレント 3 行 key 2、アーカイブ / バックアップ 2 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2011h23a-q074 / 2009h21h-q057 / 2016h28a-q075 / 2017h29a-q073 / 2015h27a-q079 — 全て手で解き本文と矛盾なし、§2a)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 1)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[5].fig.data.rows[1].cells[2].en` | jp「フルバックアップと、戻したい時点の差分」/ zh「…要恢复到的时间点的差异备份」に対し、en "The full backup plus the differential from the point you want to restore to" の "from the point" は「その時点から先の差分」とも読め、同じ用語の `points[1].text_en` "taken at the point" とも表現がずれる (loc r1 LOW、未修)。2026r08-q086 の誤答肢を指す読みではないが、時点の区切りを誤読させうる | en: "The full backup plus the differential from the point you want to restore to" → "The full backup plus the differential taken at the point you want to restore to" (jp・zh は変更なし) |
| L2 | LOW | `terms[5].one_en` | jp「〜保管しておくこと」(行為) に対し en "A backup … is a copy of data kept …" (もの)。overview_rows[5].one_line_en は "Keeping a copy…" (行為) で欄の品詞がずれる (loc r1 LOW、未修)。考点・事実に影響なし | 記録のみ |
| L3 | LOW | `terms[0].points[0]` / `terms[1].points[1]` / `terms[3].points[0]` / `terms[4].points[0]` / `terms[5].points[0..1]` | D-203 §9 / 書き方 8: root p0 は root detail 2 文目の言い直し、current p1 は root detail の絶対パス定義の言い直し、断片化 p0 は detail 2〜3 文目・fig step 4・key_points[2] と同内容、アーカイブ p0 は one + detail 1 文目の言い直し、backup p0・p1 は fig「復元に使うもの」列と同内容 (差分 / 増分の対比は fig・detail 2 文目・p0・p1 に出る)。いずれも事実は正しく引用題と一致 | 記録のみ (引用題に直結する考点で、削ると考点が空になる) |
| L4 | LOW | `terms[4].points[0].text_jp` | 2021r03-q083 (名称を問う題) の題文の要素 (多数のファイル / 保存・保管 / ために / 1 つにまとめる) と同じ順で並ぶ。12 字一致・近似一致なし、見出し語の標準定義 (D-209 分類型の免除) で写しではない (a2 r1 / r2 の LOW 判定と同じ) | 記録のみ |
| L5 | LOW | `terms[0].fig` | root の木は葉が全てファイル (memo.txt / data.csv) で、quiz 2022r04-q090 (空のディレクトリを許すなら葉 = ディレクトリ又はファイル、正答ア) に図だけを当てると誤答イ (葉 = ファイル) に寄りうる。ただし題自身が「空のディレクトリを許す」と前提を与え、図は例示で「葉はファイルだけ」と主張していない (D-204 の矛盾ではない)。a2 r1 MEDIUM の修正 (節・葉の記述削除) の副作用。また root の木と current の段階図 (home/photo/2026、music) は別の木でつながらない (a2 r2 LOW) | 記録のみ (任意: 葉を空ディレクトリにする場合は `terms[0].fig.data.root.children[1].children[0].label` を jp「data.csv」→「tmp (空)」、zh「data.csv」→「tmp（空）」、en「data.csv」→「tmp (empty)」。ただし work 直下のファイル例が消える) |
| L6 | LOW | `terms[2].hook_jp` / `terms[3].hook_jp` (+ 派生 `memory_hook_jp`, `summary.memory_hooks_jp[2..3]`) | 「〜と覚える」2 件 (§9 grep の唯一のヒット)。記憶フックの言い方で定型締め句ではない (前例 u02/u04/u05 と同水準、6 フック中 2 件) | 記録のみ |
| L7 | LOW | `terms[1].points[0].text_jp` / `terms[2].points[0].text_jp` (zh・en 同) | detail_jp「多くの場合」・key_points_jp[0]「一般に」と限定するのに、考点は「..」・ワイルドカードの意味を限定なしで述べる (a2 r1 / r2 LOW)。引用題はいずれも同じ意味を題内で定義しており、広く使われる慣習なので事実の誤り・限定条件落ちには当たらない | 記録のみ |
| L8 | LOW | `terms[3].points[0].text_en` / `terms[4].one_en` / `terms[1].analogy_en` / `terms[5].detail_zh` | loc r1 の LOW (未修): "read by moving a read position" の直訳調、"An archive … means bundling …" の文型のねじれ、"only make sense from where the speaker is standing" の軽い付加、「备份的取法例如有」の語感。事実・引用題への影響なし | 記録のみ |
| L9 | LOW | `terms[0].points[0].text_jp` / `challenge_questions[4]` | root の考点が次節で定義するカレントディレクトリを使う (overview_rows[1] で先に一行定義あり)。2015h27a-q079 (変更内容の特定 = 複製を取って照合) はバックアップの「復元」目的とのつながりが弱い (同 topic の題で不正ではない) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① ルート = 固定 / カレント = 移動: `pairs[0].rows[1]`、`terms[1].points[2]` (mix)、各 one (定義そのもの) → 2 箇所で許容 (a1 r2 で hook からは除去済み)。② 絶対パス / 相対パス: `pairs[0].rows[2]`、各 detail (定義そのもの) → 許容。③ アーカイブ / バックアップの目的: `pairs[1].rows[0..1]` のみ → 許容。④ 差分 / 増分: `terms[5].fig` 2 列、`detail_jp` 2 文目 (定義)、`points[0..1]` (片側ずつ) → L3。⑤ アーカイブ / 圧縮: `terms[4].points[1]` (mix) と detail の ZIP 例 (同時に行える事実のみ) → 許容。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 1: L1 / 記録のみ 8: L2〜L9、うち L5 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 11 件 (qid 付き 9 件)・引用 12 題 + 未引用の quiz / challenge 6 題で、パス計算題 6 題 + 用語題 2 題・ワイルドカード題 1 題・バックアップ題 4 題 (計算題 2017h29a-q073 = 50 分を含む) を手で解き直し全て正答一致。考点の主張は正答と一致し、誤答肢を支持する記述・選択肢のなぞり・限定条件の落ちは無い。前段の HIGH 1 / MEDIUM 3 は三語とも解消済みで回帰なし。LOW 建議修 1 件 (L1) は補丁 (B3) で修正推奨、L2〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-17-46-u01
✓ technology-17-46-u01 unit: 0 issues (data/ip/textbook/units/technology-17-46-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-17-46-u01
✓ technology-17-46-u01 parity: 30 locations, 0 diff
EXIT=0
```
