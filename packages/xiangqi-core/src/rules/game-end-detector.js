"use strict";
// Game end detection — checkmate, stalemate, draw conditions
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameResult = void 0;
exports.checkGameEnd = checkGameEnd;
exports.isCheckmate = isCheckmate;
exports.isStalemate = isStalemate;
const shared_1 = require("@repo/shared");
const move_generator_1 = require("../move/move-generator");
const check_detector_1 = require("./check-detector");
const repetition_detector_1 = require("./repetition-detector");
var GameResult;
(function (GameResult) {
    GameResult["PLAYING"] = "playing";
    GameResult["RED_WINS"] = "red_wins";
    GameResult["BLACK_WINS"] = "black_wins";
    GameResult["DRAW"] = "draw";
})(GameResult || (exports.GameResult = GameResult = {}));
// Check all game end conditions
function checkGameEnd(board, colorToMove, halfMoveClock, positionHistory) {
    // Check for checkmate or stalemate
    const legalMoves = (0, move_generator_1.generateLegalMoves)(board, colorToMove);
    const inCheck = (0, check_detector_1.isInCheck)(board, colorToMove);
    if (legalMoves.length === 0) {
        if (inCheck) {
            // Checkmate — the side to move loses
            const winner = colorToMove === shared_1.Color.RED ? shared_1.Color.BLACK : shared_1.Color.RED;
            return {
                status: winner === shared_1.Color.RED ? GameResult.RED_WINS : GameResult.BLACK_WINS,
                reason: 'checkmate',
            };
        }
        else {
            // Stalemate — the side to move LOSES in Xiangqi (not a draw!)
            const winner = colorToMove === shared_1.Color.RED ? shared_1.Color.BLACK : shared_1.Color.RED;
            return {
                status: winner === shared_1.Color.RED ? GameResult.RED_WINS : GameResult.BLACK_WINS,
                reason: 'stalemate',
            };
        }
    }
    // Check no-capture / no-soldier-advance rule (60 half-moves)
    if (halfMoveClock >= shared_1.FIFTY_MOVE_LIMIT) {
        return {
            status: GameResult.DRAW,
            reason: 'fifty_move',
        };
    }
    // Check threefold repetition
    if (positionHistory.length > 0) {
        const lastFen = positionHistory[positionHistory.length - 1];
        if (lastFen && (0, repetition_detector_1.isRepetition)(positionHistory, lastFen)) {
            return {
                status: GameResult.DRAW,
                reason: 'repetition',
            };
        }
    }
    return { status: GameResult.PLAYING };
}
// Is it checkmate? (in check AND no legal moves)
function isCheckmate(board, color) {
    return (0, check_detector_1.isInCheck)(board, color) && (0, move_generator_1.generateLegalMoves)(board, color).length === 0;
}
// Is it stalemate? (no legal moves AND not in check → LOSS in Xiangqi)
function isStalemate(board, color) {
    return !(0, check_detector_1.isInCheck)(board, color) && (0, move_generator_1.generateLegalMoves)(board, color).length === 0;
}
//# sourceMappingURL=game-end-detector.js.map