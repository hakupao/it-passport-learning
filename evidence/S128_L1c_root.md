# S128 L1c — 旧 ROOT 直書き脚本の仕分けと修正 (⑨ #9)

- 出所: `evidence/quiz_full52_summary.md` §7.1 row 9 / `evidence/quiz_full52_u10_S126.md` §⑨「旧 ROOT 直書きの過去 workflow 脚本」
- lane: S128 L1c (D-152)、worktree branch `worktree-agent-aba70e76120f4c31f`、base `3c65c3f`
- 編集範囲: `scripts/**` のみ。`data/` / 既存 `evidence/` / `failures/` は不変。

## 1. 旧 ROOT の特定

- 旧 ROOT = `/Users/bojiangzhang/MyProject/IT-Passport-Learning` (repo 移動前の場所)。現 repo = `/Volumes/DevSSD/Project/IT-Passport-Learning`。
- `ls -d /Users/bojiangzhang/MyProject/IT-Passport-Learning` → **No such file or directory** (旧場所は現存しない)。
- 走査: `grep -rl "/Users/bojiangzhang/MyProject" scripts` → **64 ファイル**。`MyProject` 単独 (接頭辞なし) の追加ヒット 0 (= コメントだけの言及も無い)。

## 2. 現行の ROOT 規約 (2 系統)

| 種別 | 規約 | 根拠 |
|---|---|---|
| node 実行の `scripts/*.mjs` (ESM) | `const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");` + `import path from "node:path"; import { fileURLToPath } from "node:url";` | `scripts/quiz-keys-crosscheck.mjs:44-47` ほか約 50 本 |
| `*.workflow.mjs` (Workflow runtime、cwd / fs / import.meta 無し) | 新 ROOT のリテラル `'/Volumes/DevSSD/Project/IT-Passport-Learning'` | `scripts/quiz-s7x-fidelity.workflow.mjs:122-123` (S126 U10 修正)、`scripts/quiz-tr-fidelity.workflow.mjs:122-123` (S127) |
| CJS `*.js` | `path.join(__dirname, '..', …)` (既に `require('path')` 済) | root `package.json` に `"type"` 無し → `.js` は CJS |

## 3. 分類基準

- **A** = 実行に効く: 読込なら旧 path で ENOENT (break)、top-level `mkdirSync(recursive)` があれば旧 path を新規作成してそこへ書く (wrong place)。workflow は agent に渡す絶対パス (Read/Write 先) なので、旧 path では読めないか旧 path へ書かれる。
- **B** = コメント / 歴史的言及のみ → **0 件** (ヒットは全行コード)。
- **C** = `*.run.generated.mjs`: Workflow の一回限りの compiled snapshot (args・入力パス・items を埋め込み済)。再実行するものではない → 修正せず列挙のみ。入力 `data/ip/quiz/.keyaudit/input_{batch_FULL,batch_REM,choicesfix,choicestr,choicesverify}.json` は main tree に現存するが、再実行するなら元の `*.workflow.mjs` から再生成すること。
- 追加列「破壊性」: 修正前は fail-fast (or 旧 path へ書く) だったが、**修正後は live data (`question_bank.json` / `by_year/*.json` / `groups.json`) を過去の patch で上書きできるようになる**脚本に印。committed evidence を上書きする脚本も印。

## 4. 件数

| 種別 | 件数 | A (fixed) | B | C (list only) |
|---|---|---|---|---|
| `*.workflow.mjs` | 18 | 18 | 0 | 0 |
| `*.run.generated.mjs` | 7 | 0 | 0 | 7 |
| その他 `*.mjs` | 37 | 37 | 0 | 0 |
| その他 `*.js` (CJS) | 2 | 2 | 0 | 0 |
| **計** | **64** | **57** | **0** | **7** |

U10 実測 (18 / 11 / 38 = 67) との照合: workflow 18 は一致。generated は 11 → 7 で、差の 4 本 (`quiz-figcrop` / `quiz-figfix` / `quiz-figreverify` / `quiz-figreverify2` `.run.generated.mjs`) は既に**新** ROOT を含む (S127 以降の生成物)。その他は U10 の 38 に対し現 39 (mjs 37 + js 2)。U10 の grep パターン・時点が記録に無く、1 件差は特定できない (残存は本表の 64 で全数)。

## 5. 6 本の lane 所有ファイル

`scripts/quiz-fidelity-machdiff.mjs`、`scripts/quiz-fidelity-prep-*.mjs`、`scripts/quiz-s7x-fidelity-prep.mjs`、`scripts/quiz-choicefig-D144s2.mjs`、precrop module → **旧 ROOT ヒット 0**。編集なし。

## 6. 全 64 行

