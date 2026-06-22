# Quiz Phase 1.6 figure-display track — 全量 figure-crop 検証 (Session 99)

> 2026-06-21〜22 / ユーザー「phase2 前に全部做完」。アプリ表示の裁剪図 `figure_png` が各設問に対応する正しい図か全量検証 (S90 q061 型=隣問の図混入の網羅検出)。
> WF `wf_8c5e6dfc-cf2` (general-purpose opus、figure_png + figure_page_png 両読、467 図)。**464/467 完了、3 未検 (weekly limit 直撃: `2026r08-q072`/`q085`/`q099`)。**

## 結果: 27 候補 (約 5.8%)
**注意: これは単一パス deriver の候補であり未検証** (key 審計で deriver 偽陽性 3/5 だった前例あり)。**修正前に独立 critic 検証 + 主 context 実読が必須** (= vision quota 要)。本 session は weekly limit のため**監査のみ完了・修正は次パスへ繰延**。

| issue | 数 | ids |
|---|---|---|
| partial_crop_missing_content (図の一部欠け) | 19 | 2011h23tokubetsu-q026/q070/q073/q078, 2012h24h-q015, 2014h26a-q087, 2016h28a-q020/q040, 2018h30a-q093, 2018h30h-q043/q066, 2019h31h-q034, 2019r01a-q002/q082, 2025r07-q030/q073, 2026r08-q003/q050/q055 |
| wrong_question_figure (別問の図混入) | 6 | 2010h22h-q090, 2011h23a-q093, 2013h25a-q097, 2014h26h-q099, 2019h31h-q061, 2019r01a-q093 |
| extra_neighbor_content (隣の内容混入) | 2 | 2009h21a-q095, 2023r05-q047 |

### figure 不要の可能性 (has_figure=false 候補、要検証)
- **`2019h31h-q061`** (=S90 既知、独立再確認): 問61 は LAN/WAN 穴埋めで独立図表なし、裁剪が下の問62 RAID を写す。
- **`2013h25a-q097`**: 問97 は RFID 要望事項の純テキスト問、裁剪は下の問98 の表を写す。

### 各候補の正しい図領域
`figcrop_results.json` の `mismatches[].correct_region_desc` に全 27 件の「全頁のどこに正しい図があるか」を記録 (再裁剪の指針)。

## 緩和要因 (Phase 2 への非ブロッキング性)
1. **Phase 2 解説生成は figure_page_png (全頁) を権威として読む** → 裁剪が誤っても解説生成の入力は正 (key 審計・choices 審計と同方式)。
2. **Phase 1.5 で多くの図 (表) は stem_jp_clean に markdown 表として復元済** → 表系の図は裁剪が欠けても stem に内容がある。
3. よって figure-crop は主に**アプリ表示品質**の問題 (学習者が誤/部分図を見る) で、Phase 2 解説の正しさには波及しにくい。

## 推奨 (次パス、vision quota 回復後)
1. 27 候補 (+ 3 未検) を独立 critic で再検証 (写審分離、偽陽性除去)。
2. confirmed を per-page 実読で正しい bbox 決定 → `data/ip/exams/figures/<id>.png` 再裁剪 → `build-quiz-figures.mjs` で webp 再生成。
3. has_figure=false 相当 (q061/q097-2013h25a 等) は raw bank で has_figure 訂正 → rebuild。
4. 検証 (build/nft/figure 解決) + 再 figcrop sweep で 0 確認。

再現: `scripts/quiz-figcrop.workflow.mjs` + `quiz-figcrop.run.generated.mjs`。証拠 `figcrop_raw.txt` / `figcrop_results.json` (gitignored)。
