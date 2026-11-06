# Rule A 全数抽検 — strategy-05-14-u02 (金融・社会インフラのシステム)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (b33)、repo HEAD `9eac988c` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b33-u02-a1` merge 結果、sha256 先頭 `93049ac4aca41b2c`)。journal `data/ip/textbook/.planning/v2/strategy-05-14-u02/journal.b33-u02-a1.jsonl` (jp r0 → jp-review r1 PASS → loc r0 → loc-review r1 PASS)。
- **対象**: `data/ip/textbook/units/strategy-05-14-u02.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (金融情報システム / GPS / GIS / ITS / ETC / スマートグリッド / CDN) + 単元レベル (goals / overview_rows / pairs 2 組 / key_points / overview.intro / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`docs/templates/ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `v1-original.json` (用語・`term_zh`・`term_en` とも 7 語 v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption・cell)` と単元レベル全フィールドを三語とも読んだ (派生 `definition_* / explanation_* / memory_hook_* / summary.*` は機械ゲートの parity が担保)。
2. **考点 × 引用題**: 考点 7 件 (exam 2 + mix 5)、qid 付き 2 件 = 引用 2 題 (2020r02o-q091 / 2024r06-q099、いずれも topic `strategy-05-14`)。quiz は GPS のみ 2 枠 (同 2 題)、challenge 3 題 (上記 2 題 + 2017h29h-q022 = 本文未引用)。2020r02o-q091 は `translations/2020r02o.json` の `stem_jp_clean` で判定。ETC / ITS / GIS / CDN / スマートグリッド / 金融情報システム に topic 内の引用題は無いため、全 questions.json を見出し語で grep し他 topic の関連題 (2019h31h-q093 NFC、2023r05-q098 スマートメーター、2021r03-q013 勘定系、2009h21h-q018 ETC カード、2018h30a-q035 / 2018h30h-q022 / 2020r02o-q027 / 2020r02o-q074 = 見出し語が誤答肢) と矛盾しないことも確認。
3. **D-198 写し**: validate copy guard = 0 件。独立照合: 単元の JP 文字列 139 本 (派生除く) を topic 内全 39 題の題文 (clean 優先) + 選択肢と 12 字連続照合 (記号・空白除去) を **カタカナ 4 字以上・英数遮蔽あり / 遮蔽なしの 2 通り** + **1〜2 字置換の近似一致** で実施 → **0 件**。照合器の感度は、2024r06-q099 の題文の一節を goals に差し込んだ検体で exact 3 / near1 1 を検出して確認。カタカナの多い文 (CDN の one / detail / fig、スマートグリッドの detail、ETC の fig) を目視 — 題の語句の連なりなし。
4. **D-195**: one = 1 文 × 7 (太字あり)、detail 2〜3 文、図種 = tree static ×2 (金融・ITS) / flow steps ×4 (GPS 4・GIS 4・ETC 4・CDN 4) / compare static ×1 (スマートグリッド) = 登録内。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) = 本文ヒット 0 (`freq_badge` は「標準」)。zh / en の exam ×6 は `kind:"exam"`、only ×2 は L6 / L8 で扱う通常用法。
5. **D-200**: 考点数 1/2/1/1/0/1/1 (≤3 ✓)、各 JP 1 文・57〜69 字 (≤100 ✓)。framing は validate 0。
6. **D-205 / D-210**: 改訂のある文書 (規格・法令・ガイドライン) の構成要素の数・名前は本文に無し。金融の 勘定系 / 情報系 / 対外系 は「例えば…に分けて説明される」+ 図「(例)」で一例扱い ✓。法改正前後で文言の変わる引用題なし。
7. **三語**: `[[jp:]]` 原語 17 種 (金融情報システム / 勘定系 / 情報系 / 対外系 / 全銀システム / 全地球測位システム / 準天頂衛星 / 地理情報システム / レイヤー / 高度道路交通システム / 安全運転支援 / 電子料金収受システム / スマートグリッド / スマートメーター / コンテンツ配信ネットワーク / キャッシュサーバ / オリジンサーバ) が jp 本文に全て実在、one_zh / one_en 7/7 に見出し語の `[[jp:]]` あり、`term_zh` 7 語が `zh_terms.json` と一致。
8. **既往指摘**: jp-review r1 (LOW 10・HIGH/MEDIUM 0)、loc-review r1 (LOW 6・HIGH/MEDIUM 0)。HIGH / MEDIUM の既往なし → 回帰の対象なし。既往 LOW は全て未反映のまま残っており (journal の流れ上 r1 PASS で終了)、本監査で再判定した (§3)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 金融情報システム | OK — 引用題なし。mix: 勘定系 = 残高そのものを更新する中核 / 情報系 = 蓄積データを分析し営業・経営判断に使う、役割が違う (標準事実)。全銀システム = 銀行間振込の共通網 ✓。2021r03-q013 の誤答肢 (勘定系の即時バックアップ切替 = FinTech ではない) と矛盾しない (本単元は二重化による信頼性を述べるのみ) | OK。detail / key_points[0] の「社会全体のお金の流れを止める」は 1 機関の停止の影響として誇張 (jp-review の既往 LOW) | zh/en「信息系统 / information systems」が見出し語 金融信息系统 と衝突 (loc-review 既往 LOW)、zh/en detail 1 文目の「通常 / often…三部分」 | L2, L3, L9, L10 |
| 2 | GPS | OK — exam 2 / 2 題: 端末は衛星の電波を受信して計算し、発信から到達までの時間を距離に換えて位置を求める (2020r02o-q091 正答ウ = 衛星からの電波の受信 + 時刻差など; 誤答ア・イ = 端末が要求を送る型、エ = 地上基地局) / 準天頂衛星 = 日本付近の上空に長くとどまり GPS と併用、建物で衛星が見えにくい場所でも精度向上 (2024r06-q099 正答ウ)。限定条件: q091 正答の「など」「三つ以上」は考点の「各衛星との距離」「複数」で範囲を閉じていない; q099 の「比較的」「特定の地域の上空」は「日本付近の空の高い位置に長く」で事実どおり。fig flow 4 段 (時刻入り送信→受信→時刻差 × 電波の速さ = 距離→複数距離で 1 点) は one・detail と一致 | D-198 (iii) 不該当 (L6 / L7) | points[1].text_en の「other satellites」(loc-review 既往 LOW) | L6, L7, L9 |
| 3 | GIS | OK — 引用題なし。mix: GPS = 位置を測る / GIS = 位置付きデータを地図の上で使う、カーナビは両方の組合せ — 両側とも正の定義で境界正しい (GIS が測位すると読める箇所なし)。challenge 2017h29h-q022 の誤答肢 (カーナビの現在地把握) を GIS / GPS の記述が支持する形ではない (題は IC タグの事例を問う) | OK。fig 最終 caption「遠い」と node / detail「足りない」の小さなずれ (既往 LOW) | OK | L10 |
| 4 | ITS | OK — 引用題なし。mix: ITS = 交通の情報化の取組み全体の名前、ETC = その中の料金支払いの 1 システム (ITS ⊃ ETC 正しい)。detail は「例えば VICS・ETC・安全運転支援 など」で開いた列挙 ✓、hook「Systems の複数形 = 多くのシステムの集まり」✓ | fig tree の根ラベルに「例」が無く、子 3 つで閉じた分類に見える (detail は「例えば…など」) | one_en が jp の「など」(安全や渋滞の解消などを目指す) を落とし目的が 2 つに閉じる (zh は「等」あり、pairs[1].rows[1].a_en は "and more" あり → 欄同士も不一致) | L1, L4 |
| 5 | ETC | OK — 引用題・考点なし。one / detail (車載器 + アンテナの無線、IC カード、後日請求、渋滞減) は事実どおり。2009h21h-q018 (即時引落し = デビット、ETC カードは誤答) と「後でカードの利用代金として請求」は整合 | analogy「交通系 IC カードを車ごと使う」は、他 topic の 2019h31h-q093 (NFC 準拠の通信 = 交通系 IC 乗車券の改札、ETC 車載器の無線は誤答) に当てると誤答側へ読める | zh「信用卡消费款项」(jp「カードの利用代金」より狭い、loc 既往 LOW) | L5, L9, L10 |
| 6 | スマートグリッド | OK — 引用題なし。mix: スマートメーター = 使用量を計測して送る機器、スマートグリッド = その情報で需給を調整する電力網全体 — 2023r05-q098 正答イ (住宅などで使用量を自動計測し事業者へ送信) と整合、誤答肢を支持しない。compare 3 行は detail と一致 | mix 考点が detail 1 文目の言い直し (D-203 §9、既往 LOW) | key_points_zh[3] の直訳調 (既往 LOW) | L9, L10 |
| 7 | CDN | OK — 引用題なし。one = 各地のキャッシュサーバに複製、近くから配信; detail = オリジンサーバ、遅延短縮 + オリジンへの集中回避 (配信の分散という目的あり)、キャッシュミス時の取り寄せと保存; mix = 1 台の性能向上ではなく複製の分散配置で距離を縮める; key_points[4] = 速さと負荷軽減の両立 — 欄同士で一致 | fig.steps[2] の「無いときだけ」は有効期限切れ・キャッシュ不可の内容を外す (IT パスポートの水準では誤りに至らない) | OK | L8 |

**単元レベル**: goals 3・overview_rows 7 行 (2 列: 分野 / 手がかりの語)・pairs 2 組 (GPS / GIS 3 行 key 1、ITS / ETC 3 行 key 1)・key_points 5・challenge 3。pairs の各行は用語の one / detail と一致。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 10 (うち 建議修 5)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (before → after) |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[3].one_en` | jp「安全や渋滞の解消**など**を目指す」の「など」を en が落とし、ITS の目的が 2 つに閉じる。zh は「等」、`pairs[1].rows[1].a_en` は "and more" で、欄同士も不一致 | en `to improve **safety** and **ease congestion**.` → `to improve **safety**, **ease congestion** and more.` (jp / zh 変更なし) |
| L2 | LOW **建議修** | `terms[0].detail_zh/en`、`terms[0].points[0].text_zh/en`、`terms[0].fig.data.root.children[1].label.zh/en` | 情報系 の訳「信息系统 / information systems」が見出し語「金融信息系统 / financial information system」と同語になり、mix 考点の 勘定系 / 情報系 の対比が「総称の中に総称」と読める (loc-review 既往 LOW、未反映) | zh detail_zh・points[0].text_zh: `**信息系统**（[[jp:情報系]]）` → `**信息类系统**（[[jp:情報系]]）`; fig label zh `信息系统：把交易数据用于分析` → `信息类系统：把交易数据用于分析` / en detail_en・points[0].text_en: `**information systems** ([[jp:情報系]])` → `**information (analytics) systems** ([[jp:情報系]])`; fig label en `Information systems: use transaction data for analysis` → `Information (analytics) systems: use transaction data for analysis` (jp 変更なし) |
| L3 | LOW **建議修** | `terms[0].detail_jp/zh/en`、`key_points_jp/zh/en[0]` | 1 つの金融機関のシステムの誤り・停止で「社会全体のお金の流れが止まる」は誇張 (jp-review 既往 LOW、未反映)。zh detail は「可能」で弱めており jp と強さも不一致 | detail jp `わずかな誤りや停止が社会全体のお金の流れを止めるため` → `わずかな誤りや停止が多くの利用者や取引に影響するため` / zh `哪怕一点差错或停机都可能让整个社会的资金流动陷入停滞` → `哪怕一点差错或停机都可能影响大量用户和交易` / en `Even a small error or outage can freeze the flow of money across society` → `Even a small error or outage can affect a great many customers and transactions`; key_points[0] jp `止まると社会全体のお金の流れが止まるため` → `止まると多くの利用者や取引に影響が及ぶため` / zh `一旦停止，整个社会的资金流动就会停滞` → `一旦停止，就会影响大量用户和交易` / en `because an outage would halt the flow of money across society` → `because an outage would affect a great many customers and transactions` |
| L4 | LOW **建議修** | `terms[3].fig.data.root.label.jp/zh/en` | ITS の tree は子 3 つ (VICS / ETC / 安全運転支援) で「例」の表示が無く、閉じた分類に読める。detail は「例えば…など」、金融の tree は「(例)」付き (型 10 の兆候だが法令・規格の区分ではなく引用題もないため LOW) | jp `ITS (高度道路交通システム)` → `ITS (高度道路交通システム) に含まれるシステム (例)` / zh `ITS（智能交通系统）` → `ITS（智能交通系统）包含的系统（示例）` / en `ITS (Intelligent Transport Systems)` → `Systems within ITS (Intelligent Transport Systems) (examples)` (注: zh の before は `terms[3].term_zh` と同文字列 — field path で置換) |
| L5 | LOW **建議修** | `terms[4].analogy_jp/zh/en` | 「交通系 IC カードを車ごと使う」は仕組みの同一視に読め、他 topic の 2019h31h-q093 (NFC 準拠 = 交通系 IC 乗車券の改札が正答、ETC 車載器の無線は誤答) に当てると誤答側を選ぶ (型 9 の形だが引用 / challenge 題ではないため LOW) | jp `財布を出さずに駅の改札を通れる交通系 IC カードを、車ごと使うようなもの。` → `財布を出さずに駅の改札を通れる交通系 IC カードを、車ごと使うようなもの。ただし無線の方式は改札にかざす IC カードとは別で、離れたアンテナと走りながら通信する。` / zh `就像不用掏钱包就能刷交通卡通过地铁闸机，只是换成整辆车来刷。` → `就像不用掏钱包就能刷交通卡通过地铁闸机，只是换成整辆车来刷。不过无线方式与在闸机上轻触的交通卡不同，是边行驶边与远处的天线通信。` / en `It is like tapping a transit card at a station gate without opening your wallet, except the whole car is the card.` → `It is like tapping a transit card at a station gate without opening your wallet, except the whole car is the card. The radio method differs from a tap card, though: the car talks to an antenna some distance away while moving.` |
| L6 | LOW | `terms[1].points[0].text_jp/zh/en` | 「端末が行うのは衛星の電波の受信と計算」は q091 の送信型の誤答肢 (ア・イ) を暗に打ち消すが、選択肢の組 (衛星 / 基地局 × 送信 / 受信) も順序も語句もなぞらず、正答の原理を正の定義で述べる → D-198 (iii) 不該当。正答の「など」「三つ以上」は範囲を閉じていない | 記録のみ |
| L7 | LOW | `terms[1].points[1].text_jp/zh/en` | 分類題 2024r06-q099 の説明要素 (上空に長くとどまる・GPS と併用・見えにくい場所・精度向上) を全て含むが、語順・語句とも別で準天頂衛星の一般定義 = D-209 免除内 (選択肢の語句・組は使っていない)。key_points[2] でも再出 (反復) | 記録のみ |
| L8 | LOW | `terms[6].fig.steps[2].caption_jp/zh/en` | 「無いときだけ / 只有…才 / Only when」はキャッシュの期限切れ・キャッシュ不可の内容を外す限定。誤学習には至らない | 記録のみ (任意: 「だけ」「只有…才」「Only」を除く) |
| L9 | LOW | loc-review 既往 (未反映): `terms[0].detail_zh/en` 1 文目「通常分为三部分 / are often described in three parts」(jp は「例えば」) / `terms[4].detail_zh`・`fig.data.nodes[3].label.zh`・`fig.steps[3].caption_zh`「信用卡消费款项」(jp より狭い) / `key_points_zh[3]` 直訳調 / `terms[1].points[1].text_en`「other satellites」 | 事実誤りなし。信用卡 は ETC カードの大半と一致し 2009h21h-q018 とも矛盾しない | 記録のみ |
| L10 | LOW | jp-review 既往 (未反映) ほか: `terms[4].fig.steps[1..2]` (入口でも料金が決まるように読める; 「出口で」と足すと均一料金区間で誤りになるため改稿しない) / `terms[2].fig.steps[3].caption_*`「遠い」vs node「足りない」 / `terms[5].points[0]` が detail の言い直し (§9) / ITS ⊃ ETC が detail・points・pairs・fig・goals に出る (書き方 8) / key_points に GIS・ITS・ETC なし / challenge 2017h29h-q022 (IC タグ、本単元で未教授; topic 内に代替なし) / 金融の analogy・hook が 勘定系 側に寄る / 図中の スマートメーター・オリジンサーバ が detail の定義より先 | 記録のみ |

