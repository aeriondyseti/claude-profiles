import * as p from "@clack/prompts";
import { execFileSync } from "node:child_process";
import { selectProfile } from "./shared.ts";
import { detectProfile } from "../detect.ts";

export async function runProfileCommand(
  nameArg?: string,
  extraArgs: string[] = [],
): Promise<void> {
  let effectiveName = nameArg;

  if (!effectiveName) {
    const detected = await detectProfile();
    if (detected) {
      p.log.info(
        `Using profile '${detected.name}' (from ${detected.filePath})`,
      );
      effectiveName = detected.name;
    }
  }

  const profile = await selectProfile("Run Claude with which profile?", effectiveName);
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
