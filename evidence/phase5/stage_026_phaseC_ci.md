# Stage 2.6 Phase C — 実測 CI（L1再解答 / L2跨字段 / L5数値 / L-ext外部）

> Session 73。D-119 ゲート条件2（critical 欠陥率の点推定 + 95%CI 記録 + ユーザー受容）。
> Rule D: 抽出 general-purpose とは別 lane（L1/L2/L5 = read-only `explore`、adjudication = `code-reviewer`）。

## 方法

- 層化ランダム N=100（seed 20260529、figure 33 / calc 32 オーバーサンプル、29套カバー、既知シード14含む）。
- **L1 再解答**: agent が stem+choices(+図) を独立に解く → answer_keys（IPA公式）と比較。
- **L2 跨字段整合**: stem×choices×answer×figure の語義整合。
- **L5 数値**（calc 30）: 源画像から数字を再読み diff。
- **L-ext 外部交叉**（30）: IPA公式PDF / itpassportsiken.com と交叉核対（審核用・非分発）。
- **Adjudication**: L1/L2 が立てた 19 フラグを `code-reviewer` が源ページ + 公式キーで確認/却下（敵対的検証）。

## 結果

| 指標 | 値 |
|---|---|
| L1 解答不一致（pred≠key, unsure除く） | 3/100 = 3.0%（うち data 欠陥起因のみ critical 計上、残は難問での agent 誤り） |
| **確定 critical 欠陥** | **17/100** |
| 点推定 | **17.0%** |
| **Wilson 95% CI** | **10.9% – 25.5%**（生サンプル、figure+calc オーバーサンプル） |
| 層化後 母集団推定 | **≈12.4%（≈360 題）** |
| **誤答案キー（wrong answer key）** | **0 件**（q073 は公式PDF実読で ア 確認 = answer_keys 正しい。L-ext の ウ は PDF 行ずれ誤読） |

### 確定 critical の内訳（全て stem/choices のテキスト欠陥、キーは正しい）

- **OCR garble（meaning-changing / unsolvable）**: 16 件。例 2026r08-q044（90%→99%）、2019r01a-q082（80億→86億, 020→929）、2009h21a-q062（sky→sy）、2012h24h-q100（B6→86）、2020r02o-q033（表数値全壊）、2011h23tokubetsu-q073（表 garble + CR→C。）など。
- **内容不一致（plausible-but-wrong stem）**: 1 件 `2015h27h-q085`（stored=社員表/部署表 join S0003 / 実際の問85 page-34=調べる表とその順番）。**L1L2 偽陰性**（自己整合的に解けてしまう）→ Phase B + L-ext + 手動源照合で捕捉。

### 重要な知見

1. **answer_keys.json（IPA公式）は信頼できる**（サンプル N=100 で誤り0、S72 修復4件も保持）。クイズの採点機能は健全。
2. **stored stem/choices には系統的 OCR garble が残存**（母集団 ≈12%、≈360題）。Session 68-69 のクリーンアップで取り切れていない。calc/figure/表 問題に集中（fig_or_calc 21.4% vs text 9.1%）。
3. **L1L2 は「自己整合的だが別問題」内容不一致を見逃す**（q085）。確実な検出は **stored stem/choices vs 源ページの直接照合**のみ。
4. L5（数値）は新 critical を追加せず（adjudication と完全重複）→ 数値軸では収束。
5. 副次: 試験ID接尾辞の春/秋規約 = **h=春(haru) / a=秋(aki)**（L-ext が IPA PDF タイトルで確認）。本セッションの L-ext era_label ヒントは逆マッピングで誤り（harness のみ、question_bank に era_label 非保存 = データ欠陥ではない）。表示ラベル付与時に要注意。

## 収束判定

- L1/L2/L5/L-ext の4視点 + adjudication で新 critical 類は「内容不一致(q085)」が L-ext で1件追加されたのみ。OCR garble 類は L1L2+adjudication で飽和、L5 で新規ゼロ。
- ただし **q085 型（plausible-but-wrong）は L1L2 では収束を保証できない** → 母集団の真の critical 率は ≥12%、完全な把握には全量 stored-vs-source 照合が必要。

## 成果物

- `data/ip/exams/.tmp/s026/phaseC/{sample_*,l1l2_results,adj_results,l5_results,lext_results,adjudication}.json`
- `scripts/stage026-phaseC-{sample,ci}.mjs`
