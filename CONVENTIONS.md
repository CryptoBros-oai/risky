# Project Conventions — RISK: Reimagined

## Team Roles

| Member       | Role                  | Owns                          |
|--------------|-----------------------|-------------------------------|
| Claude Code  | Backend / Game Logic  | `server/`, `shared/`          |
| Codex        | Frontend / UI         | `client/`                     |
| Human (You)  | Architect / Integrator| Everything (final authority)  |

> **Rule**: Never edit files outside your owned directories without explicit approval
> from the Human coordinator. The `shared/` directory is a negotiation zone —
> changes there must be communicated via `NOTES.md` before merging.

---

## Tech Stack

### Backend (Claude Code)
- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Framework**: Fastify
- **Real-time**: Socket.io
- **Testing**: Vitest
- **Database**: SQLite via better-sqlite3 (simple to start; migrate later if needed)

### Frontend (Codex)
- **Framework**: React 18+ with TypeScript
- **Bundler**: Vite
- **State Management**: Zustand
- **Map Rendering**: SVG (with potential Pixi.js upgrade for effects)
- **Styling**: CSS Modules or Tailwind CSS (Codex's choice)
- **Testing**: Vitest + React Testing Library

### Shared
- **Monorepo**: Simple workspace layout (no Turborepo/Nx for now)
- **Package Manager**: npm workspaces
- **Shared Types**: `shared/types/` — imported by both client and server

---

## Folder Structure

```
risk-game/
├── client/                 # Frontend (Codex owns)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── assets/         # Images, SVGs, fonts
│   │   ├── types/          # Frontend-only types
│   │   └── utils/          # Frontend utilities
│   ├── tests/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                 # Backend (Claude Code owns)
│   ├── src/
│   │   ├── game/           # Core game engine (rules, state, combat)
│   │   ├── api/            # REST endpoints
│   │   ├── socket/         # Socket.io event handlers
│   │   └── types/          # Server-only types
│   ├── tests/
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                 # Shared code (negotiated zone)
│   ├── types/              # Shared TypeScript interfaces
│   └── package.json
│
├── docs/                   # Design docs, game rules, architecture
├── CONVENTIONS.md          # This file
├── COMMUNICATION.md        # Coordination protocols
├── NOTES.md                # Async message board between agents
├── TODO.md                 # Shared task tracker
├── README.md
├── package.json            # Root workspace config
├── .gitignore
└── tsconfig.base.json      # Shared TS config
```

---

## Naming Conventions

### Files & Directories
- **Components**: PascalCase — `GameBoard.tsx`, `DiceRoll.tsx`
- **Hooks**: camelCase with `use` prefix — `useGameState.ts`
- **Utilities/modules**: camelCase — `combatResolver.ts`, `mapData.ts`
- **Types files**: camelCase — `gameState.ts`, `player.ts`
- **Test files**: `*.test.ts` or `*.test.tsx`, colocated in `tests/` dirs

### Code
- **Variables/functions**: camelCase — `calculateReinforcements()`
- **Classes/interfaces/types**: PascalCase — `GameState`, `Player`, `Territory`
- **Constants**: UPPER_SNAKE_CASE — `MAX_PLAYERS`, `DICE_SIDES`
- **Enums**: PascalCase name, PascalCase members — `enum Phase { Deploy, Attack, Fortify }`
- **Boolean variables**: prefix with `is`, `has`, `can` — `isEliminated`, `hasWon`

### Git
- **Branches**: `<owner>/<type>/<short-description>`
  - `claude/feat/game-engine`
  - `codex/feat/game-board-ui`
  - `human/fix/integration-bug`
- **Commits**: Conventional Commits format
  - `feat: add territory adjacency graph`
  - `fix: correct dice roll probability`
  - `docs: update README with setup instructions`
  - `refactor: simplify combat resolution`
  - `test: add unit tests for reinforcement calc`
- **PRs**: Target `main`. Human reviews and merges.

---

## Code Style

- Strict TypeScript — `"strict": true`, no `any` unless absolutely necessary
- Prefer `const` over `let`; never use `var`
- Use explicit return types on exported functions
- Prefer named exports over default exports
- Max line length: 100 characters (soft guideline)
- Use template literals over string concatenation
- Handle errors explicitly — no silent catches

---

## Shared Types Contract

Changes to `shared/types/` affect both client and server. Process:

1. Propose the change in `NOTES.md` with the new interface/type
2. Wait for Human acknowledgment
3. Implement and commit
4. Both sides update their code to match

---

## Definition of Done

A feature is "done" when:
- Code compiles with zero TypeScript errors
- Relevant tests pass
- No lint errors
- Committed on the correct feature branch
- Entry updated in `TODO.md`
