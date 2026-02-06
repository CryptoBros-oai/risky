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
