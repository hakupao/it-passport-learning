# technology-15-42-u01 — attempt 1 (rejected)

- 日期: 2026-11-08 (S151、workflow 現行 = D-208 + D-209 + D-210 + D-211)
- 输入: run_tag `b62-u01-a1`、Workflow run `wf_08ec40cb-488`、seed: なし。
- 产物 (gitignored): `.../technology-15-42-u01/parts/b62-u01-a1/`、journal 退避 `.../technology-15-42-u01/journal.b62-u01-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE medium 1/jp-review #2 REVISE medium 1 + low 6。331k token / 6.1 分。
- 业务判定 (medium、審査の detail_jp 全文):
  - jp-review #1 medium (観点 7 欄同士の整合 / D-204): DVI の hook は「略語の V は Visual で、名前に音を表す語が入っていない」として、名前から音声の有無を推測させている。ところが同じ単元の DisplayPort の考点 (terms[5].points[0]) は「名前に Display とあるが映像専用ではなく、音声もデジタルで送れる」と、名前から音声なしと推すのは誤りだと述べている。DVI の hook で覚えた推論を DisplayPort に当てると誤答になり、単元の中で記憶の手掛かりと考点が逆を向いている。
  - jp-review #2 medium (D-198 (iii) / D-208 書き方 11 (b) / D-211 正誤選択型): 引用題 2014h26h-q073 は正誤選択型 (説明として適切なもの) で、正解肢アは「映像, 音声及び制御信号を 1 本のケーブルで入出力する AV 機器向けのインタフェース」。考点は「映像と音声に加え、機器を連動させる制御のための信号も同じケーブルで運べる。家庭用 AV 機器どうしの接続に広く使われる」で、正解肢の列挙 (映像・音声・制御信号) を一揃い、同じ順で、続けて『1 本のケーブル』『AV 機器向け』まで同じ並びで言い直している。D-211 で免除されるのは選択肢の順序を変え列挙を落として一般原則を述べた場合だけで、本件は列挙も順序もそのまま。しかも内容は one_jp・detail_jp の言い直しで、考点として独自の事実を足していない。
- 下一 attempt: `b62-u01-a2` seed = a1 jp.r1 + jp-review #2 (#1 の DVI hook は r1 で解消、D-207 非該当 = 別箇所)。
