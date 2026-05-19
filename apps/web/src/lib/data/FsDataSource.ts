// D-089 §2.1 α-now default implementation of DataSource.
// Reads v1.0.3 corpus from local filesystem (or Vercel deploy artifact).
//
// Resolution order for the corpus root:
//   1. options.dataPath (constructor arg) — explicit override (tests)
//   2. process.env.DATA_PATH                — runtime override (prod)
//   3. <cwd>/_fixtures/v1.0.3              — default (apps/web fixture per Q3=a)
//
// Index + glossary are eager-loaded on first call and cached in-memory per
// D-089 §2.1. Page reads are lazy (no cache yet — LRU deferred to Step 8+ retro).

import { promises as fs } from "node:fs";
import path from "node:path";

import type { DataSource } from "./DataSource";
import type { Glossary, IndexV2, Page } from "./types";

export interface FsDataSourceOptions {
  /** Override the corpus root. Falls back to env var then to apps/web fixture. */
  dataPath?: string;
}

const DEFAULT_FIXTURE_REL = "_fixtures/v1.0.3";

export class FsDataSource implements DataSource {
  private readonly dataPath: string;
  private indexCache: IndexV2 | null = null;
  private glossaryCache: Glossary | null = null;

  constructor(options: FsDataSourceOptions = {}) {
    this.dataPath =
      options.dataPath ??
      process.env.DATA_PATH ??
      path.resolve(process.cwd(), DEFAULT_FIXTURE_REL);
  }

  /** Exposed for diagnostics + test assertions. */
  getDataPath(): string {
    return this.dataPath;
  }

  async loadIndex(): Promise<IndexV2> {
    if (this.indexCache) return this.indexCache;
    const file = path.join(this.dataPath, "index.v2.json");
    const json = await this.readJson<IndexV2>(file);
    if (json.schema_version !== "v2") {
      throw new Error(
        `FsDataSource: expected schema_version "v2" at ${file}, got "${json.schema_version}"`,
      );
    }
    this.indexCache = json;
    return json;
  }

  async loadPage(pageId: number): Promise<Page> {
    const file = path.join(this.dataPath, "pages", `page_${pad3(pageId)}.json`);
    try {
      return await this.readJson<Page>(file);
    } catch (err) {
      if (isEnoent(err)) {
        throw new Error(`FsDataSource: page ${pageId} not found at ${file}`);
      }
      throw err;
    }
  }

  async loadChapter(chapterId: string): Promise<Page[]> {
    const idx = await this.loadIndex();
    const chapter = idx.chapters.find((c) => c.chapter_id === chapterId);
    if (!chapter) return [];
    const pageRefs = idx.pages
      .filter((p) => p.page >= chapter.first_page && p.page <= chapter.last_page)
      .sort((a, b) => a.page - b.page);
    return Promise.all(pageRefs.map((ref) => this.loadPage(ref.page)));
  }

  async loadGlossary(): Promise<Glossary> {
    if (this.glossaryCache) return this.glossaryCache;
    const file = path.join(this.dataPath, "glossary.json");
    const json = await this.readJson<Glossary>(file);
    this.glossaryCache = json;
    return json;
  }

  async loadWholeBook(): Promise<Page[]> {
    const idx = await this.loadIndex();
    const sorted = [...idx.pages].sort((a, b) => a.page - b.page);
    return Promise.all(sorted.map((ref) => this.loadPage(ref.page)));
  }

  private async readJson<T>(file: string): Promise<T> {
    const buf = await fs.readFile(file, "utf-8");
    return JSON.parse(buf) as T;
  }
}

function pad3(n: number): string {
  return n.toString().padStart(3, "0");
}

function isEnoent(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "ENOENT"
  );
}
