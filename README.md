# 🏯 Xiangqi Master

Chinese Chess platform (Phase 1: Human vs AI)

## Quick Start

### Prerequisites
- Node.js >= 22
- pnpm >= 9
- Docker (for database and Redis)

### Development

```bash
# Install dependencies
pnpm install

# Start development services (PostgreSQL + Redis)
pnpm docker:dev

# Start API (port 3000)
pnpm dev --filter=@repo/api

# Start Web (port 5173)
pnpm dev --filter=@repo/web
```

### Build

```bash
pnpm build
```

### Production

```bash
docker compose up -d
```

## Project Structure

```
├── apps/
│   ├── web/          React + Vite frontend
│   └── api/          NestJS backend
├── packages/
│   ├── shared/       Types, constants, DTOs
│   ├── xiangqi-core/ Game logic engine
│   └── engine-client/ Pikafish UCI wrapper
└── infrastructure/
    ├── docker/       Dockerfiles
    └── nginx/        Nginx config
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Zustand, React Query
- **Backend**: NestJS, TypeScript, TypeORM, PostgreSQL
- **Cache**: Redis
- **Engine**: Pikafish (Xiangqi AI)
- **Infrastructure**: Docker, Docker Compose, Nginx

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/games | Create new game |
| GET | /api/games/:id | Get game state |
| POST | /api/games/:id/move | Make a move |
| POST | /api/games/:id/hint | Get move hint |
| GET | /api/games/:id/moves | Get move history |
| POST | /api/analysis/evaluate | Evaluate position |
| POST | /api/analysis/best-move | Get best move |
| GET | /api/analysis/review/:id | Game review |
| GET | /api/engine/status | Engine health |

## License

MIT
