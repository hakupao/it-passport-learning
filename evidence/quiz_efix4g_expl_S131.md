# S131 efix4g — 解説是正 (efull_5 のうち 2022r04、D-176 / D-177: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_5.json` の 2022r04 の medium 5 題・指摘 6 件 (q022 / q068 / q074 / q084 / q094 ×2)
- script: `scripts/quiz-fidfix-S131-efix4g.mjs` (efix4d と同じ形)
- correct_answer 変更 0。stem / choices / translations sidecar は不変

## 0. translations sidecar の照合

q022 エ・q068 エ・q084 イ・q094 ウ の選択肢の zh / en と、q074 の題幹の zh / en を読んだ。どれも jp の選択肢・題幹どおりで、解説の誤りは含まれていない。q094 ウの訳は「热熔化的墨水」で感熱との混同が無く、q074 の題幹は共連れを正しく定義している → 変更なし (差分 0)。

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2022r04-q022 エ | 「製品ミックス (プロダクトポートフォリオ)」の同一視 | プロダクトミックスは利益最大となる製品の生産・販売量の組合せ (線形計画法など)。PPM は市場成長率 × 占有率で資源配分を判断する手法で、別の概念 | ACCEPT (jp / zh / en) |
| 2 | 2022r04-q068 エ | ANY 接続が存在しないかのように断定している | 選択肢エ「SSID の設定欄を空欄にしておけば，SSID が分からなくても接続できる」は実在する ANY 接続の説明で、ルータ側で拒否していなければつながる。エが誤りなのは、ゲスト SSID の機能ではないから | ACCEPT。ANY 接続の説明であってゲスト SSID ではない、ANY 接続拒否・SSID ステルスで防ぐ対象、に書き直した (jp / zh / en) |
| 3 | 2022r04-q074 正解・要点 1 | 共連れ防止の理由をカードの又貸し (再入室拒否) で説明している | 共連れの同行者はカードを使わずに入るので、カードの再入室拒否は効かない。アンチパスバックが効くのは、共連れで入った者の ID に入室記録が無く、退室 (とその後の入室) が拒否されて発覚するから (IPA: 入室時の認証に用いられなかった ID での退室を許可しない) | ACCEPT。仕組みを書き直し、又貸しは括弧で残した (jp / zh / en)。2021r03-q058 (efix4f) の要点 2 と同じ説明に揃う |
| 4 | 2022r04-q084 イ | 「レーザ光でディスクを回転させ」 | ディスクはモータで回転させ、レーザ光で読み書きする。zh / en では「レーザがディスクを回す」という明確な誤りになっていた | ACCEPT (jp / zh / en) |
| 5 | 2022r04-q094 ウ | 「熱転写（感熱・溶融型）」+ レシートの例 | 感熱 (ダイレクトサーマル) はインクを使わず感熱紙を発色させる方式。熱で溶けるインクを使うのは熱転写だけ。レシートは主に感熱方式 | ACCEPT。「熱転写（溶融型）」とし、レシートは感熱方式と注記した (jp / zh / en) |
| 6 | 2022r04-q094 要点 2 | 「熱転写・感熱（熱でインクを溶かす）」 | 同上 | ACCEPT。熱転写 (インクを溶かす) と感熱 (感熱紙を発色) を分けた (jp / zh / en) |

集計: medium 5 題 (指摘 6 件) → **ACCEPT 6 / REJECT 0**。applied 26 = 置換 21 + note 後置 5。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2022r04-q022 d:エ

- **jp before**: 多種類の製品を扱う企業が利益最大化のために最も効率的・効果的な製造・販売の組合せを決めるのは、製品ミックス (プロダクトポートフォリオ) の最適化に関する説明であり、供給連鎖の情報共有を目的とする SCM とは異なる。
- **jp after**: 多種類の製品を扱う企業が利益最大化のために最も効率的・効果的な製造・販売の組合せを決めるのは、プロダクトミックス (線形計画法などによる最適な生産・販売計画) の最適化に関する説明であり、供給連鎖の情報共有を目的とする SCM とは異なる。

