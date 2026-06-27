import { BOARD_COLS, BOARD_ROWS } from '../types/board.types';

// Board dimensions
export const BOARD_CELL_COUNT = BOARD_COLS * BOARD_ROWS; // 90

// Palace bounds
export const RED_PALACE_ROW_START = 7;
export const RED_PALACE_ROW_END = 9;
export const BLACK_PALACE_ROW_START = 0;
export const BLACK_PALACE_ROW_END = 2;
export const PALACE_COL_START = 3;
export const PALACE_COL_END = 5;

// River
export const RIVER_RED_SIDE_START = 5; // rows 5-9 are Red's side
export const RIVER_BLACK_SIDE_END = 4; // rows 0-4 are Black's side

// Coordinates
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const;
export const RANKS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export const FILE_MAP: Record<string, number> = {
  a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8,
};

export const COL_TO_FILE: Record<number, string> = {
  0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h', 8: 'i',
};
