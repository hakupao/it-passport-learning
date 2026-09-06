# D-142 hosting/housing zh 訳語 横断正規化 — 全件 before/after (S117)

- 実行: `node scripts/quiz-zhterm-hosting-D142.mjs` (3 回。run1 = 出荷層 37 + 入力層 tr_/expl_tr_ 28、run3 = 入力層 input_ 31 [reviewer 指摘で追加])
- 見出し語: ホスティング → 主机租用（hosting） / ハウジング → 机房托管（housing/colocation）。禁止語 主机托管 / 服务器托管。
- jp / en フィールドは不変。key_guard.note_jp は対象外。
- 冪等性: 最終状態で `--dry-run` = 0 fields、禁止語残存 0 files (出荷層 + 入力層)。
- Rule D: `reviewer-d142` (oh-my-claudecode:code-reviewer) が run1 の 65 フィールド全件を JP 原文と突き合わせ **PASS** (S117 log §6)。
- **Rule B 記録**: run1 の evidence は run2 (入力層 0 件の空振り再実行) と run3 に上書きされ、入力層 tr_/expl_tr_ 28 件の before/after 原記録は失われた。
  出荷層 37 件は git HEAD との差分から再生成 (下記 §出荷層)、入力層は run3 の 31 件のみ原記録が残る (下記 §入力層)。
  失われた 28 件の正しさは「是正後に対象 8 exam を再 merge しても sidecar が byte 同一」で間接的に担保。
  再発防止として script の evidence 書き込みを追記モードに変更。

## 出荷層 (translations / explanations / textbook units) — git HEAD との zh 差分 37 フィールド / 11 ID

| id | 件数 |
|---|---|
| 2009h21a-q006 | 2 |
| 2009h21a-q017 | 3 |
| 2009h21h-q006 | 1 |
| 2010h22h-q022 | 3 |
| 2011h23a-q005 | 10 |
| 2012h24a-q100 | 1 |
| 2013h25h-q004 | 2 |
| 2016h28h-q006 | 3 |
| 2019h31h-q052 | 1 |
| 2023r05-q047 | 1 |
| strategy-06-20-u03 | 10 |

### 2009h21a-q006 `.distractors.ウ.zh` (data/ip/quiz/explanations/2009h21a.json)

- before: 服务提供商把设置在自己建筑物内（即提供商所拥有）的服务器或通信设备出租给用户的服务，说的是主机托管服务（hosting，即租用服务器）。这是与机房托管服务（housing）容易混淆的经典对比，区别在于设备的所有者是提供商一方。
- after : 服务提供商把设置在自己建筑物内（即提供商所拥有）的服务器或通信设备出租给用户的服务，说的是主机租用服务（hosting，即租用服务器）。这是与机房托管服务（housing）容易混淆的经典对比，区别在于设备的所有者是提供商一方。

### 2009h21a-q006 `.points.1.zh` (data/ip/quiz/explanations/2009h21a.json)

- before: 要点在于与主机托管服务（hosting）区分：hosting 出租的是提供商所有的设备，housing 是让用户放置自己所有的设备。再与 SaaS（提供软件）、外包（承接业务）做三者对比来记忆。
- after : 要点在于与主机租用服务（hosting）区分：hosting 出租的是提供商所有的设备，housing 是让用户放置自己所有的设备。再与 SaaS（提供软件）、外包（承接业务）做三者对比来记忆。

### 2009h21a-q017 `.correct.zh` (data/ip/quiz/explanations/2009h21a.json)

- before: 正确答案是「エ 主机托管服务（hosting）」。竖着读表格：A 公司在「安放计算机和通信设备的场所」和「所安放的计算机和通信设备」这两行都打了〇，也就是场所和硬件都由 A 公司准备好后出租给 B 公司。而 B 公司的〇只出现在「在计算机上运行的业务应用程序」这一行，B 公司只是把自己的业务应用程序放到租来的服务器上运行而已。服务商一方连服务器等设备都自己拥有并提供，用户则租用这些设备来运行软件——这种分工正是主机托管服务（hosting，即出租服务器，通常所说的租用服务器）。
- after : 正确答案是「エ 主机租用服务（hosting）」。竖着读表格：A 公司在「安放计算机和通信设备的场所」和「所安放的计算机和通信设备」这两行都打了〇，也就是场所和硬件都由 A 公司准备好后出租给 B 公司。而 B 公司的〇只出现在「在计算机上运行的业务应用程序」这一行，B 公司只是把自己的业务应用程序放到租来的服务器上运行而已。服务商一方连服务器等设备都自己拥有并提供，用户则租用这些设备来运行软件——这种分工正是主机租用服务（hosting，即出租服务器，通常所说的租用服务器）。

