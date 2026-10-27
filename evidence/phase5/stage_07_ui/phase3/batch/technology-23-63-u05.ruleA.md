# Rule A 全数抽検 — technology-23-63-u05 (物理的セキュリティ対策)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-28 (S135 第 1 批)、repo HEAD `d2cac29` + 作業ツリー (単元 JSON は未コミットの書き直し版、sha256 先頭 `527926286e22de65`)。
- **対象**: `data/ip/textbook/units/technology-23-63-u05.json` (textbook-unit-v2)、用語 **9 / 9 = 全数** (監視カメラ / 施錠管理 / 入退室管理 / アンチパスバック / インターロック / クリアデスク / クリアスクリーン / セキュリティケーブル / 遠隔バックアップ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§9)、S135 補足 D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-23-63-u05/v1-original.json`。前歴: `failures/phase5/stage_07_ui/phase3/batch/technology-23-63-u05_attempt_{1,2}.md` (attempt 2 の medium 2 件 = クリアスクリーン考点の矛盾 / 遠隔バックアップとランサムウェアの関係 — 本版で解消済みを確認)。
- **追加指示 (呼出し元)**: 考点の定型の出題枠句 (「〜として問われる」「試験で問われる」と zh/en 相当) を数え、単元内 3 件以上なら §9 MEDIUM。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ / MEDIUM = 誤解を招く・規則違反 / LOW = 文体。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 9 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 18 件 = exam 16 / mix 2、引用 qid 計 19 件) + quiz・確認題 (計 20 qid 全て)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-23-63`)。主張が正答と一致し誤答肢を支持しないこと、引用題が支持しない一般化が無いことを確認。計算題は無い。組合せ題 (2014h26a-q057 a〜d / 2010h22a-q078 a〜d / 2013h25h-q081 ①〜④) は各記述の正誤を解き直して正答イ / エ / イに到達。
3. **D-198 写し**: (i)(ii) validate の copy guard = 0。加えて独自スクリプト (scratchpad `ra_u05.cjs`、未入库) で JP 文字列 117 本 (本文・考点・図 label / caption・overview・pairs・goals・key_points) を topic 内全 217 題の題文 + 選択肢と 12 字連続照合 (カタカナ 4 字以上・英数遮蔽、遮蔽後の実字 6 未満の窓は除外) → **0 件**。(iii) 比喩・例 (自宅の合鍵 / ホテルのカードキー / 駅の自動改札 / 船の閘門 / 図書館の席 / レジの引出し / 自転車のワイヤ錠 / 親類宅の写真 / 会議・昼食の離席例) はいずれも引用題に無い場面。
4. **D-195**: 結論先行 (one = 1 文 × 9、太字あり)、展開 2〜3 文 (3/3/3/3/2/2/2/2/3)、比喩・フックが定義の言い換えでないこと、定義前使用 (物理的対策・人的/技術的対策 = 施錠管理 detail、ゾーニング・共連れ = 入退室管理 detail、前室 = インターロック one、IDS・サークル型ゲート = 括弧注、ランサムウェア = 遠隔バックアップ detail)、§9 禁止句 grep (試験 / 問われ / 出題 / 選択肢 / 選ぶ / しょう / 必ず / 非常に / 押さえ / 頻出 / とされる / 挙が、zh・en 相当語)、図の有無と型、pair 配置 (インターロック・クリアスクリーン ×2 の直後、各組 key 行あり)。
5. **D-200**: 考点数 2/2/3/3/1/2/1/2/2 (≤3 ✓)、各 JP 文数 1〜2・字数 41〜74 (≤100 ✓)。
6. **三語**: zh・en が jp と同じ事実か、図ラベル・キャプション・表セル・pair セルの三語一致、`[[jp:…]]` 原語 11 種が jp 本文に実在 (スクリプト、全 ok)、繁体字走査 (検出なし)、zh 訳語表 warn (§6、5 件)。
7. **出題枠句の横比較** (追加指示): `適切とされ` / `とされる` / `挙が` / `問われ` / `is considered` / `被视为` を同 topic u01〜u04 (u04 は補丁後)・試点 management-10-27-u01〜u03 と比較 → 他 7 単元はすべて 0、本単元だけ JP 5 件 (×三語)。
8. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (9 / 9)