- **zh before**: 经营并销售多种产品的企业为实现利润最大化而决定最高效、最有效的产品制造与销售组合，这是关于产品组合（产品投资组合，product portfolio）优化的说明，与以供应链信息共享为目的的 SCM 不同。
- **zh after**: 经营并销售多种产品的企业为实现利润最大化而决定最高效、最有效的产品制造与销售组合，这是关于产品组合（product mix，用线性规划等求出的最优生产与销售计划）优化的说明，与以供应链信息共享为目的的 SCM 不同。

- **en before**: For a company that handles many kinds of products, deciding the most efficient and effective combination of manufacturing and sales in order to maximize profit describes optimization of the product mix (product portfolio), which differs from SCM, whose purpose is information sharing across the supply chain.
- **en after**: For a company that handles many kinds of products, deciding the most efficient and effective combination of manufacturing and sales in order to maximize profit describes optimization of the product mix (an optimal production and sales plan found with methods such as linear programming), which differs from SCM, whose purpose is information sharing across the supply chain.


#### 2022r04-q068 d:エ

- **jp before**: SSID 欄を空欄にすれば SSID を知らなくてもつながる、というのは誤り。SSID を隠す設定 (SSID ステルス / ブロードキャスト停止) があっても、接続には正しい SSID の入力が必要であり、ゲスト SSID の説明でもない。
- **jp after**: エは ANY 接続 (SSID を空欄や ANY にして周囲のアクセスポイントにつなぐ機能) の説明で、ゲスト SSID の機能ではない。ANY 接続はルータ側で ANY 接続拒否を設定していなければ実際につながるため、セキュリティ上は ANY 接続拒否や SSID ステルスで防ぐ対象である。

- **zh before**: 认为把 SSID 设置栏留空、即使不知道 SSID 也能连上，这是错误的。即使有隐藏 SSID 的设置（SSID 隐藏／停止广播），连接时仍需要输入正确的 SSID，而且这也不是对访客 SSID 的说明。
- **zh after**: エ是 ANY 连接（把 SSID 留空或设为 ANY，连接到周围接入点的功能）的说明，并不是访客 SSID 的功能。只要路由器一侧没有设置拒绝 ANY 连接，ANY 连接实际上是可以连上的，因此在安全上它是要用拒绝 ANY 连接或隐藏 SSID 来防范的对象。

- **en before**: The claim that leaving the SSID setting field blank lets you connect even without knowing the SSID is wrong. Even if there is a setting that hides the SSID (SSID stealth / broadcast suppression), connecting still requires entering the correct SSID, and this is not a description of a guest SSID either.
- **en after**: エ describes ANY connection (a function that connects to nearby access points with the SSID left blank or set to ANY), not the guest SSID function. ANY connection actually works unless the router is set to refuse it, so from a security standpoint it is something to block with ANY-connection refusal or SSID stealth.


#### 2022r04-q074 correct

- **jp before**: 正解はア「アンチパスバック」。アンチパスバックは入退室管理で「入室した ID は退室記録がなければ再び入室できない」「退室した ID でなければ入室できない」という入退場の順序整合を強制する仕組み。これにより、一人が認証して入室したあとに ID カードを外へ又貸ししても、そのカードは既に「入室済み」扱いのため再入室が拒否され、一人の認証で複数人が続けて入る共連れ (ピギーバック) を防止できる。
- **jp after**: 正解はア「アンチパスバック」。アンチパスバックは入退室管理で「入室した ID は退室記録がなければ再び入室できない」「退室した ID でなければ入室できない」という入退場の順序整合を強制する仕組み。一人の認証で複数人が続けて入る共連れ (ピギーバック) で入った者の ID には入室記録が無いので、退室 (とその後の入室) の認証が拒否され、不正な入室が発覚する。これが共連れの検知・抑止になる (入室済みのカードを外へ又貸しして再入室させる行為も、同じ仕組みで拒否される)。

- **zh before**: 正确答案是ア「反潜回（Anti-passback）」。反潜回是出入室管理中强制入场与出场顺序一致的机制：某个 ID 进入后，若没有退出记录就无法再次进入；只有已退出的 ID 才能再次进入。这样一来，即使某人认证进入后把 ID 卡借给外面的人使用，由于该卡已被视为「已进入」状态，再次进入会被拒绝，从而防止一次认证让多人接连进入的尾随（piggyback）。
- **zh after**: 正确答案是ア「反潜回（Anti-passback）」。反潜回是出入室管理中强制入场与出场顺序一致的机制：某个 ID 进入后，若没有退出记录就无法再次进入；只有已退出的 ID 才能再次进入。通过尾随（piggyback，一次认证让多人接连进入）进入的人，其 ID 没有入室记录，因此出室（以及之后的入室）认证会被拒绝，非法入室就会暴露，从而检测和抑制尾随（把已进入的卡借给外面的人再次进入，也会被同一机制拒绝）。

