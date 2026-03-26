# Roadmap

Planned features for `claude-profiles`, roughly in priority order.

---

## 1. Directory-Aware Profile Selection

**`.claude-profile` auto-detection**

Drop a `.claude-profile` file in a repo root (or any directory) naming which profile to use. `claude-profiles run` without a name argument walks up the directory tree looking for this file and activates the matching profile automatically. Similar to `.nvmrc` or `.python-version`.

**`bind <name> [path]`** — Write a `.claude-profile` file associating the current (or given) directory with a profile. `unbind` removes it.

## 2. Shell Integration

**`shell-init`** — Emit a block of shell code (for `.bashrc`/`.zshrc`/`config.fish`) that:
- Auto-generates aliases for every profile (`claude-work`, `claude-personal`, etc.)
- Adds tab-completion for commands and profile names
- Optionally reads `.claude-profile` to auto-set `CLAUDE_CONFIG_DIR` on `cd`
- Supports prompt integration via [Oh My Posh](https://ohmyposh.dev/) — e.g., expose the active profile name as an environment variable (`CLAUDE_PROFILE`) that an Oh My Posh segment can display

**`activate <name>`** — A wrapper meant to be `eval`'d (`eval "$(claude-profiles activate work)"`) that sets `CLAUDE_CONFIG_DIR` in the current shell, rather than just printing instructions like `switch` does today.

## 3. Comprehensive Settings Management

**`get <name> <key>` / `set <name> <key> <value>`** — Read/write individual settings without opening an editor. Supports dot-notation for nested keys. E.g., `claude-profiles set work model claude-sonnet-4-6`.

**`permissions <name>`** — View and interactively toggle permission rules for a profile. Permissions are one of the most-tweaked settings and editing raw JSON for them is error-prone.

**`mcp <name> list|add|remove`** — Manage MCP server configs per profile. These are complex JSON blocks that are painful to hand-edit.

## 4. Profile Comparison

**`diff <a> <b>`** — Side-by-side diff of settings, hooks, permissions, and MCP servers between two profiles. When managing several profiles it's hard to remember how they diverge.

## 5. Rename

**`rename <old> <new>`** — Rename a profile (moves `~/.claude-old` to `~/.claude-new`, updates the session-start hook). Currently the only way to rename is clone + delete.

## 6. Profile Inspection & Diagnostics

**`inspect <name>`** — Detailed view of a single profile: settings summary, configured hooks, MCP servers, custom commands, disk usage, last session timestamp, number of projects.

**`validate <name>`** — Check a profile's `settings.json` for structural issues, unknown keys, or misconfigured hooks/MCP entries. Catches typos before they silently fail.

## 7. Authentication & Identity

**`login <name>`** — Launch Claude's auth flow for a specific profile, streamlining onboarding of new profiles.

**`status`** — Show auth health per profile: logged in or not, which org/email, token expiry if detectable.

**`logout <name>`** — Clear a profile's auth state (`.claude.json`) without deleting the config.

## 8. Profile Sync & Bulk Operations

**`sync <source> <target> [--keys]`** — Merge specific settings from one profile into another without a full clone. E.g., propagate just permissions from one profile to all others.

**`apply-all <setting>`** — Apply a setting change across every profile. Useful for adding a new permission or hook globally.

## 9. Import / Export

**`export <name> [--output file]`** — Bundle a profile's config (settings, commands, hooks, agents, skills, output styles, CLAUDE.md) into a shareable archive or JSON file. Excludes auth and sessions.

**`import <file> [name]`** — Create a profile from an exported bundle. Useful for sharing team-standard configs or moving between machines.
