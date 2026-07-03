// Re-export all public APIs

// pieces.types
export { PieceType, Color, PieceCode, FEN_PIECE_MAP, PIECE_CODE_TO_FEN, PIECE_CHARS } from './types/pieces.types';
export type { PieceCodeValue, PieceInfo } from './types/pieces.types';

// board.types
export { BOARD_COLS, BOARD_ROWS, BOARD_SIZE, STARTING_FEN } from './types/board.types';
export type { Position, BoardSquare, FenData } from './types/board.types';

// game.types
export { DIFFICULTY_MOVETIME } from './types/game.types';
export type { GameStatus, GameResultReason, Difficulty, MatchType, MoveRecord, GameResult, GameStateData } from './types/game.types';

// analysis.types
export { MoveClassification, DEFAULT_THRESHOLDS } from './types/analysis.types';
export type { AnalysisResult, EvaluationResult, GameReviewData, PlayerReview, CriticalMoment, ClassificationThresholds } from './types/analysis.types';

// api.types
export type { CreateGameRequest, CreateGameResponse, MakeMoveRequest, MakeMoveResponse, HintResponse, GameResponse, EvaluateRequest, EvaluateResponse, BestMoveRequest, BestMoveResponse, EngineHealthResponse } from './types/api.types';

// board.constants
export { BOARD_CELL_COUNT, RED_PALACE_ROW_START, RED_PALACE_ROW_END, BLACK_PALACE_ROW_START, BLACK_PALACE_ROW_END, PALACE_COL_START, PALACE_COL_END, RIVER_RED_SIDE_START, RIVER_BLACK_SIDE_END, FILES, RANKS, FILE_MAP, COL_TO_FILE } from './constants/board.constants';

// thresholds.constants
export { PERPETUAL_LIMIT, FIFTY_MOVE_LIMIT, DEFAULT_HINTS_PER_GAME, MAX_HINTS_PER_GAME, REPETITION_LIMIT } from './constants/thresholds.constants';

// game.dto
export type { CreateGameDto, MakeMoveDto, GameResponseDto, MoveResponseDto, HintResponseDto, MoveRecordDto } from './dto/game.dto';

// analysis.dto
export type { EvaluateDto, EvaluateResponseDto, BestMoveDto, BestMoveResponseDto, GameReviewDto, PlayerReviewDto, CriticalMomentDto } from './dto/analysis.dto';
