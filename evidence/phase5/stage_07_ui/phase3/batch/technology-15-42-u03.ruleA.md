# Rule A 全数抽検 — technology-15-42-u03 (検知デバイス: 光・電磁・運動センサー)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / jp-review / localiser / loc-review) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b62)、repo HEAD `05c1955e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b62-u03-a2` merge 結果、sha256 先頭 `a1c30ed7c7a293fc`)。
- **対象**: `data/ip/textbook/units/technology-15-42-u03.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (光学センサー / 赤外線センサー / 磁気センサー / 加速度センサー / ジャイロセンサー) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200、D-202、D-203、D-204 / D-205、D-208 (既知の失敗型 1〜10)、D-209、D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-15-42-u03/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes label・steps caption)` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) は本体から `**` 除去・`[[jp:X]]` → `X` (括弧は本体側に既存) 変換したものとスクリプトで照合 → 45 箇所 不一致 0 (用語 one / detail / hook × 三語 + summary.key_points / memory_hooks × 三語)。
2. **考点 × 引用題**: 考点 全 5 件 (exam 1 + mix 4)、qid 付き 1 件 (2026r08-q078)。manifest の `term_questions` も 光学センサー → 2026r08-q078 の 1 題のみで、他 4 用語は引用題なし。topic `technology-15-42` 全 25 題をセンサー語 (センサ / ジャイロ / 加速度 / 赤外線 / 磁気 / 人感 / 光学) で検索 → 4 題: センサーが正答 = 2026r08-q078 と同文旧版 2021r03-q072 (u05 の challenge で使用済) / 赤外線が通信インタフェースの誤答肢として出る = 2018h30a-q066 (NFC)・2014h26h-q073 (HDMI)。topic 外のセンサー関連題 = 2024r06-q099 (ジャイロセンサーが誤答肢・正答は準天頂衛星) / 2020r02o-q014 (ベッドの人感センサが誤答肢) / 2022r04-q092 (BLE、赤外線の誤答肢)。いずれも本文がその誤答肢を支持しないことを確認 (ジャイロで位置を測るとは書かない、赤外線センサーを通信インタフェースとして書かない)。
3. **物理事実 (単元固有の焦点)**: 各センサーの測る量・原理・用途を一般物理と照合 (§2 表に 1 件ずつ)。排他的な分類 (可視 / 不可視で光学と赤外線を分ける等) が残っていないかを goals / overview / pairs / points / hook / key_points で横断確認。
4. **quiz / challenge_questions**: quiz = 光学センサーの `quiz` / `inline_quiz` = [2026r08-q078]、他 4 用語は空。challenge 3 題 = 2026r08-q078 / 2010h22h-q078 (非接触 IC カード = RFID、誤答に IrDA) / 2014h26h-q073 (HDMI、誤答イ = 赤外線インタフェース)。後 2 題はセンサーと無関係 (L9)。本文は赤外線を「通信方式」として説明しないため、両題の赤外線系誤答肢を支持しない → 矛盾なし。
5. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn も 0)。独立照合: 単元の JP 文字列 82 本 (派生除く) を topic 全 25 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合 (句読点・記号・空白除去) → **カタカナ 4 字以上・英数を □ に遮蔽: 0 件 / 遮蔽なし: 0 件 / 1〜2 字置換の近似一致 (12 字窓・ハミング距離 1〜2): 0 件**。カタカナの多い文 (センサー / アクチュエーター / スマートフォン / ドローン を含む one・points・pairs) を目視: 2026r08-q078 の場面語 (IoT サーバ・外気温・窓の開閉) は本文に一切出ない。
6. **D-195**: one = 1 文 × 5 (太字あり)、detail 3 文 × 5、図 = 赤外線 (flow steps 4 nodes / 3 steps)・加速度 (flow steps 4 nodes / 3 steps) の 2 枚、光学・磁気・ジャイロは図なし (登録 6 種内、a1 の静的フロー図は削除済)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → JP ヒット 0 (`freq_badge` は「低頻」)。zh / en 相当語 grep のヒットは `examples` / `Example uses` / `points[].kind = exam` のみで偽陽性。定義前使用: 物理量・電気信号 = terms[0].detail 1 文目で定義、磁界 = terms[2].detail、加速度 = terms[3].detail、角速度 = terms[4].detail (磁気 points[0] と goals[2] が加速度・角速度を先に使う点は L10)。
7. **D-200**: 考点数 1/1/1/1/1 (≤3 ✓)、JP 文数 1/2/2/2/1、字数 61/79/75/58/54 (≤100 ✓)。**framing** (validateV2 `pointFraming` の型で全考点を確認): jp 0 / zh 0 / en 0 (正規表現の唯一のヒットは zh「给出读数」の「出」で framing ではない)。
8. **D-197**: validate 0 (key_points[1] の括弧内 5 語・goals[2] の 3 語は validate の羅列規則で判定済、目視で再判定しない)。
9. **D-205 / D-210**: 改訂のある文書 (規格・法律・知識体系) の構成要素数・名称は本文に無し、引用題に改正前の文言なし → 該当なし。
10. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・総表・比較表の三語一致、`[[jp:…]]` 原語 7 種 (センサー / アクチュエーター / 光学センサー / 赤外線センサー / 磁気センサー / 加速度センサー / ジャイロセンサー) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 5/5 に見出し語の `[[jp:]]` (D-202)、zh 訳語は `zh_terms.json` と一致 (光学传感器 / 红外传感器 / 磁传感器 / 加速度传感器 / 陀螺仪传感器 / 执行器 / IoT（物联网）; センサー・赤外線・磁界・加速度・角速度は表に無し)。
11. **機械ゲート**: §6 に出力全文。

