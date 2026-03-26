import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import {
  getProfileDir,
  profileNameFromDir,
  getActiveProfileDir,
  isActiveProfile,
  HOME,
  CLAUDE_DIR_PREFIX,
  DEFAULT_PROFILE_NAME,
  DEFAULT_PROFILE_DIR,
} from "./utils.ts";
import { join } from "node:path";

describe("getProfileDir", () => {
  test("returns ~/.claude for default profile", () => {
    expect(getProfileDir("default")).toBe(join(HOME, ".claude"));
  });

  test("returns ~/.claude-<name> for named profiles", () => {
    expect(getProfileDir("work")).toBe(join(HOME, ".claude-work"));
  });

  test("handles hyphens in profile names", () => {
    expect(getProfileDir("my-project")).toBe(join(HOME, ".claude-my-project"));
  });

  test("handles underscores in profile names", () => {
    expect(getProfileDir("my_project")).toBe(join(HOME, ".claude-my_project"));
  });
});

describe("profileNameFromDir", () => {
  test("returns 'default' for ~/.claude", () => {
    expect(profileNameFromDir(DEFAULT_PROFILE_DIR)).toBe("default");
  });

  test("returns 'default' for any path ending in .claude", () => {
    expect(profileNameFromDir("/some/path/.claude")).toBe("default");
  });

  test("extracts name from ~/.claude-<name> path", () => {
    expect(profileNameFromDir(join(HOME, ".claude-work"))).toBe("work");
  });

  test("extracts hyphenated names correctly", () => {
    expect(profileNameFromDir(join(HOME, ".claude-my-project"))).toBe(
      "my-project",
    );
  });
});

describe("getActiveProfileDir", () => {
  const originalEnv = process.env.CLAUDE_CONFIG_DIR;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CLAUDE_CONFIG_DIR = originalEnv;
    } else {
      delete process.env.CLAUDE_CONFIG_DIR;
    }
  });

  test("returns null when CLAUDE_CONFIG_DIR is not set", () => {
    delete process.env.CLAUDE_CONFIG_DIR;
    expect(getActiveProfileDir()).toBeNull();
  });

  test("returns null when CLAUDE_CONFIG_DIR is empty", () => {
    process.env.CLAUDE_CONFIG_DIR = "";
    expect(getActiveProfileDir()).toBeNull();
  });

  test("returns the value of CLAUDE_CONFIG_DIR", () => {
    process.env.CLAUDE_CONFIG_DIR = "/home/user/.claude-work";
    expect(getActiveProfileDir()).toBe("/home/user/.claude-work");
  });
});

describe("isActiveProfile", () => {
  const originalEnv = process.env.CLAUDE_CONFIG_DIR;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CLAUDE_CONFIG_DIR = originalEnv;
    } else {
      delete process.env.CLAUDE_CONFIG_DIR;
    }
  });

  test("returns false when no profile is active", () => {
    delete process.env.CLAUDE_CONFIG_DIR;
    expect(isActiveProfile(join(HOME, ".claude-work"))).toBe(false);
  });

  test("returns true for matching profile dir", () => {
    const dir = join(HOME, ".claude-work");
    process.env.CLAUDE_CONFIG_DIR = dir;
    expect(isActiveProfile(dir)).toBe(true);
  });

  test("returns false for non-matching profile dir", () => {
    process.env.CLAUDE_CONFIG_DIR = join(HOME, ".claude-work");
    expect(isActiveProfile(join(HOME, ".claude-personal"))).toBe(false);
  });

  test("normalizes trailing slashes", () => {
    const dir = join(HOME, ".claude-work");
    process.env.CLAUDE_CONFIG_DIR = dir + "/";
    expect(isActiveProfile(dir)).toBe(true);
  });

  test("normalizes tilde in env var", () => {
    process.env.CLAUDE_CONFIG_DIR = "~/.claude-work";
    expect(isActiveProfile(join(HOME, ".claude-work"))).toBe(true);
  });
});

describe("constants", () => {
  test("HOME is set", () => {
    expect(HOME).toBeTruthy();
  });

  test("CLAUDE_DIR_PREFIX is .claude-", () => {
    expect(CLAUDE_DIR_PREFIX).toBe(".claude-");
  });

  test("DEFAULT_PROFILE_NAME is 'default'", () => {
    expect(DEFAULT_PROFILE_NAME).toBe("default");
  });

  test("DEFAULT_PROFILE_DIR is HOME/.claude", () => {
    expect(DEFAULT_PROFILE_DIR).toBe(join(HOME, ".claude"));
  });
});
