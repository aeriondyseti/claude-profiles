import * as p from "@clack/prompts";
import pc from "picocolors";
import { getAllProfiles } from "../profiles.ts";
import { isActiveProfile } from "../utils.ts";

export async function listProfiles(): Promise<void> {
  const profiles = await getAllProfiles();

  if (profiles.length === 0) {
    p.log.warn("No profiles found. Create one with `claude-profiles create`.");
    return;
  }

  p.log.info(pc.bold("Claude Code Profiles"));

  for (const profile of profiles) {
    const active = isActiveProfile(profile.dir);
    const marker = active ? pc.green("●") : pc.dim("○");
    const name = active ? pc.green(pc.bold(profile.name)) : profile.name;
    const details: string[] = [];
    if (profile.email) details.push(profile.email);
    // Only show org name if it's not just the email repeated
    if (profile.orgName && !profile.orgName.includes(profile.email ?? ""))
      details.push(profile.orgName);
    const detailStr = details.length > 0 ? pc.dim(` (${details.join(" — ")})`) : "";

    p.log.message(`${marker} ${name}${detailStr}`);
  }
}
