# Rule A 全数抽検 — technology-13-35-u01 (情報量の単位とデジタル化の工程)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-07 (S148 続、b41)、repo HEAD `a08306eb` + 作業ツリー (単元 JSON は未コミットの `b41-u01-a2` [種付き] merge 結果、sha256 先頭 `4688054ca4533158`)。
- **対象**: `data/ip/textbook/units/technology-13-35-u01.json` (textbook-unit-v2)、用語 **7 / 7 = 全数** (ビット / バイト / 情報量 / デジタル化 / 標本化 / 量子化 / A/D変換) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195、D-197〜D-200、D-202、D-203、D-204/D-205、D-208 (既知の失敗型 1〜10)、D-209、D-210、D-211、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `.planning/v2/technology-13-35-u01/v1-original.json` (用語 7 語・`term_zh`・`term_en`・`unit_summary_jp` とも v1 と一致)。前回: `failures/phase5/stage_07_ui/phase3/batch/technology-13-35-u01_attempt_1.md`。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・限定条件落ち・写し / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 7 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig / quiz` と単元レベル全フィールドを三語とも読んだ。派生 (`definition_* / explanation_* / memory_hook_*`) は本体の記法展開版であることをスクリプトで確認 (60 欄、不一致 0)。
2. **考点 × 引用題** (考点 13 件 = exam 10 + mix 3、qid 付き 10 件、引用延べ 12 = 異なり 10 題、全題 topic `technology-13-35`): `questions.json` の選択肢・`correct_answer` と translations の `stem_jp_clean` を再読。**計算題は全て自分で再計算**:
   - 2013h25a-q076: 2 バイト = 16 ビット → 2^16 = 65,536 → エ (一致)。
   - 2012h24a-q072: 置換表 (A=0 / B=10 / C=11) で 0110001010 を先頭から区切る → 0|11|0|0|0|10|10 = ACAAABB → イ (一致)。
   - 2018h30h-q075: 26 種 → 2^4=16 < 26 ≤ 32=2^5 → 5 → イ (一致)。
   - 2010h22a-q083: 1 ページ 700 字 × 2 バイト = 1,400 バイト、4.7×10^9 / 1,400 ≈ 3.36×10^6 → 約 336 万ページ → ウ (一致)。
   - 2011h23a-q078: k < M < G < T → ア / 2023r05-q096: M × 10^3 = G → イ (一致)。
   - 単元内の数値: スイッチ 3 個 → 2^3 = 8、100 通り → 6 ビット (64) 不足・7 ビット (128) で足りる、1 バイト = 2^8 = 256、SI 表 (1k = 1,000 / 1M = 1,000k / 1G = 1,000M / 1T = 1,000G) → 全て正しい。
   - 非計算題: 2021r03-q089 正答イ (a アナログ / b ディジタル / c ディジタル)、2009h21h-q066 正答ウ (周期 短い / 段階数 多い)、2010h22h-q060 正答ア (振幅をより細かく)、2010h22h-q088 正答イ (図読み; 4 段階・2 ビット符号の読み戻し)。
3. **quiz / challenge_questions** (quiz 計 13 枠、challenge 5 題 = 2011h23a-q078 / 2018h30h-q075 / 2023r05-q096 / 2012h24a-q072 / 2010h22h-q060、全て本文で引用済み): 本文と矛盾なし。2010h22h-q060 の誤答 (データ量が減る / CPU 負担が減る / 記録できる周波数の上限が上がる) を支持する記述なし (周波数側は標本化の話として別欄)。
4. **D-198 写し**: validate copy guard 0 件、`warn choice-echo` 0 行。独立照合: JP 文字列 127 本 (派生除く、図セル・ラベル・caption・総表・対比表含む) × topic 全 35 題の stem_jp_clean + 選択肢、12 字窓 (句読点・記号・空白除去)、(a) カタカナ 4 字以上と英数を □ に遮蔽・実字 6 未満除外、(b) 遮蔽なし、(c) 1〜2 字置換の近似一致 → 各 **1 件**、同一箇所: `terms[2].points[0].text_jp` ↔ 2018h30h-q075「…に最小限必要なビット数は」。文全体は Dice 0.37 / 正規化編集距離 0.92 (HIGH 較正 ed 0.14 / Dice 0.52 から遠い)。「最小限必要なビット数」は概念の標準表現で、題の文字種 (A〜Z)・26 は使っていない → 偽陽性 (O1)。カタカナの多い文 (A/Dコンバータ・サンプリング・CD) は目視で題文の語順の流用なし。
5. **D-198 (iii) / 失敗型 (1)** — 前回 attempt 1 の MEDIUM 3 件 (+ JP #2 の 1 件) の解消を三語で確認 (§3 冒頭表)。
6. **D-195 / D-197**: one 1 文 × 7 (太字あり)、detail 2〜3 文、図 = static table ×2 (ビット・バイト) / flow steps ×1 (デジタル化 5 ノード 4 step) / flow static ×1 (A/D変換) / なし ×3 → 登録内。定義前使用: 符号 = ビット detail で定義、符号化 = デジタル化 detail で定義、標本化周期・標本化周波数 = 標本化 detail、量子化ビット数・量子化誤差 = 量子化 detail、D/A変換 = 図ラベルが先 (mix 考点で定義; JP review LOW 済み、記録のみ)。§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → `terms[1].hook_jp`「覚えられる」・`terms[3].hook_jp`「覚える」(記憶フックの言い方、L9) と `terms[5].analogy_jp`「数字が出る」(通常用法、偽陽性) のみ。D-197 羅列 validate 0。
7. **D-200**: 考点数 2/3/2/1/1/2/2 (≤3)、各 JP 1〜2 文・40〜78 字 (≤100)。framing: validate `pointFraming` issue 0。
8. **D-202 / D-203 単元全体**: 書き方 7 (「〜ほど」「最も近い」等の言い切りの欄間照合) 不整合 0。書き方 8 → L5。書き方 9 (限定条件) → §2 表、落ち 0。§6 比喩: 7 件中、定義の言い直しのみのものなし。
9. **D-205 / D-210**: 改訂される文書の構成数の記述なし。SI 接頭語は k・M・G・T の倍率のみ (R・Q 追加等の版に依存する個数は述べない)。法令改正前の引用題なし。
10. **D-211**: (i) 該当題なし (exam 考点を外して quiz のみに置いた題: 2009h21h-q066 はデジタル化の quiz のみだが、標本化・量子化の exam 考点で各 1 側ずつ引用; 学習目標の欠落なし)。2010h22h-q088 は A/D変換 の exam 考点 (ビット列 = 時刻ごとの段階番号の符号化列という一般原則、題の数値・符号列は不使用) のみ + 標本化 quiz。
11. **三語**: `[[jp:]]` 原語 14 種を jp 本文で照合 → 13 ok、`SI接頭語` は jp 本文が「SI 接頭語」(空白あり) のため字面不一致 (L7)。one_zh / one_en 7/7 に見出し語 `[[jp:]]`。zh 訳語 (`zh_terms.json`): validate warn 3 件 (スイッチ→交换机 = 照明スイッチなので「开关」が正、量子化ビット数 = 定訳「量化位数」×2) は全て偽陽性。前回 loc MEDIUM (zh の「文字」直訳) は zh 全欄で「文字」0 件 = 解消。
12. **機械ゲート**: §6。

## 2. 用語別判定 (7 / 7)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | ビット | OK — exam 2: n ビットで 2^n 通り・1 増で 2 倍 (2013h25a-q076 エ、再計算一致) / 先頭部分が他の符号と一致しない割当てなら長さの違う符号列も一通りに区切れる (2012h24a-q072 イ、再計算一致; 題の表の割当ては実際にこの条件を満たす)。table 1/2/3/n → 2/4/8/2^n 正 | OK | OK | L4 |
| 2 | バイト | OK — exam 2 + mix 1: バイト数 × 8 → 2 の累乗 (2013h25a-q076) / SI 接頭語は k→M→G→T で 1,000 倍ずつ (2011h23a-q078 ア / 2023r05-q096 イ; 誤答 ア「G×10^6=T」ウ「M×10^6=G」を支持しない) / b と B の 8 倍差 (mix、事実)。hook「bite をもじった造語といわれ」は伝聞の限定付きで可 | OK | OK | L6 |
| 3 | 情報量 | OK — exam 2: 2^n ≥ N の最小 n (2018h30h-q075 イ) / 文字数 × 1 字のバイト数、容量 ÷ 1 件分 (2010h22a-q083 ウ; 限定条件「圧縮しない文字だけ」「単位をそろえた」保持 = 題の前提「文字情報だけ」「1G = 10 億バイト」に対応)。detail 100 通り → 7 ビット正。analogy (はい/いいえの質問回数) は ⌈log2 N⌉ と一致 | OK (copy 窓 1 件 = O1 偽陽性) | OK | なし |
| 4 | デジタル化 | OK — exam 1: 音楽用 CD は一定間隔で数値化した値の並びを記録 → デジタル媒体 (2021r03-q089 c = ディジタル)。前回 (iii) の解消は §3 冒頭。detail の「複製・送信で劣化しにくい」「標本化・量子化・符号化」は事実。analogy (坂 → 階段、段の位置 = 標本化 / 高さ = 量子化) は one・detail と整合 | OK | OK | L8 / L9 |
| 5 | 標本化 | OK — exam 1: 周期を短くするほど点が密、復元波形が元に近づく (2009h21h-q066 ウ の周期側; 段階数側は量子化の考点に分離)。detail 周期・周波数の定義正。analogy (連写の間隔) は ウ を選ぶ向きで (9) に当たらない | OK | en one 語順 L2 | L2 |
| 6 | 量子化 | OK — exam 1 + mix 1: 1 標本のビット数増 → 段階数増 → 振幅を細かく記録、段階が多いほど元に近い (2010h22h-q060 ア / 2009h21h-q066 ウ の段階数側) / 標本化 = 時間方向、量子化 = 値の大きさ方向、標本化の後 (mix、事実)。one「最も近い段階」は 2010h22h-q088 の括弧の条件と同じ (切捨て型の存在は IT パスポート水準で不要、JP review LOW 記録済み) | OK | OK | L3 / L5 |
| 7 | A/D変換 | OK — exam 1 + mix 1: ビット列 = 標本化時刻ごとの量子化段階番号を符号化して並べたもの (2010h22h-q088 イ の読み戻しの原理; 題の段階数・符号列不使用) / D/A は逆向き (mix)。前回 JP #1 MEDIUM (比喩が空間の格子 = 時間方向の標本化と矛盾) は温度を 1 分おきに読み最も近い目盛りを書く像に変わり三語とも解消 | OK | en 考点の単複 L1 | L1 |

**単元レベル**: goals 3・overview_rows 7・pairs 2 (ビット / バイト 3 行 key 1、標本化 / 量子化 3 行 key 1)・key_points 4 (三語とも 4)・summary 一致・challenge 5。事実誤りなし、三語一致。

## 3. 指摘一覧

**前回 attempt 1 の MEDIUM の解消 (三語)**

| 前回 | 現状 | 判定 |
|---|---|---|
| JP #1 / #2 `terms[3].points[0]` + detail 第 1 文: 2021r03-q089 の空欄 b の定義句 (離散的な数値) と c (CD → デジタル) を題の順で、a (連続量・電圧) と組のまま言い直し | 考点は「音楽用 CD = 一定間隔の数値列 → デジタル媒体」のみ。アナログ側の比較相手・「離散的な数値」・電圧は考点・detail から消え (三語とも: jp「離散的な数値」は one_jp のみ、zh「离散的数值」0、voltage / 电压 / 電圧 0)、detail 第 1 文は「数値の並び → 劣化しにくい・計算できる」(性質) に変更。zh「音乐 CD 记录的是…数值序列」/ en "A music CD records a sequence of values…" も同じ | **解消** (残る one_jp の定義は L8) |
| JP #1 `key_points_jp[4]`: 2009h21h-q066 正解の組 (周期 短い × 段階数 多い) を一揃い再現 | key_points は三語とも 4 項目、周期・段階数の組の結論文なし。周期側 = 標本化 points[0]、段階数側 = 量子化 points[0] に各 1 側ずつ正の原則として分離 (failures 記載どおり D-209 で可)。`pairs[1].rows[2]` は「細かさを決めるもの」として 2 因子を名前で並べるが向き (短い / 多い) と結論を持たない | **解消** |
| JP #1 `terms[3].points[1]` (2010h22h-q088): 題が問わない工程順を exam 考点に | デジタル化の考点は 1 件 (CD) のみ。2010h22h-q088 は A/D変換 points[0] (読み戻しの原理) にのみ引用。工程順は goals / key_points / 図 / detail / pairs / 量子化 mix に残るが exam 考点ではない | **解消** (反復は L5) |
| a2 JP #1 medium (A/D変換 analogy の地図の格子) / a2 loc #1 medium (zh「文字」直訳) | §2 #7 / §1-11 のとおり | **解消** |

**HIGH: 0 / MEDIUM: 0 / LOW: 9 (うち 建議修 3)** + 範囲外観察 1

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 (before → after) |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[6](A/D変換).points[0].text_en` | 主語 bit string を単数の "the level number" と等置し "lined up" と続くため、ビット列が 1 つの番号に読める (jp は時刻ごとの番号の列)。loc #1・#2 で LOW 指摘済み・未修 | before `The bit string produced by A/D conversion ([[jp:A/D変換]]) is the level number found by quantization ([[jp:量子化]]) at each sampling ([[jp:標本化]]) moment, encoded ([[jp:符号化]]) and lined up in order.` → after `The bit string produced by A/D conversion ([[jp:A/D変換]]) is made of the level numbers found by quantization ([[jp:量子化]]) at each sampling ([[jp:標本化]]) moment, encoded ([[jp:符号化]]) and lined up in order.` (jp・zh 変更なし) |
| L2 | LOW **建議修** | `terms[4](標本化).one_en` | "a signal that changes over time at that moment" と続き、at that moment が changes に掛かって読める (loc #1 LOW、未修) | before `**Sampling** ([[jp:標本化]]) is the step of taking the value of a signal that changes over time at that moment, once every **fixed time interval**.` → after `**Sampling** ([[jp:標本化]]) is the step of taking, once every **fixed time interval**, the value that a signal changing over time has at that moment.` (jp・zh 変更なし) |
| L3 | LOW **建議修** | `terms[5](量子化).detail_jp / detail_zh / detail_en` | quiz・challenge の 2010h22h-q060 は同じ量を「符号化ビット数」と呼ぶが、単元に別名の記載がなく、学習者が量子化ビット数と結び付けにくい (失敗型 (3) の逆 = 別名の欠落、誤学習ではない) | jp: before `このビット数を **量子化ビット数** という` → after `このビット数を **量子化ビット数** (符号化ビット数ともいう) という` / zh: before `这个比特数称为 **量化位数**` → after `这个比特数称为 **量化位数**（也称编码位数）` / en: before `this number of bits is called the **quantization bit depth**` → after `this number of bits is called the **quantization bit depth** (also called the encoding bit count)` |
| L4 | LOW | `terms[0](ビット).points[1]` | 2012h24a-q072 が問うのは表に従う区切り戻しで、考点の「先頭一致しない割当て」条件そのものではない。ただし題の表はこの条件を満たし、条件が一意に戻せる理由なので正答と整合 (攻め所の一般化として事実は正しい)。符号化は U02 範囲 (rationale) とやや重なる | 記録のみ (手順側に寄せると題の場面のなぞりに近づく) |
| L5 | LOW | `goals_jp[2]`・`key_points_jp[3]`・`terms[3].fig`・`terms[3].detail_jp`・`terms[6].detail_jp`・`pairs[1].rows[1]`・`terms[5].points[1]` (+ zh/en) | 標本化 → 量子化 → 符号化の順が 7 欄に出る (書き方 8 の反復; 図・総まとめの構造上の重複を含む) | 記録のみ |
| L6 | LOW | `terms[1](バイト).fig.data.cols[1]`・`points[1]` | 見出し「1 つ下の単位との関係 (SI 接頭語)」が key 行「1 バイト = 8 ビット」にも掛かる。記憶容量の 1,024 倍の慣用に触れないが、SI 接頭語と明記しており引用題 3 題の正答と矛盾なし | 記録のみ |
| L7 | LOW | `terms[1].points[1].text_zh/en` の `[[jp:SI接頭語]]`、`terms[0].detail_zh`「称为 **编码**」、`terms[4].one_zh`「也称抽样」 | 原語マーカーが jp 本文「SI 接頭語」と空白差。zh で 符号 / 符号化 がともに「编码」。jp の別名 (サンプリング) を zh は中国語の別称に差し替え。いずれも意味は正しい (loc LOW 既出) | 記録のみ |
| L8 | LOW | `terms[3](デジタル化).one_jp` / `overview_rows[3].one_line_jp` | 定義「連続して変わるアナログの情報を…離散的な数値に置き換える」は 2021r03-q089 の空欄 b の定義句と語が重なるが、考点ではなく見出し語の標準定義 (D-209 の一般定義) で、考点は CD の 1 点のみ・空欄 a の比較相手 (物理量の例) は無い → (iii) に当たらない | 記録のみ |
| L9 | LOW | `terms[1].hook_jp`「覚えられる」/ `terms[3].hook_jp`「覚える」 | 7 フック中 2 件が「覚え〜」で結ぶ (記憶フックの言い方、同型反復は軽微) | 記録のみ |

**範囲外の観察**: O1 独立 copy 照合の 1 件 (`terms[2].points[0].text_jp` ↔ 2018h30h-q075「最小限必要なビット数」) は概念の標準表現で、Dice 0.37 / ed 0.92、題の文字種・数値不使用 → 偽陽性。

確認済みで問題なし: 計算題 6 題 + 単元内数値の再計算、限定条件 (考点 10 件全て保持)、誤答肢支持 0、(6) zh/en の誤答肢寄りの語 0、(8)(9) 比喩・フックの誤誘導 0 (連写・体重計・温度計・階段はいずれも正答側)、(10) 閉じた列挙なし、§9 定型締め句 0、framing 0、D-197 0、D-200、図種登録内、派生一致、v1 不変量。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **9** (建議修 3: L1〜L3 / 記録のみ 6: L4〜L9) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。前回 attempt 1 の (iii) 型 MEDIUM 3 件 (2021r03-q089 の空欄語の組、2009h21h-q066 の正解の組、2010h22h-q088 の工程順) と a2 審査の MEDIUM 2 件は三語とも解消、回帰なし。建議修 L1〜L3 は B3 補丁推奨。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-13-35-u01
✓ technology-13-35-u01 unit: 0 issues (data/ip/textbook/units/technology-13-35-u01.json), 3 warning(s)
  warn  zh-term  overview_rows[5].extra_zh[1]  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  terms[0](ビット).analogy_zh  スイッチ → 交换机（Switch） not in the zh text (data/ip/textbook/zh_terms.json)
  warn  zh-term  pairs[1].rows[2].b_zh  ビット → 比特 not in the zh text (data/ip/textbook/zh_terms.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-13-35-u01
✓ technology-13-35-u01 parity: 30 locations, 0 diff
EXIT=0
```
