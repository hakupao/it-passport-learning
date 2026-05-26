# Stage 6 Stage A — 用户 retro worksheet（2026-05-11）

> 这是给 user 看的"判断题工作纸"。不是 session 日志，不是 ADR。
>
> **目的**：在授权 Stage B 40 页 dispatch 之前，让 user 看清 Stage A 5 页的实际产出长什么样，然后回答 3 个判断题。
>
> **数据源**：`data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/audit/stage6_review.json`（Stage A re-run #2 的最终输出，commit `50e8d1b`）。下面所有 jp/zh/en 文本都是从 translated/structured JSON 现读的真实数据。
>
> **前置阅读**（可选，跳过也能看懂这份 worksheet）：
> - `docs/STATE.md` §5 — Session 10 close summary
> - `docs/decisions/D-077-stage6-audit-reviewer.md` — Stage 6 设计 ADR
> - `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_06_audit.md` §"Stage A re-run #2"

---

## 0. TL;DR — 你只需要回答 3 道判断题

| # | 判断 | 选项 |
|---|---|---|
| **Q1** | D9 噪音是否需要在 Stage B 前先处理？ | A 保持 WARN / B 降 INFO / C 加白名单（改代码） / D 先发 Stage B 看 40 页数据再定 |
| **Q2** | Stage A 那 2 条 LLM Phase-2 catch 的质量你认可吗？ | ✓ 认可（prompt v1.0 够用，发 Stage B） / ✗ 不认可（先改 prompt 再重跑 Stage A） |
| **Q3** | 是否授权 Stage B 40 页 dispatch？ | ✓ 授权 / ✗ 不授权（说一下要先 patch 什么） |

下面是判断这 3 题需要的材料。

---

## 1. Stage A re-run #2 的总分（先看大盘）

| 指标 | 值 | 怎么读 |
|---|---|---|
| pages_processed | 5 | 014 / 030 / 038 / 043 / 045 |
| overall_verdict | **WARN** | 没有 FAIL，没有 safety halt |
| pass / warn / fail | 0 / 5 / 0 | 5 页都 WARN 级 — 都有 issue 但都是非阻塞 |
| safety_failed | **False** | D5/D7 false positive 已修，关键安全字段没翻车 |
| most_severe_repair_stage | **5** | 所有问题都指向 Stage 5 翻译润色，没有指向更上游的 Stage 4 结构 bug |
| 总 issues | 19 | 13 deterministic WARN + 4 INFO + 2 LLM WARN/INFO |
| LLM calls | 12 | 5 页 × 平均 2.4 chunks（chunk_size=4） |
| shadow cost | $2.78 | max plan OAuth → 实际 billed $0 |

**这意味着什么**：Stage 6 的 detector + LLM 现在跑通了，技术上"能跑 40 页不炸"。但 19 条 issue 里有多少是真信号、多少是噪音，需要你看下面的内容判断。

---

## 2. 19 条 issue 全清单（按"信号 / 噪音"分组）

### 2.1 高价值真信号（3 条 — 你最需要看清的）

#### TP-1 · F-CHOICE-MARKER 抓到了 → page_043 entity[1].choices.zh

```
jp 选项标记：ア / イ / ウ / エ  (日文片假名)
zh 选项标记：A  / B  / ウ / エ  ← ★ 后两个漏译，混了日文标记
en 选项标记：(本题无 en choices 数据待查)

choice[0] jp='ア．エコファーム'      zh='A．生态农业'
choice[1] jp='イ．環境アセスメント'  zh='B．环境影响评价'
choice[2] jp='ウ．グリーンIT'        zh='ウ．绿色IT'    ← ★
choice[3] jp='エ．ゼロエミッション'  zh='エ．零排放'    ← ★
```

- **为什么这是真信号**：Plan-B 用户 retro 的时候你已经手工发现了选项标记不一致的问题（worksheet §B.4.3）。D6 detector 在 Stage A 里**自动**抓到了，并 tag 了 `repair_stage=7`（意味着 Stage 7 export 时统一标记 → A/B/C/D for zh+en，jp 保留 ア/イ/ウ/エ）。
- **它说明 Stage 6 在做正确的事**：不是教学层面的"翻译好不好"，而是契约层面的"数据出去后学习者用起来有没有歧义"。

#### TP-2 · LLM 抓到了循环英文定义 → page_038 entity[2] (`職能別組織`)

