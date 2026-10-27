# Rule A 全数抽検 — technology-23-63-u04 (セキュリティ検査・IoT/ハードウェアの保護)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-10-28 (S135 第 1 批)、repo HEAD `2ec6c9c` + 作業ツリー (単元 JSON は未コミットの書き直し版、sha256 先頭 `2d03ef2ddf7ed39e`)。
- **対象**: `data/ip/textbook/units/technology-23-63-u04.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (電子透かし / デジタルフォレンジックス / ペネトレーションテスト / ブロックチェーン / 耐タンパ性 / セキュアブート / TPM) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§9)、S135 補足 D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ、登録外図種の欠如は最大 low)。比較: `data/ip/textbook/.planning/v2/technology-23-63-u04/v1-original.json`。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ / MEDIUM = 誤解を招く・規則違反 / LOW = 文体。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版 (`[[jp:X]]` → `（X）`) であることをスクリプトで確認。
2. **考点 × 引用題 (考点 17 件 = exam 12 / mix 5、引用 qid 計 16 件) + quiz・確認題 (計 24 qid 全て)**: `data/ip/quiz/questions.json` から各題の題文・選択肢・`correct_answer` を再読。全題 topic `technology-23-63`。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化をしていないことを確認。計算題はこの単元に無い (2019r01a-q093 は穴埋めの組合せ、ハッシュ関数の性質 2 点で正答ウに到達することを確認)。
3. **D-198 写し**: (i)(ii) は `textbook-v2-validate.mjs` の copy guard (B7 で図・表・pairs も走査) = 0 件。加えて独自スクリプト (scratchpad `ra_u04.cjs`、未入库) で本単元の JP 文字列 108 本 (本文・考点・図 label / caption・overview・pairs・goals・key_points) を topic 内全題の題文 + 選択肢と 12 字連続照合 (カタカナ 4 字以上・英数遮蔽、遮蔽後の実字 6 未満の窓は除外) → **0 件**。(iii) 読んで確認: 例 (写真への番号埋め込み、服の名札、鑑識の手袋、防犯のプロ、クラスの出納帳、こじ開けると読めなくなる金庫、ビル受付の社員証、銀行の貸金庫と印鑑、ディスク全体の暗号化) はいずれも引用題に無い場面。フォレンジックスの題にある「削除メールの復元」、ブロックチェーン適用事例の題 (デジタル社債) の具体例は本文に流用されていない。
4. **D-195**: 結論先行 (one = 1 文 × 7、太字あり)、展開 2〜3 文 (2/2/2/3/2/3/2 文)、比喩・フックが定義の言い換えでないこと (語源・別場面で OK)、定義前使用 (ハッシュ値は one 内で括弧定義、デジタル署名は detail 1 文目で定義)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 押さえ / 頻出 / 選択肢 / 選ぶ、zh・en も相当語)、図の有無と型、pair 配置 (フォレンジックス→ペネトレーションテスト、耐タンパ性→TPM、各組の 2 つ目の後、key 行あり)。
5. **D-200**: 考点数 2/3/2/3/3/2/2 (≤3 ✓)、各 JP 文数 1〜2・字数 41〜98 (≤100 ✓)。
6. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・キャプション・表セルの三語一致、`[[jp:…]]` 原語 7 種 (電子透かし / デジタルフォレンジックス / ペネトレーションテスト / 侵入テスト / ブロックチェーン / 耐タンパ性 / セキュアブート) が jp 本文に実在 (スクリプト、全 ok)、zh 訳語が `zh_terms.unit.json` に従うこと (数字水印 / 数字取证 / 渗透测试 / 区块链 / 防篡改性 / 安全启动 / TPM（可信平台模块）/ 操作系统 / 固件 / 散列值 / 数字签名 / 安全内建（Security by Design）/ GPU（图形处理器）/ IoT（物联网）/ PC（个人计算机）— 一致)、繁体字走査 (検出なし)。
7. **§9 の横比較**: 「問われ」の出現数を同 topic の既 PASS 単元・試点単元と比較 (technology-23-63-u01〜u03 / management-10-27-u01〜u03 = 各 0、本単元 = 6)。
8. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 電子透かし | OK — exam 1 / 1 題。一見して分からない形で情報を埋め込む、透けて見える画像の重ね表示は誤り (2010h22h-q074 正答エ、誤答 = 鍵がないと使えない・コピー回数制限・透かし画像の重ね表示)。detail「暗号化と違い誰でも見られる」も誤答ア・ウを支持しない。mix: 配布元の真正性・改ざんなしの確認はコード署名 (2017h29a-q072 正答ウ、電子透かしは誤答肢) 正しい。段階図 (埋め込み→コピー→読み出し) は detail と一致 | §9 定型 (M1) | OK (原語併記の欠け L3) | M1, L3 |
| 2 | デジタルフォレンジックス | OK — exam 2 / 4 題。目的 = 法的証拠になるデータを集め改変されない状態で守る (2018h30h-q097 正答イ / 2025r07-q074 正答ア / 2017h29h-q061 正答ウ) / 犯罪の疑いが生じた段階で収集・分析し法的証拠性を明らかにする技術の総称 (2019h31h-q099 正答エ、誤答 = サイネージ・署名・ディバイド)。mix: 自社システムへの攻撃テストは誤答肢 (2018h30h-q097 ア / 2025r07-q074 イ) と一致。原本保全・複製で分析 = 標準手順。段階図一致 | §9 定型 (M1)、選択肢メタ (L1) | OK | M1, L1 |
| 3 | ペネトレーションテスト | OK — exam 2 / 2 題。攻撃して侵入を試し弱点を発見、高負荷試験・変更影響の試験とは別 (2014h26a-q062 正答ア) / インターネット経由で見つかるのは外部から公開サーバへの侵入口、媒体による持出しや物理的入室経路は見つからない (2016h28a-q073 正答ア)。許可を得て事前に行う = 正しい。図なし (定義型 + 直後に pair 表、D-195 §2 / §0-8 で可) | 選択肢メタ (L2) | OK | L2 |
| 4 | ブロックチェーン | OK — exam 3 / 4 題。直前のハッシュ値を埋めて連結し矛盾なき改ざんを困難に (2019r01a-q059 正答エ) / 多数のコンピュータが同じデータを持ち検証する分散型台帳、暗号資産の基盤 (2021r03-q097 正答ウ) / ハッシュ関数 = 同入力→常に同値、値から復元不可 (2019r01a-q093 正答ウ、2026r08-q091 正答ウ・誤答 = 復元可・逆関数あり・異関数で同値)。detail「他の取引記録の管理にも」は quiz 2025r07-q025 (正答 = 改ざん防止のデジタル社債) と整合。段階図 (ブロック 1→2→3) 一致 | §9 定型 (M1) | OK | M1 |
| 5 | 耐タンパ性 | OK — exam 2 / 3 題。内部データを外部から解読・改ざん・取出しされにくい性質、可用性・信頼性とは別語 (2020r02o-q090 正答エ) / 鍵内蔵チップでの暗号化 (2021r03-q073 正答イ)・内蔵ソフトの難読化 (2023r05-q057 正答エ)。mix: 通信の暗号化・ソフト更新は別目的 = 両題の誤答肢と一致。tree 図 (チップに鍵 / 開封で消去 / 難読化) は正しい事実で、点 1 と一致 (「開封で消去」は本文に無いが比喩と整合) | §9 定型 (M1) | zh 太字範囲 (L6) | M1, L6, L7 |
| 6 | セキュアブート | OK — exam 1 / 1 題。起動時に OS・ファームウェアの署名を検証し正当なものだけ実行、IoT のソフト改ざん対策にも使用、リブートとは別 (2023r05-q085 正答ウ)。mix: 企画・設計段階から作り込むのはセキュリティバイデザイン (2023r05-q061 正答イ、セキュアブートは誤答肢) 正しい。段階図 (ファームウェア→OS→起動/停止) 一致。bootstrap の語源 正しい | §9 定型 (M1) | 原語併記の欠け (L3) | M1, L3 |
| 7 | TPM | OK — exam 1 / 1 題。暗号化の鍵を内部に記憶し外部から取出しが困難なセキュリティチップ (2019r01a-q073 正答エ)。mix: TLS = 通信路暗号化、GPU = 画像処理 (同題の誤答肢) 正しい。全ディスク暗号化の鍵保護 = 実例として正しい。図なし (定義型 + 直後に pair 表) | §9 定型 (M1) | OK | M1, L5 |

**単元レベル**: goals 3 点・overview_rows 7 行 (列: 種類 / いつ働くか)・pairs 2 組 (フォレンジックス×ペネトレーション = 時期が key 行、耐タンパ性×TPM = 性質/部品が key 行)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (2017h29a-q072 / 2018h30h-q097 / 2016h28a-q073 / 2021r03-q097 / 2021r03-q073 — 本文・考点と矛盾なし)。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 7 (うち 建议修 4)** + 範囲外観察 1

### MEDIUM

| ID | 重大度 | 箇所 (field path) | 内容 |
|---|---|---|---|
| M1 | **MEDIUM** | `terms[0].points[0]` / `terms[1].points[1]` / `terms[3].points[0]` / `terms[4].points[0]` / `terms[5].points[0]` / `terms[6].points[0]` の `text_jp` / `text_zh` / `text_en` | D-195 §9「定型の締め句 (『試験では〜が問われます』) の**常用**」違反。exam 考点 12 件中 6 件が「〜(の名前) として**問われる**」/「**試験で問われる**電子透かしは」の同一型 (zh「它会作为…被问到」「考试所说的」、en "It appears as the name…" / "in exam questions")。同 topic の PASS 済 u01〜u03・試点 3 単元はいずれも 0 件で、本単元だけが常用している。単発の L 判定 (u02 L1 / 試点 L15) とは異なり §9 が名指す「常用」に当たる。さらに 5 件は one の定義文を「問われる」で包み直しただけで、§9「同義の言い換えの反復」にも寄る。事実はすべて正しく、誤答は誘発しない (→ HIGH ではない) |

**M1 修正案** (各項目、メタ句を削り主張だけを残す。修正後 JP は全て 1〜2 文・43〜63 字、題文・選択肢との 12 字照合 0 件を確認済):

| 箇所 | jp | zh | en |
|---|---|---|---|
| `terms[0].points[0]` | 電子透かしは、一見して変化が分からない形で情報を埋め込む。透けて見える画像を重ねて表示するものではない。 | 数字水印以一眼看不出变化的方式嵌入信息，并不是把透明可见的图像叠加显示在内容上。 | A digital watermark embeds information so that the change cannot be spotted at a glance; it is not a see-through image overlaid on the content. |
| `terms[1].points[1]` | 犯罪の疑いが出た段階で記録を集めて調べ、裁判で通用する証拠かどうかをはっきりさせる技術全体を、デジタルフォレンジックスと呼ぶ。 | 在出现犯罪嫌疑的阶段收集并调查记录、弄清其能否成为法庭上站得住的证据，这一整套技术统称为数字取证。 | The whole set of techniques that, once a crime is suspected, gather and examine records and establish whether they will hold up as evidence in court is called digital forensics. |
| `terms[3].points[0]` | 各ブロックに直前のハッシュ値を入れてつなぐため、記録を矛盾なく書き換えることが難しい。 | 每个区块都放入前一个区块的散列值并相互串联，因此很难在不产生矛盾的情况下改写记录。 | Because each block carries the previous block's hash value, records are hard to rewrite without creating inconsistencies. |
| `terms[4].points[0]` | ハードウェアなどの内部データを外から解読・改ざん・取出しされにくい性質が耐タンパ性で、可用性や信頼性とは別の言葉である。 | 硬件等内部数据难以被从外部破解、篡改或取出的性质就是防篡改性，它与可用性、可靠性是不同的概念。 | The property that keeps internal data in hardware and similar devices hard to decipher, alter or extract from outside is tamper resistance, a different term from availability or reliability. |
| `terms[5].points[0]` | セキュアブートは起動時にデジタル署名を検証し、正当なものだけを実行する。単に再起動することを指すリブートとは違う。 | 安全启动在启动时验证数字签名，只运行合法的软件。它不同于单纯指重新启动的 reboot（重启）。 | Secure boot verifies digital signatures at startup and runs only legitimate software. It is not the same as a reboot, which simply means restarting. |
| `terms[6].points[0]` | TPM は、データ暗号化の鍵を内部に記憶し、外から中身を取り出しにくいセキュリティチップである。 | TPM（可信平台模块）是在内部存储数据加密用的密钥、难以从外部取出其中内容的安全芯片。 | A TPM is a security chip that stores data-encryption keys internally and resists having its contents extracted from outside. |

(L3 を同時に直す場合は `terms[5].points[0]` の zh/en に `[[jp:リブート]]` を併記。)

### LOW

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建议修** | `terms[1].points[2].text_{jp,zh,en}` | 「…ペネトレーションテストで、**選択肢に並ぶことがある**。」は出題形式のメタ記述 (M1 と同系、単発なので LOW) | jp「自社のシステムを攻撃して弱点を探すのはペネトレーションテストである。フォレンジックスは事件が起きた後の調査である。」/ zh「攻击自家系统来寻找弱点的是渗透测试。数字取证则是事件发生之后的调查。」/ en "Attacking your own system to find weaknesses is penetration testing. Forensics is the investigation after an incident has happened." |
| L2 | LOW **建议修** | `terms[2].points[0].text_{jp,zh,en}` | 「**説明として選ぶのは**、…」/ zh「作为定义应选的是」/ en "The correct description is" — 選択肢選びを前提にしたメタ表現 | jp「ペネトレーションテストは、攻撃して侵入を試すことで弱点を見つける検査である。高い負荷をかける試験や、変更の影響を調べる試験とは別物である。」/ zh「渗透测试是通过发动攻击、尝试入侵来发现弱点的检查，与施加高负载的测试、调查变更影响的测试不同。」/ en "Penetration testing finds weaknesses by attacking and attempting to break in. It is different from tests that apply heavy load or check the impact of changes." |
| L3 | LOW **建议修** | `terms[0].points[1]` (コード署名) / `terms[5].points[0]` (リブート) / `terms[5].points[1]` (セキュリティバイデザイン) の `text_zh` / `text_en` | 引用題の正答・誤答肢の語なのに zh・en とも `[[jp:]]` 原語併記がない (D-195 §5)。zh/en 学習者が日本語の選択肢と対応付けられない (parity ゲートは通過) | zh「是代码签名（[[jp:コード署名]]），而不是数字水印」/ en "is code signing ([[jp:コード署名]]), not a digital watermark"; zh「reboot（重启，[[jp:リブート]]）」/ en "a reboot ([[jp:リブート]])"; zh「安全内建（Security by Design，[[jp:セキュリティバイデザイン]]）」/ en "security by design ([[jp:セキュリティバイデザイン]])" |
| L5 | LOW | `overview_rows[6].extra_jp[1]`「暗号化・復号のたび」(TPM の「いつ働くか」) | TPM は鍵の保管 (常時) や起動時の計測にも使われ、「暗号化・復号のたび」は一面のみ。誤学習には至らない | 任意: 「鍵を使う処理のたび」/ zh「每次使用密钥处理时」/ en "Whenever a key is used" |
| L6 | LOW | `terms[4].one_zh` | 太字が述部ほぼ全体 (「**能够抵御…之类攻击的性质**」) に掛かり、jp (「読み出す・書き換える攻撃に耐える性質」) より広い。語順もやや重い | 任意: 「**防篡改性**（[[jp:耐タンパ性]]）是指设备能够**抵御读取或改写内部密钥和数据的攻击**（如拆开设备、测量信号）的性质。」 |
| L7 | LOW | `terms[4].fig.data.root.children[0].children[1]`「ケースを開けると記憶内容を消す」 | 事実として正しい (開封検知での消去) が detail・points に記述が無く、図だけに出る。比喩 (こじ開けると読めなくなる金庫) とは整合 | 記録のみ |

**範囲外の観察** (書き直し対象外):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。「ブロックチェーン・耐タンパ性・セキュアブート・TPM による**機器の保護技術**」はブロックチェーン (台帳技術) を機器保護に括る言い方で、本文の位置づけとややずれる。誤学習には至らない。

確認済みで問題なし: 事実 (全 24 qid の正答と一致、誤答肢を支持する記述なし)、D-197 羅列 (validate 0)、D-200 (全 17 考点 ≤2 文・≤98 字)、図・表の文字列の写し (0 / 108)、`[[jp:]]` 原語 (7 種全て jp 本文に実在)、zh 訳語 (`zh_terms.unit.json` と一致)、繁体字 (なし)、図種 (flow steps ×4 / tree static ×1 = 登録内、ペネトレーションテスト・TPM は図なし = 定義型で可、u02 WAF と同じ扱い)、派生フィールド (記法除去版と一致)、pair 配置。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1: §9 定型「〜として問われる」の常用、6 考点 × 三語) |
| LOW | **6** (建议修 3: L1, L2, L3 / 記録のみ 3: L5, L6, L7) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。事実面は全 7 用語・考点 17 件・24 題で正答と一致し HIGH は 0。不合格理由は文体規則 §9 の常用違反 (M1) のみで、修正は句の削除・言い換えで済む**措辞級**。→ PLAN §0-2 / §0-7 に従い B3 補丁 (M1 6 箇所 × 三語、併せて L1〜L3 推奨) → 該当用語の Rule A 復審。§0-3 の停止条件 (HIGH 残存) には当たらない。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u04
✓ technology-23-63-u04 unit: 0 issues (data/ip/textbook/units/technology-23-63-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u04
✓ technology-23-63-u04 parity: 34 locations, 0 diff
EXIT=0
```