| # | 用語 | 事実 (考点 × 引用題) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 監視カメラ | OK — exam 1 / 1 題: 重要情報の部屋は警備員・カメラで入退室確認と室内作業監視 (2019r01a-q067 正答ア、誤答 = 許可証を隠す・電子認証のみ・部屋の存在を周知)。mix: カメラは見張り・記録で、立入りを止めるのは鍵・認証 = 正しい。detail 抑止・証跡・保存期間・死角 = 一般的事実。比喩・フック無し (D-195 §1 で任意)、図無し (定義型) | 出題枠句 (M1) | OK | M1 |
| 2 | 施錠管理 | OK — exam 2 / 3 題: 三分類で区画施錠 + 鍵貸出し = 物理的 (2019h31h-q087 正答エ、誤答 = 生体認証・FW (技術)、相互チェック (人的))、ノート PC 施錠保管 = 物理的 (2015h27a-q051 正答ウ、守秘義務契約 = 人的・ディジタル署名 = 技術 と一致) / 物理的対策不備の典型 = 第三者のサーバ室侵入・データ持出し、DoS・ウイルス・誤操作は別 (2014h26a-q080 正答エ)。detail の三分類の定義は正しい | OK | 原語併記の欠け (L1) | L1 |
| 3 | 入退室管理 | OK — exam 3 / 3 題: 入室のみ記録の系では権限による入室許可と拒否記録は可、在室時間・人数は不可 (2014h26a-q057 正答イ = a, c) / 個人別 ID と記録・監督者不在で作業させない (2016h28h-q089 正答エ、部署単位 ID・記録なしは誤答肢 → 考点の「個人単位で追える」は誤答の裏返しとして正しい) / ゾーニング (2020r02o-q082 正答ウ)・場所別レベル + 個人別権限 IC カード = 物理的 (2025r07-q088 正答イ)。段階図 (確認→照合→解錠→記録) は detail・考点 1 と一致 (拒否も記録) | OK | OK | — |
| 4 | アンチパスバック | OK — exam 2 / 2 題 + mix 1 / 1 題: 共連れ入室者は自分のカードで退室不可、記録上室外の人から借りたカードでの入室は防げない (2016h28a-q098 正答イ、誤答ウ = 借用カード入室の防止は不可) / 共連れ防止策 = アンチパスバック、コールバック・SSO は別 (2022r04-q074 正答ア) / 不審通信の発見・報告は IDS で、アンチパスバックは誤答肢 (2025r07-q077 正答イ)。表 (室外: 入室許可・退室拒否 / 室内: 入室拒否・退室許可) は one と題の定義に一致。改札の比喩 正しい | 出題枠句 (M1) | en が jp より断定的 (M1 に含む)、原語併記の欠け (L1) | M1, L1 |
| 5 | インターロック | OK — exam 1 / 1 題: 共連れの物理的防止 = サークル型セキュリティゲート (2021r03-q058 正答ア、ラック施錠・入室証着用・入退室管理簿は誤答)。サークル型ゲートは一人用・扉連動の典型で、本用語の下に置くのは正しい。detail「連動だけでは二人同時に前室へ入るのは止められない → 一人用前室・重量センサ」正しい。段階図 4 step・pair 表 (止める手段 / 時点 / 防げない不正) は detail と一致 | 出題枠句 (M1) | OK | M1 |
| 6 | クリアデスク | OK — exam 2 / 2 題: 書類を机に放置して離席しない = クリアデスク、離席時の PC ロックは誤答肢 (2023r05-q090 正答イ) / 重要書類・媒体を利用時以外は施錠棚 = 適切 (2010h22a-q078 正答エ = b, c, d)。detail 一致 | 出題枠句 (M1) | OK | M1 |
| 7 | クリアスクリーン | OK — exam 1 / 1 題: 終日ロックせず操作可能 = 不適切 (2010h22a-q078 記述 a、正答エに含まれない)。inline quiz 2013h25h-q081 (盗難防止では画面ロックは不正解) は pair「盗難への効果: 無い」と整合する対比題。detail の自動ロックは attempt 2 の矛盾 (自分で閉じるしかない) が除かれ一貫 | 出題枠句 (M1) | zh-term warn (L2) | M1, L2 |
| 8 | セキュリティケーブル | OK — exam 2 / 2 題: セキュリティワイヤの用途 = 事務室ノート PC の盗難防止、焼失・社外の盗み見・停電は別 (2010h22a-q050 正答イ) / 盗難防止 = チェーン固定・施錠保管、ログインパスワード・画面ロックは盗難を防がない (2013h25h-q081 正答イ = ②③)。別名セキュリティワイヤ (題の表記) を detail で併記 | OK | zh-term warn (L2) | L2 |
| 9 | 遠隔バックアップ | OK — exam 2 / 4 題: 被災時のサービス継続のための遠隔地バックアップシステム = 物理的 (2026r08-q094 正答イ) / ランサムウェア被害の軽減 = バックアップ、ネットワークから切り離して保管 (2025r07-q092 正答ア)・取外し可能な外部記憶へ (2022r04-q056 正答ア)・データのバックアップ (2026r08-q063 正答ウ)。「遠くに置いただけでは足りない」は引用題に直接は無いが、detail (同期される複製は一緒に暗号化され得る) で根拠を示した正しい一般論 (attempt 2 の medium を解消)。図無し | OK | 原語併記の欠け (L1)、zh-term warn (L2) | L1, L2, L3 |

