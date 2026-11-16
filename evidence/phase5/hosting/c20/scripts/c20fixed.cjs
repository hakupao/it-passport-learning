const {execSync}=require("child_process");const fs=require("fs");
const sh=c=>execSync(c,{maxBuffer:1<<30}).toString();
const S="/private/tmp/claude-501/-Volumes-DevSSD-Project-IT-Passport-Learning/e9cfb831-182e-4524-90c3-7884004d1251/scratchpad/";
const issues=require(S+"c20mine.json");
// evidence file first-add time
const efile={};for(const f of new Set(issues.map(i=>i.f))){const p=sh(`git ls-files 'evidence/**/${f}' 'evidence/${f}'`).trim().split("\n")[0];efile[f]=+sh(`git log --diff-filter=A --format=%ct -1 -- '${p}'`).trim()}
// per question: commits where zh/en of any field changed
const commits=sh("git log --reverse --format='%h %ct' -- data/ip/quiz/explanations").trim().split("\n").map(l=>l.split(" "));
const tr=x=>{const o=[];if(!x)return "";const add=v=>o.push(v.zh,v.en);if(x.correct)add(x.correct);Object.values(x.distractors||{}).forEach(add);(x.points||[]).forEach(add);return o.join("\u0001")};
const ch={};const cache={};
const get=(c,f)=>{try{return JSON.parse(sh(`git show ${c}:${f} 2>/dev/null`))}catch{return null}};
for(const [c,t] of commits){const files=sh(`git diff-tree --no-commit-id --name-only -r ${c}^ ${c} -- data/ip/quiz/explanations 2>/dev/null || true`).trim().split("\n").filter(Boolean);
 for(const f of files){const A=get(c+"^",f),B=get(c,f);if(!A||!B)continue;for(const[id,q]of Object.entries(B.questions)){if(tr(A.questions[id])!==tr(q))(ch[id]??=[]).push([c,+t])}}}
const subj={};
for(const i of issues){const t=efile[i.f];const later=(ch[i.id]||[]).filter(x=>x[1]>t);i.fixedBy=later.map(x=>x[0]);}
fs.writeFileSync(S+"c20fixed.json",JSON.stringify(issues,null,1));
const c={};for(const i of issues){const k=i.sev+"/tf="+i.tf+"/"+(i.fixedBy.length?"changed":"untouched");c[k]=(c[k]||0)+1}console.log(c);
const unq=new Set(issues.filter(i=>i.sev!=="low"&&!i.fixedBy.length).map(i=>i.id));console.log("med/high untouched questions",unq.size);