- **en before**: The correct answer is ア, Anti-passback. Anti-passback is a mechanism in entry/exit management that enforces the ordering of entries and exits: an ID that has entered cannot enter again unless there is an exit record, and only an ID that has exited may enter. As a result, even if a person who has authenticated and entered lends their ID card to someone outside, the card is already treated as having entered, so re-entry is refused, which prevents tailgating (piggybacking) where several people enter one after another on a single authentication.
- **en after**: The correct answer is ア, Anti-passback. Anti-passback is a mechanism in entry/exit management that enforces the ordering of entries and exits: an ID that has entered cannot enter again unless there is an exit record, and only an ID that has exited may enter. A person who got in by tailgating (piggybacking, where several people enter one after another on a single authentication) has no entry record on their ID, so their exit (and any later entry) is refused at authentication; this exposes the unauthorized entry and so detects and deters tailgating (lending an already-entered card to someone outside for re-entry is refused by the same mechanism).


#### 2022r04-q074 p:0

- **jp before**: アンチパスバック=入退室記録の順序整合を強制し、入室済み ID の再入室 (カード又貸し) を拒否して共連れ (ピギーバック) を防ぐ物理入退室管理の対策。
- **jp after**: アンチパスバック=入退室記録の順序整合を強制し、入室記録の無い ID の退室を拒否して共連れ (ピギーバック) を検知・抑止する (入室済み ID の再入室も拒否する)物理入退室管理の対策。

- **zh before**: 反潜回（Anti-passback）= 强制出入室记录的顺序一致，拒绝已进入 ID 的再次进入（卡片转借），以防止尾随（piggyback）的物理出入室管理对策。
- **zh after**: 反潜回（Anti-passback）= 强制出入室记录的顺序一致，拒绝没有入室记录的 ID 出室，以检测和抑制尾随（piggyback）（已进入 ID 的再次进入也会被拒绝）的物理出入室管理对策。

- **en before**: Anti-passback = an entry/exit management countermeasure that enforces the ordering of entry/exit records and refuses re-entry by an already-entered ID (card lending), thereby preventing tailgating (piggybacking).
- **en after**: Anti-passback = an entry/exit management countermeasure that enforces the ordering of entry/exit records and refuses exit by an ID with no entry record, thereby detecting and deterring tailgating (piggybacking) (re-entry by an already-entered ID is also refused).


#### 2022r04-q084 d:イ

- **jp before**: DVD は光ディスクの記録媒体で、レーザ光でディスクを回転させ読み書きする。ディスクを回す駆動機構を持つため「物理的な駆動機構をもたない」という条件に反する。
- **jp after**: DVD は光ディスクの記録媒体で、ディスクをモータで回転させ、レーザ光で読み書きする。ディスクを回す駆動機構を持つため「物理的な駆動機構をもたない」という条件に反する。

- **zh before**: DVD 是光盘类存储介质，通过激光旋转盘片来读写。它带有旋转盘片的驱动机构，因此不符合「不具有物理驱动机构」这一条件。
- **zh after**: DVD 是光盘类存储介质，由电机旋转盘片、用激光读写。它带有旋转盘片的驱动机构，因此不符合「不具有物理驱动机构」这一条件。

- **en before**: A DVD is an optical-disc storage medium that is read and written by spinning the disc with a laser beam. Because it has a drive mechanism that rotates the disc, it violates the condition of having no physical drive mechanism.
- **en after**: A DVD is an optical-disc storage medium in which the disc is spun by a motor and read and written with a laser beam. Because it has a drive mechanism that rotates the disc, it violates the condition of having no physical drive mechanism.


#### 2022r04-q094 d:ウ

- **jp before**: 熱で溶けるインクを印字ヘッドで加熱して用紙に転写するのは、熱転写（感熱・溶融型）プリンタの説明です。ラベルやレシートなどで使われる方式で、液体インクを吹き付けるインクジェットとは仕組みが違います。
- **jp after**: 熱で溶けるインクを印字ヘッドで加熱して用紙に転写するのは、熱転写（溶融型）プリンタの説明です。ラベルなどの印字に使われる方式で (レシートで多いのは、インクを使わず感熱紙を発色させる感熱方式)、液体インクを吹き付けるインクジェットとは仕組みが違います。