```
surface jp : 職能別組織
surface zh : 职能型组织
surface en : Functional Organization

def en（问题所在，完整原文）:
  "An organization that divides work into specialized functions and is structured
   with each function as a unit. Departments are divided by type of work, and
   employees specialize only in the function of their assigned department. The
   advantage is that it can leverage employees' expertise.
   It is also called 'Functional Organization' (機能別組織)."   ← ★ 循环
```

- **为什么这是真信号**：jp 原意是「这个 term 也叫『機能別組織』」（"異名"信号 — 同一个东西在日语里有两种叫法）。
- zh 处理得对（"也称为'机能型组织'"）。
- en 把 surface 翻成 `Functional Organization`，然后又说 "also called 'Functional Organization'" — 等于"它也叫它自己"，循环了。
- 应该翻成类似 `Also known as "機能別組織" (alternate Japanese name).` 或保留日文异名 + 注释。
- **这是 Phase 1 deterministic detector 100% 看不到的语义类问题**。需要 LLM 才能识别"循环定义"。

#### TP-3 · LLM 抓到了 zh 直译不地道 → page_043 entity[3].choices[3]

```
jp: エ．...自己完結的な経営活動が展開できる組織である。
zh: 丁．...能够开展【自我完结型】经营活动的组织。       ← ★ LLM 标的
en: D. ...self-contained management activities ...
```

- LLM 指出：「自我完结型」是日语式直译，对中文 IT 教材读者不够地道。建议「独立完整」或「自主完整」。
- en 用了正确的 "self-contained"，问题确实在 zh。
- **严重度 INFO**，不阻塞，仅风格建议。

### 2.2 边界灰色（10 条 — 算不算信号，看你怎么定）

#### D9 glossary_lock_missed × 9（精度低的主要噪音源）

D9 的逻辑：jp 里如果出现了 glossary 锁定的 key（比如「経営者」「システム」「組織形態」「CEO」），那 en 的字段里就**必须出现 glossary 锁定的 en 字面值**。如果 en 用了同义但不字面的词，D9 就报 WARN。

下面 9 条全部如下：

| Page | 路径 | jp 含 key | en 实际写 | glossary 锁 en | 是真问题吗 |
|---|---|---|---|---|---|
| 030 | ent[2].definition | 経営者 | `business operator` | （需查 glossary） | 多半否 — 同义 |
| 038 | ent[5].definition | システム | `systems` | `system` (单数) | 否 — 单复数差异 |
| 043 | ent[2].stem | 組織形態 | `organizational form` | （需查） | 多半否 — 同义 |
| 043 | ent[4].stem | システム | `information systems` | （需查） | 否 — 同义 |
| 043 | ent[4].choices[0] | CEO | `CEO` | （需查） | 否 — 字面一致 |
| 043 | ent[4].choices[1] | CFO | `CFO` | — | 否 — 字面一致 |
| 043 | ent[4].choices[2] | CIO | `CIO` | — | 否 — 字面一致 |
| 045 | ent[9].definition | 組織形態 | `organizational form` | — | 多半否 |
| 045 | ent[10].definition | 組織形態 | `organizational form` | — | 多半否 |
| 045 | ent[11].definition | システム | `information systems` | — | 否 |

**问题诊断**：D9 现在是"硬字面比对"，没考虑：
1. 单复数 / 大小写差异
2. 同义但不字面命中的合理翻译（`business owner` vs `business operator`）
3. en 字段已经包含 glossary 任一 zh_concept 替代字符串的情况

**Stage B 40 页跑下来，按这个规模估计会出 60-100 条 D9 WARN**。

### 2.3 低优先级 INFO（4 条 — 不阻塞，仅信息）

| Page | 路径 | 问题 | 应处理位置 |
|---|---|---|---|
| 038 | ent[6].kana_helper | 「システム」全片假名，缺 kana_helper | Stage 4.5 后续 polish |
| 045 | ent[3].kana_helper | 「コンピテンシ」缺 kana_helper | Stage 4.5 |
| 045 | ent[6].kana_helper | 「エコファーム」缺 kana_helper | Stage 4.5 |
| 045 | ent[8].kana_helper | 「ゼロエミッション」缺 kana_helper | Stage 4.5 |

D11 这 4 条**真实可信**：按 D-012，全片假名 term 应该附 kana_helper。但 INFO 级不阻塞 Stage 6，留给后续 polish。

### 2.4 风格 WARN（2 条 — 不冲突仅风格不同）

