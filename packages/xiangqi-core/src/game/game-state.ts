// Game state — immutable state container

import { Color, STARTING_FEN } from '@repo/shared';
import { startingBoard } from '../board';
import { parseFen } from '../fen/fen-parser';
import { generateFen } from '../fen/fen-generator';
import { normalizeFen } from '../fen/fen-hash';
import { GameResult } from '../rules/game-end-detector';
import type { MoveRecord } from '../rules/perpetual-detector';

export interface GameState {
  board: Uint8Array;
  turn: Color;
  halfMoveClock: number;
  fullMoveNumber: number;
  moveHistory: MoveRecord[];
  positionHistory: string[]; // normalized FENs for repetition detection
  status: GameResult;
  result?: string;
}

export function createInitialGameState(): GameState {
  const board = startingBoard();
  const fen = generateFen(board, Color.RED);
  return {
    board,
    turn: Color.RED,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    moveHistory: [],
    positionHistory: [normalizeFen(fen)],
    status: GameResult.PLAYING,
  };
}

export function createGameStateFromFen(fen: string): GameState {
  const parsed = parseFen(fen);
  return {
    board: parsed.board,
    turn: parsed.turn,
    halfMoveClock: parsed.halfMoveClock,
    fullMoveNumber: parsed.fullMoveNumber,
    moveHistory: [],
    positionHistory: [normalizeFen(fen)],
    status: GameResult.PLAYING,
  };
}

export function gameStateToFen(state: GameState): string {
  return generateFen(state.board, state.turn, state.halfMoveClock, state.fullMoveNumber);
}