### 2009h21a-q017 `.points.0.zh` (data/ip/quiz/explanations/2009h21a.json)

- before: 区分机房托管（housing）和主机托管（hosting）的关键是「设备由谁准备」。只出租设施 = 机房托管（colocation）；连服务器等设备也一并出租 = 主机托管（租用服务器）。
- after : 区分机房托管（housing）和主机租用（hosting）的关键是「设备由谁准备」。只出租设施 = 机房托管（colocation）；连服务器等设备也一并出租 = 主机租用（租用服务器）。

### 2009h21h-q006 `.distractors.ア.zh` (data/ip/quiz/explanations/2009h21h.json)

- before: 这里提供的是「计算机设备的使用」，也就是服务器、存储、网络等硬件与基础设施部分，而不是软件的功能。按云的分层来说，这是 IaaS（Infrastructure as a Service）的说明，或者是出租数据中心设备和线路的机房托管（housing）服务、主机托管（hosting）服务的说明。虽然按使用费收费这一点与 SaaS 相同，但用户必须在租来的设备上自己准备并运行软件，与直接使用现成软件功能的 SaaS 在提供范围上并不相同。
- after : 这里提供的是「计算机设备的使用」，也就是服务器、存储、网络等硬件与基础设施部分，而不是软件的功能。按云的分层来说，这是 IaaS（Infrastructure as a Service）的说明，或者是出租数据中心设备和线路的机房托管（housing）服务、主机租用（hosting）服务的说明。虽然按使用费收费这一点与 SaaS 相同，但用户必须在租来的设备上自己准备并运行软件，与直接使用现成软件功能的 SaaS 在提供范围上并不相同。

### 2010h22h-q022 `.distractors.イ.zh` (data/ip/quiz/explanations/2010h22h.json)

- before: 连服务器的购置费用也能降低，这是主机托管服务（hosting，即租用服务器）的效果。主机托管是租用运营商所拥有的服务器来使用的形态，因此用户不需要购买设备，设备故障处理等运营负担也由运营商承担。与此相对，机房托管中寄放的服务器是用户的所有物，购置费用和设备的运行维护仍然由用户负担。其中只有与网络相关的费用会下降这一部分是成立的，但由于服务器购置费用和运营负担的降低并不成立，所以它不能算最适当的选项。
- after : 连服务器的购置费用也能降低，这是主机租用服务（hosting，即租用服务器）的效果。主机租用是租用运营商所拥有的服务器来使用的形态，因此用户不需要购买设备，设备故障处理等运营负担也由运营商承担。与此相对，机房托管中寄放的服务器是用户的所有物，购置费用和设备的运行维护仍然由用户负担。其中只有与网络相关的费用会下降这一部分是成立的，但由于服务器购置费用和运营负担的降低并不成立，所以它不能算最适当的选项。

### 2010h22h-q022 `.points.0.zh` (data/ip/quiz/explanations/2010h22h.json)

- before: 区分机房托管（housing）和主机托管（hosting）的判断标准是「服务器由谁拥有」。机房托管是把用户所拥有的设备安放到运营商的设施中，租用场所、电源、空调、安全措施和线路的形态，能降低的是设施费和线路费；主机托管是租用运营商所拥有的服务器的形态，连服务器的购置费用和设备的运营负担也能降低。
- after : 区分机房托管（housing）和主机租用（hosting）的判断标准是「服务器由谁拥有」。机房托管是把用户所拥有的设备安放到运营商的设施中，租用场所、电源、空调、安全措施和线路的形态，能降低的是设施费和线路费；主机租用是租用运营商所拥有的服务器的形态，连服务器的购置费用和设备的运营负担也能降低。

### 2010h22h-q022 `.points.1.zh` (data/ip/quiz/explanations/2010h22h.json)