| Page | 路径 | jp / zh / en | 怎么读 |
|---|---|---|---|
| 014 | ent[1].rows[1][1] | 「4種類」/「4种」/「four types」 | jp/zh 用数字，en 用英文拼写。同义不冲突，所以 D7 走 WARN（severity 启发式 commit `162aebb` 的功劳） |
| 038 | ent[3].definition | 「1つ上に」/「一个」/「a」 | jp/zh 含「1」，en 用冠词 a。同义。WARN |

**这两条 D7 是 commit `162aebb` 修过的边界 case**：populated 数字集合一致就 WARN 而非 FAIL。逻辑正确，是否需要 WARN 是判断 Q1 范围内的事。

### 2.5 Run-level INFO（2 条）

```
[INFO] glossary_surface_concept_split: g_022 surface.zh='绿色IT' vs kana_helper.zh_concept='绿色信息技术' 不共享子串
[INFO] glossary_surface_concept_split: g_028 surface.zh='社会企业' vs kana_helper.zh_concept='社会商业' 不共享子串
```

按 worksheet A.4.4 的 INFO 定位，不阻塞。是 glossary 设计自一致性问题，不在 Stage 6 修。

---

## 3. 现在请回答 3 道判断题

### Q1 · D9 噪音怎么办？

**问题**：D9 现在 9 条里大概率有 7-8 条是低精度噪音（en 翻译合理只是不字面命中 glossary）。Stage B 40 页可能放大到 60-100 条 WARN。

| 选项 | 含义 | 影响 |
|---|---|---|
| **A — 保持 WARN** | 不改，按现状发 Stage B | Stage B retro 时你要手动忽略大量 D9 WARN |
| **B — D9 降到 INFO** | 改 detector severity，D9 不计入 fail_pages，仅出现在 report | 简单（1 行代码 + 改 test） |
| **C — D9 加白名单逻辑** | 改 detector：en 出现 glossary 任一 zh_concept 替代字符串就静默 | 改代码 + 加 regression test，要重跑 Stage A |
| **D — 先发 Stage B 看 40 页数据再定** | 不动 D9，让真实分布告诉我们噪音长什么样 | 推迟一次决策，Stage B retro 时你信息更全 |

**我的倾向**：**D**。理由：
- 5 页样本太小，看不清 D9 的真实分布
- D9 是 WARN 不阻塞，不会让 Stage B 翻车
- 如果 Stage B 40 页拉出来 D9 噪音很集中（比如 80% 都是单复数 / 大小写差异），加白名单的规则就清晰；如果分散，可能 B (降 INFO) 反而合理
- 这符合"用真实数据 inform 决策"，避免拍脑袋改 detector

但你也可以选 **B**（最快收尾） 或 **C**（最干净）。

**你的答**：**D — 先发 Stage B，看 40 页真实分布再定**（2026-05-11 user sign-off）

---

### Q2 · 2 条 LLM Phase-2 catch 的质量你认可吗？

**问题**：Stage 6 的核心增值就在 Phase-2 LLM（Phase-1 deterministic 是契约校验，LLM 才是语义校验）。Stage A 5 页 LLM 总共找到 2 条真信号：

1. **page_038 entity[2].definition.en 循环英文定义**（WARN，repair_stage=5）— 真问题，Phase-1 看不到
2. **page_043 entity[3].choices[3].zh「自我完结型」直译**（INFO，repair_stage=4.5）— 风格建议

| 选项 | 含义 | 影响 |
|---|---|---|
| **✓ 认可** | prompt v1.0 够用，Stage B 用同样 prompt 跑 | 直接进 Q3 |
| **✗ 不认可** | 觉得 LLM 该抓更多 / 该抓更少 / 抓得不对 | 改 reviewer.py prompt → 重跑 Stage A → 重做 retro |

**我的倾向**：**✓ 认可**。理由：
- 2 条 catch 都站得住脚（不是 LLM hallucination）
- 1 条是真硬伤（循环英文定义），Phase-1 100% 抓不到
- 5 页里 1 条新硬伤 + 1 条风格建议，召回率合理（不是"LLM 沉默"也不是"LLM 乱报"）
- Stage B 40 页按这个比例预计 8-16 条 LLM catches，retro 工作量可控

但如果你看了 2 条 catch 觉得"这两条都没意义"或"prompt 应该更激进"，可以 ✗。

**你的答**：**✓ 认可 — prompt v1.0 够用**（2026-05-11 user sign-off）

---

### Q3 · 是否授权 Stage B 40 页 dispatch？

**Stage B 命令**（已存在 step_06_audit.md L373-384）：

