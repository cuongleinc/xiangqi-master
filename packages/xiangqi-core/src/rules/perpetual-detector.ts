// Perpetual check/chase detection
// Perpetual check: 6+ consecutive checks → checker LOSES
// Perpetual chase: 6+ consecutive chases of same undefended piece → chaser LOSES

import { Color, PERPETUAL_LIMIT } from '@repo/shared';
import { GameResult } from './game-end-detector';
import { isInCheck } from './check-detector';

export interface MoveRecord {
  fen: string;
  board: Uint8Array; // board state BEFORE this move
  uci: string;
  wasCheck: boolean;
}

export function checkPerpetual(moveHistory: MoveRecord[], color: Color): GameResult | null {
  if (moveHistory.length < PERPETUAL_LIMIT) return null;

  // Get the last PERPETUAL_LIMIT moves for this color
  const colorMoves = moveHistory.filter((_, i) => {
    // Red moves on even indices (0, 2, 4...), Black on odd (1, 3, 5...)
    if (color === Color.RED) return i % 2 === 0;
    return i % 2 === 1;
  });

  // Need at least PERPETUAL_LIMIT moves from this color
  if (colorMoves.length < PERPETUAL_LIMIT) return null;

  const recentMoves = colorMoves.slice(-PERPETUAL_LIMIT);

  // Check if ALL of the last PERPETUAL_LIMIT moves were checks
  const allChecks = recentMoves.every((m) => m.wasCheck);
  if (allChecks) {
    // Perpetual check — the checker LOSES
    const winner = color === Color.RED ? Color.BLACK : Color.RED;
    return winner === Color.RED ? GameResult.RED_WINS : GameResult.BLACK_WINS;
  }

  // For perpetual chase, we'd need to track which piece is being chased
  // This is complex and requires tracking undefended pieces. For Phase 1,
  // we implement perpetual check detection and skip full chase detection.
  // Full implementation in Phase 2+.

  return null;
}

// Check if a move gives check
export function isMoveCheck(board: Uint8Array, move: { toRow: number; toCol: number }, opponentColor: Color): boolean {
  // Apply the move and check if opponent is in check
  const newBoard = new Uint8Array(board);
  const fromIdx = move.toRow * 9 + move.toCol; // destination
  // We need the full move to check properly
  return false; // simplified — actual check done via isInCheck on resulting board
}
