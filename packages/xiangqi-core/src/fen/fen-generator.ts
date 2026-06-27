// ==========================================
// FEN Generator: board → FEN string
// ==========================================

import { Color, PIECE_CODE_TO_FEN } from '@repo/shared';

export function generateFen(
  board: Uint8Array,
  turn: Color,
  halfMoveClock: number = 0,
  fullMoveNumber: number = 1,
): string {
  const boardStr = generateBoardString(board);
  const turnStr = turn === Color.RED ? 'w' : 'b';
  return `${boardStr} ${turnStr} - - ${halfMoveClock} ${fullMoveNumber}`;
}

function generateBoardString(board: Uint8Array): string {
  const ranks: string[] = [];

  // Generate from top (row 9) to bottom (row 0)
  for (let r = 9; r >= 0; r--) {
    let rankStr = '';
    let emptyCount = 0;

    for (let c = 0; c < 9; c++) {
      const piece = board[r * 9 + c] ?? 0;
      if (piece === 0) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rankStr += emptyCount.toString();
          emptyCount = 0;
        }
        const fenChar = PIECE_CODE_TO_FEN[piece];
        if (fenChar === undefined) {
          throw new Error(`Invalid piece code at (${r},${c}): ${piece}`);
        }
        rankStr += fenChar;
      }
    }

    if (emptyCount > 0) {
      rankStr += emptyCount.toString();
    }

    ranks.push(rankStr);
  }

  return ranks.join('/');
}

export function generateBoardOnly(board: Uint8Array): string {
  return generateBoardString(board);
}
