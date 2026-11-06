# Rule A 全数抽検 — technology-16-43-u03 (仮想化の基本と方式)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (b37)、repo HEAD `86dd3c0b` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b37-u03-a2` (種付き: a1 jp.r1 + 審査 #2) merge 結果、sha256 先頭 `3c70ad1e9687a2bb`)。
- **対象**: `data/ip/textbook/units/technology-16-43-u03.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (仮想化 / ホスト型 / ハイパーバイザー型 / コンテナ型 / VM / 仮想マシン) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。用語・`term_zh`・`term_en` とも v1 (`v1-original.json`) と一致。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208 (既知の型 1〜10) / D-209 / D-210 / D-211。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (nodes label) / quiz` と単元レベル全フィールドを三語とも読んだ。派生 (`memory_hook_* / summary.memory_hooks_*`) は本体と同文 (建議修 L1 の before 文字列が各語 3 か所 = hook + memory_hook + summary で一致することを grep で確認)。terms[0].fig は v1 継承の svg (`data/ip/textbook/figures/technology-16-43-u03-t01.svg`、ラベル 物理サーバ(1台) → 仮想化 → 仮想環境1〜3)。
2. **考点 × 引用題** (考点 全 7 件 = exam 3 + mix 4、引用 qid 延べ 6 件 = 異なり 5 題、全題 topic `technology-16-43`): `data/ip/quiz/questions.json` + translations の `stem_jp_clean` で題文・選択肢・正答を再読。
3. **quiz / challenge**: quiz 5 枠 (q086・q062 / q099 / q054・q074) と challenge 4 題 (2011h23a-q054 / 2018h30h-q062 / 2019r01a-q074 / 2022r04-q099) は全て本文で解ける。a1 の 2019r01a-q057 (ライブマイグレーション = u04 の語) は challenge から外れている。
4. **D-198 写し**: validate copy guard 0。独立照合: 単元 JP 文字列 95 本 (派生除く、図ラベル・総表・対比表を含む) × topic 全 38 題の題文 (stem_jp_clean 優先) + 選択肢を 12 字連続照合 — カタカナ 4 字以上と英数を □ 遮蔽 (実字 6 未満の窓除外) で **0 件**、**遮蔽なしでも 0 件**。1〜2 字置換の近似一致 19 件は全て「1台のコンピュータを」「複数のコンピュータ」「アプリケーションの実行/を実行」「OSとアプリケーション」「〜のコンピュータである」の一般語の連なり (topic 外の構成題 2021r03-q082 / 2014h26a-q048 / 2023r05-q070 / 2009h21h-q073 含む) で偽陽性。カタカナの多い文 (コンテナ型 one・detail、ハイパーバイザー型 one・hook、図ラベル) は目視でも題の言い回しと一致なし。
5. **D-208 既知の型**: (1) option tracing — validate は `warn choice-echo` を出していない。2022r04-q099 (判断項目 a〜c、正解 a のみ) を引く考点は terms[5].points[0] の 1 件だけで、項目 a の一般的性質 (仮想マシンごとに別の OS・独立して動く) を正の定義で述べる。b・c (処理能力・容量) を打ち消す考点は無く、資源の分け合いは detail / key_points[4] / goals[2] の一般原則の文 (D-211 (ii)、組・順序の再現なし) → a1 の MEDIUM (a/b/c を題の順に一揃い) は解消。mix terms[0].points[2] (仮想記憶 / サーバの仮想化) は q086 エ・q054 エ の内容に当たるが、取り違えやすい 2 語を両側とも正の定義で述べた D-209 の対比で、選択肢の組・順序・場面を再現せず (iii) に当たらない。(2) 限定条件落ち — なし (§2)。(3) 別名を別物として教える — VM / 仮想マシンは「同じものを指す」と明記 (VM one・goals[2]・key_points[4])。ハイパーバイザー (ソフト) / ハイパーバイザー型 (方式) の区別は mix 考点で正しく区別。(4) 比喩・図の範囲 — 仮想化 analogy (フロアの間仕切り) と svg は「区切る」側だけだが、detail が「代表的な使い方」と位置づけ、3 文目で統合も仮想化に含めるので矛盾しない (analogy は「例えば」付き)。(5) zh / en の回帰 — a1 の HIGH / MEDIUM 箇所を三語で確認、回帰なし (§3 冒頭)。(6) 訳語が誤答肢の読み — なし (zh「分享」「导入」は自然さの low のみ)。(7) D-210 — 法令・規格の引用なし。(8) 他見出し語の語幹の比喩 — ホスト型 analogy の「家主」「客」は host / guest の像で、ゲストOS / ホストOS の定義と同じ向き (矛盾なし)。(9) hook を引用題の場面に当てて誤答肢を選ぶか — terms[0].hook 2 文目「使う側からは本物の機械と同じように働く」は 2022r04-q099 b (仮想サーバ数だけ物理機を増やしたのと同じ処理能力) の方へ読める余地が僅かにあるが、同単元の terms[5].detail・key_points[4] が資源を分け合うと明言し、文意も「働き方」で処理能力の主張ではない → L1 (建議修)。他の hook (host/guest・supervisor・輸送コンテナ) は引用題に当てても誤答肢を指さない。(10) 閉じた列挙 — 「代表的な 3 つの方式」は「代表的な」付きで閉じていない。
6. **事実 (方式の境界)**: ホスト型 = ホストOS 上の仮想化ソフト、ホストOS 経由のオーバーヘッド / ハイパーバイザー型 = ハードウェア直上、ホストOS なし、ゲストOS とハードの間の層が少ない / コンテナ型 = 1 つのホストOS のカーネルを共有、ゲストOS を持たない、起動が速く資源が少ない、カーネルの異なる OS は動かせない (「向かない」)。pairs[0] 4 行・pairs[1] 4 行 (key: rows[0] / rows[1]) とも事実どおりで、overview extra (ホストOS を置かない / OS を丸ごとは持たない) と一致。hypervisor の語源 (supervisor の上位) は標準的な説明。a1 HIGH の「割り当ての合計は物理資源の範囲に収まる」(オーバーコミットと矛盾) は削除済み — 現行 terms[5].detail「資源の一部が割り当てられ…その範囲で動く」は各 VM の割り当て内の動作で、合計の規則を述べない。
7. **D-195 / D-200**: one 1 文 × 6 (太字あり)、detail 2〜3 文、VM は analogy・hook 空 (略語の用語、D-203 (b))。定義前使用: ゲストOS は terms[0].detail で定義後に terms[1] 図に出る (a2 jp-review #1 medium は解消)、カーネル・コンテナ・ハイパーバイザー・ホストOS・オーバーヘッドは各 one / detail の括弧注。「物理マシン」は VM detail で初めて言い換えが付く (審査 #2 low、terms[0].detail の「物理コンピュータ」で推測可、記録のみ)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → jp 0 件。zh (考试 / 必须 / 重要 / 常考 / 记住 / 选项 / 出题) 0 件。en (exam / must / always / important / remember / option) → "must" 2 件 (ホスト型 analogy の「must go through」・pairs[1].rows[2].a「must boot」) は通常の用法で偽陽性。考点数 3/1/1/0/1/1 (≤3)、各 JP 1 文・46〜81 字 (≤100、最大 terms[0].points[2] 81 字)。framing は validate (pointFraming 含む) 0 issues。図種: svg static ×1 (v1 継承) / flow static ×3 = 登録内。
8. **D-202 / D-203**: 書き方 7 (「だけ」「ではない」の照合: コンテナ「実行環境だけを分ける」と pairs[1].rows[0]・key_points[3] 一致 / VM points[0]「技術の名前ではなく」と one 一致 / pairs[0].rows[1].b「ハイパーバイザーだけ」と terms[2].detail「層が少なく」一致) → 不整合 0。書き方 8 → L4。書き方 9 → §2。D-205: 改訂される文書の構成数は無し。
9. **三語**: zh・en が jp と同じ事実 (追加・欠落なし)、図ノード三語一致、`[[jp:]]` 原語 10 種 (仮想化 / サーバの仮想化 / ホスト型 / ホストOS / ゲストOS / ハイパーバイザー / ハイパーバイザー型 / コンテナ型 / 仮想マシン / 仮想記憶) 全て jp 本文に実在 (スクリプト)。one_zh / one_en の見出し語 `[[jp:]]` は 5/6 — VM は jp 見出し語がラテン文字で三語同綴のため併記なし (validate 0、記録のみ)。zh 訳語は `zh_terms.json` (虚拟化 / 宿主型 / 管理程序型（Hypervisor 型） / 容器型 / VM（虚拟机） / 虚拟机 / 虚拟存储) に従う (仮想記憶は本文「虚拟存储器」= 表の語を含む標準形、B6 warn なし)。
10. **前回 attempt / 審査**: a1 (`failures/phase5/stage_07_ui/phase3/batch/technology-16-43-u03_attempt_1.md`) の HIGH 1 + MEDIUM 4、a2 jp-review #1 (medium 1 + low 7) → 全て解消を確認 (§3)。jp-review #2 PASS low 7・loc-review #1 PASS low 7 の未適用分は §3 の LOW に再判定。
11. **機械ゲート**: §6 に出力全文。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 仮想化 | OK — exam 2 / 4 題 + mix 1: サーバの仮想化 = 1 台の物理マシンを論理的に区切り複数サーバを並行稼働 (2010h22h-q086 正答ア / 2011h23a-q054 正答ウ / 2018h30h-q062 正答ウ = 仮想化、題の前提「1 台を論理的に分割・独立した OS」と一致) / 資源を環境ごとに必要量ずつ割り振り需要に応じて柔軟に使える (2019r01a-q074 正答ア; 誤答 = ブレード・非接続・同一処理の照合 を支持しない; 正答の言い換えで 12 字一致なし) / mix: 仮想記憶 (補助記憶で主記憶を大きく見せる) と サーバの仮想化 の区別 (q086 エ・q054 エ を正の定義で切り分け)。one は仮想化一般 (CPU・メモリ・ディスクを異なる構成に見せる)、detail 3 文目で統合も含む → a1 の「区切るだけ」言い切り MEDIUM 解消、mix は対象を「サーバの仮想化」に限定 → a1 の仮想化を狭める MEDIUM 解消 | OK | OK | L1 (hook)、L2 (analogy 像の重なり) |
| 2 | ホスト型 | 引用題なし (topic 内出題 0)。one / detail (ホストOS 経由のオーバーヘッド、既存 PC に手軽) / mix: ホストOS = 物理マシン上で直接動く、ゲストOS = 仮想マシンの中、で区別 — 事実どおり | OK (flow static) | OK | L3 (en 見出し語訳)、L5 (zh 导入) |
| 3 | ハイパーバイザー型 | 引用題なし。one (ハードウェア直上に制御ソフト) / detail (CPU・メモリの割り振り、層が少なくサーバで広く使用) / mix: ハイパーバイザー = ソフト名、ハイパーバイザー型 = 方式名 — 事実どおり。hook (supervisor の一段上) は語源として正しい | OK (flow static) | OK | L2、L5 (en analogy) |
| 4 | コンテナ型 | 引用題なし。one (1 つのホストOS のカーネル共有、実行環境だけ分ける) / detail (ゲストOS なし、起動が速い・資源が少ない、カーネルの異なる OS は向かない) — カーネル共有の境界は正確。図ノード 3 (ハードウェア / ホストOS (カーネル) / コンテナ (アプリと部品)) は本文と一致 (a2 審査 #1 low の「管理ソフト」層は削除済み) | OK (flow static) | OK | L4 (pairs と detail の対比) |
| 5 | VM | quiz 2022r04-q099 のみ (exam 考点なし)。one (Virtual Machine の頭文字、仮想マシンと同じもの) / detail (製品名・管理画面で VM と書く、実物は物理マシン) / mix: 技術の名前ではなく 1 台 1 台の仮想コンピュータ。q099 は仮想マシンの考点・detail で解ける | OK (analogy・hook 空) | one_zh/en の `[[jp:VM]]` なし (同綴) | 記録のみ |
| 6 | 仮想マシン | OK — exam 1 / 2 題: 仮想マシンごとに別の OS を入れ独立したコンピュータとして動かせる (2018h30h-q062 正答 = 仮想化 [独立した OS とアプリ] / 2022r04-q099 正答ア = a のみ; 考点は a の一般的性質だけを述べ、b・c を打ち消す文・組・順序の再現なし → D-211 (ii)、a1 の (iii) MEDIUM 解消)。q099 の b・c を否定する根拠は detail「資源の一部が割り当てられその範囲で動く」・key_points[4]「資源を分け合って動く」の一般原則。a1 HIGH (割り当ての合計 ≤ 物理資源、図の数値) は文・図とも削除 → 解消。detail の障害の独立・複製 / 移動のしやすさは正しい (ライブマイグレーションの語は使わない) | OK (図なし) | OK | なし |

**単元レベル**: goals 3 (仮想化一般 + サーバの仮想化 / 3 方式の見分け / VM = 仮想マシン)、overview_cols 2・overview_rows 6、pairs 2 組 (ホスト型 / ハイパーバイザー型 4 行 key 1、ハイパーバイザー型 / コンテナ型 4 行 key 1; pair 配置は後側用語の後)、key_points 5 (a1 の「区切る」だけの言い切りは key_points[0]・goals[0]・overview_rows[0] とも「異なる構成に見せる」+ サーバの仮想化の例に修正済、overview_rows[0].extra「複数を 1 つにも」)、summary (派生) 一致、challenge 4 題 (§1-3)。unit_summary は v1 同文 (分割・統合、範囲外)。事実誤りなし、三語一致。

## 3. 指摘一覧

**a1 / a2 前回指摘の解消 (三語確認)**: a1 HIGH (terms[5].points[1] 割り当て合計 + 図) → points[1]・fig とも削除、zh / en も同じ (terms[5] は points 1 件・fig None) / a1 MEDIUM challenge 2019r01a-q057 → 削除 / a1 MEDIUM 仮想化を「区切る」だけと言い切り (one・goals[0]・overview_rows[0]・key_points[0]) → 三語とも「異なる構成に見せる」+ 統合も含む / a1 MEDIUM mix が仮想化を狭める → 対比相手を「サーバの仮想化」に変更 (zh「服务器虚拟化」・en "server virtualization") / a1 MEDIUM q099 a・b・c の題順なぞり → 項目 a 相当の 1 考点のみ / a2 jp-review #1 MEDIUM ゲストOS 未定義で図に出る → terms[0].detail で定義済。**回帰なし**。

**HIGH: 0 / MEDIUM: 0 / LOW: 6 (うち 建議修 2)** + 範囲外観察 2

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[0].hook_jp` / `hook_zh` / `hook_en` 2 文目 (+ 派生 `memory_hook_jp/zh/en`, `summary.memory_hooks_jp/zh/en[0]`) | 2 文目は one_jp「実際とは異なる構成に見せて使える」の言い直し (審査 #2 low、D-203 §6)。加えて「本物の機械と同じように働く」は 2022r04-q099 b (仮想サーバ数だけ物理機を増やしたのと同じ処理能力) の方へ僅かに読める (型 9 の手前; 同単元の terms[5].detail・key_points[4] が打ち消すので MEDIUM に至らない) | jp「実物の構成とは違っても、使う側からは本物の機械と同じように働く。」→「仮想マシンや仮想記憶の「仮想」も、この virtual の訳語である。」/ zh「即使与实物的构成不同，在使用者看来它也像真正的机器一样工作。」→「虚拟机、虚拟存储器中的“虚拟”，也是这个 virtual 的译词。」/ en "Even though the setup differs from the physical one, to the user it works just like a real machine." → "The same word gives the virtual in virtual machine and virtual memory." |
| L5 | LOW **建議修** | `terms[2].analogy_en` 2 文目 | loc 審査 low (未適用): 出入りする主語が住戸そのものになり英語として不自然 | "With no owner's house in between, each unit can get in and out easily." → "With no owner's house in between, residents of each unit can come and go easily." |
| L2 | LOW | `terms[0].analogy_*` / `terms[2].analogy_*` / `terms[5].analogy_*` | 3 つが住居を区切る像 (フロアの間仕切り / 更地の集合住宅 / マンションの住戸) で重なる (審査 #2 low、§9 同じ像の反復)。各像の結論は本文と矛盾しない | 記録のみ |
| L3 | LOW | `terms[1].one_en` / `key_points_en[1]` | en 見出し語訳 "hosted type" が v1 term_en "Hosted (Host OS) type" と表記ずれ (意味は同じ、本文内は統一) | 記録のみ |
| L4 | LOW | `terms[1].detail_*` 2 文目 / `terms[2].detail_*` 2 文目 / `terms[3].detail_*` 2〜3 文目 | 書き方 8: オーバーヘッドの大小 (pairs[0].rows[2]) と 起動・動かせる OS (pairs[1].rows[2..3]) が各用語の detail でも片側ずつ述べられる。各 detail は自側の正の性質で、方式の「なぜ」の中核 | 記録のみ |
| L6 | LOW | `goals_zh[2]` / `key_points_zh[4]`「分享」、`terms[1].detail_zh` / `key_points_zh[1]`「导入」、`overview_rows[0].extra_zh[0]`「技术・思路」 | loc 審査 low (未適用): 資源の共用に「分享」、ソフトの導入に「导入」、中黒の使用は中国語として不自然。誤答肢の読みには当たらない | 記録のみ (直すなら「共享」「安装」「技术／思路」) |

**範囲外の観察**:
- O1 `terms[0].fig` (svg) は v1 継承で、ノードラベルが jp のみ (物理サーバ(1台) / 仮想化 / 仮想環境1〜3)。zh / en 読者にも jp で表示される。内容は detail 1 文目 (代表的な使い方) と一致し事実誤りなし。
- O2 `terms[3].fig` / `terms[1].fig` / `terms[2].fig` は層の積み重ねを flow で描く (審査 #1・#2 low)。登録図種内、記録のみ。

確認済みで問題なし: 限定条件 (exam 考点 3 件全て保持)、§9 禁止句 (jp / zh 0、en "must" 2 件は偽陽性)、framing (validate 0)、D-197 羅列 (validate 0)、D-200 (全考点 1 文・≤81 字)、写し (validate 0、独立照合 遮蔽あり / なし とも 0、近似 19 件は偽陽性)、option tracing (choice-echo warn なし、q099 は D-211 (ii) で可)、`[[jp:]]` 原語 10 種実在、zh 訳語表準拠、図種 (svg ×1 / flow ×3)、用語・term_zh・term_en の v1 不変量、challenge が単元で解けること (4/4)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **6** (建議修 2: L1・L5 / 記録のみ 4: L2・L3・L4・L6) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 7 件 (exam 3)・引用 5 題 + quiz / challenge で、考点は正答と一致し誤答肢を支持せず、限定条件の落ちも無い。a1 の HIGH 1・MEDIUM 4 と a2 審査 #1 MEDIUM 1 は三語とも解消、回帰なし。建議修 L1・L5 は補丁 (B3) で修正推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-16-43-u03
✓ technology-16-43-u03 unit: 0 issues (data/ip/textbook/units/technology-16-43-u03.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-16-43-u03
✓ technology-16-43-u03 parity: 27 locations, 0 diff
EXIT=0
```
