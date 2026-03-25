import * as p from "@clack/prompts";
import { getAllProfiles, type ProfileInfo } from "../profiles.ts";
import { formatProfileOption } from "../utils.ts";

function isCancel(value: unknown): value is symbol {
  return p.isCancel(value);
}

export async function selectProfile(
  message: string,
  nameArg?: string,
): Promise<ProfileInfo | null> {
  const profiles = await getAllProfiles();

  if (profiles.length === 0) {
    p.log.warn("No profiles found. Create one first.");
    return null;
  }

  if (nameArg) {
    const match = profiles.find((prof) => prof.name === nameArg);
    if (!match) {
      p.log.error(
        `Profile "${nameArg}" not found. Available: ${profiles.map((p) => p.name).join(", ")}`,
      );
      return null;
    }
    return match;
  }

  const selected = await p.select({
    message,
    options: profiles.map((prof) => ({
      value: prof.dir,
      label: formatProfileOption(prof.dir, prof.email),
    })),
  });

  if (isCancel(selected)) {
    p.cancel("Cancelled.");
    return null;
  }

  return profiles.find((prof) => prof.dir === selected) ?? null;
}
