# S130 図 lane — 選択肢図化 4 題 + 2015h27a-q088 bbox 是正 (規則 A 全数核験)

**目的**: S129 で答え漏洩・失真のある選択肢の図の言語化を中立テキスト「図ア〜図エ」に置換した暫定処置 (D-163 / D-168) の本処置。源の選択肢図そのものを学習者に見せる。
**脚本**: `scripts/quiz-figfix-S130-choicefig.mjs` (冪等: 1 回目 applied 60 field changes、2 回目 **0**)。下流 `build-quiz-corpus.mjs` → `build-quiz-figures.mjs`。
**データ形**: D-144 段 2 precedent (`quiz-choicefig-D144s2.mjs`、既存 6 題) と同じ — raw (question_bank + by_year) `choice_figure_paths` = `figures/<id>-c{A..D}.png`、選択肢テキスト jp「図L」/ zh「图L」/ en「Figure L」(translations + `.phase1`)、旧テキストは `choices_text_retired`、複合図 `figure_path` は `composite_figure_path_retired` に退避して null。
**裁断方法 (precedent との差)**: D144s2 は複合図を 2×2 の空白帯で自動分割したが、q068 は 1×4 縦積みのため使えない。本 lane は **源ページ** (`data/ip/exams/pages/<exam>/page-NN.png`) から、行・列のインク投影 (グレー < 140) で実測した肢ごとの px 矩形を切り出す → trim(40) → 白 14px 余白 (D144s2 と同じ)。各矩形は字母 ア〜エ を含み (既存 6 題と同じ見え方、D144s2 MINOR-6)、隣の肢・題幹・次問・ページ番号を含まない。

## 肢ごとの bbox (源ページ px、[left, top, right, bottom])

| id | 源ページ (WxH) | インク実測 (行帯 / 列帯) | ア | イ | ウ | エ | 出力 (WxH) |
|---|---|---|---|---|---|---|---|
| 2013h25h-q068 | page-29 (1432x2026) | 行 465-733 / 783-1077 / 1125-1393 / 1441-1743、列 字母 208-231 + 図 266-1224 (1×4 縦積み) | 190,450,1245,758 | 190,760,1245,1101 | 190,1103,1245,1417 | 190,1419,1245,1765 | 1042x297 / 1017x323 / 959x297 / 977x331 |
| 2010h22h-q088 | page-36 (1419x2020) | 例示図 x 505-951 / y 891-1164、肢 行 1235-1510 / 1564-1835、列 205-714 / 字母 732-754 + 図 794-1242 | 190,1215,723,1537 | 723,1215,1260,1537 | 190,1540,723,1855 | 723,1540,1260,1855 | 538x301 / 539x304 / 537x301 / 539x299 |
| 2010h22a-q066 | page-25 (1416x2020) | 行 1233-1472 / 1540-1778、列 字母 195-216 + 図 259-575 / 字母 727-749 + 図 791-1107 | 180,1210,680,1506 | 700,1210,1140,1506 | 180,1506,680,1800 | 700,1506,1140,1800 | 335x268 / 335x268 / 409x267 / 411x266 |
| 2009h21a-q048 | page-18 (1439x2019) | 行 338-647 / 709-1014、列 字母 207-231 + 図 264-622 / 字母 737-764 + 図 794-1164 (x=710・1213 以右は走査の点ノイズ) | 190,325,690,678 | 725,325,1185,678 | 190,680,690,1040 | 725,680,1185,1040 | 442x334 / 443x338 / 441x332 / 442x326 |

**2010h22h-q088 の題幹例示図**: 題幹が「図の時刻 1 から時刻 5 …」と例示図 (結果 11 01 00 10 11 の波形) を参照するため、figure_path を消すと解答不能になる。例示図だけを [480,870,980,1190] で源ページから再裁断 (trim + 16px → 480x306) して `figures/2010h22h-q088.png` に残し、`figure_type="stem"`、`figure_bbox_pct` = {0.3383, 0.4307, 0.6906, 0.5891}。旧複合図 (例示図 + 4 肢) は `figures/2010h22h-q088.png.pre-S130cf.bak` に退避 (= `composite_figure_path_retired`)。
**ガード変更 (唯一のコード変更)**: `build-quiz-corpus.mjs` の「figure_path と choice_figure_paths の二重掛け fail」と crosscheck **A6** の「choice_figures があるのに figure≠null」は、従来 中問の共有図 (`figure_type="shared"` + `figure_group`) だけを例外にしていた。`figure_type="stem"` (選択肢を含まないよう再裁断した題幹の図) を 2 箇所とも例外に追加。描画は 2014h26a-q086 (共有図 + 選択肢図) と同じ経路 (QuizSet: `q.figure` の <img> + 各肢 ChoiceBody の <img>)。

