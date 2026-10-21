# S131 efix3 — 解説是正 (efull_3 の medium 25 + efix2 Rule D の low 3)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_3.json` (opus v2 + input_only、medium 25) と、efix2 reviewer の low 3 件
- script: `scripts/quiz-fidfix-S131-efix3.mjs` (efix1 と同じ形: assert-before-replace の subN、dry-run 既定、`--apply`。D-143: final note に後置だけ)
- correct_answer 変更 0。jp の stem / choices は不変 (questions.json の md5 不変)。translations sidecar の変更は 2016h28a-q033 選択肢ア の zh 1 field だけ (sidecar と `.phase1 tr_` の両方に適用、quiz-fidfix-S130-t1 と同じ手順)
- 照合の方法: 週次 quota の都合で検証に必要な範囲だけを読んだ (題幹・選択肢・現行の解説 3 言語)。外部サイトは使っていない。法令の改正時点は条文の内容による (意匠法 2020 年改正、公益通報者保護法 2022 年改正、個人情報保護法 2021 年改正 (2022 年 4 月施行)、刑法 163 条の 2)

## 0. 判断の分かれる点 (Rule D reviewer はここから)

| 題 | 内容 | 判定 / 理由 |
|---|---|---|
| 2015h27a-q082 | efull_3 は efix2 の D-175 より前の本文を監査した (zh の dual / duplex が逆という指摘) | **是正済み (efix2 D-175)**。現行の本文は dual = 双重系统 / duplex = 双工系统 で、指摘は解消している。本 unit では変更なし |
| 2016h28a-q033 | 解説の zh「业务委托方」に加えて、選択肢アの訳 (translations sidecar) にも同じ誤訳がある | 同じ誤訳なので sidecar の選択肢ア zh も「业务受托方」に直した (jp の choices は不変)。直さないと、選択肢と解説で訳語が食い違う |
| 2016h28h-q025 | 学術研究機関の適用除外 (2022 年 4 月施行の改正で外れた) | 出題当時の法律では正しく、正解 (ウ 報道) にも関わらない。そこで削除はせず、要点 1 に時点つきで注記した。正解解説・要点 2 の「学問の自由」は、改正後も学術研究の例外の趣旨として残っているので不変 |
| 2016h28h-q021 | 公益通報者保護法の体制整備義務 | 2022 年施行の改正で 300 人超の事業者に通報対応体制の整備義務がある。ウが誤りなのは、その義務が通報対応の体制に限られ、題幹の「取締役の職務に関するコンプライアンス確保の体制」(会社法の内部統制システム) ではないから。その筋で書き直した。保護対象の拡大 (退職者・役員) は low なので触れていない |
| 2013h25h-q005 / 2014h26h-q049 (efix2 low) | 画面・帳票の工程名 | q049 は正解ア「外部設計では画面や帳票の項目を検討する」。q005 の「開発プロセスの中のシステム要件定義」を「開発プロセス (システム要件定義〜外部設計)」に揃えた。2017h29h-q019 (本 unit) もシステム要件定義 = 開発プロセスで整合する |

## 1. efull_3 medium 25 の判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2015h27a-q027 イ | CSF「単一の分析対象を絞り込む」 | CSF は目標達成の鍵となる要因を通常は少数特定する考え方で、単一に限らない | ACCEPT。「少数の重要要因」(zh / en も「关键的分析对象 / key targets」→ 少数の要因) |
| 2 | 2015h27a-q059 ア・要点 2 | 「許容値（しきい値）」の同一視 | 選択肢アの本文は「照合誤差の許容値」で、許容値を上げると FRR↓・FAR↑ は正しい。しきい値を照合スコアの合格ラインとすると、上げれば FRR↑・FAR↓ で逆になる | ACCEPT。括弧を外し「照合誤差の許容値」(要点 2 は「判定を緩める」と補足) |
| 3 | 2015h27a-q077 要点 2 | OSI 基本参照モデルをプロトコルの例に | OSI 基本参照モデルは 7 階層の参照モデル (枠組み) で、プロトコルではない | ACCEPT。例を TCP/IP、HTTP に |
| 4 | 2015h27a-q082 zh | dual / duplex が逆 | §0 | **是正済み (efix2 D-175)**、本 unit で変更なし |
| 5 | 2015h27h-q021 ア・要点 2 | 意匠権「登録から一定年数」 | 2020 年 4 月施行の改正後は「意匠登録出願の日から 25 年」。改正前は登録から 20 年 | ACCEPT。時点つきで両方を書いた。更新制度が無いという結論は不変 |
| 6 | 2015h27h-q032 ア | 設計 ⇔ プログラミングの往復をアジャイルと同定 | 選択肢アは「オブジェクト指向開発において設計とプログラミングを何度か行き来」。定番の対応はラウンドトリップ | ACCEPT。ラウンドトリップ (反復的な進め方) に。要点の追加はしていない (最小差分) |
| 7 | 2015h27h-q071 イ | 「暗号処理の観点では速度改善の要因にならない」 | 802.11n/ac では WEP / TKIP だと HT / VHT の高速レートが使えないので、WPA2 (CCMP) への変更で速度が上がることはある。イが誤りなのは、原因 (他社の引っ越しと時期が一致する電波干渉) に効かないから | ACCEPT。一般論を外し「本問の原因と考えられる電波干渉には効かない」に限定 |
| 8 | 2016h28a-q012 zh | カンパニー制を「事业部制（Company 制）」 | 事業部制とカンパニー制は別の組織形態。jp は「カンパニー制」 | ACCEPT。「内部公司制（カンパニー制）」(イ・要点 2) |
| 9 | 2016h28a-q033 zh | 委託先を「业务委托方」 | 中国語の委托方は委託する側。監督される側は受托方 | ACCEPT。解説 5 箇所と選択肢アの訳 (§0) |
| 10 | 2016h28a-q067 要点 2 | 保守・点検の削減を「冗長性を減らす施策」に入れている | 保守・点検は予防保全で、冗長化 (構成要素の多重化) とは別 | ACCEPT。回線の統合 (冗長性を捨てる → 単一障害点) と、保守・点検の削減 (予兆の見逃し → 信頼性低下) に分けた |
| 11 | 2016h28h-q021 ウ | 公益通報者保護法に体制整備義務が無いとしている | §0 | ACCEPT |
| 12 | 2016h28h-q025 要点 1 | 学術研究機関を現在形で適用除外に | §0 | ACCEPT (時点の注記) |
| 13 | 2016h28h-q034 イ | タスクフォースは「部門の壁を越えない」+ 題幹に無い「常設」 | タスクフォースは通常、部門横断で組む。正解解説ではネットワーク組織を「必要に応じて連携」としており、「常設的な連携」と食い違う | ACCEPT。違いを、リーダーの下で特定課題に取り組み通常は企業の枠を越えない点、とした |
| 14 | 2016h28h-q086 zh (2 件) | エの係り受け / 正解の「当面」 | 選択肢エは「利用者が実行すると不正な動作をするソフトウェアをダウンロードする」で、zh はダウンローダの意味に読める。アは「社外から電話をかけ」で対面ではない | ACCEPT (2 件とも)。jp・en は正しいので zh だけ |
| 15 | 2017h29a-q008 要点 2 | 系統図・マトリックス図を QC 七つ道具に | 系統図・マトリックス図は新 QC 七つ道具 (N7)。管理図は QC 七つ道具 | ACCEPT。両者を分けた |
| 16 | 2017h29a-q027 ア・ウ・要点 2 | c の罪名「私電磁的記録不正作出」 | カード偽造には刑法 163 条の 2「支払用カード電磁的記録不正作出 (・供用)」がある (161 条の 2 とは別の罪) | ACCEPT (3 field × 3 言語)。key_guard note の同じ記述には訂正を後置 |
| 17 | 2017h29a-q034 エ | 「受注後にベンダが提案書で示す」 | 提案書は RFP を受けて受注前に出すもの | ACCEPT。「RFP を受けてベンダが提案書で示す」 |
| 18 | 2017h29a-q051 zh | 「零部件采购方」 | 采购方は調達する側 (買い手)。調達先は供給者 | ACCEPT。「零部件供应商」 |
| 19 | 2017h29a-q058 zh | 字下げを「退格」 | 退格は Backspace。字下げは缩进 | ACCEPT。ア「进行缩进」、要点 2「缩进（行首缩进排版）」 |
| 20 | 2017h29a-q071 正解 | 生体認証「持っている（being）」 | 生体は something you are。「持っているもの」は所持認証の定義で、同じ解説の要点 1 と自己矛盾 | ACCEPT |
| 21 | 2017h29a-q073 要点 2 | 「差分バックアップ」 | 題幹 (4)「月曜日から木曜日までは，その日に更新されたファイルだけのバックアップを取得する」は前回以降の変更分だけを取る増分バックアップ | ACCEPT。「増分バックアップ」/ 增量备份 / incremental backup |
| 22 | 2017h29a-q099 ア jp | 「WAN を含む a や b」 | 直前の文「a も b も WAN を必要としません」と矛盾。zh / en は正しい | ACCEPT (jp だけ) |
| 23 | 2017h29h-q010 要点 2 | 「意匠法・実用新案法などの産業財産権」はプログラムを保護しない | 特許法 (産業財産権) はプログラムを物の発明として保護対象に含む | ACCEPT。意匠法・実用新案法に限定し、特許法の注記を足した |
| 24 | 2017h29h-q013 ア | 「契約の種類を問わず指名要請は認められない」 | 派遣先が派遣労働者を特定する行為は原則禁止で、紹介予定派遣は例外。a が不適切なのは契約の種類を問わず指名しているから | ACCEPT |
| 25 | 2017h29h-q019 ウ・要点 2 | システム要件定義を要件定義プロセスに | 題幹は 5 プロセス区分 (企画 / 要件定義 / 開発 / 運用 / 保守)。共通フレームでは、要件定義プロセスは業務要件 (利害関係者要件)、システム要件定義は開発プロセス。efix2 の 2013h25h-q005 とも整合 | ACCEPT |

