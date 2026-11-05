// usage: node apply_patches.mjs <unit> <final loc part> <list.json>  (list = [[field,before,after,reason],...])
// 各 before が欄内にちょうど 1 回あることを確かめてから登記。1 件でも外れたら全件中止。
import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
const [U,part,listFile]=process.argv.slice(2)
const loc=JSON.parse(fs.readFileSync(part,'utf8')), P=JSON.parse(fs.readFileSync(listFile,'utf8'))
const get=(p)=>p.replace(/\(([^)]*)\)/g,'').split(/\.|\[|\]/).filter(Boolean).reduce((o,k)=>o?.[/^\d+$/.test(k)?+k:k],loc)
let bad=0
for(const [f,b] of P){const v=get(f);const n=typeof v==='string'?v.split(b).length-1:-1;if(n!==1){bad++;console.log('MISS',n,f,JSON.stringify(v)?.slice(0,240))}}
if(bad){console.log('abort: no patch registered');process.exit(1)}
for(const [f,b,a,r] of P) console.log(execFileSync('node',['--no-warnings','scripts/textbook-v2-patch.mjs','--unit',U,'--register','--part',part,'--field',f,'--before',b,'--after',a,'--reason','Rule A '+r],{encoding:'utf8'}).trim())