- **zh before**: 用打印头加热遇热熔化的墨水、将其转印到纸张上的，是热转印（热敏·热熔型）打印机的说明。这是标签、小票等常用的方式，与喷射液态墨水的喷墨在原理上不同。
- **zh after**: 用打印头加热遇热熔化的墨水、将其转印到纸张上的，是热转印（热熔型）打印机的说明。这是标签等常用的方式（小票多用不使用墨水、让热敏纸显色的热敏方式），与喷射液态墨水的喷墨在原理上不同。

- **en before**: Heating heat-melting ink with the print head and transferring it onto the paper describes a thermal-transfer (thermal / meltable-type) printer. It is used for labels, receipts, and the like, and its mechanism differs from the inkjet, which sprays liquid ink.
- **en after**: Heating heat-melting ink with the print head and transferring it onto the paper describes a thermal-transfer (meltable-type) printer. It is used for printing labels and the like (receipts mostly use the direct thermal method, which uses no ink and makes thermal paper change color), and its mechanism differs from the inkjet, which sprays liquid ink.


#### 2022r04-q094 p:1

- **jp before**: 主なプリンタ方式の区別：ドットインパクト（ワイヤでリボンを打つ）／熱転写・感熱（熱でインクを溶かす）／レーザ（トナーを感光体に付着）。
- **jp after**: 主なプリンタ方式の区別：ドットインパクト（ワイヤでリボンを打つ）／熱転写（熱でインクを溶かす）・感熱（感熱紙を熱で発色させる）／レーザ（トナーを感光体に付着）。

- **zh before**: 主要打印机方式的区分：点阵式（用钢针敲击色带）／热转印·热敏（用热熔化墨水）／激光（使墨粉附着在感光体上）。
- **zh after**: 主要打印机方式的区分：点阵式（用钢针敲击色带）／热转印（用热熔化墨水）·热敏（用热使热敏纸显色）／激光（使墨粉附着在感光体上）。

- **en before**: Telling the main printer methods apart: dot-impact (wires strike the ribbon) / thermal-transfer and thermal (heat melts the ink) / laser (toner adheres to the photoconductor).
- **en after**: Telling the main printer methods apart: dot-impact (wires strike the ribbon) / thermal-transfer (heat melts the ink) / direct thermal (heat colors thermal paper) / laser (toner adheres to the photoconductor).


## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2022r04` | ✅ applied 26 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の題だけ (§1)、トップレベルは同一。translations は §0 のとおり |
| 冪等: dry-run 再実行 | ✅ applied 0 / skipped 26 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | D-177 により efix4k の後にまとめて 1 回 (efix4k の evidence に記録) |

Rule B: 失敗した attempt なし。

## 4. Rule D (verifier type、opus、編集なし)

判定 **PASS-with-notes** (medium 6 件すべて解消、ブロッカー 0)。5 題とも VERIFIED。dry-run applied 0 / skipped 26、crosscheck `--require-raw` all invariants hold。差分は 5 題 id だけ。sidecar と questions.json の差分 0。旧誤り文言 11 種は解説本文に残っていない。round1 の新設 4 題 (q022 / q068 / q084 / q094) は merge の既定の動作。
- low (任意、未修正、監査 low のうち残ったもの):
  - q084 イ: 駆動機構を持つのがドライブだとわかるようにする。案 jp「DVD は光ディスクの記録媒体で、読み書きにはディスクをモータで回転させ、レーザ光で読み書きするドライブ (駆動機構) が必要になるため「物理的な駆動機構をもたない」という条件に反する。」
  - q094 イ zh:「复写纸（复印纸）」→「复写纸（多联复写纸）」
  - q022 ウ zh:「价值链（价值连锁）」→「价值链」
  - q068 points[1] の末尾に ANY 接続を追加: jp「、SSID 空欄での接続は ANY 接続。」/ zh「，SSID 留空连接是 ANY 连接。」/ en ", and connecting with a blank SSID is ANY connection."
- info: q068 エの「実際につながる」は、関連付け (アソシエーション) のレベルの話として許容
