# PROJECT: Xiangqi Master

## Vision

Build a modern Chinese Chess platform similar to Chess.com and Lichess for Xiangqi.

Phase 1:
- Single player vs AI

Future phases:
- Online multiplayer
- Matchmaking
- Analysis engine
- Game review
- Training mode
- Opening explorer
- Puzzle trainer
- Rating system
- Tournament system

The architecture must be designed from day one to support future expansion without major refactoring.

---

# Product Goals

Provide:

- Human vs AI
- Strong engine analysis
- Evaluation bar
- Best move suggestions
- Hint system
- Move quality classification
- Full game review

Future:

- PvP online
- Spectator mode
- Friends system
- Rankings
- Tournament support

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Zustand
- TailwindCSS
- React Query
- React DnD (drag & drop)

## Backend

- NestJS
- TypeScript

## Realtime

- Socket.IO

Phase 1:
- Disabled

Phase 2:
- Enabled

## Database

- PostgreSQL

## Cache

- Redis

Used for:

- Engine cache
- Session cache
- Matchmaking queue
- Analysis cache

## Engine

- Pikafish

Requirements:

- Run as persistent background process
- Never spawn per move
- Support future engine pool scaling

## Infrastructure

- Docker
- Docker Compose
- Nginx

Target Deployment:

- Hostinger VPS
- Ubuntu 24.04

---

# Monorepo Structure

```text
root/

├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── shared/
│   ├── xiangqi-core/
│   └── engine-client/
│
├── infrastructure/
│   ├── docker/
│   └── nginx/
│
├── docs/
│
├── docker-compose.yml
└── README.md
```

---

# Architecture

```text
Browser
    |
    v
React Frontend
    |
    v
NestJS API
    |
    +------ Game Service
    |
    +------ Analysis Service
    |
    +------ Engine Service
    |
    +------ User Service
    |
    +------ Matchmaking Service
    |
    +------ Socket Gateway
    |
    +------ PostgreSQL
    |
    +------ Redis
    |
    +------ Pikafish
```

Important:

Even in Phase 1:

- Server owns official game state
- Frontend only renders data
- All moves validated on backend

---

# Xiangqi Core Package

Create:

```text
packages/xiangqi-core
```

Responsibilities:

- Board representation
- FEN parser
- FEN generator
- Move generation
- Move validation
- Check detection
- Checkmate detection
- Stalemate detection
- Game termination

Must be reusable by:

- Backend
- Future mobile app
- Analysis tools

---

# Xiangqi Rules

Support complete Xiangqi rules.

## General

- Palace restriction
- Flying General rule

## Advisor

- Diagonal movement inside palace

## Elephant

- Cannot cross river
- Elephant-eye blocking

## Horse

- Horse-leg blocking

## Chariot

- Standard rook movement

## Cannon

- Screen capture rule

## Soldier

Before river:

- Forward only

After river:

- Forward
- Left
- Right

Never backward

---

# Board UI

## Requirements

Board size:

- 9 columns
- 10 rows

Display:

- River
- Palace
- Coordinates

Features:

- Click piece
- Drag piece
- Highlight legal moves
- Highlight last move
- Highlight check

Responsive:

- Desktop
- Tablet
- Mobile

Use SVG pieces.

Do NOT use PNG sprites.

---

# Phase 1 Features

## Human vs AI

Difficulty:

### Easy

```text
go movetime 100
```

### Medium

```text
go movetime 500
```

### Hard

```text
go movetime 1500
```

### Expert

```text
go movetime 5000
```

---

# Evaluation System

After every move:

1. Save position
2. Ask engine for evaluation
3. Store evaluation

Example:

```text
score cp 132
```

Means:

```text
+1.32
```

Store:

```ts
evaluationBefore
evaluationAfter
```

---

# Evaluation Bar

Implement Chess.com style evaluation bar.

Display:

```text
+5.00
+2.30
+0.50
0.00
-1.20
-4.50
```

Requirements:

- Animated
- Realtime updates
- Visible beside board

---

# Hint System

Button:

```text
Hint
```

Response:

```json
{
  "bestMove": "h2e2",
  "score": 120,
  "depth": 18
}
```

Frontend:

- Highlight source square
- Highlight destination square

Limits:

- Default: 3 hints per game

Configurable later

---

# Move Classification

Implement:

```ts
enum MoveClassification {
  BEST,
  EXCELLENT,
  GOOD,
  INACCURACY,
  MISTAKE,
  BLUNDER
}
```

Classification based on:

```text
evaluationBefore
evaluationAfter
bestMoveEvaluation
```

Example:

```text
BEST

EXCELLENT

GOOD

INACCURACY

MISTAKE

BLUNDER
```

Thresholds configurable.

---

# Game Review

After game ends:

Generate summary.

Show:

- Accuracy score
- Best move count
- Mistakes
- Blunders
- Critical moments

Use cached evaluations.

Do NOT re-analyze entire game initially.

---

# Analysis Service

Create module:

