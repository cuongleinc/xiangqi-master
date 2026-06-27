# PROJECT: Xiangqi Master

## Status — Phase 1: ✅ COMPLETE (Core)

All 13 implementation steps completed. Human vs AI fully functional.

### ✅ Completed

| Step | Feature | Status |
|------|---------|--------|
| 1 | Monorepo (pnpm + Turborepo) | ✅ |
| 2 | xiangqi-core (board, FEN, 7 pieces, rules, game manager) | ✅ |
| 3 | Board UI (SVG, click/drag, legal moves, check highlight) | ✅ |
| 4 | Backend Game Service (NestJS, CRUD game + moves) | ✅ |
| 5 | Pikafish Integration (EngineModule @Global, singleton) | ✅ |
| 6 | Evaluation System (AnalysisModule, eval bar, score) | ✅ |
| 7 | Hint System (3 hints/game, engine best move) | ✅ |
| 8 | Move Classification (Best→Blunder, thresholds) | ✅ |
| 9 | Game Review (accuracy, critical moments) | ✅ |
| 10 | Database (PostgreSQL + TypeORM, games/moves/analysis_cache) | ✅ |
| 11 | Redis Cache (CacheModule with graceful fallback) | ✅ |
| 12 | Docker (Dockerfiles, docker-compose.yml, nginx config) | ✅ |
| 13 | Deployment guide (Hostinger VPS, SSL, backup) | ✅ |

### ⚠️ Known Issues

- **Move count race condition**: Fixed with atomic DB increment, but edge cases remain
- **Web production build**: Rollup CJS→ESM conversion fails with enum re-exports. Dev server works fine (uses esbuild)
- **No tests yet**: 80% coverage target not started
- **DraggablePiece component**: Defined but drag-drop mostly relies on click-to-select

### 🔧 Remaining (Short-term)

- [ ] Add comprehensive tests (xiangqi-core 40+ tests, API 20+, Web 15+)
- [ ] Fix web production build (switch packages to ESM output permanently)
- [ ] Perpetual chase detection (only perpetual check is implemented)
- [ ] Game review UI integration (API done, frontend placeholder)
- [ ] Evaluation bar real-time updates (wired but needs polling)
- [ ] Mobile-responsive polish
- [ ] Performance profiling

### 📋 Future Phases

**Phase 2: Online PvP**
- Socket.IO integration
- Matchmaking queue
- Friend challenge
- Reconnect support
- Spectator mode

**Phase 3: Accounts**
- JWT auth
- Register / Login
- Player profiles
- Ratings & leaderboards

**Phase 4: Training**
- Puzzles
- Endgame trainer
- Opening Explorer
- Position analysis board

**Phase 5: Tournament**
- Swiss system
- Round Robin
- Knockout brackets

---

# Architecture

## Monorepo Structure

```
root/
├── apps/
│   ├── web/              @repo/web — React + Vite frontend
│   └── api/              @repo/api — NestJS backend
├── packages/
│   ├── shared/           @repo/shared — Types, constants, DTOs
│   ├── xiangqi-core/     @repo/xiangqi-core — Game logic engine
│   ├── engine-client/    @repo/engine-client — Pikafish UCI wrapper
│   └── typescript-config/ Shared TS configs
├── infrastructure/
│   ├── docker/           Dockerfiles for api + web
│   └── nginx/            Reverse proxy config
├── docs/                 deployment.md
├── docker-compose.yml    Production stack
├── docker-compose.dev.yml Development (postgres + redis)
└── turbo.json            Build pipeline
```

## Dependency Graph

```
@repo/shared (zero deps)
    ↓
@repo/xiangqi-core (depends on shared)
    ↓
@repo/engine-client (depends on xiangqi-core)
    ↓                    ↓
@repo/web              @repo/api
```

## Key Design Decisions

### Pikafish Convention Differences

Pikafish uses chess-like piece notation (`N`=Horse, `B`=Elephant) while the WXF standard uses `H`=Horse, `E`=Elephant. The `engine-client` package includes `fenToPikafish()` and `fenFromPikafish()` converters in `fen-converter.ts`.

### Palace / River Orientation

- Red at bottom (rows 0-4), Black at top (rows 5-9)
- Red palace: rows 0-2, cols 3-5
- Black palace: rows 7-9, cols 3-5
- Red forward = row +1 (toward Black)
- Black forward = row -1 (toward Red)
- Stalemate = LOSS (not draw as in chess)

### Module Format

- Packages compile to CJS (`module: commonjs`) for Node.js/NestJS compatibility
- Vite dev server uses `optimizeDeps.include` for CJS→ESM conversion
- API: `tsconfig.build.json` with `module: commonjs` + `emitDecoratorMetadata`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/games | Create new game |
| GET | /api/games/:id | Get game state |
| POST | /api/games/:id/move | Make a move |
| POST | /api/games/:id/hint | Get hint (decrements counter) |
| GET | /api/games/:id/moves | Get move history |
| POST | /api/analysis/evaluate | Evaluate position |
| POST | /api/analysis/best-move | Get best move |
| GET | /api/analysis/review/:gameId | Game review summary |
| GET | /api/engine/status | Engine health check |

## Running Locally

```bash
# Dev services (PostgreSQL + Redis)
pnpm docker:dev

# API
pnpm dev --filter=@repo/api    # http://localhost:3000

# Web
pnpm dev --filter=@repo/web    # http://localhost:5173

# Pikafish (must be compiled separately)
git clone https://github.com/official-pikafish/Pikafish.git
cd Pikafish/src && make -j build ARCH=apple-silicon
cp pikafish ~/.local/bin/
cp pikafish.nnue ~/.local/bin/
```
