#!/usr/bin/env bun

import { main } from "./index.ts";
import { listProfiles } from "./commands/list.ts";
import { createProfileCommand } from "./commands/create.ts";
import { editProfileCommand } from "./commands/edit.ts";
import { cloneProfileCommand } from "./commands/clone.ts";
import { deleteProfileCommand } from "./commands/delete.ts";
import { switchProfileCommand } from "./commands/switch.ts";
import { runProfileCommand } from "./commands/run.ts";
import { bindProfileCommand } from "./commands/bind.ts";
import { unbindCommand } from "./commands/unbind.ts";

const args = process.argv.slice(2);
const command = args[0];

async function run(): Promise<void> {
  switch (command) {
    case "list":
    case "ls":
      await listProfiles();
      break;

    case "create":
    case "new":
      await createProfileCommand(args[1]);
      break;

    case "edit":
      await editProfileCommand(args[1]);
      break;

    case "clone":
    case "cp":
      await cloneProfileCommand(args[1], args[2]);
      break;

    case "delete":
    case "rm":
      await deleteProfileCommand(args[1]);
      break;

    case "switch":
    case "use":
      await switchProfileCommand(args[1]);
      break;

    case "run":
    case "exec": {
      const dashDash = args.indexOf("--");
      const profileName = args[1];
      const extraArgs = dashDash >= 0 ? args.slice(dashDash + 1) : [];
      await runProfileCommand(profileName, extraArgs);
      break;
    }

    case "bind":
      await bindProfileCommand(args[1], args[2]);
      break;

    case "unbind":
      await unbindCommand(args[1]);
      break;

    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;

    case undefined:
      // No command — launch interactive TUI
      await main();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
claude-profiles — Manage Claude Code profiles

Usage:
  claude-profiles                          Interactive TUI
  claude-profiles list                     List all profiles
  claude-profiles create [name]            Create a new profile
  claude-profiles edit [name]              Edit profile settings.json
  claude-profiles clone [source] [name]    Clone a profile
  claude-profiles delete [name]            Delete a profile
  claude-profiles switch [name]            Show how to activate a profile
  claude-profiles run [name] [-- args]     Run Claude with a specific profile
  claude-profiles bind [name] [path]       Bind a profile to a directory (.claude-profile)
  claude-profiles unbind [path]            Remove .claude-profile from a directory

Aliases:
  ls = list, new = create, cp = clone,
  rm = delete, use = switch, exec = run
`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
