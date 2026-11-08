# Rule A 全数抽検 — strategy-05-17-u04 (スマート化と産業・社会のIoT応用)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b66)、repo HEAD `d508d870` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b66-u04-a2` merge 結果、sha256 先頭 `34448b622b01303a`)。
- **対象**: `data/ip/textbook/units/strategy-05-17-u04.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (スマートシティ / スマートファクトリー / マシンビジョン / 産業用ロボット / スマート農業 / HEMS / ドローン) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208〜D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/strategy-05-17-u04/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` も v1 と同文)。先行審査: `journal.b66-u04-a1.jsonl` (jp-review r1 MEDIUM 4・r2 MEDIUM 1) / `journal.b66-u04-a2.jsonl` (jp-review r1 MEDIUM 1 → r2 PASS、loc-review r1 PASS)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`、`summary.key_points_*`、`summary.memory_hooks_*`、`overview.intro_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 3 件 = exam 1 + mix 2、qid 付き 1 件 = 2019r01a-q008)**: `data/ip/quiz/questions.json` から題文 (translations の `stem_jp_clean` 優先)・選択肢・`correct_answer` を再読 (topic `strategy-05-17`、topic 内全 22 題)。exam 考点「スマートシティ の単位は街や地域であり、複数の分野の仕組みをまとめて扱う」は、2019r01a-q008 (都市・地域の機能やサービスを ICT で効率化・高度化する街づくり = スマートシティ、正答イ; 誤答 = キャパシティ・ダイバーシティ・ユニバーシティ) の分類型の正解を見出し語の一般定義として述べたもの。題文の語の並び (背景 → ICT → 効率化・高度化 → 課題解決・活性化) は再現せず、「複数の分野」は題の「機能やサービス」を超えるが one・fig (交通 / エネルギー / 防災 / 行政 = 例) と一致する標準事実で、誤答肢を支持しない → **a1 r1 MEDIUM (題文の順のなぞり) は jp・zh・en とも解消**。a2 r1 low の「工場や農場より広い範囲で」の比較も削除済み。mix 考点 2 件 (スマートファクトリー = 工場全体の仕組み / 産業用ロボット = その中の個々の機械、スマート農業 = 分野の取り組み全体 / ドローン = そこで使う機器の一つ) は定義どうしの包含関係で、one・overview と整合。
3. **quiz / challenge_questions** (quiz 2 枠 = スマートシティ 2019r01a-q008 / HEMS 2023r05-q098、challenge 4 題 = 2019r01a-q008 / 2023r05-q098 / 2019r01a-q003 / 2020r02o-q008): 2023r05-q098 (スマートメーター = 住宅などで電気やガスなどの使用量を自動計測し回線で供給事業者へ送る、正答イ; 誤答 = 加速度センサ・遠隔消去・歩数計) は HEMS `detail_jp`「使用量を自動で計り、通信で供給事業者へ送る計量器」で解ける (jp・en は計測対象・送り先を限定しない; **zh は M1**)。HEMS の exam 考点は a2 r1 MEDIUM (正解肢の組の言い直し) を受け削除され、qid は quiz のみ (D-211) → 解消。2020r02o-q008 (電力会社が人の検針の代わりにネット接続の電力メータで遠隔計測 = IoT、正答イ) は HEMS detail のスマートメーターと矛盾せず、u01 の IoT で解ける。2019r01a-q003 (服薬容器のセンサ = IoT の事例、正答ウ) は本単元の見出し語を扱わない (L9)。v1 の各用語 quiz (2009h21a-q028 等、いずれも組込みシステムの題) と challenge 3 題 (2014h26a-q002 / 2021r03-q006 / 2022r04-q003) は外れたが、どれも本単元の見出し語を問わない題で、u01 / u03 の受け持ち (O2)。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 行 0。独立照合として単元の JP 文字列 116 本 (派生フィールド除く) を topic 内全 22 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去) — **カタカナ 4 字以上と英数を □ に遮蔽 (遮蔽後実字 6 未満の窓は除外): 0 件 / 遮蔽なし: 0 件**。近似照合 (12 字窓・編集距離 1〜2) → 1 件: `terms[5].detail_jp`「家庭内のネットワークを通じて」↔ 2019r01a-q013 (別 topic 混入でなく topic 内の題、「〜がネットワークを通じて」) = 一般句の偽陽性。目視: カタカナの多い文 (スマートシティ one / fig、HEMS detail、ドローン detail・fig) を 2019r01a-q008 / 2023r05-q098 / 2020r02o-q008 と並べて読み、語の組・並びの再現なし。HEMS `detail_jp` のスマートメーター定義は正解肢イと同じ要素 (使用量の自動計測 → 通信 → 供給事業者) を同じ順で述べるが、考点でなく detail の標準定義で、回線の具体名・電気とガスの列挙・「住宅など」の設置場所を落としている (a2 r2 と同判断、L2)。(iii) 選択肢のなぞり: exam 考点は分類型の正解の一般定義 (D-209 免除)、誤答肢の語・組・順は使わない → 該当なし。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2 文 × 7、比喩は スマートシティ のみ空 (D-203 (b) 許容)、定義前使用 (予知保全 = スマートファクトリー detail の括弧、スマートメーター = HEMS detail の「〜を スマートメーター といい」、インダストリー 4.0 = 「ドイツが掲げた…構想」と注; mix 考点の 産業用ロボット・ドローン は後ろで定義 = L8)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が; zh 考试 / 必须 / 重要 / 记住 / 选项; en exam / must / important / always / only / remember) → `freq_badge`「低頻」は対象外、**`terms[4].detail_jp`「手段とされる」1 件 (L1)**、**`terms[6].hook_jp`「覚えやすい」/ `hook_zh`「容易记住」(L3)**、その他 (限ら / every / all / never / only / example 内の exam) は通常の用法で偽陽性。図種 (スマートシティ = tree static、スマートファクトリー・マシンビジョン・HEMS = flow steps 3/4/3、ドローン = table static、産業用ロボット・スマート農業 = 図なし; 登録 6 種 svg / table / compare / flow / tree / network の内) — **a1 r1 MEDIUM (マシンビジョン図が手順なのに static) は steps 4 段 + caption 三語で解消**。pair 配置 (スマートシティ / HEMS、マシンビジョン / 産業用ロボット、各組 key 行あり)。
6. **D-200**: 考点数 1/1/0/0/1/0/0 (≤3 ✓)、各 JP 1 文・字数 37 / 60 / 60 (≤100 ✓)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。D-197 羅列 (validate 0; goals・key_points の「街・工場・畑・家庭」は見出し語でない)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 — **a1 r2 MEDIUM (goals / key_points が全用語を 4 つの場で分けると読める) は `goals_*[0]`・`key_points_*[0]`・`overview_rows[6].extra_*[0]` (場を問わない) の三語でドローンを分け方の外に置く形に揃い解消**、退行なし。ただし `terms[0].hook_jp/zh` が「この単元のスマート〜という語」全てに「後ろの語 = 場」を言い切り、同単元の スマートメーター (後ろの語 = 機器) と食い違う → **M2**。その他の「〜だけ」「〜ではない」の照合で不整合 0。書き方 8 (対比の出現欄): ① マシンビジョン = 目 / 産業用ロボット = 腕: `pairs[1].rows[0]`、`overview_rows[2..3].extra_*[1]`、両 analogy (目 / 腕) → 比喩は D-195 §6 の手がかりで 2 箇所上限の内、L7 で記録。② 街 / 家の範囲: `pairs[0].rows[0]` のみ。書き方 9 (限定条件): exam 考点 1 件の題の限定 (都市や地域) 保持。
8. **事実 (引用題の外、D-205 を含む)**: インダストリー 4.0 = ドイツ連邦政府の高度技術戦略から出た構想 (工場のスマート化が中心) で記述と一致。ドローン `one_*` = 航空法 第 2 条第 22 項の無人航空機 (構造上人が乗れず、遠隔操作又は自動操縦で飛行) と一致。**単元にドローンの規制 (飛行許可・登録・レベル区分等) の記述は無く、その確認は不要**。スマートメーター: jp・en は計測対象・送り先を限定しない (**a1 r1 MEDIUM「電気だけ」は jp・en で解消、zh で退行 = M1**)。HEMS がスマートメーターの値を「取り込める」(任意の入力) は one・fig step 1 (自ら計測) と整合 (a1 r1 MEDIUM の範囲食い違いも解消)。BEMS / FEMS の頭文字は正しい。drone = 雄のミツバチ・低いうなり音は英語の語義どおり。改訂文書の構成数・名称は無く D-205 の版表記対象なし。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 8 種 (スマートシティ / スマートファクトリー / マシンビジョン / 産業用ロボット / スマート農業 / ドローン / 予知保全 / スマートメーター) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語併記 6 / 6 + HEMS (ラテン文字の見出し語は本文中の同綴りで満たす = validateV2 `hasJpOrigin` の規定、`**HEMS**` で充足)、zh 訳語 (`zh_terms.json` / `zh_terms.unit.json`: 智慧城市 / 智慧工厂 / 机器视觉 / 工业机器人 / 智慧农业 / HEMS（家庭能源管理系统） / 无人机、B6 warn 0)。スマートメーターは表に無く、zh「智能电表」は topic 題 2023r05-q098 の zh 訳と同じ呼称で可。ただし zh の送り先「供电企业」が M1。
10. **他単元との整合 (strategy-05-17-u01〜u03)**: u01 ロボット detail・pairs (工場で組み付ける産業用ロボット / 家庭の掃除ロボット) と u04 `terms[3].hook` (産業用 = 工場、掃除ロボット = サービス用) は一致。u01 IoT (モノがデータを送る・アクチュエータ) と u04 key_points[1] (計測 → 見える化 → 制御) は矛盾なし。u02 スマートスピーカー (家電の操作) と HEMS (家電の制御) は別物として衝突なし。u03 (コネクテッドカー / 自動運転 / CASE / MaaS / ワイヤレス給電) とは重なりなし。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | スマートシティ | OK — exam 1 / 1 題: 単位は街や地域、複数分野の仕組みをまとめて扱う (2019r01a-q008 正答イ; 分類型の正解の一般定義、題文の並びは再現しない、限定「都市や地域」保持)。tree (交通 / エネルギー / 防災 / 行政、root に「例」) は one・detail と一致。detail「人手や財源が限られる地域でも公共サービスを保つ手段」は題の背景 (人口減少・高齢化) と主題が重なるが語句・順序の再現なし | OK | hook_jp/zh が「この単元のスマート〜」全般に言い切り、en だけ 3 語に限定 | **M2** / L4 (points[0] は one の言い直し) / L10 (hook_en) / L11 (detail_zh) |
| 2 | スマートファクトリー | OK — mix 1: 工場全体の仕組み / 産業用ロボット = その中の個々の機械。予知保全・インダストリー 4.0 は事実どおり。flow steps 3 (集める → 分析する → 生かす) は detail と一致 | OK | OK | L5 (仕組み / 工場の揺れ) / L8 |
| 3 | マシンビジョン | OK — 考点なし。one (画像処理で検査・位置認識を自動化)、detail (傷・欠け・寸法・文字・位置や向き = 用途に応じて)。flow **steps 4** (撮影 → 画像処理 → 判定 → 振り分け、caption 三語) = a1 MEDIUM 解消 | OK | OK | L6 (analogy) |
| 4 | 産業用ロボット | OK — 考点なし。溶接・塗装・組立・搬送をプログラムどおり繰り返す、腕の関節をモータで動かす = 標準事実。hook のサービスロボットとの区別は u01 と一致 | OK (図なし = 定義型) | OK | なし |
| 5 | スマート農業 | OK — mix 1: 分野の取り組み全体 / ドローン = そこで使う機器の一つ (農薬散布・生育観察)。detail (温湿度・土壌水分 → 自動の水やり・換気、自動走行トラクタ) は標準事実 | OK (図なし) | OK | **L1 (とされる)** / L8 |
| 6 | HEMS | OK — 考点なし (a2 MEDIUM を受け exam 考点削除、2023r05-q098 は quiz のみ = D-211)。jp detail のスマートメーター定義は正解イと一致し、計測対象を電気に限らない (a1 MEDIUM 解消)。flow steps 3 (計測 → 見える化 → 制御) は one と一致 | OK (L2 記録) | **zh「供电企业」が送り先を電力会社に限定** | **M1** / L2 / L7 (pairs[0]) / L12 |
| 7 | ドローン | OK — 考点なし。one = 航空法の無人航空機の定義と一致 (a1 low の「小型の」は削除済み)、detail (GPS で決めた経路を自律飛行「できる」、農業・物流・点検「など」)。table static (農業 / 物流 / インフラ点検 / 災害対応) は detail と一致、規制の主張なし | OK | en detail の語順で wide areas まで hard to reach に掛かって読める | L3 (hook) / **L13 (detail_en)** |

