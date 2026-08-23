// ==========================================
// Board → screen coordinate mapping
// ==========================================
//
// The engine stores rows 0-9 with Red's back rank at row 0 and Black's at
// row 9 (see xiangqi-core/board.ts). SVG y grows downward, so drawing row 0
// at y = padding would seat Red at the TOP of the screen.
//
// Standard Xiangqi presentation puts Red at the bottom and Black at the top,
// so every board row is mirrored vertically on its way to the screen. Columns
// are unaffected — file `a` stays on the left.
//
// Every board overlay must route its coordinates through these two helpers so
// the orientation stays defined in exactly one place.

export const BOARD_ROWS = 10;
export const BOARD_COLS = 9;

/**
 * Mirror a board row (0 = Red back rank) to a screen row (0 = top).
 * Self-inverse: applying it twice returns the original row.
 */
export function toScreenRow(row: number): number {
  return BOARD_ROWS - 1 - row;
}

/** SVG x for a board column. */
export function colToX(col: number, cellSize: number, padding: number): number {
  return padding + col * cellSize;
}

/** SVG y for a board row — mirrored so Red renders at the bottom. */
export function rowToY(row: number, cellSize: number, padding: number): number {
  return padding + toScreenRow(row) * cellSize;
}
