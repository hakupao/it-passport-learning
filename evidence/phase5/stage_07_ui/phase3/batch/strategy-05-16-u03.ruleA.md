# Rule A 全数抽検 — strategy-05-16-u03 (電子決済とデータ交換の基盤)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S150 b55)、repo HEAD `1f4b6d5c` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b55-u03-a1` merge 結果、sha256 先頭 `8deb1b955e35217d`)。
- **対象**: `data/ip/textbook/units/strategy-05-16-u03.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (EDI / EFT / キャッシュレス決済 / 電子マネー / インターネットバンキング / アカウントアグリゲーション) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 / D-209 / D-210、`docs/templates/ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `.planning/v2/strategy-05-16-u03/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・(9) 記法を引用題に当てると誤答肢を選ぶ / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig / quiz` と単元レベル全フィールドを三語とも読んだ (派生 `definition_* / explanation_* / memory_hook_* / summary.*` は本体の記法除去版; one → definition 不一致 0 をスクリプトで確認)。
2. **考点 × 引用題** (考点 7 件 = exam 5 + mix 2、引用 qid 延べ 6 = 異なり 6 題、全て topic `strategy-05-16`): 題文は translations の `stem_jp_clean` (無い 2014h26a-q012 は raw stem、OCR 損傷なし) で再読。
   - 2018h30h-q022 (正答ウ EDI; 受発注や決済などの業務で企業間データ交換) / 2020r02o-q027 (正答ア EDI; 書式・通信手順の統一) → `terms[0].points[0]` と一致。ただし q022 の「決済」が「請求」に置き換わっている → L1。
   - 2009h21h-q018 (正答イ デビットカード; 手持ちのキャッシュカードで口座から即時引落し; 誤答 ETC カード・プリペイドカード・ポイントカード) → `terms[1].points[0]` (デビット決済は EFT の一種) は事実として標準 (EFT-POS) で誤答肢を支持しないが、題が問う点そのものではない (journal r2 LOW の継続、L4)。
   - 2014h26a-q012 (正答イ 購入時に預貯金口座から即時引落し; 誤答 = 使い切り前払い・後払い・補充型前払い) → `terms[2].points[0]` 一致。
   - 2009h21h-q021 (正答エ ⑤ = カード会社 → 利用者の利用代金の請求) → `terms[2].points[1]` (カード会社が加盟店へ立替払い → 後日利用者に請求・回収) 一致。誤答ア (加盟店 → カード会社の売上代金の請求)・イ (カード提示)・ウ (利用者の支払) を支持しない。
   - 2024r06-q013 (正答エ 名寄せ; 誤答ア アカウントアグリゲーション) → `terms[5].points[0]` は名寄せ (金融機関が顧客単位に束ねて管理) と AA (利用者が自分の資産を見渡すサービス) を両側とも正の定義で対比 (D-209 の免除)。考点自体は正しい。**ただし `terms[5].hook_*` を本題の場面に当てると誤答アを選ぶ → M1** (§3)。
3. **quiz / challenge_questions** (quiz 計 8 枠、challenge 5 題 = 全て本文で引用済み、未引用 0): 本文と矛盾なし。電子マネーの quiz 2 題 (q012 / q018) は誤答に前払い型 (プリペイド) を含むが、`terms[3].points[0]` が前払い型の残高 vs デビットの口座引落しを両側正の定義で述べ、解ける。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元 JP 文字列 91 本 (派生除く) × topic 内 29 題の `stem_jp_clean` + 選択肢、12 字窓 (句読点・記号・空白・記法除去)。
   - カタカナ 4 字以上・英数を □ 遮蔽 (実字 6 未満の窓除外): **hit 0 / near (編集距離 ≤2) 0**。
   - 遮蔽なし: **hit 8 / near 12、全て見出し語「アカウントアグリゲーション」の連なり** (`goals_jp[2]`, `key_points_jp[4]`, `terms[5].one_jp`, `terms[5].points[0].text_jp` ↔ 2024r06-q013 の選択肢ア) → 用語名は表現ではなく偽陽性。
   - 目視 (カタカナの多い文: `terms[5].one_jp` / `points[0]` / `goals_jp[2]` / `terms[2].detail_jp`): 名寄せの説明「顧客単位に束ね、一元的に管理する」は q013 題文の手続の説明 (顧客ごとに取りまとめて一元管理) に近いが、12 字一致なし、題の手掛かりの列挙 (氏名・生年月日・電話番号・住所) や「預金の総額を正確に把握」は使っていない → 標準的な定義の一般表現。
   - (iii) option tracing: `terms[2].detail_jp` + `terms[2].fig` の 前払い / 即時払い / 後払い 3 分類は q012 の選択肢の区分 (前払い使い切り / 即時引落し / 後払い / 前払い補充) に近く、順序も先頭 3 肢と同じ。しかしこれは経済産業省 (産業構造審議会 2019 資料・キャッシュレス・ビジョン系) と全銀協/J-FLEC 教材の標準分類 (前払い・即時払い・後払い、この順) で、選択肢の語句 (使い切り型・繰り返し補充・提示によって) は再現していない。分類問題の正しい内容を見出し語の一般的な区分として述べたもの (D-209) → (iii) に当たらない (L5 として記録)。`terms[2].points[1]` (クレジットの立替・請求・回収) は q021 の図の ④⑤⑥ と重なるが、番号・選択肢の語句 (売上票・利用代金明細書) を使わない三者間取引の一般表現 → 写しではない。validate の `warn choice-echo` は出力 0。