## 2. 前回 MEDIUM の解消確認 (jp-review a1 r1 ×3 / a1 r2 ×1 / a2 r1 ×1)

| # | 前回指摘 | 現在の該当欄 (jp / zh / en) | 解消 | 退行確認 (関連欄) |
|---|---|---|---|---|
| P1 | a1 r1: 加速度 points[0]「測っているのはあくまで速度の変化」が detail の重力と矛盾 | `terms[3].points[0]` jp「加速度センサーは重力を含む加速度を測るので、止まっていても傾きが分かる。回転の速さそのものはジャイロセンサーが測る。」/ zh「…测量的是包括重力在内的加速度，所以即使静止也能知道倾斜。…」/ en "…measures acceleration including gravity, so it can tell tilt even when the device is still. …" | ✓ (「あくまで」削除、重力を含むと明記) | detail (止まっていても重力の向き)・`overview_rows[3].one_line`「速度の変化と重力の向き」/ "changes in speed and the direction of gravity"・`pairs[1].rows[0].a` 同・fig steps[0..2] (傾き → 重力の向き → 各軸の加速度) と三語とも整合。hook「一定の速さで進むだけなら値は変わらない」/「读数就不会变」/ "the reading stays the same" は「0 になる」と書かず、重力分が残る事実と両立 (L7 は別の細部)。one「速度の変化の度合い」は定義そのもので限定語なし |
| P2 | a1 r1: 光学 / 赤外線を可視 / 不可視で排他的に分ける規則 (goals[1]・overview・hook・pairs) | `goals[1]` jp「光を扱う 2 種類のセンサーについて、検知する対象の違いを説明できる。」/ zh「…在检测对象上有何不同。」/ en "…differ in what they detect."; `overview_rows[0].extra[0]`「光の有無や強さ (明るさ)」/「光的有无或强弱（亮度）」/ "Presence or strength of light (brightness)"; `pairs[0].rows[0]` a「…全般」/ b「赤外線 (…など) に特化」; `terms[0].hook` 削除 | ✓ | 「可視光」の語は `terms[1].one_*` (可視光 / 可见光 / visible light) に赤外線の波長の基準としてのみ残り、光学センサーの検知範囲を限る分類基準としての用法 (goals / overview / pairs / hook の「可視光の明るさ」「目で見える光が主役」「目に見えるかどうかで分ける」) は三語とも 0 件。`terms[1].points[0]`「赤外線センサーも光を受けて検知する」で包含関係を認めたうえで対象 (赤外線 / 明るさ) を正の定義で対比 → 排他規則ではない。en `pairs[0].rows[0].b_en` "Infrared only" は赤外線センサー側の検知対象の限定で事実に合う (光学側を不可視光から締め出していない)。zh a 欄「整体」の不自然さは L4 |
| P3 | a1 r1: 光学センサーの静的フロー図が one の言い直し (飾りの図) | `terms[0].fig = null` | ✓ | 残る図は赤外線・加速度の段階図 2 枚で、どちらも one に無い過程 (人の接近 → 赤外線量の変化 → 信号 → 点灯 / 傾き → 重力の向き → 各軸 → 画面) を持つ。磁気の静的表 (a1 r2 low) も削除済 |
| P4 | a1 r2: key_points[1]「センサーの名前は何を検知するかに由来」が ジャイロ hook と矛盾 | `key_points[1]` jp「センサーごとに検知する量 (光・赤外線・磁界・加速度・角速度) が異なり、その量によって機器に分かることが決まる。」/ zh「每种传感器检测的量…各不相同，设备能知道什么由这个量决定。」/ en "Each sensor detects a different quantity (…), and that quantity decides what the device can find out." | ✓ | 名前の由来の一般化は三語とも 0 件。`terms[4].hook`「ギリシャ語の「回る」に由来 … ジャイロスコープの名から」/ zh「陀螺仪…」/ en "…traces back to the gyroscope" と衝突しない。summary.key_points も同文 |
| P5 | a2 r1: 磁気 points[0]「方位 (どちらを向いているか)」が機器の向き全般に読める | `terms[2].points[0]` jp「磁気センサーが地磁気から分かるのは方角 (北がどちらか) である。機器の傾きや向きの変化の速さは、加速度や角速度という別の量を測るセンサーが受け持つ。」/ zh「…得知的是方位（哪边是北）。设备的倾斜和朝向变化的快慢…」/ en "…is direction, meaning which way is north. A device's tilt and how fast its orientation changes are handled by…" | ✓ | 加速度 detail (傾き)・fig steps[2] (画面の向き)・ジャイロ detail / `pairs[1].rows[1].b` (向きの変化を追う) と量が一致 (方角 / 傾き / 向きの変化の速さ)。zh「方位（哪边是北）」、en "direction, meaning which way is north" とも北に絞られている |

