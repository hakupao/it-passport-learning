# Rule A 全数抽検 — technology-23-62-u06 (届出制度と公的支援機関)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-29 (S138 第 5 批 b05)、repo HEAD `1606c78` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b05-u06-a2` merge 結果、sha256 先頭 `49a81e73553a8fbe`)。
- **対象**: `data/ip/textbook/units/technology-23-62-u06.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (コンピュータ不正アクセス届出制度 / コンピュータウイルス届出制度 / 脆弱性関連情報届出制度 / ISMAP / J-CSIP / J-CRAT / サイバーレスキュー隊 / SECURITY ACTION) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、S135 補足 D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7 欄同士の整合・8 同じ対比 ≤2 箇所・9 引用題の限定条件)、D-203 (観点 8 対比反復・§6 比喩が定義の言い換え・§9 考点が one / detail の言い直し = low、観点 7 = medium [事実誤りなら high]、観点 9 限定条件落ち = high)、**D-204** (S138 §2: 比喩・フックの像や結論が考点 / detail の否定する内容を運ぶ = 観点 7 medium)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ、登録外図種の欠如は最大 low)。比較: `data/ip/textbook/.planning/v2/technology-23-62-u06/v1-original.json` (用語 8 語・`term_zh`・`term_en` とも v1 と一致、`unit_summary_*` も v1 と同文)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 10 件 = exam 7 + mix 3、うち qid 付き 7 件、引用 qid 延べ 8 件 = 異なり 7 題)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-23-62`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化をしていないこと、題の場面・前提 (限定条件) を外していないことを 1 件ずつ確認 (§2 表)。manifest の 8 語に紐づく題はこの 7 題のみ。
3. **quiz / challenge_questions** (quiz 計 8 枠 [2021r03-q081 は J-CRAT とサイバーレスキュー隊で重複] + challenge 5 題): challenge は 2009h21h-q084 / 2018h30h-q082 / 2021r03-q079 / 2021r03-q081 / 2023r05-q056 で全て本文の引用題 (未引用 0)。v1 の challenge 5 題 (情報セキュリティの CIA・ポリシ文書の階層など、本単元の見出し語と無関係) と v1 サイバーレスキュー隊 quiz の 2009h21a-q056 (セキュリティポリシの題) は外され、本単元に合う題に置き換わった。各題は本文と矛盾しない: 2021r03-q081 の誤答ウ (重要インフラ機器メーカー中心の情報共有の場) は J-CSIP の detail・mix 考点で J-CRAT と区別でき、誤答イ (自ら主体となり方針策定) は J-CRAT 考点で否定、誤答ア (24 時間監視サービス) を支持する記述なし。2023r05-q056 の誤答ウ (提供側だけが対象) を ISMS クラウドセキュリティ認証の考点 (「組織が」) は支持しない。
4. **D-198 写し**: validate の copy guard (本文 + 図ラベル・caption・総表・対比表) = 0 件。独立照合として単元の JP 文字列 135 本 (派生フィールド除く) を topic 内全 135 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去、カタカナ 4 字以上と英数を □ 1 字に遮蔽、見出し語は遮蔽しない、遮蔽後の実字 6 未満の窓は除外) → **完全一致 0 件**。**近似照合** (12 字窓で 1〜2 字置換、実字 8 以上) → 2 種のヒット、全て偽陽性:
   - `terms[3].points[0].text_jp` ↔ 2021r03-q079 誤答エ: 「〜していることを第三者が認(める / 定)」= 第三者認証の一般的な言い方で、題 (SECURITY ACTION) とは別の制度 (ISMS 認証) を述べる。
   - `terms[7].detail_jp` ↔ 2021r03-q079 題文: 「中小企業の情報セキュリティ対策ガイドライン」は IPA の文書の正式名 (固有名詞) で表現ではない。
   - **目視 (カタカナの多い文・遮蔽で見えない箇所)**: ① `terms[2].points[0]` (JVN は「JVN#」で始まる識別番号を付けて弱点と対処方法を公開) と 2018h30h-q082 題文 (識別子の形式を示し、管理している情報を問う) — 「JVN#」の番号形式は JVN の標準的な性質で、考点は題の問い (何の情報か) への答えを事実として言い切るもので、題の文の骨格 (共同運営の主体 → 識別子 → 管理している情報) はなぞっていない → 写しではない。② `terms[3].points[0]` 「情報資産を管理し守る仕組みを運用している」と 2017h29a-q080 判断項目 b (情報資産を適切に管理し守るための取組み) — ISMS 認証の標準的な定義表現 (D-198「標準的な定義・原則の一般表現は写しではない」)、語順・語彙も異なる。③ `terms[3].points[1]` 「クラウド特有の管理策も実施していることを認める」と 2023r05-q056 / 2024r06-q082 正答イ (クラウドサービス固有の管理策が導入・実施されていることを認証) — ISMS クラウドセキュリティ認証の標準的な定義で、「固有→特有」「ISMS 認証を受けた組織が」の付加など骨格が異なる。④ `terms[5].one_jp` 「被害の拡大を抑えて攻撃の連鎖を断つ手助け」と 2021r03-q081 正答エ — IPA が J-CRAT の任務として掲げる標準表現の言い換えで 12 字一致なし。⑤ `terms[5].points[0]` 「対応の方針を決めるのは相談した組織自身」は誤答イの裏返しだが、a1 r1 で指摘された誤答ア・イの同順否定列挙は解消され、事実 (支援にとどまる) を肯定形で述べる。⑥ `terms[7].points[1]` 「営利企業に限らず」は誤答イの否定だが、事実の言い切りで列挙なし。比喩 (空き巣の地図・保健所・建物の欠陥・備品業者の名簿・町内会の回覧・水漏れの専門家・衛生管理の掲示) はいずれも引用題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 8、太字あり)、展開 2〜3 文 (2/2/3/2/2/2/2/2 文)、比喩・フックが定義の言い換えでないこと (ISMAP / J-CSIP / J-CRAT = 略語の展開、SECURITY ACTION = ACTION と CERTIFICATION の対比; サイバーレスキュー隊は比喩・フックなし [a1 r1 の「本名とあだ名」は除去])、定義前使用 (IPA = 不正アクセス one の括弧注 + detail、脆弱性 = 脆弱性 one の括弧注、JPCERT/CC = detail で定義、JVN = detail で「脆弱性対策情報のポータルサイト」、ISMS 認証 = ISMAP points[0] で定義してから points[1] が使う [ISMS 自体は前提単元 u05 と u01 / u04 で定義済み]、標的型攻撃 = J-CRAT detail で定義、自己宣言 = SECURITY ACTION one; **管理策** は単元内・topic 内とも未定義 → L7)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh 必须 / 一定要 / 考试 + en must / always / exam / very → ヒットは「届け出る」の「出る」13 欄、「登録簿から選ぶ」5 欄、「重要インフラ」4 欄 [jp/zh 本体・派生]、`kind:"exam"`、`freq_badge`「頻出」、en `recovery` 内の very — **全て通常の用法で偽陽性**。定型締め句 0。唯一の §9 型観察は 4 フック中 3 つが「〜と読める」で結ぶこと → L6)、図の型 (不正アクセス・脆弱性・ISMAP・J-CSIP = flow steps 4/4/4/4、SECURITY ACTION の一つ星 / 二つ星 = static table、ウイルス・J-CRAT・サイバーレスキュー隊 = 図なし [サイバーレスキュー隊は別名だけの用語]; 全て登録内)、pair 配置 (ウイルス→脆弱性は脆弱性の後、J-CSIP→J-CRAT は J-CRAT の後、各組 key 行 1)。
6. **D-200**: 考点数 1/2/1/2/1/1/0/2 (≤3 ✓)、各 JP 文数 1〜2・字数 36〜99 (空白除く、≤100 ✓、最大は ISMAP `points[0]` の 99 字 [空白込み 102]、validate と同じ数え方)。**framing 件数** (validateV2 `pointFraming`、全考点、tsx で実行): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 単元全体点検**: 書き方 7 (欄同士の「〜だけ」「〜ではない」の照合: 不正アクセス detail「法律で課された義務ではなく」は同制度だけについて言い、ほかの欄に義務・任意の一般化なし; JVN 公表は detail 2 文目・fig steps[1]・steps[3]・`pairs[0].rows[1].b`・`key_points[1]` の全てが「ソフトウェア製品」に限定され、Web サイトは detail 3 文目で「IPA が運営者へ知らせて修正を促す」にとどまり公表に触れない; `overview_rows[2].extra[0]`「届出と修正に向けた調整」は公表を含まない; J-CRAT の「支援にとどまる」は one・detail・考点・analogy [どう直すかは家主が決める]・`pairs[1]` で一致; SECURITY ACTION「審査で得るものではない」は one・analogy・hook と一致) → 不整合 0。D-204 (比喩・フックの像) → 脆弱性 analogy の「補修後に住人へ告知」は製品の経路 (JVN 公表) に当たり、Web サイトの公表を否定する欄は無い (detail は運営者への通知を述べるのみ) ので medium の要件 (否定内容を運ぶ) に当たらず L1。書き方 8 (対比の出現欄を列挙) → §3 下段、超過なし。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 言い換え型なし。§9 言い直し → L8。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 8 種 (コンピュータ不正アクセス届出制度 / コンピュータウイルス届出制度 / ウイルス / 脆弱性関連情報届出制度 / ISMS認証 / ISMSクラウドセキュリティ認証 / サイバーレスキュー隊 / 自己宣言) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語 `[[jp:]]` (D-202): 仮名・漢字を含む見出し語 4 / 4 に併記あり、ISMAP / J-CSIP / J-CRAT / SECURITY ACTION の 4 語は仮名・漢字を含まない見出し語で `hasJpOrigin` (validateV2.ts:371〜376) が明示的に免除 (三語で同表記)、zh 訳語が `zh_terms.json` に従うこと (validate の B6 warn 0 / jp-origin warn 0; 计算机非法访问申报制度 / 计算机病毒申报制度 / 漏洞相关信息申报制度 / ISMAP（政府信息系统安全评估制度） / J-CSIP（网络信息共享倡议） / J-CRAT（网络救援队） / 网络救援队 / SECURITY ACTION（安全行动） / 定向攻击 / 信息资产 / 网络攻击 / 中小企业信息安全对策指南 一致)。en / zh の事実の強弱 → L3 (ISMAP detail_en の言い切り)、L2 (pairs の JVN 括弧の省略)、L9 (loc-review の未修 low)。
9. **前回 JP 審査指摘の解消確認 (journal `b05-u06-a1` / `a2` の type:"result")**:

| 出所 | 重大度 | 指摘 | 現状 |
|---|---|---|---|
| a1 jp-review r1 | **HIGH** | JVN 公表を Web サイト (運営者) の場合まで含めて言い切る (key_points[1]・pairs[0]・detail 3 文目・総表) | **解消**: detail は製品 (2 文目) と Web サイト (3 文目) を分け、公表は「製品についての調整が済むと」に限定; `key_points[1]`「ソフトウェア製品の弱点は…JVN で公表」; `pairs[0].rows[1].b`「(ソフトウェア製品は JVN で公表する)」; fig steps[1]・[3] も製品に限定; `overview_rows[2].extra[0]`「届出と修正に向けた調整」。回帰なし (三語とも同じ限定、zh・en も確認) |
| a1 jp-review r2 | MEDIUM | ISMS 認証の中身を述べる前に ISMS クラウド認証の考点が ISMS 認証を前提にする | **解消**: points[0] = ISMS 認証 (定義 + ISMAP との単位の違い)、points[1] = ISMS クラウドセキュリティ認証 (「ISMS 認証を受けた組織が」で前の考点を受ける) の順 |
| a2 jp-review r1 | MEDIUM | ISMAP の考点が未定義の ISMS 認証を主語にし、ISMAP との関係を示さない | **解消**: points[0] が「組織が情報資産を管理し守る仕組みを運用していることを第三者が認めるもの」と定義し、「クラウドサービスごとに評価する ISMAP とは対象の単位が違う」で見出し語と結ぶ; points[1] も「政府調達のための ISMAP とは別の制度」で結ぶ。ISMS 自体は前提単元 u05 (および u01 / u04) で定義済み |
| a1 r1 LOW | low | J-CRAT 考点が誤答ア・イを同順否定 / SA 考点・ISMS 考点が誤答を同順否定 / ISMAP hook「地図」/ J-CRAT analogy「消防の救助隊」/ サイバーレスキュー隊 analogy「本名とあだ名」/ 総表に未遂なし | 全て解消 (否定列挙は肯定の事実文へ、hook は略語展開へ、analogy は水漏れの専門家へ、サイバーレスキュー隊の analogy・hook 削除、総表に「(未遂を含む)」) |
| a1 r2 / a2 r2 LOW | low | ウイルス届出制度の exam 考点が社内初動 / 管理策・ISMS の未展開 / J-CSIP mix 考点で J-CRAT が未定義 / サイバーレスキュー隊 detail の「正式名」がどれか不明 / J-CSIP mix と pairs の範囲のずれ / 脆弱性 hook (傷口) / pairs「届け出る時点」行 | ウイルス考点 → L5 (未修、記録のみ)、管理策 → L7、正式名 → **L4 (建議修)**、脆弱性 hook と「届け出る時点」行は削除済み、J-CSIP mix の J-CRAT 先行言及と範囲のずれは総表で補われ記録のみ (L8 に統合) |
| a2 loc-review r1 | low ×9 | detail_en の程度強化 / pairs b_en・b_zh の JVN 括弧 / one_en の別名欠落 / detail_en "supports against" / zh 自我宣言 / overview_cols_zh 中黒 / caption_zh・detail_zh の直訳調 / goals_en[2] | **全て未修** (loc-review は PASS で B3 待ち)。L2・L3・L4 で建議修、残りは L9 記録のみ |

10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | コンピュータ不正アクセス届出制度 | OK — 引用題なし (freq 0)。mix: IPA への届出は傾向分析・再発防止のための情報提供で、警察への相談 (捜査・処罰) とは別の手続 — 正しい。one「被害 (未遂を含む) を受けた組織や個人が IPA へ届け出る」、detail「法律で課された義務ではない」= 経産省告示に基づく任意の届出という事実と一致 (告示への言及はないが誤りではない)。flow steps 4 (気付く→届出→分析→公表) は one・detail と一致 | OK | OK | なし |
| 2 | コンピュータウイルス届出制度 | OK — exam 1 / 1 題: 組織内で感染が疑われたら端末を切り離し社内の管理担当へ連絡、自己判断で復旧作業を始めない (2009h21h-q084 正答イ; 誤答ア OS 再インストール・ウ 再現確認の再インストールを「自己判断の復旧」として否定、誤答エ 全社員へ警告メールを支持しない; 限定条件「組織内で」「疑われたとき」保持)。ただし題は社内の初動を問い、届出制度そのものは問わない → L5 / mix: 社内報告と IPA 届出は別の仕組み — 正しく、考点と見出し語の橋渡し。detail「見つけただけでも届出対象」正しい | OK (図なし) | OK | L5 |
| 3 | 脆弱性関連情報届出制度 | OK — exam 1 / 1 題: JVN は「JVN#」で始まる識別番号を付けてソフトウェアの弱点と対処方法を公開するサイト (2018h30h-q082 正答エ; 誤答 = OSS ライセンス・定義ファイル版数・規格 を支持しない)。detail: 製品 = JPCERT/CC が開発者と調整 → JVN (JPCERT/CC と IPA が運営) で公表、Web サイト = IPA が運営者へ通知し修正を促す (JVN 公表なし) — 正しく、全欄で一貫 (§1-9)。受付は製品・Web サイトとも IPA (one・fig steps[0]・`pairs[0].rows[2]`) | OK | pairs の括弧 → L2 | L1 (analogy) / L2 |
| 4 | ISMAP | OK — exam 2 / 3 題: ISMS 認証は組織の管理の仕組みの運用を第三者が認めるもので、個々のシステム・製品の安全性は保証しない (2017h29a-q080 正答イ = b のみ; a 脆弱性なし・c 暗号モジュールの実装 を否定; 限定条件「ISMS 認証を取得していることから判断できること」= 「組織が…運用していること」に保持)。「クラウドサービスごとに評価する ISMAP とは対象の単位が違う」は題が問わない追加だが、ISMAP の登録単位 (サービスごと) という事実で正しく、誤答肢を支持しない / ISMS クラウドセキュリティ認証は ISMS 認証を受けた組織がクラウド特有の管理策も実施していることを認める第三者認証 (2023r05-q056 正答イ / 2024r06-q082 正答イ; 誤答 = PaaS・SaaS のみ・提供側のみ・プライバシーマーク・SSO・リスクベース認証 を支持しない)、ISMAP とは別 — 正しい。one (政府機関が使うクラウドを事前評価し登録簿へ)・detail (登録された監査機関が管理策の運用を確認、各府省は原則登録簿から選ぶ)・flow steps 4 は事実どおり | OK | detail_en の程度 → L3 | L3 / L7 |
| 5 | J-CSIP | OK — 引用題なし (freq 0)。one「IPA を中心に参加組織がサイバー攻撃の情報を共有する官民の枠組み」、detail「重要インフラ分野などの業界団体や企業、秘密保持の約束のもと」、fig「IPA が提供元を伏せて分析し共有」— 正しい。mix: 参加組織間の情報共有 ≠ 被害組織の対応支援 (J-CRAT) — 正しく、2021r03-q081 誤答ウ (J-CSIP の説明) を J-CRAT と見分ける手がかり。hook (IP = Information sharing Partnership) 正しい | OK | OK | L6 (hook の結び) |
| 6 | J-CRAT | OK — exam 1 / 1 題: 相談した組織に助言・調査支援を行い、対応方針を決めるのは相談した組織自身 (2021r03-q081 正答エ; 誤答イ [自ら主体となり方針・手順を策定] を否定、誤答ア [24 時間監視] を支持しない)。one「標的型攻撃を受けた組織などからの相談に応じ、被害拡大を抑え攻撃の連鎖を断つ手助けをする IPA の活動」は正答の限定 (相談を受けた組織・標的型) を保持。detail の標的型攻撃の定義・現地調査支援、`pairs[1].rows[2]` の「受けるおそれがあるとき」も事実どおり。analogy (水漏れの専門家、決めるのは家主) は考点と一致 | OK | one_en の別名欠落 → L9 | L8 / L9 |
| 7 | サイバーレスキュー隊 | OK — 引用題 2021r03-q081 (J-CRAT と共有)。one「J-CRAT の日本語での呼び名、同じ活動」正しい。detail 2 文目「正式名には『標的型攻撃に対する』意味の語句」は事実だが、jp・zh 本文のどこにも英語の正式名が無く、読者は「名前からも読み取れる」を確かめられない (en は J-CRAT の one_en に正式名あり) → L4 | OK (図なし = 別名の用語) | detail_en の不自然な結び → L4 | L4 |
| 8 | SECURITY ACTION | OK — exam 2 / 1 題: 審査で得るものではなく事業者自身の宣言で成り立つ (2021r03-q079 正答ウ; 誤答エ 第三者認定・ア ISMS 取得費用の補助 を支持しない) / 営利企業に限らず個人事業主・非営利法人も宣言できる (同題 誤答イ「営利組織だけ」の否定; 個人事業主・非営利法人の具体名は題が問わない追加だが IPA の対象規定どおりで正しい)。table (一つ星 = 情報セキュリティ 5 か条、二つ星 = 自社診断で現状把握 + 基本方針を定めて外部公開) は制度どおり。detail (中小企業の情報セキュリティ対策ガイドライン、ロゴマーク) 正しい。hook (ACTION であって CERTIFICATION ではない) は考点 1 と同じ向き | OK | zh 自我宣言 → L9 | L9 |

**単元レベル**: goals 4 点・overview_cols 2 (仕組みの型 / 主な利用者・対象)・overview_rows 8 行・pairs 2 組 (ウイルス / 脆弱性 3 行 key 1、J-CSIP / J-CRAT 4 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (全て本文の引用題、§1-3)。`key_points[0]` (3 つの届出制度の受付は全て IPA) は 3 用語の one と一致。`key_points[1]` は製品に限定 (§1-9)。`key_points[4]` (一つ星・二つ星) は table と一致。事実誤りなし、三語一致 (L2・L3 の程度差を除く)。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 4)** + 範囲外観察 4

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[2].analogy_jp` / `analogy_zh` / `analogy_en` | 「建物の欠陥 → 管理会社へ知らせる → 補修の段取り後に住人へ告知」は、建物 = Web サイト (運営者 = 管理会社) とも読め、その場合「住人 [利用者] へ告知」が Web サイトの弱点も公表されるという像を運ぶ。detail は Web サイトについて公表を否定してはいない (運営者への通知を述べるのみ) ので D-204 の medium 要件には当たらないが、a1 r1 HIGH と同じ方向の誤読の余地 | jp「市販の家電の欠陥に気付いた人が、うわさを広める前に窓口へ知らせ、メーカーの修理の段取りがついてから利用者へ告知されるのに似ている。」/ zh「就像有人发现了市售家电的缺陷，不先到处传播，而是告诉受理窗口，等厂家安排好修理之后再通知用户。」/ en "It is like someone who spots a defect in a household appliance telling a contact point before spreading rumors, with users informed only once the maker has arranged a fix." |
| L2 | LOW **建議修** | `pairs[0].rows[1].b_jp` / `b_zh` / `b_en` | 括弧「(ソフトウェア製品は JVN で公表する)」は公表されるのが弱点の情報であることが省略され、en "software products are published on JVN" は製品そのものが公開されると読める (loc-review r1 low、未修) | jp「開発者や運営者に修正を促す (ソフトウェア製品は JVN で公表する)」→「開発者や運営者に修正を促す (ソフトウェア製品の弱点は JVN で公表する)」/ zh「督促开发者或运营者修复（软件产品在 JVN 上公布）」→「督促开发者或运营者修复（软件产品的弱点在 JVN 上公布）」/ en "Developers or operators are urged to fix it (software products are published on JVN)" → "Developers or operators are urged to fix it (weaknesses in software products are published on JVN)" |
| L3 | LOW **建議修** | `terms[3].detail_en` (+ 派生 `explanation_en`) | JP「調達のたびに個別に安全性を確かめる手間を減らせる」(zh「能减少…的工作」) に対し、en "they no longer need to check safety separately each time they procure" は確認不要と言い切り程度が強まる (loc-review r1 low、未修) | en "Because ministries in principle choose from services in the register, they no longer need to check safety separately each time they procure." → "Because ministries in principle choose from services in the register, they spend less effort checking safety separately each time they procure." |
| L4 | LOW **建議修** | `terms[6].detail_jp` / `detail_zh` / `detail_en` (+ 派生 `explanation_*`) | 「正式名には『標的型攻撃に対する』意味の語句が入っており、名前からも読み取れる」が、jp・zh 本文に英語の正式名が一度も出ず確かめられない (a2 r2 low、未修)。en は "supports against" が不自然 (loc-review low) | jp「正式名には「標的型攻撃に対する」という意味の語句が入っており、」→「正式名 Cyber Rescue and Advice Team against targeted attack of Japan には「標的型攻撃に対する」という意味の語句 (against targeted attack) が入っており、」/ zh「正式名称中含有“针对定向攻击”这一意思的词句，」→「正式名称 Cyber Rescue and Advice Team against targeted attack of Japan 中含有“针对定向攻击”这一意思的词句（against targeted attack），」/ en "The official name includes wording meaning \"against targeted attacks\", so the name itself shows which attacks it supports against." → "The official name, Cyber Rescue and Advice Team against targeted attack of Japan, includes the words \"against targeted attack\", so the name itself shows which kind of attack it helps organizations deal with." |
| L5 | LOW | `terms[1].points[0]` / `terms[1].quiz` | exam 考点は社内の初動 (切り離し + 管理担当へ連絡) で、引用題 2009h21h-q084 も届出制度そのものを問わない (a1 r1 / a1 r2 / a2 r2 low、継続)。正答と一致し、mix 考点が IPA 届出との違いを補う。topic 内で本見出し語を問う題はこの 1 題のみ | 記録のみ |
| L6 | LOW | `terms[3..5].hook_jp` (+ 派生 `memory_hook_jp`, `summary.memory_hooks_jp[0..2]`) | 4 フック中 3 つ (ISMAP / J-CSIP / J-CRAT) が「〜と読める」で結ぶ (§9 同型の結びの反復; 略語展開のフックとして許容、technology-23-63-u06 L2 と同型) | 記録のみ |
| L7 | LOW | `terms[3].detail_jp`、`terms[3].fig` (nodes[1].label・steps[1].caption)、`terms[3].points[1].text_jp` | 「管理策」が単元内・topic 内 (u01〜u05) とも未定義 (a2 r2 low)。日本語として「管理のための対策」と推測でき、事実誤解は生まない | 記録のみ |
| L8 | LOW | `terms[5].points[0].text_*` 前半、`terms[4].points[0]` | J-CRAT 考点前半「相談した組織に助言や調査の支援を行う」は detail 2 文目の言い直し (D-203 §9)。J-CSIP の mix 考点は J-CRAT を定義前に言及し、対象を「被害を受けた個々の組織」とする (pairs は「受けるおそれ」まで) — 総表に先出しがあり矛盾ではない (a2 r2 low) | 記録のみ |
| L9 | LOW | `terms[5].one_en`、`terms[7]` ほか zh の「自我宣言」(one_zh・overview・goals・points・key_points)、`overview_cols_zh[1]`、`terms[4].fig.steps[2].caption_zh`、`terms[7].detail_zh`、`goals_en[2]` | loc-review r1 の残り low (one_en が「(サイバーレスキュー隊)」を英語正式名に置き換え別名の対応が消える [次用語で補完] / zh「自我宣言」は v1「自我声明」と不一致 / 中黒「・」/ 直訳調 2 箇所 / goals_en の数の一致)。いずれも事実は jp と同じ | 記録のみ (任意で loc-review の修正案どおり) |

**対比の出現欄 (書き方 8 の列挙)**: ① ソフトウェア製品 = JPCERT/CC 調整・JVN 公表 / Web サイト = IPA が運営者へ通知: `terms[2].detail` (2・3 文目)、fig steps[1]・[3] (製品側のみ)、`pairs[0].rows[1].b`、`key_points[1]` (製品側のみ) — 両側を並べるのは detail と pairs の 2 箇所 → 許容。② J-CSIP = 参加組織で情報共有 / J-CRAT = 被害組織の対応支援: `pairs[1].rows[0..2]`、`terms[4].points[0]` (mix)、overview 総表の行 (D-195 §3 の構造)、`goals_jp[2]` は予告のみ → 許容。③ 社内報告 / IPA 届出: `terms[1].points[1]` のみ → 許容。④ IPA 届出 / 警察: `terms[0].points[0]` のみ → 許容。⑤ ISMS 認証・ISMS クラウドセキュリティ認証 / ISMAP: `terms[3].points[0]` (単位の違い)・`points[1]` (別の制度) — 比較の観点が異なる 2 箇所 → 許容。⑥ 宣言 / 第三者認証 (ACTION / CERTIFICATION): `terms[7].hook`・`points[0]` の 2 箇所 → 許容。⑦ ウイルス / 脆弱性の届け出る中身: `pairs[0].rows[0]` と総表 → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿、B2 審査済み)。事実は正しい。
- O2 `source_figures` に 2010h22h-q061 (情報セキュリティ文書の階層図) が残る — v1 からの継承で、同 topic u05 にも同じ記載。本単元の quiz / challenge にはもう無い孤立参照だが、表示上の本文には出ない。
- O3 3 つの届出制度の根拠 (経済産業省告示) は本文に出ないが、受付 = IPA・任意 (不正アクセスの detail) は正しく、告示の欠如は誤りではない。義務 / 任意の一般化は不正アクセス制度の 1 文に限られ、他制度へ広げていない。
- O4 独立 copy 照合の近似 2 種は第三者認証の一般表現 / 文書の正式名の偽陽性 (§1-4)。

確認済みで問題なし: 限定条件 (考点 7 件全て保持、§2)、§9 禁止句 grep (定型締め句 0; 「と読める」は L6)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤99 字)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (4/4 + Latin 表記 4 語は免除)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×4 / static table ×1 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 HIGH 1・MEDIUM 2 の解消と回帰なし (§1-9)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 4: L1〜L4 / 記録のみ 5: L5〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 10 件 (qid 付き 7 件)・引用 7 題 (quiz / challenge に未引用題なし) で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。脆弱性関連情報届出制度の「製品 = JPCERT/CC 調整・JVN 公表 / Web サイト = IPA が運営者へ通知」は detail・図・pairs・key_points・総表で一貫し、前回 HIGH (a1 r1) と MEDIUM 2 件 (ISMS 定義前使用) は解消、回帰なし。LOW 建議修 4 件 (L1〜L4) は補丁 (B3) で修正推奨、L5〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-62-u06
✓ technology-23-62-u06 unit: 0 issues (data/ip/textbook/units/technology-23-62-u06.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-62-u06
✓ technology-23-62-u06 parity: 36 locations, 0 diff
EXIT=0
```
