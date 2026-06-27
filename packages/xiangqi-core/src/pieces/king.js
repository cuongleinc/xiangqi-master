"use strict";
// King: 1 step orthogonal, palace restricted, Flying General attack
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKingMoves = getKingMoves;
exports.isFlyingGeneralViolation = isFlyingGeneralViolation;
const shared_1 = require("@repo/shared");
const board_1 = require("../board");
function getKingMoves(board, row, col) {
    const piece = (0, board_1.getPiece)(board, row * 9 + col);
    const color = (0, board_1.getColor)(piece);
    if (color === null)
        return [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
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
        // Can't capture own pieces
        if (targetColor === color)
            continue;
        // Check if moving to this square would violate Flying General
        // (we check this at a higher level with full validation)
        moves.push([nr, nc]);
    }
    // Flying General: King can "capture" opposing king if on same column with no pieces between
    // This is enforced as a check, not a direct capture move
    // The actual Flying General check is in check-detector.ts
    return moves;
}
// Check if two kings are facing each other on the same column with nothing between
function isFlyingGeneralViolation(board) {
    const redKingPos = (0, board_1.findKing)(board, shared_1.Color.RED);
    const blackKingPos = (0, board_1.findKing)(board, shared_1.Color.BLACK);
    if (redKingPos === null || blackKingPos === null)
        return false;
    const redCol = redKingPos % 9;
    const blackCol = blackKingPos % 9;
    // Must be on same column
    if (redCol !== blackCol)
        return false;
    const redRow = Math.floor(redKingPos / 9);
    const blackRow = Math.floor(blackKingPos / 9);
    // Check all squares between the two kings
    const minRow = Math.min(redRow, blackRow);
    const maxRow = Math.max(redRow, blackRow);
    for (let r = minRow + 1; r < maxRow; r++) {
        if ((0, board_1.getPiece)(board, r * 9 + redCol) !== 0) {
            // Piece between them — no violation
            return false;
        }
    }
    // No pieces between — Flying General violation
    return true;
}
//# sourceMappingURL=king.js.map