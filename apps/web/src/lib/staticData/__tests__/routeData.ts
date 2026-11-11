// Test helper (not a test file): a StaticData whose fetch answers /data/… through the route handlers
// under src/app/data — the same bytes the build writes — so the browser-side resolvers run against the
// real corpus. `fail` makes chosen paths answer 500; `requests` lists every path fetched.

import { GET as cardsGET } from "@/app/data/glossary/[file]/route";
import { GET as todayGET } from "@/app/data/practice/[file]/route";
import { GET as examGET } from "@/app/data/quiz/[file]/route";
import { GET as indexGET } from "@/app/data/quiz/index.json/route";
import { GET as explGET } from "@/app/data/quiz-expl/[file]/route";
import { GET as senseiGET } from "@/app/data/sensei/[file]/route";
import { GET as unitsGET } from "@/app/data/textbook/[file]/route";

import { createStaticData, type StaticData } from "../client";

type Handler = (req: Request, ctx: { params: Promise<{ file: string }> }) => Promise<Response>;

const FAMILIES: Record<string, Handler> = {
  glossary: cardsGET,
  practice: todayGET,
  quiz: examGET,
  "quiz-expl": explGET,
  sensei: senseiGET,
  textbook: unitsGET,
};

export function routeData(fail: (path: string) => boolean = () => false): StaticData & { requests: string[] } {
  const requests: string[] = [];
  const data = createStaticData(async (path) => {
    requests.push(path);
    if (fail(path)) return new Response("{}", { status: 500 });
    if (path === "/data/quiz/index.json") return indexGET();
    const m = /^\/data\/([^/]+)\/([^/]+)$/.exec(path);
    const handler = m ? FAMILIES[m[1]!] : undefined;
    if (!m || !handler) return new Response("{}", { status: 404 });
    return handler(new Request(`http://localhost${path}`), { params: Promise.resolve({ file: m[2]! }) });
  });
  return Object.assign(data, { requests });
}
