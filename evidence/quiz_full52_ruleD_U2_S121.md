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
- 復験 (reviewer-1): MINOR-4/5/6・NIT-5/6/7 **すべて解消** (reviewer が journal 順序・part 削除・引数 4 ケースを実行確認)。新規 NIT-8 = ヘッダ「exit 1 = part 欠落」が journal モードと食い違う → ヘッダに 1 行追記で処置。**波 1 = PASS (処置済)**。

---

## 波 2 (2016h28h / 2017h29a) — reviewer `u2-reviewer-w2` = `oh-my-claudecode:code-reviewer` (opus)

**VERDICT: PASS-with-notes (MAJOR 0 / 誤是正 0 / correct_answer 変更 0)**

### 再計算 (gp/cr JSON 直読、machdiff 4 run 再実行)
| 検証 | evidence | 実測 |
|---|---|---|
| 2016h28h gp/cr DISCREPANT | 4 / 4 | 一致 |
| 2017h29a gp/cr DISCREPANT | 5 / 6 | 一致 |
| union (題) | 5 / 6 | 一致 |
| machdiff same / MISSED | 325·5 / 323·7 / 456·4 / 457·3 | 全セル一致、coverage 66·66·92·92 |
| onCorrectChoiceCount | 0 / 2 | 一致 |
| 正解肢上 | 3 題 | 一致 (q089 エ は双 pass 齊漏、machdiff のみ捕捉) |
| 採用 (題) | 8 / 合計 15 | **9 / 合計 16** — 不一致 [MINOR-1] |

### 適用照合
- 是正 16 題すべて出荷層に反映。独立検査 184 件中 181 PASS、残 3 = `2016h28h-q094` raw `stem_jp` (3 層) でアンカ自体が源と異なる崩れ方 → sub() 無言 skip (clean 層は是正済、§5 N5 登記済 → MINOR-5)。二重適用 0、別問・他 exam 混入 0 (`ce3e31e^..HEAD` 2900 問機械比較で波 2 exam の変更は期待の 14 id のみ)。層別 field 数 (stem 7 + choices 16)×3 = 69 / sidecar 31 / 解説 16 / note 10 は evidence と一致。`--dry-run` applied 0 / skipped 210。D-143: round1 は新規追記のみ (in-place 変更 0)、final note 10 件 append-only + MARK 1 回。是正後 machdiff 残差 1/1/2/1 = §7 と一致、post manifest が現データと 158/158 一致。

### 原寸独立抽検 (16 題全件、源 PNG を reviewer が実読)
| id | page | 現データ=源 | 所見 |
|---|---|---|---|
| 2016h28h-q089 ア〜エ | 40 | ○ | 4 肢とも第 1 節後の読点と文末句点が源に実在。正解肢エ 一致 |
| 2017h29a-q012 ア/イ | 06 | ○ | ア に括弧混入なし (正解肢)、イ は源も「上位10人」 |
| 2017h29a-q098 ア〜エ | 39 | ○ | `(not A ) and ( B or C )` の空白位置まで源どおり。正解肢イ 一致 |
| 2016h28h-q009 | 05 | ○ | 「A社」字形明瞭で 4 ではない。エ の「A 社の検査」も一致 |
| 2016h28h-q040 / q051 | 19 / 24 | ○ | 〔報告ルール〕〔条件〕とも亀甲括弧 |
| 2016h28h-q060 | 28 + WebP | ○ | 源本文に a/b/c の散文は存在しない。WebP に 3 図・キャプション・肢、`has_figure=true` → 段落削除は正 |
| 2016h28h-q067 | 31 | ○ | ア「アクセス可能とする。」、ウ「メンテナンス」 |
| 2016h28h-q094 | 42 | ○ (clean) | 源は “仕入一覧” “仕入” “商品”。clean 層が一致 |
| 2017h29a-q001 | 02 | ○ | 「単位␣万円／日」コロンなし。結合ヘッダ実在、Z 行は源も 8/7/8 |
| 2017h29a-q020 | 10 | ○ | 「単位␣百万円」一致。マイナスは源が全角字形 [MINOR-4] |
| 2017h29a-q022 / q047 | 11 / 20 | ○ | 「曇りや雨」「電話で内容を伝えた」 |
| 2017h29a-q078 / q079 | 30 | ○ | 「銅線ケーブル」「〔送信先〕」 |
| 2017h29a-q096 | 37 | ○ | 〔事例〕亀甲 |