**単元レベル**: goals 4 点・overview_rows 9 行 (列: 守る対象 / 主に防ぐこと、三語一致)・pairs 3 組 (アンチパスバック×インターロック / クリアデスク×クリアスクリーン / クリアスクリーン×セキュリティケーブル、各 key 行あり)・key_points 5 (summary は記法除去版と一致)・challenge_questions 5 件 (2015h27a-q051 / 2020r02o-q082 / 2021r03-q058 / 2023r05-q090 / 2026r08-q094 — すべて本文・考点と矛盾なし)。key_points[0]「離れた場所への複製」= 物理的対策の例 は 2026r08-q094 と一致。事実誤りなし。図種 flow steps ×2 / table static ×1 = 登録内。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 4 (うち 建议修 1)** + 範囲外観察 2

### MEDIUM

| ID | 重大度 | 箇所 (field path) | 内容 |
|---|---|---|---|
| M1 | **MEDIUM** | `terms[0].points[0]` / `terms[3].points[1]` / `terms[4].points[0]` / `terms[5].points[1]` / `terms[6].points[0]` の `text_jp` / `text_zh` / `text_en` | D-195 §9「定型の締め句の**常用**」違反 (追加指示の閾値 >2 を超える **5 件**)。「問われる」は 0 件だが、同機能の出題枠句が常用されている: 「〜が**適切とされる**」×3 / 「〜は…として**不適切とされる**」×1 (zh「被视为恰当/不恰当」、en "is considered appropriate / improper") は過去問の「適切なものはどれか」の正答判定をそのまま語る枠で、誰が「とする」のかが無い; 「共連れ対策の**名前としては**アンチパスバック**が挙がる**」(en "**Asked to name** a countermeasure against tailgating, **the answer is** anti-passback"、zh「说到…对策名称，对应的是」) は出題形式のメタ記述。同 topic u01〜u04・試点 3 単元は該当句 0 件で、本単元だけが常用 (u04 M1 と同じ判断)。さらに `terms[3].points[1].text_en` "the answer is" は jp「挙がる」より断定的で、共連れ対策の正答がサークル型ゲートになる 2021r03-q058 と並べると「共連れ = 常にアンチパスバック」と読まれかねない (誤答は誘発しない → HIGH ではない) |

