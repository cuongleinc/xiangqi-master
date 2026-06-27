// Elephant: 2 steps diagonal, elephant-eye blocking, cannot cross river

import { getPiece, getColor, isValidPosition, isOnOwnSide } from '../board';

export function getElephantMoves(board: Uint8Array, row: number, col: number): [number, number][] {
  const piece = getPiece(board, row * 9 + col);
  const color = getColor(piece);
  if (color === null) return [];

  // Each move is 2 steps diagonal with the "eye" at 1 step diagonal
  // Move (dr, dc) = (±2, ±2), eye at (±1, ±1)
  const moves: [number, number][] = [];

  const directions: [number, number][] = [
    [-2, -2], [-2, 2], [2, -2], [2, 2],
  ];

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (!isValidPosition(nr, nc)) continue;

    // Cannot cross river
    if (!isOnOwnSide(nr, color)) continue;

    // Elephant eye blocking: check the midpoint
    const eyeRow = row + dr / 2;
    const eyeCol = col + dc / 2;
    if (getPiece(board, eyeRow * 9 + eyeCol) !== 0) continue;

    const target = getPiece(board, nr * 9 + nc);
    const targetColor = getColor(target);
    if (targetColor === color) continue;

    moves.push([nr, nc]);
  }

  return moves;
}
