"use strict";
// Move validator — checks if a move is legal
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMove = validateMove;
exports.isMoveLegal = isMoveLegal;
exports.isUciMoveLegal = isUciMoveLegal;
const board_1 = require("../board");
const move_generator_1 = require("./move-generator");
const move_types_1 = require("./move-types");
// Validate a UCCI string against the position
function validateMove(board, ucci, color) {
    const move = (0, move_types_1.ucciToMove)(ucci, board);
    if (move === null)
        return null;
    // Check piece exists and belongs to the right color
    const piece = (0, board_1.getPiece)(board, (0, board_1.indexFromRowCol)(move.fromRow, move.fromCol));
    const pieceColor = (0, board_1.getColor)(piece);
    if (pieceColor !== color)
        return null;
    // Check the move is in the legal moves list
    if (!isMoveLegal(board, move, color))
        return null;
    return move;
}
// Check if a Move object is legal
function isMoveLegal(board, move, color) {
    const legalMoves = (0, move_generator_1.generateLegalMoves)(board, color);
    return legalMoves.some((m) => (0, move_types_1.moveEquals)(m, move));
}
// Quick check: is the UCCI move a legal move for the given color?
function isUciMoveLegal(board, ucci, color) {
    return validateMove(board, ucci, color) !== null;
}
//# sourceMappingURL=move-validator.js.map