**M1 修正案** (枠句を削り主張だけ残す。修正後 JP は 41〜67 字・1〜2 文、題文・選択肢との 12 字照合 0 件を確認済 — scratchpad `ra_u05_fix.cjs`):

| 箇所 | jp | zh | en |
|---|---|---|---|
| `terms[0].points[0]` | 重要な情報を置く部屋では、人の目やカメラで、出入りだけでなく室内での作業も見張る。 | 存放重要信息的房间，要由人员值守或用摄像头，不仅监视出入，也监视室内作业。 | Rooms holding important information are watched by staff or cameras, covering not just who comes and goes but also the work done inside. |
| `terms[3].points[1]` | 共連れを防ぐ仕組みの代表がアンチパスバックである。コールバックやシングルサインオンは通信や利用者認証の仕組みで、人の出入りは扱わない。 | 防尾随（Anti-passback）是防范尾随（[[jp:共連れ]]）的代表性机制。回拨（[[jp:コールバック]]）和单点登录（[[jp:シングルサインオン]]）是通信或用户认证的机制，不涉及人员出入。 | Anti-passback is a typical mechanism against tailgating. Callback ([[jp:コールバック]]) and single sign-on ([[jp:シングルサインオン]]) are mechanisms for communications or user authentication and have nothing to do with people entering rooms. |
| `terms[4].points[0]` | 共連れを入口で物理的に止める例に、扉が交互にしか開かない一人用の円筒形ゲート (サークル型ゲート) がある。 | 在入口处物理阻止尾随的一个例子，是门只能交替打开的单人圆筒形闸门（[[jp:サークル型ゲート]]）。 | One way to physically stop tailgating at the entrance is a one-person cylindrical gate whose doors open only in turn (a circle gate, [[jp:サークル型ゲート]]). |
| `terms[5].points[1]` | 重要な書類や記録媒体を、使う時以外は鍵のかかる棚にしまっておくことも、情報漏えいを防ぐ職場の活動になる。 | 重要文件和存储介质在不使用时放进上锁的柜子，这也是防止信息泄露的职场做法。 | Keeping important documents and storage media in a locked cabinet except when in use is another workplace practice that prevents leaks. |
| `terms[6].points[0]` | 勤務中ずっと PC をロックせずに使える状態にしておくと、情報が漏れるもとになる。 | 整个上班期间都让电脑处于不锁定、随时可操作的状态，会成为信息泄露的隐患。 | Leaving a PC unlocked and ready to use throughout the working day opens the door to leaks. |

(`terms[3].points[1]` の修正案は L1 のコールバック / シングルサインオン併記を含む。`[[jp:コールバック]]`・`[[jp:シングルサインオン]]`・`[[jp:共連れ]]` は修正後 jp に実在。)

