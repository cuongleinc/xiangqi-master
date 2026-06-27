"use strict";
// Horse: L-shape (1 orthogonal + 1 diagonal), horse-leg blocking at orthogonal step
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHorseMoves = getHorseMoves;
const board_1 = require("../board");
function getHorseMoves(board, row, col) {
    const piece = (0, board_1.getPiece)(board, row * 9 + col);
    const color = (0, board_1.getColor)(piece);
    if (color === null)
        return [];
    // Each move is defined as [dr, dc, legRow, legCol]
    // The leg is the orthogonal step that must be empty
    const moveDefs = [
        // Moving "up" (-row): leg at (row-1, col)
        [-2, -1, -1, 0],
        [-2, 1, -1, 0],
        // Moving "down" (+row): leg at (row+1, col)
        [2, -1, 1, 0],
        [2, 1, 1, 0],
        // Moving "left" (-col): leg at (row, col-1)
        [-1, -2, 0, -1],
        [1, -2, 0, -1],
        // Moving "right" (+col): leg at (row, col+1)
        [-1, 2, 0, 1],
        [1, 2, 0, 1],
    ];
    const moves = [];
    for (const [dr, dc, legDr, legDc] of moveDefs) {
        const nr = row + dr;
        const nc = col + dc;
        if (!(0, board_1.isValidPosition)(nr, nc))
            continue;
        // Horse-leg blocking: the orthogonal leg must be empty
        const legRow = row + legDr;
        const legCol = col + legDc;
        if ((0, board_1.getPiece)(board, legRow * 9 + legCol) !== 0)
            continue;
        const target = (0, board_1.getPiece)(board, nr * 9 + nc);
        const targetColor = (0, board_1.getColor)(target);
        if (targetColor === color)
            continue;
        moves.push([nr, nc]);
    }
    return moves;
}
//# sourceMappingURL=horse.js.map