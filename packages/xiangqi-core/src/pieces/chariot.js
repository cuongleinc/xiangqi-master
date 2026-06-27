"use strict";
// Chariot: orthogonal slide, blocked by first piece (can capture it if enemy)
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChariotMoves = getChariotMoves;
const board_1 = require("../board");
function getChariotMoves(board, row, col) {
    const piece = (0, board_1.getPiece)(board, row * 9 + col);
    const color = (0, board_1.getColor)(piece);
    if (color === null)
        return [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
    ];
    const moves = [];
    for (const [dr, dc] of directions) {
        let nr = row + dr;
        let nc = col + dc;
        while ((0, board_1.isValidPosition)(nr, nc)) {
            const target = (0, board_1.getPiece)(board, nr * 9 + nc);
            const targetColor = (0, board_1.getColor)(target);
            if (targetColor === null) {
                // Empty square — can move here
                moves.push([nr, nc]);
            }
            else if (targetColor !== color) {
                // Enemy piece — can capture
                moves.push([nr, nc]);
                break; // blocked after capture
            }
            else {
                // Own piece — blocked
                break;
            }
            nr += dr;
            nc += dc;
        }
    }
    return moves;
}
//# sourceMappingURL=chariot.js.map