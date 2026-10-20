# C track C3 — 図盲点 22 題の再裁断 提案段 (S128、L2d 後続)

前段: `evidence/S128_L2d_figblind.md/.json` (縁辺走査の候補外 263 図を盲検目視 → TRUNCATED 32) と L2d Rule D (l2d-verifier = PASS-with-notes、重大度変更 6 件)。**検証済修復リスト = major 19 + medium 3 = 22 題** (S128 log の L2d Rule D 項)。
D-152 data lock は A3 が保持している。本段の書込みは staging と本 evidence だけ。`questions.json` / translations / explanations / `question_bank.json` / `data/ip/exams/figures/` / 配信 webp には触れていない (`question_bank.json` md5 `28710d6c3ea88fb408b87e431620a146` は dry-run の前後で同じ)。

## 1. 方法

S127 C2 では figfix critic が bbox を出した。本段は主 context が全頁 PNG から直接 bbox を決めた。C2 critic と同じく `correct_bbox_pct` (全頁に対する %、x,y = 左上、w,h) の形で出す。

1. 全頁 PNG (`figure_page_image ?? page_image`) に 1% 格子と現 `figure_bbox_pct` (赤枠) を重ねた画像を作り、22 頁すべてを目視した。それぞれについて、図・表の領域と、除外する隣接内容 (設問文 / 純テキスト選択肢 / 次問) を確認した。
2. 除外内容の手前までを rough 枠 (%) として手で指定した (`tools/rough.json`)。**現 bbox の一辺を延ばすのではなく、枠全体を頁から取り直している。** 下方へずれた 9 張 (`2013h25h-q007` / `2018h30a-q007` / `2018h30h-q011` / `2019h31h-q059` / `2019r01a-q065` / `2025r07-q037` / `2026r08-q044` / `2018h30h-q029` / `2014h26a-q001`) はすべて上辺・下辺とも動かした。
3. rough 枠の中で暗画素 (輝度 < 140、1 行/列あたり 2 画素以上) の外接矩形を求め、そこに 14 px の余白を足した (rough 枠を超える分は切り詰め)。余白が rough 枠の縁に届いたもの (gap 0) は内容が枠外にはみ出しているおそれがあるので、該当 3 件は rough を直して計算し直した: `2013h25h-q055` は右枠、`2014h26h-q086` は下の選択肢行の混入、`2019h31h-q026` は下の汚れ点。
4. `tools/tighten.mjs` は `quiz-figfix-apply.mjs` と同じ式 (`Math.round(pct/100 × 頁寸法)` と `Math.min` による切り詰め) で裁断している。そのため **staging の PNG は apply 実行時に出る PNG と画素単位で同じ**になる。
5. 22 枚の staging crop をすべて目視した (下表の「確認」欄)。q055 と q026 は再計算後の版を見直している。

**図ページ**: 22 題すべてで L2d の `located_page` と bank の `figure_page_image ?? page_image` が一致する。`figure_page_override` は不要。

## 2. 裁断範囲の規約 (S127 C2 の慣行に従う)

- 残すもの: 図・表の本体、図中に描かれた選択肢表 (ア〜エの格子)、図に付く「単位」注記・凡例・注記・キャプション。
- 外すもの: 設問文 (穴埋め文を含む)、`choices_jp` に文字で入っている純テキスト選択肢、隣接する他問。これらは文字で表示されるので、外しても情報は欠けない (C2 の再検証で確認済みの方針)。
- **`2013h25h-q055` の判断**: 「社員」「部署」スキーマ表 (列名の格子 + 表名ラベル) を **crop に含める**。この 2 表は図・表の本体にあたり、`stem_jp` には文字で入っていない (L2d Rule D の指摘)。含めないと、設問「主キーと外部キーの組合せ」に必要な列構成が画面のどこにも出なくなる。選択肢表 (主キー/外部キー) も図中に描かれた選択肢表なので含める。stem に表が文字で無いこと自体は stem 側の欠落なので、B track へ名指しする (§5)。
- `2010h22a-q095`: 図2「追加の設定の記述」とそのキャプションまで含める (L2d が指摘した欠落)。`stem_jp` にも図2 の文字はあるが、図1 の ①〜④ 矢印と並べて見る必要があり、図1/図2 は一体の図なので含める。
- `2014h26h-q086`: 注記 2 行とキャプション「図1 時間別の電話受付件数とオペレータ数」を含める。〔受付状況〕は `stem_jp` に文字で入っているので外す。