**逆方向の是正 (誤是正) 0 件。**

### 判断・zh/en・解説
- q060 段落削除は波 1 q066 と同規則で妥当。q001 の各セル展開は源の 2 段ヘッダ (技術者/製品) を保存、波 1 q043 (全列横断の表題 → キャプション行) とは構造が別 → ⑨-d は学習者可視の矛盾ではなく方針文書化の課題。括弧 4 題は全件字形確定、線引き遵守。zh/en は語義変化 (q009 / q060 / q012 イ / q022 / q078 / q098) のみ同期、cosmetic では不触。q047 の zh/en は元から忠実。解説 q022 (天候デリバティブ) / q009 (A社 単独親事業者) は correct_answer (イ / ア) と整合。ゲート crosscheck GREEN / chumon --check / assert-clean GREEN を再実行確認。

### 指摘
- **[MINOR-1]** evidence §1 2017h29a 採用「8」/ 合計「15」は誤り → **9 / 16**。q020 は machdiff 由来項目 (マイナス) 見送りでも「単位：」是正で採用されている。§7 (16 問) / §8 (14 + 2) / fixer FIX キー 16 と自己矛盾。
- **[MINOR-2]** evidence §2「去重 6 題 / 12 field」は誤り → 4 run 去重 **8 題 / 11 field** (直下の表も 8 行)、うち採用 6 題 / 9 field。
- **[MINOR-3]** evidence §3 は q020 の出所を「主 context 実読」とするが、gp・cr 両 agent が `verdict=CLEAN` のまま discrepancy 報告済 (現行 machdiff は `VERDICT_CONFLICT` 2 件で検出)。S118 §44 q079 型 → 出所訂正 + ⑨ 実例登記。
- **[MINOR-4]** evidence §5 マイナス見送り理由「走査画像から判別できない」は過大。原寸で ASCII ハイフンでないことは明確 (U+2212 / U+FF0D の別が付かないだけ)。結論妥当、理由記述を訂正。
- **[MINOR-5]** `2016h28h-q094` raw `stem_jp` は 3 層とも崩れたまま (`『仕入一覧" 表` / `*仕入” 表`)。学習者影響 0。raw→clean 再 merge が走ると是正が失われる → 波 1 q043 と合わせ「.phase1 / raw を出荷源にしない」前提を evidence に明記。
- **[NIT-1]** q098 は肢 `(not A ) and ( B or C )`、解説 `(not A) and (B or C)` で空白が異なる (§4(e) 意図どおりだが 2 種の表記が並ぶ)。
- **[NIT-2]** 括弧是正 4 題の zh/en は `[条件]` `[报告规则]` `[Conditions]` のまま (保真規則は jp 対源、⑨-c 同族)。
- **[NIT-3]** clean 層で `〔報告ルール〕` (q040) は独立行だが `〔条件〕` (q051) / `〔事例〕` (q096) は後続本文と同一行に連結。源は 3 件とも独立行。本波の是正由来ではなく既存の改行正規化由来 → N5 / 空白系列に並記。

