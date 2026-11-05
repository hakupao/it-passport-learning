# Rule A 全数抽検 — technology-23-61-u12 (サービス妨害・ゼロデイ・AIを狙う攻撃)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成、照合スクリプトは scratchpad)。
- **Date**: 2026-11-05 (S143 第 16 批 b16)、repo HEAD `09cdb2a2` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b16-u12-a2` merge 結果、sha256 先頭 `b62332aa4d5a4f4e`)。
- **対象**: `data/ip/textbook/units/technology-23-61-u12.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (DoS攻撃 / DDoS攻撃 / ゼロデイ攻撃 / クリプトジャッキング / プロンプトインジェクション攻撃 / 敵対的サンプル) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し (i)(ii)(iii)) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202、D-203 (S137)、D-204 / D-205 (S138 §2 §6)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-23-61-u12/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。追加点検 (S143 依頼): 穴埋め題の正答込み題文照合 / 引用題の選択肢の組・誤答肢の順序どおりの打ち消し (b14 u02 M1・b15 u07 M1 型) / シラバス別名 (b15 u10 M1) / 比喩・図の範囲と one・detail の食い違い (b15 u06 M1) / a1 審査指摘の解消と退行。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反 (D-198 (iii) 選択肢の組の流用・誤答肢の打ち消しを含む、b14 u02 M1 / b15 u07 M1 の前例) ・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes label・steps caption) / figure (svg ラベル: 攻撃者・指令サーバ・ボット端末 ×3・標的サーバ)` と単元レベル全フィールドを三語とも読んだ。派生 `definition_*` が `one_*` の記法除去版であること (不一致 0)、用語・`term_zh`・`term_en` の v1 不変量を確認。
2. **考点 × 引用題 (考点 全 12 件 = exam 7 + mix 5、うち qid 付き 9 件、引用 qid 延べ 16 件 = 異なり 13 題)**: `questions.json` + `translations/<exam>.json` の `stem_jp_clean` で各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-23-61`)。quiz 7 枠・challenge 5 題は全て本文の引用題に含まれる (未引用題 0)。**穴埋め題は 0 題** (2025r07-q073 は記述 a〜c と名称の組合せ題) — それでも全 89 題について「題文 + 正答」の連結文を照合源に加えた。
3. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 97 本 (派生除く) を topic 内全 89 題の題文 (clean) + 選択肢 + 正答込み題文の計 509 本と 12 字連続照合 (句読点・記号・空白除去)、**遮蔽あり** (カタカナ 4 字以上・英数を □、実字 6 未満の窓は除外) → **0 件**。**遮蔽なし** → 3 種:
   - `terms[0].hook_jp` ↔ 2013h25h-q052 題文: 「Denial of Serv…」= 見出し語の正式名称。用語名は表現ではない → 偽陽性。
   - `terms[1].points[2].text_jp` ↔ 2023r05-q058 ウ / 2019h31h-q069 ウ / 2024r06-q100 エ: 用語名「ドライブバイダウンロード」のみ → 偽陽性。
   - `key_points_jp[2]` ↔ 2025r07-q073 題文 (記述 a): 「の修正プログラムが提供さ」(13 字の LCS 15)。ゼロデイ攻撃の標準定義の定型句で、2013h25a-q074 ウ・2018h30h-q087 ウにも同じ原則がある。D-198「標準的な定義の一般表現は写しではない」→ 偽陽性 (L2)。
   - **近似照合** (文単位、bigram Dice / 正規化編集距離; 校正 = HIGH 例 ed 0.14 / Dice 0.52): 最大は `terms[4].hook_jp`「インジェクションは「注入」」↔ 2016h28a-q083 イ (用語名のみの選択肢) Dice 0.70 / ed 0.55 — 短文と用語名だけの選択肢の組合せで bigram が膨らむ偽陽性 (共通部は用語名)。次点 `terms[0].hook_jp` ↔ q052 題文 0.51 / 0.49 (正式名称)、`terms[1].points[2]` 2 文目 ↔ 2019h31h-q069 題文 0.45 / 0.69 (ドライブバイダウンロードの標準定義)、`key_points_jp[2]` ↔ q073 0.41 / 0.66。その他は全て Dice ≤0.39・ed ≥0.63 で校正値から遠い。1〜2 字置換型の近似一致 0。カタカナの多い文 (クリプトジャッキング / プロンプトインジェクション / 敵対的サンプルの各文、総表) は目視でも題の言い回しの流用なし。
   - **(iii) 具体例・選択肢の組の流用** (S143 追加点検): 「X は A や B ではない」型の考点 4 件を、関連題の誤答肢との対応で 1 件ずつ判定 (§3 M1〜M3・L3・L4):

     | 考点 | 打ち消す中身 | 対応する誤答肢 | 判定 |
     |---|---|---|---|
     | `terms[2].points[1]` | 攻撃開始からの時間 / ウイルスの潜伏期間 | 2018h30h-q087 ア (開始から 24 時間) / イ (潜伏期間なし) — 場面を抜いた同じ 2 肢を **同じ順序** で | 考点の情報が「見出し語 ≠ q087 ア・イ」に尽き、2 文目は points[0] の言い直し → **M1** |
     | `terms[0].points[0]` (+ `key_points_jp[0]`) | 管理者権限の奪取 / 情報の盗み出し (+ 改ざん) | 2009h21h-q068 ア (管理者権限の奪取) / エ (データを盗む) を **同じ順序**、key_points はエ・ウ; 2014h26h-q053 イ (管理者用パスワード変更) も近い | 誤答肢 2 つの言い換え打ち消し。原則 (可用性) は本文の考点には書かれていない → **M2** |
     | `terms[0].points[1]` | 物理的脅威 (地震や火災で機器が止まる) | 2009h21a-q066: 見出し語 DoS = 誤答イの場面 (外から大量データ → 公開サーバ停止)、対置するのは正答アの型 (要因 → 機器が止まる、原因だけ地震・火災に差し替え) | b14 u02 M1 と **同じ題・同じ型** (u02 M1 の指摘文「正答アの型 (要因 → 機器が止まる、原因だけ火災・停電に差し替え)」) → **M3** |
     | `terms[1].points[2]` (mix, q058) | サイトの閲覧者にマルウェアを送り込む手口 | 2023r05-q058: 見出し語 DDoS = 誤答ア、対置するのは正答ウ (ドライブバイダウンロード) の標準定義 | 誤答肢の場面の再現ではなく見出し語と別用語の取り違え防止。DoS/DDoS は q058・2019h31h-q069 の両題でドライブバイダウンロードの誤答に置かれており、「Web サイトに関わる攻撃」という実際の取り違えの組 (サイトそのものを止める / 閲覧者の機器を狙う)。b15 u07 M1 (取り違えない組 SEO) とは異なる → **L3** |
     | `terms[3].points[1]` (mix, qid なし) | データを盗む / 人をだまして情報を聞き出す | 2020r02o-q060 の誤答はイ・ウ・エとも **用語名だけ** (場面・記述の選択肢がない)。打ち消しの順序もイ・エの順と一致しない | 再現する選択肢の文がなく、「奪うのは情報でなく計算資源と電力」という原則を述べる → **L4** |

   - その他の (iii) 点検: `terms[1].points[1]`「パソコンに限らず IoT 機器も踏み台にされる」は 2019r01a-q100 の場面 (複数企業の IoT 機器・1 台から感染拡大・ある日時に一斉アクセス) の具体を使わず一般事実のみ → 可。`terms[2].points[2]` (q080) は「脆弱性を突く攻撃にはパッチが有効」という一般原則で、題文 + 正答 (バッファオーバフロー) の連結文と Dice 0.36 / ed 0.63、12 字一致 0 → 可。比喩 (役所の窓口・店の入口に押し寄せる群衆・非常口の壊れた錠・パン焼き機・受付係への書き添え) はいずれも引用題に無い場面。
4. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2〜3 文 (2/3/2/3/3/2 文)、定義前使用 (可用性 = DoS detail の括弧注、ボット・指令サーバ = DDoS detail、脆弱性・パッチ = ゼロデイ one / detail、マイニング = クリプト detail、プロンプト = PI one、機械学習モデル = 敵対的サンプル detail; 総表・目標・SVG 図で先に出る語は L7)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh 必须 / 考试 / 常考 + en must / exam / always / important / remember) → `freq_badge`「頻出」と `kind: "exam"`、en の "example" 内の exam のみで全て偽陽性 = 定型締め句 0。図の型: DoS / クリプトジャッキング / PI = flow static (3 ノード)、DDoS = svg (攻撃者 → 指令サーバ → ボット端末 ×3 → 標的サーバ、旧 `figure.mermaid` 併存・rendered)、ゼロデイ = flow steps 4、敵対的サンプル = 図なし; validate の図検査 0 = 登録内。pair 配置 (DoS→DDoS は DDoS の後、PI→敵対的サンプル は敵対的サンプルの後、各組 key 行あり)。敵対的サンプル `analogy_*` は三語とも空 (D-203 (b) で可; a1 の音声比喩 [人の耳] は削除済み)。
5. **D-200**: 考点数 2/3/3/2/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 52〜80 (≤100 ✓、最大は敵対的サンプル `points[0]` の 80 字)。**framing 件数** (validateV2 `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
6. **D-202 / D-203 / D-204 / D-205 単元全体点検**: 書き方 7 (「〜だけ」「〜ではない」の照合: DoS `pairs[0].rows[0].a`「1 台の機器からでも」は DDoS one「多数の機器」と対で矛盾なし; ボットは detail・points[1]・key_points[1]・overview_rows[1] で全て「不正プログラム」(機器は「ボットに感染した機器」)、SVG の「ボット端末」は複合語で整合; ゼロデイ detail「パッチ以外の対策も組み合わせる」は points[2]「パッチが有効」と衝突しない [前者はパッチが無い期間の話]) → 不整合は L5 (視覚限定) のみ。書き方 8 → L9。書き方 9 (限定条件) → §2 表、落ち 0。§6 (比喩・フックが定義の言い換え) → 該当なし (hook は語源・頭字・字形、比喩は別場面)。§9 言い直し → L8。D-205 (改訂文書の構成要素の数・名称) → 該当する記述なし (CIA の可用性のみ、数を言わない)。シラバス別名 (b15 u10 型): DoS / DDoS はシラバスで別項目、他に別名の組なし → 該当なし。
7. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 19 種 (DoS攻撃 / サイバー攻撃 / 物理的脅威 / DDoS攻撃 / 踏み台 / マルウェア / ボット / ドライブバイダウンロード / ゼロデイ攻撃 / 脆弱性 / ゼロデイ / バッファオーバフロー / クリプトジャッキング / 暗号資産 / マイニング / プロンプトインジェクション攻撃 / SQLインジェクション / 敵対的サンプル / データポイズニング) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり、zh 訳語が `zh_terms.unit.json` に従う (ボット = 机器人程序（Bot）/ サイバー攻撃 = 网络攻击 / 可用性 / 暗号資産 = 加密资产 / ドライブバイダウンロード = 路过式下载 / 生成AI = 生成式 AI / SQLインジェクション = SQL 注入 / マルウェア = 恶意软件; 漏洞・补丁・挖矿・跳板・指令服务器・数据投毒 は表に見出しがなく通常訳、validate B6 warn 0)。zh/en の追加 1 件 (C&C) → L6。
8. **a1 / a2 審査指摘の解消と退行** (journal `b16-u12-a1` jp.r1 / jp.r2、`b16-u12-a2` jp.r1 PASS / loc.r1 PASS):
   - a1 #1 MEDIUM クリプトジャッキング比喩 (攻撃者自身の機械 + 電気だけ取られる = 逆の像) → 解消。現行は「自宅のパン焼き機 (= 被害者の機器) が他人の注文を焼かされ、売上は他人、電気代と摩耗が自分に残る」で one / detail / overview_rows[3] (他人の機器の計算能力と電力) と一致。
   - a1 #1 MEDIUM ボットの指す範囲 (プログラム / 機器) の揺れ → 解消。key_points_jp[1]「ボットに感染して…多数の機器が踏み台」、overview_rows[1].extra_jp[1]「攻撃者が遠隔操作する多数の機器」で、ボット = 不正プログラムに統一。
   - a1 #2 MEDIUM DoS の手口を「ふだんの利用と同じ形の通信」に限定 + 例の列挙 (Web 要求・メール = 2013h25h-q052 正答ウの例示) → 解消。detail「大量の要求や通信を集中させ…使い切らせる」、overview_rows[0].extra_jp[1]「大量の要求で処理能力や回線を使い切らせる」は量の点だけで、q052 / q053 / q068 の正答と一致。形の限定も例の列挙も三語とも残っていない (zh「海量请求和流量」/ en "huge numbers of requests and traffic")。
   - 退行: なし。ただし a2 jp.r1 が LOW とした `terms[2].points[1]` (q087 誤答肢の順序どおりの打ち消し) は、S143 依頼の前例 (b14 u02 M1 / b15 u07 M1) に照らし本監査で **M1** に格上げ。a2 loc.r1 の LOW 5 件は全て未修のまま (L6・L10・L11 と M3 に吸収)。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | DoS攻撃 | 事実 OK — exam 2 / 5 題: ねらいはサービス妨害、直接の被害はサービス提供不能 (2009h21h-q068 正答イ / 2013h25h-q052 正答ウ / 2014h26h-q053 正答エ) / ネットワーク越しのサイバー攻撃で物理的脅威ではない (2009h21a-q066 正答ア = 大雨で機器停止が物理的、DoS 型のイは物理的でない / 2018h30h-q067 正答ア = 廃棄メディアあさりはサイバー攻撃でない、大量アクセスのウはサイバー攻撃)。どの考点も正答と一致し誤答を支持しない。限定条件落ちなし。flow 3 ノードは one と一致 | **D-198 (iii) 2 件** (points[0] = q068 誤答肢の打ち消し、points[1] = q066 の選択肢の組) | zh points[1] 网络…网络 反復 (loc LOW) | **M2, M3**, L10, L12 |
| 2 | DDoS攻撃 | OK — exam 2 / 3 題 + mix 1: 多数の機器から同時に大量の通信で Web サービス等を使えなくする (2025r07-q073 正答ウ [b = DDoS] / 2019r01a-q100 正答ア) / 踏み台の機器に感染して遠隔操作させる不正プログラム = ボット、IoT 機器も (2011h23tokubetsu-q076 正答イ / q100) / mix: 閲覧者の機器を感染させるのはドライブバイダウンロード (2023r05-q058 正答ウ)。detail のボット・指令サーバ・送信元分散は標準事実。「攻撃者が操る多数の機器」はボットを要件とまでは言わず q073 b (複数のコンピュータ) と矛盾なし | OK (points[0] は q073 b の語順に近い同義置換だが Dice 0.30 / ed 0.81、DDoS の標準定義 = L1) | detail zh/en に C&C 追加 (L6) | L1, L3, L6, L7, L8 |
| 3 | ゼロデイ攻撃 | OK — exam 2 / 3 題 + mix 1: 脆弱性判明から修正プログラム・対策の公開までの間に悪用 (2013h25a-q074 正答ウ / 2018h30h-q087 正答ウ / q073 a = ゼロデイ) / 「ゼロデイ」は攻撃開始からの時間・潜伏期間ではない (q087 — **事実は正しいが打ち消しの中身が誤答ア・イそのもの**) / バッファオーバフローのように脆弱性を突く攻撃にはパッチ適用が有効 (2017h29h-q080 正答ウ; 「最も」を落としても主張は弱まるだけで誤らない)。steps 4 (判明 → 修正なしの期間 → 提供 → 適用) は one・detail・points と一致 | **D-198 (iii) 1 件** (points[1]) / key_points[2] の 12 字一致は標準定義の偽陽性 | OK | **M1**, L2, L8, L9 |
| 4 | クリプトジャッキング | OK — exam 1 / 1 題 + mix 1: 他人のコンピュータの計算能力を気付かれずに使ってマイニング (2020r02o-q060 正答ア) / mix: 目的は情報でなく計算資源と電力。detail のマイニング定義・被害 (動作が遅い・電力増) は正しい。比喩は a1 指摘解消済み (§1-8) | OK | OK | L4, L8, L13 |
| 5 | プロンプトインジェクション攻撃 | OK (出題 0、qid なし) — 開発者の指示と利用者入力をどちらも文章として処理する性質を突き「それまでの指示を無視せよ」型の命令を紛れ込ませる、Web ページ・文書に隠す間接型もある = 標準事実。mix: SQLインジェクション (DB への命令文) との対比は正しい。比喩 (書類の隅の書き添えを上司の指示と取り違える受付係) は detail の間接型・優先の取り違えと同じ像 | OK | OK | L11 (pairs[1]) |
| 6 | 敵対的サンプル | OK (出題 0) — 学習済みモデルへの入力を細工、データポイズニング (学習データの汚染) と別物 = 正しい。detail の画像認識の例は「例えば」付き | OK | OK | **L5** (one の「人の目には」) |

**単元レベル**: goals 3 点・overview_cols 2 (狙うもの / 手口の要点)・overview_rows 6 行・pairs 2 組 (DoS / DDoS 3 行 key 1、PI / 敵対的サンプル 2 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (2013h25h-q052 / 2025r07-q073 / 2018h30h-q067 / 2017h29h-q080 / 2009h21a-q066 — 全て本文で引用、矛盾なし)。key_points_jp[0] は M2 と同じ型 (q068 誤答エ・ウの打ち消し) で M2 の修正に含める。事実誤りなし。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 3 / LOW: 13 (うち 建議修 4)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[2](ゼロデイ攻撃).points[1].text_jp` / `text_zh` / `text_en` (kind exam、qids `2018h30h-q087` は維持) | D-198 (iii): 引用題 q087 の誤答ア (攻撃開始から一定時間内に止める) とイ (潜伏期間のないウイルス) を、場面だけ抜いて **題と同じ順序で** 打ち消す考点 (b15 u07 M1 / b14 u02 M1 と同型; a2 jp.r1 も「D-198 (iii) に近い」と記録)。2 文目「修正前の脆弱性を突くという手口」は points[0]・one の言い直しで、考点の新しい情報が「見出し語 ≠ q087 ア・イ」に尽きる。修正案は「ゼロデイかどうかを決める軸 = 修正プログラムの前か後か、脆弱性やプログラムの種類は問わない」という一般原則で、q087 のどの選択肢の場面・順序にも触れず、hook (対策に使えた日数がゼロ) の言い直しでもない。新 JP 文 57 字 1 文、topic 全 89 題と 12 字一致 0 (遮蔽あり・なしとも)、最大 Dice 0.21 / ed 0.92 (2013h25a-q074 ウ)。正答ウ (対策公開前に悪用) を支持し、誤答ア・イを支持しない。太字 0・`[[jp:ゼロデイ]]` (zh・en 各 1) は前後で同数 | jp: 「「ゼロデイ」は、攻撃を始めてからの時間や、ウイルスの潜伏期間の長さを指す言葉ではない。修正前の脆弱性を突くという手口を表している。」→「「ゼロデイ」かどうかは、修正プログラムが出る前か後かで決まり、突かれる脆弱性や使われるプログラムの種類は問わない。」/ zh: 「“零日”（[[jp:ゼロデイ]]）指的不是发起攻击后经过的时间，也不是病毒潜伏期的长短，而是专攻尚未修复的漏洞这一手法。」→「是否算“零日”（[[jp:ゼロデイ]]），取决于是在修复程序发布之前还是之后，与被利用的漏洞或所用程序的种类无关。」/ en: ""Zero-day" ([[jp:ゼロデイ]]) does not refer to the time since an attack began or to how long a virus lies dormant. It names the method of striking a vulnerability that has not yet been fixed." → "Whether an attack counts as "zero-day" ([[jp:ゼロデイ]]) depends on whether it comes before or after the fix is released, not on the kind of vulnerability or program involved." |
| M2 | **MEDIUM** | `terms[0](DoS攻撃).points[0].text_jp` / `text_zh` / `text_en` (kind exam、qids 3 件は維持) + `key_points_jp[0]` / `key_points_zh[0]` / `key_points_en[0]` (+ 派生 `summary.key_points_*[0]`) | D-198 (iii): points[0] 1 文目後半「管理者権限の奪取や情報の盗み出しではない」は引用題 2009h21h-q068 の誤答ア (管理者の権限を奪取する) とエ (データを盗む) を **同じ順序で** 言い換えて打ち消す (q053 誤答イ [管理者用パスワード変更] とも重なる)。key_points_jp[0]「情報の盗み出しや改ざんではない」も q068 エ・ウの打ち消し。打ち消しの理由となる原則 (DoS が損なうのは可用性で、機密性・完全性ではない) は detail にあるが考点・要点には書かれず、選択肢の否定列挙だけが残る。修正は打ち消しを削り、可用性という一般原則に置き換える (S138 の削除・絞り込み優先)。新 points JP 74 字 2 文 / 新 key_points JP 35 字、12 字一致 0 (遮蔽あり・なしとも)、最大 Dice 0.34 / ed 0.90 と 0.39 / 0.88 (いずれも q068 題文)。正答 (q068 イ・q052 ウ・q053 エ) を支持し誤答を支持しない。可用性 = zh「可用性」(訳語表どおり)。太字・`[[jp:]]` は前後で同数 | points[0] jp: 「**DoS攻撃** のねらいはサービスの妨害であり、管理者権限の奪取や情報の盗み出しではない。サーバが直接受ける被害は、サービスを提供できなくなることである。」→「**DoS攻撃** のねらいはサービスの妨害で、損なわれるのは情報セキュリティの可用性である。サーバが直接受ける被害は、サービスを提供できなくなることである。」/ zh: 「**DoS 攻击**（[[jp:DoS攻撃]]）的目的是妨碍服务，而不是夺取管理员权限或窃取信息。服务器直接遭受的损害，是无法再提供服务。」→「**DoS 攻击**（[[jp:DoS攻撃]]）的目的是妨碍服务，受损的是信息安全中的可用性。服务器直接遭受的损害，是无法再提供服务。」/ en: "The aim of a **DoS attack** ([[jp:DoS攻撃]]) is to disrupt a service, not to seize administrator privileges or steal information. The direct damage to the server is that it can no longer provide its service." → "The aim of a **DoS attack** ([[jp:DoS攻撃]]) is to disrupt a service, and what it damages is availability in information security. The direct damage to the server is that it can no longer provide its service." / key_points jp: 「**DoS攻撃** のねらいはサービスの妨害であり、情報の盗み出しや改ざんではない。」→「**DoS攻撃** のねらいはサービスの妨害であり、損なわれるのは可用性である。」/ zh: 「**DoS 攻击**的目的是妨碍服务，而不是窃取或篡改信息。」→「**DoS 攻击**的目的是妨碍服务，受损的是可用性。」/ en: "The aim of a **DoS attack** is to disrupt a service, not to steal or alter information." → "The aim of a **DoS attack** is to disrupt a service; what it damages is availability." |
| M3 | **MEDIUM** | `terms[0](DoS攻撃).points[1].text_jp` / `text_zh` / `text_en` (kind exam、qids `2009h21a-q066`・`2018h30h-q067` は維持) | D-198 (iii): 2009h21a-q066 の選択肢の組を再現。見出し語 DoS は q066 誤答イの場面 (外から大量のデータ → 公開サーバ停止) で、対置する物理的脅威を正答アの型「(自然の要因) で機器が止まる」で書き、原因だけ大雨 → 地震・火災に差し替えている。b14 u02 (`terms[6](誤操作).points[0]`) M1 と **同じ題・同じ型** で、u02 は「地震や火災などの災害のような物理的脅威」に直して PASS 済み。分類の原則 (ネットワーク越しの攻撃 = サイバー攻撃、災害 = 物理的脅威) は q066・q067 が支持するので「機器が止まる」の場面だけ抜く。新 JP 文 58 字 1 文、12 字一致 0 (遮蔽あり・なしとも)、最大 Dice 0.19 / ed 0.79 (q067 題文)。zh は loc.r1 LOW の「通过网络发动的一种网络攻击」(网络 反復) も同時に解消。太字 0 (jp)・`[[jp:]]` 3 (zh・en) は前後で同数 | jp: 「**DoS攻撃** はネットワーク越しに仕掛けるサイバー攻撃の一つで、地震や火災で機器が止まるような物理的脅威には分類されない。」→「**DoS攻撃** はネットワーク越しに仕掛けるサイバー攻撃の一つで、地震や火災などの災害のような物理的脅威には分類されない。」/ zh: 「**DoS 攻击**（[[jp:DoS攻撃]]）是通过网络发动的一种网络攻击（[[jp:サイバー攻撃]]），不属于地震、火灾导致设备停机那样的物理威胁（[[jp:物理的脅威]]）。」→「**DoS 攻击**（[[jp:DoS攻撃]]）是经由网络实施的一种网络攻击（[[jp:サイバー攻撃]]），不属于地震、火灾等灾害那样的物理威胁（[[jp:物理的脅威]]）。」/ en: "A **DoS attack** ([[jp:DoS攻撃]]) is a cyberattack ([[jp:サイバー攻撃]]) carried out over a network, so it is not classed as a physical threat ([[jp:物理的脅威]]) such as an earthquake or fire that stops equipment." → "A **DoS attack** ([[jp:DoS攻撃]]) is a cyberattack ([[jp:サイバー攻撃]]) carried out over a network, so it is not classed as a physical threat ([[jp:物理的脅威]]) such as a disaster like an earthquake or fire." |
| L1 | LOW | `terms[1].points[0].text_jp/zh/en` | 「多数の機器から / 同時に / 大量の通信を / 送り込み / Web サービスなどを使えなくさせる」は 2025r07-q073 記述 b の語を順に同義語へ置き換えた形に近い。ただし DDoS の標準定義そのもので、Dice 0.30 / ed 0.81 と校正値 (Dice 0.52) から遠く、12 字一致 0。one の言い直し (§9) でもある | 記録のみ |
| L2 | LOW | `key_points_jp[2]` | 遮蔽なし 12 字一致「の修正プログラムが提供さ」(2025r07-q073 記述 a)。ゼロデイの標準定義の定型句で 2013h25a-q074 ウ・q087 ウにも同原則 → D-198 上は写しでない | 記録のみ (機械一致を消すなら jp「提供される前」→「出回る前」[overview_rows[2] と同語]、zh・en は不変) |
| L3 | LOW | `terms[1].points[2].text_jp/zh/en` (mix, q058) | q058 の誤答ア (DDoS) を見出し語として正答ウと対置する易混考点。§1-3 表のとおり DoS/DDoS とドライブバイダウンロードは 2 題で誤答に置かれる実際の取り違えの組で、誤答肢の場面の再現ではない。2 文目はドライブバイダウンロードの標準定義 (2019h31h-q069 題文と Dice 0.45 / ed 0.69) | 記録のみ |
| L4 | LOW | `terms[3].points[1].text_jp/zh/en` (mix) | 打ち消す「データを盗む / 人をだまして情報を聞き出す」は 2020r02o-q060 の誤答 (ソーシャルエンジニアリング・フィッシング) の概念に当たるが、q060 の選択肢は用語名だけで再現する文がなく、順序も一致しない。考点は「奪うのは計算資源と電力」という原則を述べる。対比「情報でなく計算資源」は goals[2]・overview_rows[3] と重なる (書き方 8 の範囲内) | 記録のみ |
| L5 | LOW **建議修** | `terms[5](敵対的サンプル).one_jp` / `one_zh` / `one_en` (+ 派生 `definition_*`) | one は「人の目には」と視覚に限るが、`overview_rows[5].extra_jp[1]`「人には分からない程度の雑音」と detail の「例えば画像認識」は視覚を例示として扱い、敵対的サンプルは音声などにもある。定義で範囲を狭めている (D-204 寄り、引用題なしで誤答には至らない) | jp: 「**敵対的サンプル** は、人の目にはほとんど分からない細工を加えて、…」→「**敵対的サンプル** は、人にはほとんど分からない細工を加えて、…」(他は不変、63 字、12 字一致 0) / zh: 「…是加入人眼几乎察觉不到的改动，…」→「…是加入人几乎察觉不到的改动，…」/ en: "…is input data altered in ways the human eye can barely detect, …" → "…is input data altered in ways people can barely detect, …" |
| L6 | LOW **建議修** | `terms[1](DDoS攻撃).detail_zh` / `detail_en` (+ 派生 `explanation_zh/en`) | jp は「指令サーバ」だけだが zh・en に「（C&C 服务器）」「(C&C server)」が足されている (三語の追加、loc.r1 LOW 未修) | zh: 「**指令服务器**（C&C 服务器）收到命令」→「**指令服务器**收到命令」/ en: "**command server** (C&C server), they" → "**command server**, they" |
| L7 | LOW | `overview_rows[0..3]`、`goals_jp[1]`、`terms[1].figure` (SVG)、`terms[1].points[1]` / `key_points_jp[1]` | 可用性・パッチ・マイニング (総表・目標)、指令サーバ・ボット端末 (SVG、detail より前に描画) が定義より前に出る。「踏み台」は明示的な定義なし (文脈から推測可)。前提単元 u04 / u05 の語か一般語で実害は小さい | 記録のみ |
| L8 | LOW | `terms[1].points[0]`、`terms[2].points[0]`、`terms[3].points[0]`、`terms[1].points[1]` 1 文目 | 各用語の第 1 考点が one (ボットは detail) の言い直し (D-203 §9) | 記録のみ |
| L9 | LOW | `terms[2].detail_jp` / `points[2]` / `fig.steps[1]・[3]` / `key_points_jp[2]` / `goals_jp[1]` / `overview_rows[2].extra_jp[1]` | 「パッチで防げる ↔ パッチが無い期間を狙う」の対比が多数の欄に出る (書き方 8)。ゼロデイの定義の中核で、M1 の修正後は points[1] からは消える | 記録のみ |
| L10 | LOW **建議修** | `terms[0].hook_en` (+ 派生 `memory_hook_en`、`summary.memory_hooks_en[0]`) | jp は「o が小文字なのは of だから」「DOS とは別の語」を並べるだけだが、en は ", which also sets it apart from DOS" で小文字の o が DOS との区別になるという因果に読める (loc.r1 LOW 未修) | en: "The o is lowercase because it comes from the preposition "of", which also sets it apart from DOS, the old PC operating system." → "The o is lowercase because it comes from the preposition "of". It is a different word from DOS, the old PC operating system." (1 文目 "DoS stands for Denial of Service." は不変) |
| L11 | LOW **建議修** | `pairs[0].rows[0].a_zh` | 「1 台设备也能发起」は算用数字 + 空白 + 量詞の日本語寄りの表記 (loc.r1 LOW 未修)。`pairs[1].rows[0]` の指示文 / 入力データの境界の曖昧さ (プロンプトも入力) は rows[1] が決定的な差を担うので記録のみ | zh: 「1 台设备也能发起」→「单台设备也能发起」 |
| L12 | LOW | `terms[0].fig` / `terms[3].fig` / `terms[4].fig` | 3 ノードの因果 flow を static で置き、中身が one を箱に分けた程度 (D-195 §2 の段階図・飾りの図の境界、§0-8 で最大 low) | 記録のみ |
| L13 | LOW | `terms[3].one_jp` / `overview_rows[3].extra_jp[1]` / `terms[3].fig.nodes[0]` | 手口を「他人のコンピュータに不正なプログラムを仕込み」に限るが、Web ページ上のスクリプトで閲覧者のブラウザに採掘させる型もある (ブラウザで動くスクリプトも被害者の機器上のプログラムと読めば包含)。考点・detail は限定せず、q060 正答と矛盾しない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① DoS 1 台でも / DDoS 多数の機器: `pairs[0].rows[0]` (key)、`goals_jp[0]`、DDoS hook (D を足す = §6 の対比の手がかり) → 許容。② 送信元が散らばり遮断しにくい: `pairs[0].rows[2]`、DDoS `detail_jp` 3 文目 (DDoS 側の性質として 1 回) → 許容。③ パッチの有無: L9。④ 情報でなく計算資源: `terms[3].points[1]`・`goals_jp[2]`・`overview_rows[3].extra_jp[0]` → 許容 (L4)。⑤ PI / 敵対的サンプル: `pairs[1]` と各 one → 許容。⑥ SQLインジェクション / PI、敵対的サンプル / データポイズニング: 各 mix 考点 1 箇所のみ。

**範囲外の観察**:
- O1 `unit_summary_*` は v1 と同文 (未改稿)。
- O2 a2 loc.r1 LOW「見出し語の `[[jp:]]` が考点ごとに毎回付く」(DoS ×2・DDoS points[0]/[2]・ゼロデイ points[0]/[2]・クリプト points[0]/[1]) は未修のまま。誤りではなく読みを妨げる量でもない (validate jp-origin warn 0) → 記録のみ。
- O3 `terms[1].points[1].text_zh` の「IoT 设备」は訳語表の「IoT（物联网）」の括弧を付けない (validate B6 warn 0 = matcher が単元内の初出で充足と判定) → 指摘しない。

確認済みで問題なし: 限定条件 (考点 12 件全て保持)、§9 禁止句 grep (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤80 字)、図の文字列の写し (validate 0、独立照合は偽陽性のみ)、`[[jp:]]` 原語 (19 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (6/6)、zh 訳語表 (B6 warn 0)、図種 (flow static ×3 / svg ×1 / flow steps ×1 / 図なし ×1 = validate 0)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、a1 の MEDIUM 3 件の解消と退行なし (§1-8)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **3** (M1 ゼロデイ points[1] / M2 DoS points[0] + key_points[0] / M3 DoS points[1]、いずれも D-198 (iii)) |
| LOW | **13** (建議修 4: L5 / L6 / L10 / L11、記録のみ 9: L1〜L4 / L7〜L9 / L12 / L13) |

## 5. 判定

**FAIL → B3 補丁で PASS 可** (D-199: MEDIUM 3 > 0)。全 6 用語・考点 12 件 (qid 付き 9 件)・引用 13 題で、考点の主張は正答と一致し、誤答肢を支持する記述も限定条件の落ちも事実誤りも無い。不合格の理由は 3 件とも D-198 (iii) の「引用題の選択肢の組・誤答肢の順序どおりの打ち消し」(b14 u02 M1 / b15 u07 M1 型、M3 は u02 M1 と同一題) で、各修正案は 1 欄内の文字列置換・qids 不変・12 字一致 0・Dice ≤0.39 で検証済み。補丁後は validate / parity の再実行で確認すること。建議修 LOW 4 件は同じ補丁で、記録のみ 9 件はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-61-u12
✓ technology-23-61-u12 unit: 0 issues (data/ip/textbook/units/technology-23-61-u12.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-61-u12
✓ technology-23-61-u12 parity: 29 locations, 0 diff
EXIT=0
```
