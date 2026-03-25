import * as p from "@clack/prompts";
import { createProfile, getAllProfiles, readSettings } from "../profiles.ts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

function isCancel(value: unknown): value is symbol {
  return p.isCancel(value);
}

export async function createProfileCommand(nameArg?: string): Promise<void> {
  let name = nameArg;

  if (!name) {
    const input = await p.text({
      message: "Profile name:",
      placeholder: "e.g. work, personal, testing",
      validate(value) {
        if (!value.trim()) return "Name is required";
        if (!/^[a-zA-Z0-9_-]+$/.test(value))
          return "Name must be alphanumeric (hyphens and underscores allowed)";
        return undefined;
      },
    });
    if (isCancel(input)) {
      p.cancel("Cancelled.");
      return;
    }
    name = input;
  }

  const profiles = await getAllProfiles();

  let copyFrom: string | null = null;
  if (profiles.length > 0) {
    const copy = await p.select({
      message: "Copy settings from an existing profile?",
      options: [
        { value: "__none__", label: "No, start fresh" },
        ...profiles.map((prof) => ({
          value: prof.dir,
          label: prof.name,
        })),
      ],
    });
    if (isCancel(copy)) {
      p.cancel("Cancelled.");
      return;
    }
    if (copy !== "__none__") {
      copyFrom = copy as string;
    }
  }

  const dir = await createProfile(name);

  if (copyFrom) {
    const settings = await readSettings(copyFrom);
    if (settings) {
      await writeFile(
        join(dir, "settings.json"),
        JSON.stringify(settings, null, 2) + "\n",
      );
    }
  }

  p.log.success(
    `Created profile "${name}" at ${dir}`,
  );
  p.log.info(
    `Run with: CLAUDE_CONFIG_DIR=${dir} claude`,
  );
}
