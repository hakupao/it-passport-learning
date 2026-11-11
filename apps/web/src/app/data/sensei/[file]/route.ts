// D-217 H1-2 — /data/sensei/terms-<h>.<locale>.json: the AI 先生 term contexts (what the
// former GET /api/sensei/terms returned) of every dictionary term whose termId starts with hex digit <h>,
// built at build time.
import { buildSenseiTermsFile } from "@/lib/staticData/build";
import { parseLocaleFile, SENSEI_SHARDS, STATIC_LOCALES } from "@/lib/staticData/shards";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { file: string }[] {
  return SENSEI_SHARDS.flatMap((s) => STATIC_LOCALES.map((l) => ({ file: `terms-${s}.${l}.json` })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const { file } = await params;
  const parsed = parseLocaleFile(file);
  const m = parsed && /^terms-([0-9a-f])$/.exec(parsed[0]);
  if (!parsed || !m) throw new Error(`unexpected file ${file}`);
  return Response.json(await buildSenseiTermsFile(m[1]!, parsed[1]));
}
