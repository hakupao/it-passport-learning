# technology-20-52-u05 — attempt 1 (rejected)

- 日期: 2026-11-08 (S151、workflow 現行 = D-208 + D-209 + D-210 + D-211)
- 输入: run_tag `b68-u05-a1`、Workflow run `wf_6e994f81-c49`、seed: なし。
- 产物 (gitignored): `.../technology-20-52-u05/parts/b68-u05-a1/`、journal 退避 `.../technology-20-52-u05/journal.b68-u05-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE medium 1 + low 5/jp-review #2 REVISE medium 2 + low 6。367k token / 7.3 分。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium (観点 9 (D-205 引用題の支持しない限定) / 観点 7): 引用題 2013h25h-q079 の正解 MPEG は「映像データや音声データの圧縮方式」として問われており、映像と音声を並べて対象にしている。ところが exam 考点は「扱う対象は動きのある映像である」と言い切り、one_jp も「動画とそれに伴う音声」として、音声を映像に付く従属物に限っている。MPEG の規格群には音声だけを圧縮する規格も含まれる (同じ単元の challenge_questions にある 2009h21h-q078 の MP3 は MPEG の音声規格)。そのため、考点が題の支持しない限定を作り、学習者が MP3 と MPEG の関係を取り違えるおそれがある。key_points[1] と総表の one_line (「動画と音声の圧縮規格群」) とも範囲が合わない。
  - jp-review #2 medium (観点 7 欄同士の整合 (定義の範囲の食い違い)): MPEG を符号化方式の側に置いて AVI と対比する欄があり、MP4 を MPEG が定めたコンテナ形式とする欄もある。この 2 つが同じ単元で食い違う。MPEG の one_jp は「圧縮する符号化方式の規格群の総称」と言い切る。pairs[1] は種類 (key 行) を「符号化方式 / コンテナ形式」とし、MPEG が決めるのは「映像や音声をどう小さくするか」と書く。AVI の mix 考点も「符号化方式 (例: MPEG)」とする。一方、MP4 の one_jp は「MPEG-4 規格の一部 (Part 14) として定められたコンテナ形式」とし、pairs[2] は MP4 を定めたところを「MPEG」とする。MP4 の mix 考点は「MPEG-4 は圧縮方式などを含む規格群全体」と書いている。これでは、MPEG は入れ物の規格ではないのか、入れ物も定めているのかが読者に分からない。符号化方式とコンテナを分けるという単元の中心の区別が、その MPEG で崩れる。
  - jp-review #2 medium (観点 1 事実 / D-195 §6 (記法が誤った手がかりを運ぶ)): 記法は MPEG の M (Moving) と、JPEG の 2 文字目の P (Photographic) を比べている。そのうえで「頭の 1 文字で『動くか止まっているか』が分かれる」と結論づけているが、JPEG の頭の文字は J (Joint) で、「止まっている」という意味はない。比べた文字の位置 (頭の文字と 2 文字目) が結論とずれていて、語源として誤った覚え方を教えることになる。
- 下一 attempt: `b68-u05-a2` seed = a1 jp.r1 + jp-review #2。#1 (MPEG の対象を映像に限定) と #2 (MPEG が符号化方式かコンテナも定めるか / JPEG 記法) はいずれも MPEG の定義範囲で 1 回目の往復 → a2 で MPEG の範囲が再発なら D-207 停止規則。
