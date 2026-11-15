# L4-d round C — attempt 1: Rule D 判定 FAIL (S157)

- **入力**: `scripts/l4d-quiz-apply.ts --apply` (D-230)、quiz 152 欄 (訳 39・解説 113)、EXACT 15。記録 `evidence/phase5/hosting/l4d_quiz_apply.json`。
- **産物**: 訳 sidecar 19 ファイル、解説 sidecar 26 回 (re-merge)、`.phase2` / `.phase1` の該当欄、fidelity baseline (152 欄)。
- **技術判定**: PASS (sidecar の変化 = 計画 152 葉、ja・key_guard 不変、.phase2 = sidecar、baseline 152 / 118 / ja 0、gate PASS)。
- **業務判定**: FAIL — verifier (opus) の Rule A 標本 N = 30 で MEDIUM 1: 2013h25a-q003 p:1 zh「(Equity / Assets / Price・Earnings)」を一律の規則で「Price、Earnings」にした。PER という 1 指標の英名で、括弧内は「 / 」区切り — 「、」だと 2 項目に読める (EXACT が防ぐはずの入れ子の曖昧さ)。同欄の en は EXACT で「Price-Earnings」にしたのに zh を見落とした。LOW として 2011h23tokubetsu-q067「AND、OR、NOT 等逻辑运算」(外側が 、 の列) と 2010h22a-q010 p:1「ASP、SaaS」(同題 correct は「ASP/SaaS」)。
- **原因**: EXACT の洗い出しを「・ の近くに 、 がある文」で機械的に拾ったが、「 / 」で区切られた括弧の中は拾えなかった。en と zh の兄弟欄を突き合わせなかった。
- **次の attempt の入力**: `scripts/l4d-quiz-fix2.ts` で 3 欄 (Price-Earnings・AND/OR/NOT・ASP/SaaS) — l4d-quiz-apply.ts は ・ が残らないので再実行不可、.phase2 を直接変更 → 3 回 re-merge → 各 sidecar = 施工前 + 1 欄を検査 → baseline 再取得 (直前から 3 行だけ)。
- **attempt 2 の結果**: 同 verifier の再審 PASS (`evidence/phase5/hosting/l4d_C_review.md` 末尾)。
- **教訓**: 区切りの置換は、同じ欄の他の区切り記号 ( / ・ ／ ・ ⇔ ) と兄弟言語の欄の扱いも並べて読む。
