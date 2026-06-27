"use strict";
// Soldier: forward only before river; forward + left + right after river; never backward
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSoldierMoves = getSoldierMoves;
const shared_1 = require("@repo/shared");
const board_1 = require("../board");
function getSoldierMoves(board, row, col) {
    const piece = (0, board_1.getPiece)(board, row * 9 + col);
    const color = (0, board_1.getColor)(piece);
    if (color === null)
        return [];
    const moves = [];
    const crossed = (0, board_1.hasCrossedRiver)(row, color);
    if (color === shared_1.Color.RED) {
        // Red moves UP (row decreases)
        // Forward (always allowed)
        checkAndAdd(board, color, moves, row - 1, col);
        if (crossed) {
            // Left and right after crossing river
            checkAndAdd(board, color, moves, row, col - 1);
            checkAndAdd(board, color, moves, row, col + 1);
        }
    }
    else {
        // Black moves DOWN (row increases)
        // Forward (always allowed)
        checkAndAdd(board, color, moves, row + 1, col);
        if (crossed) {
            // Left and right after crossing river
            checkAndAdd(board, color, moves, row, col - 1);
            checkAndAdd(board, color, moves, row, col + 1);
        }
    }
    return moves;
}
function checkAndAdd(board, color, moves, row, col) {
    if (!(0, board_1.isValidPosition)(row, col))
        return;
    const target = (0, board_1.getPiece)(board, row * 9 + col);
    const targetColor = (0, board_1.getColor)(target);
    if (targetColor === color)
        return;
    moves.push([row, col]);
}
//# sourceMappingURL=soldier.js.map