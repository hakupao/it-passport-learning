# evidence/phase2/

Phase 2（带 AI 答疑的个人备考工具）实施期 evidence 落点。**This dir is committed.**

Per **D-091 §2.2** + **D-019 Q3=a** Phase 1 evidence/ 同构 carry-over + 5 Phase 2 specific additions（inline 在 `step_NN_<topic>/` 子文件）。

---

## Layout

```
evidence/phase2/
├── README.md                              # 本 file
├── step_01_scaffold/                      # Module A scaffold
├── step_02_datasource/
├── step_03_assembly/
├── step_04_ai_sdk/                        # Module B AI 路径
│   └── cache_audit_<date>.md              # 🆕 Phase 2 specific (D-088 §2.3)
├── step_05_chat/
│   └── cache_audit_<date>.md              # 第一周 retro
├── step_06_quiz/
├── step_07_glossary/
│   └── ttft_<date>.md                     # 🆕 Phase 2 specific (D-085 §2.4)
├── step_08_retry/
├── step_09_chat_ui/                       # Module C UI/UX
├── step_10_quiz_ui/
├── step_11_term_popover/
├── step_12_layout/
├── step_13_cap/                           # Module D polish+deploy
├── step_14_polish/
│   └── lighthouse_<date>.md               # 🆕 Phase 2 specific
└── step_15_deploy/
    ├── e2e_<run>.json                     # 🆕 Phase 2 specific
    └── vercel_deploy_prod.log             # 🆕 Phase 2 specific
```

Each `step_NN_<topic>/` dir holds:
- TDD test outputs (unit / integration)
- Configuration snapshots（`tsconfig.json` / `package.json` excerpt 等）
- Audit narratives (Rule A 抽检 if compress/rewrite > 50%)
- Phase 2 specific additions（cache_audit / lighthouse / vercel_deploy / e2e / ttft）inline 当其触发节点对应到该 step

---

## 5 Phase 2 specific additions（D-091 §2.2）

| 类型 | 触发节点 | 落点 |
|---|---|---|
| `cache_audit_<date>.md` | Step 4 cache_control 配置 + Step 5 第一周 retro | `step_04_ai_sdk/` + `step_05_chat/` |
| `lighthouse_<date>.md` | Step 14 polish 阶段 | `step_14_polish/` |
| `vercel_deploy_<sha>.log` | Step 1 preview + Step 15 production | `step_01_scaffold/` + `step_15_deploy/` |
| `e2e_<run>.json` | Step 15 Playwright E2E | `step_15_deploy/` |
| `ttft_<date>.md` | Step 7 glossary mode + 任 mid-retro | `step_07_glossary/` |

---

## What lives here vs. elsewhere

| Question | Read |
|---|---|
| "Phase 2 实施 PLAN（15-step 路线）" | `../../docs/phase2/PLAN.md` |
| "Phase 2 失败 attempt 归档" | `../../failures/phase2/` (Rule B) |
| "Phase 2 设计 ADR" | `../../docs/decisions/D-083 ~ D-092` |
| "Phase 2 PoC（设计阶段）evidence" | `../phase2_d088_poc_2026-05-19/` + `../phase2_d089_poc_2026-05-19/` + `../phase2_d091_poc_2026-05-19/` |
| "Phase 2 收尾 retro" | `../../RETROSPECTIVE_phase2.md`（Phase 2 全完成后建） |
| "Phase 1 evidence（cert-extractor pipeline）" | `../itpassport_r6/runs/dry_run_2026-05-12T13-23-19/` |

---

## Read order

1. `step_01_scaffold/` → `step_15_deploy/` 顺序读 Phase 2 实施 narrative
2. `cache_audit_*.md` 看 D-088 §2.3 真实 cache hit 行为校正
3. `lighthouse_<date>.md` + `ttft_<date>.md` 看用户体验度量
4. `e2e_<run>.json` 看 Playwright happy path + cap trigger 验证
