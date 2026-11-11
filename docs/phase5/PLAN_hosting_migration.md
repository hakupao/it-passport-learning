# 全体整理 + 配信移設計画 (D-217〜D-220) — S154 起案

> ユーザー (S154):「现在要做的事儿好多，我觉得有些乱，需要你梳理，并写一个计划。然后按照计划进行」。
> Tier 3 (多日・本番切替を含む)。evidence = `evidence/phase5/hosting/` (`trace.jsonl`・`_progress.json`・`audit_matrix.md`・`subagent_prompts/`)、failures = `failures/phase5/hosting/`、Rule D = 書き手 (主 session / executor) ≠ 審査 (verifier opus)、完了時 `RETROSPECTIVE_hosting.md` (Rule C)。

## §0 全体の整理 (これ 1 枚で今の仕事が分かる)

| 区分 | 項目 | いつ |
|---|---|---|
| **進行中 (1 本だけ)** | 配信移設 Track H (Vercel → Cloudflare 静的 + 小 Worker) | 今から。branch `hosting-cf` |
| **並行 (切替前の関門)** | 三言語の混入検査 Track L (ja / zh / en の欄に他言語が書き込まれていないか) | Track H と並行。**ドメイン切替 (H7) の前に必ず通す**、以後は毎 build の前に自動実行 |
| **日付つき** | Vercel 使用量と Firewall の UA を再確認 (robots.txt の効果) | 2026-11-14 頃 |
| | 本番 push を最小にする (移動窓から 10-26〜11-08 の山が抜けるまで) | 〜2026-11-25 頃 |
| | C14 公益通報者保護法 → `strategy-02-07-u04` (B3) | 2026-12-01〜 |
| | C14 残り 2 件 | 2027-04-01 / 2028-01-01 |
| **保留 (移設後に D-019 で問いから)** | Stage 7 Phase 4 (辞典・AI 先生の正式化)、Phase 5 (mobile、OQ-18 の 390px はみ出しを含む) | 移設完了後 |
| | C19 (zh 本文の半角句読点 約 1,800、要選別) | Phase 4 の前後で判断 |
| | C12 (quiz 解説の呼称、quiz 層へ引継ぎ) | quiz 層の次工程 |

原則: 同時に進める大きな仕事は Track H の 1 本。内容の修正は `data/ip/` に入るので、移設中も止めずにできる (どちらの配信でも同じデータを使う)。

## §1 前提と制約 (2026-11-11 確認)

- Cloudflare Workers Free: CPU 10 ms / 要求、Worker 100,000 要求 / 日、静的 asset 20,000 ファイル / version・25 MiB / ファイル、asset 要求は無料・無制限 (Worker を起動しない)、Builds 3,000 分 / 月。`_headers`・`_redirects` 対応、`not_found_handling: "404-page"`、`html_handling` 既定 `auto-trailing-slash`。
- Next.js `output: 'export'`: cookies / middleware / `headers()` / redirects / Request 依存 Route Handler / `generateStaticParams` の無い動的 route は不可。next-intl は static export 可 (localePrefix always 必須、locale 判別なし = D-219 と一致、`setRequestLocale` 必須)。
- `bojiangz.com` の NS は Cloudflare。`itlearn` は現在 Vercel 向き。
- **HTML は build の出力物**。正本は `data/ip/` の JSON とコード。修正 = データを直す → build → 上げる (今の push → Vercel build と同じ)。

## §2 Track H — 配信移設

各 step: 開始時 `trace.jsonl` に step_start、終了時に gates (tsc / eslint / vitest / build) + 該当 step の検証 + Rule D。失敗 attempt は `failures/phase5/hosting/step_HN_attempt_X.md`。

### H0 準備
1. 本計画と D-218〜D-220 の記録を commit (docs のみ → Vercel は build しない)。
2. `apps/web/scripts/vercel-ignore-build.sh`: **main 以外の branch は build しない** (`VERCEL_GIT_COMMIT_REF`)。理由: branch の push ごとに Vercel preview が build され、crawl される別ホストも増える。テスト追加。ignoreCommand は build 対象 commit の script を使うので branch に入れれば足り、main を余分に build しない (S154 実施・確認済)。
3. branch `hosting-cf` を作成。evidence 置き場と `_progress.json` を作る。

