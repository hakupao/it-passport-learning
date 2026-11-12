// H5: a fixed learning record (same bytes for both sides) as an init script
import { writeFileSync, readFileSync } from "node:fs";
import { emptyRecord, encodeRecord, LEARNING_STORAGE_KEY } from "/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/src/lib/learning/record.ts";
const samples = JSON.parse(readFileSync(process.argv[2], "utf8"));
const qids: string[] = samples.filter((x: any) => x.kind === "practice-session").flatMap((x: any) => x.path.split("ids=")[1].split(","));
qids.push("2009h21a-q001", "2009h21a-q002", "2016h28h-q033", "2021r03-q010", "2024r06-q050", "2026r08-q001");
const now = Date.parse("2026-11-10T03:00:00Z");
const L = ["ア", "イ", "ウ", "エ"] as const;
const attempts: any = {};
qids.forEach((q, i) => { attempts[q] = [{ at: now - i * 3_600_000 * 7, choice: L[i % 4], correct: i % 3 !== 0, src: "practice" }]; });
const r = { ...emptyRecord(), attempts, unitsRead: { "management-08-25-u01": now - 86_400_000, "strategy-01-01-u01": now } };
const value = JSON.stringify(encodeRecord(r as any));
writeFileSync(process.argv[3], `if (localStorage.getItem(${JSON.stringify(LEARNING_STORAGE_KEY)}) === null) localStorage.setItem(${JSON.stringify(LEARNING_STORAGE_KEY)}, ${JSON.stringify(value)});\n`);
console.log(qids.length, value.length);
