# Glossary Translation Review — JP -> ZH / EN

> Scope: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary/glossary.json`
>
> Source language: Japanese (`surface.jp`)
>
> Target languages checked: Simplified Chinese (`surface.zh`) and English (`surface.en`)
>
> Review posture: suitability for IT Passport learning content, with mainstream IT / business / HR / statistics / ESG terminology. This review checks fidelity to the Japanese source first, then target-language idiomaticity.

## Verdict

**PARTIAL PASS — suitable for dry-run use, but not ready as the final full-book glossary lock without edits.**

The file has **55 entries**. Most JP -> ZH and JP -> EN mappings are correct. The main issues are concentrated in a small number of glossary-lock terms:

- **Must fix before final lock**: `g_003`, `g_008`, `g_039`, `g_048`
- **Should normalize before full-book reuse**: `g_001`, `g_012`, `g_020`, `g_022`, `g_025`, `g_028`, `g_030`, `g_038`, `g_054`
- **Data consistency cleanup**: 5 `kana_helper.zh_concept` values disagree with `surface.zh`

The biggest risk is not broad mistranslation. It is that a few "almost OK" terms become awkward or misleading when glossary-locked across every translated page.

## Must Fix

| id | JP source | Current zh | ZH verdict | Current en | EN verdict | Recommended lock |
|---|---|---|---|---|---|---|
| `g_003` | `CDP` | `职业发展计划` | WARN | `Career Development Plan (CDP)` | **FIX** | zh: `职业生涯发展计划` or `职业发展计划`; en: `Career Development Program (CDP)` |
| `g_008` | `COP21` | `第21届联合国气候变化大会` | WARN | `COP21 (21st Conference of the Parties)` | WARN | zh: `《联合国气候变化框架公约》第21次缔约方会议（COP21）`; en: `COP21` or `21st Conference of the Parties to the UNFCCC (COP21)` |
| `g_039` | `事業` | `事业` | **FIX** | `Business` | WARN | zh: `业务` or `事业（业务板块）`; en: `Business` or `Business segment`, depending on whether the glossary wants a broad or organization-structure term |
| `g_048` | `環境アセスメント` | `环境评估` | **FIX** | `Environmental Assessment` | **FIX** | zh: `环境影响评价`; en: `Environmental Impact Assessment` |

Notes:

- `g_003`: the Japanese source page defines CDP as `Career Development Program（経歴開発プログラム）`, so English `Plan` is not faithful.
- `g_008`: current zh is understandable and appears in UN Chinese wording, but as a glossary lock it should preserve the COP meaning: Conference of the Parties. Current English also caused a nested parenthetical in Stage 5 output.
- `g_039`: page context defines `事業` as multiple `業務`; the translated definition already says "多项业务", so surface `事业` is too Japanese-flavored as standalone simplified Chinese.
- `g_048`: source definition says `環境影響評価のこと`; Chinese and English should both use the impact-assessment term.

## Should Normalize

| id | JP source | Current zh | Current en | Recommendation |
|---|---|---|---|---|
| `g_001` | `4大経営資源` | `四大经营资源` | `Four Major Management Resources` | zh can be `企业四大经营资源`; en can be `Four key management resources` or `Four major management resources`. Current is acceptable but stiff. |
| `g_012` | `HRテック` | `人力资源科技` | `HR Tech (HRTech)` | en OK. zh is clearer as `HR科技（人力资源科技）` for mainstream HR/IT usage. |
| `g_020` | `エコファーム` | `生态农场` | `Eco Farm` | Source definition is environment-conservation agriculture. Consider zh `生态农业` / `环境友好型农业`; en `Eco-farming` / `Environmentally friendly agriculture`. |
| `g_022` | `グリーンIT` | `绿色IT` | `Green IT` | en OK. zh OK, but helper says `绿色信息技术`; choose one canonical form, e.g. `绿色IT（绿色信息技术）`. |
| `g_025` | `ステークホルダ` | `利益相关者` | `Stakeholder` | en OK. zh is acceptable in CSR/business prose; for IT/project standards prefer `利益相关方`. Pick one. |
| `g_028` | `ソーシャルビジネス` | `社会企业` | `Social Business` | en OK. zh is acceptable if definition clarifies "运用商业手法解决社会问题"; otherwise `社会商业` may be closer to the Japanese loanword. |
| `g_030` | `パレート図` | `帕累托图` | `Pareto Chart` | en OK. zh OK, but learner-friendly lock should include common alias: `帕累托图（排列图）`. |
| `g_038` | `ワークライフバランス` | `工作与生活平衡` | `Work-Life Balance` | en OK. zh should be `工作生活平衡`; current is understandable but stiff. |
| `g_054` | `経営者` | `经营者` | `Executive; Manager` | zh acceptable but `经营管理者` may be clearer. en should avoid semicolon ambiguity; use `Business manager`, `Executive`, or `Business operator` based on target style. |

## `kana_helper.zh_concept` Mismatches

| id | JP source | surface.zh | kana_helper.zh_concept | Recommendation |
|---|---|---|---|---|
| `g_022` | `グリーンIT` | `绿色IT` | `绿色信息技术` | Choose one canonical zh, or use `绿色IT（绿色信息技术）`. |
| `g_025` | `ステークホルダ` | `利益相关者` | `利益相关方` | Choose `利益相关方` for IT/project-register consistency. |
| `g_028` | `ソーシャルビジネス` | `社会企业` | `社会商业` | Keep one; if keeping `社会企业`, ensure definitions are not narrowed to legal entity type only. |
| `g_035` | `ホワイトカラーエグゼンプション` | `白领豁免制度` | `白领豁免` | Use `白领豁免制度` in both places. |
| `g_038` | `ワークライフバランス` | `工作与生活平衡` | `工作生活平衡` | Use `工作生活平衡`. |

## Full 55-entry Matrix

Legend: PASS = suitable as-is; WARN = acceptable but should be normalized before final lock; FIX = likely wrong or materially suboptimal for glossary lock.

| id | JP source | zh | ZH | en | EN |
|---|---|---|---|---|---|
| `g_001` | `4大経営資源` | `四大经营资源` | WARN | `Four Major Management Resources` | WARN |
| `g_002` | `ABC分析` | `ABC分析` | PASS | `ABC Analysis` | PASS |
| `g_003` | `CDP` | `职业发展计划` | WARN | `Career Development Plan (CDP)` | FIX |
| `g_004` | `CEO（最高経営責任者）` | `首席执行官` | PASS | `Chief Executive Officer (CEO)` | PASS |
| `g_005` | `CFO` | `首席财务官` | PASS | `Chief Financial Officer (CFO)` | PASS |
| `g_006` | `CIO（最高情報責任者）` | `首席信息官` | PASS | `Chief Information Officer (CIO)` | PASS |
| `g_007` | `COO` | `首席运营官` | PASS | `Chief Operating Officer (COO)` | PASS |
| `g_008` | `COP21` | `第21届联合国气候变化大会` | WARN | `COP21 (21st Conference of the Parties)` | WARN |
| `g_009` | `CSR（企業の社会的責任）` | `企业社会责任` | PASS | `Corporate Social Responsibility (CSR)` | PASS |
| `g_010` | `FinTech` | `金融科技` | PASS | `FinTech (Financial Technology)` | PASS |
| `g_011` | `HRM（人的資源管理）` | `人力资源管理` | PASS | `Human Resource Management (HRM)` | PASS |
| `g_012` | `HRテック` | `人力资源科技` | WARN | `HR Tech (HRTech)` | PASS |
| `g_013` | `OJT` | `在职培训` | PASS | `On-the-Job Training (OJT)` | PASS |
| `g_014` | `Off-JT` | `脱产培训` | PASS | `Off-the-Job Training (Off-JT)` | PASS |
| `g_015` | `SDGs` | `可持续发展目标` | PASS | `Sustainable Development Goals (SDGs)` | PASS |
| `g_016` | `UNESCO` | `联合国教育、科学及文化组织` | PASS | `UNESCO (United Nations Educational, Scientific and Cultural Organization)` | PASS |
| `g_017` | `WHO` | `世界卫生组织` | PASS | `World Health Organization (WHO)` | PASS |
| `g_018` | `e-ラーニング` | `在线学习` | PASS | `e-Learning` | PASS |
| `g_019` | `アダプティブラーニング` | `自适应学习` | PASS | `Adaptive Learning` | PASS |
| `g_020` | `エコファーム` | `生态农场` | WARN | `Eco Farm` | WARN |
| `g_021` | `グラスシーリング` | `玻璃天花板` | PASS | `Glass Ceiling` | PASS |
| `g_022` | `グリーンIT` | `绿色IT` | WARN | `Green IT` | PASS |
| `g_023` | `コンピテンシ` | `胜任力` | PASS | `Competency` | PASS |
| `g_024` | `システム` | `系统` | PASS | `System` | PASS |
| `g_025` | `ステークホルダ` | `利益相关者` | WARN | `Stakeholder` | PASS |
| `g_026` | `スマート農業` | `智慧农业` | PASS | `Smart Agriculture` | PASS |
| `g_027` | `ゼロエミッション` | `零排放` | PASS | `Zero Emission` | PASS |
| `g_028` | `ソーシャルビジネス` | `社会企业` | WARN | `Social Business` | PASS |
| `g_029` | `ダイバーシティ` | `多样性` | PASS | `Diversity` | PASS |
| `g_030` | `パレート図` | `帕累托图` | WARN | `Pareto Chart` | PASS |
| `g_031` | `ヒストグラム` | `直方图` | PASS | `Histogram` | PASS |
| `g_032` | `ビジョン` | `愿景` | PASS | `Vision` | PASS |
| `g_033` | `ブレーンストーミング` | `头脑风暴` | PASS | `Brainstorming` | PASS |
| `g_034` | `プロジェクト組織` | `项目型组织` | PASS | `Project Organization` | PASS |
| `g_035` | `ホワイトカラーエグゼンプション` | `白领豁免制度` | PASS | `White-Collar Exemption` | PASS |
| `g_036` | `マトリックス組織` | `矩阵型组织` | PASS | `Matrix Organization` | PASS |
| `g_037` | `レーダーチャート` | `雷达图` | PASS | `Radar Chart` | PASS |
| `g_038` | `ワークライフバランス` | `工作与生活平衡` | WARN | `Work-Life Balance` | PASS |
| `g_039` | `事業` | `事业` | FIX | `Business` | WARN |
| `g_040` | `事業部制組織` | `事业部制组织` | PASS | `Divisional Organization` | PASS |
| `g_041` | `回帰分析` | `回归分析` | PASS | `Regression Analysis` | PASS |
| `g_042` | `持株会社` | `控股公司` | PASS | `Holding Company` | PASS |
| `g_043` | `散布図` | `散点图` | PASS | `Scatter Diagram` | PASS |
| `g_044` | `期待値` | `期望值` | PASS | `Expected Value` | PASS |
| `g_045` | `株主` | `股东` | PASS | `Shareholder` | PASS |
| `g_046` | `株主総会` | `股东大会` | PASS | `General Meeting of Shareholders` | PASS |
| `g_047` | `業務` | `业务` | PASS | `Business Operations` | PASS |
| `g_048` | `環境アセスメント` | `环境评估` | FIX | `Environmental Assessment` | FIX |
| `g_049` | `社員` | `员工` | PASS | `Employee` | PASS |
| `g_050` | `組織形態` | `组织形态` | PASS | `Organizational Form` | PASS |
| `g_051` | `経営戦略` | `经营战略` | PASS | `Management Strategy` | PASS |
| `g_052` | `経営理念` | `经营理念` | PASS | `Management Philosophy` | PASS |
| `g_053` | `経営組織` | `经营组织` | PASS | `Management Organization` | PASS |
| `g_054` | `経営者` | `经营者` | WARN | `Executive; Manager` | WARN |
| `g_055` | `職能別組織` | `职能型组织` | PASS | `Functional Organization` | PASS |

## Reference Checks Used

- Local source context:
  - `translated/page_038.json`: `事業` is defined as multiple `業務`, and the translated definition says `多项业务`.
  - `translated/page_045.json`: `環境アセスメント` is defined as `環境影響評価のこと`.
  - `translated/page_045.json`: `COP21` output shows the current English glossary lock can create nested parentheticals.
- UN Chinese Paris Agreement page: `https://www.un.org/zh/climatechange/paris-agreement`
- UNFCCC Chinese Paris Agreement PDF: `https://unfccc.int/sites/default/files/paris_agreement_chinese_.pdf`
- China Ministry of Ecology and Environment, Environmental Impact Assessment Law: `https://www.mee.gov.cn/ywgz/fgbz/fl/201901/t20190111_689247.shtml`
- Microsoft Chinese Excel support for Pareto charts / `排列图`: `https://support.microsoft.com/zh-cn/office/创建排列图-a1512496-6dba-4743-9ab1-df5012972856`
- UNESCO Chinese page: `https://www.unesco.org/zh/brief`
- WHO Chinese page: `https://www.who.int/zh/about`
- UNDP China SDG page: `https://www.undp.org/china/sustainable-development-goals`
