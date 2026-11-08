# Rule A 全数抽検 — technology-15-42-u04 (検知デバイス: 距離・環境量センサー)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 第 b62 批)、repo HEAD `05c1955e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b62-u04-a1` merge 結果、sha256 先頭 `af74acc50fdd3b1e`)。
- **対象**: `data/ip/textbook/units/technology-15-42-u04.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (超音波センサー / 温度センサー / 湿度センサー / 圧力センサー / 煙センサー) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/technology-15-42-u04/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。先行審査: journal `journal.b62-u04-a1.jsonl` (jp-review r1 PASS = low 7、loc-review r1 PASS = low 4、HIGH / MEDIUM 0)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes label・steps caption)` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: 考点 全 7 件 (exam 1 + mix 6)、qid 付きは 1 件のみ (`terms[1].points[0]` → 2026r08-q078)。同題を `questions.json` + `translations` の stem_jp_clean で再読: IoT デバイスが外気温を計測しサーバの指示で窓を開閉する場面で、外気温を電気信号に変える役割のものを問う → 正答エ (センサー)、誤答 = アクチュエーター / エッジコンピューティング / キャリアアグリゲーション。mix 考点 6 件は qid を持たないので、物理・技術的事実を一般知識で照合 (§2)。
3. **quiz / challenge_questions**: quiz・inline_quiz = 2026r08-q078 (温度センサー) のみ。challenge 5 題 (2026r08-q078 / 2011h23tokubetsu-q087 USB 2.0 / 2013h25a-q021 Bluetooth / 2014h26h-q073 HDMI / 2015h27h-q082 プラグアンドプレイ) は q078 以外の 4 題が同 topic の別単元 (インタフェース) の題で、本文と矛盾はしないが本単元の内容を確かめない → L8。全題 bank を「超音波 / 湿度 / 圧力センサ / 煙センサ / 温度センサ / サーミスタ / 煙感知 / 熱感知」で検索: topic 外に 2015h27a-q023 (strategy、誤答肢に温度センサ) と 2021r03-q080 (technology-22-58、温湿度管理システムの通信規格) のみで、どちらも本単元の主張と衝突しない。
4. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn なし)。独立照合として単元の JP 文字列 90 本 (派生除く) を topic 内全 25 題の題文 (stem_jp_clean) + 選択肢と 12 字連続照合 — (a) カタカナ 4 字以上・英数を □ 遮蔽 (実字 6 未満の窓は除外) **0 件**、(b) 遮蔽なし **0 件**、(c) 近似一致 (12 字窓 SequenceMatcher ≥0.83 = 1〜2 字置換) **0 件**。カタカナの多い文 (超音波 / サーミスタ / ダイアフラム / アクチュエーター を含む文) を目視 → 題の言い回しの流用なし。
   - (iii) 選択肢なぞり (D-208 (1)): `terms[1].points[1]` (センサー = 入力側 / アクチュエーター = 出力側) は q078 の誤答肢 1 つ (アクチュエーター) を含むが、取り違えやすい 2 語の両側を正の定義 (変換の向き) で述べる対比で D-209 の除外に当たる。4 選択肢中 2 つだけで組・順序をなぞらず、題の場面 (外気温・窓の開閉・IoT サーバ) も使わない → 写しではない。`terms[1].points[0]` は分類題 (どれが X か) の正答内容を見出し語の一般的な役割として述べる形 (D-209 除外)、題の言い回しの 12 字一致なし。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文 (3/2/3/2/2 文)、定義前使用 (超音波 = one の括弧、電気信号 = 温度 one、サーミスタ = detail で「素子」と説明、相対湿度 = detail で定義、ダイアフラム = 「薄い膜」と注、光電式 = detail で仕組みを説明、アクチュエーター = 考点内で定義、加速度センサー = 考点内で「速さの変化…を測る」と説明 [→ L1])。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `freq_badge`「低頻」以外のヒットは「出る」6 件 (距離が出る / 燃えるときに出る粒子 / 湯気が出る 等 = 動詞の通常用法、偽陽性) と「〜と覚える」2 件 (`terms[1].hook_jp`、`terms[4].hook_jp` + 各派生) = 5 フック中 2 つで、前例 (u02 / u04 / u05 各 1 件記録なし、23-63-u06 は 6 中 4 で L2) に照らし記録対象外。zh / en 相当 (必须 / must / always / exam / test) は "example" 内の exam のみで偽陽性。図種 = flow steps ×2 (超音波 4 段 / 煙 4 段)、他 3 語は図なし → 登録内。pair 配置 (温度→湿度、温度→煙; 各組 key 行あり)。
