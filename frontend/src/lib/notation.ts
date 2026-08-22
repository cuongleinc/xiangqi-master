import { parseFen, getPiece, getPieceInfo, indexFromRowCol } from '@repo/xiangqi-core';
import { Color } from '@repo/shared';

/** Piece abbreviation for move notation */
const PIECE_ABBR: Record<string, string> = {
  king: 'K',
  advisor: 'A',
  elephant: 'E',
  horse: 'H',
  chariot: 'R',
  cannon: 'C',
  soldier: 'P',
};

const FILE_MAP: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8 };

/**
 * Convert a UCI move string (e.g. "h2e2") to human-readable Xiangqi notation.
 *
 * Format:
 *   Horizontal:  R1=5   (Rook from file 1 → file 5)
 *   Advance:     H2+3   (Horse from file 2 advances 3 rows)
 *   Retreat:     C8-2   (Cannon from file 2 retreats 2 rows)
 *
 * File numbers are from each player's perspective:
 *   Red:  file 1 = rightmost (i), file 9 = leftmost (a)
 *   Black: file 1 = rightmost (a), file 9 = leftmost (i)
 *
 * Returns the original UCI string if parsing fails.
 */
export function uciToReadable(uci: string, fen: string): string {
  if (uci.length !== 4) return uci;

  const parsed = parseFen(fen);
  const board = parsed.board;

  const fromFile = FILE_MAP[uci[0]!];
  const fromRank = parseInt(uci[1]!, 10);
  if (fromFile === undefined || isNaN(fromRank)) return uci;

  const fromIdx = indexFromRowCol(fromRank, fromFile);
  const piece = getPiece(board, fromIdx);
  if (piece === 0) return uci;

  const info = getPieceInfo(piece);
  if (!info) return uci;

  const abbr = PIECE_ABBR[info.type] || '?';

  // File number from player's perspective
  const fileNum = info.color === Color.RED ? 9 - fromFile : fromFile + 1;

  const toFile = FILE_MAP[uci[2]!];
  const toRank = parseInt(uci[3]!, 10);
  if (toFile === undefined || isNaN(toRank)) return uci;

  if (fromRank === toRank) {
    // Horizontal move → show target file
    const targetFileNum = info.color === Color.RED ? 9 - toFile : toFile + 1;
    return `${abbr}${fileNum}=${targetFileNum}`;
  }

  // Red advances toward row 0 (decreasing), Black toward row 9 (increasing)
  const isAdvance =
    info.color === Color.RED ? toRank < fromRank : toRank > fromRank;
  const steps = Math.abs(toRank - fromRank);
  const action = isAdvance ? '+' : '-';
  return `${abbr}${fileNum}${action}${steps}`;
}

/**
 * Convert a PV line (array of UCI strings) to readable notation,
 * simulating the board state after each move.
 */
export function pvToReadable(pvUcis: string[], initialFen: string): string[] {
  const result: string[] = [];
  let currentFen = initialFen;
  for (const uci of pvUcis) {
    const readable = uciToReadable(uci, currentFen);
    result.push(readable);
    // Advance the FEN by applying this move (simplified: rebuild FEN)
    currentFen = applyUciToFen(uci, currentFen);
  }
  return result;
}

/** Toggle the side-to-move in a FEN string. */
function applyUciToFen(_uci: string, fen: string): string {
  if (fen.includes(' w ')) return fen.replace(' w ', ' b ');
  return fen.replace(' b ', ' w ');
}
