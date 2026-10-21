# S131 efix4a — 解説是正 (efull_4 のうち 2018h30a、D-176: 1 unit = 1 exam)

- lane: efix (executor opus、D-152 data lock 保持)。commit / push は lead。Rule D は別 type (verifier) で後置
- 入力: `evidence/phase5/stage_06_quiz_phase2/ruleA_result_S131_efull_4.json` の 2018h30a の medium 4 題 (q025 / q051 / q067 / q071)
- script: `scripts/quiz-fidfix-S131-efix4a.mjs` (efix3 と同じ形。subN、dry-run 既定、`--apply`。D-143 note は final に後置のみ)
- correct_answer 変更 0。jp の stem / choices は不変。translations sidecar は Rule D 後の amend で 2018h30a-q051 選択肢ア の zh / en だけを変更 (sidecar と `.phase1 tr_` の両方)

## 1. 判定

| # | 題 | 指摘 (要約) | 照合 | 判定 / 処置 |
|---|---|---|---|---|
| 1 | 2018h30a-q025 正解 | 「営利・事業のための利用ではなく保護活動」を規制対象外の第二の理由にしている | 法の適用範囲を決めるのは行為主体 (個人情報取扱事業者かどうか)。2017 年改正以降は非営利団体 (選択肢イの自治会など) も対象になる。生命・身体の保護は、同意なしの目的外利用・第三者提供を認める例外の事由で、法が適用されない理由ではない | ACCEPT。その一文を正しい位置づけに置き換えた (jp / zh / en)。行為主体が警察 = エという結論は不変 |
| 2 | 2018h30a-q051 ア (zh / en) | 「Web ブラウザだけで使えるようにする」を「ブラウザでしか使えない」と訳している | 選択肢の本文は十分条件 (専用ソフトが無くてもブラウザさえあれば使える) で、限定の意味ではない。jp の解説は正しい | ACCEPT。zh「只需 Web 浏览器即可使用邮件服务」、en "usable with just a web browser" |
| 3 | 2018h30a-q067 正解・要点 1/2 | 脅威を「外部からの原因・事象」と定義している | JIS Q 27000 の脅威の定義は「望ましくないインシデントの潜在的な原因」で、内外を問わない (内部者の不正・誤操作も脅威)。結論エ (落雷による停電) は不変 | ACCEPT。定義に「外部・内部を問わない」を入れ、要点 2 の判別基準を「弱点そのもの = 脆弱性、それに付け込んで損害を起こす事象・行為 = 脅威」にした。正解解説の「組織の外側で発生し」は停電という事例の記述として正しいので残した。key_guard note の「外部」には訂正を後置 |
| 4 | 2018h30a-q071 イ | SPEC を「仕様 (specification) の一般的な略語」としている | この選択肢の SPEC は Standard Performance Evaluation Corporation と、そのベンチマーク (SPECint / SPECfp など) | ACCEPT (jp / zh / en)。暗号化プロトコルではないという結論は不変 |

集計: medium 4 題 → **ACCEPT 4 / REJECT 0**。applied 21 = 置換 17 + note 後置 4。

## 1b. Rule D 後の amend (同じ unit・同じ script、冪等)

| 題 | Rule D の note | 処置 |
|---|---|---|
| 2018h30a-q051 | translations sidecar の選択肢アにも、解説と同じ取り違えがある (zh「使邮件服务仅能通过 Web 浏览器使用。」/ en "usable only through a web browser") | zh「只需 Web 浏览器即可使用邮件服务。」/ en "Make the email service usable with just a web browser." に (sidecar と `.phase1 tr_` の両方、jp は不変)。note を後置 |
| 2018h30a-q025 | 「2017 年改正以降は自治会などの非営利団体も」は不正確 | 「2017 年改正で 5,000 件要件が撤廃され、小規模な自治会なども個人情報取扱事業者に当たるようになった」に (jp / zh / en)。note を後置 |

script の変更: q025 の置換を 3 行追加した (初回の置換結果を from とするので、初回の後に当たる)。TRFIX に q051 の 2 行を追加した。NOTE_APPEND は同じ題に 2 本の note を持てるよう配列にし、後置済みかどうかを note の全文で判定するようにした。新しい状態に対する 1 回目の適用でも、適用済みの状態に対する再実行でも、冪等になる。amend の適用は applied 9 (置換 7 + note 2)、その後の再実行は applied 0 / skipped 30。

