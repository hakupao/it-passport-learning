# S131 efix1 — 解説是正 (efull_1 の medium 16 + ecal3 backlog)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_1.json` (opus v2 + input_only、389 題、accurate 380、medium 16 / high 0、key 不一致 0) と `evidence/quiz_expl_ecal3_result_S131.md` の backlog (2026r08-q012 DMM / 2022r04-q037 入退場管理 / key_guard note「key X 不変」の字母誤り 4 題)
- script: `scripts/quiz-fidfix-S131-efix1.mjs` (n9b と同じ形: assert-before-replace の subN、dry-run 既定、`--apply`。D-143: generate_result の final note に後置だけ、round1・既存 note・flag は不可触)
- correct_answer 変更 0。stem / choices / translations sidecar は不変 (変更は `.phase2` の expl_jp_ / expl_tr_ / generate_result final note と、merge で再生成した `explanations/*.json` だけ)
- 照合の方法: 各指摘を題幹・選択肢・現行の解説 3 言語と照らして独立に判定した。外部の解説サイトは参照できなかった (web-fetch の報告が届かず)。判定は題幹・選択肢・用語の定義と数値の再計算に基づく

## 0. REJECT と判断の分かれる点 (Rule D reviewer はここから)

| 題 | 指摘 | 判定 | 理由 |
|---|---|---|---|
| 2009h21a-q086 | zh で dual を「双工系统」、duplex を「双重系统」と訳しており、本土の定訳と逆 | **REJECT (本 unit の範囲外、OQ 候補)** | corpus 内で訳語が割れている。dual = 双重系统: 2009h21h-q073、2014h26a-q053、2016h28h-q075。dual = 双工系统: 2009h21a-q086、2012h24a-q057、2014h26h-q056。さらに本問の **translations sidecar (題幹・選択肢の zh) も「双工系统（dual system）」** なので、解説だけ入れ替えると同じ題の中で題幹と解説の訳語が食い違う。直すなら translations 層を含む corpus 全体の訳語統一で、1 題の解説是正では扱えない。英語併記 (dual / duplex) があるので、概念の取り違えは起きにくい |
| 2010h22a-q033 | 誤答肢ウ (故障部品の交換と確認テスト) はリリース管理に当たるのに、インシデント管理としている | **REJECT (DEBATABLE)** — IPA の源は問題文と解答だけで、選択肢ごとの分類は示していない (外部解説サイトは HTTP 403) | 特定済みの故障の部品を交換し、確認テストをしてサービスを戻すのは、インシデントの解決・復旧作業として説明できる。リリース管理は承認された変更を計画的に本番へ展開するプロセス。題幹の「インシデント管理, 問題管理, リリース管理など」は例示で、各選択肢が 1 プロセスずつに当たることを求めていない。分類の見解の違いで、誤りとは示せない。結論 (ウは問題管理ではない) にも影響しない。外部の過去問解説で「ウ = リリース管理」と確認できた場合は再検討する |
| 2010h22a-q037 | 「パスワードを忘れてログインできない」は ITIL v3 以降はサービス要求 | ACCEPT (削除だけ) | ITIL v2 では含めていたので完全な誤りではないが、現行の枠組みでは区別される。例示の 1 項目を削除し、差し替えの例は足していない |
| 2009h21h-q033 | 要点 2 の (2)「原因と影響範囲を確認したうえで復旧」 | ACCEPT (表現を弱める) | 原因の特定を復旧の前提とする書き方は、インシデント管理 (早期回復、原因究明は問題管理) と合わない。一方、誤答肢イが誤りなのは再起動で証跡が失われ、データ破損を確認せず再開するから (同じ解説の イ の説明)。(2) は「影響範囲の確認と証跡の確保」に改め、イ が誤りという判定の筋は残した。正解解説末尾の「原因究明」の要約は別の文で low なので触れていない |

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2009h21a-q082 ア | 2×10^9 の原因を「M と G の桁の取り違え」 | 100M→100G は 1000 倍で、10^11 × 0.2 = 2×10^10、所要 0.4 秒。2×10^9 になるのは効率 20% を 20 として掛けた場合 (10^8 × 20)。冒頭の「100 分の 1」とも合う | ACCEPT。原因と防ぎ方の 2 文を差し替え (jp / zh / en) |
| 2 | 2009h21a-q082 エ | 「効率はファイル量を割るものではない」は数学的に誤り | 10^9 ÷ 0.2 ÷ 10^6 = 10^9 ÷ (10^6 × 0.2) = 5,000 で同値。例の計算自体は正しく、原因はビット換算の漏れと速度の桁 (10^6) | ACCEPT。最後の 1 文だけを原因の説明に置換 |
| 3 | 2009h21h-q033 要点 2 | (2) 原因確認を復旧の前提にしている | §0 | ACCEPT |
| 4 | 2009h21h-q088 要点 1 | 「障害回復の唯一の情報源」 | 同じ解説の要点 2・誤答肢イが「バックアップ復元 + ログのロールフォワード」と述べており矛盾する | ACCEPT。「障害回復に欠かせない、更新の履歴を持つ情報源」 |
| 5 | 2010h22a-q005 ア・要点 2 | エコファームをエコファーマー (持続農業法の認定農業者の愛称) の制度として定義 | 選択肢は「エコファーム」で、環境に配慮した農業・農場を指す一般語。解説の定義は「制度」と「認定農業者の通称」が混ざり、エコファーマーの説明になっている | ACCEPT。一般語の定義に直し、エコファーマーとは別の語と注記。制度の廃止年などは確認できないため書いていない |
| 6 | 2010h22a-q014 ウ | 2 + 3 + 1 = 6 は部品 A の加工 1 週を黙って落としている | 購買の直列化だけなら 2 + 3 + 1 (A 加工) + 1 (組立) = 7 で、エの経路と同じ。6 になるのは A の加工も落とした場合 | ACCEPT。A の加工の見落としを明記し、直列化だけなら 7 (エ) と付記 |
| 7 | 2010h22a-q033 ウ | リリース管理に当たる | §0 | **REJECT** |
| 8 | 2010h22a-q037 正解 | パスワード忘れはサービス要求 | §0 | ACCEPT (削除) |
| 9 | 2010h22a-q055 エ | 「相手が n 人いると n(n-1)/2 個」 | n(n-1)/2 は n 人が互いに通信する場合の総数。自分から見て相手 n 人なら n 個 | ACCEPT。「n 人が互いに通信するには」 |
| 10 | 2010h22a-q078 正解 | 完全性の括弧に「持出し」 | 持出し防止は機密性。要点 1 の完全性の定義 (正確で勝手に書き換えられていない) とも合わない | ACCEPT。「勝手な書換えを防ぐ」 |
| 11 | 2010h22a-q098 key_guard note | 【S115 裁決】末尾「key ア 不変」、key は イ | questions.json の全 79 commit で q098 = イ、derived_answer も イ (ecal3 backlog と重複) | ACCEPT。訂正 note を後置 |
| 12 | 2010h22h-q025 エ | 「当初の複製もさかのぼって例外の対象外」 | 著作権法第 49 条 1 項 1 号は、第 30 条の目的以外で複製物を頒布・公衆に提示した者を「複製を行つたものとみなす」規定。遡及して違法にする仕組みではない | ACCEPT。第 49 条の形に改めた。アップロード = 公衆送信権 (送信可能化権) 侵害の前文は不変 |
| 13 | 2010h22h-q047 正解 (+ 要点 1) | 「ブラックボックステストではなく」ホワイトボックス | 単体テストでも同値分割・限界値分析などのブラックボックステストを併用する。要点 1「ホワイトボックステストとして実施」も同じ二者択一なので一緒に直した | ACCEPT。ホワイトボックス中心でブラックボックスと併用 |
| 14 | 2011h23tokubetsu-q025 エ | 主活動に「購買」/ procurement / 采购 | Porter の主活動は購買物流 (inbound logistics)・製造・出荷物流・販売/マーケティング・サービス。調達 (procurement) は支援活動 | ACCEPT。購買物流 / inbound logistics / 进货物流 |
| 15 | 2011h23tokubetsu-q027 要点 2 | 「コンティンジェンシープラン (BCP)」で同一視 | BCP (事業継続計画) と緊急時対応計画は別概念。同じ解説の誤答肢ウは並列に書いている | ACCEPT。並列に |
| 16 | 2011h23tokubetsu-q045 エ | 「プロジェクト憲章 (プロジェクト計画書)」 | 憲章は認可・目的を示す立上げ文書、計画書は計画プロセスの成果物で別文書。要点 2 は「プロジェクト憲章」だけで正 | ACCEPT。括弧書きを削除 |
| 17 | 2026r08-q012 イ (+ 要点 1) | DMM を発想支援ツールと説明 | DMM (Diamond Mandala Matrix) は EA (業務・システム最適化) の機能構成図の記述様式。4 様式は DMM = 機能構成図 / DFD = 機能情報関連図 / WFA = 業務流れ図 / E-R 図。要点 1「DMM=発想支援」も同じ誤りで、直さないと題の中で矛盾が残る | ACCEPT。イ と要点 1 を修正。script の事後 assert で 発想支援 / 发想辅助 / ideation の残存 0 |
| 18 | 2022r04-q037 要点 1 | ログイン照合を「入退場管理」の典型例 | 入退場管理は建物・部屋の物理的な入退室管理。zh「管理准入」・en「managing admission」もぼかした訳 | ACCEPT。「利用可否の制御」。事後 assert で 入退場 / 准入 / admission の残存 0 |
| 19–21 | 2010h22a-q028 / q099 / q100 key_guard note | 【S115 裁決】末尾「key ウ / ウ / エ 不変」、key は ア / イ / イ | questions.json の全 79 commit で q028 / q099 / q100 = ア / イ / イ (変更履歴なし)、derived_answer も一致。既訂正の 2010h22a-q093・2009h21h-q098 と同じく転記誤り | ACCEPT。訂正 note を後置 (旧 note は不変) |