```bash
uv run --project packages/extractor python -m cert_extractor.cli audit-trilingual \
    --translated-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated \
    --structured-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/structured \
    --cleaned-dir   data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/cleaned \
    --ocr-dir       data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/ocr \
    --glossary-path data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary/glossary.json \
    --tier opus \
    --chunk-size 4 \
    --anthropic-soft-usd 999 \
    --anthropic-hard-usd 999 \
    --confirm
```

**Stage B 预算 + 期望**：
- 40 pages × ~2 chunks/page = ~80 LLM calls
- 期望 shadow cost：~$4-15（保守估计；按 Stage A $2.78/5pages × 8 = $22 上限）
- 期望 billed：$0（max plan OAuth）
- 期望 issues：~150-250 条（D9 占大头如果不改），其中 LLM Phase-2 期望 8-16 条真信号
- 期望 fail_pages：0-5（如果有 FAIL，停下来 retro，不自动 retry）
- 时间：~10-20 分钟

| 选项 | 含义 |
|---|---|
| **✓ 授权** | 我下次开 Session 11 发 Stage B；Stage B 跑完做 retro |
| **✗ 不授权** | 在 Q1/Q2 选了要先改的话，先 patch；告诉我要 patch 什么、然后再决定 |

**你的答**：**✓ 授权 Stage B 40 页 dispatch**（2026-05-11 user sign-off）

---

## 4b. Stage A 永久存档（snapshot）

Stage B 发出去后 `data/.../audit/stage6_review.json` 会被覆盖。Stage A re-run #2 的 JSON 在发 Stage B 前已快照到：

- `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/stage6_review_stageA_rerun2.json`（在 git 追踪轨道里，per 规则 A）

Stage B 跑完后 audit JSON 会做同样存档：`stage6_review_stageB.json`。

---

## 4. 你回答完以后我会做什么

### 如果 Q3 = ✓ 授权

1. **开 Session 11**（新建 `docs/discussion/2026-05-11-session-11.md`）
2. 把这份 worksheet 的 Q1/Q2/Q3 答案写进 Session 11 日志（per D-027 § 1 即决即写）
3. 如果 Q1 = B/C，先 patch + 改 test，commit
4. 按命令发 Stage B dispatch
5. dispatch 完写一份 Stage B retro worksheet 给你（仿照这份 Stage A worksheet）
6. 等你 sign off Stage B 后才进 Step 6.10 Stage 7 export

### 如果 Q3 = ✗ 不授权

1. 把你要的 patch 列在 Session 11 日志（per 规则 B 不是失败但是"Stage A WARN-with-fixes"）
2. 实施 patch，重跑 Stage A（同样 5 页，~$2.8 shadow / $0 billed）
3. 重做这份 worksheet 给你

任一路径都不会跳过你 sign off 直接发 Stage B。

---

## 5. 附：Stage 6 detector 验证矩阵（参考用，不用动）

仅供 Stage B retro 时对照 Stage A 的"哪些 detector 真触发过 / 哪些没"。

| Detector | Stage A 状态 | 备注 |
|---|---|---|
| D1 jp_mutation | 未触发 | Plan-B D-075 已修，预期持续静默 |
| D2 untranslated_residue | 未触发 | Plan-B 后 0 UNTRANSLATED |
| D3 schema_invalid | 未触发 | translated/ 都合法 |
| D4 answer_index_out_of_range | 未触发 | D-076 envelope 已 gate |
| D5 answer_index_mismatch | 已修，未触发 | 0-question 短路 |
| **D6 choice_marker_inconsistent** | **触发 ×1 ✓** | F-CHOICE-MARKER 真值 |
| D7 numeric_inconsistent | 触发 ×2 WARN | severity 启发式有效 |
| D8 glossary_lock_violated | 未触发 | glossary 已稳 |
| D9 glossary_lock_missed | 触发 ×9 WARN | **Q1 焦点** |
| D10 redundant_nested_parens | 未触发 | F-COP21 已 mitigate |
| D11 kana_helper_missing | INFO ×4 | 按 D-012 真信号但 INFO 不阻塞 |
| D12 kana_helper_format | 未触发 | 无 kana_helper 数据 |
| D13 glossary_surface_concept_split | run-level INFO ×2 | 信息性 |
| **L1 hallucination** | 未触发 | LLM 没看见幻觉 |
| **L2 omission** | 未触发 | LLM 没看见遗漏 |
| **L3 unfaithful** | **触发 ×1 ✓** | circular EN 真值 |
| **L4 idiomatic** | **触发 ×1 ✓** | 自我完结直译真值 |
