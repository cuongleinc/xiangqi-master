// ==========================================
// FEN Parser: parse WXF FEN string → board + metadata
// FEN format: <board> <turn> <castling> <enpassant> <halfmove> <fullmove>
// Board: 10 ranks from row 9 (top/Black) to row 0 (bottom/Red), separated by /
// Digits 1-9 represent empty intersections
// ==========================================

import { Color, FEN_PIECE_MAP, STARTING_FEN } from '@repo/shared';
import type { FenData } from '@repo/shared';
import { createEmptyBoard } from '../board';
import { InvalidFenError } from '../errors';

export function parseFen(fen: string): FenData {
  const trimmed = fen.trim();
  if (!trimmed) {
    throw new InvalidFenError('Empty FEN string', fen);
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    throw new InvalidFenError(`FEN must have at least 2 fields, got ${parts.length}`, fen);
  }

  const [boardStr, turnStr, , , halfMoveStr, fullMoveStr] = parts;

  const board = parseBoardString(boardStr ?? '', fen);
  const turn = parseTurn(turnStr ?? 'w', fen);
  const halfMoveClock = halfMoveStr ? parseInt(halfMoveStr, 10) : 0;
  const fullMoveNumber = fullMoveStr ? parseInt(fullMoveStr, 10) : 1;

  return { board, turn, halfMoveClock, fullMoveNumber };
}

function parseBoardString(boardStr: string, originalFen: string): Uint8Array {
  const ranks = boardStr.split('/');
  if (ranks.length !== 10) {
    throw new InvalidFenError(`Board must have exactly 10 ranks, got ${ranks.length}`, originalFen);
  }

  const board = createEmptyBoard();

  // FEN lists ranks from top (row 9) to bottom (row 0)
  for (let rankIdx = 0; rankIdx < 10; rankIdx++) {
    const row = 9 - rankIdx; // rank 0 in FEN = row 9 on board
    const rankStr = ranks[rankIdx] ?? '';
    parseRank(rankStr, row, board, originalFen);
  }

  return board;
}

function parseRank(rankStr: string, row: number, board: Uint8Array, originalFen: string): void {
  let col = 0;
  for (const ch of rankStr) {
    if (col >= 9) {
      throw new InvalidFenError(`Rank ${9 - row} has too many columns`, originalFen);
    }
    const digit = parseInt(ch, 10);
    if (!isNaN(digit)) {
      // Empty squares
      if (digit < 1 || digit > 9) {
        throw new InvalidFenError(`Invalid empty count '${ch}' in rank ${9 - row}`, originalFen);
      }
      col += digit;
    } else {
      const pieceCode = FEN_PIECE_MAP[ch];
      if (pieceCode === undefined) {
        throw new InvalidFenError(`Unknown piece character '${ch}' in rank ${9 - row}`, originalFen);
      }
      board[row * 9 + col] = pieceCode;
      col++;
    }
  }
  if (col !== 9) {
    throw new InvalidFenError(`Rank ${9 - row} has ${col} columns, expected 9`, originalFen);
  }
}

function parseTurn(turnStr: string, originalFen: string): Color {
  if (turnStr === 'w') return Color.RED;
  if (turnStr === 'b') return Color.BLACK;
  throw new InvalidFenError(`Invalid turn '${turnStr}', expected 'w' or 'b'`, originalFen);
}

export function parseFenSafe(fen: string): FenData | null {
  try {
    return parseFen(fen);
  } catch {
    return null;
  }
}

export function validateFen(fen: string): { valid: boolean; error?: string } {
  try {
    parseFen(fen);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}