## §再審 (B3 補丁後、同 auditor・補丁の書き手とは別 agent)

- **対象**: 補丁 28 件 (`evidence/phase5/stage_07_ui/phase3/batch/patches/technology-23-63-u04.json`、`textbook-v2-patch.mjs --list` で全件 active・base `28c628fa5382…`) を適用して再 merge した単元 (作業ツリー、sha256 先頭 `512c0e6ce07f3819`、HEAD `d2cac29`)。再審の範囲は補丁を当てたフィールドだけ: `terms[0].points[0,1]` / `terms[1].points[1,2]` / `terms[2].points[0]` / `terms[3].points[0]` / `terms[4].points[0]` / `terms[5].points[0,1]` / `terms[6].points[0]` (jp/zh/en)。
- **M1 解消**: 単元全体で「問われ / 被问到 / It appears as / in exam questions / 选项 / choices」は 0 件。§9 grep の残り 1 件 (`terms[2].points[0].text_jp`「高い負荷をかける**試験**」) は負荷試験という意味の一般語で、偽陽性。
- **L1〜L3 解消**: L1 (選択肢メタ) と L2 (「説明として選ぶのは」) は三語とも除去済み。L3 の `[[jp:コード署名]]`・`[[jp:リブート]]` (M1 の補丁 p11/p12 に統合)・`[[jp:セキュリティバイデザイン]]` は zh/en に併記され、3 語とも jp 本文に実在する (スクリプト確認済)。
- **事実**: 補丁後の主張を引用題の正答と照合し直した。結果はすべて一致 (2010h22h-q074 エ / 2017h29a-q072 ウ / 2019h31h-q099 エ / 2018h30h-q097 イ・2025r07-q074 ア (攻撃テストは誤答肢) / 2014h26a-q062 ア / 2019r01a-q059 エ / 2020r02o-q090 エ / 2023r05-q085 ウ / 2023r05-q061 イ / 2019r01a-q073 エ)。補丁は表現を言い換えただけで、主張の追加・削除はない。
- **三語**: zh・en は jp と同じ事実で、欠落・追加はない。zh の訳語 (数字取证 / 防篡改性 / 安全启动 / 安全内建 / TPM（可信平台模块）/ 散列值) は訳語表のとおり。
- **D-198 / D-200**: 12 字照合は JP 108 本 × topic 全題で 0 件。考点の数と長さはすべて規則内 (≤3 / 各 ≤2 文 / 最長 98 字、補丁箇所は 43〜69 字)。
- **機械ゲート**:
```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-23-63-u04
✓ technology-23-63-u04 unit: 0 issues (data/ip/textbook/units/technology-23-63-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-23-63-u04
✓ technology-23-63-u04 parity: 34 locations, 0 diff
EXIT=0
```
- **再審判定**: **PASS** (D-199: HIGH 0 / MEDIUM 0)。未修の LOW は L5・L6・L7 (記録のみ) と範囲外観察 O1 で、いずれもバッチ証拠の「未修 LOW」表へ回す。
