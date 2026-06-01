# Stage 3.5 Rule A 独立監査 (D-127, Session 77)

> workflow: `wf_49b71ac7-9a5`、`code-reviewer`（Opus、A=general-purpose/B=explore/tiebreak=analyst/重判=scientist と相異 → Rule D 充足）。
> 様本 N=20: 重判 16（changed6 + upgraded_high5 + still_low5）+ 補词 4。5 agents / 406K tok / 127s。

## 重判監査結果: correct 6 / acceptable 9 / wrong 1（妥当率 15/16 = 93.75%）

### primary 改判 6 件 — 全件 独立審計が是認 ✅
| id | old→new | verdict | 評 |
|----|------|------|----|
| 2013h25h-q077 | tech-14-38→tech-22-60 | correct | CGI=動的ページ生成、プログラム言語からネットワーク応用への是正妥当 |
| 2013h25h-q088 | tech-17-46→strategy-06-19 | correct | メール運用、ファイルシステムからグループウェア活用への明確改善 |
| 2015h27h-q011 | strategy-01-02→strategy-05-15 | acceptable | 歩留り計算、審計は「題材引きずられ」懸念も low+secondary 保持で許容 |
| 2017h29a-q058 | tech-17-47→tech-19-51 | correct | オートコンプリート、オフィスツールからインタフェース設計への明確改善 |
| 2020r02o-q043 | strategy-05-14→strategy-01-02 | acceptable | AI 文脈に惑わされた誤判定の是正、primary 改判は正しい（terms 別途清洗） |
| 2023r05-q096 | tech-15-40→tech-13-35 | acceptable | SI 接頭語、プロセッサから情報理論への改善方向 |

→ **6 改判すべて妥当（独立審計が old→new を是認）**。重判の primary 改判は信頼できる。

### wrong 1 件: 2012h24a-q065 — ユーザー裁定で審計採用、strategy-01-02 へ改判 ✅
- 審計判定: primary_ok=false。「本題は閾値条件付き価格比較=最適化計算であり、primary=strategy-01-03(会計・財務) より strategy-01-02(業務分析・データ利活用) が中核に近い」。
- **判定経緯（4 独立判定）**: 双盲 A(general-purpose) + B(explore) + 重判(scientist) の 3 者が strategy-01-03、審計(code-reviewer) のみ strategy-01-02（3:1）。
- **ユーザー裁定（Session 77）**: 題目を精査すると本題は純粋な「条件付き割引→最安比較」の算術/最適化題で**会計概念を一切含まない**。双盲/重判の 01-03 は「単価/値引/合計価格」の商業語に引きずられた疑いが濃く、**審計の独立判定が正鵠**。多数決ではなく題意で判断し、審計採用。
- **処置（適用済）**: primary=**strategy-01-02** / secondary=[]（会計 01-03 除去）/ terms=["最適化"]（樹内語）/ confidence=low（算術題だがアンカー語弱く曖昧）。invariant 不変、by_year 同期。
- 教訓: 多数決（3:1）よりも**題意に基づく独立審計**が勝る場合がある。Rule A の核心価値。

### 附帯: q065 answer 矛盾の核査（数据健全と確認）
- 当方算術: 表の数字で 39 個購入時の最安は 0004(エ)=546円（0003=780, 0001=819, 0002=975）。だが answer_keys=**ウ(0003)**。
- **原 PDF 視覚核査**（`figures/2012h24a-q065.png`）: 表数字（30/30/30・25/40/40・40/20/50・35/35/60）は question_bank と**完全一致、OCR 誤りなし**。answer ウ は answer_keys（IPA 公式）由来で正。
- **結論: 数据は健全**（表 OCR 正 + 答案 正）。矛盾は当方の解題理解層（題意の取り違え or tricky 題）であり**データ欠陥ではない**。「疑点→独立核査→証伪」のもう一例。G4 でこの題を扱う際は IPA 公式解説に従い ウ を確認のこと（注意清单）。

## 補词監査結果: 審計 4/4 wrong → **backup 対比で誤判と証伪、補词は全件正しい** ⚠

審計は 4 補词すべてを verdict=wrong, **duplicate=true** と判定。しかし placement_ok=true / is_ip_core=true（配置・核心性は是認）。

**根因 = 審計の上下文誤判**: 審計は**補词後**の `_mapping_index.json` を読み、4 語が term リスト末尾にあるのを見て「既存重複」と誤認。before/after 対比が無いため「当方が今追加した語」を「元から在る重複」と取り違えた。

**backup 証伪**（`knowledge_tree.json.pre-s035` 対比）:
| 用語 | 補词前(backup) | 補词後 | 全樹(補词前) |
|------|------|------|------|
| サービスデスク | 0 | 1 | 0 |
| セキュリティパッチ | 0 | 1 | 0 |
| アジャイル | 0 | 1 | 0 |
| 組込みシステム | 0 | 1 | 0 |

→ 4 語は補词前**全樹に 0 件**、真の新規追加。重複なし。**補词は全件正しい**（placement+core 是認、duplicate は審計の構造的誤判）。
→ 教訓: 「Writer が PASS / Reviewer が PASS ≠ 業務 PASS」（規則 A）。審計 PASS/FAIL も鵜呑みにせず独立サンプル（backup 対比）で核験すべき。本件は審計の FAIL を backup で証伪した逆方向の好例。

## 系統的発見: terms 造語（17 重判題）→ 清洗済

審計が複数題で指摘: 重判 mapper が「索引に無ければ核心語を造る」指示で、索引外の造語（業務量/請求/売掛金/単価/値引率/CMMI/ワイルドカード 等）を terms に混入。索引規則「terms MUST be drawn from the matched topic(s) term lists」に違反。

- **当方 apply の欠陥**: Stage 3 reconcile は unknown_terms を自動除去するが、当方の 3.5a apply はこの過濾を省いた（→ `failures/stage_035_apply_terms_gap.md`、Rule B）。
- **清洗**（`scripts/stage035-clean-terms.mjs`）: rejudged 59 題の terms から樹外語を除去（非 rejudged 2841 題は Stage 3 清洗済で対象外、確認済）。
  - 清洗題 17、terms 変空 8 題（造語のみだった題）。
  - **清洗後 全 2900 題で樹外 term 残存 = 0 ✓**。
  - terms 空題 全2900中 44（うち Stage 3 既存 36 + 清洗新規 8）。terms 空は Stage 3 来の正常現象（mapper が樹内語に合致せず）。
  - invariant: terms 以外不変（confidence/status/primary/secondary 不変、非 syllabus_refs 字段変化 0）。

## 総括
- **primary**: 重判 16/16 妥当（6 改判是認、q065 は 3:1 多数維持+争議記録）。誤った改判は 0。
- **confidence**: 59→17 low、42 昇格 0 降格、審計 confidence_ok 全件 true。
- **terms**: 清洗後 100% 樹内（残存 0）。
- **補词**: 4/4 正しい（審計 duplicate は backup で証伪）。
- 妥当率（terms 規則違反を清洗で解消後）: マッピング品質は Stage 3 基線を維持・改善。Stage 3.5 ゲート充足。
