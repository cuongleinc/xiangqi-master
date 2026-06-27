// Game end detection — checkmate, stalemate, draw conditions

import { Color, FIFTY_MOVE_LIMIT } from '@repo/shared';
import { generateLegalMoves } from '../move/move-generator';
import { isInCheck } from './check-detector';
import { isRepetition } from './repetition-detector';

export enum GameResult {
  PLAYING = 'playing',
  RED_WINS = 'red_wins',
  BLACK_WINS = 'black_wins',
  DRAW = 'draw',
}

export interface GameEndCheck {
  status: GameResult;
  reason?: string;
}

// Check all game end conditions
export function checkGameEnd(
  board: Uint8Array,
  colorToMove: Color,
  halfMoveClock: number,
  positionHistory: string[],
): GameEndCheck {
  // Check for checkmate or stalemate
  const legalMoves = generateLegalMoves(board, colorToMove);
  const inCheck = isInCheck(board, colorToMove);

  if (legalMoves.length === 0) {
    if (inCheck) {
      // Checkmate — the side to move loses
      const winner = colorToMove === Color.RED ? Color.BLACK : Color.RED;
      return {
        status: winner === Color.RED ? GameResult.RED_WINS : GameResult.BLACK_WINS,
        reason: 'checkmate',
      };
    } else {
      // Stalemate — the side to move LOSES in Xiangqi (not a draw!)
      const winner = colorToMove === Color.RED ? Color.BLACK : Color.RED;
      return {
        status: winner === Color.RED ? GameResult.RED_WINS : GameResult.BLACK_WINS,
        reason: 'stalemate',
      };
    }
  }

  // Check no-capture / no-soldier-advance rule (60 half-moves)
  if (halfMoveClock >= FIFTY_MOVE_LIMIT) {
    return {
      status: GameResult.DRAW,
      reason: 'fifty_move',
    };
  }

  // Check threefold repetition
  if (positionHistory.length > 0) {
    const lastFen = positionHistory[positionHistory.length - 1];
    if (lastFen && isRepetition(positionHistory, lastFen)) {
      return {
        status: GameResult.DRAW,
        reason: 'repetition',
      };
    }
  }

  return { status: GameResult.PLAYING };
}

// Is it checkmate? (in check AND no legal moves)
export function isCheckmate(board: Uint8Array, color: Color): boolean {
  return isInCheck(board, color) && generateLegalMoves(board, color).length === 0;
}

// Is it stalemate? (no legal moves AND not in check → LOSS in Xiangqi)
export function isStalemate(board: Uint8Array, color: Color): boolean {
  return !isInCheck(board, color) && generateLegalMoves(board, color).length === 0;
}
