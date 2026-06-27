"use strict";
// Advisor: 1 step diagonal, palace restricted
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdvisorMoves = getAdvisorMoves;
const board_1 = require("../board");
function getAdvisorMoves(board, row, col) {
    const piece = (0, board_1.getPiece)(board, row * 9 + col);
    const color = (0, board_1.getColor)(piece);
    if (color === null)
        return [];
    const directions = [
        [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
    const moves = [];
    for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (!(0, board_1.isValidPosition)(nr, nc))
            continue;
        if (!(0, board_1.isInPalace)(nr, nc, color))
            continue;
        const target = (0, board_1.getPiece)(board, nr * 9 + nc);
        const targetColor = (0, board_1.getColor)(target);
        if (targetColor === color)
            continue;
        moves.push([nr, nc]);
    }
    return moves;
}
//# sourceMappingURL=advisor.js.map