import { homedir } from "node:os";
import { join, basename } from "node:path";
import { readdir, stat } from "node:fs/promises";
import pc from "picocolors";

export const HOME = homedir();
export const CLAUDE_DIR_PREFIX = ".claude-";
export const EXCLUDED_DIRS = new Set(["worktrees"]);

export function getProfileDir(name: string): string {
  return join(HOME, `${CLAUDE_DIR_PREFIX}${name}`);
}

export function profileNameFromDir(dir: string): string {
  return basename(dir).replace(CLAUDE_DIR_PREFIX, "");
}

export function getActiveProfileDir(): string | null {
  return process.env.CLAUDE_CONFIG_DIR || null;
}

export function isActiveProfile(dir: string): boolean {
  const active = getActiveProfileDir();
  if (!active) return false;
  // Normalize ~ and trailing slashes
  const normalize = (p: string) =>
    p.replace(/^~/, HOME).replace(/\/+$/, "");
  return normalize(active) === normalize(dir);
}

export async function discoverProfiles(): Promise<string[]> {
  const entries = await readdir(HOME);
  const profiles: string[] = [];

  for (const entry of entries) {
    if (!entry.startsWith(CLAUDE_DIR_PREFIX)) continue;
    const name = entry.slice(CLAUDE_DIR_PREFIX.length);
    if (EXCLUDED_DIRS.has(name)) continue;

    const fullPath = join(HOME, entry);
    const s = await stat(fullPath).catch(() => null);
    if (s?.isDirectory()) {
      profiles.push(fullPath);
    }
  }

  return profiles.sort();
}

export function formatProfileName(dir: string): string {
  const name = profileNameFromDir(dir);
  const active = isActiveProfile(dir);
  return active ? pc.green(`${name} (active)`) : name;
}

export function formatProfileOption(
  dir: string,
  email?: string | null,
): string {
  const name = profileNameFromDir(dir);
  const active = isActiveProfile(dir);
  const parts: string[] = [name];
  if (email) parts.push(pc.dim(`(${email})`));
  if (active) parts.push(pc.green("● active"));
  return parts.join(" ");
}