### 処置 (主 context、S121)
- MINOR-1: §1 表を 2017h29a 採用 9 / 合計 16 (10.1%) に訂正 + 訂正注記。MINOR-2: §2 を「去重 8 題 / 11 field (採用 6 題 / 9 field)」に訂正。MINOR-3: §3 q020 の出所を「両 agent が CLEAN のまま discrepancy 記載 (§44 q079 型、machdiff VERDICT_CONFLICT で検出)」に訂正 → ⑨ 実例として本 evidence に登記。MINOR-4: §5 の見送り理由を「全角 2 字形のいずれかが確定できない」に訂正。MINOR-5: §8 冒頭に「出荷源 = clean 層 + sidecar、raw / .phase1 からの再 merge 禁止 (S117 教訓)、再 merge 前に N5 台帳を是正」を明記。データ変更 0。
- NIT-1 (q098 解説の空白表記) / NIT-2 (括弧の zh/en) / NIT-3 (節見出しの改行) は ⑨ に登録 (下記 §横断)。
- evidence 文言のみの訂正のため復験は省略 (波 1 と同扱い)。**波 2 = PASS (処置済)**。

---

## 波 3 (2017h29h / 2018h30a) — reviewer `u2-reviewer-w3` = `pr-review-toolkit:code-reviewer` (opus)

**VERDICT: PASS-with-notes (MAJOR 0 / 誤是正 0 / correct_answer 変更 0 → 出荷可)**

### 再計算 (gp/cr JSON 直読 + machdiff 4 run 再実行、evidence §2 表と全セル照合)
| 検証項目 | evidence | 実測 |
|---|---|---|
| 2017h29h n / gp / cr / 去重 | 85 / 3 / 3 / 3 | 一致 (q014・q070・q077、両 pass 同一 id 同一 field) |
| 2018h30a n / gp / cr / 去重 | 67 / 4 / 4 / 4 | 一致 (q037・q043・q083・q100) |
| machdiff AGENT_MISSED (生/去重) | 13 / 7 field 5 題 | 一致。same 422/422/332/331、coverage 85·85·67·67、transcript 欠落 0 |
| 計上 / 是正 | 6·6 / 6·5、プール 12 (7.9%) / 11 (7.2%) | 一致。率も全一致 |
| 正解肢上 / answer_affecting | 0 / 1 | 一致 (onCorrectChoiceCount=0 が 4 本とも) |
| severity 内訳 (裁定後 12 題) | aa1 / sem5 / cos5 / TYPO1 | 一致。sem = q014・q077・q037・q083・q100、cos = 29h-q043・q071・q090・30a-q079・q081 |
| severity 不一致 2 件 | q077・q037 | 一致 |

### 適用照合
- 15 の置換対象を questions / question_bank / by_year で全数直読 → 全て是正後の値。二重適用アーティファクト (，，／〔〔／““ 等) 全 2900 問走査 0。`--dry-run` applied 0 / skipped 92 = 冪等。
- `ce3e31e^..HEAD` questions.json 2900 問機械比較: 変更 35 題、うち波 3 lane は期待の 10 題ちょうど。他 exam・別問混入 0。2017h29h-q043 は不出現 (clean 層のみ = 正)、2018h30a-q043 不変 (正)。id 集合 0 差・総数不変。questions vs bank 0、by_year vs bank (6 exam) 0。
- 層別 89 field 再構成: raw 48 + sidecar 17 + .phase1 12 + 解説 6 + note 6 = 89 (一致)。D-143: final note MARK 6 件のみ、round1 側 MARK 0。
- **無言 skip は 3 ではなく 7** (潜在 sub 呼び出し 99 - 計上 92) → MINOR-1。

