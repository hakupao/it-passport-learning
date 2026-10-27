# Rule A 全数抽検 — technology-23-63-u03 (高度な脅威対策とネットワーク構成・通信保護)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-28 (S135 第 1 批)、repo HEAD `2cca4bb` + 作業ツリー (単元 JSON は未コミットの書き直し版、sha256 先頭 `57bec76c27ac193e`)。
- **対象**: `data/ip/textbook/units/technology-23-63-u03.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (EDR / DLP / SIEM / 検疫ネットワーク / DMZ / SSL/TLS / VPN / MDM) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§9)、S135 補足 D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ、登録外図種の欠如は最大 low)。比較: `data/ip/textbook/.planning/v2/technology-23-63-u03/v1-original.json` (用語 8 語・`term_zh` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ / MEDIUM = 誤解を招く・規則違反 / LOW = 文体。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版であることも目視確認。
2. **考点 × 引用題 (考点 全 17 件 = exam 12 + mix 5、うち qid 付き 14 件、引用 qid 延べ 26 件 = 異なり 24 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-23-63`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化をしていないことを確認。計算題は本単元に無い。
3. **quiz / challenge_questions** (計 5 題 + quiz 内の未引用題 2014h26h-q055): 本文と矛盾しないことを確認。2014h26a-q050 (スマホの不適切な扱い = OS を更新しない) は MDM の遠隔ロック・消去 (適切側の肢) と整合。
4. **D-198 写し**: validate の copy guard (本文 + B7 で拡張された図・表・総表・対比表) = 0 件。独立照合として単元の JP 文字列 201 本を topic 内全 217 題の題文 + 選択肢と 12 字連続照合 (カタカナ 4 字以上・英数遮蔽、遮蔽後の実字 6 未満の窓は除外) → 4 件ヒットしたが全て一般句 (「〔ネットワーク〕から切り離し」「〔ブラウザ〕から〔Web〕サーバま」= 実字 6 字前後) の偽陽性。(iii) 読んで確認: 比喩 (警備員・出口の荷物検査・警備センター・空港検疫・受付ロビー・封筒・トンネル・社用車の管理センター) はいずれも引用題に無い場面。2010h22a-q080 の具体例 (運営者の財務状況) は「サイト運営者の信用度」と一般化されており流用ではない。
5. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2〜3 文 (3/2/3/3/3/3/2/2 文)、比喩・フックが定義の言い換えでないこと (語源・字形・対比で別の手がかり)、定義前使用 (エンドポイント・振る舞い検知・相関分析・踏み台・サーバ証明書・インターネットVPN/IP-VPN は初出で説明あり)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え → `freq_badge` 以外 0 件)、図の型 (過程 = flow steps 6、DMZ = static table、VPN = compare、MDM = tree; 全て登録内)、pair 配置 (EDR→SIEM は SIEM 後、検疫→DMZ は DMZ 後、SSL/TLS→VPN は VPN 後、各 key 行あり)。
6. **D-200**: 考点数 2/1/1/1/3/3/3/3 (≤3 ✓)、各 JP 文数 1〜2・字数 50〜100 (≤100 ✓、最大は SSL/TLS `points[0]` のちょうど 100 字)。
7. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行の三語一致、`[[jp:…]]` 原語 8 種 (検疫ネットワーク / エンドポイント / 振る舞い検知 / 相関分析 / シーム / 踏み台 / サーバ証明書 / インターネットVPN) が jp 本文に実在 (スクリプト、全 ok)、zh 訳語が `zh_terms.json` に従うこと (validate の B6 warn 0; 隔离网络（检疫网络）/ DMZ（隔离区）/ 服务器证书 / 认证中心 / 接入点 / 相关分析 等一致。BYOD・IDS・PC は表の括弧注なしの裸形 = 仕様上許容)。
8. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | EDR | OK — exam 1 / 1 題: 振る舞い検知 = プログラムの動きを常時監視し意図しない外部送信などを阻止、未知の脅威対策 (2017h29a-q070 正答ウ; 誤答 = スクリーンセーバ・アカウントロック・サニタイジング)。mix: 従来型 = 既知の特徴照合、EDR = 侵入後の検知・対応 — 正しい。段階図 (記録→検知→隔離→調査) は detail と一致 | OK | OK | L1 |
| 2 | DLP | OK — mix 1 (qid なし)。登録した機密条件に合うデータの送信・コピー・印刷を遮断/警告、正規権限者の誤送信にも効く、FW = 送信元・宛先 / DLP = 中身 — シラバス上の定番事実で正しい。topic 内に DLP を正答とする題は無い (2024r06-q090 の誤答肢のみ、矛盾なし) | OK | OK | なし |
| 3 | SIEM | OK — mix 1。ログ集約 + 相関分析 (時刻・送信元で突き合わせ)、事後の追跡材料、IDS = 通信監視機器 / SIEM = IDS を含むログの横断分析 — 正しい。段階図・pairs (EDR は SIEM へのログ源の一つ) 一致 | OK | jp/zh-en 差 1 件 LOW | L2 |
| 4 | 検疫ネットワーク | OK — exam 1 / 1 題: 問題のある PC を社内 LAN に入れない、持ち帰り PC の感染確認 (2014h26a-q054 正答ウ; 誤答 DMZ・IDS・FW)。FW との役割差も正しい。段階図 (接続要求→検査区画→検査→合格で社内) 一致 | OK | OK | なし |
| 5 | DMZ | OK — exam 3 / 6 題: 公開サーバを社内から隔離・被害を内部に及ぼさない (2011h23tokubetsu-q055 正答ア / 2013h25a-q079 正答ア)、メールサーバを踏み台にさせない (2019r01a-q092 正答エ) / 公開不要の機密ファイルサーバは内部 LAN (2018h30h-q068 正答ウ; DNS・受信メール・Web は DMZ 側) / FW で作る、外部・内部どちらからも接続可、DMZ→内部は禁止 (2009h21a-q079 正答イ / 2022r04-q064 正答ア = a・b)。表 (外部→内部 = 通さない、DMZ→内部 = 通さない、外部→DMZ = 公開サービスのみ) は本文と一致 | OK | OK | なし |
| 6 | SSL/TLS | OK — exam 3 / 8 題: HTTPS の暗号化はブラウザ〜Web サーバ全区間 (2013h25h-q074 正答イ / 2021r03-q063 正答イ)、WPA2 は端末〜AP のみ (2016h28a-q079 正答ア) / 証明書確認済み SSL で分かるのは偽サイトでないこと + 経路上の盗み見防止、運営者の信用は不可 (2010h22a-q080 正答イ = a×b○c○ / 2010h22h-q071 正答エ / 2011h23a-q071 正答ウ) / 暗号化にはサーバ証明書、HTTPS = SSL/TLS (2018h30h-q057 正答ウ / 2018h30a-q071 正答エ)。段階図 (要求→証明書送付→検証・鍵共有→暗号化通信) 一致 | OK (points[0] = 100 字、上限ちょうど) | zh 追加 1 件 LOW | L3, L4 |
| 7 | VPN | OK — exam 2 / 4 題 + mix(qid) 1 / 2 題: インターネット VPN = 認証 + 暗号化 (2011h23a-q070 正答エ / 2015h27a-q045 正答ウ) / IP-VPN = 事業者の閉じた網、帯域等の品質保証はインターネット VPN では不可 (2016h28a-q057 正答イ / 2020r02o-q078 正答イ) / 接続前の PC 検査は検疫ネットワークで VPN ではない (2017h29a-q085 正答ウ・誤答エ / 2019h31h-q079 正答ウ = b のみ)。compare 図 (品質保証 不可/可 = key) 一致 | OK | OK | なし |
| 8 | MDM | OK — exam 2 / 3 題 + mix(qid) 1 / 1 題: 遠隔ロック・消去/初期化 (2018h30a-q072 正答エ / 2020r02o-q076 正答イ)、セキュリティ設定の一括配布 (2020r02o-q076)、BYOD は別概念 (2018h30a-q072 誤答イ)。エージェント導入・状態監視・アプリ制限も正しい。tree 図一致 | OK | OK | なし |

