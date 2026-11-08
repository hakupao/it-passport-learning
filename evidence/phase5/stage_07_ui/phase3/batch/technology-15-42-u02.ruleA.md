# Rule A 全数抽検 — technology-15-42-u02 (シリアル・近距離無線インタフェース)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 バッチ b62)、repo HEAD `05c1955e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b62-u02-a1` の merge 結果、`merged.json` と完全一致、sha256 先頭 `d5272c918f13f4fc`)。
- **対象**: `data/ip/textbook/units/technology-15-42-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (USB / Bluetooth / RFID / NFC / IrDA) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-211、`ruleA_unit_audit.md` の既知失敗型 (1)〜(10)。比較: `v1-original.json` (用語 5 語・`term_zh`・`term_en` とも manifest `v1_terms` と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 0. 前回 JP review #1 の MEDIUM 3 件の解消確認 (journal `journal.b62-u02-a1.jsonl`)

| 前回指摘 | 現状 (jp / zh / en) | 判定 |
|---|---|---|
| `terms[0].analogy_jp` コンセントの比喩 (差し込み口の形が 1 つ) が points[2] (形状は複数) と 2010h22a-q070 の誤答 (形状 1 種類に統一) 側を後押し | 3 語とも「使う言葉を前もって決めておけば出身の違う人どうしでも話が通じる」= 共通の取り決めによる汎用性だけを運ぶ像に差し替え。形状の含意なし。2010h22a-q070 の誤答 (形状統一) は points[2]「複数の形状がある」で否定でき、比喩と衝突しない | **解消** |
| `terms[3].points[0]` が 2018h30a-q066 の正解肢を構成順 (10 cm → IC カード・IC タグの読み書き) で言い直し | 考点を「近距離無線の中でも距離が特に短い → 近づける操作そのものが通信開始の合図」に改稿し、根拠を 2016h28a-q090 (最短距離の分類題、正答 NFC) へ変更。q066 は quiz のみ (D-211)。どの考点も q066 の qid を持たず、one / detail / points[2] にも「10 cm → カード・タグ読み書き」の組・順序は無い (points[2] は RFID の説明の後に NFC の 10 cm、順序も主語も別)。Dice 0.19〜0.23 | **解消** |
| `pairs[1].rows[2]` カードとの通信が NFC 側にだけあるように読める (NFC ⊂ RFID と矛盾) | RFID 側「読み取り機と IC タグ (カード型を含む)」/ zh「读取器与 IC 标签（含卡片型）」/ en "A reader and IC tags (including card types)"、NFC 側「読み取り機とタグに加え、機器どうしも可」/「除读取器与标签外，设备之间也可以」/ "Readers and tags, plus device to device"。部分集合の側に全体に無い相手を置く形は消えた。RFID points[0] (非接触型 IC カードは RFID の応用) と整合 | **解消** |

回帰: 3 件とも zh / en が jp と同じ修正を受けており (parity 0 diff)、失敗型 (5) の再発なし。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ (派生フィールドを除く 421 行のダンプ)。`definition_*` が `one_*` の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題 (考点 12 件 = exam 9 + mix 3、うち qid 付き 9 件、引用 qid 延べ 11 = 異なり 10 題)**: `data/ip/quiz/questions.json` から各題の題文 (stem_jp_clean)・選択肢・`correct_answer` を再読 (全題 topic `technology-15-42`)。正答一致・誤答肢を支持しない・一般化 / 限定の過不足・限定条件保持を 1 件ずつ確認 (§2)。
3. **quiz / challenge_questions**: quiz 15 枠 (異なり 12 題) + challenge 5 題、本文未引用は 2011h23tokubetsu-q087 / 2018h30a-q066 の 2 題。q087 (USB 2.0 の機能に無いもの = パラレル転送; 他肢 バスパワー・プラグアンドプレイ・ホットプラグ) は detail「シリアル転送」と points[0]/[1] で解ける (プラグアンドプレイは本文に説明なし = 前回 LOW、記録のみ)。q066 (NFC = 10 cm 程度・IC カード / タグの読み書き; 誤答 = 数十 m の無線 LAN・赤外線の携帯データ交換・衛星測位) は one (10 cm、電波) と points[2] (RFID の一種) で解け、誤答のどれも支持しない (§3 L7 参照)。
4. **D-198 写し**: validate の copy guard = 0 件 (`warn choice-echo` も 0 行)。独立照合: 単元 JP 文字列 91 本 (派生除く) × topic 全 25 題の題文 (stem_jp_clean) + 選択肢、句読点・記号・空白除去後 12 字連続窓 — **カタカナ 4 字以上・英数を □ に遮蔽: 0 件 / 遮蔽なし: 0 件**。1〜2 字置換の近似一致: 4 件、全て偽陽性 (`terms[0].one_jp` の「…インタフェースの規格」「汎用シリアルインタフェー」= 用語名・一般名詞の連なり × 2011h23a-q088 / 2014h26h-q073 / 2016h28h-q099、`terms[4].points[1]` の「Bluetooth と IrDA」= 見出し語 2 つ × q099)。近い言い換えの個別計測 (ed / Dice、校正 HIGH 例 0.14 / 0.52): USB points[0] 文 1 × 2014h26a-q072 題文 0.67 / 0.36、points[0] 文 2 × 2010h22a-q070 ウ 0.83 / 0.13、points[1] × 2015h27a-q050 ア 0.81 / 0.22、points[2] × 2017h29a-q082 ウ 0.86 / 0.20、NFC points[1] × 2019h31h-q093 エ 0.73 / 0.29・× 2013h25a-q021 エ 0.77 / 0.30、NFC one × 2018h30a-q066 ア 0.92 / 0.19、RFID points[0] × 2010h22h-q078 題文 0.79 / 0.24 → 全て校正値から遠い。カタカナの多い文 (USB detail / points / RFID detail / fig caption) を目視、題の言い回しの流用なし。
5. **(iii) 選択肢なぞり (D-208 型 1)**: 2017h29a-q082 の選択肢 (速度モード設定・給電は全てケーブル・コネクタ形状複数・パラレル複数信号線) は points[0] (大きい機器は自前電源 = イ否定)、points[2] (形状複数 = 正答ウ)、detail (シリアル 1 本 = エ否定) に分散し、1 考点で組・順序をなぞるものは無い。points[0] は 2010h22a-q070 正答 ウ の内容を一般定義 (バスパワー) として述べ、その上で自前電源の場合を足したもので、誤答肢の場面再演ではない。2015h27a-q050 の誤答ウ (ケーブル経由の給電) はバスパワーの定義そのものだが、points[0] は q050 を引かず別見出し語の肯定的定義 (D-209 除外)。RFID points[1] のバーコード (2010h22h-q078 の誤答肢) は両側を肯定的定義で述べる対比 (D-209 除外)。2016h28h-q099 (①〜④ の判定項目) は Bluetooth / IrDA の考点がそれぞれ片側だけ「ケーブル不要」を述べ、項目の組 (①③) も順序も再現しない。NFC points[1] は §3 L6。
6. **D-195**: one = 1 文 × 5 (太字あり)、detail 2 文 × 5、図 = RFID の flow steps 3 (登録内; 他 4 用語は図なし)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `terms[3].hook_jp`「と覚える」1 件 (+ 派生 summary 1) のみ = 記憶フックの言い方で 1 件、前例どおり記録なし; `freq_badge`「低頻」。zh / en (考试 / 必须 / 记住 / 记作 / exam / must / remember …) のヒットは `kind: exam`、`terms[2].points[1].text_zh`「必须」、IrDA の "must face" 2 件、NFC hook_zh「记作」で、全て通常の用法 (定型締め句ではない)。定義前使用: シリアル転送・USB ハブ (USB detail)、ペアリング (Bluetooth detail)、IC タグ・リーダライタ (RFID one / detail)、IC チップ (RFID detail で定義、図 step 3 と points[0] が先に出得る = 前回 LOW、記録のみ)、近接通信 (NFC one)。
7. **D-200**: 考点数 3/2/2/3/2 (≤3 ✓)、各 JP 文数 1〜2、字数 45〜83 (≤100 ✓、最大 NFC points[2] 83 字)。**framing 件数** (validateV2 `pointFraming` を tsx で実行、全考点): jp 0 / zh 0 / en 0。
8. **D-205 / 仕様の数値・事実の台帳** (本単元の焦点):

| 事実 | 箇所 | 根拠 / 限定 | 判定 |
|---|---|---|---|
| NFC 10 cm 程度 | NFC one / points[2] / overview / pairs[1] / key_points[3] | 2018h30a-q066 正答ア (10 cm 程度) / 2016h28a-q090 (最短 = NFC)、「程度」付き | ✓ |
| NFC ⊂ RFID (「RFID の一種」) | NFC one / points[2] / pairs[1].rows[0] / key_points[3] | q066 ア (IC カード・IC タグの読み書きに利用) と 2010h22h-q078 (非接触 IC カード = RFID) が支持、NFC は 13.56 MHz 帯 RFID 技術を基盤とする国際規格 (ISO/IEC 18092) | ✓ |
| Bluetooth 数 m〜10 m 程度 / 10 m 程度 | Bluetooth one / overview / pairs[0] / key_points[1] | 「一般に」「程度」「目安」付き (クラスにより 100 m 級もある、限定で吸収) | ✓ |
| Bluetooth 2.4 GHz 帯 | `terms[1].detail_*` | IPA 過去問に支持なし (全 questions.json で 2.4 GHz は無線 LAN の 2018h30a-q096 のみ)。一次資料: Bluetooth SIG Core Specification — 全版 (BR/EDR・LE とも) 2.4 GHz ISM 帯 (2400〜2483.5 MHz) で動作、版で変わらない事実。改訂文書の構成要素の数・名称ではないので D-205 の版表記は不要 | ✓ (L8 記録のみ) |
| IrDA 1 m 程度・見通し必要 | IrDA one / detail / overview / pairs[0] / key_points[4] | 「程度」付き、2016h28a-q090 (最短は NFC で IrDA ではない) と整合 | ✓ |
| RFID 方式により数 cm〜数 m | overview / pairs[1].rows[1] / NFC points[2] | 「方式により」「目安」付き。アクティブ型・UHF 帯で数 m を超える例あり (前回 LOW、記録のみ L9) | ✓ |
| USB コネクタ Type-A / B / C | `terms[0].points[2]` | 「例えば」付き (D-205)、2017h29a-q082 ウ が「幾つかの種類」を支持 | ✓ |
| USB ホットプラグ・バスパワー | USB points[0]/[1] / key_points[0] | 2015h27a-q050 ア / 2014h26a-q072 ウ / 2010h22a-q070 ウ。題は USB 2.0 と明記するが、両機能は USB の全版に共通で、版を限定する除外条件は無い (D-210 該当なし) | ✓ |
| USB シリアル「1 本の信号線で 1 ビットずつ」 | USB detail / key_points[0] | パラレルとの対比の定番の簡略化 (実際は差動対・USB 3.x は複数レーン)。誤答肢 (パラレル・複数の信号線) との区別には足りる (前回 LOW、記録のみ L10) | ✓ |

9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、表セル・比較行・caption の三語一致、`[[jp:…]]` 原語 16 種のうち 15 種が jp 本文に実在、`非接触型ICカード` のみ jp 本文が「非接触型の IC カード」(の入り) で文字列一致せず → L5。one_zh / one_en 全 5 用語に見出し語あり (D-202)、zh 訳語 (`zh_terms.unit.json`: 蓝牙（Bluetooth）/ RFID（射频识别）/ NFC（近场通信）/ IrDA（红外数据通信）/ IC 标签 / IC 卡 / 条码 / 线缆 / 键盘 / 鼠标 / 智能手机) 一致、validate の B6 / jp-origin warn 0。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | USB | OK — exam 3 / 4 題: バスパワー = ケーブル経由で PC 側から給電、小電力機器はこれで動き大電力機器は自前電源 (2014h26a-q072 正答ウ バスパワー、誤答イ セルフパワー = 自前電源の側を名前なしで正しく区別 / 2010h22a-q070 正答ウ 小電力機器は電源なしで給電、誤答ア 形状統一・イ 速度モード設定・エ パラレルを支持しない) / ホットプラグ = 起動したまま着脱 (2015h27a-q050 正答ア) / コネクタ形状は複数 (2017h29a-q082 正答ウ、「例えば」付き; 誤答イ「給電は全てケーブル」は points[0] 文 2 で否定) | OK | OK | L10 (記録のみ)、L11 (記録のみ) |
| 2 | Bluetooth | OK — exam 2 / 3 題: 電波の無線インタフェースでケーブル不要 (2011h23a-q088 正答ア / 2016h28h-q099 正答イ ①③ の ①) / 本体近くで使う機器の無線接続、例えばイヤホン・キーボード (2013h25a-q021 正答ア = ゲーム機 1 台にコントローラ 2 個; 例は題の場面を流用せず「例えば」付き) | OK | **analogy_en が単数化 → M1** | **M1**、L1 (建議修)、L4 (記録のみ) |
| 3 | RFID | OK — exam 1 / 1 題 + mix 1: 非接触型 IC カードは RFID の応用 (2010h22h-q078 正答イ) / mix: バーコード = 光で 1 つずつ、RFID = 電波で箱の中・複数をまとめて (前回 LOW の言い切り、記録のみ)。fig steps 3 (電波 → 電池のないタグが給電 → ID 返信) は node ラベルも「電池のないタグ」に限定済み (前回 LOW 解消) | OK | en "face-up" → L2 | L2 (建議修)、L5 (建議修) |
| 4 | NFC | OK — exam 2 / 2 題 + mix 1: 近距離無線の中でも距離が特に短い → 近づける操作が通信開始の合図 (2016h28a-q090 正答ウ NFC、分類題の正答内容を一般的性質として述べる = D-209 除外、肢の組なし) / 駅の自動改札で IC 乗車券をかざすのが NFC 規格の利用例 (2019h31h-q093 正答エ) → L6 / mix: RFID ⊃ NFC、距離 数 cm〜数 m ⊃ 10 cm | OK | overview zh「一碰」→ L3 | L3 (建議修)、L6・L7 (記録のみ) |
| 5 | IrDA | OK — exam 1 / 1 題 + mix 1: 赤外線の無線でケーブル不要 (2016h28h-q099 正答イ の ③) / mix: Bluetooth = 電波・IrDA = 赤外線 (両側肯定) | OK | OK | L4 (記録のみ)、L12 (記録のみ) |

**単元レベル**: goals 3・overview_cols 3 (接続の形 / 伝送媒体 / 通信距離の目安)・overview_rows 5・pairs 2 組 (Bluetooth / IrDA 3 行 key 1、RFID / NFC 3 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 (2013h25a-q021 / 2014h26a-q072 / 2016h28h-q099 / 2019h31h-q093 / 2017h29a-q082 — いずれも本文で解け、矛盾なし)。

**対比の出現欄 (書き方 8)**: ① Bluetooth 電波 / IrDA 赤外線: `pairs[0].rows[0]`、`terms[4].points[1]` (mix)、overview 総表の列 (D-195 §3 の構造) → 許容。② RFID ⊃ NFC: `pairs[1].rows[0]`、`terms[3].points[2]` (mix) に加え NFC `one_*`・`key_points_*[3]` が定義の一部として「RFID の一種」と言う → 定義の構成要素で反復としては軽い (前回 LOW、記録のみ)。③ 距離 Bluetooth / IrDA・RFID / NFC: pairs 各 rows[1] + overview 列 → 許容。④ バーコード / RFID: `terms[2].points[1]` のみ。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 12 (うち 建議修 4、任意の修正案 1 = L12)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[1].analogy_en` | en だけ「**one** particular partner」と相手を 1 つに限定している (jp「決まった相手とだけ」・zh「固定对象」は数を言わない)。引用題 2013h25a-q021 (points[1] の根拠 + challenge) の正答は「ゲーム機 1 台にコントローラ 2 個を無線で接続」で、en の像をこの場面に当てると正答を退ける方向に働く (既知失敗型 (6) zh / en の語選択が題の誤った側に読める + (9) 比喩を引用題の場面に当てると誤る、D-204 比喩が正答の内容を否定)。jp は問題なし | en: before "Think of a walkie-talkie that only talks to one particular partner nearby." → after "Think of a walkie-talkie that only talks to the partners it has been set up with, as long as they are nearby." (jp / zh は変更不要) |
| L1 | LOW **建議修** | `terms[1].hook_jp` / `hook_zh` / `hook_en` (+ 派生 `memory_hook_*`、`summary.memory_hooks_*[1]`) | 「北欧をまとめた」/「统一北欧」/ "united Scandinavia" は誇張。ハーラル 1 世 (青歯王) の事績として一般にいわれるのはデンマークの統一とノルウェーの支配で、北欧 (スウェーデン等を含む) 全体ではない (前回 JP review #2 LOW の未修)。試験の判断には関わらない | jp: 「名前は、北欧をまとめた 10 世紀のデンマーク王ハーラル 1 世の異名「青歯王」に由来し、」→「名前は、デンマークとノルウェーをまとめた 10 世紀のデンマーク王ハーラル 1 世の異名「青歯王」に由来し、」/ zh: 「名称来自 10 世纪统一北欧的丹麦国王哈拉尔一世的绰号“蓝牙王”，」→「名称来自 10 世纪统一丹麦与挪威的丹麦国王哈拉尔一世的绰号“蓝牙王”，」/ en: "the 10th-century Danish king who united Scandinavia," → "the 10th-century Danish king who united Denmark and Norway," |
| L2 | LOW **建議修** | `terms[2].points[1].text_en` | "shown to the scanner face-up in turn" の face-up は jp「読み取り面を 1 つずつ見せる」に無い限定 (loc review LOW の未修) | en: "so each one has to be shown to the scanner face-up in turn." → "so each one has to be shown to the scanner in turn." |
| L3 | LOW **建議修** | `overview_rows[3].one_line_zh` | 「靠近“一碰”即可通信」の「碰」は接触を含意し、同じ行の `extra_zh[0]`「无线（非接触）」と zh 内でわずかに食い違う (jp「かざして」= 非接触; loc review LOW の未修) | zh: 「靠近“一碰”即可通信的近场通信标准」→「靠近即可通信的近场通信标准」 |
| L4 | LOW 記録のみ | `terms[1].points[0].text_*`、`terms[4].points[0].text_*` | 「電波 / 赤外線の無線なのでケーブル不要」は各 one の言い直し (D-203 §9; 前回 LOW)。overview・IrDA mix と合わせ「ケーブル不要」が 4 箇所に出る | 記録のみ (引用題 q088 / q099 の判断点そのもので、削ると exam 考点の根拠が消える) |
| L5 | LOW **建議修** | `terms[2].points[0].text_jp` | zh / en の `[[jp:非接触型ICカード]]` に対し jp 本文は「非接触型の IC カード」で、原語が jp 本文に文字列として実在しない (D-202 原語照合)。validate の jp-origin warn は見出し語だけを見るため検出しない | jp: 「非接触型の IC カードは RFID を応用したもので、」→「非接触型 IC カードは RFID を応用したもので、」(用語名の表記を揃えるだけ; 用語名は表現ではなく D-198 の対象外。zh / en は変更不要) |
| L6 | LOW 記録のみ | `terms[3].points[1].text_jp/zh/en` | (iii) 判定: 2019h31h-q093 正答エ (交通系の IC 乗車券による改札) と共有する語は「IC 乗車券」「改札」、2013h25a-q021 誤答エ (自動改札機にかざされた IC 乗車カードの読み取り) と共有する語は「自動改札」「かざ」(ed 0.73 / 0.77、Dice 0.29 / 0.30)。分類題の正答内容を NFC の代表的利用例として述べたもので (D-209)、肢の組・順序・固有の数値は無い。例が NFC に結び付いているので、q021 では エ を Bluetooth の事例でないと正しく退けられ、誤答を支持しない (前回 JP review #1・#2 とも LOW) | 記録のみ |
| L7 | LOW 記録のみ | `terms[3].detail_*` 文 2 / `terms[4].detail_*` 文 2 | NFC「スマートフォンどうしのデータ交換」と IrDA「携帯情報端末どうしのデータのやり取り」が同種の用途を述べ、2018h30a-q066 誤答ウ (赤外線・携帯電話のデータ交換) の用途部分と重なる。ただし NFC = 電波・IrDA = 赤外線が one / pairs / overview で明確なので、ウ を NFC と誤る根拠にはならない | 記録のみ |
| L8 | LOW 記録のみ | `terms[1].detail_*`「2.4 GHz 帯」 | 引用題に支持のない仕様事実。§1-8 のとおり一次資料 (Bluetooth SIG Core Specification、全版共通の 2.4 GHz ISM 帯) で正しく、版で変わらない | 記録のみ (根拠を本証拠に記録) |
| L9 | LOW 記録のみ | `overview_rows[2].extra_*[2]` / `pairs[1].rows[1].a_*` / `terms[3].points[2].text_*` | RFID「方式により数 cm〜数 m」は上限がやや狭い (アクティブ型・UHF 帯で数 m 超) が「方式により」「目安」付き (前回 LOW) | 記録のみ |
| L10 | LOW 記録のみ | `terms[0].detail_*` / `key_points_*[0]` | 「1 本の信号線で 1 ビットずつ」はシリアル転送の定番の簡略化 (前回 LOW)。2017h29a-q082 / 2010h22a-q070 の誤答 (パラレル・複数の信号線) との区別には正しく働く | 記録のみ |
| L11 | LOW 記録のみ | `terms[0].quiz` (2011h23tokubetsu-q087) | 選択肢のプラグアンドプレイが本文に説明されない (前回 LOW)。正答 (パラレル転送) は detail で導ける | 記録のみ |
| L12 | LOW 記録のみ | `terms[4].analogy_*`「テレビのリモコンと同じで」 | 比喩というより赤外線の具体例で、「同じ」はプロトコルの同一まで言いかねない (家電リモコンは IrDA ではない)。主張は「向きを合わせないと届かない」性質の共有に留まり、2019h31h-q093 の誤答イ (エアコンのリモコン) を NFC と誤らせる方向には働かない (むしろ赤外線と結び付けて退けられる) | 任意: jp「テレビのリモコンと同じで、」→「テレビのリモコンのように、」/ zh「和电视遥控器一样，」→「就像电视遥控器，」/ en "Like a TV remote, it is" は現状のままで可 |

**未修のまま残る前回 LOW (再掲・記録のみ)**: JP review #2 の `terms[2].fig.steps[2].caption_jp` IC チップの定義前使用・電池を持つタグへの言及なし、loc review の `terms[2].one_zh` / `terms[4].detail_zh` 直訳調、`terms[1].points[1].text_zh`「常用于…器材」、`pairs[0].rows[0].a_zh`「电波」と他欄「无线电波」の揺れ — いずれも事実・判断に影響なし。

確認済みで問題なし: 前回 MEDIUM 3 件の三語での解消 (§0)、限定条件 (考点 9 件の qid 付き考点で落ちなし、q099「物理的な接続を必要としない」・q082「周辺機器側の」形状・q070「電力消費が少ない」を保持)、§9 禁止句 (定型締め句 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (≤2 文・≤83 字)、写し (copy guard 0・choice-echo 0・独立 12 字照合 遮蔽あり / なし 0・近似一致は用語名のみ)、one_zh / one_en 見出し語 5/5、zh 訳語表、図種 (flow steps ×1 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **12** (建議修 4: L1 / L2 / L3 / L5 / 記録のみ 8: L4 / L6〜L12、うち L12 は任意の修正案あり) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。事実面では全 5 用語・考点 12 件・引用 10 題 + 未引用 quiz 2 題で正答と一致し、誤答肢の支持・限定条件落ち・写しは無く、前回 JP review の MEDIUM 3 件は三語とも回帰なく解消している。残る M1 は `terms[1].analogy_en` 1 欄の文字列置換 (B3 補丁) で解消でき、適用後は HIGH 0 / MEDIUM 0 で PASS 相当。L1 / L2 / L3 / L5 も同じ補丁での修正を推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-42-u02
✓ technology-15-42-u02 unit: 0 issues (data/ip/textbook/units/technology-15-42-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-42-u02
✓ technology-15-42-u02 parity: 23 locations, 0 diff
EXIT=0
```
