// S158: re-check rv2's "bad" files with row ids normalized wherever they appear (also glued after T-rows)
import fs from "node:fs";
const [A,B,...files]=process.argv.slice(2);
const hash=s=>s.replace(/(\/_next\/static\/|static\/chunks\/)[^"'\s\\)]+/g,m=>m.replace(/[A-Za-z0-9_~-]{8,}(?=\.(js|css|woff2))/g,"H"));
const pushes=s=>[...s.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map(m=>JSON.parse(m[1])).join("");
const LC='{"name":"NEXT_LOCALE","sameSite":"lax"}';
const norm=s=>hash(s).split(LC).join('"$LC"').replace(/"\$\d+:props:localeCookie"/g,'"$LC"')
 .replace(/[0-9a-f]{1,3}:(?=\[|I\[|T[0-9a-f]+,|"\$|null\n|HL\[)/g,"R:").replace(/"\$[LT@]?[0-9a-f]+"/g,'"$R"').replace(/I\[\d+,/g,"I[N,").replace(/"[A-Za-z0-9_-]{21}"/g,'"BID"');
for(const f of files){const g=p=>{const s=fs.readFileSync(p,"utf8");return f.endsWith(".html")?pushes(s):s};
 const x=norm(g(`${A}/${f}`)).split("\n").sort().join("\n"), y=norm(g(`${B}/${f}`)).split("\n").sort().join("\n");
 console.log(x===y?"same":"DIFF", f);}
