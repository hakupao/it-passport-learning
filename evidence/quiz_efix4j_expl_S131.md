# S131 efix4j — 解説是正 (efull_5 のうち 2025r07、D-176 / D-177: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_5.json` の 2025r07 の medium 3 題 (q023 / q033 / q051)
- script: `scripts/quiz-fidfix-S131-efix4j.mjs` (efix4d と同じ形)
- correct_answer 変更 0。jp の stem / choices は不変

## 0. translations sidecar の照合

- **q023: 同じ誤訳あり → 直した**。題幹の記述 b の zh「引入**执行董事**（执行役员）制度以实现经营与执行的分离」を「引入**执行官**（执行役员）制度…」に (sidecar と `.phase1 tr_` の両方)。en "executive officer system" は正しい
- **q051: 同じ誤訳あり → 直した**。選択肢イの zh「承担财务系统开发的**委托公司**的员工」を「…的**受托公司（外包公司）**的员工」に (sidecar と `.phase1 tr_` の両方)。en "the contractor company" は正しい
- q033: 選択肢イの訳は jp どおりで、レベルの帰属は含まれていない → 変更なし

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2025r07-q023 zh | 執行役員を「执行董事」と訳している | 中国語の执行董事は取締役会の構成員である業務執行取締役 (executive director)。日本の執行役員は取締役ではない業務執行の担当者。「董事会同…执行董事相分离」では董事同士の分離に読める | ACCEPT。「执行官」に (正解解説 2 箇所・誤答肢エ・要点 1、および §0 の題幹) |
| 2 | 2025r07-q033 イ・要点 2 | イを「レベル 5 とレベル 4 の混在」とし、運転装置不要をレベル 5 だけの特徴としている | 限定地域で運転装置の無い車両が無人で走る形態 (無人シャトルなど) はレベル 4「高度運転自動化」の典型で、イは全体としてレベル 4 の記述。正解ア (レベル 3) は不変 | ACCEPT。イをレベル 4 の記述とし、要点 2 のレベル 5 も「領域・条件の限定が無い完全自動運転」に (jp / zh / en) |
| 3 | 2025r07-q051 zh | 委託会社 (開発を請け負った側) を「委托公司」と訳している | 中国語の委托公司は委託する側 (発注者) で、立場が逆に読める | ACCEPT。「受托公司（外包公司）」に (誤答肢イの解説、および §0 の選択肢イ) |

集計: medium 3 題 → **ACCEPT 3 / REJECT 0**。applied 17 = 解説の置換 10 + translations の置換 4 (sidecar 2 + .phase1 2) + note 後置 3。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2025r07-q023 correct

- **jp**: (不変)
- **zh before**: 正确答案是「ウ（b, c）」。公司治理（企业治理）是指对经营者是否按照股东等利益相关者的利益进行恰当经营加以监督和制约的机制。b 的执行董事（执行役员）制度，将负责决策与监督的董事会同负责业务执行的执行董事相分离，能够提升董事会对业务执行的监督职能，因而有助于强化治理。c 的独立性较高的外部董事，能够不受公司内部各种牵连关系的束缚、从客观立场监督经营，是强化治理的代表性举措。因此有效的举措只有 b 和 c，而不多不少地列出这两项的「ウ」即为正确答案。
- **zh after**: 正确答案是「ウ（b, c）」。公司治理（企业治理）是指对经营者是否按照股东等利益相关者的利益进行恰当经营加以监督和制约的机制。b 的执行官（执行役员）制度，将负责决策与监督的董事会同负责业务执行的执行官相分离，能够提升董事会对业务执行的监督职能，因而有助于强化治理。c 的独立性较高的外部董事，能够不受公司内部各种牵连关系的束缚、从客观立场监督经营，是强化治理的代表性举措。因此有效的举措只有 b 和 c，而不多不少地列出这两项的「ウ」即为正确答案。

- **en**: (不変)