6. **D-200**: 考点数 2/2/1/1/1 (≤3 ✓)、各 JP 1〜2 文・字数 41〜71 (≤100 ✓、最大は煙センサー `points[0]` 71 字)。**framing 件数** (`validateV2.pointFraming` を tsx で直接実行、全考点): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の整合) → 湿度の「水蒸気の割合」(L5)、温度 exam 考点の IoT 限定 (L4) 以外に不整合なし。書き方 8 (対比の出現欄): ① 温度 / 煙 (熱 vs 粒子) = `pairs[1].rows[0]` + `terms[4].points[0]` の 2 箇所、`goals_jp[2]` は予告のみ → 許容。② 温度 / 湿度 = `pairs[0]` のみ → 許容。③ 超音波 / 光学式 = `terms[0].points[0]` のみ (u03 の光学センサーとは用語横断の参照) → 許容。④ 圧力 / 加速度 = `terms[3].points[0]` のみ。書き方 9 (限定条件): q078 の場面 (IoT デバイスの入力) は考点に保持 (むしろ L4 で定義側に寄りすぎ)。§6 → L7。§9 言い直し → L6。
8. **D-205 / D-210**: 改訂のある文書 (規格・法令・ガイドライン) の構成数・名称を述べる箇所なし。`pairs[1].rows[1]` (台所 = 熱で感知 / 寝室・階段 = 煙で感知) は住宅用火災警報器の設置実務 (消防法令: 寝室・階段は煙式、台所は熱式も可) と一致し、「向く場所の例」と例示で限定しているため閉じた分類ではない → 該当なし。
9. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・比較行・総表の三語一致 (parity 0 diff)、`[[jp:…]]` 原語 12 種 (アクチュエーター / サーミスタ / センサー / 光電式 / 加速度センサー / 圧力センサー / 温度センサー / 湿度センサー / 煙センサー / 相対湿度 / 超音波センサー / 電気信号) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 5 用語に見出し語の `[[jp:]]` あり (D-202)。zh 訳語は `zh_terms.json` (超声波传感器 / 温度传感器 / 湿度传感器 / 压力传感器 / 烟雾传感器 / 执行器 / 加速度传感器 / IoT（物联网）) に一致。
   - **zh-term warn 3 件 (自動運転 → 自动驾驶) は全て偽陽性**: `overview_rows[2].extra_jp[1]`「加湿や除湿の**自動運転**」、`terms[2].detail_jp`「加湿器や除湿機の**自動運転**」、`pairs[0].rows[2].b_jp`「除湿機の**自動運転**」は、いずれも家電の自動運転モード (automatic operation) で、車の自動運転 (self-driving) ではない。zh「自动运行」/ en "automatic … operation / Running … automatically" が正しい訳で、`自动驾驶` に置き換えると誤訳になる。prep の `zh_terms.unit.json` も 自動運転 を本単元の訳語リストから外しており、writer / loc-review (low「誤検知」) の判断と一致。修正不要。
