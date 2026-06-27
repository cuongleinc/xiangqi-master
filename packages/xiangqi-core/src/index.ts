// Board
export * from './board';

// FEN
export { parseFen, parseFenSafe, validateFen } from './fen/fen-parser';
export { generateFen, generateBoardOnly } from './fen/fen-generator';
export { normalizeFen, hashFen, cacheKey, positionFen } from './fen/fen-hash';

// Pieces
export { getKingMoves, isFlyingGeneralViolation } from './pieces/king';
export { getAdvisorMoves } from './pieces/advisor';
export { getElephantMoves } from './pieces/elephant';
export { getHorseMoves } from './pieces/horse';
export { getChariotMoves } from './pieces/chariot';
export { getCannonMoves } from './pieces/cannon';
export { getSoldierMoves } from './pieces/soldier';

// Move
export {
  ucciToMove,
  moveToUcci,
  moveToDisplay,
  moveEquals,
} from './move/move-types';
export type { Move, MoveGenerationResult } from './move/move-types';
export {
  generatePseudoLegalMoves,
  generateLegalMoves,
  generateCaptures,
} from './move/move-generator';
export { validateMove, isMoveLegal, isUciMoveLegal } from './move/move-validator';
export { applyMove, undoMove } from './move/move-executor';
export { classifyMove, calculateAccuracy, calculateAccuracyFromClassifications } from './move/move-classifier';

// Rules
export { isInCheck, findCheckers, isSelfCheckAfter } from './rules/check-detector';
export {
  checkGameEnd,
  isCheckmate,
  isStalemate,
  GameResult,
} from './rules/game-end-detector';
export type { GameEndCheck } from './rules/game-end-detector';
export { isRepetition, countRepetitions, wouldBeRepetition } from './rules/repetition-detector';
export type { MoveRecord } from './rules/perpetual-detector';
export { checkPerpetual } from './rules/perpetual-detector';

// Game
export { createInitialGameState, createGameStateFromFen, gameStateToFen } from './game/game-state';
export type { GameState } from './game/game-state';
export { GameManager } from './game/game-manager';
export type { MoveResult } from './game/game-manager';

// Errors
export { InvalidFenError, IllegalMoveError, GameOverError } from './errors';