## 3. 提案 bbox (22 題)

bbox は `correct_bbox_pct` (x / y / w / h、%)。manifest には、bank の形式 `{x1,y1,x2,y2}` (0〜1) に換算した値を `figure_bbox_pct_new` として併記した。

| id | 重大度 (Rule D 後) | 欠け辺 | 頁 | x / y / w / h | 範囲 |
|---|---|---|---|---|---|
| `2010h22a-q008` | major | top | 2010h22a/page-05.png | 11.27 / 55.14 / 77.82 / 18.05 | 選択肢表全体 (見出し 2 段 + ア〜エ + 外枠)。旧 crop は見出し 1 段目と上罫線が欠けていた |
| `2011h23a-q096` | major | bottom | 2011h23a/page-40.png | 11.58 / 39.92 / 79.59 / 38.98 | 表2 (表題 + 全 5 行) + 選択肢表 (b/c、ア〜エ + 下罫線)。穴埋め文は stem_jp にあるので外す (C2 慣行) |
| `2012h24h-q085` | major | bottom | 2012h24h/page-32.png | 12.77 / 25.52 / 53.87 / 30.75 | 表2 (表題 + 全行) + 選択肢表 (ア〜エ + 下罫線)。設問文は外す |
| `2013h25h-q007` | major | top | 2013h25h/page-04.png | 15.78 / 27.3 / 67.32 / 8.79 | 工程表全体 (見出し行 + A/B + 外枠)。下の純テキスト選択肢と次問 問8 を外す (旧 crop は下方にずれていた) |
| `2018h30a-q007` | major | top | 2018h30a/page-04.png | 12.08 / 55.43 / 44.55 / 15.35 | 選択肢表全体 (見出し プログラム/アルゴリズム + ア〜エ)。旧 crop はイ行からで、下方にずれていた |
| `2018h30h-q011` | major | top | 2018h30h/page-06.png | 23.46 / 44.67 / 50.84 / 20.09 | 「単位 百万円」+ 貸借対照表全体 (資産の部/負債の部 見出し〜株主資本)。純テキスト選択肢を外す |
| `2019h31h-q026` | major | top | 2019h31h/page-11.png | 20.32 / 12.04 / 57.61 / 34.01 | PPM 図全体 (縦軸 高/低・外枠上辺・横軸ラベル) + 注記。純テキスト選択肢と次問 問27 を外す |
| `2019h31h-q059` | major | top | 2019h31h/page-24.png | 11.17 / 15.89 / 74.72 / 27.54 | 選択肢表全体 (見出し + ア〜エ + 外枠)。次問 問60 を外す |
| `2019r01a-q065` | major | top | 2019r01a/page-28.png | 10.82 / 49.01 / 58.03 / 15.89 | 選択肢表全体 (見出し a/b + ア〜エ)。穴埋め文は外す |
| `2019r01a-q083` | major | bottom | 2019r01a/page-36.png | 11.17 / 32.48 / 32.75 / 16.68 | 選択肢表全体 (見出し a/b + ア〜エ + 下罫線)。穴埋め文は外す |
| `2020r02o-q055` | major | bottom | 2020r02o/page-25.png | 11.52 / 49.31 / 68.99 / 35.14 | アローダイアグラム + 凡例 + 選択肢表 (ア〜エ + 下罫線)。上端の前問選択肢と設問文を外す |
| `2020r02o-q071` | major | top | 2020r02o/page-32.png | 14.18 / 57.31 / 68.44 / 15.3 | ワークシート全体 (列記号行 A〜E + 行 1〜4)。純テキスト選択肢を外す |
| `2025r07-q037` | major | top | 2025r07/page-17.png | 10.89 / 52.12 / 29.68 / 15.99 | 選択肢表全体 (見出し a/b + ア〜エ)。旧 crop は下方にずれていた |
| `2025r07-q062` | major | top | 2025r07/page-29.png | 10.54 / 50.94 / 44.48 / 15.89 | 選択肢表全体 (見出し a/b/c + ア〜エ) |
| `2026r08-q026` | major | left | 2026r08/page-11.png | 18.16 / 63.77 / 62.57 / 12.73 | 「単位 百万円」+ 貸借対照表全体 (左列 資産の部/流動資産/固定資産 + 左外枠)。設問文と純テキスト選択肢を外す |
| `2026r08-q044` | major | top | 2026r08/page-20.png | 12.99 / 30.16 / 74.51 / 11.85 | 表全体 (導入前の行 + 導入半年後の 4 行 + 外枠)。純テキスト選択肢と次問 問45 を外す |
| `2026r08-q074` | major | top | 2026r08/page-36.png | 17.39 / 27.49 / 63.9 / 16.34 | ワークシート全体 (列記号行 A〜D + 行 1〜5)。式の選択肢は choices_jp にあるので外す (C2 慣行) |
| `2018h30h-q029` | major | top | 2018h30h/page-14.png | 25.98 / 19.25 / 46.58 / 15.4 | 表全体 (見出し 四つの視点/戦略目標 + a〜d + 外枠)。純テキスト選択肢と次問 問30 を外す |
| `2013h25h-q055` | major | top | 2013h25h/page-23.png | 11.17 / 25.81 / 70.25 / 39.88 | 「社員」「部署」スキーマ表 (stem_jp に無い) + 選択肢表 (主キー/外部キー、ア〜エ)。設問文は外す |
| `2010h22a-q095` | medium | bottom | 2010h22a/page-41.png | 13.64 / 35.33 / 62.45 / 47.06 | 許可区分表 + 図1 (①〜④ の矢印 + キャプション) + 図2 (設定 + キャプション)。設問文と純テキスト選択肢を外す |
| `2014h26a-q001` | medium | top | 2014h26a/page-02.png | 32.82 / 27.39 / 33.03 / 17.13 | 「単位 円」+ 損益表全体 (上罫線〜営業利益)。純テキスト選択肢と次問 問2 を外す |
| `2014h26h-q086` | medium | bottom | 2014h26h/page-35.png | 10.26 / 41.36 / 77.25 / 47.38 | ワークシート全体 (列記号行〜行16) + 注記 2 行 + キャプション「図1 …」。〔受付状況〕は stem_jp にあるので外す。純テキスト選択肢も外す |

