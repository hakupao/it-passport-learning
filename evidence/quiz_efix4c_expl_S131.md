# S131 efix4c — 解説是正 (efull_4 のうち 2019h31h、D-176 / D-177: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_4.json` の 2019h31h の medium 2 題 (q055 / q064)
- script: `scripts/quiz-fidfix-S131-efix4c.mjs` (efix4b と同じ形。subN、dry-run 既定、`--apply`。D-143 note は final に後置し、後置済みかは note の全文で判定)
- correct_answer 変更 0。stem / choices / translations sidecar は不変

## 0. translations sidecar の照合

q055 の stem (工程の列挙。jp と同じ順で、順序の断定は無い) と choices、q064 の stem と choices の zh / en を確認した。解説の誤り (工程順の断定、「完全性・信頼性」) はどちらにも含まれていない → sidecar は変更なし (差分 0)。

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2019h31h-q055 正解・要点 1 | 題幹の列挙順のまま「監査証拠の入手と評価→監査手続の実施」の順で進むと断定している | 題幹は「〜のプロセスに分けられる」と列挙しているだけで、順序は述べていない。実際は監査手続を実施して監査証拠を入手・評価する。同じ解説の誤答肢ア・イも手続→証拠の順を前提にしている | ACCEPT。「計画立案→監査手続の実施 (監査証拠の入手と評価)→報告書→フォローアップ」に改め、正解解説には題幹が順序を述べていないことを添えた (jp / zh / en)。フォローアップ = エは不変 |
| 2 | 2019h31h-q064 要点 2 | 「完全性・信頼性」を 3 要素の一つとして並べている | CIA = 機密性・完全性・可用性。信頼性は RASIS や JIS Q 27000 の追加特性で、完全性とは別の概念。誤り訂正は通信の誤り制御 | ACCEPT。3 要素を正しく挙げ、誤り訂正・暗号化・ウイルス検査をそれぞれ位置づけた (jp / zh / en)。正解アは不変 |

集計: medium 2 題 → **ACCEPT 2 / REJECT 0**。applied 11 = 置換 9 + note 後置 2。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2019h31h-q055 correct

- **jp before**: 正解は「エ フォローアップ」。システム監査は、計画立案→監査証拠の入手と評価→監査手続の実施→監査報告書の作成→フォローアップ、の順で進む。報告書で示した改善提案 (指摘事項) について、被監査部門がそのとおりに対策を実施したかを後日確認し、対応が不十分なら適切な実施を促し指導するのがフォローアップである。つまり「適切な対策の実施を指導する」役割を担うのはこの最終工程であり、エが正しい。
- **jp after**: 正解は「エ フォローアップ」。システム監査は、計画立案→監査手続の実施 (監査証拠の入手と評価)→監査報告書の作成→フォローアップ、の順で進む (題幹は工程を列挙しているだけで、順序は述べていない)。報告書で示した改善提案 (指摘事項) について、被監査部門がそのとおりに対策を実施したかを後日確認し、対応が不十分なら適切な実施を促し指導するのがフォローアップである。つまり「適切な対策の実施を指導する」役割を担うのはこの最終工程であり、エが正しい。

- **zh before**: 正确答案是「エ 跟进」。系统审计按照 制定审计计划→获取与评价审计证据→实施审计程序→编制审计报告书→跟进 的顺序进行。跟进是指：对报告书中提出的改善建议（发现的问题），日后确认被审计部门是否按此实施了对策，若应对不充分则督促并指导其适当实施。也就是说，承担「指导实施适当对策」这一职责的正是这一最终流程，因此エ正确。
- **zh after**: 正确答案是「エ 跟进」。系统审计按照 制定审计计划→实施审计程序（获取与评价审计证据）→编制审计报告书→跟进 的顺序进行（题干只是列举各流程，并未说明顺序）。跟进是指：对报告书中提出的改善建议（发现的问题），日后确认被审计部门是否按此实施了对策，若应对不充分则督促并指导其适当实施。也就是说，承担「指导实施适当对策」这一职责的正是这一最终流程，因此エ正确。

