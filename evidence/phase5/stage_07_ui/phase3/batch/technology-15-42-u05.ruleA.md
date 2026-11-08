# Rule A 全数抽検 — technology-15-42-u05 (アクチュエーターとデバイス制御)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b62)、repo HEAD `05c1955e` + 作業ツリー (単元 JSON は未コミットの書き直し版 = run `b62-u05-a1` merge 結果、sha256 先頭 `e48b3d1cf5bef836`)。
- **対象**: `data/ip/textbook/units/technology-15-42-u05.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (アクチュエーター / DCモーター / 油圧シリンダ / 空気圧シリンダ / デバイスドライバ / プラグアンドプレイ) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-15-42-u05/v1-original.json` (用語 6 語・`term_zh`・`term_en`・`unit_summary_*` とも v1 と一致)。前段の所見: `journal.b62-u05-a1.jsonl` の result 行 (jp-review r1 = PASS・low 9 / loc-review r1 = PASS・low 2、HIGH / MEDIUM なし)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption) / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / memory_hook_* / explanation_* / summary.key_points_* / summary.memory_hooks_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。`空気圧シリンダ` は hook 欄なし (validate 許容、summary.memory_hooks は 5 件)。
2. **考点 × 引用題 (考点 全 7 件 = exam 4 + mix 3、うち qid 付き 6 件、引用 qid 延べ 11 件 = 異なり 11 題)**: `data/ip/quiz/questions.json` の各題 (全て topic `technology-15-42`) の題文 (`stem_jp_clean` 優先)・選択肢・`correct_answer` を再読し、考点の主張が正答と一致し、誤答肢を支持せず、引用題が支持しない一般化・限定をしていないこと、題の前提 (限定条件) を外していないことを 1 件ずつ確認。数値・計算題は本単元に無い (DC モーターの電圧↔速さ・電流の向き↔回転方向、油・空気の圧縮性は定性事実として技術的に照合)。
3. **quiz / challenge_questions** (quiz 計 8 枠 + challenge 5 題、うち考点で未引用 2 題 = 2016h28a-q093 / 2011h23tokubetsu-q087): 2016h28a-q093 (新しい周辺機器を使うには a = ドライバが要り、b = PnP 対応機器なら自動で a が入る、正答ア) は `pairs[1]` と PnP one・`pairs[1].rows[2]` で解ける。2011h23tokubetsu-q087 (USB 2.0 に無い機能 = パラレル転送、正答イ) は PnP detail「USB などの接続方式が対応している」と矛盾しないが、シリアル転送・バスパワーは本文に無い (O2)。
4. **D-198 写し**: validate の copy guard = 0 件。独立照合として単元の JP 文字列 102 本 (派生除く) を topic 内全 25 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白除去)。**カタカナ 4 字以上と英数を □ 1 字に遮蔽 → 0 件**。**遮蔽なし → 3 件**、全て見出し語 + 定義の定型語の連なり:
   - `terms[5].one_jp` ↔ 2011h23a-q076 題文 / 2015h27h-q082 ア:「デバイスドライバの組込み」(見出し語 8 字 + の組込み)。
   - `terms[5].one_jp` ↔ 2017h29h-q064 イ:「対応するデバイスドライバ」(同)。
   - 用語名は表現ではなく、「(ドライバの) 組込み・設定を自動で行う」は PnP の標準定義そのもの (D-198「標準的な定義・原則の一般表現は写しではない」)。
   **近似照合** (12 字窓 ratio ≥0.83 = 12 件、全て上記 3 句か「周辺機器を制御するソフトウェア」「OSやアプリケーション」の定型句) と、文節単位の正規化編集距離 / bigram Dice (較正: HIGH 例 ed 0.14 / Dice 0.52):
   | 単元 | 題 | ed | Dice | 判定 |
   |---|---|---|---|---|
   | `terms[5].one_jp` (認識〜組込みと設定) | 2011h23a-q076 題文 | 0.61 | 0.40 | 遠い |
   | 同 | 2015h27h-q082 ア | 0.65 | 0.48 | 遠い |
   | 同 部分「対応するデバイスドライバの組込みと設定」 | q082 ア 部分 | 0.26 | 0.75 | 見出し語 + 標準定義句 |
   | `terms[5].points[0]` (新しく接続された機器に合う〜OS に組み込み) | 2017h29h-q064 イ | 0.36 | 0.50 | 較正未満、標準定義の言い換え (前段 jp-review でも §9 low) |
   | `terms[5].points[1]` 部分「電源を入れたまま機器を着脱できる機能」 | 2015h27a-q050 ア | 0.32 | 0.58 | 重なりは「電源を入れたまま」「着脱」「機能」= ホットプラグの定義の核で他の言い方がほぼ無い標準表現。場面・数値・選択肢の組なし |
   | `terms[4].points[0]` 部分「周辺機器を制御するソフトウェア」 | 2018h30h-q083 ア | 0.25 | 0.73 | 15 字の一般定義句 (ドライバ = 周辺機器を制御するソフトウェア)。標準定義 |
   | `terms[4].one_jp` | 2016h28h-q081 題文 | 0.83 | 0.36 | 遠い (仲立ち・機器が分かる形に直す と自作の説明) |
   | `terms[4].points[1]` | 2019r01a-q058 ア | 0.77 | 0.29 | 遠い |
   | `terms[0].points[0]` | 2020r02o-q099 題文 | 0.88 | 0.13 | 遠い |
   Dice が較正値を超える 2 件はいずれも 15〜18 字の標準定義句で、題の場面 (外気温・窓・HDD 初期化など)・数値・選択肢の組を伴わないため写しに当たらない。カタカナの多い文 (`terms[4].one_jp` / `detail_jp`、`terms[5].one_jp` / `detail_jp`、`pairs[1]`) は目視でも題の語順の流用なし。
   **(iii) 選択肢の跡** (D-208 (1)): validate の `choice-echo` warn 0。`terms[0].fig` の 4 段 (センサーが測る → コンピュータが判断 → アクチュエーターに信号 → 物が動く) は 2020r02o-q099 の選択肢 4 つ (データ受信 / 指示送信 / 外気温を信号に / 窓開閉) と役割が対応するが、IoT の標準構成を正の定義で述べたもので、場面は自作 (土の乾き・散水弁、題は外気温・窓)、誤答肢の打ち消しや選択肢の語句・順の再現なし → (iii) に当たらない。`terms[0].points[1]` (センサー = 入力 / アクチュエーター = 出力) は 2026r08-q078 の正誤の組 (センサー vs アクチュエーター) を両側とも正の定義で述べる対比 (D-209 免除)。`pairs[1]` (ドライバ / PnP) と 2016h28a-q093 の空欄 a・b: 両側を正の定義で述べ、題の文の構造・誤答の字句 (プラグイン・マルウェア) を再現しない (前段 jp-review と同判断)。`terms[4].detail_jp`「機種に合わせて作られ」は 2019r01a-q058 の誤答エ (1 つのドライバで全機種) の場面を再演せず一般事実として述べる。2015h27h-q082 / 2015h27a-q050 の共通誤答 (プラグイン・バスパワー・性能評価) は本文に一切出ない。
5. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2 文 × 6、§6 比喩・フック (L4〜L7)、定義前使用 (センサー = `terms[0].fig` caption が先に使い detail で定義 → L8; 制御信号・物理量・ピストン・直流・圧縮空気・周辺機器・ホットプラグは初出位置で説明あり)、**§9 禁止句 grep** (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / 必须 / 考试 / 记住): jp・zh ヒット 0。en の "must" 2 件 (`key_points_en[2]` と派生 summary の "must be reinstalled") と "exam" 11 件 (`kind: "exam"` の値と "example" 等の部分一致) は通常用法で偽陽性。図の型: アクチュエーター = flow steps 4、デバイスドライバ = flow static 4 ノード、PnP = flow steps 4、他 3 用語 = 図なし (全て登録内)。pair 配置: 油圧 / 空気圧 は空気圧シリンダの後、ドライバ / PnP は PnP の後、各組 key 行 1。
6. **D-200**: 考点数 2/0/0/1/2/2 (≤3 ✓)、各 JP 文数 1〜2・字数 45〜65 (≤100 ✓、最大は PnP `points[1]` 65 字)。**framing 件数** (`validateV2.pointFraming`、全考点、tsx で直接計算): jp 0 / zh 0 / en 0 (上限 2)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 (欄同士の「〜ではない」「〜だけ」の照合) → **M1** (ドライバ「OS の一部ではない」vs PnP「ドライバを OS に組み込み」)。それ以外: `overview_rows[1..3]` の 回転 / 直線 と各 one・`key_points[1]` 一致; `pairs[0].rows[1..2]` と 油圧 detail・空気圧 detail・mix 考点一致; `pairs[1].rows[2]`「無い場合: 機器を制御できない / 手作業で入れる」は 2013h25a-q082 (アプリから使うのに要るのはドライバで PnP・ホットプラグではない) と一致。書き方 8 → L9。書き方 9 (限定条件) → §2 表、落ち 0。§9 言い直し → L10。D-205 (改訂される文書の構成数・名称) / D-210 (改正前の規定) に当たる記述なし。
8. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・比較行の三語一致、`[[jp:…]]` 原語 10 種 (アクチュエーター / センサー / サーバ / DCモーター / 油圧シリンダ / 空気圧シリンダ / デバイスドライバ / OS / プラグアンドプレイ / ホットプラグ) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en 全 6 用語に見出し語の `[[jp:]]` あり、zh 訳語が `zh_terms.json` に従うこと (执行器 / 直流电机 / 液压缸 / 气压缸 / 设备驱动程序 / 即插即用 / 操作系统 / 服务器) → `key_points_zh[1]` の「气缸」のみ外れる (L1)。前段 loc-review の low 2 件は未修のまま (L2・L3)。
9. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | アクチュエーター | OK — exam 1 / 2 題: サーバ等からの指示に従い現場の物を実際に動かす (2020r02o-q099 正答エ = 窓の開閉、誤答 = 受信・指示送信・外気温の信号化 を支持しない / 2021r03-q072 正答ア) / mix: センサー = 物理量を測り電気信号にする入力側、アクチュエーター = 信号を動きに変える出力側 (2026r08-q078 正答エ センサー)。one「制御信号を受けて回転や伸び縮みなどの物理的な動きに変える出力側の装置の総称」は技術的に正しく、`overview_rows[0]` / `key_points[0]` と一致。fig steps 4 を 2022r04-q097 (範囲外 topic、水位センサ → サーバ → 水門アクチュエータ、正答エ) に当てても正答を選ぶ (O3) | OK (fig は標準構成、(iii) 非該当 §1-4) | OK | L8 |
| 2 | DCモーター | 考点なし (topic に直接の題なし)。直流で軸が回る / 電圧の上げ下げで速さが変わる / 電流の向きを逆にすると逆回転 / 電池でも動く — いずれも (ブラシ付き) DC モーターの標準事実として正しい。「代表例」と言い排他的分類はしない。hook DC = Direct Current、AC = Alternating Current 正 | OK | OK | なし |
| 3 | 油圧シリンダ | 考点なし。油の圧力でピストンを押し直線運動 / 油は圧縮されにくく大きな力・位置保持に強い / 建設機械・プレス機 — 正しい。「小さな装置でも強い力」は高圧を扱えることの帰結で IT パスポートの水準で許容 | OK | detail_zh の「停在」 = L3; hook_en の追加文 = L7 | L3, L5, L6, L7 |
| 4 | 空気圧シリンダ | 考点 mix 1 (qid なし): 油圧 = 圧縮しにくい油で強い力、空気圧 = 圧縮空気で軽く素早い、どちらも直線運動 — 正しい。detail「漏れても周りを汚しにくい」「空気は圧縮されるため力・位置精度は油圧に及ばない」正 | OK | OK | L4, L9 |
| 5 | デバイスドライバ | exam 2: ① 周辺機器を制御するソフトウェアで、アプリが接続機器を使うときにも必要 (2018h30h-q083 正答ア / 2013h25a-q082 正答イ、誤答 PnP・ホットプラグ・コンパイラを支持しない / 2016h28h-q081 正答ウ) — OK。② OS と別に入れたドライバは初期化 + OS 再インストール後に入れ直す (2019r01a-q058 正答ア; 限定条件「OS とは別にインストールしていた」保持) — 結論は OK だが、1 文目「OS の一部ではない」は引用題が支持しない分類で、PnP 側の「ドライバを OS に組み込む」(2017h29h-q064 / 2011h23a-q076 正答) と食い違う → **M1**。detail「機器の種類や機種に合わせて作られ、多くはメーカーが提供」「アプリは OS を通じてドライバに頼む」正、fig static (アプリ → OS → ドライバ → 周辺機器) は detail と一致 | OK | OK | **M1** |
| 6 | プラグアンドプレイ | exam 1 / 3 題: 新しく接続された機器に合うドライバを OS に組み込み設定する (2011h23a-q076 正答ウ / 2015h27h-q082 正答ア / 2017h29h-q064 正答イ; 誤答 = 自動再生・故障診断・ウイルススキャン・プラグイン・給電・性能評価 を支持しない) / mix: ホットプラグ = 電源を入れたまま着脱、PnP = 接続後の認識・設定の自動化 (2015h27a-q050 正答ア)。fig steps 4 は one と一致。detail「USB などが対応」は 2011h23tokubetsu-q087 (USB 2.0 に PnP・ホットプラグあり) と整合 | OK (近似照合 §1-4 は標準定義句) | OK | L10, L11 |

