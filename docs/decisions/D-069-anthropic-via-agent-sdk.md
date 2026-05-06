# D-069 — Anthropic Access via Claude Agent SDK + Max Plan

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 06, 2026-05-06) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019; user "按你的推荐来"; framing "严格但不死板，前提是做出来") |
| **Source** | `docs/discussion/2026-05-06-session-06.md` §4.1 |
| **Related** | D-005 (Sonnet 主翻译), D-007 (Vision 难页 OCR), D-024 (Python 3.11+), D-061 (reviewer), D-070, D-071, D-072, D-073 |

---

## 1. Context

cert-extractor 实施期需调用 Claude（per D-005 翻译 + D-007 难页 OCR）。Anthropic 两种接入方式:

1. 独立 ANTHROPIC_API_KEY (pay-as-you-go billing)
2. Claude.ai / Claude Code 订阅（max 20x = $200/月） → OAuth credentials

User 已有 Claude Max 20x plan，但 max plan **不等于** API key — 不能用 `anthropic` SDK 直接。**Claude Agent SDK** (`claude-agent-sdk` Python) 通过支持 OAuth credentials 让 max plan 可用。

---

## 2. Decision

### 2.1 主路径

cert-extractor 通过 **`claude-agent-sdk` Python SDK** 调用 Claude，**不**安装 / 不 import `anthropic` SDK 直接。

### 2.2 Auth 路径

OAuth via macOS Keychain（user 已通过 Claude Code 登录 max 20 plan）。

Claude Agent SDK auth 优先级（context7 验证 `/anthropics/claude-agent-sdk-python`）:

```
ANTHROPIC_API_KEY env > CLAUDE_CODE_OAUTH_TOKEN env 
> .credentials.json 文件 > macOS Keychain
```

Phase 1 不设 ANTHROPIC_API_KEY env → 自动走 Keychain OAuth → 走 max 20 plan 配额。

### 2.3 模型选型

Claude Agent SDK `model` 参数指定:

- D-005 翻译 (sonnet 4.6 默认): `model="claude-sonnet-4-6"`
- D-007 难页 OCR Vision (sonnet 4.6 1M ctx): 同
- D-061 reviewer 升 opus: `model="claude-opus-4-7"`
- D-061 reviewer 降 haiku: `model="claude-haiku-4-5"`

### 2.4 升级到双轨路径（撞 quota 时）

1. 申请 ANTHROPIC_API_KEY (pay-as-you-go)
2. `export ANTHROPIC_API_KEY=...`
3. Agent SDK 自动按优先级用 API key → 不撞 quota

**零代码变更**（Agent SDK 优先级机制天然支持双路径）。

升级判定: D-071 软 cap (wall-time > 2h) WARN 时由 user 决定是否升级。

### 2.5 Budget 配置

Agent SDK `ClaudeAgentOptions.max_budget_usd` 与 D-071 cap 直接对接。Phase 1 设 `max_budget_usd = D-071.hard_cap.anthropic_usd`（默认 $30）。

---

## 3. Rationale

### 3.1 为何走 max plan（而非独立 API key）

User "前提是做出来" → 拒绝不必要支出。max 20 plan 已订阅 = 沉没成本，cert-extractor 直接用 = 零额外费用。

500 pages 全本估算（如走 API key 路径）:

| 用途 | tokens | $/M tokens | 小计 |
|---|---|---|---|
| Translation (Sonnet 4.6) | ~4.5M | $15 | ~$25 |
| Hard Re-OCR (Vision) | ~2.5M | $15 | ~$15 |
| Audit Reviewer LLM | ~360k | $15 | ~$2 |
| **合计** | | | **~$40 / 全本** |

max plan 走 OAuth = $0。

### 3.2 为何 Agent SDK 而非 anthropic SDK

`anthropic` SDK 只支持 ANTHROPIC_API_KEY，不支持 OAuth。要走 max plan 必须 Agent SDK。

附带好处:
- Agent SDK 已含 `max_budget_usd` / sub-agents / tool calling / streaming
- 与 D-061 reviewer 子 agent 模式天然兼容

### 3.3 为何不双轨起步

User "前提是做出来" + 双轨实施复杂度 = 不必要。max plan 起步零成本，撞 quota 再升级（零代码变更）。

---

## 4. Alternatives Considered

### 4.1 (B) 独立 ANTHROPIC_API_KEY

**拒因**: 多花 $25-40 / 全本，违 "做出来" 偏好；max plan 已订阅，沉没成本。

### 4.2 (C) 双轨

**拒因**: 实施复杂度高（双 SDK 路径维护）；Agent SDK 已天然实现"双轨"（优先级 fallback），user 层不需双 path。

---

## 5. Consequences

### 5.1 正面

- Phase 1 LLM 零额外费用
- 升级到 API key 零代码变更
- Agent SDK 高级特性可用
- 与 D-061 sub-agent reviewer 模式天然兼容

### 5.2 负面 / 接受的代价

- max plan 5h quota 限制（撞了等 reset 或升级）
- 强依赖 Agent SDK（如该 SDK 弃用要迁回 anthropic SDK 一次性切换）
- 需 user 在本机保持 Claude Code 登录态（OAuth credentials）

---

## 6. Implementation Notes

```python
# packages/extractor/src/cert_extractor/llm/claude_client.py
from claude_agent_sdk import ClaudeAgent, ClaudeAgentOptions

DEFAULT_MODEL = "claude-sonnet-4-6"


class ClaudeClient:
    def __init__(self, max_budget_usd: float = 30.0):
        self.options = ClaudeAgentOptions(
            model=DEFAULT_MODEL,
            max_budget_usd=max_budget_usd,  # per D-071
            # 不设 ANTHROPIC_API_KEY env 让 SDK 自动走 Keychain OAuth
        )

    def call(
        self,
        system: str,
        user: str,
        model: str | None = None,
    ) -> str:
        opts = self.options
        if model:
            opts = opts.with_model(model)
        agent = ClaudeAgent(opts)
        return agent.query(user, system_prompt=system).response
```

---

## 7. Related Decisions

| D | 关系 |
|---|---|
| **D-005** Claude Sonnet 主翻译 | 本 D `model` 参数指定 |
| **D-007** Claude Vision 难页 OCR | 本 D `model` 参数指定 |
| **D-024** Python 3.11+ | claude-agent-sdk 要求 |
| **D-061** reviewer 映射 | sub-agent 模式与 Agent SDK 天然兼容 |
| **D-071** budget cap | `max_budget_usd` 参数对接 |
| **D-072** cost tracking | Agent SDK token usage 进 cost.json |
| **D-073** Phase 1 启动 | dry-run 起就用 Agent SDK |

---

## 8. Revision History

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-06 | 1.0 | Initial — Session 06 §4.1 锁定 |

---

> 本 ADR 关联的活页讨论: `docs/discussion/2026-05-06-session-06.md` §4.1 + §4.6 + §6.2。
