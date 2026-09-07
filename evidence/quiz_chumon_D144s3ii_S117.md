# D-144 段 3(ii) — 中問 linkage-gap の重量組 (再裁断 + 源ページ前文抽出) (S117、規則 A)

## 母数 (探索 agent の棚卸し §28c + 決定的スキャナ v2 §28e)
中問を持つ 14 exam (2009h21a〜2015h27h)。共有資料の欠落は 4 型: (a) 同組の別題 clean に既在 → 複製 (段 3(i)、12 問) / (b) 源ページのみ → Extract≠Verify (本節、15 クラスタ 59 問) / (c) groups.json の共有図 → 挂図 (段 3(i)+(ii)、Rule D 追補込みで計 56 問 + 兄弟図共有 3 問; with_fig 464 → 511) / 除外 3 (2014h26h-q085 捏造 gap、2012h24h-q090 raw に本文あり、2014h26a-q094 式表記)。

## A) 再裁断 (`scripts/quiz-chumon-recrop-D144s3ii.mjs`) — 11 組 / 27 問
| 組 | 源ページ / bbox | 経緯 |
|---|---|---|
| 2009h21a-mqC (図1+図2) / 2012h24a-mqA / 2013h25a-mqC / 2013h25h-mqD / 2015h27a-mqC / 2015h27h-mqC | 各源ページ、主 context 実読の粗枠 + trim | 段 3(i) で「欠け」と判定 → **Rule D 審閲 (§28e B-1) で誤判定と判明** (判読に使った連絡表が固定高さで切れていた)。再裁断後は原解像度で全枚確認、品質は旧図と同等以上のため維持 |
| 2009h21h-mqA (図 LAN の構成) | p34 | 旧 `_groups` は上端欠け (H-2 で未分診の指摘) → 再裁断、q089/q090 に挂図 |
| 2011h23tokubetsu-mqC | p39 | 旧図は 1 行目「＜懸賞ページタイトル＞」が切れていた (M-2) → 再裁断 |
| 2013h25h-mqC | p42 | 旧図はページ全体 (見出し行・ページ番号込み、L-4) → 図1+説明+図2 の範囲に |
| **2014h26a-mqA** (新規, 図1 アローダイアグラム) | p34 | groups.json に無かった組。第 2 弾前文が 図1 を参照 → q085/q086/q088 に挂図 (q086 は choice_figures と共存: 共有図は figure_type=shared で許容、build 守衛と A6 を緩和) |
| **2014h26a-mqB** (新規, 図1 ルータを介した旧PCと現PCの接続) | p37 | Verify 申し送り。q089–q091 に挂図 |
兄弟図の共有 (`COPY_FROM`): 2015h27h-q090/q092 ← q089 (図1 アローダイアグラム)、2014h26h-q100 ← q097 (図1 移行作業のアローダイアグラム)。
全枚: `evidence/phase5/stage_06_quiz_chumon_s3/recrop_sheet_{1..4}.png` + 原解像度実読 (2009h21a-mqC / 2015h27h-mqC は個別に確認)。