**単元レベル**: goals 3・overview_cols 2・overview_rows 6・pairs 2 組 (油圧 / 空気圧 4 行 key 1、ドライバ / PnP 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge 5 件 (2021r03-q072 / 2019r01a-q058 / 2015h27h-q082 / 2011h23tokubetsu-q087 / 2015h27a-q050 — 本文と矛盾なし)。`key_points_jp[2]`「OS と別に入れたものは OS を入れ直すと入れ直しが要る」は M1 の 1 文目を含まず正しい。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 11 (うち 建議修 3)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[4](デバイスドライバ).points[1].text_jp` / `text_zh` / `text_en` | 1 文目「OS と別に後から入れたドライバは OS の一部ではない」は、引用題 2019r01a-q058 の正答 (別に入れたドライバは OS 再インストール後に入れ直しが要る) が支持しない排他的な分類 (所属の主張)。同じ単元の `terms[5].points[0]`「デバイスドライバを OS に組み込み」・fig caption「OS が組み込み」、および 2017h29h-q064 / 2011h23a-q076 の正答 (ドライバを OS / システムへ組み込む) と欄同士で食い違い、学習者に「ドライバは OS に入るのか入らないのか」を誤解させる (書き方 7 の不整合 = MEDIUM; ドライバは組み込まれて OS の下で動くため、無条件に読むと事実誤り寄り)。前段 jp-review はこの点を (iii) の言い直しの観点でのみ low とし、分類の主張は見ていない | jp「OS と別に後から入れたドライバは OS の一部ではない。ディスクを初期化して OS を入れ直した後は、ドライバも入れ直す。」→「OS と別に後から入れたドライバは、OS を入れ直しても一緒には戻らない。ディスクを初期化して OS を入れ直した後は、ドライバも入れ直す。」(2 文・66 字) / zh「与操作系统（[[jp:OS]]）分开、后来安装的驱动程序不属于操作系统的一部分。把磁盘初始化并重装操作系统后，驱动程序也要重新安装。」→「与操作系统（[[jp:OS]]）分开、后来安装的驱动程序，不会随着操作系统的重装一起恢复。把磁盘初始化并重装操作系统后，驱动程序也要重新安装。」/ en "A driver installed later, separately from the OS, is not part of the OS. After you initialize the disk and reinstall the OS, you have to reinstall the driver as well." → "A driver installed later, separately from the OS, does not come back when the OS is reinstalled. After you initialize the disk and reinstall the OS, you have to reinstall the driver as well." |
| L1 | LOW **建議修** | `key_points_zh[1]` (+ 派生 `summary.key_points_zh[1]`) | 「气缸」は登録訳語 (空気圧シリンダ → 气压缸) と違い、jp・en は名前を挙げない (流体を使うシリンダ / fluid-driven cylinders)。訳語表の不一致 | zh「**直流电机**靠电产生旋转，而利用流体的气缸、液压缸则产生直线运动。」→「**直流电机**靠电产生旋转，而利用流体的液压缸、气压缸则产生直线运动。」(jp・en 変更なし) |
| L2 | LOW 記録のみ | `overview_cols_zh[1]` | 前段 loc-review low 未修: 「产生什么・作用」に日本語の中黒 | 任意: zh「产生什么・作用」→「产生什么／作用」 |
| L3 | LOW **建議修** | `terms[2](油圧シリンダ).detail_zh` | 前段 loc-review low 未修: jp「止めたい位置で正確に保ちやすい」(保持) を「容易准确地停在想要的位置」(停止) と訳し、`pairs[0].rows[2].a_zh`「容易准确保持位置」とも揃わない | zh「并且容易准确地停在想要的位置。」→「并且容易在想停的位置准确地保持住。」 |
| L4 | LOW **建議修** | `terms[3](空気圧シリンダ).analogy_jp` / `analogy_zh` / `analogy_en` | 風船は全方向に膨らみ、one・pairs の「ピストンを押す直線的な動き」と像が合わない (前段 jp-review low)。比喩の結論「空気の圧力で手早く押し出す」自体は正しく、本文が「全方向に動かない」と否定している記述も無いので D-204 の MEDIUM (考点・detail が否定する内容を運ぶ) には当たらない | jp「空気入れで膨らむ風船のように、空気の圧力で手早く押し出すしくみである。」→「ストローに息を吹き込むと中に詰めた紙玉が勢いよく飛び出すように、空気の圧力で手早く押し出すしくみである。」/ zh「就像用打气筒把气球吹大一样，是靠空气压力迅速推出去的机制。」→「就像往吸管里一吹气，塞在里面的纸团就会一下子飞出去一样，是靠空气压力迅速推出去的机制。」/ en "Like a balloon swelling under a pump, it uses air pressure to push something out quickly." → "Like blowing into a straw so the paper wad inside shoots out, it uses air pressure to push something out quickly." |
| L5 | LOW 記録のみ | `terms[2].analogy_jp/zh/en` | 「注射器の押し子を液体で押し出す」は普段の使い方 (押し子で液体を押す) と力の向きが逆で、「強い力」の例としても注射器は弱い (前段 jp-review low)。誤学習には至らない | 任意: jp「重い車を少しの力で持ち上げる油圧ジャッキと同じく、閉じた筒の中の油に圧力をかけて強い力で真っすぐ押す原理である。」(zh / en も同趣旨に) |
| L6 | LOW 記録のみ | `terms[2].hook_jp/zh` | 「油圧 = 油 + 圧で何の力で押すかを示す」は字形の手がかりだが、one の「油の圧力で押す」をほぼ言い換えている (D-203 §6) | 記録のみ |
| L7 | LOW 記録のみ | `terms[2].hook_en` (+ 派生) | en にだけ「the English "hydraulic" likewise points to liquid」が加わる。en 読者向けの補足で事実は正しく、parity も 0 diff | 記録のみ |
| L8 | LOW 記録のみ | `terms[0].fig.steps[0].caption_jp` / `terms[0].detail_jp` | 「センサー」が図の caption で先に使われ、入力側の部品として定義する文は図の後の detail (前段 jp-review low)。caption 自体が「測って電気信号にして送る」と役目を述べ実害は小さい | 記録のみ |
| L9 | LOW 記録のみ | `pairs[0]` / `terms[3].points[0]` / `terms[3].detail_jp` 2 文目 | 油圧 / 空気圧の対比 (力・位置精度・素早さ) が 3 箇所 (書き方 8: pairs と mix 考点の 2 箇所まで)。ホットプラグ / PnP の対比は `terms[5].detail_jp` 2 文目と mix 考点の 2 箇所で上限内 | 記録のみ (detail 2 文目は空気圧方式の弱点そのものの説明で、削ると detail が片肺になる) |
| L10 | LOW 記録のみ | `terms[5].points[0].text_jp/zh/en` | exam 考点が one の定義をほぼ言い直す (D-203 §9)。2017h29h-q064 イ と ed 0.36 / Dice 0.50 で較正未満、事実は引用 3 題の正答と一致 | 記録のみ |
| L11 | LOW 記録のみ | `terms[5].analogy_jp/zh/en` | 「店員が客の好みを見て席と道具を整える」— PnP が見分けるのは機器の種類であって好みではない。像のずれは小さく誤答肢へ導かない | 記録のみ |

**対比の出現欄 (書き方 8 の列挙)**: ① 油圧 / 空気圧: `pairs[0].rows[0..3]`、`terms[3].points[0]` (mix)、`terms[3].detail_jp` 2 文目、`overview_rows[2..3].extra_*[1]` (総表の列、D-195 §3 の構造で数えない)、`goals_jp[1]` (予告) → L9。② センサー / アクチュエーター: `terms[0].detail_jp` 1 文目・`terms[0].points[1]` (mix)・analogy (目耳 / 手足) → detail + mix の 2 箇所、比喩は別の手がかりで許容。③ ドライバ / PnP: `pairs[1]` のみ (`goals_jp[2]` は予告) → 許容。④ ホットプラグ / PnP: `terms[5].detail_jp`・`terms[5].points[1]` → 2 箇所で許容。

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 `unit_summary_*` は v1 と同文 (未改稿)。「(ドライバ/PnP)」の略記は v1 由来で事実は正しい。
- O2 challenge `2011h23tokubetsu-q087` (USB 2.0 に無い機能 = パラレル転送) は、シリアル転送・バスパワーが本文に無く本文だけでは解き切れない (前段 jp-review low と同見解)。topic 紐づけ題で v1 から継承、置くこと自体は可。
- O3 範囲外 topic の 2022r04-q097 (strategy-05-17、水田の水位 → 水門の IoT 構成で a = センサ / b = アクチュエータ) は、`terms[0].fig` の農業の弁の場面と型が近いが、copy guard は topic 内のみで、語句の一致は無く (水位・水門・通信機能部は不使用)、図を当てると正答エを選ぶ。標準的な IoT 構成の自作例と判断。

確認済みで問題なし: 限定条件 (qid 付き考点 6 件全て保持、§2)、§9 禁止句 grep (jp・zh 0、en は偽陽性のみ)、framing 0/0/0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤65 字)、写し (遮蔽あり 0、遮蔽なし 3 件・近似 12 件は全て見出し語 + 標準定義句)、`[[jp:]]` 原語 (10 種全て jp 本文に実在)、one_zh / one_en の見出し語併記 (6/6)、zh 訳語表 (L1 以外一致)、図種 (flow steps ×2 / flow static ×1 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、前段 HIGH / MEDIUM なし (回帰の対象なし)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **11** (建議修 3: L1 / L3 / L4 / 記録のみ 8: L2・L5〜L11、うち L2・L5 は任意の修正案あり) |

## 5. 判定

**FAIL** (D-199: MEDIUM 1)。全 6 用語・考点 7 件 (qid 付き 6 件)・引用 11 題 + 未引用の quiz / challenge 2 題で、考点の結論は正答と一致し誤答肢を支持する記述は無く限定条件落ちも無いが、M1 (ドライバ「OS の一部ではない」= 引用題が支持しない分類で、PnP 側の「OS に組み込み」と欄同士で食い違う) が 1 件ある。M1 は 1 欄内の文字列置換で直る (B3 補丁、構造変更なし)。補丁適用後に validate / parity を再実行し 0 issues / 0 diff なら、M1 解消で PASS 相当。LOW 建議修 3 件 (L1 / L3 / L4) は同じ補丁での修正を推奨、残りはバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-15-42-u05
✓ technology-15-42-u05 unit: 0 issues (data/ip/textbook/units/technology-15-42-u05.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-15-42-u05
✓ technology-15-42-u05 parity: 28 locations, 0 diff
EXIT=0
```
