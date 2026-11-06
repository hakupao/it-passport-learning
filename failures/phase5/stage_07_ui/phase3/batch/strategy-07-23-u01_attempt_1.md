# strategy-07-23-u01 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b38-u01-a1`、Workflow run `wf_6a3d8039-d93`、seed: なし。
- 产物 (gitignored): `.../strategy-07-23-u01/parts/b38-u01-a1/`、journal 退避 `.../strategy-07-23-u01/journal.b38-u01-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 9 + medium 1/jp-review #2 REVISE low 5 + medium 2。335k token / 8.9 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[1].hook_jp` (観点7 欄同士の整合 (D-204 hook も対象) / 観点1 事実): hook「動詞で書ける (登録する・集計する・出力する) なら機能要件。」は、動詞で書ければ機能要件だと判定する規則として読める。しかし同じ単元の pairs[0].rows[1].b_jp は非機能要件の例を「2 秒以内に応答する、夜間も止めずに動かす」と動詞で書いており、overview_rows[2].extra_jp も「2 秒以内に応答する」である。暗号化する・監視する のような非機能要件も動詞で書けるので、初学者がこの hook に従うと非機能要件を機能要件に分けてしまう。hook が pairs・overview と矛盾し、分類の誤りにつながる。
  - jp-review #2 medium `terms[3].hook_jp / terms[3].analogy_jp` (観点 7 欄同士の整合 (D-204: hook・比喩の結論が同じ用語の定義と食い違う)): one_jp は「利用部門などの利害関係者と確認し合い、その内容で進めることを**双方が**了承して確定させる」と、作る側も含めた双方の了承を定義に入れている。引用題 2017h29a-q019 の正解も利用者側と開発者側の両方で明確にする内容である。ところが hook_jp「判を押すのは作る側ではなく使う側。」は作る側の了承を否定する言い方で、analogy_jp (施主だけが署名する場面) も片側だけの承認の像を運ぶ。合意を一方の承認と取り違えるおそれがある。
  - jp-review #2 medium `terms[2].one_jp / overview_rows[2].one_line_jp / pairs[0].rows[0].b_jp` (観点 7 欄同士の整合 (定義の範囲の食い違い)): one_jp は「機能そのもの以外にシステムが満たすべき条件、**つまり**機能をどの水準で提供するか」と、非機能要件を「機能の提供水準」と同一視している。総表・pairs も同じ定義だけを示す。一方、同じ用語の detail_jp は「技術面や運用面の要件もこちらに含まれる」と言い、図には「監視の方法」が入っている。引用題 2018h30h-q006 も、非機能要件を機能以外の技術要件・運用要件と定義し、監視のサイクルを非機能要件に含める。監視の方法のような運用上の取り決めは「機能をどの水準で提供するか」に収まらず、one・総表・pairs と detail・図とで定義の範囲が合わない。
- 下一 attempt: 最後の part + 審査 #2 を種 (D-207 に従い判定)。
