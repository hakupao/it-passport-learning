import fs from "node:fs"; import path from "node:path";
const [A,B]=process.argv.slice(2);
const walk=(d,r="")=>fs.readdirSync(path.join(d,r),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d,path.join(r,e.name)):[path.join(r,e.name)]);
const files=walk(B).filter(p=>!p.startsWith("_next/static/")&&/\.(html|txt)$/.test(p)&&fs.existsSync(path.join(A,p)));
const hash=s=>s.replace(/(\/_next\/static\/|static\/chunks\/)[^"'\s\\)]+/g,m=>m.replace(/[A-Za-z0-9_~-]{8,}(?=\.(js|css|woff2))/g,"H"));
const pushes=s=>[...s.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map(m=>JSON.parse(m[1])).join("");
const LC='{"name":"NEXT_LOCALE","sameSite":"lax"}';
const rows=s=>s.split("\n").map(l=>hash(l).replace(/^[0-9a-f]+:/,"R:").split(LC).join('"$LC"').replace(/"\$\d+:props:localeCookie"/g,'"$LC"').replace(/"\$L?[0-9a-f]+"/g,'"$R"').replace(/I\[\d+,/g,"I[N,").replace(/"[A-Za-z0-9_-]{21}"/g,'"BID"')).sort().join("\n");
const nonScript=s=>hash(s.replace(/<script[\s\S]*?<\/script>/g,"<script/>")).replace(/<!--[A-Za-z0-9_-]{21}-->/g,"<!--BID-->");
let n=0,bad=[],htmlMarkupDiff=[];
for(const f of files){n++;const x=fs.readFileSync(path.join(A,f),"utf8"),y=fs.readFileSync(path.join(B,f),"utf8");
 if(f.endsWith(".html")){ if(nonScript(x)!==nonScript(y)) htmlMarkupDiff.push(f); if(rows(pushes(x))!==rows(pushes(y))) bad.push(f);}
 else if(rows(x)!==rows(y)) bad.push(f);}
console.log(JSON.stringify({checked:n,rscSemanticDiff:bad.length,bad:bad.slice(0,20),htmlMarkupOutsideScriptsDiff:htmlMarkupDiff.length,hm:htmlMarkupDiff.slice(0,10)}));
