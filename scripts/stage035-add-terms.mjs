#!/usr/bin/env node
// Stage 3.5b — 語彙ギャップ核心語補完 (D-127)
// 4 核心考点語を knowledge_tree.json の対応 topic.terms へ追加。
// knowledge_tree は自定義折行フォーマット (1行に複数語) のため JSON.stringify 全書き換えは
// 巨大 diff を生む。→ 文字列級の精確挿入 (目標 terms 配列末尾に1語追加、原フォーマット保持)。
// 安全策: backup .pre-s035 / 去重 / 挿入後 JSON.parse で合法性 + invariant (topics数・term総数・他節点不変)。
import fs from "node:fs";

const PATH = "data/ip/syllabus/knowledge_tree.json";
const BACKUP = PATH + ".pre-s035";

// 補完清単 (ユーザー確認: 確補3 + 組込みシステム、仮想サーバは不補)
const TARGETS = {
  "management-11-29": "サービスデスク",
  "technology-23-63": "セキュリティパッチ",
  "management-09-26": "アジャイル",
  "strategy-05-17":   "組込みシステム",
};

const raw = fs.readFileSync(PATH, "utf8");

// --- 補完前の対象節点 term スナップショット (invariant 検証用) ---
const treeBefore = JSON.parse(raw);
const snap = (tree) => {
  const m = {}; let total = 0;
  for (const c of tree.categories) for (const mj of c.major_categories) for (const md of mj.medium_categories) for (const tp of md.topics) {
    m[tp.id] = (tp.terms || []).slice(); total += (tp.terms || []).length;
  }
  return { m, total, topics: Object.keys(m).length };
};
const before = snap(treeBefore);

// 去重: 既に存在する語はスキップ
const toAdd = {};
for (const [id, term] of Object.entries(TARGETS)) {
  if (!before.m[id]) { console.error("✗ 節点不存在:", id); process.exit(1); }
  if (before.m[id].includes(term)) console.log("• スキップ (既存):", term, "@", id);
  else toAdd[id] = term;
}

// --- 文字列級挿入 (逐行ステートマシン) ---
const topicIdRe = /^\s*"id":\s*"([a-z]+-\d+-\d+)"/;  // 3段 = topic のみ (major=2段, medium=2段)
const lines = raw.split("\n");
const out = [];
let curTerm = null, inTerms = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(topicIdRe);
  if (m) curTerm = toAdd[m[1]] || null;
  if (curTerm && /"terms":\s*\[/.test(line)) { inTerms = true; out.push(line); continue; }
  if (inTerms && /^\s*\],?\s*$/.test(line)) {
    // terms 配列の閉じ ] → 直前の最終要素行に逗号を保証し、新語を1行追加
    let k = out.length - 1;
    while (k >= 0 && out[k].trim() === "") k--;
    if (!/,\s*$/.test(out[k])) out[k] = out[k].replace(/\s*$/, "") + ",";
    const ind = out[k].match(/^(\s*)/)[1];
    out.push(ind + JSON.stringify(curTerm));  // 例: "組込みシステム"
    inTerms = false; curTerm = null;
    out.push(line); continue;
  }
  out.push(line);
}
const result = out.join("\n");

// --- 合法性 + invariant 検証 ---
let treeAfter;
try { treeAfter = JSON.parse(result); }
catch (e) { console.error("✗ 挿入結果が不正JSON:", e.message); process.exit(1); }
const after = snap(treeAfter);

if (after.topics !== before.topics) { console.error("✗ topics 数変化", before.topics, "→", after.topics); process.exit(1); }
if (after.total !== before.total + Object.keys(toAdd).length) { console.error("✗ term 総数不整合", before.total, "→", after.total, "期待+", Object.keys(toAdd).length); process.exit(1); }
for (const id of Object.keys(before.m)) {
  const exp = before.m[id].slice();
  if (toAdd[id]) exp.push(toAdd[id]);
  if (JSON.stringify(after.m[id]) !== JSON.stringify(exp)) { console.error("✗ 節点 terms 不一致:", id); process.exit(1); }
}

// --- backup + 書き戻し ---
if (!fs.existsSync(BACKUP)) { fs.writeFileSync(BACKUP, raw); console.log("✓ backup:", BACKUP); }
else console.log("• backup 既存:", BACKUP);
fs.writeFileSync(PATH, result);

console.log("\n=== Stage 3.5b 補完結果 ===");
for (const [id, term] of Object.entries(toAdd)) console.log("  +", term, "→", id);
console.log("topics:", after.topics, "(不変)");
console.log("term 総数:", before.total, "→", after.total, `(+${Object.keys(toAdd).length})`);