- before: 外部服务的利用形态可以按「把多少交给运营商」的层次来梳理：只租设施 = 机房托管，连服务器一起租 = 主机托管，连业务应用程序一起租 = ASP／SaaS。只要判断选项所列举的效果作用于哪一层的成本，就能选出正确答案。
- after : 外部服务的利用形态可以按「把多少交给运营商」的层次来梳理：只租设施 = 机房托管，连服务器一起租 = 主机租用，连业务应用程序一起租 = ASP／SaaS。只要判断选项所列举的效果作用于哪一层的成本，就能选出正确答案。

### 2011h23a-q005 `.correct.zh` (data/ip/quiz/explanations/2011h23a.json)

- before: 正确答案是「イ」(a-机房托管服务（housing/colocation）、b-主机托管服务（hosting）、c-SaaS)。判别的两个着眼点是「设备归谁所有」和「用户租用的是什么」。a 是把本公司拥有的服务器和通信设备搬进专门服务商的数据中心寄放的形态，所以租用的是安放场所（机架、电源、空调、线路），这就是机房托管服务（housing，即 colocation）。b 是用户租用专门服务商所拥有的通信设备或服务器的一部分来使用的形态，设备是服务商一方的，因此属于主机托管服务（hosting，即租用服务器）。c 是不购买、不安装软件本身，只在需要时通过网络使用所需功能的形态，这正是 SaaS（Software as a Service）的定义本身。把这三条依次对应，就得到 a-机房托管服务、b-主机托管服务、c-SaaS，与组合表中「イ」这一行一致。
- after : 正确答案是「イ」(a-机房托管服务（housing/colocation）、b-主机租用服务（hosting）、c-SaaS)。判别的两个着眼点是「设备归谁所有」和「用户租用的是什么」。a 是把本公司拥有的服务器和通信设备搬进专门服务商的数据中心寄放的形态，所以租用的是安放场所（机架、电源、空调、线路），这就是机房托管服务（housing，即 colocation）。b 是用户租用专门服务商所拥有的通信设备或服务器的一部分来使用的形态，设备是服务商一方的，因此属于主机租用服务（hosting，即租用服务器）。c 是不购买、不安装软件本身，只在需要时通过网络使用所需功能的形态，这正是 SaaS（Software as a Service）的定义本身。把这三条依次对应，就得到 a-机房托管服务、b-主机租用服务、c-SaaS，与组合表中「イ」这一行一致。

### 2011h23a-q005 `.distractors.ア.zh` (data/ip/quiz/explanations/2011h23a.json)

- before: 错在把 a 当成 SaaS、把 c 当成机房托管服务。a 讲的是「寄放本公司的服务器和通信设备」，属于硬件安放场所的话题，而不是通过网络使用软件功能的 SaaS。另外 c 是「仅使用软件中所需的功能」，因此不可能是出租设备安放场所的机房托管服务。只有 b-主机托管服务是对的，a 和 c 被调换了。
- after : 错在把 a 当成 SaaS、把 c 当成机房托管服务。a 讲的是「寄放本公司的服务器和通信设备」，属于硬件安放场所的话题，而不是通过网络使用软件功能的 SaaS。另外 c 是「仅使用软件中所需的功能」，因此不可能是出租设备安放场所的机房托管服务。只有 b-主机租用服务是对的，a 和 c 被调换了。

### 2011h23a-q005 `.distractors.ウ.zh` (data/ip/quiz/explanations/2011h23a.json)

- before: a-机房托管服务是对的，但 b 和 c 被调换了。b 是「用户可以使用专门服务商的通信设备或服务器的一部分」，出租的是硬件资源，所以是主机托管服务，而不是提供软件功能的 SaaS。反过来，c 是「在需要时仅通过网络使用软件中所需的功能」，用出租服务器的主机托管服务无法说明。
- after : a-机房托管服务是对的，但 b 和 c 被调换了。b 是「用户可以使用专门服务商的通信设备或服务器的一部分」，出租的是硬件资源，所以是主机租用服务，而不是提供软件功能的 SaaS。反过来，c 是「在需要时仅通过网络使用软件中所需的功能」，用出租服务器的主机租用服务无法说明。

### 2011h23a-q005 `.distractors.エ.zh` (data/ip/quiz/explanations/2011h23a.json)

