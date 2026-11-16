# C20 round 3 (S162、advisor 指摘の 2 つの穴を埋める)

## 穴
1. 第 2 群 (248 件) の抽出が `lang === "both"` (zh・en が同時にずれる = q098 型) を落としていた → 56 件。
2. 「後で zh/en が変わった = 処置済」と数えた 484 件のうち、機械的な一括修正 (L4 語彙 6f476dec・cade606e・e2f8a0de、L4-d c8b3f82d、節見出し 12d7e0b9、C19b 7a6cbef8、C23 d17a78e4、再 merge a67db880、34049022) しか当たっていない 309 件 → うち内容ずれ系・medium/high 76 件。
- 計 132 件 / 117 題 (`round3_candidates.json`)。

## 仕分け (analyst opus、現行データと照合)
- IN 12 / JP-ERROR 27 (境界判定 8) / GONE 24 / OUT 69。
- IN: 2013h25a-q093 correct・2012h24h-q013 correct en・2021r03-q097 correct・2023r05-q080 correct (jp の断定を points に合わせる)・2025r07-q032 correct・2019r01a-q073 correct・2025r07-q034 全 6 欄 (jp 書直し後も旧訳)・2014h26a-q032 d.ア・2014h26a-q086 d.ウ・2019h31h-q094 d.ウ zh・2010h22a-q008 p1 en・2026r08-q038 p0 zh。
- JP-ERROR 27 件は jp 解説の正確さの問題で D-234 (訳の忠実度) の範囲外 → 別候補として登録 (`round3_jp_errors.json`)。
- medium/high 9 件 (機械的修正のみ) は現行で GONE または上の分類に含まれる。