**型 (1)〜(10) の個別確認**: (1) option tracing — L6 / L7 で判定、不該当。validate の `choice-echo` warn なし。(2) 「など」落ち — 引用題側は無し; 本文 jp→en の落ちは L1。(3) 別名を別物として教える — 全地球測位システム / 地理情報システム / 高度道路交通システム / 電子料金収受システム / コンテンツ配信ネットワーク / 次世代送電網 は全て括弧の同格 ✓。(4) 比喩の範囲 — 雷 (時間→距離)・透明シート (層の重ね)・神経 (遠方の情報)・支店 (複製の分散配置) は one / detail を否定しない; ETC の比喩は L5。(5) 回帰 — 既往 HIGH/MEDIUM なし。(6) zh/en の語が誤答肢に読める — 該当なし (L2 は誤答肢ではなく総称との衝突)。(7) 法改正 — 該当題なし。(8) 比喩の鍵語が他見出し語 — 「帳場」(勘定系は見出し語ではない)・「IC カード」(ETC 自身の detail と一致) → 該当なし。(9) 引用 / challenge 題への当てはめ — q091・q099・q022 とも誤答を選ばない。(10) 閉じた列挙 — 法令・規格の区分なし; ITS tree は L4。

確認済みで問題なし: GPS / GIS の境界 (測る / 使う、pairs[0] と mix 一致)、ITS ⊃ ETC (総称 / 1 システム)、CDN の目的 (複製の分散配置による遅延短縮 + オリジン負荷の分散)、D-198 写し (validate 0 + 独立照合 遮蔽あり / なし / 近似 全 0)、§9 禁止句 0、D-200、`[[jp:]]` 原語 17 種実在、one_zh / one_en 見出し語併記 7/7、zh 訳語表一致、図種登録内、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **10** (建議修 5: L1〜L5 / 記録のみ 5: L6〜L10) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 7 件 (qid 付き 2 件)・引用 2 題 + challenge 未引用 1 題 + 他 topic の関連 8 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。LOW 建議修 5 件 (L1〜L5) は補丁 (B3) で修正推奨、L6〜L10 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-14-u02
✓ strategy-05-14-u02 unit: 0 issues (data/ip/textbook/units/strategy-05-14-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-14-u02
✓ strategy-05-14-u02 parity: 36 locations, 0 diff
EXIT=0
```
