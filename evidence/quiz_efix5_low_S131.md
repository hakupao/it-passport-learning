# S131 efix5 — low 集約 (D-178: efix4b〜4k の Rule D で任意とされた low、exam をまたぐ 1 unit)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/quiz_efix4{b..k}_expl_S131.md` §4 の low (置換案つき) と、lead の対象一覧
- script: `scripts/quiz-fidfix-S131-efix5.mjs` (efix4d と同じ形。subN、dry-run 既定、`--apply`。D-143 note は final に後置し、後置済みかは note の全文で判定。TRFIX は "stem" にも当たる)
- correct_answer 変更 0。jp の stem / choices は不変。translations sidecar の変更は zh 4 field (§0)
- 対象外 (lead の指定どおり触れていない): questions.json (2021r03-q020 terms)、2024r06-q097 suspect、2018h30h-q074 key_guard 元文、2025r07-q023「执行官」、2022r04-q068 エ「実際につながる」

## 0. translations sidecar の変更 (sidecar と `.phase1 tr_` の両方)

同じ語が題の中のほかの箇所 (sidecar を含む) にあれば揃える、という指示に従った。

| 題 | field | before | after |
|---|---|---|---|
| 2018h30h-q089 | choices.ウ.zh | …移动电话无线通信规格。 | …移动电话无线通信标准。 |
| 2020r02o-q039 | stem.zh (後半) | A公司认为这样即可实现24小时响应 | A公司认为这样即可实现24小时服务 |
| 2025r07-q051 | choices.エ.zh | 隶属于经营者直辖组织、具备财务与IT知识的员工 | 隶属于经营者直属部门、具备财务与IT知识的员工 |
| 2026r08-q089 | stem.zh | 将信息资产自身可能损害其价值的弱点称为 b | 将可能损害信息资产自身价值的弱点称为 b |

## 1. 判定

| # | 題 | low (出典) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2018h30h-q089 zh | 「无线通信规格」「4G 世代」は和語のまま (4b §4) | 中国語では通信規格は「标准」、世代は「代」 | ACCEPT。题内の全箇所を直した (正解解説 3 箇所・誤答肢ア・エ・要点 1、選択肢ウ)。「4G 世代」は「第四代（4G）」に |
| 2 | 2019r01a-q029 要点 2 zh / en | jp の「検索エンジンに向けて自社サイトを」を訳していない (4d §4) | efix4d で jp を直したが zh / en は旧訳のままだった | ACCEPT。Rule D の案どおり |
| 3 | 2020r02o-q039 題幹 zh | 後半の「24小时响应」を前半の「服务时间」と揃える (4e §4) | 题幹の「24時間対応」は受付時間帯の意味。前半と同じ語で揃える方が自然 | ACCEPT。「24小时服务」(sidecar・.phase1) |
| 4 | 2021r03-q020 要点 2 | 特徴量の自動抽出は厳密には深層学習の特徴 (4f §4) | 古典的な機械学習では特徴量は人が設計する | ACCEPT。「…点は深層学習の特徴で、」(jp / zh / en) |
| 5 | 2021r03-q020 zh | 「特征量」「使用例」は和語 (監査 low) | 中国語では「特征」「应用实例」が普通 | ACCEPT。「特征（特征量）」の重複を解き、残りの「特征量」も「特征」に (正解解説・要点 1・2)。誤答肢ウの「使用例」を「应用实例」に |
| 6 | 2021r03-q058 要点 2 | 「論理的な対策」(4f §4) | IPA はアンチパスバックを入退室管理 (物理的対策) の一部として扱う。2022r04-q074 の要点 1 も「物理入退室管理の対策」 | ACCEPT。「記録で判定する入退室管理の仕組み (物理的な障壁ではない)」とし、2022r04-q074 と矛盾しない形にした (jp / zh / en) |
| 7 | 2021r03-q058 zh・2022r04-q074 zh | 「出室」(監査 low) | 中国語で「出室」は不自然。「离开」が普通 | ACCEPT。q058 要点 2 と、整合のため q074 の正解解説・要点 1 も「离开」に (「出入室」は熟した語として残した) |
| 8 | 2022r04-q084 イ | 駆動機構を持つのはドライブ側 (4g §4) | DVD (媒体) そのものではなく、読み書きするドライブが駆動機構を持つ | ACCEPT。案を少し短くして「読み書きにはディスクを回す駆動機構を持つドライブが必要になるため」(jp / zh / en) |
| 9 | 2022r04-q094 イ zh | 「复写纸（复印纸）」(4g §4) | 复印纸は複写機用紙で別物。多枚複写の用紙は「多联复写纸」 | ACCEPT。案の「复写纸（多联复写纸）」は重複するので「多联复写纸」だけにした |
| 10 | 2022r04-q022 ウ zh | 「价值链（价值连锁）」(4g §4) | 价值连锁は和製の言い換え | ACCEPT。「价值链分析」 |
| 11 | 2022r04-q068 要点 2 | ANY 接続を追記 (4g §4) | efix4g でエを ANY 接続の説明に改めたので、要点にも入れて揃える | ACCEPT (jp / zh / en) |
| 12 | 2023r05-q100 ウ zh | 「交集（积）」(4h N2) | 中国語の「积」は直積と紛れる (en の (product) を削ったのと同じ理由) | ACCEPT。「交集」 |
| 13 | 2023r05-q055 エ zh | 文体 (4h N3) | 「减去的不是…而是…」の構文がぎこちない | ACCEPT。「没有…减去…，而是减去了…，从而…」に整えた (内容は不変) |
| 14 | 2024r06-q009 イ / q012 イ / q055 ア jp | 補足の半角括弧 (4i §4) | 周りの本文は全角括弧 | ACCEPT。全角「（）」に (前後の空白も除いた) |
| 15 | 2025r07-q033 イ | 「運転装置の無い車両が無人で走るレベル4」は運転装置が無いことが条件に読める (4j §4) | レベル 4 の条件は限定領域での無人運転で、運転装置の有無ではない | ACCEPT。「限定された地域であれば運転装置の無い車両でも無人で走行できるレベル4」(jp / zh / en) |
| 16 | 2025r07-q051 zh | 「经营者直辖组织」(監査 low) | 「直辖」は行政用語寄りで不自然 | ACCEPT。「经营者直属部门」(正解解説 2 箇所・要点 2、選択肢エ) |
| 17 | 2026r08-q089 zh | 語順「信息资产自身可能损害其价值的弱点」(4k §4) | 「資産自身が自分の価値を損なう」と読める語順 | ACCEPT。「可能损害信息资产自身价值的弱点」(正解解説、題幹) |
| 18 | 2026r08-q037 ア | 「(FP法、選択肢ではFP法を指す)」が冗長 (4k §4) | 選択肢アは「FP 法を用いて見積もる」で、補足は不要 | ACCEPT。「（FP法）」(jp / zh / en) |
| 19 | 2026r08-q089 ウ en | 引用符とカンマの位置 (4k §4) | 同じ field の "‘Vulnerability’, which" はカンマを外に置いている | ACCEPT。"‘weakness’, so" に揃えた |

