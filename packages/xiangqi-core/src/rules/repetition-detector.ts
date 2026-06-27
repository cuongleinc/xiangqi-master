// Repetition detection — threefold repetition → draw

import { REPETITION_LIMIT } from '@repo/shared';
import { normalizeFen } from '../fen/fen-hash';

// Check if the position has appeared 3 times (by normalized FEN)
export function isRepetition(positionHistory: string[], currentFen: string): boolean {
  const normalized = normalizeFen(currentFen);
  const count = countRepetitions(positionHistory, normalized);
  return count >= REPETITION_LIMIT;
}

// Count how many times a position appears in history
export function countRepetitions(positionHistory: string[], fen: string): number {
  const normalized = normalizeFen(fen);
  let count = 1; // current position counts as 1
  for (const histFen of positionHistory) {
    if (normalizeFen(histFen) === normalized) {
      count++;
    }
  }
  return count;
}

// Check if adding a new position to history would create a repetition
export function wouldBeRepetition(positionHistory: string[], newFen: string): boolean {
  const newHistory = [...positionHistory, newFen];
  return isRepetition(newHistory, newFen);
}