| file | 種別 | 旧 path 行 / 定数 | 分類 | 機構 | 破壊性 | 処置 |
|---|---|---|---|---|---|---|
| `scripts/audit-figkey.run.generated.mjs` | generated | L114 `items` | C | 一回限りの compiled snapshot (args/入力を埋込) | - | list only |
| `scripts/audit-stem.run.generated.mjs` | generated | L102 `items` | C | 一回限りの compiled snapshot (args/入力を埋込) | - | list only |
| `scripts/patch_empty_choices.js` → `scripts/archive/patch_empty_choices.js` | node(CJS) | L8 `BASE` | A | 読込で ENOENT (break) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/patch_empty_choices_2013_2015.js` → `scripts/archive/patch_empty_choices_2013_2015.js` | node(CJS) | L8 `BASE` | A | 読込で ENOENT (break) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/quiz-choicesfix.run.generated.mjs` | generated | L66 `inputPath` | C | 一回限りの compiled snapshot (args/入力を埋込) | - | list only |
| `scripts/quiz-choicestr.run.generated.mjs` | generated | L48 `inputPath` | C | 一回限りの compiled snapshot (args/入力を埋込) | - | list only |
| `scripts/quiz-choicesverify.run.generated.mjs` | generated | L47 `inputPath` | C | 一回限りの compiled snapshot (args/入力を埋込) | - | list only |
| `scripts/quiz-keyaudit-verify.run.generated.mjs` | generated | L43 `inputPath` | C | 一回限りの compiled snapshot (args/入力を埋込) | - | list only |
| `scripts/quiz-keyaudit.run.generated.mjs` | generated | L35,41 `prompt 内 Write 先` | C | 一回限りの compiled snapshot (args/入力を埋込) | - | list only |
| `scripts/quiz-keyaudit.workflow.mjs` | workflow | L35 `prompt 内 Write 先` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase1-retranslate-S111.workflow.mjs` | workflow | L63 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase1-translate.workflow.mjs` | workflow | L10 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase1.5-reconstruct.workflow.mjs` | workflow | L10 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase2-gapfix-S110.workflow.mjs` | workflow | L53 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase2-gapfix-S110b.workflow.mjs` | workflow | L70 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase2-gapfix-S110c.workflow.mjs` | workflow | L59 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase2-generate.workflow.mjs` | workflow | L12 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase2-q076reverify-S111.workflow.mjs` | workflow | L39 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase2-trfix-S110.workflow.mjs` | workflow | L70 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase2-trsweep-S111.workflow.mjs` | workflow | L101 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-phase2-trsweep.workflow.mjs` | workflow | L101 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/quiz-trsweep-reverify-S115.workflow.mjs` | workflow | L37 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/repair-collect.mjs` | node(ESM) | L12 `ROOT` | A | 読込で ENOENT (break) | - | fixed |
| `scripts/repair-figures-crop.mjs` | node(ESM) | L14 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/repair-figures-finalize.mjs` → `scripts/archive/repair-figures-finalize.mjs` | node(ESM) | L16 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/repair-figures-prep.mjs` | node(ESM) | L11 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage026-apply-figflags.mjs` → `scripts/archive/stage026-apply-figflags.mjs` | node(ESM) | L14 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/stage026-fig-collect.mjs` | node(ESM) | L10 `ROOT` | A | 読込で ENOENT (break) | - | fixed |
| `scripts/stage026-fig-crop.mjs` | node(ESM) | L15 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage026-fig-finalize.mjs` → `scripts/archive/stage026-fig-finalize.mjs` | node(ESM) | L16 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/stage026-fig-prep.mjs` | node(ESM) | L14 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage026-group-crop.mjs` | node(ESM) | L13 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage026-group-finalize.mjs` → `scripts/archive/stage026-group-finalize.mjs` | node(ESM) | L14 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/stage026-phaseC-ci.mjs` | node(ESM) | L11 `DIR` | A | 読込で ENOENT (break) | - | fixed |
| `scripts/stage026-phaseC-sample.mjs` | node(ESM) | L13 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027-apply.mjs` → `scripts/archive/stage027-apply.mjs` | node(ESM) | L18 `ROOT` | A | 読込で ENOENT (break) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/stage027-blind-diff.mjs` | node(ESM) | L17 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027-build-manifest.mjs` | node(ESM) | L17 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027-harvest.mjs` | node(ESM) | L16 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027-heuristic-garble.mjs` → `scripts/archive/stage027-heuristic-garble.mjs` | node(ESM) | L16 `ROOT` | A | 読込で ENOENT (break) | **committed evidence 上書** | fixed + **archived (D-154)** |
| `scripts/stage027-reci.mjs` | node(ESM) | L10 `ROOT` | A | 読込で ENOENT (break) | - | fixed |
| `scripts/stage027-reconcile.mjs` | node(ESM) | L22 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027-reconcile3.mjs` | node(ESM) | L19 `ROOT` | A | 読込で ENOENT (break) | - | fixed |
| `scripts/stage027-verify-harvest.mjs` | node(ESM) | L9 `REPAIR` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027b-apply.mjs` → `scripts/archive/stage027b-apply.mjs` | node(ESM) | L22 `ROOT` | A | 読込で ENOENT (break) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/stage027b-audit-harvest.mjs` | node(ESM) | L10 `OUT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027b-build-audit.mjs` | node(ESM) | L15 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027b-postaudit.mjs` → `scripts/archive/stage027b-postaudit.mjs` | node(ESM) | L17 `ROOT` | A | 読込で ENOENT (break) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/stage027b-prep.mjs` | node(ESM) | L25 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage027b-reconcile.mjs` | node(ESM) | L26 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage03-apply.mjs` → `scripts/archive/stage03-apply.mjs` | node(ESM) | L24 `ROOT` | A | 読込で ENOENT (break) | **live data 書換** | fixed + **archived (D-154)** |
| `scripts/stage03-build-audit.mjs` | node(ESM) | L14 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage03-build-batches.mjs` | node(ESM) | L21 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage03-build-index.mjs` | node(ESM) | L18 `ROOT` | A | 読込で ENOENT (break) | - | fixed |
| `scripts/stage03-build-tiebreak.mjs` | node(ESM) | L14 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage03-coverage.mjs` → `scripts/archive/stage03-coverage.mjs` | node(ESM) | L16 `ROOT` | A | 読込で ENOENT (break) | **committed evidence 上書** (`evidence/phase5/stage_03_coverage.md`) | fixed + **archived (D-154)** |
| `scripts/stage03-harvest.mjs` | node(ESM) | L18 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage03-reconcile.mjs` | node(ESM) | L19 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage03-reconcile3.mjs` | node(ESM) | L17 `ROOT` | A | top-level mkdirSync(recursive) → 旧 path を新規作成して書込 (wrong place) | - | fixed |
| `scripts/stage4-phaseA-planning.workflow.mjs` | workflow | L89 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/stage4-phaseB-content-jp.workflow.mjs` | workflow | L89 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/stage4-phaseB-ruleA-audit.workflow.mjs` | workflow | L32 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/stage4-phaseB-ruleA-translation.workflow.mjs` | workflow | L32 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |
| `scripts/stage4-phaseB-translate.workflow.mjs` | workflow | L77 `ROOT` | A | agent への絶対パス (Read/Write) → 旧 path は ENOENT / 旧 path へ Write | - | fixed |

