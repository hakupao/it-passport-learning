// S157: compare two out/ trees (before/after a framework bump). Usage: node cmp-out.mjs <out_before> <out_after>
// Normalizes hashed /_next/static refs, build id, RSC module ids (I[n,); then compares visible HTML text of what still differs.
import fs from "node:fs"; import path from "node:path";
const [A,B]=process.argv.slice(2);
const walk=(d,r="")=>fs.readdirSync(path.join(d,r),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d,path.join(r,e.name)):[path.join(r,e.name)]);
const isStatic=p=>p.startsWith("_next/static/");
const a=new Set(walk(A).filter(p=>!isStatic(p))), b=new Set(walk(B).filter(p=>!isStatic(p)));
const onlyA=[...a].filter(p=>!b.has(p)), onlyB=[...b].filter(p=>!a.has(p));
// normalize hashed asset refs + build id
const norm=s=>s.replace(/\/_next\/static\/[A-Za-z0-9_\-\/.~]+/g,"/_next/static/X")
  .replace(/static\/chunks\/[A-Za-z0-9_\-.~]+/g,"static/chunks/X")
  .replace(/"buildId":"[^"]+"/g,'"buildId":"X"').replace(/\\"b\\":\\"[^\\]+\\"/g,'\\"b\\":\\"X\\"')
  .replace(/"b":"[A-Za-z0-9_-]{15,}"/g,'"b":"X"').replace(/<!--[A-Za-z0-9_-]{21}-->/g,"<!--BID-->").replace(/\\"b\\":\\"[A-Za-z0-9_-]{15,}\\"/g,"BID").replace(/I\[\d+,/g,"I[N,");
let same=0,rawSame=0,diff=[];
for(const p of [...a].filter(p=>b.has(p))){const x=fs.readFileSync(path.join(A,p)),y=fs.readFileSync(path.join(B,p));
 if(x.equals(y)){rawSame++;same++;continue}
 if(/\.(html|txt|json|xml|js|css)$|^_headers$|^_redirects$/.test(p)&&norm(x.toString())===norm(y.toString())){same++;continue}
 diff.push(p)}
// textual body check: strip all tags/scripts from html and compare visible text
const vis=s=>s.replace(/<script[\s\S]*?<\/script>/g,"").replace(/<style[\s\S]*?<\/style>/g,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
let visDiff=diff.filter(p=>p.endsWith(".html")&&vis(fs.readFileSync(path.join(A,p),"utf8"))!==vis(fs.readFileSync(path.join(B,p),"utf8")));
console.log(JSON.stringify({common:[...a].filter(p=>b.has(p)).length,rawIdentical:rawSame,identicalAfterNorm:same,differing:diff.length,differingFiles:diff,htmlVisibleTextDiff:visDiff.length,visDiffFiles:visDiff,onlyBefore:onlyA,onlyAfter:onlyB},null,1));