5. **D-195**: one = 1 文 × 6 (太字あり)、detail 2〜3 文、図 = EDI flow steps 4・キャッシュレス tree static (登録 6 種内; 電子マネー / IB / AA は図なし)。比喩: キャッシュレス は空 (D-203 (b) で可)、IB は hook 無し (validate 可、観察 O2)。§9 禁止句 grep: jp ヒット = `terms[0].hook_jp`「と覚える」1 件 (+ 派生 2) と `terms[3].points[0]`「引き落と**される**」(偽陽性) のみ。「と覚える」は 5 フック中 1 件で前例どおり記録なし。zh `key_points_zh[3]`「必须」は jp「欠かせない」の通常の訳、en の exam ヒットは全て "example" 内 → 偽陽性。`overview.freq_badge`「標準」。
6. **D-200**: 考点数 1/2/2/1/0/1 (≤3 ✓)、JP 文数 1〜2、字数 41〜93 (≤100 ✓、最大 `terms[0].points[0]` 93 字)。**framing 件数** (validateV2 `POINT_FRAMING` 相当): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203**: 書き方 7 (欄同士の照合) → 不整合は M1 (hook vs 考点の区別軸) と L6 (電子マネー one vs detail、軽微)。書き方 8 (対比の出現欄) → L3。書き方 9 (限定条件) → §2 表、落ち 0 (L1 は置き換えだが「など」保持で範囲は閉じない)。
8. **三語**: zh / en が jp と同じ事実 (追加・欠落なし)、図ラベル・caption・pairs セルの三語一致、`[[jp:]]` 原語 10 種 (電子資金移動 / デビットカード / キャッシュレス決済 / 即時払い / クレジットカード / 加盟店 / 電子マネー / インターネットバンキング / アカウントアグリゲーション / 名寄せ) が jp 本文に実在 (全 ok)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` または見出し語自体 (EDI / EFT) あり、zh 訳語は `zh_terms.json` (EDI（电子数据交换）/ EFT（电子资金转移）/ 无现金支付 / 电子货币 / 网上银行 / 账户聚合 / 一次性口令 / IC 卡) と一致。例外: `terms[2].detail_zh` の QR コード = 「二维码」(表は「QR 码」、unit 表に無いので validate は見ない) → L2。
9. **D-205 / D-210 / 名指しの規格**: 単元は規格・法令を名指ししない (ISO 20022・全銀 EDI (ZEDI)・EDI の 4 階層の規約 [情報伝達・情報表現・業務運用・取引基本]・資金決済法・割賦販売法・銀行法の電子決済等代行業、いずれも不出現)。EDI の「標準形式」「データの形式や伝送の手順を事前に取り決め」は JIPDEC の定義 (異なる企業間で取引のためのデータを通信回線経由でコンピュータ間交換、取決めは広く合意された標準的な規約; ORSJ 会報の引用経由、OCR 文面のため原文未照合) と整合。出典: キャッシュレス 3 分類 = 全銀協 / J-FLEC 教材 slide-1-3 (https://www.j-flec.go.jp/links/zenginkyo/fileadmin/res/education/material/money-jr-highschool/slide/slide-1-3.pdf) と経済産業省 産業構造審議会資料 (2019-02) の整理; EDI 定義 = ORSJ 会報 Vol.38 No.6 p.286 (https://orsj.org/wp-content/or-archives50/pdf/bul/Vol.38_06_286.pdf)。→ D-205 の版・「例えば」を要する構成要素の数え上げなし。閉じた列挙は「3 つがある」(前払い / 即時払い / 後払い) のみで、これは版のある文書の構成要素ではなく標準分類、q012 の 4 肢はすべてこの 3 区分に入り落ちなし (既知失敗型 (10) 非該当)。D-210: 2009h21h-q018 (キャッシュカード = J-Debit 時代の書き方) は本文の主張 (支払いと同時に口座から引落し) と矛盾せず、2009h21h-q021 の三者間フローも後の割賦販売法改正 (2016/2018 加盟店管理) と矛盾しない簡略モデル → 版の明記は不要。
10. **前回指摘の解消確認** (journal `b55-u03-a1` result 行): jp-review r1 MEDIUM (電子マネーの後払い型 mix 考点が one・総表・比喩の範囲と食い違う) → 当該考点が削除され (points 8→7)、電子マネーは前払い型を「代表的な」型として扱う形に統一、**解消・回帰なし** (残る軽微なずれは L6)。loc-review r1 MEDIUM (zh「加盟店」= フランチャイズ店の日式借词) → `terms[2].points[1].text_zh`「特约商户（[[jp:加盟店]]，即可以刷卡的商家）」、en も "merchant" に、**解消・回帰なし**。r1 LOW の pairs[0].rows[2] (事前に決めておくこと) は行ごと削除、hook_zh/en のチャージ明示・後付「日后合并收取」・`overview_cols_zh[0]`「主要流转对象」も反映済み。
11. **機械ゲート**: §6。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | EDI | OK — exam 1 / 2 題: 取引情報を取引先企業とネットワーク経由で電子交換、形式・伝送手順を事前に取り決め (2018h30h-q022 正答ウ / 2020r02o-q027 正答ア; 誤答 BtoC・CDN・SNS / EIP・ERP・ETC を支持しない)。限定条件: q027「企業間」「書式や通信手順」保持、q022「受発注や決済など」は「受発注や請求など」に置換 (「など」は保持) → L1。flow steps 4 (作成→変換→送信→自動取込) は one・detail と一致 | OK (§9 反復は L7) | OK | L1, L7 |
| 2 | EFT | OK — exam 1 / 1 題 + mix 1: デビット決済も EFT の一種 (2009h21h-q018 正答イ デビットカード; 分類は標準、題の問う点は「口座から即時引落しのカード」) / mix: EDI = 取引データ・EFT = 資金そのもの (pairs[0].rows[0] と一致) | OK | OK | L3, L4 |
| 3 | キャッシュレス決済 | OK — exam 2 / 2 題: デビット = 即時払い、使用時点で口座残高から差し引き (2014h26a-q012 正答イ) / クレジット = カード会社が加盟店へ立替、後日利用者に請求・回収 (2009h21h-q021 正答エ ⑤)。tree (前払い→電子マネー / 即時→デビット / 後払い→クレジット) は detail・goals と一致、METI / 全銀協の標準分類と一致 | OK (analogy 空は可) | QR 码 L2 | L2, L3, L5 |
| 4 | 電子マネー | OK — mix 1: 前払い型は残高から減る / デビットは支払時点で口座から引落し (q012・q018 の誤答 前払い/プリペイド と正答の区別に沿う、両側正の定義)。detail「代表的なのは、例えば交通系 IC カードのような前払い型」は「例えば」付き | OK | OK | L3, L6 |
| 5 | インターネットバンキング | OK — 考点 0 (freq 0、引用題なし)。detail「振込指示の後の資金移動は EFT の仕組み」・ワンタイムパスワード (他 topic 2018h30a-q083 の正答とも整合) 正しい。pairs[1] (一つの銀行 / 振込などの取引 / その銀行) は AA 側と正しく対比 | OK (hook 無し: O2) | OK | なし |
| 6 | アカウントアグリゲーション | OK — exam 1 / 1 題: 名寄せ (金融機関が顧客単位に束ねて一元管理) と AA (利用者が自分の資産を見渡すサービス) は目的が異なる (2024r06-q013 正答エ 名寄せ、誤答ア AA; 両側正の定義で D-209 免除)。**hook が区別軸 (主体・目的) を欠き、q013 の場面 (顧客自身の複数口座を寄せ集める) に当てると誤答ア → M1** | OK | 名寄せ訳語 L8 | **M1**, L8 |

**単元レベル**: goals 3・overview_cols 2 (主に動くもの / 主な使い手)・overview_rows 6・pairs 2 組 (EDI / EFT 2 行 key 1、IB / AA 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge 5 題 (全て本文引用済み、矛盾なし)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 8 (うち 建議修 2)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (B3 補丁、各欄内の文字列置換) |
|---|---|---|---|---|
| M1 | **MEDIUM** (既知失敗型 (9); 前例 b22 u08 / b26 u02) | `terms[5].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `terms[5].memory_hook_jp/zh/en`, `summary.memory_hooks_jp/zh/en[4]`) | 記法の手がかりは「aggregate = 寄せ集める、account = 口座 → 寄せ集めるのは利用者自身の口座の情報」。引用題 2024r06-q013 の場面は「金融機関が、同じ顧客が持つ複数の口座を手掛かりで集約し顧客ごとに取りまとめる」で、"顧客自身の複数口座を寄せ集める" そのもの。記法を当てると誤答ア (AA) を選ぶ。区別に要るのは「誰のために・誰が見るか」(利用者本人が自分で見渡す vs 金融機関が自社の管理のため) で、記法の結び「利用者自身の口座の情報」は q013 にもそのまま当てはまり区別にならない。考点 points[0] が正しく区別していても、記法の誤誘導は免除されない (前例)。after は q013 と 12 字連続一致なし (カタカナ連続は見出し語のみ) | jp before: `aggregate は「寄せ集める」、account は「口座」。寄せ集めるのは利用者自身の口座の情報。` → after: `aggregate は「寄せ集める」、account は「口座」。寄せ集めた口座の情報を見るのは利用者本人で、自分のお金の全体を見渡すために使う。` / zh before: `aggregate 是“汇集”，account 是“账户”。汇集的是用户自己的账户信息。` → after: `aggregate 是“汇集”，account 是“账户”。查看汇集来的账户信息的是用户本人，用来纵览自己资金的全貌。` / en before: `"Aggregate" means to gather together and "account" is a bank account; what gets gathered is information about the user's own accounts.` → after: `"Aggregate" means to gather together and "account" is a bank account; the one who looks at the gathered account information is the user, to see the whole picture of their own money.` |
| L1 | LOW **建議修** | `terms[0].points[0].text_jp` / `text_zh` / `text_en` | 引用題 2018h30h-q022 の業務範囲「受発注や決済など」を「受発注や請求など」に置換。「など」は保持で範囲は閉じず、q022 の選択肢に EFT は無いので誤答誘導なし。ただし同単元の EDI = 取引データ / EFT = 資金 の対比と並ぶと「決済は EFT の領分で EDI ではない」と読まれうる (決済の情報も EDI で交換される: 金融 EDI)。引用題の語を戻す。after の q022 との共通連続は「受発注や決済などの」9 字 (閾値 12 未満) で写しにならない | jp before: `受発注や請求などの取引の情報を` → after: `受発注や決済などの取引の情報を` / zh before: `订货、接单、开票等交易信息` → after: `订货、接单、结算等交易信息` / en before: `transaction information such as orders and invoices` → after: `transaction information such as orders and settlement details` |
| L2 | LOW **建議修** | `terms[2].detail_zh` | 「智能手机上的二维码」: `zh_terms.json` の QRコード = 「QR 码」と食い違い (unit 表に無いため validate 不検出)。jp は「スマートフォンの QR コード」 | before: `智能手机上的二维码` → after: `智能手机上的 QR 码` |
| L3 | LOW | `terms[1].points[0]`, `terms[2].detail_*`, `terms[2].fig` (now 枝), `terms[2].points[0]`, `terms[3].points[0]`, `key_points_*[2]` | 書き方 8: 「デビット = 支払と同時に口座から / 前払い = 先に入れた残高から」の対比・同内容が 6 欄に出る (mix 考点 1 + 分類図・detail の構造 + exam 考点 2)。journal r2 LOW の継続 | 記録のみ (各考点が別の引用題に紐づき、削ると題の支えが消える) |
| L4 | LOW | `terms[1].points[0].text_*` | 2009h21h-q018 が問うのは「手持ちのキャッシュカードで口座から即時引落しできるカード」で、考点の固有情報「EFT の一種」はその題の判別点ではない。題の前提「キャッシュカードで」(J-Debit) も述べない。事実は正しく誤答肢 (プリペイドカード等) を支持しない | 記録のみ |
| L5 | LOW | `terms[2].detail_jp/zh/en` 2 文目、`terms[2].fig` | 3 分類 (前払い / 即時払い / 後払い) の並びが 2014h26a-q012 の選択肢の区分・先頭 3 肢の順と重なる。標準分類 (METI / 全銀協) で選択肢の語句は再現せず、D-209 (分類問題の正しい内容を一般的な区分として述べる) により (iii) に当たらない | 記録のみ |
| L6 | LOW | `terms[3].one_*` / `terms[3].detail_*` | one は「価値を電子データとして記録して支払う」(残高型の定義)、detail「代表的なのは前払い型」は他の型 (後払い型) の存在をほのめかす。journal r2 LOW の継続、前回 MEDIUM の回帰ではない (後払い型の考点は無く、分類図・総表・比喩とも前払い型で一貫) | 記録のみ |
| L7 | LOW | `terms[0].one_jp` / `detail_jp` / `points[0].text_jp` / `key_points_jp[0]`、`terms[0].analogy_jp` | §9: 取り決めた形式で電子交換・打ち直し不要の同内容が 4 欄に出る。analogy (同じ型の申込用紙を機械に読ませる) は定義の言い換えに近い (D-203 §6)。journal r0/r2 LOW の継続 | 記録のみ |
| L8 | LOW | `terms[5].points[0].text_zh` / `text_en` | 名寄せの訳「名下归集」「Name-based consolidation」は定訳でなく造語寄り。`[[jp:名寄せ]]` 併記と説明で意味は通じる。loc-review r2 LOW の継続 (loc PASS で受容済み) | 記録のみ (任意: zh「客户账户归并」/ en "customer account consolidation") |

