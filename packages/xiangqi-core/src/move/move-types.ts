// Move types and UCCI coordinate conversion

import { Color, COL_TO_FILE, FILE_MAP } from '@repo/shared';
import { getPiece, getColor, indexFromRowCol, isValidPosition } from '../board';

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  piece: number; // piece code that's moving
  captured?: number; // piece code that's captured (0 if none)
}

// UCCI format: "h2e2" (fromFile fromRank toFile toRank)
// Files: a-i (0-8), Ranks: 0-9

export function ucciToMove(ucci: string, board: Uint8Array): Move | null {
  if (ucci.length !== 4) return null;

  const fromFile = FILE_MAP[ucci[0]!];
  const fromRank = parseInt(ucci[1]!, 10);
  const toFile = FILE_MAP[ucci[2]!];
  const toRank = parseInt(ucci[3]!, 10);

  if (fromFile === undefined || toFile === undefined) return null;
  if (isNaN(fromRank) || isNaN(toRank)) return null;
  if (!isValidPosition(fromRank, fromFile)) return null;
  if (!isValidPosition(toRank, toFile)) return null;

  const fromIdx = indexFromRowCol(fromRank, fromFile);
  const toIdx = indexFromRowCol(toRank, toFile);
  const piece = getPiece(board, fromIdx);

  if (piece === 0) return null;

  const captured = getPiece(board, toIdx);

  return {
    fromRow: fromRank,
    fromCol: fromFile,
    toRow: toRank,
    toCol: toFile,
    piece,
    captured: captured === 0 ? undefined : captured,
  };
}

export function moveToUcci(move: Move): string {
  const fromFile = COL_TO_FILE[move.fromCol];
  const toFile = COL_TO_FILE[move.toCol];
  if (!fromFile || !toFile) {
    throw new Error(`Invalid move: ${JSON.stringify(move)}`);
  }
  return `${fromFile}${move.fromRow}${toFile}${move.toRow}`;
}

export function moveToDisplay(move: Move): string {
  const ucci = moveToUcci(move);
  const capture = move.captured ? 'x' : '-';
  return `${ucci}${capture}`;
}

export function moveEquals(a: Move, b: Move): boolean {
  return (
    a.fromRow === b.fromRow &&
    a.fromCol === b.fromCol &&
    a.toRow === b.toRow &&
    a.toCol === b.toCol
  );
}

export interface MoveGenerationResult {
  moves: Move[];
  isCheck: boolean;
}
