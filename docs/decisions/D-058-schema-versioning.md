# D-058 — Schema Versioning Policy

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 03, 2026-05-06) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019 protocol) |
| **Source** | `docs/discussion/2026-05-06-session-03.md` §4.5 |
| **Related** | D-009, D-010, D-022, D-026, D-029, D-054, D-055, D-056, D-057 |

---

## 1. Context

cert-extractor 是要长期演化的库（路线图到 Phase 5 = 通用框架开放给第三方 cert）。schema 必然会演化（新字段 / 改语义 / 删旧字段 / 加 entity type）。

**核心问题**: 怎么标识 schema 版本，让下游消费方（Phase 3 前端 / 第三方插件 / 离线 JSON 文件流通）能反向兼容？

User 在 Session 03 §4.5 委托 Claude 按"最优解"决定，Claude 走 D-019 "你来定" 协议:

1. 查权威 docs（不靠记忆）
2. 锁 D + 显式理由
3. 列 rejected alternatives
4. 同回合写回 session log + STATE.md + 本 ADR

---

## 2. Decision

### 2.1 顶层 envelope 形态

Stage 7 export 输出的所有 JSON 文件**顶层必须含 4 字段 envelope** + items 主体:

```json
{
  "schema_version": "1.0.0",
  "extractor_version": "0.1.0",
  "cert_id": "itpassport_r6",
  "generated_at": "2026-05-06T13:24:55+09:00",
  "items": [ /* Entity[] */ ]
}
```

### 2.2 字段规约

| 字段 | 类型 | 必要性 | 来源 / 生成方式 |
|---|---|---|---|
| `schema_version` | str (SemVer) | 必 | 锁定在库代码常量 `SCHEMA_VERSION`；演化遵循 §2.3 bump 规则 |
| `extractor_version` | str (SemVer) | 必 | `importlib.metadata.version("cert-extractor")` 自动拉取 |
| `cert_id` | str | 必 | 与 D-010 一致；如 `itpassport_r6` |
| `generated_at` | str (ISO 8601) | 必 | `datetime.now(tz=ZoneInfo("Asia/Tokyo")).isoformat()` |
| `items` | list[Entity] | 必 | Discriminated Union per D-056 |

### 2.3 SemVer bump 规则

| 变更类型 | bump | 示例 |
|---|---|---|
| **MAJOR** | x.0.0 → (x+1).0.0 | 删字段 / 改字段类型 / 改字段语义 / 删 entity type / Discriminated Union value 改名 / 改 envelope 4 字段任一 |
| **MINOR** | x.y.0 → x.(y+1).0 | 加 optional 字段 / 加 entity type / 加 enum value / 加新的 entity property |
| **PATCH** | x.y.z → x.y.(z+1) | 仅 docstring / description 文本变更 / bug fix（不影响 schema 形态） |

### 2.4 版本号脱钩规则

- `schema_version` 与 `extractor_version` **解耦**
- 库 PATCH 时 schema 不必 bump（保持 1.0.0）
- 库 MAJOR 时 schema 不必 bump（除非真改了 schema）
- schema MAJOR bump 时**必须同回合写新 ADR**（`docs/decisions/D-NNN-schema-bump-vN.md`），见 D-029 流程

---

## 3. Rationale

### 3.1 为何选顶层 envelope (而非 per-entity / 不写)

**业界共识参照**（不靠 Pydantic 一家言）:

| 标准 | 版本号位置 | 形态 |
|---|---|---|
| **JSON Schema spec** | 顶层 `$schema` URL | `"https://json-schema.org/draft/2020-12/schema"` |
| **OpenAPI spec** | 顶层 `openapi` | `"openapi": "3.1.0"` |
| **package.json** | 顶层 `"version"` | SemVer 字符串 |
| **pyproject.toml** | 顶层 `[project] version` | SemVer |
| **Cargo.toml** | 顶层 `[package] version` | SemVer |

→ "顶层 + SemVer" 是跨语言、跨工具链的事实标准。

**Pydantic v2 官方支持** (via context7 `/websites/pydantic_dev_validation`):

- `model_config = ConfigDict(json_schema_extra={...})` 是官方推荐 metadata 注入方式
- `model_json_schema()` 是标准 JSON Schema 导出 API
- Pydantic v2 不强制 schema versioning pattern (=应用层决定)

**5 个具体好处**:

1. **业界共识**: OpenAPI / JSON Schema / package.json 全部采用此模式
2. **离线文件 self-describing**: 用户下载一个 release JSON 隔月再用，不需要外部信息源就能知道版本与兼容性
3. **下游消费友好**: Phase 3 前端读 envelope 顶层一字段即可路由处理逻辑，不需要 walk entity 树
4. **多版本 dataset 隔离**: 一份 dataset = 一次 extractor 运行 = 一个版本（合理预设）；不需要 per-entity 版本
5. **向 Phase 5 通用框架友好**: 第三方 cert 插件统一遵守此 envelope

### 3.2 为何 4 字段而非只一个 schema_version

