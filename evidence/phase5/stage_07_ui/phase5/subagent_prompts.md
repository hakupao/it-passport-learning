# D-239 executor prompts (S164)
Two executor (opus) runs in parallel, no commit / push:
- practice + header: src/components/practice/**, AppShell.tsx, e2e practice/mobile; port 3150. Tasks: face 題番号行を上に・全幅、進捗 1 行、回答後の下端固定「下一题」、ヘッダー約 100px。evidence → phase5/practice/.
- textbook + OQ-18: src/components/textbook/**, e2e textbook*; port 3161. Tasks: ステップ図の空白、OQ-18 全単元 × ja/zh/en × 320/360/390 実測→修正→検査を 3 locale に、索引/辞典の目視。evidence → phase5/textbook/.
Common: 7 tokens only, radius ≤6px, desktop unchanged, vitest/tsc/lint green, failures → failures/.
Rule D: review by a different subagent_type after both finish.
