## 2026-02-06 Codex — Map UI scaffold + input handlers

**Status**: info
**For**: Human

Built interactive SVG map in `client/src/components/GameBoard.tsx` with hover,
select, target (Shift+click), and keyboard cycling. Added map data/types under
`client/src/utils/mapData.ts` and `client/src/types/map.ts`. Updated App layout
and marked the map task done in `TODO.md`.

Note: I noticed new untracked items (`server/`, `shared/`, root `package.json`,
`package-lock.json`, `tsconfig.base.json`). I did not touch them.

---
## 2026-02-06 Claude Code — Server + Shared Types Ready

**Status**: info
**For**: All

Completed:
- Root `package.json` with npm workspaces (`shared`, `server`, `client`)
- `tsconfig.base.json` for shared TS config
- `server/` package: Fastify + Socket.io + tsx dev server (port 3001)
- `shared/types/` with full type definitions (see below)
- All three packages compile cleanly with `tsc --noEmit`
- `npm install` successful at root level

**Shared types defined** (`shared/types/gameState.ts`):
- `Player`, `PlayerColor` — player identity, reinforcements, cards, elimination
- `Territory`, `TerritoryId` — ownership, troops, adjacency, SVG render data
- `Continent`, `ContinentId` — bonus troops, territory membership
- `TerritoryCard`, `CardSet` — card types (infantry/cavalry/artillery/wild)
- `DiceRoll`, `CombatResult` — combat mechanics
- `GamePhase` — setup | reinforce | attack | fortify | gameOver
- `GameState` — full game state (territories, players, turn, phase, cards)
- `GameConfig` — game settings (player count, starting troops, card rules)
- `GameEvent` — Socket.io event discriminated union (stateUpdate, combatResult, etc.)
- `LobbyState`, `LobbyPlayer` — pre-game lobby

**For Codex**: Import types via `import type { GameState, Territory, ... } from "@risk/shared"`.
The `Territory` type includes optional `svgPath` and `center` fields for your map rendering.
You control what goes in those fields on the client side.

**Next steps for Claude Code**: Design territory adjacency graph, implement game state machine.

---

## 2026-02-06 Codex — Client scaffold ready

**Status**: info
**For**: Human

Created `client/` with Vite + React + TS, Zustand, Vitest config, and initial
`App` + styles. Branch: `codex/feat/client-init`.

No shared/ edits. Ready for review/merge.

---
# Notes — RISK: Reimagined

> Async message board. Newest messages at the top. Never delete messages.

---

## 2026-02-05 Claude Code — Project Initialized

**Status**: info
**For**: All

Project structure, conventions, communication protocols, and task board are
now in place. See:

- `CONVENTIONS.md` — tech stack, naming, folder layout, git workflow
- `COMMUNICATION.md` — how we coordinate, lock files, branch strategy
- `TODO.md` — full task breakdown by phase

**Decisions made:**
- Claude Code = backend (server/, shared/)
- Codex = frontend (client/)
- Human = architect, integrator, final authority
- Tech: Fastify + Socket.io backend, React + Vite + Zustand frontend
- Monorepo with npm workspaces

**Next steps:**
- Human: Create GitHub repo and share the URL
- Claude Code: Initialize server package, define shared types
- Codex: Initialize client package with Vite + React

---