## 2015h27a-q088 図の bbox 是正 (S130 reviewer NIT)
図ページ page-39 (1432x2026、D-145 の図ページ相対)。インク実測: 図3 本体 + キャプション 下端 y=833、選択肢ア 1 行目 上端 y=919、上端 y≈170 に走査の点ノイズ (軸ラベル 4.0 は y≈200)。`figure_bbox_pct` {0.05, 0.05, 0.85, **0.52**} → {0.05, **0.093**, 0.85, **0.43**} (px 72,188,1217,871)、源ページから再裁断 trim + 16px → 688x674。旧図は `figures/2015h27a-q088.png.pre-S130cf.bak`。bank / by_year 両層 (B6)。

## 2018h30h-q054 の判断 — 選択肢図化しない
源 page-24 実読: 選択肢ア〜エは **a〜d の組合せ表** (要員の数 / 訂正作業 1 件当たりのコスト) で図ではない。4 グラフ a〜d は題幹の図で、現行の複合図 (`figures/2018h30h-q054.png`) にそのまま表示されている。題幹の「[図a] 山型…」等の言語化は図の形を述べるだけで、どの量にどのグラフが対応するか (= 問われている判断) は述べないため答えの漏洩ではない。変更なし。図内の表と `[表]` テキストの二重表示は既登録の NIT-11 クラス (D144s2 evidence) で、ここでは扱わない。

## 全数核験 (N = 4 題 × 4 肢 + 例示図 1 + q088(2015) 1 = 18 図、全数を Read で実読)
contact sheet (赤枠 = 切り出し境界):
- `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/cf/sheet_q068.png`
- `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/cf/sheet_q088.png` (先頭 = 題幹例示図)
- `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/cf/sheet_q066.png`
- `/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/38b9b286-d572-4355-b63d-7392c68f7a4f/scratchpad/cf/sheet_q048.png`
- 2015h27a-q088: `data/ip/exams/figures/2015h27a-q088.png` 直接

| id | 結果 |
|---|---|
| 2013h25h-q068 | 4/4 PASS: ア ハブ (PC3 台) → ルータ LAN 側 + TV LAN 側直結 / イ インターネットが LAN 側ポートへ・WAN 側ハブに TV / ウ LAN 側 PC2 台・WAN 側ハブに PC・TV・インターネット / エ インターネットがハブ経由で LAN 側・TV は WAN 側。ルータ枠上端・雲の右端・PC 下端の欠け無し、題幹・隣の肢の混入無し |
| 2010h22h-q088 | 5/5 PASS: 例示図 (振幅 11 の山 → 時刻 3 手前の谷 → 時刻 5 手前の山、軸ラベル「振幅」「時刻」込み、題幹文字・肢の字母の混入無し)、ア〜エ 各波形の軸・破線格子・「時刻」ラベルまで完全、隣列の字母 (イ/エ) の混入無し |
| 2010h22a-q066 | 4/4 PASS: ア {A→B, C→A, D→B} / イ {A→B, A→C, D→B} / ウ {B→A, A→C, B→D} / エ {A→B, A→C, B→D}。矢頭・丸の欠け無し (explanations の読みと一致) |
| 2009h21a-q048 | 4/4 PASS: ア 右肩上がり指数曲線 / イ 右肩下がり / ウ V 字 / エ 階段。軸・「設計 製造 テスト 運用」ラベル完全。源の走査点ノイズ数点 (源由来、内容に影響なし) |
| 2015h27a-q088 | PASS: 図3 + キャプション「図3 アンケート項目の評価平均と相関係数のグラフ」まで、選択肢ア 1 行目は含まない |

