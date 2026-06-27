"use strict";
// ==========================================
// FEN Generator: board → FEN string
// ==========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFen = generateFen;
exports.generateBoardOnly = generateBoardOnly;
const shared_1 = require("@repo/shared");
function generateFen(board, turn, halfMoveClock = 0, fullMoveNumber = 1) {
    const boardStr = generateBoardString(board);
    const turnStr = turn === shared_1.Color.RED ? 'w' : 'b';
    return `${boardStr} ${turnStr} - - ${halfMoveClock} ${fullMoveNumber}`;
}
function generateBoardString(board) {
    const ranks = [];
    // Generate from top (row 9) to bottom (row 0)
    for (let r = 9; r >= 0; r--) {
        let rankStr = '';
        let emptyCount = 0;
        for (let c = 0; c < 9; c++) {
            const piece = board[r * 9 + c] ?? 0;
            if (piece === 0) {
                emptyCount++;
            }
            else {
                if (emptyCount > 0) {
                    rankStr += emptyCount.toString();
                    emptyCount = 0;
                }
                const fenChar = shared_1.PIECE_CODE_TO_FEN[piece];
                if (fenChar === undefined) {
                    throw new Error(`Invalid piece code at (${r},${c}): ${piece}`);
                }
                rankStr += fenChar;
            }
        }
        if (emptyCount > 0) {
            rankStr += emptyCount.toString();
        }
        ranks.push(rankStr);
    }
    return ranks.join('/');
}
function generateBoardOnly(board) {
    return generateBoardString(board);
}
//# sourceMappingURL=fen-generator.js.map