集計: efull_3 medium 25 題 (指摘 26 件) → **ACCEPT 24 / 是正済み 1** (2015h27a-q082、efix2 D-175)、REJECT 0。efix2 low 3 件 → ACCEPT 3。是正した題 27 (efull_3 の 24 + low の 3)。applied 118 = 解説の置換 89 + translations の置換 2 (sidecar・.phase1) + note の後置 27。

範囲外 (low、編集した文の外なので触れていない): 2016h28h-q021 の保護対象 (退職者・役員)、2015h27h-q032 要点へのラウンドトリップの追加、各題の low 指摘。

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

translations sidecar (2016h28a-q033 選択肢ア zh、`.phase1 tr_` も同じ):
- **before**: 为确保个人信息的安全管理得以实现，对业务委托方进行监督。
- **after**: 为确保个人信息的安全管理得以实现，对业务受托方进行监督。

#### 2015h27a-q027 d:イ

- **jp before**: CSF (Critical Success Factor、重要成功要因) は、目標達成のために決定的に重要となる要因を特定する考え方であり、単一の分析対象を絞り込むもの。4つの視点から経営を多面的に評価する手法ではないため誤り。
- **jp after**: CSF (Critical Success Factor、重要成功要因) は、目標達成のために決定的に重要となる要因を特定する考え方であり、目標達成の鍵となる少数の重要要因を絞り込むもの。4つの視点から経営を多面的に評価する手法ではないため誤り。

- **zh before**: CSF（Critical Success Factor，关键成功因素）是一种识别对达成目标起决定性作用的因素的思路，聚焦于确定关键的分析对象。它并非从四个视角对经营进行多方面评价的方法，故错误。
- **zh after**: CSF（Critical Success Factor，关键成功因素）是一种识别对达成目标起决定性作用的因素的思路，聚焦于确定少数关键因素。它并非从四个视角对经营进行多方面评价的方法，故错误。

- **en before**: CSF (Critical Success Factor) is the idea of identifying the factors that are decisively important for achieving a goal; it narrows down to key targets of analysis. It is not a method that evaluates management from multiple angles using four perspectives, so it is incorrect.
- **en after**: CSF (Critical Success Factor) is the idea of identifying the factors that are decisively important for achieving a goal; it narrows down to a small number of key factors. It is not a method that evaluates management from multiple angles using four perspectives, so it is incorrect.


#### 2015h27a-q059 d:ア

- **jp before**: 照合の許容値（しきい値）を大きくすると、本人でなくても一致とみなされやすくなるため、本人拒否率（FRR）は下がる一方で他人受入率（FAR）は上がる。両者は互いに反対方向に動くトレードオフの関係にあり、「ともに小さくなる」ことはないので誤り。
- **jp after**: 照合誤差の許容値を大きくすると、本人でなくても一致とみなされやすくなるため、本人拒否率（FRR）は下がる一方で他人受入率（FAR）は上がる。両者は互いに反対方向に動くトレードオフの関係にあり、「ともに小さくなる」ことはないので誤り。

- **zh before**: 若将比对的容许值（阈值）调大，即使不是本人也更容易被判定为一致，因此拒真率（FRR）会下降，而认假率（FAR）会上升。两者是朝相反方向变化的权衡关系，不会「同时变小」，所以本项错误。
- **zh after**: 若将比对误差的容许值调大，即使不是本人也更容易被判定为一致，因此拒真率（FRR）会下降，而认假率（FAR）会上升。两者是朝相反方向变化的权衡关系，不会「同时变小」，所以本项错误。

- **en before**: If the tolerance value (threshold) for matching is increased, even a person who is not the legitimate one is more easily judged as a match, so the False Rejection Rate (FRR) goes down while the False Acceptance Rate (FAR) goes up. The two form a trade-off that moves in opposite directions, so they can never both become smaller; therefore this option is wrong.
- **en after**: If the tolerance for matching errors is increased, even a person who is not the legitimate one is more easily judged as a match, so the False Rejection Rate (FRR) goes down while the False Acceptance Rate (FAR) goes up. The two form a trade-off that moves in opposite directions, so they can never both become smaller; therefore this option is wrong.


#### 2015h27a-q059 p:1

- **jp before**: 許容値（しきい値）を上げると本人拒否率（FRR）は下がるが他人受入率（FAR）は上がる、というFRRとFARのトレードオフ関係が頻出の考点。
- **jp after**: 照合誤差の許容値を上げる (判定を緩める) と本人拒否率（FRR）は下がるが他人受入率（FAR）は上がる、というFRRとFARのトレードオフ関係が頻出の考点。

- **zh before**: 提高容许值（阈值）会使拒真率（FRR）下降但认假率（FAR）上升，这种 FRR 与 FAR 的权衡关系是高频考点。
- **zh after**: 提高比对误差的容许值（放宽判定）会使拒真率（FRR）下降但认假率（FAR）上升，这种 FRR 与 FAR 的权衡关系是高频考点。

- **en before**: Raising the tolerance value (threshold) lowers the False Rejection Rate (FRR) but raises the False Acceptance Rate (FAR); this trade-off between FRR and FAR is a frequently tested point.
- **en after**: Raising the tolerance for matching errors (loosening the judgment) lowers the False Rejection Rate (FRR) but raises the False Acceptance Rate (FAR); this trade-off between FRR and FAR is a frequently tested point.


#### 2015h27a-q077 p:1

- **jp before**: プロトコルは国際標準（例: OSI基本参照モデル、TCP/IP）とメーカ独自仕様の双方が存在し、正常時だけでなく異常時の手順も含む。
- **jp after**: プロトコルは国際標準（例: TCP/IP、HTTP）とメーカ独自仕様の双方が存在し、正常時だけでなく異常時の手順も含む。

- **zh before**: 协议既有国际标准（例如 OSI 基本参考模型、TCP/IP），也有厂商专有规格，并且不仅包含正常情况下的步骤，也包含异常情况下的步骤。
- **zh after**: 协议既有国际标准（例如 TCP/IP、HTTP），也有厂商专有规格，并且不仅包含正常情况下的步骤，也包含异常情况下的步骤。

- **en before**: Protocols exist both as international standards (e.g., OSI reference model, TCP/IP) and as manufacturers' proprietary specifications, and they include procedures for abnormal conditions, not just normal ones.
- **en after**: Protocols exist both as international standards (e.g., TCP/IP, HTTP) and as manufacturers' proprietary specifications, and they include procedures for abnormal conditions, not just normal ones.


#### 2015h27h-q021 d:ア

- **jp before**: 意匠権は物品のデザイン (形状・模様・色彩など) を保護する権利で、設定登録から一定年数で満了し、更新の制度が無い。デザインという「創作」を一定期間だけ独占させ、その後は社会が自由に利用できるようにする趣旨なので、永続保有はできない。
- **jp after**: 意匠権は物品のデザイン (形状・模様・色彩など) を保護する権利で、存続期間に上限があって満了し (2020 年 4 月施行の改正後は出願から最長 25 年。改正前は登録から 20 年)、更新の制度が無い。デザインという「創作」を一定期間だけ独占させ、その後は社会が自由に利用できるようにする趣旨なので、永続保有はできない。

