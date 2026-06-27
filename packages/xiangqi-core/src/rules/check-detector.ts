// Check detection

import { Color } from '@repo/shared';
import { findKing, rowColFromIndex } from '../board';
import { generatePseudoLegalMoves } from '../move/move-generator';
import { isFlyingGeneralViolation } from '../pieces/king';

// Is the given color in check?
export function isInCheck(board: Uint8Array, color: Color): boolean {
  const kingPos = findKing(board, color);
  if (kingPos === null) return false;

  const opponentColor = color === Color.RED ? Color.BLACK : Color.RED;
  const opponentMoves = generatePseudoLegalMoves(board, opponentColor);

  // Check if any opponent move can capture the king
  for (const move of opponentMoves) {
    if (move.toRow * 9 + move.toCol === kingPos) return true;
  }

  // Check Flying General
  if (isFlyingGeneralViolation(board)) return true;

  return false;
}

// Find pieces that are checking the given color's king
export function findCheckers(board: Uint8Array, color: Color): number[] {
  const kingPos = findKing(board, color);
  if (kingPos === null) return [];

  const opponentColor = color === Color.RED ? Color.BLACK : Color.RED;
  const opponentMoves = generatePseudoLegalMoves(board, opponentColor);

  const checkers: number[] = [];
  const seen = new Set<number>();

  for (const move of opponentMoves) {
    if (move.toRow * 9 + move.toCol === kingPos) {
      const fromIdx = move.fromRow * 9 + move.fromCol;
      if (!seen.has(fromIdx)) {
        checkers.push(fromIdx);
        seen.add(fromIdx);
      }
    }
  }

  return checkers;
}

// Check if after a move, the moving side is still in check (self-check)
export function isSelfCheckAfter(board: Uint8Array, move: { fromRow: number; fromCol: number; toRow: number; toCol: number; piece: number }, color: Color): boolean {
  // Apply the move on a copy
  const newBoard = new Uint8Array(board);
  newBoard[move.fromRow * 9 + move.fromCol] = 0;
  newBoard[move.toRow * 9 + move.toCol] = move.piece;

  return isInCheck(newBoard, color);
}
