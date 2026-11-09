# Rule A 全数抽検 — technology-20-53-u01 (色と画像表現の基礎)

- **Auditor**: `oh-my-claudecode:verifier` (opus) — Rule D: 本文の書き手 (workflow writer / critic / localiser) とは別 agent・別 context。単元ファイルは変更していない (本ファイルのみ新規作成)。
- **Date**: 2026-11-08 (S151 b74)、repo HEAD `ca4b2748` + 作業ツリー (単元 JSON は未コミットの書き直し版 = `b74-u01-a1` merge 結果、sha256 先頭 `af12936ce6d84d65`)。
- **対象**: `data/ip/textbook/units/technology-20-53-u01.json` (textbook-unit-v2)、用語 **6 / 6 = 全数** (加法混色 / 減法混色 / dpi / ppi / CG / コンピュータグラフィックス) + 単元レベル (goals / overview_rows / pairs / key_points / summary / challenge_questions)。
- **基準**: D-195 (骨格・図・強調・§6・§9)、D-197 (羅列) / D-198 (写し) / D-199 (high 0 かつ medium 0) / D-200 (考点 ≤3、各 JP ≤2 文・≤100 字)、D-202、D-203、D-204 / D-205、D-208〜D-210 の既知失敗型 (1)〜(10)、`PLAN_stage7_phase3_batch.md` §0-5 / §0-8。比較: `data/ip/textbook/.planning/v2/technology-20-53-u01/v1-original.json` (用語 6 語・`term_zh`・`term_en` とも v1 と一致)。過去審査: `journal.b74-u01-a1.jsonl` (jp-review r1 REVISE = HIGH 1 / MEDIUM 2 / LOW 8、r2 PASS = LOW 7、loc-review r1 PASS = LOW 5)。
- **重大度**: HIGH = 過去問を誤答させる・誤った事実を学ぶ・引用題の限定条件落ち / MEDIUM = 誤解を招く・規則違反・欄同士の不整合 / LOW = 文体・D-203 の low 類。過去問の題文・選択肢は引用しない (qid + 言い換え)。

## 1. 方法

