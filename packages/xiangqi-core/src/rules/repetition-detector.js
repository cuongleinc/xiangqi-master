"use strict";
// Repetition detection — threefold repetition → draw
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRepetition = isRepetition;
exports.countRepetitions = countRepetitions;
exports.wouldBeRepetition = wouldBeRepetition;
const shared_1 = require("@repo/shared");
const fen_hash_1 = require("../fen/fen-hash");
// Check if the position has appeared 3 times (by normalized FEN)
function isRepetition(positionHistory, currentFen) {
    const normalized = (0, fen_hash_1.normalizeFen)(currentFen);
    const count = countRepetitions(positionHistory, normalized);
    return count >= shared_1.REPETITION_LIMIT;
}
// Count how many times a position appears in history
function countRepetitions(positionHistory, fen) {
    const normalized = (0, fen_hash_1.normalizeFen)(fen);
    let count = 1; // current position counts as 1
    for (const histFen of positionHistory) {
        if ((0, fen_hash_1.normalizeFen)(histFen) === normalized) {
            count++;
        }
    }
    return count;
}
// Check if adding a new position to history would create a repetition
function wouldBeRepetition(positionHistory, newFen) {
    const newHistory = [...positionHistory, newFen];
    return isRepetition(newHistory, newFen);
}
//# sourceMappingURL=repetition-detector.js.map