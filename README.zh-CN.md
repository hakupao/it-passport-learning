<div align="center">

# IT Passport Learning

### 面向 ITパスポート 资格考试的三语过去问练习应用

*29 回 IPA 过去问（FY2009–FY2026）、对齐シラバス的教科书和术语表 —— **日 / 中 / 英** 三语。*

[![在线访问](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E8%AE%BF%E9%97%AE-itlearn.bojiangz.com-0070f3?style=for-the-badge&logo=vercel&logoColor=white)](https://itlearn.bojiangz.com)
[![Stage 7](https://img.shields.io/badge/Stage%207-%E6%95%99%E7%A7%91%E4%B9%A6%20v2%20%E9%87%8D%E5%86%99%E4%B8%AD-orange?style=for-the-badge)](docs/STATE.md)
[![Tests](https://img.shields.io/badge/%E6%B5%8B%E8%AF%95-1264%20passing-0A9EDC?style=for-the-badge&logo=vitest&logoColor=white)](#技术栈)
[![Decisions](https://img.shields.io/badge/%E5%B7%B2%E9%94%81%E5%86%B3%E7%AD%96-203-6f42c1?style=for-the-badge)](docs/decisions/)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-only-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-%E5%BE%85%E5%AE%9A-lightgrey)](#许可)

[:gb: English README](README.md) &nbsp;&middot;&nbsp; :cn: **中文**

</div>

---

## 这是什么？

**[itlearn.bojiangz.com](https://itlearn.bojiangz.com)** —— *ITパスポート 過去問ノート*，围绕真实过去问打造的日本 IT パスポート 考试学习应用。

非母语的日语技术考试学习者卡的不是**概念**，而是**假名/汉字识读**。`アクセシビリティ → accessibility → 可访问性`，看一次就记住了。所以每道题都保留日语原文，并附可显示/隐藏的中文和英文译文；每道题的解析也都有三种语言。

### 有什么

| 页面 | 功能 |
|---|---|
| **今日** | 每日计划：要重做的错题、到期的复习和新题（按考试的领域比例挑选）。新用户先做 20 题基线测试。还显示 2,900 道过去问的完成进度、考试日倒计时、弱项（正确率低 × 常考）、按领域对照合格标准（总分 600/1000，各领域 ≥300/1000）的正确率，以及今日 3 个术语。 |
| **练习** | 一屏一题：按考试回或按领域浏览、用自定设置练习，或重做错题。日语题面配中/英译文开关，图可放大，作答后显示三语解析。 |
| **模拟考试** | 和正式考试一样 100 题 120 分钟：按官方领域比例（ストラテジ 35 / マネジメント 20 / テクノロジ 45）随机抽题，或整套某一回过去问。0–1000 计分，交卷后才显示结果。 |
| **教科书** | 对齐シラバス的三语学习单元 —— 63 个领域、244 个单元 —— 含要点、图解和取自过去问的确认题。 |
| **术语表** | 1,395 个教科书术语，可用日 / 中 / 英检索，每条链接到所在教科书单元和相关过去问。 |
| **学习记录** | 累计数据、未来 7 天的复习量、每日题数（5 周）和各领域正确率。 |
| **设置** | 考试日、每日复习上限、每日新题数、译文默认显示与否、界面语言。 |

界面语言可在 日 / 中 / EN 之间切换。学习记录保存在你设备的浏览器里，无需注册账号。

### 计划中：AI 辅导

AI 辅导（*AI 先生*）—— 针对题目、术语或教科书单元提问，并对你的弱项做复习分析 —— **尚在计划中，暂未对访客开放**。

---

## 快速开始

访问 **[itlearn.bojiangz.com](https://itlearn.bojiangz.com)** —— 无需安装。

---

## 架构

```
itlearn.bojiangz.com
        │
        ▼
┌──────────────────────────────────────────┐
│  Next.js 15 (App Router, Turbopack)      │
│  React 19 · Tailwind CSS v4 · next-intl  │
├──────────────────────────────────────────┤
│  Pages /[locale]/…                       │
│    today (home) · practice · mock        │
│    textbook · glossary · record          │
│    settings · quiz (old-link redirect)   │
├──────────────────────────────────────────┤
│  API routes                              │
│    /api/quiz/questions                   │
│    /api/quiz/feedback  (owner only)      │
│    /api/learning       (owner sync)      │
│    /api/sensei/terms (AI tutor, planned) │
├──────────────────────────────────────────┤
│  Data: committed JSON corpus             │
│    data/ip/quiz      2,900 questions     │
│    data/ip/textbook  244 units           │
│  Learning record: browser storage        │
│    (+ Upstash Redis sync for the owner)  │
├──────────────────────────────────────────┤
│  Vercel · Analytics · Speed Insights     │
└──────────────────────────────────────────┘
        ▲
        │ built offline by
  scripts/  (Node / TypeScript pipeline)
  IPA past exams + syllabus → Claude extraction,
  checks and translation → trilingual corpus
```

---

## 内容

| 项目 | 来源 | 应用里有什么 |
|---|---|---|
| 过去问 | IPA 過去問題，FY2009–FY2026（29 回） | 2,900 题，其中 511 题带图；日语原文 + 中/英译文；三语解析；每题归入 63 个シラバス领域之一 |
| 教科书 | 以 IPA シラバス Ver.6.5 为骨架，AI 生成 | 63 个领域 244 个单元（ストラテジ 98 / マネジメント 23 / テクノロジ 123），1,417 个术语条目 |
| 术语表 | 由教科书术语汇总 | 1,395 条 |

过去问文本用 Claude vision 从 IPA PDF 提取，之后多轮全量对照原文修复和核验，独立抽样审核记录在 `evidence/` 下。

---

## 进度

| 阶段 | 状态 | 内容 |
|---|---|---|
| **Phase 1–4（第一版应用）** | :white_check_mark: 已退役 | 基于一本购买的教材构建的第一版（教科书 / 测验 / 术语表 / 对话 / 助教、三套主题皮肤）。已被下面基于 IPA 官方源的重建取代。 |
| **Stage 1–3.5 —— IPA 源数据** | :white_check_mark: 完成 | シラバス结构化；2,900 道过去问全部提取、修复并归入シラバス领域。 |
| **Stage 4 —— 教科书 v1** | :white_check_mark: 完成 | 生成 244 个三语单元。 |
| **Stage 6 —— 应用数据整合** | :white_check_mark: 已上线 | 教科书阅读、带译文和解析的过去问练习、术语表。 |
| **Stage 7 —— UI 重新设计** | :white_check_mark: 已上线 | 所有页面统一一套设计（今日 / 练习 / 教科书 / 术语表 / 学习记录 / 设置），模拟考试、学习记录、新的教科书阅读界面。 |
| **Stage 7 —— 教科书 v2 分批重写** | :hourglass: 进行中 | 单元正分批重写为 v2 格式：目前 244 个中已完成 13 个。 |
| **AI 辅导** | :calendar: 计划中 | 暂未对访客开放。 |

实时状态见 [`docs/STATE.md`](docs/STATE.md)。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15.5（App Router, Turbopack） |
| UI | React 19, Tailwind CSS v4, Radix UI, Lucide icons |
| 国际化 | next-intl（日语 / 中文 / 英语） |
| 存储 | 学习记录存浏览器；站长同步和题目反馈用 Upstash Redis |
| 测试 | Vitest（1,264 个测试）、Playwright（e2e） |
| 部署 | Vercel, Vercel Analytics, Speed Insights |
| 内容 pipeline | Node / TypeScript 脚本；用 Claude（Anthropic）做提取、审核和翻译 |

---

## 仓库结构

```
.
├── apps/web/                    Next.js 15 Web 应用（唯一的 pnpm workspace 成员）
│   ├── src/app/[locale]/        页面路由（practice、mock、textbook、glossary、record、settings 等）
│   ├── src/app/api/             API 路由（quiz、learning、sensei）
│   ├── src/components/          UI 组件
│   ├── src/lib/                 数据读取、学习记录、复习排期、模拟考试
│   ├── public/quiz-figures/     过去问图片（WebP）
│   ├── e2e/                     Playwright 测试
│   └── messages/                i18n 文案（ja/zh/en）
├── data/ip/quiz/                已提交的题库（题目、译文、解析）
├── data/ip/textbook/            已提交的教科书单元、图、单元索引
├── scripts/                     提取 / 修复 / 生成 pipeline 脚本
├── docs/
│   ├── STATE.md                 项目实时状态（真相源）
│   ├── decisions/               重大决策 ADR
│   └── discussion/              Session log
├── evidence/                    审核证据（Rule A）
└── failures/                    失败尝试归档（Rule B）
```

IPA 原始 PDF 和中间数据（`data/ip/exams`、`data/ip/sources`、`data/ip/syllabus`、`.source/`）已 gitignore。

---

## 本地开发

需要 Node ≥ 20.9 和 pnpm 11。

```bash
# 克隆
git clone https://github.com/hakupao/it-passport-learning
cd it-passport-learning

# 安装（在 workspace 根目录）
pnpm install

# Web 应用
cd apps/web
pnpm dev              # http://localhost:3000
pnpm build

# 检查
pnpm test             # Vitest
pnpm lint
pnpm test:e2e         # Playwright e2e

# 题库答案交叉核对（仓库根目录）
cd ../..
pnpm check:quiz:ci    # 只查已提交的数据
```

应用读取 `data/ip/` 下已提交的数据，所以本地运行不需要任何环境变量。没有 Redis 和站长密钥时，学习记录只保存在浏览器里。

### 环境变量

全部可选。

| 变量 | 说明 |
|---|---|
| `OWNER_KEY` | 站长密钥。带 `?owner_key=<OWNER_KEY>` 打开任意页面一次即设置站长 cookie，启用记录同步和题目反馈。未设置 = 没有站长。 |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | 站长记录同步和题目反馈用的 Upstash Redis（也接受 `KV_REST_API_URL` / `KV_REST_API_TOKEN`）。 |
| `QUIZ_DATA_ROOT` / `TEXTBOOK_DATA_ROOT` | 覆盖数据目录（默认是相对 `apps/web` 的 `../../data/ip`）。 |

---

<details>
<summary><strong>项目统计</strong></summary>

| 指标 | 值 |
|---|---|
| 过去问 | 2,900 题（29 回，FY2009–FY2026） |
| 教科书 | 63 个领域、244 个单元（13 个为 v2） |
| 术语表 | 1,395 条 |
| 已锁决策 | 203（D-001 … D-203） |
| Session log | `docs/discussion/` 下 73 份 |
| 单元测试 | 1,264 个（Vitest，110 个文件） |

</details>

---

## 许可

- **代码、pipeline、ADR** —— 许可待定（再分发前请联系仓库作者）。
- **过去问题目** —— 基于 IPA 公开的过去问题，著作权归 IPA 所有。文本经过 OCR 提取、整理、按シラバス分类和翻译，与原文有所不同。
- **教科书和解析** —— 本项目用 AI 生成。

---

## 贡献

这是个人研发项目，欢迎 Issue 和 PR。提交任何实质性内容前，请先读 [`docs/STATE.md`](docs/STATE.md) 和最新的 session log。

<p align="right"><a href="#it-passport-learning">↑ 回到顶部</a></p>