- **zh before**: 外观设计权是保护物品外观设计（形状、图案、色彩等）的权利，自设定注册起经过一定年数即期满，没有续展制度。其宗旨是让外观设计这一「创作」仅在一定期间内被独占，此后由社会自由利用，因此无法永久持有。
- **zh after**: 外观设计权是保护物品外观设计（形状、图案、色彩等）的权利，存续期间有上限，到期即期满（2020 年 4 月施行的修订后为自申请起最长 25 年，修订前为自注册起 20 年），没有续展制度。其宗旨是让外观设计这一「创作」仅在一定期间内被独占，此后由社会自由利用，因此无法永久持有。

- **en before**: A design right protects the design of an article (its shape, pattern, colors, and so on). It expires a fixed number of years after registration and has no renewal system. Its purpose is to grant exclusivity over a design, which is a creation, only for a limited period, after which society can use it freely, so it cannot be held permanently.
- **en after**: A design right protects the design of an article (its shape, pattern, colors, and so on). Its term has an upper limit after which it expires (since the amendment effective April 2020, up to 25 years from filing; before that, 20 years from registration), and it has no renewal system. Its purpose is to grant exclusivity over a design, which is a creation, only for a limited period, after which society can use it freely, so it cannot be held permanently.


#### 2015h27h-q021 p:1

- **jp before**: 存続期間の目安: 特許権=出願から20年、実用新案権=出願から10年、意匠権=登録から一定年数、商標権=登録から10年 (更新可・回数無制限)。更新の有無が本問の決め手。
- **jp after**: 存続期間の目安: 特許権=出願から20年、実用新案権=出願から10年、意匠権=出願から最長25年 (2020年改正以降。改正前は登録から20年)、商標権=登録から10年 (更新可・回数無制限)。更新の有無が本問の決め手。

- **zh before**: 存续期间的大致标准：专利权=自申请起20年，实用新型权=自申请起10年，外观设计权=自注册起一定年数，商标权=自注册起10年（可续展，次数不限）。能否续展是本题的判定关键。
- **zh after**: 存续期间的大致标准：专利权=自申请起20年，实用新型权=自申请起10年，外观设计权=自申请起最长25年（2020年修订以后，修订前为自注册起20年），商标权=自注册起10年（可续展，次数不限）。能否续展是本题的判定关键。

- **en before**: Rough guide to the terms: patent right = 20 years from filing, utility model right = 10 years from filing, design right = a fixed number of years from registration, trademark right = 10 years from registration (renewable, with no limit on the number of renewals). Whether renewal is possible is the deciding point of this question.
- **en after**: Rough guide to the terms: patent right = 20 years from filing, utility model right = 10 years from filing, design right = up to 25 years from filing (since the 2020 amendment; 20 years from registration before that), trademark right = 10 years from registration (renewable, with no limit on the number of renewals). Whether renewal is possible is the deciding point of this question.


#### 2015h27h-q032 d:ア

- **jp before**: 設計とプログラミングを何度か行き来し、試行錯誤で改良していく手法は、オブジェクト指向開発で用いられる反復型の開発 (アジャイル開発や反復型モデル) の説明です。ウォータフォールモデルは前工程へ戻らず一方向に進むことが前提なので、工程間を何度も往復するという記述は正反対にあたります。
- **jp after**: 設計とプログラミングを何度か行き来し、試行錯誤で改良していく手法は、オブジェクト指向開発におけるラウンドトリップ (設計と実装を往復する反復的な進め方) の説明です。ウォータフォールモデルは前工程へ戻らず一方向に進むことが前提なので、工程間を何度も往復するという記述は正反対にあたります。

- **zh before**: 在设计与编程之间多次往返、通过反复试错进行改良的方法，说的是面向对象开发中所采用的迭代式开发（敏捷开发或迭代模型）。瀑布模型的前提是不返回前一工序、单向地向前推进，因此“在工序之间反复往返”这一表述正好与之相反。
- **zh after**: 在设计与编程之间多次往返、通过反复试错进行改良的方法，说的是面向对象开发中的往返工程（round trip，在设计与实现之间往返的迭代式做法）。瀑布模型的前提是不返回前一工序、单向地向前推进，因此“在工序之间反复往返”这一表述正好与之相反。

- **en before**: A method that moves back and forth between design and programming several times and improves the system through trial and error describes iterative development used in object-oriented development (agile development or an iterative model). The waterfall model is premised on moving in one direction without going back to an earlier stage, so a description of repeatedly going back and forth between stages is the exact opposite.
- **en after**: A method that moves back and forth between design and programming several times and improves the system through trial and error describes round trip in object-oriented development (an iterative way of going back and forth between design and implementation). The waterfall model is premised on moving in one direction without going back to an earlier stage, so a description of repeatedly going back and forth between stages is the exact opposite.


#### 2015h27h-q071 d:イ

- **jp before**: WEPからWPA2への変更は暗号方式を強化するセキュリティ対策で、盗聴や不正接続への耐性は上がりますが、干渉を避ける効果はありません。むしろ暗号処理の観点では速度が改善する要因にはならず、他社の引っ越しという外的要因と時期が一致する説明にもなりません。
- **jp after**: WEPからWPA2への変更は暗号方式を強化するセキュリティ対策で、盗聴や不正接続への耐性は上がりますが、干渉を避ける効果はありません。本問の原因と考えられる電波干渉には効かず、他社の引っ越しという外的要因と時期が一致する説明にもなりません。

- **zh before**: 把加密方式从WEP更改为WPA2是强化加密方式的安全措施，对窃听和非法连接的抵抗力会提高，但没有避免干扰的效果。而且从加密处理的角度看，它也不会成为速度改善的因素，同样无法解释与其他公司搬入这一外部因素在时间上的吻合。
- **zh after**: 把加密方式从WEP更改为WPA2是强化加密方式的安全措施，对窃听和非法连接的抵抗力会提高，但没有避免干扰的效果。它对本题中被认为是原因的电波干扰不起作用，也无法解释与其他公司搬入这一外部因素在时间上的吻合。

- **en before**: Changing from WEP to WPA2 is a security measure that strengthens the encryption method. It improves resistance to eavesdropping and unauthorized connection, but it has no effect in avoiding interference. Moreover, from the viewpoint of encryption processing it is not a factor that improves speed, and it also fails to explain why the timing matches the external event of another company moving in.
- **en after**: Changing from WEP to WPA2 is a security measure that strengthens the encryption method. It improves resistance to eavesdropping and unauthorized connection, but it has no effect in avoiding interference. It does not address the radio interference that is the likely cause in this question, and it also fails to explain why the timing matches the external event of another company moving in.


#### 2016h28a-q012 d:イ

- **jp**: (不変)
- **zh before**: 这是分拆子公司、事业部制（Company 制）的说明。它是一种把企业按业务或按地区拆分、以提高各项事业自主性和决策速度的组织形态，与纳入外部其他公司的 M&A 恰好方向相反（拆分 与 纳入）。
- **zh after**: 这是分拆子公司、内部公司制（カンパニー制）的说明。它是一种把企业按业务或按地区拆分、以提高各项事业自主性和决策速度的组织形态，与纳入外部其他公司的 M&A 恰好方向相反（拆分 与 纳入）。

- **en**: (不変)

#### 2016h28a-q012 p:1

- **jp**: (不変)
- **zh before**: 与易混淆的经营术语区分：价值链分析（对价值链的分析）／分拆子公司、事业部制（拆分业务以提高自主性）／BPR（运用 IT 对业务流程的根本性改革），三者都与 M&A 是不同的概念。
- **zh after**: 与易混淆的经营术语区分：价值链分析（对价值链的分析）／分拆子公司、内部公司制（拆分业务以提高自主性）／BPR（运用 IT 对业务流程的根本性改革），三者都与 M&A 是不同的概念。

- **en**: (不変)

#### 2016h28a-q033 correct

- **jp**: (不変)
- **zh before**: 《个人信息保护法》要求个人信息处理经营者采取「安全管理措施」，以防止其处理的个人数据发生泄露、灭失等情况。作为其中的一环，当将个人数据的处理委托给外部（业务委托方）时，法律明确将「对业务委托方进行监督」规定为义务，即监督业务委托方是否恰当地实施了安全管理措施。因此，选项「ア」「为确保个人信息的安全管理得以实现，对业务委托方进行监督」是正确的。
- **zh after**: 《个人信息保护法》要求个人信息处理经营者采取「安全管理措施」，以防止其处理的个人数据发生泄露、灭失等情况。作为其中的一环，当将个人数据的处理委托给外部（业务受托方）时，法律明确将「对业务受托方进行监督」规定为义务，即监督业务受托方是否恰当地实施了安全管理措施。因此，选项「ア」「为确保个人信息的安全管理得以实现，对业务受托方进行监督」是正确的。

