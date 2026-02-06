# RISK: Reimagined

A web-based strategy board game inspired by RISK, built with innovative features by a human-AI collaborative team.

## Team

| Member       | Role                  | Domain                        |
|--------------|-----------------------|-------------------------------|
| Human        | Architect / Integrator| Everything (final authority)  |
| Claude Code  | Backend / Game Logic  | `server/`, `shared/`          |
| Codex        | Frontend / UI         | `client/`                     |

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Zustand + SVG maps
- **Backend**: Node.js + TypeScript + Fastify + Socket.io
- **Shared**: TypeScript interfaces in `shared/types/`
- **Database**: SQLite (via better-sqlite3)
- **Testing**: Vitest

## Getting Started

```bash
# Install all dependencies (workspaces)
npm install

# Start the backend dev server
npm run dev --workspace=server

# Start the frontend dev server
npm run dev --workspace=client
```

## Project Structure

```
risk-game/
├── client/          # React frontend (Codex)
├── server/          # Fastify backend (Claude Code)
├── shared/          # Shared TypeScript types
├── docs/            # Design documents
├── CONVENTIONS.md   # Team conventions
├── COMMUNICATION.md # Coordination protocols
├── NOTES.md         # Async message board
└── TODO.md          # Task tracker
```

## Coordination

See [CONVENTIONS.md](CONVENTIONS.md) and [COMMUNICATION.md](COMMUNICATION.md) for how the team works together.

## License

TBD