1. **全文読み取り**: 6 用語の `one_* / detail_* / analogy_* / hook_* / points[] / fig / quiz` と単元レベル全フィールドを三語とも読んだ。派生フィールド (`definition_* / explanation_* / memory_hook_* / summary.*`) が本体の記法除去版であることをスクリプトで確認 (不一致 0)。図: `terms[0]` / `terms[1]` = 既存 SVG static (`figures/technology-20-53-u01-t01.svg` ラベル「赤 R / 緑 G / 青 B / 白(全て最大)」、`-t02.svg`「シアン C / マゼンタ M / イエロー Y / 黒(全て最大)」)、`terms[2]` = static table、他 3 語 = 図なし。
2. **考点 × 引用題 (考点 全 9 件 = exam 6 + mix 3、引用 qid 延べ 7 = 異なり 7 題、全題 topic `technology-20-53`)**: `data/ip/quiz/questions.json` + `translations/<exam>.json` の `stem_jp_clean` で各題の題文・選択肢・`correct_answer` を再読。数値は自分で再計算: 2011h23tokubetsu-q098 (2 in × 3 in、24 ビット = 3 バイト/画素、上限 200 k バイト/枚) → 100 dpi: 200 × 300 × 3 = 180,000 B ≤ 200 k ✓、300 dpi: 600 × 900 × 3 = 1,620,000 B > 200 k ✗ → 正答イ 100 dpi と一致。dpi 表 (4 in × 5 in): 150 dpi → 600 × 750 = 450,000 / 300 dpi → 1,200 × 1,500 = 1,800,000 (= 4 倍) / 600 dpi → 2,400 × 3,000 = 7,200,000 (= 16 倍) 全て一致。1 インチ = 2.54 cm ✓。
3. **quiz / challenge_questions** (quiz 計 9 枠 + challenge 5 題、全て本文で引用済み = 未引用 0): 本文と矛盾なし。ppi の quiz 2013h25h-q054 (スキャナの読み取り解像度の単位 = dpi; 誤答に pixel・fps・ppm) は pairs[1].rows[0..1] (dpi = 点・スキャナ / ppi = 画素・画面) と ppi の mix 考点で dpi を選べ、ppi 側の記述は誤答「pixel」を支持しない。
4. **D-198 写し**: validate の copy guard = 0 件、`warn  choice-echo` 0 件。独立照合として単元の JP 文字列 92 本 (派生フィールド除く) を topic 内全 10 題の題文 + 選択肢と 12 字連続照合 (句読点・記号・空白・記法除去):
   - カタカナ 4 字以上 + 英数を □ に遮蔽 (遮蔽後の実字 6 未満の窓は除外) → **0 件**。
   - 遮蔽なし → **5 件、全て偽陽性**: 用語名「コンピュータグラフィック(ス)」(unit_summary_jp / terms[5].one_jp / terms[5].points[0] / key_points_jp[3] ↔ 2020r02o-q083 題文) と正答語「プロジェクションマッピング」(terms[4].points[0] ↔ 同題正答ウ)。語の名前は表現ではない。
   - (c) **近似一致** (各用語の one / detail / analogy / hook / points / 表行の各文 ↔ その用語の引用題 + quiz 題の題文・各選択肢; 半大域 ed = 短い方の長さで正規化、低いほど近い / 文字 bigram Dice、高いほど近い。較正 HIGH = ed 0.14 / Dice 0.52): 最近接 `terms[1].points[0]` ↔ 2014h26a-q073 題文の該当節 **Dice 0.70 / ed 0.47** (答えをはめた題文と比べると Dice 0.78 / ed 0.41)。共有部の大半は見出し語と色名 (減法混色・シアン・マゼンタ・イエロー) で、それ以外の連続一致は「混ぜ合わせると理論上は」の 11 字 (12 字閾値未満)。ed は較正 HIGH から十分離れ、内容は CMY を重ねると理論上黒という標準事実なので写しとは判定しないが、Dice は較正値を超え「題文に答えをはめ込んだ形」(jp-review r1・r2 とも low) に近い → **L1 建議修** (単元の他欄の語「重ねる」に揃えて離す)。次点: `terms[4].points[0]` ↔ 2020r02o-q083 題文 (Dice 0.31 / ed 0.71) → §1-4 (d)。表行 ↔ q098 選択肢 (Dice ≤0.44、ed は 5 字前後の選択肢「60dpi」等が行内に収まるだけ) は数値・場面が別 (4 × 5 in、150/600 dpi は選択肢に無く、300 dpi のみ一般的な値として重なる) で写しではない。他は全て Dice ≤0.36 かつ ed ≥0.58。
   - (d) **(iii) 目視**: `terms[4].points[0]` (プロジェクションマッピング) は名前を問う題 (q083) の正答語の標準定義で、D-209 の分類型免除に当たる。要素順は「CG の映像 → 建物などの立体物の表面 → 投影 → 視覚効果」で題文 (立体物 → CG の映像 → 投影 → 視覚効果) と順序も異なる。選択肢 (デジタルサイネージ・VR・ポリゴン) の語・組・順は再現しない → L5 記録のみ。`terms[1].points[1]` (RGB → 明るく = 加法 / CMY → 暗く = 減法) は取り違えやすい 2 語を両側とも肯定の定義で述べる対比 (D-209 免除); 2012h24h-q072 の選択肢組 (CMY・HSB・RGY・RGB) を組として並べない。`terms[2].points[1]` (圧縮しない画像のデータ量 = 縦 × 横 × 1 画素のデータ量) は q098 の数値 (2 × 3 in、24 ビット、200 k バイト、60/100/300/1,200 dpi) も人物・懸賞ページの場面も使わず計算規則の一般表現。比喩 (懐中電灯・色セロハン・方眼紙・タイル) はいずれも引用題に無い場面。
   - カタカナの多い文の目視 (CMYK / シアン・マゼンタ・イエロー / イメージスキャナ / プロジェクションマッピング を含む 9 文): 上記以外に題文・選択肢の言い回しの流用なし。
