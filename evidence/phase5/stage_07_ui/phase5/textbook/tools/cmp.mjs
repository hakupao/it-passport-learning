import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const sharp = require("sharp");
const [a, b] = process.argv.slice(2);
for (const f of fs.readdirSync(a)) {
  const A = sharp(`${a}/${f}`), B = sharp(`${b}/${f}`);
  const [ma, mb] = [await A.metadata(), await B.metadata()];
  if (ma.width !== mb.width || ma.height !== mb.height) { console.log(f, "SIZE", ma.width, ma.height, "vs", mb.width, mb.height); continue; }
  const [ra, rb] = [await A.raw().toBuffer(), await B.raw().toBuffer()];
  let d = 0; for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) d++;
  console.log(f, `${ma.width}x${ma.height}`, "differing bytes", d);
}
