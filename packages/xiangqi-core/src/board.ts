// ==========================================
// Board representation: Uint8Array(90)
// Index = row * 9 + col (row 0-9, col 0-8)
// 0 = empty
// Red:   KING=1, ADVISOR=2, ELEPHANT=3, HORSE=4, CHARIOT=5, CANNON=6, SOLDIER=7
// Black: KING=8, ADVISOR=9, ELEPHANT=10, HORSE=11, CHARIOT=12, CANNON=13, SOLDIER=14
// ==========================================

import { PieceCode, PieceType, Color } from '@repo/shared';
import type { PieceInfo } from '@repo/shared';

export function createEmptyBoard(): Uint8Array {
  return new Uint8Array(90);
}

export function startingBoard(): Uint8Array {
  const b = createEmptyBoard();
  // Black back rank (row 9)
  b[9 * 9 + 0] = PieceCode.BLACK_CHARIOT;  // a9
  b[9 * 9 + 1] = PieceCode.BLACK_HORSE;    // b9
  b[9 * 9 + 2] = PieceCode.BLACK_ELEPHANT; // c9
  b[9 * 9 + 3] = PieceCode.BLACK_ADVISOR;  // d9
  b[9 * 9 + 4] = PieceCode.BLACK_KING;     // e9
  b[9 * 9 + 5] = PieceCode.BLACK_ADVISOR;  // f9
  b[9 * 9 + 6] = PieceCode.BLACK_ELEPHANT; // g9
  b[9 * 9 + 7] = PieceCode.BLACK_HORSE;    // h9
  b[9 * 9 + 8] = PieceCode.BLACK_CHARIOT;  // i9
  // Black cannons (row 7)
  b[7 * 9 + 1] = PieceCode.BLACK_CANNON;   // b7
  b[7 * 9 + 7] = PieceCode.BLACK_CANNON;   // h7
  // Black soldiers (row 6)
  b[6 * 9 + 0] = PieceCode.BLACK_SOLDIER;  // a6
  b[6 * 9 + 2] = PieceCode.BLACK_SOLDIER;  // c6
  b[6 * 9 + 4] = PieceCode.BLACK_SOLDIER;  // e6
  b[6 * 9 + 6] = PieceCode.BLACK_SOLDIER;  // g6
  b[6 * 9 + 8] = PieceCode.BLACK_SOLDIER;  // i6
  // Red soldiers (row 3)
  b[3 * 9 + 0] = PieceCode.RED_SOLDIER;    // a3
  b[3 * 9 + 2] = PieceCode.RED_SOLDIER;    // c3
  b[3 * 9 + 4] = PieceCode.RED_SOLDIER;    // e3
  b[3 * 9 + 6] = PieceCode.RED_SOLDIER;    // g3
  b[3 * 9 + 8] = PieceCode.RED_SOLDIER;    // i3
  // Red cannons (row 2)
  b[2 * 9 + 1] = PieceCode.RED_CANNON;     // b2
  b[2 * 9 + 7] = PieceCode.RED_CANNON;     // h2
  // Red back rank (row 0)
  b[0 * 9 + 0] = PieceCode.RED_CHARIOT;    // a0
  b[0 * 9 + 1] = PieceCode.RED_HORSE;      // b0
  b[0 * 9 + 2] = PieceCode.RED_ELEPHANT;   // c0
  b[0 * 9 + 3] = PieceCode.RED_ADVISOR;    // d0
  b[0 * 9 + 4] = PieceCode.RED_KING;       // e0
  b[0 * 9 + 5] = PieceCode.RED_ADVISOR;    // f0
  b[0 * 9 + 6] = PieceCode.RED_ELEPHANT;   // g0
  b[0 * 9 + 7] = PieceCode.RED_HORSE;      // h0
  b[0 * 9 + 8] = PieceCode.RED_CHARIOT;    // i0
  return b;
}

export function getPiece(board: Uint8Array, pos: number): number {
  return board[pos] ?? 0;
}

export function setPiece(board: Uint8Array, pos: number, piece: number): Uint8Array {
  const newBoard = new Uint8Array(board);
  newBoard[pos] = piece;
  return newBoard;
}

export function removePiece(board: Uint8Array, pos: number): Uint8Array {
  return setPiece(board, pos, 0);
}