```text
AnalysisModule
```

Responsibilities:

- Evaluate position
- Best move
- Hint generation
- Move classification
- Game review

Endpoints:

```http
POST /analysis/evaluate
POST /analysis/best-move
POST /analysis/review
```

---

# Engine Service

Create singleton service.

Responsibilities:

- Start Pikafish
- Restart on crash
- Queue requests
- Return best move
- Return evaluation

Future:

```text
Engine Pool
```

Support:

```text
Engine 1
Engine 2
Engine 3
...
```

---

# Database Schema

## users

```sql
id
username
rating
created_at
updated_at
```

## games

```sql
id
status
result
current_fen
created_at
updated_at
```

## moves

```sql
id
game_id
move_number
uci_move
fen_before
fen_after
evaluation_before
evaluation_after
classification
created_at
```

## analysis_cache

```sql
id
fen
best_move
score
depth
created_at
```

---

# API Design

## Create Game

```http
POST /game/create
```

Response:

```json
{
  "gameId": "uuid",
  "fen": "..."
}
```

---

## Make Move

```http
POST /game/move
```

Request:

```json
{
  "gameId": "uuid",
  "move": "h2e2"
}
```

Response:

```json
{
  "valid": true,
  "fen": "...",
  "check": false,
  "mate": false
}
```

---

## Evaluate

```http
POST /analysis/evaluate
```

Request:

```json
{
  "fen": "..."
}
```

Response:

```json
{
  "score": 132
}
```

---

## Best Move

```http
POST /analysis/best-move
```

Response:

```json
{
  "bestMove": "h2e2",
  "score": 132
}
```

---

## Hint

```http
POST /hint
```

Response:

```json
{
  "bestMove": "h2e2",
  "score": 132
}
```

---

# Future Socket Events

Prepare interfaces now.

Implement later.

```text
join_game

leave_game

make_move

game_update

analysis_update

match_found

player_connected

player_disconnected
```

---

# Frontend State

Separate stores.

## Game Store

```ts
game
history
currentFen
turn
```

## Analysis Store

```ts
evaluation
bestMove
classification
```

## UI Store

```ts
selectedPiece
legalMoves
dialogs
loading
```

## Settings Store

```ts
difficulty
sound
theme
```

---

# UI Layout

```text
------------------------------------------------
Header
------------------------------------------------

New Game
Difficulty
Hint
Review

------------------------------------------------

Evaluation Bar

------------------------------------------------

Board

------------------------------------------------

Move List

------------------------------------------------

Analysis Panel

------------------------------------------------

Status Bar
```

---

# Analysis Panel

Display:

```text
Current Evaluation

Best Move

Engine Depth

Move Classification

Principal Variation
```

---

# Security

Requirements:

- Validate every move on backend
- Never trust frontend state
- Rate-limit analysis endpoints
- Rate-limit hint endpoints
- Prepare JWT support for future accounts

---

# Performance Targets

Move validation:

```text
< 10ms
```

Board render:

```text
< 16ms
```

Evaluation:

```text
< 2 seconds
```

---

# Testing

Frontend:

- Vitest

Backend:

- Jest

Required tests:

- Horse-leg blocking
- Elephant-eye blocking
- Flying General
- Cannon capture
- Check detection
- Checkmate
- Stalemate
- Analysis cache

Minimum coverage:

```text
80%
```

---

# Docker Services

```text
web
api
postgres
redis
pikafish
nginx
```

Provide:

- Dockerfile (web)
- Dockerfile (api)
- docker-compose.yml

---

# Hostinger VPS Deployment

Target:

```text
Ubuntu 24.04
```

Provide:

- deployment.md
- nginx.conf
- SSL setup guide
- backup guide

Deployment command:

```bash
docker compose up -d
```

Must support:

```text
https://your-domain.com
```

---

# Future Roadmap

## Phase 2

Online PvP

- Socket.IO
- Matchmaking
- Friend challenge
- Reconnect support

## Phase 3

Accounts

- Register
- Login
- Ratings
- Leaderboards

## Phase 4

Training

- Puzzles
- Endgames
- Opening Explorer

## Phase 5

Tournament

- Swiss
- Round Robin
- Knockout

---

# Important Development Rules

1. Use strict TypeScript
2. No any types
3. No placeholder implementations
4. No duplicated business logic
5. Reusable architecture
6. Production-quality code
7. Mobile-friendly UI
8. Server-authoritative design
9. Docker-first development
10. Ready for future multiplayer

---

# Implementation Order

STEP 1

Monorepo setup

STEP 2

Xiangqi core package

STEP 3

Board UI

STEP 4

Backend Game Service

STEP 5

Pikafish Integration

STEP 6

Evaluation System

STEP 7

Hint System

STEP 8

Move Classification

STEP 9

Game Review

STEP 10

Database Integration

STEP 11

Redis Cache

STEP 12

Dockerization

STEP 13

Hostinger Deployment

Do not skip steps.

Generate complete working code.