- **en before**: The correct answer is “エ Follow-up.” A systems audit proceeds in the order: drawing up the audit plan → obtaining and evaluating audit evidence → performing audit procedures → preparing the audit report → follow-up. Follow-up means later confirming whether the audited department has implemented the countermeasures for the improvement proposals (findings) presented in the report and, if the response is inadequate, urging and guiding it to carry them out appropriately. In other words, it is this final process that plays the role of “giving guidance on implementing appropriate countermeasures,” so エ is correct.
- **en after**: The correct answer is “エ Follow-up.” A systems audit proceeds in the order: drawing up the audit plan → performing audit procedures (obtaining and evaluating audit evidence) → preparing the audit report → follow-up (the stem only lists the processes and does not state their order). Follow-up means later confirming whether the audited department has implemented the countermeasures for the improvement proposals (findings) presented in the report and, if the response is inadequate, urging and guiding it to carry them out appropriately. In other words, it is this final process that plays the role of “giving guidance on implementing appropriate countermeasures,” so エ is correct.


#### 2019h31h-q055 p:0

- **jp before**: システム監査の流れ: 監査計画の立案→監査証拠の入手と評価→監査手続の実施→監査報告書の作成→フォローアップ。
- **jp after**: システム監査の流れ: 監査計画の立案→監査手続の実施 (監査証拠の入手と評価)→監査報告書の作成→フォローアップ。

- **zh before**: 系统审计的流程：制定审计计划→获取与评价审计证据→实施审计程序→编制审计报告书→跟进。
- **zh after**: 系统审计的流程：制定审计计划→实施审计程序（获取与评价审计证据）→编制审计报告书→跟进。

- **en before**: The flow of a systems audit: drawing up the audit plan → obtaining and evaluating audit evidence → performing audit procedures → preparing the audit report → follow-up.
- **en after**: The flow of a systems audit: drawing up the audit plan → performing audit procedures (obtaining and evaluating audit evidence) → preparing the audit report → follow-up.


#### 2019h31h-q064 p:1

- **jp before**: 情報セキュリティの 3 要素の区別: 可用性 (使い続けられる) / 完全性・信頼性 (正しさ・誤り訂正) / 機密性 (暗号化・アクセス制限)。誤り訂正や暗号化・ウイルス検査は可用性向上策ではない。
- **jp after**: 情報セキュリティの 3 要素は機密性・完全性・可用性。誤り訂正は通信の誤り制御 (伝送の信頼性を高める工夫)、暗号化は機密性、ウイルス検査はマルウェア対策で、いずれも可用性向上策ではない。

- **zh before**: 区分信息安全的三要素：可用性（能够持续使用）／完整性・可靠性（正确性・纠错）／机密性（加密・访问限制）。纠错、加密和病毒检查都不是提高可用性的手段。
- **zh after**: 信息安全的三要素是机密性、完整性、可用性。纠错是通信的差错控制（提高传输可靠性的措施），加密对应机密性，病毒检查是恶意软件对策，都不是提高可用性的手段。

- **en before**: Distinguish the three elements of information security: availability (can keep being used) / integrity and reliability (correctness and error correction) / confidentiality (encryption and access restriction). Error correction, encryption, and virus scanning are not measures for improving availability.
- **en after**: The three elements of information security are confidentiality, integrity, and availability. Error correction is error control in communication (a measure for transmission reliability), encryption serves confidentiality, and virus scanning is a malware countermeasure; none of them is a measure for improving availability.


## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2019h31h` | ✅ applied 11 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 11 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | D-177 により efix4k の後にまとめて 1 回 (efix4k の evidence に記録) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS** (ブロッカー 0)。q055 / q064 とも VERIFIED。dry-run applied 0 / skipped 11、crosscheck `--require-raw` all invariants hold、explanations の差分は 2 題だけ、sidecar の差分 0、correct_answer の差分 0。
- low (参考): §3 の `answer_keys.json` は実体 `data/ip/exams/answer_keys.json` (gitignore)。md5 は一致
- q055 の key_guard 元文の順序断定 (監査 low) は、訂正 note を後置して対応済み