### 原寸抽検 (12 題全数 = 母集団悉皆、11 ページ実読、2 exam 横断)
| id | page | 現データ=源 | 所見 |
|---|---|---|---|
| 2017h29h-q070 ウ | 29 | ○ | 6 倍で「プログラムを 10 進数の数字列で表現する」を字形確定。16 ではない。是正方向 = 源方向 |
| 2017h29h-q014 ア | 06 | ○ | 「システムの状態の遷移」。居移は源に不在 |
| 2017h29h-q043 stem | 19 | ○ | 「スコープにはプロジェクトの」源に読点なし。挿入読点の除去は正 |
| 2017h29h-q071 stem | 30 | ○ | 〔Aさんの電子メールの宛先設定〕亀甲。To/Cc/Bcc は源 3 行 (§10 見送りどおり) |
| 2017h29h-q077 ア | 32 | ○ | 「様々な入力条件」。同行の「入力と出力」と同一字形 |
| 2017h29h-q090 stem | 36 | ○ | “商品” “％” 〔操作〕 ‘有’ ‘％うどん％’ ‘うどん％’ 全数確認。5 箇所とも源方向 |
| 2018h30a-q037 ウ | 15 | ○ | 折返し行「した。」。追加じた は源に不在 |
| 2018h30a-q043 stem | 18 | ○ (非再現) | 5 倍で「コストマネンジメント」実在。同文の他 4 箇所は「マネジメント」= IPA 誤植で確定 |
| 2018h30a-q079 stem | 32 | ○ | 「ここでデータの左方を上位」源に読点なし |
| 2018h30a-q081 イ/ウ/エ | 33 | ○ | 7 倍で区切りが「，」と確定。①，②，③ / ②，④ / ③，④ |
| 2018h30a-q083 エ | 33 | ○ | 「同梱」+ ルビ「こん」。同杜 は源に不在 |
| 2018h30a-q100 ア | 39 | ○ | 「各表の先頭行から数えた」 |

**源と逆方向の是正 (誤是正) 0 件。** 12 題の正解肢を源から独立導出 → 全て stored correct_answer と一致。

### 判断・zh/en・解説
- SOURCE_TYPO 裁定妥当 (raw 源誤植保持 / clean 正綴り、表示は `stem_jp_clean || stem_jp`)。「非語化の文字置換 = semantic」は波 1 q018 (「の」挿入 = 成語 = cosmetic) と整合、基準は「語として成立するか」で一貫。machdiff +5 題は原寸実読で 5/5 真の欠陥・偽陽性 0。
- q079 型 (CLEAN なのに discrepancies 非空) は 4 本走査で q079 gp の 1 件のみ、CLEAN audit の notes_jp 走査でも追加 0。是正後 manifest を現データから再構成して machdiff 再実行 → AGENT_MISSED 0/0/0/0。
- zh/en: q070 ウ・解説ウ + points[1]・q100 ア は同期 ✓。q081 は cosmetic だが同期済 (MINOR-2)。追随不要の 4 件 (q014 / q077 / q037 / q083) は実読で源忠実。cosmetic の 29h-q043 / q071 / q090 / 30a-q079 は zh/en 不触 ✓。
- 解説 q070: 旧論拠「機械語そのものが16進数で…」は 3 語とも消失、新主論拠「2 進数のビット列であって 10 進数の数字列ではない」、16 進は補足に降格。correct_answer ア と整合。points[1] 3 語同期。
- ゲート再実行 (reviewer 自身): keys-crosscheck A1–A7/B1–B7 ✓、chumon --check ✓、assert-clean ✓ (50)、tsc 0、vitest 501 passed / 2 skipped。answer_keys vs questions 2900 照合 0 不一致。

### 指摘
- **[MINOR-1]** evidence §7「skip 3 = 29h-q043 の raw ×3 層」は不完全。無言 guard skip は計 7: `2018h30a-q079` は sidecar・`.phase1` とも `stem_jp_clean` 不在で 2 件、`2017h29h-q090` は `.phase1` に `stem_jp_clean` 不在で 5 件。q079 は raw が表示源で影響 0。q090 は sidecar 是正済で表示は正だが `.phase1`→sidecar 再 merge が走ると `stem_jp_clean` ごと消える。波 1 MINOR-3 / 波 2 MINOR-5 と同型 → §7 記述訂正 + 再 merge 禁止の再明記。
- **[MINOR-2]** evidence §6 見出し「zh/en の追随 (語義が変わった分のみ)」に cosmetic の `2018h30a-q081` が入っており「4 箇所のみ同期」と矛盾。データ自体は正 (兄弟問 q041/q057 準拠、jp/zh = U+FF0C / en = ASCII ", " を実測)。文言訂正で足りる。
- **[NIT-1]** evidence §6 / fixer ヘッダ「20 論理差分」がどの数え方でも再現できない (17 / 18 / 19〜20)。89 field は一致。定義を 1 行添える。
- **[NIT-2]** evidence §8「残差 1 件」は machdiff では再現不能 (q043 は agent 報告済で patch される)。別手法の旨を明記。reviewer 再構成 machdiff は AGENT_MISSED 0/0/0/0。
- **[NIT-3]** `2017h29h-q090` / `q071` は jp だけ源字形 (“” ‘’ 〔〕) に戻り zh/en は 「」 `[操作]` のまま (⑨-c、波 2 NIT-2 同型)。
- **[NIT-4]** 同 q090 stem で引用符は源字形へ戻す一方 ％ (源は全角) は ASCII のまま (§10 許容表記揺れ登記済)。方針として了解可能。

