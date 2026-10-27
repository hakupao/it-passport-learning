# Rule A 全数抽検 — technology-23-63-u02 (アクセス制御の基礎とネットワーク防御機器)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-28 (S135 第 1 批)、repo HEAD `2cca4bb` + 作業ツリー (単元 JSON は未コミットの書き直し版、sha256 先頭 `7f3de6553158d7a6`)。
- **対象**: `data/ip/textbook/units/technology-23-63-u02.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (アクセス権 / アクセス制御 / コールバック / ファイアウォール / WAF / IDS / IPS) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§9)、S135 補足 D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ、登録外図種の欠如は最大 low)。比較: `data/ip/textbook/.planning/v2/technology-23-63-u02/v1-original.json`。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ / MEDIUM = 誤解を招く・規則違反 / LOW = 文体。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版であることも目視確認。
2. **考点 × 引用題 (exam 考点 全 14 件、引用 qid 計 17 件)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読。全題 topic `technology-23-63`。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化をしていないことを確認。
3. **計算題の独立再計算** (アクセス権 `points[1]`、優先条件 = 個人設定が無いときだけグループ設定を適用):
   - 2009h21h-q062: グループ 110、A 100 / B 110 / C 001 / D 未登録→110。参照 = A・B・D = 3、更新 = B・D = 2 → 正答エ (3 / 2) と一致 ✓
   - 2016h28a-q099: グループ 100、A 100 / B 111 / C 110 / D 未設定→100。参照 = 4、更新 = B・C = 2 → 正答エ (4 / 2) と一致 ✓
   - 考点の手順「優先条件で各人の実効設定を先に決め、操作ごとに数える」で両題とも正答に到達する。
4. **D-198 写し**: (i)(ii) は `textbook-v2-validate.mjs` の copy guard (本文 JP 散文) = 0 件。guard 対象外の **図・表・総表・対比表の JP 文字列 91 本** (fig label / caption / cell、pairs a/b、overview_rows one_line / extra) を topic 内全 217 題の題文 + 選択肢と 12 字連続照合 (カタカナ 4 字以上・英数遮蔽、遮蔽後の実字 6 未満の窓は除外) → **0 件**。(iii) 読んで確認: 表 (総務の担当者・管理職・他部署・社外 × 見る/書き換える/消す)、ジム受付・オートロック・検品係・防犯ブザー・シャッター等の比喩はいずれも引用題に無い場面。権限計算題の具体値 (人事部・ビット列) は本文・図に流用されていない。
5. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2〜3 文 (3/3/2/3/3/3/2 文)、比喩・フックが定義の言い換えでないこと、定義前使用、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 押さえ / 頻出)、図の有無と型 (WAF = 図なし、過程 = flow steps、比較 = static table、既存 SVG)、pair 配置。
6. **D-200**: 考点数 3/3/1/3/2/2/1 (≤3 ✓)、各 JP 文数 1〜2・字数 47〜89 (≤100 ✓)。
7. **三語**: zh・en が jp と同じ事実か (追加・欠落)、数値・図ラベル・表セルの三語一致、`[[jp:…]]` 原語 11 種 (アクセス権 / 最小権限 / アクセス制御 / 認証 / 認可 / 機密性 / コールバック / ファイアウォール / パーソナルファイアウォール / 脆弱性 / 検疫ネットワーク) が jp 本文に実在 (スクリプト、全 ok)、zh 訳語が `zh_terms.unit.json` に従うこと、繁体字走査 (検出 1 件 = 派生 `explanation_zh` 内の日本語原語「認証」= 偽陽性)。
8. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | アクセス権 | OK — exam 3 / 4 題。適切な権限設定が効くのは権限外の者による漏えい・改ざん (2014h26h-q076 正答ウ = 漏えい + 改ざん、DoS・肩越し覗きは対象外) / 個人・グループ優先条件の計算 (2 題再計算一致) / 日常作業を管理者権限で行うのはリスク増 (2015h27h-q070 正答ウ = JavaScript 無効のみ)。図 (権限表) は detail の 3 操作・pairs の例と一致 | OK | OK | L5 (記録のみ) |
| 2 | アクセス制御 | OK — exam 3 / 3 題。登録情報と照合し本人のみ通す = システムによるアクセス制御、権限付与とは別 (2022r04-q037 正答イ、誤答ウ = 付与) / 機密性にはアクセス制御、署名・タイムスタンプは別目的 (2019r01a-q078 正答ア) / 無線 LAN の MAC アドレス登録もアクセス制御 (2013h25a-q081 正答イ)。detail の入退室管理は quiz 2014h26a-q057 (正答 a・c) と矛盾しない。認証→認可の段階図は detail と一致。既定拒否 = fail-safe 正しい | OK | OK | なし |
| 3 | コールバック | OK — mix 1 (qid なし)。登録番号へ掛け直す・盗んだ ID/PW でも別地点から不可・通信料はシステム側負担 (シラバス上の定番事実) 正しい。topic 内でコールバックは 2022r04-q074 の誤答肢にのみ登場し、本文と矛盾なし | OK | OK | なし |
| 4 | ファイアウォール | OK — exam 3 / 5 題。外部と内部の間で不正アクセスを防ぐ = FW、DNS・ルータは役目違い (2009h21h-q074 正答ウ / 2010h22h-q068 正答エ) / DMZ 構築・不正アクセス防止は FW、入室管理は別 (2022r04-q064 正答ア = a・b) / 外出先直結はパーソナル FW (2017h29h-q088 正答イ)、盗難 PC の漏えいはディスク暗号化 (2013h25h-q080 正答エ)。SVG (外部→FW→許可: 内部 / 拒否: 遮断) は本文と一致 | §9 寄りの試験メタ表現 1 (LOW) | OK | L1 |
| 5 | WAF | OK — exam 1 / 1 題 (2024r06-q090 正答ア = Web アプリの脆弱性を突く攻撃の防御 + 不審アクセス検知、誤答 = VPN・DLP・DMZ)。mix: FW はアドレス・ポート、WAF は要求の中身、置き換えでなく併用 — 正しい。図なし (定義型、D-195 §2 / §0-8 で可) | OK | OK | L2 (pairs) |
| 6 | IDS | OK — exam 2 / 3 題。監視・検知・管理者へ通知、遮断しない、名前↔アドレス変換や時刻同期は別 (2023r05-q067 正答ウ / 2025r07-q077 正答イ) / 持ち帰り PC の感染確認は検疫ネットワーク (2014h26a-q054 正答ウ)。NIDS / HIDS の両対象、FW 通過後・内部の検知 正しい。段階図 (対処は管理者) 一致 | OK | zh 2 件 LOW | L3, L4, L6 (記録のみ) |
| 7 | IPS | OK — mix 1。インラインで自動遮断、誤検知時は正常通信も止まる — 正しい。段階図・pairs (誤検知の影響) と一致。「侵入防止システム」(IPA 表記) / zh「入侵防御系统」は訳語表どおり | OK | OK | なし |

**単元レベル**: goals 3 点・overview_rows 7 行・pairs 3 組 (アクセス権→アクセス制御 / FW→WAF / IDS→IPS、各組の 2 つ目の後に配置、key 行あり)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (2014h26h-q054 / 2009h21a-q076 / 2013h25a-q081 / 2010h22h-q068 / 2013h25h-q080 — 本文と矛盾なし、2009h21a-q076 正答「データと利用者の組合せに権限設定」は総表 extra「利用者と操作の組で許可・禁止を決める」と整合)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 6 (うち 建议修 4)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建议修** | `terms[3].points[0].text_jp` (+ `_zh`「常以…的形式出题」/ `_en` "Questions ask you to…") | 「…仕組みの名前を選ぶ形で**出る**」は出題形式のメタ記述で、§9「試験では〜が問われます」系の定型 (試点 L15 と同類)。事実は正しい | jp「外部からの不正アクセスを、内部と外部の境目で防ぐ仕組みは**ファイアウォール**である。DNSサーバやルータは名前の解決や経路の選択を受け持つ機器で、役目が違う。」/ zh「在内外网络的分界处防止来自外部的非法访问的机制是**防火墙**。DNS 服务器和路由器分别负责名称解析和路径选择，作用不同。」/ en "The mechanism that stops unauthorized access from outside at the boundary between the internal and external networks is a **firewall**. A DNS server resolves names and a router chooses routes, so their roles differ." |
| L2 | LOW **建议修** | `pairs[1].rows[2].a_jp` (+ `a_zh` / `a_en`) | FW の「得意な防御」=「許可していない**経路**からの接続を止める」。FW の判断材料は本文・同表 key 行で「アドレスやポート番号」であり、「経路」(= ルーティング) はルータの役目 (`terms[3].points[0]` が「ルータ = 経路の選択」と区別している) と紛れる | jp「許可していないアドレスやポートとの接続を止める」/ zh「阻止与未许可的地址或端口之间的连接」/ en "Blocking connections to or from addresses and ports that are not permitted" |
| L3 | LOW **建议修** | `terms[5].points[1].text_zh` | en は「quarantine network ([[jp:検疫ネットワーク]])」と原語併記するが zh は「隔离网络（检疫网络）」のみ。D-195 §5 の原語明示が三語でそろっていない (parity ゲートは通過) | zh「…的机制，是隔离网络（检疫网络，[[jp:検疫ネットワーク]]），而不是 IDS。」 |
| L4 | LOW **建议修** | `terms[5].one_zh` (+ 派生 `definition_zh`) | 「是监视网络和服务器，对非法入侵或攻击**发现迹象并发出通知**的机制」— 「对…发现迹象」は不自然な語順 | 「**IDS**（入侵检测系统）是监视网络和服务器，**发现**非法入侵或攻击的**迹象并发出通知**的机制。」(太字範囲は jp に合わせ調整可) |
| L5 | LOW | `terms[0].points[1].text_jp`「…方式の計算では、**問題文の**優先条件に従って…」 | 出題文への言及を含むメタ寄り表現。ただし手順 (優先条件の適用→計数) の説明として機能しており、定型の締め句ではない | 任意: 「…方式では、決められた優先条件に従って…」 |
| L6 | LOW | `terms[5].points[0].text_jp`「IDSを**選ぶ決め手**は…」 | 選択肢選びを前提にした言い方。主張自体は正しく §9 定型にも当たらない | 任意: 「IDSの働きは…」 |

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。「ファイアウォール/WAF/IDS/IPSによる**境界防御**」は、IDS を「境界とは別に見張り、内部の不審な動きにも気づける」とする `terms[5].detail_*` とやや合わない。誤学習には至らない。改稿するなら「…による不正アクセス対策」。
- O2 繁体字走査の 1 件は派生 `explanation_zh` の日本語原語「(認証)」で問題なし。

確認済みで問題なし: 計算 2 題の再計算、§9 禁止句 grep (L1 以外該当なし)、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤89 字)、図の文字列の写し (0 / 91)、`[[jp:]]` 原語 (11 種全て jp 本文に実在)、zh 訳語 (`zh_terms.unit.json` と一致: 口令（密码）/ PC（个人计算机）/ DMZ（隔离区）/ 隔离网络（检疫网络）等)、図種 (table / flow steps / 既存 svg = 登録内)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **6** (建议修 4: L1〜L4 / 記録のみ 2: L5, L6) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・exam 考点 14 件・引用 17 題で、考点の主張は正答と一致し、計算 2 題は本文の手順で正答に到達する。LOW 建议修 4 件 (L1〜L4) は補丁 (B3) で修正推奨、L5・L6 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u02
✓ technology-23-63-u02 unit: 0 issues (data/ip/textbook/units/technology-23-63-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u02
✓ technology-23-63-u02 parity: 36 locations, 0 diff
EXIT=0
```

