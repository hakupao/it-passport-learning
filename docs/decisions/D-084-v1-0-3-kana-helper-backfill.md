# D-084 — v1.0.3 patch release: D11 kana_helper backfill (Phase 1 patch driven by Phase 2 need)

| 字段 | 值 |
|---|---|
| Status | **LOCKED final** 2026-05-19 Session 25 Turn 4（user terminal sign-off path α）|
| 类型 | Release boundary / data-shape additive change（sub-ADR of D-083 §2.4 §5.5 m2 mapping output）|
| 主题归属 | Topic #8 — Phase 2 prep（§5.5 mapping must-do = #6 实施路径）|
| Supersede? | 否（D-001 ~ D-083 全不动；v1.0.0 / v1.0.2 GitHub Release 保持 immutable）|
| Linked OQ | 无 new this turn |
| Session 日志 | `docs/discussion/2026-05-18-session-25.md` Turn 3 |
| 评审 (Rule D) | Writer = Claude Opus 4.7；Reviewer = user 终审（同 D-083 path α 模式）|

---

## 1. Context

D-083 §2.4 锁 "§5.5 16 条 carry-forward = m2 推到 Session 25 mapping"。

Session 25 Turn 2 跑 §5.5 mapping，per g4 acceptance gate 锁出：
- **must-do = 1** 条 = **#6 D11 kana_helper 不传递**（glossary[surface].kana_helper 当前未 copy 到 translated/ 的 Term entity.kana_helper 字段）
- 视形态 = 1 / 可推迟 = 6 / 不做 = 8（per Turn 2 mapping table）

#6 之所以为 must-do：
- D-012 锁 `kana_helper {surface, reading, zh_concept}` = 项目核心动机（日语字形识读辅助）
- Phase 2 = A+C hybrid "带 AI 答疑的备考工具"（D-083 §2.1）
- 若 Term entity 缺 kana_helper 字段，Phase 2 备考工具 + AI 答疑层失去"难读片假名词附辅助"这一项目独特卖点

Per Session 25 Turn 2 Q6，user 选 **(i) v1.0.3 patch release via post-process script**（rejected (ii) Phase 2 app 端 join / rejected (iii) cert-extractor 重跑 per D-083 §2.2）。

## 2. Decision (本 ADR 的 lock)

### 2.1 v1.0.3 patch release 落地

发布 GitHub Release `itpassport-r6-v1.0.3`，与 v1.0.0 / v1.0.2 共存（v1.0.0 = 原始 immutable / v1.0.2 = 累积 iter-3..8 ~736 edits / **v1.0.3 = v1.0.2 + D11 kana_helper backfill**）。

### 2.2 Backfill 范围：仅 D11 kana_helper

不在本 release 修其他 §5.5 条目。其他 15 条 mapping 判定（视形态 1 / 可推迟 6 / 不做 8）保持不变。

### 2.3 实现：post-process script

`scripts/backfill_term_kana_helper.py`（或类似命名）— 0 LLM cost 纯 data join：

1. 读 v1.0.2 canonical `output/` JSON（含 Term entities 和 glossary.json）
2. For each Term entity，按 `surface.jp` lookup `glossary[surface_jp].kana_helper`
3. 若 glossary 有 kana_helper 且 Term 没，写入 `Term.kana_helper = {surface, reading, zh_concept}`
4. Re-emit affected Markdown（如果 Markdown 模板涉及 Term.kana_helper 显示）
5. Verify：spot-check 5+ Term entities + `polish_items.json` 不变 + `index.json` 字段计数对齐

### 2.4 Release artifact：同 v1.0.2 shape (per D-081)

6 assets：
- `itpassport-r6-output-v1.0.3.zip`（full 554-page bundle）
- `README.md`
- `index.json`
- `glossary.json`（不变 — backfill 是 Term→glossary join，glossary 本身已有 kana_helper）
- `polish_items.json`（不变）
- `cost.json` 或 `SHA256SUMS.txt`（per v1.0.2 shape）

`RELEASE_NOTES.md` 强调：
- 变更：`Term.kana_helper` 字段 backfilled from glossary
- 影响：additive backward compatible（v1.0.2 消费者 zero migration）
- 引用 ADR：D-084 + D-083 §2.4 + D-012（kana_helper 定义）

### 2.5 Phase 1 v1.0.0 + v1.0.2 stays immutable

不动 v1.0.0 / v1.0.2 tag 和 release page。v1.0.3 是 newest patch。Phase 1 release 历史链 = v1.0.0 → v1.0.2 → v1.0.3。

### 2.6 Semver: patch release

`v1.0.2 → v1.0.3` patch（不是 minor bump 到 v1.1.0）。理由：
- 字段加 `Term.kana_helper` = additive backward compatible
- 旧消费者读 Term 拿到 surface/definition 等不变，新字段是 opt-in 消费
- semver 严格说 additive schema 算 minor，但实务上 backward compatible additive 也常 patch；项目按 patch 维持 release line 紧凑

### 2.7 Implementation gate

本 ADR LOCKED 不等于 implementation 立即起手。Implementation 需 user 显式 "go implement / 开始 v1.0.3"。

