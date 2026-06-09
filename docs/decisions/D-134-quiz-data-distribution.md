# D-134 — Quiz 配信: クリーン派生 corpus を un-gitignore (raw は gitignored 維持)

> Session 86 (2026-06-09) / Phase 5 Stage 6 / Status: **LOCKED**
> 関連: D-133 (textbook in-repo) を精緻化、D-050/D-109 (Release-only モデル)、D-118 (Schema)

## 文脈

Quiz 接過去問サブ段階で、IPA 過去問 `data/ip/exams/question_bank.json` (2900 題) を web app へ配信する必要。当データは D-133 で **gitignored** (理由: IPA 著作権 + 容量)。repo は **PUBLIC**。

ユーザー回答 (Session 86 Q2) = 「un-gitignore question_bank」。実装前検証で 2 つの食い違いを surface:

1. **著作権**: IPA 公式 FAQ (`https://www.ipa.go.jp/shiken/faq.html`) は過去問の教育利用を **許諾・使用料なしで許可** (「許諾や使用料は必要ありません」)。ただし **出典明記 + 改変明記** が条件、著作権は放棄せず。→ 公開 repo への掲載は **条款上 OK**。D-133 の著作権顧慮は解消。
2. **raw bank の内部 cruft**: 1 問 ~40 field、大半が pipeline provenance (`stem_jp_corrupted_backup`×251 / `choices_jp_corrupted_backup`×174 / `s027_severity` / `*_resourced_s7x` 等)。raw を晒すと破損 OCR backup + 修復トレイル全公開。
3. **容量**: `figures/` = **109M** (467 参照 PNG)。`pages/` 762M は quiz 不要。

## 決定

**raw bank は gitignored 維持。クリーン派生 corpus `data/ip/quiz/` を生成して un-gitignore する。**

- **派生 `data/ip/quiz/`** = projection 済の必要 field のみ:
  `id` / 出典メタ (id+source から導出: 年度・期・試験区分・問番号) / `stem_jp` (figure garble 除去済) / `choices_jp` / `correct_answer` / `has_figure` / figure 参照 / `figure_type` / `syllabus_refs` (primary/secondary/terms) + 後段で `stem_{zh,en}`/`choices_{zh,en}`/`explanation_{jp,zh,en}` を追記。
- **figure**: 参照 467 のみ、ロスレス最適化 (oxipng/pngquant) して派生 corpus に同梱。109M → 目標 <~30M、commit 前に実測。
- **compliance** (IPA 条款): 全 unit に **出典** (per-question)、global に **改変/翻訳声明** (OCR 修復 + 三語翻訳 = 改変)。データ + UI 両方に内蔵。
- **gitignored 維持**: raw `question_bank.json` / `pages/` (762M) / 全 `figures/` raw / `.pre-sNN`・`.backup` (Rule B archive) / `mappings`・`reviews`・`by_year`。

## 理由

- IPA 条款で公開 OK だが、**派生クリーン**にすることで (a) 内部 cruft / 破損 OCR backup を晒さない、(b) 容量を制御、(c) 翻訳/解析の自然な置き場、(d) 教科書 (派生 textbook は in-repo、raw syllabus は gitignored) と同じ S85 パターンで一貫。
- ユーザー Q2 の意図 (IPA データが公開 repo に載る) を、よりクリーンに達成 = 精緻化であって反転ではない。

## 却下した代替案

| 案 | 却下理由 |
|----|---------|
| raw bank as-is un-gitignore | 破損 OCR backup + 修復トレイル + 40 field cruft + (figures 同梱なら) 109M を公開暴露 |
| 全 gitignored + deploy 時注入 | IPA が公開を許可するため不要な infra。Vercel-from-git で別機制が要る |
| 私有 blob/KV 運行時取得 | overkill、新基建 + runtime コスト。教育公開で正当化されず |
| 全 `exams/` un-gitignore | `pages/` 762M の不要肥大 |

## 影響

- `.gitignore` cascade: `!/data/ip/quiz/` 追加 (D-133 の textbook 例外に並ぶ)。
- `scripts/build-quiz-corpus.mjs` (projection) を新設。raw → 派生は決定的変換 (LLM 不使用) → invariant 検証 (件数・出典導出・garble 除去)。
- `next.config.ts` の `outputFileTracingIncludes` に `data/ip/quiz/` 追加 (textbook 同様)。
- UI: 出典表示 + 改変声明コンポーネント。

## Compliance チェック (IPA 条款)

- [x] 全 quiz に 出典 (年度/期/試験区分/問番号) 表示 — `source_label` per question + UI
- [x] global 改変声明 (OCR 修復・整形・分類済の旨) — `quiz_index.attribution` + i18n `Quiz.attribution` (ja/zh/en)
- [x] 教育目的・非商用の範囲を維持

## 実装 as-built (Session 86 Phase 0)

2 点が本 ADR の字面から精緻化 (理由付き):
- **figure の物理配置**: 「派生 corpus に同梱」を、静的配信のため **`apps/web/public/quiz-figures/<id>.webp`** (ロスレス WebP・≤900px・80.6M→30.7M) とした。JSON corpus (`data/ip/quiz/`) と figure 画像 (public) で物理分離するが、両方とも in-repo・IPA 教育利用範囲。route handler 不要で CDN 静的配信できる利点。
- **stem garble 除去は Phase 1 へ繰延** (本 ADR では projection で行う想定だった): 実測で 249/467 の figure-stem の `|` の大半が**正当な markdown 表** (損益/生産性表) と判明、garble との区別は意味判断 → 決定的除去は実コンテンツを削る危険。v1 は生 JP stem を表示、clean 化は Phase 1 LLM 翻訳で自然達成。
- 副次: i18n middleware の matcher に `quiz-figures` 除外を追加 (静的 figure が locale-prefix されないように)。
