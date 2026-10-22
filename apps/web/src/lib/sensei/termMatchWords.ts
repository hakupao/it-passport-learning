// D-181 Phase C (§0-9) — word lists for the free-question term match (./termMatch).
// Both lists are spelled as in the corpus (data/ip/textbook via buildTermIndex) and
// compared after NFKC; dictionaryCorpus.test.ts checks that every word is a headword.
//
// STOPLIST_HEADWORDS — derived (S131, Phase C fix wave) from the real light index:
// every single-word ASCII headword (no space) that is not all caps (331 words), of
// which those kept here are ordinary English words likely to turn up in a question
// without being its subject ("the value of", "what does X mean", "in the table",
// "a bit"). Left out on purpose: IT / exam domain terms even when they are also
// English words (Router, Firewall, Database, Server, Switch, Queue, Stack, Backup,
// Password, Integrity, Availability, Compliance, Median, Variance, Probability, …),
// and ordinary words that rarely appear in passing (Destruction, Leakage, Pinch, …).
// A stoplisted headword matches only when written in all caps or right next to
// Japanese / Chinese text (「Valueとは」), so English prose keeps it out of the anchor.
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
  "Index",
  "Innovation",
  "Input",
  "Insert",
  "Interview",
  "Iteration",
  "Join",
  "Keyboard",
  "Library",
  "List",
  "Loss",
  "Mean",
  "Mode",
  "Modeling",
  "Monitoring",
  "Mouse",
  "Node",
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
  "Projection",
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
  "Selection",
  "Sequence",
  "Service",
  "Set",
  "Simulation",
  "Smartphone",
  "Table",
  "Tap",
  "Transfer",
  "Update",
  "Value",
  "Vision",
  "Window",
];

export const CASE_SENSITIVE_HEADWORDS: readonly string[] = ["CASE", "HEMS", "LATCH", "MIDI", "MIME", "PERT", "RAID", "TIFF"];
