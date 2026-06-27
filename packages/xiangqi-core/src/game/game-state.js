"use strict";
// Game state — immutable state container
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialGameState = createInitialGameState;
exports.createGameStateFromFen = createGameStateFromFen;
exports.gameStateToFen = gameStateToFen;
const shared_1 = require("@repo/shared");
const board_1 = require("../board");
const fen_parser_1 = require("../fen/fen-parser");
const fen_generator_1 = require("../fen/fen-generator");
const fen_hash_1 = require("../fen/fen-hash");
const game_end_detector_1 = require("../rules/game-end-detector");
function createInitialGameState() {
    const board = (0, board_1.startingBoard)();
    const fen = (0, fen_generator_1.generateFen)(board, shared_1.Color.RED);
    return {
        board,
        turn: shared_1.Color.RED,
        halfMoveClock: 0,
        fullMoveNumber: 1,
        moveHistory: [],
        positionHistory: [(0, fen_hash_1.normalizeFen)(fen)],
        status: game_end_detector_1.GameResult.PLAYING,
    };
}
function createGameStateFromFen(fen) {
    const parsed = (0, fen_parser_1.parseFen)(fen);
    return {
        board: parsed.board,
        turn: parsed.turn,
        halfMoveClock: parsed.halfMoveClock,
        fullMoveNumber: parsed.fullMoveNumber,
        moveHistory: [],
        positionHistory: [(0, fen_hash_1.normalizeFen)(fen)],
        status: game_end_detector_1.GameResult.PLAYING,
    };
}
function gameStateToFen(state) {
    return (0, fen_generator_1.generateFen)(state.board, state.turn, state.halfMoveClock, state.fullMoveNumber);
}
//# sourceMappingURL=game-state.js.map