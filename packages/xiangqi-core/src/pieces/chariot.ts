// Chariot: orthogonal slide, blocked by first piece (can capture it if enemy)

import { getPiece, getColor, isValidPosition } from '../board';

export function getChariotMoves(board: Uint8Array, row: number, col: number): [number, number][] {
  const piece = getPiece(board, row * 9 + col);
  const color = getColor(piece);
  if (color === null) return [];

  const directions: [number, number][] = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];

  const moves: [number, number][] = [];

  for (const [dr, dc] of directions) {
    let nr = row + dr;
    let nc = col + dc;

    while (isValidPosition(nr, nc)) {
      const target = getPiece(board, nr * 9 + nc);
      const targetColor = getColor(target);

      if (targetColor === null) {
        // Empty square — can move here
        moves.push([nr, nc]);
      } else if (targetColor !== color) {
        // Enemy piece — can capture
        moves.push([nr, nc]);
        break; // blocked after capture
      } else {
        // Own piece — blocked
        break;
      }

      nr += dr;
      nc += dc;
    }
  }

  return moves;
}
