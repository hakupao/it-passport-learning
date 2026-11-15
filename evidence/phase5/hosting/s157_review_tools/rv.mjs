// Reviewer's own compare (independent from cmp-out.mjs)
import fs from "node:fs"; import path from "node:path";
const [A,B,...files]=process.argv.slice(2);
const hash=s=>s.replace(/\/_next\/static\/[^"'\s\\)]+/g,m=>m.replace(/[A-Za-z0-9_-]{8,}(?=\.(js|css|woff2))/g,"H"))
  .replace(/static\/chunks\/[^"'\s\\]+/g,m=>m.replace(/[A-Za-z0-9_-]{8,}(?=\.js)/g,"H"));
const head=s=>{const h=(s.match(/<head>([\s\S]*?)<\/head>/)||[,""])[1];return (h.match(/<(meta|title|link)\b[^>]*>(?:[^<]*<\/title>)?/g)||[]).map(hash).filter(t=>!/rel="(preload|stylesheet|modulepreload)"|as="script"/.test(t))}
// RSC rows: lines "ID:..." ; normalize module refs
const rows=s=>s.split("\n").map(l=>hash(l).replace(/^[0-9a-f]+:/,"R:").replace(/"\$L?[0-9a-f]+"/g,'"$R"').replace(/I\[\d+,/g,"I[N,").replace(/"[A-Za-z0-9_-]{21}"/g,'"BID"')).sort();
const pushes=s=>[...s.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map(m=>JSON.parse(m[1])).join("");
const vis=s=>s.replace(/<script[\s\S]*?<\/script>/g,"").replace(/<style[\s\S]*?<\/style>/g,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const attrs=s=>(s.replace(/<script[\s\S]*?<\/script>/g,"").match(/<[a-z][^>]*>/g)||[]).map(hash).map(t=>t.replace(/"[A-Za-z0-9_-]{21}"/g,'"BID"'));
for(const f of files){const x=fs.readFileSync(path.join(A,f),"utf8"),y=fs.readFileSync(path.join(B,f),"utf8");
 const r={f,size:[x.length,y.length]};
 if(f.endsWith(".html")){const ha=head(x),hb=head(y);r.headEq=JSON.stringify(ha)===JSON.stringify(hb);if(!r.headEq)r.headDiff=[ha.filter(t=>!hb.includes(t)),hb.filter(t=>!ha.includes(t))];
  r.visEq=vis(x)===vis(y); const ta=attrs(x),tb=attrs(y); r.tagsEq=JSON.stringify(ta)===JSON.stringify(tb); if(!r.tagsEq){const i=ta.findIndex((t,k)=>t!==tb[k]);r.firstTagDiff=[ta[i],tb[i]];}
  const pa=rows(pushes(x)),pb=rows(pushes(y)); r.rscRowsSortedEq=JSON.stringify(pa)===JSON.stringify(pb); r.rscRowCount=[pa.length,pb.length];
  if(!r.rscRowsSortedEq){r.rowDiff=[pa.filter(t=>!pb.includes(t)).slice(0,3).map(s=>s.slice(0,300)),pb.filter(t=>!pa.includes(t)).slice(0,3).map(s=>s.slice(0,300))]}}
 else {const pa=rows(x),pb=rows(y);r.rscRowsSortedEq=JSON.stringify(pa)===JSON.stringify(pb);r.rowCount=[pa.length,pb.length];if(!r.rscRowsSortedEq)r.rowDiff=[pa.filter(t=>!pb.includes(t)).slice(0,3).map(s=>s.slice(0,300)),pb.filter(t=>!pa.includes(t)).slice(0,3).map(s=>s.slice(0,300))]}
 console.log(JSON.stringify(r));}