**確認 (主 context の目視)**: 22/22 で、図・表の四辺の外枠が閉じていること、見出し行から最終行・最終列まで入っていること、除外対象が混入していないことを staging PNG で確認した。未解決の図はない。軽微な点: `2012h24h-q085` / `2020r02o-q055` の余白に原典スキャン由来の淡い汚れ点が残る (内容には影響しない)。

## 4. 成果物 (staging、gitignored)

- manifest: `data/ip/quiz/.phase2/c3_S128/figfix_results_C3_S128.json`。`{lane, source, count:22, results[]}` の形で、各項目は `id` / `current_crop_correct:false` / `fix_type:"recrop"` / `confidence` / `correct_bbox_pct` / `figure_bbox_pct_new` / `figure_page` / `page_size` / `crop_px` / `staging_png` / `l2d{severity,edge,note}` / `notes_jp`。`quiz-figfix-apply.mjs --results` がそのまま読める。
- 候補 crop: `data/ip/quiz/.phase2/c3_S128/crops/<id>.png` × 22。
- 再現用: `data/ip/quiz/.phase2/c3_S128/tools/` (`rough.json` / `tighten.mjs` / `annotate.mjs` / `runs.mjs` / `manifest.mjs` / `proposals.json`)。
- **dry-run**: `node scripts/quiz-figfix-apply.mjs --results data/ip/quiz/.phase2/c3_S128/figfix_results_C3_S128.json --backup-dir data/ip/quiz/.keyaudit/figfix_backup_S128_c3 --dry` の結果は `recrop 22 / copy 0 / remove_figure 0 / skip(none) 0`。退避先の衝突なし、bank の md5 は前後で同じ、退避先ディレクトリも作られていない。

## 5. ⑨ `figure_bbox_pct` の回写: apply には手を入れない

結論: `quiz-figfix-apply.mjs` は変更しない。新しい bbox は manifest の `figure_bbox_pct_new` に記録し、phase 2 で設定する。理由は次の 3 点。

