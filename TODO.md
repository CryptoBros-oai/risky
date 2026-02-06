# Task Board — RISK: Reimagined

> Update this file when claiming, completing, or adding tasks.
> Format: `- [status] Task description (@owner)`
> Statuses: `[ ]` todo, `[~]` in-progress, `[x]` done, `[!]` blocked

---

## Phase 0 — Project Setup

- [x] Create folder structure (@claude-code)
- [x] Create CONVENTIONS.md (@claude-code)
- [x] Create COMMUNICATION.md (@claude-code)
- [x] Create TODO.md (@claude-code)
- [x] Create README.md (@claude-code)
- [x] Initialize git repo and .gitignore (@claude-code)
- [x] Create GitHub repository (@human)
- [x] Initialize server package with TypeScript + Fastify (@claude-code)
- [x] Initialize client package with Vite + React + TypeScript (@codex)
- [x] Set up npm workspaces in root package.json (@claude-code)
- [x] Define initial shared types (Player, Territory, GameState) (@claude-code)

## Phase 1 — Core Game Engine (Backend)

- [x] Design territory map data structure + adjacency graph (@claude-code)
- [x] Implement game state machine (phases: deploy, attack, fortify) (@claude-code)
- [x] Implement dice combat resolver (@claude-code)
- [x] Implement reinforcement calculator (@claude-code)
- [x] Implement territory card system (@claude-code)
- [ ] Set up Socket.io server for game events (@claude-code)
- [x] Write unit tests for game engine — 60 tests passing (@claude-code)

## Phase 2 — Core UI (Frontend)

- [x] Create game board component with SVG territory map (@codex)
- [~] Add adjacency highlighting on map interactions (@codex)
- [~] Refine map visuals (parchment, labels, badges) (@codex)
- [ ] Create player dashboard (troops, cards, status) (@codex)
- [ ] Create dice roll animation component (@codex)
- [ ] Create lobby / game creation screen (@codex)
- [ ] Implement Socket.io client connection (@codex)
- [ ] Wire up game state to UI via Zustand store (@codex)

## Phase 3 — Integration & Polish

- [ ] Connect frontend to backend via Socket.io events (@human)
- [ ] End-to-end game flow testing (@all)
- [ ] Add innovative feature #1: TBD (@all)
- [ ] Add innovative feature #2: TBD (@all)

---

*Last updated by: Codex*
