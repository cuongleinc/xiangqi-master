// Move classifier — classify moves based on evaluation delta

import { MoveClassification, Color, DEFAULT_THRESHOLDS } from '@repo/shared';
import type { ClassificationThresholds } from '@repo/shared';

// Classify a move based on eval delta from the best move
export function classifyMove(
  evalAfter: number,
  bestEval: number,
  color: Color,
  thresholds: ClassificationThresholds = DEFAULT_THRESHOLDS,
): MoveClassification {
  // Positive score = Red advantage
  // For Black, we negate so that positive = advantage for the playing side
  const perspectiveEvalAfter = color === Color.RED ? evalAfter : -evalAfter;
  const perspectiveBestEval = color === Color.RED ? bestEval : -bestEval;

  // Centipawn loss: how much worse this move is compared to best
  const cpLoss = Math.abs(perspectiveBestEval - perspectiveEvalAfter);

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