- **en**: (不変)

#### 2016h28a-q033 p:0

- **jp**: (不変)
- **zh before**: 在《个人信息保护法》规定的义务中，「安全管理措施」既包括对从业人员的监督，也包括「对业务委托方的监督」（即使把处理工作委托出去，经营者也不能免除责任）。
- **zh after**: 在《个人信息保护法》规定的义务中，「安全管理措施」既包括对从业人员的监督，也包括「对业务受托方的监督」（即使把处理工作委托出去，经营者也不能免除责任）。

- **en**: (不変)

#### 2016h28a-q067 p:1

- **jp before**: 冗長性を減らす施策 (複数回線を 1 本に統合、保守・点検を削減) は単一障害点を生んだり信頼性を下げたりし、障害耐性を損なう。
- **jp after**: 冗長性を捨てる施策 (複数回線を 1 本に統合) は単一障害点を生み、保守・点検の削減は故障の予兆の見逃しで信頼性を下げる。どちらも障害耐性を損なう。

- **zh before**: 减少冗余性的措施（把多条线路合并为一条、削减维护和检查）会产生单点故障或降低可靠性，从而损害容错能力。
- **zh after**: 放弃冗余性的措施（把多条线路合并为一条）会产生单点故障，削减维护和检查则会因漏看故障征兆而降低可靠性，两者都会损害容错能力。

- **en before**: Measures that reduce redundancy (consolidating multiple lines into one, cutting back on maintenance and inspection) create single points of failure or lower reliability, undermining fault tolerance.
- **en after**: A measure that gives up redundancy (consolidating multiple lines into one) creates a single point of failure, and cutting back on maintenance and inspection lowers reliability because signs of failure are missed; both undermine fault tolerance.


#### 2016h28h-q021 d:ウ

- **jp before**: 公益通報者保護法は、組織の不正を通報した労働者(公益通報者)が解雇などの不利益な扱いを受けないよう保護する法律。通報者の保護が目的であり、会社に体制整備そのものを義務付ける趣旨の法令ではない。
- **jp after**: 公益通報者保護法は、組織の不正を通報した労働者(公益通報者)が解雇などの不利益な扱いを受けないよう保護する法律。2022 年施行の改正で一定規模 (常時使用する労働者 300 人超) の事業者に公益通報に対応する体制の整備が義務付けられたが、それは通報対応の体制に限られ、取締役の職務全般のコンプライアンスを確保する体制 (内部統制システム) を定めるものではない。

- **zh before**: 举报人保护法是保护那些举报了组织不正当行为的劳动者（举报人）免于遭受解雇等不利待遇的法律。其目的在于保护举报人，并不是意在强制要求公司建立健全体制本身的法令。
- **zh after**: 举报人保护法是保护那些举报了组织不正当行为的劳动者（举报人）免于遭受解雇等不利待遇的法律。2022 年施行的修订规定一定规模（常时雇用劳动者超过 300 人）的经营者有义务建立应对公益举报的体制，但这仅限于应对举报的体制，并不规定确保董事职务整体合规的体制（内部控制系统）。

- **en before**: The Whistleblower Protection Act is a law that protects workers who report wrongdoing within an organization (whistleblowers) from being subjected to disadvantageous treatment such as dismissal. Its purpose is to protect whistleblowers, and it is not a law intended to require companies to establish such a system itself.
- **en after**: The Whistleblower Protection Act is a law that protects workers who report wrongdoing within an organization (whistleblowers) from being subjected to disadvantageous treatment such as dismissal. The amendment effective in 2022 requires business operators of a certain size (more than 300 regularly employed workers) to establish a system for handling whistleblowing reports, but that is limited to a report-handling system and does not prescribe a system that ensures compliance in directors' duties as a whole (an internal control system).


#### 2016h28h-q025 p:0

- **jp before**: 個人情報保護法の適用除外：報道機関（報道目的）・著述業・学術研究機関・宗教団体・政治団体が、その本来の活動目的で個人情報を扱う場合は、個人情報取扱事業者の義務の対象外となる。
- **jp after**: 個人情報保護法の適用除外 (出題当時。2022 年 4 月施行の改正で学術研究機関は一律の適用除外から外れ、義務の一部だけが例外になった)：報道機関（報道目的）・著述業・学術研究機関・宗教団体・政治団体が、その本来の活動目的で個人情報を扱う場合は、個人情報取扱事業者の義務の対象外となる。

- **zh before**: 《个人信息保护法》的适用除外：新闻媒体（用于报道目的）、著述业、学术研究机构、宗教团体、政治团体在为其本来的活动目的处理个人信息时，不受个人信息处理经营者义务的约束。
- **zh after**: 《个人信息保护法》的适用除外（出题当时。2022 年 4 月施行的修订把学术研究机构从一律适用除外中移出，只对部分义务例外）：新闻媒体（用于报道目的）、著述业、学术研究机构、宗教团体、政治团体在为其本来的活动目的处理个人信息时，不受个人信息处理经营者义务的约束。

- **en before**: Exemptions under the Act on the Protection of Personal Information: when news organizations (for reporting purposes), authors, academic research institutions, religious organizations, and political organizations handle personal information for their inherent activity purposes, they are exempt from the obligations of a personal information handling business operator.
- **en after**: Exemptions under the Act on the Protection of Personal Information (as of when the question was set; the amendment effective April 2022 removed academic research institutions from the blanket exemption, leaving exceptions only for some obligations): when news organizations (for reporting purposes), authors, academic research institutions, religious organizations, and political organizations handle personal information for their inherent activity purposes, they are exempt from the obligations of a personal information handling business operator.


#### 2016h28h-q034 d:イ

- **jp before**: タスクフォースは、特定の課題を解決するために一時的に編成される少人数の特別チームで、通常は一つの組織・企業の内部に設けられ、目的達成後は解散する。対等・自律や「企業・部門の壁を越える」という常設的な連携の特徴とは異なる。
- **jp after**: タスクフォースは、特定の課題を解決するために一時的に編成される少人数の特別チームで、通常は一つの組織・企業の内部に設けられ、目的達成後は解散する。構成員はリーダーの下で特定の課題に取り組み、通常は企業の枠を越えないので、対等・自律で「企業・部門の壁を越える」というネットワーク組織の特徴とは異なる。

- **zh before**: 任务小组（专项工作组）是为解决特定课题而临时编组的小规模特别团队，通常设在一个组织、企业内部，达成目的后即解散。这与对等、自律以及「跨越企业、部门的壁垒」这种常设性协作的特征不同。
- **zh after**: 任务小组（专项工作组）是为解决特定课题而临时编组的小规模特别团队，通常设在一个组织、企业内部，达成目的后即解散。其成员在领导之下处理特定课题，通常不跨越企业的边界，因此与对等、自律且「跨越企业、部门的壁垒」这种网络组织的特征不同。

- **en before**: A task force is a small special team formed temporarily to solve a specific issue; it is usually set up inside a single organization or company and is disbanded once its goal is achieved. This differs from the characteristics of equality and autonomy and of the permanent cooperation that crosses the boundaries of companies and departments.
- **en after**: A task force is a small special team formed temporarily to solve a specific issue; it is usually set up inside a single organization or company and is disbanded once its goal is achieved. Its members work on a specific issue under a leader and it usually does not cross company boundaries, so it differs from the network organization's characteristics of equality, autonomy, and crossing the boundaries of companies and departments.


#### 2016h28h-q086 d:エ

- **jp**: (不変)
- **zh before**: 一旦运行就会下载进行非法操作的软件，属于植入恶意软件（如特洛伊木马）的手段。这是通过恶意程序发起的攻击，与直接欺骗人来套取信息的社会工程学有所区别。
- **zh after**: 下载一旦被用户运行就会进行非法操作的软件，属于植入恶意软件（如特洛伊木马）的手段。这是通过恶意程序发起的攻击，与直接欺骗人来套取信息的社会工程学有所区别。

- **en**: (不変)

#### 2016h28h-q086 correct