**単元レベル**: goals 3 点・overview_cols 2 (対象の場 / 主な働き)・overview_rows 7 行・pairs 2 組 (スマートシティ / HEMS 3 行 key 1、マシンビジョン / 産業用ロボット 3 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge_questions 4 件 (§1-3)。`goals_*[0]`・`key_points_*[0]` はドローンを 4 つの場の外に置き、`overview_rows[6]` の「場を問わない (空から)」と一致 (a1 r2 MEDIUM 解消)。`key_points_*[1]` (工場・家庭とも計測 → 見える化 → 生かす) は スマートファクトリー / HEMS の flow と一致。`key_points_*[2]` (街・農業のスマート化は人手不足・高齢化で保ちにくいものを補う手段として進められている) は両 detail と一致し、排他の言い切りではない。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 2 / LOW: 13 (うち 建議修 3)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[5](HEMS).detail_zh` (+ 派生 `explanation_zh`) | 既知型 (5) / (6): a1 r1 MEDIUM で jp から外した「スマートメーター = 電気だけ」の限定が zh で退行。jp「通信で供給事業者へ送る計量器」/ en "sends it to the supplier" は送り先を限定しないが、zh は「发送给**供电企业**的计量表」で送り先を電力の供給企業に限る。2023r05-q098 の正解は電気やガスなどの使用量を供給事業者へ送る (同題の zh 訳も「供应商」)。題が支持しない限定 = MEDIUM | zh「自动计量用量并通过通信发送给供电企业的计量表叫作」→「自动计量用量并通过通信发送给供应商的计量表叫作」 (jp・en は変更なし。`one_zh`「对家庭使用的电等能源」・`pairs[0].rows[1].b_zh`「家庭使用的电等能源」は「等」付きで可) |
| M2 | **MEDIUM** | `terms[0](スマートシティ).hook_jp` / `hook_zh` (+ 派生 `memory_hook_jp/zh`、`summary.memory_hooks_jp/zh[0]`) | 観点 7 (hook の結論が他欄と食い違う): jp「この単元のスマート〜という語は、後ろに付く語が IoT を当てはめる場を表す」/ zh「本单元中「智慧～」这类词，后面接的词表示 IoT 应用的场所」は単元内の「スマート〜」全てに言い切るが、同単元 `terms[5].detail` の **スマートメーター** は後ろの語が機器 (場でない)。en は "the word that follows "smart" (city, factory, agriculture)" と見出し語 3 語に限っており、三語でも範囲が違う (a2 r2 は low としたが、hook の言い切りを同単元の欄が否定するため template どおり MEDIUM) | jp「この単元のスマート〜という語は、後ろに付く語が IoT を当てはめる場を表す。」→「この単元の見出し語のうちスマート〜の 3 語は、後ろに付く語 (都市・工場・農業) が IoT を当てはめる場や分野を表す。」/ zh「本单元中「智慧～」这类词，后面接的词表示 IoT 应用的场所。」→「本单元标题词中的 3 个「智慧～」，后面接的词（城市、工厂、农业）表示 IoT 应用的场所或领域。」/ en 変更なし (既に 3 語に限定)。※見出し語 3 つを ・ で並べると D-197 羅列に当たるため、後ろの語 (見出し語でない) を並べる形にした |
| L1 | LOW **建議修** | `terms[4](スマート農業).detail_jp` / `detail_zh` / `detail_en` (+ 派生 `explanation_*`) | §9 禁止句「とされる」(validate は考点のみ対象のため未検出) | jp「担い手の高齢化や人手不足を補う手段とされる。」→「担い手の高齢化や人手不足を補う手段になっている。」/ zh「被看作弥补务农人员老龄化和人手不足的手段。」→「成为弥补务农人员老龄化和人手不足的手段。」/ en "and these tools are seen as a way to make up for an aging farm workforce and labor shortages." → "and these tools help make up for an aging farm workforce and labor shortages." |
| L2 | LOW | `terms[5].detail_jp` 1 文目 | スマートメーター定義が 2023r05-q098 正解イと同じ要素を同じ順 (使用量の自動計測 → 通信 → 供給事業者) で述べる。ただし detail の標準定義で、回線の具体名・電気とガスの組・設置場所を落とし、exam 考点ではない (a2 r2 と同判断) | 記録のみ |
| L3 | LOW | `terms[6](ドローン).hook_jp` / `hook_zh` | §9「覚えやすい」/「容易记住」の結び (記憶フックの言い方として許容、1 件のみ) | 記録のみ (任意: jp「羽音を立てて飛ぶ機体と結び付けると覚えやすい。」→「羽音を立てて飛ぶ機体の姿がそのまま名前になっている。」) |
| L4 | LOW | `terms[0].points[0].text_jp/zh/en` | 考点が one (街の仕組みをデータでつなぎ都市全体の…) の言い直し (D-203 §9) | 記録のみ (題の判別点 = 対象が都市や地域、を残すため) |
| L5 | LOW | `terms[1].points[0].text_jp` | one・総表は「〜する工場」、mix 考点は「〜仕組みを指し」で、場か仕組みかの言い方が揺れる (a2 r2 low)。矛盾ではない | 記録のみ |
| L6 | LOW | `terms[2](マシンビジョン).analogy_jp/zh/en` | 「検品係の目をカメラと計算機で置き換えた」は one の言い換えに近く (D-203 §6)、「一つも見逃さずに」は detail の「見落としが出にくい」より強い (人の検品係の理想像として読める) | 記録のみ |
| L7 | LOW | `pairs[0]` (スマートシティ / HEMS)、`pairs[1]` + analogy | pairs[0] は範囲がはっきり違い取り違えやすい組とは言いにくい (D-195 §4)。pairs[1] の目 / 腕の像が総表・両 analogy で繰り返される (書き方 8 の上限内) | 記録のみ |
| L8 | LOW | `terms[1].points[0]`、`terms[4].points[0]` | 後ろで定義する 産業用ロボット・ドローン を mix 考点で先に使う (役割を添えており理解は妨げない) | 記録のみ |
| L9 | LOW | `challenge_questions[2]` (2019r01a-q003) | 見出し語のどれも扱わない IoT 一般の題で、単元との結び付きが弱い (u01 IoT で解ける) | 記録のみ |
| L10 | LOW | `terms[0].hook_en`、`terms[2].hook_en` | jp・zh の 1 文目 (smart =「賢い」・city =「都市」/ vision =「視覚」) を en は省く。英語読者には自明な語義で現地化の範囲 | 記録のみ |
| L11 | LOW **建議修** | `terms[0].detail_zh` | jp「各地の自治体」が「各地政府」で、`pairs[0].rows[2].a_zh`「地方政府」と表記が揃わない (loc-review low) | zh「各地政府和企业都在推进。」→「各地的地方政府和企业都在推进。」 |
| L12 | LOW | `terms[5].one_zh` / `one_en` | 正式名 (家庭能源管理系统 / Home Energy Management System) を本文で示さない (jp も示さず、hook で H = Home)。term_zh / term_en には有り | 記録のみ |
| L13 | LOW **建議修** | `terms[6].detail_en` (+ 派生 `explanation_en`) | "survey high places that are hard for people to reach and wide areas" は wide areas まで hard to reach に掛かって読める (loc-review low)。jp と意味は同じ | en "Because it can quickly survey high places that are hard for people to reach and wide areas," → "Because it can quickly survey wide areas and high places that are hard for people to reach," |

**先行審査 MEDIUM の解消確認 (三語)**: a1 r1 ① スマートシティ考点の題文なぞり → 解消 (§1-2) / ② HEMS 考点が 2023r05-q098 で支えられない → 考点削除で解消 / ③ スマートメーターを電気だけに限定 → jp・en 解消、**zh 退行 (M1)** / ④ マシンビジョン図 static → steps 4 で解消。a1 r2 ⑤ goals / key_points が全用語を 4 つの場で分けると読める → 三語とも解消 (ドローンを外に置く)。a2 r1 ⑥ HEMS 考点が正解肢の組を言い直す → 考点削除で解消 (D-211)。

**範囲外の観察**:
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、B2 審査済み)。
- O2 v1 の各用語 quiz (2009h21a-q028 / 2010h22h-q015 / 2011h23tokubetsu-q014 / 2012h24h-q021 / 2013h25a-q016、全て組込みシステムの題) と challenge 3 題 (2014h26a-q002 / 2021r03-q006 / 2022r04-q003) は v2 で外れた。いずれも本単元の見出し語を問わない題で、u01 (組込み・ファームウェア) / u03 (コネクテッドカー) の受け持ち。topic 内で本単元に最も近い未引用題 2026r08-q008 (店舗・工場の設備センサ → スマホで監視 = IoT 事例、正答ウ) は u01 で引用済みで、スマートファクトリー detail と矛盾しない。
- O3 独立 copy 照合の近似 1 件は一般句の偽陽性 (§1-4)。

確認済みで問題なし: 限定条件 (exam 考点 1 件保持)、§9 禁止句 grep (L1・L3 以外 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤60 字)、図の文字列の写し (validate 0、独立照合 0)、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (7/7、HEMS は同綴り)、zh 訳語表 (B6 warn 0)、図種 (tree static ×1 / flow steps ×3 / table static ×1 / 図なし ×2 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、u01〜u03 との整合。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **2** (M1 HEMS detail_zh の電力限定の退行 / M2 スマートシティ hook の言い切り) |
| LOW | **13** (建議修 3: L1 / L11 / L13、記録のみ 10: L2〜L10・L12) |

## 5. 判定

**FAIL** (D-199: MEDIUM 2 件)。全 7 用語・考点 3 件 (qid 付き 1 件)・quiz / challenge 4 題で、考点の主張は正答と一致し、誤答肢を支持する記述・選択肢のなぞりは無く、限定条件の落ちも無い。先行審査の MEDIUM 6 件は 5 件が三語とも解消、1 件 (スマートメーターの電気限定) が zh で退行 (M1)。M2 はフックの言い切りを同単元の欄が否定する観点 7。M1・M2 とも 1 欄内の文字列置換で直せるため、補丁 (B3: M1・M2 + 建議修 L1 / L11 / L13) 適用後に validate / parity を再実行し PASS とできる。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-17-u04
✓ strategy-05-17-u04 unit: 0 issues (data/ip/textbook/units/strategy-05-17-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-17-u04
✓ strategy-05-17-u04 parity: 33 locations, 0 diff
EXIT=0
```
