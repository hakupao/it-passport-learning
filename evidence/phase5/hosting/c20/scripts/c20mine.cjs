const {execSync}=require("child_process");const fs=require("fs");
const files=execSync(`grep -rl translation_faithful evidence --include='*.json'`).toString().trim().split("\n");
const out=[];const shapes={};
for(const f of files){let j;try{j=JSON.parse(fs.readFileSync(f))}catch{continue}
 const audits=j.audits||j.results||(Array.isArray(j)?j:null);
 if(!audits){shapes[f]=Object.keys(j).join(",");continue}
 for(const a of audits){const id=a.id||a.question_id;const tf=a.checks?.translation_faithful;
  for(const is of a.issues||[]){const l=is.lang||"";if(/zh|en|both/.test(l))out.push({f:f.split("/").pop(),id,tf,sev:is.severity,lang:l,d:(is.detail_jp||is.detail||"").slice(0,400)})}
  if(tf===false&&!(a.issues||[]).some(i=>/zh|en|both/.test(i.lang||"")))out.push({f:f.split("/").pop(),id,tf,sev:"?",lang:"?",d:"(tf=false no lang issue)"});
 }}
console.log("shapes-unparsed",shapes);
const ids=new Set(out.map(o=>o.id));console.log("issues",out.length,"questions",ids.size);
const c={};for(const o of out){const k=o.sev+"/tf="+o.tf;c[k]=(c[k]||0)+1}console.log(c);
const byf={};for(const o of out)byf[o.f]=(byf[o.f]||0)+1;console.log(byf);
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
