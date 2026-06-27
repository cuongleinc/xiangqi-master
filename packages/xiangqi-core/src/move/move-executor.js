"use strict";
// Move executor — apply a move to a board and return new board
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMove = applyMove;
exports.undoMove = undoMove;
exports.applyUciMove = applyUciMove;
const board_1 = require("../board");
// Apply a move to the board, return new board state
function applyMove(board, move) {
    const newBoard = new Uint8Array(board);
    const fromIdx = (0, board_1.indexFromRowCol)(move.fromRow, move.fromCol);
    const toIdx = (0, board_1.indexFromRowCol)(move.toRow, move.toCol);
    newBoard[toIdx] = move.piece;
    newBoard[fromIdx] = 0;
    return newBoard;
}
// Undo a move (restore previous state)
function undoMove(board, move) {
    const newBoard = new Uint8Array(board);
    const fromIdx = (0, board_1.indexFromRowCol)(move.fromRow, move.fromCol);
    const toIdx = (0, board_1.indexFromRowCol)(move.toRow, move.toCol);
    newBoard[fromIdx] = move.piece;
    newBoard[toIdx] = move.captured ?? 0;
    return newBoard;
}
// Apply a UCCI move string
function applyUciMove(board, ucci, move) {
    return applyMove(board, move);
}
//# sourceMappingURL=move-executor.js.map