## B) 源ページ前文抽出 (Extract=general-purpose ≠ Verify=pr-review-toolkit:code-reviewer、4 検査 jp_verbatim / no_question_sentence / no_fabrication / tr_faithful)
| 弾 | run | 組 | verdict | 適用 |
|---|---|---|---|---|
| 1 | `wf_d5958582-bf1` | 2011h23a-mqC / 2013h25a-mqB2 / 2015h27h-mqB | 3/3 PASS | 12 問 (`chumon_preamble_S117_batch1.json`) |
| 2 | `wf_1c8eedf4-003` | 2012h24a-mqB / 2012h24h-mqB / 2012h24h-mqC / 2013h25h-mqA / mqB / mqD / 2014h26a-mqA / mqB / mqD / 2014h26h-mqD / 2015h27a-mqD | 11/11 PASS | 43 問 + skip 1 (= 2014h26a-q086、本文が共有文を既に含む; `chumon_preamble_S117_batch2.json`) |
| 3 | `wf_1e6f5295-0ca` | 2014h26h-mqC (Rule D ② で判明した未分診の組、p41–42、表1 申請画面の入力項目 + 申請の流れ (1)〜(6)) | 1/1 PASS | 4 問 (`chumon_preamble_S117_batch3.json`) |
Verify の非阻害指摘: en「Mr. A」の性別含意 (既存訳と揃えるため据え置き、⑨ polish)、2014h26a-mqA の指定ページが 1 枚ずれていた (起草は正しいページを自力で読んで成功、メタは本 evidence で訂正: 前文は p34)、2014h26a-mqD en の主述不一致 (`travel expenses is` → `are`、4 箇所是正)、2013h25h-mqD / 2014h26a-mqB の図は本文に含めず挂図で担保 (上表)。
後処理: `quiz-chumon-normalize-S117.mjs` (v3.1) で (a) 前文直後に残る分野見出し行 + 問NN を除去 (26 フィールド、うち S114 適用分 2011h23tokubetsu の残骸 5)、(b) 中問メンバー先頭の分野見出し/問NN を除去 (27 フィールド、Rule D ③/LOW)、(c) 前文前置で二重になった段落 (表本体 + キャプション) を除去 (2012h24h-q089 三語、Rule D ①)。`quiz-chumon-memo-markers-S117.mjs` で 2011h23a q093–q096 の前文 ①〜⑤ を源どおり (1)〜(5) に (Rule D M-1: q096 の表2 文書記号 ①〜⑤ と衝突していた)。`quiz-explfix-S117-chumon.mjs` で 2012h24a-q097 の final stem_corruption_suspected を false に (D-143、L-3)。

## 結果
決定的スキャナ v2 (見出しは「行そのもの」か「行頭 + 空白/コロン」/ ASCII 括弧 / 無番号の 図・表 / 図内ラベル除外): **スキャナの口径では図無し候補 0** (残 10 は図付き問の図内ラベル = 偽陽性)。**ただしスキャナは「参照マーカーの有無」しか見ない**ため、マーカー無しで共有資料に依存する短い設問は捕らえない (Rule D 3(ii) ②: 2014h26h 中問C 4 問 [前文 p41]、2012h24a-q087/q088・2015h27a-q092・2015h27h-q085/q086/q097・2013h25a-q093 [共有図/表] の ≥14 問が残穴として指摘 → §28g で是正)。**中問範囲の真の不変式 = 「同組の前文 probe を全メンバーが含む」(crosscheck A7、未実装)**。with_fig 464 → 501。
## ゲート
crosscheck A1–A6 B1–B6 GREEN / vitest 491 / build-quiz-corpus 再現 / next build → §28f。Rule D (別 agent) → §28g。

### 目視抽検 (N=7、dev server 再起動後に撮影 — 初回撮影は reader のメモリキャッシュで旧データが出た: 教訓「corpus 差し替え後は dev を再起動」)
| id | 確認 |
|---|---|
| 2013h25h-q085 ja | 中問A 前文 (F社の状況) + 設問 |
| 2014h26a-q086 en | 中問A 前文 + 表1 + **共有図 図1 (アローダイアグラム) + 選択肢図 4 枚** (段 2 と段 3 の共存) |
| 2012h24h-q090 zh | 中問B 前文 (研修サービスの概要 (1)〜(5)①〜③ + 表1) + 設問 |
| 2014h26h-q100 ja | 中問D 前文 + 兄弟図 (q097 の 図1 移行作業のアローダイアグラム) |
| 2011h23a-q096 ja | 前文 (1)〜(5) + 表2 ①〜⑤ (文書記号) — M-1 の記号衝突が解消 |
| 2015h27a-q098 ja | 中問D 前文〔Aさんが調べた結果〕+ 設問、分野見出し無し |
| 2009h21h-q089 ja | 中問A 前文 (S115 済) + 再裁断した 図 LAN の構成 (H-2) |
PNG: `evidence/phase5/stage_06_quiz_chumon_s3/s3ii_*.png`, `recrop_sheet_{1..4}.png`。