- before: c-SaaS 是对的，但 a 和 b 被调换了。这是把机房托管服务和主机托管服务弄反的典型错误答案：像 a 那样「把本公司的设备寄放到服务商的设施里」是机房托管服务（housing），像 b 那样「租用服务商的设备来使用」才是主机托管服务（hosting）。按设备的所有者是本公司还是服务商来区分。
- after : c-SaaS 是对的，但 a 和 b 被调换了。这是把机房托管服务和主机租用服务弄反的典型错误答案：像 a 那样「把本公司的设备寄放到服务商的设施里」是机房托管服务（housing），像 b 那样「租用服务商的设备来使用」才是主机租用服务（hosting）。按设备的所有者是本公司还是服务商来区分。

### 2011h23a-q005 `.points.0.zh` (data/ip/quiz/explanations/2011h23a.json)

- before: 机房托管服务（housing/colocation）是把本公司拥有的设备寄放到服务商的设施（数据中心）中，租用安放场所、电源、空调和线路的形态。主机托管服务（hosting）是租用服务商所拥有的服务器或通信设备的一部分来使用的形态。用「设备的所有者是本公司还是服务商」来分辨。
- after : 机房托管服务（housing/colocation）是把本公司拥有的设备寄放到服务商的设施（数据中心）中，租用安放场所、电源、空调和线路的形态。主机租用服务（hosting）是租用服务商所拥有的服务器或通信设备的一部分来使用的形态。用「设备的所有者是本公司还是服务商」来分辨。

### 2011h23a-q005 `.points.1.zh` (data/ip/quiz/explanations/2011h23a.json)

- before: SaaS 是不购买、不部署软件，只在需要时通过网络把所需功能作为服务来使用的形态。机房托管和主机托管偏向于提供硬件，而 SaaS 提供的是应用层，这就是两者的区别。
- after : SaaS 是不购买、不部署软件，只在需要时通过网络把所需功能作为服务来使用的形态。机房托管和主机租用偏向于提供硬件，而 SaaS 提供的是应用层，这就是两者的区别。

### 2013h25h-q004 `.distractors.エ.zh` (data/ip/quiz/explanations/2013h25h.json)

- before: 主机租用（hosting 服务，即所谓的租用服务器）是服务商把自己准备好的服务器或其中一部分出租给用户使用的服务。用户只是租借设备，并不含把开发或运维本身委托出去的意思，更不是一个表示承接方在海外的术语。它与用户把自己拥有的服务器放置到服务商的机房、只租用线路和电源的 housing（服务器托管）之间的区别，也值得一并记住。
- after : 主机租用（hosting 服务，即所谓的租用服务器）是服务商把自己准备好的服务器或其中一部分出租给用户使用的服务。用户只是租借设备，并不含把开发或运维本身委托出去的意思，更不是一个表示承接方在海外的术语。它与用户把自己拥有的服务器放置到服务商的机房、只租用线路和电源的 housing（机房托管）之间的区别，也值得一并记住。

### 2013h25h-q004 `.points.1.zh` (data/ip/quiz/explanations/2013h25h.json)

- before: 区分容易混淆的委托与服务类术语：系统集成（SI）= 系统构建的一揽子承包；主机租用（hosting）/ 服务器托管（housing）= 出租服务器或出租放置场地；设施管理 = 设施与设备的维持管理。
- after : 区分容易混淆的委托与服务类术语：系统集成（SI）= 系统构建的一揽子承包；主机租用（hosting）/ 机房托管（housing）= 出租服务器或出租放置场地；设施管理 = 设施与设备的维持管理。

### 2016h28h-q006 `.distractors.エ.zh` (data/ip/quiz/explanations/2016h28h.json)

- before: 主机托管服务（hosting）是出租服务商准备好的服务器，让客户在其上运行自己的系统或网站的服务。它是设备（服务器）的出租，并不是需求定义或开发作业的委托，因此是错误的。
- after : 主机租用服务（hosting）是出租服务商准备好的服务器，让客户在其上运行自己的系统或网站的服务。它是设备（服务器）的出租，并不是需求定义或开发作业的委托，因此是错误的。

### 2016h28h-q006 `.points.1.zh` (data/ip/quiz/explanations/2016h28h.json)

