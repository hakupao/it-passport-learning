# B6 — v1 `term_zh` 冲突清单与 zh 译语表种子

> 生成：`node scripts/textbook-v2-zh-terms.mjs --conflicts`（全 244 单元的 `term_zh`；v2 单元的 `term_zh` 按不变量等于 v1）。种子表：`data/ip/textbook/zh_terms.json`（`--seed`），之后手工维护。

## 1. 冲突（同一见出し語在不同单元的 v1 term_zh 不同）：共 4 个

| 用語 | 単元 | v1 term_zh | term_en | 処置 |
|---|---|---|---|---|
| MBO | strategy-01-01-u06 | MBO(目标管理) | MBO (Management by Objectives) | 単元別（homograph: 目标管理 (management by objectives) vs 管理层收购 (management buyout)） |
|  | strategy-03-09-u04 | 管理层收购（MBO） | MBO |  |
| E-R図 | strategy-06-19-u01 | E-R 图 | E-R Diagram | 統一 → E-R图（spelling only (E-R 图 / E-R图（实体-关联图）)） |
|  | technology-21-55-u02 | E-R图（实体-关联图） | E-R Diagram |  |
| デュアルシステム | technology-16-43-u02 | 双重系统 | Dual System | 除外（OQ-15: v1 term_zh swapped with デュプレックスシステム across technology-16-43-u02 / technology-16-44-u03 (v1 mistranslation; term_zh = v1 invariant)） |
|  | technology-16-44-u03 | 双工系统 | Dual system |  |
| デュプレックスシステム | technology-16-43-u02 | 双工系统 | Duplex System | 除外（OQ-15: v1 term_zh swapped with デュアルシステム across technology-16-43-u02 / technology-16-44-u03 (v1 mistranslation; term_zh = v1 invariant)） |
|  | technology-16-44-u03 | 双重系统 | Duplex system |  |

- **MBO**：同形异义（目标管理 / 管理层收购）→ 表的 `per_unit` 按单元分别登记。
- **E-R図**：只是写法不同 → 统一为 `E-R图`（检查时忽略空白，`E-R 图` 也算命中）。
- **デュアルシステム / デュプレックスシステム**：两个单元之间译法互换。technology-16-43-u02 是对的（デュアル = 双重系统，デュプレックス = 双工系统），technology-16-44-u03 是 v1 误译 → 两者都放进 `excluded`（不检查），**交 OQ-15**。数据不动：v2 的 `term_zh` 必须等于 v1，要修正就得放宽这条不变量并重建 fixture。

## 2. 参考：不同见出し語用同一个 zh（不是冲突，不处理）

- 编码：コーディング / 符号化 / エンコード
- 回归测试：回帰テスト / リグレッションテスト
- 迁移：移行 / マイグレーション
- 监控：モニタリング / 監視
- 问卷调查：アンケート / アンケート調査
- 可追溯性：トレーサビリティ / 責任追跡性
- 双重系统：デュアルシステム / デュプレックスシステム
- 双工系统：デュプレックスシステム / デュアルシステム

## 3. 种子内容

- `terms`：无冲突见出し語的 v1 term_zh（1391 个），加上 `E-R図 → E-R图`，再加试点（management-10-27-u01〜u03 的 zh `[[jp:…]]` 注记）定下来、且不是见出し語的词（`PILOT_WORDS.global`，例如 定常業務 → 日常业务、結合点 → 节点、クリティカルパス → 关键路径）。试点用词如果本身是见出し語（例如 変更管理 → 变更管理、回避 → 规避），保留它的 v1 term_zh。
- `per_unit`：MBO（2 个单元），以及只用于风险单元的 低減 → 降低、移転 → 移转、保有 → 保留（JIS Q 31000 的别称；在别的 topic 里是一般义，所以不进全局表）。
- `excluded`：デュアルシステム、デュプレックスシステム（OQ-15）。

## 4. 对已上线 v2 单元的 WARN 检查（`--check-units`，B6 review 之后）

规则：jp 字段里出现表中的词，同一字段的 zh 里就必须有映射的 zh。忽略空白和标记。匹配方式见第 5 节。

