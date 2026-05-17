# Phase 1 Retrospective: Trilingual Content Factory (`cert-extractor` + `itpassport_r6`)

> **状态**: `FINAL (Session 23 Turn 6, 2026-05-17 — user terminal sign-off PASS, path α: skip Reviewer #2 critic re-dispatch)`
>
> **依据**: User CLAUDE.md `<personal_operating_principles>` 规则 C + 本项目 **D-033** + 模板 `docs/templates/retrospective-template.md`。
>
> **撰写**: Session 23 (2026-05-17) | Outline-first 协议（D-019 Q1, Turn 2 outline → user OK → Turn 3 expand）。

---

## 0. 元数据 / Metadata

| 字段 | 值 |
|---|---|
| Phase | 1 |
| 起止日期 | 2026-05-06 (Session 01 开场) ~ 2026-05-17 (Session 23 retro) — 11 自然日，23 sessions |
| 总成本 (billed) | **Mistral $0.579 / Anthropic $0**（max-plan OAuth via D-069）— 折合人民币 ~¥4 (按 $1≈¥7) |
| Anthropic shadow cost | **$657.36** shadow（visibility only，未 billed；canonical 取自 `step_06_11_release.md` §6 cumulative cost ledger） |
| 总耗时 | 设计 ~10h + 实施 ~30h + 全本运行 ~9h + retro ~1h（估算总 ~50h 主动工时，跨 11 天） |
| 决定区间 | **D-001 ~ D-081**（81 条 locked decisions） |
| 独立 ADR 数 | **23 ADR concepts in 25 files**（per D-029；§3.1 复盘表逐 ADR 一行 = 25 行；D-030/032/033 三件套 + D-069/071/073 三 ADR 各自单文件） |
| 关闭的 OQ | **40 closed** |
| Open OQ（结转 Phase 2+） | **3**（OQ-01 / OQ-02 / OQ-05 — 全 Phase 1 范围外） |
| 失败 attempt 数 | **12 `.md` 归档**（`failures/` 下 stage1/stage4/stage4_5/stage5/stage6 子目录）+ 8 个产物子目录（`attempt_001..005` / `plan_b_attempt_001..002` / `jp_mutation_bug` / `answer_index_bug`，含 ~95 个 `page_*.json` 产物快照，per Rule B 全保留） |
| 抽检 evidence 数 | Production run `dry_run_2026-05-12T13-23-19/`：`step_06_audit.md` + `step_06_11_release.md` + 3 `hand_edit_checklist.md` + 5 `gate_N_<ts>.json` checkpoint + Stage 6/7 二级 audit JSON。Baseline run `dry_run_2026-05-06T16-58-10/`：5 `step_NN_audit.md`（Stage 1-6）+ stage5 user retro worksheets。共 13 `.md` evidence + 多 JSON checkpoint |
| GitHub Release | **`itpassport-r6-v1.0.0`** published 2026-05-16, 6 assets / 2.11 MB |
| 撰写人 | Claude Opus 4.7 (1M ctx) drafting；OMC `critic` agent 预审；user 终审（per Q4 Session 23） |

---

## 1. 保留下来的做法 / What Worked (规则 C 段 1)

### 1.1 实践 / 流程

**① STATE.md 单一活状态源 + session log append-only 双轨（D-027 / D-028）。**
最大单条收益。23 sessions 跨 11 天，多次"今天接昨天的活"，每次都靠 STATE.md 头部表格 30 秒重建上下文。Append-only session log 保留过程史，STATE.md 永远只反映当前事实，两者冲突时 STATE.md 胜（D-028）。如果只有 session log 没有 STATE，第 5 session 之后就会失忆；如果只有 STATE 没有 session log，无法复盘"为什么当时这么决定"。**下 Phase 继续用，文件路径不变。**

**② Tier-3 三件套 `evidence/` + `failures/` + `RETROSPECTIVE.md` 模板化（D-030 / D-032 / D-033）。**
12 个 failure archive + 5 个抽检 evidence 在 Plan-B 大返工时反复救场（Session 09b 一次性查回 Stage 4 answer-index bug + Stage 5 jp-mutation bug + glossary 13 patches，全靠 evidence 里固化的 ground truth 对照）。模板让"该写什么"不再每次新建文件时重新设计。**下 Phase 继续用，三模板原样复用。**

**③ D-019 slow pace（先 2-4 问，再 propose）+「你来定」 escape hatch。**
设计阶段全部走 slow pace：每个新 topic 先 2-4 个开放问题给 user 思考，user 给定向再 propose。避免了大量"Claude 自作主张走错方向 → 大返工"。当 user 明示"你来定/你决定"时，Claude 必须查官方文档/RFC 不靠记忆 + 锁 D-NNN + 列被否方案。本机制在 Topic #7（D-069 ~ D-073 6 个连锁决定）里跑得最干净。**下 Phase 继续用。**

