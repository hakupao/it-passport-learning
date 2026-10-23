# Stage 7 Phase 1 — 練習画面 Rule A 語義抽検 (目視)

- 日付: 2026-10-23
- HEAD: `f20ad1756ef1e6128babf2d30b9eb82c7c997f9a` (branch `stage7-ui`)
- 抽出規則: `.superpowers/sdd/PLAN_stage7_ui/audit_ids.json` (seed 20261023, mulberry32 shuffle, 1 類 5 題・重複なし; figure / table / chumon / choice_figures / suspect / points3)
- N = 30 題 × 2 locale (ja, zh) = 60 行
- 監査者: 独立 agent (実装・レビューとは別 context, Rule D)

## 方法

1. `npm run build` (HEAD のビルド) → `next start -p 3116` (Redis 系 env を空に)。Playwright (chromium, 1440×900, DPR 1) で `api.anthropic.com` を route で abort — 全 60 行で到達 0 件。
2. 各 id × locale: `/<locale>/practice?ids=<id>` を開き、中問メンバーは → キーで当該題まで移動。未回答の全頁 screenshot (`-q`)、図があれば拡大ボタン→dialog screenshot (`-zoom`)→Esc で閉じることを確認、中問は「共通前文 ▸」を開いて screenshot (`-fold`)、正解以外の最初の記号で誤答 → 全頁 screenshot (`-a`)、zh は「显示中文译文」ON で screenshot (`-tr`)。計 202 枚 (+ 補助の切出し 3 枚)。
3. 機械照合 (補助): 表示 DOM の題幹 (前文+本体) を `stem_jp_clean ?? stem_jp` と空白・markdown 記号を除いて一致比較、markdown 表の行数と DOM `<tr>` 数、選択肢順、choice_figures の img 数、data-state (picked-wrong / correct)、解答欄の記号、○ 行本文 = `explanations.correct[jp|zh]`、× 行本文 = `distractors[letter]`、自分の × 行のみ open、points 件数と本文、suspect 行の有無と文言 (plan-s0 項目 24 の ja/zh 文言と完全一致)、zh 訳題幹 = `translations.stem.zh`、img の naturalWidth>0 と表示縦横比 = 原寸比 (CSS による切抜きなし)、要素ごとの横はみ出し検出。
4. 目視: 上記 screenshot を開き、表の行/セル、擬似言語のインデント、改行、図の切れ、2×2 配置、○/× の視認性、重なり・切れを確認。表/ペア型選択肢 (機械比較が構造上一致しないもの) は目視で全セルを確認。

本文・選択肢・解説の文言は IPA 著作物のため本 evidence には転記しない (構造のみ記述)。

## 結果 (id × locale)

凡例: ✅ 合格 / ❌ 不合格 / — 該当なし。⚠ は注記 (不合格に数えない)。