集計: efull_1 medium 16 件 → **ACCEPT 14 / REJECT 2** (2009h21a-q086、2010h22a-q033)。ecal3 backlog 6 件 → **ACCEPT 6** (うち 2010h22a-q098 は efull_1 と重複するので、note は 1 本)。是正した題 19 (解説本文 15 題 + note だけ 4 題)、置換 57 + note 後置 19 = applied 76。

D-143 trace note は、解説本文を直した 15 題にも n9b と同じく final の key_guard.note_jp に後置した (MARK `fidfix-S131-efix1`)。flag (suspect / round1) と既存 note は一切書き換えていない。

範囲外 (low、編集した文の外なので触れていない):
- 2009h21h-q033 正解解説末尾「いずれも『速やかな報告』『原因究明』『定めた手順の遵守』という基本を崩している」
- 2010h22a-q033 要点 2 のリリース管理の一般論 (REJECT に伴い不変)
- 2009h21a-q086 の zh 訳語 (§0、corpus 全体の訳語統一は OQ 候補として lead に申し送り)

## 2. 改写前後 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2009h21a-q082 d:ア

- **jp before**: 4秒は正解400秒のちょうど100分の1で、計算過程のどこかで桁を100分の1に取り違えた場合の値です。例えば実効速度を 2×10^7 ビット/秒ではなく 2×10^9 ビット/秒と置く（Mとギガの桁を取り違える）と 8×10^9 ÷ 2×10^9 = 4 秒になります。100Mビット/秒 = 10^8 ビット/秒 という基本の桁を固定してから効率を掛ければ、この取り違えは防げます。
- **jp after**: 4秒は正解400秒のちょうど100分の1で、計算過程のどこかで桁を100分の1に取り違えた場合の値です。例えば伝送効率 20% を 0.2 ではなく 20 のまま掛けると、実効速度が 10^8 × 20 = 2×10^9 ビット/秒 となり、8×10^9 ÷ 2×10^9 = 4 秒になります。効率は 20% = 0.2 と小数に直してから速度に掛ければ、この取り違えは防げます。

- **zh before**: 4 秒正好是正确答案 400 秒的百分之一，是在计算过程中某处把数量级弄错了 100 倍时得到的值。例如把有效速率取成 2×10^9 比特/秒而不是 2×10^7 比特/秒（把 M 和 G 的数量级弄混），就会得到 8×10^9 ÷ 2×10^9 = 4 秒。只要先固定 100M 比特/秒 = 10^8 比特/秒 这个基本数量级，再乘以效率，就能避免这种混淆。
- **zh after**: 4 秒正好是正确答案 400 秒的百分之一，是在计算过程中某处把数量级弄错了 100 倍时得到的值。例如不把传输效率 20% 换成 0.2 而直接按 20 去乘，有效速率就成了 10^8 × 20 = 2×10^9 比特/秒，得到 8×10^9 ÷ 2×10^9 = 4 秒。只要先把效率换成小数（20% = 0.2）再乘到速率上，就能避免这种混淆。

- **en before**: 4 seconds is exactly one hundredth of the correct 400 seconds; it is the value you get when the order of magnitude is mistaken by a factor of 100 somewhere in the calculation. For example, if you take the effective speed as 2×10^9 bit/s instead of 2×10^7 bit/s (confusing the M and G orders of magnitude), you get 8×10^9 ÷ 2×10^9 = 4 seconds. Fixing the basic order of magnitude first, 100 Mbit/s = 10^8 bit/s, and only then multiplying by the efficiency prevents this mistake.
- **en after**: 4 seconds is exactly one hundredth of the correct 400 seconds; it is the value you get when the order of magnitude is mistaken by a factor of 100 somewhere in the calculation. For example, if you multiply by the 20% efficiency as 20 instead of 0.2, the effective speed becomes 10^8 × 20 = 2×10^9 bit/s, and you get 8×10^9 ÷ 2×10^9 = 4 seconds. Converting the efficiency to a decimal first (20% = 0.2) and only then multiplying the speed by it prevents this mistake.


#### 2009h21a-q082 d:エ

- **jp before**: 5,000秒は正解400秒より1桁以上大きく、実効速度を過小に見積もった場合の値です。例えばビット換算をせずファイル量 10^9 バイトを効率20%で割って 5×10^9 とし、さらに速度を 10^8 ではなく 10^6 ビット/秒 と桁を誤ると 5×10^9 ÷ 10^6 = 5,000 秒 になります。効率20%は速度に「掛ける」ものであり、ファイル量を割るものではない点に注意が必要です。
- **jp after**: 5,000秒は正解400秒より1桁以上大きく、実効速度を過小に見積もった場合の値です。例えばビット換算をせずファイル量 10^9 バイトを効率20%で割って 5×10^9 とし、さらに速度を 10^8 ではなく 10^6 ビット/秒 と桁を誤ると 5×10^9 ÷ 10^6 = 5,000 秒 になります。ファイル量を効率で割っても速度に効率を掛けても結果は同じ (10^9 ÷ 0.2 ÷ 10^6 = 10^9 ÷ (10^6 × 0.2)) なので、この値の原因はビット換算の漏れと、速度の桁を 10^8 ではなく 10^6 とした誤りです。

- **zh before**: 5,000 秒比正确答案 400 秒大了一个数量级以上，是把有效速率估得过低时得到的值。例如不做比特换算，用效率 20% 去除文件大小 10^9 字节得到 5×10^9，又把速率的数量级误当成 10^6 比特/秒而不是 10^8，就会得到 5×10^9 ÷ 10^6 = 5,000 秒。需要注意的是，20% 的效率是要“乘”到速率上的，而不是用来除文件大小的。
- **zh after**: 5,000 秒比正确答案 400 秒大了一个数量级以上，是把有效速率估得过低时得到的值。例如不做比特换算，用效率 20% 去除文件大小 10^9 字节得到 5×10^9，又把速率的数量级误当成 10^6 比特/秒而不是 10^8，就会得到 5×10^9 ÷ 10^6 = 5,000 秒。用效率去除文件大小与把效率乘到速率上结果相同（10^9 ÷ 0.2 ÷ 10^6 = 10^9 ÷ (10^6 × 0.2)），所以得到这个值的原因是漏掉了比特换算，以及把速率的数量级误当成 10^6 而不是 10^8。

