import { describe, test, expect } from "bun:test";
import { defaultSettings } from "./profiles.ts";

describe("defaultSettings", () => {
  test("includes env with all three default vars", () => {
    const settings = defaultSettings("test-profile");
    const env = settings.env as Record<string, string>;
    expect(env).toBeDefined();
    expect(env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS).toBe("1");
    expect(env.ENABLE_CLAUDEAI_MCP_SERVERS).toBe("false");
    expect(env.CLAUDE_CODE_DISABLE_AUTO_MEMORY).toBe("1");
  });

  test("includes exactly three env vars", () => {
    const settings = defaultSettings("test");
    const env = settings.env as Record<string, string>;
    expect(Object.keys(env)).toHaveLength(3);
  });

  test("includes SessionStart hook with profile name", () => {
    const settings = defaultSettings("my-work");
    const hooks = settings.hooks as Record<string, unknown[]>;
    expect(hooks).toBeDefined();
    expect(hooks.SessionStart).toBeArray();

    const hookEntry = hooks.SessionStart[0] as Record<string, unknown>;
    const hookList = hookEntry.hooks as Array<Record<string, string>>;
    expect(hookList[0].command).toContain("my-work");
  });

  test("embeds profile name in hook command", () => {
    const settings = defaultSettings("special");
    const hooks = settings.hooks as Record<string, unknown[]>;
    const hookEntry = hooks.SessionStart[0] as Record<string, unknown>;
    const hookList = hookEntry.hooks as Array<Record<string, string>>;
    expect(hookList[0].command).toContain("'special'");
  });

  test("returns a new object each time", () => {
    const a = defaultSettings("test");
    const b = defaultSettings("test");
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