**対比の出現欄 (書き方 8 の列挙)**: ① EDI = 取引データ / EFT = 資金: `pairs[0].rows[0]`、`terms[1].points[1]` (mix)、`goals_*[0]` (予告)、overview 総表の列 (構造) → 2 箇所 + 構造で許容。② デビット / 前払い: L3。③ IB = 一つの銀行・取引 / AA = 複数機関・確認: `pairs[1].rows[0..2]`、`goals_*[2]` (予告) のみ → 許容。④ 名寄せ / AA: `terms[5].points[0]` のみ → 許容。

**範囲外の観察**:
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)、事実は正しい。
- O2 `terms[4]` (インターネットバンキング) は hook 欄なし・考点 0・図なし・quiz 0。freq 0 で引用題がなく、validate 0 issues。比喩・pairs[1] で他語と区別できる。
- O3 他 topic の関連題 (2023r05-q022 資金決済法の前払式支払手段: 誤答に口座振込サービス / 2018h30a-q083 ワンタイムパスワード / 2026r08-q071 IB のリスクベース認証) と本文の矛盾なし。

確認済みで問題なし: 限定条件 (考点 7 件、落ち 0)、§9 禁止句 (定型締め句 0、「と覚える」1 件)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (≤2 文・≤93 字)、copy (遮蔽あり 0 / 遮蔽なしは見出し語のみ)、`[[jp:]]` 原語 10 種実在、zh 訳語表 (L2 以外一致)、図種 (flow steps / tree static = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前回 MEDIUM 2 件の解消・回帰なし、D-205 / D-210 の該当なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **8** (建議修 2: L1・L2 / 記録のみ 6: L3〜L8) |

## 5. 判定

**FAIL (補丁待ち)** (D-199: MEDIUM 1)。考点 7 件・引用 6 題の主張は正答と一致し誤答肢を支持しないが、`terms[5].hook_*` (M1) を引用題 2024r06-q013 の場面に当てると誤答肢 (アカウントアグリゲーション) を選ぶ。M1 を §3 の before→after で B3 補丁すれば PASS 相当 (他に HIGH / MEDIUM なし)。L1・L2 は同じ補丁での修正を推奨、L3〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit strategy-05-16-u03
✓ strategy-05-16-u03 unit: 0 issues (data/ip/textbook/units/strategy-05-16-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit strategy-05-16-u03
✓ strategy-05-16-u03 parity: 26 locations, 0 diff
EXIT=0
```

