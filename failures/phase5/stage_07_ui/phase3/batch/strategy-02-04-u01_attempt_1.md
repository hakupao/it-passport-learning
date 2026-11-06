# strategy-02-04-u01 — attempt 1 (jp-rejected)

- 日期: 2026-11-06 (S146 第 20 批 b20、workflow 現行 = D-208 + D-209)
- 输入: run_tag `b20-u01-a1`、Workflow run `wf_2a3eac26-078`、seed なし。
- 产物 (gitignored): `.../strategy-02-04-u01/parts/b20-u01-a1/` (jp.r0 / jp.r1)、journal 退避 `.../strategy-02-04-u01/journal.b20-u01-a1.jsonl`。
- 技术判定: `jp-rejected`、validate 0、JP 審査 2 輪とも REVISE (#1 high 1 + medium 3、#2 medium 2 + low 9)。用量 subagent ≈ 409k token、13.7 分。
- 业务判定:
  - #1 high (r1 で解消): 著作権法の hook「世に出した時点で権利が付く」= 公表で発生と読め、one / points / key_points の「創作した時点」と矛盾 (2015h27a-q001 正解) — D-204 型。
  - #1 medium (r1 で解消): プログラム / アルゴリズム・言語の保護区分が穴埋め題 2017h29a-q028 の空欄の対 + 2018h30a-q007 の組と順をなぞる (D-208 (b)(d)) / 電気ケトルの表が分類題 2017h29a-q035・2013h25a-q023・2014h26a-q006 の判断項目の組を一揃いで再現 (challenge の答えを見せる) / サービスマークの役務例「宅配・保険」が 2025r07-q012 正解肢の例示を同順で言い換え。
  - #2 medium: 著作権 / 特許権 mix 考点が 2022r04-q001 判断項目 a の場面と組をなぞり正誤を入れ替える (D-209 ただし書き) / r1 で (iii) を避けて「プログラムは著作権法で守られる」を消した結果、単元に保護される側の記述が無い (2018h30a-q007 正解の半分、他 3 題の根拠) = (iii) 回避の書き換えが情報欠落を生む型 (批間候補 ③ の変形)。
- 下一 attempt: a2 = a1 `jp.r1` + jp-review #2 を種。