| 单元 | 位置 | 词 → 表中的 zh | 判断 |
|---|---|---|---|
| management-10-27-u01 | — | 0 件 | — |
| management-10-27-u02 | — | 0 件（アンケート：表值改为「问卷调查（问卷）」后不再命中） | — |
| management-10-27-u03 | terms[4].analogy_zh | スマートフォン → 智能手机 | 比喻的表达，属提醒 |

review 之前是 2 / 1 / 2 件；監視、対比、手続 都是 2 个汉字的非见出し語，已不在全局检查范围内。试点是冻结基线，不打补丁。WARN 不算 issue。

## 5. B6 review（F1 / F2 / F3 / F5）与噪声测量

测量命令：`node scripts/textbook-v2-zh-terms.mjs --probe-v1`。对象是全部 v1 单元的 definition / explanation 的 jp↔zh 对，共 2804 对。

| 阶段 | 有 WARN 的对 | WARN 件数 |
|---|---|---|
| review 前（c35706d…3e82c1a 的规则） | 426 / 2804 = **15.2%** | 476 |
| F1 + F2(b) + F5 之后（逐词裁定之前） | 198 / 2804 = 7.1% | 219 |
| 加上逐词裁定（最终） | 174 / 2804 = **6.2%** | 189 |

（coordinator 说的约 17%，统计口径可能不同；以上数字都是用同一个探针、同一口径测的。）

review 前最常命中的：項目 → 数据项 49、手続 → 过程 30、パスワード → 口令 28、最適化 → 最优化 20、分散 → 方差 17、利益 → 利润 14、反復 → 重复 14、体制 → 组织体制 13、OS → 操作系统 13、整列 → 对齐 12。

- **F1**：以拉丁字母或数字开头的词，要求两侧都不是 `[A-Za-z0-9]`（GAP分析 里的 AP、BRAND 里的 AND、SCAN 里的 CA、CDROM 里的 CD/ROM 都不算命中；CASEツール 仍命中 CASE）。另外，纯拉丁的缩写词在 zh 里原样保留也算命中（例如 OS 写成 OS）。
- **F2(b)**：在所有单元都检查的条件是：3 个字以上，或整词是片假名，或是拉丁词。不足 3 个字的汉字词，只在把它作为自己见出し語的单元里检查。1 个字的词从不检查。
- **F2(a)**：译者和译审的 prompt 写明，只有当日文词用的是该见出し語的专门含义时才用表里的译法；日常用法或其他含义按意思翻译。
- **F5**：`・` 不算片假名段的一部分。
- **F3**：prep 用同一个匹配器，把本单元需要的条目写到 `<planning>/<id>/zh_terms.unit.json`，来源是 manifest 的 JP 内容、见出し語和本单元的 per_unit 条目。译者和译审只读这个文件；`zh_terms.json` 仍是检查的唯一依据。
- **F4（只记录）**：如果表值带括号，括号外和括号内各自都算合格。所以 per_unit 的「MBO(目标管理)」在 zh 里只写「MBO」也算通过；这是已知的宽松之处。

逐词裁定（`OVERRIDES`；见出し語本身的 term_zh 保持 v1 不变，只扩大正文可用的译法）：

| 词 | v1 term_zh | 表的值 | 依据 |
|---|---|---|---|
| パスワード | 口令 | 口令（密码） | v1 正文 54 对里用 密码 42 次、口令 13 次；大陆日常用语是 密码，口令 是 GB/T 安全标准用语 |
| 最適化 | 最优化 | 最优化（优化） | v1 正文 32 对全部用 优化（最优化 6 次） |
| アンケート | 问卷调查 | 问卷调查（问卷） | v1 正文 26/26 用 问卷（问卷调查 9 次） |
| PC / SNS | 原样 | 原样（不改） | 两种说法都自然（PC：电脑 18，保留 PC 32/45；SNS：社交媒体 11、社交网络 7，保留 SNS 16/30），作为提醒保留 |

最终仍较多的命中：SNS 11、PC 10、ビット 9、バーコード 8、尺度 8、応答時間 8（都是译法上的差异，属提醒）。