**単元レベル**: goals 3 点・overview_rows 8 行 (守る対象 / 主な動作)・pairs 3 組・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (2016h28a-q057 / 2022r04-q064 / 2011h23a-q071 / 2019h31h-q079 / 2014h26a-q050 — 本文と矛盾なし)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 4 (うち 建议修 3)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建议修** | `terms[0].one_jp` / `one_zh` / `one_en` (+ 派生 `definition_*`) | エンドポイントの説明「ネットワークの末端で**人が使う**機器」が、同じ文の例「PCや**サーバ**」と合わない (サーバは人が手元で使う機器ではない)。誤答には至らない | jp「…**エンドポイント**(ネットワークの末端につながる機器)…」/ zh「…**端点**（[[jp:エンドポイント]]，即连接在网络末端的设备）…」/ en "…**endpoints** ([[jp:エンドポイント]]), meaning the PCs, servers and other devices at the edges of a network, …" |
| L2 | LOW **建议修** | `terms[2].hook_jp` (+ 派生 `memory_hook_jp`, `summary.memory_hooks_jp[2]`) | jp「情報の管理(SIM)とイベントの管理(SEM)」は SIEM の S (Security) が落ちており、zh「安全信息管理 / 安全事件管理」・en "security information / event management" と内容がずれる | jp「**セキュリティ**情報の管理(SIM)と**セキュリティ**イベントの管理(SEM)を合わせた名前で、読みは「シーム」。」 |
| L3 | LOW **建议修** | `terms[5].points[0].text_zh` | jp「アクセスポイント(無線LANの親機)」に対し zh「接入点（无线局域网的基站，**即无线路由器**）」と「无线局域网（WLAN，也写作无线LAN）」の注を追加。AP = 路由器は常には成り立たず、jp・en に無い追加 | zh「…无线局域网的加密（WPA2）只保护终端与接入点（无线局域网的基站）之间，有没有这层加密并不影响HTTPS的加密。」(「（WLAN，也写作无线LAN）」は残してもよい) |
| L4 | LOW | `pairs[2].rows[1].a_jp`「見分け方: URLが https:// で始まる」(+ zh/en) | Web (HTTPS) の場合の見分け方で、SSL/TLS 全般の見分け方ではない。同表 row 0 は「…など、アプリの通信」としており誤学習には至らない | 任意: jp「Webでは URL が https:// で始まる」/ zh「在Web上，URL以 https:// 开头」/ en "On the web, the URL starts with https://" |

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、B2 審査済み)。「EDR/DLP/SIEMによる…」「SSL/TLS・VPN・MDMによる…」は見出し語 3 つの連なりで D-197 の形に当たるが、validate の D-197 対象外フィールドで、事実は正しい。
- O2 独立 copy 照合の 4 ヒットは一般句の偽陽性 (§1-4)。zh_terms の BYOD / IDS / PC は括弧注なしの裸形で、B6 warn の仕様 (Latin 語の裸形を許容) どおり 0 warn。