| id | 類 | locale | 題幹 | 図+拡大 | 選択肢 | 中問折畳 | ○×+解答欄 | 解説行 | ポイント | suspect | zh 訳文 | 重なり/切れ | 注記 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2014h26a-q011 | figure | ja | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ |  |
| 2014h26a-q011 | figure | zh | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |
| 2010h22h-q021 | figure | ja | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ |  |
| 2010h22h-q021 | figure | zh | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |
| 2018h30a-q085 | figure | ja | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ |  |
| 2018h30a-q085 | figure | zh | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |
| 2014h26h-q099 | figure | ja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 3/4; 選択肢は表/ペア描画のため機械比較は構造のみ、目視で全セル確認 |
| 2014h26h-q099 | figure | zh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 3/4; 選択肢は表/ペア描画のため機械比較は構造のみ、目視で全セル確認 |
| 2015h27h-q085 | figure | ja | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ |  |
| 2015h27h-q085 | figure | zh | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |
| 2017h29a-q035 | table | ja | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | 表は図版内 (画像で判読可) |
| 2017h29a-q035 | table | zh | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 表は図版内 (画像で判読可) |
| 2024r06-q081 | table | ja | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | 選択肢は表/ペア描画のため機械比較は構造のみ、目視で全セル確認; ⚠ 選択肢の [表] (上段/下段 2 表) が 1 表に結合して描画され、下段表の caption と先頭列が上段表の 1 セル内に入る。文字は全て存在 (既存 parser 挙動、QuizRichText 未変更、旧描画と同一) |
| 2024r06-q081 | table | zh | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 選択肢は表/ペア描画のため機械比較は構造のみ、目視で全セル確認; ⚠ 選択肢の [表] (上段/下段 2 表) が 1 表に結合して描画され、下段表の caption と先頭列が上段表の 1 セル内に入る。文字は全て存在 (既存 parser 挙動、QuizRichText 未変更、旧描画と同一) |
| 2011h23tokubetsu-q059 | table | ja | ✅ | ✅ | ❌ | — | ✅ | ✅ | ✅ | ✅ | — | ❌ | **4 列横排: 各選択肢の文字列 (改行機会なし) がカード幅 112px を約 38px はみ出し、右隣のカードに覆われて末尾が見えない (ア〜エ全て)** |
| 2011h23tokubetsu-q059 | table | zh | ✅ | ✅ | ❌ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | **4 列横排: 各選択肢の文字列 (改行機会なし) がカード幅 112px を約 38px はみ出し、右隣のカードに覆われて末尾が見えない (ア〜エ全て、訳文行も同様)** |
| 2013h25h-q018 | table | ja | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | suspect 行あり(文言一致); 表は図版内 (画像で判読可) |
| 2013h25h-q018 | table | zh | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | suspect 行あり(文言一致); 表は図版内 (画像で判読可) |
| 2018h30a-q044 | table | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | 選択肢は表/ペア描画のため機械比較は構造のみ、目視で全セル確認 |
| 2018h30a-q044 | table | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 選択肢は表/ペア描画のため機械比較は構造のみ、目視で全セル確認 |
| 2013h25a-q090 | chumon | ja | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 2/4; suspect 行あり(文言一致) |
| 2013h25a-q090 | chumon | zh | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 2/4; suspect 行あり(文言一致) |
| 2009h21a-q094 | chumon | ja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 2/4; ⚠ 前文の表 (11 列) が列幅 465px を超え横スクロール (556px)。初期表示で右端 2 列が隠れるが、スクロールで全列確認済 |
| 2009h21a-q094 | chumon | zh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 2/4; ⚠ 前文の表 (11 列) が列幅 465px を超え横スクロール (556px)。初期表示で右端 2 列が隠れるが、スクロールで全列確認済 |
| 2011h23tokubetsu-q094 | chumon | ja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 2/4 |
| 2011h23tokubetsu-q094 | chumon | zh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 2/4 |
| 2013h25a-q092 | chumon | ja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 4/4; suspect 行あり(文言一致) |
| 2013h25a-q092 | chumon | zh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 4/4; suspect 行あり(文言一致) |
| 2011h23tokubetsu-q100 | chumon | ja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 4/4 |
| 2011h23tokubetsu-q100 | chumon | zh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 4/4 |
| 2018h30h-q005 | choice_figures | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | choice_figures 2×2 |
| 2018h30h-q005 | choice_figures | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | choice_figures 2×2; 訳文 toggle: 題幹訳のみ (選択肢は図) |
| 2013h25h-q068 | choice_figures | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | choice_figures 2×2 |
| 2013h25h-q068 | choice_figures | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | choice_figures 2×2; 訳文 toggle: 題幹訳のみ (選択肢は図) |
| 2016h28a-q050 | choice_figures | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | choice_figures 2×2 |
| 2016h28a-q050 | choice_figures | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | choice_figures 2×2; 訳文 toggle: 題幹訳のみ (選択肢は図) |
| 2009h21a-q048 | choice_figures | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | choice_figures 2×2 |
| 2009h21a-q048 | choice_figures | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | choice_figures 2×2; 訳文 toggle: 題幹訳のみ (選択肢は図) |
| 2012h24a-q002 | choice_figures | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | choice_figures 2×2 |
| 2012h24a-q002 | choice_figures | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | choice_figures 2×2; 訳文 toggle: 題幹訳のみ (選択肢は図) |
| 2020r02o-q025 | suspect | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | suspect 行あり(文言一致) |
| 2020r02o-q025 | suspect | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | suspect 行あり(文言一致) |
| 2015h27a-q087 | suspect | ja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 3/4; suspect 行あり(文言一致) |
| 2015h27a-q087 | suspect | zh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 3/4; suspect 行あり(文言一致) |
| 2012h24a-q089 | suspect | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | suspect 行あり(文言一致) |
| 2012h24a-q089 | suspect | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | suspect 行あり(文言一致) |
| 2022r04-q021 | suspect | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | suspect 行あり(文言一致) |
| 2022r04-q021 | suspect | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | suspect 行あり(文言一致) |
| 2015h27h-q094 | suspect | ja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 2/4; suspect 行あり(文言一致) |
| 2015h27h-q094 | suspect | zh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 2/4; suspect 行あり(文言一致) |
| 2010h22h-q035 | points3 | ja | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | points 3 条すべて表示 |
| 2010h22h-q035 | points3 | zh | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | points 3 条すべて表示 |
| 2011h23a-q051 | points3 | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | points 3 条すべて表示 |
| 2011h23a-q051 | points3 | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | points 3 条すべて表示 |
| 2011h23a-q091 | points3 | ja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | 中問 3/4; points 3 条すべて表示; 擬似言語 <pre> のインデント保持を目視確認 |
| 2011h23a-q091 | points3 | zh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 中問 3/4; points 3 条すべて表示; 擬似言語 <pre> のインデント保持を目視確認 |
| 2012h24h-q056 | points3 | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | points 3 条すべて表示 |
| 2012h24h-q056 | points3 | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | points 3 条すべて表示 |
| 2009h21a-q065 | points3 | ja | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | points 3 条すべて表示 |
| 2009h21a-q065 | points3 | zh | ✅ | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | points 3 条すべて表示 |

