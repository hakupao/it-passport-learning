# D-238 classifier prompt (S164) — zh「·」(U+00B7)

You are the writer for D-238 in repo /Volumes/DevSSD/Project/IT-Passport-Learning (IT Passport exam app; zh is a translation of Japanese). Do not edit any data file. Output one JSON file only.

Rule (D-238, user decision; W3C clreq): in zh, 间隔号「·」 is for foreign personal names (and dates); a coordinate list uses 顿号「、」. Replace every「·」 used to separate coordinate items with「、」. This mirrors D-230, which did the same for「・」(U+30FB); read `evidence/phase5/hosting/l4d_C.md` § 範囲と規則 (exceptions there: a pair inside a list already separated by「、」 → 「/」; a label separator → 「：」; line-initial bullet → 「•」; one-name compounds such as the PER English name → keep as one name, e.g. 「Price-Earnings」).

Input: `evidence/phase5/hosting/oq25/input_{SET}.json`, rows {n, layer, loc, pos, ctx, zh_full?, jp}. `ctx` = 25 chars either side of the「·」 at `pos` in the zh field; `jp` = the jp of the same field (or windows around its「・」; for zh_terms rows, jp is the Japanese term itself).

Classify each row by what the「·」 does, using the jp of the same field as the main evidence:
- `COMMA`: separates coordinate items (jp usually has a parallel「・」 there) → 「、」.
- `KEEP_NAME`: inside a transliterated foreign personal name (亨利·甘特, 约翰·维恩, 蒂姆·伯纳斯-李 …) → keep.
- `EXACT`: anything else that needs a specific replacement (a pair inside an outer「、」 list → 「/」; a label/value separator → 「：」 or 「，」; line-initial bullet → 「•」; a single name or compound that must stay one item; a jp「・」 that is an operator or a defined symbol). Give `to_ctx` = `ctx` with your exact change applied (change only the「·」 at the middle position, unless the same window must change consistently).
- `KEEP_OTHER`: keep, with reason (e.g. it reproduces a symbol the question defines).
Check especially (advisor list): 「A·B·C·D全部为1」「a·b·c·d」「a·c·d」 (choice-item lists → usually 、), 合并·收购, 风险共担·转移, 风险接受·保留, 验收测试·验收, 商品B·3个, 销售额·万日元, 机名.域名/路径·文件名, rows where the「·」 is the first char of ctx's middle (possible bullet or next to **).
If several items in one list are separated by「·」, every「·」 of that list gets the same class; when the list also contains「、」 at an outer level, think about EXACT「/」.

Output `evidence/phase5/hosting/oq25/classify_{SET}.json`:
{"set":"{SET}","rows":[{"n","class","to_ctx"?,"reason"}], "counts":{class: N}}
Every input row must appear exactly once. `reason` short (English or Japanese). Validate with a quick node script that every n is present once and every EXACT has a to_ctx differing from ctx. Report counts and the EXACT / KEEP rows in your reply.