**④ Decision-on-lock writeback（D-027 §1）。**
D-NNN 议定即写入当前 session log + STATE.md（同一 turn），never forget。81 个 D 全在 23 sessions 内可追溯，0 "我记得当时讨论过但找不到了" 事故。**下 Phase 继续用。**

**⑤ D-073 dry-run → user retro → 全本两段式 Phase 启动。**
原计划是 50-page dry-run 验证后再启动 579-page 全本。实际 Session 07 跑了 50 页 dry-run + Stage B PASS → Session 09 才进 Stage 5 → Session 09b 大返工 → 直到 Session 14 才进 579-page Stage C。如果一开始就直奔全本，Plan-B 暴露的 3 个架构 bug（D-074/075/076）会在 shadow $657 烧完一半之后才暴露。**下 Phase 继续用，可能进一步细化为「dry-run → mini retro → 阶段性放量」三段式。**

**⑥ D-079 5-gate checkpoint cadence。**
Stage 1 (OCR) / Stage 2-3-4 / Stage 4.5 / Stage 5 / Stage 6 五道 gate，每道 gate 输出 `gate_N_<ts>.json` checkpoint + 强制 halt criteria check。Session 15 Stage 1 Gate ① 第一次跑就 FAIL（checker schema bug），patch 后重跑 PASS — 如果没有 gate，会一路跑到 Stage 7 才暴露 cost ledger 形状错。Session 18 Stage 5 跑出 96/554 stuck-leaf 也是被 Gate ④ 拦下来才进 Session 19 hand-edit 修补。**下 Phase 必带，可能扩展为可配置 cadence。**

### 1.2 工具 / 模型 / API / 架构

**① uv workspace + hatchling backend + Python 3.11+（D-038/D-036/D-024/D-037）。**
包管理 0 折腾。`uv run --project packages/extractor pytest ...` 全程稳定。`uv.lock` commit 保 reproducibility。**492 unit test 跑 ~0.45s**（Session 21 close snapshot；Session 23 chore(privacy) 之后保持 492，没有源码改动新增 test）。Python 3.11 的 PEP 695 type alias / structural pattern matching 在 detectors.py 多分支判定里用得很顺。**下 Phase 沿用，可能升 3.12+。**

**② Pydantic discriminated union for entity model（D-056）。**
Stage 4 输出 6 种 entity（chapter/section/term/question/table/figure），用 discriminated union 一次定义、各处自动校验。Stage 5 拿到 entity 不用 type-narrow，IDE 补全直达字段。Stage 6 audit、Stage 7 export 都是 0 猜测拿到 typed object。**下 Phase 任何多形态数据沿用此模式。**

**③ Mistral OCR primary + Claude Sonnet/Opus Vision fallback（D-005 / D-007）。**
$0.58 拿到 579 页 markdown，0 误差预算。难页 fallback 实际只触发 42 + 14 force = 56 页（OCR 主路径质量足够好）。Mistral OCR Scale plan 的 $1/1k pages 计费稳定可预测。**下 Phase 任何 OCR 步骤首选 Mistral；难页用 Claude Vision force-OCR 通道。**

**④ Claude Agent SDK + max-plan OAuth（D-069）。**
最大单条成本收益。Anthropic billed = $0 / shadow $657.36。max plan 月费已沉没成本，OAuth 路径零额外费用起步。Phase 1 的 Stage 2/3/4/4.5/5/6 共 80+ LLM dispatch 全靠这个路径吃完。**下 Phase 继续用；如果 Phase 2 工具开发需要 long-running daemon（max plan 5h quota 会撞顶），再补 ANTHROPIC_API_KEY 双轨。**

**⑤ Schema version 与 lib version 分离（D-058）。**
`__version__ = "0.1.0"` (lib) + `SCHEMA_VERSION = "1.0.0"` (output schema)。lib 内部演化（pipeline refactor、detector 增减）不动 schema；schema bump 需要正经 ADR。Phase 1 lib 跑到 0.1.0、schema 已经 lock 在 1.0.0。**下 Phase 任何对外契约都按这个模式。**

**⑥ Plugin auto-discovery + entry_points 双通道（D-025 / D-026 / D-065）。**
内部 `@register_<axis>("<name>")` decorator + 自动扫描 `plugins/` 用于 v1；entry_points 用于 Phase 5 第三方插件生态。版本协商靠 `__cert_extractor_min_version__` 单行声明。**Phase 5 时机到了直接用，不需要再设计。**

**⑦ Pytest unit/integration/e2e marker 分层 + `_fixtures/` 下划线防 collect（D-042 / D-043）。**
**492 unit test 跑 ~0.45s**（Session 21 close snapshot；Session 23 chore(privacy) 之后保持 492，没有源码改动新增 test），因为下划线让 pytest 跳过 fixture 目录（避免误把 fixture .py 当 test 收）。marker 让 CI 可以选择性跑不同层级。**下 Phase 任何 Python 项目沿用。**

### 1.3 协作模式（User ↔ Claude）

