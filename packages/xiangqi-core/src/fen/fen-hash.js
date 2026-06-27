"use strict";
// ==========================================
// FEN hashing — normalize FEN for caching
// Strip move counters to get position-only FEN
// ==========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFen = normalizeFen;
exports.positionFen = positionFen;
exports.hashFen = hashFen;
exports.cacheKey = cacheKey;
const fen_generator_1 = require("./fen-generator");
const shared_1 = require("@repo/shared");
// Get normalized position FEN (board + turn only, no move counters)
function normalizeFen(fen) {
    const parts = fen.trim().split(/\s+/);
    if (parts.length < 2)
        return fen;
    return `${parts[0]} ${parts[1]}`;
}
// Get a position-only FEN from board + turn
function positionFen(board, turn) {
    return `${(0, fen_generator_1.generateBoardOnly)(board)} ${turn === shared_1.Color.RED ? 'w' : 'b'}`;
}
// Simple hash function for caching (DJB2)
function hashFen(fen) {
    const normalized = normalizeFen(fen);
    let hash = 5381;
    for (let i = 0; i < normalized.length; i++) {
        hash = ((hash << 5) + hash + normalized.charCodeAt(i)) | 0;
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}
// Get cache key from board + turn
function cacheKey(board, turn) {
    const posFen = positionFen(board, turn);
    return hashFen(posFen);
}
//# sourceMappingURL=fen-hash.js.map