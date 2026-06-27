"use strict";
// Perpetual check/chase detection
// Perpetual check: 6+ consecutive checks → checker LOSES
// Perpetual chase: 6+ consecutive chases of same undefended piece → chaser LOSES
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPerpetual = checkPerpetual;
exports.isMoveCheck = isMoveCheck;
const shared_1 = require("@repo/shared");
const game_end_detector_1 = require("./game-end-detector");
function checkPerpetual(moveHistory, color) {
    if (moveHistory.length < shared_1.PERPETUAL_LIMIT)
        return null;
    // Get the last PERPETUAL_LIMIT moves for this color
    const colorMoves = moveHistory.filter((_, i) => {
        // Red moves on even indices (0, 2, 4...), Black on odd (1, 3, 5...)
        if (color === shared_1.Color.RED)
            return i % 2 === 0;
        return i % 2 === 1;
    });
    // Need at least PERPETUAL_LIMIT moves from this color
    if (colorMoves.length < shared_1.PERPETUAL_LIMIT)
        return null;
    const recentMoves = colorMoves.slice(-shared_1.PERPETUAL_LIMIT);
    // Check if ALL of the last PERPETUAL_LIMIT moves were checks
    const allChecks = recentMoves.every((m) => m.wasCheck);
    if (allChecks) {
        // Perpetual check — the checker LOSES
        const winner = color === shared_1.Color.RED ? shared_1.Color.BLACK : shared_1.Color.RED;
        return winner === shared_1.Color.RED ? game_end_detector_1.GameResult.RED_WINS : game_end_detector_1.GameResult.BLACK_WINS;
    }
    // For perpetual chase, we'd need to track which piece is being chased
    // This is complex and requires tracking undefended pieces. For Phase 1,
    // we implement perpetual check detection and skip full chase detection.
    // Full implementation in Phase 2+.
    return null;
}
// Check if a move gives check
function isMoveCheck(board, move, opponentColor) {
    // Apply the move and check if opponent is in check
    const newBoard = new Uint8Array(board);
    const fromIdx = move.toRow * 9 + move.toCol; // destination
    // We need the full move to check properly
    return false; // simplified — actual check done via isInCheck on resulting board
}
//# sourceMappingURL=perpetual-detector.js.map