### LOW

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建议修** | `terms[1].detail_zh/en` (人的対策・技術的対策) / `terms[8].detail_zh/en` (ランサムウェア) / `terms[3].points[1].text_zh/en` (コールバック・シングルサインオン、M1 修正案に統合) | 引用題の題文・正答・誤答肢の語なのに zh・en に `[[jp:]]` 原語併記が無い (D-195 §5)。特に三分類 (人的 / 技術的) は 4 題 (2015h27a-q051 / 2019h31h-q087 / 2025r07-q088 / 2026r08-q094) の題文の語、ランサムウェアは 3 題の語。u04 L3 と同じ扱い | `terms[1].detail_zh`「…作用于人的**人员对策**（[[jp:人的対策]]）、通过认证和加密等手段进行保护的**技术对策**（[[jp:技術的対策]]）相区别。」/ `detail_en` "…**human measures** ([[jp:人的対策]]), … and **technical measures** ([[jp:技術的対策]]), …"; `terms[8].detail_zh`「…**勒索软件**（[[jp:ランサムウェア]]）…」/ `detail_en` "…**ransomware** ([[jp:ランサムウェア]]), …" (3 語とも jp 本文に実在) |
| L2 | LOW | `overview_rows[7].one_line_zh` / `terms[6].points[0].text_zh` / `terms[7].one_zh` / `terms[7].detail_zh` / `terms[8].points[1].text_zh` | validate の zh-term warn 5 件: jp「PC」に対し zh は「电脑 / 笔记本电脑」で、表の「PC（个人计算机）」を使っていない。zh として自然で誤りではない (u04 は表どおり) | 記録のみ (表に「电脑」を別表記として許すかは訳語表側の判断) |
| L3 | LOW | `terms[8].points[1].text_jp`「感染した PC から**ネットワークで**届かない所」 | 2022r04-q056 の正答は取外し可能な外部記憶装置 (USB 接続、ネットワーク経由ではない) で、「ネットワークで届かない」はやや狭い。切り離して置く原則は同じで誤答は誘発しない | 記録のみ (任意: 「感染した PC から届かない所 (ネットワークや PC から切り離した所)」) |
| L4 | LOW | 9 用語中 8 用語の `one_zh` / `one_en` に見出し語の `[[jp:<term>]]` が無い (インターロックの one_zh のみ有り) | 同 topic u01・u04 はほぼ全用語に併記。ただし見出しは `TermBlock.tsx:41` で jp の `term` を常に表示するため、学習者が原語を見失うことはない | 記録のみ |

**範囲外の観察** (書き直し対象外):
- O1 `terms[3].term_zh`「防尾随（Anti-passback）」(v1 不変量) は機能名の意訳で、zh では同じく尾随を防ぐ互锁と区別しにくく、考点 zh が「防范尾随…是防尾随」の同語反復になる。term_zh 変更は不変量の緩和が要るため OQ 候補として記録。
- O2 `unit_summary_jp/zh/en` は v1 と同文 (スクリプト確認)。内容は本文と矛盾なし。

確認済みで問題なし: 事実 (全 20 qid の正答と一致、誤答肢を支持する記述なし)、D-197 羅列 (validate 0)、D-200 (全 18 考点 ≤2 文・≤74 字)、図・表・pair・overview の文字列の写し (0 / 117)、`[[jp:]]` 原語 (11 種全て jp 本文に実在)、繁体字 (なし)、図種 (登録内)、派生フィールド (記法除去版と一致)、pair 配置、attempt 2 の medium 2 件の解消。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1: §9 出題枠句「適切とされる / 名前としては…挙がる」の常用、5 考点 × 三語) |
| LOW | **4** (建议修 1: L1 / 記録のみ 3: L2, L3, L4) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。事実面は全 9 用語・考点 18 件・20 題で正答と一致し HIGH は 0。不合格理由は文体規則 §9 の常用違反 (M1) のみで、修正は句の削除・言い換えで済む**措辞級** → PLAN §0-2 / §0-7 に従い B3 補丁 (M1 5 箇所 × 三語、併せて L1 推奨) → 該当用語の Rule A 復審。§0-3 の停止条件 (HIGH 残存) には当たらない (attempt 回数の扱いは呼出し元の判断)。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u05
✓ technology-23-63-u05 unit: 0 issues (data/ip/textbook/units/technology-23-63-u05.json), 5 zh-term warning(s)
  warn  zh-term  overview_rows[7].one_line_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[6](クリアスクリーン).points[0].text_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[7](セキュリティケーブル).one_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[7](セキュリティケーブル).detail_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[8](遠隔バックアップ).points[1].text_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u05
