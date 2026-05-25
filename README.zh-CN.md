<div align="center">

# IT Passport Learning

### 面向 ITパスポート 资格考试的三语学习 Web 应用

*结构化日语教材内容 + AI 学习工具 —— **日 / 中 / 英** 三语。*

[![在线访问](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E8%AE%BF%E9%97%AE-itlearn.bojiangz.com-0070f3?style=for-the-badge&logo=vercel&logoColor=white)](https://itlearn.bojiangz.com)
[![Phase 4](https://img.shields.io/badge/Phase%204-%E2%9C%85%20DONE-brightgreen?style=for-the-badge)](docs/STATE.md)
[![Tests](https://img.shields.io/badge/%E6%B5%8B%E8%AF%95-978%20passing-0A9EDC?style=for-the-badge&logo=vitest&logoColor=white)](#技术栈)
[![ADRs](https://img.shields.io/badge/%E5%B7%B2%E9%94%81%20ADR-107-6f42c1?style=for-the-badge)](docs/decisions/)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![AI SDK](https://img.shields.io/badge/AI%20SDK-v6-000?logo=vercel&logoColor=white)](https://ai-sdk.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-%E5%BE%85%E5%AE%9A-lightgrey)](#许可)

[:gb: English README](README.md) &nbsp;&middot;&nbsp; :cn: **中文**

</div>

---

## 这是什么？

**[itlearn.bojiangz.com](https://itlearn.bojiangz.com)** —— 面向日本 IT パスポート 考试（令和 6 年度）的三语学习工具。

非母语的日语技术考试学习者卡的不是**概念**（CPU / TCP/IP / ROI），而是**假名/汉字识读**。`アクセシビリティ → accessibility → 可访问性`，看一次就记住了。这个项目把一本教材变成完整的三语学习体验 —— 读教材、做题、查术语、AI 对话、个性化辅导，全部三语。

### 五大学习面

| 面 | 功能 |
|---|---|
| **教科书** | 全书阅读器 —— 16 章连续翻页、划词翻译、章内对话 & 测验、阅读进度追踪 |
| **测验** | 按章节分组的练习题 —— AI 为每道题生成解析 |
| **术语表** | 908 条三语术语 —— 按领域 & 章节分组，带 `kana_helper` 标注和 AI 悬浮解释 |
| **对话** | 自由 AI 对话 —— 围绕 IT Passport 话题，支持上下文和对话历史 |
| **助教** | AI 学习助手 —— 读取你的进度、答题记录和章节状态，给出个性化指导，难题自动升级模型 |

### 三套主题皮肤

随时切换视觉主题：

- **Gamified** —— 现代渐变 UI，进度游戏化
- **Retro** —— Windows 95 复古风，可拖拽窗口
- **Terminal** —— 黑客/终端风，绿字黑底

---

## 快速开始

访问 **[itlearn.bojiangz.com](https://itlearn.bojiangz.com)** —— 无需安装。

应用支持三种界面语言（日语 / 中文 / 英语），通过右上角语言切换器切换。

---

## 架构

```
itlearn.bojiangz.com
        │
        ▼
┌─────────────────────────────────────┐
│  Next.js 15 (App Router, Turbopack) │
│  React 19 · Tailwind CSS v4         │
│  next-intl (ja/zh/en)               │
├─────────────────────────────────────┤
│  5 个页面: /book /chat /quiz        │
│            /glossary /tutor         │
├─────────────────────────────────────┤
│  5 个 API 路由:                     │
│    /api/chat        (DeepSeek V4)   │
│    /api/quiz/explain (DeepSeek V4)  │
│    /api/glossary/hover (DeepSeek V4)│
│    /api/tutor       (多模型)        │
│    /api/hello-ai    (健康检查)      │
├─────────────────────────────────────┤
│  AI SDK v6 (streamText)             │
│  DeepSeek V4 Flash/Pro · Anthropic  │
│  Claude Sonnet/Opus · OpenAI (预留) │
├─────────────────────────────────────┤
│  Vercel (部署) · Analytics ·        │
│  Speed Insights                     │
└─────────────────────────────────────┘
        │
        ▼
  cert-extractor pipeline (Phase 1)
  Mistral OCR + Claude LLM → 三语数据集
```

---

## Phase 路线图

| Phase | 状态 | 交付物 |
|---|---|---|
| **Phase 1 — 内容工厂** | :white_check_mark: 完成 | `cert-extractor` pipeline —— 554 页、2224 entities、6059 三语叶子、908 术语表。两次 GitHub Release（v1.0.0 + v1.0.2）。 |
| **Phase 2 — 学习工具** | :white_check_mark: 完成 | Next.js 15 Web 应用 —— 对话、测验、术语表三大面。DeepSeek AI 集成。三语 UI。Vercel 部署。 |
| **Phase 3 — 教科书阅读器** | :white_check_mark: 完成 | 全书阅读器 —— 16 章连续翻页、划词翻译工具栏、章内对话 & 测验、阅读进度 & 完成追踪。 |
| **Phase 4 — AI 助教** | :white_check_mark: 完成 | AI 学习助手 —— 多模型大脑（DeepSeek/Anthropic/OpenAI）、上下文感知、难题自动升级、三套主题皮肤（Gamified/Retro/Terminal）。 |
| **Stage 8-9 — 内容重建** | :white_check_mark: 完成 | Web 用教材 pipeline —— 16 章蓝图 + 105 课 JSON 文件从 OCR 重建。 |
| **Stage 10 — 图片提取** | :hourglass: 下一步 | 从教材页面提取并关联图片。 |

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15.5（App Router, Turbopack） |
| UI | React 19, Tailwind CSS v4, Radix UI, Lucide icons |
| AI | AI SDK v6, DeepSeek V4 Flash/Pro, Anthropic Claude Sonnet/Opus |
| 国际化 | next-intl（日语 / 中文 / 英语） |
| 测试 | Vitest（486 前端测试）、Playwright（e2e）、pytest（492 pipeline 测试） |
| 部署 | Vercel, Vercel Analytics, Speed Insights |
| 内容 pipeline | Python 3.11+, uv workspace, Mistral OCR, Claude LLM |
| 限流 | Upstash Redis |

---

## 仓库结构

```
.
├── apps/web/                    Next.js 15 Web 应用
│   ├── src/app/[locale]/        5 个页面路由 (book/chat/quiz/glossary/tutor)
│   ├── src/app/api/             5 个 API 路由 (chat/quiz/glossary/tutor/hello-ai)
│   ├── src/components/          UI 组件 + 3 套主题皮肤
│   ├── src/lib/                 AI 供应商、数据层、工具库
│   └── messages/                国际化字符串 (ja/zh/en)
├── packages/extractor/          Phase 1 cert-extractor pipeline
├── docs/                        STATE.md、ADR、session log
│   ├── STATE.md                 项目实时状态（真相源）
│   ├── decisions/               107 条已锁 ADR (D-001 … D-107)
│   └── discussion/              60 份 session log
├── evidence/                    审核证据 (Rule A)
├── failures/                    失败归档 (Rule B)
├── data/                        [gitignored] pipeline 运行时数据
└── .source/                     [gitignored] 源教材 EPUB
```

---

## 本地开发

```bash
# 克隆
git clone https://github.com/hakupao/it-passport-learning
cd it-passport-learning

# Web 应用
cd apps/web
pnpm install
pnpm dev              # http://localhost:3000

# 跑测试
pnpm test             # Vitest（486 个测试）
pnpm test:e2e         # Playwright e2e

# 内容 pipeline（Phase 1）
cd ../..
uv sync
uv run pytest packages/extractor/tests/
```

### 环境变量

Web 应用需要 AI 供应商密钥来驱动对话/测验/助教功能：

| 变量 | 必填 | 说明 |
|---|---|---|
| `LLM_PROVIDER` | 是 | 默认 AI 供应商（`deepseek`） |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek API 密钥 |
| `LLM_PROVIDER_TUTOR` | 否 | 助教专用供应商覆盖（`deepseek` / `anthropic`） |
| `ANTHROPIC_API_KEY` | 否 | Anthropic API 密钥（助教 Anthropic 模式） |
| `UPSTASH_REDIS_REST_URL` | 否 | Upstash Redis URL（限流用） |
| `UPSTASH_REDIS_REST_TOKEN` | 否 | Upstash Redis token |

---

## 构建数据

<details>
<summary><strong>Phase 1 pipeline 指标</strong></summary>

| 指标 | 值 |
|---|---|
| 源教材 | IT パスポート 令和 6 年度 —— 579 页 |
| 产出 | 554 页、2224 entities、6059 三语叶子、908 术语表 |
| 成本 | Mistral $0.58 billed、Anthropic $0 billed |
| 发布后校订 | ~736 处 JSON 编辑，100% 自动化验证 |
| 最新 release | [`itpassport-r6-v1.0.2`](https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2) |

</details>

<details>
<summary><strong>项目统计</strong></summary>

| 指标 | 值 |
|---|---|
| 已锁 ADR | 107（D-001 … D-107） |
| Session log | 60 份 |
| 测试集 | 486 前端（Vitest）+ 492 pipeline（pytest）= **978 个测试** |
| Git tag | 7 个（3 个内容 release + 4 个 phase ship tag） |
| 已完成 Phase | 4 |

</details>

---

## 许可

- **代码、pipeline、ADR** —— License 待定（将采用宽松 OSS license；redistribution 前请咨询 repo owner）。
- **源教材** —— **不**重新分发。要重跑 pipeline 需自行合法获取 EPUB。
- **生成的三语内容** —— 通过 GitHub Release 发布，面向个人学习用途。

---

## 贡献

这是个人 R&D 项目。Issues 和 PR 欢迎。提交 substantive issue 前先读 [`docs/STATE.md`](docs/STATE.md) 和最近的 session log。

<p align="right"><a href="#it-passport-learning">↑ 回到顶部</a></p>
