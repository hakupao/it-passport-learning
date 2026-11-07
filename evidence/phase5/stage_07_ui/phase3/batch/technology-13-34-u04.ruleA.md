# Rule A 全数抽検 — technology-13-34-u04 (データ操作と尺度水準)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S149 b49)、repo HEAD `69504337` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b49-u04-a2` merge 結果、sha256 先頭 `fe33faaffa81397e`)。a2 は a1 の `jp.r1` (sha `da47e45d…`) + a1 jp-review #2 を seed にした再試行。
- **対象**: `data/ip/textbook/units/technology-13-34-u04.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (データの集計 / データの並べ替え / ランキング / 尺度 / 名義尺度 / 順序尺度 / 間隔尺度 / 比例尺度) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `v1-original.json` (用語 8 語・`term_zh`・`term_en` とも v1 と一致、スクリプト確認)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_* / explanation_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (81 箇所、不一致 0)。
2. **考点 × 引用題 (考点 全 8 件 = exam 3 + mix 5、引用 qid 延べ 3 件 = 異なり 2 題)**: `questions.json` + `translations/<exam>.json` の `stem_jp_clean` で各題の題文・選択肢・`correct_answer` を再読。2025r07-q063 (4 尺度のうち間隔尺度に当たるもの; 正答ウ = 時刻、誤答 = 学年 [順序]・血液型 [名義]・睡眠時間 [比例])。2011h23tokubetsu-q056 (相似な用紙で面積 2 倍への拡大率 = 長辺の比; 正答イ 141 % = √2、自分で再計算し一致)。
3. **quiz / challenge_questions** (challenge 4 題: 2025r07-q063 / 2011h23tokubetsu-q056 / 2010h22h-q067 / 2009h21h-q080)。未引用の 2 題 = 2010h22h-q067 (0〜9 の全組合せ 100 行から A ≤ B の行を除く → 45 行、再計算一致)、2009h21h-q080 (度数分布 2 つの分散比較; 正答 = グレーが小さい) は本文と矛盾しない (どちらも本単元の見出し語を直接は問わない = 既出 LOW、L6)。
4. **D-198 写し**: validate の copy guard = 0 件、`warn choice-echo` = 0 件。独立照合: 単元の JP 文字列 128 本 (派生・summary・overview.intro 除く) × topic 内全 32 題の題文 (`stem_jp_clean` 優先) + 選択肢 + 正答肢、12 字連続一致 (句読点・記号・空白・記法除去)、**カタカナ 4 字以上 / 英数遮蔽あり・遮蔽なし の両方**、近似一致 (14 字窓 × 編集距離 ≤2)。→ 遮蔽あり 1 / 遮蔽なし 1 / 近似 5 件、**全て同一箇所の偽陽性**: `terms[3].detail_jp`「名義尺度・順序尺度・間隔尺度・比例尺度の 4 つの水準」↔ 2025r07-q063 題文の分類枠。一致部は見出し語 4 つの連なりで、順序は Stevens の水準の標準順 (= 本用語の定義そのもの、validate は見出し語を遮蔽するため 0)。題の選択肢 (学年・血液型・時刻・睡眠時間) の組・順は再現していない (例は 性別 / 都道府県 / 分類コード、満足度 / 着順、気温 / 西暦、長さ / 重さ / 金額)。カタカナの多い文 (`terms[1]` ソート / キー、`terms[2]` ランキング、マラソン、コインロッカー、ホテル) を目視、題文との一致なし。
5. **D-208 既知失敗型**: (1) option tracing — `terms[6].points[0]` は q063 の正答語「時刻」を主語にするが、分類題の正答内容を一般の判定基準 (0 が量のなさを表すか) で述べる D-209 の免除に当たり、誤答肢 (睡眠時間・学年・血液型) の否定も選択肢の組・順の再現もない → (iii) でない (a2 jp-review #1 と同見解、L5 記録)。`terms[3].points[0]` は 4 性質 (区別・順序・等しい間隔・量のなさを表す 0) の一般原則で、選択肢を追わない。`terms[7].points[0]` は q056 の数値 (A3 / A4・141・122 等) を使わず相似の一般則のみ。(2) 限定条件 — q063「四つに分類したとき」= 4 水準で保持、q056「相似形」= 「形が相似な図形では」で保持、「拡大率 = 長い辺同士の比」は「長さの比」で矛盾なし。(3) 別名 — 尺度水準 (尺度)、比率尺度 (比例尺度)、ソート (並べ替え) は括弧の別名として同一物で示す。(4) 比喩・図 vs one / detail — 下記 §2、矛盾なし。(5) 前の輪の修正の zh / en 回帰 — §1-7 で確認、回帰なし。(6) zh / en の語が誤答肢に読める — なし (zh「时刻」/ en "Clock time" は時刻で、睡眠時間 [duration] と混同する訳ではない)。(7) D-210 / (10) 法令・規格の閉じた列挙 — 該当なし (尺度 4 水準は法令・規格の改訂物ではない; D-205 も該当なし)。(8) 比喩の鍵語が他の見出し語 — 間隔尺度の比喩「身長計」は比例尺度の例「長さ」と同じ量だが、台の高さ分ずらした読みとして構成し「差は保たれ、比は保たれない目盛り」と結ぶので比例尺度の否定にならない (L4 記録)。(9) hook / 手がかりを q063 に当てる — 名義 hook (名前) は血液型 → 名義、順序の考点 (順位に置き換え = 順序) は学年 → 順序、比例の基準 (0 が量のなさ) は睡眠時間 → 比例、間隔の基準は時刻 → 間隔、で全て正しく判別。名義の考点「数字であることだけを理由に順序や大きさがあると判断しない」も 学年 (数字 + 順序あり) を名義に誤らせない (「分類の印にすぎなければ」の条件付き)。
6. **D-195 / D-200**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2〜3 文、定義前使用 (昇順 / 降順 / キー = 並べ替え detail、中央値 = 順序 detail の括弧注、最頻値 = key_points[2] の括弧注、順位 = ランキング one)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `terms[1].hook_jp`「字の向きで覚えられる」1 件のみ (記憶フックの言い方、L7 記録)。図の型: 集計 = static table (3+2=5、45+30=75 再計算一致)、ランキング = flow steps 3、尺度 = flow steps 4、他 = 図なし; 全て登録内。考点数 1 × 8 (≤3 ✓)、各 JP 1〜2 文・51〜67 字 (≤100 ✓、最大 `terms[4].points[0]` 67 字)。**framing 件数** (validateV2 `POINT_FRAMING` の型、全考点): jp 0 / zh 0 / en 0 (上限 2)。hook は 順序尺度・間隔尺度で無し (a1 jp-review #2 の L「定義の言い換え」を受けて削除; validate 0 issues)、analogy は 尺度で無し。
7. **前 attempt / 前 review の指摘の解消 (a1 が rejected → a2)**:
   - a1 jp-review #1 MEDIUM `terms[3].points[0]` (exam 考点の主張 [水準の包含関係] を q063 が支持しない) → **解消**: 現考点は「区別・順序・等しい間隔・量のなさを表す 0 のどこまでをもつかで尺度が決まる」で、q063 の判別点 (時刻 = 等間隔だが 0 が量のなさでない) を一般化。包含関係は `terms[3].detail` / `key_points[0]` に移動。
   - a1 jp-review #2 MEDIUM `terms[2].detail_jp` (同順位で「件数分だけ飛ばす」が誤った規則に読める) → **解消**: 「例えば同じ値のデータには同じ順位を付ける付け方がある」のみ。zh「例如有一种做法是给值相同的数据标上相同的名次」/ en "one approach gives them the same rank" も飛ばし規則なし (回帰なし)。
   - a1 jp-review #2 MEDIUM `overview_rows[3].extra_jp` (列見出しと中身の不一致) → **解消**: 「尺度によって意味をもつ計算が変わる」/「名義・順序・間隔・比例の 4 水準」(= 意味をもつこと / 例 の列どおり)、zh・en 同。
   - a1 low (caption の同順位規則・「度は目盛り」・順序/間隔 hook の定義言い換え・key_points 反復) → caption は「並んだ順に 1 位、2 位と順位を付ける」、尺度 hook は「もともと長さを測るものさし」(辞書義どおり)、順序 / 間隔 hook 削除、key_points 4 → 3。いずれも解消。
   - a2 jp-review #1 (PASS、low 8) / loc-review #1 (PASS、low 8): 未適用の low は §3 に記録 (L1〜L9)。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・表セル・比較行・総表セルの三語一致、`[[jp:…]]` 原語 19 種 (データの集計 / 集計 / 並べ替え / データの並べ替え / ソート / 昇順 / 降順 / キー / ランキング / 順位 / 尺度 / 尺度水準 / 名義尺度 / 順序尺度 / 中央値 / 比例尺度 / 間隔尺度 / 比率尺度 / 最頻値) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 8/8 に見出し語の `[[jp:]]` あり (D-202)、zh 訳語が `zh_terms.json` に従うこと (数据汇总 / 数据排序 / 排名 / 测量尺度 / 名义尺度 / 顺序尺度 / 区间尺度 / 比例尺度 / 中位数 / 众数 / 电子表格软件 / 问卷 一致; jp-origin warn 0)。**zh-term warn 9 件は §4 で判定**。
9. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | データの集計 | OK — mix 1: 集計 = 多数→少数の代表値、並べ替え (並び順) とは目的が異なる (正しい)。table 再計算一致 (小計 + 全体合計) | OK | zh「件数」は日式 (L9) | L8 (図) / L9 |
| 2 | データの並べ替え | OK — mix 1: 昇順 = 小さい方から、日付は古い日付が先頭; 新しい日付から = 降順 (正しい)。detail の第 2 キー・値不変も正しい | OK | zh / en 括弧内の別名が見出し語と同語 (L9) | L3 (analogy) / L7 (hook) / L9 |
| 3 | ランキング | OK — mix 1: 順位差は元の値の差を表さない (正しい)。detail の同順位 = 「例えば」付きの一方式 (a1 MEDIUM 解消)。flow steps 3 (元データ → 並べ替え → 順位付け) は one と一致、steps[1] に「例えば」 | OK | zh steps[1] caption の重言 (L9) | L2 |
| 4 | 尺度 | OK — exam 1 / 1 題 (2025r07-q063 正答ウ): 4 性質のどこまでをもつかで決まる = 時刻は等間隔あり・量のなさの 0 なし → 間隔、と解ける。限定条件「四つに分類したとき」= detail の 4 水準で保持。flow steps 4 は one・detail と一致 (各 caption「さらに」で積み上げ) | OK (D-198 独立照合ヒットは見出し語連なりの偽陽性 §1-4) | zh hook は日本語の字義説明 (§4) | L2 / L9 |
| 5 | 名義尺度 | OK — mix 1: 数字でも分類の印なら名義、数字であることだけで順序・大きさを判断しない (正しい、条件「分類の印にすぎなければ」付き)。analogy (ロッカー番号) は one と整合 | OK | OK | なし |
| 6 | 順序尺度 | OK — mix 1: 値を順位に置き換えると順序尺度、比例尺度でも差の情報を失う (正しい)。detail の中央値・差 / 平均の解釈困難も正しい | OK | OK | L2 |
| 7 | 間隔尺度 | OK — exam 1 / 1 題 (2025r07-q063 正答ウ 時刻): 0 時は時間のない状態でない → 間隔、差は求められ比は無意味 (正しい)。誤答肢 (睡眠時間 = 比例) に触れず、選択肢の組を再現しない (D-209 分類題の免除) | OK | OK | L4 (analogy) / L5 |
| 8 | 比例尺度 | OK — exam 1 / 1 題 (2011h23tokubetsu-q056 正答イ 141): 相似図形で面積比 = 長さの比の 2 乗 → 面積 2 倍で長辺 √2 ≈ 1.41 倍と解ける。限定条件「相似」保持、題の数値・用紙名は使わない | OK | en「ratio-level scale」の別名 (L9) | L1 |

**単元レベル**: goals 3・overview_cols 2 (意味をもつこと / 例)・overview_rows 8・pairs 3 組 (並べ替え / ランキング 3 行 key 1、名義 / 順序 3 行 key 1、間隔 / 比例 4 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge 4 件。pairs[2] (0 = 基点 / 量なし、差 両方意味あり、比 なし / あり) は各 one・detail と一致。key_points[2] (名義 = 最頻値、順序 = 中央値、間隔以上 = 平均、「例えば」付き) は正しい。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 12 (うち 建議修 2: L9a・L9b)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW | `terms[7](比例尺度).points[0]` | 2 文目 (相似図形の面積比 = 長さの比の 2 乗) は幾何の計算規則で比例尺度の性質そのものではない。1 文目が橋渡しで、q056 の正答と一致・事実正しい (a1 #2 / a2 #1 low と同見解) | 記録のみ |
| L2 | LOW | `terms[2].analogy_jp` / `terms[2].points[0]` / `terms[5].points[0]` / `terms[5].analogy_jp` | 「順位・順序にすると差の大きさが失われる」が 4 箇所で言い直される (D-203 §9 / 書き方 8)。ただしランキング (操作) と順序尺度 (データの種類) を結ぶ要の性質 | 記録のみ |
| L3 | LOW | `terms[1].analogy_jp/zh/en` | 本棚の比喩の結論 (中身は変わらない) が detail の「値は変わらず位置だけが変わる」・`pairs[0].rows[0..1]` の言い直し (D-203 §6) | 記録のみ |
| L4 | LOW | `terms[6](間隔尺度).analogy_jp/zh/en` | 身長 (= 長さ、比例尺度の例) を素材にする。台の高さ分ずれた読みとして構成し「差は保たれ、比は保たれない目盛り」と結ぶので比例尺度の否定にはならず、q063 のどの選択肢にも向かない (失敗型 (8)(9) 非該当) | 記録のみ |
| L5 | LOW | `terms[6].points[0]` | q063 の正答語「時刻」をそのまま主語にする。分類題の正答内容の一般表現 (D-209 免除)、選択肢の組・順・誤答の否定なし。同用語の quiz が同題なので答えが先に見える | 記録のみ |
| L6 | LOW | `challenge_questions[2]` (2010h22h-q067)、`[3]` (2009h21h-q080) | 本単元の見出し語を直接は問わない (組合せの数え上げ / 分散の比較)。topic 内で本単元に結び付く題は 2 題のみで、確認題の下限 3 を満たす補充 (a1 / a2 jp-review low と同見解) | 記録のみ |
| L7 | LOW | `terms[1].hook_jp` (+ 派生 `memory_hook_jp`, `summary.memory_hooks_jp[1]`) | 「字の向きで覚えられる」(§9 grep の唯一のヒット、記憶フックの言い方で定型締め句ではない) | 記録のみ |
| L8 | LOW | `terms[0].fig`、`overview_cols_jp[0]` × `overview_rows[0..2]`、`goals_jp[0]` | 集計の表は集計後の結果のみ (元の個別記録なし); 総表の列名「意味をもつこと」が操作 3 語の行ではやや合わない; goals[0] が並べ替えとランキングを 1 つの操作として書く (pairs[0] は区別) — いずれも既出 low、誤学習なし | 記録のみ |
| L9a | LOW **建議修** | `terms[3](尺度).detail_en` | "Along that order" は英語として据わりが悪い (loc-review #1 low) | en: `Along that order, each level adds one more property to the values` → `In that order, each level adds one more property to the values` |
| L9b | LOW **建議修** | `terms[3](尺度).fig.data.nodes[3].label.zh` / `.en` | 「比が言える」の直訳「可以说比值」/ "ratios can be stated" が不自然 (loc-review #1 low)。jp は不変 | zh: `比例尺度：可以说比值` → `比例尺度：比值有意义` / en: `Ratio scale: ratios can be stated` → `Ratio scale: ratios make sense` |
| L9 | LOW | `terms[0].fig.data.cols[1].zh`「交易件数」、`terms[1].one_zh`「（**排序**[[jp:ソート]]）」/ `one_en`「(**sort** [[jp:ソート]])」、`terms[2].fig.steps[1].caption_zh`「排在前列的数据来到最前面」、`overview_rows[2].extra_en[1]`「ranking branches」、`terms[7].one_en`「ratio-level scale」、`terms[3].one_zh`「尺度水平」 | loc-review #1 の残り low: 日式語 / 別名が見出し語と同語 / 重言 / 主語の付加 / 英語で定着の弱い別名 / 尺度水準の直訳。いずれも意味のずれなし | 記録のみ |

| L10 | LOW | `overview_rows[4..7].one_line_zh`、`terms[3].hook_zh`、`terms[4..7].one_zh` | validate warn `zh-term 尺度 → 测量尺度` 9 件。hook は日本語の字義説明で純粋な偽陽性、残り 8 件は複合見出し語の定義を締める類概念「…的尺度」で zh として自然・意味のずれなし (§4) | 記録のみ (修正不要; 任意の置換案は §4) |

**対比の出現欄 (書き方 8 の列挙)**: ① 集計 (要約) / 並べ替え (並び順): `terms[0].points[0]`、`goals[0]` (予告)、総表 → 許容。② 並べ替え / ランキング: `pairs[0]`、総表 extra → 許容。③ 名義 / 順序: `pairs[1]`、各 one (定義) → 許容。④ 間隔 / 比例 (0 の意味・比): `pairs[2]`、各 one・detail (定義の中核)、`goals[2]` (予告)、尺度 fig steps[3] → 定義そのもので許容。⑤ 順位化で差が失われる: L2。

**範囲外の観察**:
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。
- O2 `summary.key_points_zh[0]`「测量尺度尺度水平…」/ `[2]`「名义尺度名義尺度…」: zh 本体が `**测量尺度**[[jp:尺度]]` 型 (括弧なし) のため、記法除去版で原語が括弧なしに連なる。v2 reader は本体 `key_points_*` を `parseInline` で描画し (jp ラベル = `<span lang="ja">`)、`summary.*` は v1 経路のみで使う (`apps/web/src/lib/textbook/reader.ts` 363 / 400 行) ので表示には出ない。括弧なし型は他 5 単元にもある既存の書き方。
- O3 D-198 独立照合の唯一のヒット (`terms[3].detail_jp` の 4 水準の名前の連なり) は偽陽性 (§1-4)。

## 4. zh-term warn 9 件 (`尺度 → 测量尺度 not in the zh text`) の判定

照合器 (`scripts/lib/textbook-v2.mjs` `zhTermsIn`) は最長一致で `名義尺度` などの複合見出し語を先に消費するので、**warn は複合語の一部ではなく、単独の「尺度」から出ている** (loc-review #1 の「複合語の一部」という説明は不正確):

| field | jp の単独「尺度」 | 現 zh |
|---|---|---|
| `overview_rows[4..7].one_line_jp` | 定義文の末尾「…尺度」(類概念) | 「…的尺度」 |
| `terms[4..7].one_jp` | 「X尺度とは、…尺度である」の類概念 | 「…的尺度」 |
| `terms[3].hook_jp` | 日本語の語「尺度」の字義 (ものさし) | 「日语“尺度”原本指…」 |

判定: **修正不要 (偽陽性扱い、L10 記録のみ)**。
- `terms[3].hook_zh` は日本語の語そのものを説明する文で、「测量尺度」に変えると字義説明が成り立たない → 純粋な偽陽性。
- 残り 8 件は jp が技術的な意味の「尺度」だが、類概念の名詞として複合見出し語の定義を締める位置にある。zh の見出し語 (zh_terms どおり 名义尺度 / 顺序尺度 / 区间尺度 / 比例尺度) は全て「尺度」を中心語にもつので、「名义尺度是指…的尺度」は jp「名義尺度とは…尺度である」と同型で、中国語として自然 (統計学の教科書で「…的尺度」は普通の言い方)。意味の取り違えは起きない。また単元内の zh は上位概念を名指す箇所 (`goals_zh[1]`、`terms[3].one_zh`/`points[0]`、`terms[7].detail_zh`「4 种测量尺度」、`key_points_zh[0..2]`) で「测量尺度」を使い分けており、zh_terms.json との整合も保たれる (`terms[3].one_zh` 本文中の「属于哪种尺度」も「测量尺度」を導入した直後の同じ用法)。
- 任意 (warn を 0 にしたい場合のみ、事実・訳の誤りではない): 8 欄の末尾「的尺度」→「的测量尺度」に置換すれば warn は消え、意味も変わらない (例 `terms[4].one_zh`: `不具有大小或顺序含义的尺度。` → `不具有大小或顺序含义的测量尺度。`; `overview_rows[4].one_line_zh`: `数值只用于区别和分类的尺度` → `数值只用于区别和分类的测量尺度`; 同型で `overview_rows[5..7].one_line_zh`、`terms[5..7].one_zh` の末尾 `的尺度` → `的测量尺度`)。`terms[3].hook_zh` は変えない。本監査は推奨しない (「名义尺度…的测量尺度」はやや冗長で、jp・en [`a scale`] との並行も現状の方がよい)。

## 5. 合計 / 判定

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **12** (建議修 2: L9a・L9b / 記録のみ 10: L1〜L8・L9・L10) |

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 8 件 (exam 3 件・引用 2 題) + 未引用 challenge 2 題で、考点の主張は正答と一致し、誤答肢を支持する記述・選択肢の組の再現は無く、引用題の限定条件の落ちも無い。a1 で rejected の原因となった MEDIUM 3 件 (尺度の exam 考点の根拠、同順位の飛ばし規則、総表の尺度行) は全て解消し、zh / en にも回帰なし。LOW 建議修 2 件 (L9a・L9b) は補丁 (B3) で修正推奨、zh-term warn 9 件は修正不要。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-34-u04
✓ technology-13-34-u04 unit: 0 issues (data/ip/textbook/units/technology-13-34-u04.json), 9 warning(s)
  warn  zh-term  overview_rows[4].one_line_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  overview_rows[5].one_line_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  overview_rows[6].one_line_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  overview_rows[7].one_line_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[3](尺度).hook_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[4](名義尺度).one_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[5](順序尺度).one_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[6](間隔尺度).one_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[7](比例尺度).one_zh  尺度 → 测量尺度 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-34-u04
✓ technology-13-34-u04 parity: 33 locations, 0 diff
EXIT=0
```
