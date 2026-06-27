"use strict";
// ==========================================
// FEN Parser: parse WXF FEN string → board + metadata
// FEN format: <board> <turn> <castling> <enpassant> <halfmove> <fullmove>
// Board: 10 ranks from row 9 (top/Black) to row 0 (bottom/Red), separated by /
// Digits 1-9 represent empty intersections
// ==========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFen = parseFen;
exports.parseFenSafe = parseFenSafe;
exports.validateFen = validateFen;
const shared_1 = require("@repo/shared");
const board_1 = require("../board");
const errors_1 = require("../errors");
function parseFen(fen) {
    const trimmed = fen.trim();
    if (!trimmed) {
        throw new errors_1.InvalidFenError('Empty FEN string', fen);
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
        throw new errors_1.InvalidFenError(`FEN must have at least 2 fields, got ${parts.length}`, fen);
    }
    const [boardStr, turnStr, , , halfMoveStr, fullMoveStr] = parts;
    const board = parseBoardString(boardStr ?? '', fen);
    const turn = parseTurn(turnStr ?? 'w', fen);
    const halfMoveClock = halfMoveStr ? parseInt(halfMoveStr, 10) : 0;
    const fullMoveNumber = fullMoveStr ? parseInt(fullMoveStr, 10) : 1;
    return { board, turn, halfMoveClock, fullMoveNumber };
}
function parseBoardString(boardStr, originalFen) {
    const ranks = boardStr.split('/');
    if (ranks.length !== 10) {
        throw new errors_1.InvalidFenError(`Board must have exactly 10 ranks, got ${ranks.length}`, originalFen);
    }
    const board = (0, board_1.createEmptyBoard)();
    // FEN lists ranks from top (row 9) to bottom (row 0)
    for (let rankIdx = 0; rankIdx < 10; rankIdx++) {
        const row = 9 - rankIdx; // rank 0 in FEN = row 9 on board
        const rankStr = ranks[rankIdx] ?? '';
        parseRank(rankStr, row, board, originalFen);
    }
    return board;
}
function parseRank(rankStr, row, board, originalFen) {
    let col = 0;
    for (const ch of rankStr) {
        if (col >= 9) {
            throw new errors_1.InvalidFenError(`Rank ${9 - row} has too many columns`, originalFen);
        }
        const digit = parseInt(ch, 10);
        if (!isNaN(digit)) {
            // Empty squares
            if (digit < 1 || digit > 9) {
                throw new errors_1.InvalidFenError(`Invalid empty count '${ch}' in rank ${9 - row}`, originalFen);
            }
            col += digit;
        }
        else {
            const pieceCode = shared_1.FEN_PIECE_MAP[ch];
            if (pieceCode === undefined) {
                throw new errors_1.InvalidFenError(`Unknown piece character '${ch}' in rank ${9 - row}`, originalFen);
            }
            board[row * 9 + col] = pieceCode;
            col++;
        }
    }
    if (col !== 9) {
        throw new errors_1.InvalidFenError(`Rank ${9 - row} has ${col} columns, expected 9`, originalFen);
    }
}
function parseTurn(turnStr, originalFen) {
    if (turnStr === 'w')
        return shared_1.Color.RED;
    if (turnStr === 'b')
        return shared_1.Color.BLACK;
    throw new errors_1.InvalidFenError(`Invalid turn '${turnStr}', expected 'w' or 'b'`, originalFen);
}
function parseFenSafe(fen) {
    try {
        return parseFen(fen);
    }
    catch {
        return null;
    }
}
function validateFen(fen) {
    try {
        parseFen(fen);
        return { valid: true };
    }
    catch (err) {
        return { valid: false, error: err.message };
    }
}
//# sourceMappingURL=fen-parser.js.map