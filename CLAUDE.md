# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI/TUI tool for managing multiple Claude Code configuration profiles. Each profile is a `~/.claude-<name>` directory containing its own `settings.json`, commands, hooks, agents, etc. Profiles are activated by setting `CLAUDE_CONFIG_DIR`. The default profile (`~/.claude`) is special-cased and protected from deletion/creation.

Published as `@aeriondyseti/claude-profiles` on npm.

## Build & Development

- **Runtime**: Bun (not Node). The CLI shebang is `#!/usr/bin/env bun`.
- **Install deps**: `bun install`
- **Typecheck**: `bunx tsc --noEmit`
- **Test**: `bun test` (uses Bun's built-in test runner; test files live alongside source as `*.test.ts`)
- **Run locally**: `bun src/cli.ts` (interactive TUI) or `bun src/cli.ts <command> [args]`
- **No build step**: TypeScript runs directly via Bun; `tsconfig.json` has `noEmit: true`

## Architecture

- `src/cli.ts` — CLI entry point. Parses `process.argv`, dispatches to command handlers, or launches the TUI if no command given.
- `src/index.ts` — Interactive TUI loop using `@clack/prompts`. Presents a menu that dispatches to the same command handlers.
- `src/profiles.ts` — Core profile operations (create, clone, delete, read info). Manages `settings.json` and `.claude.json` per profile directory.
- `src/utils.ts` — Profile directory resolution, discovery (scans `~/.claude-*`), and formatting helpers.
- `src/detect.ts` — `.claude-profile` TOML file detection. Walks up from `cwd` looking for `.claude-profile`, parses it with `smol-toml`, returns the profile name and file path.
- `src/commands/` — One file per command (`list`, `create`, `edit`, `clone`, `delete`, `switch`, `run`, `bind`, `unbind`). Each exports a function accepting optional CLI args; falls back to interactive prompts via `shared.ts`.
- `src/commands/shared.ts` — Shared `selectProfile()` prompt used by most commands.

Key design: every command function works both as a CLI handler (args passed directly) and as a TUI handler (prompts the user when args are missing).

## Release Model

- `dev` branch → publishes with `@dev` npm tag (version auto-suffixed with `-dev.<run_number>`)
- `main` branch → publishes with `@latest` npm tag + auto-creates git tag and GitHub Release
- Merges to `main` automatically reset `dev` to match `main`
- CI uses OIDC trusted publishing (no npm token stored)