10. **先行審査の解消確認**: jp-review の low 7 件・loc-review の low 4 件はいずれも merge 後の本文に未反映 (書き直しラウンドなし)。HIGH / MEDIUM は 0 件だったので「解消漏れ・回帰」なし。low のうち事実・訳の誤りに当たるものを本監査で独立に評価し直し、L1〜L4 (建議修) と L5〜L9 (記録のみ) に振り分けた。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、物理・技術的事実、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 超音波センサー | OK — qid なし (mix 2)。超音波 = 人の可聴域を超える高周波 (約 20 kHz 超) ✓、常温の音速 約 340 m/s ✓、距離 = 音速 × 往復時間 ÷ 2 ✓ (points[1] の「割らないと 2 倍」も正しい)、光を使わないので透明物 (ガラス) や暗所の物も検知しやすい ✓ (光学式に対する一般的な利点)、駐車支援・タンク液面計測 ✓。points[0] の「超音波 = 音の反射 / 光学式 = 光の反射、出して受け取る波で区別」は正しく、排他的分類でもない。analogy (こだま) と hook (コウモリの反響定位) は同じ原理の別場面で、どの主張も否定しない。flow 4 段は one・detail と一致 | OK | OK | L6 |
| 2 | 温度センサー | OK — exam 1 / 1 題: 外気温を電気信号に変えるのはセンサー (2026r08-q078 正答エ) と一致、誤答アクチュエーターを支持しない (points[1] が両側を正の定義で区別)。サーミスタ = 温度で電気抵抗が変わる素子、変化を電圧として読む ✓ (「例えば」で例示)、hook の thermo- 語根 (thermistor = thermal + resistor) ✓。points[0] は定義を「IoT デバイスの入力とする部品」と結び付け、detail・overview の空調・冷蔵庫制御の用途より狭く読める → L4 (下記の理由で MEDIUM にしない) | OK (D-209 除外、§1-4) | OK | L4 / L7 |
| 3 | 湿度センサー | OK — qid なし (mix 1)。相対湿度 = その温度で含みうる最大水蒸気量に対する割合 ✓、水蒸気量が同じでも気温が上がれば下がる ✓ (points[0])、温度補正のため温湿度一体型が多い ✓、加湿器・除湿機の自動運転・結露 / カビの予防 ✓、天気予報の湿度 = 相対湿度 ✓。overview 行・pairs[0].rows[0].b の「空気中の水蒸気の割合」は組成比とも読める緩い言い方 → L5。en detail の主語ずれ → L2 | OK | en 1 件 LOW | L2 / L5 |
| 4 | 圧力センサー | OK — qid なし (mix 1)。気体・液体の圧力または面に加わる力 ✓、ダイアフラムのひずみを抵抗 (ピエゾ抵抗・ひずみゲージ) や静電容量の変化として読む ✓ (「例えば」で例示)、タイヤ空気圧監視・スマートフォンの気圧高度計・血圧計 ✓、hook (山頂で袋が膨らむ = 外気圧低下) ✓。**points[0] の加速度センサーの説明「速さの変化 (傾き・振動など)」は、傾きを速さの変化の例として並べており物理的に不正確** (傾きは静止時にもかかる重力の向きから分かる; 前提単元 u03 の `加速度センサー` detail / points[0] がまさにそう教えている) → L1 | OK | OK | L1 / L7 |
| 5 | 煙センサー | OK — qid なし (mix 1)。煙の粒子を検知して火災を早く知らせる ✓、光電式 = 暗い検知室で発光部の光が煙粒子で散乱し、通常は光の届かない受光部に届く (散乱光式) ✓、一定濃度で警報 ✓、住宅用火災警報器・建物の防災設備 ✓。points[0]「くすぶりのように熱が上がる前の火は煙の方が早く捉えやすい」✓ (燻焼火災で煙式が先行するのは一般的事実、「捉えやすい」と傾向で述べ断定しない)。analogy (霧夜の車のライト = 粒子による散乱) は光電式の原理と一致。flow 4 段一致 | OK | en hook 1 件 LOW、zh 借用語 1 件 LOW | L3 / L9 |

