// D-181 Phase C (§0-9) — word lists for the free-question term match (./termMatch).
// Both lists are spelled as in the corpus (data/ip/textbook via buildTermIndex) and
// compared after NFKC; dictionaryCorpus.test.ts checks that every word is a headword.
//
// STOPLIST_HEADWORDS — derived (S131, Phase C fix wave) from the real light index:
// every single-word ASCII headword (no space) that is not all caps (331 words), of
// which those kept here are ordinary English words likely to turn up in a question
// without being its subject ("the value of", "what does X mean", "a list of",
// "a bit"). Left out on purpose: IT / exam domain terms even when they are also
// English words (Router, Firewall, Database, Server, Switch, Queue, Stack, Backup,
// Password, Integrity, Availability, Compliance, Median, Variance, Probability, …),
// and ordinary words that rarely appear in passing (Destruction, Leakage, Pinch, …).
// A stoplisted headword always matches in all caps or next to Japanese / Chinese text
// (「Valueとは」, also across one space); in English prose it matches only when no other
// headword did, so it never crowds real terms out of the anchor.
//
// S131 follow-up (84 → 77 words): taken off, because every sense is a database / graph term
// and that is what the bare English word most likely means in an IT-exam question —
// Table (テーブル, technology-21-55-u01 データ構造の基本単位), Index (インデックス, technology-21-55-u02 E-R図・キー設計), Insert, Join,
// Projection (挿入 / 結合 / 射影, technology-21-56-u01 関係演算), Selection (選択: two
// senses, technology-14-37-u01 制御構造 and technology-21-56-u01 関係演算), Node (ノード,
// technology-13-34-u06 グラフ理論). Kept on purpose, though their only sense is in such a
// unit: Field / Record (フィールド / レコード, technology-21-55-u01, but outside the
// technology-21-* units the corpus' English uses them some 250 / 230 times otherwise:
// "field of view" (13× in strategy-05-17-u02), "the IT field"; audit / medical records,
// the verb "record"), Update (更新 = the SQL operation, but "update" in a question is mostly a software /
// OS update), Edge (辺 = graph edge, but "edge" is mostly the IoT edge; Edge computing is
// its own headword), File (ファイル = a set of records, but "file" is mostly any computer
// file), List / Set / Sequence / Iteration / Function / Procedure / Expression /
// Assignment / Operator / Argument / Comment (data-structure / programming / set units, but
// mostly generic English: "a list of", "a set of", agile iterations, "the function of").
//
// CASE_SENSITIVE_HEADWORDS — the all-caps headwords of 4+ characters that are also
// common English words (from the 222 all-caps single-word headwords): they match only
// in all caps, like the ≤ 3-character acronyms (CASE_SENSITIVE_MAX), so "in this case"
// is not CASE. The ≤ 3-character all-caps words (AND, NOT, OR, RAT, CAL, …) are already
// case-sensitive and are not repeated here.

export const STOPLIST_HEADWORDS: readonly string[] = [
  "Addition",
  "Advertising",
  "Alignment",
  "Alliance",
  "Argument",
  "Assets",
  "Assignment",
  "bit",
  "Cable",
  "Chat",
  "Combination",
  "Comment",
  "Contrast",
  "Control",
  "Cost",
  "Developers",
  "Digital",
  "Edge",
  "Efficiency",
  "Email",
  "Error",
  "Estimation",
  "Expression",
  "Feature",
  "Field",
  "File",
  "Filtering",
  "Follow-up",
  "Frame",
  "Function",
  "Game",
  "Icon",
  "Innovation",
  "Input",
  "Interview",
  "Iteration",
  "Keyboard",
  "Library",
  "List",
  "Loss",
  "Mean",
  "Mode",
  "Modeling",
  "Monitoring",
  "Mouse",
  "Operator",
  "Opportunity",
  "Optimization",
  "Output",
  "Population",
  "Positioning",
  "Prediction",
  "Printer",
  "Procedure",
  "Profit",
  "Proximity",
  "Ranking",
  "Recommendation",
  "Record",
  "Repetition",
  "Retention",
  "Robot",
  "Safety",
  "Sampling",
  "Schedule",
  "Scope",
  "Sequence",
  "Service",
  "Set",
  "Simulation",
  "Smartphone",
  "Tap",
  "Transfer",
  "Update",
  "Value",
  "Vision",
  "Window",
];

export const CASE_SENSITIVE_HEADWORDS: readonly string[] = ["CASE", "HEMS", "LATCH", "MIDI", "MIME", "PERT", "RAID", "TIFF"];
