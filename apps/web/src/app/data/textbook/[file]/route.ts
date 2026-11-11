// D-217 H1-2 — /data/textbook/units.<locale>.json: each unit's title + terms (a from=unit practice
// session, resolveSessionFrom), built at build time.
import { buildUnitsFile } from "@/lib/staticData/build";
import { parseLocaleFile, STATIC_LOCALES } from "@/lib/staticData/shards";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { file: string }[] {
  return STATIC_LOCALES.map((l) => ({ file: `units.${l}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const { file } = await params;
  const parsed = parseLocaleFile(file);
  if (!parsed || parsed[0] !== "units") throw new Error(`unexpected file ${file}`);
  return Response.json(await buildUnitsFile(parsed[1]));
}