5. **D-195**: 結論先行 (one = 1 文 × 6、太字あり)、展開 2〜3 文 (3/3/3/2/2/2 文)、比喩空 2 (CG・コンピュータグラフィックス、hook は CG のみあり)、hook 空 2 (ppi・コンピュータグラフィックス; ppi は analogy あり、コンピュータグラフィックスは one が CG との同一性を述べる別名項目)。定義前使用: 光の三原色 = 加法 one の同格、インクの三原色 = 減法 one、CMYK = 減法 detail で K を説明、画素 = dpi detail「読み取った点 1 つが画像の画素 1 つ」で意味が取れ、ppi detail で定義 (r2 low と同見解、記録なし)、プロジェクションマッピング = 考点内で定義。**§9 禁止句 grep** (試験 / しょう / 重要 / 必ず / 非常に / 問われ / 出る / 出題 / 押さえ / 頻出 / 覚え / 選択肢 / 選ぶ / とされる / 挙が / ポイント / 注意): 「とされる」1 件 (`terms[1].hook_jp`「Key plate の頭文字に由来するとされる」+ 派生 2) のみ。CMYK の K の語源は Key plate 説が通説だが blacK 説もあり断定できない事項の出典帰属で、ぼかしの定型句ではない → L7 記録のみ。zh / en の相当語 grep (all / only 等) は全て通常の用法で偽陽性。図の型 (既存 SVG static ×2 / static table ×1 / 図なし ×3) は全て登録内。pair 配置 (加法→減法 は減法の後、dpi→ppi は ppi の後、各組 key 行あり)。
6. **D-200**: 考点数 2/2/2/1/1/1 (≤3 ✓)、各 JP 文数 1〜2・字数 25〜54 (≤100 ✓、最大は CG `points[0]` の 54 字)。framing 件数: validate 0 issues (上限内)。
7. **D-202 / D-203 単元全体点検**: 書き方 7 → L3 (加法 detail「自ら光を出す機器」と technology-18-49-u04 の液晶の記述)、L4 (ppi detail の画素の範囲と主語)。書き方 8 (対比の出現欄) → 下の列挙。書き方 9 (限定条件) → §2 表に考点ごとに記載、落ち 0。§6 (比喩が定義の言い換え) → 該当なし (4 比喩とも別の場面)。§9 言い直し → L6。
8. **他単元との整合**: technology-20-52-u03 (ラスター / ビットマップ: 画素の格子、圧縮しないビットマップの容量 = 画素数 × 1 画素のビット数、縦横 2 倍で 4 倍) と dpi `points[1]`・detail が一致。technology-20-52-u04 (BMP = 圧縮せず画素を並べる) と矛盾なし。technology-18-49-u04 (`terms[4].detail_jp` / `points[2]`: dpi = 1 インチあたりのドット数、印刷の細かさ) と dpi one / points[0] が一致 (本単元はスキャナの読み取り密度にも広げるが、q084・q054 が直接支持)。同単元 `terms[0].detail_jp`「液晶そのものは光らない (バックライト)」と本単元加法 detail「ディスプレイ…のように自ら光を出す機器」の粒度差 → L3。technology-20-53-u02 (4K / 8K、画素 = 画面を作る色の点) と矛盾なし。
9. **三語**: zh・en が jp と同じ事実か (追加・欠落なし)、表セル・比較行・総表の三語一致、`[[jp:…]]` 原語 8 種 (加法混色 / 光の三原色 / 減法混色 / イメージスキャナ / 画素数 / 画素 / プロジェクションマッピング / コンピュータグラフィックス) が jp 本文に実在 (スクリプト、全 ok)、one_zh / one_en の見出し語併記 (加法・減法・コンピュータグラフィックス に `[[jp:]]`; dpi / ppi / CG は jp と同綴りのラテン字で併記不要)、zh 訳語が `zh_terms.json` に従う (加法混色 / 减法混色 / dpi / ppi / CG / 计算机图形 一致、validate warn 0)。loc-review r1 の low 5 件のうち 3 件 (zh 考点の太字、表セル en の倍数の曖昧さ、総表 en の建築限定) が未反映 → L2 / L8。
10. **過去審査の解消確認** (jp-review r1 HIGH 1 / MEDIUM 2): HIGH `terms[2].points[1]` (圧縮の前提落ち) → jp「圧縮しない画像のデータ量は…」/ zh「未压缩图像的数据量」/ en "The data size of an uncompressed image" で限定条件が三語とも戻った ✓。MEDIUM `terms[2].detail_jp` (データ量 4 倍の無条件) → detail は「画素数は 4 倍」だけを述べ、データ量に言及しない (zh / en も同じ) ✓。MEDIUM 点と画素の食い違い → dpi detail「読み取った点 1 つが画像の画素 1 つになる」が三語に入り、key_points[2] も同文 ✓。r1 low のうち CG analogy (定義の言い直し) は削除、ppi hook (d/p の対比の 3 箇所目) は削除、総表「設計図」→「完成予想図」、pairs「印刷」→「印刷機」に解消。退行なし。
11. **機械ゲート**: `textbook-v2-validate.mjs` / `textbook-v2-parity.mjs` (§6 に出力全文)。

