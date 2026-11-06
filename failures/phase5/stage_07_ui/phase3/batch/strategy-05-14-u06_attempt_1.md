# strategy-05-14-u06 — attempt 1 (rejected)

- 日期: 2026-11-06 (S147、workflow `dde96567` = D-208 + D-209 + D-210)
- 输入: run_tag `b34-u06-a1`、Workflow run `wf_a5a75ea3-4da`、seed: なし。
- 产物 (gitignored): `.../strategy-05-14-u06/parts/b34-u06-a1/`、journal 退避 `.../strategy-05-14-u06/journal.b34-u06-a1.jsonl`。
- 技术判定: rejected。審査: jp-review #1 REVISE low 7 + medium 3/jp-review #2 PASS low 12/loc-review #1 REVISE low 2 + medium 1/loc-review #2 REVISE low 3 + medium 1。723k token / 21.0 分、loc-rejected (JP 2 輪目 PASS)。
- 业务判定 (high / medium、審査の detail_jp 全文):
  - jp-review #1 medium `terms[0].detail_jp (第 3 文) / terms[0].analogy_jp` (観点 7 欄同士の整合 / 観点 1 事実): detail 第 3 文「個別の分野や立場に向けた指針は、この原則を土台にして作られる」と比喩 (校訓→校則) は、個別の指針がすべて 2019 年の AI社会原則から作られるという像を運ぶ。しかし同じ単元で、専門家団体という立場に向けた個別の指針として扱う 人工知能学会倫理指針 は 2017 年 (overview_rows・one_jp) で、AI社会原則 (2019 年) より前に作られている。初学者は学会指針も社会原則を土台にしたと読み、時期の前後と食い違う。
  - jp-review #1 medium `terms[3].points[0]` (観点 1 (考点の qids の題がその点を問うているか) / 観点 2 (出題のされ方だけを述べる考点)): 「人間中心のAI社会原則は、政府が定めた AI のガイドラインの一つで…」は、引用題 2024r06-q012 の題文の前置き「AI に関するガイドラインの一つである“人間中心の AI 社会原則”」を言い直したもので、その題が実際に問うている点 (イノベーションの原則の中身) ではない。また 倫理ガイドライン の考点でありながら見出し語に一切触れず、AI社会原則 の one_jp・この用語の図の 1 行目と同じ内容を繰り返すだけで、倫理ガイドラインについての事実を言っていない。
  - jp-review #1 medium `terms[3].hook_jp` (観点 1 / 観点 9 (データが支持しない規則を作る) / 観点 7): 「名前に「倫理」や「原則」が付いた個々の文書がその仲間になる」は、名前の字面で総称の範囲を決める規則を作っており、出題データにも一般的な定義にも支えがない。名前に「原則」が付くものには、この単元で「別に発行された文書ではない」とする AI利活用原則 (terms[2].points[2]) もあり、逆に名前に「倫理」「原則」が無い文書 (企業の方針など、図の 3 行目) も仲間に入れている。総称の範囲について誤った判別法を教えることになる。
  - loc-review #1 medium `overview_rows[3].one_line_zh / terms[3].one_zh / terms[3].detail_zh / terms[4].hook_zh / pairs[2].rows[0].a_zh / key_points_zh[2]` (現地化: 日式借词 (審査観点 2)): 総称としての「指針」を zh で「指针」と直訳している (「AI 伦理方面各类指针的总称」「作出规定的各类指针的总称」「制定这类指针」「本单元其他指针」「AI 伦理方面指针的总称」「AI 伦理方面的指针」)。中国語の「指针」は主に「(時計の) 針・ポインタ」の意で、IT 教材では pointer と読まれやすく、指導文書の意味では日本語からの借用で不自然。同じ単元で 人工知能学会倫理指針 は「准则」、ガイドラインは「指南」と訳しており、用語の揃いも崩れている。
  - loc-review #2 medium `terms[0].hook_en` (訳: 事実のずれ (jp の記法は日本語名称の語順に依存)): jp「名前の頭に『人間中心』と付く」は日本語の正式名称「人間中心のAI社会原則」の語順に基づく記法。en は "The full title opens with \"Human-Centric\"" と訳しているが、en 本文自身が使う英語名称 "Social Principles of Human-Centric AI" は "Social" で始まり、"Human-Centric" で始まらない。英語読者にとって誤った記述になる (zh は《以人为中心的 AI 社会原则》で語順が一致するので問題なし)。
- 下一 attempt: B5 訳のみ改稿 (seed_loc a1 loc.r1 + loc-review #2)。