translations sidecar (2018h30a-q051 選択肢ア、`.phase1 tr_` も同じ):
- **zh before**: 使邮件服务仅能通过 Web 浏览器使用。 / **after**: 只需 Web 浏览器即可使用邮件服务。
- **en before**: Make the email service usable only through a web browser. / **after**: Make the email service usable with just a web browser.

## 2. 改写前後 — 解説 (逐字、HEAD の explanations と amend 後の再生成の比較から機械的に出力)

#### 2018h30a-q025 correct

- **jp before**: 個人情報保護法が規制するのは「個人情報取扱事業者」、すなわち個人情報データベース等を事業のために利用する民間の事業者である。エの行為主体は警察であり、警察などの行政機関はこの(民間部門を対象とする)個人情報保護法が定める「個人情報取扱事業者」に当たらない(当時、行政機関は別の法律の対象)。さらに、徘徊していた認知症の老人をクレジットカードの情報から本人特定して自宅へ送り届ける行為は、営利や事業のための利用ではなく、人の生命・身体を守るための公的な保護活動である。したがってエは個人情報保護法の規制の対象にならず、これが正解となる。
- **jp after**: 個人情報保護法が規制するのは「個人情報取扱事業者」、すなわち個人情報データベース等を事業のために利用する民間の事業者である。エの行為主体は警察であり、警察などの行政機関はこの(民間部門を対象とする)個人情報保護法が定める「個人情報取扱事業者」に当たらない(当時、行政機関は別の法律の対象)。なお、人の生命・身体の保護は、本人の同意なしに目的外利用や第三者提供ができる例外の事由であって、法の適用対象から外れる理由ではない (2017 年改正で 5,000 件要件が撤廃され、小規模な自治会なども個人情報取扱事業者に当たるようになった)。したがってエは個人情報保護法の規制の対象にならず、これが正解となる。

- **zh before**: 《个人信息保护法》所监管的是「个人信息处理经营者」，即为经营业务而利用个人信息数据库等的民营经营者。エ的行为主体是警方，而警方等行政机关不属于这部（以民营部门为对象的）《个人信息保护法》所规定的「个人信息处理经营者」（当时行政机关适用的是另一部法律）。此外，根据信用卡信息确认徘徊走失的认知症老人的身份并将其送回家中，这一行为并非出于营利或经营目的的利用，而是为保护他人生命与身体安全的公共保护活动。因此エ不属于《个人信息保护法》的监管对象，这就是正确答案。
- **zh after**: 《个人信息保护法》所监管的是「个人信息处理经营者」，即为经营业务而利用个人信息数据库等的民营经营者。エ的行为主体是警方，而警方等行政机关不属于这部（以民营部门为对象的）《个人信息保护法》所规定的「个人信息处理经营者」（当时行政机关适用的是另一部法律）。另外，保护人的生命与身体，是无需本人同意即可进行目的外利用或向第三方提供的例外事由，而不是不适用该法的理由（2017 年修订撤销了 5,000 件的门槛，小规模的自治会等也属于个人信息处理经营者）。因此エ不属于《个人信息保护法》的监管对象，这就是正确答案。

- **en before**: What the Act on the Protection of Personal Information regulates is the “personal information handling business operator”, that is, a private-sector operator that uses a personal information database or the like for business purposes. The actor in エ is the police, and administrative agencies such as the police do not fall under the “personal information handling business operator” defined by this Act (which targets the private sector); at that time, administrative agencies were covered by a separate law. Furthermore, identifying a wandering elderly person with dementia from their credit card information and escorting them home is not use for profit or business, but a public protective activity to safeguard a person's life and body. Therefore, エ is not subject to regulation under the Act on the Protection of Personal Information, and this is the correct answer.
- **en after**: What the Act on the Protection of Personal Information regulates is the “personal information handling business operator”, that is, a private-sector operator that uses a personal information database or the like for business purposes. The actor in エ is the police, and administrative agencies such as the police do not fall under the “personal information handling business operator” defined by this Act (which targets the private sector); at that time, administrative agencies were covered by a separate law. Note that protecting a person's life or body is a ground for exceptions that allow use beyond the stated purpose or provision to third parties without the person's consent; it is not a reason the Act does not apply (the 2017 amendment abolished the 5,000-record threshold, so even small bodies such as neighborhood associations became personal information handling business operators). Therefore, エ is not subject to regulation under the Act on the Protection of Personal Information, and this is the correct answer.


