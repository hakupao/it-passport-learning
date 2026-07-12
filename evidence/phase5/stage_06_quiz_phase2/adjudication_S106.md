# Quiz Phase 2 — Session 106 adjudication (2018h30h + 2017h29h)

> Session 106 (2026-07-11) / D-137 / D-140 scale batch 5. Effort: ultracode.
> Batch = **2018h30h + 2017h29h** (最新順, serial, 2 exam/session 上限). Commit gate = commit + push 自動.
> Rules: A (independent N-sample audit), B (failure archive), D (writer ≠ in-pipeline reviewer ≠ Rule A critic ≠ 主 context).
> Agent 三互異: writer=`general-purpose` / in-pipeline reviewer=`feature-dev:code-reviewer` / Rule A critic=`pr-review-toolkit:code-reviewer`.
> Persist = deterministic (S105 恒久硬化): `quiz-phase2-persist.mjs <task_output> <exam>` → verify-result → merge.

---

## §1. 2018h30h (平成30年度 春期) — ✅ 完了

**generate** `wf_36888b7f-e30` (task `w2xyxi6fo`): **100/100 · jp PASS 100 · tr PASS 98 / CONCERNS 2 · suspect 3**.
412 agent / 14.0M tok / ~57 min, error 0, one-shot (no session-limit hit).

**persist (deterministic)**: 981KB task output `.result` → `generate_result_2018h30h.json`, **empty-note 0 /
missing jp_verdict 0** (S104 lossy-mode symptoms absent). **verify-result 100/100 PASS**.

**merge**: explained 100/100, missing 0, **SUSPECT 3 → q009, q012, q077**, **STEM-CORRUPTION 6 → q009*, q047,
q051, q058, q067, q077*** (* = also a key-guard suspect).

### 裁決 (主 context source read, q052 protocol / D-小6 full-page authority)

All six flags adjudicated by reading the source page PNG (1432×2026). Five corrected, one no-op.

| id | field | raw (corrupt) | source | fix | key |
|---|---|---|---|---|---|
| q009 | choice エ | 「…開示しなければならない。**デ洛 呈**」 | page-05 問9: 「…開示しなければならない。」 | strip trailing OCR junk | ウ 不変 |
| q047 | choice ウ | 「…事前に交代要員を**確**」(truncated) | page-21 問47: 「…事前に交代要員を**確保する。**」 | append 「保する。」 | イ 不変 |
| q051 | choice ウ | 「…実施できる**避次**」 | page-22 問51: 「…実施できる**こと**」(全4肢が「こと」終端) | 避次→こと | ア 不変 |
| q058 | stem | 「ハブと呼ばれる**和**集線装置…」(raw stem_jp) | page-26 問58 | **NO-OP** — stem_jp_clean 既に「集線装置」でクリーン (表示は clean を使用) | ア 不変 |
| q067 | choice ア | 「…をあさる。**ぜい**」 | page-31 問67: 「…をあさる。」(「ぜい」= 隣肢イ「**脆**弱性」のルビ混入) | strip 「ぜい」 | ア 不変 (これが正解肢) |
| **q077** | **stem** | 「1台の HDD の容量が**599G** バイトのとき」 | page-34 問77: 「1台の HDD の容量が**500G** バイトのとき」 | **599G→500G (answer-affecting)** | ウ 不変 |

#### q077 (answer-affecting, S103 q036 型) — 最重要
- generate key-guard が `matches_key=false` で正しく回付: RAID5 実効 = (4−1)×1台容量。stem を literal に
  599G と読むと 3×599≈1.8T → 最近接は エ(2T) で公式キー ウ(1.5T) と不一致。ウ=1.5T が成立するのは
  1台=500G のとき (3×500=1500G=1.5T) だけ。∴ 「599G」は「500G」の OCR 腐敗。
- **主 context page-34 実読で 500G 確定**。答え ウ 不変 (解説は D-137-C に従い 500G 前提で執筆済 = stale 0)。
- 是正層 = **raw bank stem_jp** (stemfix-S106, 599G→500G) + **tr sidecar stem_jp_clean/zh/en** (trfix-S106,
  599G→500G / 599 GB→500 GB) — zh/en も Phase 1 で 599 を伝播していたため。