- before: SaaS、机房托管、主机托管的区别：SaaS 是提供软件功能，机房托管是出租设备的放置场地，主机托管是出租服务器，它们都不是把系统开发本身委托出去。
- after : SaaS、机房托管、主机租用的区别：SaaS 是提供软件功能，机房托管是出租设备的放置场地，主机租用是出租服务器，它们都不是把系统开发本身委托出去。

### 2009h21a-q017 `.choices.エ.zh` (data/ip/quiz/translations/2009h21a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2011h23a-q005 `.choices.ア.zh` (data/ip/quiz/translations/2011h23a.json)

- before: a-SaaS，b-主机托管服务（hosting），c-机房托管服务（housing/colocation）
- after : a-SaaS，b-主机租用服务（hosting），c-机房托管服务（housing/colocation）

### 2011h23a-q005 `.choices.イ.zh` (data/ip/quiz/translations/2011h23a.json)

- before: a-机房托管服务（housing/colocation），b-主机托管服务（hosting），c-SaaS
- after : a-机房托管服务（housing/colocation），b-主机租用服务（hosting），c-SaaS

### 2011h23a-q005 `.choices.ウ.zh` (data/ip/quiz/translations/2011h23a.json)

- before: a-机房托管服务（housing/colocation），b-SaaS，c-主机托管服务（hosting）
- after : a-机房托管服务（housing/colocation），b-SaaS，c-主机租用服务（hosting）

### 2011h23a-q005 `.choices.エ.zh` (data/ip/quiz/translations/2011h23a.json)

- before: a-主机托管服务（hosting），b-机房托管服务（housing/colocation），c-SaaS
- after : a-主机租用服务（hosting），b-机房托管服务（housing/colocation），c-SaaS

### 2012h24a-q100 `.stem.zh` (data/ip/quiz/translations/2012h24a.json)

- before: A 公司使用某互联网服务提供商（以下称 ISP）的主机托管服务来运行 Web 服务器和数据库服务器（以下称 DB 服务器）。会员信息经由位于 ISP 的 DMZ（隔离区）内的 Web 服务器，存储到位于受外部保护的 ISP 网络内的 DB 服务器中。B 先生需要将会员信息从 ISP 的 Web 服务器或 DB 服务器传输到 A 公司内部的 PC 上，并要设计一种在传输过程中不会发生个人信息泄露的机制。作为传输机制，恰当的是哪一项？
- after : A 公司使用某互联网服务提供商（以下称 ISP）的机房托管服务来运行 Web 服务器和数据库服务器（以下称 DB 服务器）。会员信息经由位于 ISP 的 DMZ（隔离区）内的 Web 服务器，存储到位于受外部保护的 ISP 网络内的 DB 服务器中。B 先生需要将会员信息从 ISP 的 Web 服务器或 DB 服务器传输到 A 公司内部的 PC 上，并要设计一种在传输过程中不会发生个人信息泄露的机制。作为传输机制，恰当的是哪一项？

### 2016h28h-q006 `.choices.エ.zh` (data/ip/quiz/translations/2016h28h.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2019h31h-q052 `.stem.zh` (data/ip/quiz/translations/2019h31h.json)

- before: 在通过托管（hosting）提供的应用程序运维服务的 SLA 项目中，包含服务台、可靠性、数据管理这几项。此时，具体的服务级别指标 a～c 与 SLA 项目之间，恰当的对应组合是哪一个？ ⏎ a 从故障发生到修复完成的平均时间 ⏎ b 受理咨询业务的时间段 ⏎ c 备份介质的保存期限
- after : 在通过主机租用（hosting）提供的应用程序运维服务的 SLA 项目中，包含服务台、可靠性、数据管理这几项。此时，具体的服务级别指标 a～c 与 SLA 项目之间，恰当的对应组合是哪一个？ ⏎ a 从故障发生到修复完成的平均时间 ⏎ b 受理咨询业务的时间段 ⏎ c 备份介质的保存期限

### 2023r05-q047 `.stem.zh` (data/ip/quiz/translations/2023r05.json)

