# .claude-profile Auto-Detection Implementation Plan

**Goal:** Let `claude-profiles run` automatically detect which profile to use based on a `.claude-profile` TOML file in the current or ancestor directory, and provide `bind`/`unbind` commands to manage these files.

**Execution:** Serial
**Branch:** `feature/claude-profile-auto-detection`

---

### Task 1: Add `smol-toml` dependency

**Dependencies:** None

**Files:**
- Modify: `package.json`

**Steps:**

1. Install `smol-toml` as a production dependency. It's a zero-dependency TOML parser/serializer.

**Verify:** `bun install && bunx tsc --noEmit`

**Commit:** `feat: add smol-toml dependency`

---

### Task 2: Add detection utility

**Dependencies:** Task 1

**Files:**
- Create: `src/detect.ts`

**Steps:**

1. Create `src/detect.ts` with a `detectProfile()` function that:
   - Starts from `process.cwd()`
   - Walks up parent directories until it finds a `.claude-profile` file or hits the filesystem root
   - Parses the file as TOML using `smol-toml`
   - Expects a `profile` key (string) — the profile name
   - Returns `{ name: string, filePath: string } | null`
2. Export a `PROFILE_FILENAME` constant (`.claude-profile`) for reuse by bind/unbind.
3. Export a `parseProfileFile(filePath: string)` helper that reads and parses a single `.claude-profile` file, returning the profile name or `null`. This is used by both `detectProfile` and can be useful for validation.

**Verify:** `bunx tsc --noEmit`

**Commit:** `feat: add .claude-profile file detection utility`

---

### Task 3: Integrate detection into `run` command

**Dependencies:** Task 2

**Files:**
- Modify: `src/commands/run.ts`

**Steps:**

1. When `nameArg` is not provided, call `detectProfile()` before falling through to the interactive prompt.
2. If a `.claude-profile` file is found, log a message like `"Using profile 'work' (from /path/to/.claude-profile)"` so the user understands why that profile was selected.
3. If the detected profile name doesn't match any existing profile, log an error and return (don't silently fall through to the prompt).
4. If no `.claude-profile` is found and no `nameArg` was given, fall through to the existing interactive `selectProfile` prompt (current behavior preserved).

**Verify:** `bunx tsc --noEmit`

**Commit:** `feat: run command auto-detects profile from .claude-profile`

---

### Task 4: Add `bind` command

**Dependencies:** Task 2

**Files:**
- Create: `src/commands/bind.ts`

**Steps:**

1. Create `bindProfileCommand(nameArg?: string, pathArg?: string)` following the existing command pattern.
2. If no `nameArg`, use `selectProfile()` to prompt interactively.
3. Validate the profile exists using `profileExists()` from `profiles.ts`.
4. Resolve `pathArg` to an absolute path (default: `process.cwd()`).
5. Write a `.claude-profile` file at that path using `smol-toml`'s `stringify()`:
   ```toml
   profile = "work"
   ```
6. If a `.claude-profile` already exists at that path, warn and ask for confirmation to overwrite (interactive), or overwrite silently (CLI with args).
7. Log success: `"Bound profile 'work' to /path/to/project"`.

**Verify:** `bunx tsc --noEmit`

**Commit:** `feat: add bind command to write .claude-profile files`

---

### Task 5: Add `unbind` command

**Dependencies:** Task 2

**Files:**
- Create: `src/commands/unbind.ts`

**Steps:**

1. Create `unbindCommand(pathArg?: string)` — simpler than other commands since it doesn't need profile selection.
2. Resolve `pathArg` to an absolute path (default: `process.cwd()`).
3. Check if `.claude-profile` exists at that path. If not, log a warning and return.
4. Read and display the current binding before deleting (e.g., `"Removing profile binding 'work' from /path/to/project"`).
5. Delete the `.claude-profile` file.
6. Log success.

**Verify:** `bunx tsc --noEmit`

**Commit:** `feat: add unbind command to remove .claude-profile files`

---

### Task 6: Wire bind/unbind into CLI and TUI

**Dependencies:** Task 4, Task 5

**Files:**
- Modify: `src/cli.ts`
- Modify: `src/index.ts`

**Steps:**

1. In `src/cli.ts`:
   - Import `bindProfileCommand` and `unbindCommand`
   - Add `bind` case (no alias) that calls `bindProfileCommand(args[1], args[2])`
   - Add `unbind` case that calls `unbindCommand(args[1])`
   - Update `printHelp()` with the new commands
2. In `src/index.ts`:
   - Add "Bind profile to directory" and "Unbind profile from directory" options to the TUI menu (before "Exit")
   - Add corresponding cases in the switch statement

**Verify:** `bunx tsc --noEmit`

**Commit:** `feat: wire bind/unbind into CLI and TUI`

---

### Task 7: Update documentation

**Dependencies:** Task 6

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

**Steps:**

1. In `README.md`:
   - Add `bind` and `unbind` to the commands table
   - Add a "Directory-Aware Profiles" section under Usage explaining the `.claude-profile` file, auto-detection behavior, and the bind/unbind workflow
2. In `CLAUDE.md`:
   - Add `src/detect.ts` to the architecture section with a brief description
   - Note the `.claude-profile` TOML format

**Verify:** Visual review of the markdown.

**Commit:** `docs: document .claude-profile auto-detection and bind/unbind`
