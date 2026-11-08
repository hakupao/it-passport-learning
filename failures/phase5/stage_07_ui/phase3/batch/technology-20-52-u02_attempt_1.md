# technology-20-52-u02 — attempt 1 (rejected)

- 日期: 2026-11-08 (S151、workflow 現行 = D-208 + D-209 + D-210 + D-211)
- 输入: run_tag `b68-u02-a1`、Workflow run `wf_261e16bf-2f8`、seed: なし。
- 产物 (gitignored): `.../technology-20-52-u02/parts/b68-u02-a1/`、journal 退避 `.../technology-20-52-u02/journal.b68-u02-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE medium 1 + low 8/jp-review #2 REVISE medium 1 + low 7。342k token / 7.2 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium (観点1 事実 (網羅的な言い切り) / 観点7): 第 2 文「音声や画像には前者、文書やプログラムには後者が使われる。」は、データの種類で圧縮方式が決まるように言い切っている。画像には GIF・PNG のような可逆圧縮の形式が広く使われ、同じ topic の過去問 (2013h25h-q079 の選択肢など) でも画像形式は可逆・非可逆の両方が並ぶ。この文を規則として覚えると「画像の形式は非可逆圧縮」と取り違える。単元内でも音声の側で WAV は非可逆圧縮でなく無圧縮なので、「音声には非可逆」とも合わない。
  - jp-review #2 medium (観点1 (確認題が単元に合うか) / D-195 §7 確認題 = 本単元の過去問): 2010h22a-q085 は白黒画像の画素の連続をまとめて表したときの圧縮率を計算する題で、用語はランレングス法・圧縮率・可逆圧縮。本単元 (PCM・MIDI・WAV・MP3・AAC) はランレングスも圧縮率の計算も扱っておらず、ランレングス法は同じ topic の後の単元 u06 の見出し語。単元を読み終えた初学者が本文の知識で解けない題が確認題に入っている。q064 (MIDI)・q078 (MP3)・q079 (MPEG。MP3 の hook と AAC の detail に MPEG が出る) の 3 題で confirm の下限 3 を満たす。
- 下一 attempt: `b68-u02-a2` seed = a1 jp.r1 + jp-review #2 (#1 データ種類で圧縮方式が決まる言い切りは r1 で解消、#2 は確認題 2010h22a-q085 (ランレングス = u06) の差し替えで別箇所 → D-207 非該当)。
