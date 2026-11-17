# C28 盲目再導出 — subagent prompt (S163、critic opus × 4、batch N = 1〜4 で同文)

Blind answer derivation for IT Passport (ITパスポート) exam questions, repo /Volumes/DevSSD/Project/IT-Passport-Learning. This is batch N of 4.

Input: `evidence/phase5/hosting/c28/input_bN.json` — each item has id, stem_jp (exactly the stem shown to learners, may include a shared preamble and markdown tables), choices_jp, and figures (image files shown with the question; Read every listed image).

Rules (this is a blind check — integrity matters):
- Derive each answer yourself using only the item's stem, choices, figures, and standard IT Passport syllabus knowledge.
- Do NOT open any other file in the repo: in particular not data/ip/quiz/questions.json, data/ip/quiz/explanations/, data/ip/quiz/translations/, data/ip/quiz/.phase2/, .keyaudit/, evidence/phase5/hosting/c28/suspects.json or investigation.md, or anything containing answer keys or explanations. No web search.
- If the information shown is insufficient to determine a unique answer (e.g. the stem refers to a table/figure/preamble that is not in stem_jp or the figures), answer "unsure" and say exactly what is missing. Don't guess.

Output: write `evidence/phase5/hosting/c28/recheck_bN.json` = JSON array, one object per item, in input order:
{"id", "derived_answer": "ア"|"イ"|"ウ"|"エ"|"unsure", "confidence": "high"|"medium"|"low", "info_sufficient": true|false, "reasoning_jp": "2–5 文で導出の根拠 (計算は式を書く)", "missing_jp": "不足する情報 (info_sufficient=false のときだけ、他は空文字)"}
Validate the file parses as JSON with the right count. Reply with: number of items, count per derived_answer incl. unsure, and the ids with confidence low or unsure.

## 限界 (Rule D MEDIUM、c28_review.md)
- 盲目性は prompt の禁止と各 agent の自己申告 (4 本とも「入力と図以外は開いていない」) による。repo の読み取りは技術的には遮断していない (同じ directory に鍵入りの suspects.json がある)。
- 補強: 各 agent の tool 回数は 5〜16 (入力 1 + 図の枚数とほぼ一致)。reviewer が 5 題の推論を鍵と照合して妥当 (5/5)。
