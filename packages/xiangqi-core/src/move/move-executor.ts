// Move executor — apply a move to a board and return new board

import { indexFromRowCol } from '../board';
import type { Move } from './move-types';

// Apply a move to the board, return new board state
export function applyMove(board: Uint8Array, move: Move): Uint8Array {
  const newBoard = new Uint8Array(board);
  const fromIdx = indexFromRowCol(move.fromRow, move.fromCol);
  const toIdx = indexFromRowCol(move.toRow, move.toCol);

  newBoard[toIdx] = move.piece;
  newBoard[fromIdx] = 0;

  return newBoard;
}

// Undo a move (restore previous state)
export function undoMove(board: Uint8Array, move: Move): Uint8Array {
  const newBoard = new Uint8Array(board);
  const fromIdx = indexFromRowCol(move.fromRow, move.fromCol);
  const toIdx = indexFromRowCol(move.toRow, move.toCol);

  newBoard[fromIdx] = move.piece;
  newBoard[toIdx] = move.captured ?? 0;

  return newBoard;
}

// Apply a UCCI move string
export function applyUciMove(board: Uint8Array, ucci: string, move: Move): Uint8Array {
  return applyMove(board, move);
}
