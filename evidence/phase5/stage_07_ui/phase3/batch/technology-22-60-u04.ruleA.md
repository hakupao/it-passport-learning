# Rule A 全数抽検 — technology-22-60-u04 (インターネット接続サービスと通信事業者)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。補丁案の試験は scratchpad の複製で実施。
- **Date**: 2026-11-02 (S140 第 10 批 b10)、repo HEAD `7b23557` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b10-u04-a2` merge 結果、sha256 先頭 `966700c9ef61ebec`)。
- **対象**: `data/ip/textbook/units/technology-22-60-u04.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (オンラインストレージ / IP電話 / 回線事業者 / ISP / MVNO / パケット通信 / 光通信) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202 / D-203、D-204 / D-205。比較: `.planning/v2/technology-22-60-u04/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・支持のない限定 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 14 件 = exam 10 + mix 4、全件 qid 付き、引用 qid 延べ 19 件 = 異なり 16 題)**: `data/ip/quiz/questions.json` から題文 (`stem_jp_clean` があれば優先)・選択肢・`correct_answer` を再読 (全題 topic `technology-22-60`)。主張が正答と一致し、誤答肢を支持せず、支持のない一般化・限定をせず、限定条件を落としていないことを 1 件ずつ確認 (§2)。
3. **quiz / challenge_questions** (quiz 計 14 枠 + challenge 5 題、うち本文で未引用 3 題): 2011h23a-q055 (ネット上のサーバのディスク領域を貸すサービス) = オンラインストレージ one で解ける。2017h29h-q055 (可搬媒体の代わりのネット上の保存領域) = 同 one で解ける。2014h26a-q070 (分割しヘッダを付ける塊の名前) = パケット通信 one・図 step 2 で解ける。計算題なし。
4. **周辺題の矛盾確認**: キーワード (オンラインストレージ / IP 電話 / VoIP / 回線事業者 / 通信事業者 / ISP / プロバイダ / MVNO / MNO / パケット交換 / パケット通信 / 光通信 / FTTH / ADSL / ブロードバンド / キャリア / 光ファイバ) で全 2900 題を検索、本単元の未引用ヒット 60 題の id・topic を確認し、語が内容にかかわる 15 題を読んだ。他 topic の 2015h27a-q068・2016h28h-q071 (交換方式) はパケット通信 detail・points[1] と一致、2020r02o-q078 (IP-VPN は通信事業者の網で品質保証可) は IP電話 points[2]「拠点間の通信を安全にする仕組み」と矛盾しない。MVNO・キャリアアグリゲーション等が誤答肢に並ぶだけの題は本文に影響なし。
5. **D-198 写し**:
   - (a) validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件。
   - (b) **独立 12 字連続照合**: JP 文字列 118 本 (派生除く) × topic 内全 97 題の題文 + 選択肢。カタカナ 4 字以上・英数を遮蔽 (実字 6 未満の窓は除外) = **0 件**; **遮蔽なし = 0 件**; `stem_jp_clean` (97 題中 39 題が保有) との遮蔽なし照合 = 0 件。
   - (c) **近似一致**: ① 12 字窓 × 同長窓で置換 1〜2 字 → 18 組。16 組は見出し語 (オンラインストレージ) または一般語 (インターネット上 / インターネットへの接続) の連なり = 偽陽性。`terms[4].one_jp` ↔ 2017h29a-q093 題文は日本語名 (仮想移動体通信事業者) で偽陽性。実質 1 件 = `terms[4].detail_jp` 1 文目の前半 ↔ 2017h29a-q093 誤答イ (仮名 2 字の置換) → **L3**。② 各文・各節を単元の全引用題 + quiz + challenge の題文・各選択肢と比較 (半大域 ed = 短い方の長さで正規化 / bigram Dice)。較正: HIGH = ed 0.14 / Dice 0.52、建議修の前例 = ed 0.25 / 0.72、0.27 / 0.59、0.40 / 0.32、0.42 / 0.36。用語名だけの節を除く最近接:
     | 箇所 | 相手 | ed / Dice | 判定 |
     |---|---|---|---|
     | `terms[6].points[0]` (2 節目) | 2017h29h-q068 正答エ | 0.35 / 0.44 | 正答の語置換に近いが FTTH の標準定義 → L1 建議修 |
     | `terms[4].one_jp` | 2017h29a-q093 正答ウ | 0.49 / 0.38 | MVNO の標準定義 → L7 |
     | `terms[1].points[2]` 1 文目 | 2020r02o-q077 誤答イ | 0.50 / 0.43 | 技術名を正した標準事実 → L7 |
     | `terms[2].detail_jp` (ADSL の節) | 2017h29h-q068 誤答イ | 0.52 / 0.29 | ADSL の標準定義 → L7 |
     | `terms[3].points[0]` 1 文目 | 2018h30h-q031 題文 | 0.59 / 0.51 | Dice が較正に近い、ed は遠い → L2 建議修 |
     | `terms[1].detail_jp` 2 文目 | 2011h23tokubetsu-q077 正答イ | 0.62 / 0.41 | VoIP の標準定義 → L7 |
     | `terms[5].points[0]` | 2013h25a-q068 小項目 c | 0.63 / 0.40 | 語置換だが語順も一部別 → L8 |
     | `terms[1].points[0]` 1 文目 | 2020r02o-q077 正答ア | 0.73 / 0.28 | → L8 |
   - (d) **目視 (カタカナの多い文・場面と列挙の流用 (iii))**: `terms[0].points[1]` (VPN の説明は 2018h30a-q074 誤答アの言い換えに近いが、VPN の標準定義で ed ≥0.63)。比喩・図 (貸しロッカー / 貸切列車と乗合バス / 道路会社 / インターチェンジ / 旅行会社 / 番号付き段ボール / 懐中電灯) はいずれも topic の題に無い場面。列挙は `terms[2].one_jp` の 3 設備のみで題由来ではない。
6. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2〜3 文 (2/2/3/3/2/2/2)、step caption は全 8 step が 1 文 (a1 #1 の medium 解消)。比喩 7・hook 7。定義前使用: IP ネットワーク = IP電話 one、パケット = IP電話 detail の括弧注、VoIP = 同 detail、ヘッダ = 図 caption「管理情報のヘッダ」、メタル = 回線事業者 detail の括弧注、MNO = MVNO detail、回線交換方式 = 考点内、VPN・ASP・MNP = 考点内の説明。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が → `freq_badge`「頻出」のみ、対象外。zh 相当語 0 件、en は always-on の always のみで偽陽性)。図の型 (flow steps ×2 [IP電話 4 / パケット通信 4]、flow static ×1 [MVNO]、compare static ×1 [光通信]、図なし ×3; 全て登録内)。pair 2 組 (各組 key 行あり)。D-197 羅列 validate 0。
7. **D-200**: 考点数 2/3/3/1/2/2/1 (≤3 ✓)、各 JP 文数 1〜2・字数 20〜69 (≤100 ✓、最大はパケット通信 `points[1]`)。**framing 件数** (`pointFraming` の語句を §9 grep で包含、validate 0): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-205 (版)**: 本単元に改正される文書 (規格・法令・ガイドライン・知識体系) の構成・数・名称の言い切りは無い → 該当なし。
9. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (「〜ではない」「〜に限らず」の照合: IP電話 points[0] は閉じた網も可 ↔ points[1]「インターネットを使う音声通話一般」は排他を述べず矛盾なし; 回線事業者「回線そのものを持つ」↔ ISP detail「1 つの会社が兼ねる場合」は両立; MVNO「自前の網を持たない」↔ 図・pairs・hook・key_points 一致) → 不整合 0、提供物の線引きの緩さ 1 件は L2。比喩と考点: 乗合バス (IP電話) ↔ points[0] の閉じた網は矛盾なし。貸しロッカーの「どの駅からでも」は 2019h31h-q084 の端末列挙を運ばない。インターチェンジ・道路 ↔ pairs[0].rows[1] 一致。書き方 9 (限定条件) → §2 表、落ち 0。§6 → L9。§9 言い直し → L10。
10. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の三語一致を目視。`[[jp:…]]` 原語 24 種が jp 本文に実在 (スクリプト、全 ok)。one_zh / one_en の見出し語併記は ISP を除く 6 用語 (ISP は語そのものが英字略称で、プロバイダを併記)。zh 訳語は `zh_terms.json` に従う (validate warn 0; 在线存储 / IP 电话 / 线路运营商 / MVNO（虚拟移动网络运营商） / 分组通信 / 光通信 / 携号转网（MNP） / VPN（虚拟专用网络） / 应用服务提供商（ASP） 一致)。a2 loc-review #1 の medium (收容局) は `端局，[[jp:収容局]]` で解消。
11. **単元間の整合 (u01 / u02 / u03 / u05)**: 用語の語・事実を抽出し照合。**MVNO vs ローミングの「借りる」(u05 O3)**: u04 MVNO = 事業者が他社の網を継続的に借りて自社の看板で売る事業形態 (zh 租用 / en rents)、u05 ローミング = 利用者が契約先の圏外で提携先の網を使う仕組み (zh 借用 / en borrowing、「圏外で」「提携先の」の限定あり)。主体・場面が異なり、どの欄も両者を同一視せず、矛盾なし → 指摘なし (O1)。ISP / プロバイダ: u01 `terms[3].detail_jp`・`pairs[1].rows[2]` と一致。パケットの説明: u01 と一致。ただし zh の訳語が u01 (数据包) と本単元 (分组) で異なる → L4。
12. **機械ゲート**: §6。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | オンラインストレージ | OK — exam 2 / 2 題: 容量はサービスの枠で決まり端末側の増設に連動しない (2019h31h-q084 正答エ = 不適切肢「増設で自動的に増える」を否定; 正しい肢 ア・イ・ウ の機能は本文で否定せず) / 貸すのは記憶領域で VPN とは別 (2018h30a-q074 正答イ、誤答ア を否定)。detail「失われにくい」は留保付きで正しい | OK (a1 #2 HIGH の機能列挙なし) | OK | L8 (points[0]) |
| 2 | IP電話 | OK — exam 2 / 2 題 + mix 1 / 2 題: 網はインターネットに限らず閉じた IP 網も可、一般の電話網へ発信可 (2020r02o-q077 正答ア、誤答ウ を否定) / VoIP は電話サービス専用でなくネット音声通話に用いる (2023r05-q083 正答エ) / 音声のパケット化は VoIP、IP-VPN は別 (2020r02o-q077 誤答イ を否定、2011h23tokubetsu-q077 正答イ・誤答ウ と一致)。誤答エ (ISDN が前提) は本文に出ず支持なし。flow 4 step は one・detail と一致 | OK (a1 #1 HIGH の場面なし) / hook は VoIP の語源 L9 | L5 (zh) | L5, L7, L8, L9 |
| 3 | 回線事業者 | OK — exam 3 / 延べ 5 題 (異なり 4): ADSL の媒体 = メタルの電話回線 (2012h24a-q069 正答ア / 2012h24h-q057 正答ウ) / 下りが速い、距離で速度低下 (2010h22h-q062 正答エ、誤答イ / 2012h24h-q057 誤答エ を否定) / ブロードバンドは大容量向き・常時接続に使える (2013h25a-q062 正答イ、誤答ウ を否定)。限定条件「局からの距離」保持 | OK / 図なし | L5 (en) | L5, L7, L8, L10, L11 |
| 4 | ISP | OK — mix 1 / 1 題: ISP = 接続、ASP = アプリケーション提供 (2018h30h-q031 正答イ) | 1 文目が題文に近い L2 | OK | L2 |
| 5 | MVNO | OK — exam 1 / 1 題 + mix 1 / 1 題: 周波数の割当てでなく利用者へ売る立場、支援事業者とも別 (2017h29a-q093 正答ウ、誤答ア・エ を否定) / MNP は乗換え制度で別の語 (2021r03-q071 正答ウ、誤答イ)。図 (MNO → MVNO → 利用者) は one・detail と一致。低料金は「多い」「打ち出しやすい」で留保あり | a1 #1 HIGH 2 件の列挙なし / detail 1 文目 L3 | OK | L3, L7, L8, L10 |
| 6 | パケット通信 | OK — exam 1 / 1 題 + mix 1 / 1 題: 2013h25a-q068 正答ウ = a・c を全て本文で判定可 (a = detail、c = points[0]、b・d の否定 = points[1])。「効率よく使える」は 2015h27a-q068 正答ウ とも一致。flow 4 step 一致 | a1 #1 HIGH のヘッダ 3 項目の列挙なし (step 4 は順序の 1 語のみ) | L4 (zh) | L4, L8, L10 |
| 7 | 光通信 | OK — exam 1 / 3 題: FTTH = 局から家庭までの線が光ファイバの家庭向け形態 (2009h21a-q077 正答イ / 2012h24h-q082 正答ア / 2017h29h-q068 正答エ)。限定「一般家庭向け」保持。compare 図 2 行は事実どおり | 考点が正答エに近い L1 / hook は FTTH の語源 L9 | L5 (zh、総表) | L1, L5, L9, L10 |

**単元レベル**: goals 3 点・overview_cols 2 (分類 / 見分ける手がかり)・overview_rows 7 行・pairs 2 組 (回線事業者 / ISP 3 行 key 1、回線事業者 / MVNO 2 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2014h26a-q070 / 2017h29h-q055 / 2020r02o-q077 / 2021r03-q071 / 2012h24a-q069 — 本文と矛盾なし)。事実誤りなし、三語一致。

### 過去審査の HIGH / MEDIUM の解消 (退行確認)

| 出所 | 重大度 | 箇所 | 確認 |
|---|---|---|---|
| a1 #1 | HIGH | パケット通信 考点 (2014h26a-q070 のヘッダ項目の列挙) | 考点削除、図 caption は「管理情報」の一般語。退行なし |
| a1 #1 | HIGH | MVNO points[0] 2 文目 (2017h29a-q093 誤答エの列挙) | 「裏で支える支援事業者」の一般語のみ。課金・調達の語 0 件。退行なし |
| a1 #1 | HIGH | MVNO 考点 (2021r03-q071 の列挙の並び替え) | MNP の mix に置換、自社ブランド・端末の列挙 0 件。退行なし |
| a1 #1 | HIGH | IP電話 points[1] (2023r05-q083 の場面) | 「同じアプリ」等の場面 0 件、一般表現。退行なし |
| a1 #1 | MEDIUM | ISDN の定義前使用 | 単元内 ISDN 0 件 (選択肢としてのみ題に残る)。解消 |
| a1 #1 | MEDIUM | IP電話 fig.steps[3] 2 文 | 全 step 1 文。解消 |
| a1 #2 | HIGH | オンラインストレージ detail (2019h31h-q084 の機能列挙) | 共有・無料枠・端末の列挙なし、保存先の移動とその帰結のみ。退行なし |
| a2 loc #1 | MEDIUM | 回線事業者 detail_zh の 收容局 | `端局，[[jp:収容局]]` に分離。解消 |

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 11 (うち 建議修 6)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[6](光通信).points[0].text_jp/zh/en` | 2017h29h-q068 正答エの語置換に近い節 (ed 0.35 / Dice 0.44)。同じ題が同用語の quiz。FTTH の標準定義で D-198 上は写しでない。en "service form" も直訳調 (a2 loc #2 low)。修正後 ed 0.61 / Dice 0.27 | jp「FTTH は、局から家庭までの線を光ファイバにした一般家庭向けのサービス形態である。」→「FTTH は、局からの線を一般家庭の中まで光ファイバで引き込む接続サービスである。」/ zh「FTTH 是把从电话局到家庭的线路换成光纤（[[jp:光ファイバ]]）、面向普通家庭的服务形式。」→「FTTH 是把来自电话局的线路用光纤（[[jp:光ファイバ]]）一路接到普通家庭的接入服务。」/ en "FTTH is a service form for ordinary households in which the line from the exchange to the home is optical fiber ([[jp:光ファイバ]])." → "FTTH is an access service that runs optical fiber ([[jp:光ファイバ]]) from the exchange all the way into an ordinary home." |
| L2 | LOW **建議修** | `terms[3](ISP).points[0].text_jp/zh/en` | 1 文目が one の言い直しで、2018h30h-q031 題文に近い (Dice 0.51 / ed 0.59)。「通信網を提供」は `pairs[0].rows[0]` の線引き (回線事業者 = 回線の設備 / ISP = 接続) をやや曖昧にする (a2 low、題と detail に沿うので矛盾とはしない)。修正後 ed 0.62 / Dice 0.36 | jp「ISP はインターネットにつなぐための通信網を提供する事業者である。ASP はアプリケーションをネット越しに提供する事業者である。」→「ISP はインターネットへの接続を受け持つ事業者で、ASP はアプリケーションをネット越しに提供する事業者である。」/ zh「ISP 是提供接入互联网所需通信网络的运营商。应用服务提供商（ASP）则是通过网络提供应用程序的服务商。」→「ISP 是负责接入互联网的运营商，而应用服务提供商（ASP）是通过网络提供应用程序的服务商。」/ en "An ISP provides the communication network used to reach the internet. An ASP (application service provider) provides applications over the network." → "An ISP handles the connection to the internet, while an ASP (application service provider) provides applications over the network." |
| L3 | LOW **建議修** | `terms[4](MVNO).detail_jp` (zh・en は変更不要) | 1 文目の前半が 2017h29a-q093 誤答イの連なりを仮名 2 字の置換で含み、12 字閾値を逃れる形 (文全体は ed 0.64 / Dice 0.28)。MNO の定義の一般表現で写しではない | jp「移動体通信網を自社で持つ事業者は **MNO** と呼ばれ」→「移動体通信網の持ち主である事業者は **MNO** と呼ばれ」 |
| L4 | LOW **建議修** | `terms[5](パケット通信).one_zh` | u01 の zh はパケットを 数据包 (7 か所)、本単元は zh_terms の 分组通信 に沿い 分组。前提単元と語が変わるが同じものだと示す箇所がない。zh_terms に パケット単独の項目はなく規則違反ではない | zh「称为**分组**（[[jp:パケット]]）的小块」→「称为**分组**（[[jp:パケット]]，也叫数据包）的小块」 |
| L5 | LOW **建議修** | `terms[1].points[1].text_zh`、`overview_rows[6].extra_zh[1]`、`terms[6].detail_zh`、`terms[2].detail_en` | a2 loc #2 の low。「一般用于」は「通常は」と読め JP の「音声通話一般」とずれる。「比铜线不易衰减」「更不易使信号衰减」は不自然。en に収容局の併記がなく zh と非対称 (2009h21a-q077 題文の語) | zh「一般用于经互联网进行的语音通话」→「也广泛用于经互联网进行的语音通话」/ zh「比铜线不易衰减」→「比铜线更不易衰减」/ zh「它比铜线更不易使信号衰减」→「与铜线相比，信号不易衰减」/ en "a telephone office (the local exchange)" → "a telephone office (the local exchange, [[jp:収容局]])" |
| L6 | LOW **建議修** | `key_points_jp/zh/en[0]` (+ 派生 `summary.key_points_*[0]`) | 「音声の通り道を、ネットワーク上へ移した」は従来の電話網もネットワークである点と区別できない (a2 low)。`terms[1].one` は IP ネットワークと明記しており要点だけ緩い | jp「オンラインストレージはデータの置き場所を、IP電話は音声の通り道を、ネットワーク上へ移したサービスである。」→「オンラインストレージはデータの置き場所をネットワークの先へ、IP電話は音声の通り道を IP ネットワークへ移したサービスである。」/ zh「在线存储是把数据的存放位置搬到网络上的服务，IP 电话是把语音的传送通道搬到网络上的服务。」→「在线存储是把数据的存放位置移到网络另一端的服务，IP 电话是把语音的传送通道移到 IP 网络上的服务。」/ en "Online storage moves where data is kept onto the network; IP telephony does the same for the path voice travels." → "Online storage moves where data is kept to the far side of the network; IP telephony moves the path voice travels onto an IP network." |
| L7 | LOW | `terms[4].one_jp`、`terms[2].detail_jp` (ADSL の節)、`terms[1].detail_jp` 2 文目、`terms[1].points[2].text_jp` 1 文目 | 用語・技術の標準定義が題の選択肢と骨格で重なる (§1-5 c、ed 0.49〜0.62)。D-198 の「標準的な定義」で写しではなく、言い換えの余地も小さい | 記録のみ |
| L8 | LOW | `terms[0].points[0]`、`terms[1].points[0]`、`terms[2].points[2]`、`terms[4].points[0]`、`terms[5].points[0..1]` | 考点が 1 題の正答 + 誤答の否定を題の順序で束ねる形 (`terms[5].points[0]` は小項目 c の語置換 ed 0.63 / Dice 0.40)。いずれも一般原則の適用で、数値・場面・機器の列挙は流用していない (a2 low と同判断) | 記録のみ |
| L9 | LOW | `terms[1].hook_*`、`terms[6].hook_*` | 記法が見出し語でなく関連語 (VoIP / FTTH) の語源。手がかりとしては有効だが間接的 (D-195 §6)。en の FTTH hook は jp の直読みを省く | 記録のみ |
| L10 | LOW | `terms[2].detail_jp` + `terms[6].fig.data.rows[0]` + `terms[6].points[0]`、`terms[5]` の複数欄、`terms[4]` の複数欄 | 書き方 8・§9 の反復: FTTH の説明 3 箇所、経路の共有 5 箇所 (detail・考点・図・総表・比喩)、MVNO の「借りる」7 箇所。いずれも中心の定義で事実の食い違いなし | 記録のみ |
| L11 | LOW | `terms[2].one_jp` / `terms[4].detail_jp` の「基地局」、`terms[2].detail_jp` 全体、`pairs[0].rows[1].label_en`、`terms[1].fig.steps[3].caption_en`、`pairs[1].rows[0].a_zh` | 基地局は次単元 u05 で定義 (日常語に近い)。回線事業者の detail は事業者の役割より ADSL / FTTH が中心 (関連題の範囲による)。loc 文体 low (As a road / The other party's side / 准备)。読解は妨げない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 回線事業者 / ISP: `pairs[0].rows[0..2]`、`key_points[1]`、ISP detail 3 文目 (兼業の補足で対比でない) → 許容。② 回線事業者・MNO / MVNO: `pairs[1].rows[0]`、MVNO detail・図 → L10。③ ADSL / FTTH の媒体: `terms[2].detail`、`terms[6].fig` = 2 箇所 + `terms[2].points[0]` は ADSL のみ → 許容。④ 回線交換 / パケット交換: `terms[5].points[1]` のみ明示 (IP電話の比喩は像のみ) → 許容。⑤ パケット通信 / 光通信: `key_points[3]` のみ → 許容。

**範囲外の観察**:
- O1 u05 O3 (MVNO とローミングの「借りる」) は §1-11 のとおり主体と場面が異なり矛盾なし。zh・en も 租用 / rents と 借用 / borrowing で分かれる。u05 の変更は不要。
- O2 `unit_summary_jp/zh/en` は v1 と同文 (スクリプト確認、未改稿)。ADSL は現行サービスとしての状況を外部確認していないが、本文は技術の説明で提供状況を述べず、引用題の前提と一致する。
- O3 数据包 / 分组 の不統一は u04 の修正 (L4) で橋渡しできるが、全体統一には `zh_terms.json` に パケット の項目を立てる判断が要る (他に数据包を使う単元: technology-23-61-u10)。本監査の範囲外。

確認済みで問題なし: 限定条件 (考点 14 件全て保持、§2)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤69 字)、D-205 (該当なし)、図の文字列の写し (validate 0、独立 12 字照合 遮蔽あり・なし とも 0)、近似一致 (較正 HIGH に届く文なし、最近接 ed 0.35 / Dice 0.44 = L1)、`[[jp:]]` 原語 (24 種全て jp 本文に実在)、one_zh / one_en の見出し語併記、zh 訳語表 (warn 0)、図種 (登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、過去審査の HIGH 5 / MEDIUM 3 の解消 (退行なし)、単元間の整合 (MVNO / ローミング 矛盾なし)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **11** (建議修 6: L1〜L6 / 記録のみ 5: L7〜L11) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 14 件・引用 16 題 + 未引用の quiz / challenge 3 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、限定条件の落ちも無い。a1 の D-198 (iii) HIGH に退行なし。LOW 建議修 6 件 (L1〜L6) は補丁 (B3) で修正推奨、L7〜L11 はバッチ証拠の「未修 LOW」表へ。補丁 L1〜L6 全適用の scratch 複製は validate 0 issues / parity 0 diff を確認済み。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-60-u04
✓ technology-22-60-u04 unit: 0 issues (data/ip/textbook/units/technology-22-60-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-60-u04
✓ technology-22-60-u04 parity: 31 locations, 0 diff
EXIT=0
```
