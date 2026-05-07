# Page 043 Translation Review — JP -> ZH / EN

> Scope: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated/page_043.json`
>
> Source language: Japanese (`jp`)
>
> Target languages checked: Simplified Chinese (`zh`) and English (`en`)
>
> Cross-check inputs:
> - `translated/page_043.json`
> - `structured/page_043.json`
> - `ocr/page_043.md`
> - `vision_full/page_043.md`

## Verdict

**PARTIAL FAIL for learner-ready data.**

The JP -> ZH / EN sentence translations are mostly faithful, but this page is **not safe as final learner-facing question data** because:

1. **`answer_index` is wrong for all 5 questions** in both `structured/page_043.json` and `translated/page_043.json`.
2. **Choice markers are inconsistent** across Chinese and English (`A/B/C/D`, Japanese `ア/イ/ウ/エ`, and lowercase `a/b/c/d` are mixed).
3. Two glossary-derived terms should inherit the glossary fixes: `環境アセスメント` and `エコファーム`.

## Critical Data Issue — Answer Key

`vision_full/page_043.md` contains the answer line:

```text
問題1-5 ウ　　問題1-6 ウ　　問題1-7 ウ　　問題1-8 エ　　問題1-9 ウ
```

Expected 0-based indices:

| Entity | Problem | Expected JP answer | Expected `answer_index` | Current `answer_index` | Verdict |
|---|---|---:|---:|---:|---|
| `itpassport_r6::question::p043::0` | 問題1-5 | `ウ` | 2 | 0 | FAIL |
| `itpassport_r6::question::p043::1` | 問題1-6 | `ウ` | 2 | 0 | FAIL |
| `itpassport_r6::question::p043::3` | 問題1-7 | `ウ` | 2 | 0 | FAIL |
| `itpassport_r6::question::p043::4` | 問題1-8 | `エ` | 3 | 0 | FAIL |
| `itpassport_r6::question::p043::5` | 問題1-9 | `ウ` | 2 | 0 | FAIL |

This is not a pure translation bug: the wrong `answer_index: 0` values already exist in `structured/page_043.json`, and Stage 5 carried them forward.

## Translation Findings

| Entity | Field | JP source | Current zh | Current en | Verdict | Recommendation |
|---|---|---|---|---|---|---|
| `p043::0` | stem | HRTech question | Faithful but slightly stiff | Faithful | PASS | Optional zh polish: `人力资源职能` instead of `人事职能`; English is fine. |
| `p043::0` | choices | `ア/イ/ウ/エ` | Uses `A/B/C/D` | Uses `A/B/C/D` | WARN | Marker conversion is acceptable only if done consistently page-wide and answer mapping is updated. |
| `p043::0` | choice `ウ. HRTech` | `HRTech` | `人力资源科技` | `HR Tech (HRTech)` | WARN | Same as glossary: zh can be `HR科技（人力资源科技）`; en OK. |
| `p043::1` | stem | Green IT question | Faithful | Faithful | PASS | No semantic issue. |
| `p043::1` | choice `イ. 環境アセスメント` | `環境アセスメント` | `环境评估` | `Environmental Assessment` | FIX | Use `环境影响评价` / `Environmental Impact Assessment`. |
| `p043::1` | choices `ウ/エ` | `ウ. グリーンIT`, `エ. ゼロエミッション` | Keeps Japanese markers | Keeps Japanese markers | FAIL | Normalize markers; current page mixes translated and Japanese markers. |
| `p043::2` | caption | `問題1-7 企業の組織形態を表す図` | Faithful | Faithful | PASS | `Company's Organizational Form` is acceptable. |
| `p043::3` | stem | Figure asks organizational form | Faithful | Faithful | PASS | No semantic issue. |
| `p043::3` | choice `イ. 社内ベンチャー組織` | `社内ベンチャー組織` | `内部创业组织` | `Internal Venture Organization` | WARN | Better zh: `企业内部创业组织`; better en: `In-house venture organization` or `Corporate venture organization`. |
| `p043::3` | choices | all choices | Keeps Japanese markers | Keeps Japanese markers | FAIL | Same marker issue. |
| `p043::4` | stem | asks definition of divisional organization | Faithful | Faithful | PASS | No semantic issue. |
| `p043::4` | choice `ア` | matrix organization definition | `特定事业` is a bit Japanese-flavored | `specific business` OK | WARN | If glossary fixes `事業`, use `特定业务` or `特定事业/业务`. |
| `p043::4` | choice `ウ` | temporary project organization definition | Faithful, slightly stiff | `specific theme` is less precise | WARN | en: `specific issue/task` is closer than `specific theme`. |
| `p043::4` | choice `エ` | divisional organization definition | `自我完结型经营活动` is too literal | `self-contained management activities` acceptable but stiff | WARN | zh: `能够独立/自成体系地开展经营活动`; en: `self-contained business operations`. |
| `p043::4` | choices | all choices | Keeps Japanese markers | Uses lowercase `a/b/c/d` | FAIL | Same marker issue; English differs from both JP and Q1/Q2. |
| `p043::5` | stem | CIO question | Faithful, slightly stiff | Faithful | PASS | zh can be `企业高管职位中，负责统管信息系统的最高负责人是哪一个？` |
| `p043::5` | choices | CEO/CFO/CIO/COO | Terms correct | Terms correct | PASS | Term translation is correct. |
| `p043::5` | choices | markers | Keeps Japanese markers | mixed lowercase `a/b` + Japanese `ウ/エ` | FAIL | Normalize markers. |

## Marker Normalization Recommendation

Pick one page-level policy and apply it everywhere:

- Option A: preserve Japanese exam labels exactly: `ア / イ / ウ / エ`
- Option B: localize to `A / B / C / D`, but then regenerate or map `answer_index` and any visible answer labels consistently

For this project, **Option A is safer for Stage 5/6**, because the Japanese original and answer line use `ウ` / `エ`; Stage 7 can later add display aliases if needed.

## Suggested Corrections

If correcting the JSON directly, the minimum safe patch would be:

| Target | Correction |
|---|---|
| `p043::0.answer_index` | `2` |
| `p043::1.answer_index` | `2` |
| `p043::3.answer_index` | `2` |
| `p043::4.answer_index` | `3` |
| `p043::5.answer_index` | `2` |
| all choice labels | normalize to either `ア/イ/ウ/エ` or `A/B/C/D` consistently |
| `環境アセスメント` zh/en | `环境影响评价` / `Environmental Impact Assessment` |
| `エコファーム` zh/en | consider `生态农业` / `Eco-farming` if glossary is updated |

## Bottom Line

Translation fidelity: **mostly PASS**.

Learner-data readiness: **FAIL until answer indices and marker normalization are fixed**.