export function getPieceInfo(pieceCode: number): PieceInfo | null {
  if (pieceCode === 0) return null;
  if (pieceCode >= 1 && pieceCode <= 7) {
    return { type: codeToType(pieceCode), color: Color.RED };
  }
  return { type: codeToType(pieceCode - 7), color: Color.BLACK };
}

function codeToType(code: number): PieceType {
  switch (code) {
    case 1: return PieceType.KING;
    case 2: return PieceType.ADVISOR;
    case 3: return PieceType.ELEPHANT;
    case 4: return PieceType.HORSE;
    case 5: return PieceType.CHARIOT;
    case 6: return PieceType.CANNON;
    case 7: return PieceType.SOLDIER;
    default: throw new Error(`Invalid piece code: ${code}`);
  }
}

export function makePieceCode(type: PieceType, color: Color): number {
  const base = typeToCode(type);
  return color === Color.RED ? base : base + 7;
}

function typeToCode(type: PieceType): number {
  switch (type) {
    case PieceType.KING: return 1;
    case PieceType.ADVISOR: return 2;
    case PieceType.ELEPHANT: return 3;
    case PieceType.HORSE: return 4;
    case PieceType.CHARIOT: return 5;
    case PieceType.CANNON: return 6;
    case PieceType.SOLDIER: return 7;
  }
}

export function getColor(piece: number): Color | null {
  if (piece === 0) return null;
  return piece <= 7 ? Color.RED : Color.BLACK;
}

export function getType(piece: number): PieceType | null {
  if (piece === 0) return null;
  const code = piece <= 7 ? piece : piece - 7;
  return codeToType(code);
}

export function indexFromRowCol(row: number, col: number): number {
  return row * 9 + col;
}

export function rowColFromIndex(idx: number): [number, number] {
  return [Math.floor(idx / 9), idx % 9];
}

export function cloneBoard(board: Uint8Array): Uint8Array {
  return new Uint8Array(board);
}

export function boardEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function countPieces(board: Uint8Array, color: Color): number {
  let count = 0;
  const offset = color === Color.RED ? 1 : 8;
  for (let i = 0; i < board.length; i++) {
    const p = board[i] ?? 0;
    if (p >= offset && p <= offset + 6) count++;
  }
  return count;
}

export function findKing(board: Uint8Array, color: Color): number | null {
  const kingCode = color === Color.RED ? PieceCode.RED_KING : PieceCode.BLACK_KING;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === kingCode) return i;
  }
  return null;
}

export function findPieces(board: Uint8Array, color: Color): number[] {
  const positions: number[] = [];
  const offset = color === Color.RED ? 1 : 8;
  for (let i = 0; i < board.length; i++) {
    const p = board[i] ?? 0;
    if (p >= offset && p <= offset + 6) positions.push(i);
  }
  return positions;
}

// Palace checks
// Red King at row 0 → Red palace is rows 0-2 (bottom)
// Black King at row 9 → Black palace is rows 7-9 (top)
export function isInRedPalace(row: number, col: number): boolean {
  return row >= 0 && row <= 2 && col >= 3 && col <= 5;
}

export function isInBlackPalace(row: number, col: number): boolean {
  return row >= 7 && row <= 9 && col >= 3 && col <= 5;
}

export function isInPalace(row: number, col: number, color: Color): boolean {
  return color === Color.RED ? isInRedPalace(row, col) : isInBlackPalace(row, col);
}

// River / side checks
// Red at bottom (rows 0-4), Black at top (rows 5-9)
export function isOnRedSide(row: number): boolean {
  return row >= 0 && row <= 4;
}

export function isOnBlackSide(row: number): boolean {
  return row >= 5 && row <= 9;
}

export function isOnOwnSide(row: number, color: Color): boolean {
  return color === Color.RED ? isOnRedSide(row) : isOnBlackSide(row);
}

export function hasCrossedRiver(row: number, color: Color): boolean {
  if (color === Color.RED) {
    // Red moves UP (row increases toward Black). Crossed river = row >= 5
    return row >= 5;
  }
  // Black moves DOWN (row decreases toward Red). Crossed river = row <= 4
  return row <= 4;
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row <= 9 && col >= 0 && col <= 8;
}
