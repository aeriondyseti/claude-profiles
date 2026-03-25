import * as p from "@clack/prompts";
import { cloneProfile } from "../profiles.ts";
import { selectProfile } from "./shared.ts";

function isCancel(value: unknown): value is symbol {
  return p.isCancel(value);
}

export async function cloneProfileCommand(
  sourceArg?: string,
  nameArg?: string,
): Promise<void> {
  const source = await selectProfile("Which profile to clone?", sourceArg);
  if (!source) return;

  let name = nameArg;
  if (!name) {
    const input = await p.text({
      message: "New profile name:",
      placeholder: `e.g. ${source.name}-copy`,
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

  try {
    const dir = await cloneProfile(source.dir, name);
    p.log.success(`Cloned "${source.name}" → "${name}" at ${dir}`);
    p.log.info(
      "Cloned: settings.json, CLAUDE.md, commands/, hooks/, agents/, skills/, output-styles/",
    );
    p.log.info("Excluded: sessions, history, auth state (.claude.json)");
  } catch (err) {
    p.log.error(String(err));
  }
}
