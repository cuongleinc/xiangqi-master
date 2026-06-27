// Cannon: orthogonal slide for non-capture; exactly one piece (screen) between for capture

import { getPiece, getColor, isValidPosition } from '../board';

export function getCannonMoves(board: Uint8Array, row: number, col: number): [number, number][] {
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
    let screenFound = false;

    while (isValidPosition(nr, nc)) {
      const target = getPiece(board, nr * 9 + nc);
      const targetColor = getColor(target);

      if (!screenFound) {
        // Before screen: can only move to empty squares (non-capture move)
        if (targetColor === null) {
          moves.push([nr, nc]);
        } else {
          // Found the screen piece
          screenFound = true;
        }
      } else {
        // After screen: can only capture (first piece found)
        if (targetColor !== null) {
          if (targetColor !== color) {
            // Enemy piece — capture!
            moves.push([nr, nc]);
          }
          // Whether own or enemy, stop after first piece
          break;
        }
      }

      nr += dr;
      nc += dc;
    }
  }

  return moves;
}
