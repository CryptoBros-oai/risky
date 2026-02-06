# Communication Protocol — RISK: Reimagined

## Overview

All communication between agents (Claude Code, Codex) flows **through the Human**.
There is no direct agent-to-agent link. The Human copy-pastes relevant context
between sessions as needed.

---

## Channels

### 1. `NOTES.md` — Async Message Board (Primary)

The main coordination file. Agents write structured messages here for the
other agent and the Human to read.

**Format:**
```markdown
## [DATE] [AUTHOR] — [SUBJECT]

**Status**: info | request | blocker | decision-needed
**For**: Claude Code | Codex | Human | All

Message body here. Be specific. Include file paths, type names, or code
snippets when relevant.

---
```

**Rules:**
- Append new messages at the TOP of the file (newest first)
- Never delete or edit another agent's messages
- Mark resolved items with `**Status**: resolved` — do not delete them
- Keep messages concise — this file will be read by LLMs with context limits

### 2. `TODO.md` — Shared Task Board

Tracks all tasks, ownership, and status. See format below in TODO section.

### 3. Human Relay

For urgent or complex coordination, the Human relays messages directly
between agent sessions. Agents can ask the Human to relay by writing:

> "Please relay to [Codex/Claude Code]: [message]"

---

## Protocols

### Starting Work

Before writing code, an agent must:
1. Read `NOTES.md` for any new messages
2. Read `TODO.md` for current task assignments
3. `git pull` to get the latest changes
4. Check that no one else is working on the same files

### Claiming a Task

1. Find or create the task in `TODO.md`
2. Set the status to `in-progress` and add your name
3. Commit the updated `TODO.md` before starting work

### Finishing a Task

1. Ensure code compiles and tests pass
2. Commit on your feature branch
3. Update `TODO.md` — mark task as `done`
4. If changes affect `shared/`, add a `NOTES.md` entry
5. Ask Human to review/merge

### Requesting a Change in Another Agent's Domain

1. Write a `NOTES.md` entry with `Status: request`
2. Describe exactly what you need and why
3. Wait for the other agent (via Human relay) to acknowledge

### Resolving Conflicts

1. If a merge conflict occurs, the Human resolves it
2. If a design disagreement arises, both agents present their case in
   `NOTES.md` — the Human makes the final call

---

## File Lock Convention

If you need exclusive access to a file temporarily (e.g., during a complex
multi-commit refactor), add a lock entry in `NOTES.md`:

```markdown
## [DATE] [AUTHOR] — LOCK

**Status**: lock
**For**: All
**Files**: `shared/types/gameState.ts`, `server/src/game/engine.ts`

Reason: Refactoring game state to support fog of war. Expected to unlock
after next commit.

---
```

Remove the lock (mark as `Status: resolved`) as soon as you're done.

---

## Branch Workflow

```
main (protected — Human merges only)
 ├── claude/feat/game-engine
 ├── claude/feat/combat-system
 ├── codex/feat/game-board-ui
 ├── codex/feat/player-dashboard
 └── human/fix/whatever
```

1. Each agent works on their own branch
2. Push regularly (at logical checkpoints)
3. Open a PR when the feature is ready
4. Human reviews and merges to `main`
5. After merge, both agents pull `main` into their working branches

---

## Emergency Protocol

If something breaks `main`:
1. Stop all work
2. Post a `Status: blocker` message in `NOTES.md`
3. Human investigates and fixes
4. Resume only after Human gives the all-clear