#### cosmetic 腐敗 (q009/q047/q051/q067) — zh/en 既 clean
- いずれも choices_jp の OCR ゴミ/切れで、**zh/en 訳は既に clean・完全** (translator が OCR ノイズを無視し
  意味を正しく訳出、q047 は切れた JP から「確保する」の完全意味を推定済み) → **raw bank choices_jp のみ是正、
  trfix 不要** (S105 q100 と同型)。腐敗は内部 key_guard.note_jp の audit trail にのみ残存 (非 UI)。

#### suspect (benign over-flag) — 不動
- **q012** (figure_derivable=false, 概念問=バリューチェーン, derived ア=key): 図なし概念問の benign
  over-flag。腐敗なし、是正なし。
- q009 / q077 も suspect だが上記で是正済 (q009=cosmetic choice, q077=answer-affecting stem)。

**invariants (git 確証)**: questions.json diff = **5 フィールド** (q009 エ / q047 ウ / q051 ウ / q067 ア choices
+ q077 stem_jp)、**correct_answer 0 変更** (grep +/- = 0)、**quiz_index 不変** (diff 空)。translations diff =
**q077 stem_jp_clean/zh/en のみ** (3 フィールド、599→500)。

**新 scripts**: `quiz-phase2-stemfix-S106.mjs` (STEM_FIXES 1 + CHOICE_FIXES 3 substring + CHOICE_APPENDS 1
endsWith-guard for the truncation) + `quiz-phase2-trfix-S106.mjs` (q077 tr 3 フィールド)。

### Rule A (independent N-sample audit) — 2018h30h
- **ruleA-prep**: N=28 = 全 13 図 + suspect 3 (q009/q012/q077) + stem-corrupt-nonsuspect 4 (q047/q051/q058/q067)
  + tr-CONCERNS 2 (q014/q023) + plain top-up。
- **Rule A** `wf_28186bc3-d20` (task `wu1jwnll2`): **28/28 audited, accurate 27, severity {none 17, low 10,
  high 1}, keyGuardMismatch=[q077]**. independent_answer == stored key 28/28 (bad key 0)。

#### Rule A が捕捉した high 1 + 追加 OCR 腐敗 2 (flag すり抜け) — 独立抽検の真価
**q077 (high, 内容欠陥)**: Rule A が **是正後 (500G) の sample を実読**し、解説本文 correct.{jp,zh,en} に
generator が付けた stale な「(注: 表示 stem は「599G」だが…OCR 誤り)」注記が残存 (是正後は 599G がどこにも
無く学習者を混乱させる) + サイドカー key_guard の round-1 が matches_key=false のまま (是正後 stem と矛盾) を
指摘 → **explfix-S106** で 3 言語の注記を削除 (本文計算は既に 500G で正しい) + generate_result q077 の
key_guard + round1 を解決状態 (derived ウ / matches_key true / stem_corruption false / suspect false) に patch
(honest round-1 履歴は解決 note_jp + 本証拠に保存) → re-merge。

**q040 / q082 (体系スキャンが flag すり抜けを捕捉)**: Rule A の指摘を機に、**全問 user-facing 説明を OCR-caveat
スキャン**したところ、generator が **stem_corruption_suspected=false のまま** (key_guard は matches_key=true)
説明本文だけで OCR 腐敗に言及していた 2 問を発見 = merge の STEM-CORRUPTION リストから漏れていた未是正腐敗:
| id | choice | raw (corrupt) | source | fix | key |
|---|---|---|---|---|---|
| q040 | ア | 「**1**ITベンダが…」 | page-18 問40: 「IT ベンダが…」 | strip 冒頭「1」 | ウ 不変 (distractor) |
| q082 | ウ | 「…規格**ぜい**」 | page-37 問82: 「…規格」(「ぜい」= 隣肢エ「**脆**弱性」ルビ) | strip 「ぜい」 | エ 不変 (distractor) |

**caveat strip (q040/q051/q082 distractor 説明、3 言語)**: choices を是正した 3 問の distractor 説明末尾に
残る stale な OCR 注記 (「…「1」は OCR…」「…「避次」は OCR…」「…「ぜい」は文字化け…」) を explfix-S106 で
anchor→末尾除去。q043 distractor エ の「合計3日を読み違え」は **誤答者の誤読を説明する正当な教育内容** (OCR
注記でない) ゆえ保持。

