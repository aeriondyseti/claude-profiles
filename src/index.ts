import * as p from "@clack/prompts";
import pc from "picocolors";
import { listProfiles } from "./commands/list.ts";
import { createProfileCommand } from "./commands/create.ts";
import { editProfileCommand } from "./commands/edit.ts";
import { cloneProfileCommand } from "./commands/clone.ts";
import { deleteProfileCommand } from "./commands/delete.ts";
import { switchProfileCommand } from "./commands/switch.ts";
import { runProfileCommand } from "./commands/run.ts";
import { bindProfileCommand } from "./commands/bind.ts";
import { unbindCommand } from "./commands/unbind.ts";

function isCancel(value: unknown): value is symbol {
  return p.isCancel(value);
}

export async function main(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" claude-profiles ")));

  while (true) {
    const action = await p.select({
      message: "What would you like to do?",
      options: [
        { value: "list", label: "List profiles" },
        { value: "create", label: "Create profile" },
        { value: "edit", label: "Edit profile" },
        { value: "clone", label: "Clone profile" },
        { value: "delete", label: "Delete profile" },
        { value: "switch", label: "Switch active profile" },
        { value: "run", label: "Run Claude with profile" },
        { value: "bind", label: "Bind profile to directory" },
        { value: "unbind", label: "Unbind profile from directory" },
        { value: "exit", label: "Exit" },
      ],
    });

    if (isCancel(action) || action === "exit") {
      p.outro("Goodbye!");
      return;
    }

    switch (action) {
      case "list":
        await listProfiles();
        break;
      case "create":
        await createProfileCommand();
        break;
      case "edit":
        await editProfileCommand();
        break;
      case "clone":
        await cloneProfileCommand();
        break;
      case "delete":
        await deleteProfileCommand();
        break;
      case "switch":
        await switchProfileCommand();
        break;
      case "run":
        await runProfileCommand();
        break;
      case "bind":
        await bindProfileCommand();
        break;
      case "unbind":
        await unbindCommand();
        break;
    }
  }
}
