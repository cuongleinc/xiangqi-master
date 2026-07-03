// Move classifier — classify moves based on evaluation delta

import { MoveClassification, Color, DEFAULT_THRESHOLDS } from '@repo/shared';
import type { ClassificationThresholds } from '@repo/shared';

/**
 * Classify a move's quality by comparing the position evaluation before and
 * after the move was played.
 *
 * @param evalAfter  — engine evaluation of the position AFTER the move was played.
 *                     This eval is from the perspective of the NEW side-to-move
 *                     (the opponent of the player who made the move).
 * @param evalBefore — engine evaluation of the position BEFORE the move was played.
 *                     This eval is from the perspective of the player who made the move.
 * @param color      — the color of the player who made the move.
 * @param thresholds — classification cutoffs (in centipawns).
 */
export function classifyMove(
  evalAfter: number,
  evalBefore: number,
  _color: Color,
  thresholds: ClassificationThresholds = DEFAULT_THRESHOLDS,
): MoveClassification {
  // Convert both evals to the perspective of the player who moved.
  // evalBefore is already from the player's perspective (they were to move).
  // evalAfter is from the NEW side-to-move (always the opponent), so we
  // must ALWAYS negate it to get the player's perspective.
  const playerEvalBefore = evalBefore;
  const playerEvalAfter = -evalAfter;

  // Centipawn loss: how much worse the actual position is vs. before
  const cpLoss = playerEvalBefore - playerEvalAfter;

  // A negative cpLoss means the position improved (e.g. the player was losing
  // but found a good move). Treat that as BEST.
  if (cpLoss <= 0) return MoveClassification.BEST;

  if (cpLoss <= thresholds.bestCp) return MoveClassification.BEST;
  if (cpLoss <= thresholds.excellentCp) return MoveClassification.EXCELLENT;
  if (cpLoss <= thresholds.goodCp) return MoveClassification.GOOD;
  if (cpLoss <= thresholds.inaccuracyCp) return MoveClassification.INACCURACY;
  if (cpLoss <= thresholds.mistakeCp) return MoveClassification.MISTAKE;
  return MoveClassification.BLUNDER;
}

// Calculate accuracy percentage based on centipawn loss per move
export function calculateAccuracy(cpLosses: number[]): number {
  if (cpLosses.length === 0) return 100;

  const totalCpLoss = cpLosses.reduce((sum, loss) => sum + loss, 0);
  // Convert cp loss to accuracy: ~10 cp loss = 1% accuracy reduction
  const accuracy = Math.max(0, 100 - (totalCpLoss / cpLosses.length) / 10);
  return Math.round(accuracy * 10) / 10; // 1 decimal place
}

// Calculate accuracy from classification counts (weighted method)
export function calculateAccuracyFromClassifications(counts: Record<MoveClassification, number>, totalMoves: number): number {
  if (totalMoves === 0) return 100;

  const penalty =
    (counts[MoveClassification.BLUNDER] || 0) * 60 +
    (counts[MoveClassification.MISTAKE] || 0) * 30 +
    (counts[MoveClassification.INACCURACY] || 0) * 15 +
    (counts[MoveClassification.GOOD] || 0) * 5;

  const accuracy = Math.max(0, 100 - penalty / totalMoves);
  return Math.round(accuracy * 10) / 10;
}