**①「你来定 / 你决定」机制。**
user 显式 delegate sub-question → Claude 必须查官方文档 + 锁 D-NNN + 列 rejected alternatives + 立刻写回。本 Phase 用得最重的两次是 Topic #7（6 个 D 连锁）+ Step 6.11 设计（D-079/080/081 三 ADR）。如果没这个机制，user 要 micro-manage 每条决定就会卡住，Phase 1 时长翻倍。**下 Phase 继续用，必须配合 D-019 slow pace 一起。**

**② Plan-B retro pattern（Session 09b）。**
Stage 5 第一次跑 PASS 之后 user 主动开 retro worksheet，发现：(a) Stage 4 page_043 `answer_index = [0,0,0,0,0]` 应是 `[2,2,2,3,2]` (Mistral OCR 把答案行吃了)；(b) Stage 5 `_glossary_lookup` 偷偷 mutated 了 10 leaves 的 jp 字段；(c) glossary 约 10 条 entry 翻译质量需 polish。三个 bug 一次性查回 → 锁 D-074/075/076 → 全 stage 重跑。**这是本 Phase 最重要的纪律事件**：LLM 单 source 验证不视为 PASS，必须有 user-driven retro spot-check。下 Phase 把这个模式正式化为 Rule A.2。

**③ 质量 + 安全 > 成本（user feedback memory 2026-05-07）。**
Plan-B 之后 user 显式表态："默认推最贵 / 最安全方案，不预先 frame 成本顾虑"。Session 10 起 Stage 6 / Step 6.11 设计全部按这个原则，反映在 D-077 reviewer LLM 选 opus 不选 sonnet、D-079 5 道 gate 不省、D-080 自动 backfill 用 safety-net 不省。本机制让 Phase 1 实际 billed 仍是 $0.579，但 shadow $657 是 visibility 不是负担。**下 Phase 沿用；如果到了 Phase 2 需要日常运营成本可控，再 frame。**

**④ Long-context decay → 小 batch（user feedback memory）。**
"LLM 在长 context 末尾质量下降"是 user 早期反复强调的工程感受。Stage 5 chunk size 一刀切 chunk=8 → chunk=4 → chunk=1 的退化救火过程印证了这一点。下 Phase 任何 batch LLM 步骤设计期就要 cap items-per-call。**下 Phase 沿用并机制化（adaptive chunk + circuit-breaker 内建）。**

**⑤ Pre-close self-check（D-027 §5）。**
每 session 关闭前 Claude 必须显式声明 "all D / OQ / state changes are on disk" 并演示。23 sessions 0 漏，没有"昨天忘 sync STATE 的 D 在第三天才发现"。**下 Phase 继续用。**

---

## 2. 必须补上的缺口 / What's Missing (规则 C 段 2)

### 2.1 设计层面

**① D-076 envelope（answer-index `-1` rejection）应该在 Stage 4 设计时就锁。**
*应做*：Stage 4 设计期就把"非法值 → sentinel + Stage 7 envelope 拒绝"列为必检项。
*因为没做*：Stage 4 设计时只想 happy path（4 选 1 → answer_index ∈ [0, 3]），没列"如果 OCR 把答案行吃了怎么办"。
*下次做*：下 Phase 任何 stage 设计要主动列「sentinel + rejection rules」清单 + 一条 ADR boilerplate。每个有 enum 或区间的字段都过一遍"非法值降级到什么 sentinel + 下游谁拒"。

**② Stage 4.5 glossary 锁定时机 vs Stage 5 翻译。**
*应做*：glossary 在 schema 层 enforce self-consistency（surface 不能等于 zh_concept；同一 surface 跨 entry 不能有冲突 reading）。
*因为没做*：D-073 写了"glossary 在翻译前锁"但没强制 self-consistency，Stage 6 D13 INFO 抓到 g_022 / g_028 surface-concept split。
*下次做*：Phase 2 glossary 输出加 pydantic validator + 单独一个 dedup/normalize pass。

**③ D-080 Stage 4.5 polish v1.1 §8 acceptance withdrawal。**
*应做*：polish 类 LLM 重写步骤在设计期就要有"无收敛逃生闸"（max retries + fall back to deterministic / no-op）。
*因为没做*：Step 6.11.A.3 跑了 5 次 attempts（含 2 bug fix）后 user 决定撤回 acceptance，因为 polish 本身没收敛、修改面失控。
*下次做*：下 Phase 任何 LLM 重写 step 设计期标注"如果第 N 次 attempt 还没 metric 改善 → 自动落回 baseline、不阻断 pipeline"。

### 2.2 实施层面

**① Stage 5 chunk size 一刀切。**
*应做*：chunk size adaptive，按 attempt 失败率自动二分（chunk=8 失败 → chunk=4 → chunk=2 → chunk=1）+ 单 chunk 多次失败触发 circuit breaker 转 hand-edit 通道。
*因为没做*：Session 18 chunk=8 一刀切，96/554 sub-batch parse 失败；Session 19 手动改 chunk=4 → chunk=1 三段救火耗了 8 个 attempts。
*下次做*：Phase 2 任何批 LLM 步骤把 chunk 退化 + circuit breaker 内建到 runner 层。

