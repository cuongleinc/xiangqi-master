// King: 1 step orthogonal, palace restricted, Flying General attack

import { Color } from '@repo/shared';
import { getPiece, getColor, isValidPosition, isInPalace, findKing } from '../board';

export function getKingMoves(board: Uint8Array, row: number, col: number): [number, number][] {
  const piece = getPiece(board, row * 9 + col);
  const color = getColor(piece);
  if (color === null) return [];

  const directions: [number, number][] = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];

  const moves: [number, number][] = [];

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (!isValidPosition(nr, nc)) continue;
    if (!isInPalace(nr, nc, color)) continue;

    const target = getPiece(board, nr * 9 + nc);
    const targetColor = getColor(target);

    // Can't capture own pieces
    if (targetColor === color) continue;

    // Check if moving to this square would violate Flying General
    // (we check this at a higher level with full validation)
    moves.push([nr, nc]);
  }

  // Flying General: King can "capture" opposing king if on same column with no pieces between
  // This is enforced as a check, not a direct capture move
  // The actual Flying General check is in check-detector.ts

  return moves;
}

// Check if two kings are facing each other on the same column with nothing between
export function isFlyingGeneralViolation(board: Uint8Array): boolean {
  const redKingPos = findKing(board, Color.RED);
  const blackKingPos = findKing(board, Color.BLACK);

  if (redKingPos === null || blackKingPos === null) return false;

  const redCol = redKingPos % 9;
  const blackCol = blackKingPos % 9;

  // Must be on same column
  if (redCol !== blackCol) return false;

  const redRow = Math.floor(redKingPos / 9);
  const blackRow = Math.floor(blackKingPos / 9);

  // Check all squares between the two kings
  const minRow = Math.min(redRow, blackRow);
  const maxRow = Math.max(redRow, blackRow);

  for (let r = minRow + 1; r < maxRow; r++) {
    if (getPiece(board, r * 9 + redCol) !== 0) {
      // Piece between them — no violation
      return false;
    }
  }

  // No pieces between — Flying General violation
  return true;
}
