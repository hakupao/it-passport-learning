# D-121 — duplicate_extraction 系統バグの確認と修復方針

**状態**: Locked
**日付**: 2026-05-29 (Session 72)
**文脈**: Phase 5 / Stage 2.6 データ実測審核

---

## 背景

Stage 2.6 で**未使用の視点（跨字段語義整合性 / 同回重複検出）**により、Stage 2 抽出に**系統的な複製バグ**が存在したことが判明:

- ある設問の stem+choices(+answer) が、**同一回内の隣接問の内容で丸ごと上書き**されている。
- 真の設問は原本ページに正しく印刷されているのに、JSON には別問のコピーが入る。

### 確認された duplicate_extraction（全量近重複 + PDF 照合、ユーザー決定の網羅手法）

| qid | 真の設問 | 複製元 |
|---|---|---|
| `2018h30h-q008` | マイナンバー取扱い | q006(非機能要件) |
| `2018h30h-q100` | 無線LAN/ESSID(図表あり) | q010(著作権) |
| `2009h21a-q088` | DBロック/排他制御 | q068(アプレット) |
| `2010h22a-q008` | 初期投資回収年数(表あり) | q006(ワークフロー) |

複製元は常に同回内の別問であり JSON に存在する → **stem 近重複スキャンが機構上全候補を捕捉**。86 件の近重複関与 qid を PDF 照合し、上記 4 件のみ FAIL（残 80 は年度跨ぎ正当再出題）。**この欠陥類は収束**。

### 副次で判明した新欠陥類

- **choice_swap**: `2015h27a-q059`（選択肢ア↔イ逆転、正答記号も誤りの疑い）。
- **choice_ocr**（選択肢末尾の切断/別問混入, minor）: `2022r04-q017` / `2014h26a-q009` / `2019r01a-q049`。

---

## 決定

1. **duplicate_extraction 4 件は確実欠陥として修復**（D-119「確実→即時修正」）。真の stem/choices を原本ページから再抽出し、`correct_answer` は **`answer_keys.json`（IPA 公式・スロット別）から復元**（複製で承継した誤答を捨てる）。原値は `*_corrupted_backup` 温存。Rule D で writer≠reviewer。
2. **choice_swap (q059) は原本 page-24 を再照合して choices 順 + correct_answer を修正**（同じく backup + 別 reviewer）。
3. **choice_ocr 3 件（minor）は原本から選択肢末尾を補修**（表示上の typo、意味不変）。
4. duplicate_extraction の収束は near-dup 全量スキャンで担保（追加ラウンド不要）。ただし Phase C の L1 ランダム再解答で「複製元が bank に無い」型の取りこぼしが無いか確率的に確認。

---

## 影響

- 4 件の stem/choices/answer 全面差し替え（高 stakes・要独立検証）。
- 上流の Stage 2 抽出スクリプトに複製混入の根本原因があったが、最終データの修復で下流（Stage 3/4）汚染を断つ。
- Stage 2.5 の「CONDITIONAL PASS（同源 vision 審査）」が同源盲点でこれらを見逃していた事実の記録 → Stage 2.6 新設（D-119）の正当性を裏づけ。
