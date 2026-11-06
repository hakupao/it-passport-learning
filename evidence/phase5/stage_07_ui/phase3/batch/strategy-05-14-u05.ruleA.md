# Rule A 全数抽検 — strategy-05-14-u05 (オンライン行政手続・番号制度・防災情報)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-06 (S148/S149 第 33 批 b33)、repo HEAD `9eac988c` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b33-u05-a3` merge 結果、sha256 先頭 `9d75c577d9fbeb3d`)。final run `b33-u05-a3` (a2 jp.r1 + jp-review #2 を種、jp-review #1 PASS low 7 / loc-review #1 PASS low 8)。
- **対象**: `data/ip/textbook/units/strategy-05-14-u05.json` (textbook-unit-v2)、用語 **8 / 8 = 全数** (電子申請 / 電子調達 / 電子入札 / マイナンバー / マイナンバーカード / マイナポータル / 緊急速報 / Jアラート) + 単元レベル (goals / overview_rows 8 / pairs 3 / key_points 4 / summary / challenge_questions 3)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/strategy-05-14-u05/v1-original.json` (用語 8 語・`term_zh`・`term_en` は manifest と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 8 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ (派生フィールド除く JP 131 本 / zh 139 / en 139)。派生 `definition_jp` は one_jp の記法除去版と一致 (zh/en は `[[jp:X]]` → X の展開形で一致)。
2. **考点 × 引用題 (考点 8 件 = exam 3 + mix 5、qid 付き 3 件 = 異なり 3 題、全題 topic `strategy-05-14`)**: `questions.json` + `translations/<exam>.json` の stem_jp_clean で題文・選択肢・`correct_answer` を再読。
3. **quiz / challenge_questions** (quiz 計 4 枠、challenge 3 題 = 引用 3 題と同一、未引用題なし)。
4. **D-198 写し**: validate copy guard = 0。独立照合: JP 131 本を topic 内全 39 題の題文 (stem_jp_clean) + 選択肢と 12 字連続照合 (記号・空白除去) を (a) カタカナ 4 字以上・英数を □ 遮蔽 (実字 6 未満の窓除外) と (b) 遮蔽なしの両方で実施 → **0 / 0 件**。近似照合 (12 字窓、1〜2 字置換) → **0 件**。カタカナ多めの文 (マイナンバー / マイナポータル / Jアラート / オンラインサービス を含む one・points) を目視 → 題の言い回しの流用なし。
5. **D-208 既知失敗型 (1)〜(10)**: §2 の表と §3 に個別に記載。
6. **D-195**: one = 1 文 × 8 (太字あり)、detail 2〜3 文 (3/2/2/3/2/2/2/2)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `terms[4].points[0]`「持つかどうかは本人が選ぶ」1 件のみ (通常の動詞で選択肢の言い方ではない、偽陽性)。zh / en 相当語 (考试 / 必须 / 重要 / 记住 / 选项 / exam / must / important / remember / option / always) ヒット 0。図種: flow steps ×4 (電子申請 4 / 電子入札 4 / 緊急速報 3 / Jアラート 4)、static tree ×2 (電子調達 / マイナンバーカード)、図なし ×2 (マイナンバー / マイナポータル) → 全て登録内。pair 配置: 電子調達↔電子入札 (key 行 1)、マイナンバー↔カード (key 行 1)、緊急速報↔Jアラート (key 行 1)。
7. **D-200**: 考点数 1/1/1/2/1/1/0/1 (≤3 ✓)、各 JP 1〜2 文・53〜79 字 (≤100 ✓、最大 `terms[7].points[0]` 79 字)。**framing 件数** (`validateV2.pointFraming`、tsx で直接実行): jp 0 / zh 0 / en 0 (上限 2)。
8. **三語**: `[[jp:…]]` 原語 16 種 (電子申請 / 公的個人認証 / 電子証明書 / 住民基本台帳カード / 電子調達 / 電子入札 / マイナンバー / 個人番号 / マイナンバーカード / マイナポータル / オンラインサービス / 緊急速報 / 一斉配信 / Jアラート / 全国瞬時警報システム / 防災行政無線) が全て jp 本文に実在 (スクリプト)。one_zh / one_en 8/8 に見出し語の `[[jp:]]` あり。zh 訳語 (`zh_terms.json`): 电子申请 / 电子采购 / 电子招标 / 个人番号（My Number）/ My Number 卡 / My Number 门户 / 紧急警报 / J-Alert（全国瞬时警报系统）/ 手机 / 登录 / 服务 一致。
9. **一次確認 (D-205 / D-210)**: e-Gov 法令 API v2 `law_data/425AC0000000027` (番号法) を本日取得: revision `425AC0000000027_20261001_507AC0000000087` (2026-10-01 施行 = 現行)。第 3 条 2 項 (「社会保障制度、税制、災害対策その他の行政分野における利用の促進」)、第 7 条 1 項 (市町村長 [特別区の区長を含む] が指定し本人へ通知)、第 7 条 2 項 (漏えいして不正に用いられるおそれがあると認められるとき、請求又は職権で変更 = 唯一の変更事由)、第 9 条 1 項 (別表事務 + 準法定事務 = 令和 5 年改正で追加、3 分野以外の行政事務へ拡大)・2 項 (条例事務も番号法が根拠)。
10. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (8 / 8)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 電子申請 | OK — exam 1 / 1 題: 公的個人認証の電子証明書は 2016 年より前は住基カードに格納 (2012h24a-q030 正答ウ = 住基カード; 誤答 = 印鑑登録カード・クレジットカード・パスポート)。題は 2012 年 = マイナンバーカード導入前の版で、考点は「2016 年より前は」と版を明記 (D-210 適合)。現行 (マイナンバーカードの電子証明書) は `terms[4].one/detail` が担う。a1 指摘 (公的個人認証を唯一の手段と読める) → detail「手段の一つ」/ `fig.steps[1]`「本人確認を求める手続では…本人であることを示す情報」/ `key_points[0]`「手段の一つ」で三語とも解消 (zh「手段之一」/ en "One way") | OK | zh 画面 = L2 | L2 |
| 2 | 電子調達 | OK — mix: 電子申請 = 国民・事業者が申し出て行政が受付、電子調達 = 行政が発注者 (正しい)。a2 指摘 (範囲を物品・サービス購入に限り電子入札 ⊂ 電子調達が崩れる) → one・overview_rows[1] とも「公共工事や物品・サービスを発注する」に改まり、電子入札 one (公共工事や物品・サービスの調達で行う入札) と包含が成立。zh「公共工程、物品和服务」/ en "public works, goods, and services" も一致 | OK | OK | なし |
| 3 | 電子入札 | OK — mix: 電子調達 = 公告から契約までの全体、電子入札 = その中の入札・開札段階 (pairs[0] key 行・電子調達 tree 図の子「入札書の提出と開札」と一致)。detail の入札の定義 (複数事業者に条件を示させ契約相手を決める) 正しい | OK | OK | L6 (図の範囲) |
| 4 | マイナンバー | OK — exam 2 / 2 題: 2016 年の利用開始時点の番号法では社会保障・税・災害対策の 3 分野に限られていた (2017h29h-q024 正答エ = 入国管理分野の邦人出入国管理は不可; 版明記 = D-210 適合、除外条件 [3 分野に限る] 保持; 現行は第 9 条 1 項の準法定事務で 3 分野外へ拡大 → L1) / 原則生涯不変、変更は漏えいして不正に使われるおそれがあると認められる場合の例外 (2022r04-q016 正答エ = 自由に変更できない; 第 7 条 2 項と一致、「自由に」の限定を保持)。12 桁・住民票をもつ一人ひとり (国籍でなく住民票基準 = q016 誤答ア を支持しない)・市区町村長が指定し通知 (第 7 条 1 項) 正しい。a2 指摘 (比喩が一元管理) → analogy「窓口が書類をそれぞれ預かったまま…照らし合わせられる」= 分散管理 + 照合で三語とも解消 (zh「各自保管着…互相对照」/ en "each keep your papers, yet … match up") | OK (D-198 (iii) 判定 = L4) | OK | L1, L4, L5 |
| 5 | マイナンバーカード | OK — quiz 2022r04-q016。mix: 番号は全員に指定、カードは本人の申請で交付・取得は任意 (正しい)。表面 = 氏名・住所・顔写真など、裏面 = マイナンバー (「など」で開いた列挙)、IC チップの電子証明書で公的個人認証 (正しい)。tree 図は detail と一致 | OK | OK | なし |
| 6 | マイナポータル | OK — mix: カード = 物、ポータル = そのカードで入るオンライン窓口 (正しい)。「主に」カードでログイン (スマートフォン用電子証明書等もあるため「主に」が必要で、保持)。やり取り記録の確認・お知らせ・子育て等の電子申請 (正しい) | OK | OK | なし |
| 7 | 緊急速報 | OK — 考点なし。one / detail: 対象エリアの携帯電話へ一斉配信、事前登録不要、「例えば」気象庁の緊急地震速報・津波警報・自治体の避難情報 (正しい) | OK | zh 对应终端 (記録) | L7 |
| 8 | Jアラート | OK — mix: 緊急速報 = 携帯電話への一斉配信の仕組み、Jアラート = 国の緊急情報を自治体の設備「など」へ送って住民へ伝える伝達システム、役割が異なる。a1 指摘 (経路で排他的に分ける) → goals_jp[2] は「役割」、`pairs[2].rows[1]` で「緊急速報は Jアラートの情報を携帯電話へ届ける手段の一つにもなる / 伝達手段の一つとして緊急速報も使う」と関係を明記、one「さまざまな伝達手段を通じて」→ 三語とも解消 (zh「也是…手段之一」/ en "Also one of the ways …") | OK | en「など」落ち (記録) | L3 |

**単元レベル**: goals 3 (a1 指摘の「3 つがあり」型の閉じた分類は三語とも消え、goals_jp[0]「電子申請 などの」/ [1]「関わる語を…どれを指すかで区別」= 閉じた列挙なし)、overview_rows 8 行は各 one と一致、pairs 3 組 (計 6 行) は考点・detail と一致、key_points 4 は detail と一致、summary (記法除去版と一致)、challenge 3 題 = 引用 3 題で本文と矛盾なし。事実誤りなし、三語一致。

**D-208 既知失敗型**: (1) option tracing — validate の `warn choice-echo` 0 行。q024 / q016 / q030 とも考点は誤答肢の場面を再演しない (L4 に 3 分野の判定)。(2) 限定条件落ち — 「2016 年より前は」「2016 年の利用開始時点の」「原則として」「例外として」保持、0。(3) 別名を別物として教える — マイナンバー / 個人番号 は hook で「愛称 / 正式名」と同一物と明示、Jアラート / 全国瞬時警報システム も同格、0。(4) 比喩・図の範囲 — マイナンバー比喩は分散管理に修正済み、マイナンバーカード比喩「電子の鍵」は detail と整合、電子入札図は L6、緊急速報比喩は L7。(5) zh / en の回帰 — a1 / a2 の 4 指摘は三語とも解消 (上表)。(6) zh / en の語が誤答肢寄り — 該当なし (en "resident record" は q016 誤答ア の国籍基準を支持しない)。(7) D-210 — q030 / q024 とも版明記、除外条件保持 (現行の追加は L1)。(8) 他見出し語の語幹を比喩の鍵語に使う — マイナポータル analogy「マイページ」は見出し語ではない、0。(9) フックを引用題の場面に当てて誤答 — マイナンバー hook (愛称 / 正式名) と Jアラート hook (全国・瞬時・警報) は q024 / q016 の判断に影響せず、0。(10) 法的カテゴリの閉じた列挙 — 3 分野は版付き、カード券面は「など」、Jアラート情報は「など」、0。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 7 (うち 建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** (D-210 B3 追加) | `terms[3](マイナンバー).detail_jp / detail_zh / detail_en` 3 文目 | 考点は 2016 年版の「3 分野に限られていた」を正しく版付きで述べるが、本文のどこにも現行 (令和 5 年改正で第 9 条 1 項に準法定事務が加わり 3 分野以外の行政事務にも拡大、e-Gov 現行版で一次確認) が無い。S138 §6 / D-210 の分工どおり Rule A が detail に追加 (文数 3 のまま、1 文内の置換) | jp before「マイナンバーを使える事務は番号法 (行政手続における特定の個人を識別するための番号の利用等に関する法律) で定められている。」→ after「マイナンバーを使える事務は番号法 (行政手続における特定の個人を識別するための番号の利用等に関する法律) で定められ、令和 5 年 (2023 年) の改正で社会保障・税・災害対策以外の行政事務にも広がった。」/ zh before「可以使用个人番号的事务由番号法（关于在行政手续中为识别特定个人而使用号码等的法律）规定。」→ after「可以使用个人番号的事务由番号法（关于在行政手续中为识别特定个人而使用号码等的法律）规定，令和 5 年（2023 年）的修订又把范围扩大到社会保障、税务和灾害对策以外的行政事务。」/ en before "The tasks for which My Number may be used are set out in the My Number Act (the Act on the Use of Numbers to Identify a Specific Individual in Administrative Procedures)." → after "The tasks for which My Number may be used are set out in the My Number Act (the Act on the Use of Numbers to Identify a Specific Individual in Administrative Procedures), and a Reiwa 5 (2023) amendment extended them beyond social security, taxation, and disaster response to other administrative tasks." |
| L2 | LOW **建議修** | `terms[0](電子申請).fig.data.nodes[0].label.zh`、`terms[0].fig.steps[0].caption_zh` | zh「画面」は日本語の借用で、中国語の UI 用語 (页面 / 界面) として不自然 (loc-review #1 low、未反映)。jp / en は問題なし | label.zh before「在画面上制作申请数据」→ after「在页面上填写申请数据」/ caption_zh before「不用纸质申请书，而是在画面上输入申请内容来制作数据。」→ after「不用纸质申请书，而是在页面上输入申请内容来生成数据。」 |
| L3 | LOW | `terms[7](Jアラート).fig.data.nodes[1].label.*`、`fig.steps[1].caption_*`; en は `label.en` / `caption_en` で「など」落ち | 運用上は全国の市町村などの受信機へ送られ対象地域の受信機が起動するため、「対象地域の市町村などへ」は送信先を絞るように読める (jp-review low)。en "to municipalities in the target area" は jp の「など」を落とす (loc-review low)。誤答肢を支える内容ではない | 記録のみ |
| L4 | LOW | `terms[3].points[0].text_jp/zh/en` | D-198 (iii) 判定: 2017h29h-q024 (適切でないもの 1 つ) の非正答 3 肢の分野名の組 {社会保障・税・災害対策} と重なる。ただし並びは法令・政府説明の定型順 (題の並びは 災害対策→社会保障→税)、各肢の具体事務 (被災者台帳・雇用保険・税務当局の内部事務) は使わず、正答肢の場面も再演しない。第 3 条 2 項自体が同じ 3 語を並べる標準表現で、版付きの正の定義 → (iii) に当たらず | 記録のみ |
| L5 | LOW | `terms[3].detail_jp` 3 文目 / `key_points_jp[1]` | 「使える事務は番号法で定められている」は条例事務 (第 9 条 2 項) を含むかが曖昧 (jp-review low)。一次確認で条例事務の根拠も番号法 9 条 2 項にあり、文は事実として正しい | 記録のみ (L1 適用後も維持で可) |
| L6 | LOW | `terms[2](電子入札).fig.data.nodes[0] / nodes[3]` | 図は「入札の公告を確認」「落札者の決定」まで描き、pairs[0].rows[0] / mix 考点の「入札書の提出と開札の段階」より前後に広い。入札手続の文脈表示で、包含関係 (電子入札 ⊂ 電子調達) は崩れない | 記録のみ |
| L7 | LOW | `terms[6](緊急速報).fig.steps[1].caption_jp`「届け先のエリアが決まる」、`terms[6].analogy_jp`「その場にいる全員の手元で」、`terms[6].detail_zh / fig.steps[2].caption_zh`「对应终端」、`key_points_jp[0] / [3]` の detail 言い直し (§9)、`terms[7].hook_jp`「J は Japan の J」(公式定義未確認)、`terms[0].detail_en` "Public Individual Authentication" (定訳は Public Certification Service for Individuals)、zh 住民票 未説明 | jp-review / loc-review の low の残り。いずれも誤学習・誤答に至らない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 電子調達 = 全体 / 電子入札 = 一段階: `pairs[0].rows[0]`、`terms[2].points[0]`、電子調達 tree 図 (構造) → 許容 (2 箇所 + 図)。② 番号 / カード: `pairs[1].rows[0..2]`、`terms[4].points[0]`、overview_rows[3..4] extra (総表の構造) → 許容。③ カード / ポータル: `terms[5].points[0]` のみ (pair なし) → 許容。④ 緊急速報 / Jアラート: `pairs[2].rows[0..1]`、`terms[7].points[0]` → 許容。⑤ 電子申請 / 電子調達 (行政の立場): `terms[1].points[0]`、overview_rows[0..1] extra → 許容。`goals_*` は観点の予告で内容を繰り返さない。

確認済みで問題なし: a1 / a2 の 4 指摘 (三語とも解消、§2)、限定条件 (考点 8 件全て保持)、§9 禁止句 (偽陽性 1 のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200、D-198 写し (validate 0、独立照合 遮蔽あり 0 / 遮蔽なし 0 / 近似 0)、`[[jp:]]` 原語 16 種実在、one_zh / one_en 見出し語 8/8、zh 訳語表一致、図種登録内、用語・`term_zh`・`term_en` の不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **7** (建議修 2: L1・L2 / 記録のみ 5: L3〜L7) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 8 用語・考点 8 件 (qid 付き 3 件)・引用 3 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件・版 (D-210) も保持。a1 (goals の 3 種並列言い切り / 緊急速報と Jアラートの経路排他 / 公的個人認証の唯一手段化) と a2 (マイナンバー比喩の一元管理 / 電子調達の範囲) の指摘は jp・zh・en とも解消し回帰なし。L1 (現行番号法の追加、e-Gov 一次確認済み) と L2 (zh 画面) は補丁 (B3) で修正推奨。

## 6. 機械ゲート出力

```
$ node scripts/textbook-v2-validate.mjs --unit strategy-05-14-u05
✓ strategy-05-14-u05 unit: 0 issues (data/ip/textbook/units/strategy-05-14-u05.json)
EXIT 0
$ node scripts/textbook-v2-parity.mjs --unit strategy-05-14-u05
✓ strategy-05-14-u05 parity: 38 locations, 0 diff
EXIT 0
```
