# S131 efix4e — 解説是正 (efull_4 のうち 2020r02o、D-176 / D-177: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_4.json` の 2020r02o の medium 2 題 (q026 / q039)
- script: `scripts/quiz-fidfix-S131-efix4e.mjs` (efix4d と同じ形)
- correct_answer 変更 0。jp の stem / choices は不変

## 0. translations sidecar の照合

- **q039: 同じ誤訳あり → 直した**。題幹の zh「正在考虑将**响应时间**扩大到24小时」(jp「対応時間を24時間に拡大することを検討している」) を「…将**服务时间**扩大到24小时」に。sidecar と `.phase1 tr_` の両方。en "service hours" は正しい。同じ題幹の「24小时响应」(= 24 時間対応) は応答時間の意味ではないので残した
- q026: 選択肢アの訳は zh「阻燃用品」/ en "flame-retardant products" で、jp「防炎品」どおり → 変更なし

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2020r02o-q026 ア | 「カーテンの不燃化」は選択肢本文の「防炎品に取り替え」と違う | 選択肢アは「カーテンなどの燃えやすいものを防炎品に取り替え」。防炎 (燃えにくい加工) と不燃 (燃えない) は消防法上の別概念で、key_guard note も「防炎品（燃えにくい加工品）」としている | ACCEPT。「カーテンなどの防炎品への取替え」(jp / zh / en)。BCP の目的に直接応えないという結論は不変 |
| 2 | 2020r02o-q039 zh | 「対応時間」を「响应时间」と訳している | 題幹の「対応時間」は受付時間帯 (サービス提供時間)。中国語の响应时间は SLA の応答時間 (問合せから応答までの所要時間) という別指標 | ACCEPT。正解解説・誤答肢イの「响应时间」を「服务时间」に。題幹も (§0) |

集計: medium 2 題 → **ACCEPT 2 / REJECT 0**。applied 9 = 解説の置換 5 + translations の置換 2 (sidecar・.phase1) + note 後置 2。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2020r02o-q026 d:ア

- **jp before**: カーテンの不燃化や防火設備の点検は、火災被害そのものを未然に防ぐ「防災 (被害の抑止)」の施策です。有用ではありますが、本社全壊時に事業をどう継続するかという BCP の目的には直接応えておらず、最も適切とはいえません。
- **jp after**: カーテンなどの防炎品への取替えや防火設備の点検は、火災被害そのものを未然に防ぐ「防災 (被害の抑止)」の施策です。有用ではありますが、本社全壊時に事業をどう継続するかという BCP の目的には直接応えておらず、最も適切とはいえません。

- **zh before**: 把窗帘换成不燃材料、检查消防设备,属于事先防止火灾损害本身的「防灾(抑制损害)」措施。虽然有用,但并未直接回应总部完全损毁时如何持续业务这一 BCP 的目的,不能说是最恰当的。
- **zh after**: 把窗帘等换成阻燃用品、检查消防设备,属于事先防止火灾损害本身的「防灾(抑制损害)」措施。虽然有用,但并未直接回应总部完全损毁时如何持续业务这一 BCP 的目的,不能说是最恰当的。

- **en before**: Making curtains non-flammable and inspecting fire-prevention equipment are measures for 'disaster prevention (loss mitigation)' that keep fire damage itself from happening in the first place. They are useful, but they do not directly answer the BCP's purpose of how to continue business when the head office is completely destroyed, so they cannot be called the most appropriate.
- **en after**: Replacing curtains and similar items with flame-retardant products and inspecting fire-prevention equipment are measures for 'disaster prevention (loss mitigation)' that keep fire damage itself from happening in the first place. They are useful, but they do not directly answer the BCP's purpose of how to continue business when the head office is completely destroyed, so they cannot be called the most appropriate.


#### 2020r02o-q039 correct

- **jp**: (不変)
- **zh before**: SLA（Service Level Agreement，服务级别协议）是服务的提供方与使用方之间，就所提供服务的内容、质量、目标水平进行明文约定并达成一致的文档。本题中，围绕 B公司提供的服务台业务，双方就「将响应时间扩大到24小时、深夜时段由聊天机器人的自动应答进行处理」这一服务水平与 A公司达成约定。这正是关于所提供服务水平的协议，因此作为所用文档，恰当的是 SLA（エ）。
- **zh after**: SLA（Service Level Agreement，服务级别协议）是服务的提供方与使用方之间，就所提供服务的内容、质量、目标水平进行明文约定并达成一致的文档。本题中，围绕 B公司提供的服务台业务，双方就「将服务时间扩大到24小时、深夜时段由聊天机器人的自动应答进行处理」这一服务水平与 A公司达成约定。这正是关于所提供服务水平的协议，因此作为所用文档，恰当的是 SLA（エ）。

- **en**: (不変)

#### 2020r02o-q039 d:イ

- **jp**: (不変)
- **zh before**: NDA（Non-Disclosure Agreement，保密协议）是约定不向第三方披露在业务中获知的机密信息的合同。它并不是规定响应时间等服务水平的协议文档，因此不恰当。
- **zh after**: NDA（Non-Disclosure Agreement，保密协议）是约定不向第三方披露在业务中获知的机密信息的合同。它并不是规定服务时间等服务水平的协议文档，因此不恰当。

- **en**: (不変)

## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2020r02o` | ✅ applied 9 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 9 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | D-177 により efix4k の後にまとめて 1 回 (efix4k の evidence に記録) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS-with-notes** (ブロッカー 0)。q026 / q039 とも VERIFIED。dry-run applied 0 / skipped 9、crosscheck `--require-raw` all invariants hold。差分は explanations が q026 と q039、translations が q039 stem.zh の 1 箇所だけ。correct_answer の差分 0。`.phase1/tr_2020r02o-q039.json` は sidecar と一致 (gitignore)。
- low / info: q039 に round1 が新設された。値は HEAD の key_guard と同一で、merge が最初の note 追記時に保存する既定の動作 (efix4b と同じ)
- low (任意、未修正): sidecar 題幹 zh の後半「24小时响应」は誤訳ではないが、前半の「服务时间」と揃えるなら「24小时服务」にする (sidecar と `.phase1` の両方)