- **en before**: 5,000 seconds is more than an order of magnitude larger than the correct 400 seconds; it is the value you get when the effective speed is underestimated. For example, if you skip the bit conversion and divide the file size 10^9 bytes by the 20% efficiency to get 5×10^9, and also mistake the speed as 10^6 bit/s instead of 10^8, you get 5×10^9 ÷ 10^6 = 5,000 seconds. Note that the 20% efficiency is something you multiply the speed by, not something you divide the file size by.
- **en after**: 5,000 seconds is more than an order of magnitude larger than the correct 400 seconds; it is the value you get when the effective speed is underestimated. For example, if you skip the bit conversion and divide the file size 10^9 bytes by the 20% efficiency to get 5×10^9, and also mistake the speed as 10^6 bit/s instead of 10^8, you get 5×10^9 ÷ 10^6 = 5,000 seconds. Dividing the file size by the efficiency gives the same result as multiplying the speed by it (10^9 ÷ 0.2 ÷ 10^6 = 10^9 ÷ (10^6 × 0.2)), so the causes of this value are the missing bit conversion and taking the speed as 10^6 instead of 10^8.


#### 2009h21h-q033 p:1

- **jp before**: 障害発生時の運用の原則は、(1) 速やかに関連部門へ報告する、(2) 原因と影響範囲を確認したうえで復旧する、(3) あらかじめ定めた対応手順に従う、の三つ。早期復旧や現場の裁量を理由にこれらを崩している選択肢は、誤りと判断してよい。
- **jp after**: 障害発生時の運用の原則は、(1) 速やかに関連部門へ報告する、(2) 影響範囲 (データの破損など) を確認し、原因究明に必要な証跡 (ログなど) を確保したうえで復旧する、(3) あらかじめ定めた対応手順に従う、の三つ。早期復旧や現場の裁量を理由にこれらを崩している選択肢は、誤りと判断してよい。

- **zh before**: 故障发生时的运维原则有三条：(1) 迅速向相关部门报告；(2) 确认原因和影响范围之后再恢复；(3) 遵循事先制定的应对流程。凡是以尽早恢复或现场自由裁量为理由破坏这三条的选项，都可以判定为错误。
- **zh after**: 故障发生时的运维原则有三条：(1) 迅速向相关部门报告；(2) 确认影响范围（数据是否损坏等）并保全查明原因所需的证据（日志等）之后再恢复；(3) 遵循事先制定的应对流程。凡是以尽早恢复或现场自由裁量为理由破坏这三条的选项，都可以判定为错误。

- **en before**: There are three principles for operations when a fault occurs: (1) report promptly to the related departments, (2) recover after checking the cause and the scope of impact, and (3) follow the response procedures defined in advance. Any choice that breaks these on the grounds of early recovery or on-site discretion can be judged incorrect.
- **en after**: There are three principles for operations when a fault occurs: (1) report promptly to the related departments, (2) recover after checking the scope of impact (such as data corruption) and securing the evidence, such as logs, needed to investigate the cause, and (3) follow the response procedures defined in advance. Any choice that breaks these on the grounds of early recovery or on-site discretion can be judged incorrect.


#### 2009h21h-q088 p:0

- **jp before**: ログファイル (ジャーナルファイル) = データベースの更新前・更新後の値を時系列で記録するファイル。障害回復の唯一の情報源であり、ロールバック (バックワードリカバリ、更新前ログで取り消す) とロールフォワード (フォワードリカバリ、バックアップ復元後に更新後ログで進める) の両方に使われる。
- **jp after**: ログファイル (ジャーナルファイル) = データベースの更新前・更新後の値を時系列で記録するファイル。障害回復に欠かせない、更新の履歴を持つ情報源であり、ロールバック (バックワードリカバリ、更新前ログで取り消す) とロールフォワード (フォワードリカバリ、バックアップ復元後に更新後ログで進める) の両方に使われる。

- **zh before**: 日志文件（journal 文件）= 按时间顺序记录数据库更新前、更新后的值的文件。它是故障恢复唯一的信息来源，回滚（后退恢复，用更新前日志撤销）和前滚（前进恢复，还原备份后用更新后日志推进）两者都要用到它。
- **zh after**: 日志文件（journal 文件）= 按时间顺序记录数据库更新前、更新后的值的文件。它是故障恢复不可或缺、记录更新履历的信息来源，回滚（后退恢复，用更新前日志撤销）和前滚（前进恢复，还原备份后用更新后日志推进）两者都要用到它。

- **en before**: Log file (journal file) = a file that records the before-update and after-update values of the database in chronological order. It is the only source of information for failure recovery, and it is used by both rollback (backward recovery, undoing updates with the before-image log) and rollforward (forward recovery, advancing with the after-image log after the backup is restored).
- **en after**: Log file (journal file) = a file that records the before-update and after-update values of the database in chronological order. It is the indispensable source of update history for failure recovery, and it is used by both rollback (backward recovery, undoing updates with the before-image log) and rollforward (forward recovery, advancing with the after-image log after the backup is restored).


#### 2010h22a-q005 d:ア

- **jp before**: エコファームは、堆肥による土づくりと化学肥料・化学農薬の低減に一体的に取り組む農業者を都道府県知事が認定する制度 (持続農業法に基づく認定農業者の通称) を指す農業分野の用語です。対象は農業生産の方法であり、PC・サーバ・ネットワークといった情報通信機器の省エネや、IT の活用による社会の省エネとは関係がありません。
- **jp after**: エコファームは、化学肥料・化学農薬を減らすなど環境に配慮した農業や、それを行う農場を指す農業分野の語です (持続農業法に基づいて都道府県知事が認定した農業者の愛称「エコファーマー」とは別の語)。対象は農業生産の方法であり、PC・サーバ・ネットワークといった情報通信機器の省エネや、IT の活用による社会の省エネとは関係がありません。

- **zh before**: 生态农场（Eco Farm）是农业领域的术语，指由都道府县知事认定那些把用堆肥改良土壤与减少化肥、化学农药一体化推进的农业经营者的制度（依据《持续农业法》认定的农业者的通称）。其对象是农业生产的方法，与 PC、服务器、网络这类信息通信设备的节能，以及利用 IT 推动社会节能都没有关系。
- **zh after**: 生态农场（Eco Farm）是农业领域的用语，指减少化肥、化学农药等注重环保的农业或从事这种农业的农场（与依据《持续农业法》由都道府县知事认定的农业者的爱称「Eco Farmer（生态农业者）」是不同的词）。其对象是农业生产的方法，与 PC、服务器、网络这类信息通信设备的节能，以及利用 IT 推动社会节能都没有关系。

- **en before**: An eco-farm is a term from agriculture. It refers to a system under which the prefectural governor certifies farmers who work in an integrated way on improving the soil with compost while reducing chemical fertilizers and chemical pesticides (the common name for farmers certified under the Sustainable Agriculture Act). What it covers is farming methods, so it has nothing to do with saving energy in information and communication equipment such as PCs, servers, and networks, or with promoting energy conservation in society through IT.
- **en after**: An eco-farm is a term from agriculture. It refers to environmentally conscious farming, such as reducing chemical fertilizers and chemical pesticides, or a farm that practices it (a different word from “eco-farmer”, the nickname for farmers certified by the prefectural governor under the Sustainable Agriculture Act). What it covers is farming methods, so it has nothing to do with saving energy in information and communication equipment such as PCs, servers, and networks, or with promoting energy conservation in society through IT.


