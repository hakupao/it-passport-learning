# Rule A 全数抽検 — technology-22-60-u06 (モバイル通信の高度化と端末技術)

- **Auditor**: `oh-my-claudecode:verifier` (opus 系) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。補丁案の試験は scratchpad の複製で実施。
- **Date**: 2026-11-02 (S141 第 11 批 b11)、repo HEAD `949ae5d` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b11-u06-a2` merge 結果、sha256 先頭 `66b42284abbeb847`)。
- **対象**: `data/ip/textbook/units/technology-22-60-u06.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (MIMO / キャリアアグリゲーション / テザリング / SIMカード / MNP / eSIM / テレマティクス) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197 / D-198 / D-199 / D-200、D-202 / D-203、D-204 / D-205。比較: `.planning/v2/technology-22-60-u06/v1-original.json` (用語 7 語・`term_zh`・`term_en`・`unit_summary_*` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・支持のない限定 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption・cell) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 全 12 件 = exam 6 + mix 6、うち qid 付き 10 件、引用 qid 延べ 14 件 = 異なり 9 題)**: `questions.json` から題文 (`stem_jp_clean` があれば優先)・選択肢・`correct_answer` を再読 (全題 topic `technology-22-60`)。主張が正答と一致し、誤答肢を支持せず、支持のない一般化・限定をせず、限定条件を落としていないことを 1 件ずつ確認 (§2)。計算題なし。
3. **quiz / challenge_questions** (quiz 計 7 枠 + challenge 5 題、全て本文で引用済み = 未引用 0): 2026r08-q064 / 2016h28a-q070 / 2018h30a-q083 / 2021r03-q071 / 2022r04-q080 いずれも本文で解け、矛盾なし。
4. **周辺題の矛盾確認**: キーワード (MIMO / MIME / キャリアアグリゲーション / テザリング / SIM / MNP / テレマティクス / MVNO / ハンドオーバ / スマートメータ) で全 2900 題を検索、未引用ヒット 27 題の id・topic・正答を確認。実質的に関わるのは 2017h29a-q093 (MVNO = 他事業者の移動体通信網を借りて自社ブランドで提供) と 2023r05-q098 (スマートメータ = 使用量を計測し通信で送信) で、いずれも本単元の考点と一致。他は語が誤答肢に出るだけ、または S/MIME の題で、本文と矛盾しない。
5. **D-198 写し**:
   - (a) validate の copy guard = 0 件。
   - (b) 独立 12 字窓: 単元の JP 文字列 128 本 (派生除く) × topic 全 97 題の題文 + 選択肢 485 本 (句読点・記号・空白除去)。**遮蔽あり** (カタカナ 4 字以上と英数を □) = **0 件**。**遮蔽なし** = 18 組、全て見出し語「キャリアアグリゲーション」単独の一致で偽陽性。
   - (c) **近似一致**: ① 12 字窓 × 同長窓で置換 1〜2 字 (スクリプトは全文字列 × 全選択肢を走査、Dice 0.4 以上または全体 ed 0.5 以下との合併で候補 23 組を確認)。見出し語の連なり・「スマートフォンなどの」の偽陽性を除く実質 = `terms[1].one_jp` ↔ 2018h30h-q099 題文 (語「異なる」を除いた 13 字の連なり) → **L4**、`terms[6].points[0]` → **L1**、`terms[2].points[1]` → **L2**、`terms[2].points[0]` → **L3**。② 文・節を近い題文・選択肢と比較 (半大域 ed = 短い方の長さで正規化 / bigram Dice)。較正: HIGH = ed 0.14 / Dice 0.52、建議修の前例 = ed 0.19 / 0.70、0.25 / 0.72、0.27 / 0.59、0.35 / 0.44、0.40 / 0.32、0.42 / 0.36。

     | 箇所 | 相手 | ed / Dice | 判定 |
     |---|---|---|---|
     | `terms[6].points[0]` (主部) | 2022r04-q080 題文 | 0.33 / 0.39 | 骨格が題文の語置換に近い → L1 建議修。修正後 0.76 / 0.21 |
     | `terms[2].points[1]` 1 節目 | 2016h28a-q070 誤答ア | 0.35 / 0.40 | 誤答肢の裏返し → L2 建議修。修正後 0.89 / 0.04 |
     | `terms[2].points[1]` 2 節目 | 2016h28a-q070 誤答エ | 0.45 / 0.41 | 誤答肢の裏返し → L2。修正後 0.79 / 0.24 |
     | `terms[2].points[0]` | 2016h28a-q070 正答ウ | 0.50 / 0.42 | 構文の並びが正答に近い → L3 建議修。修正後 0.64 / 0.30 |
     | `terms[1].one_jp` | 2018h30h-q099 題文 / 2026r08-q064 正答ウ | 0.56 / 0.38、0.47 / 0.44 | 定義の標準表現だが窓の連なり → L4 建議修。修正後 0.73 / 0.27、0.64 / 0.34 |
     | `terms[3].one_jp` 後半 | 2017h29h-q097 題文 | 0.47 / 0.32 | 標準定義、前例の範囲外 → L8 記録のみ |
     | `terms[2].points[2]` | 2016h28a-q070 誤答イ | 0.54 / 0.43 | 共通は「PC のウイルス対策は」のみ → 非該当 (L5 の構造として記録) |
     | `terms[0].points[0]` 後半 | 2010h22h-q058 正答ア | 0.64 / 0.49 | 共通は「電子メールで」、MIME の標準説明 → 非該当 |
     | `terms[4].points[0]` 後半 | 2021r03-q071 題文 | 0.68 / 0.31 | 非該当 |
     | `terms[2].one_jp` | 2015h27h-q058 正答イ | 0.66 / 0.43 | 非該当 |
     | `terms[6].one_jp` | 2022r04-q080 題文 | 0.73 / 0.35 | 共通は「自動車などの移動体」の語。非該当 |

     いずれも HIGH 例 (0.14 / 0.52) から遠く、D-198 (i)(ii) に該当しない。
   - (d) **目視 (カタカナの多い文)**: テザリング・キャリアアグリゲーション・テレマティクスの文を題と照合。数値・場面の流用なし (CA の表は 20 MHz の自作例、テレマティクスの 3 例は引用題に無い)。**D-198 (iii) の構造**: テザリングの考点 3 個は 2016h28a-q070 の 4 肢 (正答 1 + 誤答 3) に対応 → L5 (§3)。
6. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2〜3 文 (3/2/2/2/2/2/2)、比喩・フックが定義の言い換えでないこと (テザリングは analogy 空、他は別の像または語源)、定義前使用 (周波数帯・帯域・基地局・ルータは前提単元 u01 / u04 / u05 に既出、ハンドオーバ・MVNO・MIME・スマートメータ・プロトコルは考点内で説明)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `pairs[0].rows[1].a_jp`「効果が出る」のみ (通常の用法で偽陽性) + `freq_badge`。zh・en 相当語の grep ヒットは en の `example` 2 件で偽陽性。図の型 (flow steps ×3 / table static ×1 / flow static ×1 / 図なし ×2) は全て登録内。pair 配置 (MIMO→CA は CA の後、SIM→eSIM は eSIM の後、各組 key 行あり)。
7. **D-200 / framing**: 考点数 1/2/3/2/1/1/2 (≤3 ✓)、各 JP 1 文・29〜56 字 (≤100 ✓)。**framing 件数** (validateV2 `pointFraming` を直接実行、全考点): jp 0 / zh 0 / en 0。D-197 羅列: validate 0、テザリング detail と テレマティクス detail の 3 例は「例えば」付き。
8. **D-205**: 本単元に改正文書の構成要素の数・名称の言い切りなし (MIME は規格の名前のみ、4G・5G は世代名) → 該当なし。
9. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合: テレマティクス detail 2 文目「どのサービスも…通信で成り立つ」は 3 例全てに成立、MNP detail「SIM は新会社のものに替わる」と SIMカード one が整合、CA hook の「通信事業者ではなく」と他用語の携帯電話会社が整合、eSIM 考点「入れ物の形が違う」に「だけ」なし) → 不整合 0。書き方 8 (下記列挙) → 違反なし。書き方 9 → §2 表に記載、落ち 0。§6 → 違反なし。§9 言い直し → L1 (テレマティクス考点) / L10。
10. **三語**: zh・en が jp と同じ事実か、図ラベル・表セル・比較行・caption の一致を確認。`[[jp:…]]` 原語 18 種が jp 本文に実在 (スクリプト: 16 種完全一致、`無線LAN`・`SDカード` は JP が空白入り表記で空白無視の一致、validate warn 0)。one_zh / one_en の見出し語併記 (validate 0; MIMO / MNP / eSIM はラテン文字の見出し語で JP 形が同じ)。zh 訳語は `zh_terms.json` に一致 (载波聚合 / 网络共享 / SIM 卡 / 携号转网 / 车联网信息服务 / MVNO / 基站 / 切换 / 无线LAN / SD 卡)。validate の zh-term warn 2 件は文脈上正しい訳 → L7。
11. **機械ゲート**: §7 に出力全文。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | MIMO | OK — mix 1 / 1 題: MIMO = 無線の高速化、MIME = メールの添付等の規格 (2010h22h-q058 正答ア)。題は MIME のみ問う (L6)。one・detail (帯域を広げず増やす、4G・5G・無線 LAN)・flow 4 段階は事実どおり | OK | OK | L6 |
| 2 | キャリアアグリゲーション | OK — exam 1 / 2 題: 基地局切替のハンドオーバとは別 (2018h30h-q099 正答ウ・誤答エ / 2026r08-q064 正答ウ・誤答ア)。one の「速く安定」は q099 に一致、「周波数帯」も一致 / mix: MIMO = アンテナ、CA = 周波数帯。表 (20 / 40 / 60 MHz、1〜3 倍は「目安」) 再計算一致 | one が題文に近い L4 | OK | L4, L9 |
| 3 | テザリング | OK — exam 3 / 2 題: ルータとして働き別のルータは不要 (2016h28a-q070 正答ウ / 2015h27h-q058 正答イ) / 接続は無線 LAN 限定でなく専用プロトコル不要 (q070 誤答ア・エを否定) / ウイルス対策は省けない (q070 誤答イを否定)。限定「PC のために」「テザリング中」保持。detail の接続手段は「例えば」付き | 考点 3 個の構造 L5、近似 L2・L3 | L7 (zh-term warn) | L2, L3, L5, L7, L10 |
| 4 | SIMカード | OK — exam 1 / 2 題: 契約情報、携帯電話会社が発行 (2017h29h-q097 正答エ / 2018h30a-q083 正答イ) / mix: SD などのメモリカードとは用途が違う (q097 誤答ウ / q083 誤答ウ)。one「電話番号や契約者の識別情報」は q083 に一致。「対応する別の端末」の留保あり。flow 4 段階は one・detail と一致 | L8 | OK | L8 |
| 5 | MNP | OK — mix 1 / 1 題: MNP = 番号の持ち運び、MVNO = 他社の設備を借りて移動体通信を提供 (2021r03-q071 正答ウ、誤答イ MNP)。**a1 #2 MEDIUM 解消**: 限定「携帯電話などの移動体通信」を保持 | OK | L11 (en 語順) | L11 |
| 6 | eSIM | OK — mix 1 (qid なし): SIM の一種で入れ物の形が違う。one・detail (組込みチップ、通信でダウンロード) は事実どおり | OK | OK | なし |
| 7 | テレマティクス | OK — exam 1 / 1 題: 移動体の機器が通信を介して情報システムと連動 (2022r04-q080 正答エ) / mix: スマートメータは対象が違う (同題の誤答ウ、周辺題 2023r05-q098 とも一致)。one の「運転者など」は題の「運転者」より広いが detail の例 (自動通報・保険) が支え、題の正答と矛盾しない。限定「移動体」保持。**a1 #1 MEDIUM 解消**: detail 2 文目は 3 例全てに成立 | 考点が題文に近い L1 | OK | L1, L12 |