**単元レベル**: goals 3 点 (各 term の予告、内容は本文と一致)・overview_cols 2 (検知する量 / 使われる場面の例)・overview_rows 5 行・pairs 2 組 (温度 / 湿度 3 行 key 1、温度 / 煙 3 行 key 1)・key_points 5 (各用語の detail / one と一致)・summary (記法除去版と一致)・challenge_questions 5 件 (q078 以外は別単元の題 → L8)。`pairs[1].rows[1]` の設置場所の例は消防法令の住宅用火災警報器の実務と一致 (§1-8)。事実誤りは L1 の括弧書き 1 件のみ、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 4: L1〜L4 / 記録のみ 5: L5〜L9)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (同一欄内の文字列置換) |
|---|---|---|---|---|
| L1 | LOW **建議修** (要適用) | `terms[3](圧力センサー).points[0].text_jp` / `text_zh` / `text_en` | 加速度センサーが測るものを「速さの変化 (傾き・振動など)」とし、傾きを速さの変化の例にしている。傾きは重力の向きから分かるもので、前提単元 u03 の 加速度センサー (detail・points[0]) の説明と食い違う。**MEDIUM にしない理由**: 加速度センサーは本単元の見出し語ではなく (u03 の見出し語)、括弧内の列挙 (傾き・振動を測れる) 自体は正しく、考点の結論 (圧力と加速度は測る量が違う) も正しい; 引用題・challenge 題の正答に影響しない; 単元内の他欄との不整合ではない。ただし物理的事実の誤りを含むので 記録のみ にはしない (jp-review も low で指摘、未反映) | jp: `速さの変化 (傾き・振動など)` → `速さの変化や重力の向き (動き・傾き・振動など)` / zh: `测量速度的变化（倾斜、振动等）` → `测量速度的变化和重力的方向（运动、倾斜、振动等）` / en: `measures changes in speed (tilt, vibration and so on)` → `measures changes in speed and the direction of gravity (movement, tilt, vibration and so on)` |
| L2 | LOW **建議修** | `terms[2](湿度センサー).detail_en` 3 文目 (+ 派生 `explanation_en`) | jp「加湿器や除湿機の自動運転…などに使われる」/ zh「它用于…」は用途を述べるが、en "It runs humidifiers and dehumidifiers automatically" はセンサーが機器を動かす主体のように書く。センサー = 入力側 / 動かすのは制御部・アクチュエーター (同単元 `terms[1].points[1]`、q078 の誤答肢) の区別に逆らう読み方を招く (D-208 (6) の型)。**MEDIUM にしない理由**: 湿度センサーは q078 の題の場面 (外気温・窓の開閉) ではなく、"runs … automatically" は用途の口語的な言い方で、同じ en 本文の `terms[1].points[1]` が入力側 / 出力側を明示している; どの題の誤答も選ばせない | en: `It runs humidifiers and dehumidifiers automatically and helps prevent condensation and mold in greenhouses and warehouses.` → `It is used for automatic humidifier and dehumidifier operation and to help prevent condensation and mold in greenhouses and warehouses.` (jp / zh は変更なし) |
| L3 | LOW **建議修** | `terms[4](煙センサー).hook_en` (+ 派生 `memory_hook_en`, `summary.memory_hooks_en[4]`) | jp は「火のない所に煙は立たぬ」(火 → 煙) を逆から読む構成だが、英語の諺 "where there's smoke, there's fire" は最初から 煙 → 火 の向きなので、"Flip the saying" と言うと逆の (火 → 煙) 意味になり論理が合わない (loc-review low、未反映) | en: `Flip the saying "where there's smoke, there's fire" into a job: a lookout that suspects fire as soon as it sees smoke.` → `Put the saying "where there's smoke, there's fire" to work: the sensor is a lookout that suspects fire as soon as it sees smoke.` (jp / zh は変更なし) |
| L4 | LOW **建議修** | `terms[1](温度センサー).points[0].text_jp` / `text_zh` / `text_en` | exam 考点が温度センサーを「IoT デバイスの入力とする部品である」と定義の形で IoT に結び付け、detail・overview・pairs の空調・冷蔵庫制御の用途より狭く読める (書き方 7 / unsupported restriction の型)。**MEDIUM にしない理由**: 引用題 2026r08-q078 は IoT デバイスの場面そのものなので、考点は題の限定条件を保持した言い方であり正答と一致; 「だけ」「のみ」の排他語はなく、同じ用語の detail が IoT 以外の用途を直後に述べるので、単元を通読すれば限定と読まれない。「など」を補えば狭読みの余地が消える (jp-review low、未反映) | jp: `IoT デバイスの入力とする部品である。` → `IoT デバイスなどの入力とする部品である。` / zh: `作为 IoT 设备输入的部件。` → `作为 IoT 设备等的输入的部件。` / en: `and feeds it into an IoT device as input.` → `and feeds it as input into an IoT device or other equipment.` |
| L5 | LOW | `overview_rows[2].one_line_jp/zh/en`、`pairs[0].rows[0].b_jp/zh/en`、`key_points_jp/zh/en[1]` (「水蒸気の割合」) | 「空気中の水蒸気の割合」(en "The proportion of water vapor in the air") は、空気の成分としての水蒸気の比率 (混合比) とも読め、detail・points[0] の相対湿度 (最大量に対する割合) より緩い。同じ行の `extra` が「相対湿度 (%)」と明示し、detail・hook が正しく定義しているため誤学習には至らない。一般に広く使われる言い方 | 記録のみ (直すなら jp「空気の湿り具合 (湿度) を測る」/ zh「测量空气的潮湿程度（湿度）」/ en "Measures how humid the air is (humidity)") |
| L6 | LOW | `terms[0].detail_jp`、`points[1]`、`fig.steps[3].caption`、`key_points[0]` (三語) | 「音速 × 往復時間 ÷ 2」の同じ計算規則が 4 箇所で繰り返される (D-203 §9)。points[1] は「割らないと 2 倍」という誤りの面を加えており、全くの言い直しではない | 記録のみ |
| L7 | LOW | `terms[1].analogy_jp/zh/en` (+ 程度は軽いが `terms[3].analogy_*`) | 温度センサーの比喩「肌で感じる暑さ寒さを数値に置き換える温度計の役目」は定義 (温度を測って信号にする) の言い直しで別の手がかりになっていない (D-203 §6)。湿度 (洗濯物の乾き) と圧力 (風船の張り) は別場面の像があり許容範囲 | 記録のみ |
| L8 | LOW | `challenge_questions` | 5 題中 4 題 (2011h23tokubetsu-q087 / 2013h25a-q021 / 2014h26h-q073 / 2015h27h-q082) は同 topic のインタフェース系の題で、u01 (q073)・u02 (q021)・u03 (q073)・u05 (q082 / q087) と重複する。本単元の用語に当たる過去問は 2026r08-q078 の 1 題のみ (bank 全体検索でも他になし) で、件数下限を満たすための topic 内補充 = データ制約。v1 の 2014h26a-q072 (別単元の題) が q078 に置き換わった点は改善 | 記録のみ |
| L9 | LOW | `terms[4].detail_zh`、`fig.data.nodes[2].label.zh`、`fig.steps[1..2].caption_zh` (「受光部」「发光部」) | 日本語の 受光部 / 発光部 を字面どおり移した日式寄りの語。意味は通じ、大陸の技術文でも見かける (loc-review low、未反映) | 記録のみ (直すなら 受光部 → 光接收器、发光部 → 发光元件) |

