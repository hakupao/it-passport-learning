// D-217 H1-2 — /data/quiz/<examId>.<locale>.json: one exam's questions (lib/staticData), built at build time.
import { buildExamShard, examIds } from "@/lib/staticData/build";
import { parseLocaleFile, STATIC_LOCALES } from "@/lib/staticData/shards";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ file: string }[]> {
  return (await examIds()).flatMap((e) => STATIC_LOCALES.map((l) => ({ file: `${e}.${l}.json` })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const { file } = await params;
  const parsed = parseLocaleFile(file);
  if (!parsed) throw new Error(`unexpected file ${file}`);
  return Response.json(await buildExamShard(...parsed));
}
