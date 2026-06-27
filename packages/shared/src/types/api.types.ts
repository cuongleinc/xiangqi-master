// ==========================================
// API types (request/response DTOs)
// ==========================================

import type { Difficulty, GameStatus, MoveRecord } from './game.types';
import type { MoveClassification } from './analysis.types';

// Create Game
export interface CreateGameRequest {
  difficulty?: Difficulty;
}

export interface CreateGameResponse {
  gameId: string;
  fen: string;
}

// Make Move
export interface MakeMoveRequest {
  uci: string;
}

export interface MakeMoveResponse {
  success: boolean;
  fen: string;
  turn: string;
  isCheck: boolean;
  isMate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  gameResult?: string;
  moveNumber: number;
  evaluation?: number;
  isAiThinking?: boolean;
}

// Hint
export interface HintResponse {
  bestMove: string;
  score: number;
  depth: number;
  hintsRemaining: number;
}

// Game state
export interface GameResponse {
  id: string;
  fen: string;
  moveCount: number;
  status: GameStatus;
  result?: string;
  difficulty: string;
  hintsRemaining: number;
  moves: MoveRecord[];
  recentAiMove?: {
    uci: string;
    fen: string;
    evaluation?: number;
  };
  isAiThinking: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analysis
export interface EvaluateRequest {
  fen: string;
}

export interface EvaluateResponse {
  score: number;
  mate?: number;
  depth: number;
  pv: string[];
  cached: boolean;
}

export interface BestMoveRequest {
  fen: string;
  movetime?: number;
}

export interface BestMoveResponse {
  bestMove: string;
  score: number;
  depth: number;
  pv: string[];
}

// Engine
export interface EngineHealthResponse {
  healthy: boolean;
  engine: {
    status: string;
    pid: number | null;
    uptime: number;
    queueLength: number;
    lastActivity: number;
  };
}
