# Rule A 全数抽検 — technology-15-41-u03 (補助記憶装置とフラッシュメディア — HDD・SSD・USB・SD)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S149 b43)、repo HEAD `bcca0ad3` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b43-u03-a1` merge 結果、sha256 先頭 `04e99306cff900ec`)。
- **対象**: `data/ip/textbook/units/technology-15-41-u03.json` (textbook-unit-v2)、用語 **4 / 4 = 全数** (HDD / SSD / USBメモリ / SDカード) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions / source_figures)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202、D-203、D-204 / D-205 (S138 §2・§6)、D-208 / D-209 (既知の失敗型 (1)〜(10))、D-210。比較: `data/ip/textbook/.planning/v2/technology-15-41-u03/v1-original.json` (用語 4 語・`term_zh`・`term_en`・`unit_summary_*` とも v1 と一致)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・写し / MEDIUM = 誤解を招く・根拠のない限定・欄同士の不整合・題文の言い回しのなぞり (D-208 (1)) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 4 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_*`) が本体の記法除去版 (`**` 除去、`[[jp:X]]` → X) であることをスクリプトで確認 (4 用語 × 3 欄 × 3 語、不一致 0)。
2. **考点 × 引用題 (考点 6 件 = exam 6 + mix 0、全件 qid 付き、引用 qid 延べ 8 件 = 異なり 8 題、全題 topic `technology-15-41`)**: `data/ip/quiz/questions.json` から各題の題文 (`stem_jp_clean` 優先)・選択肢・`correct_answer` を再読し、考点が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないことを 1 件ずつ確認 (§2 表)。
3. **quiz / challenge_questions** (quiz 計 5 枠 = HDD 2・SSD 2・USB 1、challenge 5 題、うち本文で未引用 2 題): 2019r01a-q060 (記憶階層の キャッシュ / 主記憶 / 補助記憶 と装置の組合せ、正答ウ = SRAM / DRAM / SSD) は SSD detail「記憶階層では補助記憶に当たる」と一致し、誤答 (主記憶に HDD・SSD、補助記憶に SRAM・DRAM) を支持する記述なし。2020r02o-q079 (揮発性だけの組、正答イ = DRAM・SRAM) は SSD detail「不揮発性」と一致 (SSD を揮発性とする誤答ウ・エを否定)。他 3 題 (2022r04-q084 / 2024r06-q063 / 2025r07-q075) は本文で引用、§2。
4. **D-198 写し**: validate の copy guard = 0 件 (choice-echo warn の出力もなし)。独立照合: 単元の JP 文字列 85 本 (派生・summary・source_figures 除く、図ラベル・caption・総表・対比表・goals・key_points を含む) を topic 内全 35 題の題文 (`stem_jp_clean`) + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去) — (a) カタカナ 4 字以上と英数を □ 1 字に遮蔽 (遮蔽後の実字 6 未満の窓は除外): **0 件** / (b) 遮蔽なし: **1 件** = `terms[1].points[1].text_jp`「…使われるフラッシュメモリ…」↔ 2018h30h-q076 — 照合用に選択肢を連結した境界 (ウの末尾「…として使われる」+ エの頭「フラッシュメモリは…」) をまたいだ人工的な一致で、題のどの 1 文とも一致しない (偽陽性) / (c) 近似一致 (単元 14 字窓 × 題の 12〜16 字窓、編集距離 ≤3): 4 件。うち 3 件は「フラッシュメモリに記録する / に関する」「の記憶装置より / のうちアクセス時間が」等の一般語の連なり (偽陽性)。**1 件は実質的ななぞり** = `terms[1].points[2].text_jp` ↔ 2024r06-q063 題文 → **M1** (§3)。数値: 一致部「SSDの全データを消して復元できなくする」↔ 題文の対応部 = 正規化 ed 0.18 / bigram Dice 0.75、考点 1 文全体 vs 題文 = ed 0.53 / Dice 0.53 (HIGH 校正例 ed 0.14 / Dice 0.52; S140 b10 u02 の LOW 判定例 = Dice 0.72 / ed 0.25)。目視: カタカナの多い文 (SSD hook・USB hook・SD detail の microSD / SDHC / SDXC、HDD 図ラベル) に題の語句の並びはない。
5. **D-208 既知の失敗型の個別確認**:
   - (1) 選択肢なぞり: `terms[0].points[1]` は 2019h31h-q070 の 4 選択肢のうち 3 つ (HDD・主記憶・キャッシュメモリ) を挙げるが、一揃いでも題の順でもなく (SSD を含まず主記憶→キャッシュの順)、HDD が半導体記憶より遅いという正の事実 → (iii) に当たらない。`terms[1].points[0]` は jp-review r1 の MEDIUM (2022r04-q084 題文の 4 特性の組・順・因果のつなぎのなぞり) が解消済み: 現行は「消費電力が小さい ← モーターもヘッドを運ぶ機構も要らない」の 1 因果のみ。2016h28h-q072 題文 (可動部分なし + 電力消費少) の 2 要素と内容が重なるが、順序は逆 (結果→原因)、語は自作 (円盤を回すモーター / ヘッドを運ぶ機構)、全文 ed 0.95 / Dice 0.08 で、分類題の正答 (SSD) の一般的性質を正の定義として述べたもの (D-209 の除外) → OK。`terms[1].points[2]` (Secure Erase) は分類題 2024r06-q063 の題文に正答を主語として入れて平叙文にした形で、題文の言い回し (SSD・全データ・消去・復元できなくする・方法) を同じ順でなぞる → D-209 の除外 (題の言い回しを再現しないこと) は不成立 → **M1**。数値・場面の流用はないので HIGH ではない。
   - (2) 「など」等の限定語の落ち: 引用題に「など」なし。2022r04-q084 の「IoT 機器の記録装置としても」は題の前提で、考点は消費電力の理由だけを言い限定を閉じない → OK。
   - (3) シラバスの別名を別物として教える: なし (SSD = Solid State Drive、USBメモリ = USB フラッシュドライブを同一物として扱う)。
   - (4) 比喩・図の範囲が one / detail と矛盾: HDD のレコードプレーヤー (針を動かして曲を探す = ランダムアクセス、揺れに弱い) は detail・points[0] と整合。SD のフィルム (記録して取り出し別機器へ) は one・detail と整合。HDD flow 図 (シーク→回転待ち→読み書き) は detail の機械的待ち時間と一致。
   - (5) 前ラウンドで直した主張の zh / en 回帰: jp-review r1 HIGH (`terms[0].points[1]` の限定なし最上級「…キャッシュメモリが最も短い」) は現行で「主記憶やキャッシュメモリのような半導体の記憶装置よりアクセス時間が長い」の相対表現に直り、zh / en も相対表現 (比…更长 / longer than) で回帰なし。r1 MEDIUM (`terms[1].points[0]`) も三語とも 1 因果の形で回帰なし。
   - (6) zh / en の語選びが誤答肢に寄る: `terms[1].detail_en`「without any waiting」と `pairs[0].rows[2].b_*`「待ち時間がなく / 没有等待时间 / with no waiting」が無条件 → L1 (2019h31h-q070 の誤答イ SSD に寄る方向だが、HDD points[1] と key_points[1] [下位ほど遅い] + SSD detail [補助記憶に当たる] で SSD < 主記憶 < キャッシュが本文から導けるので MEDIUM には上げない)。
   - (7) D-210 改正前の規定: 該当なし (法令・規格の改正に触れる題なし)。
   - (8) 比喩 / フックの鍵語が他の見出し語: `terms[1].analogy_*` が次の見出し語 USBメモリ を定義前に使う。引用題・challenge で USB / SSD はいずれも正答側 (2012h24a-q061 エ・2025r07-q075 ウ = c, d, e) で誤答に寄らない → L5 (記録のみ)。
   - (9) フックを題の場面に当てると誤答: HDD hook (Hard ↔ floppy)・SSD hook (固体 = 可動部品なし)・USB hook (接続規格の名)・SD hook (Secure = 著作権保護) を全引用題・challenge に当てても誤答を選ばない。SSD hook は 2009h21a-q057 の誤答ウ (振動・衝撃に弱い) を否定する方向で正。
   - (10) 法令・規格の区分の閉じた列挙: なし。
6. **D-195**: 結論先行 (one = 1 文 × 4、太字あり)、展開 2〜3 文 (3/2/2/2)、比喩・フックが定義の言い換えでないこと (語源・別場面; USB は analogy 空 = D-203 (b) で許容)、定義前使用 (不揮発性 = detail 内で「電源を切っても内容が残る」と同格説明、ランダムアクセス = 考点内で括弧注、記憶階層・主記憶・キャッシュメモリ = 前提単元 u01 / u02 の語、Secure Erase = 考点内で定義、microSD / SDHC / SDXC = 「のように」「といった」の例示のみ)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が + zh・en 相当語) → jp 0 件。ヒットは `points[].kind`「exam」(フィールド値) と `terms[0].detail_en`「Every」内の very のみ (偽陽性)。図の型: HDD = flow steps 3 (登録内)、他 3 語は図なし (定義型・§0-8 で欠如は最大 low、指摘しない)。pair 配置: HDD→SSD (5 行、key = 動く部品)、USB→SD (3 行、key = 差し込む先) 各組 key 行あり。
7. **D-200**: 考点数 2/3/1/0 (≤3 ✓; SDカード は manifest の `freq_in_topic` 0 = topic 内に題がなく、exam 考点・quiz を置けない。validate も 0 issue)、各 JP 文数 1〜2・字数 38〜72 (≤100 ✓、最大は HDD `points[1]` の 72 字)。**framing 件数** (`validateV2.ts` `pointFraming`、全考点): jp 0 / zh 0 / en 0 (上限 2)。
8. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の照合: HDD points[1]「半導体の記憶装置よりアクセス時間が長い」↔ pairs[0].rows[2] / SSD detail の「待ち時間がない」→ 字義上は SSD のアクセス時間 0 と読め、HDD points[1] の比較 [アクセス時間は双方にある] と緊張 → L1 に含めて修正; key_points[0]「磁気で記録するのは HDD だけ」↔ overview_rows / pairs[1].rows[0] 一致; key_points[3]「HDD と SSD は主に組み込み」↔ overview_rows[0..1].extra「外付けもある」と整合 [「主に」で閉じない])。書き方 8 → L6。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 → 定義の言い換えの比喩なし。§9 言い直し → L7。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・比較行・総表の三語一致、`[[jp:…]]` 原語 7 種 (ランダムアクセス / 主記憶 / キャッシュメモリ / 記憶階層 / フラッシュメモリ / USBメモリ / SDカード) が jp 本文に実在 (スクリプト、全 ok)。one_zh / one_en の見出し語 `[[jp:]]` (D-202): USBメモリ・SDカード はあり、HDD・SSD は見出し語が 3 語で同綴りの ASCII のため併記不要 (validate 0)。zh 訳語は `zh_terms.unit.json` に従う (HDD（硬盘驱动器） / SSD（固态硬盘） / U 盘（USB 闪存盘） / SD 卡 / 闪存 / 辅助存储器（外存） / 主存储器（内存） / PC（个人计算机）; validate B6 warn 0)。loc-review r1 の LOW 7 件 (具体的な修正案つき) は現行ファイルに 1 件も反映されていない → L3 / L4 / L8 / L9 として再掲 (§3)。
10. **D-205**: 単元は規格・法令の構成要素の数や固有の数値を述べない。SD detail の「より小さいmicroSDのように大きさの違う種類があり、容量に応じてSDHCやSDXCといった規格もある」は開いた例示 (のように / といった) で数を閉じない → 一次資料照合の対象外。USB hook (Universal Serial Bus の略・汎用接続規格の名) と SD hook (Secure Digital の略・著作権保護機能 [CPRM] から Secure) は名称由来の一般事実として確認、規格の数値主張はなし。
11. **前段の指摘の解消確認**: journal `journal.b43-u03-a1.jsonl` — jp-review r1 REVISE (high 1 / medium 1 / low 6) → r2 PASS (low 6)、loc-review r1 PASS (low 7)。r1 HIGH (`terms[0].points[1]` 限定なし最上級) と r1 MEDIUM (`terms[1].points[0]` の 2022r04-q084 題文なぞり) は解消・三語回帰なし (§1-5 (5))。r1 low のうち アーム (図 caption で未定義) は現行 caption から消え解消、USB analogy (定義の言い換え) は analogy 空で解消。r1 / r2 で LOW とされた Secure Erase 考点は本監査で近似一致の数値と D-209 の除外条件を当てて **MEDIUM (M1) に格上げ**。r2 low の「待ち時間なし」は L1 (建議修)、「主記憶の内容を長く保存」は L2 (建議修) に格上げ。
12. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (4 / 4)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | HDD | OK — exam 2 / 2 題: ヘッドを任意の位置へ動かせるので先頭から順にたどらず読み書きできる = ランダムアクセス (2012h24h-q063 正答エ; 誤答 = CD-ROM より遅い・主記憶としても使う・保持に電力が要る を支持しない [detail「不揮発性」「主に補助記憶」で否定方向]) / ヘッド移動・回転待ちの分、主記憶・キャッシュより アクセス時間が長い、記憶階層は下位ほど遅い (2019h31h-q070 正答ウ キャッシュメモリ; 考点は HDD が最短でないことを言い正答と矛盾せず、限定なし最上級は r1 で除去済み)。flow steps 3 は detail と一致。analogy (レコード) / hook (Hard ↔ floppy) は事実として正しい | OK (図 flow 登録内) | caption_en「track」(L9) | L1 (関連), L6, L7, L9 |
| 2 | SSD | exam 3 / 4 題: 消費電力が小さいのはモーターもヘッド機構も要らないから (2016h28h-q072 正答エ / 2022r04-q084 正答エ; r1 MEDIUM 解消) / フラッシュメモリの書換え回数に限りがあり寿命に関わる (2009h21a-q057 正答ア; 誤答 = 読出しが遅い・振動に弱い・断片化 を支持しない — pairs[0].rows[3] は SSD = 衝撃に強い) / Secure Erase は SSD の全データを消して復元できなくする消去方法 (2024r06-q063 正答ア; 誤答 = 磁気消去・セキュアブート・データクレンジング を支持しない。事実は正しいが題文のなぞり → **M1**)。detail「待たずに届く / without any waiting」は過剰 → L1 | **M1** (D-198 / D-208 (1)) | L1 (en が強い) | **M1**, L1, L5, L6 |
| 3 | USBメモリ | OK — exam 1 / 2 題: 内部の記憶素子は半導体のフラッシュメモリ (2012h24a-q061 正答エ / 2025r07-q075 正答ウ = RAM・SSD・USB; 考点は USB だけを言い、q075 の他の項目 [CD-ROM・DVD-RAM] に触れず誤答を支持しない)。hook (Universal Serial Bus) 正しい | OK (analogy 空 = D-203 (b)) | points[0].text_zh の `[[jp:]]` 非対称 (L3)、one_zh の語順 (L4) | L3, L4, L7 |
| 4 | SDカード | 考点なし (topic 内に題 0、manifest `freq_in_topic` 0)。one / detail (カメラ・スマホで写真・動画、microSD 等の大きさ違い、SDHC / SDXC 等の容量規格 [開いた例示]) / hook (Secure Digital、著作権保護から Secure) / analogy (フィルム) とも事実として正しい | OK | one_zh の語順 (L4)、hook_zh「著作权」(L8) | L4, L8 |

**単元レベル**: goals 3 点・overview_cols 2 (記録の仕組み / 使い方)・overview_rows 4 行・pairs 2 組 (HDD / SSD 5 行 key 1、USBメモリ / SDカード 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (2019r01a-q060 / 2020r02o-q079 / 2022r04-q084 / 2024r06-q063 / 2025r07-q075 — 本文と矛盾なし、§1-3)。事実誤りなし。key_points[2] は L2。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 9 (うち 建議修 6)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[1](SSD).points[2].text_jp/zh/en` | D-198 / D-208 (1) — 分類題 2024r06-q063 の題文に正答 (Secure Erase) を主語として入れて平叙文にした形。なぞった言い回し = 「SSDの全データを消して復元できなくする (ための消去方法)」 ↔ 題文の対応部 (SSD の・全ての・データを・消去し・復元できなくする・方法) を同じ順で再現 (一致部 ed 0.18 / Dice 0.75、文全体 Dice 0.53 = HIGH 校正の Dice 0.52 以上)。D-209 の除外 (正答を一般的な定義として述べる) は題の言い回しを再現しないことが条件で不成立。数値・場面の流用はなく事実も正しいので HIGH ではない。加えて r1 / r2 が指摘したとおり何をする方法か (装置自身の消去機能・上書きでは残る領域) の情報がない | jp「**Secure Erase**は、SSDの全データを消して復元できなくするための消去方法である。」→「**Secure Erase**は、SSDが内蔵する消去機能を命令で動かし、記憶領域をまとめて消す方法である。ファイルの削除や上書きでは残ることがある領域のデータまで消せる。」(2 文・82 字) / zh「**Secure Erase** 是一种把 SSD 上的全部数据删除、使其无法恢复的擦除方法。」→「**Secure Erase** 是通过命令启动 SSD 内置的擦除功能、把存储区域一并清除的方法。连删除文件或覆盖写入后可能残留数据的区域也能清除。」/ en "**Secure Erase** is an erasure method that wipes all data on an SSD so that it cannot be recovered." → "**Secure Erase** is a method that commands an SSD's built-in erase function to clear its storage area in one go. It also clears areas where data can remain after files are deleted or overwritten." (修正後 jp を topic 全 35 題と再照合: 12 字窓 0 / 近似 ed≤3 0 / q063 題文と ed 0.88・Dice 0.14; framing jp/zh/en 0; 誤答 [磁気消去・セキュアブート・データクレンジング] に寄る語なし) |
| L1 | LOW **建議修** | `terms[1](SSD).detail_jp/zh/en` 2 文目、`pairs[0].rows[2].b_jp/zh/en` | SSD に待ち時間が全くないと読める (ないのは HDD のような機械的な待ち時間)。en「without any waiting」が最も強い。2019h31h-q070 (アクセス時間最短) の誤答イ SSD に寄る方向で、HDD points[1] (アクセス時間の比較) とも字義上緊張。本文の他欄 (key_points[1] + SSD detail「補助記憶に当たる」) から順位は導けるので MEDIUM にしない | detail jp「データの場所を電気的に指定して読み書きするので、目的のデータまで待たずに届く。」→「データの場所を電気的に指定して読み書きするので、HDDのようなヘッドの移動や円盤の回転を待つ時間がない。」/ zh「它用电信号指定数据的位置来读写，所以无需等待就能直接取到目标数据。」→「它用电信号指定数据的位置来读写，所以没有 HDD 那样等待磁头移动和盘片旋转的时间。」/ en "It reads and writes by addressing the data's location electrically, so it reaches the data without any waiting." → "It reads and writes by addressing the data's location electrically, so there is no waiting for a head to move or a platter to turn as in an HDD." / pairs b_jp「待ち時間がなく速い」→「機械の待ち時間がなく速い」/ b_zh「没有等待时间，较快」→「没有机械等待时间，较快」/ b_en "Faster, with no waiting" → "Faster, with no mechanical delay" (修正後 jp を再照合: 12 字窓 0 / 近似 0) |
| L2 | LOW **建議修** | `key_points_jp[2]` / `key_points_zh[2]` / `key_points_en[2]` | 「主記憶の内容を長く保存する役目」は補助記憶の役目を主記憶の写しの退避先に狭める (r2 low)。引用題の誤答には寄らない (2012h24h-q063 イ「主記憶としても使う」とは別) | jp「補助記憶は電源を切っても内容が残り、主記憶の内容を長く保存する役目を持つ。」→「補助記憶は電源を切っても内容が残り、プログラムやデータを長く保存する役目を持つ。」/ zh「辅助存储器（外存）断电后内容仍然保留，承担长期保存主存储器（内存）中内容的作用。」→「辅助存储器（外存）断电后内容仍然保留，承担长期保存程序和数据的作用。」/ en "Auxiliary storage keeps its contents when the power is off and serves to hold what is in main memory for the long term." → "Auxiliary storage keeps its contents when the power is off and serves to hold programs and data for the long term." |
| L3 | LOW **建議修** | `terms[2](USBメモリ).points[0].text_zh` | en は答えになる素子に `[[jp:フラッシュメモリ]]` を付けるが zh は付けない (三語の `[[jp:]]` 非対称、loc-review r1 low の未反映) | zh「U 盘[[jp:USBメモリ]]内部保存数据的元件是半导体闪存。」→「U 盘[[jp:USBメモリ]]内部保存数据的元件是半导体闪存[[jp:フラッシュメモリ]]。」 |
| L4 | LOW **建議修** | `terms[2](USBメモリ).one_zh`、`terms[3](SDカード).one_zh` | 主語がなく見出し語が文末に来る (HDD / SSD の「X 是…」と形がそろわない; loc-review r1 low の未反映、SD も同型) | USB zh「直接插在 **USB** 接口上使用、内置**闪存**的便携存储介质，也就是 U 盘[[jp:USBメモリ]]。」→「U 盘[[jp:USBメモリ]]是直接插在 **USB** 接口上使用、内置**闪存**的便携存储介质。」/ SD zh「把**闪存**装进又薄又小的卡片中、插入设备的**卡槽**使用的存储介质，即 SD 卡[[jp:SDカード]]。」→「SD 卡[[jp:SDカード]]是把**闪存**装进又薄又小的卡片中、插入设备的**卡槽**使用的存储介质。」 |
| L5 | LOW | `terms[1](SSD).analogy_jp/zh/en` | 次の見出し語 USBメモリ を定義前に比喩の鍵語に使う (D-208 (8) の形)。引用題・challenge で USB / SSD はどちらも正答側で誤答に寄らず、日常語として通じる | 記録のみ |
| L6 | LOW | `pairs[0].rows[2]`、`terms[0].detail_*` 2 文目、`terms[1].detail_*` 2 文目、`terms[0].points[1]`、`key_points_*[1]` | 書き方 8: HDD = 機械の待ち時間で遅い / SSD = 速い の対比が pairs に加え 2 つの detail・HDD 考点・要点で繰り返される (r1 low)。HDD 考点は q070 の根拠、要点は記憶階層の一般論で、削ると考点の根拠が消える | 記録のみ |
| L7 | LOW | `terms[0].points[1].text_*` 2 文目 ↔ `key_points_*[1]`、`terms[2].points[0]` ↔ `terms[2].one_*` | §9 言い直し: 「記憶階層では下位ほど遅くなる」と要点 2 が同内容 (r2 low)、USB 考点「素子は半導体のフラッシュメモリ」が one の「フラッシュメモリ内蔵」の言い直し (r1 low)。いずれも引用題の正答の根拠で事実は正しい | 記録のみ |
| L8 | LOW **建議修** | `terms[3](SDカード).hook_zh` (+ 派生 `memory_hook_zh`, `summary.memory_hooks_zh[3]`)、`pairs[0].rows[3].label_zh`、`terms[0].fig.steps[2].caption_zh`、`pairs[1].rows[2].b_zh` | zh の措辞 (loc-review r1 low 4 件の未反映): 日本語の「著作権」の写し / 日本語の中黒「・」/ 直訳調の「磁性的方向」/ 名詞の連結で用途が読み取りにくい | hook_zh「SD 是 Secure Digital 的缩写，因为具备保护著作权的功能，所以名字里带有“Secure”。」→「SD 是 Secure Digital 的缩写，因为具备版权保护功能，所以名字里带有“Secure”。」/ label_zh「冲击・振动」→「冲击与振动」/ caption_zh「位置对准后，磁头读取或改写磁性的方向。」→「位置对准后，磁头读取或改写磁化方向。」/ b_zh「相机和智能手机的记录」→「在相机、智能手机中记录照片和视频」 |
| L9 | LOW **建議修** | `terms[0](HDD).fig.steps[0].caption_en` | jp「目的のデータがある位置へ移る」に対し en が原文にない専門語 track を足す (事実誤りではない; loc-review r1 low の未反映) | en "First, the head moves between the center and the outer edge of the platter to reach the track holding the data." → "First, the head moves between the center and the outer edge of the platter to reach the position where the target data sits." |