只一个 `schema_version` 不足以支撑 long-term 调试 + 审计:

- `extractor_version` 帮调试 ("是 0.3.1 还是 0.3.2 跑出来的"）
- `cert_id` 让下游路由不同 cert 处理逻辑
- `generated_at` 让缓存判定 / 审计追溯有依据

4 字段是"最小完备 envelope"，再多就是 over-engineering，再少就是 under-spec。

### 3.3 为何 SemVer (而非日历版本号 / 单调递增整数)

- SemVer 业界共识，下游工具（如 `packaging.version` / `semver` package）原生支持
- 区分 MAJOR / MINOR / PATCH 让消费方做兼容性判断有依据（兼容 = 同 MAJOR）
- 与库 PyPI version (extractor_version) 形式一致，认知负担低

---

## 4. Alternatives Considered

### 4.1 (B) per-entity 版本号

每个 entity record 都带 `schema_version`。

**拒因**:

- 当前一份 dataset = 一次 extractor 运行 = 同版本，per-entity 版本 100% 重复
- schema 体积浪费（重复 N 次）
- 工具链要 walk 所有 entity 才能确认版本（顶层一字段更优）
- 仅在"多次运行 merge 进同一 dataset" 场景才有意义，当前不需要

**何时复议**: 如未来真出现"多次 extractor 运行 merge 成一份 dataset"且不同运行 schema 版本不同的场景，可考虑加 record-level `_schema_version` 作为可选 override。

### 4.2 (C) 不显式写版本

完全靠 git tag / 库 PyPI version 兜底；schema 不写版本。

**拒因**:

- 离线 JSON 文件流通时无法识别版本（用户下载下来再用，不知道是哪版库导出的）
- 第三方消费者需"猜"或"问"，违反 self-describing 原则
- 与 OpenAPI / JSON Schema / package.json 全行业共识相反
- 调试 / 审计 / 兼容性判定都没有 first-class 数据

**何时复议**: 不会复议。这是反模式。

---

## 5. Consequences

### 5.1 正面

- 任何离线 JSON 文件流通 = self-describing
- Phase 3 前端 / 第三方插件 / Phase 5 通用框架使用者都有清晰的版本契约
- schema 演化 → ADR 驱动，可追溯
- 与业界标准对齐，使用者学习成本低
- envelope 4 字段恰好覆盖"是什么 schema / 哪版库 / 哪 cert / 何时生成"四问

### 5.2 负面 / 接受的代价

- 每个 export JSON 都多 4 字段（开销 < 200 bytes / file，可忽略）
- schema MAJOR bump 时必须新写 ADR（D-029 工作量）
- 库代码需维护一个常量 `SCHEMA_VERSION`（low-cost）

---

## 6. Implementation Notes

> **本场不写代码**。以下仅为实施期参照。

```python
# packages/extractor/src/cert_extractor/schema/export.py
from datetime import datetime
from importlib.metadata import version
from zoneinfo import ZoneInfo
from typing import Annotated, Union

from pydantic import BaseModel, ConfigDict, Field

# Module-level constant — bump per §2.3 rules
SCHEMA_VERSION = "1.0.0"


class Envelope(BaseModel):
    """Stage 7 export 顶层包封。所有 JSON 输出文件遵守此形态 (D-058)。"""

    model_config = ConfigDict(extra="forbid", strict=True)

    schema_version: str = Field(default=SCHEMA_VERSION, frozen=True)
    extractor_version: str = Field(
        default_factory=lambda: version("cert-extractor")
    )
    cert_id: str = Field(..., min_length=1)
    generated_at: str = Field(
        default_factory=lambda: datetime.now(tz=ZoneInfo("Asia/Tokyo")).isoformat()
    )
    items: list["Entity"]  # Discriminated Union per D-056
```

`items` 类型 `Entity` 见 D-056 实施 notes。

---

## 7. Related Decisions

| D | 关系 |
|---|---|
| **D-009** 三语 schema | envelope.items 内每文本字段走 Trilingual (D-054) |
| **D-010** cert-agnostic | envelope.cert_id 体现 |
| **D-022** Hybrid 锚点 | Entity 内 page / block_id / section_path |
| **D-026** 插件 `__cert_extractor_min_version__` | extractor_version 与 schema_version 脱钩规则的依据 |
| **D-029** 重大决定独立 ADR | 本 ADR 自身遵循 |
| **D-054** Trilingual BaseModel | envelope.items 内字段类型 |
| **D-055** 占位符 `<UNTRANSLATED>` | envelope.items 内 stage 转换约束 |
| **D-056** Discriminated Union | envelope.items 类型 |
| **D-057** 全 stage 强校验 | envelope 在 stage 7 export 时也走 model_validate |

---

## 8. Revision History

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-06 | 1.0 | Initial — Session 03 §4.5 锁定 |

---

> 本 ADR 关联的活页讨论: `docs/discussion/2026-05-06-session-03.md` §4.5 + §4.6 + §6.2。
