# Phase 2 (S100) — stem/choices OCR corruption adjudication (D-140)

Phase 2 の硬化 key-guard が全問の権威源頁を読み、表示 JP が源/図/選択肢/答えと矛盾する箇所を
`stem_corruption_suspected` で flag。本書は 2025r07 pilot で surface した全件の **主 context 源実読裁決** (q052 協議) 記録。

## key-guard harvest (round-1 盲推, 全100×2 run)
- **matches_key=false = 0 (両 run)** → **bad key 0**。q034 stem 是正後、盲推導出 イ で stored key と一致確認。S97 figkey 体検 (図題 0/40) + S99 全量 (図題 bad key 2 件は他回) と整合 = 2025r07 keys clean。
- **stem_corruption_suspected**: Run 2 = 5 (q012/q019/q040/q051/q054)、Run 3 = 8 (q020/q026/q047/q064/q066/q084/q085/q094)。**両 run の集合は重複ゼロ = 検出は非決定的** (下記 §非決定性)。

## 裁決 (全件 zh/en は Phase1 訳が既にクリーン → JP のみ drift-proof 是正、correct_answer 不変)

### 是正した real 腐敗 (10 問 / 15 フィールド)
| id | 種別 | page | 腐敗 | 是正 | key | run |
|----|------|------|------|------|-----|-----|
| q034 | **stem (answer-affecting)** | 15 | 「あと」脱落 →「いくつ」(総量) | 「あと何個」(追加) | イ=1,200 不変 | 初回 |
| q012 | stem | 06 | 「商標**活**」(OCR 法→活) | 「商標法」 | エ 不変 | 2 |
| q054 | stem | 25 | 「何**分**短縮」+表「60%**5分**」 | 「何%短縮」+「60%」 | ア=30 不変 | 2 |
| q019 | choices | 09 | ア「。,」/ イ「試し首」(truncation) | ア「,」/ イ「試し置きできる。」 | ア 不変 | 2 |
| q040 | choices | 19 | ア「和要員」/ イ「却下してよ**UN**」/ ウ「は。」/ エ「は.」 | 委員 / よい / は, / は, | イ 不変 | 2 |
| q051 | choices | 23 | エ 末尾「ーー 23 os」(頁番号OCRゴミ) | 除去 | エ 不変 | 2 |
| q020 | choices | 10 | ア 末尾「  ]」(空白+]) | 除去 | イ 不変 | 3 |
| q047 | choices | 22 | ア・ウ「**0**S」(数字ゼロ) | 「OS」 | エ 不変 | 3 |
| q064 | choices | 30 | ア「定義**む**する」 | 「定義する」 | イ 不変 | 3 |
| q084 | choices | 39 | エ 末尾「  ・」(空白+・) | 除去 | イ 不変 | 3 |

### false positive (是正不要、4 問)
q026/q066/q085/q094: raw `stem_jp` は OCR 腐敗だが **`stem_jp_clean` (= app の ja 表示テキスト) は正**。critic は非表示の raw を見て flag した。表示は元からクリーン。

source crop: `q034_source_page15_atohnanko.png` (「あと何個」), `q019_choiceI_source_page09.png` (「試し置きできる」), `q054_nanipercent_source_page25.png` (「何%短縮」)。

## §非決定性 (scale の最重要含意)
Run 2 (5件) と Run 3 (8件、内 real 4) は **重複ゼロ**。同じ corpus を硬化 prompt で 2 回読んで、別々の腐敗を flag した = **LLM key-guard の cosmetic 腐敗検出は非決定的・単一 pass で非網羅**。
→ 29回 (2900問) scale で「全部内联修」を真に達成するには **決定的 OCR-garble 検出器** (末尾の空白/]/・ゴミ・「0S」(数字ゼロ+英字)・孤立全角空白・「UN」等の非語パターンを regex/ヒューリスティックで全数走査) + 主 context source-verify が、LLM 非決定 flag より網羅的かつ安価。ユーザー gate 推奨。
- FP 低減策 (scale): prep が **stem_jp_clean を「表示テキスト=権威」として渡し**、raw stem_jp の腐敗は flag させない (choices には clean が無いので choices 腐敗のみ flag)。

## 是正方式 (drift-proof)
`scripts/quiz-phase2-stemfix.mjs` (STEM_FIXES + CHOICE_FIXES、現値 1回出現 assert) → raw bank `question_bank.json` (gitignored) → `build-quiz-corpus.mjs` 再生成。
**questions.json diff = 11 フィールド (11+/11−)、correct_answer 6問全不変、quiz_index/translations 不変** (git diff 確証)。

## Rule B 教訓 — generation 段の幻覚 (papering over)
- **q034 (Run 1)**: 存在しない `stem_jp_clean`=「あと何個」を捏造し matches_key=true 化 (単発幻覚、答えは正だが理由が偽)。
- **q054 (初回)**: 「何%→何分」を「OCR 誤りだろう」と注記しつつ matches_key=true 維持 (黙殺)。
- → **硬化策**: STEM-CORRUPTION GUARD (literal 解釈・stem_jp_clean 捏造禁止・stem_corruption_suspected 必須) + round-1 key_guard 永続化 (repair masking 不可、suspect=union)。Run 2 で 5 件を honest に枚举 = 硬化有効。

## 新所見 (scale 含意)
Phase 2 key-guard は全問源読のため、S99 が figkey 駆動で図題のみ監査した **choices-fidelity を非図題まで拡張捕捉**。2025r07 非図 84 中 3 問 (q019/q040/q051) = ~3.6%。29回 scale で非図 choices 腐敗が相当数 surface 見込み → scale 方針はユーザー gate。
