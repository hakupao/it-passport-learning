# ⑤-2 U1 — Sonnet 5 A/B 試験 (2015h27a 68 問、Opus 双 pass 基準) — S120

> D-146 第 2 unit。目的: 抄写 (源ページ逐字照合) agent を Opus → Sonnet 5 に切り替えても欠陥召回が落ちないかを、波 1 で確定済の 2015h27a 欠陥を基準に実測する。**データ変更なし** (計測のみ)。

## 1. 設計

| 項目 | 値 |
|---|---|
| 母数 | 2015h27a 68 問 (`full52_population_S118.json`、波 1 と同一) |
| 入力 | `data/ip/quiz/.phase2/u1ab_fidelity_input_2015h27a.json` = **波 1 是正前**の displayed スナップショット (`full52_fidelity_input_2015h27a.json` と同文) + `--precrop` 由来の `question_crop_png` 63 問 / `prev_page_png` 68 問を id で移植 |
| 基準 | `evidence/quiz_full52_wave1_S118.md` §3 表の 2015h27a **8 問 / 12 差分** (q066 既知仕様・q009 偽陽性は除外)。PLAN §2 の「13 題」は波 1 全体 (2015h27a 8 + 2016h28a 5) の数で、本 unit で訂正 |
| 判定 | 問召回 ≥ 7/8 かつ差分召回 ≥ 11/12 かつ agent 偽陽性 ≤ 2 (Opus 双 pass の偽陽性 = q009 両 pass) |
| run | 煙試験 `wf_412e4fd1-ac4` (q001 / q044 / q097、label `u1ab_smoke`) → 本番 `wf_ce7c01b8-868` (68 問、label `u1ab`、`model:"sonnet"`、agent_type general-purpose、単 pass gp) |
| 手順 | run → `merge_cmd` (`quiz-fidelity-merge-parts.mjs`) → `quiz-fidelity-machdiff.mjs` → 主 context が基準 12 差分と field 単位で機械突合 (source_text / current_text に欠陥語句を含むか) |

Opus 側の severity 裁決 (PLAN §2 U1) は、基準 8 問が波 1 で既に主 context 裁定済みのため**追加 agent を出さず**、基準 severity との差分比較で代替した (節約 ≈ 75 万 token)。

## 2. 結果

| 指標 | Sonnet 単 pass (本 unit) | Opus 双 pass (波 1、参考) |
|---|---|---|
| 完走 | 68/68、UNREADABLE 0 | gp 67/68 + cr 67/68 (q097 両 pass 失敗 → resume) |
| DISCREPANT 問 | **8** = 基準 8 問と完全一致 | **gp 8 / cr 7 (+ 基準外 q066)** → 去重 8 (Rule D 訂正: 旧記載「gp 7 / cr 7」は誤り) |
| 差分召回 | **12/12** (下表) | **gp 単 pass 12/12、cr 単 pass 11/12** (q093 は cr が落とし machdiff 捕捉)。和集合 12/12 |
| 問召回 | **8/8** | 8/8 |
| 基準外差分 (agent 偽陽性) | **0** (q009 CLEAN、q066 CLEAN) | gp 0 / cr 1 (q066 stem)。q009 は両 pass とも agent は差分計上せず、machdiff 側の既知偽陽性型 (段落分割) |
| machdiff 残差 | same 339 / AGENT_MISSED **1** (q066 = 既知仕様の図代替テキスト) / VERDICT_CONFLICT 0 | gp: same 338 / MISSED 2 (q009, q066)、cr: same 338 / MISSED 2 (q009, q093) |
| 正解肢上 | 2 (q059 イ / q097 ウ) = 基準どおり | 2 |
| token (workflow 報告 subagent_tokens) | **4,027,589** / 68 問 ≈ 5.9 万/問 (煙試験別途 194k) | 1 pass ≈ 370〜530 万 (≈ 5.5 万/問) × 2 pass |
| 時間 | 15.2 分 (単 pass) | 6〜17 分 × 2 pass |
| 画像 Read | 合計 159 = **2.3 回/問** (1 回 = 43 問、crop 題平均 2.2、crop 無し 5 題平均 3.8) | 5〜10 回/問 |
| part 書き出し | 66/68 が parse 可能な JSON、**2 件 (q034 / q066) が壊れた JSON** (q034 は途中切断、q066 は末尾に余分な文字) → journal.jsonl の schema 検証済 return から復元 (壊れた原本は `*.json.broken` として保存) | — (U0 以前は return に全文) |

