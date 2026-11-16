# C26 Rule D 審査 (S161) — critic (opus)、書き手とは別の subagent_type

**判定: PASS** (HIGH 0 / MEDIUM 0 / LOW 6)

## 依頼 (要旨)
read-only。対象は D-233 の C26 (教科書 units・zh.json・fixture[後で除外]、`c26-edits.ts`・`tbjp-apply.ts --round c26`・pin 試験)。照合項目:
1. 変化した leaf が zh だけで、引号の置換だけか
2. B3 補丁の replay、retire と合成
3. unit-level 3 件
4. UI と試験の依存
5. 道具と試験の質
6. 無作為 N=20 の通読
7. ADR の数

## 結果
1. HEAD と作業木を leaf ごとに比べた。31 単元で 303 leaf が変化し、`c26_apply_run.json` の targets 119 + derived_followers 184 と一対一で対応する。
   - 303 leaf とも長さが同じで、「→“/‘、」→”/’ のほかは同一。ja/en の変化は 0、key の増減も 0。施工後の zh leaf に「」と ‘’ は 0。
   - edits の `before` は HEAD と一致し、replay すると現在の値になる。
2. 補丁の registry を HEAD と現在の 2 版で replay した。loc 116 欄とも before と after が一致し、ほかの欄は変わらない。
   - 新規 119 件の reason はすべて "C26 D-233"。retired 43 件はすべて合成の reason に名がある。
   - 合成 4 件 (strategy-01-02-u08 p21/p04・strategy-05-17-u04 p09/p03・strategy-06-20-u01 p30/p25・technology-15-40-u01 p18/p11) は、after が前の補丁の after を全部は含まない。`windowOf` が窓を縮めたためで、欄全体の replay は一致し、前の補丁の効果は保たれている。
3. unit_summary_zh (strategy-05-16-u01 p06・strategy-05-16-u02 p19・technology-23-63-u13 p01):
   - manifest.v1 = before。active な unit 補丁は他に無い。`base_sha256` = `v1Sha256`。replay = after = units。
4. zh.json は 4 key 11 個で、引号の置換だけ。ja/en は不変。e2e と src にある「…」は注記か ja の文言。`e2e/sensei.spec.ts:553` は messages から動的に読んでいる。
   - vitest 6 file 120/120: cleanup-pins・messagesZhJpWords・v2-compat・v1-frozen・UnitReader.ssr・validateV2。
5. `quoteSwapOnly`・unit-level 経路・派生の検査は正しい。pin 試験は合成した文字列で次を検出できると確かめた: 深さ 0 の ‘、“ の中の “、余分な ”、閉じていない “、対の誤り。
6. N=20 (seed 161) はすべて読める。混在 9 欄の深さは正しい。隣り合う ”“ 8 欄 (“全国”“瞬时”“警报” 等) は並列の正規の形。

## LOW と処置
| # | 指摘 | 処置 |
|---|---|---|
| L1 | `quoteSwapOnly` は位置ごとの検査だけで、深さ 0 の ‘ や対の誤り (“…’) を通す | 施工後の文で対・深さを検査するよう足した (`tbjp-apply.ts`)。edits 119/119 は通り、深さ 0 の ‘ と対の誤りは拒否されることを確認 |
| L2 | `convert()` で既存の ” が stack の頂を何でも pop する → 交差 (「…“…」…”) を黙って誤変換 | 元の閉じ字と照合して throw するようにした。引号の中の既存の “ も throw (手で ‘’ にする)。境界 7 例を確認 |
| L3 | 凍結経路は C26 で使っていない。unit_summary_zh は "not prepared" で止まる (安全) | 記録のみ |
| L4 | “.” “..” “?” “*” は字形によって目立たない | 好みの問題。記録のみ |
| L5 | ADR の語料数 (“ 1,606・`“[[jp:]]”` 116) が再現しない。116 は C25b 前の数、51 は現在の数 | HEAD の値 (“ 1,615、159 : 51) に直した (ADR・S161 log) |
| L6 | S160 log (append-only) の 6 行削除が C26 と混ざる | 重複の削除として別 commit `d7513640` にした |

## 補足 (主 context、審査の後)
- fixture `v2-sample.json` は merge 試験の期待出力なので戻した。審査中に通知し、審査はそれを確認済み。
- `out/zh/**` 全体の可視「: practice (quiz) 14,812 個だけ。glossary・today・sensei・textbook は 0 (D-233 規則 3 と一致)。
- `tbjp-apply.ts --round c26` を空の edits で読み込み、走ることを確認 (L1 の後)。
