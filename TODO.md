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
- [x] Set up Socket.io server for game events (@claude-code)
- [x] Write unit tests for game engine — 74 tests passing (@claude-code)

## Phase 2 — Core UI (Frontend)

- [x] Create game board component with SVG territory map (@codex)
- [x] Add adjacency highlighting on map interactions (@codex)
- [x] Refine map visuals (parchment, labels, badges) (@codex)
- [x] Create player dashboard (troops, cards, status) (@codex)
- [x] Create dice roll animation component (@codex)
- [x] Create lobby / game creation screen (@codex)
- [x] Implement Socket.io client connection (@codex)
- [x] Wire up game state to UI via Zustand store (@codex)
- [x] Add chat panel + event feed (@codex)
- [x] Add ownership colors + action validation (@codex)
- [x] Add turn summary overlay + action log (@codex)
- [x] Add card trade-in panel (@codex)

## Phase 3 — Innovative Features (Backend)

- [x] Mini-battle system: army composition + validation + AI simulation (@claude-code)
- [x] Diplomacy: non-aggression pacts + desertion penalty on break (@claude-code)
- [x] AI opponents: easy/medium/hard for setup, reinforce, attack, fortify (@claude-code)
- [x] Wire mini-battle, diplomacy, AI into Socket.io events (@claude-code)
- [x] Tests for all new systems — 111 total passing (@claude-code)

## Phase 3 — Innovative Features (Frontend)

- [ ] Mini-battle tactical scene (canvas/Pixi.js or SVG) (@codex)
- [ ] Diplomacy UI: propose/accept/reject pact panel (@codex)
- [ ] AI player indicators + turn animation (@codex)
- [ ] Battle mode selector in lobby (classic vs tactical) (@codex)

## Phase 4 — Integration & Polish

- [ ] Connect frontend to backend via Socket.io events (@human)
- [ ] End-to-end game flow testing (@all)
- [ ] Game balance tuning (AI ratios, army composition, desertion rate) (@all)
- [ ] Visual polish and sound effects (@codex)

---

*Last updated by: Claude Code*
