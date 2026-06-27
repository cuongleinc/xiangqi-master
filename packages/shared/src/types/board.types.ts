// ==========================================
// Board types
// ==========================================

import type { Color } from './pieces.types';

export const BOARD_COLS = 9;
export const BOARD_ROWS = 10;
export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS; // 90

export interface Position {
  row: number; // 0-9 (0 = Red's back rank)
  col: number; // 0-8 (a-i)
}

export interface BoardSquare {
  index: number; // 0-89 (row * 9 + col)
  piece: number; // piece code (0 = empty)
}

// FEN-related types
export interface FenData {
  board: Uint8Array;
  turn: Color;
  halfMoveClock: number;
  fullMoveNumber: number;
}

// Starting position FEN
export const STARTING_FEN =
  'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR w - - 0 1';
