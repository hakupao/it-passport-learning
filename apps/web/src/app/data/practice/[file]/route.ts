// D-217 H1-2 — /data/practice/today.<locale>.json: loadTodayIndex(locale), built at build time
// (the setup index is lib/staticData setupFromToday of it).
import { buildTodayFile } from "@/lib/staticData/build";
import { parseLocaleFile, STATIC_LOCALES } from "@/lib/staticData/shards";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { file: string }[] {
  return STATIC_LOCALES.map((l) => ({ file: `today.${l}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const { file } = await params;
  const parsed = parseLocaleFile(file);
  if (!parsed || parsed[0] !== "today") throw new Error(`unexpected file ${file}`);
  return Response.json(await buildTodayFile(parsed[1]));
}
