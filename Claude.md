# PROJECT: Xiangqi Master

## Status — Phase 1: ✅ COMPLETE (Core)

All 13 implementation steps completed. Human vs AI fully functional. UI fully redesigned with "Cổ Phong Hiện Đại" (ancient-meets-modern) aesthetic.

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

### 🎨 UI Design (Beyond original scope)

| Area | Details |
|------|---------|
| Welcome Screen | Battle background PNG (Chu-Han War scene), XIANGQI MASTER title 2.4rem, difficulty cards English+Chinese, START GAME button |
| Battle BG | 1920×1080 cinematic scene: Chu (crimson) vs Han (blue) armies, blood moon, mountains, 50+ soldiers, generals on horses, gold river 鴻溝 |
| Board | Bamboo wood (#c8a96e), 8px rounded border with #8B4513 + gold outline, Dong Son bronze drum watermark at 0.04 opacity, inset shadow |
| Grid Lines | #5c3d1a 1px, river text "楚河 漢界" in Ma Shan Zheng font |
| Palace | Diagonal X lines #8B4513 in both palaces |
| Pieces | Carved wooden discs with radial-gradients simulating convex surface light, SVG feDropShadow, gold outer rings, Ma Shan Zheng calligraphy at 700 weight |
| Piece Animation | cubic-bezier(0.34, 1.56, 0.64, 1) spring easing, 0.38s move transitions |
| Typography | Ma Shan Zheng (brush calligraphy) for pieces + river text, Noto Serif SC for UI headings |
| Color Theme | #0d0800 ebony background, #d4a843 gold accents, #f5e6c8 cream text, #4a7c59 jade green |
| Layout | 3-column: [Controls 220px] [Board flex] [Analysis 220px], bg #1e1005 sidebars |
| Buttons | New Game (red gradient), Hint (bronze gradient), Undo (brown gradient), Resign (outline) — single-language via i18n |
| i18n | 3 locales (en/zh/vi), react-i18next, language switcher flags in Header + Welcome screen |
| Sound Design | Spec documented: piece-place wooden click ~40ms, piece-lift ~30ms, check ~80ms, capture ~60ms, game-over double-tap |

### ✅ Recently Completed (Post-Phase 1)

| Feature | Description | Commit |
|---------|-------------|--------|
| Move List | PGN-style two-column layout (Red \| Black), human-readable Xiangqi notation, classification dots + annotation symbols (!, ?!, ?, ??), auto-scroll | `2d6efbe` |
| Undo Button | Full-stack: DB-driven undo endpoint, PvC undoes 2 moves (AI+human), hot-reload safe, "悔棋 · Undo" button in toolbar | `2d6efbe` |
| i18n Multi-Language | 3 locales (en/zh/vi) via react-i18next, 75+ strings migrated, language switcher (🇬🇧🇨🇳🇻🇳) in Header + Welcome screen, localStorage persistence | `0dbfe5a` |

### ⚠️ Known Issues

- **Move count race condition**: Fixed with atomic DB increment, but edge cases remain
- **Web production build**: Rollup CJS→ESM conversion fails with `@tanstack/react-query`. Dev server works fine (uses esbuild)
- **No tests yet**: 80% coverage target not started
- **Perpetual chase detection**: Only perpetual check is implemented
- **Game review UI**: API done, frontend placeholder
- **Evaluation bar**: Wired but needs real-time polling for live updates

### 🔧 Remaining (Short-term) — Player vs Computer Polish

- [ ] **Sound implementation** (design spec ready in Board.tsx)
- [ ] **Evaluation bar real-time updates** (poll engine on every move)
- [ ] **Game review UI integration** (frontend for POST /api/analysis/review)
- [x] ~~Last-move highlight~~ ✅ Done
- [x] ~~Hint highlight animation~~ ✅ Done
- [x] ~~Move classification display~~ ✅ Done
- [x] ~~Move list with readable notation~~ ✅ Done — PGN-style two-column layout with classification dots
- [ ] **Drag-and-drop polish** (currently click-to-select; add full DnD with React DnD)
- [ ] **Mobile-responsive layout** (stack columns vertically on narrow screens)
- [ ] **Perpetual chase detection** (xiangqi-core enhancement)
- [ ] **Fix web production build** (esbuild-only build, bypass Rollup)
- [ ] **Add comprehensive tests** (xiangqi-core 40+ tests, API 20+, Web 15+)

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
├── scripts/
│   ├── setup.sh          One-time setup (deps + Pikafish build)
│   ├── dev.sh            Start all services (Docker + API + Web)
│   └── generate_battle_bg.py  Generate welcome screen background
├── infrastructure/
│   ├── docker/           Dockerfiles for api + web
│   └── nginx/            Reverse proxy config
├── DEPLOYMENT.md         Hostinger VPS deployment guide
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

### UI Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `ebony` | `#0d0800` | Page background |
| `lacquer` | `#1e1005` / `#241505` | Card/panel surfaces |
| `gold` | `#d4a843` | Borders, accents, CTAs |
| `gold-light` | `#f0d080` | Title text |
| `cream` | `#f5e6c8` | Body text |
| `cream-dim` | `#a89880` | Secondary text |
| `jade` | `#4a7c59` | Positive eval |
| `red-chinese` | `#c44b4b` | Red pieces, negative eval |
| `wood` | `#c8a96e` | Board surface |
| `saddle` | `#8B4513` | Board border |
| `grid-line` | `#5c3d1a` | Board grid |

### Fonts

| Font | Usage |
|------|-------|
| **Ma Shan Zheng** | Piece characters (calligraphy brush style), river text |
| **Noto Serif SC** | UI headings, Chinese labels |
| System UI | Body text, monospace (moves, scores) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/games | Create new game |
| GET | /api/games/:id | Get game state |
| POST | /api/games/:id/move | Make a move |
| POST | /api/games/:id/hint | Get hint (decrements counter) |
| POST | /api/games/:id/undo | Undo last move(s) — PvC undoes 2, others undo 1 |
| GET | /api/games/:id/moves | Get move history |
| POST | /api/analysis/evaluate | Evaluate position |
| POST | /api/analysis/best-move | Get best move |
| GET | /api/analysis/review/:gameId | Game review summary |
| GET | /api/engine/status | Engine health check |

## Running Locally

```bash
# First time — one command sets up everything
pnpm setup

# Every time — starts Docker + API + Web in one terminal
pnpm dev
```

Open http://localhost:5173 — select difficulty, click Start Game, click pieces to play.

```bash
# Manual dev (separate terminals)
pnpm docker:dev                              # PostgreSQL + Redis
pnpm dev --filter=@repo/api                 # API → http://localhost:3000
pnpm dev --filter=@repo/web                 # Web → http://localhost:5173
```

### Pikafish Manual Build

```bash
git clone https://github.com/official-pikafish/Pikafish.git
cd Pikafish/src
make -j build ARCH=apple-silicon             # macOS ARM
cp pikafish ~/.local/bin/
cp pikafish.nnue ~/.local/bin/
```

---

## Next Phase — Player vs Computer Feature Completion

Priority order for implementing remaining PvC features:

### Priority 1 — Gameplay Polish
1. **Last-move highlight** — Highlight source & destination squares of the most recent move on the board
2. **Hint highlight animation** — Show arrow/glow from hint source to destination
3. **Evaluation bar real-time updates** — Poll `/api/analysis/evaluate` after each move, animate bar
4. **Move classification display** — Show classification label in MoveList and AnalysisPanel

### Priority 2 — UI Integration
5. **Game review UI** — Frontend modal showing accuracy, classification counts, critical moments
6. **Drag-and-drop** — Full drag/drop via React DnD (currently click-to-select works)
7. **Sound effects** — Implement the sound design spec from Board.tsx comments

### Priority 3 — Robustness
8. **Mobile-responsive layout** — Stack 3-column layout vertically on narrow viewports
9. **Perpetual chase detection** — xiangqi-core rule enhancement
10. **Fix production build** — esbuild-only Vite build bypassing Rollup
11. **Comprehensive tests** — 75+ tests across all packages
