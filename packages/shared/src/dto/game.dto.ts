// Game DTOs - simple validation schemas (class-validator decorators added in api package)
export interface CreateGameDto {
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface MakeMoveDto {
  uci: string; // 4-character UCCI move, e.g. "h2e2"
}

export interface GameResponseDto {
  id: string;
  fen: string;
  moveCount: number;
  status: string;
  result?: string;
  difficulty: string;
  hintsRemaining: number;
  moves: MoveRecordDto[];
  recentAiMove?: {
    uci: string;
    fen: string;
    evaluation?: number;
  };
  isAiThinking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MoveResponseDto {
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

export interface HintResponseDto {
  bestMove: string;
  score: number;
  depth: number;
  hintsRemaining: number;
}

export interface MoveRecordDto {
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