- **jp**: (不変)
- **zh before**: 社会工程学指的是不依靠计算机或网络技术，而是利用人的心理弱点、麻痹大意或信任关系来盗取机密信息的手段。选项ア是从公司外部假装成公司员工（冒充）打电话，在取得对方信任后当面口头套取公司内部的机密信息，正是通过欺骗人来获取信息的典型社会工程学例子。因此ア正确。
- **zh after**: 社会工程学指的是不依靠计算机或网络技术，而是利用人的心理弱点、麻痹大意或信任关系来盗取机密信息的手段。选项ア是从公司外部假装成公司员工（冒充）打电话，在取得对方信任后通过电话口头套取公司内部的机密信息，正是通过欺骗人来获取信息的典型社会工程学例子。因此ア正确。

- **en**: (不変)

#### 2017h29a-q008 p:1

- **jp before**: QC七つ道具の識別: 管理図（工程の安定監視）・系統図（手段の枝分かれ展開）・マトリックス図（行×列の対応整理）と、それぞれの用途・見た目の違いを区別する。
- **jp after**: QC七つ道具の管理図（工程の安定監視）と、新QC七つ道具の系統図（手段の枝分かれ展開）・マトリックス図（行×列の対応整理）を、それぞれの用途・見た目の違いで区別する。

- **zh before**: 区分 QC 七大工具：控制图（监视工序稳定性）、系统图（手段的分枝展开）、矩阵图（行 × 列的对应整理），要分清它们各自的用途和外观差异。
- **zh after**: 区分 QC 七大工具中的控制图（监视工序稳定性）与新 QC 七大工具中的系统图（手段的分枝展开）、矩阵图（行 × 列的对应整理），要分清它们各自的用途和外观差异。

- **en before**: Identifying the QC Seven Tools: distinguish the control chart (monitoring process stability), the tree diagram (branching expansion of means), and the matrix diagram (organizing row × column correspondence) by their respective uses and visual differences.
- **en after**: Distinguish the control chart (monitoring process stability), one of the QC Seven Tools, from the tree diagram (branching expansion of means) and the matrix diagram (organizing row × column correspondence), which belong to the New QC Seven Tools, by their respective uses and visual differences.


#### 2017h29a-q027 d:ア

- **jp before**: a・b・c・d の全てを挙げているが、不正アクセス禁止法の対象は d だけ。a はワンクリック詐欺 (詐欺罪など)、b は迷惑メールで特定電子メール法など、c はクレジットカードの偽造・不正利用 (私電磁的記録不正作出・詐欺など) の問題であり、いずれも不正アクセス禁止法の規制対象ではない。
- **jp after**: a・b・c・d の全てを挙げているが、不正アクセス禁止法の対象は d だけ。a はワンクリック詐欺 (詐欺罪など)、b は迷惑メールで特定電子メール法など、c はクレジットカードの偽造・不正利用 (支払用カード電磁的記録不正作出・詐欺など) の問題であり、いずれも不正アクセス禁止法の規制対象ではない。

- **zh before**: 列出了 a、b、c、d 全部，但《禁止非法访问法》的对象只有 d。a 是一键点击诈骗（诈骗罪等），b 是垃圾邮件、涉及《特定电子邮件法》等，c 是信用卡的伪造与非法使用（私电磁记录非法制作、诈骗等）的问题，这些都不是《禁止非法访问法》的规制对象。
- **zh after**: 列出了 a、b、c、d 全部，但《禁止非法访问法》的对象只有 d。a 是一键点击诈骗（诈骗罪等），b 是垃圾邮件、涉及《特定电子邮件法》等，c 是信用卡的伪造与非法使用（支付用卡电磁记录非法制作、诈骗等）的问题，这些都不是《禁止非法访问法》的规制对象。

- **en before**: This option lists all of a, b, c, and d, but only d falls under the Unauthorized Access Prohibition Act. Act a is one-click fraud (crimes such as fraud), b is spam email covered by laws such as the Specified Commercial Email Act, and c is the counterfeiting and illegal use of a credit card (unauthorized creation of private electromagnetic records, fraud, and the like); none of these are regulated by the Unauthorized Access Prohibition Act.
- **en after**: This option lists all of a, b, c, and d, but only d falls under the Unauthorized Access Prohibition Act. Act a is one-click fraud (crimes such as fraud), b is spam email covered by laws such as the Specified Commercial Email Act, and c is the counterfeiting and illegal use of a credit card (unauthorized creation of electromagnetic records of payment cards, fraud, and the like); none of these are regulated by the Unauthorized Access Prohibition Act.


#### 2017h29a-q027 d:ウ

- **jp before**: c・d を挙げているが、c はクレジットカードの記録情報を読み取って偽造カードを作り不正購入する行為で、アクセス制御された機器への「なりすましログイン」ではない。私電磁的記録不正作出・供用や詐欺などに当たり、不正アクセス禁止法の規制対象ではないため、c を含む点で誤り。
- **jp after**: c・d を挙げているが、c はクレジットカードの記録情報を読み取って偽造カードを作り不正購入する行為で、アクセス制御された機器への「なりすましログイン」ではない。支払用カード電磁的記録不正作出・供用や詐欺などに当たり、不正アクセス禁止法の規制対象ではないため、c を含む点で誤り。

- **zh before**: 列出了 c、d，但 c 是读取信用卡的记录信息制作伪造卡进行非法购买的行为，并不是对经过访问控制的设备的「冒名登录」。它属于私电磁记录非法制作与使用、诈骗等，不是《禁止非法访问法》的规制对象，因此因为包含了 c 而错误。
- **zh after**: 列出了 c、d，但 c 是读取信用卡的记录信息制作伪造卡进行非法购买的行为，并不是对经过访问控制的设备的「冒名登录」。它属于支付用卡电磁记录非法制作与使用、诈骗等，不是《禁止非法访问法》的规制对象，因此因为包含了 c 而错误。

- **en before**: This option lists c and d, but c is the act of reading the recorded information from a credit card to make a counterfeit card and make illegal purchases, not an impersonated login to an access-controlled device. It falls under acts such as unauthorized creation and use of private electromagnetic records and fraud, and is not regulated by the Unauthorized Access Prohibition Act, so it is wrong because it includes c.
- **en after**: This option lists c and d, but c is the act of reading the recorded information from a credit card to make a counterfeit card and make illegal purchases, not an impersonated login to an access-controlled device. It falls under acts such as unauthorized creation and use of electromagnetic records of payment cards and fraud, and is not regulated by the Unauthorized Access Prohibition Act, so it is wrong because it includes c.


#### 2017h29a-q027 p:1

- **jp before**: ワンクリック詐欺 (詐欺)、迷惑メール送信 (特定電子メール法)、クレジットカード偽造・不正利用 (私電磁的記録不正作出・詐欺) は、それぞれ別の法律の対象で不正アクセス禁止法ではないと区別できること。
- **jp after**: ワンクリック詐欺 (詐欺)、迷惑メール送信 (特定電子メール法)、クレジットカード偽造・不正利用 (支払用カード電磁的記録不正作出・詐欺) は、それぞれ別の法律の対象で不正アクセス禁止法ではないと区別できること。

- **zh before**: 一键点击诈骗（诈骗）、发送垃圾邮件（特定电子邮件法）、信用卡伪造与非法使用（私电磁记录非法制作、诈骗）分别是其他法律的对象，要能够区分它们不属于《禁止非法访问法》。
- **zh after**: 一键点击诈骗（诈骗）、发送垃圾邮件（特定电子邮件法）、信用卡伪造与非法使用（支付用卡电磁记录非法制作、诈骗）分别是其他法律的对象，要能够区分它们不属于《禁止非法访问法》。

- **en before**: One-click fraud (fraud), sending spam email (Specified Commercial Email Act), and the counterfeiting and illegal use of credit cards (unauthorized creation of private electromagnetic records, fraud) are each covered by separate laws, and one should be able to distinguish that they are not covered by the Unauthorized Access Prohibition Act.
- **en after**: One-click fraud (fraud), sending spam email (Specified Commercial Email Act), and the counterfeiting and illegal use of credit cards (unauthorized creation of electromagnetic records of payment cards, fraud) are each covered by separate laws, and one should be able to distinguish that they are not covered by the Unauthorized Access Prohibition Act.


#### 2017h29a-q034 d:エ

- **jp before**: プロジェクト体制は、受注後にベンダが提案書で示す要員・分担の構成です。RFP の段階で発注者が最低限記述すべき必須事項ではありません。
- **jp after**: プロジェクト体制は、RFP を受けてベンダが提案書で示す要員・分担の構成です。RFP の段階で発注者が最低限記述すべき必須事項ではありません。

