# ⑤-2 U2 — 波 1〜3 の Rule D 審閲 (S121、D-146 第 3 unit)

> 各波 reviewer 1 体 (opus、fixer [executor] と別 subagent_type)、直列。報告は reviewer の原文 (主 context は整形のみ)。
> 処置の記録は各波 §の末尾「処置」に主 context が追記。

---

## 波 1 (2015h27a / 2016h28a) — reviewer `u2-reviewer-w1` = `feature-dev:code-reviewer` (opus)

**VERDICT: PASS-with-notes (MAJOR 0 / 誤是正 0 / correct_answer 変更 0)**

### 再計算
- gp/cr JSON から独立に数え直し、evidence §2 表は全セル一致。2015h27a n68 gp8 cr8 / union9 → q066 除外 8 (11.8%) / 正解肢上 2 問 / aa 1。2016h28a n84 gp3 cr4 / union4 (4.8%) + machdiff q028 → 5 (6.0%) / 正解肢上 1 / aa 0。プール 152 / 去重 12 → 13 (8.6%) / 正解肢上 3 / aa 1。双 pass 一致 10、片側 2 (q093 gp のみ / q043 cr のみ)、severity 不一致 2 (q044, q018) も一致。
- machdiff 4 run を再実行 → same 338/338/419/419、AGENT_MISSED 2/2/1/1 (去重 4)、§3 表と完全一致。
- 注: gp 2015h27a の discrepancies は q059 ア・イ が二重記載で 14 行 (unique 12)。JSON の onCorrectChoiceCount=3 はこの重複由来、evidence の「正解肢上 2 問」(問単位) が正しい。

### 適用照合
- 13 問すべて反映済。二重適用・別問誤適用 0。ce3e31e^ と HEAD の全 2900 問 field 差分を機械比較 → 波 1 exam の変更は 11 問のみ (q042/q044/q059/q062/q081/q093/q097/q018/q028/q050/q098)、q027・q043 は表示層のみで期待どおり。他 exam 混入なし。id 集合・総数 2900 不変、correct_answer 変更 0 (全 2900 走査)。
- questions/bank/by_year/sidecar/.phase1 を id ごとに直読。`--dry-run` 再実行 applied 0 / skipped 127。D-143: 10 問とも 5 スカラー変更 0、final note に MARK、round1 は是正前 final とバイト一致。ゲート再実行: keys-crosscheck A1–A7/B1–B7 ✓、chumon-groups --check ✓。唯一の未反映 = q043 の .phase1 (MINOR-3)。

### 原寸抽検 (13/13 全件 + q066、源 PNG を reviewer が実読)
| id | page | 所見 |
|---|---|---|
| 2015h27a-q044 | 18 | 「生産性を規模÷工数で表す」を確認。現データ=源。÷ 抜きでは ウ=10 を導出不能 → answer_affecting 妥当 |
| 2015h27a-q059 | 24 | ア/イ/ウ 3 肢とも現データ=源。正解肢イも源どおり |
| 2015h27a-q097 | 46 | 〔Aさんが調べた結果〕(亀甲) 確認。ウ・エ の空白は画素計測で確定 (X↔社 9px に対し 社↔PC 17px 等、ア の AND 区切りと同幅)。現データ=源 |
| 2016h28a-q050 | 19 | 源の選択肢は図 4 枚のみ。切出 4 枚実読 → ア魚骨 / イ 降順棒+累積折線 / ウ 点群 / エ 流れ図。写り込み 0。正解イ=図イ整合 |
| 2015h27a-q042 | 18 | 「システム開発中の総合テスト」現データ=源 |
| 2015h27a-q027 | 11 | 「側面から分析評価し」中黒なし、現データ=源 |
| 2015h27a-q062 | 25 | エ は「…なくてもよい。」で終端。現データ=源 |
| 2015h27a-q081 | 33 | イ「設けられた，不正侵入…」。混入「.」除去は正 |
| 2015h27a-q093 | 43 | 〔手順〕(亀甲) 確認。現データ=源 |
| 2016h28a-q018 | 7 | ア「営業部門の組織力強化」(の なし)。現データ=源 |
| 2016h28a-q028 | 11 | 注記「単位␣万円／個」コロンなし。現データ=源。答 ウ=110 再計算一致 |
| 2016h28a-q043 | 16 | 10 列横断の結合セル「進捗（月末時点）」実在。復元は正。表数値一致 |
| 2016h28a-q098 | 37 | 題幹・肢イ・ウ とも「IDカード」。IC は源に不在 |
| 2015h27a-q066 | 27 + WebP | 配信図は上段を丸ごと欠き第 2 段落と肢ア〜ウ が写り込み。§5b どおり。段落維持は妥当、N7 登記適切 |

- zh/en 追随: 語義変化 (q042/q044/q059×3/q043/q098) は sidecar・.phase1 とも同期済。cosmetic のみの q062/q081/q018/q027/q028 は zh/en 不変。q093/q097 の zh 括弧変更は源準拠。
- 解説: q097 は「3語・3語・4語・4語」の源事実に一致し腐敗依存を除去、correct_answer=ウ と整合。q050 の解説は図形状のみを論拠にしており choice_figures 化後も正当。

