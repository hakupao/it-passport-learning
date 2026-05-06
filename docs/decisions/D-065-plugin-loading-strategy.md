# D-065 — Plugin Loading Strategy: Phase 1 D-025 Only + Entry-Points Interface Reserved

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 05, 2026-05-06) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019 protocol; user framing: **"严格但不死板，前提是做出来"** + 加 "听不懂请解释" 诉求) |
| **Source** | `docs/discussion/2026-05-06-session-05.md` §4.2 |
| **Related** | D-021 (4 axes), D-024 (Python 3.11+), D-025 (内部装饰器), D-026 (第三方 entry_points + min_version), D-064 (4 namespace), D-066, D-067, D-068 |

---

## 1. Context

D-026 锁了"内部插件用 D-025 装饰器，第三方插件走 Python entry_points"。但 Phase 1 没有第三方插件需求 — 实际上要不要在 Phase 1 就把 entry_points 路径 ship 出来是个设计选择。

User 在 Session 05 委托 Claude 决策（"听不懂，请你做最优解"），Claude 按 user 一贯 framing **"严格但不死板，前提是做出来"** + entry_points 路径生命周期分析推理。

**核心问题**: Phase 1 加载插件的代码路径设计 — 走 D-025 装饰器、entry_points、还是双轨？

---

## 2. Decision

### 2.1 Phase 1 阶段策略

**Phase 1 plugin loader 只走 D-025 装饰器路径**。entry_points 加载路径**在代码里预留接口**（feature flag），Phase 1 默认关闭，Phase 5 真有第三方插件需求时打开。

### 2.2 Loader 接口设计

```python
# packages/extractor/src/cert_extractor/plugins/loader.py

from importlib.metadata import entry_points

AXES = ("source", "ocr", "translator", "exporter")
EP_GROUPS = {axis: f"cert_extractor.{axis}" for axis in AXES}  # per D-064


class PluginLoader:
    """统一 plugin loader. Phase 1 只启用 _load_via_decorators."""

    def __init__(self, enable_entry_points: bool = False):
        self.enable_entry_points = enable_entry_points

    def load_all(self) -> dict[str, dict[str, "Plugin"]]:
        """加载全部 4 axis 的 plugins.

        Returns: {axis_name: {plugin_name: Plugin instance}}
        """
        plugins: dict = {axis: {} for axis in AXES}

        # Phase 1 唯一路径
        decorator_plugins = self._load_via_decorators()
        plugins = self._merge(plugins, decorator_plugins)

        # Phase 5 启用此分支
        if self.enable_entry_points:
            ep_plugins = self._load_via_entry_points()
            plugins = self._merge(plugins, ep_plugins)

        return plugins

    def _load_via_decorators(self) -> dict:
        """Phase 1 唯一路径. 扫描 packages/extractor/src/cert_extractor/plugins/<axis>/*.py"""
        ...

    def _load_via_entry_points(self) -> dict:
        """Phase 5 启用. 按 D-064 4 个 axis-namespace 分别加载."""
        result = {axis: {} for axis in AXES}
        for axis, group in EP_GROUPS.items():
            for ep in entry_points(group=group):
                plugin_cls = ep.load()
                self._validate_min_version(plugin_cls)  # per D-066
                self._validate_metadata(plugin_cls)     # per D-068
                result[axis][plugin_cls.name] = plugin_cls
        return result

    def _merge(self, base: dict, additions: dict) -> dict:
        """合并 plugins. 冲突时按 D-067 raise (默认) 或 YAML disambiguate."""
        ...
```

### 2.3 Phase 5 启用步骤

Phase 5 真有第三方插件需求时，启用 entry_points 路径**只需 1 步**：

1. PluginLoader 默认 `enable_entry_points=True`（或 pipeline YAML 控制）
2. 测试 + 文档化第三方接入流程

**不需要重构** — 因为接口已在 §2.2 预留。

### 2.4 内部插件不通过 entry_points 注册

Phase 1 内部插件（如 `mistral` OCR、`epub_image` source、`claude_sonnet_46` translator、`json` exporter 等）通过 `@register_<axis>` 装饰器（D-025）注册，**不**通过 `pyproject.toml [project.entry-points]` 注册。

这意味着:

- 开发期改插件不需要 reinstall (`uv sync` 不必 trigger)
- 内部插件不会出现在 `pip show cert-extractor` 的 entry_points 列表
- Phase 5 第三方插件通过 entry_points 注册时，与内部 D-025 装饰器路径**统一通过 PluginLoader._merge 合并**（per §2.2）

---

## 3. Rationale

### 3.1 为何 Phase 1 不启 entry_points

User framing "前提是做出来" → 拒绝 over-engineering：

- entry_points 路径 Phase 1 没有任何调用方
- 双轨制 (A) 让 Phase 1 实施成本翻倍而无收益
- 全统一 (C) 让内部开发每改 plugin 都要 reinstall (uv sync 成本)，影响开发速度

