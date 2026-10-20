# B track B1 — 2015h27h 準備 (S128、L3 data lane)

D-150 §3 (母数外 1,692 題を ⑤-2 と同じ管線で全量再抄写) の最初の unit。13 exam (2009h21a〜2015h27h) の 1 本目。
手順の雛形 = S122 log §1〜§7 / U11 (`evidence/quiz_full52_u11_S127.md` §1)。本書は**起動前の準備のみ** (workflow は未起動、D-146 §2 の申告材料)。

---

## 1. 母数

- `data/ip/exams/question_bank.json` の 2015h27h = **100 問 (q001〜q100)**。`full52_population_S118.json` に 2015h27h は無い (13 exam = 全問母数外) → **B1 母数 = 100 / 100、除外 0**。
- 適用した規則: 中問 (chumon) と merged_preamble は **precrop の対象外であって核験の対象内** (S127 log §42 の訂正どおり、U0 以来の運用)。したがって中問 member も 100 問に含める。
- 中問の内訳 (源): q085-088 / q089-092 / q093-096 / q097-100 の 4 組。`data/ip/quiz/chumon_groups.json` に登録があるのは **`2015h27h-mqB` (q089-092) のみ**で、この 4 題は displayed_stem に共有前文を併合済 (752〜992 字)。他 3 組は displayed に前文が無い (前文・図の扱いは D-144 段 3、`evidence/quiz_chumon_D144s3ii_S117.md`)。

## 2. manifest + precrop (main tree の脚本をそのまま使用、改修なし)

```
node scripts/quiz-fidelity-prep-any.mjs 2015h27h b1 all --precrop
```

- 出力: `data/ip/quiz/.phase2/b1_fidelity_input_2015h27h.json` (100 samples、`prev_page_png` 100/100)
- crop: `data/ip/quiz/.phase2/precrop/2015h27h/` **93 / 100** (ファイル実在 93/93)
- calib: head=150 / body=210 (39 ページ、head 投票 150=39p / 140=25p / 160=12p)
- skip **7** = page_mismatch **3** (page-08: 検出 2 / 期待 3 → `q018` `q019` `q020`) + chumon **4** (`q089`〜`q092`、mqB) + merged_preamble 0 + thin_band 0。skip 題は源ページ全体で読む (安全側、U11 と同型)。
- crop の目視確認 2 枚: `q057` (1 行題 + 4 肢、欠けなし)、`q097` (問97 見出し〜エ、帯のみ。前文は前ページ = 上記の未登録中問)。

U11 比: crop 率 93% (U11 61/71 = 86%)。

## 3. fixer への名指し項目 → `evidence/quiz_B1_2015h27h_named_S128.json`

核験 agent の prompt には入れない (源先読みの独立性、S127 A2a と同じ運用)。fixer / reviewer が読む。

- **A1 backlog 走査** (`backlog_scan_A1_S127.json` の 2015h27h): 候補 95 / 30 題。うち priority high **54 件 / 18 題** = q011 q028 q029 q034 q042 q043 q070 q074 q077 q080 q087 q089 q090 q091 q092 q093 q098 q100。
  - 0a 推測補完 (raw_fluent が要注意): `q087`「近づく→並ぶ」(A1 §0 の例示)、`q087`「と→が」「表として」挿入、`q011`「部品Yの部品Y→部品Y,部品Z」、`q098`「人の集合→ベン図中の領域」、`q100`「x→w」、`q043`「である」挿入、`q070`「のて→(1)~」
  - 0c jp 異常: `q034 ア`「要託先」(= 委託先?、zh / en は「承包商」/ 委託として訳出 = 訳層推測型の疑い)、`q042 エ` 引用符 “全体最適" (閉じ ASCII)、`q100 ア〜エ` 全角［+ 半角 ] の混在
  - 7 散文: `q028`「情報システム として」/ `q074`「防 止」/ `q080`「CPUを システム」(語中・語間空白)、`q011` 表注記
  - 2.nine_six ends96: `q093`「セルB6～B15」(raw は「B6 <B15」)
  - 1.mid (jp_raw のみ = 学習者不可視、low): q087 / q092 / q100 の「〔テクノロジ〕⏎問NN」
