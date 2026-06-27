"use strict";
// Elephant: 2 steps diagonal, elephant-eye blocking, cannot cross river
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElephantMoves = getElephantMoves;
const board_1 = require("../board");
function getElephantMoves(board, row, col) {
    const piece = (0, board_1.getPiece)(board, row * 9 + col);
    const color = (0, board_1.getColor)(piece);
    if (color === null)
        return [];
    // Each move is 2 steps diagonal with the "eye" at 1 step diagonal
    // Move (dr, dc) = (±2, ±2), eye at (±1, ±1)
    const moves = [];
    const directions = [
        [-2, -2], [-2, 2], [2, -2], [2, 2],
    ];
    for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (!(0, board_1.isValidPosition)(nr, nc))
            continue;
        // Cannot cross river
        if (!(0, board_1.isOnOwnSide)(nr, color))
            continue;
        // Elephant eye blocking: check the midpoint
        const eyeRow = row + dr / 2;
        const eyeCol = col + dc / 2;
        if ((0, board_1.getPiece)(board, eyeRow * 9 + eyeCol) !== 0)
            continue;
        const target = (0, board_1.getPiece)(board, nr * 9 + nc);
        const targetColor = (0, board_1.getColor)(target);
        if (targetColor === color)
            continue;
        moves.push([nr, nc]);
    }
    return moves;
}
//# sourceMappingURL=elephant.js.map