### 処置 (主 context、S121)
- MINOR-1: §7 に無言 skip 7 件の内訳と「両方に当てる」不成立 (q090) を追記、再 merge 禁止前提を再明記。MINOR-2: §6 見出しを訂正 + 注記。NIT-1: 20 論理差分の定義 (jp 17〜18 + 解説 2) を添付。NIT-2: §8 に照合手法と reviewer 再構成 machdiff 0/0/0/0 を注記。NIT-3/4 は ⑨ 登録。データ変更 0。evidence 文言のみのため復験省略。**波 3 = PASS (処置済)**。

---

## 横断 (3 波共通、⑨ 登録)
1. **raw / `.phase1` の無言 skip** (波 1 q043 `.phase1` / 波 2 q094 raw ×3 / 波 3 q079 ×2・q090 ×5): 出荷源 = clean 層 + sidecar のため学習者影響 0。**再 merge 禁止 (S117 §10a) を継続**、次波 fixer 雛形の sub() に「to が在る」肯定確認を追加 (波 1 NIT-3) して skip を露見させる。
2. **三語間の括弧字種** (波 2 NIT-2 / 波 3 NIT-3、⑨-c): jp のみ源字形、zh/en は `[…]` 「」のまま。保真規則は jp 対源なので正しいが見た目は割れる → ⑨-c で方針決定待ち。
3. **節見出しの改行** (波 2 NIT-3): `〔条件〕` `〔事例〕` が後続本文と同一行、源は独立行 → N5 / 空白系列。
4. **解説と肢の空白表記差** (波 2 NIT-1 q098) / **％ 全角** (波 3 NIT-4) / **figure_description 旧文言** (波 1 NIT-4、quiz 不可視) / **q066 代替段落の全角ラテン** (波 1 NIT-2、N7 同梱)。
5. **VERDICT_CONFLICT 型の実例** = `2017h29a-q020` (両 pass)、`2018h30a-q079` (gp) → U0 で追加した machdiff 検出が有効。

## 総括
| 波 | exam | 是正 | 原寸抽検 | MAJOR | 誤是正 | correct_answer 変更 | 判定 |
|---|---|---|---|---|---|---|---|
| 1 | 2015h27a / 2016h28a | 13 題 | 13/13 + q066 | 0 | 0 | 0 | PASS-with-notes → 処置済 |
| 2 | 2016h28h / 2017h29a | 16 題 (訂正、旧 15) | 16/16 | 0 | 0 | 0 | PASS-with-notes → 処置済 |
| 3 | 2017h29h / 2018h30a | 11 題 (計上 12) | 12/12 | 0 | 0 | 0 | PASS-with-notes → 処置済 |

3 波 462 問 / 是正 40 題 (波 2 訂正で 41 題計上)、reviewer 3 体が **全是正題を原寸で独立実読**、誤是正 0、correct_answer 変更 0。指摘は evidence の計数・記述 (MINOR 11) と ⑨ 級 (NIT 15) のみ、データ修正を要する指摘 0。