- before: 某主机托管服务的 SLA 内容中有 a～c 三项。这些内容与相关的 IT 服务管理之间，下列哪个组合最为恰当？ ⏎ a 服务器运行的时间 ⏎ b 在检测到磁盘使用量达到所设定的阈值之后，到通知指定负责人为止的时间 ⏎ c 在检测到非法访问之后，到通知指定负责人为止的时间
- after : 某主机租用服务的 SLA 内容中有 a～c 三项。这些内容与相关的 IT 服务管理之间，下列哪个组合最为恰当？ ⏎ a 服务器运行的时间 ⏎ b 在检测到磁盘使用量达到所设定的阈值之后，到通知指定负责人为止的时间 ⏎ c 在检测到非法访问之后，到通知指定负责人为止的时间

### strategy-06-20-u03 `.overview.intro_zh` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 本单元学习云计算普及之前一直延续至今的经典解决方案与委托形态。包括承包系统建设全过程的 SI、将业务委托给外部的外包、通过网络提供应用的 ASP，以及使用数据中心设施的主机托管/机房托管。作为活用外部服务的选项，这些术语之间的区别在 IT 护照考试中也经常被考查。
- after : 本单元学习云计算普及之前一直延续至今的经典解决方案与委托形态。包括承包系统建设全过程的 SI、将业务委托给外部的外包、通过网络提供应用的 ASP，以及使用数据中心设施的主机租用/机房托管。作为活用外部服务的选项，这些术语之间的区别在 IT 护照考试中也经常被考查。

### strategy-06-20-u03 `.terms.1.explanation_zh` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 外包是把原本由本公司开展的业务或系统运维交给外部专业服务商的「外部委托」的统称。通过委托，公司内部可以专注于主业（核心业务），并获得专业技术与成本效率。 ⏎  ⏎ 考试中重要的一点是，外包是委托的上位概念，是一个涵盖 ASP、主机托管、机房托管等具体服务的宽泛词语。它与 SI（建设）的区别，以及与指代本公司自行运维的本地部署（on-premise）的对比，也都会被考查。
- after : 外包是把原本由本公司开展的业务或系统运维交给外部专业服务商的「外部委托」的统称。通过委托，公司内部可以专注于主业（核心业务），并获得专业技术与成本效率。 ⏎  ⏎ 考试中重要的一点是，外包是委托的上位概念，是一个涵盖 ASP、主机租用、机房托管等具体服务的宽泛词语。它与 SI（建设）的区别，以及与指代本公司自行运维的本地部署（on-premise）的对比，也都会被考查。

### strategy-06-20-u03 `.terms.3.term_zh` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### strategy-06-20-u03 `.terms.3.explanation_zh` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 主机托管服务是指拥有数据中心的服务商，把自己准备的服务器出租给用户的服务。它也被称为租用服务器，用户无需购买和维护设备就能使用服务器功能。 ⏎  ⏎ 考试中与机房托管的区别经常出现。主机托管是「租借服务商的设备」的形态，设备的采购和维护由服务商一方承担。记住『借用出租方的设备＝主机托管』，并与接下来的机房托管对比来区分。
- after : 主机租用服务是指拥有数据中心的服务商，把自己准备的服务器出租给用户的服务。它也被称为租用服务器，用户无需购买和维护设备就能使用服务器功能。 ⏎  ⏎ 考试中与机房托管的区别经常出现。主机租用是「租借服务商的设备」的形态，设备的采购和维护由服务商一方承担。记住『借用出租方的设备＝主机租用』，并与接下来的机房托管对比来区分。

### strategy-06-20-u03 `.terms.3.memory_hook_zh` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 说到主机托管，就是租借服务商的服务器
- after : 说到主机租用，就是租借服务商的服务器

### strategy-06-20-u03 `.terms.4.explanation_zh` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 机房托管服务是指把用户拥有的服务器等设备寄放到服务商的数据中心，由其代为安置和运维的服务。服务商提供安置场地、电源、空调、线路，以及抗震、防火等环境。 ⏎  ⏎ 考试中必定会考查它与主机托管的区别。机房托管的核心在于「带入本公司的设备，租借场地（设施环境）」。相对于租借设备的主机托管，机房托管是设备自备而『租借场地』，请把两者成对掌握。
- after : 机房托管服务是指把用户拥有的服务器等设备寄放到服务商的数据中心，由其代为安置和运维的服务。服务商提供安置场地、电源、空调、线路，以及抗震、防火等环境。 ⏎  ⏎ 考试中必定会考查它与主机租用的区别。机房托管的核心在于「带入本公司的设备，租借场地（设施环境）」。相对于租借设备的主机租用，机房托管是设备自备而『租借场地』，请把两者成对掌握。

