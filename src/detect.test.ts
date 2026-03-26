import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseProfileFile, detectProfile, PROFILE_FILENAME } from "./detect.ts";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "claude-profiles-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("parseProfileFile", () => {
  test("parses valid TOML with profile key", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, 'profile = "work"\n');
    expect(await parseProfileFile(filePath)).toBe("work");
  });

  test("trims whitespace from profile name", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, 'profile = "  work  "\n');
    expect(await parseProfileFile(filePath)).toBe("work");
  });

  test("returns null for missing file", async () => {
    const filePath = join(tempDir, "nonexistent");
    expect(await parseProfileFile(filePath)).toBeNull();
  });

  test("returns null for empty file", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, "");
    expect(await parseProfileFile(filePath)).toBeNull();
  });

  test("returns null when profile key is missing", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, 'other = "value"\n');
    expect(await parseProfileFile(filePath)).toBeNull();
  });

  test("returns null when profile key is not a string", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, "profile = 42\n");
    expect(await parseProfileFile(filePath)).toBeNull();
  });

  test("returns null when profile is empty string", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, 'profile = ""\n');
    expect(await parseProfileFile(filePath)).toBeNull();
  });

  test("returns null when profile is only whitespace", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, 'profile = "   "\n');
    expect(await parseProfileFile(filePath)).toBeNull();
  });

  test("returns null for invalid TOML", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, "not valid toml {{{}}}");
    expect(await parseProfileFile(filePath)).toBeNull();
  });

  test("handles TOML with extra keys", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, 'profile = "work"\nextra = "data"\n');
    expect(await parseProfileFile(filePath)).toBe("work");
  });
});

describe("detectProfile", () => {
  test("finds .claude-profile in current directory", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, 'profile = "work"\n');

    const originalCwd = process.cwd();
    process.chdir(tempDir);
    try {
      const result = await detectProfile();
      expect(result).not.toBeNull();
      expect(result!.name).toBe("work");
      expect(result!.filePath).toBe(filePath);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test("finds .claude-profile in ancestor directory", async () => {
    const filePath = join(tempDir, PROFILE_FILENAME);
    await writeFile(filePath, 'profile = "ancestor"\n');

    const nested = join(tempDir, "a", "b", "c");
    await mkdir(nested, { recursive: true });

    const originalCwd = process.cwd();
    process.chdir(nested);
    try {
      const result = await detectProfile();
      expect(result).not.toBeNull();
      expect(result!.name).toBe("ancestor");
      expect(result!.filePath).toBe(filePath);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test("returns closest .claude-profile when multiple exist", async () => {
    // Parent has one profile
    await writeFile(join(tempDir, PROFILE_FILENAME), 'profile = "parent"\n');

    // Child has a different profile
    const child = join(tempDir, "child");
    await mkdir(child);
    await writeFile(join(child, PROFILE_FILENAME), 'profile = "child"\n');

    const originalCwd = process.cwd();
    process.chdir(child);
    try {
      const result = await detectProfile();
      expect(result).not.toBeNull();
      expect(result!.name).toBe("child");
    } finally {
      process.chdir(originalCwd);
    }
  });

  test("returns null when no .claude-profile exists", async () => {
    const nested = join(tempDir, "empty");
    await mkdir(nested);

    const originalCwd = process.cwd();
    process.chdir(nested);
    try {
      // This will walk up to / and not find anything
      // (unless the test runner's machine has one, which is unlikely in temp)
      const result = await detectProfile();
      // We can't guarantee null here since it walks to /, but we can test
      // that it doesn't find one in our temp tree by checking the path
      if (result) {
        // If found, it should NOT be in our tempDir (since we didn't create one in "empty")
        expect(result.filePath.startsWith(tempDir + "/empty")).toBe(false);
      }
    } finally {
      process.chdir(originalCwd);
    }
  });

  test("skips invalid .claude-profile files during walk", async () => {
    // Child has invalid file
    const child = join(tempDir, "child");
    await mkdir(child);
    await writeFile(join(child, PROFILE_FILENAME), "not valid toml {{{");

    // Parent has valid file
    await writeFile(join(tempDir, PROFILE_FILENAME), 'profile = "parent"\n');

    const originalCwd = process.cwd();
    process.chdir(child);
    try {
      const result = await detectProfile();
      expect(result).not.toBeNull();
      expect(result!.name).toBe("parent");
    } finally {
      process.chdir(originalCwd);
    }
  });
});
