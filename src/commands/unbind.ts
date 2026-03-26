import * as p from "@clack/prompts";
import { rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { PROFILE_FILENAME, parseProfileFile } from "../detect.ts";

export async function unbindCommand(pathArg?: string): Promise<void> {
  const dir = resolve(pathArg ?? process.cwd());
  const filePath = join(dir, PROFILE_FILENAME);

  const exists = await stat(filePath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    p.log.warn(`No ${PROFILE_FILENAME} found in ${dir}`);
    return;
  }

  const profileName = await parseProfileFile(filePath);
  await rm(filePath);

  if (profileName) {
    p.log.success(`Removed profile binding '${profileName}' from ${dir}`);
  } else {
    p.log.success(`Removed ${PROFILE_FILENAME} from ${dir}`);
  }
}
