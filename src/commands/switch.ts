import * as p from "@clack/prompts";
import pc from "picocolors";
import { selectProfile } from "./shared.ts";

export async function switchProfileCommand(nameArg?: string): Promise<void> {
  const profile = await selectProfile("Switch to which profile?", nameArg);
  if (!profile) return;

  p.log.info("To activate this profile, run:");
  p.log.message(
    pc.cyan(`export CLAUDE_CONFIG_DIR=${profile.dir}`),
  );
  p.log.info("Or add an alias to your shell config:");
  p.log.message(
    pc.cyan(
      `alias claude-${profile.name}='CLAUDE_CONFIG_DIR=${profile.dir} claude'`,
    ),
  );
}
