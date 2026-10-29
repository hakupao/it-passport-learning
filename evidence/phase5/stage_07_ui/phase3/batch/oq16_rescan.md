# OQ-16 — copy guard 修正后对已投入 13 单元的再走查

> S137 批间作业 ②。规则变更：`scripts/lib/textbook-v2.mjs` `copyIssues` 的遮蔽 (见出し語 / 题目 `terms` / `TERMLIKE_RE` 的 4+ 仮名列与英数 token) 不再**切断**连续串，而是替换成**每个不同 token 一个**私用区占位字符 (NFKC 后，题面与单元共用一张映射表)，占位计 1 字。阈值不变：题干 / 选项 12 字 (ii)，其他题文 20 字 (i)。
>
> 为什么每 token 一个占位而非统一的 1 个记号：统一记号会让「●は●管理者に…」与槽位里是别的术语的句子互相匹配，假阳性上升；每 token 独立后，不同术语之间永不相等，命名术语本身仍只占 1 字 (不构成抄写)。
>
> 本文件只记 qid 与转述，不含题目原文。

## 1. 方法

- 对象：`data/ip/textbook/units/` 下的 13 个 v2 单元 (management-10-27-u01〜u03, technology-23-63-u01〜u10)，各自的 `.planning/v2/<id>/manifest.json` 里的全部题目 (= 该 topic 的题目：题干 + 选项；thin manifest 无解说)。
- ① `node scripts/textbook-v2-validate.mjs --unit <id>` (新规则) 逐个运行，数 `copy` issue 与 exit code。
- ② 近似走查 (scratchpad 脚本，与 lib 相同的 normCopy + 遮蔽)：每个 JP 字段 (jpProse + jpFigText) × 每条题文，求遮蔽后最长公共子串；列出 ≥ 9 的全部，并与旧规则 (切断) 的长度对照。
- ③ 动机案例：b02 u08 a1 r0 (`parts/b02-u08-a1/technology-23-63-u08.jp.r0.json`，critic 人工判定 high 的草稿) 用新旧规则各跑一次。

## 2. 结果

### 2.1 validate (新规则)

| 单元 | copy issue | exit |
|---|---|---|
| management-10-27-u01〜u03 | 0 | 0 |
| technology-23-63-u01〜u04 | 0 | 0 |
| technology-23-63-u05 | 0 | **1** (17 个 `jp-origin` issue，D-202 前投入的单元；与本变更无关，旧规则下同样 exit 1) |
| technology-23-63-u06〜u10 | 0 | 0 |

→ 新规则**没有**让任何已投入单元新失败。已投入单元中无抄写命中。

### 2.2 近似走查 (最长公共串 ≥ 9，阈值 12)

最长 = 11，无 ≥ 12。≥ 10 的全部：

| 单元 | 字段 | qid | 新 | 旧 | 内容 (转述) | 判断 |
|---|---|---|---|---|---|---|
| management-10-27-u01 | key_points_jp[0] / terms[0].one_jp | 2026r08-q045 | 11 | 10 | 「项目宪章 = 正式批准项目的文件」这一定义句式 | 假阳性候补 (定义的标准说法，非抄写) |
| management-10-27-u03 | terms[0].points[2].text_jp | 2018h30h-q047 | 11 | 11 | 「对正面风险的应对」这一术语短语 | 假阳性候补 (术语短语) |
| management-10-27-u01 | terms[0].fig.steps[1].caption_jp | 2013h25h-q034 | 10 | 10 | 「汇总已定的计划书」 | 假阳性候补 (常用短语) |
| management-10-27-u01 | terms[2].points[2].text_jp | 2013h25h-q034 | 10 | 10 | 「明确角色与责任」 | 假阳性候补 (常用短语) |
| management-10-27-u03 | terms[1].points[0].text_jp | 2016h28a-q038 | 10 | 10 | 「执行风险应对计划」 | 假阳性候补 (术语短语) |
| technology-23-63-u06 | terms[4].fig.steps[2].caption_jp / terms[4].one_jp | 2009h21a-q074 | 10 | 8 | 「用接收者的公钥加密」 | 假阳性候补 (混合加密的标准描述) |
| technology-23-63-u06 | terms[5].one_jp | 2019r01a-q093 / 2026r08-q091 | 10 | 9 | 「无法从散列值还原原数据」 | 假阳性候补 (散列函数的标准性质) |
| technology-23-63-u07 | terms[2].detail_jp | 2019r01a-q093 / 2026r08-q091 | 10 | 9 | 同上 | 同上 |

9 字的另有 28 行 (字段×qid) (「发生概率与影响度」「像…一样使用的虚拟」「管理的机制」等)，全部是常用短语，判断 = 不构成抄写。

新规则让个别长度 +1〜+3 (u06 公钥 8→10、u05 goals 6→9、u01 人的资源管理 4→9)，均未到 12。

### 2.3 动机案例 (b02 u08 a1 r0)

| 字段 | qid | 新 | 旧 | 判断 |
|---|---|---|---|---|
| terms[3](パスワード).points[2].text_jp | 2011h23a-q081 | **12 → copy issue** | 9 (漏) | copy (critic 判 high 的那句：「个人用密码连系统管理员也不告诉」几乎原文) |
| terms[4](アクセス管理).points[0].text_jp | 2009h21a-q076 | 10 | 10 | 不触发；critic 指出的是「场面几乎照搬」的改写，机械检查范围外 |
| terms[5](ICカード).points[0].text_jp | 2016h28h-q076 | 11 | 11 | 不触发；同上 (换词改写，要素顺序相同) |

→ OQ-16 所指的漏检 (片假名切断) 已修复；critic 的另 2 句属于改写型，不是逐字串，仍靠 critic / Rule A verifier 人工判断。

## 3. 结论

- 已投入 13 单元：copy 0，无需修正，无新失败 (u05 的 exit 1 为既存 `jp-origin`，另案)。
- 无需豁免规则。
- 假阳性风险：现有最长近似 11，离 12 只差 1 字的有 2 处 (均为定义/术语短语)。b03 以后若出现定义句式类的 12 字命中，按 D-198 改写即可，不放宽规则。
