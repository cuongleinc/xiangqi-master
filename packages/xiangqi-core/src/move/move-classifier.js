"use strict";
// Move classifier — classify moves based on evaluation delta
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyMove = classifyMove;
exports.calculateAccuracy = calculateAccuracy;
exports.calculateAccuracyFromClassifications = calculateAccuracyFromClassifications;
const shared_1 = require("@repo/shared");
// Classify a move based on eval delta from the best move
function classifyMove(evalAfter, bestEval, color, thresholds = shared_1.DEFAULT_THRESHOLDS) {
    // Positive score = Red advantage
    // For Black, we negate so that positive = advantage for the playing side
    const perspectiveEvalAfter = color === shared_1.Color.RED ? evalAfter : -evalAfter;
    const perspectiveBestEval = color === shared_1.Color.RED ? bestEval : -bestEval;
    // Centipawn loss: how much worse this move is compared to best
    const cpLoss = Math.abs(perspectiveBestEval - perspectiveEvalAfter);
    if (cpLoss <= thresholds.bestCp)
        return shared_1.MoveClassification.BEST;
    if (cpLoss <= thresholds.excellentCp)
        return shared_1.MoveClassification.EXCELLENT;
    if (cpLoss <= thresholds.goodCp)
        return shared_1.MoveClassification.GOOD;
    if (cpLoss <= thresholds.inaccuracyCp)
        return shared_1.MoveClassification.INACCURACY;
    if (cpLoss <= thresholds.mistakeCp)
        return shared_1.MoveClassification.MISTAKE;
    return shared_1.MoveClassification.BLUNDER;
}
// Calculate accuracy percentage based on centipawn loss per move
function calculateAccuracy(cpLosses) {
    if (cpLosses.length === 0)
        return 100;
    const totalCpLoss = cpLosses.reduce((sum, loss) => sum + loss, 0);
    // Convert cp loss to accuracy: ~10 cp loss = 1% accuracy reduction
    const accuracy = Math.max(0, 100 - (totalCpLoss / cpLosses.length) / 10);
    return Math.round(accuracy * 10) / 10; // 1 decimal place
}
// Calculate accuracy from classification counts (weighted method)
function calculateAccuracyFromClassifications(counts, totalMoves) {
    if (totalMoves === 0)
        return 100;
    const penalty = (counts[shared_1.MoveClassification.BLUNDER] || 0) * 60 +
        (counts[shared_1.MoveClassification.MISTAKE] || 0) * 30 +
        (counts[shared_1.MoveClassification.INACCURACY] || 0) * 15 +
        (counts[shared_1.MoveClassification.GOOD] || 0) * 5;
    const accuracy = Math.max(0, 100 - penalty / totalMoves);
    return Math.round(accuracy * 10) / 10;
}
//# sourceMappingURL=move-classifier.js.map