# 🏯 Xiangqi Master

<div align="center">

**A modern Chinese Chess platform — play against the AI engine**

**🚀 Live Demo: [xiangqi-master.cuonglh2807.workers.dev](https://xiangqi-master.cuonglh2807.workers.dev)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

</div>

---

## 🧠 Powered by Pikafish

Xiangqi Master uses **[Pikafish](https://github.com/official-pikafish/Pikafish)** — the strongest open-source Xiangqi engine, derived from Stockfish's battle-tested search algorithms and powered by an efficiently updatable neural network (NNUE). Pikafish communicates via the standard **UCI protocol** and runs as a persistent background process, delivering evaluations at depths of 20+ plies in under a second.

### Difficulty Levels

| Level | Think Time | Engine Command |
|-------|-----------|----------------|
| Easy | 100ms | `go movetime 100` |
| Medium | 500ms | `go movetime 500` |
| Hard | 1,500ms | `go movetime 1500` |
| Expert | 5,000ms | `go movetime 5000` |

---

## ✨ Features

- 🤖 **Human vs AI** — Play against Pikafish at 4 difficulty levels
- 🎨 **SVG Board** — Crisp vector graphics at any screen size, with Chinese characters on pieces
- 🖱️ **Click to Move** — Click to select pieces, click legal destinations to move
- 📊 **Evaluation Bar** — Animated, real-time score display beside the board (PvC/Analysis only)
- 💡 **Hint System** — Get engine-powered move suggestions (3 per game, PvC only)
- 🏷️ **Move Classification** — Every move graded Best / Excellent / Good / Inaccuracy / Mistake / Blunder
- 📋 **Move List** — PGN-style two-column layout with human-readable Xiangqi notation and classification dots
- ↩️ **Undo** — Take back moves (PvC undoes AI+human pair)
- 🌐 **i18n** — Multi-language support: English, 中文 (Chinese), Tiếng Việt (Vietnamese)
- 💾 **Persistent Storage** — Full game history saved to PostgreSQL with Redis caching
- 🐳 **Dockerized** — One-command deployment with Docker Compose

---

## 🏗️ Architecture

```
Browser (React + Vite + Zustand)
    │
    └── REST /api ────► Nginx ────► NestJS API
                                       │
                                       ├── Game Service
                                       │     │
                                       │  xiangqi-core
                                       │  (rules engine)
                                       │     │
                                       │  engine-client
                                       │     │
                                       │  Pikafish
                                       │
                                       ├── PostgreSQL ──── games, moves, analysis_cache
                                       └── Redis ──────── engine cache, session cache
```

### Monorepo

| Package | Responsibility |
|---------|---------------|
| `@repo/shared` | TypeScript types, constants, DTOs |
| `@repo/xiangqi-core` | Board representation, FEN, move generation, rules engine |
| `@repo/engine-client` | Pikafish UCI protocol — singleton, queue, crash recovery |
| `@repo/api` | NestJS backend — game, analysis, engine modules |
| `@repo/web` | React frontend — SVG board, evaluation bar, analysis panel |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| **Node.js** | ≥ 22 | Runtime for API & scripts |
| **pnpm** | ≥ 9 | Monorepo package manager (see below) |
| **Docker** | recent | PostgreSQL + Redis containers |

### Installing pnpm

This project is a **monorepo** — multiple packages (web, api, xiangqi-core, engine-client) living in one repo. **pnpm** is the fastest and most disk-efficient package manager for monorepos, with strict dependency isolation that prevents "works on my machine" bugs.

```bash
# Install pnpm globally
npm install -g pnpm

# Ensure it's in your PATH (add to ~/.zshrc)
export PATH="$(npm config get prefix)/bin:$PATH"
source ~/.zshrc

# Verify
pnpm --version
```

> **Why not npm or yarn?** npm workspaces lack strict dependency boundaries (packages can accidentally import undeclared deps). Yarn is slower and uses more disk space. pnpm's symlink-based `node_modules` ensures each package only sees what it declares in `package.json` — critical for a multi-package architecture like this one.

### ⚡ Quick Start — Just 2 Commands

```bash
# Step 1: One-time setup (installs deps, builds Pikafish, creates .env)
pnpm setup

# Step 2: Launch everything (Docker + API + Web)
pnpm dev
```

Then open **http://localhost:5173** and play!

> `pnpm dev` starts PostgreSQL, Redis, API (:3000), and Web (:5173) in one terminal.
> Press `Ctrl+C` to stop everything cleanly.

> ℹ️ **Pikafish is auto-installed** by `pnpm setup`. No manual steps needed.

### Production (Docker)

```bash
cp .env.example .env
# Edit .env with your settings
docker compose up -d
```

Access at `http://localhost` — Nginx serves the web frontend and proxies API requests.

### Cloudflare (Workers Static Assets)

The **frontend only** is deployable to Cloudflare Workers (Static Assets) — the API cannot run on Workers (Pikafish engine + PostgreSQL + Redis) and stays on a VPS or local machine.

> 🌐 The live demo is deployed at **https://xiangqi-master.cuonglh2807.workers.dev**

1. Create/select the Worker **`xiangqi-master`** in the Cloudflare dashboard and enable **Workers Builds**.
2. Set **Build command** `pnpm run build` and **Deploy command** `npx wrangler deploy`.
3. Add a build environment variable **`VITE_API_URL`** pointing at your API — e.g. `http://localhost:3000/api` for local testing. The deployed page calls this URL from the *visitor's* browser, so a `localhost` URL works on your own machine while your local API runs (not for other visitors). Swap in a real API URL when one exists.
4. The Worker serves `frontend/dist` (see `wrangler.toml`); `.node-version` pins Node 22 for the Cloudflare build image.

For local testing from the deployed site, set `CORS_ORIGIN=*` in your API `.env` (the app uses no auth/cookies; tighten this when a real API domain exists) — or set it to the demo origin, `https://xiangqi-master.cuonglh2807.workers.dev`. Deploying manually requires `npx wrangler login` once.

---

## 📡 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/games` | Create a new game |
| `GET` | `/api/games/:id` | Get game state (poll for AI move) |
| `POST` | `/api/games/:id/move` | Submit a move (`{ "uci": "h2e2" }`) |
| `POST` | `/api/games/:id/hint` | Get a hint (limited per game) |
| `POST` | `/api/games/:id/undo` | Undo last move(s) — PvC undoes 2, others undo 1 |
| `GET` | `/api/games/:id/moves` | Get all moves for a game |
| `POST` | `/api/analysis/evaluate` | Evaluate a position (`{ "fen": "..." }`) |
| `POST` | `/api/analysis/best-move` | Get best move for a position |
| `GET` | `/api/analysis/review/:id` | Get game review summary |
| `GET` | `/api/engine/status` | Engine health check |

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Zustand, react-i18next |
| Backend | NestJS 10, TypeScript, TypeORM, PostgreSQL, Redis |
| Engine | [Pikafish](https://github.com/official-pikafish/Pikafish) (UCI protocol, NNUE evaluation) |
| Infrastructure | Docker, Docker Compose, Nginx |
| Monorepo | pnpm workspaces + Turborepo |
| Deployment | Docker (Ubuntu VPS) + Cloudflare Workers Static Assets |

---

## 📁 Project Structure

```
xiangqi-master/
├── frontend/src/          React components, stores, hooks
├── backend/src/           NestJS modules, entities, services
├── packages/
│   ├── shared/src/        Types, constants, DTOs
│   ├── xiangqi-core/src/  Board, FEN, pieces, rules, game manager
│   └── engine-client/src/ PikafishEngine, UCI parser, request queue
├── infrastructure/
│   ├── docker/            api.Dockerfile, web.Dockerfile
│   └── nginx/             xiangqi.conf
├── docs/                  deployment.md
├── docker-compose.yml     Production (postgres + redis + api + web + nginx)
└── docker-compose.dev.yml Development (postgres + redis only)
```

---

## 🔜 Roadmap

- ✅ **Phase 1** — Core: AI engine, board UI, analysis, move classification
- **Phase 2** — User accounts, JWT auth, ratings, leaderboards
- **Phase 3** — Training mode: puzzles, endgame trainer, opening explorer
- **Phase 4** — Tournament system: Swiss, Round Robin, Knockout

---

## 📄 License

MIT © 2026