## 集計

| 検査項目 | ✅ | ❌ | — |
|---|---|---|---|
| 題幹 | 60 | 0 | 0 |
| 図+拡大 | 34 | 0 | 26 |
| 選択肢 | 58 | 2 | 0 |
| 中問折畳 | 18 | 0 | 42 |
| ○×+解答欄 | 60 | 0 | 0 |
| 解説行 | 60 | 0 | 0 |
| ポイント | 60 | 0 | 0 |
| suspect | 60 | 0 | 0 |
| zh 訳文 | 30 | 0 | 30 |
| 重なり/切れ | 58 | 2 | 0 |

## 判定: **FAIL** (❌ 4 件 = 1 題 × 2 locale × 2 項目)

### 不合格

1. **2011h23tokubetsu-q059 (ja / zh) — 選択肢・重なり/切れ**: 4 択とも文字数 ≤12 で図表なしのため choiceLayout が 4 列横並びを選ぶが、各選択肢の文字列は英字・記号の連続で改行機会がなく、幅 112px のカードを約 38px はみ出し、右隣のカードの背景に覆われて末尾が見えない (ア〜エ全て; zh は訳文行も同様)。DOM 計測: 各テキスト span の right がカードの right を 38〜39px 超過 (エは 10px)。証拠: `2011h23tokubetsu-q059-ja-q.png` / `-ja-a.png` / `-zh-tr.png` / `-ja-choices-crop.png`。DESIGN §6.2 の「12 字以下なら 4 列」規則が文字数のみで判定しており、実表示幅を考慮していないことが原因と推定。

### 注記 (⚠, 不合格に数えない)

- **2024r06-q081 (ja / zh)**: 選択肢の `[表]` は「上段表 / 下段表」の 2 表だが、1 つの表として描画され、下段表の見出しと先頭列名が上段表の 1 セル内に入る (全文字は存在)。`quizRichText.ts` は 60a2518 (D-144) 以降未変更で、fidelity テストのとおり旧描画と同一 = Phase 1 の回帰ではない。図版 (題幹下) に原典の選択肢表があるため解答は可能。別途 OQ 候補。
- **2009h21a-q094 (ja / zh)**: 前文内の 11 列の表 (556px) が列幅 465px を超え、表ラッパーが横スクロール (overflow-x: auto) になる。初期表示で右端 2 列が見えないがスクロールで全列・全行の存在を確認 (`2009h21a-q094-ja-table-scrolledright.png`)。
- 2014h26h-q099 / 2024r06-q081 / 2015h27h-q094 等の図版上端に原典ページの前文の一部が写り込む・上端で文字が切れるのは元画像そのもの (表示縦横比 = 原寸比で、CSS 切抜きなし)。