**対比の出現欄 (書き方 8 の列挙)**: ① HDD = 磁気 / SSD・USB・SD = フラッシュ: `overview_rows[*].extra[0]`、`pairs[0].rows[0]`、`pairs[1].rows[0]` (両側同じ = 共通点)、`key_points[0]` → 総表の構造 + 要点 1 回で許容。② 動く部品の有無: `pairs[0].rows[1]` (key)、各 one (定義そのもの)、SSD hook (Solid State の語源) → 許容。③ 速さ: L6。④ 衝撃: `pairs[0].rows[3]`、HDD detail・analogy (針飛び) → analogy は別像で反復に数えず許容。⑤ 価格: `pairs[0].rows[4]`、HDD detail → 2 箇所で許容。⑥ 組み込み / 持ち運び: `overview_rows[*].extra[1]`、`key_points[3]`、goals[1] (予告) → 許容。⑦ USB 端子 / カードスロット: `pairs[1].rows[1]` (key)、各 one、goals[2] (予告) → 許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `source_figures[1]` が 2015h27a-q100 (PC 処分時の消去処理速度の表) を指すが、同題は v1 の challenge にあって現行の challenge_questions からは外れている (2024r06-q063 に差し替え)。本文・quiz からの参照もない残置ポインタ。validate は通るのでゲート対象外。
- O2 `key_points_jp[3]` は見出し語 4 つを 1 文に置く (r1 low) が、「HDDとSSD」「USBメモリとSDカード」の 2 群の分類として読め、D-197 機械判定 0。独立照合の偽陽性 4 件 (遮蔽なし 1 + 近似 3) は §1-4。

