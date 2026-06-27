"use strict";
// ==========================================
// Board representation: Uint8Array(90)
// Index = row * 9 + col (row 0-9, col 0-8)
// 0 = empty
// Red:   KING=1, ADVISOR=2, ELEPHANT=3, HORSE=4, CHARIOT=5, CANNON=6, SOLDIER=7
// Black: KING=8, ADVISOR=9, ELEPHANT=10, HORSE=11, CHARIOT=12, CANNON=13, SOLDIER=14
// ==========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyBoard = createEmptyBoard;
exports.startingBoard = startingBoard;
exports.getPiece = getPiece;
exports.setPiece = setPiece;
exports.removePiece = removePiece;
exports.getPieceInfo = getPieceInfo;
exports.makePieceCode = makePieceCode;
exports.getColor = getColor;
exports.getType = getType;
exports.indexFromRowCol = indexFromRowCol;
exports.rowColFromIndex = rowColFromIndex;
exports.cloneBoard = cloneBoard;
exports.boardEquals = boardEquals;
exports.countPieces = countPieces;
exports.findKing = findKing;
exports.findPieces = findPieces;
exports.isInRedPalace = isInRedPalace;
exports.isInBlackPalace = isInBlackPalace;
exports.isInPalace = isInPalace;
exports.isOnRedSide = isOnRedSide;
exports.isOnBlackSide = isOnBlackSide;
exports.isOnOwnSide = isOnOwnSide;
exports.hasCrossedRiver = hasCrossedRiver;
exports.isValidPosition = isValidPosition;
const shared_1 = require("@repo/shared");
function createEmptyBoard() {
    return new Uint8Array(90);
}
function startingBoard() {
    const b = createEmptyBoard();
    // Black back rank (row 9)
    b[9 * 9 + 0] = shared_1.PieceCode.BLACK_CHARIOT; // a9
    b[9 * 9 + 1] = shared_1.PieceCode.BLACK_HORSE; // b9
    b[9 * 9 + 2] = shared_1.PieceCode.BLACK_ELEPHANT; // c9
    b[9 * 9 + 3] = shared_1.PieceCode.BLACK_ADVISOR; // d9
    b[9 * 9 + 4] = shared_1.PieceCode.BLACK_KING; // e9
    b[9 * 9 + 5] = shared_1.PieceCode.BLACK_ADVISOR; // f9
    b[9 * 9 + 6] = shared_1.PieceCode.BLACK_ELEPHANT; // g9
    b[9 * 9 + 7] = shared_1.PieceCode.BLACK_HORSE; // h9
    b[9 * 9 + 8] = shared_1.PieceCode.BLACK_CHARIOT; // i9
    // Black cannons (row 7)
    b[7 * 9 + 1] = shared_1.PieceCode.BLACK_CANNON; // b7
    b[7 * 9 + 7] = shared_1.PieceCode.BLACK_CANNON; // h7
    // Black soldiers (row 6)
    b[6 * 9 + 0] = shared_1.PieceCode.BLACK_SOLDIER; // a6
    b[6 * 9 + 2] = shared_1.PieceCode.BLACK_SOLDIER; // c6
    b[6 * 9 + 4] = shared_1.PieceCode.BLACK_SOLDIER; // e6
    b[6 * 9 + 6] = shared_1.PieceCode.BLACK_SOLDIER; // g6
    b[6 * 9 + 8] = shared_1.PieceCode.BLACK_SOLDIER; // i6
    // Red soldiers (row 3)
    b[3 * 9 + 0] = shared_1.PieceCode.RED_SOLDIER; // a3
    b[3 * 9 + 2] = shared_1.PieceCode.RED_SOLDIER; // c3
    b[3 * 9 + 4] = shared_1.PieceCode.RED_SOLDIER; // e3
    b[3 * 9 + 6] = shared_1.PieceCode.RED_SOLDIER; // g3
    b[3 * 9 + 8] = shared_1.PieceCode.RED_SOLDIER; // i3
    // Red cannons (row 2)
    b[2 * 9 + 1] = shared_1.PieceCode.RED_CANNON; // b2
    b[2 * 9 + 7] = shared_1.PieceCode.RED_CANNON; // h2
    // Red back rank (row 0)
    b[0 * 9 + 0] = shared_1.PieceCode.RED_CHARIOT; // a0
    b[0 * 9 + 1] = shared_1.PieceCode.RED_HORSE; // b0
    b[0 * 9 + 2] = shared_1.PieceCode.RED_ELEPHANT; // c0
    b[0 * 9 + 3] = shared_1.PieceCode.RED_ADVISOR; // d0
    b[0 * 9 + 4] = shared_1.PieceCode.RED_KING; // e0
    b[0 * 9 + 5] = shared_1.PieceCode.RED_ADVISOR; // f0
    b[0 * 9 + 6] = shared_1.PieceCode.RED_ELEPHANT; // g0
    b[0 * 9 + 7] = shared_1.PieceCode.RED_HORSE; // h0
    b[0 * 9 + 8] = shared_1.PieceCode.RED_CHARIOT; // i0
    return b;
}
function getPiece(board, pos) {
    return board[pos] ?? 0;
}
function setPiece(board, pos, piece) {
    const newBoard = new Uint8Array(board);
    newBoard[pos] = piece;
    return newBoard;
}
function removePiece(board, pos) {
    return setPiece(board, pos, 0);
}
function getPieceInfo(pieceCode) {
    if (pieceCode === 0)
        return null;
    if (pieceCode >= 1 && pieceCode <= 7) {
        return { type: codeToType(pieceCode), color: shared_1.Color.RED };
    }
    return { type: codeToType(pieceCode - 7), color: shared_1.Color.BLACK };
}
function codeToType(code) {
    switch (code) {
        case 1: return shared_1.PieceType.KING;
        case 2: return shared_1.PieceType.ADVISOR;
        case 3: return shared_1.PieceType.ELEPHANT;
        case 4: return shared_1.PieceType.HORSE;
        case 5: return shared_1.PieceType.CHARIOT;
        case 6: return shared_1.PieceType.CANNON;
        case 7: return shared_1.PieceType.SOLDIER;
        default: throw new Error(`Invalid piece code: ${code}`);
    }
}
function makePieceCode(type, color) {
    const base = typeToCode(type);
    return color === shared_1.Color.RED ? base : base + 7;
}
function typeToCode(type) {
    switch (type) {
        case shared_1.PieceType.KING: return 1;
        case shared_1.PieceType.ADVISOR: return 2;
        case shared_1.PieceType.ELEPHANT: return 3;
        case shared_1.PieceType.HORSE: return 4;
        case shared_1.PieceType.CHARIOT: return 5;
        case shared_1.PieceType.CANNON: return 6;
        case shared_1.PieceType.SOLDIER: return 7;
    }
}
function getColor(piece) {
    if (piece === 0)
        return null;
    return piece <= 7 ? shared_1.Color.RED : shared_1.Color.BLACK;
}
function getType(piece) {
    if (piece === 0)
        return null;
    const code = piece <= 7 ? piece : piece - 7;
    return codeToType(code);
}
function indexFromRowCol(row, col) {
    return row * 9 + col;
}
function rowColFromIndex(idx) {
    return [Math.floor(idx / 9), idx % 9];
}
function cloneBoard(board) {
    return new Uint8Array(board);
}
function boardEquals(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
function countPieces(board, color) {
    let count = 0;
    const offset = color === shared_1.Color.RED ? 1 : 8;
    for (let i = 0; i < board.length; i++) {
        const p = board[i] ?? 0;
        if (p >= offset && p <= offset + 6)
            count++;
    }
    return count;
}
function findKing(board, color) {
    const kingCode = color === shared_1.Color.RED ? shared_1.PieceCode.RED_KING : shared_1.PieceCode.BLACK_KING;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === kingCode)
            return i;
    }
    return null;
}
function findPieces(board, color) {
    const positions = [];
    const offset = color === shared_1.Color.RED ? 1 : 8;
    for (let i = 0; i < board.length; i++) {
        const p = board[i] ?? 0;
        if (p >= offset && p <= offset + 6)
            positions.push(i);
    }
    return positions;
}
// Palace checks
function isInRedPalace(row, col) {
    return row >= 7 && row <= 9 && col >= 3 && col <= 5;
}
function isInBlackPalace(row, col) {
    return row >= 0 && row <= 2 && col >= 3 && col <= 5;
}
function isInPalace(row, col, color) {
    return color === shared_1.Color.RED ? isInRedPalace(row, col) : isInBlackPalace(row, col);
}
// River / side checks
function isOnRedSide(row) {
    return row >= 5 && row <= 9;
}
function isOnBlackSide(row) {
    return row >= 0 && row <= 4;
}
function isOnOwnSide(row, color) {
    return color === shared_1.Color.RED ? isOnRedSide(row) : isOnBlackSide(row);
}
function hasCrossedRiver(row, color) {
    if (color === shared_1.Color.RED) {
        // Red soldiers move up (row decreases). Crossed river = row <= 4
        return row <= 4;
    }
    // Black soldiers move down (row increases). Crossed river = row >= 5
    return row >= 5;
}
function isValidPosition(row, col) {
    return row >= 0 && row <= 9 && col >= 0 && col <= 8;
}
//# sourceMappingURL=board.js.map