export const MoveClassification = {
  BEST: 'BEST',
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  INACCURACY: 'INACCURACY',
  MISTAKE: 'MISTAKE',
  BLUNDER: 'BLUNDER',
} as const;
export type MoveClassification = (typeof MoveClassification)[keyof typeof MoveClassification];

export interface AnalysisResult {
  bestMove: string;
  ponder?: string;
  score: number;
  mate?: number;
  depth: number;
  pv: string[];
  nodes: number;
  time: number;
}

export interface EvaluationResult {
  score: number;
  mate?: number;
  depth: number;
  pv: string[];
}

export interface GameReviewData {
  gameId: string;
  red: PlayerReview;
  black: PlayerReview;
  criticalMoments: CriticalMoment[];
  totalMoves: number;
}

export interface PlayerReview {
  accuracy: number;
  bestCount: number;
  excellentCount: number;
  goodCount: number;
  inaccuracyCount: number;
  mistakeCount: number;
  blunderCount: number;
}

export interface CriticalMoment {
  moveNumber: number;
  player: 'red' | 'black';
  beforeScore: number;
  afterScore: number;
  classification: string;
}

export interface ClassificationThresholds {
  bestCp: number;
  excellentCp: number;
  goodCp: number;
  inaccuracyCp: number;
  mistakeCp: number;
}

export const DEFAULT_THRESHOLDS: ClassificationThresholds = {
  /** ≤5 cp — matches engine top move or negligible loss */
  bestCp: 5,
  /** ≤15 cp — very small eval loss (≤0.15 pawns) */
  excellentCp: 15,
  /** ≤50 cp — small eval loss (≤0.5 pawns) */
  goodCp: 50,
  /** ≤100 cp — moderate eval loss (≤1.0 pawns) */
  inaccuracyCp: 100,
  /** ≤200 cp — large eval loss (≤2.0 pawns) */
  mistakeCp: 200,
  // >200 cp → BLUNDER
};
