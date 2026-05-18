# IT Passport — 三语学习内容 + `cert-extractor`

[![Phase 1](https://img.shields.io/badge/Phase%201-%E2%9C%85%20DONE-brightgreen)](docs/STATE.md)
[![最新发布](https://img.shields.io/badge/release-v1.0.2-blue)](https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![Audit](https://img.shields.io/badge/%E5%85%A8%E9%87%8F%E6%A0%B8%E9%AA%8C-100%25-success)](RETROSPECTIVE.md#9-post-publication-validation-addendum)
[![License](https://img.shields.io/badge/license-%E5%BE%85%E5%AE%9A-lightgrey)](#license--许可)

> 一本日语 **IT パスポート（令和 6 年度）**资格考试教材 → 结构化的三语（**日 / 中 / 英**）学习数据集。
> Pipeline：**`cert-extractor`**（Mistral OCR → Claude 结构化 → Claude 翻译 → 双门 audit → GitHub Release）。
>
> 🇬🇧 [English README](README.md)

---

## 选你的入口

### 🎓 我是来**学** IT Passport 的

直接去 **[Releases](https://github.com/hakupao/it-passport-learning/releases)** 下三语学习包。

| 内容 | 位置 |
|---|---|
| **最新版** | [`itpassport-r6-v1.0.2`](https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2) — 554 页 / 2 224 entities / 6 059 三语叶子 / 908 术语表 / ~736 处发布后校订 |
| 原始版 | [`itpassport-r6-v1.0.0`](https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.0) — 不可变保留 |
| 怎么看 | `index.json` → `pages/page_NNN.json`（或 `.md`）→ `glossary.json` — 详见 zip 内的 `output/README.md` |

每条术语都有 `{jp, zh, en}` 三元组。每条全片假名的 IT 术语额外带 `kana_helper = {surface, reading, zh_concept}`，让非母语读者一眼把假名映射到概念。这就是这个项目存在的全部理由。

### 💻 我是**开发者**，想用 `cert-extractor`

`cert-extractor` 从一开始就设计成 cert-agnostic（D-010）——同一套 pipeline 应能 onboard 任意资格。

- 入口：**[`packages/extractor/README.md`](packages/extractor/README.md)**
- 架构：4 个可插拔轴（source / OCR / translator / exporter），见 [D-021](docs/decisions/)
- Stage：8 个（unpack → OCR → classify → re-OCR → structure → glossary → translate → audit → export），见 [D-008](docs/decisions/)

```bash
# 克隆 + 装依赖 + 跑测试
git clone https://github.com/hakupao/it-passport-learning
cd it-passport-learning
uv sync
uv run pytest packages/extractor/tests/
```

要 onboard 新资格：把源 EPUB/PDF 放 `.source/`，写 `pipelines/<cert_id>.yaml`，再跑同一个 `cert-extractor` CLI。运行时数据落到 `data/<cert_id>/runs/<run_id>/<stage>/`。

### 🔬 我是**研究者** / **未来的自己**，准备进 Phase 2

| 先读 | 为什么 |
|---|---|
| **[`docs/STATE.md`](docs/STATE.md)** | Live state — 锁了什么、还开着什么、从哪续 |
| [`RETROSPECTIVE.md`](RETROSPECTIVE.md) | Phase 1 retro，含 §8（iter-5+6）+ §9（iter-7+8）发布后 validation 追加 |
| [`docs/decisions/`](docs/decisions/) | 82 条已锁 ADR（D-001 … D-082）——项目的制度记忆 |
| [`validation/`](validation/) | ~80 个 agent / 9 类 subagent / 100 % 覆盖的发布后 validation 链，把 v1.0.0 推到 v1.0.2 |

Phase 2 brainstorm 是下个用户触发的 session，入口列在 `STATE.md` §5「下一会话」。

---

## 项目背景（长版）

非母语日语技术考试学习者卡的不是**概念**（CPU / TCP/IP / ROI），而是**假名 / 汉字字形识读**。一次看过 `アクセシビリティ → accessibility → 可访问性`，就记住了。

所以 Phase 1 做了**一条 pipeline（`cert-extractor`）**和**一份三语数据集**（来自一本 IT パスポート 令和 6 年度 教材）。每个章节、术语、表格、练习题都带 `{jp, zh, en}` 三语渲染 + 假名辅助标注。

源教材仅作为**输入引用**——原书内容**不**重新分发（见 [License / 许可](#license--许可)）。

---

## 各 Phase 状态

| Phase | 状态 | 备注 |
|---|---|---|
| **Phase 1 — 三语内容工厂** | ✅ DONE | `cert-extractor` 完成 + v1.0.0 + v1.0.2 已发布。RETROSPECTIVE.md FINAL 含 §8/§9 追加。 |
| **Phase 2 — 个人备考工具** | brainstorm gate 开启 | 入口 = OQ-05 + RETROSPECTIVE §5.5 carry-forward + iter-5..8 surfaced 的 15 个 systemic patterns |
| Phase 3 — Web app / 题库 | 未设计 | — |
| Phase 4 — AI 学习助手 | 未设计 | — |
| Phase 5 — `cert-extractor` 作为通用框架 | 未设计 | — |

---

## 仓库地图

```
.
├── README.md / README.zh-CN.md      本文件（D-082 v2 landing）
├── CLAUDE.md / AGENTS.md            session 工具上下文（D-049）
├── RETROSPECTIVE.md                 Phase 1 retro + §8/§9 追加（Rule C）
├── pyproject.toml / uv.lock         uv workspace 根（D-036/037/038）
├── .source/                         🟦 gitignored 输入素材（D-082）—— EPUB 放这里
├── packages/extractor/              🟢 cert-extractor 包 —— 见其 README
├── apps/                            预留给 Phase 3+（D-038）
├── docs/                            📚 STATE / decisions（ADRs）/ discussion / release-notes / templates
├── evidence/                        Rule-A 单次 run 的 audit 证据
├── failures/                        Rule-B 失败 attempt 归档
├── validation/                      发布后 deep validation 链（iter-3..8）
└── data/                            🟦 gitignored 运行时数据（D-050）
```

每个被 track 的子目录都有自己的 `README.md` 说明用途。

---

## Build 数据（Phase 1）

| 指标 | 值 |
|---|---|
| Pipeline run | `dry_run_2026-05-12T13-23-19`（v1.0.0 + v1.0.2 共用） |
| 源教材 | IT パスポート 令和 6 年度 —— 579 页 → 输出 554 页 |
| Output | 2 224 entities / 6 059 三语叶子 / 908 术语表 |
| 测试集 | 492 个 unit + integration |
| 成本 | **Mistral $0.58 billed** / Anthropic $0 billed（max-plan OAuth，per D-069） |
| 发布后校订（iter-3..8） | ~736 JSON edits + 46 MD regens，38 个 fix ID，**$0 LLM billed** |
| Rule-D subagent 多样性 | **9** 类（code-reviewer / analyst / verifier / critic / scientist / tracer / executor / architect / qa-tester） |

---

## License / 许可

- **代码、pipeline、ADRs、release artifacts** —— License 待定（将采用某种宽松 OSS license；redistribution 前请咨询 repo owner）。
- **源教材** —— **不**重新分发。书名 + 作者按项目隐私规则（2026-05-17 起）从所有 artifact 中略去。要重跑 pipeline，需自行合法获取 EPUB 放到 `.source/IT-Passport.epub`。
- **生成的三语内容** —— 通过 GitHub Release 发布；同样适用 redistribution 注意事项（衍生自版权源、面向个人学习 + 方法论展示用途）。

---

## 联系 / 贡献

这是个个人 Tier-3 R&D 项目。Issues + PR 欢迎，但请预期 D-019 慢节奏 review。开 substantive issue 前先读 [`docs/STATE.md`](docs/STATE.md) + 最近一份 session log。
