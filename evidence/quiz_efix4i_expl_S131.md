# S131 efix4i — 解説是正 (efull_5 のうち 2024r06、D-176 / D-177: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_5.json` の 2024r06: medium 3 題 (q009 / q012 / q055) と key_guard_invalid 1 題 (q097 low)
- script: `scripts/quiz-fidfix-S131-efix4i.mjs` (efix4d と同じ形)
- correct_answer 変更 0。stem / choices / translations sidecar は不変。q097 の key_guard / round1 / suspect は不可触 (D-143)

## 0. translations sidecar の照合

q009 イ (zh「推断习俗、偏好以及…文化的方法」/ en "a method for inferring customs…")、q012 イ (責任分担の記述)、q055 の stem と choices の zh / en を読んだ。どれも jp の選択肢どおりで、手法名・原則名・「完成・運用中」といった解説の誤りは含まれていない → 変更なし (差分 0)。

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2024r06-q009 イ・要点 2 | 観察で文化を類推する手法を「フィールドワーク」と呼んでいる | 選択肢イ「特定の集団と活動を共にしたり，人々の動きを観察したりすることによって，…文化を類推する手法」の標準名称はエスノグラフィ。フィールドワークはそのデータ収集の手段で、意味が広い | ACCEPT。「エスノグラフィ (参与観察やフィールドワークによって集団の文化を理解する手法)」に (jp / zh / en) |
| 2 | 2024r06-q012 イ | 責任の分担を「公平性、説明責任及び透明性の原則」に帰属させている | 「AI の利用がもたらす結果については，問題の特性に応じて，AI の開発・提供・利用に関わった種々の関係者が適切に分担して責任を負うべき」は、人間中心の AI 社会原則 4.1 (1)「人間中心の原則」の本文。ウ (利用者への説明) は公平性・説明責任・透明性、エは教育・リテラシー (同じ解説の記述と整合) | ACCEPT。「人間中心の原則」に (jp / zh / en) |
| 3 | 2024r06-q055 ア | 「監査は完成・運用中のシステムを評価する立場」 | システム監査は企画・開発・運用・保守のライフサイクル全体が対象 (開発中の要件定義の妥当性を含む) | ACCEPT。独立した立場でライフサイクル全体を点検・評価する、要件を決める当事者ではない、に (jp / zh / en) |
| 4 | 2024r06-q097 key_guard (low) | matches_key=true・腐敗なしなのに suspect=true で自己矛盾 | final・round1 とも figure_derivable=false で、suspect はそこから来ている。本問は図の無い概念問で、題幹と選択肢から導出できる (a, b, d = イ、key と一致) | ACCEPT (記録)。説明の note を final に後置した。figure_derivable / suspect の flag は union 則 (D-143 §4/§5) で保持し、書き換えていない |

集計: 4 題 → **ACCEPT 4 / REJECT 0**。applied 16 = 置換 12 + note 後置 4。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2024r06-q009 d:イ

- **jp before**: 特定の集団と活動を共にしたり人々の動きを観察したりして慣習・嗜好・文化を類推する、というのは「フィールドワーク（現地調査）」の説明です。数量を論理的に概算するフェルミ推定とは目的も手法も異なります。
- **jp after**: 特定の集団と活動を共にしたり人々の動きを観察したりして慣習・嗜好・文化を類推する、というのは「エスノグラフィ」(参与観察やフィールドワークによって集団の文化を理解する手法) の説明です。数量を論理的に概算するフェルミ推定とは目的も手法も異なります。

- **zh before**: 通过与特定群体共同参与活动、观察人们的行为来推断习俗、偏好和文化，这是「现场调查（fieldwork）」的说明。它与靠逻辑推算数量的费米推定在目的和方法上都不同。
- **zh after**: 通过与特定群体共同参与活动、观察人们的行为来推断习俗、偏好和文化，这是「民族志（ethnography，通过参与观察、实地调查来理解群体文化的方法）」的说明。它与靠逻辑推算数量的费米推定在目的和方法上都不同。

