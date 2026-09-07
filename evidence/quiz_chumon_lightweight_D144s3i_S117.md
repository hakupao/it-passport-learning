# D-144 段 3(i) — 中問 linkage-gap の軽量組 (S117、規則 A)

## 検出 (決定的): `scripts/quiz-linkage-gap-scan.mjs`
表示層 stem が参照する 〔…〕見出し / 図N / 表N が、その設問内に無く図も無い設問を列挙 (見出し照合は空白無視)。近傍設問 (±6) の clean に同じ見出し行があるか、groups.json (D-120) に共有図があるかをヒントに付ける。
- 実行前: **39 問 / 10 exam**。実行後: **20 問 / 9 exam** (うち 3 は偽陽性: 2009h21h-q082 / 2014h26a-q094 / 2015h27a-q008 の 〔…〕 は図内ラベル)。
- 出力: `data/ip/quiz/.phase2/linkage_gap_scan_S117.json` (gitignored)。

## B) 前文の複製 — `scripts/quiz-chumon-lightweight-D144s3.mjs` (4 問)
| source (clean に前文あり) | 前置先 | 前文の切り出し境界 (jp / zh / en、設問固有文の直前) | 落とした先頭見出し |
|---|---|---|---|
| 2011h23a-q093 | q094, q095, q096 | 「〔A さんが書き出したメモ〕の①〜⑤を実施する順番」/「将〔A 先生记下的备忘录〕中的 ①～⑤」/「When items (1) to (5) in [the memo Mr. A wrote out]」 | 〔マネジメント〕/〔管理〕/[Management] (source と q096 の両方) |
| 2012h24a-q098 | q097 | 「次に示す〔個人情報の適正管理に関する規程〕」/「对于下面所示〔关于个人信息妥善管理的规程〕」/「For each clause of the following [Regulations」 | — |
jp 624 / 584 字、zh 468 / 424、en 1667 / 1555。冪等 (2 回目 skip 4)。D-141 と同じ「前文先頭 40 字」で既在判定。

## A) 共有図の挂図 — `scripts/quiz-chumon-lightweight-figs-D144s3.mjs` (8 組 / 15 問)
groups.json の 14 組の `_groups/*.png` を主 context が実読 (`groups_sheet_1..4.png`) し、**図N の見出し・本体・キャプションが欠けていない 8 組だけ**を採用:
| 採用 | 問 | 判定 |
|---|---|---|
| 2011h23tokubetsu-mqC 図1 懸賞ページ案 | q097 q098 | 完全 (末尾に次段落の散文が少し入るが可読) |
| 2012h24a-mqC 図1/図2 | q093–q096 | 完全 |
| 2013h25a-mqB 図1 ガント | q088 | 完全 |
| 2013h25h-mqC 図1/図2 | q093–q095 | 完全 (ページ全幅で小さい → 拡大で可読) |
| 2015h27a-mqTech1 / mqTech2 | q087 / q090 q091 | 完全 (owner の図を共有) |
| 2015h27h-mqA 図1 | q088 | 完全 |
| 2015h27h-mqD 表1 | q099 | 完全 |
**不採用 6 組 (段 3(ii) で源ページから再裁断)** — **Rule D 審閲で誤判定と判明**: 主 context が判読したのは固定高さで切った連絡表 (`groups_sheet_*.png`) で、6 組とも原解像度では欠けは無かった (§28e)。再裁断は結果として不要だったが、再裁断後の 6 枚も原解像度で確認済で品質は同等以上のため維持。教訓: 除外判断は必ず原解像度の実体で行う。当初の理由 (記録として保持): 2009h21a-mqC (上端欠け + 図2 請求書無し; q098 q099) / 2012h24a-mqA (表頭 1〜2 行欠け; q085) / 2013h25a-mqC (表1 上端欠け; q095) / 2013h25h-mqD (経路図の上端欠け; q097) / 2015h27a-mqC (節点 A/B 欠け; q094–q096) / 2015h27h-mqC (右端・表頭欠け; q093 q094)。
raw: has_figure / figure_path / figure_type="shared" / figure_bbox_pct=group / figure_group を bank・by_year に同時設定 (B6 維持)。questions.json 変更 15 id (has_figure / figure / figure_type のみ)、WebP +15、with_fig 464 → 479。

## 目視抽検 (N=6、App 実描画)
| id | 確認 |
|---|---|
| 2011h23a-q094 ja | 前文 (M 社…〔A さんが書き出したメモ〕①〜⑤) の後に設問文・〔条件〕、分野見出し無し |
| 2011h23a-q096 en | 前文 + 元の設問 (Table 2 含む) + 図。前文の [The memo Mr. A wrote out] と設問側の [the memo Mr. A wrote down] は訳揺れ (登録) |
| 2012h24a-q097 ja | 〔会員登録をするWebページの仕組み〕①〜⑤ の後に設問文 |
| 2012h24a-q093 ja | 図1/図2 が題級図として表示 |
| 2015h27h-q099 zh | 表1 命令を実行した結果 が図として表示 |
| 2013h25h-q095 ja | 図1/図2 (ページ全幅) 表示 |

## ゲート
crosscheck A1–A6 B1–B6 GREEN / vitest 491 / build-quiz-corpus 再実行で 15 id 以外 byte 同一。Rule D → log §27a。