- **fig_stem_mismatch_S127.json**: 2015h27h 該当 **0** (17 題はすべて他 exam)。
- **summary §7**: #16 N6-b 括弧字形の残存列挙に **`q090`** (表示層 clean は 〔〕、raw は【)。源で字形を確定できた場合のみ是正。mqB の共有前文は q089〜q092 で同一に保つこと。#12 (13 exam 空白域の走査型) は B1 の再抄写が被覆。
- その他: `q097` / `q099` / `q100` は S127 C2 の共有図 group (q097 のみ再裁断済、図は B1 対象外)。`q098` は A2b §6c の「.phase1 だけ ASCII "」列挙 (未処置)。旧 STATE の「題幹-選択肢不整合 ~14 (2015h27h, 2022r04)」は初期の既知シードで、B1 の核験射程内 (stem / choices を源と照合するため。被覆は未検証)。

## 4. Workflow 起動引数 (主 context が `scripts/quiz-s7x-fidelity.workflow.mjs` に渡す)

```json
{"input_path":"/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/.phase2/b1_fidelity_input_2015h27h.json","exam_id":"2015h27h","qnums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],"label":"b1","pass":"sn","model":"sonnet","agent_type":"general-purpose"}
```

- U11 と同じ: 単 exam 形式 (`exam_id` + `qnums`)、label / pass `sn` / model sonnet / agent_type general-purpose。**batch 化はしない** — U11 の核験 workflow は 1 題 1 agent で、`batch_size` は訳層照合 workflow (`quiz-tr-fidelity`) 側の機能 (S127 §132)。
- label `b1` は S127 C2 の figfix batch 1 (b1) と同じ文字列。ファイル衝突は無いが、log では「B1 (B track)」と書き分けること。
- 既定の出力先: out = `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b1_2015h27h_sn.json`、parts = `data/ip/quiz/.phase2/fidparts/b1_2015h27h_sn/` (いずれも未存在を確認済)。
- run 後: `node scripts/quiz-fidelity-merge-parts.mjs data/ip/quiz/.phase2/fidparts/b1_2015h27h_sn <input_path> 2015h27h <out> --journal <run の journal.jsonl>` → `node scripts/quiz-fidelity-machdiff.mjs <input_path> <out>`。

## 5. 見積もり (D-146 §2 申告用)

| 項目 | 値 | 根拠 |
|---|---|---|
| agent | 100 (Sonnet 5、1 題 1 体) | U11 と同形 |
| token | **≈ 610 万** (幅 540〜650 万) | D-150 §3 の 61k/問 × 100。U8〜U11 実測 54k〜65k/問 |
| 時間 | ≈ 5〜20 分 | U10 / U11 = 3.4 / 2.3 分 (80 / 71 問)、U8 = 13.7 分 (91 問)。並行度依存 |
| 後段 | fixer opus 1 + reviewer opus 1 (別 type) | S122 §0 では各 ≤ 300 万 |

上振れ要因: 中問 4 組 (16 題、うち crop 無し 4 題) と page-08 の 3 題は源ページ全体を読む / 2015h27h は ⑤-2 未経験の母数外で raw 崩れが多い見込み (A1 で 30 題に候補)。停止条件の案 (S122 §0 と同じ): 5h limit / UNREADABLE > 5% / machdiff 説明不能残差 > 3 / part 書き出し失敗率異常。

## 6. 阻害要因

- manifest 健全性: 100 samples すべて displayed_stem 非空・選択肢 ア〜エ 非空・correct_answer ∈ {ア,イ,ウ,エ} (不良 0)。
- 脚本の不具合なし (prep-any は警告どおりの skip のみ、エラー 0)。
- L1 が worktree で precrop / machdiff を改修中。本 manifest は main tree の現行 prep-any で生成した。L1 の precrop 修正が先に main に入る場合、作り直すかは主 context の判断 (作り直しは 0 token、同コマンドで冪等)。
- 未登録中問 (q085-088 / q093-100) は crop が帯のみ。displayed にも前文が無いので帯と表示は整合するが、agent が「前文欠落」を報告する可能性がある → fixer は D-144 段 3 の設計と照らして裁定 (名指し JSON に記載)。
