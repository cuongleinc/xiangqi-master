"use strict";
// Move types and UCCI coordinate conversion
Object.defineProperty(exports, "__esModule", { value: true });
exports.ucciToMove = ucciToMove;
exports.moveToUcci = moveToUcci;
exports.moveToDisplay = moveToDisplay;
exports.moveEquals = moveEquals;
const shared_1 = require("@repo/shared");
const board_1 = require("../board");
// UCCI format: "h2e2" (fromFile fromRank toFile toRank)
// Files: a-i (0-8), Ranks: 0-9
function ucciToMove(ucci, board) {
    if (ucci.length !== 4)
        return null;
    const fromFile = shared_1.FILE_MAP[ucci[0]];
    const fromRank = parseInt(ucci[1], 10);
    const toFile = shared_1.FILE_MAP[ucci[2]];
    const toRank = parseInt(ucci[3], 10);
    if (fromFile === undefined || toFile === undefined)
        return null;
    if (isNaN(fromRank) || isNaN(toRank))
        return null;
    if (!(0, board_1.isValidPosition)(fromRank, fromFile))
        return null;
    if (!(0, board_1.isValidPosition)(toRank, toFile))
        return null;
    const fromIdx = (0, board_1.indexFromRowCol)(fromRank, fromFile);
    const toIdx = (0, board_1.indexFromRowCol)(toRank, toFile);
    const piece = (0, board_1.getPiece)(board, fromIdx);
    if (piece === 0)
        return null;
    const captured = (0, board_1.getPiece)(board, toIdx);
    return {
        fromRow: fromRank,
        fromCol: fromFile,
        toRow: toRank,
        toCol: toFile,
        piece,
        captured: captured === 0 ? undefined : captured,
    };
}
function moveToUcci(move) {
    const fromFile = shared_1.COL_TO_FILE[move.fromCol];
    const toFile = shared_1.COL_TO_FILE[move.toCol];
    if (!fromFile || !toFile) {
        throw new Error(`Invalid move: ${JSON.stringify(move)}`);
    }
    return `${fromFile}${move.fromRow}${toFile}${move.toRow}`;
}
function moveToDisplay(move) {
    const ucci = moveToUcci(move);
    const capture = move.captured ? 'x' : '-';
    return `${ucci}${capture}`;
}
function moveEquals(a, b) {
    return (a.fromRow === b.fromRow &&
        a.fromCol === b.fromCol &&
        a.toRow === b.toRow &&
        a.toCol === b.toCol);
}
//# sourceMappingURL=move-types.js.map