**② Stage 6 detector 与 Stage 7 export 共用 detectors.py 但 thresholds 不同。**
*应做*：detector library 应该分 stage-specific profile（`detectors.{stage6,stage7}` 两 config），各 stage 调自己的 profile。
*因为没做*：Session 21 Stage 7 dispatch 撞 30 个 Gate A FAIL，全部是 detector FP 在 Stage 7 更严的阈值下浮出来 → 5 个 detector patch（`2c3c66f` + `8c68c2e`）修补。
*下次做*：Phase 2 任何"多 stage 共用 detector"重构成 stage-specific profile 模式。

**③ Stuck-leaves 71 个手工修补脚本 `apply_hand_edits.py` 是临时方案。**
*应做*：内建"detect-then-suggest-then-batch-approve"工作流：detector 抓到 stuck-leaf → LLM 起草修补 → user 一次性 batch approve → transactional apply。
*因为没做*：Session 19 是手撸 71-row checklist + 一次性脚本，没复用价值。
*下次做*：Phase 2 把 stuck-leaf hand-edit 通道做成 pipeline 内的正式 step (Stage 5.5 或 Stage 6 的子 step)。

**④ `verdict_halted=FAIL` UX wart。**
*应做*：halt criteria 的 verdict 文案要区分"数据 FAIL"和"操作性 cap 触发"，前者真问题、后者是 visibility-only halt。
*因为没做*：Session 17 Gate ③ Stage 4.5 cumulative-cap 撞顶，verdict_halted=FAIL 但实际 data 100% 正确。
*下次做*：Phase 2 halt 输出 `(verdict, reason_kind)` 二元，UI / log 文案统一审。

**⑤ Stage 7 Gate A 30 FP cascade (Session 21) — 第 3 次未排程救火。**
*应做*：Stage 6 audit 完成时 sample 是 40 页，对全 554 页的 FP 暴露不足；Stage 6 sample 大小应该按"全集触发率"反推（如要 95% confidence 抓住 1% 的 FP，至少 ~300 sample）。
*因为没做*：Stage 6 Stage B 40 页 PASS 后直接进 Stage 7 全 554 页 dispatch，撞出 30 个 Gate A FAIL（12 页），耗 5 个 detector patch（`2c3c66f` / `8c68c2e`）+ 2 个 hand-edit 才收敛。本 Phase 三次 unscheduled firefight: Session 09b (Plan-B Stage 5) → Session 19 (stuck-leaves) → Session 21 (Gate A cascade)。
*下次做*：Phase 2 任何 sample-based audit step 配套 "sample size justification"（统计推断而不是拍脑袋 40 页）+ 早期触发 full-set dry-run as smoke。

### 2.3 工程纪律层面

**① Session 09 首次 PASS 是假 PASS（Stage 5 false PASS → Plan-B 大返工）。**
*应做*：Rule A 抽检要明示"LLM 验证 + deterministic spot-check 双轨"，单轨 PASS 不视为 PASS。
*因为没做*：Session 09 Stage 5 全 LLM-graded 6 retry → 0 untranslated → mark PASS，没跑 deterministic spot-check 对照 Stage 4 ground truth。
*下次做*：在 user CLAUDE.md `<personal_operating_principles>` 提议加 Rule A.2 = "LLM-only verdict 必须配 deterministic spot-check"。**这是本 Phase 最重要的纪律改进候选。**

**② D-080 v1.1 §8 acceptance withdrawal 等于 D-080 部分回滚，但走的是松散的"v1.1 §8 改 acceptance"，没发新 ADR supersede。**
*应做*：ADR 协议正式支持"acceptance criteria post-implementation amendment"作为 first-class operation（D-082 supersede 模式 vs in-place amend 模式有明确规约）。
*因为没做*：D-080 实施后 user 撤回 acceptance，文档处理走了非正式"在 ADR v1.1 加 §8 说明"的路径。
*下次做*：Phase 2 起 ADR template 加 §「Amendment Policy」段：明确什么场景 in-place amend、什么场景必须新 ADR supersede。

**③ 「failures 数 / evidence 触发链匹配」可达性没自动 check。**
*应做*：CI 或 smoke script 自动校验 `failures/` 下每个 archive 都能从某个 `evidence/` audit 引用到。
*因为没做*：12 个 failure archive 全是手动 cross-link 在 evidence 里，没自动校验。
*下次做*：Phase 2 加 `validate_failures_link_to_evidence.py` smoke，在 commit hook 跑。

**④ 早期 ADR（D-005 / D-008 / D-021 等）的 status 直到本 retro 才首次 batch review。**
*应做*：每 N session（如 N=10）做一次 mini-retro 把所有 D status 过一遍。
*因为没做*：Phase 1 跑了 23 session 才在 retro 阶段首次系统 review。
*下次做*：Phase 2 加每 10 session 一次"D status pulse"——5 分钟过一遍现存 D，标 still-good / amend / supersede，不通过完整 retro 流程。

