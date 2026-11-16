const fs=require("fs");const D="data/ip/quiz/explanations/";
const rows=[];
for(const f of fs.readdirSync(D)){const j=JSON.parse(fs.readFileSync(D+f));
 for(const [id,q] of Object.entries(j.questions)){
  const fields=[];
  if(q.correct)fields.push(["correct",q.correct]);
  for(const [k,v] of Object.entries(q.distractors||{}))fields.push(["d."+k,v]);
  (q.points||[]).forEach((v,i)=>fields.push(["p"+i,v]));
  let J=0,Z=0,E=0;
  for(const [n,v] of fields){if(!v.jp)continue;J+=v.jp.length;Z+=(v.zh||"").length;E+=(v.en||"").length;
   rows.push({id,n,j:v.jp.length,zr:(v.zh||"").length/v.jp.length,er:(v.en||"").length/v.jp.length});}
  rows.push({id,n:"ALL",j:J,zr:Z/J,er:E/J});
 }}
const all=rows.filter(r=>r.n==="ALL");
const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(p*(s.length-1))].toFixed(2)};
console.log("questions",all.length);
for(const k of ["zr","er"]){const a=all.map(r=>r[k]);console.log(k,"p01",q(a,.01),"p05",q(a,.05),"p50",q(a,.5),"p95",q(a,.95),"p99",q(a,.99),"max",q(a,1));}
const fr=rows.filter(r=>r.n!=="ALL"&&r.j>=40);
for(const k of ["zr","er"]){const a=fr.map(r=>r[k]);console.log("field",k,"n",a.length,"p01",q(a,.01),"p50",q(a,.5),"p99",q(a,.99),"max",q(a,1));}
const f98=rows.filter(r=>r.id==="2013h25a-q098");console.log(f98);
fs.writeFileSync(process.argv[2],JSON.stringify(rows));