## 3. 用語別判定 (5 / 5)

| # | 用語 | 事実 (物理・考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 光学センサー | OK — one「当たった光の有無や強さを検知して電気信号に変える」= 受光素子の一般原理で正しい。detail の照度センサー (環境光センサー) を「光学センサーの一種」とするのは正しい。exam 考点 (2026r08-q078 正答エ センサー): センサー = 物理量 → 電気信号、アクチュエーター = 電気信号 → 動き・力。題の場面 (外気温を電気信号に) と正答に一致。比較した選択肢組 {アクチュエーター / エッジコンピューティング / キャリアアグリゲーション / センサー} のうち考点はセンサーとアクチュエーターの 2 語だけを、正答側から順に、両側とも正の定義で述べる → D-209 の「取り違えやすい 2 語の対比」に当たり (iii) ではない。題の場面 (IoT サーバ・外気温・窓の開閉) は不使用。限定条件: 題は「外気温を電気信号に変換する役割」を問い、考点は物理量一般に広げるが、センサーの標準定義で正答と同じ向き → 一般化として支持される | OK (図なし = 定義型) | OK | L8 (考点がセンサー一般の話) |
| 2 | 赤外線センサー | OK — 「可視光より波長が長く目に見えない」✓。「温度を持つ物体は温度に応じた赤外線を出す」= 熱放射で正しい (常温物体の放射は主に赤外域)。人感センサー (焦電型、熱放射の変化) ✓、リモコン受光部 ✓ (ただし後者は熱でなく送信側 LED の赤外線信号を受ける → L1)。hook_jp「赤の外側」✓、hook_en "Infra = below: just below red in frequency" ✓ (周波数が赤より低い)。fig steps (接近 → 届く赤外線が増える → 電気信号 → 機器が判断し点灯) ✓、判断はセンサーでなく機器 (caption steps[2]) と一致。mix 考点「も光を受けて検知する … 光学センサーと違い、体温などの熱を手がかりに暗い場所でも人を検知」= 対象の正の対比で排他分類ではない | OK | zh「接收部」・hook_zh の日本語迂回 (L1/L3/L5) | L1 建議修, L3 建議修, L5 建議修 |
| 3 | 磁気センサー | OK — 磁界の強さ・向き ✓、地磁気の向き → 北 = 電子コンパス ✓、扉の磁石の有無で開閉検知 (リードスイッチ / ホール素子) ✓。mix 考点「地磁気から分かるのは方角」— 3 軸磁気センサーは伏角も測れるが、地磁気の用途として方角に絞る記述は IT パスポートの水準で正しく、他欄 (傾き = 加速度、向きの変化 = ジャイロ) と量の分担が一致 (P5)。analogy (持ち歩ける方位磁針) ✓ | OK | OK | L10 (定義前使用、記録のみ) |
| 4 | 加速度センサー | OK — 加速度 = 単位時間あたりの速度の変化 ✓。静止中も重力 (1 g) を測るので傾きが分かる ✓ (MEMS 加速度計は重力を含む比力を測る)。用途 (画面の縦横・歩数計) ✓。fig (傾き → 機器から見た重力の向きが変わる → 3 軸の加速度の変化 → 画面横向き) ✓。analogy (急停止で前に引っぱられる乗客 = 慣性) ✓。hook「一定の速さで進むだけなら値は変わらない」✓ (0 ではなく「変わらない」) — 曲線を一定の速さで進むと向心加速度が出るが「進む」は直進と読める (L7)。hook_zh の「加速」字義は L2 | OK | hook_zh (L2) | L2 建議修, L7 |
| 5 | ジャイロセンサー | OK — 角速度 = 単位時間あたりの向きの変化 (度/秒) ✓、軸ごとの回転の速さ ✓、手ぶれ補正・ドローン姿勢 ✓、加速度センサーと組み合わせて姿勢を求める ✓。mix 考点「傾いたまま止まっているときは回転の速さが 0」✓ (理想値; 地球自転 15°/h やバイアスは IT パスポートの水準外)。hook: ギリシャ語 gyros (輪・回転) ✓、ジャイロスコープ = こまの軸の向きが保たれる働きを使う装置 ✓ (a2 r1 low の「性質の名」は「装置」に修正済)。本文は MEMS ジャイロがこまを使うとは書かない。2024r06-q099 (GPS 補完 = 準天頂衛星、ジャイロは誤答) について、本文はジャイロで位置を測るとは書かない | OK | detail_en "exact posture" (L6) | L6 建議修 |