---

## 3. 关键决策复盘 / Key Decision Review (规则 C 段 3)

**Status 取值**: ✅ still-good / ⚠️ regret-but-keep / ❌ supersede 候选 / 🔄 amended (有 v1.1 / 部分回滚)

### 3.1 Standalone ADR 复盘表（23 条）

| ID | 一句话决定 | Status | 备注 |
|---|---|---|---|
| D-005 | Mistral OCR primary | ✅ | $0.579 全本，0% 预算偏差，质量足够好 |
| D-008 | 6 + 2 stage pipeline (含 4.5 glossary) | ✅ | 全部 7 stage 跑通到 v1.0.0；stage 分界保持原样 |
| D-013 | Multi-Source Modular | ✅ | v1 只用 epub_image，但插槽机制完整保留 |
| D-016 | Phase 1→5 roadmap | ✅ | Phase 1 完整收尾；后续 Phase 框架仍适用 |
| D-021 | 4 轴可插拔 (Source/OCR/Translator/Exporter) | ✅ | 4 轴全交付，无重构压力 |
| D-022 | Hybrid 数据模型 (jp/zh/en + kana_helper + 锚点) | ✅ | 908 glossary + 6059 leaves 验证规模 |
| D-023 | 三层 hybrid (YAML→CLI→Library→Plugin) | ✅ | pipeline.yaml + cert-extractor CLI + plugins 全交付 |
| D-024 | Python 3.11+ 主语言 | ✅ | 零摩擦；Phase 2 可考虑升 3.12+ |
| D-029 | ADR 规约 (major decision only standalone) | ✅ | 23/81 比例验证 governance 健康 |
| D-030 | Evidence 模板 | ✅ | 5 主 step audit 全用 |
| D-032 | Failure 模板 | ✅ | 12 archive 全用 |
| D-033 | Retrospective 模板 | ✅ | 本 retro 即在用，模板结构 §0-§7 全部落地 |
| D-041 | pytest-cov + markers | ✅ | 492 test / ~0.45s（Session 21 close snapshot），标杆 |
| D-058 | Schema version SemVer 独立 | ✅ | output 锁 SCHEMA_VERSION=1.0.0 |
| D-061 | Stage 6 reviewer LLM 概念定义 | ✅ | D-077 是 D-061 的实施版 |
| D-063 | Stage 内 audit FAIL 协议 | ✅ | Plan-B failure tracking 跑通 |
| D-065 | Plugin loading discovery 协议 | ⚠️ | 实现完整 + 单元 test 覆盖；但 `entry_points` 第三方通道**尚未实战触发**（Phase 1 无第三方插件存在）。Phase 5 真有外部插件接入后才能升 ✅ |
| D-069 | Anthropic via Agent SDK + max-plan OAuth | ✅✅ | **本 Phase 单条 ROI 最高的决定**；Anthropic billed = $0 |
| D-071 | 软/硬 cap + emergency halt | ⚠️ | 机制有效但 Gate ③ "verdict_halted=FAIL" UX wart 在 §2.2 ④ 跟进 |
| D-073 | Dry-run → 全本 Phase 1 启动协议 | ✅ | 救了 Plan-B 大返工，没在全本中烧 |
| D-077 | Stage 6 audit reviewer LLM (deterministic + LLM 双过) | ✅ | Stage A 0-FAIL 基线 + Stage B 抓到真实 LLM 幻觉 |
| D-078 | Stage 7 dual gate (Gate A pre-normalize / Gate B post) | ✅ | Session 21 Gate A 抓到 30 FP，机制对 |
| D-079 | 5-gate checkpoint cadence + runner | ✅✅ | **本 Phase 第二条 ROI 最高的设计**；多次拦截下游 |
| D-080 | Stage 4.5 partial polish (auto-backfill + split multi-concept) | 🔄 | v1.1 §8 acceptance withdrawn；保留 1 处 polish-#1 safety-net (g_451)；split 部分功能保留可用 |
| D-081 | Release asset shape + publish module | ✅ | v1.0.0 首次确认 dispatch 即成功（3 dry-run 修了 shape-adapter） |

### 3.2 Session-log-only 关键 D-NNN 复盘（curated 11 条）