確認済みで問題なし: §9 禁止句 grep (0)、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤100 字)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、zh 訳語表、図種 (flow steps / table / compare / tree = 登録内)、用語・`term_zh` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **4** (建议修 3: L1〜L3 / 記録のみ 1: L4) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 17 件 (qid 付き 14 件)・引用 24 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無い。LOW 建议修 3 件 (L1〜L3) は補丁 (B3) で修正推奨、L4 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u03
✓ technology-23-63-u03 unit: 0 issues (data/ip/textbook/units/technology-23-63-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u03
✓ technology-23-63-u03 parity: 41 locations, 0 diff
EXIT=0
```

## §再審 (B3 補丁後、同 verifier)

- **対象**: 補丁 p01〜p05 (`node scripts/textbook-v2-patch.mjs --unit technology-23-63-u03 --list`、全 active、base `d8605c9fb285…`) を merge 後の作業ツリー単元 (sha256 先頭 `b67309c411ac9f4c`、未コミット)。補丁した字段と派生字段のみ再審。
- **L1** (p01〜p03) `terms[0].one_jp/zh/en` → 「(ネットワークの末端につながる機器)」/「即连接在网络末端的设备」/ "other devices at the edges of a network"。派生 `definition_jp/zh/en` も同文 (記法除去版) に更新済み。サーバを含む例と矛盾しなくなり、三語一致 → **解消**。
- **L2** (p04) `terms[2].hook_jp` → 「セキュリティ情報の管理(SIM)とセキュリティイベントの管理(SEM)…」。派生 `memory_hook_jp` と `summary.memory_hooks_jp[2]` も更新済み。太字なし (zh/en と同じ形にそろえるため) で問題なし。zh「安全信息管理 / 安全事件管理」・en "security information / event management" と一致 → **解消**。
- **L3** (p05) `terms[5].points[0].text_zh` → 「接入点（无线局域网的基站）」。「即无线路由器」の追加は削除済み、jp「アクセスポイント(無線LANの親機)」・en と一致 (points は派生字段なし) → **解消**。
- **残存確認**: 旧文字列「人が使う機器」「供人使用」"people use at the edge"「即无线路由器」と、セキュリティの付かない「情報の管理(SIM)」はファイル内に 0 件。
- **新規指摘**: なし。L4 (記録のみ) は未修のまま。

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u03
✓ technology-23-63-u03 unit: 0 issues (data/ip/textbook/units/technology-23-63-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u03
✓ technology-23-63-u03 parity: 41 locations, 0 diff
EXIT=0
```

**再審判定: PASS** (HIGH 0 / MEDIUM 0 / LOW 1 = L4 記録のみ)。
