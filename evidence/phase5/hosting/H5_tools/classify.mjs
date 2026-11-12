// H5: classify every difference of a compare.mjs result.
// usage: node classify.mjs <result.json> <classified.json>
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const REPO = "/Volumes/DevSSD/Project/IT-Passport-Learning";
const [, , inFile, outFile] = process.argv;
const results = JSON.parse(readFileSync(inFile, "utf8"));
const changed = new Set(execSync("git diff --name-only main..hosting-cf -- data/ip apps/web/messages", { cwd: REPO }).toString().trim().split("\n"));
const showMain = (p) => { try { return execSync(`git show main:${p}`, { cwd: REPO, maxBuffer: 1 << 28 }).toString(); } catch { return ""; } };
const showBranch = (p) => (existsSync(`${REPO}/${p}`) ? readFileSync(`${REPO}/${p}`, "utf8") : "");
// JSON string values unescaped, joined: substring search corpus
const corpus = (raw) => { const out = []; try { JSON.parse(raw, (k, v) => { if (typeof v === "string") out.push(v); return v; }); } catch {} return out.join("\u0001"); };
const cache = new Map();
const src = (side, p) => { const k = side + p; if (!cache.has(k)) cache.set(k, corpus(side === "main" ? showMain(p) : showBranch(p))); return cache.get(k); };
// markdown-ish markers stripped so rendered text nodes can be found in the source
const plain = (s) => s.replace(/\[\[jp:([^\]]*)\]\]/g, "$1").replace(/[*_`#>]/g, "");

function filesFor(r) {
  const f = ["apps/web/messages/" + (r.locale ?? r.path.split("/")[1]) + ".json", "data/ip/textbook/unit_index.json"];
  if (r.unit) f.unshift(`data/ip/textbook/units/${r.unit}.json`);
  return f;
}
function explained(texts, side, files) {
  const cs = files.map((p) => plain(src(side, p)));
  return texts.every((t) => cs.some((c) => c.includes(plain(t))));
}

const out = [];
const tally = {};
const bump = (k) => (tally[k] = (tally[k] ?? 0) + 1);
for (const r of results) {
  const files = filesFor(r);
  const touched = files.filter((p) => changed.has(p));
  const rec = { id: r.id, path: r.path, touchedSources: touched, modes: {} };
  for (const [mode, v] of Object.entries(r.modes)) {
    const cls = [];
    for (const [k, d] of Object.entries(v.meta)) {
      let c = "UNEXPLAINED";
      if (k === "canonical" || k === "hreflang") c = "expected:H1-5 canonical/hreflang (PLAN §2 H1-5 項 5)";
      else if (k === "scripts" && JSON.stringify(d.main).includes("_vercel") && !(d.cand ?? []).length) c = "expected:D-220 Vercel analytics 除去 (CF beacon は token 未設定の local build では出ない)";
      cls.push({ where: `meta.${k}`, class: c, detail: d });
    }
    for (const h of v.chromeDiff) {
      const dup = mode === "nojs" && !h.added.length && h.removed.join("") === "日/中/EN";
      cls.push({ where: "chrome", class: dup ? "expected:main の streaming SSR が LocaleSwitcher を hidden <div id=S:0> に二重出力 (静的版は fallback 1 個)" : "UNEXPLAINED", hunk: h });
    }
    for (const h of v.mainDiff) {
      let c = "UNEXPLAINED";
      if (touched.length) {
        const joinedSame = h.removed.join("").replace(/\s+/g, "") === h.added.join("").replace(/\s+/g, "");
        if (joinedSame) c = "expected:L4 content (同文の分割位置のみ差、[[jp:]] 付け等) — 源ファイル変更あり";
        else if (explained(h.removed, "main", files) && explained(h.added, "branch", files)) c = "expected:L4 content (削除側 = main の源、追加側 = branch の源に存在)";
        else c = "L4?:源ファイル変更ありだが文字列照合で説明できず (要目視)";
      }
      cls.push({ where: "main", class: c, hunk: h });
    }
    for (const c of cls) bump(`${mode}|${c.where.split(".")[0]}|${c.class.split(" ")[0].split("(")[0]}`);
    rec.modes[mode] = { mainJoinedEqual: v.mainJoinedEqual, mainHunks: v.mainDiff.length, classes: cls };
  }
  out.push(rec);
}
writeFileSync(outFile, JSON.stringify({ tally, pages: out }, null, 1));
console.log(JSON.stringify(tally, null, 1));