#### 2025r07-q023 d:エ

- **jp**: (不変)
- **zh before**: 本项只列出「c」，但 b 通过引入执行董事（执行役员）制度实现经营与执行的分离，同样能提升董事会的监督职能，是强化治理的举措。因缺少有效的 b、不满足「不多不少列出全部」的条件而错误。
- **zh after**: 本项只列出「c」，但 b 通过引入执行官（执行役员）制度实现经营与执行的分离，同样能提升董事会的监督职能，是强化治理的举措。因缺少有效的 b、不满足「不多不少列出全部」的条件而错误。

- **en**: (不変)

#### 2025r07-q023 p:0

- **jp**: (不変)
- **zh before**: 公司治理是对经营者是否按照股东等利益相关者的利益进行经营加以监督和制约的机制，选任外部董事以及实现经营与执行的分离（执行董事／执行役员制度）都是其强化举措。
- **zh after**: 公司治理是对经营者是否按照股东等利益相关者的利益进行经营加以监督和制约的机制，选任外部董事以及实现经营与执行的分离（执行官／执行役员制度）都是其强化举措。

- **en**: (不変)

#### 2025r07-q033 d:イ

- **jp before**: 「ハンドルやペダルなどの運転装置は不要」かつ「自動運転できる地域は限られる」という記述は、より上位のレベルの特徴を混在させたもの。運転装置が一切不要なのは人間の運転を全く前提としないレベル5「完全運転自動化」に相当し、地域・条件が限定されるのはレベル4「高度運転自動化」の特徴である。レベル3は人間の引き継ぎを前提とするため運転装置が必要であり、この記述はレベル3には当てはまらない。
- **jp after**: 「人間が運転する必要がなく運転装置は不要」かつ「自動運転できる地域は限られる」という記述は、限定された地域で運転装置の無い車両が無人で走るレベル4「高度運転自動化」の説明である (運転装置が不要なことはレベル5 だけの特徴ではない)。レベル3は人間の引き継ぎを前提とするため運転装置が必要であり、この記述はレベル3には当てはまらない。

- **zh before**: 「方向盘和踏板等驾驶装置不需要」且「可以自动驾驶的区域有限」这一描述，混合了更高级别的特征。完全不需要驾驶装置对应于完全不以人类驾驶为前提的级别5「完全自动驾驶」，而区域、条件受限则是级别4「高度自动驾驶」的特征。级别3以人类接管为前提，因此需要驾驶装置，该描述并不适用于级别3。
- **zh after**: 「人类无需驾驶、不需要驾驶装置」且「可以自动驾驶的区域有限」这一描述，是在限定区域内由没有驾驶装置的车辆无人行驶的级别4「高度自动驾驶」的说明（不需要驾驶装置并不只是级别5的特征）。级别3以人类接管为前提，因此需要驾驶装置，该描述并不适用于级别3。

- **en before**: The statement that “driving devices such as a steering wheel and pedals are unnecessary” and “the areas where autonomous driving is possible are limited” mixes together features of higher levels. Driving devices being entirely unnecessary corresponds to Level 5, “full driving automation,” which does not assume human driving at all, while having areas and conditions limited is a feature of Level 4, “high driving automation.” Because Level 3 assumes that the human takes over, driving devices are needed, so this statement does not apply to Level 3.
- **en after**: The statement that “the human does not need to drive and driving devices are unnecessary” and “the areas where autonomous driving is possible are limited” describes Level 4, “high driving automation,” in which vehicles without driving devices run unmanned within limited areas (not needing driving devices is not a feature of Level 5 alone). Because Level 3 assumes that the human takes over, driving devices are needed, so this statement does not apply to Level 3.


#### 2025r07-q033 p:1

