# A5 Rule D レビュー (S129、a5-reviewer / verifier lane、writer = a5-fixer executor)

判定: **PASS-with-notes** (MAJOR 0 / MINOR 0 / NIT 4)

## 1. diff 監査 (git HEAD 対 作業ツリー、data/ip/quiz 26 file)
- JSON の field 単位で差分を出し、さらに文字単位の編集操作に分解: 計 162 field。
  - questions.json: 4 題の `stem_jp` だけ (`2011h23tokubetsu-q094` – → －×3、`2012h24h-q005` 4,800 → 4,000、`2013h25h-q061` 60→80 / K01→K02 / 30→50、`2022r04-q096` calcX→calcY と［プログラム1/2］→〔プログラム 1/2〕)。
  - explanations 9 file: `correct` / `distractors.*` / `points.*` の jp・zh・en だけ。key_guard (note_jp / round1) の差分は 0。
  - translations 16 file: `stem_jp_clean` / `stem.zh` / `stem.en` だけ。
- correct_answer の変更は 0 (2900 題中、questions.json の差分は上の stem_jp 4 件だけ)。題数も 2900 のまま。
- 162 field はすべて A5 記録の §1 項目 1a/1b/2/3/4/5/6/7/8/D-159 表示層のどれかで説明でき、無関係な編集は無い。
- `2011h23tokubetsu-q094` の expl: 表示 field に残る U+2212 は負数「−1」だけ。記号として使われている「−」は key_guard.note_jp にしか残っておらず、正しく不触。zh / en の －→− も「赋值−1」「Assign −1」の負数だけで、記号「＝－」は保持されている。
- explanations 全庫を独自に走査 (key_guard は除外、数字の直前の -/－ のうち、直前がオペランドでないもの): 残り 33 件はすべて writer の除外一覧に入っている (`2012h24a-q029`、`2012h24h-q085`、`2018h30a-q048`、`2020r02o-q043`)。除外漏れも、除外すべきものの変換も無い。

## 2. 源 page PNG 独自照合 (writer の抽検 13 件とは別に 14 件)
| # | 箇所 | 源 | 結果 |
|---|---|---|---|
| 1 | `2009h21h-q007` expl「(−10)」「D −10円」 | 2009h21h p05 表 D 低成長「−10」 | 一致 (負数) |
| 2 | `2010h22h-q021` expl「−50」 | 2010h22h p11 (A:250/80 → 計算値の負数) | 妥当 (減算「650-700」は保持) |
| 3 | `2012h24h-q100` expl「−10〜−1」/「8－10」 | 2012h24h p47 選択肢「10−B6」等は減算 | 負数だけを変換、減算は保持で妥当 |
| 4 | `2011h23tokubetsu-q093` expl「L＝−1」 | tokubetsu p36 図1「L＝−1」 | 一致 |
| 5 | `2011h23tokubetsu-q090` expl 〔RFP の概要〕〔X 社からの提案〕 | tokubetsu p32 | 一致 (〔〕見出し) |
| 6 | `2012h24a-q090` zh 〔系统导入研讨会备忘录〕 | 2012h24a p38〔システム導入検討会のメモ〕 | 一致 |
| 7 | `2014h26a-q094` expl zh “平均(B53～G53)” “B52*B53” “H54/H52” | 2014h26a p44 は “…” で区切られた式 | 区切りが一致 (演算子の ASCII 化は D-162) |
| 8 | 除外 `2012h24a-q029` (－25 ＋20) | 2012h24a p11 の式「販売見込量 − 在庫量 + 20」 | 演算子として扱う除外は正しい |
| 9 | 除外 `2012h24h-q085`「価格-3」 | 2012h24h p32 選択肢表 ウ=3/3/1 | 負数ではないので除外は正しい (NIT-1) |
| 10 | `2021r03-q070` expl en “Publisher ← Author” | 2021r03 p33 E-R 図 (擬似言語ではない) | 変換は妥当。〔表記法〕は源の見出し (下記) |
| 11 | D-158 `2015h27a-q048` | 2015h27a p20 | 図ラベル・キャプション無し。一致 |
| 12 | D-158 `2009h21h-q037` (凡例行は残す) | 2009h21h p15 | ラベル無し、凡例あり。一致 |
| 13 | D-158 `2016h28h-q010` | 2016h28h p05 | ラベル・題名無し。一致 |
| 14 | `2014h26h-q085` zh/en 新訳 | 原文 (writer は p34 照合済) との意味照合 | 「運用管理部門・販売部門の両方から受領」が zh / en に正しく反映されている。〔数据管理要领〕/[Data Management Guidelines] は前文の表記と揃っている。前文 (A4) は jp / zh / en とも差分 0 |

## 3. ゲート (本レビューで実行、fresh)
| コマンド | 結果 |
|---|---|
| `node scripts/quiz-keys-crosscheck.mjs` | questions=2900 exams=29 layerB=ran、all invariants hold (A1–A7, B1–B7) |
| `node scripts/quiz-chumon-groups-build.mjs --check` | 生成結果と一致 (2015h27a-mqTech1/2 の「?」は既知の情報行) |
| `node scripts/quiz-pagefix-derive-groups.mjs --assert-clean` | D-145 (A)(B) GREEN |
| `pnpm --config.verify-deps-before-run=false -C apps/web exec tsc --noEmit` | exit 0 |
| `pnpm --config.verify-deps-before-run=false -C apps/web test` | 38 passed / 1 skipped files、562 passed / 2 skipped |
| `node scripts/quiz-fix-S129-a5.mjs` (dry-run) | files to write 0 / skipped 167 (冪等) |

## 4. NIT
- NIT-1: 記録 §2 は `2012h24h-q085`「価格-3」を「項目番号のハイフン」と書いているが、実際は「評価項目-重み」の区切りで、負数ではない。除外の結論は正しく、文言だけの問題。
- NIT-2: §3 の未確認 `2021r03-q070`「〔表記法〕」は源 p33 の見出しだと本レビューで確認した (不触で正しい)。`2011h23a-q057` / `2021r03-q074` は引き続き未確認。
- NIT-3: `2015h27a-q048` jp「xか？」は源 p20 では “xか?” (“” 区切り、半角 ?)。writer が後続に登記済み。範囲外。
- NIT-4 (範囲外): `2016h28h-q010` の源 p05 では、最初の a→網掛け の線に矢印が無い (表示層では「→」)。fidelity lane への参考情報。
