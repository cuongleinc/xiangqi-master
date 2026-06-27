"use strict";
// Check detection
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInCheck = isInCheck;
exports.findCheckers = findCheckers;
exports.isSelfCheckAfter = isSelfCheckAfter;
const shared_1 = require("@repo/shared");
const board_1 = require("../board");
const move_generator_1 = require("../move/move-generator");
const king_1 = require("../pieces/king");
// Is the given color in check?
function isInCheck(board, color) {
    const kingPos = (0, board_1.findKing)(board, color);
    if (kingPos === null)
        return false;
    const opponentColor = color === shared_1.Color.RED ? shared_1.Color.BLACK : shared_1.Color.RED;
    const opponentMoves = (0, move_generator_1.generatePseudoLegalMoves)(board, opponentColor);
    // Check if any opponent move can capture the king
    for (const move of opponentMoves) {
        if (move.toRow * 9 + move.toCol === kingPos)
            return true;
    }
    // Check Flying General
    if ((0, king_1.isFlyingGeneralViolation)(board))
        return true;
    return false;
}
// Find pieces that are checking the given color's king
function findCheckers(board, color) {
    const kingPos = (0, board_1.findKing)(board, color);
    if (kingPos === null)
        return [];
    const opponentColor = color === shared_1.Color.RED ? shared_1.Color.BLACK : shared_1.Color.RED;
    const opponentMoves = (0, move_generator_1.generatePseudoLegalMoves)(board, opponentColor);
    const checkers = [];
    const seen = new Set();
    for (const move of opponentMoves) {
        if (move.toRow * 9 + move.toCol === kingPos) {
            const fromIdx = move.fromRow * 9 + move.fromCol;
            if (!seen.has(fromIdx)) {
                checkers.push(fromIdx);
                seen.add(fromIdx);
            }
        }
    }
    return checkers;
}
// Check if after a move, the moving side is still in check (self-check)
function isSelfCheckAfter(board, move, color) {
    // Apply the move on a copy
    const newBoard = new Uint8Array(board);
    newBoard[move.fromRow * 9 + move.fromCol] = 0;
    newBoard[move.toRow * 9 + move.toCol] = move.piece;
    return isInCheck(newBoard, color);
}
//# sourceMappingURL=check-detector.js.map