### その他確認事項

- 中問 (2nd 以降のメンバー 9 題×2): 全て「共通前文 ▸」が閉じた状態で表示、開くと前文全体が表示され、前文 + 本体の連結が原文と一致 (欠落なし)。
- 解説: 全 60 行で ○ 行 = 正解記号、本文が UI 言語の `correct` と一致、× 行 3 本、自分の × 行のみ展開 + 「← あなたの答え / 你的答案」、他の × 行は折畳。
- points: points3 の 5 題は 3 条すべて表示、他は 2 条 (= ソース件数) 表示。
- suspect: suspect 対象 (suspect 類 5 題 + 2013h25h-q018 + 2013h25a-q090/q092) は ja/zh とも規定文言の 1 行が解説上部に表示、非対象には表示なし。
- choice_figures 5 題: 2×2 配置、4 画像とも読込済・切抜きなし。zh の訳文 toggle は題幹訳のみ追加 (選択肢は図)。

## 成果物

- screenshot: `.playwright-mcp/ui/phase1/audit/` (gitignored, 205 枚)
- 監査スクリプトは scratchpad (非コミット)。

---

## attempt 2 → 不採用 / attempt 3 → **PASS** (2026-10-23)

- attempt 1 FAIL: `failures/phase5/stage_07_ui/task16_audit_attempt_1.md` (q059 row4 溢出)。
- attempt 2 不採用: `failures/phase5/stage_07_ui/task16_audit_attempt_2.md` (兜底 ON 走査で検出力なし、row4 の 7 题が語中折れ、中問非先頭成员未描画)。
- attempt 3 = commit `30d65ca`: row4 を推定幅で判定 (BIZ UDPGothic 実測 em 幅、U+FFE0–FFEE 非 CJK、禁則句読点を連続串に算入、pairs 键徽标 1.75em、閾値 3.55em = 実測 row4 文字列 58px/15px − 0.3em)、訳文表示中は list。版面: row4 1101 / list 1789 / grid2 10 (訳文表示時 list 2890 / grid2 10)。
- 走査 (兜底 OFF = `overflow-wrap:normal` 注入、中問は「次の問題」で翻页し実描画 article id で重複除去、1440×1000):
  - 実装側 (`rule_a_attempt3/implementer_scan.mjs` / `implementer_scan_summary.json`): ja / zh / zh 訳 / en 訳 各 2900 面、溢出 0。
  - **独立審査側** (oh-my-claudecode:code-reviewer、自作 `rule_a_attempt3/reviewer_scan.mjs`、全新 build): 各モード 2900 面・実描画 distinct id 2900・missing 0。検出器 A (scrollWidth) 溢出 0 / 検出器 B (text node 矩形) 溢出 0 (en 訳の 2012h24a-q098 で `pre-wrap` 行末空白の 2px 懸垂 1 件 = 誤報、目視問題なし)。負対照 (attempt 1/2 の 8 题を強制 row4 + 兜底 OFF) は A・B とも 8/8 検出。row4 最小余量 7px (`reviewer_row4_slack_1440.json`)。
  - 目視: 8 题 (attempt 1/2 の失敗題) は list で可読、通常の短い日本語選択肢 6 题は row4 で正常、訳文表示時は list に切替。
- 判定: **PASS** (独立審査の判定)。残課題 (非阻塞): 推定器の ASCII 禁則 (`, . ) ! ? %` 等) 未対応で理論上の上界でない (本語料は余量内) / 閾値テストの精度が緩い → 最終審査の修正波で対応。row4 列幅が狭く CJK 選択肢に孤字折れ → OQ-09。
- 証拠ファイルには問題文を含めない (選択肢字母とボタン文言のみ)。負対照の詳細 JSON は問題文を含むため未入库。