集計: low 19 件 → **ACCEPT 19 / REJECT 0** (2 件は案を改良: #8 は短縮、#9 は重複を除去)。applied 70 = 解説の置換 43 + translations の置換 8 (sidecar 4 + .phase1 4) + note 後置 19 (題ごとに 1 本)。

## 2. 改写前後 — 解説 (逐字、HEAD の explanations と再生成後の比較から機械的に出力)

#### 2018h30h-q089 correct

- **jp**: (不変)
- **zh before**: LTE（Long Term Evolution）是在第三代（3G）移动电话通信的基础上进一步发展、能够实现更高速数据通信的移动电话无线通信规格。它作为可承载视频观看和大容量数据交换的移动线路而普及，常被定位为「3.9G」或实质上的 4G 世代技术。选项ウ「能够实现比第三代移动电话更高速数据通信的移动电话无线通信规格」这一表述与该定义完全一致，因此ウ正确。
- **zh after**: LTE（Long Term Evolution）是在第三代（3G）移动电话通信的基础上进一步发展、能够实现更高速数据通信的移动电话无线通信标准。它作为可承载视频观看和大容量数据交换的移动线路而普及，常被定位为「3.9G」或实质上的第四代（4G）技术。选项ウ「能够实现比第三代移动电话更高速数据通信的移动电话无线通信标准」这一表述与该定义完全一致，因此ウ正确。

- **en**: (不変)

#### 2018h30h-q089 d:ア

- **jp**: (不変)
- **zh before**: 不经过接入点、由终端之间直接通信的无线局域网（LAN）方式，是「自组网（ad hoc）模式」的说明（Wi-Fi Direct 也不经过接入点直接连接终端，但由一方终端作为组主承担接入点的角色，是另一种技术），与作为移动电话规格的 LTE 是两回事。
- **zh after**: 不经过接入点、由终端之间直接通信的无线局域网（LAN）方式，是「自组网（ad hoc）模式」的说明（Wi-Fi Direct 也不经过接入点直接连接终端，但由一方终端作为组主承担接入点的角色，是另一种技术），与作为移动电话标准的 LTE 是两回事。

- **en**: (不変)

#### 2018h30h-q089 d:エ

- **jp**: (不変)
- **zh before**: 设置在电波难以到达的家庭或办公室中的移动电话小型基站，是「毫微微蜂窝（femtocell）」的说明。LTE 指的是通信规格本身，并非指基站设备，因此错误。
- **zh after**: 设置在电波难以到达的家庭或办公室中的移动电话小型基站，是「毫微微蜂窝（femtocell）」的说明。LTE 指的是通信标准本身，并非指基站设备，因此错误。

- **en**: (不変)

#### 2018h30h-q089 p:0

- **jp**: (不変)
- **zh before**: LTE 是实现了比 3G 更高速数据通信的移动电话（移动端）无线通信规格（实质上属于 4G 世代）。
- **zh after**: LTE 是实现了比 3G 更高速数据通信的移动电话（移动端）无线通信标准（实质上属于第四代（4G））。

- **en**: (不変)

#### 2019r01a-q029 p:1

- **jp**: (不変)
- **zh before**: 它是「优化一方（网站运营者）所采取的对策」，要与开发搜索引擎本身或做日志分析区分开来。
- **zh after**: 它是网站运营者一方针对搜索引擎优化本公司网站的对策，要与开发搜索引擎本身或做日志分析区分开来。

- **en before**: It is a measure taken by the optimizing side (the site operator), and should be distinguished from developing the search engine itself or performing log analysis.
- **en after**: It is a measure taken by the site operator to optimize its own site for search engines, and should be distinguished from developing the search engine itself or performing log analysis.


#### 2021r03-q020 p:1

- **jp before**: 人が特徴量を設計しなくてもデータから自動で抽出できる (深層学習) のが機械学習の特徴で、画像認識では大量の画像から特徴量を学習する点が要点。
- **jp after**: 人が特徴量を設計しなくてもデータから自動で抽出できる点は深層学習の特徴で、画像認識では大量の画像から特徴量を学習する点が要点。

- **zh before**: 无需人来设计特征量、可以从数据中自动提取（深度学习），这是机器学习的特点；在图像识别中，从大量图像中学习特征量是要点。
- **zh after**: 无需人来设计特征、可以从数据中自动提取，这是深度学习的特点；在图像识别中，从大量图像中学习特征是要点。

- **en before**: A feature of machine learning is that features can be extracted automatically from data without people designing them (deep learning), and in image recognition the key point is learning feature quantities from a large number of images.
- **en after**: Extracting features automatically from data without people designing them is a characteristic of deep learning, and in image recognition the key point is learning feature quantities from a large number of images.


#### 2021r03-q020 correct

- **jp**: (不変)
- **zh before**: 机器学习是指向计算机提供大量数据，由计算机自身自动找出数据中潜藏的规律性和特征（特征量）的技术。选项イ写道「通过大量输入水果的照片，计算机自身能够自动提取水果的特征」，即从图像数据中自主学习特征量。这是图像识别系统中机器学习（尤其是像深度学习那样，不由人来设计特征量，而是从数据中自动提取）的典型实例，因此正确答案是イ。
- **zh after**: 机器学习是指向计算机提供大量数据，由计算机自身自动找出数据中潜藏的规律性和特征的技术。选项イ写道「通过大量输入水果的照片，计算机自身能够自动提取水果的特征」，即从图像数据中自主学习特征。这是图像识别系统中机器学习（尤其是像深度学习那样，不由人来设计特征，而是从数据中自动提取）的典型实例，因此正确答案是イ。

- **en**: (不変)

#### 2021r03-q020 p:0

- **jp**: (不変)
- **zh before**: 机器学习是指由计算机自身从大量数据中自动找出规律性和特征（特征量）的技术。
- **zh after**: 机器学习是指由计算机自身从大量数据中自动找出规律性和特征的技术。

- **en**: (不変)

#### 2021r03-q020 d:ウ

- **jp**: (不変)
- **zh before**: 用指纹的图像识别来解锁智能手机，同样是通过与已登记指纹比对的「生物识别认证」的使用例。其中不包含通过学习获得新特征的过程，因此不能算作机器学习的实例。
- **zh after**: 用指纹的图像识别来解锁智能手机，同样是通过与已登记指纹比对的「生物识别认证」的应用实例。其中不包含通过学习获得新特征的过程，因此不能算作机器学习的实例。

- **en**: (不変)

#### 2021r03-q058 p:1

- **jp before**: サークル型セキュリティゲートは一人ずつの通過を物理的に強制して共連れを防ぐ。アンチパスバックは入退室の記録の整合を確認し (入室記録の無い ID では退室させない)、共連れを検知・抑止する論理的な対策で、両者を区別して押さえる。
- **jp after**: サークル型セキュリティゲートは一人ずつの通過を物理的に強制して共連れを防ぐ。アンチパスバックは入退室の記録の整合を確認し (入室記録の無い ID では退室させない)、共連れを検知・抑止する仕組み (物理的な障壁ではなく記録で判定する入退室管理) で、両者を区別して押さえる。

- **zh before**: 环形安全闸门在物理上强制逐人通过以防止尾随。反潜回（Anti-passback）则是核对出入室记录是否一致（没有入室记录的 ID 不允许出室）、从而检测和抑制尾随的逻辑性对策，两者要区分开来。
- **zh after**: 环形安全闸门在物理上强制逐人通过以防止尾随。反潜回（Anti-passback）则是核对出入室记录是否一致（没有入室记录的 ID 不允许离开）、从而检测和抑制尾随的机制（不是物理屏障，而是依据记录进行判定的出入室管理），两者要区分开来。

- **en before**: A circle-type security gate physically enforces one-at-a-time passage to prevent tailgating. Anti-passback is a logical control that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating; distinguish the two.
- **en after**: A circle-type security gate physically enforces one-at-a-time passage to prevent tailgating. Anti-passback is a mechanism that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating, a record-based entry/exit control rather than a physical barrier; distinguish the two.


#### 2022r04-q074 correct

- **jp**: (不変)
- **zh before**: 正确答案是ア「反潜回（Anti-passback）」。反潜回是出入室管理中强制入场与出场顺序一致的机制：某个 ID 进入后，若没有退出记录就无法再次进入；只有已退出的 ID 才能再次进入。通过尾随（piggyback，一次认证让多人接连进入）进入的人，其 ID 没有入室记录，因此出室（以及之后的入室）认证会被拒绝，非法入室就会暴露，从而检测和抑制尾随（把已进入的卡借给外面的人再次进入，也会被同一机制拒绝）。
- **zh after**: 正确答案是ア「反潜回（Anti-passback）」。反潜回是出入室管理中强制入场与出场顺序一致的机制：某个 ID 进入后，若没有退出记录就无法再次进入；只有已退出的 ID 才能再次进入。通过尾随（piggyback，一次认证让多人接连进入）进入的人，其 ID 没有入室记录，因此离开（以及之后的进入）时的认证会被拒绝，非法入室就会暴露，从而检测和抑制尾随（把已进入的卡借给外面的人再次进入，也会被同一机制拒绝）。

- **en**: (不変)

#### 2022r04-q074 p:0

- **jp**: (不変)
- **zh before**: 反潜回（Anti-passback）= 强制出入室记录的顺序一致，拒绝没有入室记录的 ID 出室，以检测和抑制尾随（piggyback）（已进入 ID 的再次进入也会被拒绝）的物理出入室管理对策。
- **zh after**: 反潜回（Anti-passback）= 强制出入室记录的顺序一致，拒绝没有入室记录的 ID 离开，以检测和抑制尾随（piggyback）（已进入 ID 的再次进入也会被拒绝）的物理出入室管理对策。

- **en**: (不変)

#### 2022r04-q084 d:イ

- **jp before**: DVD は光ディスクの記録媒体で、ディスクをモータで回転させ、レーザ光で読み書きする。ディスクを回す駆動機構を持つため「物理的な駆動機構をもたない」という条件に反する。
- **jp after**: DVD は光ディスクの記録媒体で、ディスクをモータで回転させ、レーザ光で読み書きする。読み書きにはディスクを回す駆動機構を持つドライブが必要になるため「物理的な駆動機構をもたない」という条件に反する。

- **zh before**: DVD 是光盘类存储介质，由电机旋转盘片、用激光读写。它带有旋转盘片的驱动机构，因此不符合「不具有物理驱动机构」这一条件。
- **zh after**: DVD 是光盘类存储介质，由电机旋转盘片、用激光读写。读写时需要带有旋转盘片驱动机构的驱动器，因此不符合「不具有物理驱动机构」这一条件。

- **en before**: A DVD is an optical-disc storage medium in which the disc is spun by a motor and read and written with a laser beam. Because it has a drive mechanism that rotates the disc, it violates the condition of having no physical drive mechanism.
- **en after**: A DVD is an optical-disc storage medium in which the disc is spun by a motor and read and written with a laser beam. Because reading and writing require a drive with a mechanism that rotates the disc, it violates the condition of having no physical drive mechanism.


#### 2022r04-q094 d:イ

- **jp**: (不変)
- **zh before**: 用钢针（针）把色带敲击到纸张上进行打印的，是点阵式打印机（针式打印机）的说明。由于它靠物理敲击来打印，可以支持复写纸（复印纸），但与喷墨的喷射方式不同。
- **zh after**: 用钢针（针）把色带敲击到纸张上进行打印的，是点阵式打印机（针式打印机）的说明。由于它靠物理敲击来打印，可以支持多联复写纸，但与喷墨的喷射方式不同。

- **en**: (不変)

#### 2022r04-q022 d:ウ

- **jp**: (不変)
- **zh before**: 明确提供给顾客的价值是在采购、开发、制造、销售、服务等一连串企业活动的哪一环节中产生的，这是价值链（价值连锁）分析的说明，而不是在整条供应链上共享并管理库存、销售信息的 SCM 的目的。
- **zh after**: 明确提供给顾客的价值是在采购、开发、制造、销售、服务等一连串企业活动的哪一环节中产生的，这是价值链分析的说明，而不是在整条供应链上共享并管理库存、销售信息的 SCM 的目的。

- **en**: (不変)

#### 2022r04-q068 p:1

- **jp before**: 類似機能との区別: マルウェア検査は検疫ネットワーク、ボタン操作での簡単接続は WPS。
- **jp after**: 類似機能との区別: マルウェア検査は検疫ネットワーク、ボタン操作での簡単接続は WPS、SSID 空欄での接続は ANY 接続。

- **zh before**: 与相似功能的区分：恶意软件检查是检疫网络，仅靠按键操作的简易连接是 WPS。
- **zh after**: 与相似功能的区分：恶意软件检查是检疫网络，仅靠按键操作的简易连接是 WPS，把 SSID 留空进行的连接是 ANY 连接。

- **en before**: Distinguishing from similar features: malware inspection is the quarantine network, and easy connection via button operation only is WPS.
- **en after**: Distinguishing from similar features: malware inspection is the quarantine network, easy connection via button operation only is WPS, and connecting with a blank SSID is ANY connection.


#### 2023r05-q100 d:ウ

- **jp**: (不変)
- **zh before**: 处理两个表这一点虽然与连接相似，但「抽取具有相同值的记录」更接近交集（积）这类集合运算的说明，与按字段的值把行对应起来横向拼接的连接定义并不一致。
- **zh after**: 处理两个表这一点虽然与连接相似，但「抽取具有相同值的记录」更接近交集这类集合运算的说明，与按字段的值把行对应起来横向拼接的连接定义并不一致。

- **en**: (不変)

#### 2023r05-q055 d:エ

- **jp**: (不変)
- **zh before**: 14 人在剩余 10 天内为 14×10＝140 人日，相对于 110 人日大幅过剩。这是从全部 150 人日中减去的不是已完成的 40 人日、而是最初 5 天的不足量 10 人日，把剩余工作量算成 140 人日的错误（140÷10 天＝14 人）。
- **zh after**: 14 人在剩余 10 天内为 14×10＝140 人日，相对于 110 人日大幅过剩。这是没有从全部 150 人日中减去已完成的 40 人日，而是减去了最初 5 天的不足量 10 人日，从而把剩余工作量算成 140 人日的错误（140÷10 天＝14 人）。

- **en**: (不変)

#### 2024r06-q009 d:イ

- **jp before**: 特定の集団と活動を共にしたり人々の動きを観察したりして慣習・嗜好・文化を類推する、というのは「エスノグラフィ」(参与観察やフィールドワークによって集団の文化を理解する手法) の説明です。数量を論理的に概算するフェルミ推定とは目的も手法も異なります。
- **jp after**: 特定の集団と活動を共にしたり人々の動きを観察したりして慣習・嗜好・文化を類推する、というのは「エスノグラフィ」（参与観察やフィールドワークによって集団の文化を理解する手法）の説明です。数量を論理的に概算するフェルミ推定とは目的も手法も異なります。

- **zh**: (不変)
- **en**: (不変)

#### 2024r06-q012 d:イ

- **jp before**: AIの開発・提供・利用に携わった関係者が問題の特性に応じて責任を分担するという記述で、これは「人間中心の原則」(AI の利用は人が判断・決定し、結果の責任は関係者が分担して負う) に関するもの。イノベーションの原則ではない。
- **jp after**: AIの開発・提供・利用に携わった関係者が問題の特性に応じて責任を分担するという記述で、これは「人間中心の原則」（AI の利用は人が判断・決定し、結果の責任は関係者が分担して負う）に関するもの。イノベーションの原則ではない。

- **zh**: (不変)
- **en**: (不変)

#### 2024r06-q055 d:ア

- **jp before**: 「開発すべきシステムの用途を分析しシステム要件を明らかにする」のは、システム開発の上流工程である要件定義（要求分析）の説明であり、監査の目的ではない。監査は独立した立場でシステムを (開発中のものを含むライフサイクル全体にわたって) 点検・評価するもので、要件を決める当事者ではない。
- **jp after**: 「開発すべきシステムの用途を分析しシステム要件を明らかにする」のは、システム開発の上流工程である要件定義（要求分析）の説明であり、監査の目的ではない。監査は独立した立場でシステムを（開発中のものを含むライフサイクル全体にわたって）点検・評価するもので、要件を決める当事者ではない。

- **zh**: (不変)
- **en**: (不変)

#### 2025r07-q033 d:イ

- **jp before**: 「人間が運転する必要がなく運転装置は不要」かつ「自動運転できる地域は限られる」という記述は、限定された地域で運転装置の無い車両が無人で走るレベル4「高度運転自動化」の説明である (運転装置が不要なことはレベル5 だけの特徴ではない)。レベル3は人間の引き継ぎを前提とするため運転装置が必要であり、この記述はレベル3には当てはまらない。
- **jp after**: 「人間が運転する必要がなく運転装置は不要」かつ「自動運転できる地域は限られる」という記述は、限定された地域であれば運転装置の無い車両でも無人で走行できるレベル4「高度運転自動化」の説明である (運転装置が不要なことはレベル5 だけの特徴ではない)。レベル3は人間の引き継ぎを前提とするため運転装置が必要であり、この記述はレベル3には当てはまらない。

- **zh before**: 「人类无需驾驶、不需要驾驶装置」且「可以自动驾驶的区域有限」这一描述，是在限定区域内由没有驾驶装置的车辆无人行驶的级别4「高度自动驾驶」的说明（不需要驾驶装置并不只是级别5的特征）。级别3以人类接管为前提，因此需要驾驶装置，该描述并不适用于级别3。
- **zh after**: 「人类无需驾驶、不需要驾驶装置」且「可以自动驾驶的区域有限」这一描述，是在限定区域内即使是没有驾驶装置的车辆也能无人行驶的级别4「高度自动驾驶」的说明（不需要驾驶装置并不只是级别5的特征）。级别3以人类接管为前提，因此需要驾驶装置，该描述并不适用于级别3。

- **en before**: The statement that “the human does not need to drive and driving devices are unnecessary” and “the areas where autonomous driving is possible are limited” describes Level 4, “high driving automation,” in which vehicles without driving devices run unmanned within limited areas (not needing driving devices is not a feature of Level 5 alone). Because Level 3 assumes that the human takes over, driving devices are needed, so this statement does not apply to Level 3.
- **en after**: The statement that “the human does not need to drive and driving devices are unnecessary” and “the areas where autonomous driving is possible are limited” describes Level 4, “high driving automation,” in which, within limited areas, even vehicles without driving devices can run unmanned (not needing driving devices is not a feature of Level 5 alone). Because Level 3 assumes that the human takes over, driving devices are needed, so this statement does not apply to Level 3.


#### 2025r07-q051 correct

- **jp**: (不変)
- **zh before**: 对系统审计人员而言，最重要的要求是相对于被审计对象的独立性（不存在利害关系）以及完成审计所需的专业能力。选项エ「隶属于经营者直辖组织、具备财务与IT知识的员工」既不是审计对象——财务系统的开发、运维、使用——中的任何一方当事人，处于独立的立场，又同时具备财务业务和IT两方面的知识，因此能够客观且准确地实施内部审计。由于隶属于经营者直辖组织，可以将审计结果直接报告给经营者，从而确保审计的实效性与独立性，这一点也很恰当。
- **zh after**: 对系统审计人员而言，最重要的要求是相对于被审计对象的独立性（不存在利害关系）以及完成审计所需的专业能力。选项エ「隶属于经营者直属部门、具备财务与IT知识的员工」既不是审计对象——财务系统的开发、运维、使用——中的任何一方当事人，处于独立的立场，又同时具备财务业务和IT两方面的知识，因此能够客观且准确地实施内部审计。由于隶属于经营者直属部门，可以将审计结果直接报告给经营者，从而确保审计的实效性与独立性，这一点也很恰当。

- **en**: (不変)

#### 2025r07-q051 p:1

- **jp**: (不変)
- **zh before**: 为了确保审计的客观性与实效性，最好将审计人员置于经营者直辖组织等独立于被审计部门的立场，并能够将结果报告给经营者。
- **zh after**: 为了确保审计的客观性与实效性，最好将审计人员置于经营者直属部门等独立于被审计部门的立场，并能够将结果报告给经营者。

- **en**: (不変)

#### 2026r08-q089 correct

- **jp**: (不変)
- **zh before**: 正确答案是イ。题目将 a 定义为「对需要保护的信息资产可能产生不良影响的原因」，将 b 定义为「信息资产自身可能损害其价值的弱点」。在信息安全中，把外部攻击、灾害、人为失误等引发损失的原因称为「威胁」，所以 a 是「威胁」；而被该威胁所利用的管理、技术、设计上的缺陷（即弱点）称为「脆弱性」，所以 b 是「脆弱性」。因此 a：威胁 b：脆弱性 的组合正确，イ 为正确答案。此外，威胁利用脆弱性而可能产生损失的可能性即为「风险」，三者关系可归纳为「风险＝威胁×脆弱性」。
- **zh after**: 正确答案是イ。题目将 a 定义为「对需要保护的信息资产可能产生不良影响的原因」，将 b 定义为「可能损害信息资产自身价值的弱点」。在信息安全中，把外部攻击、灾害、人为失误等引发损失的原因称为「威胁」，所以 a 是「威胁」；而被该威胁所利用的管理、技术、设计上的缺陷（即弱点）称为「脆弱性」，所以 b 是「脆弱性」。因此 a：威胁 b：脆弱性 的组合正确，イ 为正确答案。此外，威胁利用脆弱性而可能产生损失的可能性即为「风险」，三者关系可归纳为「风险＝威胁×脆弱性」。

- **en**: (不変)

#### 2026r08-q089 d:ウ

- **jp**: (不変)
- **zh**: (不変)
- **en before**: ‘Vulnerability’, which belongs in b, has been placed in a. ‘Vulnerability’ means a weakness, so it corresponds to the definition of b and is inappropriate for a (the cause). Furthermore, the ‘incident’ placed in b is an event that has occurred, not a ‘weakness,’ so neither fits.
- **en after**: ‘Vulnerability’, which belongs in b, has been placed in a. ‘Vulnerability’ means a weakness, so it corresponds to the definition of b and is inappropriate for a (the cause). Furthermore, the ‘incident’ placed in b is an event that has occurred, not a ‘weakness’, so neither fits.


#### 2026r08-q037 d:ア

- **jp before**: ファンクションポイント法（FP法、選択肢ではFP法を指す）は、入力・出力・ファイルなどソフトウェアの機能の数と複雑度を数えて規模を求め、そこから工数や費用を見積もる手法。機能仕様がある程度明確になっている必要があり、機能を数える作業にも手間がかかるため、要件が固まっていない計画初期に短時間で概算する用途には向かない。
- **jp after**: ファンクションポイント法（FP法）は、入力・出力・ファイルなどソフトウェアの機能の数と複雑度を数えて規模を求め、そこから工数や費用を見積もる手法。機能仕様がある程度明確になっている必要があり、機能を数える作業にも手間がかかるため、要件が固まっていない計画初期に短時間で概算する用途には向かない。

- **zh before**: 功能点法（FP 法；选项中指的即 FP 法）是通过数出输入、输出、文件等软件功能的数量与复杂度来求得规模，再据此估算工时和费用的方法。它要求功能规格已在一定程度上明确，而且数功能这项作业本身也很费工夫，因此不适合在需求尚未确定的计划初期、于短时间内进行概算的用途。
- **zh after**: 功能点法（FP 法）是通过数出输入、输出、文件等软件功能的数量与复杂度来求得规模，再据此估算工时和费用的方法。它要求功能规格已在一定程度上明确，而且数功能这项作业本身也很费工夫，因此不适合在需求尚未确定的计划初期、于短时间内进行概算的用途。

- **en before**: The Function Point method (FP method; this is what the choice refers to) determines scale by counting the number and complexity of software functions such as inputs, outputs, and files, and then estimates effort and cost from that. It requires the functional specifications to be reasonably clear, and the work of counting functions is itself time-consuming, so it is not suited for making a rough estimate in a short time in the early planning phase when requirements are not yet fixed.
- **en after**: The Function Point method (FP method) determines scale by counting the number and complexity of software functions such as inputs, outputs, and files, and then estimates effort and cost from that. It requires the functional specifications to be reasonably clear, and the work of counting functions is itself time-consuming, so it is not suited for making a rough estimate in a short time in the early planning phase when requirements are not yet fixed.


## 3. ゲート

| ゲート | 結果 |
|---|---|
| `--apply` → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs` ×9 (2018h30h 2019r01a 2020r02o 2021r03 2022r04 2023r05 2024r06 2025r07 2026r08、exam を明示して実行) | ✅ applied 70 |
| 変更範囲 | ✅ HEAD との差分を題 id 単位で比べると、explanations は対象の 19 題だけ、translations は 4 題だけ (§0 の 4 field、zh のみ)。トップレベルは 18 file とも同一 |
| 冪等: efix5 dry-run 再実行 | ✅ applied 0 / skipped 70。efix4b〜4k も全て applied 0 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |
| tsc / eslint / vitest / build | ✅ exit 0 / 0 errors (既存 warning 1) / 38 passed・1 skipped (39 files)、563 passed・2 skipped / Compiled successfully |

Rule B: 失敗した attempt なし。

## 4. Rule D 後の amend (同じ script・冪等)

Rule D (PASS-with-notes) の low 3 件 + info 1 件を、提案文どおりに直した (lead の方針: low も直す)。

| # | 題 | 処置 |
|---|---|---|
| N1 | 2021r03-q058 要点 2 en | 後半を "Anti-passback is a record-based entry/exit control, not a physical barrier, that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating; distinguish the two." に置き換えた |
| N2 | 2018h30h-q089 要点 1 zh | 「（实质上属于第四代（4G））」→「（实质上属于第四代 4G）」(括弧の入れ子を解消) |
| N3 | 2021r03-q020 en | "feature quantities" を "features" に揃えた: 要点 2 "learning features from a large number of images"、ほかに同じ題の正解解説 2 箇所と要点 1 も |
| info | 2022r04-q068 要点 2 en | "is ANY connection" → "is an ANY connection" |

amend の適用は applied 11 (置換 7 + note 後置 4。同じ題の 2 本目の note で、後置済みかは note の全文で判定する) → build → merge 3 exam (2018h30h 2021r03 2022r04)。

**Rule B**: 1 回目の再実行が applied 1 で冪等でなかった。efix5 初版の q058 en の行の from (短い末尾片) が、最終形の末尾と一致して再び当たったため。初版の 2 行を「HEAD の元の文全体 → 最終形」の 1 行にまとめて解消した (`failures/quiz_efix5_amend_idempotency_S131_attempt_1.md`)。データへの影響は無し (dry-run で検出)。

再実行 applied 0 / skipped 80、crosscheck `--require-raw` all invariants hold、pagefix GREEN、chumon 一致、correct_answer 差分 0、questions.json / answer_keys.json の md5 不変。2021r03-q020 の en に "feature quantit" は 0 件。

逐字前後 (amend の対象 field、amend 前 = efix5 初版の適用後):

```
## 2018h30h-q089 p:0
JP: LTE は 3G より高速なデータ通信を実現した携帯電話 (モバイル) 向けの無線通信規格 (実質 4G 世代) である。
ZH: LTE 是实现了比 3G 更高速数据通信的移动电话（移动端）无线通信标准（实质上属于第四代（4G））。
EN: LTE is a wireless communication standard for mobile phones (mobile) that achieves higher-speed data communication than 3G (effectively a 4G-generation technology).
## 2021r03-q058 p:1
JP: サークル型セキュリティゲートは一人ずつの通過を物理的に強制して共連れを防ぐ。アンチパスバックは入退室の記録の整合を確認し (入室記録の無い ID では退室させない)、共連れを検知・抑止する仕組み (物理的な障壁ではなく記録で判定する入退室管理) で、両者を区別して押さえる。
ZH: 环形安全闸门在物理上强制逐人通过以防止尾随。反潜回（Anti-passback）则是核对出入室记录是否一致（没有入室记录的 ID 不允许离开）、从而检测和抑制尾随的机制（不是物理屏障，而是依据记录进行判定的出入室管理），两者要区分开来。
EN: A circle-type security gate physically enforces one-at-a-time passage to prevent tailgating. Anti-passback is a mechanism that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating, a record-based entry/exit control rather than a physical barrier; distinguish the two.
## 2021r03-q020 correct
JP: 機械学習とは、大量のデータをコンピュータに与え、コンピュータ自身がそのデータに潜む規則性や特徴 (特徴量) を自動的に見つけ出す技術である。イは「果物の写真を大量に入力することで、コンピュータ自身が果物の特徴を自動的に抽出できるようになった」とあり、画像データから特徴量を自ら学習している。これは画像認識システムにおける機械学習 (とくに深層学習のように、人が特徴量を設計せずにデータから自動で抽出する点) の典型的な事例であり、正解はイ。
ZH: 机器学习是指向计算机提供大量数据，由计算机自身自动找出数据中潜藏的规律性和特征的技术。选项イ写道「通过大量输入水果的照片，计算机自身能够自动提取水果的特征」，即从图像数据中自主学习特征。这是图像识别系统中机器学习（尤其是像深度学习那样，不由人来设计特征，而是从数据中自动提取）的典型实例，因此正确答案是イ。
EN: Machine learning is a technology in which a large amount of data is given to a computer, and the computer itself automatically discovers the regularities and features (feature quantities) hidden in that data. Choice イ states that “by feeding a large number of fruit photos into a computer, the computer itself became able to automatically extract the features of the fruit,” meaning it learns the feature quantities from the image data on its own. This is a typical example of machine learning in an image recognition system (in particular, as in deep learning, features are extracted automatically from the data without people designing them), so the correct answer is イ.
## 2021r03-q020 p:0
JP: 機械学習とは、大量のデータからコンピュータ自身が規則性・特徴 (特徴量) を自動的に見つけ出す技術であること。
ZH: 机器学习是指由计算机自身从大量数据中自动找出规律性和特征的技术。
EN: Machine learning is a technology in which the computer itself automatically discovers regularities and features (feature quantities) from a large amount of data.
## 2021r03-q020 p:1
JP: 人が特徴量を設計しなくてもデータから自動で抽出できる点は深層学習の特徴で、画像認識では大量の画像から特徴量を学習する点が要点。
ZH: 无需人来设计特征、可以从数据中自动提取，这是深度学习的特点；在图像识别中，从大量图像中学习特征是要点。
EN: Extracting features automatically from data without people designing them is a characteristic of deep learning, and in image recognition the key point is learning feature quantities from a large number of images.
## 2022r04-q068 p:1
JP: 類似機能との区別: マルウェア検査は検疫ネットワーク、ボタン操作での簡単接続は WPS、SSID 空欄での接続は ANY 接続。
ZH: 与相似功能的区分：恶意软件检查是检疫网络，仅靠按键操作的简易连接是 WPS，把 SSID 留空进行的连接是 ANY 连接。
EN: Distinguishing from similar features: malware inspection is the quarantine network, easy connection via button operation only is WPS, and connecting with a blank SSID is ANY connection.
```

↓ amend 後

```
## 2018h30h-q089 p:0
JP: LTE は 3G より高速なデータ通信を実現した携帯電話 (モバイル) 向けの無線通信規格 (実質 4G 世代) である。
ZH: LTE 是实现了比 3G 更高速数据通信的移动电话（移动端）无线通信标准（实质上属于第四代 4G）。
EN: LTE is a wireless communication standard for mobile phones (mobile) that achieves higher-speed data communication than 3G (effectively a 4G-generation technology).
## 2021r03-q058 p:1
JP: サークル型セキュリティゲートは一人ずつの通過を物理的に強制して共連れを防ぐ。アンチパスバックは入退室の記録の整合を確認し (入室記録の無い ID では退室させない)、共連れを検知・抑止する仕組み (物理的な障壁ではなく記録で判定する入退室管理) で、両者を区別して押さえる。
ZH: 环形安全闸门在物理上强制逐人通过以防止尾随。反潜回（Anti-passback）则是核对出入室记录是否一致（没有入室记录的 ID 不允许离开）、从而检测和抑制尾随的机制（不是物理屏障，而是依据记录进行判定的出入室管理），两者要区分开来。
EN: A circle-type security gate physically enforces one-at-a-time passage to prevent tailgating. Anti-passback is a record-based entry/exit control, not a physical barrier, that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating; distinguish the two.
## 2021r03-q020 correct
JP: 機械学習とは、大量のデータをコンピュータに与え、コンピュータ自身がそのデータに潜む規則性や特徴 (特徴量) を自動的に見つけ出す技術である。イは「果物の写真を大量に入力することで、コンピュータ自身が果物の特徴を自動的に抽出できるようになった」とあり、画像データから特徴量を自ら学習している。これは画像認識システムにおける機械学習 (とくに深層学習のように、人が特徴量を設計せずにデータから自動で抽出する点) の典型的な事例であり、正解はイ。
ZH: 机器学习是指向计算机提供大量数据，由计算机自身自动找出数据中潜藏的规律性和特征的技术。选项イ写道「通过大量输入水果的照片，计算机自身能够自动提取水果的特征」，即从图像数据中自主学习特征。这是图像识别系统中机器学习（尤其是像深度学习那样，不由人来设计特征，而是从数据中自动提取）的典型实例，因此正确答案是イ。
EN: Machine learning is a technology in which a large amount of data is given to a computer, and the computer itself automatically discovers the regularities and features hidden in that data. Choice イ states that “by feeding a large number of fruit photos into a computer, the computer itself became able to automatically extract the features of the fruit,” meaning it learns the features from the image data on its own. This is a typical example of machine learning in an image recognition system (in particular, as in deep learning, features are extracted automatically from the data without people designing them), so the correct answer is イ.
## 2021r03-q020 p:0
JP: 機械学習とは、大量のデータからコンピュータ自身が規則性・特徴 (特徴量) を自動的に見つけ出す技術であること。
ZH: 机器学习是指由计算机自身从大量数据中自动找出规律性和特征的技术。
EN: Machine learning is a technology in which the computer itself automatically discovers regularities and features from a large amount of data.
## 2021r03-q020 p:1
JP: 人が特徴量を設計しなくてもデータから自動で抽出できる点は深層学習の特徴で、画像認識では大量の画像から特徴量を学習する点が要点。
ZH: 无需人来设计特征、可以从数据中自动提取，这是深度学习的特点；在图像识别中，从大量图像中学习特征是要点。
EN: Extracting features automatically from data without people designing them is a characteristic of deep learning, and in image recognition the key point is learning features from a large number of images.
## 2022r04-q068 p:1
JP: 類似機能との区別: マルウェア検査は検疫ネットワーク、ボタン操作での簡単接続は WPS、SSID 空欄での接続は ANY 接続。
ZH: 与相似功能的区分：恶意软件检查是检疫网络，仅靠按键操作的简易连接是 WPS，把 SSID 留空进行的连接是 ANY 连接。
EN: Distinguishing from similar features: malware inspection is the quarantine network, easy connection via button operation only is WPS, and connecting with a blank SSID is an ANY connection.
```

## 5. Rule D (verifier type、opus、編集なし) と lead の確認

判定 **PASS-with-notes** (ブロッカー 0)。19 件すべて VERIFIED。sidecar の zh 4 field は jp の原文と意味が一致し、`.phase1` とも一致する。除外 5 項目・key_guard 元文・round1・correct_answer はすべて不変。dry-run は applied 0 / skipped 70、crosscheck は all invariants hold。
Rule D の low N1〜N3 と info 1 件は、ユーザー方針 (D-178: low も直す) に従い、§4 の amend で提案文そのままに適用した。amend の最初の attempt は冪等でなかった (再実行で applied 1)。Rule B として `failures/quiz_efix5_amend_idempotency_S131_attempt_1.md` に記録してある。
lead の確認 (amend の後):
- dry-run は applied 0 / skipped 80、crosscheck は all invariants hold、questions.json の md5 は `110697d9…` で不変
- q058 の en 要点 2 は最終形が 1 回だけ入っており、重複は無い
- q020 の "feature quantit" は本文に 0 件 (note の説明文にだけ残る)
- q089 の zh 要点 1 は「（实质上属于第四代 4G）」、q068 の en は "an ANY connection"
- amend した 4 題は efix5 の note が 2 本ずつ (初回分 + amend 分)