| ID | Session | 一句话 | Status | 为何 curated |
|---|---|---|---|---|
| D-009 | 01 | 三语字段 `{jp,zh,en}` | ✅ | 数据模型基石，全 stage 沿用 |
| D-010 | 01 | cert-agnostic top-level (`cert_id` 分层) | ✅ | Phase 5 生态前置准备 |
| D-012 | 01 | kana_helper 字段 | ✅ | 项目存在理由；308 entries 落地 |
| D-014 | 01 | 不计成本（质量优先） | ✅ | 后续 user feedback memory 源 (2026-05-07) |
| D-019 | 02 | Slow pace 3a | ✅ | 全 Phase 协作纪律基石 |
| D-027 | 02 | Decision-on-lock + state sync 5-rule | ✅ | 跨 23 session 0 漏 |
| D-028 | 02 | STATE.md = source of truth | ✅ | 跨 session 失忆兜底；本 retro 也用 |
| D-046 | 03 | Output via GitHub Release (非 git history) | ✅ | v1.0.0 落地 release page |
| D-074 | 09b | Stage 5 prompt wrapper-clause | ✅ | Plan-B 救场，382/382 leaves 0 untranslated |
| D-075 | 09b | Stage 5 jp-preservation contract + regression test | ✅ | Plan-B 救场，0 jp mutation 现役 |
| D-076 | 09b | Stage 4 answer-line + envelope `-1` rejection | ✅ | Plan-B 救场，envelope 设计模式起源（已在 §2.1 ① 跟进） |

### 3.3 Supersede 候选 / 新方向

**本 Phase 无 ❌ supersede 候选**。

唯一 partial 回滚 = **D-080**（🔄 amended）。处理走的是 in-place "v1.1 §8 acceptance withdrawal"，**未发新 ADR supersede**。§2.3 ② 已跟进"ADR amendment policy 缺位"，Phase 2 起补。

预判 Phase 2 brainstorm 会触发 D-071 / D-079 各 1 条扩展性 ADR（不是 supersede，是 extension）。本 retro 不强制开。

---

## 4. 实际成本 vs 预算偏差分析 / Cost Variance (D-033 §4)

### 4.1 预算 vs 实际表