### strategy-06-20-u03 `.summary.key_points_zh.1` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 外包是把业务、运维委托给外部的上位概念，囊括了 ASP 以及主机托管/机房托管。
- after : 外包是把业务、运维委托给外部的上位概念，囊括了 ASP 以及主机租用/机房托管。

### strategy-06-20-u03 `.summary.key_points_zh.3` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 主机托管是租借服务商的服务器，机房托管是带入本公司设备并租借场地——这一区别经常出现。
- after : 主机租用是租借服务商的服务器，机房托管是带入本公司设备并租借场地——这一区别经常出现。

### strategy-06-20-u03 `.summary.memory_hooks_zh.3` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 主机托管：说到主机托管，就是租借服务商的服务器
- after : 主机租用：说到主机租用，就是租借服务商的服务器

### strategy-06-20-u03 `.unit_summary_zh` (data/ip/textbook/units/strategy-06-20-u03.json)

- before: 学习 SI、ASP、外包等服务利用形态，以及主机托管/机房托管这两种数据中心服务。
- after : 学习 SI、ASP、外包等服务利用形态，以及主机租用/机房托管这两种数据中心服务。


## 入力層 run3 (`.phase1/.phase2` の input_<exam>.json、gitignored) — 31 フィールド


### 2009h21a-q006 `.glossary.0.zh` (data/ip/quiz/.phase1/input_2009h21a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2009h21a-q017 `.glossary.1.zh` (data/ip/quiz/.phase1/input_2009h21a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2010h22h-q022 `.glossary.0.zh` (data/ip/quiz/.phase1/input_2010h22h.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2011h23a-q005 `.glossary.1.zh` (data/ip/quiz/.phase1/input_2011h23a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2012h24a-q023 `.glossary.0.zh` (data/ip/quiz/.phase1/input_2012h24a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2013h25h-q004 `.glossary.2.zh` (data/ip/quiz/.phase1/input_2013h25h.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2016h28h-q006 `.glossary.2.zh` (data/ip/quiz/.phase1/input_2016h28h.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2016h28h-q006 `.glossary.2.zh` (data/ip/quiz/.phase1/input_batch_S92.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2013h25h-q004 `.glossary.2.zh` (data/ip/quiz/.phase1/input_batch_S94.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2012h24a-q023 `.glossary.0.zh` (data/ip/quiz/.phase1/input_batch_S95.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2011h23a-q005 `.glossary.1.zh` (data/ip/quiz/.phase1/input_batch_S95.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2010h22h-q022 `.glossary.0.zh` (data/ip/quiz/.phase1/input_batch_S96.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2009h21a-q006 `.glossary.0.zh` (data/ip/quiz/.phase1/input_batch_S96.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2009h21a-q017 `.glossary.1.zh` (data/ip/quiz/.phase1/input_batch_S96.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2009h21a-q006 `.glossary.0.zh` (data/ip/quiz/.phase2/input_2009h21a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2009h21a-q017 `.tr.choices.エ.zh` (data/ip/quiz/.phase2/input_2009h21a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2009h21a-q017 `.glossary.1.zh` (data/ip/quiz/.phase2/input_2009h21a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2010h22h-q022 `.glossary.0.zh` (data/ip/quiz/.phase2/input_2010h22h.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2011h23a-q005 `.tr.choices.ア.zh` (data/ip/quiz/.phase2/input_2011h23a.json)

- before: a-SaaS，b-主机托管服务（hosting），c-机房托管服务（housing/colocation）
- after : a-SaaS，b-主机租用服务（hosting），c-机房托管服务（housing/colocation）

### 2011h23a-q005 `.tr.choices.イ.zh` (data/ip/quiz/.phase2/input_2011h23a.json)

- before: a-机房托管服务（housing/colocation），b-主机托管服务（hosting），c-SaaS
- after : a-机房托管服务（housing/colocation），b-主机租用服务（hosting），c-SaaS

### 2011h23a-q005 `.tr.choices.ウ.zh` (data/ip/quiz/.phase2/input_2011h23a.json)

- before: a-机房托管服务（housing/colocation），b-SaaS，c-主机托管服务（hosting）
- after : a-机房托管服务（housing/colocation），b-SaaS，c-主机租用服务（hosting）

