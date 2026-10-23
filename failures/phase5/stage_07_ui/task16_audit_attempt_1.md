# Stage 7 Phase 1 — Task 16 Rule A 截图抽检 attempt 1 (FAIL)

- 日期: 2026-10-23 (S132)
- 输入: branch `stage7-ui` HEAD d3a2388 的本地 build (`next start -p 3116`, Redis env 空, api.anthropic.com 拦截)。样本 = `.superpowers/sdd/PLAN_stage7_ui/audit_ids.json` (seed 20261023, mulberry32, figure / table / chumon / choice_figures / suspect / points3 各 5 题 = 30 题) × ja / zh。
- 产物: `evidence/phase5/stage_07_ui/audit_phase1.md` (attempt 1 版本), 截图 `.playwright-mcp/ui/phase1/audit/` (gitignored, 205 张)。
- 技术判定: 60 行中 58 行全 ✅; 2 行 ❌ (同一题两种语言)。
- 业务判定: **FAIL** — `2011h23tokubetsu-q059` (ja / zh) 的四个选项都是「①and②and③」型的不可断行串 (≤ 12 码点 → 4 列横排), 在 112px 的格子里溢出约 38px, 被下一格遮住, 选项文字读不全。
- 原因: `choiceLayout()` 只按码点数判断 4 列横排, 没考虑不可断行的半角/符号串的渲染宽度; 选项文字也没有 `min-width:0` / `overflow-wrap` 兜底。
- 附带 (非本次失败, 记为 OQ-08): `2024r06-q081` 选项内上下两张表被 quizRichText 解析成一张 (D-144 以来的既有行为, 与旧渲染器一致, 文字完整)。`2009h21a-q094` 前文 11 列表横向滚动 (全部列可滚到, 可接受)。
- 下一 attempt 的输入: (1) choiceLayout: 任一选项含长度 ≥ 6 码点的「非 CJK、非空白」连续串 → 一行一项 (list); (2) 选项文字 CSS 加 `min-width: 0; overflow-wrap: anywhere` 兜底; (3) 浏览器扫描全部 2900 题 × ja/zh 的选项格 `scrollWidth > clientWidth` = 0 作为证据; (4) 重新检查 q059。