## 2. 用語別判定 (6 / 6)

| # | 用語 | 事実 (考点 × 引用題、限定条件) | D-195 / D-197 / D-198 / D-200 | 三語 | 指摘 |
|---|---|---|---|---|---|
| 1 | 加法混色 | OK — exam 2 / 2 題: 光の三原色 = 赤・緑・青 (2012h24h-q072 正答エ; 誤答 CMY・色相彩度明度・赤緑黄 を支持する記述なし、CMY は減法側の「インクの三原色」として区別) / 赤・緑・青を同じ強さで重ねると白 (2014h26h-q080 正答ウ; 限定条件「均等に」→「同じ強さで」保持)。detail「同じ強さで最大まで重ねると白」は考点より精密で矛盾しない。SVG「白(全て最大)」一致 | OK | OK (zh 考点の太字のみ L2) | L3 (detail) / L6 / O1 (hook) |
| 2 | 減法混色 | OK — exam 1 / 1 題 + mix 1: CMY を混ぜると理論上は黒 (2014h26a-q073 正答ウ; 限定条件「理論上は」保持、誤答 青・赤・緑 を支持しない) / mix: RGB → 明るく = 加法、CMY → 暗く = 減法 (両側とも肯定の定義)。detail「実際のインクだけでは黒がにごるため CMYK」は事実。analogy (色セロハン = 透過光の減法) は物理的にも正しい | L1 (q073 題文との近似) / L7 (とされる) | L2 (zh 太字) | L1, L2, L7 / O2 (SVG) |
| 3 | dpi | OK — exam 2 / 3 題: dpi = スキャナの読み込み・プリンタの打点の細かさの単位 (2012h24h-q084 正答イ; 誤答 bps・fps・Hz / 2013h25h-q054 正答ア; 誤答 fps・pixel・ppm) / 圧縮しない画像のデータ量 = 縦 × 横 × 1 画素のデータ量 (2011h23tokubetsu-q098 正答イ、再計算一致; 限定条件「圧縮を考えない」保持 = r1 HIGH 解消)。table 3 行 再計算一致 | OK | 表セル en の倍数表記 L8 | L8 |
| 4 | ppi | OK — mix 1 (qid なし、quiz q054): dpi = 点、ppi = 画素を 1 インチあたりで数える、どちらも大きいほど細かい — 事実。detail「主に」付きで画面用と述べ排他ではない | OK | OK | L4 |
| 5 | CG | OK — exam 1 / 1 題: CG の映像を立体物の表面に投影して視覚効果 = プロジェクションマッピング (2020r02o-q083 正答ウ; 誤答 デジタルサイネージ・VR・ポリゴン を支持しない)。detail 2 次元 CG / 3 次元 CG は technology-20-53-u02 の 3DCG と整合 | (iii) 非該当 = L5 | OK | L5 |
| 6 | コンピュータグラフィックス | OK — mix 1 (qid なし、quiz q083): CG と同じ技術の 2 つの呼び名 — 事実。detail「日本語の文章では略称の CG が使われることが多い」は「多い」の緩い主張で反証なし、アニメーションを含む — 事実 | OK | L2 (zh 太字) | L2, L6 |

**単元レベル**: goals 3 点・overview_cols 2 (使う場面 / 基本となるもの)・overview_rows 6 行・pairs 2 組 (加法 / 減法 4 行 key 2、dpi / ppi 3 行 key 1)・key_points 4・summary (記法除去版と一致)・challenge_questions 5 件 (全て本文引用題、§1-3)。key_points に ppi が出ない (goals[1] は dpi / ppi の区別を挙げる) のは r2 low と同見解で規則違反ではない → 記録のみ (O3)。事実誤りなし。