## 層の確認
- questions.json の差分は 4 id のみ (2009h21a-q048 / 2010h22a-q066: figure→null + choice_figures、2010h22h-q088: figure_type=stem + choice_figures + stem_jp (Rule D N2 の言語化除去)、2013h25h-q068: choices_jp 図L + figure→null + choice_figures)。**correct_answer 変更 0**。
- translations: 2010h22h-q088 の stem_jp_clean / zh / en 題幹 (N2)。2013h25h-q068 の zh/en 選択肢 (図の言語化) → 图L / Figure L。他 3 題は S129 で既に中立。`.phase1/tr_<id>.json` は 4 題とも中立に (q068 は旧い漏洩文「把所有设备都接到集线器上…」、q066 は「（正确）/(correct)」が残っていた — 再 merge 退行の防止)。
- public/quiz-figures: 新規 WebP 16 枚、削除 3 (q048 / q066 / q068 の複合図)、更新 2 (q088 例示図、2015h27a-q088)。他の WebP は byte 不変。
- explanations は不変 (解答後の解説が図を描写するのは可。key_guard note の「choice_figures 化は図 lane 待ち」は履歴記述として残す)。
- 2010h22h-q088 の題幹末尾の例示図の言語化 (源に無い。bank/by_year「[図] 例示図：…」、stem_jp_clean「（図）縦軸は…」、zh「（图）…」、en「(Figure) …」) は Rule D N2 で全層から除去 (下記 §Rule D)。

## ゲート
| gate | 結果 |
|---|---|
| `node scripts/quiz-figfix-S130-choicefig.mjs` ×2 | 1 回目 applied 60 / **2 回目 0** (冪等) |
| `node scripts/quiz-keys-crosscheck.mjs --require-raw` | ✓ A1–A7, B1–B7 (A6 = 選択肢図 10 題、B6 = 図メタ bank==by_year) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | registry 一致 |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | SPLIT_FIGURE 0 件、(A)(B) GREEN |
| tsc --noEmit | 0 |
| eslint | 0 errors (既存 warning 1: RetroGlossary.tsx tTerm、本 lane 外) |
| vitest | 563 passed / 2 skipped (新規 SSR テスト 1: q088 の figure_type=stem + choice_figures 共存、q068 の選択肢図 <img> と alt) |
| next build --turbopack | 成功 |

## Rule D (別 type agent) — PASS-with-notes → 全処置
| 級 | 指摘 | 処置 |
|---|---|---|
| N1 | q068 の出力サイズ欄が実寸と不一致 | 実測 (sharp metadata) で是正: 1042x297 / 1017x323 / 959x297 / 977x331 |
| N2 | 2010h22h-q088 題幹の例示図言語化が例示図表示後は冗長 (源に無い) | 脚本 `STEM_TAIL` で除去 (assert-before-replace: 末尾が期待文字列と完全一致する時だけ削除、除去済みなら no-op、それ以外は throw)。対象 5 field = question_bank.stem_jp / by_year.stem_jp / translations stem_jp_clean・stem.zh・stem.en (questions.json は build-quiz-corpus で投影)。`.phase1/tr_2010h22h-q088.json` は元から言語化を含まない (確認)。残る題幹: 「…図の時刻 1 から時刻 5 のタイミングで標本化を行い，… “01 00 10 11 01”となる音声信号を示す図はどれか。」— 図への参照「図の時刻」は残り、例示図 (figure_type=stem) がその直下に表示される。本文の他の内容は不変 (除去は末尾段落のみ)。再実行 applied 0 |
| N3 | A6 の stem 例外が緩い (複合図のまま stem と称せば通る) | crosscheck Layer B (raw) の B6 に追加: figure_type=stem は choice_figure_paths 必須・composite_figure_path_retired が実在ファイル・figure_path と同一でない (committed 層の questions.json は退避パスを持たないため raw 層で検査)。**変異試験 4 種すべて検出**: 退避パス削除 / 実在しないパス / figure_path と同一 / choice_figure_paths 削除 (各回 bank を復元、cmp で同一確認) |

### Rule D 処置後のゲート
| gate | 結果 |
|---|---|
| `quiz-figfix-S130-choicefig.mjs` 再実行 | N2 で applied 5 → 2 回目 **0** |
| crosscheck --require-raw | ✓ A1–A7, B1–B7 (N3 の stem 検査込み) |
| chumon --check | 一致 |
| assert-clean | (A)(B) GREEN |
| tsc | 0 |
| eslint | 0 errors (既存 warning 1、lane 外) |
| vitest | 563 passed / 2 skipped |
| next build --turbopack | exit 0 |
