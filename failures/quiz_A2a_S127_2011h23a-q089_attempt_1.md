# Rule B — S127 A2a 是正器 attempt 1: `2011h23a-q089` の見出し・引用符の是正が中問 COPY 組のゲートを壊した

- **工程**: A track A2a (D-150 §4)、是正器 `scripts/quiz-fidfix-S127-a2a.mjs` の初回 `--apply`
- **日時**: 2026-10-20 (Session 127)
- **writer**: a2a-fixer (`oh-my-claudecode:executor` opus)

## 入力

A1 の候補 `1.mid` (jp / zh / en) と agent DISCREPANT 6 件 (引用符・読点) に従って、`translations/2011h23a.json` の `2011h23a-q089` に次の置換を入れた:

| 層 | from | to |
|---|---|---|
| jp `stem_jp_clean` | `問 89 画素データを` | `画素データを` (stem 途中の見出し除去) |
| jp `stem_jp_clean` | `41 文字目が「w,b,w,w,w,b,w」` | `41 文字目が、「w,b,w,w,w,b,w」` (源の読点を復元) |
| jp `stem_jp_clean` | `「` ×10 / `」` ×10 | `“` ×10 / `”` ×10 (源 p33・p34 は “0” “w” “b” “,” “b,b,b” “b3” “w,b,w,w,w,b,w”) |
| zh `stem` | `问 89 在不压缩` | `在不压缩` |
| en `stem` | `Q89 When the pixel data` | `When the pixel data` |

源での判定 (p33 / p34 を原寸で実読) そのものは正しい。見出しは表示層に紛れた「問 89」、引用符は源の “” を「」に置き換えた体裁差。

## 産物と技術判定

`--apply` → `build-quiz-corpus` → `quiz-phase2-merge` ×16 は通ったが、ゲートで 2 件が落ちた:

```
node scripts/quiz-keys-crosscheck.mjs
✗ 1 problem(s):
  [A7] 2011h23a-q089: jp stem lacks group 2011h23a-q089-copy preamble probe (前文欠落 or 訳文ずれ)

node scripts/quiz-chumon-groups-build.mjs --check
Error: 2011h23a-q089 jp: cut marker '問 89 画素データを圧縮せずに出力した場合' が源 stem に無い (COPY 表 drift)
```

- `scripts/quiz-chumon-groups-build.mjs:68` の COPY 組 `2011h23a-q089-copy` (q089 → q090 / q091 / q092) は、q089 の stem の**「問 89 …」を前文の終わりの cut marker** に使う (jp / zh / en それぞれ)。見出しを消すと組の生成が throw する。
- 組の probe (前文の先頭 40 字、空白除去) は `数字の「0」を…` を含む。q089 だけ “” に変えると probe が合わなくなり A7 が落ちる。前文は q090〜q092 にも複写されているので、引用符を直すなら組の 4 題を同時に直す必要がある。

## 業務判定

- 是正の向き (源どおり) は正しいが、**q089 単独では当てられない**。この見出しは表示層の混入であると同時に、中問の複写機構の境界マーカーを兼ねている。
- A2a の射程 (名指し候補の field) を越えて COPY 表と q090〜q092 の前文を直すのは scope 外と判断し、**本 unit では見送り**。

## 処置

- `git checkout data/ip/quiz/translations/2011h23a.json` で適用前に戻した (この file の差分は q089 の 3 行だけで、他の題は無変更)。`.phase1/tr_2011h23a-q089.json` は clean を持たず、zh / en にも見出しが無い (sidecar と乖離済み) ため、もともと書き込んでいない。
- 是正器から q089 の FIX / CLEANN を外し、理由をコメントに残した。`quiz-phase2-merge 2011h23a` を回し直し、crosscheck (A1–A7, B1–B7) と chumon `--check` が GREEN に戻ったことを確認した。

## 次 attempt への入力

1. `scripts/quiz-chumon-groups-build.mjs` の COPY 表で、`2011h23a-q089` の `cut` を見出しの次の文 (`画素データを圧縮せずに出力した場合` / `在不压缩像素数据` / `When the pixel data is output`) に変える。または `section` 方式に切り替える。
2. 同時に q089〜q092 の 4 題で、jp 前文の「」×(題ごとの数) を “” に、q089 の問文「41 文字目が「…」」を「41 文字目が、“…”」に、q089 の stem 途中の「問 89 」「问 89 」「Q89 」を除去する。
3. `chumon_groups.json` を再生成する (`--check` 一致)。crosscheck の A7 も GREEN になることを確認する。
4. 担当候補は B track (13exam = 2011h23a、D-150 第 3 条) の fixer。または ⑨ の中問体裁 lane。