### H1 静的化の共通部分 (OQ-22 の A / B どちらでも必要)
1. **所有者判定を browser 側へ**: ページから `cookies()` を外す。`?owner_key=` の有効化時に非秘密・非 httpOnly の hint cookie `itp_owner_hint=1` を本物の httpOnly cookie と並べて設定し、`useOwner()` がそれを読む (毎ページの `/api/owner` 呼出は Worker 要求を消費するため採らない、S154)。hint は UI の出し分けだけで、API は従来どおり httpOnly cookie を検査する。非所有者の挙動は不変 (localStorage のみ、/api 要求 0)。**移行時の注意**: 既存の所有者は hint を持たないため、切替後に `?owner_key=` を 1 回開き直す (H7 の手順に入れる)。
2. **公開データの切り出し (build 時生成)**: 過去問を試験回 × 言語の JSON に分ける (約 87)。**表示に使う欄だけを許可リストで出す** (`source_note`・`suspect_count`・`stem_corruption_count` 等の内部欄は出さない)。用語集・今日 / 練習の索引も同様。`/api/quiz/questions`・`/api/sensei/terms` はこの静的ファイルに置き換える (Worker 不要)。
3. **網址パラメータで動くページを browser 側へ**: 練習セッション (`?ids` / `?topic` / `order=rand` の seed / `from=unit` の run)、模試 (`/mock/run`)、記録 (`/record`)、browse の `?review` 等。server の `redirect()` は client の `replace` に。
4. **事前生成**: `force-dynamic` を外し `generateStaticParams` — textbook 一覧・単元 (244 × 3)、glossary 一覧、browse の topic・試験回、今日・練習入口・模試入口・記録・設定・AI 先生。`/` → `/ja` (D-219)。locale なし・旧 link の転送は `_redirects`。
5. **`output: 'export'`**: CSP 等の header を `_headers` へ (テストも移す)。`@vercel/analytics`・`@vercel/speed-insights` を外し Cloudflare Web Analytics (D-220)。全ページに `itlearn.bojiangz.com` の canonical。
6. **IPA 漏洩 gate の再定義**: 出力 `out/` 全体を走査 (IPA 原本のパス・内部欄・未許可ファイルが無いこと)。`.nft.json` 版は移設後に退役。

### H2 関門: OQ-22 (過去問詳細・用語詳細の出し方) を実測で決める — **決定 D-223 = A′** (詳細も HTML、export 後に 2 系統の `.txt` を削除、約 16,200 ファイル)。H1-5 で実装、H5 で詳細への遷移と prefetch を実測
- branch で詳細ページも事前生成した版を作り、**実際のファイル数・build 時間・upload 時間**を測る (見積 16,000 は未実測。各ページ附属の `.txt` を除いても画面遷移が壊れないかも確認)。
- 数字を添えてユーザーに A (詳細も HTML) / B (browser 読込) を決めてもらう。**ここだけは実装前にユーザー判断**。

### H3 Worker (所有者用の API のみ)
- `/api/learning` (学習記録の同期、Upstash Redis REST)、`/api/quiz/feedback`、`?owner_key=` の有効化 (static export では middleware が無いため、owner cookie と hint cookie の設定・削除を Worker が引き継ぐ。`run_worker_first` を `?owner_key=` の付く要求だけに限る方法を H3 で決める)。
- **リスク**: `/api/learning` は最大 1 MiB を受けて merge する。Free の CPU 10 ms に収まるかを、所有者の実際の記録サイズで **preview 上で計測**。収まらなければユーザーに報告 (選択肢: Workers Paid 月 5 ドル / 同期処理の分割)。

### H4 Cloudflare preview に配置
- Wrangler 設定 (assets = `out/`、`not_found_handling: "404-page"`)。workers.dev の preview は `X-Robots-Tag: noindex`。配置方法 (Workers Builds か local `wrangler deploy`) を決める。