確認済みで問題なし: 限定条件 (考点 6 件全て保持、§2)、§9 禁止句 grep (jp 0)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤72 字)、図の文字列の写し (validate 0、独立照合は M1 以外偽陽性)、`[[jp:]]` 原語 (7 種全て jp 本文に実在)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×1 / 図なし ×3)、派生フィールド一致、用語・`term_zh`・`term_en`・`unit_summary_*` の v1 不変量、D-205 (数の主張なし)、D-210 (該当なし)、r1 HIGH / MEDIUM の解消と三語の非回帰。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **9** (建議修 6: L1 / L2 / L3 / L4 / L8 / L9、記録のみ 3: L5 / L6 / L7) |

## 5. 判定

**FAIL (補丁で解消可能)** (D-199: MEDIUM 1)。M1 は B3 補丁 (`terms[1].points[2].text_jp/zh/en` の三語の文字列置換、構造変更なし) で解消でき、修正後の jp は topic 全 35 題と 12 字窓 0 / 近似 0 を本監査で確認済み。補丁後に validate / parity を再実行すれば PASS 相当。L1〜L4・L8・L9 は同じ補丁での修正を推奨。その他の考点・図・比較表に事実誤り・誤答肢の支持・限定条件の落ちはない。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-41-u03
✓ technology-15-41-u03 unit: 0 issues (data/ip/textbook/units/technology-15-41-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-41-u03
✓ technology-15-41-u03 parity: 21 locations, 0 diff
EXIT=0
```
