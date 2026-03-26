import * as p from "@clack/prompts";
import { writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { stringify } from "smol-toml";
import { selectProfile } from "./shared.ts";
import { profileExists } from "../profiles.ts";
import { PROFILE_FILENAME } from "../detect.ts";

function isCancel(value: unknown): value is symbol {
  return p.isCancel(value);
}

export async function bindProfileCommand(
  nameArg?: string,
  pathArg?: string,
): Promise<void> {
  let profileName: string;

  if (nameArg) {
    if (!(await profileExists(nameArg))) {
      p.log.error(`Profile "${nameArg}" does not exist.`);
      return;
    }
    profileName = nameArg;
  } else {
    const profile = await selectProfile("Bind which profile to this directory?");
    if (!profile) return;
    profileName = profile.name;
  }

  const dir = resolve(pathArg ?? process.cwd());
  const filePath = join(dir, PROFILE_FILENAME);

  // Check if file already exists
  const exists = await stat(filePath)
    .then(() => true)
    .catch(() => false);

  if (exists && !nameArg) {
    const overwrite = await p.confirm({
      message: `${filePath} already exists. Overwrite?`,
      initialValue: false,
    });
    if (isCancel(overwrite) || !overwrite) {
      p.cancel("Cancelled.");
      return;
    }
  }

  const content = stringify({ profile: profileName });
  await writeFile(filePath, content + "\n");

  p.log.success(`Bound profile '${profileName}' to ${dir}`);
}
