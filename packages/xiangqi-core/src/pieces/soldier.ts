// Soldier: forward only before river; forward + left + right after river; never backward

import { Color } from '@repo/shared';
import { getPiece, getColor, isValidPosition, hasCrossedRiver } from '../board';

export function getSoldierMoves(board: Uint8Array, row: number, col: number): [number, number][] {
  const piece = getPiece(board, row * 9 + col);
  const color = getColor(piece);
  if (color === null) return [];

  const moves: [number, number][] = [];
  const crossed = hasCrossedRiver(row, color);

  if (color === Color.RED) {
    // Red moves UP (row increases toward Black at row 9)
    checkAndAdd(board, color, moves, row + 1, col);

    if (crossed) {
      checkAndAdd(board, color, moves, row, col - 1);
      checkAndAdd(board, color, moves, row, col + 1);
    }
  } else {
    // Black moves DOWN (row decreases toward Red at row 0)
    checkAndAdd(board, color, moves, row - 1, col);

    if (crossed) {
      checkAndAdd(board, color, moves, row, col - 1);
      checkAndAdd(board, color, moves, row, col + 1);
    }
  }

  return moves;
}

function checkAndAdd(
  board: Uint8Array,
  color: Color,
  moves: [number, number][],
  row: number,
  col: number,
): void {
  if (!isValidPosition(row, col)) return;
  const target = getPiece(board, row * 9 + col);
  const targetColor = getColor(target);
  if (targetColor === color) return;
  moves.push([row, col]);
}
