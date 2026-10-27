// Task 10 Step 2: scripted LOW fixes from pilot_audit.md (L1 L4 L5 L7 O1). Exact-string replacements; each must hit.
import fs from "node:fs";
const R = (file, pairs) => {
  let s = fs.readFileSync(file, "utf8");
  for (const [a, b, n] of pairs) {
    const c = s.split(a).length - 1;
    if (c !== n) throw new Error(`${file}: expected ${n} of ${a}, got ${c}`);
    s = s.split(a).join(b);
    console.log(`${file.split("/").pop()}: ${n}× 「${a}」→「${b}」`);
  }
  fs.writeFileSync(file, s);
};
const U = "data/ip/textbook/units/management-10-27-";
const O1jp = "なお4戦略の term 順は出題頻度ではなく、積極策→次善→受動→移転という正準な概念順を優先している。";
const O1zh = "需要注意的是，这 4 种策略的术语排列顺序并非按出题频率，而是优先采用「积极策→次优→被动→转移」这一规范的概念顺序。";
const O1en = " Note that the four strategies are ordered not by exam frequency but by the canonical conceptual sequence: proactive -> second-best -> passive -> transfer.";
R(U + "u01.json", [
  ["全体の量が書かれておらず、全員の生産性が同じなら", "全体の量が書かれておらず、ここまで作業した人の生産性がそろっていれば", 1],
  ["如果没有给出总工作量且所有人生产率相同", "如果没有给出总工作量，且到目前为止参与工作的人员生产率一致", 1],
  ["If the total work is not given and everyone has the same productivity", "If the total work is not given and everyone who has worked so far has the same productivity", 1],
  ["工作或成果物的请求", "工作或可交付成果的请求", 2],
]);
R(U + "u02.json", [["变更控制", "变更管理", 3]]);
R(U + "u03.json", [
  ["Other names are used too: in Japanese exam wording, **mitigation**", "Other names are used too: **mitigation**", 1],
  [O1jp, "", 1], [O1zh, "", 1], [O1en, "", 1],
]);
R("apps/web/src/lib/textbook/__fixtures__/v2-sample.json", [[O1jp, "", 1], [O1zh, "", 1], [O1en, "", 1]]);
