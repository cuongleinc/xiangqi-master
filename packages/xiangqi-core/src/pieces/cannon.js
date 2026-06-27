"use strict";
// Cannon: orthogonal slide for non-capture; exactly one piece (screen) between for capture
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCannonMoves = getCannonMoves;
const board_1 = require("../board");
function getCannonMoves(board, row, col) {
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
        let screenFound = false;
        while ((0, board_1.isValidPosition)(nr, nc)) {
            const target = (0, board_1.getPiece)(board, nr * 9 + nc);
            const targetColor = (0, board_1.getColor)(target);
            if (!screenFound) {
                // Before screen: can only move to empty squares (non-capture move)
                if (targetColor === null) {
                    moves.push([nr, nc]);
                }
                else {
                    // Found the screen piece
                    screenFound = true;
                }
            }
            else {
                // After screen: can only capture (first piece found)
                if (targetColor !== null) {
                    if (targetColor !== color) {
                        // Enemy piece — capture!
                        moves.push([nr, nc]);
                    }
                    // Whether own or enemy, stop after first piece
                    break;
                }
            }
            nr += dr;
            nc += dc;
        }
    }
    return moves;
}
//# sourceMappingURL=cannon.js.map