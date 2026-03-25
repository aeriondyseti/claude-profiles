import * as p from "@clack/prompts";
import { deleteProfile } from "../profiles.ts";
import { isActiveProfile, DEFAULT_PROFILE_NAME } from "../utils.ts";
import { selectProfile } from "./shared.ts";

function isCancel(value: unknown): value is symbol {
  return p.isCancel(value);
}

export async function deleteProfileCommand(nameArg?: string): Promise<void> {
  const profile = await selectProfile("Which profile to delete?", nameArg);
  if (!profile) return;

  if (profile.name === DEFAULT_PROFILE_NAME) {
    p.log.error(`Cannot delete the default profile.`);
    return;
  }

  if (isActiveProfile(profile.dir)) {
    p.log.error(
      `Cannot delete "${profile.name}" — it is the currently active profile.`,
    );
    return;
  }

  const confirmed = await p.confirm({
    message: `Delete profile "${profile.name}"? This will remove ${profile.dir} and all its contents.`,
    initialValue: false,
  });
  if (isCancel(confirmed) || !confirmed) {
    p.cancel("Cancelled.");
    return;
  }

  await deleteProfile(profile.dir);
  p.log.success(`Deleted profile "${profile.name}".`);
}
