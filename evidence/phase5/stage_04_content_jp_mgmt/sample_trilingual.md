# 第一批 (management 18 unit) 三語サンプル — 三語ゲート審査用

> 全 18 unit: 三語完整性=PASS (1887 字段非空、term/summary 三語对齐、schema=trilingual)。
> 日語修正 (medium+6 low) は翻訳に反映済 (品質特性=兼容性含8特性, グリーンIT=両面フック, システム監査=改进建议)。
> 下記は代表2 unit。残り16 unit は `data/ip/textbook/units/*.json`。

---

## 要件定義と設計 / 需求定义与设计 / Requirements Definition and Design
`management-08-25-u01` — 頻度 頻出 / 5語

**概要**
- 🇯🇵 本ユニットでは、システム開発の最上流である「何を作るか」を決める要件定義(機能要件・非機能要件)と、それを「どう作るか」へ落とし込む設計工程(機能設計・詳細設計)、そして品質の評価軸となる品質特性を学びます。上流工程は手戻りの影響が大きく、システム開発技術の中でも頻出分野です。
- 🇨🇳 在本单元中，我们将学习系统开发最上游的内容：决定「做什么」的需求定义（功能性需求、非功能性需求），将其落实为「怎么做」的设计工程（功能设计、详细设计），以及作为质量评价标准的质量特性。上游工程一旦返工影响巨大，是系统开发技术中的高频考点领域。
- 🇬🇧 In this unit, you will learn the most upstream part of system development: requirements definition that decides "what to build" (functional and non-functional requirements), the design phase that turns it into "how to build it" (functional design and detailed design), and the quality characteristics that serve as the yardstick for evaluating quality. Rework in the upstream phase has a large impact, making this a frequently tested area within system development technology.

### 機能要件 / 功能性需求 / Functional requirements
**定義**: 🇯🇵 システムが備えるべき機能・処理内容そのものを定めた要求。
 / 🇨🇳 规定系统应具备的功能与处理内容本身的要求。
 / 🇬🇧 Requirements that specify the functions and processing content the system itself must provide.

**記憶フック**: 🇯🇵 機能要件といえば「何をするか」を定める要求 / 🇨🇳 说到功能性需求，就是规定「做什么」的要求 / 🇬🇧 Functional requirements → the requirement that defines "what it does"

### 非機能要件 / 非功能性需求 / Non-functional requirements
**定義**: 🇯🇵 性能・信頼性・セキュリティなど機能以外の品質や制約に関する要求。
 / 🇨🇳 关于性能、可靠性、安全性等功能以外的质量或约束的要求。
 / 🇬🇧 Requirements concerning quality or constraints other than functionality, such as performance, reliability, and security.

**記憶フック**: 🇯🇵 非機能要件といえば性能・信頼性・セキュリティの要求 / 🇨🇳 说到非功能性需求，就是性能、可靠性、安全性的要求 / 🇬🇧 Non-functional requirements → requirements for performance, reliability, and security

### 品質特性 / 质量特性 / Quality characteristics
**定義**: 🇯🇵 ソフトウェアの品質を評価するための観点を体系化した分類軸。
 / 🇨🇳 将评价软件质量的视角加以体系化的分类轴。
 / 🇬🇧 A set of classification axes that systematize the viewpoints for evaluating software quality.

**記憶フック**: 🇯🇵 品質特性といえば品質を測る評価の観点を体系化した軸 / 🇨🇳 说到质量特性，就是把衡量质量的评价视角体系化的轴 / 🇬🇧 Quality characteristics → the axes that systematize the evaluation viewpoints for measuring quality

*(残り 2 語省略)*

---

## スクラムの構成要素 / Scrum 的构成要素 / Components of Scrum
`management-09-26-u04` — 頻度 頻出 / 8語

**概要**
- 🇯🇵 このユニットでは、アジャイル開発の代表的フレームワーク「スクラム」を、チームと役割・反復イベント(スプリント)・作成物(バックログ)という構成要素ごとに体系的に学ぶ。特に3つの役割と各用語の対応がITパスポートで頻出する重要分野である。
- 🇨🇳 在本单元中，我们将围绕敏捷开发的代表性框架「Scrum」，按团队与角色、迭代事件（冲刺）、产出物（待办列表）等构成要素逐一系统学习。其中三种角色与各术语之间的对应关系，是 IT 护照考试中频繁出现的重点领域。
- 🇬🇧 In this unit, you will systematically learn Scrum, the representative framework for agile development, component by component: the team and roles, the iterative event (sprint), and the artifacts (backlogs). In particular, the three roles and how each term corresponds to them is a high-frequency, important area on the IT Passport exam.

### スクラム / Scrum / Scrum
**定義**: 🇯🇵 短い反復(スプリント)で開発を進める、代表的なアジャイルフレームワーク。
 / 🇨🇳 以短迭代（冲刺）推进开发的、代表性的敏捷框架。
 / 🇬🇧 A representative agile framework that advances development through short iterations (sprints).

**記憶フック**: 🇯🇵 スクラムといえば短い反復で進める代表的アジャイルフレームワーク / 🇨🇳 说到 Scrum，就是以短迭代推进的代表性敏捷框架。 / 🇬🇧 Scrum → the representative agile framework that advances through short iterations.

### スクラムチーム / Scrum 团队 / Scrum Team
**定義**: 🇯🇵 プロダクトオーナー・開発者・スクラムマスターから成る、スクラムを担う組織単位。
 / 🇨🇳 由产品负责人、开发者、Scrum Master 组成、承担 Scrum 工作的组织单元。
 / 🇬🇧 The organizational unit responsible for carrying out Scrum, made up of the Product Owner, Developers, and Scrum Master.

**記憶フック**: 🇯🇵 スクラムチームといえばPO・開発者・スクラムマスターの3役割からなる自己管理チーム / 🇨🇳 说到 Scrum 团队，就是由 PO、开发者、Scrum Master 三种角色组成的自管理团队。 / 🇬🇧 Scrum Team → a self-managing team made up of the three roles: PO, Developers, and Scrum Master.

### プロダクトオーナー / 产品负责人 / Product Owner
**定義**: 🇯🇵 プロダクトの価値最大化に責任を持ち、バックログの優先順位を決める役割。
 / 🇨🇳 对产品价值最大化负责、并决定待办列表优先顺序的角色。
 / 🇬🇧 The role responsible for maximizing the product's value and for deciding the priority order of the backlog.

**記憶フック**: 🇯🇵 プロダクトオーナーといえばバックログの優先順位を決め価値に責任を持つ人 / 🇨🇳 说到产品负责人，就是决定待办列表优先顺序、并对价值负责的人。 / 🇬🇧 Product Owner → the person who decides the backlog's priority order and is responsible for value.

*(残り 5 語省略)*

---

