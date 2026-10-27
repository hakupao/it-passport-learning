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

## 4. 对已上线 v2 单元的 WARN 检查（`--check-units`）

规则：jp 字段里出现表中的词，同一字段的 zh 里就必须有映射的 zh。忽略空白和标记；片假名词只按完整的片假名段匹配；1 个字的词不检查。

| 单元 | 位置 | 词 → 表中的 zh | 判断 |
|---|---|---|---|
| management-10-27-u01 | terms[0].points[1].text_zh | 監視 → 监控 | 正文用「监视」；按上下文两者都可以，属提醒 |
| management-10-27-u01 | terms[2].hook_zh | 対比 → 对比 | 改写成别的说法，提醒 |
| management-10-27-u02 | terms[1].fig 标签 | アンケート → 问卷调查 | 图标签较短，提醒 |
| management-10-27-u03 | terms[4].analogy_zh | スマートフォン → 智能手机 | 比喻的表达，提醒 |
| management-10-27-u03 | terms[4].points[1].text_zh | 手続 → 过程 | 表里是编程用语的 v1 译法（过程），这里是「手续」的意思，表的误检 |

试点是冻结基线（D-201 §0-4），以上都不打补丁，只记录在这里。WARN 不算 issue：不影响 D-199 判定，也不阻止 merge `--write`。