> 预算来自 D-071 软/硬 cap + Session 06 (Topic #7) 项目级估算。Shadow 数据 canonical 取自 `step_06_11_release.md` §6 cumulative cost ledger。

| Stage | 项目 | 预算（设计期估） | billed | shadow | 偏差 | 主要原因 |
|---|---|---|---|---|---|---|
| 1 | Mistral OCR 全本 579 页 | ~$0.58 | **$0.579** | — | **0%** | $1/1k pages 公开线性计费 |
| 2 | Opus classify (669 calls) | — | $0 | **$112.16** | — | OAuth 路径 / shadow visibility only |
| 3 | Opus vision re-OCR (42+14 force=56 页) | $10-20 | $0 | **$13.07** | -35% shadow | 难页触发数远低估算 |
| 4 | Opus structure (568 calls → 554 entities) | $30-50 | $0 | **$110.40** | shadow over | OAuth 路径 |
| 4.5 | Opus glossary single-call (908 entries) | $10-20 | $0 | **$2.55** | -83% shadow | single-call 模式奏效 |
| 5 | Opus translate (1875 calls, 8 attempts + 71 hand-edits) | $40-150 | $0 | **$388.26** ($169.52 forward + $218.74 Session 19 residue) | shadow over | Plan-B 大返工 + chunk 退化救火 + stuck-leaf hand-edit |
| 6 | Opus audit (~150 calls, 5 dispatches + 6 hand-edits) | $20-50 | $0 | **$30.92** | — | OAuth 路径 |
| 7 | Export (3 dispatches, no LLM) | $0 | $0 | $0 | 0% | 纯 deterministic |
| E | Release publish (gh CLI, no LLM) | $0 | $0 | $0 | 0% | 纯工具调用 |
| **总计** | **全 Phase 1 cumulative** | **$150-350** | **$0.579** | **$657.36** | **-99.6% billed vs 预算中位 $250** | **D-069 max-plan OAuth 把 Anthropic billed 全压到 $0** |

### 4.2 偏差分析

**主因 = D-069 OAuth 路径完全推翻原 billed 预算假设。**
原 $150-350 预算假设 pay-as-you-go API key 路径，按 Anthropic 公开定价算。D-069（Session 06 锁，OAuth via Agent SDK + max plan）让所有 Anthropic 调用走 OAuth 通道，billed = $0。Mistral 仍走 pay-as-you-go，$0.579 精确命中预算（设计期估算精度极高）。

**Stage 5 shadow $388 远超原 $40-150 估算 — 是 Phase 1 最大单条 shadow 支出。**
原因：8 attempts 含 Plan-B 大返工（Session 09b 全 stage 重跑）+ 多次 chunk=1 退化 retry + 71 stuck-leaf hand-edit 周期。如果 §2.2 ① adaptive chunk + circuit breaker 落地，Phase 2 类似步骤 shadow 可以收紧到原估算的 1.5x 内。

**Mistral 0% 偏差 — 是项目最精准的预算项。**
$1/1k pages 是公开线性定价，无 surge / 无折扣，纯按页计费。Phase 2 任何 OCR 步骤可继续用同公式估算。

**Stage 4.5 远低预算 — single-call 设计奏效。**
原估 $10-20 是按"逐 term 翻译"假设，实际 D-008 改为"一次性 single-call 抽取 + 翻译"后 $2.55 拿 908 entries。下 Phase 类似批量抽取首选 single-call 模式。

### 4.3 下 Phase 预算修正建议

- **方法学**：billed vs shadow 双轨记账继续，但 shadow 不再用 D-071 hard cap 拦（让 hard cap 改为 billed-only triggered；shadow 只做 visibility / Phase retro 数据）。
- **Stage 5 类批量 LLM 步骤估算上调 2x**（覆盖 Plan-B 等返工概率）。
- **新增项**：Phase 2 工具开发可能需要 ANTHROPIC_API_KEY 路径降级（max plan 5h quota 撞顶时），预算 $30 / 月备用。
- **新增项**：Phase 2 + 3 前端开发 / 服务部署成本预算单独立项（Vercel / Cloudflare / 数据库托管），Phase 1 retro 不展开。
- **可砍项**：D-071 hard cap 的 fail-count 维度在 Phase 1 没触发过，可下调阈值或合并到 wall-time 维度。

---

## 5. 下个 Phase 的开工前置条件 / Pre-conditions for Phase 2

未全部勾选不允许开 Phase 2 brainstorming session。

- [x] **所有 stage 最近一次抽检 PASS-with-disclosed-FAIL**（`evidence/`：Stage 1/2/4/4.5/5/7 全 PASS clean；**Stage 6 PASS with 2 documented edge-case FAILs accepted per user auth Session 20**（page_292 D7 date-format heterogeneity + page_479 L learning-gloss `translation_hallucination`），两条都已 ship 到 v1.0.0 `polish_items.json` sidecar + release notes "Known polish items" 表，作为 v1.0 已知 disclosure 出货）
- [ ] **所有 OQ 关闭或显式转出**（**3 OQ open**：OQ-01 源类型优先级 / OQ-02 OCR 引擎抽象 / OQ-05 Phase 2-4 形态 — 全 Phase 1 范围外，**建议本 retro 终审时声明结转 Phase 2** → 一行声明即可勾上此项）
- [x] **`docs/STATE.md` 同步至最新**（Session 23 turn 2 完成；Session 23 close commit 时会再 sync 一次）
- [x] **主要文件契约冻结成 ADR / schema**（D-055 sentinel / D-056 discriminated union / D-058 schema version / D-076 envelope / `output/` JSON schema lock 在 v1.0.0 tag 上）
- [ ] **User 显式确认 ready**（**本 retro 终审 PASS = ready 信号**）
- [x] **失败归档完整**（12 archive 落 `failures/` + 与 evidence 链路一致；§2.3 ③ 跟进自动 check 缺位）
- [x] **所有 supersede 候选 ADR 已写完**（§3.3 = 0 supersede 候选，唯一 amend = D-080 v1.1 §8 已完成）
- [ ] **本 RETROSPECTIVE.md 经过独立 reviewer 审阅**（**critic agent 预审 pending**，per Q4 Session 23）
- [x] **实际成本数据已填入 §4**（billed $0.579 / shadow $657.36 / 全部 stage 拆解）
- [ ] **下 Phase 初始 spec 草案至少有问题清单**（**未做** — Phase 2 brainstorm session 才开；OQ-05 是天然起点）

**当前完成度**：6 / 10。剩余 4 项中 2 项依赖本 retro 内部流程（critic + user 终审），1 项是 OQ 结转声明（30 秒决定），1 项是 Phase 2 brainstorm 入口（不在本 retro 范围）。

---

## 5.5 Phase 1 v2 / 后续 carry-forward 清单 (critic gap-analysis 补)

> Rule C 精神："没有 retro = 下个 Phase 还会犯同样的错"。把已知但未在 v1.0.0 修的项显式枚举，避免 Phase 2 重新发现。

### 5.5.1 Stage 6/7 audit 层（源：`step_06_audit.md` §8 + `step_06_11_release.md` §4-§7）

1. **D7 date heterogeneity edge case**（page_292 `平成30年度 → 2018` 类异构日期），detector 当前误判为冲突 → Phase 1 v2 加 era-conversion lookup table
2. **Stage 6 reviewer prompt refinement for learning gloss**（page_479 `1Gbps → 1 Gbps (Gigabit per second)` 被误标 `translation_hallucination`，但 gloss 是 project mission 的 intentional learning content；Stage A page_153 JAN gloss 用户已接受同模式）→ Phase 1 v2 reviewer prompt 加 "intentional learning gloss" 白名单
3. **D9 INFO noise**（glossary_lock_missed 误报 ×210，cumulative）→ Phase 1 v2 改 lock-miss 判定为 "after normalization"
4. **F-COP21 redundant_nested_parens**（部分由 glossary patch 缓解，残余 Stage 7 export 阶段 normalize）
5. **F-CHOICE-MARKER**（Stage 7 export normalize 已 cover 254 choices，但 detector 仍 WARN）

### 5.5.2 Stage 5 翻译层（源：`step_45_polish.md`）

6. **D11 kana_helper 不传递**（glossary[entry].kana_helper 当前没 copy 到 translated/ 的 Term entity.kana_helper 字段；D-080 §8.6 tracked）→ Phase 1 v2 Stage 5 prompt v2 加传递规则
7. **D13 surface ⇎ zh_concept split wrong-layer**（concept-separator split 当前在 polish #2 跑，应在 Stage 4.5 LLM prompt 层处理；D-080 §8.6 tracked）→ Phase 1 v2 prompt 改 layer
8. **Stage 5 prompt v2 polish**（page_022 ストラテジ → Strategy tautology；page_038 circular EN；suffix consistency cluster）

### 5.5.3 架构层（源：`step_06_audit.md` §8）

9. **Glossary prompt cache**（Stage 5 每页 LLM call 重复发完整 908-entry glossary → token 浪费）→ Phase 1 v2 prompt cache 或者 chunked glossary
10. **Deterministic-first pass**（Stage 4 / Stage 5 / Stage 6 都可以先跑 deterministic 抓 happy path，再让 LLM 处理 hard cases，降低 LLM 调用量）
11. **Stuck-leaf escalator**（§2.2 ③ pipeline 内 step 化）
12. **All-sub-batches-failed verdict**（Stage 5 chunk 全部失败时的明确 halt verdict + retry strategy）

### 5.5.4 治理层（源：本 retro §2.3）

13. **Rule A.2 新增**（LLM-only PASS 必须配 deterministic spot-check）
14. **ADR amendment policy 段**（D-080 v1.1 §8 经验产物）
15. **Failure-evidence 链路 smoke**（automated check）
16. **每 10 session 一次 D status pulse**（避免再次到 retro 才首次 batch review）

**结转处理**：以上 16 项 carry-forward 到 Phase 1 v2 spec 起手清单（Phase 2 brainstorm session 第一题）。`polish_items.json` 已 ship 273 条具体页级 polish item 作为外部消费者 + Phase 2 工程参考。

---

## 6. 签字 / Sign-Off

| 角色 | 名字 | 时间 | 状态 |
|---|---|---|---|
| 撰写人 | Claude Opus 4.7 (1M ctx) | 2026-05-17 Session 23 Turn 3 → Turn 5 rework | **FINAL** (DRAFT → DRAFT v2 → FINAL after path α user sign-off) |
| Reviewer #1 (per 规则 D, 不同 subagent_type) | OMC `critic` agent | 2026-05-17 Session 23 Turn 4 | **PASS-with-rework**：critic NEEDS-REWORK 已 close 于 Turn 5（9 必修 + §2.2 ⑤ Stage 7 firefight + §5.5 v2 backlog 16 条；D-058 critic 误报已驳回保留 ✅） |
| Reviewer #2 复审（可选） | — | 2026-05-17 Session 23 Turn 6 | **SKIPPED per path α** — user 选择 Turn 6 直接终审，跳过二次 critic dispatch |
| User 终审 | hakupao | 2026-05-17 Session 23 Turn 6 | **APPROVED**（path α 决定 = "α"，one-step 终审 PASS） |

---

## 7. 链接 / References

- **设计 baseline**：D-001 ~ D-073 (Topic #1 ~ #7) 设计阶段，Session 01-06
- **实施 baseline**：D-074 ~ D-081 + Step 6.0-6.11，Session 07-22
- **Session logs**：`docs/discussion/2026-05-{06,07,11,12,13,15,16,17}-session-{01..23}.md`（**28 `.md` 文件**：23 session log + 4 worksheet（`2026-05-07-stage5-user-retro-worksheet.md` + `2026-05-11-stage6-stage{A,B}-user-retro-worksheet.md` + `2026-05-11-stage6-closure-decision-worksheet.md`）+ 1 `README.md`）
- **Standalone ADRs**：`docs/decisions/D-{005,008,013,016,021,022,023,024,029,030,032,033,041,058,061,063,065,069,071,073,077,078,079,080,081}-*.md`（23 文件）
- **Evidence**：`evidence/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/step_*.md`（5 主步骤 audit + Stage 6/7 二级 audit JSON + 5 gate checkpoint JSON）
- **Failures**：`failures/stage1_ocr/` / `failures/stage4_structure/` / `failures/stage5_translate/` / `failures/stage6_audit/`（12 archives）
- **Release**：https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.0
- **Memory rules**（drive collaboration shape）：`feedback_quality_over_cost.md` / `feedback_long_context_batch_size.md` / `feedback_no_book_identity.md` / `project_max_plan_billing.md`
- **本 retro session 日志**：`docs/discussion/2026-05-17-session-23.md`
- **Phase 1 closing commit chain（pending Session 23 close commit）**：`b8b934a` (Session 22 close) → `eb2fac2` (chore(privacy)) → next commit = Session 23 close + retro FINAL

---

## End of DRAFT

> *下一步*：Turn 4 = OMC `critic` agent dispatch 做 Rule D 预审 → critic 报告 + 本 draft 一起给 user 终审 → §6 sign-off FINAL → Session 23 close commit + push → **Phase 1 完全闭合**。
