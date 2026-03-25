# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI/TUI tool for managing multiple Claude Code configuration profiles. Each profile is a `~/.claude-<name>` directory containing its own `settings.json`, commands, hooks, agents, etc. Profiles are activated by setting `CLAUDE_CONFIG_DIR`. The default profile (`~/.claude`) is special-cased and protected from deletion/creation.

Published as `@aeriondyseti/claude-profiles` on npm.

## Build & Development

- **Runtime**: Bun (not Node). The CLI shebang is `#!/usr/bin/env bun`.
- **Install deps**: `bun install`
- **Typecheck**: `bunx tsc --noEmit` (this is the only CI check — there are no tests or linter)
- **Run locally**: `bun src/cli.ts` (interactive TUI) or `bun src/cli.ts <command> [args]`
- **No build step**: TypeScript runs directly via Bun; `tsconfig.json` has `noEmit: true`

## Architecture

- `src/cli.ts` — CLI entry point. Parses `process.argv`, dispatches to command handlers, or launches the TUI if no command given.
- `src/index.ts` — Interactive TUI loop using `@clack/prompts`. Presents a menu that dispatches to the same command handlers.
- `src/profiles.ts` — Core profile operations (create, clone, delete, read info). Manages `settings.json` and `.claude.json` per profile directory.
- `src/utils.ts` — Profile directory resolution, discovery (scans `~/.claude-*`), and formatting helpers.
- `src/commands/` — One file per command (`list`, `create`, `edit`, `clone`, `delete`, `switch`, `run`). Each exports a function accepting optional CLI args; falls back to interactive prompts via `shared.ts`.
- `src/commands/shared.ts` — Shared `selectProfile()` prompt used by most commands.

Key design: every command function works both as a CLI handler (args passed directly) and as a TUI handler (prompts the user when args are missing).

## Release Model

- `dev` branch → publishes with `@dev` npm tag
- `rc/*` branches → publish with `@rc` tag
- Git tags `v*` on `main` → publish with `@latest` tag + GitHub Release
- CI uses OIDC trusted publishing (no npm token stored)