#### 2010h22a-q005 p:1

- **jp before**: 紛らわしい環境関連用語は「対象領域」で切り分ける。環境アセスメント = 開発事業の事前の環境影響評価 (手続)、ゼロエミッション = 廃棄物の再資源化による最終処分量ゼロ (循環)、エコファーム = 環境に配慮した農業者の認定 (農業)。IT 機器が主語になっているのはグリーンIT だけ。
- **jp after**: 紛らわしい環境関連用語は「対象領域」で切り分ける。環境アセスメント = 開発事業の事前の環境影響評価 (手続)、ゼロエミッション = 廃棄物の再資源化による最終処分量ゼロ (循環)、エコファーム = 環境に配慮した農業・農場 (農業)。IT 機器が主語になっているのはグリーンIT だけ。

- **zh before**: 容易混淆的环境相关术语要按「适用领域」来区分：环境影响评价＝对开发项目的事前环境影响评价（程序）；零排放＝通过废弃物再资源化把最终处置量降为零（循环）；生态农场＝对注重环保的农业者的认定（农业）。以 IT 设备为主语的只有绿色 IT。
- **zh after**: 容易混淆的环境相关术语要按「适用领域」来区分：环境影响评价＝对开发项目的事前环境影响评价（程序）；零排放＝通过废弃物再资源化把最终处置量降为零（循环）；生态农场＝注重环保的农业或农场（农业）。以 IT 设备为主语的只有绿色 IT。

- **en before**: Tell confusingly similar environmental terms apart by the area they apply to: environmental assessment = evaluating the environmental impact of a development project in advance (a procedure); zero emission = bringing final disposal to zero by turning waste back into resources (circulation); eco-farm = certifying environmentally conscious farmers (agriculture). Green IT is the only one whose subject is IT equipment.
- **en after**: Tell confusingly similar environmental terms apart by the area they apply to: environmental assessment = evaluating the environmental impact of a development project in advance (a procedure); zero emission = bringing final disposal to zero by turning waste back into resources (circulation); eco-farm = environmentally conscious farming or farms (agriculture). Green IT is the only one whose subject is IT equipment.


#### 2010h22a-q014 d:ウ

- **jp before**: 6 週は購買を直列に数えた誤り。部品 B の納入 2 週と部品 C の納入 3 週を順番に行うと考えて 2 + 3 = 5 週とし、そこに組立 1 週を足すと 6 週になる。しかし B と C はそれぞれ独立した購買品なので同時に発注でき、並行して納入を待てる。並行できる作業を直列に積み上げると、最短期間を過大に見積もることになる。
- **jp after**: 6 週は購買を直列に数えたうえで、部品 A の加工 1 週も落とした誤り。部品 B の納入 2 週と部品 C の納入 3 週を順番に行うと考えて 2 + 3 = 5 週とし、C の納入後に必要な A の加工 1 週を数えずに組立 1 週だけを足すと 6 週になる (A の加工まで数えて直列にすると 7 週で、エの経路になる)。しかし B と C はそれぞれ独立した購買品なので同時に発注でき、並行して納入を待てる。並行できる作業を直列に積み上げると、最短期間を過大に見積もることになる。

- **zh before**: 6 周是把采购按串行计算的错误。如果认为零件 B 的交货 2 周和零件 C 的交货 3 周要依次进行，就得到 2 + 3 = 5 周，再加上组装 1 周就成了 6 周。但 B 和 C 各自是独立的采购品，可以同时下单，并行等待交货。把可以并行的作业串行累加，就会把最短周期估计得过长。
- **zh after**: 6 周是把采购按串行计算、又漏掉了零件 A 的加工 1 周的错误。如果认为零件 B 的交货 2 周和零件 C 的交货 3 周要依次进行，就得到 2 + 3 = 5 周，不计 C 交货后必需的 A 加工 1 周而只加上组装 1 周，就成了 6 周（若把 A 的加工也算进去串行累加则是 7 周，即エ的路径）。但 B 和 C 各自是独立的采购品，可以同时下单，并行等待交货。把可以并行的作业串行累加，就会把最短周期估计得过长。

