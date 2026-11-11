// D-217 H1-2 — /data/glossary/cards.<locale>.json: the term card of every term a question names,
// built at build time (lib/staticData termCardsFor picks a session's cards from it).
import { buildTermCardsFile } from "@/lib/staticData/build";
import { parseLocaleFile, STATIC_LOCALES } from "@/lib/staticData/shards";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { file: string }[] {
  return STATIC_LOCALES.map((l) => ({ file: `cards.${l}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const { file } = await params;
  const parsed = parseLocaleFile(file);
  if (!parsed || parsed[0] !== "cards") throw new Error(`unexpected file ${file}`);
  return Response.json(await buildTermCardsFile(parsed[1]));
}