- **en before**: Participating in activities together with a specific group or observing how people move in order to infer customs, preferences, and culture is the description of fieldwork (a field survey). Both its purpose and its method differ from Fermi estimation, which logically approximates a quantity.
- **en after**: Participating in activities together with a specific group or observing how people move in order to infer customs, preferences, and culture is the description of ethnography (a method of understanding a group's culture through participant observation and fieldwork). Both its purpose and its method differ from Fermi estimation, which logically approximates a quantity.


#### 2024r06-q009 p:1

- **jp before**: 紛らわしい手法の区別: フィールドワーク（観察による文化類推）／回帰分析（データからの因果統計推定）／デルファイ法（専門家アンケート反復による予測の合意形成）。
- **jp after**: 紛らわしい手法の区別: エスノグラフィ（参与観察・フィールドワークによる文化の類推）／回帰分析（データからの因果統計推定）／デルファイ法（専門家アンケート反復による予測の合意形成）。

- **zh before**: 易混淆方法的区分：现场调查（通过观察推断文化）／回归分析（从数据统计推断因果关系）／德尔菲法（通过反复的专家问卷形成预测共识）。
- **zh after**: 易混淆方法的区分：民族志（通过参与观察、实地调查推断文化）／回归分析（从数据统计推断因果关系）／德尔菲法（通过反复的专家问卷形成预测共识）。

- **en before**: Distinguishing the confusable methods: fieldwork (inferring culture through observation) / regression analysis (statistically estimating causation from data) / the Delphi method (forming a forecast consensus through repeated expert questionnaires).
- **en after**: Distinguishing the confusable methods: ethnography (inferring culture through participant observation and fieldwork) / regression analysis (statistically estimating causation from data) / the Delphi method (forming a forecast consensus through repeated expert questionnaires).


#### 2024r06-q012 d:イ

- **jp before**: AIの開発・提供・利用に携わった関係者が問題の特性に応じて責任を分担するという記述で、これは「公平性、説明責任及び透明性の原則」（説明責任・アカウンタビリティ）に関するもの。イノベーションの原則ではない。
- **jp after**: AIの開発・提供・利用に携わった関係者が問題の特性に応じて責任を分担するという記述で、これは「人間中心の原則」(AI の利用は人が判断・決定し、結果の責任は関係者が分担して負う) に関するもの。イノベーションの原則ではない。

- **zh before**: 该描述是说，对于 AI 使用所带来的结果，应根据问题的特性，由参与 AI 开发、提供、使用的相关方分担承担责任，这属于「公平性、问责性及透明性原则」（问责性／accountability）的内容，而非创新原则。
- **zh after**: 该描述是说，对于 AI 使用所带来的结果，应根据问题的特性，由参与 AI 开发、提供、使用的相关方分担承担责任，这属于「以人为本原则」（AI 的使用由人来判断和决定，其结果的责任由相关方分担）的内容，而非创新原则。

- **en before**: This statement says that the parties involved in the development, provision, and use of AI share responsibility for the consequences of AI use according to the nature of the problem; it concerns the “Principle of Fairness, Accountability, and Transparency” (accountability), not the Principle of Innovation.
- **en after**: This statement says that the parties involved in the development, provision, and use of AI share responsibility for the consequences of AI use according to the nature of the problem; it concerns the “Human-Centric Principle” (people judge and decide on the use of AI, and the parties involved share responsibility for its results), not the Principle of Innovation.


#### 2024r06-q055 d:ア

- **jp before**: 「開発すべきシステムの用途を分析しシステム要件を明らかにする」のは、システム開発の上流工程である要件定義（要求分析）の説明であり、監査の目的ではない。監査は完成・運用中のシステムを評価する立場で、要件を決める立場ではない。
- **jp after**: 「開発すべきシステムの用途を分析しシステム要件を明らかにする」のは、システム開発の上流工程である要件定義（要求分析）の説明であり、監査の目的ではない。監査は独立した立場でシステムを (開発中のものを含むライフサイクル全体にわたって) 点検・評価するもので、要件を決める当事者ではない。

- **zh before**: 「分析应开发系统的用途、明确系统需求」是系统开发上游工序中的需求定义（需求分析）的说明，并非审计的目的。审计处于对已完成、运行中的系统进行评估的立场，而不是决定需求的立场。
- **zh after**: 「分析应开发系统的用途、明确系统需求」是系统开发上游工序中的需求定义（需求分析）的说明，并非审计的目的。审计是以独立的立场对系统（包括开发中在内的整个生命周期）进行检查和评价，而不是决定需求的当事方。

- **en before**: “Analyzing the uses of the system to be developed and clarifying the system requirements” describes requirements definition (requirements analysis), an upstream process of system development; it is not the purpose of an audit. An audit is in the position of evaluating a completed or operating system, not of deciding its requirements.
- **en after**: “Analyzing the uses of the system to be developed and clarifying the system requirements” describes requirements definition (requirements analysis), an upstream process of system development; it is not the purpose of an audit. An audit checks and evaluates the system from an independent position (across its whole life cycle, including development), and is not the party that decides its requirements.


## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2024r06` | ✅ applied 16 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 16 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | D-177 により efix4k の後にまとめて 1 回 (efix4k の evidence に記録) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS-with-notes** (ブロッカー 0)。q009 / q012 / q055 は VERIFIED。q097 は flag を保持して note を後置した処置が正しい。D-143 の union 則により、round1 に figure_derivable=false が残る限り suspect は消えない。round1 を書き換えると anti-masking に反する。正解キー イ (a, b, d) は正しい。dry-run applied 0 / skipped 16、crosscheck `--require-raw` all invariants hold。hunk 8 個はすべて対象 4 題の中。translations と questions.json の差分 0。
- low (申し送り): q097 は suspect=true のまま。lead が確認したところ、`apps/web/src` で suspect は `quizModel.ts` の型と読み込みにしか使われておらず、components / app に表示はない。このため学習者への影響はない。merge 側で「has_figure=false の題では figure_derivable=false を suspect の根拠にしない」と例外にするかどうかは、suspect を UI に使うときに改めて検討する
- nit (任意、未修正): q009 イ / q012 イ / q055 ア の jp の補足が半角括弧。周りの全角括弧と揃えるかどうか
