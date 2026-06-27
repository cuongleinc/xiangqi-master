// Engine client types

export interface PikafishConfig {
  path: string; // binary path
  hash?: number; // Hash table MB (default 64)
  threads?: number; // CPU threads (default 1)
  multiPv?: number; // Multi-PV lines (default 1)
  evalFile?: string; // NNUE network file path
}

export interface AnalysisOptions {
  movetime?: number; // ms to think (default 5000)
  depth?: number; // search depth limit
  multiPv?: number; // overrides config default
}

export interface AnalysisResult {
  bestMove: string; // UCCI "h2e2"
  ponder?: string; // ponder move UCCI
  score: number; // centipawns (positive = Red advantage)
  mate?: number; // moves to mate (positive = Red gives mate)
  depth: number; // search depth reached
  pv: string[]; // principal variation (UCCI moves)
  nodes: number;
  time: number; // time in ms
}

export interface EvaluationResult {
  score: number;
  mate?: number;
  depth: number;
  pv: string[];
}

export type EngineStatus = 'idle' | 'thinking' | 'ready' | 'crashed' | 'stopped' | 'starting';

export interface EngineHealth {
  status: EngineStatus;
  pid: number | null;
  uptime: number; // seconds since start
  queueLength: number;
  lastActivity: number; // timestamp
}

export interface ParsedInfo {
  depth?: number;
  seldepth?: number;
  score?: { cp: number } | { mate: number };
  pv?: string[];
  nodes?: number;
  nps?: number;
  time?: number;
  currmove?: string;
  multipv?: number;
  hashfull?: number;
}

export interface BestMoveLine {
  bestMove: string;
  ponder?: string;
}
