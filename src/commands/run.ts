import * as p from "@clack/prompts";
import { execFileSync } from "node:child_process";
import { selectProfile } from "./shared.ts";

export async function runProfileCommand(
  nameArg?: string,
  extraArgs: string[] = [],
): Promise<void> {
  const profile = await selectProfile("Run Claude with which profile?", nameArg);
  if (!profile) return;

  const claudeCmd = "claude";
  p.log.info(
    `Running: CLAUDE_CONFIG_DIR=${profile.dir} ${claudeCmd} ${extraArgs.join(" ")}`,
  );

  try {
    execFileSync(claudeCmd, extraArgs, {
      stdio: "inherit",
      env: {
        ...process.env,
        CLAUDE_CONFIG_DIR: profile.dir,
      },
    });
  } catch (err: unknown) {
    const code = (err as { status?: number }).status;
    if (code !== null && code !== undefined) {
      process.exit(code);
    }
  }
}
