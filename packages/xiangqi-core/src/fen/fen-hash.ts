// ==========================================
// FEN hashing — normalize FEN for caching
// Strip move counters to get position-only FEN
// ==========================================

import { generateFen, generateBoardOnly } from './fen-generator';
import { parseFen } from './fen-parser';
import { Color } from '@repo/shared';

// Get normalized position FEN (board + turn only, no move counters)
export function normalizeFen(fen: string): string {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 2) return fen;
  return `${parts[0]} ${parts[1]}`;
}

// Get a position-only FEN from board + turn
export function positionFen(board: Uint8Array, turn: Color): string {
  return `${generateBoardOnly(board)} ${turn === Color.RED ? 'w' : 'b'}`;
}

// Simple hash function for caching (DJB2)
export function hashFen(fen: string): string {
  const normalized = normalizeFen(fen);
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// Get cache key from board + turn
export function cacheKey(board: Uint8Array, turn: Color): string {
  const posFen = positionFen(board, turn);
  return hashFen(posFen);
}