**対比の出現欄 (書き方 8 の列挙)**: ① 加法 = RGB・明るく・白 / 減法 = CMY・暗く・黒: `pairs[0].rows[1..2]` + `terms[1].points[1]` (mix) の 2 箇所 → 許容 (各 one・key_points は片側ずつの定義、総表は D-195 §3 の構造)。② dpi = 点・スキャナ/プリンタ / ppi = 画素・画面: `pairs[1].rows[0..1]` + `terms[3].points[0]` (mix) の 2 箇所 → 許容 (r1 low の ppi hook 3 箇所目は削除済み)。③ CG / コンピュータグラフィックス: 対比ではなく別名 → L6。

## 3. 指摘一覧

**HIGH: 0 / MEDIUM: 0 / LOW: 8 (うち 建議修 4: L1〜L4)** + 範囲外観察 3

| ID | 重大度 | 箇所 (field path) | 内容 | 修正案 |
|---|---|---|---|---|
| L1 | LOW **建議修** | `terms[1](減法混色).points[0].text_jp` / `text_zh` / `text_en` | 2014h26a-q073 題文の該当節と Dice 0.70 / ed 0.47 (答えをはめた題文とは 0.78 / 0.41)。連続一致は「混ぜ合わせると理論上は」11 字で閾値未満、ed も較正 HIGH (0.14) から遠く標準事実なので写しではないが、題文に答えをはめ込んだ形に近い (jp-review r1・r2 low と同見解)。単元の他欄 (one / detail / mix 考点) の語「重ねる」に揃えれば離れる。zh は同時に L2 の太字も外す | jp「減法混色でシアン・マゼンタ・イエローを混ぜ合わせると、理論上は黒になる。」→「減法混色でシアン・マゼンタ・イエローの 3 色を重ねると、理論上は黒になる。」/ zh「在**减法混色**（[[jp:減法混色]]）中，把青、品红、黄混合在一起，理论上会得到黑色。」→「在减法混色（[[jp:減法混色]]）中，把青、品红、黄三色叠加在一起，理论上会得到黑色。」/ en "In subtractive color mixing ([[jp:減法混色]]), mixing cyan, magenta and yellow together gives black in theory." → "In subtractive color mixing ([[jp:減法混色]]), layering the three colors cyan, magenta and yellow gives black in theory." |
| L2 | LOW **建議修** | `terms[0].points[1].text_zh`、`terms[1].points[1].text_zh`、`terms[5].points[0].text_zh` (+ `terms[1].points[0].text_zh` は L1 で同時解消) | text_jp / text_en に太字が無いのに zh だけ見出し語を `**…**` にしている (loc-review r1 low 未反映、三語の強調位置のずれ) | `terms[0].points[1].text_zh`「在**加法混色**（[[jp:加法混色]]）中，以相同强度叠加红、绿、蓝会得到白色。」→「在加法混色（[[jp:加法混色]]）中，以相同强度叠加红、绿、蓝会得到白色。」/ `terms[1].points[1].text_zh`「RGB 叠加越多越亮的是**加法混色**（[[jp:加法混色]]），CMY 叠加越多越暗的是**减法混色**（[[jp:減法混色]]）。」→「RGB 叠加越多越亮的是加法混色（[[jp:加法混色]]），CMY 叠加越多越暗的是减法混色（[[jp:減法混色]]）。」/ `terms[5].points[0].text_zh`「**计算机图形**（[[jp:コンピュータグラフィックス]]）和 CG 只是叫法不同，指的是同一种技术。」→「计算机图形（[[jp:コンピュータグラフィックス]]）和 CG 只是叫法不同，指的是同一种技术。」 |
| L3 | LOW **建議修** | `terms[0](加法混色).detail_jp` / `detail_zh` / `detail_en` 3 文目 | 「ディスプレイやプロジェクタのように自ら光を出す機器」は機器単位では正しいが、technology-18-49-u04 `terms[0].detail_jp` は「液晶そのものは光らない (バックライトが要る)」と、有機 EL の「自ら光る」と対比している。「自ら」が液晶ディスプレイも自発光と読める余地があり、単元をまたぐ書き方 7 の措辞ずれ (この語を問う題は現コーパスに無く、事実誤りではない) | jp「ディスプレイやプロジェクタのように自ら光を出す機器は、この方式で色を表示する。」→「ディスプレイやプロジェクタのように光を出して色を見せる機器は、この方式で色を表示する。」/ zh「显示器、投影仪这类自己发光的设备，就是用这种方式显示颜色的。」→「显示器、投影仪这类发出光来呈现颜色的设备，就是用这种方式显示颜色的。」/ en "Devices that emit their own light, such as displays and projectors, show colors this way." → "Devices that show colors by giving off light, such as displays and projectors, work this way." |
| L4 | LOW **建議修** | `terms[3](ppi).detail_jp` / `detail_zh` / `detail_en` 1 文目 | (a) 画素を「画面に表示される画像を作る最小の単位」と画面に限るが、同単元 dpi detail・表はスキャナで読み取った画像の画素として使い、technology-20-52-u03 も画像一般の格子として定義する (r2 low と同見解、欄の範囲ずれ)。(b) jp は主語「画素は」のまま「…を表すのに使う」と続き、使うのが ppi であることが文法上読めない (zh / en は ppi を補っている) | jp「画素は画面に表示される画像を作る最小の単位で、主にディスプレイやスマートフォンの画面の細かさを表すのに使う。」→「画素はデジタル画像を作る最小の単位で、ppi は主にディスプレイやスマートフォンの画面の細かさを表すのに使う。」/ zh「像素是构成屏幕上显示图像的最小单位，ppi 主要用来表示显示器或智能手机屏幕的精细程度。」→「像素是构成数字图像的最小单位，ppi 主要用来表示显示器或智能手机屏幕的精细程度。」/ en "A pixel is the smallest unit that makes up an image shown on a screen, and ppi is mainly used to describe how fine a display or smartphone screen is." → "A pixel is the smallest unit that makes up a digital image, and ppi is mainly used to describe how fine a display or smartphone screen is." |
| L5 | LOW | `terms[4](CG).points[0].text_jp/zh/en` | 見出し語 CG ではなく応用語プロジェクションマッピングの標準定義 (名前を問う q083 の正答語、D-209 分類型免除; 要素順も題文と異なり選択肢の組・順を再現しない; Dice 0.31 / ed 0.71)。CG の唯一の exam 考点だが、q083 はこの考点で解け、他単元に同語の定義は無い | 記録のみ |
| L6 | LOW | `terms[5].points[0]` ↔ `terms[5].one_jp`、`terms[0].points[1]` ↔ `terms[0].detail_jp` 2 文目、`terms[1].points[0]` ↔ `terms[1].detail_jp` 2 文目 | D-203 §9 言い直し: コンピュータグラフィックスの mix 考点は one「指す技術は CG と同じ」の言い直し (取り違えの相手もない、r1・r2 low と同見解)。加法・減法の exam 考点も detail の結果 (白 / 理論上黒) の言い直しだが、引用題の判別点そのもの | 記録のみ |
| L7 | LOW | `terms[1](減法混色).hook_jp` (+ 派生 `memory_hook_jp`、`summary.memory_hooks_jp[1]`) | §9 grep「とされる」1 件。K の語源 (Key plate 説 / blacK 説) は断定できない事項で、出典帰属のぼかしは正当 (前例 b スクラム単元と同扱い)。zh「据说」/ en "is said to" も同じ | 記録のみ |
| L8 | LOW | `terms[2](dpi).fig.data.rows[1].cells[2].en`、`rows[2].cells[2].en`、`overview_rows[4].extra_en[0]` | loc-review r1 low 未反映: "4 times 150 dpi" は「150 dpi の 4 倍 = 600 dpi」とも読める (jp は列見出し「画素数」の下で画素数の倍数)。総表 en "architectural renderings" は jp「完成予想図」(detail では製品と建物) を建物に限る | 任意: "1,800,000 (4 times 150 dpi)" → "1,800,000 (4× the count at 150 dpi)" / "7,200,000 (16 times 150 dpi)" → "7,200,000 (16× the count at 150 dpi)" / "Games, films, architectural renderings" → "Games, films, previews of finished designs" (en のみ、jp / zh 変更なし) |

