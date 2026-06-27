// Analysis DTOs
export interface EvaluateDto {
  fen: string;
}

export interface EvaluateResponseDto {
  score: number;
  mate?: number;
  depth: number;
  pv: string[];
  cached: boolean;
}

export interface BestMoveDto {
  fen: string;
  movetime?: number;
}

export interface BestMoveResponseDto {
  bestMove: string;
  score: number;
  depth: number;
  pv: string[];
}

export interface GameReviewDto {
  gameId: string;
  red: PlayerReviewDto;
  black: PlayerReviewDto;
  criticalMoments: CriticalMomentDto[];
  totalMoves: number;
}

export interface PlayerReviewDto {
  accuracy: number;
  bestCount: number;
  excellentCount: number;
  goodCount: number;
  inaccuracyCount: number;
  mistakeCount: number;
  blunderCount: number;
}

export interface CriticalMomentDto {
  moveNumber: number;
  player: 'red' | 'black';
  beforeScore: number;
  afterScore: number;
  classification: string;
}