### 2011h23a-q005 `.tr.choices.エ.zh` (data/ip/quiz/.phase2/input_2011h23a.json)

- before: a-主机托管服务（hosting），b-机房托管服务（housing/colocation），c-SaaS
- after : a-主机租用服务（hosting），b-机房托管服务（housing/colocation），c-SaaS

### 2011h23a-q005 `.glossary.1.zh` (data/ip/quiz/.phase2/input_2011h23a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2012h24a-q023 `.glossary.0.zh` (data/ip/quiz/.phase2/input_2012h24a.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2012h24a-q100 `.tr.stem.zh` (data/ip/quiz/.phase2/input_2012h24a.json)

- before: A 公司使用某互联网服务提供商（以下称 ISP）的主机托管服务来运行 Web 服务器和数据库服务器（以下称 DB 服务器）。会员信息经由位于 ISP 的 DMZ（隔离区）内的 Web 服务器，存储到位于受外部保护的 ISP 网络内的 DB 服务器中。B 先生需要将会员信息从 ISP 的 Web 服务器或 DB 服务器传输到 A 公司内部的 PC 上，并要设计一种在传输过程中不会发生个人信息泄露的机制。作为传输机制，恰当的是哪一项？
- after : A 公司使用某互联网服务提供商（以下称 ISP）的机房托管服务来运行 Web 服务器和数据库服务器（以下称 DB 服务器）。会员信息经由位于 ISP 的 DMZ（隔离区）内的 Web 服务器，存储到位于受外部保护的 ISP 网络内的 DB 服务器中。B 先生需要将会员信息从 ISP 的 Web 服务器或 DB 服务器传输到 A 公司内部的 PC 上，并要设计一种在传输过程中不会发生个人信息泄露的机制。作为传输机制，恰当的是哪一项？

### 2013h25h-q004 `.tr.choices.エ.zh` (data/ip/quiz/.phase2/input_2013h25h.json)

- before: 主机托管
- after : 主机租用

### 2013h25h-q004 `.glossary.2.zh` (data/ip/quiz/.phase2/input_2013h25h.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2016h28h-q006 `.tr.choices.エ.zh` (data/ip/quiz/.phase2/input_2016h28h.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2016h28h-q006 `.glossary.2.zh` (data/ip/quiz/.phase2/input_2016h28h.json)

- before: 主机托管服务（hosting）
- after : 主机租用服务（hosting）

### 2019h31h-q052 `.tr.stem.zh` (data/ip/quiz/.phase2/input_2019h31h.json)

- before: 在通过托管（hosting）提供的应用程序运维服务的 SLA 项目中，包含服务台、可靠性、数据管理这几项。此时，具体的服务级别指标 a～c 与 SLA 项目之间，恰当的对应组合是哪一个？ ⏎ a 从故障发生到修复完成的平均时间 ⏎ b 受理咨询业务的时间段 ⏎ c 备份介质的保存期限
- after : 在通过主机租用（hosting）提供的应用程序运维服务的 SLA 项目中，包含服务台、可靠性、数据管理这几项。此时，具体的服务级别指标 a～c 与 SLA 项目之间，恰当的对应组合是哪一个？ ⏎ a 从故障发生到修复完成的平均时间 ⏎ b 受理咨询业务的时间段 ⏎ c 备份介质的保存期限

### 2023r05-q047 `.tr.stem.zh` (data/ip/quiz/.phase2/input_2023r05.json)

- before: 某主机托管服务的 SLA 内容中有 a～c 三项。这些内容与相关的 IT 服务管理之间，下列哪个组合最为恰当？ ⏎ a 服务器运行的时间 ⏎ b 在检测到磁盘使用量达到所设定的阈值之后，到通知指定负责人为止的时间 ⏎ c 在检测到非法访问之后，到通知指定负责人为止的时间
- after : 某主机租用服务的 SLA 内容中有 a～c 三项。这些内容与相关的 IT 服务管理之间，下列哪个组合最为恰当？ ⏎ a 服务器运行的时间 ⏎ b 在检测到磁盘使用量达到所设定的阈值之后，到通知指定负责人为止的时间 ⏎ c 在检测到非法访问之后，到通知指定负责人为止的时间