**範囲外の観察** (書き直し対象外 / 偽陽性):
- O1 加法混色 `hook_*` 「画面を拡大すると赤・緑・青の小さな点が見える」は dpi の基本単位「点 (ドット)」と同じ語を画面側で使う (型 (8) の形)。ただし引用題 (q084 / q054) の場面に当てても誤答 (fps・pixel・ppm・bps・Hz) を選ばせず、technology-18-49-u04 / 20-53-u02 も画素を「色の点」と説明しているため MEDIUM に当たらない。
- O2 `figures/technology-20-53-u01-t02.svg` のラベル「黒(全て最大)」は本文・考点・pairs の「理論上は」を落とす (r1・r2 low と同見解)。SVG は v1 から引き継いだ固定ファイルでフィールド置換の対象外。図を作り直す機会があれば「黒(理論上)」に。
- O3 key_points に ppi が出ない (goals[1] は dpi / ppi の区別を挙げる)。zh「墨水」は印刷文脈では「油墨」がより一般的 (loc-review r1 low、誤りではない)。`unit_summary_*` は v1 同文 (未改稿)。

確認済みで問題なし: 限定条件 (exam 考点 6 件全て保持: 均等 → 同じ強さ / 理論上は / 圧縮しない、§2)、§9 禁止句 grep (定型締め句 0; とされる = L7)、framing (validate 0)、D-197 羅列 (validate 0)、D-200 (全考点 ≤2 文・≤54 字)、D-198 (copy guard 0・choice-echo 0・独立照合 遮蔽あり 0 / 遮蔽なし 5 = 用語名のみ・近似一致の最近接 Dice 0.70 / ed 0.47 = L1)、(iii) 非該当 (L5)、D-205 / 型 (7) / 型 (10) (改訂のある規格・法の数や列挙を述べない; 三原色は定義上の閉じた 3 色)、型 (2) 「など」落ちなし (引用題に「など」は q073 題文の「プリンタなどの印刷」のみ、考点は印刷の場面に限定しない)、型 (3) 別名 CG / コンピュータグラフィックス は同じ技術として明記、型 (4) 比喩の範囲 (懐中電灯 = 光を足す、色セロハン = 光を減らす、方眼紙 / タイル = 細かさ) は one / detail と矛盾なし、型 (5) zh / en 退行なし (r1 HIGH / MEDIUM の三語反映を確認)、型 (6) zh / en の誤答肢寄りなし、型 (9) hook を引用題の場面に当てて誤答を選ぶものなし、`[[jp:]]` 原語 (8 種全て jp 本文に実在)、zh 訳語表 (一致)、図種 (既存 SVG static ×2 / static table ×1 / 図なし ×3 = 登録内)、派生フィールド一致、用語・`term_zh`・`term_en` の v1 不変量、数値の再計算 (q098 100 dpi・表 3 行・2.54 cm)、他単元整合 (20-52-u03 / u04、18-49-u04、20-53-u02; L3 のみ)。