### 2a. 基準 12 差分の field 単位突合

| # | id | field | 基準 severity | Sonnet severity | 正解肢 | 判定 |
|---|---|---|---|---|---|---|
| 1 | q027 | stem | cosmetic (Opus gp / cr とも cosmetic) | **semantic** (過大、3 pass 中 Sonnet のみ) | – | HIT: 「分析・評価し」中黒挿入を捕捉、読点字種は別扱いと明記 |
| 2 | q042 | choice.イ | semantic | semantic | – | HIT: 「開発**中**の総合テスト」 |
| 3 | q044 | stem | answer_affecting (cr 採用) | **semantic** (過小、Opus gp と同判定) | – | HIT: 「規模**÷**工数」 |
| 4 | q059 | choice.ア | semantic | semantic | – | HIT: 照合誤差 / 可能性は |
| 5 | q059 | choice.イ | semantic | semantic | ✔ | HIT: 認証用の ID / カード類 |
| 6 | q059 | choice.ウ | semantic | semantic | – | HIT: トークンなど |
| 7 | q062 | choice.エ | cosmetic | cosmetic | – | HIT: 末尾空白 + 「.」 |
| 8 | q081 | choice.イ | cosmetic | cosmetic | – | HIT: 「設けられた.,」 |
| 9 | q093 | stem | cosmetic | cosmetic | – | HIT: 【手順】→〔手順〕 (Opus cr は落とし machdiff 捕捉) |
| 10 | q097 | stem | cosmetic | cosmetic | – | HIT: 【】→〔〕 (煙試験では未計上、本番では計上 = 同モデルでも非決定的) |
| 11 | q097 | choice.ウ | semantic | semantic | ✔ | HIT: 「X社␣PC」空白 (S118 検索式例外を自発適用) |
| 12 | q097 | choice.エ | semantic | semantic | – | HIT |

裁定後基準との severity 一致率: Sonnet 10/12、Opus gp 11/12 (Rule D 実測)。severity 差 2 件はいずれも欠陥そのものは捕捉しており、severity は fixer / 主 context 裁定で上書きされる層 (波 1 でも gp/cr 不一致を主 context が裁いた) なので判定に影響しない。

## 3. 判定 → **PASS: 以後の抄写 agent は Sonnet 5 を既定にする**

- 召回 12/12・8/8 (閾値 11/12・7/8)、偽陽性 0 (閾値 ≤ 2)、UNREADABLE 0 (停止条件 > 5% に非該当)。
- Sonnet 単 pass は **Opus の最良単 pass (gp: 12/12・8/8・FP 0) と同等**。本 exam では Opus の第 2 pass (cr) は実欠陥を 1 件も追加していない (Rule D MAJOR-2: 「双 pass → 単 pass」の節約は Sonnet の功績ではなく Opus 単 pass でも成立した。Sonnet 切替の結論自体は不変)。machdiff 残差は Sonnet 1 / Opus 各 pass 2 だが、差の 1 件 (q009) は machdiff 側の既知偽陽性型で、真の漏検は双方とも q066 の 1 件 (Rule D MINOR-6)。
- 1 pass あたりの token は Opus とほぼ同じ (5.9 万 vs 5.5 万/問) だが、(a) 双 pass → 単 pass で半減、(b) Sonnet の額度消費は Opus より軽い、(c) 画像 Read が 2.3 回/問 (precrop 効果、Opus 期は 5〜10 回)。

## 4. 限界・注意 (evidence として残す)

1. **単 exam・単 run の結論**。基準は Opus が作ったため、本設計では Sonnet は Opus と「同等」までしか示せず「Opus より多く見つける」は測れない (基準外差分 0 = 見つけていない)。U3 以降で Sonnet 単 pass + machdiff の残差を継続監視し、Sonnet 起因の新型漏検が出たら本 evidence に追記する。
2. **同モデル非決定性**: q097 stem の 【】→〔〕 は煙試験で未計上・本番で計上。machdiff (transcript 起点) が第二の網として機能する前提は維持 (単 pass 化しても machdiff は必須)。
3. **contamination 1 件 (先行監査の事前参照)**: q066 agent が**自分の結果を書く前に** Bash 3 回で `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_2015h27a_gp.json` (S118 の Opus 先行監査) を読み、同 id の audit 全文 (`[図]` マーカー付き transcript) を表示してから、同じ `[図]` マーカーを使う自分の結果を出した (Rule D MINOR-3: 「読んで結論一致と書いた」より重い、事前参照)。
   **第 2 類 (Rule D MINOR-4)**: 7 agent (q044←q043 / q060←q058 / q066←q045 / q068←q001 / q073←q074 / q081←q080 / q093←q017) が同 run の**別題の part file** を Read (JSON 形式の参照とみられ、自題の答えは漏れないが、agent 間が隔離されていない)。うち 4 件は基準欠陥題。→ prompt に「`evidence/` と `fidparts/` 配下の他ファイルを読まない」を追記 (⑨)。q066 は基準外 (既知仕様) で判定に影響しないが、**prompt に「`evidence/` 配下の先行監査結果を読まない」を追記すべき** (⑨ 登録)。他 67 agent は先行監査を参照していない (transcript grep)。
