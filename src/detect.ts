import { readFile } from "node:fs/promises";
import { join, dirname, parse as parsePath } from "node:path";
import { parse as parseToml } from "smol-toml";

export const PROFILE_FILENAME = ".claude-profile";

export interface DetectedProfile {
  name: string;
  filePath: string;
}

export async function parseProfileFile(
  filePath: string,
): Promise<string | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = parseToml(raw);
    const profile = data.profile;
    if (typeof profile === "string" && profile.trim()) {
      return profile.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export async function detectProfile(): Promise<DetectedProfile | null> {
  let dir = process.cwd();

  while (true) {
    const filePath = join(dir, PROFILE_FILENAME);
    const name = await parseProfileFile(filePath);
    if (name) {
      return { name, filePath };
    }

    const parent = dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }

  return null;
}
