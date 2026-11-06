# Rule A 全数抽検 — technology-21-55-u03 (データ分析と前処理)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / JP reviewer / localiser / loc reviewer) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-11-06 (S147 第 26 批 b26、run `b26-u03-a1`)、repo HEAD `d6e47a0c` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `merged.json` と同一バイト、sha256 先頭 `2c633e42a55568d7`)。
- **対象**: `data/ip/textbook/units/technology-21-55-u03.json` (textbook-unit-v2)、用語 **3 / 3 = 全数** (データクレンジング / データの結合 / コード設計) + 単元レベル (goals / overview_rows / pairs / key_points / summary / overview.intro / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203 (重大度)、D-204 / D-205 (S138 §2・§6)、D-208 / D-209 (既知の失敗型 (1)〜(10))、D-210 (改正前の版)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/technology-21-55-u03/v1-original.json` (用語 3 語・`term_zh`・`term_en`・title・unit_summary・prerequisites・source_figures とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・支持のない限定 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 3 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (cols・cells・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 4 件 = exam 3 + mix 1、qid 付き 3 件、引用 qid 3 題)**: `data/ip/quiz/questions.json` から各題の `correct_answer` を、題文・選択肢は `translations/<exam>.json` の `stem_jp_clean` / `choices` で再読 (topic `technology-21-55` = 55 題)。考点の主張が正答と一致し、誤答肢を支持せず、支持のない一般化・限定が無く、題の限定条件を外していないことを 1 件ずつ確認。計算題 2010h22a-q088 は 4 選択肢とも自分で再計算 (正答エ: 9 桁の和 37 → 10 → 1 = 末尾 1 で一致、ア 和 45 → 9 ≠ 0、イ 36 → 9 ≠ 4、ウ 29 → 11 → 2 ≠ 1)。
3. **quiz / challenge_questions** (quiz 2 枠 + challenge 4 題、うち本文で未引用 1 題 = 2011h23a-q057): 本文と矛盾しないことを確認。q057 (社員表と部署表の多重度 = 多対 1、正答ウ) は前提単元 u01・u02 のキー・E-R の題で、本単元の本文は多重度を述べず矛盾も無い (データの結合 points[0] の主キー / 外部キーで表を関連付ける記述とつながる程度; JP review r1・r2 の LOW と同判断)。v1 の challenge にあった正規化・主キー 3 題 (2009h21a-q084 / 2010h22a-q063 / 2010h22h-q083) と v1 の結合 quiz (2009h21a-q063 正規化) は本単元の語を問わないため外されており妥当 (confirm 3〜5 の範囲内)。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 0 行 (warn 自体 0)。独立照合として単元の JP 文字列 72 本 (派生フィールド除く; goals・key_points・図セル/ラベル/caption・pairs・overview_rows 含む) を topic 内全 55 題の題文 (`stem_jp_clean`) + 選択肢 (計 275 本) と 12 字連続照合 (句読点・記号・空白・記法除去): **カタカナ 4 字以上 + 英数を □ 遮蔽 (実字 6 未満の窓除外) = 0 件 / 遮蔽なし = 0 件**。近似一致 (1〜2 字差し替え) は文単位で正規化編集距離 (ed) と bigram Dice を全組で計算 → 候補 (Dice > 0.35 または ed < 0.5) は 7 組で、全て偽陽性 (図セル「0001、0002、0003」の連番と 2014h26h-q060 / 2024r06-q081 の表中コード [Dice 0.36〜0.41, ed 0.66]、`terms[0].points[0]` 1 文目と q014 選択肢イ = 見出し語 1 語のみ [Dice 0.39, ed 0.74])。較正 (HIGH 例 ed 0.14 / Dice 0.52) から遠い。引用題と内容が重なる 4 文を個別計算: `terms[0].points[0]` 2 文目 ↔ q014 題文 Dice 0.21 / ed 0.82、`terms[1].points[0]` 2 文目 ↔ q072 (空欄を正答で埋めた文) Dice 0.14 / ed 0.84、同 1 文目 ↔ q072 後半 Dice 0.08、`terms[2].points[0]` 1 文目 ↔ q088 題文 Dice 0.31 / ed 0.97 → 写しなし。カタカナの多い文 (図の 順番号コード / 区分コード / 桁別コード / 表意コード、考点のデータクレンジング / データモデリング / チェックディジット) を目視: 題の選択肢の並びや句の再現なし (見出し語単独の一致のみ)。
5. **D-195**: 結論先行 (one = 1 文 × 3、太字あり)、展開 3 / 3 / 3 文、定義前使用 (データの品質 = one の太字、重複・表記の揺れ・欠損 = detail 内で定義、キー = one の括弧注、主キー・外部キー = 考点内で役割を定義、データモデリング = 考点内で定義、コード = one の括弧注、チェックディジット = detail 内で定義)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh 务必 / 重要 / 一定 / 考试 / 必须 + en exam / must / important / always / tested / remember) → `freq_badge`「頻出」、`points[].kind` = "exam"、en の Example / example (偽陽性)、**「〜と覚える」2 件** (`terms[1].hook_jp` / `terms[2].hook_jp` + 派生 `memory_hook_jp` 2 + `summary.memory_hooks_jp[1..2]`) のみ → L7 (記録のみ)。図の型 (データクレンジング = static table 4 行、データの結合 = flow steps 4、コード設計 = static table 4 行; 全て登録内)、pair 配置 (クレンジング / 結合 = 結合の後、key 行 = 目的)。
6. **D-200**: 考点数 1 / 2 / 1 (≤3 ✓)、各 JP 文数 2・字数 75〜81 (≤100 ✓、最大 `terms[1].points[1]` 81 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合: クレンジングの対象 = one「集めたデータに含まれる誤りや不統一」・detail / 図 / key_points[0]「重複」・pairs[0].rows[1]「値やレコード」に対し考点 `terms[0].points[0]` だけ「データの値に含まれる」→ L1; key_points[3] の「計算し直すだけで打ち間違いに気づける」が考点の一方向の主張 [合わなければ誤り] より広い → L2; 順序「整えてから結合」は cleansing detail「集計や結合の前」と一致) → MEDIUM 級の不整合 0。書き方 8 (対比の出現欄) → クレンジング / 結合 = `pairs[0].rows[0]` + `terms[1].points[1]` の 2 箇所 (≤2 ✓)、クレンジング / データモデリング = `terms[0].points[0]` のみ。書き方 9 (限定条件) → §2 表に考点ごと記載、落ち 0。§6 → L5 / L6。§9 言い直し → L8。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 7 種 (データクレンジング / データモデリング / データの結合 / 主キー / 外部キー / コード設計 / チェックディジット) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 3 用語に見出し語の `[[jp:]]` あり、zh 訳語が `zh_terms.json` に従う (数据清洗 / 数据的结合 / 编码设计 / 主键 / 外键 / 记录 一致、validate の B6 warn 0 / jp-origin warn 0; 表に無い データモデリング = 数据建模、チェックディジット = 校验位 は通用訳)。前回指摘の zh / en 回帰も確認 (§2 末)。
9. **既知の失敗型 (D-208 (1)〜(10))**: §3 末に 1 件ずつ記録。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (3 / 3)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | データクレンジング | OK — exam 1 / 1 題: クレンジング = 値の誤り・不統一を正す作業、業務データの構造を実体と関連で整理する作業 = データモデリングで目的が異なる (2009h21a-q014 正答エ = データモデリング; 誤答イ = データクレンジングを正の定義で区別、誤答ア クリーニング・ウ マイニングには触れない)。分類題で「取り違えやすい 2 語を両側とも正の定義で対比」= D-209 の除外に当たり (iii) ではない。データモデリング側の言い方は題文の要素の順 (業務 → データの構造 → 実体 / 関連 → 整理) に沿うが、データモデリングの標準定義で、選択肢の組・順の再現は無く、近似度 Dice 0.21 → 写しでない (L4 記録)。「値に」の限定は L1。detail の不備 4 種は「例えば」付き (閉じた列挙でない)、図 4 行 (表記の揺れ / 重複 / 欠損 / 誤り・異常値) は detail と一致 | OK (D-197 validate 0) | OK (analogy_zh の「改名」は L9) | L1 / L4 / L8 / L9 |
| 2 | データの結合 | OK — exam 1 / 1 題 + mix 1: 表どうしを結ぶ手がかり = 両表にある同じ意味の列、多くの場合 主キー と それを参照する外部キー (2011h23tokubetsu-q072 正答ウ = a 主キー・b フィールド)。穴埋め題: 空欄を正答で埋めた文と比べると、考点は 2 つの正答の内容を一般定義として述べ、述べる順は題と逆、比較相手 (エンティティ / レコード) とは組にしていない → (iii) でない。誤答 b = レコード を支持しない (手がかりは「列」と明記; detail・図の「値が一致する行どうしを組にする」は結合の結果の説明で、関連付けの手段を行とは言わない)。限定条件: 題の「〜こともできる」に対し考点は「多くの場合」で言い切らない ✓ / mix: 結合 = 情報を組み合わせる、クレンジング = 品質を整える、整えてから結合が基本 (cleansing detail と整合)。r1 MEDIUM 2 件 (q057 の不適合 qid / 「1つのデータの中」の限定) は解消、zh / en にも回帰なし。flow steps 4 (会員表 + 購買表 → 共通列 → 一致行を組に → 1 つの表) は one・detail と一致。detail「例えば一致した行だけを残す方法」は「例えば」付き ✓ | OK | OK | L6 (pairs の組の弱さ) |
| 3 | コード設計 | OK — exam 1 / 1 題: チェックディジット = 元の桁から決めた規則で計算した数字、入力値を同じ規則で再計算し合わなければ入力誤り (2010h22a-q088 正答エ、4 肢とも再計算一致; 題の 9 桁・各桁和の反復規則・数値は考点に使っていない = 一般原則のみ)。考点は「合わなければ誤り」という一方向の主張で正しい。key_points[3] の言い方が広い → L2。detail (一意に見分ける・桁や範囲に意味で分類集計・桁数の余裕・チェックディジット) は標準的で正しい。図 (順番号 / 区分 / 桁別 / 表意コード、「付け方の例」= 閉じた列挙でない; 改正される文書の構成ではなく D-205 対象外) は正しい。analogy 郵便番号 (上位桁 = 広域、下位桁 = 細区域) は detail「桁に意味」と整合、図の「欠損: 郵便番号の欄」と衝突なし | OK | zh「后 2 位」L3、en "Positional code" 等は L10 | L2 / L3 / L5 / L7 / L8 / L10 |

**単元レベル**: goals 3 点 (overview.intro と一致)・overview_cols 1 (行う場面)・overview_rows 3 行 (extra は各 detail と一致: クレンジング = 集計・分析・格納の前)・pairs 1 組 (目的 [key] / 処理の後 2 行)・key_points 4 (L2 以外は本文と一致)・summary (記法除去版と一致)・challenge_questions 4 件 (2009h21a-q014 / 2010h22a-q088 / 2011h23a-q057 / 2011h23tokubetsu-q072 — 本文と矛盾なし、§1-3)。unit_summary は v1 と同文 (未改稿)。事実誤りなし。

**前回指摘の解消確認 (journal `b26-u03-a1`)**: jp-review r1 MEDIUM ① `terms[1].points[0].qids` から 2011h23a-q057 を除去 → 現 qids = 2011h23tokubetsu-q072 のみ ✓ ② `pairs[0].rows[0]` = 目的行 (key: true)、mix 考点から「1つのデータの中」を削除 ✓ (zh「目的」/ en "Purpose"、mix の zh / en も限定なし = 回帰なし)。r1 LOW の「検査数字」は考点で「チェックディジット」に統一 ✓、hook の「1桁」の言い切りは削除 ✓。r2 LOW (key_points[3] の言い切り・考点の「値」) と loc-review r1 LOW 7 件は未修正 → 本監査で L1〜L3 を建議修、残りを記録のみに再判定。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 3)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0](データクレンジング).points[0].text_jp` / `text_zh` / `text_en` | 対象を「データの値に含まれる誤りや不統一」と書くが、同用語の detail・図・`key_points[0]` はレコード単位の不備「重複」(同じ会員の 2 件登録) を含め、`pairs[0].rows[1].a_*` も「値やレコード」。構造 (データモデリング) との対比のための言い方で矛盾とまでは言えない (書き方 7 の措辞級; JP review r2 LOW を再確認) が、欄を揃える 1 語追加で解消できる (修正後 85 字 ≤100) | jp「データの値に含まれる誤りや不統一を正す作業である。」→「データの値やレコードに含まれる誤りや不統一を正す作業である。」/ zh「纠正的是数据值中的错误和不统一。」→「纠正的是数据的值和记录中的错误和不统一。」/ en "corrects errors and inconsistencies in the values of the data." → "corrects errors and inconsistencies in the values and records of the data." |
| L2 | LOW **建議修** | `key_points_jp[3]` / `key_points_zh[3]` / `key_points_en[3]` (+ 派生 `summary.key_points_*[3]`) | 「計算し直すだけで打ち間違いに気づける」(en "simply recalculating … reveals a typing mistake") は打ち間違い全般を見つけられると読め、同用語 exam 考点の一方向の主張 (結果が合わなければ誤り) より広い。引用題 2010h22a-q088 の各桁和の規則では桁の入れ替えで値が変わらず見つからない (支持のない一般化の措辞級; 正答とは矛盾しないため LOW) | jp「**チェックディジット**を付けておくと、入力されたコードを計算し直すだけで打ち間違いに気づける。」→「**チェックディジット**を付けておくと、入力されたコードを計算し直し、結果が合わなければ打ち間違いと分かる。」/ zh「加上**校验位**后，只要把输入的编码重新计算一遍，就能发现输错的地方。」→「加上**校验位**后，把输入的编码重新计算一遍，结果对不上就说明输错了。」/ en "With a **check digit** attached, simply recalculating an entered code reveals a typing mistake." → "With a **check digit** attached, recalculating an entered code shows a typing mistake whenever the result does not match." |
| L3 | LOW **建議修** | `terms[2](コード設計).fig.data.rows[2].cells[2].zh` | jp「先頭2桁が地域、次の2桁が店舗」に対し zh「后 2 位表示门店」は「末尾の 2 桁」とも読め、コードが 4 桁より長いと位置の意味がずれる (loc-review r1 LOW、未修正; 三語の意味一致) | zh「前 2 位表示地区，后 2 位表示门店」→「前 2 位表示地区，接下来的 2 位表示门店」 |
| L4 | LOW | `terms[0].points[0].text_jp` 2 文目 | データモデリングの言い方が q014 題文の要素の順 (業務 → データの構造 → 実体と関連 → 整理) に沿う。両側正の定義の対比で選択肢の組・順の再現は無く (D-209 除外)、標準定義、近似度 Dice 0.21 / ed 0.82 → (iii) にも写しにも当たらない | 記録のみ (D-209 判定記録) |
| L5 | LOW | `terms[2].hook_jp/zh/en` (+ 派生) | 見出し語は「コード設計」だが hook は下位概念チェックディジットの語源だけを扱い、見出し語の手がかりになっていない (D-195 §6; JP review r2 LOW) | 記録のみ |
| L6 | LOW | `pairs[0]` / `terms[1].points[1]` | クレンジング / 結合は目的も操作も明確に違い、取り違えやすい組とは言いにくい (本単元の引用題で紛らわしいのはクレンジング / データモデリングで、exam 考点で扱い済み)。内容に誤りなし | 記録のみ |
| L7 | LOW | `terms[1].hook_jp` / `terms[2].hook_jp` (+ 派生 `memory_hook_jp`、`summary.memory_hooks_jp[1..2]`) | 3 フック中 2 つが「〜と覚える」で結ぶ (§9 同型の結び、記憶フックの言い方として許容) | 記録のみ |
| L8 | LOW | `terms[2].detail_jp` 3 文目 / `terms[2].points[0]` / `key_points_jp[3]`、`terms[0].detail_jp` 1 文目 / `terms[0].fig` / `key_points_jp[0]` | チェックディジットの定義 (他の桁から決まった規則で求めた検査用の数字) が 3 欄、不備 4 種の列挙が図・detail・要点の 3 欄でほぼ同じ形で出る (D-203 §9 同義の言い直し) | 記録のみ |
| L9 | LOW | `terms[0].analogy_zh` | jp「旧姓と新姓で2回載っていれば」を zh「因为改名被记了两次」とし、姓が変わった細部がぼける (比喩の働きは不変; loc-review r1 LOW) | 記録のみ (任意: 「同一个朋友以旧姓和新姓各记了一次，就合并成一条」) |
| L10 | LOW | `terms[2].fig.data.rows[1..3].cells[0].zh/en`、`terms[2].hook_en`、`terms[2].detail_en` 3 文目、`terms[1].fig.data.nodes[2].label.zh`、`key_points_zh[1]` | 訳の定訳・自然さ (桁別コード en "Positional code" / zh「分位编码」、区分・表意 zh「区段编码」「表意编码」、hook_en の "only job … the others" の軽い付加、detail_en の同格句のぶら下がり、zh「对应值相同的行」「…的列的值相同的行」)。意味の誤りは無い (loc-review r1 LOW を再確認) | 記録のみ |

**既知の失敗型 (D-208) の個別確認**:
- (1) D-198 (iii) 選択肢なぞり: validate の choice-echo 0 行。q014 (分類題) = 両側正の定義の対比、選択肢 4 つのうち 2 語のみ・順の再現なし → 該当なし (L4)。q072 (穴埋め題) = 空欄を埋めた文と比較し、正答 2 つを比較相手 (エンティティ / レコード) と組にせず、順も逆 → 該当なし。q088 (計算題) = 題の数値・規則 (各桁和の反復) を使わず一般原則のみ → 該当なし。
- (2) 「など」等の限定条件落ち: q072 の「〜こともできる」→「多くの場合」で保持。q014・q088 に閉じる限定なし。該当なし。
- (3) シラバス別名を別物として教える: q014 の誤答ア データクリーニングはクレンジングの別名だが、本単元は触れず別物とも書かない。該当なし。
- (4) 比喩 / 図の範囲が one・detail と矛盾: 住所録 (重複の統合・住所の修正)・伝票と台帳の突き合わせ・郵便番号の桁の意味、図 3 つとも one・detail の範囲内。該当なし。
- (5) 修正済み主張の zh / en 回帰: r1 MEDIUM 2 件とも zh / en で回帰なし (§2 末)。
- (6) zh / en の語が誤答肢に読める: q014 誤答 (クリーニング / マイニング)、q072 誤答 (エンティティ / レコード) に寄る訳語なし (zh「列」/ en "column" を維持)。該当なし。
- (7) D-210 改正前の版: 法令・規格の改正に関わる引用題なし。該当なし。
- (8) 比喩 / hook の鍵語が他の見出し語の語幹・別定義の役割: 「洗い清める」「手をつなぐ」「check の digit」、比喩の顧客番号・郵便番号はいずれも単元内で別定義される語ではない。該当なし。
- (9) hook / 認識手がかりを引用題の場面に当てると誤答を選ぶ: クレンジング hook (汚れを洗い落とす) を q014 (構造を E-R で整理) に当ててもイを選ばせない; 結合 hook (共通の「列」で手をつなぐ) は q072 で b = フィールドに導く; q088 は計算で解く。該当なし。
- (10) 法令 / 規格カテゴリの閉じた列挙で構成員を落とす: 不備の種類は「例えば」、コードの付け方は「付け方の例」で閉じていない。法令 / 規格カテゴリなし。該当なし。

確認済みで問題なし: 限定条件 (qid 付き考点 3 件全て保持)、§9 禁止句 grep (定型締め句 0; 「と覚える」は L7)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 2 文・≤81 字)、D-205 (改正される文書の構成・数の言い切りなし)、図の文字列の写し (validate 0、独立照合 遮蔽あり / なし とも 0、近似候補は偽陽性のみ)、`[[jp:]]` 原語 (7 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (3/3)、zh 訳語表 (B6 warn 0)、図種 (static table ×2 / flow steps ×1 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en`・title・unit_summary の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 3: L1 / L2 / L3 / 記録のみ 7: L4〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 3 用語・考点 4 件 (qid 付き 3 件)・引用 3 題 + 未引用の challenge 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも写しも無い。jp-review r1 の MEDIUM 2 件は解消済みで zh / en 回帰なし。LOW 建議修 3 件 (L1〜L3) は補丁 (B3) で修正推奨、L4〜L10 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-21-55-u03
✓ technology-21-55-u03 unit: 0 issues (data/ip/textbook/units/technology-21-55-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-21-55-u03
✓ technology-21-55-u03 parity: 20 locations, 0 diff
EXIT=0
```
