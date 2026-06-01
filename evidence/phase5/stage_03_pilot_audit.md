# Stage 3 — Rule A 映射監査 (code-reviewer, 第3 subagent_type, Rule D)

- 監査数: **10**
- primary: correct=9 / acceptable=1 / **wrong=0**  → 妥当率(correct+acceptable) **100%**
- terms: ok=9 / partial=1 / bad=0 / na=0

| id | primary_verdict | proposed | suggested | terms | notes |
|---|---|---|---|---|---|
| 2009h21a-q001 | correct | strategy-02-08 |  | ok | デファクトスタンダードの定義問題。strategy-02-08 標準化関連にデファクト/デジュレ/ISO/JIS が全て収録、ど真ん中。 |
| 2010h22h-q001 | correct | strategy-03-09 |  | ok | 他社の技術と人材を自社資源に取り込む=M&A。strategy-03-09 経営戦略手法に M&A・アライアンス あり。正解。 |
| 2011h23tokubetsu-q001 | correct | strategy-02-04 |  | ok | プログラム開発における著作権侵害の判定。strategy-02-04 知的財産権/著作権法 が的確。 |
| 2012h24h-q001 | correct | strategy-01-03 |  | ok | 固定費・変動費から利益比較=損益分岐点系計算。strategy-01-03 会計・財務、用語も全て該当トピックに存在。 |
| 2013h25h-q001 | correct | strategy-02-05 |  | ok | 特定電子メール送信者の義務(オプトイン同意記録・宛先明示)。特定電子メール法は strategy-02-05 に収録、IPA分類どおり。 |
| 2015h27a-q001 | correct | strategy-02-04 |  | ok | 著作権の発生時点=創作時(無方式主義)。strategy-02-04 知的財産権/著作権法 が的確。 |
| 2015h27h-q001 | correct | management-12-32 |  | partial | 正答はシステム管理基準(IS投資・統制の実践規範)=ITガバナンス領域。management-12-32 内部統制(ITガバナンス/ITマネジメント)が最適。ただし索引にシステム管理基準が無く、用語のシステム監査基準は選択肢の distractor で正答を表さず余分=partial。 |
| 2016h28a-q020 | acceptable | strategy-03-10 | strategy-01-02 | ok | 実体は重み付き合計の計算問題。題材はポジショニングなので 03-10 マーケティングも防御可能だが、問われる知識は業務分析・データ利活用(01-02)寄り。隣接ゆえ acceptable。 |
| 2017h29h-q005 | correct | strategy-05-15 |  | ok | 生産計画から部品Bの所要発注量を算出=MRP。strategy-05-15 にMRPあり。在庫管理/発注方式はsecondary 01-02 から引いており規則上OK。 |
| 2018h30h-q005 | correct | strategy-06-19 |  | ok | DFDの記述例の識別問題。DFD・E-R図は strategy-06-19 業務プロセスに収録。正解。 |
