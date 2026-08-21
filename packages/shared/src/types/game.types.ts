// ==========================================
// Game types
// ==========================================

import type { Color } from './pieces.types';

export type GameStatus = 'playing' | 'red_wins' | 'black_wins' | 'draw';

export type GameResultReason =
  | 'checkmate'
  | 'stalemate'
  | 'resign'
  | 'agreement'
  | 'fifty_move'
  | 'repetition'
  | 'perpetual_check'
  | 'perpetual_chase';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type MatchType = 'pvc' | 'analysis';

export interface MoveRecord {
  moveNumber: number;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  evaluationBefore?: number;
  evaluationAfter?: number;
  classification?: string;
  isCheck: boolean;
  isCapture: boolean;
}

export interface GameResult {
  status: GameStatus;
  reason?: GameResultReason;
}

export interface GameStateData {
  id: string;
  fen: string;
  status: GameStatus;
  result?: string;
  moveCount: number;
  hintsRemaining: number;
  difficulty: Difficulty;
  isAiThinking: boolean;
  moves: MoveRecord[];
  recentAiMove?: {
    uci: string;
    fen: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const DIFFICULTY_MOVETIME: Record<Difficulty, number> = {
  easy: 100,
  medium: 500,
  hard: 1500,
  expert: 5000,
};
