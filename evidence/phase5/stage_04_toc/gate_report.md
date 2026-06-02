# Stage 4 Phase A — 全量 ToC ゲート報告 (D-128-A)
> 生成: 2026-06-02T06:03:22.954Z

## 1. 全体構造
- **63 topic / 244 unit / 1417 term**
  - strategy: 24 topic / 98 unit / 575 term
  - management: 8 topic / 23 unit / 122 term
  - technology: 31 topic / 123 unit / 720 term
- 平均 5.81 term/unit、推定学習時間 ~61h (15分/unit)

## 2. Term 整合性 (HARD gate, 確定的機械検算)
- 入力 term 総数 = 1417、plan 配置 term 総数 = 1417
- **HARD 失敗 = 0** (過不足/捏造/重複/unit_order漏れ ゼロ)
- knowledge_tree 全 1417 term を過不足なく1回ずつ配置、捏造ゼロ。

## 3. Rule D 判定分布 (writer=general-purpose / reviewer=code-reviewer, opus)
- **PASS=54 / CONCERNS=9 / FAIL=0**

## 4. CONCERNS topic (9件) — 核心残課題
> CONCERNS = term 健全(過不足/重複/捏造ゼロ)だが排列・サイズに medium/low の改善余地。FAIL ではない。

### strategy-01-02 業務分析・データ利活用 [15u: 6/5/4/4/7/7/8/9/8/4/5/7/8/6/3語] (3R)
- **[medium]** strategy-01-02-u08: u08 は 9 語で上限 8 を 1 語超過する唯一の over-limit unit。rationale は『量的/質的・1次/2次・構造化/非構造化・時系列/クロスセクションの4対概念ペア+メタデータは不可分』と主張するが、これは debatable な正当化。前ラウンドで u10・u12 の 9 語超過が Rul…

### strategy-03-09 経営戦略手法 [5u: 6/6/6/4/7語] (3R)
- (medium/high なし、low のみ — 実質 PASS 相当)

### strategy-03-12 経営管理システム [2u: 6/4語] (3R)
- (medium/high なし、low のみ — 実質 PASS 相当)

### strategy-05-15 エンジニアリングシステム [2u: 3/6語] (3R)
- (medium/high なし、low のみ — 実質 PASS 相当)

### management-08-25 システム開発技術 [5u: 5/5/5/5/3語] (3R)
- (medium/high なし、low のみ — 実質 PASS 相当)

### management-09-26 開発プロセス・手法 [5u: 5/4/7/8/6語] (3R)
- **[medium]** management-09-26-u02: u02 が 4 term で D-115 の下限5を1下回る。これは中間 unit の逸脱であり、入力の例外条項(最終 unit の端数 3〜4語のみ許容)には文言上該当しない厳密な size 逸脱。ただし『ウォーターフォール・プロトタイピング・スパイラル・RAD = 古典4プロセスモデル』という確立した意味単位の結束…

### technology-15-41 メモリ [4u: 5/8/4/8語] (3R)
- (medium/high なし、low のみ — 実質 PASS 相当)

### technology-16-44 システムの評価指標 [4u: 3/4/7/3語] (3R)
- **[medium]** technology-16-44-u01: u01『性能評価』は3語(レスポンスタイム/応答時間/ベンチマーク)でD-115の5語下限を2語下回る。rationaleは『objective第1柱「性能」は独立した評価軸であり他柱と混ぜると概念が崩れる』としてルール1の強い概念的根拠で単独unitとしているが、5語下限未満は事実。17語topicで性能/信頼性/経…
- **[medium]** technology-16-44-u02: u02『信頼性の指標』は4語(故障率/MTBF/MTTR/稼働率)で5語下限を1語下回る。これは信頼性計11語を8語上限内に収めるため、計算指標(u02=4語)と設計(u03=7語)へ概念境界で2分割した帰結。代替として信頼性を一括8語unit+残3語別unit等も理論上可能だが、稼働率計算の前提(指標)と設計(応用)…

### technology-20-52 マルチメディア技術 [6u: 8/5/3/7/7/6語] (3R)
- (medium/high なし、low のみ — 実質 PASS 相当)

## 5. サイズ逸脱 (SOFT, Rule D が rationale 付で判定済)
- 上限超過 (>8語) 3件: strategy-01-02-u08(9), technology-23-63-u05(9), technology-23-63-u10(9)
- 下限未満 (<5語) 37件: strategy-01-01-u09(3), strategy-01-02-u03(4), strategy-01-02-u04(4), strategy-01-02-u10(4), strategy-01-02-u15(3), strategy-01-03-u01(4), strategy-01-03-u06(4), strategy-02-05-u03(4), strategy-03-09-u04(4), strategy-03-10-u06(4), strategy-03-10-u07(3), strategy-03-12-u02(4), strategy-05-15-u01(3), strategy-06-18-u01(4), strategy-07-23-u01(4), strategy-07-24-u01(4), management-08-25-u05(3), management-09-26-u02(4), management-10-27-u02(4), technology-13-33-u01(4), technology-13-34-u01(3), technology-13-34-u07(2), technology-13-35-u02(4), technology-13-35-u03(4), technology-15-41-u03(4), technology-16-44-u01(3), technology-16-44-u02(4), technology-16-44-u04(3), technology-17-48-u01(3), technology-18-49-u03(4), technology-20-52-u03(3), technology-21-55-u03(3), technology-21-57-u01(4), technology-23-61-u08(4), technology-23-61-u13(2), technology-23-62-u05(3), technology-23-63-u12(4)
- 注: 下限未満の多くは「topic 全体が小規模」or「大規模 topic の端数/独立意味カテゴリ」。上限超過は「不可分の概念束」。全て plan の rationale_jp + review に根拠記載。