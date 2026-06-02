#!/usr/bin/env node
/**
 * Stage 4 Phase B — Rule A low5 表現润色の適用 (日語源、翻訳前)
 * accurate=true の軽微な表現/完備性改善 5件。確定的 string 置換 + 適用検証。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PL = join(ROOT, "data/ip/textbook/.planning");

const edits = [
  { file: "content_strategy-02-04-u01.json", term: "特許法", field: "definition_jp",
    from: "自然法則を利用した技術的なアイデア(発明)を、登録により保護する法律。",
    to: "自然法則を利用した高度な技術的アイデア(発明)を、登録により保護する法律。" },
  { file: "content_strategy-02-04-u01.json", term: "特許法", field: "explanation_jp",
    from: "新規性・進歩性が要件であること", to: "新規性・進歩性・産業上利用可能性が要件であること" },
  { file: "content_technology-16-43-u02.json", term: "RAID", field: "explanation_jp",
    from: "RAID(Redundant Arrays of Independent Disks)", to: "RAID(Redundant Array of Independent Disks)" },
  { file: "content_technology-16-43-u02.json", term: "RAID", field: "explanation_jp",
    from: "RAID5はパリティ(誤り訂正符号)を分散させ容量効率と冗長性を両立します。",
    to: "RAID5はパリティ(故障ディスクのデータを復元するための冗長情報)を各ディスクに分散させ容量効率と冗長性を両立します。" },
  { file: "content_technology-16-43-u03.json", term: "仮想化", field: "memory_hook_jp",
    from: "仮想化といえば1台を複数に見せる資源の分割・統合",
    to: "仮想化といえば1台を複数に(複数を1台にも)見せる資源の分割・統合" },
  { file: "content_technology-16-43-u03.json", term: "仮想化", field: "analogy_jp",
    from: "空間を無駄なく活用できます。",
    to: "空間を無駄なく活用できます。逆に、複数の部屋の壁を取り払って1つの大部屋として使うように、複数の資源を束ねて1つに見せる『統合』も仮想化に含まれます。" },
  { file: "content_strategy-02-04-u03.json", term: "サブスクリプション", field: "explanation_jp",
    from: "初期費用を抑えやすく、常に最新版を使え、提供側は継続収入を得られるという特徴があります。",
    to: "初期費用を抑えやすく、最新版を利用しやすく、提供側は継続収入を得られるなどの特徴があります(これらは定義要件ではなく一般的な利点です)。" },
  { file: "content_management-11-29-u01.json", term: "サービスマネジメントシステム", field: "definition_jp",
    from: "ITサービスを計画・提供・改善するための仕組みや活動の全体的な枠組み。",
    to: "ITサービスを計画・提供・改善する活動を指揮・管理するための仕組み(方針・目標・プロセス・体制の枠組み)。" },
  { file: "content_management-11-29-u01.json", term: "サービスマネジメントシステム", field: "analogy_jp",
    from: "レストラン全体の運営マニュアルのようなもの。",
    to: "レストラン全体の運営の仕組み(マニュアル・体制・ルールの総体)のようなもの。" },
];

let applied = 0;
const fails = [];
const byFile = new Map();
for (const e of edits) {
  if (!byFile.has(e.file)) byFile.set(e.file, JSON.parse(readFileSync(join(PL, e.file), "utf8")));
  const doc = byFile.get(e.file);
  const t = doc.terms.find((x) => x.term === e.term);
  if (!t || typeof t[e.field] !== "string" || !t[e.field].includes(e.from)) {
    fails.push(`${e.file}::${e.term}.${e.field} — 'from' not found`);
    continue;
  }
  t[e.field] = t[e.field].replace(e.from, e.to);
  applied += 1;
}
if (fails.length) { console.error("適用失敗:\n  " + fails.join("\n  ")); process.exit(1); }
for (const [file, doc] of byFile) writeFileSync(join(PL, file), JSON.stringify(doc, null, 2));
console.log(`Rule A low5 润色適用: ${applied}/${edits.length} 置換 (${byFile.size} files)`);
