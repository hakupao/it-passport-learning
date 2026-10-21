# S131 efix4d — 解説是正 (efull_4 のうち 2019r01a、D-176 / D-177: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_4.json` の 2019r01a の medium 2 題 (q027 / q029)
- script: `scripts/quiz-fidfix-S131-efix4d.mjs` (efix4b と同じ形。TRFIX は題幹 (`"stem"`) にも当てられるよう拡張した)
- correct_answer 変更 0。jp の stem / choices は不変

## 0. translations sidecar の照合

- **q027: 同じ誤訳あり → 直した**。題幹の記述 a の zh「变更个人信息录入业务的**委托方**」(jp「個人情報の入力業務の委託先の変更」) を「…的**受托方**」に。sidecar と `.phase1 tr_` の両方。en "Changing the contractor …" は正しい
  - before: `a 变更个人信息录入业务的委托方`
  - after: `a 变更个人信息录入业务的受托方`
- q029: stem / choices の zh / en は jp どおりで、要点 2 の言い回しの問題は含まれていない → 変更なし

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2019r01a-q027 zh | 委託先 (受託者) を「委托方」と訳している | 中国語の委托方は委託する側 (委託元)。jp は「委託先」= 業務を受ける側。en "contractor" は正しい | ACCEPT。誤答肢ア (2 箇所)・イ・要点 2 の「委托方」を「受托方」に。題幹の記述 a も (§0) |
| 2 | 2019r01a-q029 要点 2 (jp) | 「検索エンジンを最適化する側で使う対策」は SEO の定義を取り違えて読める | SEO で最適化するのは自社 Web サイトの方。zh「优化一方（网站运营者）」/ en "the optimizing side (the site operator)" は運営者側と明示していて正しい | ACCEPT (jp だけ)。「検索エンジンに向けて自社サイトを最適化する、サイト運営者側の対策」 |

集計: medium 2 題 → **ACCEPT 2 / REJECT 0**。applied 8 = 解説の置換 4 + translations の置換 2 (sidecar・.phase1) + note 後置 2。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2019r01a-q027 d:ア

- **jp**: (不変)
- **zh before**: 错在仅列出了 a（变更个人信息录入业务的委托方）。委托方的变更中，委托本身属于不构成向第三方提供的例外情形，因此不要求向本人通知或公布。必需的是 b，而不是 a。
- **zh after**: 错在仅列出了 a（变更个人信息录入业务的受托方）。受托方的变更中，委托本身属于不构成向第三方提供的例外情形，因此不要求向本人通知或公布。必需的是 b，而不是 a。

- **en**: (不変)

#### 2019r01a-q027 d:イ

- **jp**: (不変)
- **zh before**: 错在列出了 a 和 b。b（变更使用目的）需要通知或公布，但 a（变更委托方）没有通知或公布的义务。因为多包含了 a，所以不恰当。
- **zh after**: 错在列出了 a 和 b。b（变更使用目的）需要通知或公布，但 a（变更受托方）没有通知或公布的义务。因为多包含了 a，所以不恰当。

- **en**: (不変)

#### 2019r01a-q027 p:1

- **jp**: (不変)
- **zh before**: 要区分并记住：变更委托方，以及删除不再使用的个人信息，都没有向本人通知或公布的义务。
- **zh after**: 要区分并记住：变更受托方，以及删除不再使用的个人信息，都没有向本人通知或公布的义务。

- **en**: (不変)

#### 2019r01a-q029 p:1

- **jp before**: 「検索エンジンを最適化する側で使う対策」であって、検索エンジン自体を開発したりログ解析したりすることとは区別する。
- **jp after**: 検索エンジンに向けて自社サイトを最適化する、サイト運営者側の対策であって、検索エンジン自体を開発したりログ解析したりすることとは区別する。

- **zh**: (不変)
- **en**: (不変)

## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2019r01a` | ✅ applied 8 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 8 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | D-177 により efix4k の後にまとめて 1 回 (efix4k の evidence に記録) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS-with-notes** (ブロッカー 0)。q027 / q029 とも VERIFIED。dry-run applied 0 / skipped 8、crosscheck `--require-raw` all invariants hold。差分は explanations が q027 と q029、translations が q027 stem.zh の 1 行だけ。correct_answer の差分 0。q027 の「受托方」5 箇所 (sidecar stem a を含む) と法的内容 (27 条 5 項 1 号 / 21 条 3 項 / 22 条) を確認した。
- low: q029 points[1] の zh / en は新しい jp の「検索エンジンに向けて自社サイトを」に当たる部分を訳していない。意味は正しく、今回は未修正。後で揃えるときの案: zh「它是网站运营者一方针对搜索引擎优化本公司网站的对策，要与开发搜索引擎本身或做日志分析区分开来。」/ en "It is a measure taken by the site operator to optimize its own site for search engines, and should be distinguished from developing the search engine itself or performing log analysis."
- info: `.phase1/tr_2019r01a-q027.json` は gitignore の対象。正本は translations sidecar