理由：
- 0 LLM cost（纯 data join script）→ 无 cost gate
- 但 release publish 是 production-impacting irreversible（GitHub Release tag 上去就在历史里）→ 仍需 user 显式 gate
- 同 Phase 1 v1.0.0 / v1.0.2 publish 模式（每次 publish user 显式 "go publish"）

预期 Implementation effort（参考）：
- Backfill script + 5 unit tests + 1 integration smoke ≈ 30-60 min
- Apply + verify + commit ≈ 15 min
- `release.publish()` orchestrator run (per D-081) ≈ 15 min
- Total wall ≈ 60-90 min
- LLM cost: $0
- Push: user 显式授权才 push

## 3. Out of scope

| 项目 | 处理 |
|---|---|
| Phase 2 app 形态主线（Quiz / Study / Hybrid / Chat）| Session 26 D-085 候选锁 |
| β-ready portability 严格度 | Session 26 D-086 候选锁 |
| 技术栈 / AI 模型 / 数据源 contract | Session 26+ |
| §5.5 #4 F-COP21 视形态 | Session 26 step 2 形态锁后再评（Turn 3 mini-decision）|
| §5.5 其他 14 条非 must-do | sidecar 自动通过（RETROSPECTIVE §5.5 = sidecar）|
| cert-extractor 改动 | 永久 rejected per D-083 §2.2 |
| v1.1.0 minor bump 或 v2.0.0 major | rejected（见 §4）|

## 4. Rejected alternatives

| 候选 | 拒绝原因 |
|---|---|
| (ii) Phase 2 app 端 join | Phase 2 app 多 join 责任 / 未来其他消费者重复造轮子 / output 不 self-contained → user Q6 explicit 选 (i) not (ii) |
| (iii) Patch cert-extractor + 重跑全本 | 违反 D-083 §2.2 / LLM cost ~$170 shadow / 过度工程 |
| 不修 / 推 Phase 2 之后再说 | 违反 g4 must-do 锁（#6 已判 must-do）|
| v1.1.0 minor bump | additive backward compatible 可 patch；patch 维持 release line 紧凑且对消费者 0 cognitive overhead |
| v2.0.0 major bump | 完全 over-engineered for additive field |
| 把 §5.5 其他 14 条一起修后发 v1.1.0 | g4 acceptance 锁出"其他 14 条进 sidecar"，扩张到 v1.1.0 违反 g4 |
| 不发 release，只 patch 本地 output | output 是 GitHub Release ship 的（per D-046）；本地 patch 没法给外部消费者用 |

## 5. Consequences

### 5.1 Positive
- **kana_helper 字段在 Term entity 上**：Phase 2 app 读 Term 直接拿到 kana_helper，**简化 Phase 2 app 数据流**
- **v1.0.3 self-contained**：外部消费者也受益（不需要 join glossary）
- **Phase 1 数据完整性升一档**：从"数据可用"到"数据自洽"
- **Phase 2 prep 边界清晰**：v1.0.3 = Phase 2 真正的起点 data source

### 5.2 Negative / Risk
- 多一个 release tag (`v1.0.3`) 维护
- 多一个 backfill script + tests + ADR
- 多一次 publish 流程（~60-90 min wall）
- Risk: backfill script 漏 corner case（Term entity surface 没匹配 glossary key）→ §5.3 mitigation

### 5.3 Mitigation
- backfill script 写 5 unit tests + 1 integration smoke + spot-check 5+ Term entities
- script 设计为 idempotent（重跑同样 input 同样 output）
- diff v1.0.3 vs v1.0.2 JSON 验证只有 Term.kana_helper 字段新增，其他字段 0 diff
- Release notes 显式 "additive backward compatible / zero migration"
- Implementation 走 user 显式 gate（§2.7）

## 6. Linked / supersede / amend

- **Supersedes**: 无
- **Amends**: 无
- **Linked**:
  - **D-083 §2.4**: 本 ADR 是 D-083 §2.4 "§5.5 m2 Session 25 mapping" 的 must-do 实施 sub-ADR
  - **D-081 release-asset-shape**: 本 release publish 复用 v1.0.2 同款 asset shape
  - **D-046 output via GitHub Release**: 复用
  - **D-012 kana_helper field definition**: 数据契约源头
  - **D-076 envelope**: backfill 不动 envelope（仍 refuse UNTRANSLATED + answer_index=-1）
- **Cited by future**: Phase 2 implementation 引用 v1.0.3 as canonical data source

## 7. Sign-off

| 角色 | 名字 | 时间 | 状态 |
|---|---|---|---|
| 撰写人 | Claude Opus 4.7 (1M ctx) | 2026-05-18 Session 25 Turn 3 | **LOCKED final** (path α one-step sign-off) |
| Reviewer #1 (per Rule D) | user (hakupao) | 2026-05-19 Session 25 Turn 4 | **APPROVED** — Q8 = α, ACK D-084 LOCKED draft as-is |

Per D-019 + Rule D: Writer (Claude) ≠ Reviewer (user 终审)。本 ADR LOCKED final at Session 25 Turn 4 commit。Implementation 起手仍需独立 user "go implement v1.0.3" gate（§2.7）。

---

## End of D-084
