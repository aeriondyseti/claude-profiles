# claude-profiles

CLI and interactive TUI for managing multiple [Claude Code](https://docs.anthropic.com/en/docs/claude-code) configuration profiles.

Each profile is an isolated config directory (`~/.claude-<name>`) with its own `settings.json`, commands, hooks, agents, skills, and output styles. Switch between profiles by setting the `CLAUDE_CONFIG_DIR` environment variable.

## Quick Start

Run directly with npx (no install required):

```sh
npx @aeriondyseti/claude-profiles
```

This launches the interactive TUI. You can also run specific commands directly:

```sh
npx @aeriondyseti/claude-profiles list
npx @aeriondyseti/claude-profiles create work
npx @aeriondyseti/claude-profiles run work -- -p "hello"
```

## Install

```sh
# Global install (provides the `claude-profiles` command)
npm install -g @aeriondyseti/claude-profiles

# Or run without installing
npx @aeriondyseti/claude-profiles
```

> **Note:** This tool requires [Bun](https://bun.sh) as its runtime.

## Commands

| Command | Aliases | Description |
|---|---|---|
| *(none)* | | Launch interactive TUI |
| `list` | `ls` | List all profiles and their status |
| `create [name]` | `new` | Create a new profile (optionally copy settings from an existing one) |
| `edit [name]` | | Open a profile's `settings.json` in your `$EDITOR` |
| `clone [source] [name]` | `cp` | Clone a profile's configuration (settings, commands, hooks, agents, skills, output styles) |
| `delete [name]` | `rm` | Delete a profile (with confirmation) |
| `switch [name]` | `use` | Print the `export` command and shell alias to activate a profile |
| `run [name] [-- args]` | `exec` | Launch `claude` with a specific profile's config dir |
| `bind [name] [path]` | | Bind a profile to a directory via `.claude-profile` |
| `unbind [path]` | | Remove a `.claude-profile` binding from a directory |

All commands accept an optional profile name argument. If omitted, an interactive prompt is shown.

## Usage

### Creating a profile

```sh
claude-profiles create work
```

This creates `~/.claude-work/` with a default `settings.json` that includes a session-start hook displaying the active profile name.

During interactive creation, you can optionally copy settings from an existing profile.

### Running Claude with a profile

```sh
# Via the run command
claude-profiles run work

# Pass extra arguments to Claude after --
claude-profiles run work -- -p "summarize this file"

# Or manually set the environment variable
export CLAUDE_CONFIG_DIR=~/.claude-work
claude
```

### Cloning a profile

```sh
claude-profiles clone work staging
```

Clones configuration files only — `settings.json`, `CLAUDE.md`, `commands/`, `hooks/`, `agents/`, `skills/`, and `output-styles/`. Auth state and session history are **not** copied.

### Directory-aware profiles

You can bind a profile to a directory so that `claude-profiles run` automatically uses it:

```sh
# Bind the "work" profile to the current directory
claude-profiles bind work

# Now run Claude without specifying a profile
claude-profiles run
# => Using profile 'work' (from /path/to/project/.claude-profile)
```

This writes a `.claude-profile` TOML file in the directory:

```toml
profile = "work"
```

The `run` command walks up from the current directory looking for this file. If found, it uses that profile automatically. If not found and no name is given, it falls back to the interactive prompt.

To remove a binding:

```sh
claude-profiles unbind
```

### Shell alias for quick access

`claude-profiles switch <name>` prints an alias you can add to your shell config:

```sh
alias claude-work='CLAUDE_CONFIG_DIR=~/.claude-work claude'
```

## How Profiles Work

Claude Code uses the `CLAUDE_CONFIG_DIR` environment variable to locate its configuration directory. By default this is `~/.claude`. This tool creates and manages additional directories at `~/.claude-<name>`, each acting as a fully independent config root.

The default profile (`~/.claude`) is recognized and listed but cannot be created or deleted through this tool.

## Local Development

Requires [Bun](https://bun.sh).

```sh
git clone https://github.com/aeriondyseti/claude-profiles.git
cd claude-profiles
bun install
```

Run locally:

```sh
# Interactive TUI
bun src/cli.ts

# Specific command
bun src/cli.ts list
bun src/cli.ts create my-profile
```

Typecheck:

```sh
bunx tsc --noEmit
```

## License

MIT
