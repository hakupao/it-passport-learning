// Stage 7 Phase 3 (whole-branch review Minor-5) — chumonMembers resolves the registry on its own
// (nft isolation); it must stay the file quizReader's quizDataRoot() points at.
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { quizDataRoot } from "../../quiz/quizReader";
import { loadChumonMembers, registryFile } from "../chumonMembers";

const prev = process.env.QUIZ_DATA_ROOT;
afterEach(() => {
  if (prev === undefined) delete process.env.QUIZ_DATA_ROOT;
  else process.env.QUIZ_DATA_ROOT = prev;
});

describe("chumonMembers registryFile", () => {
  it("equals quizDataRoot()/chumon_groups.json without QUIZ_DATA_ROOT", () => {
    delete process.env.QUIZ_DATA_ROOT;
    expect(registryFile()).toBe(path.join(quizDataRoot(), "chumon_groups.json"));
  });

  it("equals quizDataRoot()/chumon_groups.json with QUIZ_DATA_ROOT", () => {
    process.env.QUIZ_DATA_ROOT = "/somewhere/data/ip";
    expect(registryFile()).toBe(path.join(quizDataRoot(), "chumon_groups.json"));
    expect(registryFile()).toBe("/somewhere/data/ip/quiz/chumon_groups.json");
  });

  it("loads the real member set", async () => {
    expect((await loadChumonMembers()).size).toBe(200);
  });
});
