# D-143 — explfix は key_guard の **final を全文書き換え**、round1 には触れない

- **Status**: Locked (Session 117, 2026-09-06)
- **ユーザー gate**: S117 冒頭で「⑧ explfix 是否改写 round1 note 正文，锁一个 D」を含む backlog 第一步を
  ユーザーが承認。方針の中身は S110 §3(a) の merge 設計 (final publish + round1 併記 + suspect=union)
  から一意に導かれるため、Claude が決めて本 ADR に記す。
- **Supersedes / relates**: D-137 (key-guard 内蔵、suspect-flag)・S110 §3(a) (sidecar は final を publish)。
  S107 explfix の「round1 ごと解決」運用と S114〜S116 explfix の「【裁決】追記」運用の**両方を置き換える**。

---

## 背景 — 運用が session 間で割れていた

Phase 2 の key_guard は 2 層ある:

| 層 | 意味 | 保存先 |
|---|---|---|
| **round1** | generate 時の盲導出 (是正前の stem/図で答えを独立に導いた記録) | `generate_result.results[].key_guard_round1` |
| **final** | 裁決後の現状 | `generate_result.results[].key_guard` |

merge (S110 §3(a)) は **final を sidecar に publish** し、round1 が final と異なる場合のみ `key_guard.round1`
に併記、`suspect = union(round1, final)` で**是正による隠蔽 (masking) を防ぐ**。

ところが explfix (裁決を generate_result に書き戻す step) の運用が割れていた:

| 運用 | 何をしたか | 問題 |
|---|---|---|
| **S107 式** | round1 も final も「解決済」に書き換え、merge 後 `suspect=false` にする | round1 の盲導出が失われ、**union による anti-masking が無効化**される。S110 が設計した監査痕跡と矛盾 |
| **S114〜S116 式** | final の `note_jp` 末尾に「【S114 裁決】…」を**追記**するだけ。本文は round1 由来の現在形のまま | 本文「stem は腐敗している」と末尾「是正済」が**同一 note 内で矛盾**。下流の掃引 (caveat スキャン / Rule A critic) が本文を信じて誤読 (S114 §12c で Rule A が構造的弱点として指摘) |

## 決定

1. **explfix が書くのは `generate_result.results[].key_guard` (final) だけ**。
   `key_guard_round1` には**一切触れない** (値も note も)。sidecar を直接編集しない (merge の入力層が真相源)。
2. **final の `note_jp` は追記ではなく全文書き換え**。裁決後の**現状を現在形で**書き、round1 が何を
   捕捉したかは**過去形で**含める。推奨構成:
   `[現状の導出と key との一致] → [何を・どの源 (page-NN) で・どの script で是正したか] → [round1 は何を立てたか (過去形)]`
   例: 「計算問。stem 是正後 (S107: page-05 実読で …を確定、fidfix-S107) は … = イ で key と一致。
   round-1 は腐敗値 … で選択肢に一致せず stem_corruption_suspected=true を立てたが、是正により解消。」
3. final の boolean/derived フィールド (`figure_derivable` / `derived_answer` / `matches_key` /
   `stem_corruption_suspected`) は**是正後の真の値**に更新する。
4. **`suspect = union(round1, final)` は不変** (S110 の anti-masking)。round1 が立っていれば是正後も
   sidecar の `suspect` は true のまま残る — これは仕様。監査上「一度は疑われた問」が消えないための値であり、
   S117 時点で web UI は `suspect` を**描画していない** (`quizModel.ts` の `localizedExplanation` が戻り値に写像するだけで、
   参照する component は 0 — 独立 reviewer が `apps/web/src` 全走査で確認) ため学習者には影響しない。
   学習者向けの caveat 表示を将来つけるなら **final 由来の別フィールド**を追加し、`suspect` の意味は変えない。
5. sidecar の key_guard が generate_result から**決定的に導かれる状態**にあることを `scripts/quiz-keys-crosscheck.mjs` **B4** が
   検査する (ローカル gate、`.phase2` がある環境で実行): round1 は「final と差分がある時に限り publish・全フィールド一致」
   (削除・改変の両方向を検出)、final の `figure_derivable` / `derived_answer` / `matches_key` / `note_jp` は generate_result と一致、
   `stem_corruption_suspected` と `suspect` は union 則。**explfix が sidecar を直接編集すれば B4 が落ちる**のが、§1 の機械的な裏づけ。
6. **既存の S114〜S116 式の追記 note は遡及書き換えしない** (S117 実測: `【SNN 裁決】` marker 付き note は **9 exam・158 問**
   — 2009h21a 25 / 2009h21h 15 / 2010h22a 30 / 2010h22h 18 / 2011h23a 8 / 2011h23tokubetsu 18 / 2012h24a 16 / 2012h24h 12 / 2013h25h 16。LLM 作業になる)。矛盾を含む note は
   `【S1NN 裁決】` マーカーで機械的に識別できるので、次に当該 exam を触る session で本 D に沿って書き直す。
   S107 式で書き換えられた 2017h29a-q009/q016/q040 は `key_guard_round1` が final と**同一内容に上書き**されており
   (S117 実測: round1==final)、盲導出の原記録は復元不能。merge は差分ゼロのため round1 block を出さず、
   sidecar 上は「最初から合っていた問」と区別できない — Rule B の失敗記録として本 ADR に残す。