**単元レベル**: goals 3・overview_cols 2 (検知する対象 / 身近な使い道の例)・overview_rows 5 (one_line と extra は各用語の one / detail と一致)・pairs 2 組 (光学 / 赤外線 3 行 key 1、加速度 / ジャイロ 3 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge 3。pairs[1].rows[0] a「速度の変化 (加速度) と重力の向き」/ b「回転の速さ (角速度)」は両用語の one・detail・考点と一致。事実誤りなし、三語一致。

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 12 (うち 建議修 6)**

L1 の重大度判定 (MEDIUM にしない理由): `terms[1].detail` は 1〜2 文目で熱放射を原理として述べ、3 文目でリモコン受光部を「例えば … 使われる」と並べるため、受光部も体温由来の赤外線を読むと読める余地がある。しかし (a) リモコンが熱で動くと述べる欄は三語とも無い、(b) `overview_rows[1].extra[0]` と `pairs[0].rows[0].b` が「熱を持つ物体が出す光**など**」で検知対象を開いている、(c) 赤外線センサーの引用題・quiz は無く、誤答へ導く題も無い → 観点 7 の欄内不精密 (LOW) とし、一語の限定を足す 建議修 とする。

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (before → after) |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1].detail_jp` / `detail_zh` / `detail_en` 3 文目 (+ 派生 `explanation_*`) | 熱放射の原理の直後にリモコン受光部を例示し、受光部が送信側の赤外線信号を受けることが読めない (上記判定) | jp「例えば、人が近づくと点く照明の人感センサーや、テレビのリモコンの信号を受ける受光部に使われる。」→「例えば、人が近づくと点く照明の人感センサーに使われるほか、リモコンが出す赤外線の信号を受けるテレビの受光部にも使われる。」/ zh「例如有人靠近就会亮起的照明所用的人体感应器，以及电视接收遥控器信号的接收部，都用到了它。」→「例如有人靠近就会亮起的照明所用的人体感应器就用到了它；电视上接收遥控器所发红外信号的接收器也用到了它。」/ en "It is found in the motion detectors of lights that switch on as someone walks up, and in the part of a TV that receives the remote control's signal." → "It is found in the motion detectors of lights that switch on as someone walks up, and also in the part of a TV that picks up the infrared signal sent by the remote control." |
| L2 | LOW **建議修** | `terms[3].hook_zh` (+ 派生 `memory_hook_zh`, `summary.memory_hooks_zh[1]`) | 中国語の「加速」は通常「速度を上げる」意で、「汉字“加速”就是“速度有所增减”的意思」は字義の断言として不正確 (loc-review low、未反映) | 「汉字“加速”就是“速度有所增减”的意思，它测的正是这种变化；如果只是匀速前进，读数就不会变。」→「“加速度”的“加速”在这里指速度发生变化（变快或变慢都算），它测的正是这种变化；如果只是匀速前进，读数就不会变。」 |
| L3 | LOW **建議修** | `terms[1].hook_zh` (+ 派生 `memory_hook_zh`, `summary.memory_hooks_zh[0]`) | 中国語の「红外」自体が「红色之外」の字義を持つのに日本語の字義へ迂回している (loc-review low、未反映) | 「日语“赤外”的意思是彩虹中红色的更外侧；正因为在红色之外，人眼才看不到它。」→「“红外”就是彩虹中红色的更外侧；正因为在红色之外，人眼才看不到它。」 |
| L4 | LOW **建議修** | `pairs[0].rows[0].a_zh` | 「整体」は範囲の広さを表さず不自然 (loc-review low、未反映)。jp「全般」の非排他の意 (P2 の解消点) を zh でも明確にする | 「光的有无或强弱（亮度）整体」→「泛指光的有无或强弱（亮度）」 |
| L5 | LOW **建議修** | `overview_rows[1].extra_zh[1]`、`pairs[0].rows[2].b_zh` | 「接收部」は日本語の「受光部」の直訳で中国語として不自然 (loc-review low、未反映; detail_zh は L1 で同時に解消) | `overview_rows[1].extra_zh[1]`「有人走近就亮的灯、遥控器的接收部」→「有人走近就亮的灯、遥控器信号接收器」/ `pairs[0].rows[2].b_zh`「人体感应器、遥控器的接收部」→「人体感应器、遥控器信号接收器」 |
| L6 | LOW **建議修** | `terms[4].detail_en` 3 文目 (+ 派生 `explanation_en`) | jp「機器の姿勢を求める」に無い "exact" を付加、機器に "posture" は不自然 (loc-review low、未反映) | "and it is often paired with an accelerometer to work out a device's exact posture." → "and it is often paired with an accelerometer to work out a device's orientation." |
| L12 | LOW | `pairs[0].rows[1].b_jp/zh/en` | 「分かること」の行が赤外線センサーを「熱を持つ物体の存在や温度」/「有温度的物体是否存在及其温度」/ "Whether a warm object is present, and its temperature" に限り「など」が無いが、同じ表の rows[2] にリモコン受光部 (熱でなく赤外線信号) がある (a2 r2 low、L1 と同じ緊張)。rows[0].b に「など」があり事実誤りではない | 記録のみ (直すなら jp「熱を持つ物体の存在や温度、リモコンなどの赤外線の信号」/ zh「有温度的物体是否存在及其温度、遥控器等发出的红外信号」/ en "Whether a warm object is present and its temperature, or an infrared signal such as a remote control's") |
| L7 | LOW | `terms[3].hook_jp/zh/en` 2 文目 | 「一定の速さで進むだけなら値は変わらない」— 曲線を一定の速さで進むと向心加速度が生じるので厳密には「一定の速さで**まっすぐ**」。「進む」「匀速前进」"Cruise" は直進と読め、どの欄・題とも衝突しない | 記録のみ |
| L8 | LOW | `terms[0].points[0]` | exam 考点は見出し語の光学センサーでなくセンサー一般 × アクチュエーターの対比 (題データの terms タグに合わせた配置)。D-209 の 2 語対比で (iii) 写しではない (§3 #1)。三レビューとも同判断 | 記録のみ |
| L9 | LOW | `challenge_questions[1]` (2010h22h-q078)、`[2]` (2014h26h-q073) | RFID・HDMI の題で本単元の 5 用語を問わない。topic のセンサー題は 2026r08-q078 と同文旧版 2021r03-q072 のみで、後者は u05 (アクチュエーターとデバイス制御) の `challenge_questions[0]` に使用済 → 置換候補なし (下限 3 題の制約) | 記録のみ |
| L10 | LOW | `terms[2].points[0].text_jp`、`goals_jp[2]` | 加速度・角速度を 4・5 番目の用語の detail で定義する前に使う (総表 one_line で大意は先出) | 記録のみ |
| L11 | LOW | `pairs[1]`、`terms[3].points[0]`、`terms[4].points[0]`; `key_points[0]`; mix 考点 4 件の zh / en の `**` | (a) 加速度 / ジャイロの対比が pairs + 2 考点の 3 箇所 (書き方 8、上限 2 を超える); (b) key_points[0] は terms[0].detail 1 文目のセンサー定義の言い直し (§9); (c) `terms[1..4].points[0].text_zh/en` は見出し語に `**` を付けるが text_jp には無い (三語の太字不一致、`[[jp:]]` 併記は正しい; 直すなら zh / en の `**` を外す方向) | 記録のみ |

**対比の出現欄 (書き方 8)**: ① 光学 = 光一般の明るさ / 赤外線 = 赤外線に特化: `pairs[0].rows[0..2]`、`terms[1].points[0]` (mix) → 2 箇所で許容。② 加速度 = 重力・傾き / ジャイロ = 回転の速さ: `pairs[1].rows[0..1]`、`terms[3].points[0]`、`terms[4].points[0]` (裏返し) → L11(a)。③ 方角 / 傾き / 向きの変化の速さ: `terms[2].points[0]` のみ (他の 2 量は名指しのみ) → 許容。

確認済みで問題なし: 前回 MEDIUM 5 件の解消と三語の退行なし (§2)、物理事実 (§3 全 5 用語)、排他分類の残存 0 (可視 / 不可視・名前の由来の一般化とも三語 0 件)、限定条件 (exam 考点 1 件保持)、§9 禁止句 0、framing 0/0/0、D-197 (validate 0)、D-200 (全考点 ≤2 文・≤79 字)、D-198 (copy guard 0、独立照合 遮蔽あり 0 / なし 0 / 近似 0、目視で場面語なし、(iii) 該当なし)、既知失敗型 (1) option tracing なし (2) 「など」落ちなし (3) 別名の分離なし (4) analogy / 図の範囲 — 光学 analogy は「知らせる」だけで判断を機器に残し fig caption と整合、赤外線 analogy (熱に敏感な肌) は熱放射の像で detail と矛盾しない (5) zh / en 退行なし (6) zh / en の誤答肢寄りの訳なし (7) D-210 該当なし (8) analogy の役名が他見出し語と衝突なし (9) hook を引用題に当てても誤答を選ばない (10) 閉じた列挙なし、`[[jp:]]` 原語 7 種実在、one_zh / one_en 見出し語併記 5/5、zh 訳語表一致、図種 (flow steps ×2 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **12** (建議修 6: L1〜L6 / 記録のみ 6: L7〜L12) |

## 6. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 5 用語・考点 5 件 (qid 付き 1 件)・引用 1 題 + challenge 未引用 2 題で、考点の主張は正答と物理事実に一致し、誤答肢を支持する記述・限定条件落ち・排他分類は無い。a1 / a2 の MEDIUM 5 件は三語とも解消し退行なし。LOW 建議修 6 件 (L1〜L6) は補丁 (B3) で修正推奨 (いずれも 1 フィールド内の文字列置換)、L7〜L12 はバッチ証拠の「未修 LOW」表へ。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-42-u03
✓ technology-15-42-u03 unit: 0 issues (data/ip/textbook/units/technology-15-42-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-42-u03
✓ technology-15-42-u03 parity: 25 locations, 0 diff
EXIT=0
```
