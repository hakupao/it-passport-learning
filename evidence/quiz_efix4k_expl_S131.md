# S131 efix4k — 解説是正 (efull_5 のうち 2026r08、D-176 / D-177: 1 unit = 1 exam、一括の最後)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_5.json` の 2026r08 の medium 2 題 (q037 / q089)
- script: `scripts/quiz-fidfix-S131-efix4k.mjs` (efix4d と同じ形)
- correct_answer 変更 0。stem / choices / translations sidecar は不変

## 0. translations sidecar の照合

q037 選択肢ウ (zh「根据预计的软件代码行数来估算」/ en "Estimate based on the expected number of lines of software code") と、q089 の選択肢ア〜エ (zh / en とも a・b の語は jp どおり、ウ = a:脆弱性 b:事件 / Incident) を確認した。解説の誤りは含まれていない → 変更なし (差分 0)。

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2026r08-q037 ウ | LOC 法が不向きな理由に「量産的な計算を要する」を挙げている | LOC 法 (プログラムステップ法) は予測行数 × 生産性係数などで出す比較的単純な手法。計画初期に不向きなのは行数そのものを精度よく予測できないから。「量産的な計算」は意味も不明瞭 | ACCEPT。理由を行数の予測の難しさだけにした (jp / zh / en)。類似プロジェクト = エは不変 |
| 2 | 2026r08-q089 ウ | 冒頭「a と b の語が入れ替わっている」は選択肢と合わない | ウは a:脆弱性 b:インシデント で、正解 (a:脅威 b:脆弱性) の a と b を入れ替えた組合せ (a:脆弱性 b:脅威) ではない。解説の後半も b はインシデントと書いている | ACCEPT。「本来 b に入る『脆弱性』が a に置かれている」に (jp / zh / en) |

集計: medium 2 題 → **ACCEPT 2 / REJECT 0**。applied 8 = 置換 6 + note 後置 2。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2026r08-q037 d:ウ

- **jp before**: 予想されるコード行数（LOC）を基に見積もる方法（プログラムステップ法など）は、設計がある程度進んでコード規模を予測できる段階で使う。計画初期では行数自体を精度よく見積もれないうえ、量産的な計算を要するため、短時間での初期概算には不向きである。
- **jp after**: 予想されるコード行数（LOC）を基に見積もる方法（プログラムステップ法など）は、設計がある程度進んでコード規模を予測できる段階で使う。計画初期では行数そのものを精度よく予測できないため、短時間での初期概算には不向きである。

- **zh before**: 以预计的代码行数（LOC）为基础进行估算的方法（如程序步数法）适用于设计已推进到一定程度、能够预测代码规模的阶段。在计划初期，行数本身就难以准确估算，而且还需要进行大量计算，因此不适合在短时间内进行初期概算。
- **zh after**: 以预计的代码行数（LOC）为基础进行估算的方法（如程序步数法）适用于设计已推进到一定程度、能够预测代码规模的阶段。在计划初期，行数本身就难以准确预测，因此不适合在短时间内进行初期概算。

- **en before**: The method of estimating based on the expected number of lines of code (LOC), such as the program-step method, is used at a stage where the design has progressed enough to predict the code size. In the early planning phase the number of lines itself cannot be estimated accurately, and it also requires a large amount of calculation, so it is not suitable for an early rough estimate in a short time.
- **en after**: The method of estimating based on the expected number of lines of code (LOC), such as the program-step method, is used at a stage where the design has progressed enough to predict the code size. In the early planning phase the number of lines itself cannot be predicted accurately, so it is not suitable for an early rough estimate in a short time.


#### 2026r08-q089 d:ウ

- **jp before**: a と b の語が入れ替わっている。「脆弱性」は弱点を意味するため本来 b の定義に当たり、a(原因)には不適。さらに b に置かれた「インシデント」は発生した事象であって「弱点」ではないため、両方とも当てはまらない。
- **jp after**: 本来 b に入る「脆弱性」が a に置かれている。「脆弱性」は弱点を意味するため b の定義に当たり、a(原因)には不適。さらに b に置かれた「インシデント」は発生した事象であって「弱点」ではないため、両方とも当てはまらない。

- **zh before**: a 与 b 的词语颠倒了。「脆弱性」意为弱点，本应对应 b 的定义，用于 a（原因）并不合适。此外放在 b 的「事件」是已经发生的事态，而非「弱点」，因此两者都不符合。
- **zh after**: 本应填入 b 的「脆弱性」被放在了 a。「脆弱性」意为弱点，对应的是 b 的定义，用于 a（原因）并不合适。此外放在 b 的「事件」是已经发生的事态，而非「弱点」，因此两者都不符合。

- **en before**: The words for a and b are swapped. ‘Vulnerability’ means a weakness, so it corresponds to the definition of b and is inappropriate for a (the cause). Furthermore, the ‘incident’ placed in b is an event that has occurred, not a ‘weakness,’ so neither fits.
- **en after**: ‘Vulnerability’, which belongs in b, has been placed in a. ‘Vulnerability’ means a weakness, so it corresponds to the definition of b and is inappropriate for a (the cause). Furthermore, the ‘incident’ placed in b is an event that has occurred, not a ‘weakness,’ so neither fits.


## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2026r08` | ✅ applied 8 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 8 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build (D-177: efix4c〜4k の全体で 1 回、efix4k の適用後に実行) | ✅ tsc exit 0 / eslint 0 errors (既存 warning 1) / vitest 38 passed・1 skipped (39 files)、563 passed・2 skipped / Compiled successfully |
| 冪等 (efix4c〜4k 全 9 script を efix4k の適用後に再実行) | ✅ 全て applied 0 (skipped 11 / 8 / 9 / 14 / 26 / 14 / 16 / 17 / 8) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS-with-notes** (ブロッカー 0)。q037 / q089 とも VERIFIED。dry-run applied 0 / skipped 8、crosscheck `--require-raw` all invariants hold。hunk 4 個はすべて対象 2 題の中。questions / answer_keys / translations の差分 0。誤りの語は本文に残っていない。
- low (任意、未修正、監査 low のうち残ったもの): q089 correct.zh と sidecar stem.zh の語順。「信息资产自身可能损害其价值的弱点」を「可能损害信息资产自身价值的弱点」にする案
- low: q037 ア の「(FP法、選択肢ではFP法を指す)」が冗長
- low: q089 ウ en の引用符とカンマの位置がそろっていない