### H5 検証
- local: Playwright 全項目を `out/` の静的配信 (:3150) に対して実行。
- **Rule A (内容の同一性)**: Vercel 版と静的版の本文テキストを機械比較 (基線 = main を別 worktree で server build して起動したもの。この branch は production build が export 固定で `next start` が無いため、S154 H1-5 審査 MEDIUM-1) — 全 textbook 単元 × 3 言語は全件 diff、その他のページは 30 件 (10 / 言語) を抽出し目視確認。結果は `audit_matrix.md`。
- preview: HTML smoke (`prod-smoke` を preview に向ける)、所有者の同期を実機で 1 回。
- Rule D: verifier opus (コード)、別 subagent で preview の挙動。

### H6 運用の付け替え
- D-206 自動投入、`prod-smoke.mjs` の対象ホスト、D-212 (docs のみは build しない) の新ホスト版、配置手順を `docs/` に。

### H7 切替 (ユーザー確認の上で実施)
- `itlearn.bojiangz.com` を Worker の custom domain に。切替後 smoke。Vercel は 7 日程度残して戻せるようにし、その間 Vercel 側は noindex。問題なければ Vercel project を停止。
- **前提**: Track L が PASS していること。

### H8 収尾
- `RETROSPECTIVE_hosting.md` (Rule C)、STATE・PLAN 更新、ADR D-217 の「却下」等を実績で更新。

## §3 Track L — 三言語の混入検査

目的: ja の欄に中国語・英語、zh の欄に日本語 (かな)、en の欄に漢字・かなが「串って」入っていないか。対象 = textbook 単元 (全欄)、quiz の訳と解説 (29 試験回)、UI 文言 `messages/{ja,zh,en}.json`。

1. **L1 既存検査の棚卸し**: validateV2、zh_terms、en 層 D-198、2,900 題の訳層照合が何を見ているかを一覧にし、穴だけを足す。
2. **L2 読み取り専用の走査** (`scripts/lang-leak-scan.ts`): 文字種で判定。
   - zh 欄: ひらがな・カタカナ (正当: `[[jp:…]]` 注記、登録済みの JP ラベル)。
   - en 欄: 漢字・かな (正当: `[[jp:…]]`、固有名)。
   - ja 欄: 簡体字のみの字 (这・们・说・时・为・会 等の表、正当: 中国語の引用は無い想定)。
   - 全欄: 空欄・他言語欄と完全一致 (訳し忘れ)。
   - 出力 = 件数と一覧 (`evidence/phase5/hosting/L2_scan.json`)。**修正を約束する前に件数を報告**。
3. **L3 Rule A**: 走査の当たりから 30 件を opus が分類 (本当の混入 / 正当な混在)。さらに **文字種では見えない混入** (ja と zh がどちらも漢字だけの文) のために、当たり以外から 60 欄 (各言語 20) を無作為に抽出して opus が読む。結果は `audit_matrix.md`。
4. **L4 修正**: 本当の混入だけを既存の経路で直す (単元 = B3 補丁、quiz = 既存 sidecar 経路)。Rule D。
5. **L5 恒久化**: 走査を build 前の検査にする (許可リストは fixture、件数 0 を固定)。

## §4 順序と関門

```
H0 → H1 (+ L1〜L3 並行) → H2 [ユーザー判断] → H3 → H4 → H5 → (L4・L5 完了) → H6 → H7 [ユーザー確認] → H8
```

- ユーザーに確認するのは H2 (詳細ページの方式)、H3 で CPU 超過が分かった場合、H7 (ドメイン切替) の 3 点だけ。それ以外は D-161 に従い Claude が判断して記録する。
- 本番 (Vercel) への push は H0-2 の 1 回と docs のみ。それ以外は branch と preview で完結させる。

## §5 Rule A 抽検数 (Tier 3)

| Step | 内容 | 抽検 |
|---|---|---|
| L3 | 混入走査の当たり分類 / 当たり以外の読み取り | 30 / 60 (各言語 20) |
| H1-2 | 公開データの切り出し (許可リスト) | 全件の機械比較 (元データの表示欄と一致) + 10 件目視 |
| H5 | 静的版と現行版の本文一致 | textbook 全件 diff + 他ページ 30 件 (10 / 言語) |

## §6 再開方法

`evidence/phase5/hosting/_progress.json` の `current_step` / `next_step` を読み、本 PLAN の該当 step から続ける。
