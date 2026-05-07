# Page 045 Translation Review — JP -> ZH / EN

> Scope: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated/page_045.json`
>
> Source language: Japanese (`jp`)
>
> Target languages checked: Simplified Chinese (`zh`) and English (`en`)
>
> Cross-check inputs:
> - `translated/page_045.json`
> - `structured/page_045.json`
> - `ocr/page_045.md`
> - `vision_full/page_045.md`
> - `glossary/glossary.json`
> - `evidence/.../glossary_translation_review_2026-05-07.md`

## Verdict

**PARTIAL PASS for translation fidelity; PARTIAL FAIL for final glossary-locked data quality.**

This page has **19 term entities** and **38 translated trilingual fields** (`surface` + `definition`). Most JP -> ZH / EN translations are faithful and usable. However, the page should not be treated as final learner-ready data until the following are fixed:

1. **Source JP preservation issue**: 3 `surface.jp` values were changed by glossary canonicalization.
2. **Glossary-derived translation issues**: `環境アセスメント`, `COP21`, and `エコファーム` need correction/normalization.
3. **English fluency/style issues**: several definitions are faithful but unnatural, especially `エコファーム`, `COP21`, and WHO.

## Critical Source Preservation Issue

The translated file should preserve the original Japanese source unless the project explicitly intends glossary canonicalization to rewrite `jp`. Here, `structured/page_045.json` and `translated/page_045.json` differ:

| Entity | structured `surface.jp` | translated `surface.jp` | Verdict |
|---|---|---|---|
| `itpassport_r6::term::p045::0` | `HRTech` | `HRテック` | FAIL |
| `itpassport_r6::term::p045::11` | `CIO` | `CIO（最高情報責任者）` | FAIL |
| `itpassport_r6::term::p045::12` | `CEO` | `CEO（最高経営責任者）` | FAIL |

The zh/en targets are fine for these terms, but the source field drift matters because this project's trilingual model treats `jp` as the source-of-truth text.

## High-priority Translation Fixes

| Entity | JP source | Current zh | ZH verdict | Current en | EN verdict | Recommendation |
|---|---|---|---|---|---|---|
| `p045::7` | `環境アセスメント` | `环境评估` / definition `环境影响评估` | FIX | `Environmental Assessment` / definition `Environmental impact assessment` | FIX | Use `环境影响评价` / `Environmental Impact Assessment` consistently. Source says `環境影響評価のこと`. |
| `p045::16` | `COP21` | `第21届联合国气候变化大会` | WARN | `COP21 (21st Conference of the Parties)` and nested definition `COP21 (21st Conference of the Parties)` | FIX | Surface: `COP21` or formal COP full name. Definition en: remove nested parenthetical; use `... (COP21).` |
| `p045::6` | `エコファーム` | `生态农场` | WARN | `Eco Farm`; definition `Environmentally conservation-oriented agriculture` | FIX | Source definition is `環境保全型農業`. Prefer zh `生态农业` or `环境友好型农业`; en `eco-farming` or `environmentally friendly agriculture`. |

## Full Entity Review

Legend: PASS = suitable as-is; WARN = acceptable but should be normalized/polished; FIX = materially wrong or unsuitable for final lock.

| Entity | JP source | zh result | ZH | en result | EN | Notes |
|---|---|---|---|---|---|---|
| `p045::0` | `HRTech` / `人事関連業務...` | `人力资源科技`; definition faithful | WARN | `HR Tech (HRTech)`; definition faithful | PASS | Source JP changed to `HRテック`. zh can be `HR科技（人力资源科技）`. |
| `p045::1` | `e-ラーニング` | `在线学习`; definition faithful | PASS | `e-Learning`; definition faithful | PASS | Good. |
| `p045::2` | `FinTech` | `金融科技`; definition faithful | PASS | `FinTech (Financial Technology)`; definition faithful | PASS | Good. |
| `p045::3` | `コンピテンシ` | `胜任力`; definition faithful | PASS | `Competency`; definition faithful | PASS | Good. |
| `p045::4` | `グリーンIT` | `绿色IT`; definition faithful | WARN | `Green IT`; definition faithful | PASS | zh is acceptable, but glossary should decide between `绿色IT` and `绿色信息技术`. |
| `p045::5` | `スマート農業` | `智慧农业`; definition faithful | PASS | `Smart Agriculture`; definition faithful | PASS | Good. |
| `p045::6` | `エコファーム` | `生态农场`; definition `环境保护型农业` | WARN | `Eco Farm`; definition awkward | FIX | Use source-definition-based terms: `生态农业` / `environmentally friendly agriculture` or `eco-farming`. |
| `p045::7` | `環境アセスメント` | `环境评估`; definition `环境影响评估` | FIX | `Environmental Assessment`; definition `Environmental impact assessment` | FIX | Use official/common `环境影响评价` / `Environmental Impact Assessment`. |
| `p045::8` | `ゼロエミッション` | `零排放`; definition faithful | PASS | `Zero Emission`; definition faithful | PASS | Good. |
| `p045::9` | `職能別組織` | `职能型组织`; definition faithful | PASS | `Functional Organization`; definition faithful | PASS | Good. |
| `p045::10` | `事業部制組織` | `事业部制组织`; definition faithful | PASS | `Divisional Organization`; definition faithful | PASS | Good, though zh `事业部门` is Japanese-flavored but acceptable inside this org term. |
| `p045::11` | `CIO` | `首席信息官`; definition faithful | PASS | `Chief Information Officer (CIO)`; definition faithful | PASS | Source JP changed from `CIO` to expanded glossary form. |
| `p045::12` | `CEO` | `首席执行官`; definition faithful | PASS | `Chief Executive Officer (CEO)`; definition faithful | PASS | Source JP changed from `CEO` to expanded glossary form. |
| `p045::13` | `CFO` | `首席财务官`; definition faithful | PASS | `Chief Financial Officer (CFO)`; definition faithful | PASS | Good. |
| `p045::14` | `COO` | `首席运营官`; definition faithful | PASS | `Chief Operating Officer (COO)`; definition faithful | PASS | Good. |
| `p045::15` | `SDGs` | `可持续发展目标`; definition faithful | PASS | `Sustainable Development Goals (SDGs)`; definition faithful | PASS | Good. Source has Japanese typo-like `17つ`; translation correctly renders `17`. |
| `p045::16` | `COP21` | formal enough in definition, surface too loose | WARN | nested parenthetical in definition | FIX | Same issue already logged as F-COP21 in Stage 5 audit. |
| `p045::17` | `UNESCO` | official name; definition faithful | PASS | official name; definition faithful | PASS | Good. |
| `p045::18` | `WHO` | official name; definition faithful | PASS | official name; definition awkward | WARN | Better en: `A UN specialized agency whose objective is the attainment by all peoples of the highest possible level of health.` |

## Specific Suggested Corrections

Minimum safe corrections if this JSON is patched directly:

| Target | Current | Suggested |
|---|---|---|
| `p045::0.surface.jp` | `HRテック` | `HRTech` |
| `p045::11.surface.jp` | `CIO（最高情報責任者）` | `CIO` |
| `p045::12.surface.jp` | `CEO（最高経営責任者）` | `CEO` |
| `p045::6.surface.zh` | `生态农场` | `生态农业` or `环境友好型农业` |
| `p045::6.surface.en` | `Eco Farm` | `Eco-farming` or `Environmentally friendly agriculture` |
| `p045::6.definition.en` | `Environmentally conservation-oriented agriculture.` | `Environmentally friendly agriculture.` |
| `p045::7.surface.zh` | `环境评估` | `环境影响评价` |
| `p045::7.surface.en` | `Environmental Assessment` | `Environmental Impact Assessment` |
| `p045::7.definition.zh` | `环境影响评估。` | `环境影响评价。` |
| `p045::16.surface.en` | `COP21 (21st Conference of the Parties)` | `COP21` or `21st Conference of the Parties to the UNFCCC (COP21)` |
| `p045::16.definition.en` | `... (COP21 (21st Conference of the Parties)).` | `International rules for combating global warming, adopted at the 21st Conference of the Parties to the United Nations Framework Convention on Climate Change (COP21).` |
| `p045::18.definition.en` | `whose purpose is for all people to attain...` | `whose objective is the attainment by all peoples of the highest possible level of health.` |

## Bottom Line

Most translations are faithful, and page 045 is much cleaner than page 043 structurally. The blocking issues for final data quality are:

- preserve original `surface.jp`;
- fix `環境アセスメント`;
- fix COP21 English nesting;
- decide the glossary lock for `エコファーム`.