## 7. 修正内容 (class A、57 本、+135 / −57 行)

- workflow 18 本: 旧 ROOT 文字列 → 新 ROOT リテラル (1 本 1 行。`quiz-keyaudit.workflow.mjs:35` は prompt 内の Write 先絶対パス)。
- ESM node 37 本: `const ROOT = '<旧>'` → 規約形 + import 2 行。ROOT を持たず定数に旧 path を直書きしていた 3 本 (`stage027-verify-harvest.mjs` REPAIR / `stage026-phaseC-ci.mjs` DIR / `stage027b-audit-harvest.mjs` OUT) は ROOT 行を足して `${ROOT}/data/...` に置換。
- `repair-figures-prep.mjs` だけは top-level に `const path = …` があり default import `path` と衝突するため、`import { dirname, resolve } from "node:path"` 形 (理由をコメント 1 行)。
- CJS 2 本 (`patch_empty_choices*.js`): `BASE = path.join(__dirname, '..', 'data/ip/exams/by_year')`。
- 置換は機械 (scratchpad の一回限り script)、ロジック変更 0。

## 8. 検証

- 残存: `grep -rl MyProject scripts` → class C の 7 本のみ。
- 構文: 変更 57 本 + 基準 2 本 (`quiz-s7x-fidelity` / `quiz-tr-fidelity` workflow) = **59/59 OK**。node 脚本は `node --check`。workflow 脚本は top-level `return` を持つ関数本体なので `node --check` は修正前から不可 (基準 2 本も同じ) → `export` を外して `AsyncFunction` 本体として構文検査。
  - 初回 `node --check` で `repair-figures-prep.mjs` が `Identifier 'path' has already been declared` → §7 の形に直して OK。