**範囲外の観察**:
- O1 zh-term warn 3 件 (自動運転 → 自动驾驶) は §1-9 のとおり全て偽陽性 (家電の自動運転モード)。zh「自动运行」が正しく、修正不要。validate の照合語表 (`zh_terms.json`) が文脈を見ないことによる既知型。
- O2 `unit_summary_*` は v1 と同文 (未改稿)、事実は正しい。

確認済みで問題なし: 引用題との一致 (exam 1 件、正答と一致・誤答不支持)、mix 6 件の物理・技術的事実 (L1 の括弧書きを除き全て正しい)、排他的分類の有無 (「向く場所の例」「例えば」で例示に限定、閉じた列挙なし)、D-198 写し (copy guard 0 / 独立照合 遮蔽あり 0・遮蔽なし 0・近似 0 / (iii) 該当なし)、§9 禁止句 (定型締め句 0、「出る」は動詞用法、「と覚える」2 件は前例上記録対象外)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤71 字)、D-205 / D-210 該当なし、`[[jp:]]` 原語 12 種実在、one_zh / one_en 見出し語併記 5/5、zh 訳語表一致 (自動運転 は偽陽性)、図種登録内、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、先行審査の HIGH / MEDIUM 0 (回帰なし)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 4: L1〜L4 / 記録のみ 5: L5〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 7 件 (qid 付き 1 件)・引用 1 題 + challenge 4 題で、考点の主張は正答と一致し、誤答肢を支持する記述も限定条件の落ちも無い。物理・技術的事実は L1 (加速度センサーの括弧書き、u03 と食い違う) を除き全て正しく、L1 は補丁 (B3) で必ず直すこと。L2〜L4 も B3 で修正推奨、L5〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-42-u04
✓ technology-15-42-u04 unit: 0 issues (data/ip/textbook/units/technology-15-42-u04.json), 3 warning(s)
  warn  zh-term  overview_rows[2].extra_zh[1]  自動運転 → 自动驾驶 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[2](湿度センサー).detail_zh  自動運転 → 自动驾驶 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  pairs[0].rows[2].b_zh  自動運転 → 自动驾驶 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-42-u04
✓ technology-15-42-u04 parity: 25 locations, 0 diff
EXIT=0
```
