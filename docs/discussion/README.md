# Discussion Logs / 讨论日志

本目录是项目所有设计讨论的**编年体证据存档**。

## 立项原则 / Why this exists

> 项目策略：**所有设计讨论都是证据**。一个决定背后的理由比决定本身更重要——它让未来的自己/协作者能判断「这个决定什么时候该被重新审视」。

如果讨论发生在本目录之外（例如即时通讯、README 注释中），必须在 24 小时内回填到此处。

## 命名规范 / Naming Convention

- 一次会话一个文件：`YYYY-MM-DD-session-NN.md`
  - `NN` = 当日的会话序号（同一天多场会话时递增）
- 跨多日的连续讨论按自然日切分文件，每个文件独立完整

## 每份会话日志必须包含 / Required Sections

1. **Header** — 日期、参与者、状态（in progress / complete / paused）、本场会话覆盖的讨论 Topic 编号
2. **Session Goal** — 本场要达成的目标
3. **Decisions Locked** — 用 `D-NNN` 编号，每条带 reason
4. **Open Questions** — 用 `OQ-NN` 编号，附带 owner（谁来回答）和归属 Topic
5. **What Was Discussed** — 摘要 + 关键引用
6. **What's Next** — 下一场会话进入什么 Topic

## 决定编号规则 / Decision ID Rules

- `D-NNN` 全局递增，跨会话不重复
- 一旦发布永不复用；如果决定被推翻，新决定写新 ID 并在 reason 里指明 supersedes `D-XXX`
- 所有决定的总索引在 `docs/decisions/` 维护（待 Topic #2 讨论后建立）

## 操作守则 / Operating Principles

源自 session 01 的实战教训：User 在 Topic #1 末尾发现 D-020~D-026 仅在对话中、未入文件，提出"关闭 session 后是否会丢失"的反问。**这些规则违反一次就要在 RETROSPECTIVE.md 里记一次**。

1. **决定即写入 (Decision-on-lock writeback)**：每个 `D-NNN` 一旦在对话中被双方确认，必须**当回合**写入当前 session 的日志文件。**禁止**「等本 topic 结束再批量补」。
2. **待定即列入 (Open-question registration)**：所有未决问题在被识别的当下用 `OQ-NN` 标号写入；禁止「先记在脑子里」。
3. **状态变更即同步 (Sync-on-state-change)**：当 OQ 被闭合、D 被推翻、phase 启动状态变化时，对应文件必须在**同一回合**修改。
4. **Live state vs Historical journal**：session 日志是历史档案（append-only）；当前累计状态由独立 live document 持有（具体设计见 Topic #2）。
5. **关 session 前自检**：每场会话结束前，Claude 必须主动声明并演示「本场所有 D / OQ / 状态变更已落盘」。

## 索引 / Index

| 会话 | 日期 | Topic 范围 | 状态 |
|---|---|---|---|
| [2026-05-06-session-01.md](2026-05-06-session-01.md) | 2026-05-06 | 项目立项 / 范围确定 / Phase 1 架构骨架 / 讨论路线图 | Complete |
| [2026-05-06-session-02.md](2026-05-06-session-02.md) | 2026-05-06 | Topic #3 续: 仓库布局 + 工程基线 (Q12-Q16) | In Progress |

## 配套目录 / Companion Directories

- `docs/decisions/` — ADR (Architecture Decision Records) 形式的关键决策（待 Topic #2 后建立）
- `docs/specs/` 或 `docs/superpowers/specs/` — 最终 spec 文档
- `evidence/` — 抽检证据（per 用户规则 A）
- `failures/` — 失败 attempt 归档（per 用户规则 B）
- `RETROSPECTIVE.md` — Phase 收尾复盘（per 用户规则 C）
