#!/usr/bin/env node
/**
 * Stage 4 Phase B — strategy-05-16-u01 EC analogy 翻訳是正 (確定的)。
 *
 * 経緯: EC analogy_jp を当事者ベース(会社どうし/会社と個人/個人どうし)に是正 (strat-tr-fixes.mjs) 後、
 *   translate.workflow で unit を再翻訳 (verdict PASS) したが、**EC analogy の zh/en だけが旧框架**
 *   (「店舗が会社相手か個人相手か」=二元) のまま塌缩し、新 jp の三者区分を反映しなかった。
 *   reviewer(Rule D) は explanation 正確に引きずられ PASS 誤判。explanation/他5 term は忠実。
 * → analogy zh/en のみを新 jp に忠実な三者区分へ確定的に是正。
 *   その後 re-merge → 独立 critic(oh-my-claudecode:critic, Rule A) で忠実度を再核験 (写審分離)。
 *
 * 新 jp:「…取引の当事者が会社どうしなら BtoB、会社と個人(消費者)なら BtoC、個人どうしなら CtoC と呼び分けます。」
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = join(ROOT, "data/ip/textbook/.planning/translation_strategy-05-16-u01.json");
const FAILDIR = join(ROOT, "failures/stage_04_strat_fixes");
mkdirSync(FAILDIR, { recursive: true });

const doc = JSON.parse(readFileSync(p, "utf8"));
const t = doc.terms.find((x) => x.term_jp === "EC");

const EDITS = [
  {
    lang: "zh", field: "analogy",
    before: "把实体店收银台的买卖原样搬到网络上，就是 EC。根据店铺面对的是公司还是个人，分别称为 BtoB、BtoC、CtoC。",
    after: "把实体店收银台的买卖原样搬到网络上，就是 EC。按交易双方来区分：双方都是公司就是 BtoB，公司与个人（消费者）之间就是 BtoC，个人与个人之间就是 CtoC。",
  },
  {
    lang: "en", field: "analogy",
    before: "EC is simply taking the buying and selling done at a physical store's checkout and moving it onto the internet. Depending on whether the seller deals with companies or individuals, it is called BtoB, BtoC, or CtoC.",
    after: "EC is simply taking the buying and selling done at a physical store's checkout and moving it onto the internet. They are distinguished by who the transacting parties are: company-to-company is BtoB, company-to-consumer (individual) is BtoC, and individual-to-individual is CtoC.",
  },
];

const applied = [], failed = [];
if (!t) { failed.push({ why: "term EC not found" }); }
else {
  for (const e of EDITS) {
    const cur = t[e.field]?.[e.lang];
    if (cur === e.after) continue; // idempotent
    if (cur !== e.before) { failed.push({ lang: e.lang, why: "before mismatch", got: (cur || "").slice(0, 100) }); continue; }
    t[e.field][e.lang] = e.after;
    applied.push({ lang: e.lang, field: e.field });
  }
}
if (!failed.length && applied.length) writeFileSync(p, JSON.stringify(doc, null, 2));

console.log("=== EC analogy 翻訳是正 (三者区分) ===");
console.log(`applied=${applied.length} failed=${failed.length}`);
for (const a of applied) console.log(`  ✓ EC ${a.field}.${a.lang} → 三者区分 (会社どうし/会社と個人/個人どうし)`);
for (const f of failed) console.log(`  ✗ FAIL ${f.lang || ""}: ${f.why}${f.got ? " | got: " + f.got : ""}`);
if (failed.length) { writeFileSync(join(FAILDIR, "ec_analogy_before_mismatch.json"), JSON.stringify(failed, null, 2)); process.exit(1); }
console.log("\n次: re-merge strategy-05-16-u01 → 独立 critic (Rule A) で EC 忠実度再核験。");