- **zh before**: 项目体制是供应商在接单后于提案书中给出的人员与分工安排，并不是 RFP 阶段发包方至少必须记载的必需事项。
- **zh after**: 项目体制是供应商收到 RFP 后在提案书中给出的人员与分工安排，并不是 RFP 阶段发包方至少必须记载的必需事项。

- **en before**: The project organization structure is the staffing and role allocation the vendor shows in its proposal after winning the order. It is not a mandatory item the client must describe at a minimum at the RFP stage.
- **en after**: The project organization structure is the staffing and role allocation the vendor shows in the proposal it submits in response to the RFP. It is not a mandatory item the client must describe at a minimum at the RFP stage.


#### 2017h29a-q051 d:エ

- **jp**: (不変)
- **zh before**: 通过与零部件采购方共享生产计划来削减产品库存，属于供应链管理（SCM）的措施。它优化的是物流与库存，与管理设施和设备的设施管理不同。
- **zh after**: 通过与零部件供应商共享生产计划来削减产品库存，属于供应链管理（SCM）的措施。它优化的是物流与库存，与管理设施和设备的设施管理不同。

- **en**: (不変)

#### 2017h29a-q058 d:ア

- **jp**: (不変)
- **zh before**: 缩进是一种排版格式功能：在文章或程序代码的行首插入空白进行退格，使层级或结构更易于查看。它并不是通过提示输入候选来减少击键的功能，因此错误。
- **zh after**: 缩进是一种排版格式功能：在文章或程序代码的行首插入空白进行缩进，使层级或结构更易于查看。它并不是通过提示输入候选来减少击键的功能，因此错误。

- **en**: (不変)

#### 2017h29a-q058 p:1

- **jp**: (不変)
- **zh before**: 区分易混淆的相似术语：缩进（退格排版）／自动筛选（数据提取）／超链接（引用跳转）三者的目的都与输入补全不同。
- **zh after**: 区分易混淆的相似术语：缩进（行首缩进排版）／自动筛选（数据提取）／超链接（引用跳转）三者的目的都与输入补全不同。

- **en**: (不変)

#### 2017h29a-q071 correct

- **jp before**: バイオメトリクス認証（生体認証）とは、指紋・顔・虹彩・静脈・声紋など、その人固有の身体的・行動的特徴を読み取って本人確認を行う方式です。アの「本人の指紋で認証する」はまさに指紋という身体的特徴を用いており、生体認証の典型例に該当するため正解です。生体認証は本人自身が「持っている（being）」特徴を使うため、盗まれたり貸し借りされたりしにくいのが特長です。
- **jp after**: バイオメトリクス認証（生体認証）とは、指紋・顔・虹彩・静脈・声紋など、その人固有の身体的・行動的特徴を読み取って本人確認を行う方式です。アの「本人の指紋で認証する」はまさに指紋という身体的特徴を用いており、生体認証の典型例に該当するため正解です。生体認証は本人自身の身体的特徴 (本人そのもの = something you are) を使うため、盗まれたり貸し借りされたりしにくいのが特長です。

- **zh before**: 生物特征认证（生物识别认证）是指读取指纹、面部、虹膜、静脉、声纹等每个人固有的身体特征、行为特征，从而进行本人身份确认的方式。选项ア「用本人的指纹进行认证」正是使用了指纹这一身体特征，属于生物识别认证的典型示例，因此为正确答案。由于生物识别认证使用的是本人自身所「具有（being）」的特征，因此不易被盗用，也难以借出或借用，这正是它的特点。
- **zh after**: 生物特征认证（生物识别认证）是指读取指纹、面部、虹膜、静脉、声纹等每个人固有的身体特征、行为特征，从而进行本人身份确认的方式。选项ア「用本人的指纹进行认证」正是使用了指纹这一身体特征，属于生物识别认证的典型示例，因此为正确答案。由于生物识别认证使用的是本人自身的特征（即“本人是谁”，something you are），因此不易被盗用，也难以借出或借用，这正是它的特点。

- **en before**: Biometric authentication reads a person's own physical or behavioral traits — such as fingerprint, face, iris, vein pattern, or voiceprint — to verify their identity. Option ア, “authenticate using the person's fingerprint,” uses the fingerprint, which is a physical trait, so it is a typical example of biometric authentication and is the correct answer. Because biometric authentication relies on a trait the person themselves “has (being),” such a trait is hard to steal, lend, or share, which is its advantage.
- **en after**: Biometric authentication reads a person's own physical or behavioral traits — such as fingerprint, face, iris, vein pattern, or voiceprint — to verify their identity. Option ア, “authenticate using the person's fingerprint,” uses the fingerprint, which is a physical trait, so it is a typical example of biometric authentication and is the correct answer. Because biometric authentication relies on a trait of who the person is (something you are), such a trait is hard to steal, lend, or share, which is its advantage.


#### 2017h29a-q073 p:1

- **jp before**: 差分バックアップ(月〜木は更新分のみ)とフルバックアップ(金は全件)で対象ファイル数が変わる点を条件どおり読み分けることが要点。
- **jp after**: 増分バックアップ(月〜木は更新分のみ)とフルバックアップ(金は全件)で対象ファイル数が変わる点を条件どおり読み分けることが要点。

- **zh before**: 要点在于按条件区分：差异备份(周一到周四只备份更新的文件)与完全备份(周五备份全部文件)时，目标文件数会发生变化。
- **zh after**: 要点在于按条件区分：增量备份(周一到周四只备份更新的文件)与完全备份(周五备份全部文件)时，目标文件数会发生变化。

- **en before**: The key point is to read the conditions carefully and distinguish that the number of target files changes between a differential backup (Monday to Thursday, only updated files) and a full backup (Friday, all files).
- **en after**: The key point is to read the conditions carefully and distinguish that the number of target files changes between an incremental backup (Monday to Thursday, only updated files) and a full backup (Friday, all files).


#### 2017h29a-q099 d:ア

- **jp before**: 「a, b」ですが、aもbもWANを必要としません。aはサーバルーム内で同一のハブに接続した機器どうしの通信であり、単一の構内で完結するLANだけで済みます。bも大学の同じ構内にあるWebサーバとの通信で、構内LANだけで完結します。WANを含むaやbを挙げている点が誤りです。
- **jp after**: 「a, b」ですが、aもbもWANを必要としません。aはサーバルーム内で同一のハブに接続した機器どうしの通信であり、単一の構内で完結するLANだけで済みます。bも大学の同じ構内にあるWebサーバとの通信で、構内LANだけで完結します。WANを必要としないaやbを挙げている点が誤りです。

- **zh**: (不変)
- **en**: (不変)

#### 2017h29h-q010 p:1

- **jp before**: 意匠法・実用新案法などの産業財産権は物品のデザインや考案を保護対象とし、プログラム自体は保護しない。保護対象の違いを押さえる。
- **jp after**: 意匠法・実用新案法は物品のデザインや考案を保護対象とし、プログラム自体は保護しない (なお、同じ産業財産権でも特許法ではプログラムが「物の発明」として保護され得る)。保護対象の違いを押さえる。

- **zh before**: 外观设计法、实用新型法等工业产权以物品的设计或构思为保护对象，并不保护程序本身。要把握好各自保护对象的区别。
- **zh after**: 外观设计法、实用新型法以物品的设计或构思为保护对象，并不保护程序本身（不过同属工业产权的专利法可以把程序作为“物的发明”加以保护）。要把握好各自保护对象的区别。

- **en before**: Industrial property rights such as the Design Act and the Utility Model Act protect the design or devising of an article and do not protect the program itself. Grasp the difference in what each of them protects.
- **en after**: The Design Act and the Utility Model Act protect the design or devising of an article and do not protect the program itself (although the Patent Act, another industrial property right, can protect a program as an invention of a product). Grasp the difference in what each of them protects.


#### 2017h29h-q013 d:ア

- **jp before**: a と c の組合せ。c は適切だが、a が不適切。a は派遣先が特定の個人を指名して派遣を要請する行為で、派遣先が派遣労働者を特定することを目的とする行為(事前面接や個人指名)は労働者派遣法で禁止されている。契約の種類を問わず指名要請は認められないため、a を含む「ア」は誤り。
- **jp after**: a と c の組合せ。c は適切だが、a が不適切。a は派遣先が特定の個人を指名して派遣を要請する行為で、派遣先が派遣労働者を特定することを目的とする行為(事前面接や個人指名)は労働者派遣法で禁止されている。この特定を目的とする行為は原則禁止で、例外は紹介予定派遣だけである。a は契約の種類を問わず指名しているので不適切で、a を含む「ア」は誤り。

