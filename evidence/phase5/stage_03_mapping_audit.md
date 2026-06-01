# Stage 3 — Rule A 映射監査 (code-reviewer, 第3 subagent_type, Rule D)

- 監査数: **20**
- primary: correct=18 / acceptable=2 / **wrong=0**  → 妥当率(correct+acceptable) **100%**
- terms: ok=14 / partial=5 / bad=1 / na=0

| id | primary_verdict | proposed | suggested | terms | notes |
|---|---|---|---|---|---|
| 2009h21a-q001 | correct | strategy-02-08 |  | ok | デファクトスタンダードの定義問題。strategy-02-08(標準化関連)に該当語あり、最適。 |
| 2009h21a-q014 | correct | technology-21-55 |  | ok | E-R図でエンティティ関係を整理=データモデリング。technology-21-55データベース設計が最適でE-R図も用語リストに有り。データクレンジングは誤答選択肢だが実在用語、E-R図が核を捉えておりok。 |
| 2009h21a-q029 | correct | management-08-25 |  | ok | 要件分析での共同レビュー。正答の鍵語共同レビューはmanagement-08-25のみに存在。strategy-07-23も隣接だが08-25が最適。 |
| 2010h22h-q061 | correct | technology-23-62 |  | ok | 基本方針/対策基準/実施手順のポリシ階層=情報セキュリティ管理が最適。termsの情報セキュリティポリシー/方針が核を捉えok。 |
| 2011h23a-q012 | correct | strategy-07-22 |  | ok | システム投資の回収期間(費用対効果)比較。strategy-07-22の費用対効果が中核で妥当。投資利益率は隣接概念。 |
| 2012h24a-q035 | correct | management-12-31 |  | ok | システム監査の定義(独立的立場でリスク対策を検証)。management-12-31に直接一致。 |
| 2012h24a-q083 | correct | technology-23-62 |  | ok | 機密性/完全性/可用性のCIA三要素=情報セキュリティ管理(technology-23-62)が最適。terms三語が完全一致でok。 |
| 2013h25a-q008 | correct | strategy-04-13 |  | ok | MOTの定義。strategy-04-13にMOTが収録、完全一致。 |
| 2014h26a-q061 | correct | technology-23-62 |  | ok | 情報セキュリティポリシの策定方針を問う=情報セキュリティ管理が最適。termsポリシー/方針が核に一致しok。 |
| 2015h27a-q004 | correct | strategy-07-22 |  | ok | システム化構想立案の前提=経営戦略。strategy-07-22(企画プロセス)に該当、最適。 |
| 2015h27h-q040 | correct | management-12-31 |  | ok | リスクコントロール検証手段=システム監査。management-12-31が最適、distractorのITガバナンスも関連。 |
| 2015h27h-q067 | correct | technology-16-43 |  | partial | スタンドアロン=単独利用形態。technology-16-43システムの構成(集中/分散/クラサバ/P2P)が妥当な所属。ただし正解語スタンドアロンは全分類で用語未登録、提案termsは誤答選択肢のみ→partial。 |
| 2017h29a-q013 | correct | strategy-02-05 |  | ok | 政府組織設置を定めた法=サイバーセキュリティ基本法。strategy-02-05に収録、完全一致。 |
| 2017h29a-q080 | correct | technology-23-62 |  | partial | ISMS適合性評価制度=情報セキュリティ管理が最適。ただしISMAPは別制度(政府クラウド)でISMSと不一致、情報資産は用語リスト外→termsはpartial。primaryは正しい。 |
| 2018h30h-q085 | acceptable | technology-17-46 | technology-17-46 | partial | ワイルドカードによるファイル名検索。ファイルシステムは妥当だがワイルドカードは全分類で用語未登録。ファイル拡張子は関連だが核心(ワイルドカード照合)を完全には捉えず→partial。primaryはacceptable。 |
| 2019h31h-q022 | correct | strategy-03-12 |  | partial | バリューチェーンの主/支援活動分類が中核。バリューチェーンマネジメントはstrategy-03-12収録で妥当。ただし正答語HRMがtermsに未収録。 |
| 2019h31h-q054 | acceptable | management-08-25 | management-08-25 | bad | ソフトウェア保守の定義を問う。63分類に専用の保守トピックがなく、システム開発技術が最も近い妥当な受け皿。ただし提案terms「移行」は保守と別概念で、保守はこのトピックの用語リストにも無い→termsはbad。primaryは消極的にacceptable。 |
| 2020r02o-q089 | correct | technology-23-62 |  | ok | ISMSのPDCAのA(Act)=見直しと改善=継続的改善。情報セキュリティ管理が最適でterms継続的改善が核を捉えok。 |
| 2022r04-q025 | correct | strategy-06-19 |  | partial | 業務プロセス表記図表(DFD等)を問う。strategy-06-19にDFD収録で最適。BPMNは出題に無く、正答のアクティビティ図(09-26)が未収録。 |
| 2023r05-q092 | correct | technology-22-60 |  | ok | 電子メール(メールボックス集約/SMTP・POP/ドメイン名)=ネットワーク応用が最適。メーリングリスト/メールボックス/ドメイン名は当該リスト所属、SMTP/POPは通信プロトコル(secondaryで正しく明記)。ok。 |
