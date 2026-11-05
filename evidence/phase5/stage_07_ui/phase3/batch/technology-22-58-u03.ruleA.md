# Rule A 全数抽検 — technology-22-58-u03 (無線LANとWi-Fi)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 修正案の検証は scratchpad の写しで行った)。
- **Date**: 2026-11-05 (S143 第 17 批 b17)、repo HEAD `09cdb2a2` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b17-u03-a2` merge 結果、sha256 先頭 `d22c7c8a05633901`; `.planning/v2/technology-22-58-u03/merged.json` と内容一致を確認)。
- **対象**: `data/ip/textbook/units/technology-22-58-u03.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (無線LAN / Wi-Fi / Wi-Fi Direct / メッシュWi-Fi / WPS / ESSID / MACアドレス) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203 (観点 8 対比反復・§6 比喩が定義の言い換え・§9 言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、D-204 / D-205 (S138 §2・§6)、図種は登録 6 種のみ。比較: `.planning/v2/technology-22-58-u03/v1-original.json` (用語 7 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度の較正**: D-198 (iii) = 引用題の選択肢の組を再現する / 誤答肢を同じ順序で打ち消す / 誤答の場面を打ち消すためだけに再演する考点 → MEDIUM (b14 u02 M1・b15 u07 M1・b16 u12 M1〜M3・同批 b17 u01 M1〜M4 と同型)。近似写しの HIGH 較正 = ed 0.14 / Dice 0.52 (b14 u05 H1 = ed 0.44 / Dice 0.57 / LCS 18 + 穴埋め題文の句順なぞり)。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell・SVG の文字列) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_* / overview.intro_*`) が本体の記法除去版であることを確認 (validate 0 + 目視)。Wi-Fi Direct は hook なし、WPS は analogy 空 (D-203 (b) で許容)、summary.memory_hooks は hook のある 6 用語で一致。SVG `technology-22-58-u03-t01.svg` (無線LAN、static) の文字列 = 電波 ×2 / アクセスポイント / パソコン / スマートフォン / インターネット/有線LAN — detail 1 文目 (端末 → アクセスポイント → 有線LAN・インターネット) と一致。
2. **考点 × 引用題** (考点 全 15 件 = exam 11 + mix 4、うち qid 付き 13 件、引用 qid 延べ 24 件 = 異なり 24 題; quiz + challenge を合わせた異なり 29 題、全題 topic `technology-22-58`): `data/ip/quiz/questions.json` の `correct_answer` と translations の `stem_jp_clean` で各題を再読し、考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、題の場面・前提 (限定条件) を外していないことを 1 件ずつ確認。
3. **quiz / challenge_questions** (quiz 計 13 枠、challenge 5 題 = 2019r01a-q077 / 2015h27a-q076 / 2020r02o-q088 / 2018h30a-q087 / 2025r07-q090): 本文と矛盾しないこと・本文で解けることを確認 (§2 末尾)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 114 本 (派生除く、図ラベル・caption・総表・対比表を含む) を topic 内全 87 題の題文 + 選択肢 + **穴埋め題の正答を入れた題文** (2019h31h-q086・2026r08-q076) と、文単位で 12 字連続照合 (句読点・記号・空白除去; (a) 遮蔽なし、(b) カタカナ 4 字以上・英数を □ 1 字に遮蔽し実字 6 未満の窓は除外) + 近似 (ed ≤0.5 または Dice ≥0.45) を計算。
   - **12 字ヒット (遮蔽なし) 8 件 / 遮蔽ありでは 0 件**:
     - `terms[1].points[1].text_jp` ↔ 2019r01a-q077 誤答エ: 「無線LANの規格は複数あ」12 字 (ed 0.60 / Dice 0.45 / LCS 12)。誤答の文を打ち消すための再演 → **M1** (§3)。
     - `terms[5].points[1].text_jp` ↔ 2024r06-q070 正答ウ: 「アクセスポイントへの不正」12 字 (1 文目 ed 0.43 / Dice 0.54 / LCS 12)、2 文目が誤答ア・イを同じ順で打ち消す → **M2** (§3、HIGH にしない理由も同欄)。
     - `terms[0].detail_jp` / `key_points_jp[0]` ↔ 2019r01a-q077 正答ア: 「アクセスポイントの不正利用」13 字。用語 (カタカナ) + 「の不正利用」の定型句で、事実 = 正答そのもの (標準原則の一般表現)。遮蔽ありで 0 → 偽陽性。
     - `terms[0].points[1].text_jp` ↔ 2018h30a-q096 正答イ: 「2.4GHz帯は5GHz帯」12 字 = 帯域名 2 つ + 助詞。遮蔽ありで 0 → 偽陽性 (eye check は下記)。
     - `terms[6].points[1].text_jp` ↔ 2016h28h-q074 ア / 2017h29h-q100 ウ / 2021r03-q085 イ: 「MACアドレスフィルタリング」= 用語名 → 偽陽性。
   - **近似 (ed ≤0.5 / Dice ≥0.45) の上位**: `overview_rows[5].one_line_jp`「無線LANのネットワーク名」↔ 2012h24a-q064 エ (ed 0.42 / Dice 0.69、短い定義句; ESSID の標準定義で写しではない)、`overview_rows[1].extra_jp[1]` ↔ 2011h23tokubetsu-q082 イ (規格名)、`pairs[0].rows[3].a_jp` ↔ ステルス機能を含む選択肢 (用語名)、`terms[2].fig.data.a.jp` ↔ 「アクセスポイント」を含む選択肢 (用語名)。いずれも偽陽性。
   - **穴埋め題 (正答入り題文との照合)**: `terms[0].points[2]` (LPWA) ↔ q086 正答入り ed 0.75 / Dice 0.47 / LCS 9、↔ q076 正答入り ed 0.85 / Dice 0.27 / LCS 7 → 写しではない。比較の相手もずれていない (通信速度・消費電力は q086 が無線LAN比、範囲は q076 が無線LAN比; q076 の電力比較の相手 4G は考点に持ち込んでおらず、考点の「少ない電力」は q086 の無線LAN比で支持される) → 限定条件の落ちなし。
   - **eye check (カタカナ・英数の多い文 / 正答の言い換え + 誤答の打ち消しの型)**: `terms[0].points[1]` (2.4GHz帯) は 1 句目が q096 正答イの言い換え (句 ed 0.60 / Dice 0.53 / LCS 12 = 帯域名)、2 句目「電子レンジなど家電の電波と干渉しやすい」が q096 誤答エ前半の裏返し。ただし 2 句目は同じ考点の引用題 2015h27a-q076 b (電子レンジとの干渉) と 2020r02o-q088 b (干渉で速度低下) が**正しい記述として**直接支持し、2.4 / 5GHz の得失は教科書の標準的な記述 → 打ち消しのためだけの再演ではない、**L5 (記録のみ)**。`terms[1].points[2]` (PSK) は q065 正答アと ed 0.68 / Dice 0.22 で言い換え済み、2 文目「ネットワークの名前とは別物」が誤答ウ・エの共通前提の打ち消し → **L1**。`terms[5].detail_jp` 1 文目は 2015h27a-q076 の誤った記述 a を打ち消す節を含み、2 属性 (32 文字・複数アクセスポイントで同じ名前) が 2011h23tokubetsu-q061 の題文 (ESSID を当てさせる説明文) と同じ組・同じ順 → **L2**。`terms[5].points[0]` (ESSID ≠ 暗号化) → **L3**。`terms[1].points[0]` (802.3 = 有線) → **L4**。
5. **D-195**: one = 1 文 × 7 (太字あり)、detail 2〜3 文 (3/2/2/2/2/3/2)、比喩・フックが定義の言い換えでないこと (コードレス電話 / 規格適合マーク / 手渡し / 小さな明かり / 店の看板 / 製造番号; hook は語源・略語・紛らわしい語との区別)、定義前使用 (アクセスポイント = 無線LAN detail の括弧注、周波数帯 = 無線LAN points[1] の括弧注、WEP = 無線LAN points[0] で「古い暗号化方式」と注、PSK = 考点内で定義、ステルス機能 = ESSID detail、アドホックネットワーク = mix 考点内で定義; 未定義のまま使う語 = ルーター・IoT・PIN・goals / 総表のアクセスポイント → L8)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `terms[0].hook_jp`「と字面で覚える」(+ 派生 2)、`terms[1].hook_jp`「造語とされる」(+ 派生 2; zh「据说」・en "is said")、`terms[4].fig` の「選ぶ」×2 (node label・steps[1] caption = 端末の画面で WPS 接続を選ぶ操作そのもの → 偽陽性)。前 2 件は L9。zh / en (必须 = 无线LAN detail_zh の通常用法、"example" 内の exam) は偽陽性。図種: svg static ×1 (無線LAN) / compare static ×1 (Wi-Fi Direct) / flow steps ×1 (WPS、4 段) / table static ×1 (MACアドレス) / 図なし ×3 (Wi-Fi・メッシュWi-Fi・ESSID) = 全て登録内。pair 配置 (ESSID → MACアドレス は MACアドレスの後、key 行あり)。
6. **D-200**: 考点数 3/3/1/1/1/3/3 (≤3 ✓)、各 JP 文数 1〜2・字数 43〜91 (≤100 ✓、最大は無線LAN `points[1]` の 91 字)。**framing 件数** (validateV2 `pointFraming` を tsx で全考点に適用): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」「〜ない」の照合: 無線LAN detail「ふつう アクセスポイントを経由して」は Wi-Fi Direct / アドホックと両立; Wi-Fi Direct の one・総表・図 row 2・mix 考点は全て「専用のアクセスポイント機器が要らない / 一方の機器が役を兼ねる」の範囲で一致; ESSID points[0]「ESSID 自体に暗号化する働きはない」は WPA2-PSK で SSID が鍵導出の材料になる事実と衝突しない [「自体に…働きはない」の範囲]; MACアドレス one「製造時に割り当て」と pairs[0].rows[1] 一致; 総表 WPS「PIN方式には破られやすい弱点」と detail 一致) → JP 内の不整合 0、**zh / en で 1 件 (M3)**。書き方 8 (対比の出現欄を列挙、下記) → L6。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → L7。§9 言い直し → L6。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落・強め)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 14 種 (IPアドレス / MACアドレス / MACアドレスフィルタリング / アクセスポイント / アドホックネットワーク / イーサネット / ステルス化 / ステルス機能 / パスフレーズ / メッシュWi-Fi / 周波数帯 / 有線LAN / 無線LAN / 論理アドレス) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語: 無線LAN・メッシュWi-Fi・MACアドレスは `[[jp:]]` あり、Wi-Fi / Wi-Fi Direct / WPS / ESSID は仮名・漢字を含まない見出し語で zh・en 本文に同綴りで出る (validateV2 `hasJpOrigin` の免除どおり) → 7/7 ok。zh 訳語 (`zh_terms.json`): 无线LAN / 接入点 / MAC地址 / 网状Wi-Fi / IP 地址 / 路由器 / 有线 LAN / 口令（密码）/ 比特 / 传输速率 / IoT（物联网）一致、validate の B6 warn 0 / jp-origin warn 0。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文、現行単元と修正案を当てた写しの両方)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 無線LAN | OK — exam 3 / 8 題: WPA2 は短時間で解読されやすい旧方式 WEP の弱点を改善した暗号化方式 (2014h26a-q076 正答エ / 2017h29a-q069 正答エ / 2019h31h-q074 正答エ; 「代表」と言い切らず「方式に WPA2 がある」で WPA3 時代とも矛盾しない) / 2.4GHz帯は 5GHz帯より障害物に強く遠くまで届くが家電と干渉しやすく、干渉で速度が落ちる (2018h30a-q096 正答イ・誤答エを否定 / 2015h27a-q076 b / 2020r02o-q088 b) / LPWA は無線LANより遅いが少電力で広範囲 (2019h31h-q086 正答ウ / 2026r08-q076 正答エ; 比較の相手は §1-4 のとおり保持)。detail「ふつう アクセスポイントを経由」「建物の外にも届くので暗号化と不正利用対策」は q077 正答アと一致。SVG は detail と一致 | OK (q096 の型は L5) | zh / en「很少的 / very little」は jp「少ない」をやや強める (L9) | L5, L8, L9 |
| 2 | Wi-Fi | OK — exam 3 / 3 題: IEEE 802.11 は無線LAN、802.3 は有線LAN (2011h23tokubetsu-q082 正答イ) / 規格によっては互いに通信できない (2019r01a-q077 — **正答はア [不正利用対策] で、考点は誤答エの打ち消し** → M1) / PSK は接続認証の合言葉で、これを元に端末ごとの暗号鍵が作られる (2023r05-q065 正答ア; 誤答イ・エ [IP アドレス割当] を支持しない)。one は 2018h30h-q088 正答ウ (異メーカー間の相互接続を示すブランド名) と一致。detail「接続できる目安」は q088 の「保証」より控えめだが矛盾なし | **M1** / L1 / L4 | OK | M1, L1, L4, L9 (hook) |
| 3 | Wi-Fi Direct | OK — mix 1 / 1 題: アドホックネットワーク = 全端末が対等に相互通信する無線LANの形態、Wi-Fi Direct は一方の機器がアクセスポイントの役を兼ねる点で違う (2022r04-q062 正答ア と矛盾なし; q062 の「アクセスポイントを経由せず」は「全端末が対等」に含意され、主張を広げも狭めもしない)。quiz 2014h26h-q081 (アクセスポイントが無くても 1 対 1 で通信できるモード) は one で解け、誤答 (PC 専用・暗号化 1 種類・距離無関係) は detail の例・無線LAN points[0]・無線LAN detail で否定できる。図 compare (経路 / 専用機器 / 使い方) は one・detail と一致 | OK | OK | L7 (analogy) |
| 4 | メッシュWi-Fi | OK — 引用題なし (freq 0)。detail (親機となるルーターと中継機が中継し合い、全体が 1 つのネットワーク名) は ESSID detail 2 文目と整合。mix 考点 (Wi-Fi Direct と目的が違う) は正しい | OK (図なし、a1・a2 の網目でない図の指摘を解消) | OK | L6 (mix 考点の言い直し), L8 |
| 5 | WPS | OK — 引用題なし (freq 0)。PIN 方式の総当たり弱点は事実。mix 考点 (WPS は設定補助で暗号化方式とは役割が違う) は正しい。図 flow steps 4 (ボタン → 端末で選択 → 名前と鍵が自動で渡る → 暗号化接続) は one・detail と一致 | OK | OK | なし |
| 6 | ESSID | 事実は OK — exam 3 / 7 題: ESSID 自体に暗号化の働きはなく暗号化は方式と鍵 (2012h24a-q064 正答エ / 2018h30a-q089 正答エ) / ステルス機能は不正接続リスクを下げる (2024r06-q070 正答ウ / 2016h28h-q074 正答エ / 2015h27a-q056 正答ア — **2 文目が q070 誤答ア・イを同じ順で打ち消す** → M2) / 1 台に複数 ESSID、ESSID ごとに暗号化方式・通信範囲を設定 (2018h30h-q100 正答ウ は無線LAN points[0] [WEP の弱さ] と合わせて解ける / 2022r04-q068 正答ア を支持; a2 で指摘の「ESSID を分けるだけで遮断」の因果は解消)。quiz q068・q085 は one で解ける | **M2** / L2 / L3 | OK | M2, L2, L3, L7 |
| 7 | MACアドレス | 事実は OK — exam 2 / 4 題 + mix 1 / 1 題: 前半 IEEE・後半メーカーで世界中で重複しないように割り当てる仕組み (2016h28h-q068 正答ア、jp は「割り当てる仕組み」で a2 の MEDIUM を解消) / MACアドレスフィルタリング (2017h29h-q100 ウ / 2021r03-q085 イ / 2018h30a-q087 ウ) / IPアドレス = 論理アドレス、ルーターが転送に使う (2012h24h-q065 正答エ)。図 table (24 + 24 = 48 ビット) 計算一致 | OK | **zh / en が「世界で一意」を存在の事実として言い切る** → M3 | M3, L6 |

**単元レベル**: goals 3・overview_cols 2 (種類 / 見分けどころ)・overview_rows 7 行・pairs 1 組 (ESSID / MACアドレス 4 行 key 1)・key_points 3・summary (記法除去版と一致)・challenge 5 題。challenge: 2019r01a-q077 (ア = 無線LAN detail・key_points[0]; イ「WPA2 に限定」は「WPA2 などによる」と矛盾、ウ距離無関係は detail で否定、エは Wi-Fi points[1] で否定)、2015h27a-q076 (b = 無線LAN points[1]、a = ESSID detail で否定; c テザリングは本文に無いが a 偽・b 真で ウ に決まる → O2)、2020r02o-q088 (b = 無線LAN points[1]; c は ESSID one・MAC points[2] で否定、a [暗号化技術で速度が決まる] は key_points[2] の速度要因と整合)、2018h30a-q087 (MAC points[1])、2025r07-q090 (エ = 無線LAN points[0]; ア・イ・ウ は ESSID / ステルス / MAC フィルタリングの定義で否定)。事実誤りなし。

**前回までの指摘の解消確認 (journal `b17-u03-a1` / `b17-u03-a2`、type:"result"; HIGH なし)**:

| 指摘 (round) | 現状 |
|---|---|
| a1 jp-review r1 M: ESSID「暗号化には関わらない」の無条件言い切り | 解消 — 「ESSID 自体に通信を暗号化する働きはなく」(SSID が PSK の鍵導出材料になる事実と衝突しない範囲) |
| a1 r1 M / a2 r1 M: メッシュWi-Fi の図が直列で網目でない | 解消 — `terms[3].fig` = null、網目の像は one・hook・analogy で伝える。退行なし |
| a1 r1 M: 未定義の「ゲストSSID」 | 解消 — SSID の語は本文に無い (ただし逆の欠落 → L2 に同梱) |
| a1 r2 M: Wi-Fi Direct の総表・hook「親機が要らない」が detail と矛盾 | 解消 — 総表「専用のアクセスポイント機器を置かない」、Wi-Fi Direct の hook は削除、「親機」は無線LAN analogy (コードレス電話) とメッシュ detail のみ |
| a1 r2 M / a2 r1 M: Wi-Fi Direct = アドホックと読める / 両定義に同じ「介さない」 | 解消 — one を「専用のアクセスポイント機器を置かずに」に絞り、mix 考点はアドホックを「全端末が対等」と定義して「一方が役を兼ねる点で異なる」と明示 |
| a1 r2 M: 来訪者用 ESSID だけで内部を遮断できるという因果 | 解消 — 「ESSID ごとに暗号化の方式や通信できる範囲を分けて設定できる」(設定の効果として記述) |
| a2 r1 M: MACアドレス「世界に 1 台しかない」の存在の断定 | **jp は解消** (割り当てる仕組み) / **zh・en に残存 → M3** (loc 段の退行で loc-review を通過) |
| a2 loc-review r1 M: zh / en でステルス化の別名欠落 | 解消 — zh「也称 [[jp:ステルス化]]」/ en "also [[jp:ステルス化]]" |
| a1 r1 L: ステルス考点が q070 誤答ア・イを同じ順で否定 | **未解消 → M2** (D-198 (iii) 較正により MEDIUM に格上げ) |
| a1 r1 L: Wi-Fi points[1] は q077 誤答エの裏返し | **未解消 → M1** (同上) |

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 3 / LOW: 9 (うち 建議修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (文字列置換、構造変更なし) |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[1](Wi-Fi).points[1].text_jp` / `text_zh` / `text_en` (kind exam、qids `2019r01a-q077` は維持) | D-198 (iii): 引用題 q077 の**誤答エ**の文 (無線LANの規格は複数ある + 全て相互通信できる) を、同じ書き出し (遮蔽なし 12 字一致「無線LANの規格は複数あ」) で再演して打ち消すだけの考点。q077 の正答ア (アクセスポイントの不正利用対策) は述べておらず、それは `terms[0].detail_jp` 3 文目・`key_points_jp[0]` が担う。a1 r1 で low 記録のまま残った。修正案は「規格ごとに使う周波数帯が決まり、帯域の違う規格同士は通信できない」という一般原則 + 「例えば」付きの具体例 (802.11a = 5GHz のみ / 802.11b = 2.4GHz のみ、事実確認済み; D-205 は該当なし・「例えば」あり) で、エの書き出し・構文に触れない。新 JP 85 字 1 文、topic 全 87 題と 12 字一致 0 (遮蔽あり・なしとも)、最大 Dice 0.27 / ed 0.80 (q096 題文)。誤答エを支持せず、正答アとも矛盾しない | jp: 「無線LANの規格は複数あり、使う周波数帯などが違うため、どの規格同士でも通信できるわけではない。」→「無線LANの規格は使う周波数帯が規格ごとに決まっていて、例えば5GHz帯だけを使う 802.11a の機器と2.4GHz帯だけを使う 802.11b の機器は互いに通信できない。」/ zh: 「无线LAN的标准有多种，所用频段等各不相同，因此并非任意两种标准之间都能通信。」→「无线LAN的各项标准分别规定了所用的频段，例如只用 5GHz 频段的 802.11a 设备和只用 2.4GHz 频段的 802.11b 设备之间无法互相通信。」/ en: "There are several wireless LAN standards, and because they differ in frequency band and other respects, not every pair of them can communicate." → "Each wireless LAN standard fixes which frequency band it uses; for example, an 802.11a device, which uses only the 5 GHz band, cannot talk to an 802.11b device, which uses only the 2.4 GHz band." (太字 0・`[[jp:]]` 0 は前後で同数) |
| M2 | **MEDIUM** | `terms[5](ESSID).points[1].text_jp` / `text_zh` / `text_en` (kind exam、qids 3 件は維持) | D-198 (iii): 1 文目が引用題 2024r06-q070 の**正答ウ**の言い換え (ed 0.43 / Dice 0.54 / 遮蔽なし LCS 12「アクセスポイントへの不正」)、2 文目「通信の暗号化や端末の認証の代わりにはならない」が**誤答ア (暗号化できる)・イ (端末を認証できる) を同じ順で**打ち消す = q070 の 4 肢中 3 肢の組を考点に再現 (b16 u12 M1〜M3 と同型、a1 r1 で low 記録)。**HIGH にしない理由**: 1 文目の近似は HIGH 較正 (ed 0.14) より遠く、b14 u05 H1 (ed 0.44 / Dice 0.57 / LCS 18 + 題文の句順なぞり) より LCS が短く、一致部はカタカナ用語 + 助詞で遮蔽ありでは 0、内容は「不正接続リスクを下げる」という効果の標準的な言い方 → 写し (HIGH) ではなく選択肢の組の再現 (MEDIUM) と判定。修正案は「名前を隠すだけで、やり取りの電波を拾えば ESSID は分かる → リスクを下げる対策にとどまる」という仕組みの限界 (新しい情報) で、ア・イの語に触れない。新 JP 78 字 1 文、12 字一致 0 (遮蔽あり・なしとも)、最大 Dice 0.19 / ed 0.91 (2015h27a-q056 ア)。正答ウ・q056 ア・q074 エを支持し、誤答を支持しない | jp: 「ステルス機能は、アクセスポイントへの不正な接続のリスクを下げる対策である。通信の暗号化や端末の認証の代わりにはならない。」→「ステルス機能は名前を一覧に出さず接続先として見つかりにくくするだけで、やり取りの電波を拾えば ESSID は分かるため、不正接続のリスクを下げる対策にとどまる。」/ zh: 「隐身功能（[[jp:ステルス機能]]）是降低接入点被非法连接风险的措施。它不能代替通信加密或终端认证。」→「隐身功能（[[jp:ステルス機能]]）只是不在列表中显示名称、让网络不易被发现；只要截获通信的电波就能得知 ESSID，因此它只能起到降低非法接入风险的作用。」/ en: "The stealth feature ([[jp:ステルス機能]]) lowers the risk of unauthorized connections to an access point. It does not replace traffic encryption or device authentication." → "The stealth feature ([[jp:ステルス機能]]) only keeps the name off device lists so the network is harder to find; anyone who picks up the radio traffic can still learn the ESSID, so it only lowers the risk of unauthorized connections." (`[[jp:ステルス機能]]` zh・en 各 1 は前後で同数) |
| M3 | **MEDIUM** | `terms[6](MACアドレス).points[0].text_zh` / `text_en` (**jp は変更しない**) | 観点 7 三語不整合 (+ a2 r1 MEDIUM の zh / en 側の退行): jp は「世界中で重複のない番号として割り当てる**仕組み**」(引用題 2016h28h-q068 正答アの「…しか存在しない**ように割り当てられる**」に沿う割り当ての原則) だが、en "A MAC address **is unique worldwide** because…" は存在の事実として言い切り、zh「从而成为全世界不重复的编号」も結果の断定に寄る。MAC アドレスは書き換え・ローカル管理アドレス・端末のランダム化があり重複しないことは保証されない (a2 r1 の指摘そのもの)。引用題を誤答させるほどではないので HIGH にはしない | zh: 「MAC地址的前半部分是由 IEEE 分配的制造商编号，后半部分由制造商自行编号、避免重复，从而成为全世界不重复的编号。」→「MAC地址的前半部分是由 IEEE 分配的制造商编号，后半部分由制造商自行编号、避免重复，以此按全世界不重复的原则来分配编号。」/ en: "A MAC address is unique worldwide because IEEE hands out the manufacturer number in the first half and each manufacturer numbers the second half so that no two clash." → "MAC addresses are allocated so that no two in the world are the same: IEEE hands out the manufacturer number in the first half, and each manufacturer numbers the second half so that none clash." |
| L1 | LOW **建議修** | `terms[1](Wi-Fi).points[2].text_jp` / `text_zh` / `text_en` 2 文目 | D-198 (iii) 寄り: 2 文目「ネットワークの名前とは別物である」は引用題 2023r05-q065 の誤答ウ・エに共通する前提 (PSK = アクセスポイントを識別する名前) を打ち消すだけの文。1 文目は正答アの言い換え (ed 0.68 / Dice 0.22 で写しではない)。ESSID ≠ 暗号化の対比は `terms[5].points[0]` にあり、削っても失われない | jp: 「…これを元に端末ごとの暗号鍵が作られる。ネットワークの名前とは別物である。」→「…これを元に端末ごとの暗号鍵が作られる。」/ zh: 「…每台终端的加密密钥都以它为基础生成。它和网络名称是两回事。」→「…每台终端的加密密钥都以它为基础生成。」/ en: "…and each device's encryption key is derived from it. It is a separate thing from the network name." → "…and each device's encryption key is derived from it." (新 JP 49 字 1 文) |
| L2 | LOW **建議修** | `terms[5](ESSID).detail_jp` / `detail_zh` / `detail_en` 1 文目 (+ 派生 `explanation_*`) | (a) 「規格で決まった固定の値ではない」は challenge 2015h27a-q076 の誤った記述 a (規格ごとの固定値で変更不可) を打ち消すための節で、直前の「自由に付けられ」の言い直し。(b) 1〜2 文目の 2 属性 (32 文字・複数アクセスポイントで同じ名前) は 2011h23tokubetsu-q061 (ESSID を当てさせる題文) と同じ組・同じ順 (a2 r2 low; 標準的事実のため写しとはしない)。(c) 引用題 2022r04-q068 は「ゲスト SSID」と書くが、本文に ESSID = SSID の対応が無く読者が結べない (a1 で未定義 SSID を消した逆の欠落)。打ち消し節を削り、空いた位置に別名を入れる (別名を別物として教える b15 u10 M1 型の逆、同じものと明示) | jp: 「名前は管理者が32文字以内で自由に付けられ、規格で決まった固定の値ではない。」→「ESSID は SSID とも呼ばれ、名前は管理者が32文字以内で自由に付けられる。」/ zh: 「名称可由管理员在32个字符以内自由设定，并不是标准规定的固定值。」→「ESSID 也称 SSID，名称可由管理员在32个字符以内自由设定。」/ en: "The administrator can choose any name up to 32 characters; it is not a fixed value set by the standard." → "An ESSID is also called an SSID, and the administrator can choose any name up to 32 characters." (detail は 3 文のまま) |
| L3 | LOW | `terms[5](ESSID).points[0].text_jp/zh/en` | 「ESSID 自体に暗号化の働きはなく、暗号化は方式とその鍵が担う」は 2012h24a-q064 誤答ア (鍵)・イ (方式) の否定に近いが、順序は逆 (方式 → 鍵) で、主張は暗号化の担い手を肯定形で述べる。ESSID と WPA2 の取り違えは topic の 4 題 (2014h26a-q076 / 2017h29a-q069 / 2019h31h-q074 / 2018h30a-q089) が誤答肢 ESSID で繰り返し問う中心の易混で、1 題の選択肢の組の再現ではない | 記録のみ |
| L4 | LOW | `terms[1](Wi-Fi).points[0].text_jp/zh/en` 2 文目 | 「IEEE 802.3 は有線LAN の規格」は 2011h23tokubetsu-q082 誤答ウを肯定形で言い当てる文。802.11 / 802.3 は標準的な対の知識で、打ち消しの形ではない | 記録のみ |
| L5 | LOW | `terms[0](無線LAN).points[1].text_jp/zh/en` | 1 句目は 2018h30a-q096 正答イの言い換え (句 ed 0.60 / Dice 0.53 / LCS 12 = 帯域名、遮蔽ありで 0)、2 句目が誤答エ前半の裏返し。2 句目は同考点の引用題 2015h27a-q076 b・2020r02o-q088 b が正しい記述として直接支持し、教科書の標準的記述 (§1-4) | 記録のみ |
| L6 | LOW | `terms[6].points[0]` ↔ `terms[6].fig` (table) ↔ `terms[6].one_jp`、`terms[3].points[0]` ↔ `terms[3].one_jp` / `terms[2].one_jp`、`terms[6].points[2]` | §9 言い直し / 書き方 8: MAC の割り当ての仕組み (前半 IEEE・後半メーカー) が表と考点で 2 回。メッシュの mix 考点は両用語の one の言い直し。MAC の mix 考点は IP アドレスの説明だけで MAC との違いを文中で言わない (a2 r2 low) | 記録のみ |
| L7 | LOW | `terms[2](Wi-Fi Direct).analogy_jp/zh/en` | 「郵便局を通さず目の前の相手へ直接手渡し」は仲介役の無い像で、mix 考点が区別するアドホック (全端末が対等) にも当てはまる。経路が直接である点 (図 key 行) は正しく、考点・detail が否定することは運ばない (a2 r2 low) | 記録のみ |
| L8 | LOW | `terms[2].detail_jp` / `terms[3].detail_jp` / `terms[4].fig` / `terms[6].points[2]` (ルーター)、`goals_jp[1]` / `overview_rows[2]` (アクセスポイント)、`terms[0].points[2]` (IoT)、`terms[4].one_jp` (PIN)、`terms[3].detail_jp` (親機) | D-195 定義前使用: ルーターは u02 の見出し語だが prerequisites は u01 のみ (unit_order 上は u02 の後)、アクセスポイントは goals・総表が無線LAN detail の括弧注より前、IoT・PIN は注なし (zh は zh_terms どおり「IoT（物联网）」)、メッシュ detail の「親機」は無線LAN analogy (コードレス電話) にしか出ない。いずれも日常語に近く実害小 | 記録のみ |
| L9 | LOW | `terms[0].hook_jp` (+ 派生 2)、`terms[1].hook_jp/zh/en` (+ 派生)、`terms[0].points[2].text_zh/en`、`terms[6].detail_en`、`key_points_en[0]` | §9 grep: 「と字面で覚える」1 件 (記憶フックの結び)、「造語とされる」/「据说」/ "is said" 1 件 (Hi-Fi に掛けた命名の由来は伝聞の要素があり、ぼかしは正当)。三語の微差: LPWA「少ない電力」を zh「很少的」/ en "very little" がやや強める、en の "separated by hyphens" は jp より狭い (loc r2 low)、key_points_en[0] の they が signals を受ける (loc r2 low)。key_points 3 項は goals 1 にしか対応しない (a2 r2 low) | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① ESSID = ネットワーク / MAC = 機器: `pairs[0].rows[0]` (key)、総表 extra (識別子の種類)、`goals_jp[2]` (予告) → 許容。② ステルス機能 / MAC フィルタリング (不正接続の対策): `pairs[0].rows[3]`、各用語の考点に片側ずつ (ESSID points[1] / MAC points[1]) → 許容 (a2 r1 low の key_points での 3 度目は解消)。③ WPS ≠ 暗号化方式: WPS mix 考点のみ (総表 extra は「設定の補助機能」で対比を述べない) → 許容 (a1 r1 low の 3 箇所は解消)。④ アクセスポイント経由 / Wi-Fi Direct: 図 compare、総表、one (定義そのもの)、アドホック・メッシュの mix 考点 → 図と mix 考点の 2 箇所 + 定義で許容。⑤ ESSID / PSK (名前 ≠ 鍵): ESSID points[0]、Wi-Fi points[2] 2 文目 → 2 箇所 (L1 で 1 箇所に減る)。⑥ MAC (物理) / IP (論理): MAC one + mix 考点 → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。「ESSID・MACアドレス」は識別子 2 つの括弧内列挙で D-197 対象外フィールド、事実は正しい。
- O2 challenge 2015h27a-q076 の記述 c (テザリングで無線LANが使われる) は本文に無いが、a 偽・b 真から正答ウに決まる。v1 からの継承で単元に合う。ESSID の「32文字以内」は規格上 32 オクテット (全角なら少ない) だが、IPA 題 (2011h23tokubetsu-q061) も「最大 32 文字」と書く水準で、指摘しない。
- O3 独立 copy 照合の偽陽性 6 件 (用語名・帯域名・「アクセスポイントの不正利用」の定型句) は §1-4。MAC detail の例 00-1A-2B-3C-4D-5E は先頭オクテット 0x00 で U/L・I/G ビットとも 0 (グローバル・ユニキャスト) — a1 r1 low (0A-… のローカル管理形) は解消。

確認済みで問題なし: 限定条件 (qid 付き考点 13 件全て保持、穴埋め 2 題の比較相手も保持)、§9 禁止句 grep (定型締め句 0; L9 の 2 件と図の「選ぶ」偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤91 字)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (14 種全て jp 本文に実在)、one_zh / one_en の見出し語 (7/7、ラテン綴り 4 語は免除)、zh 訳語表 (B6 warn 0)、図種 (svg static / compare static / flow steps / table static / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、D-205 (改訂される文書の構成数・名称の言い切りなし; IEEE 802.11 は「802.11n など」、M1 修正案は「例えば」付き)、シラバス別名 (ステルス機能 = ステルス化を同じものとして併記、L2 で ESSID = SSID も同じものとして併記; 別名を別物として教える箇所なし)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **3** (M1・M2 = D-198 (iii) 選択肢の再演・組の再現、M3 = 三語不整合 [a2 r1 MEDIUM の zh / en 退行]) |
| LOW | **9** (建議修 2: L1・L2 / 記録のみ 7: L3〜L9) |

## 5. 判定

**FAIL** (D-199: HIGH 0 だが MEDIUM 3)。全 7 用語・考点 15 件 (qid 付き 13 件)・引用 24 題 + 未引用の quiz / challenge 5 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。a1・a2 の jp-review / loc-review の MEDIUM 10 件 (a1 r1 3・a1 r2 3・a2 r1 3・loc r1 1) 中 9 件は解消・退行なし (Wi-Fi Direct の親機・アドホック同一視・ゲスト ESSID の因果を含む)、1 件 (MAC の存在断定) は jp で解消したが zh / en に残る (M3)。不合格の理由は D-198 (iii) 型 2 件 (M1・M2; いずれも a1 で low 記録のまま残ったもの) と三語不整合 1 件 (M3)。M1〜M3 は各 1 欄の文字列置換 (構造変更なし、qids 不変、派生欄の追従なし; L2 のみ派生 `explanation_*` が追従) で直せ、M1〜M3 + L1・L2 を当てた写しで validate 0 issue / parity 29 locations 0 diff / framing 0/0/0 / 新 JP 文字列の 12 字照合 0 (遮蔽あり・なしとも) / D-200 内 (M1 85 字・M2 78 字・L1 49 字、各 1 文) を確認済み → B3 補丁で M1〜M3 + 建議修 L1・L2 を当てたうえで、M1〜M3 の 3 欄の再確認をもって PASS にできる。L3〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

現行単元:

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-58-u03
✓ technology-22-58-u03 unit: 0 issues (data/ip/textbook/units/technology-22-58-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-58-u03
✓ technology-22-58-u03 parity: 29 locations, 0 diff
EXIT=0
framing (validateV2 pointFraming, 全考点) {"jp":0,"zh":0,"en":0}
```

修正案 (M1〜M3 + L1・L2) を当てた写し (scratchpad、派生 `explanation_*` も更新):

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/u03/patched.json
✓ technology-22-58-u03 unit: 0 issues
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/u03/patched.json
✓ technology-22-58-u03 parity: 29 locations, 0 diff
EXIT=0
framing {"jp":0,"zh":0,"en":0}
12 字照合 (新 JP 文字列): 遮蔽あり 0 / 遮蔽なし 0 (残るのは既存の用語名ヒット「MACアドレスフィルタリング」のみ)
```
