# 一括書き直し (D-201 / D-206) の主 context 用ツール

S142 で session scratchpad に作り直したもの。scratchpad は session ごとに消えるため repo に置く (Rule A 雛形 `../ruleA_unit_audit.md` と同じ理由)。
使うときは scratchpad に複製し、`<SCRATCH>` を当該 session の scratchpad 絶対パスに置換する:

```sh
S=<this session scratchpad>; cp docs/templates/batch-tools/*.mjs $S/
for f in gates.sh local-e2e.sh; do sed "s#<SCRATCH>#$S#g" docs/templates/batch-tools/$f > $S/$f; chmod +x $S/$f; done
sed "s#<SCRATCH>#$S#g" docs/templates/ruleA_unit_audit.md | sed '1,7d' > $S/ruleA_template.md
```

| ファイル | 用途 |
|---|---|
| `apply_patches.mjs <unit> <final loc part> <list.json>` | Rule A 建議修の B3 補丁を一括登録。list = `[[field, before, after, reason], …]`。全件の before が欄内に 1 回だけあることを先に検査し、1 件でも外れたら何も登録しない。field の term 名は `terms[i](見出し語)` |
| `gates.sh` | D-201 §2-5 の Gates 五項 + IPA 閘 (tsc / eslint [playwright-report 除外] / vitest / build / nft / batch-order・unit_minutes `--check` / scripts `node --test`)。scripts の fail 1 = `quiz-fidelity-machdiff.test.mjs` は既存 (vitest 用、批間候補 ⑮) |
| `local-e2e.sh <ids> <tag> <topic> <u-list>` | gates → :3150 で `next start` → 截図 → local e2e (試点 3 + 本批)。:3000 は使わない。終了後 :3150 は起動したまま (次の確認用)、停止は PID で |
| `shots-tpl.mjs <outDir> <topic> <u-list>` | ja/zh/en × 1440/390/360/320 を開き、未処理記法・非 200・ページ横はみ出し (OQ-18) を機械検査、1440/390 を撮影 |

注意 (S142 の事故): `local-e2e.sh` の中で截図スクリプトを sed で生成すると tag 名次第で入出力が同名になり自身を空にする。現行版はテンプレートを直接呼ぶ。