- **jp before**: 運転の主体が人間かシステムかで大きく二分される (レベル1・2=人間が主体の運転支援、レベル3以上=システムが主体)。レベル1は単一操作の支援、レベル2は操舵+加減速の複合支援、レベル4は限定領域での無人運転、レベル5は運転装置不要の完全自動運転、という違いを区別する。
- **jp after**: 運転の主体が人間かシステムかで大きく二分される (レベル1・2=人間が主体の運転支援、レベル3以上=システムが主体)。レベル1は単一操作の支援、レベル2は操舵+加減速の複合支援、レベル4は限定領域での無人運転、レベル5は領域・条件の限定が無い完全自動運転、という違いを区別する。

- **zh before**: 以驾驶主体是人类还是系统来大致一分为二（级别1、2＝以人类为主体的驾驶辅助，级别3及以上＝以系统为主体）。要区分这些差异：级别1是单项操作的辅助，级别2是转向＋加减速的复合辅助，级别4是限定区域内的无人驾驶，级别5是无需驾驶装置的完全自动驾驶。
- **zh after**: 以驾驶主体是人类还是系统来大致一分为二（级别1、2＝以人类为主体的驾驶辅助，级别3及以上＝以系统为主体）。要区分这些差异：级别1是单项操作的辅助，级别2是转向＋加减速的复合辅助，级别4是限定区域内的无人驾驶，级别5是不限定区域和条件的完全自动驾驶。

- **en before**: Autonomous driving is broadly divided into two by whether the primary driver is the human or the system (Levels 1 and 2 = driver assistance with the human as the primary driver; Level 3 and above = the system as the primary driver). Distinguish these differences: Level 1 assists with a single operation, Level 2 provides combined assistance with steering plus acceleration/deceleration, Level 4 is driverless operation within a limited area, and Level 5 is full autonomous driving that requires no driving devices.
- **en after**: Autonomous driving is broadly divided into two by whether the primary driver is the human or the system (Levels 1 and 2 = driver assistance with the human as the primary driver; Level 3 and above = the system as the primary driver). Distinguish these differences: Level 1 assists with a single operation, Level 2 provides combined assistance with steering plus acceleration/deceleration, Level 4 is driverless operation within a limited area, and Level 5 is full autonomous driving with no limits on area or conditions.


#### 2025r07-q051 d:イ

- **jp**: (不変)
- **zh before**: 承担开发的委托公司的员工，是亲自开发了审计对象系统的当事人，审计自己的开发成果就成了自我审计。由于存在利害关系、无法做出客观评价，因此不适合。
- **zh after**: 承担开发的受托公司（外包公司）的员工，是亲自开发了审计对象系统的当事人，审计自己的开发成果就成了自我审计。由于存在利害关系、无法做出客观评价，因此不适合。

- **en**: (不変)

## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2025r07` | ✅ applied 17 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 17 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | D-177 により efix4k の後にまとめて 1 回 (efix4k の evidence に記録) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS-with-notes** (ブロッカー 0)。q023 / q033 / q051 とも VERIFIED。dry-run applied 0 / skipped 17、crosscheck `--require-raw` all invariants hold。hunk 7 個はすべて対象 3 題の中。sidecar の差分は zh 2 行だけ (en は不変)。`.phase1` と同期済み (gitignore)。執行董事 / 委托 の残りは 0 件 (note の説明文だけ)。
- low (任意、未修正): q033 イ の jp「運転装置の無い車両が無人で走るレベル4」は、運転装置が無いことがレベル 4 の条件のように読める。案: 「…限定された地域であれば運転装置の無い車両でも無人で走行できるレベル4「高度運転自動化」の説明である (運転装置が不要なことはレベル5 だけの特徴ではない)。…」。zh は「即使是没有驾驶装置的车辆也能无人行驶」、en は "in which even vehicles without driving devices can run unmanned"
- low: q023 zh「执行官」は、会社法上の「執行役」の訳とも重なることがある。括弧で「执行役员」を添えて区別しているので現状で可
- low (範囲外): q051 zh「经营者直辖组织」は監査で low