#### 独立 post-patch 再検証 (Rule D: critic ≠ fixer=主 context) — 全 PASS
- q077 (`wf_ca274285-1ae`): **accurate 1/1・severity none・independent ウ・key_guard_valid true**。
- q040/q051/q082 (`wf_acdcb0f5-150`): **accurate 3/3・severity {low 2, none 1}・keyGuardMismatch []**。
  残 low = 非 answer-affecting backlog: q040 key_guard.note_jp meta artifact (**非UI**、「1ITベンダ」の是正前
  履歴) + 経営者→经营者 zh polish (本文に「高层管理者」補足済) / q082 JIS 名称の時代ズレ (2018 出題時=日本工業
  規格、2019-07 改称、学習アプリは現行名で妥当・答え無影響) / q051 none。

**実効 Rule A = 28/28 accurate** (q077 + q040/q051/q082 是正・再検証後)、**bad key 0/28**。

#### low 10 (初回 Rule A、非 answer-affecting、全て backlog/不動)
zh 本土 polish 4 (q005 多重度→多重性 / q050 作業→工作 / q054 右上扬 phrasing / q070 业种→行业类型) +
key_guard.note_jp meta artifact 非UI 5 (q009/q012 benign over-flag note / q043 定型 OCR 注記 / q051 是正済
避次 note / q058 「和」捏造 note、いずれも suspect 判定自体は正当) + q047 correct 説明の「活用/強化」用語のゆるさ
(結論不変)。

**新 scripts (追加)**: `quiz-phase2-explfix-S106.mjs` (q077 本文注記 strip + key_guard 解決 + q040/q051/q082
distractor caveat strip [anchor→末尾除去モード])。

**是正累計 (2018h30h)**: questions.json diff = **7 フィールド** (q009 エ / q040 ア / q047 ウ / q051 ウ / q067 ア
choices + q077 stem_jp + q082 ウ choice)、**correct_answer 0 変更**、quiz_index 不変。translations = q077 stem
3 フィールド。explanations sidecar = q077 本文注記削除 + key_guard 解決 + q040/q051/q082 distractor caveat 削除。

---

## §2. 2017h29h (平成29年度 秋期) — ✅ 完了

**generate** `wf_a6c4a938-646`: 初回 run が翻訳ステージで **session limit 直撃** (3am Asia/Tokyo リセット、
tr translate_failed 36 + null 64、jp は 100/100 完成)。**08:13 JST (リセット後) に `resumeFromRunId` で
resume** (task `ws7ug7l22`): cached JP 100 + tr 69 を replay、失敗 31 翻訳 + review を再走 → **100/100・jp
PASS 100・tr PASS 96 / CONCERNS 4・suspect 1・resume run error 0** (S103/S104 同型の limit→resume 復旧)。

**persist (deterministic, resume final output)**: empty-note 0 / missing jp_verdict 0。**verify-result 100/100
PASS**。**merge**: explained 100/100, missing 0, **SUSPECT 1 → q012**, **STEM-CORRUPTION 2 → q017, q095**。

### 裁決 (主 context source read, q052 protocol) + 体系スキャン + git-diff review
生成の flag (stem_corruption_suspected) + 説明本文の OCR caveat スキャン + git-diff 目視の 3 層で捕捉。

| id | choice | raw (corrupt) | source | fix | key |
|---|---|---|---|---|---|
| q007 | エ | 「システムを**和**柔軟に」 | page-04 問7: 「…システムを柔軟に…」 | strip 「和」 | イ 不変 (distractor) |
| q017 | エ | 「うろこのような**かな**形…棚田の景観**了は**」 | page-07 問17: 「うろこのような形…棚田の景観」 | strip 「かな」+「了は」(2箇所) | ウ 不変 (distractor) |
| q088 | ア | 「**1**IC カード認証」 | page-35 問88: 「IC カード認証」 | strip 「1」 | イ 不変 (distractor) |
| **q095** | **イ** | 「同じ**T**ID と…」 | page-38 問95: 「同じ ID と…」 | strip 「T」 | イ 不変 (**正解肢**) |
| q095 | エ | 「…設定していた。**ふくそう**」 | page-38 問95: 「…設定していた。」 | strip 「ふくそう」 | イ 不変 (distractor) |

- **flag-gap 3 (q088/q095/q007)**: q088-ア「1」/ q095-イ「T」は stem_corruption_suspected=false で merge の
  STEM-CORRUPTION に載らず、q007-エ「和」も key_guard.note のみ言及。**q088 は説明 caveat スキャンが捕捉**
  (distractor ア に mid-sentence caveat「(選択肢は「1IC…」と表示されるが…)」→ explfix-S106 で choice 是正後
  regex 除去)。**q017-かな は git-diff 目視で捕捉** (生成 flag も caveat スキャンもすり抜け、source crop で確認)。