✓ technology-23-63-u05 parity: 35 locations, 0 diff
EXIT=0
```

## §再審 (B3 補丁後、同 auditor・補丁の書き手とは別 agent)

- **対象**: 補丁 21 件 (`evidence/phase5/stage_07_ui/phase3/batch/patches/technology-23-63-u05.json`、`textbook-v2-patch.mjs --list` で p01〜p21 全件 active・base `6f13b80379db…`) を適用して再 merge した単元 (作業ツリー、sha256 先頭 `c15d8ee098ed1c98`、HEAD `d2cac29`)。再審範囲は補丁を当てたフィールドだけ: `terms[0].points[0]` / `terms[3].points[1]` / `terms[4].points[0]` / `terms[5].points[1]` / `terms[6].points[0]` (jp/zh/en、M1 p01〜p15) と `terms[1].detail_zh/en`・`terms[8].detail_zh/en` (L1 p16〜p21)。補丁文面は §3 の修正案と一字一致。
- **M1 解消**: 単元全体で `適切とされ / とされる / 挙が / 問われ / is considered / 被视为 / the answer / Asked to` は **0 件** (grep)。§9 の残りの hit は「重要」(一般語)・"example" で、いずれも偽陽性。
- **事実** (引用題の正答と再照合):
  - `terms[0].points[0]`: 警備員・カメラで入退室確認と室内作業監視 (2019r01a-q067 正答ア) → 一致。
  - `terms[3].points[1]`: 共連れ防止策 = アンチパスバック、コールバック・SSO は別 (2022r04-q074 正答ア) → 一致。「代表」として述べ、唯一の策とはしていないので、正答がサークル型ゲートとなる 2021r03-q058 とも矛盾しない (旧 en "the answer is" の断定は除去済)。
  - `terms[4].points[0]`: 共連れの物理的防止例 = サークル型セキュリティゲート (2021r03-q058 正答ア、誤答 = ラック施錠・入室証着用・入退室管理簿) → 一致。「例にある」で過度の一般化なし。
  - `terms[5].points[1]`: 重要書類・媒体を利用時以外は施錠棚 = 適切 (2010h22a-q078 記述 b、正答エ = b, c, d に含まれる) → 一致。
  - `terms[6].points[0]`: 終日ロックせず操作可能 = 不適切 (同題 記述 a、正答に含まれない) → 一致。
  - L1 補丁は原語併記の追加だけで、主張は変わっていない。
- **三語**: zh・en は jp と同じ事実で、欠落・追加はない。`[[jp:]]` 原語は 16 種すべて jp 本文に実在する (新規: 人的対策 / 技術的対策 / コールバック / シングルサインオン / ランサムウェア)。派生フィールド (`explanation_*` ほか) は記法除去版と一致し、不一致 0。
- **D-198 / D-200**: 12 字照合は JP 117 本 × topic 全 217 題で 0 件。補丁した考点は 1〜2 文・41〜67 字で、単元内すべての考点が ≤3 個 / ≤2 文 / ≤74 字。
- **機械ゲート**:
```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u05
✓ technology-23-63-u05 unit: 0 issues (data/ip/textbook/units/technology-23-63-u05.json), 5 zh-term warning(s)
  warn  zh-term  overview_rows[7].one_line_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[6](クリアスクリーン).points[0].text_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[7](セキュリティケーブル).one_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[7](セキュリティケーブル).detail_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[8](遠隔バックアップ).points[1].text_zh  PC → PC（个人计算机） not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u05
✓ technology-23-63-u05 parity: 35 locations, 0 diff
EXIT=0
```
- **再審判定**: **PASS** (D-199: HIGH 0 / MEDIUM 0)。未修の LOW は L2・L3・L4 (記録のみ) と範囲外観察 O1・O2 で、いずれもバッチ証拠の「未修 LOW」表へ回す。
