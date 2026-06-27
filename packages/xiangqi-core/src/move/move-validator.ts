// Move validator — checks if a move is legal

import { Color } from '@repo/shared';
import { getPiece, getColor, indexFromRowCol } from '../board';
import { generateLegalMoves } from './move-generator';
import { ucciToMove, moveToUcci, moveEquals } from './move-types';
import type { Move } from './move-types';

// Validate a UCCI string against the position
export function validateMove(board: Uint8Array, ucci: string, color: Color): Move | null {
  const move = ucciToMove(ucci, board);
  if (move === null) return null;

  // Check piece exists and belongs to the right color
  const piece = getPiece(board, indexFromRowCol(move.fromRow, move.fromCol));
  const pieceColor = getColor(piece);
  if (pieceColor !== color) return null;

  // Check the move is in the legal moves list
  if (!isMoveLegal(board, move, color)) return null;

  return move;
}

// Check if a Move object is legal
export function isMoveLegal(board: Uint8Array, move: Move, color: Color): boolean {
  const legalMoves = generateLegalMoves(board, color);
  return legalMoves.some((m) => moveEquals(m, move));
}

// Quick check: is the UCCI move a legal move for the given color?
export function isUciMoveLegal(board: Uint8Array, ucci: string, color: Color): boolean {
  return validateMove(board, ucci, color) !== null;
}