## なぜこの形か

- 「本文は現在形で正しい」を保証する唯一の方法は**全文書き換え**。追記は必ず古い本文を残す。
- round1 を書き換えると「是正で答えが変わった問」と「最初から合っていた問」が区別できなくなる。
  Phase 2 最大の教訓 (retro §2.2「もっともらしさは一致の証拠ではない」) は、盲導出の記録があって初めて検証できる。
- 「suspect を final だけにする」案は、隠蔽防止という S110 の設計意図を壊す。UI で使っていない値の意味を
  変えるより、必要になったときに別フィールドを足す方が安い。

## 却下した代替案

| 案 | 却下理由 |
|---|---|
| S107 式 (round1 も解決) を正式化 | anti-masking を壊す。監査痕跡が消える |
| S114 式 (追記) を正式化 | note 内矛盾が構造的に残り、下流の LLM 掃引が誤読する (S114 §12c 実測) |
| merge が追記 note を自動整形 | 「本文のどこまでが旧記述か」を機械で切れない。書き手が現状を書くのが唯一確実 |
| 既存 note を今すぐ全量遡及 | 9 exam・158 問の LLM 書き換え + Rule A で 1 session 以上。学習者非表示の内部メタに対して過剰 |

## §7 retrofit (S118) — STEM-CORRUPTION 名簿に round1/final 識別マーカーを追加

**背景**: S117 §20 の Rule D 審閲 NIT-7。`scripts/quiz-phase2-merge.mjs` の実行時ログが出す
STEM-CORRUPTION 名簿は `stem_corruption_suspected = union(round1, final)` (§4 の `suspect` union 則、
§5 の crosscheck B4 が同じ union 則を stem_corruption_suspected にも課している) を表示するため、
`2023r05-q056` のように **round1 が立てて final が是正で解消した**問と、**final が今も疑っている**問が、
同じ `*` 付きの id (旧仕様では `*` は別概念の answer-affecting を表す唯一のマーカーだった) で並び、
人間の裁決者が両者を区別できなかった (実測: `.phase2/generate_result_2023r05.json` で
`key_guard.stem_corruption_suspected=false` / `key_guard_round1.stem_corruption_suspected=true`)。

**対応**: `stemCorruptions` の各エントリに `final_flagged` (`kgFinal.stem_corruption_suspected === true`)
と `round1_only` (`!final_flagged && kg1.stem_corruption_suspected === true`) を追加 (集計専用の付加フィールド。
`stemCorrupt` / `suspect` / union 則の計算は無変更。**変わるのはログ出力用の集計 (`.phase2/suspects_*.json`)
だけ** — 委託仕様どおり sidecar 本体 `data/ip/quiz/explanations/*.json` の JSON は無変更だが、gitignored
中間ファイル `.phase2/suspects_<exam>.json` の `stem_corruptions[]` エントリには `final_flagged` /
`round1_only` の2フィールドが増える。この中間ファイルを読む消費者は現状ゼロ [adjudication 用の人間可読レポート]、
下流スクリプト・crosscheck・sidecar には影響しない)。旧 `*` の answer-affecting 情報を消さないよう、
名簿の行頭マーカーを3種に変更:

- `*` = final も `stem_corruption_suspected=true` (現状も要確認)
- `†` = round1 のみが検出、final は是正済み (union 則により名簿には残存する — §4/§5 の anti-masking)
- `!` = `answer_affecting` (=`key_guard.suspect`) が true。`*`/`†` のどちらとも併記されうる

に変更し、名簿の直後に上記3種の凡例を印字する。実測 (`.phase2/generate_result_2023r05.json` を読み直して
名簿ロジックを再現、sidecar は書き換えていない):

```
STEM-CORRUPTION    : 4 → q004*, q021*, q023*, q056†!
legend         : * = final も stem_corruption_suspected=true (現状も要確認) / † = round1 のみ検出・final は是正済み
                 (round1∪final の union 則で名簿には残存 — anti-masking、D-143 §4/§5) / ! = answer_affecting (key_guard.suspect=true)
```

`q056` が期待どおり `†!` (round1 のみ検出・是正済だが `suspect`=true として残る) で識別され、
`q004`/`q021`/`q023` は `*` (final も要確認、answer_affecting=false) のまま区別される。
データ意味論・union 則・sidecar (`data/ip/quiz/explanations/*.json`) の JSON は不変 —
変更は集計時の付加フィールド (中間レポートのみ) とログ表示のみ。
