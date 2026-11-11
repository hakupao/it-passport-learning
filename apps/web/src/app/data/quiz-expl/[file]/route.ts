// D-217 H1-2 — /data/quiz-expl/<examId>-<chunk>.json: the explanations (all three languages: the
// explanation's 日/中/EN switch is independent of the page locale) of one exam's chunk of questions
// (lib/staticData explChunkOf), built at build time.
import { buildExplanationShard, explanationChunks } from "@/lib/staticData/build";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ file: string }[]> {
  return (await explanationChunks()).map(([e, c]) => ({ file: `${e}-${c}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const { file } = await params;
  const m = /^(.+)-(\d+)\.json$/.exec(file);
  if (!m) throw new Error(`unexpected file ${file}`);
  return Response.json(await buildExplanationShard(m[1]!, Number(m[2])));
}
