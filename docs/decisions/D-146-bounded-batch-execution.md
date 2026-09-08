# D-146 — subagent 並列実行の**計画・境界・予算**規則 (分批実行 + セッション単位 commit)

- **Status**: Locked (Session 118, 2026-09-08)
- **ユーザー gate**: S118 でユーザーが提起 (「有计划，有边界的，而不是开始后像洪水猛兽一样」)。以下の原則はユーザーの回答 (S118 log §43) から導いた。
- **Relates**: D-019 (討論ペース)、D-027 (状態同期)、⑤-2 全量掃引 (S118 §31)、feedback memory「subagent は opus、Fable を継承しない」。

## 背景 — 何が起きたか (S118、2026-09-07〜08)
- ⑤-2 の 1 波 (2 exam × gp/cr 双 pass = 4 run ≈ 300 agent) は **1,700 万〜2,000 万 token** を消費し、ユーザーの **5 時間制限を 1 時間以内に使い切る**規模だった。同日 3 回 limit に到達し、他プロジェクトの開発を阻害した。
- 主 context は workflow 完了通知で **audit 全文 (1 run あたり 1〜2 万字) を受信**し、1 波で 7〜8 万字が流入。主 context はその内容を読まない (後処理は fixer がファイルから読む) のに context を圧迫した。
- 核験 (fidelity) agent の 1 問あたり ≈ 5.5 万 token の大半は**画像 Read** (1 問で 5〜10 回の裁切拡大)。任務の本質は視覚 OCR + 逐字比較であり、推論負荷は低い。gp/cr 双 pass (いずれも Opus) の結論はほぼ一致し、真の補漏は決定的 machdiff が担った (波 1: +1、波 2: +4)。

## 決定
1. **セッション = 1 単位 (unit)**。1 unit の既定 = **1 exam** (70〜90 問) の「核験 → machdiff → 裁決 → 三層是正 → Rule D 審閲 → commit + push」。unit の大きさはユーザーが実消費を見て**毎回調整**する (半 exam 〜 3 exam)。unit 完了後は commit + push し、次 unit は**新しいセッション**で STATE.md から接続する。
2. **開始前の申告**: 主 context は各起動前に「agent 数 / 予想 token / 予想時間 / 停止条件」を報告し、ユーザーの承認で放つ。承認は**その起動 1 回分**に限る (「全量を承認」≠「無制限並列を承認」)。
3. **叠加禁止**: 核験 run・fixer・reviewer は**直列**。等待中に別波の run を先行起動しない。同時に走る subagent は原則 **1 系統** (run 1 本、または fixer 1 体、または reviewer 1 体)。
4. **主 context は摘要のみ受信**: workflow の return は計数 + discrepancies の要約に限定し、audit 全文はファイルに書く (`quiz-s7x-fidelity.workflow.mjs` の後処理を次セッション冒頭で改修)。subagent の報告は ≤ 40 行。
5. **モデルの適材**: 抄写 (画像→transcript) は **Sonnet 5 を A/B 試験** (2015h27a、Opus 双 pass 13 欠陥を基準に召回と FP を測る) してから決める。比較は machdiff (脚本、0 token)、**裁決・是正・解説書換・審閲は Opus**。すべての Agent 派発は `model` を明示 (Fable 継承禁止)。
6. **画像 Read の削減**: 題目領域を脚本で前裁断 (`question_bbox_pct` がある題は直接、無い題は行帯検出) して agent の裁切回数を 1〜2 回に抑える改修を A/B と同時に評価する。
7. **双 pass の見直し**: 既定を「単 pass + machdiff」とし、DISCREPANT 題のみ第 2 pass (Opus) で復核する。A/B の結果で確定。
8. **中断の記録**: limit や停止で止まった run は、run id・完了/母数・再開方法を log に残す (Rule B)。resumeFromRunId で完了 agent はキャッシュ再利用。

## 却下した代替案
| 案 | 却下理由 |
|---|---|
| 現状維持 (波 = 4 run 同時) | 1 波で 5h 制限を使い切り、他プロジェクトを阻害。主 context も 90% 超 |
| 全量 Sonnet 化を無検証で | 語義置換 (轟威/角罪) の召回が落ちる可能性。基準データがあるので試験してから |
| 主 context が結果を読んで裁決 | context 爆発の主因。裁決は fixer に委ね、主 context は調度と記録に徹する |
