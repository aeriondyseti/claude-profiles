import { join } from "node:path";
import {
  readFile,
  writeFile,
  mkdir,
  rm,
  readdir,
  copyFile,
  stat,
} from "node:fs/promises";
import { getProfileDir, discoverProfiles, profileNameFromDir } from "./utils.ts";

export interface ProfileInfo {
  name: string;
  dir: string;
  email: string | null;
  orgName: string | null;
  hasSettings: boolean;
}

async function exists(path: string): Promise<boolean> {
  return stat(path)
    .then(() => true)
    .catch(() => false);
}

export async function readClaudeJson(
  dir: string,
): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readFile(join(dir, ".claude.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function readSettings(
  dir: string,
): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readFile(join(dir, "settings.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getProfileInfo(dir: string): Promise<ProfileInfo> {
  const claudeJson = await readClaudeJson(dir);
  const settings = await readSettings(dir);
  const oauth = claudeJson?.oauthAccount as
    | Record<string, unknown>
    | undefined;

  return {
    name: profileNameFromDir(dir),
    dir,
    email: (oauth?.emailAddress as string) ?? null,
    orgName: (oauth?.organizationName as string) ?? null,
    hasSettings: settings !== null,
  };
}

export async function getAllProfiles(): Promise<ProfileInfo[]> {
  const dirs = await discoverProfiles();
  return Promise.all(dirs.map(getProfileInfo));
}

export async function createProfile(name: string): Promise<string> {
  const dir = getProfileDir(name);
  if (await exists(dir)) {
    throw new Error(`Profile "${name}" already exists at ${dir}`);
  }
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "settings.json"), "{}\n");
  return dir;
}

// Directories and files to copy when cloning (config-only, no session data)
const CLONE_ITEMS = [
  "settings.json",
  "CLAUDE.md",
  "commands",
  "hooks",
  "agents",
  "skills",
  "output-styles",
];

async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

export async function cloneProfile(
  sourceDir: string,
  newName: string,
): Promise<string> {
  const destDir = getProfileDir(newName);
  if (await exists(destDir)) {
    throw new Error(`Profile "${newName}" already exists at ${destDir}`);
  }
  await mkdir(destDir, { recursive: true });

  for (const item of CLONE_ITEMS) {
    const srcPath = join(sourceDir, item);
    const destPath = join(destDir, item);
    const s = await stat(srcPath).catch(() => null);
    if (!s) continue;

    if (s.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }

  return destDir;
}

export async function deleteProfile(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

export async function profileExists(name: string): Promise<boolean> {
  return exists(getProfileDir(name));
}