- **zh before**: a 与 c 的组合。c 恰当，但 a 不恰当。a 是用工单位指名要求派遣某个特定的人的行为；用工单位以特定派遣劳动者为目的的行为（事前面试或指名个人）在劳动者派遣法中被禁止。无论合同的种类如何，指名要求都不被允许，因此包含 a 的「ア」是错误的。
- **zh after**: a 与 c 的组合。c 恰当，但 a 不恰当。a 是用工单位指名要求派遣某个特定的人的行为；用工单位以特定派遣劳动者为目的的行为（事前面试或指名个人）在劳动者派遣法中被禁止。这类以特定为目的的行为原则上被禁止，例外只有介绍预定派遣。a 不论合同种类都指名要求，因此不恰当，包含 a 的「ア」是错误的。

- **en before**: The combination of a and c. Action c is appropriate, but a is not. Action a is the client company requesting the dispatch of a specific named individual; an action by the client company aimed at identifying a particular dispatched worker (a pre-employment interview or naming an individual) is prohibited under the Worker Dispatch Act. A naming request is not permitted regardless of the type of contract, so “ア”, which includes a, is wrong.
- **en after**: The combination of a and c. Action c is appropriate, but a is not. Action a is the client company requesting the dispatch of a specific named individual; an action by the client company aimed at identifying a particular dispatched worker (a pre-employment interview or naming an individual) is prohibited under the Worker Dispatch Act. Such actions are prohibited in principle, the only exception being temp-to-perm dispatch; a names an individual regardless of the type of contract, so it is inappropriate, and “ア”, which includes a, is wrong.


#### 2017h29h-q019 d:ウ

- **jp before**: 「業務要件を実現するために必要なシステムの機能・システム構成条件」は、業務要件を受けてシステムに求める仕様を定めるシステム要件定義の内容で、要件定義プロセスに属する。企画段階のシステム化計画より下流の工程である。
- **jp after**: 「業務要件を実現するために必要なシステムの機能・システム構成条件」は、業務要件を受けてシステムに求める仕様を定めるシステム要件定義の内容で、開発プロセスに属する。企画段階のシステム化計画より下流の工程である。

- **zh before**: 「为实现业务需求所必需的系统功能、系统配置条件」是承接业务需求、确定对系统所要求规格的系统需求定义的内容，属于需求定义流程，是比规划阶段的系统化计划更下游的工序。
- **zh after**: 「为实现业务需求所必需的系统功能、系统配置条件」是承接业务需求、确定对系统所要求规格的系统需求定义的内容，属于开发流程，是比规划阶段的系统化计划更下游的工序。

- **en before**: The system functions and system configuration conditions necessary to realize the business requirements are the content of the system requirements definition, which takes the business requirements and fixes the specifications required of the system; it belongs to the requirements definition process, a stage downstream of the planning-stage system planning.
- **en after**: The system functions and system configuration conditions necessary to realize the business requirements are the content of the system requirements definition, which takes the business requirements and fixes the specifications required of the system; it belongs to the development process, a stage downstream of the planning-stage system planning.


#### 2017h29h-q019 p:1

- **jp before**: 各プロセスの成果物の切り分け: 企画=何を作るか/日程/採算、要件定義=業務要件 (業務手順・ルール) とシステム要件 (機能・構成)、運用=移行・教育。
- **jp after**: 各プロセスの成果物の切り分け: 企画=何を作るか/日程/採算、要件定義=業務要件 (業務手順・ルール)、開発 (システム要件定義)=システムの機能・構成、運用=移行・教育。

- **zh before**: 各流程交付物的区分：规划＝做什么／日程／是否划算，需求定义＝业务需求（业务步骤、规则）与系统需求（功能、配置），运行＝迁移、培训。
- **zh after**: 各流程交付物的区分：规划＝做什么／日程／是否划算，需求定义＝业务需求（业务步骤、规则），开发（系统需求定义）＝系统的功能、配置，运行＝迁移、培训。

- **en before**: How the deliverables of each process are divided: planning = what to build / schedule / whether it pays off; requirements definition = business requirements (business procedures, rules) and system requirements (functions, configuration); operation = migration, training.
- **en after**: How the deliverables of each process are divided: planning = what to build / schedule / whether it pays off; requirements definition = business requirements (business procedures, rules); development (system requirements definition) = system functions and configuration; operation = migration, training.


#### 2013h25h-q005 d:ア

- **jp before**: 画面や帳票などのユーザインタフェース要件を確定するのは、要件定義プロセスの後に来る開発プロセスの中のシステム要件定義の作業である。企画段階では、どのような画面を作るかというシステムの具体的な仕様はまだ決めない。
- **jp after**: 画面や帳票などのユーザインタフェース要件を確定するのは、要件定義プロセスの後に来る開発プロセス (システム要件定義〜外部設計) の作業である。企画段階では、どのような画面を作るかというシステムの具体的な仕様はまだ決めない。

- **zh before**: 确定画面、报表等用户界面需求，是需求定义流程之后的开发流程中系统需求定义的工作。在规划阶段，还不会决定要做什么样的画面这类系统的具体规格。
- **zh after**: 确定画面、报表等用户界面需求，是需求定义流程之后的开发流程（系统需求定义～外部设计）的工作。在规划阶段，还不会决定要做什么样的画面这类系统的具体规格。

- **en before**: Finalizing user interface requirements such as screens and report forms is work of system requirements definition within the development process, which comes after the requirements definition process. At the planning stage, the concrete specifications of the system, such as what screens to build, are not yet decided.
- **en after**: Finalizing user interface requirements such as screens and report forms is work of the development process (from system requirements definition to external design), which comes after the requirements definition process. At the planning stage, the concrete specifications of the system, such as what screens to build, are not yet decided.


#### 2013h25h-q005 p:1

- **jp before**: 工程の切り分けを押さえる: 画面/帳票などの具体的な要件確定は開発プロセスのシステム要件定義、関係者の要件合意は要件定義プロセス、RFP 作成とベンダ選定は調達の作業であり、いずれも企画プロセスの作業ではない。
- **jp after**: 工程の切り分けを押さえる: 画面/帳票などの具体的な要件確定は開発プロセス (システム要件定義〜外部設計)、関係者の要件合意は要件定義プロセス、RFP 作成とベンダ選定は調達の作業であり、いずれも企画プロセスの作業ではない。

- **zh before**: 掌握工序的划分：画面/报表等具体需求的确定属于开发流程中的系统需求定义，与相关人员就需求达成一致属于需求定义流程，RFP 的编制和供应商选定属于采购工作，这些都不是规划流程的工作。
- **zh after**: 掌握工序的划分：画面/报表等具体需求的确定属于开发流程（系统需求定义～外部设计），与相关人员就需求达成一致属于需求定义流程，RFP 的编制和供应商选定属于采购工作，这些都不是规划流程的工作。

- **en before**: Grasp the division between the stages: finalizing concrete requirements such as screens and report forms belongs to system requirements definition in the development process, reaching agreement with stakeholders on requirements belongs to the requirements definition process, and creating the RFP and selecting a vendor is procurement work. None of these is work of the planning process.
- **en after**: Grasp the division between the stages: finalizing concrete requirements such as screens and report forms belongs to the development process (from system requirements definition to external design), reaching agreement with stakeholders on requirements belongs to the requirements definition process, and creating the RFP and selecting a vendor is procurement work. None of these is work of the planning process.


#### 2011h23tokubetsu-q092 correct

