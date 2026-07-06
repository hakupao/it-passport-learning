# S104 failure — 2019r01a Persist agent が verbatim 契約違反 (lossy 書込)

## 入力
- generate `wf_57a6c0db-eeb` resume 後の Persist フェーズ (agent prompt = workflow return JSON をバイト単位 verbatim で `generate_result_2019r01a.json` に Write せよ)。
- 期待値: S103/S104-2020r02o と同形の完全な results 100 件 (note_jp・verdict・rounds 込み、~150KB)。

## 産物 (defective)
- `generate_result_2019r01a.json` = **45,884 bytes の有損版**: 全 100 件で `key_guard.note_jp`/`key_guard_round1.note_jp` が**空文字列に置換**され、`jp_verdict`/`tr_verdict`/`jp_rounds`/`tr_rounds`/`has_figure` フィールドが**脱落** (id/derived/matches/flags/suspect のみ保持)。
- 下流影響: `quiz-phase2-merge` がこの有損 key_guard を sidecar として explanations に埋め込み (defective merge 産物 = `quiz_phase2_S104_2019r01a_persist_lossy_defective_merge.json` に保全)。

## 技術判定
- Persist agent (general-purpose, claude-fable-5) が巨大 JSON (~150KB) の verbatim 転写指示に対し、note 等の長文フィールドを空にした「圧縮版」を生成 = verbatim 契約違反。resume 前の 2020r02o Persist (51KB/S103 同形) は正常だった。トークン圧の高い長大出力で発生する既知型の劣化。
- **決定的 post-check `quiz-phase2-verify-result.mjs` は構造検査のみ (well-formed key_guard/id/expl 存在) のため素通し** = 検出ギャップ。100/100 PASS と誤報告。
- 主 context が発見した契機: 全 note の腐敗キーワード走査で q002 の既知 note (「OCR 揺れ」言及、workflow return には存在) がファイルに無い事の不一致。

## 業務判定
- 実害: sidecar key_guard の監査痕跡 (note) 消失のみ。expl_jp/expl_tr ファイル群 (解説本文) は各 agent が直接落盘済で無傷。correct_answer / questions.json に影響 0。
- 回復: workflow task output (`wunxf295o.output` 内 `result` フィールド = workflow return の権威コピー) から `{exam_id,total,done,results}` を**決定的に再構築** (node、LLM 不経由) → 151,373 bytes、empty note 0・tr_verdict 欠落 0 → verify-result 再走 + re-merge。

## 次 attempt への入力 (hardening)
1. **Persist を LLM agent から決定的処理に置換すべき** — workflow スクリプトは fs 直書き不可だが、run 完了後に主 context が task output の `result` フィールドから決定的に書く方が verbatim 保証になる (本回復手順の恒常化)。
2. `verify-result` に**語義 sanity check 追加**: note_jp 空率 (例 >50% で FAIL)・平均 note 長・tr_verdict 存在率。
3. resume 後の Persist は特に要注意 (今回の発生点)。
