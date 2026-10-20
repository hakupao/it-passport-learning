# D-161 — 判断権の委任 (Fable 諮問) と 2 つの停止規則

- **Status**: Locked (Session 128, 2026-10-20)。ユーザー提起。
- **Amends**: D-019 (開放質問はユーザーへ → 主 context + Fable 諮問)、D-146 §2 (起動前申告の承認者 → 主 context、申告の記録は継続)、CLAUDE.md「OQ はユーザー同意で閉じる」(→ 主 context が閉じ、log に根拠)。

## 決定
1. **判断の委任**: 方針決定・裁定・起動承認・OQ 閉鎖は主 context が行う。判断が割れるもの・不可逆・高 stakes のものは **Fable 5.1 に諮問** (Agent、`model: "fable"`、writer/reviewer とは別の諮問役) し、問い・回答・採否を session log に残す。ユーザーには質問しない。
2. **5h 停止規則**: 5h 使用率 (`~/.claude/plugins/oh-my-claudecode/.usage-cache-anthropic.json` の `fiveHourPercent`、HUD が更新) が **78% 以上**で停止する。新規起動を止め、読み取り専用 lane は即停止、データ書き lane は安全点 (field 単位の書き込み完了・gate 実行前でもよいが中途 JSON を残さない) で停止。run id・完了数・再開方法 (resumeFromRunId 等) を log + STATE に書き、ユーザーに報告して待つ。ユーザーが制限のリセット後に手動で再開する。起動前にも毎回この値を確認する。
3. **context 規則**: 主 context が逼迫したら、STATE に再開点を書いて commit した上でユーザーに新 session を依頼する。
4. 上記 2 件以外はユーザーに確認せず継続する。push も commit 単位で行う (CLAUDE.md の push 承認はユーザーがこの委任で包括付与)。
5. Rule A〜D、D-152 の所有権規則は不変。

## 理由
- ユーザー:「你给我判断，我一般都是按照你的推荐选择的，没有意义」。ユーザーの役割を quota と session の管理に限定する。
- Fable は Opus より上位で、主 context の自己判断を外部化できる (同一 context 自判の回避)。Fable は別の週次 bucket で計上される。

## 却下
| 案 | 理由 |
|---|---|
| 現状 (毎回ユーザーに提示) | ユーザーが推奨をそのまま選ぶだけで価値がない (ユーザー) |
| 全判断を Fable へ | 軽微な判断まで Fable に送ると quota の浪費。割れる・高 stakes に限る |