- **en before**: 6 weeks is the mistake of counting the purchases in series. If you assume that the 2 weeks of delivery for part B and the 3 weeks of delivery for part C are carried out one after the other, you get 2 + 3 = 5 weeks, and adding 1 week of assembly gives 6 weeks. However, B and C are each independent purchased parts, so they can be ordered at the same time and their deliveries can be waited for in parallel. Stacking up work that can run in parallel as a series leads to overestimating the shortest period.
- **en after**: 6 weeks is the mistake of counting the purchases in series while also dropping the 1 week of processing for part A. If you assume that the 2 weeks of delivery for part B and the 3 weeks of delivery for part C are carried out one after the other, you get 2 + 3 = 5 weeks, and adding only the 1 week of assembly, without the 1 week of processing part A that is needed after C arrives, gives 6 weeks (counting A's processing as well in series gives 7 weeks, which is the path of エ). However, B and C are each independent purchased parts, so they can be ordered at the same time and their deliveries can be waited for in parallel. Stacking up work that can run in parallel as a series leads to overestimating the shortest period.


#### 2010h22a-q037 correct

- **jp before**: 正解は イ。IT サービスマネジメントでいうインシデント (incident) とは、サービスに対する計画外の中断、サービス品質の低下、または顧客へのサービスにまだ影響していないがその恐れがある事象を指す。つまり、本来あるべきサービスの状態からの逸脱を引き起こす出来事そのものである。選択肢 イ の「サービス品質の低下を引き起こすもの」は、この定義にそのまま対応している。具体例としては、システムが停止した、応答が極端に遅い、プリンタが印刷できない、利用者がパスワードを忘れてログインできない、といった事象がいずれもインシデントに当たる。インシデント管理の目的は原因の究明そのものではなく、合意されたサービスレベルへできるだけ早く回復させること (暫定的な回避策の適用を含む) にある点も押さえておきたい。他の 3 つはいずれも「合意した文書」「情報の提供」「管理の活動」であって、サービスを妨げる出来事ではないので、インシデントの定義には当てはまらない。
- **jp after**: 正解は イ。IT サービスマネジメントでいうインシデント (incident) とは、サービスに対する計画外の中断、サービス品質の低下、または顧客へのサービスにまだ影響していないがその恐れがある事象を指す。つまり、本来あるべきサービスの状態からの逸脱を引き起こす出来事そのものである。選択肢 イ の「サービス品質の低下を引き起こすもの」は、この定義にそのまま対応している。具体例としては、システムが停止した、応答が極端に遅い、プリンタが印刷できない、といった事象がいずれもインシデントに当たる。インシデント管理の目的は原因の究明そのものではなく、合意されたサービスレベルへできるだけ早く回復させること (暫定的な回避策の適用を含む) にある点も押さえておきたい。他の 3 つはいずれも「合意した文書」「情報の提供」「管理の活動」であって、サービスを妨げる出来事ではないので、インシデントの定義には当てはまらない。

- **zh before**: 正确答案是 イ。IT 服务管理中所说的事件（incident）是指服务出现计划外的中断、服务质量下降，或者尚未影响到面向客户的服务但存在此风险的事态。也就是说，它就是引起服务偏离本应有状态的那件事本身。选项 イ 的「导致服务质量下降的事物」正好与这一定义相对应。具体例子有：系统停机、响应极其缓慢、打印机无法打印、用户忘记密码而无法登录等，这些事态都属于事件。还应记住，事件管理的目的并不是查明原因本身，而是尽快把服务恢复到约定的服务级别（包括采用临时的规避措施）。其他 3 项都是「约定好的文档」「信息的提供」「管理的活动」，并不是妨碍服务的事态，因此不符合事件的定义。
- **zh after**: 正确答案是 イ。IT 服务管理中所说的事件（incident）是指服务出现计划外的中断、服务质量下降，或者尚未影响到面向客户的服务但存在此风险的事态。也就是说，它就是引起服务偏离本应有状态的那件事本身。选项 イ 的「导致服务质量下降的事物」正好与这一定义相对应。具体例子有：系统停机、响应极其缓慢、打印机无法打印等，这些事态都属于事件。还应记住，事件管理的目的并不是查明原因本身，而是尽快把服务恢复到约定的服务级别（包括采用临时的规避措施）。其他 3 项都是「约定好的文档」「信息的提供」「管理的活动」，并不是妨碍服务的事态，因此不符合事件的定义。

- **en before**: The correct answer is イ. In IT service management, an incident means an unplanned interruption to a service, a decline in service quality, or an event that has not yet affected the service to the customer but could do so. In other words, it is the event itself that causes a deviation from the state the service is supposed to be in. Choice イ, “Something that causes a decline in service quality”, corresponds directly to this definition. Concrete examples include a system going down, an extremely slow response, a printer that cannot print, and a user who has forgotten a password and cannot log in; all of these are incidents. It is also worth remembering that the purpose of incident management is not to investigate the cause itself, but to restore the service to the agreed service level as quickly as possible (including applying a temporary workaround). The other three are all “an agreed document”, “provision of information”, and “a management activity”, and none of them is an event that hinders the service, so they do not fit the definition of an incident.
- **en after**: The correct answer is イ. In IT service management, an incident means an unplanned interruption to a service, a decline in service quality, or an event that has not yet affected the service to the customer but could do so. In other words, it is the event itself that causes a deviation from the state the service is supposed to be in. Choice イ, “Something that causes a decline in service quality”, corresponds directly to this definition. Concrete examples include a system going down, an extremely slow response, and a printer that cannot print; all of these are incidents. It is also worth remembering that the purpose of incident management is not to investigate the cause itself, but to restore the service to the agreed service level as quickly as possible (including applying a temporary workaround). The other three are all “an agreed document”, “provision of information”, and “a management activity”, and none of them is an event that hinders the service, so they do not fit the definition of an incident.


#### 2010h22a-q055 d:エ

- **jp before**: 適しているのは逆で、不特定多数との通信では公開鍵暗号方式のほうが適している。共通鍵暗号方式は通信相手ごとに別々の鍵を用意し、しかもその鍵を事前に安全な経路で共有しておく必要があるため、相手が n 人いると鍵は n(n-1)/2 個必要になり、相手が誰か分からない不特定多数には現実的に運用できない。公開鍵暗号方式なら自分の公開鍵を 1 つ公開しておくだけで、面識のない相手からでも暗号化された通信を受け取れる。共通鍵暗号が向くのは、相手が限定され、かつ大量データを高速に処理したい場面である。
- **jp after**: 適しているのは逆で、不特定多数との通信では公開鍵暗号方式のほうが適している。共通鍵暗号方式は通信相手ごとに別々の鍵を用意し、しかもその鍵を事前に安全な経路で共有しておく必要があるため、n 人が互いに通信するには鍵が n(n-1)/2 個必要になり、相手が誰か分からない不特定多数には現実的に運用できない。公開鍵暗号方式なら自分の公開鍵を 1 つ公開しておくだけで、面識のない相手からでも暗号化された通信を受け取れる。共通鍵暗号が向くのは、相手が限定され、かつ大量データを高速に処理したい場面である。

- **zh before**: 适合的情况正好相反，在与不特定多数对象通信时，公开密钥加密方式更为适合。共享密钥加密方式需要为每一个通信对象准备各不相同的密钥，而且必须事先通过安全的途径共享该密钥，因此当对象有 n 人时就需要 n(n-1)/2 个密钥，对于不知道对方是谁的不特定多数来说实际上无法运用。若使用公开密钥加密方式，只需公开自己的一把公钥，就能从素不相识的对象那里接收加密后的通信。共享密钥加密适合的是对象有限、且需要高速处理大量数据的场景。
- **zh after**: 适合的情况正好相反，在与不特定多数对象通信时，公开密钥加密方式更为适合。共享密钥加密方式需要为每一个通信对象准备各不相同的密钥，而且必须事先通过安全的途径共享该密钥，因此 n 人相互通信时就需要 n(n-1)/2 个密钥，对于不知道对方是谁的不特定多数来说实际上无法运用。若使用公开密钥加密方式，只需公开自己的一把公钥，就能从素不相识的对象那里接收加密后的通信。共享密钥加密适合的是对象有限、且需要高速处理大量数据的场景。

- **en before**: It is the other way around: for data communication with an unspecified large number of parties, public-key cryptography is more suitable. Symmetric-key cryptography needs a separate key for each communication partner, and that key must be shared in advance over a secure channel, so if there are n partners, n(n-1)/2 keys are required, which cannot realistically be operated for an unspecified large number of parties whose identities are unknown. With public-key cryptography, you only publish one public key of your own, and you can then receive encrypted communication even from parties you have never met. Symmetric-key cryptography is suited to situations where the partners are limited and a large volume of data must be processed at high speed.
- **en after**: It is the other way around: for data communication with an unspecified large number of parties, public-key cryptography is more suitable. Symmetric-key cryptography needs a separate key for each communication partner, and that key must be shared in advance over a secure channel, so if n parties communicate with one another, n(n-1)/2 keys are required, which cannot realistically be operated for an unspecified large number of parties whose identities are unknown. With public-key cryptography, you only publish one public key of your own, and you can then receive encrypted communication even from parties you have never met. Symmetric-key cryptography is suited to situations where the partners are limited and a large volume of data must be processed at high speed.


#### 2010h22a-q078 correct

- **jp before**: 適切なのは b・c・d の 3 つなので エ が正解。b は重要情報を含む資料や CD-R などの媒体を利用時以外は施錠した棚にしまう施錠管理で、盗難や無断持出しを防ぎ機密性を守る。c はファクシミリの共用トレイに受信文書を放置しないことで、通りがかりの第三者に内容を見られたり持ち去られたりするのを防ぐ (クリアデスクの考え方)。d はホワイトボードの書込みを使用後すぐに消すことで、会議室を次に使う人に検討内容や顧客名などが漏れるのを防ぐ。いずれも「情報を放置しない・見せない・持ち出させない」という職場の基本動作であり、機密性と完全性 (勝手な書換え・持出しを防ぐ) の維持に直結する。
- **jp after**: 適切なのは b・c・d の 3 つなので エ が正解。b は重要情報を含む資料や CD-R などの媒体を利用時以外は施錠した棚にしまう施錠管理で、盗難や無断持出しを防ぎ機密性を守る。c はファクシミリの共用トレイに受信文書を放置しないことで、通りがかりの第三者に内容を見られたり持ち去られたりするのを防ぐ (クリアデスクの考え方)。d はホワイトボードの書込みを使用後すぐに消すことで、会議室を次に使う人に検討内容や顧客名などが漏れるのを防ぐ。いずれも「情報を放置しない・見せない・持ち出させない」という職場の基本動作であり、機密性と完全性 (勝手な書換えを防ぐ) の維持に直結する。

- **zh before**: 适当的是 b、c、d 这三项，所以 エ 是正确答案。b 是把含有重要信息的资料和 CD-R 等媒体在使用以外的时间收进上锁柜子的上锁管理，可以防止失窃和擅自带出，守护机密性。c 是不把收到的文件留在传真机的共用托盘里，防止路过的第三者看到内容或把它拿走（清洁桌面的思路）。d 是使用后立即擦掉白板上的书写内容，防止把讨论内容和客户名称等泄露给下一个使用会议室的人。这些都是「不放置信息、不让人看到、不让人带走」的职场基本动作，直接关系到机密性和完整性（防止擅自改写和带出）的维持。
- **zh after**: 适当的是 b、c、d 这三项，所以 エ 是正确答案。b 是把含有重要信息的资料和 CD-R 等媒体在使用以外的时间收进上锁柜子的上锁管理，可以防止失窃和擅自带出，守护机密性。c 是不把收到的文件留在传真机的共用托盘里，防止路过的第三者看到内容或把它拿走（清洁桌面的思路）。d 是使用后立即擦掉白板上的书写内容，防止把讨论内容和客户名称等泄露给下一个使用会议室的人。这些都是「不放置信息、不让人看到、不让人带走」的职场基本动作，直接关系到机密性和完整性（防止擅自改写）的维持。

- **en before**: The appropriate items are the three b, c, and d, so エ is correct. Item b is lock management: storing materials containing important information and media such as CD-Rs in a locked cabinet except when in use, which prevents theft and unauthorized removal and protects confidentiality. Item c is not leaving received documents in the shared facsimile tray, which prevents a passing third party from reading them or carrying them off (the clear desk idea). Item d is erasing what is written on the whiteboard right after use, which prevents things such as the content discussed or customer names from leaking to the people who use the meeting room next. All of these are basic workplace behaviors of “do not leave information lying around, do not let it be seen, do not let it be taken away”, and they lead directly to maintaining confidentiality and integrity (preventing unauthorized rewriting and removal).
- **en after**: The appropriate items are the three b, c, and d, so エ is correct. Item b is lock management: storing materials containing important information and media such as CD-Rs in a locked cabinet except when in use, which prevents theft and unauthorized removal and protects confidentiality. Item c is not leaving received documents in the shared facsimile tray, which prevents a passing third party from reading them or carrying them off (the clear desk idea). Item d is erasing what is written on the whiteboard right after use, which prevents things such as the content discussed or customer names from leaking to the people who use the meeting room next. All of these are basic workplace behaviors of “do not leave information lying around, do not let it be seen, do not let it be taken away”, and they lead directly to maintaining confidentiality and integrity (preventing unauthorized rewriting).


#### 2010h22h-q025 d:エ

- **jp before**: テレビドラマを自分で視聴するために録画するところまでは私的使用のための複製として適法だが、それを動画共有サイトにアップロードすると、不特定多数が視聴できる状態に置くことになり公衆送信権 (送信可能化権) の侵害となる。私的使用の目的で作った複製物を、その目的を超えて公衆に提示・送信すると、当初の複製もさかのぼって私的使用の例外の対象外として扱われる点にも注意が必要である。無償で公開していても、営利目的でなくても侵害であることに変わりはない。
- **jp after**: テレビドラマを自分で視聴するために録画するところまでは私的使用のための複製として適法だが、それを動画共有サイトにアップロードすると、不特定多数が視聴できる状態に置くことになり公衆送信権 (送信可能化権) の侵害となる。なお、私的使用の目的で作った複製物をその目的以外で頒布したり公衆に提示したりすると、その時点で複製を行ったものとみなされる (第 49 条) 点にも注意が必要である。無償で公開していても、営利目的でなくても侵害であることに変わりはない。

- **zh before**: 为了自己观看而录制电视剧, 到这一步属于为私人使用的复制, 是合法的; 但把它上传到视频共享网站后, 就使其处于不特定多数人都能观看的状态, 构成对公众传播权 (可传播化权) 的侵害。还需要注意: 如果把以私人使用为目的制作的复制件超出该目的向公众展示或传播, 那么最初的复制也会被追溯认定为不属于私人使用例外的对象。即使是无偿公开、即使不以营利为目的, 也同样是侵权。
- **zh after**: 为了自己观看而录制电视剧, 到这一步属于为私人使用的复制, 是合法的; 但把它上传到视频共享网站后, 就使其处于不特定多数人都能观看的状态, 构成对公众传播权 (可传播化权) 的侵害。还需要注意: 如果把以私人使用为目的制作的复制件用于该目的以外的发行或向公众展示, 就会在那一时刻被视为进行了复制 (第 49 条)。即使是无偿公开、即使不以营利为目的, 也同样是侵权。

- **en before**: Recording a TV drama in order to watch it yourself is lawful up to that point as reproduction for private use, but uploading it to a video-sharing website places it where an unspecified number of people can watch it, which infringes the public transmission right (the right of making the work transmittable). Note also that if a copy made for private use is presented or transmitted to the public beyond that purpose, the original copying is retroactively treated as falling outside the private-use exception. Publishing it free of charge, or without any profit motive, does not change the fact that it is an infringement.
- **en after**: Recording a TV drama in order to watch it yourself is lawful up to that point as reproduction for private use, but uploading it to a video-sharing website places it where an unspecified number of people can watch it, which infringes the public transmission right (the right of making the work transmittable). Note also that if a copy made for private use is distributed or presented to the public for any other purpose, the person is deemed to have reproduced the work at that point (Article 49). Publishing it free of charge, or without any profit motive, does not change the fact that it is an infringement.


#### 2010h22h-q047 correct

- **jp before**: 正解は エ。単体テスト (モジュールテスト) は、作成したプログラムを一つずつ取り出し、そのプログラム単体が設計どおりに動くかを確かめる開発工程の最初のテストである。テストを担当するのはプログラムの内部を知っている開発者自身なので、入出力だけを見るブラックボックステストではなく、内部の処理手順をたどりながら検証するホワイトボックステストを用いる。そのため、すべての命令を一度は実行したか (命令網羅)、条件分岐の真と偽の両方を通したか (分岐網羅) といった網羅基準を立て、ロジックの網羅性まで含めてテストデータを用意する。エ の記述はこの単体テストの本質をそのまま述べており適切である。ここで内部ロジックの抜けを潰しておくことで、後続の結合テスト以降では個々のプログラムの単純な作り込みミスではなく、プログラム間のつなぎ部分に絞って不具合を追えるようになる。
- **jp after**: 正解は エ。単体テスト (モジュールテスト) は、作成したプログラムを一つずつ取り出し、そのプログラム単体が設計どおりに動くかを確かめる開発工程の最初のテストである。テストを担当するのはプログラムの内部を知っている開発者自身なので、入出力だけを見るブラックボックステストと併せて、内部の処理手順をたどりながら検証するホワイトボックステストが中心になる。そのため、すべての命令を一度は実行したか (命令網羅)、条件分岐の真と偽の両方を通したか (分岐網羅) といった網羅基準を立て、ロジックの網羅性まで含めてテストデータを用意する。エ の記述はこの単体テストの本質をそのまま述べており適切である。ここで内部ロジックの抜けを潰しておくことで、後続の結合テスト以降では個々のプログラムの単純な作り込みミスではなく、プログラム間のつなぎ部分に絞って不具合を追えるようになる。

- **zh before**: 正确答案是 エ。单元测试（模块测试）是把编写好的程序一个一个取出来、确认该程序单体是否按设计正常工作的开发工序中最早的测试。承担测试的是了解程序内部的开发者本人，所以不采用只看输入输出的黑盒测试，而是使用沿着内部处理步骤逐步验证的白盒测试。因此要设定诸如是否让所有语句都至少执行过一次（语句覆盖）、是否让条件分支的真与假两侧都走到过（分支覆盖）这样的覆盖标准，准备连逻辑的覆盖性也包含在内的测试数据。エ 的描述正是原样陈述了单元测试的本质，因而恰当。在这一步把内部逻辑的遗漏消除掉，后续的集成测试及之后的工序就不必再去追查各个程序简单的编写失误，而能把缺陷排查集中到程序之间的衔接部分。
- **zh after**: 正确答案是 エ。单元测试（模块测试）是把编写好的程序一个一个取出来、确认该程序单体是否按设计正常工作的开发工序中最早的测试。承担测试的是了解程序内部的开发者本人，所以除了只看输入输出的黑盒测试之外，以沿着内部处理步骤逐步验证的白盒测试为中心。因此要设定诸如是否让所有语句都至少执行过一次（语句覆盖）、是否让条件分支的真与假两侧都走到过（分支覆盖）这样的覆盖标准，准备连逻辑的覆盖性也包含在内的测试数据。エ 的描述正是原样陈述了单元测试的本质，因而恰当。在这一步把内部逻辑的遗漏消除掉，后续的集成测试及之后的工序就不必再去追查各个程序简单的编写失误，而能把缺陷排查集中到程序之间的衔接部分。

- **en before**: The correct answer is エ. Unit testing (module testing) takes each created program one by one and checks whether that single program works as designed; it is the first test in the development process. The people who run it are the developers themselves, who know the inside of the program, so instead of black-box testing that looks only at inputs and outputs, white-box testing is used, which verifies the program while tracing its internal processing steps. For that reason, coverage criteria are set, such as whether every statement has been executed at least once (statement coverage) and whether both the true side and the false side of a conditional branch have been taken (branch coverage), and test data is prepared so that even the completeness of the logic is covered. The description in エ states exactly this essence of unit testing, so it is appropriate. By closing the gaps in the internal logic here, the later integration test and the stages after it no longer have to chase simple coding mistakes inside each individual program, and can focus on defects in the joints between programs.
- **en after**: The correct answer is エ. Unit testing (module testing) takes each created program one by one and checks whether that single program works as designed; it is the first test in the development process. The people who run it are the developers themselves, who know the inside of the program, so alongside black-box testing that looks only at inputs and outputs, white-box testing, which verifies the program while tracing its internal processing steps, is central. For that reason, coverage criteria are set, such as whether every statement has been executed at least once (statement coverage) and whether both the true side and the false side of a conditional branch have been taken (branch coverage), and test data is prepared so that even the completeness of the logic is covered. The description in エ states exactly this essence of unit testing, so it is appropriate. By closing the gaps in the internal logic here, the later integration test and the stages after it no longer have to chase simple coding mistakes inside each individual program, and can focus on defects in the joints between programs.


#### 2010h22h-q047 p:0

- **jp before**: 単体テストはプログラム (モジュール) 単位で内部ロジックを検証する工程であり、開発者がホワイトボックステストとして実施する。命令網羅・分岐 (判定) 網羅などの網羅基準を満たすテストデータを作り、ロジックの網羅性まで確認するのが特徴。
- **jp after**: 単体テストはプログラム (モジュール) 単位で内部ロジックを検証する工程であり、開発者がホワイトボックステストを中心に (ブラックボックステストと併用して) 実施する。命令網羅・分岐 (判定) 網羅などの網羅基準を満たすテストデータを作り、ロジックの網羅性まで確認するのが特徴。

- **zh before**: 单元测试是以程序（模块）为单位验证内部逻辑的工序，由开发者以白盒测试的方式实施。其特点是编写满足语句覆盖、分支（判定）覆盖等覆盖标准的测试数据，连逻辑的覆盖性也一并确认。
- **zh after**: 单元测试是以程序（模块）为单位验证内部逻辑的工序，由开发者以白盒测试为中心（并结合黑盒测试）实施。其特点是编写满足语句覆盖、分支（判定）覆盖等覆盖标准的测试数据，连逻辑的覆盖性也一并确认。

- **en before**: Unit testing is the process of verifying internal logic on a per-program (per-module) basis, and developers carry it out as white-box testing. Its characteristic is that test data is created to satisfy coverage criteria such as statement coverage and branch (decision) coverage, so that even the completeness of the logic is checked.
- **en after**: Unit testing is the process of verifying internal logic on a per-program (per-module) basis, and developers carry it out mainly as white-box testing (combined with black-box testing). Its characteristic is that test data is created to satisfy coverage criteria such as statement coverage and branch (decision) coverage, so that even the completeness of the logic is checked.


#### 2011h23tokubetsu-q025 d:エ

- **jp before**: バリューチェーン分析は、企業の事業活動を購買・製造・出荷・販売などの主活動と、人事や技術開発などの支援活動に分解し、どの工程で付加価値が生み出されているか、競争優位の源泉はどこかを分析する手法である。対象は自社の業務プロセスであり、Web サイト閲覧者の行動を分析するものではない。
- **jp after**: バリューチェーン分析は、企業の事業活動を購買物流・製造・出荷物流・販売などの主活動と、人事や技術開発などの支援活動に分解し、どの工程で付加価値が生み出されているか、競争優位の源泉はどこかを分析する手法である。対象は自社の業務プロセスであり、Web サイト閲覧者の行動を分析するものではない。

- **zh before**: 价值链分析是把企业的经营活动分解为采购、制造、出货、销售等主要活动，以及人事、技术开发等支持活动，进而分析附加价值是在哪个环节产生的、竞争优势的源泉在何处的方法。它的分析对象是本企业的业务流程，而不是网站访问者的行为。
- **zh after**: 价值链分析是把企业的经营活动分解为进货物流、制造、出货物流、销售等主要活动，以及人事、技术开发等支持活动，进而分析附加价值是在哪个环节产生的、竞争优势的源泉在何处的方法。它的分析对象是本企业的业务流程，而不是网站访问者的行为。

- **en before**: Value chain analysis breaks a company's business activities down into primary activities such as procurement, manufacturing, outbound logistics, and sales, and support activities such as human resources and technology development, and then analyzes at which process added value is created and where the sources of competitive advantage lie. What it targets is the company's own business processes, not the behavior of website visitors.
- **en after**: Value chain analysis breaks a company's business activities down into primary activities such as inbound logistics, manufacturing, outbound logistics, and sales, and support activities such as human resources and technology development, and then analyzes at which process added value is created and where the sources of competitive advantage lie. What it targets is the company's own business processes, not the behavior of website visitors.


#### 2011h23tokubetsu-q027 p:1

- **jp before**: 紛らわしい経営・IT マネジメント用語の切り分け — 現状と将来像のギャップから全体最適化を図るのはエンタープライズアーキテクチャ (EA)、法令遵守と統制の仕組みづくりは IT ガバナンス、障害時の影響を最小化する備えはコンティンジェンシープラン (BCP)。いずれも組織や仕組みが対象であり、個人の能力を対象とする情報リテラシとは主体も生み出されるものも異なる。
- **jp after**: 紛らわしい経営・IT マネジメント用語の切り分け — 現状と将来像のギャップから全体最適化を図るのはエンタープライズアーキテクチャ (EA)、法令遵守と統制の仕組みづくりは IT ガバナンス、障害時の影響を最小化する備えはコンティンジェンシープラン (緊急時対応計画) や事業継続計画 (BCP)。いずれも組織や仕組みが対象であり、個人の能力を対象とする情報リテラシとは主体も生み出されるものも異なる。

- **zh before**: 易混淆的经营与 IT 管理术语的区分 — 依据现状与未来样态之间的差距推进整体最优化的是企业架构 (EA)；建设合规与管控机制的是 IT 治理；为把故障发生时的影响降到最低而做的准备是应急计划 (BCP)。这些的对象都是组织或机制，与以个人能力为对象的信息素养相比，主体不同，产出也不同。
- **zh after**: 易混淆的经营与 IT 管理术语的区分 — 依据现状与未来样态之间的差距推进整体最优化的是企业架构 (EA)；建设合规与管控机制的是 IT 治理；为把故障发生时的影响降到最低而做的准备是应急计划或业务连续性计划 (BCP)。这些的对象都是组织或机制，与以个人能力为对象的信息素养相比，主体不同，产出也不同。

- **en before**: Telling apart confusable management and IT management terms — pursuing overall optimization from the gap between the current state and the desired future state is enterprise architecture (EA); building a mechanism for legal compliance and control is IT governance; preparing so that the impact of a failure is minimized is a contingency plan (BCP). All of these target organizations or mechanisms, and compared with information literacy, which targets individual ability, they differ both in who drives them and in what they produce.
- **en after**: Telling apart confusable management and IT management terms — pursuing overall optimization from the gap between the current state and the desired future state is enterprise architecture (EA); building a mechanism for legal compliance and control is IT governance; preparing so that the impact of a failure is minimized is a contingency plan or a business continuity plan (BCP). All of these target organizations or mechanisms, and compared with information literacy, which targets individual ability, they differ both in who drives them and in what they produce.


#### 2011h23tokubetsu-q045 d:エ

- **jp before**: プロジェクトの目的や意義を関係者へ周知するのは、プロジェクト憲章 (プロジェクト計画書) やキックオフミーティングが担う役割です。WBS は目的を語る文書ではなく、目的を達成するための成果物と作業を構造化した一覧であり、レベルが異なります。
- **jp after**: プロジェクトの目的や意義を関係者へ周知するのは、プロジェクト憲章やキックオフミーティングが担う役割です。WBS は目的を語る文書ではなく、目的を達成するための成果物と作業を構造化した一覧であり、レベルが異なります。

- **zh before**: 向相关方周知项目的目标和意义，是项目章程（项目计划书）和启动会议承担的职责。WBS 并不是阐述目标的文档，而是把为达成目标所需的交付物和作业结构化后形成的清单，两者层次不同。
- **zh after**: 向相关方周知项目的目标和意义，是项目章程和启动会议承担的职责。WBS 并不是阐述目标的文档，而是把为达成目标所需的交付物和作业结构化后形成的清单，两者层次不同。

- **en before**: Making the project's objectives and significance known to stakeholders is the role of the project charter (project plan) and the kickoff meeting. A WBS is not a document that states objectives; it is a structured listing of the deliverables and the work needed to achieve them — a different level of thing.
- **en after**: Making the project's objectives and significance known to stakeholders is the role of the project charter and the kickoff meeting. A WBS is not a document that states objectives; it is a structured listing of the deliverables and the work needed to achieve them — a different level of thing.


#### 2026r08-q012 d:イ

- **jp before**: DMM (Diamond Mandala Matrix) は、中心テーマの周囲のマスにアイデアを書き出して発想を広げる、マンダラ・チャート系の発想支援ツールです。業務プロセスの流れを順序立てて描く用途には向きません。
- **jp after**: DMM (Diamond Mandala Matrix) は、EA (エンタープライズアーキテクチャ) で機能構成図を描くための記述様式で、業務の機能を階層的に分解して示します。業務の流れ (手順の順序) は表さないので、業務プロセスの流れを順序立てて描く用途には向きません。

- **zh before**: DMM（Diamond Mandala Matrix，钻石曼陀罗矩阵）是一种曼陀罗图（mandala chart）类的发想辅助工具，通过在中心主题周围的格子里写出想法来拓展思路。它不适合用于有顺序地描绘业务流程。
- **zh after**: DMM（Diamond Mandala Matrix，钻石曼陀罗矩阵）是在 EA（企业架构）中绘制功能构成图所用的记述样式，用于把业务功能按层次分解表示。它不表示业务的流程（步骤的先后顺序），因此不适合用于有顺序地描绘业务流程。

- **en before**: DMM (Diamond Mandala Matrix) is a mandala-chart-type ideation support tool that expands ideas by writing them in the cells surrounding a central theme. It is not suited for depicting a business process flow in a sequenced manner.
- **en after**: DMM (Diamond Mandala Matrix) is the notation used in EA (enterprise architecture) to draw a function structure diagram, showing business functions decomposed hierarchically. It does not represent the business flow (the order of steps), so it is not suited for depicting a business process flow in a sequenced manner.


#### 2026r08-q012 p:0

- **jp before**: 業務プロセスの「流れ・手順」を可視化する記述様式は WFA (Work Flow Architecture)。各図の用途を区別する: WFA=業務の流れ、CRUD図=機能とデータの操作関係、E-R図=データ構造、DMM=発想支援。
- **jp after**: 業務プロセスの「流れ・手順」を可視化する記述様式は WFA (Work Flow Architecture)。各図の用途を区別する: WFA=業務の流れ、CRUD図=機能とデータの操作関係、E-R図=データ構造、DMM=業務機能の階層分解 (機能構成図)。

- **zh before**: 可视化业务流程「流程与步骤」的记述样式是 WFA（Work Flow Architecture）。要区分各种图的用途：WFA＝业务流程，CRUD 图＝功能与数据的操作关系，E-R 图＝数据结构，DMM＝发想辅助。
- **zh after**: 可视化业务流程「流程与步骤」的记述样式是 WFA（Work Flow Architecture）。要区分各种图的用途：WFA＝业务流程，CRUD 图＝功能与数据的操作关系，E-R 图＝数据结构，DMM＝业务功能的层次分解（功能构成图）。

- **en before**: The notation style that visualizes the flow and steps of a business process is WFA (Work Flow Architecture). Distinguish the purposes of each diagram: WFA = business flow, CRUD diagram = operational relationship between functions and data, E-R diagram = data structure, DMM = ideation support.
- **en after**: The notation style that visualizes the flow and steps of a business process is WFA (Work Flow Architecture). Distinguish the purposes of each diagram: WFA = business flow, CRUD diagram = operational relationship between functions and data, E-R diagram = data structure, DMM = hierarchical decomposition of business functions (function structure diagram).


#### 2022r04-q037 p:0

- **jp before**: アクセス制御 = 利用者を認証 (本人確認) し、正当な利用者だけにシステムや資源の利用を許す仕組み。ログイン ID・パスワード照合による入退場管理はその典型例。
- **jp after**: アクセス制御 = 利用者を認証 (本人確認) し、正当な利用者だけにシステムや資源の利用を許す仕組み。ログイン ID・パスワード照合による利用可否の制御はその典型例。

- **zh before**: 访问控制 = 对用户进行认证（本人确认），只允许正当用户使用系统或资源的机制。通过登录 ID 与口令核对来管理准入是其典型示例。
- **zh after**: 访问控制 = 对用户进行认证（本人确认），只允许正当用户使用系统或资源的机制。通过登录 ID 与口令核对来控制能否使用系统是其典型示例。

- **en before**: Access control = a mechanism that authenticates users (verifies identity) and allows only legitimate users to use the system or resources. Managing admission through login ID and password verification is a typical example.
- **en after**: Access control = a mechanism that authenticates users (verifies identity) and allows only legitimate users to use the system or resources. Controlling whether a user may use the system through login ID and password verification is a typical example.


key_guard note の後置文 (19 本) は `scripts/quiz-fidfix-S131-efix1.mjs` の `NOTE_APPEND` に逐字で残している。

## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×7 (2009h21a 2009h21h 2010h22a 2010h22h 2011h23tokubetsu 2022r04 2026r08、exam を明示して実行) | ✅ applied 76 |
| 変更範囲 | ✅ HEAD との差分を explanations の題 id 単位で比較すると、変わったのは対象 19 題だけ (2009h21a-q082、2009h21h q033 / q088、2010h22a q005 / q014 / q028 / q037 / q055 / q078 / q098 / q099 / q100、2010h22h q025 / q047、2011h23tokubetsu q025 / q027 / q045、2022r04-q037、2026r08-q012)。トップレベルは同一 = merge の drift 0 |
| 冪等: efix1 dry-run 再実行 | ✅ **applied 0 / skipped 76**。n9b も applied 0 / skipped 29 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold (A1–A7, B1–B7)、layerB=ran |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ D-145 図ページ常設ゲート GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| `node --check scripts/quiz-fidfix-S131-efix1.mjs` | ✅ |
| tsc / eslint / vitest / build | ✅ exit 0 / 0 errors (既存 warning 1) / 38 passed・1 skipped (39 files)、563 passed・2 skipped / Compiled successfully |
| correct_answer 差分 (`git diff -U0 -- data/` の `"correct_answer"` 行) | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |

Rule B: 失敗した attempt なし (dry-run は 1 回目で全 76 操作が出現数一致、apply も 1 回)。
