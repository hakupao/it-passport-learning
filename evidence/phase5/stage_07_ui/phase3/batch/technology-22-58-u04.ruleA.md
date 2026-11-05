# Rule A 全数抽検 — technology-22-58-u04 (モバイル広域通信と伝送性能)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成; 修正案の検証は scratchpad の写し `patched.json` で実施。framing 計算のため一度だけ `apps/web/src/lib/textbook/` に一時 .ts を置いて実行し、直後に削除 [git status で残存なしを確認])。
- **Date**: 2026-11-05 (S143 b17)、repo HEAD `09cdb2a2` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b17-u04-a2` merge 結果、`merged.json` とバイト一致、sha256 先頭 `b2f8588736b35d22`)。
- **対象**: `data/ip/textbook/units/technology-22-58-u04.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (WiMAX / LTE / 5G / 伝送速度 / bps) + 単元レベル (goals / overview_cols / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し、(iii) 具体例・選択肢の組の流用・誤答肢の打ち消し、b14 追補 = 正答で埋めた題文との照合) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202 (one_zh / one_en の `[[jp:]]` 見出し語、書き方 7・8・9)、D-203、D-204、D-205、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8 (図種は登録 6 種のみ)。比較: `data/ip/textbook/.planning/v2/technology-22-58-u04/v1-original.json` (用語 5 語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` とも v1 と一致; challenge は v1 の 4 題 [q095 / q076 / q096 / q081] → 5 題 [q089 / q073 / q076 / q096 / q095] に変更)。過去の審査: `journal.b17-u04-a1.jsonl` (jp-review #1 REVISE [medium 4 / low 9] → #2 REVISE [medium 1 / low 8]) → `journal.b17-u04-a2.jsonl` (jp-review #1 REVISE [medium 1 / low 7] → #2 PASS [low 7]、loc-review #1 PASS [low 8])。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち・D-198 写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合・D-198 (iii) の選択肢の組の再現・誤答肢の打ち消しだけの考点 (b14 u02 M1 / b15 u07 M1 / b16 u12 M1〜M3 / b17 u01 M4 の前例) / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ (WiMAX・bps は analogy 空 = 省略可の欄)。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (78 箇所、不一致 0; `overview.intro_*` は `goals_*` の記法除去・連結と目視で一致)。`points[].text_*` を写す派生欄は無い (B3 は本体欄の置換だけで足りる)。
2. **考点 × 引用題 (考点 全 10 件 = exam 7 + mix 3、qid 付き 8 件、引用 qid 延べ 9 件 = 異なり 8 題)**: `data/ip/quiz/questions.json` (+ `translations/<exam>.json` の `stem_jp_clean`) から各題の題文・選択肢・`correct_answer` を再読 (全題 topic `technology-22-58`)。考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をせず、題の前提を外していないこと、選択肢・判断項目の組を再現していないか / 誤答肢を打ち消すだけでないか (D-198 (iii)) を 1 件ずつ確認 (§2 表)。
   - **計算の再計算**: 2009h21a-q082 (100 Mbit/s・1 GB・効率 20% → 8×10⁹ ÷ 2×10⁷ = 400 秒、正答ウ) / 2020r02o-q095 (20 Mbps・80%・1 GB = 10³ MB → 8,000 Mbit ÷ 16 Mbps = 500 秒、正答エ) / 伝送速度 の図 steps (600 MB × 8 = 4,800 Mbit、40 × 0.5 = 20 Mbps、4,800 ÷ 20 = 240 秒) → 全て一致。図の数値 (600 MB / 40 Mbps / 50%) は両題の数値と異なる (実効 20 Mbps が q082 の実効値と同じになるのは偶然で、題の条件の組は使っていない)。`terms[3].points[0]` 2 文目「8 倍を落とすと答えが 8 分の 1」は q082 誤答イ (50) / q095 誤答ウ (62.5) に当たる計算の落とし穴の一般表現 (選択肢の組・題の数値は出さない) → L6。
   - **(iii) の判定規則** (u01 §1-2 と同じ): 考点の見出し語についての情報が「選択肢・判断項目の組の再現」または「誤答肢の場面を再現して打ち消すだけ」に尽きる → MEDIUM。正の原則・定義を述べたうえで取り違えやすい隣の概念を両側とも正の定義で区別する → LOW。
3. **quiz / challenge_questions** (quiz 計 9 枠 = 異なり 9 題; challenge 5 題は全て考点の引用題と重複、本文で未引用は `terms[1].quiz` の 2026r08-q081 のみ)。2018h30h-q089 (LTE = 3G より高速な携帯電話の無線通信規格) は LTE one・考点で解ける。2019h31h-q073 (LTE より高速・多端末・低遅延 = 5G) は 5G one・考点で解ける。2026r08-q076 (LPWA: 無線 LAN より広く・4G より少ない) は 5G `points[2]` で解ける。2017h29h-q096 (輻輳) は 伝送速度 `points[1]`、2020r02o-q088 (無線 LAN の判断項目、正答 = b のみ) は `points[2]` で b を肯定し、a (暗号化技術で速度が決まる) と c (IP アドレスの代わりに ESSID) を支持する記述は無い (ESSID は前提単元 u03 の見出し語)。2011h23a-q056 (伝送速度の単位 = bps) は bps one・考点で解ける。**2026r08-q081 (Bluetooth の規格に含まれる省電力通信 = BLE)** は LTE の quiz に置かれ、LTE は誤答肢の一つにすぎず、BLE は次単元 u05 の見出し語で本単元では教えない (a1 の BLE 考点は a2 で削除済み) → L8。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合: 単元の JP 文字列 71 本 (派生フィールド・overview.intro・summary 除く) × topic 内全 87 題の題文 + 選択肢 + **全題の題文を正答で埋めた文** (計 522 本)、12 字連続一致 (句読点・記号・空白・記法除去)。
   - **(a) 見出し語 + カタカナ 4 字以上 + 英数を遮蔽 (遮蔽後の実字 6 未満の窓は除外) → 0 件**。
   - **(b) 遮蔽なし → 0 件**。
   - **近似一致** (12 字窓で 1〜2 字置換、遮蔽なし) → 4 題 × 2 本 (題文 / 正答込み題文) で、全て `terms[0].detail_jp`「(回線工事をしなくても) インターネットに接続でき」↔ 2015h27a-q066 / 2018h30a-q064 イ / 2018h30h-q100 / 2019h31h-q058 の「インターネットに接続」+ 助詞 = 一般句の偽陽性。
   - **文全体の類似度** (正規化編集距離 ed / bigram Dice / 最長共通連続 LCS、全文 × 全題の文 [行・文単位にも分割]): 単元内の最大は `terms[1].points[0]` ↔ 2018h30h-q089 正答ウ **Dice 0.45 / ed 0.86 / LCS 9** (節の順は逆: 考点 = 携帯電話網の規格 → 3G より高速、正答肢 = 3G より高速 → 携帯電話の規格)。次いで `terms[4].points[0]` ↔ 2011h23a-q056 正答込み題文 Dice 0.41 / ed 0.68 / LCS 6、`terms[2].points[0]` ↔ 2019h31h-q073 正答込み題文 Dice 0.30 / ed 0.73 / LCS 8。3 件とも「正答肢 (または正答込み題文) が用語の定義そのものを述べる型」で、考点はその定義を述べる (u01 の q058 ↔ NIC one_jp と同じ扱い = D-198 で可) → §9 言い直しの L5 に含める。他の考点は Dice ≤0.36。HIGH 較正例 (ed 0.14 / Dice 0.52)、b14-u05 H1 (ed 0.44 / Dice 0.57 / LCS 18) に届くものは無い。
   - **正答で埋めた題文との照合 (穴埋め題 = 2026r08-q076 の 1 題)**: 空欄 a・b を正答エで埋めた文 (LPWA は通信範囲が無線 LAN に比べて広く、消費電力が 4G に比べて少ない) と `terms[2].points[2]` は **Dice 0.27 / ed 0.91 / LCS 5**、12 字一致 0 (遮蔽あり・なしとも)。節の順は逆 (考点 = 4G より省電力 → 無線 LAN より広域) で、句ごとに同じ順序でなぞる b14 u05 H1 の型ではない → 写し (HIGH) ではない。ただし考点の命題が穴埋め文の命題 (比較の相手 2 つ = 無線 LAN と 4G の組) そのもので、見出し語 5G については「5G のほかに」以外に何も言わず、LPWA は次単元 u05 の見出し語 (同じ q076 を u05 が引用) → L1 建議修 (比較相手の組を外し、LPWA の名の意味 [少ない電力・広い範囲] に絞る)。key_points 5 本は全題と Dice ≤0.27。
   - **(iii) 選択肢・場面の流用 (目視)**: §1-2 の規則で M1 (MVNO)・L1 (LPWA)・L6 (計算の落とし穴・干渉の判断項目 b) (§2 表・§3)。jp-review a1 #1 の MEDIUM 3 件 (LTE ↔ q089 誤答ア・イ、輻輳 ↔ q096 誤答ア・イ、bps ↔ q056 誤答イ・エ の同順打ち消し) は 3 件とも文が削除され解消、退行なし。比喩 (通話用の道を幹線道路に / 車線・合流・台数の道路 / 水道管) はいずれも引用題に無い場面。
5. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2/2/2/2/2 文、比喩・フックが定義の言い換えでないこと (WiMAX = 略称の展開 / LTE = 名の由来 / 5G = G は Generation で Giga ではない / 伝送速度 = 道のり = 速さ × 時間の形 / bps = b と B の字形; 比喩 3 つは別の場面)、定義前使用 (基地局・携帯電話網 = 平明語; 4G = LTE one の括弧で「第 4 世代」、3G は overview / LTE detail で 4G の前の世代として文脈から分かる; 遅延 = 5G detail で定義 [goals・one の「低遅延」が先 = 予告・定義文の一部]; IoT = 5G detail の「多数のセンサーを使う」で補足; MVNO・LPWA = 考点内で定義; 伝送効率・実効速度 = 伝送速度 detail [図 step 2 が先、caption が「実際に使える割合を掛けて」とその場で説明 = jp-review a1 #2 / a2 #1・#2 low] → L9; 輻輳 = 考点内で定義; 干渉 = 平明語)、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / ポイント / 注意 → **`overview_cols_jp[1]`「押さえどころ」= 試験対策の言い方 (v2 全単元で本単元だけ、validate の §9 対象外の列見出し) → L2**、`terms[3].fig.steps[2].caption_jp`「秒数が出る」・`key_points_jp[4]`「実際に出る速度」(+ 派生 1) = 通常の用法、`overview.freq_badge`「頻出」はバッジ。zh grep [考试 / 务必 / 重要 / 一定 / 必须 / 常考 / 记住 / 牢记 / 选项 / 注意] → bps `detail_zh`「必须统一单位」(+ 派生 1) = 通常の用法; en grep [exam / important / must / always / remember / make sure / tested / option / note that / key] → bps `detail_en` "must match"・"Example of use" 内の exam・`overview_cols_en[1]` "Key point" = 通常の用法)、図の型 (伝送速度 = flow steps 3、他 4 用語 = 図なし; 登録内。jp-review a1 #1 の飾り図 2 枚 [LTE 世代の流れ・5G 特徴の木] は a1 #2 で削除済み)、pair 配置 (LTE→5G は 5G の後、伝送速度→bps は bps の後、各組 key 行 1)。
6. **D-200**: 考点数 1/1/3/3/2 (≤3 ✓)、各 JP 文数 1〜2・字数 37〜79 (≤100 ✓、最大は 伝送速度 `points[0]` の 79 字)。**framing 件数** (validateV2 `pointFraming` を tsx で全考点に適用): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 / D-204 単元全体点検**:
   - **限定語「など」の落ち (b16 u11 M1 型)**: 引用題 8 題の題文・正答に「など」の限定は無い (q096 正答 = 通信の急増 → 許容量超え → つながりにくい、の 3 節は考点に全て対応)。伝送速度 detail の「制御情報など」は本文側の幅で保持。
   - **別名の扱い (b15 u10 M1 型)**: WiMAX / Wi-Fi は別物として正しく区別 (`terms[0].points[0]`)、伝送速度 / bps は量 / 単位として区別し同一とも別物とも誤らない、LTE の「4G 相当 / 4G を代表する方式として扱われる」は 3.9G の扱いを含む言い方で、`overview_rows[1]`・`pairs[0].rows[0]` (4G 相当) と一致。
   - **比喩・図の範囲 (b15 u06 M1 型)**: 5G の比喩 (車線増 = 大容量、合流の待ち = 遅延、膨大な車 = 多数同時接続) は one の 3 特徴と対応し、否定内容を運ばない。LTE の比喩 (通話用の道を荷物用の幹線道路に) は detail「3G より速く」と一致。伝送速度の比喩 (水道管の太さ) と hook (データ量 = 伝送速度 × 時間) は detail 1 文目 (時間 = データ量 ÷ 伝送速度) と同じ段階の式で、伝送効率を掛ける 2 文目を否定しない。
   - 「〜だけ」「〜ない」の照合: `terms[2].points[2]`「5G のほかに」と 5G detail「IoT の通信基盤としても期待」・`key_points_jp[1]` は衝突しない (a1 #2 MEDIUM [LPWA は 5G と狙いが異なる] は文が削除され解消)。a2 #1 MEDIUM (`pairs[0].rows[2]` 向く用途の二分法) は行が削除され解消、`key_points_jp[1]` は detail と同じ「期待されている」に揃った。a1 #1 MEDIUM (`goals_jp[0]` の「範囲と世代で見分ける」) は「WiMAX や LTE が広域向け」に絞られ、`key_points_jp[0]` と一致 → 解消。`goals_jp[2]`「bps とバイトの換算」(a2 #1 low) は「ビットとバイトの換算」に直り解消。
   - 書き方 8 (対比の出現欄) → L7。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0 (範囲の広がり 1 件 = L6)。§6 → 指摘なし。§9 言い直し → L5。
8. **三語**: zh・en が jp と同じ事実か (追加・欠落)、図ラベル・caption・比較行・総表セルの三語一致、`[[jp:…]]` 原語 11 種 (伝送効率 / 伝送速度 / 低遅延 / 多数同時接続 / 実効速度 / 干渉 / 携帯電話網 / 無線LAN / 輻輳 / 遅延 / 高速大容量) が jp 本文に実在 (スクリプト、全 ok; 無線LAN は jp 本文では「無線 LAN」と空白入りの表記)、one_zh / one_en の見出し語併記 5/5 (WiMAX / LTE / 5G / bps は zh_terms どおり見出し語そのもの; 伝送速度 は `[[jp:伝送速度]]`)、zh 訳語が `zh_terms.json` に従うこと (传输速率 / 无线LAN / 局域网（LAN）/ 广域网（WAN）/ IoT（物联网）/ MVNO（虚拟移动网络运营商）/ 基站 / 手机 / 智能手机 / 比特 / 字节 / 通信线路 / 移动通信 一致; validate B6 warn 0)。loc-review #1 (PASS 輪) の low 8 件は全て未反映 → 計算の語順 (zh) と `[[jp:]]` の位置 (en) を L4 建議修、輻輳 zh の直訳調を L3 に同梱、LPWA en の 2 文は L1 の修正で解消、残り 4 件 (街単位 ↔ 整座城市 / town、LTE one_en の言い回し、key_points_en[3] の "so"、实际速率 ↔ 有效速率) は記録のみ (L9)。
9. **D-205**: 改正される文書 (規格・法令・ガイドライン・知識体系) の数・構成・名称を述べる箇所なし (WiMAX / LTE / 5G は方式名、IEEE 802.16 等の規格番号なし、「第 5 世代」は世代の番号で文書の版ではない) → 該当なし。
10. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文、修正案を当てた写しも)。

## 2. 用語別判定 (5 / 5)

| # | 用語 | 事実 (考点 × 引用題、限定条件、D-198 (iii)) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | WiMAX | 事実 OK — 考点 mix 1 件 (qid なし、freq 0): 名前は Wi-Fi に似るが構内向けの無線 LAN ではなく広域向けの規格 — 正しい。detail「街単位の広い範囲 / LAN と WAN の分類では広域側」は、WiMAX が本来 MAN 規格である点で緩いが (a1 #1 low)、シラバスの LAN / WAN 二分の範囲で許容。hook の略称展開 (Worldwide Interoperability for Microwave Access) は正しく、a1 #1 low (Wi = Wi-Fi と同じと読める) は文が削除され解消 | OK (図なし・比喩なし) | 街単位の規模表現 L9 | L9 |
| 2 | LTE | 事実 OK — exam 1 / 1 題: 携帯電話網の規格で 3G より高速なデータ通信 (2018h30h-q089 正答ウ; 誤答 ア [端末同士の直接通信]・イ [数 m の PAN]・エ [小型基地局] を支持しない; 限定「3G より」保持)。a1 #1 MEDIUM (誤答ア・イの同順打ち消し) 解消。考点は正答肢 (定義型) と Dice 0.45 で節の順は逆 → 写しではないが one・detail の言い直し (L5)。quiz の 2026r08-q081 は本単元で解けない (L8) | OK (図なし) | one_en の言い回し L9 | L5, L8, L9 |
| 3 | 5G | exam 2 / 2 題 + mix 1: LTE より高速大容量・低遅延・多数同時接続 (2019h31h-q073 正答エ; 限定「LTE より」保持) → L5 / **mix: MVNO は他社の回線を借りる事業者の形態で 5G とは別物 (q073 誤答イの打ち消し) → M1** / LPWA は 4G より省電力・無線 LAN より広範囲 (2026r08-q076 正答エ = 広く・少ない; 比較の相手 2 つは題と同じ、5G は「ほかに」のみ) → L1。detail の 遅延の定義・IoT「期待されている」は正しい | **M1** (D-198 (iii))、L1 (穴埋め文の命題) | points[0].text_en の `[[jp:]]` 位置 L4 | **M1**, L1, L4, L5 |
| 4 | 伝送速度 | 事実 OK — exam 3 / 4 題: 転送時間 = ビットにしたデータ量 ÷ (伝送速度 × 伝送効率) (2009h21a-q082 正答ウ 400 / 2020r02o-q095 正答エ 500、再計算一致; 「8 分の 1」は両題の誤答 [50 / 62.5] に当たる一般の落とし穴 → L6) / 輻輳 = 利用の集中で処理能力を上回り通信が滞る (2017h29h-q096 正答ウ; a1 #1 MEDIUM [誤答ア・イの同順打ち消し] 解消; 題の「ネットワークの許容量」を「回線の処理能力」に狭めている → L3) / 無線 LAN で近くの別の無線と干渉すると速度低下・不安定 (2020r02o-q088 正答イ = b のみ; 題の「他の無線 LAN との」を「近くの別の無線」に広げる [事実は正しい] + 見出し語は u03 の 無線LAN → L6)。flow steps 3 の数値・計算は §1-2 で一致 | OK (flow steps 3 = 登録内) | points[0].text_zh の語順 L4 / points[1].text_zh の直訳調 L3 | L3, L4, L5, L6, L9 |
| 5 | bps | 事実 OK — exam 1 / 1 題 + mix 1: 通信の速さの単位 = bps (2011h23a-q056 正答ア; a1 #1 MEDIUM [誤答イ・エの同順打ち消し] 解消; 正答込み題文と Dice 0.41 = 定義型 → L5) / mix: 伝送速度は量の名前、bps はその単位 — 正しい (pairs[1].rows[0] と同じ対比 → L7)。detail の接頭語 k / M / G (10³ / 10⁶ / 10⁹) と 1 バイト = 8 ビットは正しい | OK (図なし・比喩なし) | OK | L5, L7 |

**単元レベル**: goals 3 点・overview_cols 2 (`[1]` は L2)・overview_rows 5 行・pairs 2 組 (LTE / 5G 2 行 key 1、伝送速度 / bps 2 行 key 1)・key_points 5・summary (記法除去版と一致)・challenge_questions 5 件 (全て考点の引用題、§1-3)。`key_points_jp[4]`「実際に出る速度は輻輳や電波の干渉によって下がる」は q096・q088 と同範囲の一般化で正しい。事実誤りなし、三語一致。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 9 (うち 建議修 4)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[2](5G).points[1].text_jp` / `text_zh` / `text_en` (kind mix、qid `2019h31h-q073` は維持) | D-198 (iii) 誤答肢の打ち消しだけの考点 (b17 u01 M4 / b15 u07 M1 と同型): q073 は特徴から移動通信システムの名前を問い (正答エ 5G)、MVNO は誤答イ。考点の正の内容は誤答肢 MVNO の定義で、見出し語 5G についての情報は「通信方式の世代を表す」(= one・hook の言い直し) と「MVNO とは別物」に尽きる。MVNO は単元・topic の見出し語ではなく、5G と取り違えやすい組とも言えない (a2 #2 low も同旨)。a2 #2 は「誤答肢 1 つで列挙・同順ではない」として low にしたが、Rule A の前例 (u01 M4 = 誤答肢 1 つの打ち消し) では MEDIUM。修正: 5G = 方式の世代、MVNO = 事業者の形態という **分類の軸の違いを両側とも正に** 述べ、両者が両立する (MVNO も 5G の回線でサービスを提供できる) ことで q073 イの場面 (MVNO が移動通信システムの名前) を再現せずに区別させる (u10 L3 の型; 正の側に引用題外の一般事実 [MVNO も 5G で提供可] を足すのは u01 M4 の修正 [u02 の定義を借りる] と同じ手)。新 JP 79 字 2 文、topic 全 87 題と 12 字一致 0 (遮蔽あり・なしとも)、最大 Dice 0.14 / ed 0.87 (2013h25a-q071 エ)。正答エを支持し誤答を支持しない。太字 0・`[[jp:]]` 0 は前後で同じ、zh の MVNO 初出は訳語表どおり「MVNO（虚拟移动网络运营商）」 | jp: `MVNO は他社の回線を借りて通信サービスを提供する事業者の形態であり、通信方式の世代を表す 5G とは別物である。` → `5G は通信方式の世代の名前であり、事業者の形態とは軸が違う。自社の設備を持つ事業者も、他社の回線を借りる MVNO も、5G の回線でサービスを提供できる。` / zh: `MVNO（虚拟移动网络运营商）是租用其他公司线路提供通信服务的运营商形态，与表示通信方式代际的 5G 是两回事。` → `5G 是通信方式代际的名称，与运营商的形态是不同的维度。无论是拥有自有设备的运营商，还是租用其他公司线路的 MVNO（虚拟移动网络运营商），都可以用 5G 线路提供服务。` / en: `An MVNO is a type of operator that provides service over lines leased from another company, which is unrelated to 5G, the name of a generation of communication method.` → `5G names a generation of communication method, a different axis from the form an operator takes. Operators with their own equipment and MVNOs that lease other companies' lines can both offer service over 5G.` |
| L1 | LOW **建議修** | `terms[2](5G).points[2].text_jp` / `text_zh` / `text_en` (kind exam、qid `2026r08-q076` は維持) | 穴埋め題 q076 を正答エで埋めた文の命題 (通信範囲は無線 LAN と比べて広い、消費電力は 4G と比べて少ない = 比較の相手の組) をそのまま述べる。数値照合は Dice 0.27 / ed 0.91 / LCS 5・12 字一致 0 で、節の順も逆 → 句ごとになぞる b14 u05 H1 の型 (Dice 0.57 / LCS 18) ではなく写し (HIGH) ではない。ただし 5G の考点でありながら 5G には「ほかに」以外触れず (a2 #1 low)、LPWA は次単元 u05 の見出し語で同じ q076 を u05 も引用する。比較の相手の組を外し、LPWA の名の意味 (少ない電力・広い範囲) に絞れば題の文の組み立てから離れ、q076 (広く・少ない) もなお解ける。en の 2 文 (loc #1 low) も 1 文になる。新 JP 55 字 1 文、q076 正答込み題文と Dice 0.20 / ed 0.95 / LCS 4、12 字一致 0 (遮蔽あり・なしとも)、近似一致 0。zh・en の `[[jp:無線LAN]]` 各 1 は無線 LAN を出さなくなるため消える (parity 0 diff を確認) | jp: `IoT 機器向けには、5G のほかに LPWA と呼ばれる省電力の無線方式もあり、4G より消費電力が少なく、無線 LAN より広い範囲で通信できる。` → `IoT 機器向けには 5G のほかに、少ない電力で広い範囲をカバーできる LPWA と呼ばれる無線方式もある。` / zh: `面向 IoT 设备，除 5G 外还有一种称为 LPWA 的低功耗无线方式，耗电比 4G 少，通信范围比无线LAN（[[jp:無線LAN]]）更广。` → `面向 IoT 设备，除 5G 外还有一种称为 LPWA 的无线方式，能以较少的电力在大范围内通信。` / en: `For IoT devices there is also LPWA, a low-power wireless approach besides 5G. It uses less power than 4G and covers a wider area than a wireless LAN ([[jp:無線LAN]]).` → `For IoT devices there is also LPWA besides 5G, a wireless approach that communicates over a wide area on little power.` |
| L2 | LOW **建議修** | `overview_cols_jp[1]` | 列見出し「押さえどころ」は §9 禁止句「押さえ」の試験対策の言い方 (u01 の「経路を押さえる」= 確保の意とは違う)。v2 全単元で本単元だけ、validate の §9 対象外の欄。zh「要点」・en "Key point" はそのままで三語一致 | jp: `押さえどころ` → `要点` (zh・en 変更なし) |
| L3 | LOW **建議修** | `terms[3](伝送速度).points[1].text_jp` / `text_zh` / `text_en` (qid `2017h29h-q096`) | 輻輳の定義で、引用題の「ネットワークの許容量を超え」を「回線の処理能力を上回り」と回線に狭めている (ルーター等の機器で起きる輻輳も含む題の範囲より狭い; 正答と矛盾はしない → 限定の変化の LOW)。同時に loc #1 low の zh 直訳調 (主語が「使用」) を直す。新 JP 41 字 1 文、q096 正答ウと Dice 0.24 / ed 0.74 / LCS 7 (= 「ネットワークの」)、12 字一致 0 | jp: `回線の処理能力を上回り` → `ネットワークの処理能力を上回り` / zh: `使用在同一时间集中、超出线路处理能力` → `使用量在短时间内集中、超出网络的处理能力` / en: `beyond what the line can handle` → `beyond what the network can handle` |
| L4 | LOW **建議修** | `terms[3](伝送速度).points[0].text_zh`、`terms[2](5G).points[0].text_en` | loc #1 low の未反映 2 件。(a) zh の計算順が「传输速率で割ってから传输效率を掛ける」とも読める (計算の考点なので割る相手を先に出す)。(b) en の `[[jp:高速大容量]]` が LTE の直後にあり LTE の注記に読める。いずれも jp と同義、`[[jp:]]` 数は前後で同じ | (a) zh: `再除以传输速率（[[jp:伝送速度]]）乘以传输效率（[[jp:伝送効率]]）得到的实际速率（[[jp:実効速度]]）。` → `再除以实际速率（[[jp:実効速度]]），即传输速率（[[jp:伝送速度]]）× 传输效率（[[jp:伝送効率]]）。` / (b) en: `with higher speed and capacity than LTE ([[jp:高速大容量]])` → `with higher speed and capacity ([[jp:高速大容量]]) than LTE` |
| L5 | LOW | `terms[1].points[0]`・`terms[2].points[0]`・`terms[4].points[0]` (各 one の言い直し)、計算規則「ビットにそろえて実効速度で割る」(`terms[3].detail` / `points[0]` / `hook` / fig / `key_points_jp[2]` / `overview_rows[3].extra_jp[1]` / bps detail・hook / `key_points_jp[3]`) | D-203 §9 言い直し (jp-review a1 #1・a2 #1・#2 の low が残る)。3 考点は正答肢・正答込み題文が定義を述べる型で Dice 0.30〜0.45 (§1-4)、5G `points[0]` は題文の並び (速度 → 端末数 → 遅延) ではなく one の標準の並びに直っている。計算規則は 6 箇所以上で反復 | 記録のみ (考点は引用題の正答の要点で、削ると qid の拠り所がなくなる; 計算は単元の中核) |
| L6 | LOW | `terms[3].points[0]` 2 文目、`terms[3].points[2]` | (a) 「8 倍を落とすと 8 分の 1」は q082 誤答イ・q095 誤答ウの数値に当たるが、題の数値・選択肢の組を出さない計算の落とし穴の一般表現 (D-198 (iii) 境界)。(b) q088 の判断項目 b (他の無線 LAN との干渉) を「近くの別の無線」に広げる (他の機器の電波でも干渉は起きる = 事実は正しく誤答 a・c を支持しない; a2 #2 low)、見出し語 伝送速度 との関係は `key_points_jp[4]` だけが言う | 記録のみ |
| L7 | LOW | `pairs[1]` (伝送速度 / bps)・`terms[4].points[1]`・`terms[3].one_jp`「単位には bps」・`terms[4].one_jp`「伝送速度を表す単位」 | 書き方 8: 量 / 単位の対比が pairs と mix 考点の 2 箇所 (上限内) に加え両 one でも言われ、`pairs[1].rows[1]`「使い方の例」は飾りに近い (a2 #1 low) | 記録のみ (one の言及は定義そのもの) |
| L8 | LOW | `terms[1](LTE).quiz` / `inline_quiz` の `2026r08-q081` | BLE を答えさせる題で、LTE は誤答肢の一つ。BLE は次単元 u05 の見出し語で本単元では教えず (a1 の BLE 考点は削除済み)、本単元の内容だけでは正答を選べない (a2 #2 low)。v1 では challenge に置かれていた題 | 記録のみ (配列の差し替えは構造変更で B3 の範囲外; u05 の BLE が同題を引用) |
| L9 | LOW | `terms[3].fig.data.nodes[1]` / `steps[1]` (実効速度・伝送効率の定義前使用)、`terms[0].detail_zh` / `overview_rows[0].extra_zh[1]` (街単位 ↔ 整座城市级别 / en "a whole town")、`terms[1].one_en` (直訳調)、`key_points_en[3]` ("so" の因果付加)、zh「实际速率」(↔ 有效速率) | jp-review a1 #2 / a2 #1・#2 と loc #1 の low の残り。いずれも意味の誤りなし | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① LTE / 5G (世代): `pairs[0].rows[0]`、LTE detail「次の世代が 5G」、5G one「LTE (4G) の次の世代」、`overview_rows[1..2]` → 定義そのもの・総表の構造で許容。② LTE / 5G (特徴): `pairs[0].rows[1]` (key)、5G `points[0]` (LTE より…) の 2 箇所 → 上限内。③ 伝送速度 / bps: L7。④ WiMAX / 無線 LAN (Wi-Fi): `terms[0].points[0]` のみ (detail は LAN / WAN の分類で別の対比) → 許容。`goals_jp` は観点の予告で内容を述べない。

**過去の指摘の解消確認**: a1 jp-review #1 MEDIUM 4 件 (`goals_jp[0]` の見分ける軸 / LTE・輻輳・bps の誤答肢の同順打ち消し ×3) は全て解消、退行なし。a1 #2 MEDIUM (LPWA と 5G の狙いの比較 = 引用題に無い主張) は文が削除され解消 (現在は「5G のほかに」のみで比較なし、ただし L1)。a2 #1 MEDIUM (`pairs[0].rows[2]` 向く用途の二分法 + `key_points_jp[1]` の言い切り) は行の削除と「期待されている」への揃えで解消。a1 の飾り図 2 枚・pairs[1] の行ラベル不一致・WiMAX の放送塔の比喩・hook の Wi 誤読は削除・書き換えで解消。新規の MEDIUM は M1 のみ (a2 #2 が low とした MVNO 考点を、u01 M4 の前例で再分類)。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_jp/zh/en` は v1 と同文 (未改稿)。「LTE・5G などのモバイル WAN 通信方式」は WiMAX を名指ししないが「など」で覆い、事実は正しい。
- O2 challenge_questions 5 題は全て考点の引用題と重複 (未引用の題は 0)。規則違反ではないが、復習の題として新しい題が無い。v1 の challenge にあった q081 は LTE の quiz に移っている (L8)。
- O3 本単元は 5G `points[2]` (LPWA)・伝送速度 `points[2]` (無線 LAN の干渉) で、次単元 u05 (LPWA) と前提単元 u03 (無線LAN) の見出し語の内容を考点に持つ。単元をまたぐ重なりは Rule A の判定外として記録のみ。独立 copy 照合の近似ヒットは一般句の偽陽性 (§1-4)。

確認済みで問題なし: 限定条件 (考点 8 件で保持、狭め 1 [L3]・広げ 1 [L6] は事実と矛盾せず)、§9 禁止句 grep (定型締め句 0; 「押さえどころ」は L2)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤79 字)、図の文字列の写し (validate 0、独立照合 0)、`[[jp:]]` 原語 (11 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (5/5)、zh 訳語表 (B6 warn 0)、図種 (flow steps ×1 / 図なし ×4 = 登録内)、派生フィールド一致 (78/78)、用語・`term_zh`・`term_en`・`title_*`・`unit_summary_*` の v1 不変量、D-205 該当なし。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1 5G mix = 誤答肢 MVNO の打ち消しだけの考点) |
| LOW | **9** (建議修 4: L1〜L4 / 記録のみ 5: L5〜L9) |

## 5. 判定

**FAIL** (D-199: HIGH 0 だが MEDIUM 1)。全 5 用語・考点 10 件 (qid 付き 8 件)・引用 8 題 + 未引用の quiz 1 題で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、計算 2 題 + 図は再計算一致、引用題の限定条件の落ちも無い (事実の層は合格)。過去の JP 審査の MEDIUM 6 件 (a1 #1 ×4・a1 #2 ×1・a2 #1 ×1) は全て解消し退行なし。不合格の理由は M1 の 1 件 (D-198 (iii) 型、数値の写し照合には掛からず目視で判定) のみ。M1 は 1 欄 × 三語の文字列置換 (構造変更なし、qid 不変、派生欄の追従なし) で直せ、M1 + L1〜L4 を当てた写しで validate 0 / parity 0 diff / framing 0/0/0 / 12 字照合 0 / D-200 内 (M1 新文 79 字 2 文) を確認済み → B3 補丁で M1 (+ 建議修 L1〜L4) を当て、M1 の欄を再確認すれば PASS の条件 (HIGH 0 かつ MEDIUM 0) を満たす。L5〜L9 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-22-58-u04
✓ technology-22-58-u04 unit: 0 issues (data/ip/textbook/units/technology-22-58-u04.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-22-58-u04
✓ technology-22-58-u04 parity: 23 locations, 0 diff
EXIT=0

# M1 + L1〜L4 を当てた写し (scratchpad) — 参考
$ node --no-warnings scripts/textbook-v2-validate.mjs --file <scratchpad>/u04/patched.json
✓ technology-22-58-u04 unit: 0 issues
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --file <scratchpad>/u04/patched.json
✓ technology-22-58-u04 parity: 23 locations, 0 diff
EXIT=0
$ npx tsx <scratchpad>/u04/fr2.mts   # validateV2 pointFraming (patched.json)
{ jp: 0, zh: 0, en: 0 }
```
