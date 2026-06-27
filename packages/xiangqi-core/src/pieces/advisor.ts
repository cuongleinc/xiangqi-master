// Advisor: 1 step diagonal, palace restricted

import { getPiece, getColor, isValidPosition, isInPalace } from '../board';

export function getAdvisorMoves(board: Uint8Array, row: number, col: number): [number, number][] {
  const piece = getPiece(board, row * 9 + col);
  const color = getColor(piece);
  if (color === null) return [];

  const directions: [number, number][] = [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];

  const moves: [number, number][] = [];

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (!isValidPosition(nr, nc)) continue;
    if (!isInPalace(nr, nc, color)) continue;

    const target = getPiece(board, nr * 9 + nc);
    const targetColor = getColor(target);
    if (targetColor === color) continue;

    moves.push([nr, nc]);
  }

  return moves;
}