## 4. 合計

| 重大度 | 件数 |
|---|---|
| HIGH | **0** |
| MEDIUM | **0** |
| LOW | **8** (建議修 4: L1〜L4 / 記録のみ 4: L5〜L8、うち L8 は任意の修正案あり) |

## 5. 判定

**PASS** (D-199: HIGH 0 かつ MEDIUM 0)。全 6 用語・考点 9 件 (qid 付き 6 件)・引用 7 題 (+ quiz / challenge 未引用 0) で、考点の主張は正答と一致し、誤答肢を支持する記述は無く、引用題の限定条件の落ちも無い。jp-review r1 の HIGH 1 / MEDIUM 2 は三語とも解消し退行なし。LOW 建議修 4 件 (L1〜L4) は補丁 (B3) で修正推奨、L5〜L8 はバッチ証拠の「未修 LOW」表へ。

## 6. 機械ゲート出力

```
$ node --no-warnings scripts/textbook-v2-validate.mjs --unit technology-20-53-u01
✓ technology-20-53-u01 unit: 0 issues (data/ip/textbook/units/technology-20-53-u01.json)
EXIT=0
$ node --no-warnings scripts/textbook-v2-parity.mjs --unit technology-20-53-u01
✓ technology-20-53-u01 parity: 26 locations, 0 diff
EXIT=0
```