#### 2018h30a-q051 d:ア

- **jp**: (不変)
- **zh before**: 「使邮件服务仅能通过 Web 浏览器使用」涉及的是使用手段和访问便利性（易用性、可移植性）方面的事情，与服务在想用时能否使用这一可用性要求不同。
- **zh after**: 「只需 Web 浏览器即可使用邮件服务」涉及的是使用手段和访问便利性（易用性、可移植性）方面的事情，与服务在想用时能否使用这一可用性要求不同。

- **en before**: Making the service usable only through a web browser concerns the means of use and ease of access (usability, portability), which differs from the availability requirement of whether the service can be used when one wants to use it.
- **en after**: Making the service usable with just a web browser concerns the means of use and ease of access (usability, portability), which differs from the availability requirement of whether the service can be used when one wants to use it.


#### 2018h30a-q067 correct

- **jp before**: エが正解。脅威とは、情報資産に損害を与えうる外部からの原因や事象を指す。「落雷などによる予期しない停電」は、組織の外側で発生し情報資産 (システム・データ) の可用性を脅かす事象そのものであり、まさに脅威に該当する。脅威は「弱点があるかどうか」とは独立に存在し、その脅威が脆弱性 (弱点) に付け込むことでリスクが顕在化する、という関係になる。
- **jp after**: エが正解。脅威とは、情報資産に損害を与えうる原因や事象 (外部・内部を問わない) を指す。「落雷などによる予期しない停電」は、組織の外側で発生し情報資産 (システム・データ) の可用性を脅かす事象そのものであり、まさに脅威に該当する。脅威は「弱点があるかどうか」とは独立に存在し、その脅威が脆弱性 (弱点) に付け込むことでリスクが顕在化する、という関係になる。

- **zh before**: 选エ。威胁是指可能对信息资产造成损害的、来自外部的原因或事件。“雷击等导致的意外停电”发生在组织外部，本身就是威胁信息资产（系统、数据）可用性的事件，正好属于威胁。威胁的存在与“是否存在弱点”无关；当该威胁利用了脆弱性（弱点）时，风险才会显现——两者是这样的关系。
- **zh after**: 选エ。威胁是指可能对信息资产造成损害的原因或事件（不论来自外部还是内部）。“雷击等导致的意外停电”发生在组织外部，本身就是威胁信息资产（系统、数据）可用性的事件，正好属于威胁。威胁的存在与“是否存在弱点”无关；当该威胁利用了脆弱性（弱点）时，风险才会显现——两者是这样的关系。

- **en before**: エ is correct. A threat is an external cause or event that could cause damage to information assets. 'An unexpected power outage caused by lightning or similar events' occurs outside the organization and is itself an event that threatens the availability of information assets (systems and data), so it exactly corresponds to a threat. A threat exists independently of whether a weakness is present; risk becomes manifest when that threat exploits a vulnerability (weakness) — that is the relationship between them.
- **en after**: エ is correct. A threat is a cause or event, external or internal, that could cause damage to information assets. 'An unexpected power outage caused by lightning or similar events' occurs outside the organization and is itself an event that threatens the availability of information assets (systems and data), so it exactly corresponds to a threat. A threat exists independently of whether a weakness is present; risk becomes manifest when that threat exploits a vulnerability (weakness) — that is the relationship between them.


#### 2018h30a-q067 p:0

- **jp before**: 脅威 (threat) = 情報資産に損害を与えうる外的な原因・事象、脆弱性 (vulnerability) = 脅威に付け込まれる内在的な弱点。両者を掛け合わせてリスクを評価する。
- **jp after**: 脅威 (threat) = 情報資産に損害を与えうる原因・事象 (外部・内部を問わない)、脆弱性 (vulnerability) = 脅威に付け込まれる内在的な弱点。両者を掛け合わせてリスクを評価する。

- **zh before**: 威胁（threat）＝可能对信息资产造成损害的外部原因或事件；脆弱性（vulnerability）＝会被威胁利用的内在弱点。将两者结合来评估风险。
- **zh after**: 威胁（threat）＝可能对信息资产造成损害的原因或事件（不论外部还是内部）；脆弱性（vulnerability）＝会被威胁利用的内在弱点。将两者结合来评估风险。