1. 形式が違う。bank の `figure_bbox_pct` は `{x1,y1,x2,y2}` (0〜1 の分数)、apply が読むのは `{x,y,w,h}` (%) なので、換算が要る。
2. **crosscheck B6 は `figure_bbox_pct` について bank == by_year を要求する**。bank だけに回写すると gate が赤になる。回写したら `quiz-byyear-figmeta-sync-S117.mjs` を同時に回す必要がある (by_year に書き込むので、これも data lock の範囲内)。
3. S127 C2 の再裁断 111 題 (と S99 の 26 題) も回写されていない。今回の 22 題だけ直すと、bank 上に「回写済み」と「古い値」が混在する。全体を揃えるかどうかは別判断として lead / ユーザーに上げる。

**選択肢 (未実施)**: apply の recrop 分岐に `--write-bbox` (opt-in) を足し、`q.figure_bbox_pct = {x1:b.x/100, y1:b.y/100, x2:(b.x+b.w)/100, y2:(b.y+b.h)/100}` を書く。約 3 行で済む。続けて by_year sync を回す。22 題はいずれも `main` (shared ではない) なので、`quiz-pagefix-derive-groups` の group bbox 一致条件には掛からない。

## 6. phase 2 (lock 解放後) の手順案

```
node scripts/quiz-figfix-apply.mjs --results data/ip/quiz/.phase2/c3_S128/figfix_results_C3_S128.json --backup-dir data/ip/quiz/.keyaudit/figfix_backup_S128_c3
# (任意・lead 判断) figure_bbox_pct 回写 → node scripts/quiz-byyear-figmeta-sync-S117.mjs
node scripts/build-quiz-figures.mjs && node scripts/build-quiz-corpus.mjs
# gate: quiz-keys-crosscheck.mjs / quiz-pagefix-derive-groups.mjs --assert-clean / quiz-chumon-groups-build.mjs --check / tsc / vitest / build
```

- apply の後で、`data/ip/exams/figures/<id>.png` と staging の PNG が一致することを cmp で確かめられる (画素単位で同じになるはず)。
- **Rule D 再検証**: `quiz-figfix-manifest-S127.mjs --stage reverify` は S127 sweep の陽性だけを拾う。この 22 題は sweep 外なので何も出ない。C3 の再検証入力は本 manifest から作る (figreverify_input_S127 と同じ欄: apply 後の figure_png / 全頁 / stem / 本提案の bbox と範囲)。verifier は bbox を決めた主体 (本 lane = executor) と別 type にする (`oh-my-claudecode:verifier`)。

## 7. 範囲外の発見 (修正していない。B/A track へ名指し、C2 の前例どおり)

stem 転記表が原典と食い違うもの (正解に関わりうる):
- **`2026r08-q044`**: stem 表の「自動割当てができた割合 **98%**」「できなかった割合 **18%**」に対し、原典は **90% / 10%**。計算問題なので正解に直結する。2026r08 が ⑤-2 母数内かどうか A track で確認が要る。
- **`2020r02o-q071`**: stem 表の 商品B 3月売上額 **8,000** に対し、原典は **5,000**。条件付個数 (>15000) の答えは変わらないが、転記誤り。
- **`2014h26h-q086`**: stem 表の行 4〜6 の値 (例: 9:00〜 東 10 / 西 30 / 合計 40 / 東 2 / 西 6 / 合計 8 / 90 / 11) が原典 (40 / 38 / 78 / 6 / 6 / 12 / 82 / 11) と大きく違う。さらに stem の設問文は「a〜d」で、原典は「a」。
- `2010h22a-q095`: L2d Rule D の判定のとおり、誤りは生の stem_jp だけ (表示層は原典と一致)。本段では追加の所見なし。
- `2013h25h-q055`: 「社員」「部署」スキーマ表が stem_jp に文字で無い (crop で補う。stem 側の補完は B track)。

OCR 残渣・崩れ (表示 stem): `2018h30h-q029` (表の断片 "| 5 | 競合路線…") / `2019h31h-q059` (選択肢表の断片) / `2019r01a-q065` (穴埋め枠 a が崩れている "| 。 |]と[| b |") / `2019r01a-q083` ("| sa |テ ィレクトリ") / `2020r02o-q055` (図の OCR 断片。L2d で既出)。
