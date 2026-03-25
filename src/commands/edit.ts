import * as p from "@clack/prompts";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { selectProfile } from "./shared.ts";

export async function editProfileCommand(nameArg?: string): Promise<void> {
  const profile = await selectProfile("Which profile to edit?", nameArg);
  if (!profile) return;

  const settingsPath = join(profile.dir, "settings.json");
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";

  p.log.info(`Opening ${settingsPath} in ${editor}...`);

  try {
    execSync(`${editor} "${settingsPath}"`, { stdio: "inherit" });
    p.log.success("Settings updated.");
  } catch {
    p.log.error("Editor exited with an error.");
  }
}