- **q095-イ = 正解肢の OCR 是正** (「TID」→「ID」)、字母イは正解のまま。zh/en は全問 clean (伝播なし)、choice trfix 不要。
- **q012 = benign over-flag** (公益通報者保護法、figure_derivable=false、derived ア=key、不動)。q096 correct.jp の
  「輻輳（ふくそう）」= 正当な専門用語+読み仮名 (スキャン false positive、不動)。

**invariants (git)**: questions.json diff = **5 choice フィールド** (q007 エ / q017 エ / q088 ア / q095 イ / q095 エ、
q017 の 2 箇所は同一行)、**correct_answer 0 変更**、quiz_index 不変。translations 不変 (choice zh/en 既 clean)。
explanations sidecar = q088 distractor ア caveat 除去。

### ⚠️ 系統的所見 — 生成 note が明かす choice OCR 腐敗の flag-gap (backlog track)
generate_result の key_guard.note を全問スキャンした結果、**generator が OCR 腐敗を note に記録しつつ
stem_corruption_suspected を立てなかった問が多数**判明。大半は **stem 腐敗で stem_jp_clean が権威 (表示は既に
クリーン)** だが、**一部は user-facing な choice (distractor) の未是正腐敗**:
- **2017h29h (本 session、未是正=backlog)**: q033-ア「1C タグ」(IC)、q079-エ 末尾「ぜい」、q084-エ「ボネットワーク」
  (ネットワーク)、q034 選択肢の余分な引用符。
- **2018h30h (S106 commit `d532f21` 済、未是正=backlog)**: q017-エ「小売店舗綱」(網)、q020「自由奏放」(奔放)、
  q035-エ 末尾「垢」、q052-エ 末尾「 -」、q064-エ「ipa.9o.jp」、q070-ア「轟威」(脅威)、q091-イ 末尾「こう」、
  q097-イ「角罪」(犯罪)。
- **推定**: S105 以前の committed 10 exam も同型の未 flag choice garble を残す。S101 の決定的 detector
  (0→O 等のパターン) はこの種の**意味的/字形置換 OCR** を捕捉できず、generator の semantic note でのみ露見。
- **決定 (S106)**: 本 session は S105 と同じ最小スコープ (flag / caveat-scan / git-diff で surface した分のみ是正)
  を維持し、両 exam を同一水準で扱う。note-only の choice garble は **「semantic choice-OCR cleanup」backlog
  track** として全 exam 横断の専用 pass に回す (ユーザー判断待ち)。

### Rule A (independent N-sample audit) — 2017h29h
- **ruleA-prep**: N=28 = 全 10 図 + suspect 1 (q012) + stem-corrupt 2 (q017/q095) + forced flag-gap
  (q007/q033/q079/q084/q088) + tr-CONCERNS 4 (q029/q031/q039/q072) + plain top-up。note-flagged distractor
  garble (q020/q033/q035/q079/q084/q091) を多数包含し独立 critic に severity を判定させる。
- **Rule A** `wf_0e3c596b-f7f` (task `w99l00dez`): **28/28 accurate・severity {none 23, low 5}・
  keyGuardMismatch=[]・independent_answer == stored key 28/28 (bad key 0)**。
- **choice-garble backlog 判断の独立裏付け**: note-flagged distractor garble を含む **q020/q033/q035/q079/q084/
  q091 は全て accurate=true・severity none** → 残存 choice garble は cosmetic で説明品質・解答性に無影響 =
  backlog track が妥当とデータで確認。
- **是正 4 問の同 run 内検証**: q017/q088/q095 = severity none、q007 = low (非UI key_guard.note が是正済「和」を
  参照する artifact のみ) → 別 post-patch 再検証不要 (Rule A が是正後データを実読済)。
- **low 5 = 全て非 answer-affecting**: 非UI key_guard.note artifact 2 (q007 「和」参照 / q012 benign
  over-flag、critic が安全側フラグとして妥当と確認) + zh 本土 polish 3 (q018 开发体制→团队 / q032 评价额→计价 /
  q039 日程→进度)。是正なし。

**実効 Rule A = 28/28 accurate、bad key 0/28。**
