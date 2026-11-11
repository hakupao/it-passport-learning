// D-217 H1-2 — /data/quiz/index.json, built once at build time (lib/staticData).
import { buildQuizIndexFile } from "@/lib/staticData/build";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return Response.json(await buildQuizIndexFile());
}