### 3.2 为何接口预留 (而非 Phase 5 再改)

- "改 Phase 5 时再加" 看似简单，但 plugin loader 是核心组件，跨 4 axis × N plugins，重构成本高
- 接口预留 = 1 个 method + 1 个 flag = 极低成本
- 让 Phase 5 transition 从 "重构" 降为 "打开 flag"

### 3.3 为何选 (B) 而非 (A) 双轨

- (A) 双轨在 Phase 1 已实施 entry_points 路径，但**没有调用方测试**
- 没有调用方 = 路径质量没法验证 = "Phase 5 启用时大概率有坑"
- (B) Phase 5 启用时与第三方 plugin 一起测试，有真实场景，质量更可信

### 3.4 与 D-026 字面对齐

D-026 字面: "内部用 `@register_<axis>` 装饰器，第三方走 Python entry_points"。

本 D 实施期翻译为:

- Phase 1 只有内部插件 → 只走装饰器（D-026 上半句字面）
- Phase 5 有第三方 → 启 entry_points loader（D-026 下半句字面）
- D-026 没说 entry_points loader 何时启用 → 本 D 锁 "Phase 5 启用"

---

## 4. Alternatives Considered

### 4.1 (A) Phase 1 双轨

**形态**: 内部 D-025，外部 entry_points，两路径在 Phase 1 都启用。

**拒因**:

- entry_points 路径 Phase 1 无调用方，未经实战测试
- Phase 1 实施成本翻倍
- Phase 5 启用时仍可能有坑（无真实第三方测试）
- 违反 user "做出来" 偏好

### 4.2 (C) Phase 1 全统一走 entry_points

**形态**: 内部 plugin 也通过 `[project.entry-points]` 注册；D-025 装饰器只是注册的语法糖。

**拒因**:

- 内部 plugin 改完要 reinstall (`uv sync` 或 `pip install -e .`)，开发体验差
- entry_points 加载比直接装饰器扫描慢（不显著但累积）
- Phase 1 没有任何 "统一" 收益（无第三方）
- 违反 user "做出来" 偏好（开发速度被拖累）

---

## 5. Consequences

### 5.1 正面

- Phase 1 实施成本最低（只一条加载路径）
- 内部 plugin 开发体验佳（改完即生效，无 reinstall）
- Phase 5 transition 是 "打开 flag" 而非 "重构"
- 与 D-026 字面完全对齐
- 接口预留 (§2.2) 让 Phase 5 演进可见 + 有迹可循
- `_merge` 函数设计已包含 D-067 (name 冲突) 处理，Phase 5 ep plugins 自动遵守

### 5.2 负面 / 接受的代价

- entry_points 路径在 Phase 5 真启用时仍要测试（无 Phase 1 蹭测试）
- "feature flag" 类设计有 "预留接口最终没启用" 的常见反模式风险（接受 — Phase 5 是 roadmap 必经，不存在 "永远不启用" 的可能）
- Phase 1 阶段无法用 `pip show` 看到 cert-extractor 内部 plugin 列表（接受 — 内部插件本身就不需对外暴露）

---

## 6. Implementation Notes (实施期参照)

完整 PluginLoader 骨架见 §2.2。

**关键实施细节**:

1. `_load_via_decorators` 通过 `pkgutil.walk_packages` 或 `importlib.import_module` 扫描 `packages/extractor/src/cert_extractor/plugins/<axis>/`，每个 .py 文件 import 时装饰器副作用注册到 axis registry
2. `_load_via_entry_points` 按 D-064 4 个 axis-namespace 分别 `entry_points(group=...)` 取
3. `_merge` 必须按 D-067 实现冲突 raise + YAML disambiguate
4. `enable_entry_points` flag Phase 1 硬编码 False；Phase 5 通过 pipeline YAML `plugins.enable_entry_points: bool` 控制（或环境变量 `CERT_EXTRACTOR_ENABLE_EP`）

---

## 7. Related Decisions

| D | 关系 |
|---|---|
| **D-021** 4 axes | PluginLoader 按 4 axis 组织 |
| **D-024** Python 3.11+ | `importlib.metadata.entry_points(group=...)` 需要 3.10+ (本项目 3.11+ 满足) |
| **D-025** 内部装饰器 | Phase 1 唯一加载路径 (`_load_via_decorators`) |
| **D-026** 第三方 entry_points | Phase 5 启用，本 D 是其实施时机决定 |
| **D-064** 4 axis-namespace | `EP_GROUPS` 字典使用 |
| **D-066** strict_mode | `_load_via_entry_points` 调用 `_validate_min_version` |
| **D-067** name 冲突 | `_merge` 函数实现 |
| **D-068** metadata | `_validate_metadata` 函数 |

---

## 8. Revision History

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-06 | 1.0 | Initial — Session 05 §4.2 锁定 |

---

> 本 ADR 关联的活页讨论: `docs/discussion/2026-05-06-session-05.md` §4.2 + §4.6 + §6.2 + §6.6（大白话解释）。
