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
  bestCp: 20,
  excellentCp: 50,
  goodCp: 100,
  inaccuracyCp: 200,
  mistakeCp: 400,
};