4. **part 書き出しの壊れ 2/68 (2.9%)**: Write 出力が途中で切れる / 末尾に文字が付く型。**workflow → 主 context の return** には全文が無い設計 (U0) なので、復元経路は **workflow の `journal.jsonl` (agent の StructuredOutput = schema 検証済全文)** に限られる (Rule D NIT-10)。加えて **part と StructuredOutput の不一致 31/68** (30 件は `notes_jp` の言い回し、1 件は q081 `detail_jp`; verdict / field / severity / current_text / source_text / is_correct_choice / source_transcript は全 68 で一致 = 判定無影響、Rule D MINOR-5)。prompt の「1 文字も変えない」は守られていない → journal を正とする運用が安全。→ `quiz-fidelity-merge-parts.mjs` に `--journal <journal.jsonl>` の復元オプションを付けるのが次の脚本改修候補 (⑨ 登録、U3 前に実装推奨)。今回は主 context が journal から手で復元し、`.broken` を残した。
5. **severity の系統的ずれ**: cosmetic を semantic に上げる (q027)、answer_affecting を semantic に留める (q044、Opus gp も同じ) → severity は従来どおり fixer / 主 context が裁く。
6. 波 1 是正前スナップショットの再利用は本 unit 限りの手法 (是正済 exam で召回を測る場合に必要)。U3 以降は通常どおり `--precrop` で新規生成する。

## 5. 産物
- `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u1ab_2015h27a_gp.json` (merge 後全文、68 audits)
- `data/ip/quiz/.phase2/fidparts/u1ab_2015h27a_gp/` (part 68 + `.broken` 2、gitignored)、`fidparts/u1ab_smoke_2015h27a_gp/` (煙試験 3)
- workflow transcript: `~/.claude/projects/.../subagents/workflows/wf_ce7c01b8-868/` (journal.jsonl に全 return)
- Rule D: 本 evidence の独立検算 → §6 に追記

## 6. Rule D (reviewer = feature-dev:code-reviewer, opus、writer = 主 context) → **PASS-with-notes**
- 独立再計算: 基準 8 問 / 12 差分 (Opus gp∪cr の (id,field) 和集合 13 − 基準外 q066 = 12 で裏取り)、召回 12/12・8/8、偽陽性 0、machdiff same 339 / MISSED 1 / CONFLICT 0、manifest 68 問同文・crop 63 / prev 68、part 復元 2 件 deep equal・.broken 残存、画像 Read 159 / 2.34 回/問 / 1 回 = 43、原寸抽検 4 箇所 (q044 ÷ / q059 3 肢 / q097 空白 + 亀甲括弧 / q093 亀甲括弧) すべて Sonnet の source_text と一致。meta 68 件すべて sonnet + general-purpose。
- MAJOR-1 (数値誤り、PASS は不変): Opus gp 単 pass が 8/8・12/12・FP 0 だった (旧記載 gp 7) → §2 訂正。MAJOR-2: 「双 pass 和集合と同等」は誤導 → §3 を「Opus 最良単 pass と同等、cr は本 exam で寄与 0」に訂正。
- MINOR-3 (q066 の事前参照) / MINOR-4 (別題 part の Read 7 件) / MINOR-5 (part ≠ StructuredOutput 31/68、鍵 field は全一致) / MINOR-6 (machdiff 残差差の 1 件は偽陽性型) / MINOR-7 (q027 は 3 pass 中 Sonnet のみ偏離、severity 一致率 Sonnet 10/12 vs Opus gp 11/12) → すべて本文へ反映。
- NIT-8: token 4,027,589 は一次データから再検証不能 (workflow 報告値のみ)。NIT-9: 時間は mtime 跨度 14.4 分 + 収尾。NIT-10: 「return に全文無し」の主語を明確化。