- 実行: top-level で `mkdirSync` / 書込みする脚本は `--help` でも `data/.tmp` を作るので実行しない。read-only の 2 本だけ worktree で実行:
  - `node scripts/stage027-reci.mjs` → `usage: …` (引数検査まで到達)。
  - `node scripts/stage026-phaseC-ci.mjs` → `ENOENT … /Volumes/DevSSD/Project/IT-Passport-Learning/.claude/worktrees/agent-aba70e76120f4c31f/data/ip/exams/.tmp/s026/phaseC/l1l2_results.json` = ROOT が**脚本の位置から**解決されている証拠 (worktree には data/ が無いので ENOENT が正しい挙動。main tree で実行すれば main の data/ を読む)。

## 9. 他 lane / main への申し送り

1. **破壊性フラグの 10 本** (`stage03-apply` / `stage027-apply` / `stage027b-apply` / `stage027b-postaudit` / `stage026-fig-finalize` / `stage026-group-finalize` / `stage026-apply-figflags` / `repair-figures-finalize` / `patch_empty_choices.js` / `patch_empty_choices_2013_2015.js`) は、修正前は旧 path で失敗していたが、修正後は現 live bank を過去の patch で上書きできる。→ **D-154 で `scripts/archive/` へ移動済** (§10)。
2. committed evidence を上書きする 2 本 → **同じく D-154 で archive 済**:
   - `stage027-heuristic-garble.mjs` → `evidence/phase5/stage_027_heuristic_garble.json` を書く。
   - `stage03-coverage.mjs` → `evidence/phase5/stage_03_coverage.md` を書く (Rule D reviewer の指摘。初版の表では破壊性 `-` としていた見落とし)。
3. class C の 7 本 `*.run.generated.mjs` は修正していない。再実行するなら元の workflow から生成し直すこと (旧 ROOT のまま実行すると ENOENT)。
4. `stage03-build-index.mjs` は scripts/ に残す: 書込先は `data/ip/syllabus/_mapping_index.json` = git 管理外の中間物で、committed data / evidence は上書きしない。
5. ⑨ #9 (summary §7.1 row 9) の件数: 「67 未仕分け」→ **64 = A 57 / B 0 / C 7** (A 57 のうち 12 本は D-154 で archive)。

### 範囲外 (scripts/ の外にある旧 ROOT、意図的に不変)

- `data/` の explanations JSON 4 件 (2011h23a / 2013h25a / 2013h25h / 2015h27h) の `key_guard` `note_jp` 文字列に旧 ROOT が含まれる。UI には表示されない内部 note で、本 lane は data/ 不可侵 → 触らない。
- 過去の evidence / failures / docs の記録 約 95 件に旧 ROOT が残る。歴史記録 (Rule A/B で不変) なので触らない。

## 10. D-154 — 危険脚本の `scripts/archive/` 隔離 (S128、ユーザー決定)

- 決定: live data または committed evidence を古い patch で上書きする脚本 12 本を `git mv scripts/<f> scripts/archive/<f>` で隔離する (削除はしない = 履歴として保持)。
- 対象 12 本: §9.1 の 10 本 + §9.2 の 2 本。
- 各ファイルの先頭 (shebang 直後、既存のコメント様式に合わせる: ESM は `/** … */` ブロック内の ` * ` 行、CJS は `//` 行) に追記:
  `ARCHIVED S128 (D-154) — DO NOT RE-RUN. Overwrites live data (question_bank.json / by_year / groups.json) or committed evidence with old patches. Kept for history only.`
- 1 階層深くなったので ROOT を直した: ESM `path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")`、CJS `path.join(__dirname, '..', '..', 'data/ip/exams/by_year')`。
- 検証: `node --check scripts/archive/*` 12/12 OK。中で他の脚本を相対 path で呼ぶものは無し (`execFileSync` は `python3 -c` だけ)。
- 参照の掃引 (`grep -rn`、`node_modules` / `.git` / `data` / `docs/discussion` / `scripts/archive` を除く):
  - 実行に効く参照 (package.json、他の脚本、`docs/phase5/PLAN.md`) → **0 件**。直すものは無し。
  - 非実行の言及 (歴史記録なので不変、列挙のみ): `evidence/quiz_pagefix_D145_S118.md` (L40/41/69/328)、`evidence/phase5/stage_03_mapping.md` (L17/19)、`evidence/phase5/stage_027_repair_audit.md:13`、`evidence/phase5/stage_02_figure_repair.md:125`、`evidence/phase5/stage_026_figflag_triage.md:34`、`evidence/phase5/stage_027b_repair.md` (L22/24)、`docs/phase5/STAGE_2.6_REMAINING.md:23`、`docs/decisions/D-145-figure-page-pointer.md` (L36/71/183)。archive 済ファイル内の `Usage: node scripts/<f>` コメントも旧位置のまま (歴史の記述として残す)。
