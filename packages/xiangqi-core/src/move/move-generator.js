"use strict";
// Move generator — generates all pseudo-legal moves for a color
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePseudoLegalMoves = generatePseudoLegalMoves;
exports.generateLegalMoves = generateLegalMoves;
exports.generateCaptures = generateCaptures;
const shared_1 = require("@repo/shared");
const board_1 = require("../board");
const king_1 = require("../pieces/king");
const advisor_1 = require("../pieces/advisor");
const elephant_1 = require("../pieces/elephant");
const horse_1 = require("../pieces/horse");
const chariot_1 = require("../pieces/chariot");
const cannon_1 = require("../pieces/cannon");
const soldier_1 = require("../pieces/soldier");
// Generate all pseudo-legal moves (before filtering self-check)
function generatePseudoLegalMoves(board, color) {
    const pieces = (0, board_1.findPieces)(board, color);
    const moves = [];
    for (const pos of pieces) {
        const [row, col] = (0, board_1.rowColFromIndex)(pos);
        const piece = (0, board_1.getPiece)(board, pos);
        const type = (0, board_1.getType)(piece);
        if (type === null)
            continue;
        const destinations = getPieceDestinations(board, row, col, type);
        for (const [dr, dc] of destinations) {
            const toIdx = (0, board_1.indexFromRowCol)(dr, dc);
            const captured = (0, board_1.getPiece)(board, toIdx);
            moves.push({
                fromRow: row,
                fromCol: col,
                toRow: dr,
                toCol: dc,
                piece,
                captured: captured === 0 ? undefined : captured,
            });
        }
    }
    return moves;
}
function getPieceDestinations(board, row, col, type) {
    switch (type) {
        case shared_1.PieceType.KING: return (0, king_1.getKingMoves)(board, row, col);
        case shared_1.PieceType.ADVISOR: return (0, advisor_1.getAdvisorMoves)(board, row, col);
        case shared_1.PieceType.ELEPHANT: return (0, elephant_1.getElephantMoves)(board, row, col);
        case shared_1.PieceType.HORSE: return (0, horse_1.getHorseMoves)(board, row, col);
        case shared_1.PieceType.CHARIOT: return (0, chariot_1.getChariotMoves)(board, row, col);
        case shared_1.PieceType.CANNON: return (0, cannon_1.getCannonMoves)(board, row, col);
        case shared_1.PieceType.SOLDIER: return (0, soldier_1.getSoldierMoves)(board, row, col);
    }
}
// Generate only legal moves (filter out self-check and Flying General)
function generateLegalMoves(board, color) {
    const pseudoMoves = generatePseudoLegalMoves(board, color);
    return pseudoMoves.filter((move) => !wouldBeIllegal(board, move, color));
}
// Generate only captures
function generateCaptures(board, color) {
    return generateLegalMoves(board, color).filter((m) => m.captured !== undefined);
}
// Check if a move leaves own king in check or creates Flying General
function wouldBeIllegal(board, move, color) {
    // Apply the move
    const newBoard = new Uint8Array(board);
    const fromIdx = (0, board_1.indexFromRowCol)(move.fromRow, move.fromCol);
    const toIdx = (0, board_1.indexFromRowCol)(move.toRow, move.toCol);
    newBoard[toIdx] = move.piece;
    newBoard[fromIdx] = 0;
    // Check if own king is in check after the move
    if (isKingInCheck(newBoard, color))
        return true;
    // Check Flying General after the move
    if (isFlyingGeneralAfterMove(newBoard))
        return true;
    return false;
}
// Check if the given color's king is in check
function isKingInCheck(board, color) {
    const opponentColor = color === shared_1.Color.RED ? shared_1.Color.BLACK : shared_1.Color.RED;
    const kingPos = findKingIndex(board, color);
    if (kingPos === null)
        return true; // no king = in check (shouldn't happen)
    const opponentMoves = generatePseudoLegalMoves(board, opponentColor);
    for (const move of opponentMoves) {
        if (move.toRow * 9 + move.toCol === kingPos)
            return true;
    }
    return false;
}
function findKingIndex(board, color) {
    const kingCode = color === shared_1.Color.RED ? 1 : 8;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === kingCode)
            return i;
    }
    return null;
}
// Check Flying General on a board (after a move is applied)
function isFlyingGeneralAfterMove(board) {
    const redKingIdx = findKingIndex(board, shared_1.Color.RED);
    const blackKingIdx = findKingIndex(board, shared_1.Color.BLACK);
    if (redKingIdx === null || blackKingIdx === null)
        return false;
    const redCol = redKingIdx % 9;
    const blackCol = blackKingIdx % 9;
    if (redCol !== blackCol)
        return false;
    const redRow = Math.floor(redKingIdx / 9);
    const blackRow = Math.floor(blackKingIdx / 9);
    const minRow = Math.min(redRow, blackRow);
    const maxRow = Math.max(redRow, blackRow);
    for (let r = minRow + 1; r < maxRow; r++) {
        if (board[r * 9 + redCol] !== 0)
            return false;
    }
    return true; // Flying General violation
}
//# sourceMappingURL=move-generator.js.map