### 指摘
- **[MINOR-1]** evidence §2「裁定後 18 フィールド (aa1/semantic10/cosmetic7)」は誤り。実測 20 (aa1 / semantic11 / cosmetic8)。§4 の「20 差分」と自己矛盾。同「18 フィールド」が `quiz-fidfix-S118-wave1.mjs:13` コメントにも。データ影響なし。
- **[MINOR-2]** evidence §6 層別表の内訳誤り。questions.json 14 = stem 5 + choices 9 (q098 raw stem 数え落とし)。translations 24 = 6 + 18 (q043 stem_jp_clean 数え落とし)。合計は正しい。
- **[MINOR-3]** q043 の caption は `.phase1/tr_2016h28a-q043.json` に入っていない (同 .phase1 は表を持たない散文のみ、アンカ不在で sub() が n===0 で黙って skip)。sidecar が出荷源なので学習者影響 0。ただし .phase1→sidecar 再 merge が走ると caption ごと表が消える。evidence §6「.phase1 にも同じ置換」は q043 について不成立 → 記述訂正。
- **[NIT-1]** q043 の caption 行は表全体の直上で、源では月列のみ横断。§5c が限界として自認済、現状維持可。
- **[NIT-2]** q066 の代替段落は全角ラテン (ＬＡＮ/ＰＣ１/ＡＤＳＬ) で同 stem 内の半角と不統一。N7 再裁断時に整える。
- **[NIT-3]** sub() の冪等判定は `to ⊃ from` の時しか「適用済」を認識せず、それ以外は from 0 回 = 無言 skip (今回 99 件)。次波では「to が在る」肯定確認を skip 側に足す。
- **[NIT-4]** `question_bank.json` / `by_year/2016h28a.json` の 2016h28a-q028 `figure_description` に「単位：万円」が残存 (q050 の figure_description にも旧名称)。quiz 描画経路は figure_description を参照しない (apps/web/src では textbook/types.ts のみ) ため学習者不可視。textbook 側で使う時に要追随。

### 脚本 diff (2fa6fe3) 所見
- **[MINOR-4]** merge-parts `--journal`: journal 行を `type==="result"` だけで採用し is_error / subtype を見ていない。同 id は後行が勝つため、resume で後から失敗した実行が構造化 result を吐くと先の成功結果を静かに上書きする。採用条件に成否判定を足すべき。
- **[MINOR-5]** journal に在る id は part file を読まず検証もしない。ヘッダの「exit 1 = part 欠落 / 壊れた part」は journal モードでは不成立、part 全滅でも GREEN。ヘッダ訂正か、journal モードでも part の存在検査を。
- **[NIT-5]** fromJournal / fromPart は bad になった分も加算するため末尾 (journal N / part M) が audits 数と不一致になり得る。加算位置を検証通過後に。
- **[NIT-6]** `argv.indexOf("--journal")` は最初の 1 個しか処理せず、2 個目が位置引数に化ける。値が "--" 始まりでも黙って飲む。
- **[MINOR-6]** prompt 0b: 冒頭は allowlist だが太字の禁止列挙が evidence/ と fidparts/ の 2 つだけで「それ以外は見てよい」と読める余地。explanations/ と `.phase2/generate_result_*.json` (key_guard に既判定と正解根拠) を禁止側に明記するか allowlist を太字に。
- **[NIT-7]** 0b は手段を列挙 (Read / Grep / cat) しているため node -e・find・sed が字義上の抜け道。「いかなる手段でも参照しない」に。

### 処置 (主 context、S121)
- MINOR-1: evidence §2 を 20 フィールド (aa1/sem11/cos8) に訂正 + `wave1.mjs:13` コメント同期。MINOR-2: §6 層別表を stem 5 + choices 9 / `stem_jp_clean` 6 + zh/en 18 に訂正。MINOR-3: §6 に q043 の .phase1 未適用 (アンカ不在、表無し散文) を明記、再 merge 禁止の維持を注記。データ変更 0。
- MINOR-4: journal 行に `is_error===true` / `subtype!=="success"` の除外を追加 (現行 journal は失敗を `type:"failed"` 別行で書くため防御的)。MINOR-5: journal 採用 id でも part の存在/parse を検査し「part 欠落/壊れ N」を末尾に出す (exit は変えない = journal が正)、ヘッダ文言を訂正。NIT-5: 加算を検証通過後に移動。NIT-6: `--journal` 値欠落 / `--` 始まり / 重複指定 / 余剰位置引数を exit 2。
- MINOR-6 / NIT-7: 0b を allowlist 太字 + 「手段を問わず」に改め、禁止側に `explanations/`・`.phase2/generate_result_*.json`・`questions.json` 等データ本体を明記。
- 再検証: `--journal` 68/68 (出力は修正前と byte 同一)、従来経路 68/68、空 parts dir + journal で 68/68 (part 欠落 68 と表示)、引数異常 3 種 exit 2、`wave1.mjs --dry-run` applied 0 / skipped 127 (不変)。
- NIT-1 現状維持、NIT-2 は N7 (q066 図再裁断) に同梱、NIT-3 は次波 fixer 雛形へ、NIT-4 (`figure_description` の旧文言、学習者不可視) は ⑨ に登録。
- 復験: reviewer-1 に脚本 diff 2 件の再審のみ依頼 → 下記。