**単元レベル**: goals 3 点・overview_cols 2 (分類 / 手がかり)・overview_rows 7 行・pairs 2 組 (MIMO / CA 2 行 key 1、SIM / eSIM 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (§1-3)。事実誤りなし、三語一致。

### 前回審査の HIGH / MEDIUM の照合

| 由来 | 重大度 | 箇所 | 内容 | 現状 | 判定 |
|---|---|---|---|---|---|
| a1 #1 | MEDIUM | `terms[6].detail_jp` | 特徴づけ (走行中に受け取る) が挙げた例の 3 分の 2 に当てはまらない / 主語なし | 1 文目に主語「テレマティクスを使うサービスには、例えば」、2 文目「どのサービスも、車の機器と外部の情報システムの間の通信で成り立つ」: 経路案内・自動通報・走行距離連動保険の全てに成立。時期と受け手の限定は消えた。zh「它们都靠…」、en "Each one depends…" も同じ範囲 | 解消・退行なし |
| a1 #2 | MEDIUM | `terms[4].points[0].text_jp` | MVNO の説明から「移動体」の限定が落ちた | jp「携帯電話などの移動体通信を提供」/ zh「手机等移动通信（[[jp:移動体通信]]）服务」/ en "mobile ([[jp:移動体通信]]) services" で三語とも保持。誤答 ISP との区別も立つ | 解消・退行なし (en の語順のみ L11) |
| a2 loc #1 | MEDIUM ×2 | zh「频宽」4 か所 / zh「通信规约」 | 大陸標準でない語 | 「带宽」「通信协议」に統一済み (単元内に「频宽」「规约」なし) | 解消 |

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 12 (うち 建議修 5)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[6](テレマティクス).points[0].text_jp/zh/en` | 主部が 2022r04-q080 題文の語置換に近い (ed 0.33 / Dice 0.39、最長共通「たセンサや表示機器」、同題が同用語の quiz)。one の言い直しでもある (D-203 §9)。標準定義の範囲で写しとはしない。a1 #2・a2 #1 の low を再確認。修正後 ed 0.76 / Dice 0.21 | jp「テレマティクスでは、移動体に載せたセンサや表示機器が、通信を介して情報システムと連動する。」→「移動体の側のセンサや画面が、通信を通じて情報システムとつながる点がテレマティクスの特徴である。」/ zh「在车联网信息服务（[[jp:テレマティクス]]）中，移动体（[[jp:移動体]]）上的传感器（[[jp:センサ]]）和显示设备通过通信与信息系统联动。」→「车联网信息服务（[[jp:テレマティクス]]）的特点是，移动体（[[jp:移動体]]）一侧的传感器（[[jp:センサ]]）和屏幕通过通信与信息系统相连。」/ en "In telematics ([[jp:テレマティクス]]), sensors ([[jp:センサ]]) and displays mounted on a moving vehicle ([[jp:移動体]]) work with information systems over a network." → "What marks telematics ([[jp:テレマティクス]]) is that sensors ([[jp:センサ]]) and screens on a moving vehicle ([[jp:移動体]]) connect to information systems over a network." |
| L2 | LOW **建議修** | `terms[2](テザリング).points[1].text_jp/zh/en` | 1 文に 2016h28a-q070 の誤答ア・エを肢の順に裏返して並べた形 (1 節目 ed 0.35 / Dice 0.40、2 節目 0.45 / 0.41、同題が quiz と challenge にも入る)。前例 b03 u11 a1 #2 (誤答肢の否定列挙 = critic medium) と同型だが、本件は各節が一般の事実で場面の流用なく、3 審査とも low、pilot L11 の前例もあるため MEDIUM とはしない。事実の文に直す。修正後 ア 0.89 / 0.04、エ 0.79 / 0.24 | jp「PC との接続は無線 LAN に限られず、テザリング専用の通信規約 (プロトコル) も要らない。」→「PC とのつなぎ方は 1 つに決まっておらず、通信規約 (プロトコル) もテザリングのために特別なものは使わない。」/ zh「与 PC 的连接不限于无线LAN（[[jp:無線LAN]]），也不需要网络共享专用的通信协议（[[jp:プロトコル]]）。」→「与 PC 的连接方式并非只有一种，通信协议（[[jp:プロトコル]]）也不用为网络共享准备特别的。」/ en "The link to the PC is not limited to wireless LAN ([[jp:無線LAN]]), and no protocol ([[jp:プロトコル]]) dedicated to tethering is needed." → "There is more than one way to link the PC, and tethering calls for no special protocol ([[jp:プロトコル]])." |
| L3 | LOW **建議修** | `terms[2](テザリング).points[0].text_jp` (zh・en は変更不要) | 2016h28a-q070 正答ウと構文の並びが近い (ed 0.50 / Dice 0.42; 「スマートフォン + ルータとして + ので + 別の + ルータ」)。修正後 ed 0.64 / Dice 0.30 | jp「テザリング中のスマートフォンはルータとして働くので、PC のために別のルータを買わなくてよい。」→「テザリングならルータの仕事をスマートフォンが引き受けるので、PC 用のルータは買い足さなくて済む。」 |
| L4 | LOW **建議修** | `terms[1](キャリアアグリゲーション).one_jp` (派生 `definition_jp` 追従、zh・en は変更不要) | 2018h30h-q099 題文の連なりを 1 語省いただけで含み、12 字閾値を逃れる形 (同長窓 2 字置換; 全体 ed 0.56 / Dice 0.38)。定義の標準表現で写しではない (前例 b10 u04 L3 と同型)。修正後 0.73 / 0.27。JP の「電波」を省くが周波数帯は電波の帯で意味は同じ、zh・en の「电波」/ "radio waves" は hook と揃うため残す | jp「…複数の**周波数帯**の電波を束ねて同時に使い、無線通信を速く安定させる技術である。」→「…複数の**周波数帯**を同時に束ねて使い、無線通信を速く安定させる技術である。」 |
| L11 | LOW **建議修** | `terms[4](MNP).points[0].text_en` | "mobile ([[jp:移動体通信]]) services" は併記が名詞句を割り、JP の「携帯電話などの」も無い (a2 loc #2 low)。限定 "mobile" は保たれており意味は変わらない | en "A provider that rents another company's facilities to offer mobile ([[jp:移動体通信]]) services is called an MVNO." → "A provider that rents another company's facilities to offer mobile communication ([[jp:移動体通信]]) services, such as mobile phone service, is called an MVNO." (前文 "MNP is a scheme for taking your number with you." は不変) |
| L5 | LOW | `terms[2].points[0..2]` | 3 個で 2016h28a-q070 の 4 肢全てに対応 (順序は ウ → ア・エ → イ で混在)。各文は一般の事実で、pilot L11 の前例どおり**写しとは判定しない**。同題が quiz・challenge にも入り、考点が解答の手がかりになる。L2・L3 の修正後も対応自体は残る | 記録のみ |
| L6 | LOW | `terms[0].points[0].qids` | 2010h22h-q058 は MIME のみを問い、qid が支持するのは考点の後半だけ。kind = mix で主張は正しい | 記録のみ |
| L7 | LOW | `terms[0].points[0].text_zh`、`terms[2].points[2].text_zh` | validate zh-term warn 2 件 (ファイル→文件、携帯電話→手机)。「附件」「移动电话网络」は文脈上正しい訳 (a2 loc #2 と同判断) | 記録のみ |
| L8 | LOW | `terms[3].one_jp` | 後半が 2017h29h-q097 題文と語順が近い (ed 0.47 / Dice 0.32)。SIM の標準定義で、最長共通は「契約情報を記録した」 | 記録のみ |
| L9 | LOW | `terms[0].detail_jp`、`terms[1].detail_jp`、`terms[1].fig.data.cols[0]`、`pairs[0].rows[1]` | 「電波の幅」「使える幅」「帯域」「周波数帯」の関係が説明されず併用 (a2 #1 low)。事実の誤りではない | 記録のみ |
| L10 | LOW | `terms[2].detail_jp` / `points[0]` / `key_points_jp[1]` | ルータ代わり・機器が要らない の反復 (D-203 §9、内容の食い違いなし) | 記録のみ |
| L12 | LOW | `terms[6].fig` | 図は運転者へ表示する流れのみで、detail の自動通報・保険の流れではない。図は例の 1 つで全サービスの型とは言っておらず、引用題の説明に沿う。L1 とは独立 | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① MIMO = アンテナ / CA = 周波数帯: `pairs[0].rows[0]`、`terms[1].points[1]`、総表の手がかり列 (D-195 §3 の構造) → 2 箇所で許容。② 帯域幅: `pairs[0].rows[1]`、各 detail は片側のみ → 許容。③ SIM / eSIM の形: `pairs[1].rows[0]`、`terms[5].points[0]`、各 one (定義) → 許容。④ 情報の入れ方・切替: `pairs[1].rows[1..2]`、各 detail は片側のみ → 許容。`goals_jp` は観点の予告で内容を述べない。

**範囲外の観察**:
- O1 `unit_summary_*` は v1 と同文 (未改稿)。「IoT 応用」の分類は manifest 由来で事実と矛盾しない。
- O2 zh「线路合约」「线路可以使用」「移动体」はやや日本語調 (a2 loc #2 low 任意)。意味のずれなし、`[[jp:]]` 併記あり。本監査では追加しない。

確認済みで問題なし: 前回 MEDIUM 全解消 (§2 表)、限定条件 (qid 付き考点 10 件全て保持)、§9 禁止句 grep、framing 0/0/0、D-197 羅列、D-200、D-205 該当なし、図種、`[[jp:]]` 原語、zh 訳語表、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **12** (建議修 5: L1 / L2 / L3 / L4 / L11 / 記録のみ 7: L5〜L10, L12) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 7 用語・考点 12 件・引用 9 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。依頼の 2 点 (テレマティクス detail の特徴づけ / MVNO の移動体の限定) は解消、退行なし。建議修 5 件は補丁 (B3) で修正推奨。

**補足**: L2 は誤答肢の否定列挙の型で、前例の扱いが審査ごとに分かれる (b03 u11 critic = medium、pilot L11・本単元の 3 審査 = low)。本監査は 3 審査の判断と pilot L11 に沿って LOW とした。

## 6. 補丁案の試験

建議修 5 件を全て適用した scratchpad の複製で再実行 (単元ファイルは未変更):

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/u06.patched.json --manifest data/ip/textbook/.planning/v2/technology-22-60-u06/manifest.json
✓ technology-22-60-u06 unit: 0 issues (…/u06.patched.json), 2 warning(s)
  (warn は L7 の 2 件のみ、新規なし)
$ node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/u06.patched.json
✓ technology-22-60-u06 parity: 33 locations, 0 diff
pointFraming (複製): jp 0 / zh 0 / en 0
```

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-60-u06
✓ technology-22-60-u06 unit: 0 issues (data/ip/textbook/units/technology-22-60-u06.json), 2 warning(s)
  warn  zh-term  terms[0](MIMO).points[0].text_zh  ファイル → 文件 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[2](テザリング).points[2].text_zh  携帯電話 → 手机 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-60-u06
✓ technology-22-60-u06 parity: 33 locations, 0 diff
EXIT=0
```