- **jp before**: 正解はウ。この問題は「原因調査を誰が行うか」と「バグだった場合の修正費用を誰が負担するか」の二点を、保守契約という取決めに照らして判断させるものである。まず調査について。W社は検収と同時にX社と保守契約を結んでいる。X社の提案では、この保守契約の内容は「導入したシステムに関する問合せ，障害の切分けの対応」である。障害の切分け (原因がどこにあるかの特定) をX社に依頼できるのだから、W社が自力で原因を追う必要はなく、開発元であり内部構造を最もよく知るX社へ調査を依頼するのが正しい行動である。次に費用について。調査の結果、原因がX社の開発したシステムのバグだったのであれば、それは「あらかじめ合意した仕様どおりに動作していない」という納入物そのものの欠陥であり、納入者であるX社の責任である。契約条件では X社の開発物の瑕疵担保期間は「検収後 6 か月」で、障害は検収の翌月に発生しているので期間内である。したがって X社は瑕疵担保責任 (現在の民法では契約不適合責任) を負い、無償で修正しなければならない。無償になる根拠はこの瑕疵担保責任であり、保守契約ではない (本問の保守契約の範囲は問合せと障害の切分けで、修正は含まれない)。期間を過ぎてから見つかったバグは、別の取決めがなければ有償になり得る。よって「X社に原因調査を依頼し、X社のバグであれば無償で修正してもらう」とするウが、W社として行うべきことである。
- **jp after**: 正解はウ。この問題は「原因調査を誰が行うか」と「バグだった場合の修正費用を誰が負担するか」の二点を、保守契約と契約条件 (瑕疵担保期間) に照らして判断させるものである。まず調査について。W社は検収と同時にX社と保守契約を結んでいる。X社の提案では、この保守契約の内容は「導入したシステムに関する問合せ，障害の切分けの対応」である。障害の切分け (原因がどこにあるかの特定) をX社に依頼できるのだから、W社が自力で原因を追う必要はなく、開発元であり内部構造を最もよく知るX社へ調査を依頼するのが正しい行動である。次に費用について。調査の結果、原因がX社の開発したシステムのバグだったのであれば、それは「あらかじめ合意した仕様どおりに動作していない」という納入物そのものの欠陥であり、納入者であるX社の責任である。契約条件では X社の開発物の瑕疵担保期間は「検収後 6 か月」で、障害は検収の翌月に発生しているので期間内である。したがって X社は瑕疵担保責任 (現在の民法では契約不適合責任) を負い、無償で修正しなければならない。無償になる根拠はこの瑕疵担保責任であり、保守契約ではない (本問の保守契約の範囲は問合せと障害の切分けで、修正は含まれない)。期間を過ぎてから見つかったバグは、別の取決めがなければ有償になり得る。よって「X社に原因調査を依頼し、X社のバグであれば無償で修正してもらう」とするウが、W社として行うべきことである。

- **zh before**: 正确答案是ウ。本题要求依据维护合同这一约定，判断两点：一是由谁来调查原因，二是如果原因是缺陷，修复费用由谁承担。先看调查。W公司在验收的同时与X公司签订了维护合同。按X公司的提案，这份维护合同的内容是「对所导入系统的咨询以及故障的隔离（判定原因所在）」。既然可以委托X公司进行故障隔离，W公司无需自己去追查原因，委托作为开发方、最了解系统内部结构的X公司进行调查才是正确的做法。再看费用。如果调查结果表明原因是X公司开发的系统的缺陷，那就属于「未按事先约定的规格运行」这一交付物本身的瑕疵，责任在交付方X公司。合同条件规定X公司开发物的瑕疵担保期间为「验收后 6 个月」，而故障发生在验收的次月，处于期间之内。因此X公司要承担瑕疵担保责任（现行民法称合同不符责任），必须免费修复。免费的依据是这一瑕疵担保责任，而不是维护合同（本题维护合同的范围是咨询和故障隔离，不包括修复）。超过期间后才发现的缺陷，如果没有另行约定，可能变成有偿。所以，「委托X公司调查故障原因，如果原因是X公司的缺陷则由其免费修复」的ウ，才是W公司应当采取的做法。
- **zh after**: 正确答案是ウ。本题要求依据维护合同和合同条件（瑕疵担保期间），判断两点：一是由谁来调查原因，二是如果原因是缺陷，修复费用由谁承担。先看调查。W公司在验收的同时与X公司签订了维护合同。按X公司的提案，这份维护合同的内容是「对所导入系统的咨询以及故障的隔离（判定原因所在）」。既然可以委托X公司进行故障隔离，W公司无需自己去追查原因，委托作为开发方、最了解系统内部结构的X公司进行调查才是正确的做法。再看费用。如果调查结果表明原因是X公司开发的系统的缺陷，那就属于「未按事先约定的规格运行」这一交付物本身的瑕疵，责任在交付方X公司。合同条件规定X公司开发物的瑕疵担保期间为「验收后 6 个月」，而故障发生在验收的次月，处于期间之内。因此X公司要承担瑕疵担保责任（现行民法称合同不符责任），必须免费修复。免费的依据是这一瑕疵担保责任，而不是维护合同（本题维护合同的范围是咨询和故障隔离，不包括修复）。超过期间后才发现的缺陷，如果没有另行约定，可能变成有偿。所以，「委托X公司调查故障原因，如果原因是X公司的缺陷则由其免费修复」的ウ，才是W公司应当采取的做法。

- **en before**: The correct answer is ウ. This question asks you to judge two things against the arrangement called a maintenance contract: who investigates the cause, and who bears the repair cost if the cause is a bug. First, the investigation. Company W signed a maintenance contract with Company X at the same time as the acceptance. In Company X's proposal, this maintenance contract covers “inquiries about the installed system and isolating failures” (identifying where the cause lies). Since Company W can ask Company X to isolate the failure, Company W does not need to track down the cause by itself; the correct action is to ask Company X, which developed the system and knows its internal structure best, to investigate. Next, the cost. If the investigation shows that the cause is a bug in the system developed by Company X, that is a defect in the delivered item itself — it does not work according to the specifications agreed in advance — and the responsibility lies with Company X, the supplier. Under the contract terms, the warranty period for defects in Company X's deliverables is six months after acceptance, and the failure occurred in the month after acceptance, so it falls within that period. Company X therefore bears warranty liability for defects (called liability for non-conformity with the contract under the current Civil Code) and must repair it free of charge. The basis for the free repair is this warranty liability, not the maintenance contract (the maintenance contract in this question covers inquiries and failure isolation, not repairs). A bug found after the period has ended may be charged for unless there is a separate agreement. Therefore ウ — ask Company X to investigate the cause of the trouble and, if the cause is a bug of Company X, have it repaired free of charge — is what Company W should do.
- **en after**: The correct answer is ウ. This question asks you to judge two things against the maintenance contract and the contract terms (the warranty period for defects): who investigates the cause, and who bears the repair cost if the cause is a bug. First, the investigation. Company W signed a maintenance contract with Company X at the same time as the acceptance. In Company X's proposal, this maintenance contract covers “inquiries about the installed system and isolating failures” (identifying where the cause lies). Since Company W can ask Company X to isolate the failure, Company W does not need to track down the cause by itself; the correct action is to ask Company X, which developed the system and knows its internal structure best, to investigate. Next, the cost. If the investigation shows that the cause is a bug in the system developed by Company X, that is a defect in the delivered item itself — it does not work according to the specifications agreed in advance — and the responsibility lies with Company X, the supplier. Under the contract terms, the warranty period for defects in Company X's deliverables is six months after acceptance, and the failure occurred in the month after acceptance, so it falls within that period. Company X therefore bears warranty liability for defects (called liability for non-conformity with the contract under the current Civil Code) and must repair it free of charge. The basis for the free repair is this warranty liability, not the maintenance contract (the maintenance contract in this question covers inquiries and failure isolation, not repairs). A bug found after the period has ended may be charged for unless there is a separate agreement. Therefore ウ — ask Company X to investigate the cause of the trouble and, if the cause is a bug of Company X, have it repaired free of charge — is what Company W should do.


#### 2018h30a-q082 p:1

- **jp**: (不変)
- **zh before**: 提升完整性的措施对应「防止篡改与破坏」（数字签名、哈希、通过访问控制限制更新等），而认证对应机密性，双工化与提升可用率对应可用性——要注意区分这三者。
- **zh after**: 提升完整性的措施对应「防止篡改与破坏」（数字签名、哈希、通过访问控制限制更新等），而认证对应机密性，双重化与提升可用率对应可用性——要注意区分这三者。

- **en**: (不変)

## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×9 (2011h23tokubetsu 2013h25h 2015h27a 2015h27h 2016h28a 2016h28h 2017h29a 2017h29h 2018h30a、exam を明示して実行) | ✅ applied 118 |
| 変更範囲 (explanations) | ✅ HEAD との差分を題 id 単位で比べると、変わったのは対象 27 題だけ。トップレベルは同一 = merge の drift 0 |
| 変更範囲 (translations sidecar) | ✅ 2016h28a-q033 の 1 題だけ、差分は選択肢ア zh の 1 行 |
| 冪等: efix3 dry-run 再実行 | ✅ **applied 0 / skipped 118**。efix2 0 / 145、efix1 0 / 76 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold (A1–A7, B1–B7) |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 図ページ常設ゲート GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| `node --check scripts/quiz-fidfix-S131-efix3.mjs` | ✅ |
| tsc / eslint / vitest / build | ✅ exit 0 / 0 errors (既存 warning 1) / 38 passed・1 skipped (39 files)、563 passed・2 skipped / Compiled successfully |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |

Rule B: 失敗した attempt なし (dry-run は 1 回目で 118 操作すべて出現数が一致、apply は 1 回)。