- **en before**: Threat = an external cause or event that could cause damage to information assets; vulnerability = an internal weakness that a threat can exploit. Risk is assessed by combining the two.
- **en after**: Threat = a cause or event, external or internal, that could cause damage to information assets; vulnerability = an internal weakness that a threat can exploit. Risk is assessed by combining the two.


#### 2018h30a-q067 p:1

- **jp before**: 「〜できない」「〜が不十分・不統一」といった弱点の記述は脆弱性、外部で発生し資産を脅かす事象 (停電・災害・攻撃など) が脅威、と切り分ける。
- **jp after**: 「〜できない」「〜が不十分・不統一」といった弱点の記述は脆弱性、弱点に付け込んで資産に損害を起こす事象・行為 (停電・災害・攻撃・内部者の不正や誤操作など) が脅威、と切り分ける。

- **zh before**: 凡是“无法……”“……不足、不统一”这类描述弱点的说法属于脆弱性；发生在外部、威胁资产的事件（停电、灾害、攻击等）属于威胁——按此区分。
- **zh after**: 凡是“无法……”“……不足、不统一”这类描述弱点的说法属于脆弱性；利用弱点对资产造成损害的事件或行为（停电、灾害、攻击、内部人员的违规或误操作等）属于威胁——按此区分。

- **en before**: Descriptions of weaknesses such as 'cannot do X' or 'X is insufficient / inconsistent' are vulnerabilities, whereas events that occur externally and threaten assets (power outages, disasters, attacks, etc.) are threats — distinguish them this way.
- **en after**: Descriptions of weaknesses such as 'cannot do X' or 'X is insufficient / inconsistent' are vulnerabilities, whereas events or acts that exploit those weaknesses to damage assets (power outages, disasters, attacks, insider wrongdoing or operating mistakes, etc.) are threats — distinguish them this way.


#### 2018h30a-q071 d:イ

- **jp before**: SPEC は「仕様 (specification)」を意味する一般的な略語で、暗号化通信のプロトコル名ではない。HTTPS とは無関係。
- **jp after**: SPEC はコンピュータの性能評価ベンチマークを策定する非営利団体 (Standard Performance Evaluation Corporation)、およびそのベンチマーク (SPECint・SPECfp など) を指し、暗号化通信のプロトコル名ではない。HTTPS とは無関係。

- **zh before**: SPEC 是表示「规格 (specification)」的通用缩写，并不是加密通信的协议名称，与 HTTPS 无关。
- **zh after**: SPEC 指制定计算机性能评测基准的非营利组织（Standard Performance Evaluation Corporation）及其基准（SPECint、SPECfp 等），并不是加密通信的协议名称，与 HTTPS 无关。

- **en before**: SPEC is a common abbreviation meaning specification; it is not the name of an encrypted-communication protocol and has nothing to do with HTTPS.
- **en after**: SPEC refers to the Standard Performance Evaluation Corporation, a non-profit that develops computer performance benchmarks, and to its benchmarks (SPECint, SPECfp, etc.); it is not the name of an encrypted-communication protocol and has nothing to do with HTTPS.


## 3. ゲート (amend 後に再実行)

| ゲート | 結果 |
|---|---|
| `--apply` (初回 21 + amend 9) → `build-quiz-corpus.mjs` → `quiz-phase2-merge.mjs 2018h30a` | ✅ |
| 変更範囲 | ✅ explanations は題 id 単位で 4 題だけ、translations は 2018h30a-q051 の 1 題だけ (選択肢ア の zh / en の 2 行)。トップレベルは同一 |
| 冪等: efix4a dry-run 再実行 | ✅ applied 0 / skipped 30 |
| `quiz-keys-crosscheck.mjs --require-raw` | ✅ all invariants hold |
| `quiz-pagefix-derive-groups.mjs --assert-clean` | ✅ GREEN |
| `quiz-chumon-groups-build.mjs --check` | ✅ 一致 |
| tsc / eslint / vitest / build | ✅ exit 0 / 0 errors (既存 warning 1) / 563 passed・2 skipped / Compiled successfully |
| correct_answer 差分 | ✅ 0 |
| `questions.json` md5 `110697d9…` / `answer_keys.json` md5 `6802bb0b…` | ✅ 不変 |

Rule B: 失敗した attempt なし。