## §再審 (B3 補丁後、2026-10-28)

- **対象**: B3 補丁 p01〜p08 (`node --no-warnings scripts/textbook-v2-patch.mjs --unit technology-23-63-u02 --list`、全 active、base `ee9ace82f097…`) が当たったフィールドだけ。再マージ後の単元 sha256 先頭 `20bcf82e9da33144` (未コミット)。
- **p01〜p03 (L1)** `terms[3].points[0].text_jp/_zh/_en`: 出題形式のメタ表現を削除し、「内外の境目で外部からの不正アクセスを防ぐ仕組み = ファイアウォール」と言い切る形にした。2009h21h-q074 (正答ウ) と 2010h22h-q068 (正答エ) の正答に合う。2 文目 (DNS・ルータは役目違い) は変更なし。三語の事実は一致。D-200: 77 字・2 文 ✓。§9 grep で「出る」は 0 件。D-198 は validate copy guard 0。→ **解消**
- **p04〜p06 (L2)** `pairs[1].rows[2].a_jp/_zh/_en`:「経路」を「アドレスやポート」に改めた。同じ表の key 行・`terms[3].detail` と整合し、ルータの「経路の選択」とも紛れなくなった。三語一致。図文字列の 12 字照合は 0 / 91。→ **解消**
- **p07 (L3)** `terms[5].points[1].text_zh`: `[[jp:検疫ネットワーク]]` を併記した。原語は jp 本文に実在し、en と揃った。→ **解消**
- **p08 (L4)** `terms[5].one_zh`: 語順を「发现…迹象并发出通知」に直した。jp の one と同じ意味で、派生 `definition_zh` も同文に更新済み。→ **解消**
- **新規の問題**: なし。L5・L6 (記録のみ) は補丁対象外で、未修 LOW のまま。
- **機械ゲート**:
```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u02
✓ technology-23-63-u02 unit: 0 issues (data/ip/textbook/units/technology-23-63-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u02
✓ technology-23-63-u02 parity: 36 locations, 0 diff
EXIT=0
```
- **再審判定**: **PASS** (HIGH 0 / MEDIUM 0、建议修 LOW 4 件は全て解消、残りは記録のみの LOW 2 件 = L5・L6)。
