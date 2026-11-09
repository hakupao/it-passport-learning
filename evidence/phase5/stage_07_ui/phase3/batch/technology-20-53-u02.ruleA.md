# Rule A 全数抽検 — technology-20-53-u02 (3D・映像メディアの応用)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b74)、repo HEAD `ca4b2748` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b74-u02-a2` (a1 r1 を seed) merge 結果、sha256 先頭 `f86b997219614b18`)。
- **対象**: `data/ip/textbook/units/technology-20-53-u02.json` (textbook-unit-v2)、用語 **5 / 5 = 全数** (3D / シミュレーター / ゲーム / 4K / 8K) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 / D-197 / D-198 / D-199 / D-200 / D-202 / D-203 / D-204 / D-205 / D-208〜D-210、scratchpad `ruleA_template.md` の既知失敗型 (1)〜(10)。比較: `.planning/v2/technology-20-53-u02/v1-original.json` (用語 5 語・`term_zh`・`term_en` とも v1 と一致)、前回指摘 `journal.b74-u02-a1.jsonl` / `journal.b74-u02-a2.jsonl` (type:"result")。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実・引用題の限定条件落ち・写し / MEDIUM = 欄同士の不整合 (観点 7)・図/比喩の範囲が one/detail と食い違う (D-204)・前回修正の後戻り / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 5 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig (data・label・caption)` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.key_points_*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。
2. **考点 × 引用題**: 考点 5 件は全て `mix` で qid 付きは 0 件 (manifest の `term_questions` は 5 用語とも空、topic `technology-20-53` の 10 題に本単元の見出し語を問う題はない)。そのため考点は全て事実照合で判定し、全 2900 題を「シミュレー / 4K / 8K / 3D / 3 次元 / ハイビジョン」で横断検索して矛盾する正答がないことを確認: 2015h27h-q027 (シミュレーション = 将来の予測、strategy) / 2016h28a-q069 (環境シミュレーション) は one「現実の装置や出来事を模擬的に再現し…結果の検証」と整合; 2019h31h-q073 (8K は誤答肢、正答 5G) は本文と無関係; 2019h31h-q080 (3D プリンタ = 3 次元データで立体物を造形、誤答 = 3D 効果の画像を平面に印刷) は 3D の one / detail と整合; 2025r07-q067 (3 次元画像処理の高速化 = GPU) は矛盾なし。
3. **画素数の再計算**: 1,920 × 1,080 = 2,073,600 / 3,840 × 2,160 = 8,294,400 (= FHD × 4.00) / 7,680 × 4,320 = 33,177,600 (= FHD × 16.00、= 4K × 4.00)。`terms[3].detail`「縦横 2 倍 → 総数約 4 倍」、`terms[4].points[0]`「数字の比 2 倍・総数の比約 4 倍」、`pairs[1].rows[0..2]` (3,840/7,680・2,160/4,320・約 4 倍/約 16 倍)、8K analogy「縦も横も半分のタイル」(= 4 倍) は全て一致。代表値は厳密に整数倍で「約」は無害な保険。「4K の 4 は横の画素数 (3,840 ≈ 4,000) から」も正しい。
4. **challenge_questions** (4 題: 2020r02o-q083 プロジェクションマッピング / 2014h26h-q080 加法混色 = 白 / 2012h24h-q084・2013h25h-q054 解像度の単位 = dpi): 全て前提単元 u01 の考点が引用する題 (u01 の CG・加法混色・dpi の exam 考点) で、prerequisite の知識で解ける。本文と矛盾なし。2013h25h-q054 の誤答肢 pixel に対し、本単元は画素を「画面を作っている色の点 1 つ 1 つ」と定義し単位とは呼ばない (失敗型 (6) 該当なし)。
5. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 行 0。独立照合として単元の JP 文字列 69 本 (派生フィールド除く、図ラベル・caption・総表・対比表を含む) を topic 内全 10 題の題文 (stem_jp_clean 優先) + 選択肢と 12 字連続照合: カタカナ 4 字以上と英数を遮蔽 → 0 件、**遮蔽なし → 0 件**、12 字窓の編集距離 ≤2 の近似一致 → 0 件。カタカナの多い文 (シミュレーター・リアルタイム描画・フルハイビジョン) を目視 — 題に無い表現。比喩 (粘土の家・稽古場・紙芝居の語り手・タイル張りの床) はいずれも題に無い場面。
6. **D-195**: 結論先行 (one = 1 文 × 5、太字あり)、展開 2〜3 文、§9 禁止句 grep (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が) → jp 本文 0 件 (`freq_badge`「低頻」のみ)。zh (考试 / 必须 / 重要 / 一定要 / 出题 / 选项 / 记住) 0 件、en ヒット `always` (`terms[2].analogy_en`「紙芝居はいつも同じ順」) と `must` (`terms[4].points[0].text_en`「掛け合わせる必要」) は通常の用法で偽陽性。図種: 3D = compare static、シミュレーター = flow steps 4 — 登録内、他 3 語は図なし (4K/8K の量の関係は pairs[1] が担う; §0-8 により欠如は最大 low で指摘しない)。pair 配置 (シミュレーター/ゲーム はゲームの後、4K/8K は 8K の後、各組 key 行あり)。
7. **D-200**: 考点数 1/1/1/1/1 (≤3 ✓)、各 JP 文数 2/2/2/1/2・字数 73/77/77/61/70 (≤100 ✓)。framing: validate `pointFraming` の warn 0。
8. **D-202 / D-203 単元全体点検**: 書き方 7 → M1 (§3)。書き方 8 (目的で分ける対比: `pairs[0].rows[0]` key + ゲーム考点 = 2 箇所、シミュレーター考点は「表示の方法 vs 用途」で比べる相手が別; 4K/8K の比: `pairs[1].rows[2]` + 8K 考点 = 2 箇所、4K 考点は「名の由来 vs 総数の倍率」で別) → 許容。書き方 9: 引用題なしのため対象外。§6 → L3。
9. **D-205**: 改訂される文書の構成要素の数・名前は本単元に無い (4K/8K は代表値と明記)。
10. **三語**: zh・en が jp と同じ事実か、図ラベル・caption・比較行の三語一致 (parity 24 locations 0 diff)、`[[jp:…]]` 原語 4 種 (シミュレーター / ゲーム / リアルタイム描画 / フルハイビジョン) が jp 本文に実在。one_zh / one_en の見出し語 `[[jp:]]` はシミュレーター・ゲームにあり、3D / 4K / 8K はラテン文字で三語同形 (既 PASS の 20-52-u05 MPEG・H.264、u04 GIF と同じ慣行)。zh 訳語は `zh_terms.json` と一致 (3D / 模拟器 / 游戏 / 4K / 8K / CG)、validate の B6 / jp-origin warn 0。
11. **隣接単元との整合**: u01 (CG detail「3 次元 CG = 奥行きのある立体を計算で描く」、ppi の画素の定義、dpi を 2 倍 → 画素数 4 倍) と一致。u03 (VR の「危険を伴う作業を安全に練習」) はシミュレーターの用途と矛盾せず、目的による区別も衝突しない。technology-20-52-u03 (縦横 2 倍 → 容量 4 倍)・u05 (4K/8K = データ量の大きい高解像度映像、H.265 向き) は 8K detail「データ量も大きくなり…高い性能」と一致。technology-18-49-u04 (解像度 = 横×縦の画素数、3D = 幅・奥行き・高さ) と表記順・定義とも一致。
12. **機械ゲート**: §6。

## 2. 前回指摘の解消確認 (a1 MEDIUM 2 件 + 主要 LOW)

| 前回 | 内容 | 現状 (jp / zh / en) | 判定 |
|---|---|---|---|
| a1 r1 MEDIUM | 3D の考点・要点・総表が「形状データを持つことが決め手」と 3D 全体に言い切り (立体視は形状データを持たないことがある) | `terms[0].points[0]` = 「3DCG かどうかは…形状データから計算して描いた映像は 3DCG」/ zh「是不是 3DCG…」/ en "Whether an image is 3DCG…"; `key_points_*[0]` = 「コンピュータで描く 3D (3DCG) は」/「用计算机绘制的 3D（3DCG）」/ "Computer-drawn 3D (3DCG)"; `overview_rows[0].extra_*[1]` = 「3DCG では…」/「3DCG 保存…」/ "3DCG stores…"。3 欄は三語とも 3DCG に絞られ解消。**ただし `terms[0].fig.data.b` が a1 r1 の「3DCG (立体)」から a2 で「立体の表現 (3D)」に戻り、3DCG だけの性質を 3D 一般として示す → M1 (後戻り)** | 3 欄解消 / 図で再発 |
| a1 r2 MEDIUM | 確認題 2016h28h-q100 / 2024r06-q025 (AR、u03 の内容) が本単元で解けない | 両題 (+ 2025r07-q019 VR) は `challenge_questions` から除去。現行 4 題は u01 の引用題で前提知識で解ける。言語非依存フィールドのため三語共通 | 解消 |
| a1 LOW | 8K 比喩「半分の幅」だと 2 倍にしかならない | 「縦も横も半分の大きさのタイル」/「长和宽都只有一半」/ "half as long and half as wide" | 解消 |
| a1 LOW | シミュレーター hook 後半が定義の言い換え | hook は語源 (simulate = まねる) のみ | 解消 |
| a1 LOW | 8K 表図と pairs[1] の数値重複 | 8K の図は削除、数値は pairs[1] のみ | 解消 |

## 3. 用語別判定 (5 / 5)

| # | 用語 | 事実 | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 3D | one (縦・横 + 奥行きで立体として表す) は v1 と同範囲で正しい。detail は 3DCG に限定して形状データ・視点/光からの計算を述べ正しい。mix 考点 (平面の画面に映しても形状データから計算した映像は 3DCG) は正しく、範囲も 3DCG に限定。**図の b 列見出しが「立体の表現 (3D)」で、rows[1] 視点を回り込ませて見られる・rows[2] 視点と光の当たり方から計算して表示 は 3DCG に限る性質 (2 台のカメラで撮る立体視映像は 3D だが、どちらも当たらない)** | 図 compare static 登録内 | 図見出しの範囲ずれは三語共通 | **M1**, L1 |
| 2 | シミュレーター | one / detail (危険・費用・まれな状況「といった」場面、航空機・自動車の訓練、故障対応) 正しい。mix 考点 (3D 映像は再現の手段の一つ、決め手は現実の代わりに試す用途) 正しく、横断検索の題 (2015h27h-q027 / 2016h28a-q069) とも整合。flow steps 4 は one と一致 | OK | OK | L2 |
| 3 | ゲーム | one (3D・CG を娯楽に、操作に合わせ描き直す) は v1 と同範囲。detail (リアルタイム描画) 正しい。mix 考点「娯楽ならゲーム、訓練・検証ならシミュレーター」は単元の定義からの区別で、引用題の裏付けはないが、反する正答もない | OK | OK | L4 |
| 4 | 4K | 3,840 × 2,160、FHD の縦横 2 倍・総数 4 倍 — 再計算一致。考点 (4 は横の画素数由来で総数倍率とは別) 正しい | OK | en "high-definition" / zh「高清晰」 → L5 | L5 |
| 5 | 8K | 7,680 × 4,320、4K 比 総数 4 倍・FHD 比 16 倍 — 再計算一致。考点 (数字の比 2 倍・総数比約 4 倍、縦も同じ比で掛け合わせる) 正しい (16:9 の代表値で縦横同率)。detail (データ量・機器性能) は 20-52-u05 と整合 | OK | L5 と同じ | L5 |

**単元レベル**: goals 3・overview_cols 2・overview_rows 5・pairs 2 組 (3 行 key 1 / 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge 4 題 (§1-4)。`unit_summary_*` は v1 と同文 (未改稿)。事実誤りなし。

## 4. 指摘一覧

**HIGH: 0 / MEDIUM: 1 / LOW: 6 (うち 建議修 2)**

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| M1 | **MEDIUM** | `terms[0].fig.data.b.jp` / `.zh` / `.en` | 観点 7 / D-204 (失敗型 (4) 図の範囲が one・detail と食い違う + (5) 前回修正の後戻り)。one は 3D を立体視も含む広い定義、detail・考点・要点・総表は「3DCG」に絞った (a1 r1 MEDIUM の修正)。ところが図の b 列見出しが a1 r1 の「3DCG (立体)」から a2 で「立体の表現 (3D)」に変わり、rows[1]「視点を回り込ませて見られる」・rows[2]「視点と光の当たり方から計算して表示」という 3DCG だけの性質を 3D 一般の性質として示す。a1 で MEDIUM とされたのと同じ範囲の食い違いが図で再発している | jp「立体の表現 (3D)」→「コンピュータで描く立体 (3DCG)」/ zh「立体表现（3D）」→「计算机绘制的立体（3DCG）」/ en "Solid representation (3D)" → "Computer-drawn solid (3DCG)" (見出しの中で 3DCG を定義するので、a1 r2 LOW「3DCG が定義より先に図に出る」も同時に解消。a 列・rows は変更不要) |
| L1 | LOW 記録のみ | `terms[0].analogy_jp/zh/en` | 粘土の模型を回すと裏も見える、の像は形状を持つ 3DCG 寄りで、立体視の 3D には当たらない。ただし直前の detail が 3DCG に絞った「形そのものを持っているので視点を変えられる」を絵にしたもので、3D 全般について主張する文ではない | 記録のみ (M1 修正後は図・detail と揃う) |
| L2 | LOW 記録のみ | `overview_rows[1].extra_jp[0]` (「3D の応用」) / `terms[1].points[0]` | 総表はシミュレーターを「3D の応用」とし、考点は「3D 映像は手段の一つ」とする。単元構成上の位置づけとして成り立ち矛盾ではない (a2 jp-review と同判断) | 記録のみ |
| L3 | LOW 記録のみ | `terms[3].hook_jp/zh/en` 後半、`key_points_*[3]` | 「4K = 横に約 4 千個の点」は one の言い直し (§6 / §9)。前半の K = キロは別の手がかり | 記録のみ |
| L4 | LOW 記録のみ | `terms[2].points[0].text_*` | 「娯楽ならゲーム、訓練・検証ならシミュレーター」は単元の定義の範囲での区別で、引用題の裏付けはない (シミュレーションゲーム等は実在)。反する正答も無い | 記録のみ |
| L5 | LOW **建議修** | `terms[3].one_zh/en`、`terms[4].one_zh/en`、`overview_rows[3].one_line_zh/en` | jp「高精細映像の規格」を zh「高清晰影像规格」/ en "high-definition video standard" と訳す。zh の「高清」・en の HD は通常 720p/1080p を指し、同じ単元で FHD の 4 倍・16 倍と説明する 4K/8K と呼び名がかみ合わない (4K/8K は超高清 / UHD)。誤りではないが誤解の余地 (a2 loc-review LOW と同旨) | `terms[3].one_zh`「**4K** 是横向 **像素** 数约为 4,000（代表值为 3,840 × 2,160）的高清晰影像规格。」→「**4K** 是横向 **像素** 数约为 4,000（代表值为 3,840 × 2,160）的超高清影像规格。」/ `terms[3].one_en` "**4K** is a high-definition video standard with about 4,000 **pixels** across (typically 3,840 × 2,160)." → "**4K** is an ultra-high-definition video standard with about 4,000 **pixels** across (typically 3,840 × 2,160)." / `terms[4].one_zh`「…、能表现比 4K 更精细影像的高清晰影像规格。」→「…、能表现比 4K 更精细影像的超高清影像规格。」(文中の「高清晰影像规格」→「超高清影像规格」のみ置換) / `terms[4].one_en` "**8K** is a high-definition video standard with about 8,000 pixels across (typically 7,680 × 4,320), able to show finer images than 4K." → "**8K** is an ultra-high-definition video standard with about 8,000 pixels across (typically 7,680 × 4,320), able to show finer images than 4K." / `overview_rows[3].one_line_zh`「横向像素约 4,000 的高清晰影像规格」→「横向像素约 4,000 的超高清影像规格」/ `overview_rows[3].one_line_en` "A high-definition video standard with about 4,000 pixels across" → "An ultra-high-definition video standard with about 4,000 pixels across" (jp は変更なし) |
| L6 | LOW **建議修** | `key_points_en[0]` | jp「見え方を計算して描く」の「描く」が en に無い (zh は「再绘制」あり)。a2 loc-review LOW と同旨 | "Computer-drawn **3D** (3DCG) works out how objects look from shape data that includes depth, based on the viewing position and light direction." → "Computer-drawn **3D** (3DCG) works out how objects look from shape data that includes depth, based on the viewing position and light direction, and draws them on screen." |

**範囲外の観察**:
- O1 確認題 4 題はいずれも u01 の用語 (CG・加法混色・dpi) の題で、本単元の 5 見出し語を直接は問わない。topic に本単元の見出し語の題が無い (term_questions 全空) prep 側の制約で、前提単元の内容として解けるので記録のみ。
- O2 `unit_summary_*` は v1 と同文 (未改稿、B2 審査済み)。
- O3 4K/8K の量の関係に図なし (登録図種に操作部品なし、§0-8 で最大 low、pairs[1] が代替)。

確認済みで問題なし: 画素数の再計算 (全一致)、§9 禁止句 (jp/zh 0、en 偽陽性 2)、framing warn 0、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤77 字)、写し (validate 0 + 独立照合 遮蔽あり/なし/近似 全 0)、`[[jp:]]` 原語 4 種実在、zh 訳語表一致、図種登録内、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、a1 MEDIUM 2 件の主欄 (考点・要点・総表・確認題) は三語とも解消、隣接単元 (u01 / u03 / 20-52 / 18-49-u04) と矛盾なし。

## 5. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **1** (M1) |
| LOW | **6** (建議修 2: L5・L6 / 記録のみ 4: L1〜L4) |

## 6. 判定

**FAIL (REVISE)** — D-199: MEDIUM 1 件 (M1)。M1 は `terms[0].fig.data.b` の 1 フィールド内の文字列置換 (三語) で解消でき、構造変更不要のため B3 補丁で対応可能。補丁適用後は HIGH 0 / MEDIUM 0 で PASS 相当 (補丁後に validate / parity の再実行を要す)。L5・L6 は同じ補丁での修正を推奨。

## 7. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-53-u02
✓ technology-20-53-u02 unit: 0 issues (data/ip/textbook/units/technology-20-53-u02.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-20-53-u02
✓ technology-20-53-u02 parity: 24 locations, 0 diff
EXIT=0
```
