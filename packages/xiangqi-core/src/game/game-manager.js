"use strict";
// Game Manager — orchestrates a full game of Xiangqi
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const shared_1 = require("@repo/shared");
const game_state_1 = require("./game-state");
const move_validator_1 = require("../move/move-validator");
const move_executor_1 = require("../move/move-executor");
const move_types_1 = require("../move/move-types");
const move_generator_1 = require("../move/move-generator");
const check_detector_1 = require("../rules/check-detector");
const game_end_detector_1 = require("../rules/game-end-detector");
const perpetual_detector_1 = require("../rules/perpetual-detector");
const fen_hash_1 = require("../fen/fen-hash");
const fen_parser_1 = require("../fen/fen-parser");
class GameManager {
    state;
    constructor(fen) {
        if (fen) {
            this.state = (0, game_state_1.createGameStateFromFen)(fen);
        }
        else {
            this.state = (0, game_state_1.createInitialGameState)();
        }
    }
    // Attempt to make a move. Returns result describing what happened.
    makeMove(ucci) {
        if (this.state.status !== game_end_detector_1.GameResult.PLAYING) {
            return {
                success: false,
                error: `Game is already over: ${this.state.status}`,
                gameResult: this.state.status,
            };
        }
        const move = (0, move_validator_1.validateMove)(this.state.board, ucci, this.state.turn);
        if (!move) {
            return {
                success: false,
                error: `Illegal move: ${ucci}`,
            };
        }
        // Determine if it's a capture or soldier move (resets halfmove clock)
        const isCapture = move.captured !== undefined;
        const isSoldierMove = move.piece === 7 || move.piece === 14;
        // Apply the move
        const newBoard = (0, move_executor_1.applyMove)(this.state.board, move);
        const fenBefore = (0, game_state_1.gameStateToFen)(this.state);
        // Record move
        const moveRecord = {
            fen: fenBefore,
            board: new Uint8Array(this.state.board),
            uci: ucci,
            wasCheck: false, // checked after applying
        };
        // Update state
        this.state.board = newBoard;
        this.state.turn = this.state.turn === shared_1.Color.RED ? shared_1.Color.BLACK : shared_1.Color.RED;
        // Update clocks
        if (isCapture || isSoldierMove) {
            this.state.halfMoveClock = 0;
        }
        else {
            this.state.halfMoveClock++;
        }
        if (this.state.turn === shared_1.Color.RED) {
            this.state.fullMoveNumber++;
        }
        // Record move in history
        const fenAfter = (0, game_state_1.gameStateToFen)(this.state);
        this.state.positionHistory.push((0, fen_hash_1.normalizeFen)(fenAfter));
        this.state.moveHistory.push(moveRecord);
        // Check if the move gives check
        const isCheck = (0, check_detector_1.isInCheck)(this.state.board, this.state.turn);
        // Check perpetual
        const perpetualResult = (0, perpetual_detector_1.checkPerpetual)(this.state.moveHistory, this.state.turn === shared_1.Color.RED ? shared_1.Color.BLACK : shared_1.Color.RED);
        if (perpetualResult && perpetualResult !== game_end_detector_1.GameResult.PLAYING) {
            this.state.status = perpetualResult;
            return {
                success: true,
                fen: fenAfter,
                move: ucci,
                isCheck: true,
                isMate: false,
                isStalemate: false,
                isDraw: false,
                gameResult: perpetualResult,
                captured: move.captured,
            };
        }
        // Check game end
        const endCheck = (0, game_end_detector_1.checkGameEnd)(this.state.board, this.state.turn, this.state.halfMoveClock, this.state.positionHistory);
        if (endCheck.status !== game_end_detector_1.GameResult.PLAYING) {
            this.state.status = endCheck.status;
            this.state.result = endCheck.reason;
            const isMate = endCheck.reason === 'checkmate';
            const isStalemate = endCheck.reason === 'stalemate';
            const isDraw = endCheck.status === game_end_detector_1.GameResult.DRAW;
            return {
                success: true,
                fen: fenAfter,
                move: ucci,
                isCheck,
                isMate,
                isStalemate,
                isDraw,
                gameResult: this.state.status,
                captured: move.captured,
            };
        }
        return {
            success: true,
            fen: fenAfter,
            move: ucci,
            isCheck,
            isMate: false,
            isStalemate: false,
            isDraw: false,
            captured: move.captured,
        };
    }
    // Get all legal moves for current side as UCCI strings
    getLegalMoves() {
        return (0, move_generator_1.generateLegalMoves)(this.state.board, this.state.turn).map((m) => (0, move_types_1.moveToUcci)(m));
    }
    // Get current FEN
    getFen() {
        return (0, game_state_1.gameStateToFen)(this.state);
    }
    // Get current state (immutable snapshot)
    getState() {
        return { ...this.state, board: new Uint8Array(this.state.board) };
    }
    // Is game over?
    isGameOver() {
        return this.state.status !== game_end_detector_1.GameResult.PLAYING;
    }
    // Undo last move (for analysis)
    undoMove() {
        if (this.state.moveHistory.length === 0)
            return null;
        const lastRecord = this.state.moveHistory.pop();
        this.state.positionHistory.pop();
        // Restore board from move record
        const fenParsed = (0, fen_parser_1.parseFen)(lastRecord.fen);
        this.state.board = fenParsed.board;
        this.state.turn = fenParsed.turn;
        this.state.halfMoveClock = fenParsed.halfMoveClock;
        this.state.fullMoveNumber = fenParsed.fullMoveNumber;
        this.state.status = game_end_detector_1.GameResult.PLAYING;
        this.state.result = undefined;
        return lastRecord;
    }
    // Get move history
    getMoveHistory() {
        return [...this.state.moveHistory];
    }
    // Get the current board
    getBoard() {
        return new Uint8Array(this.state.board);
    }
    // Get current turn
    getTurn() {
        return this.state.turn;
    }
    // Reset to initial state
    reset(fen) {
        if (fen) {
            this.state = (0, game_state_1.createGameStateFromFen)(fen);
        }
        else {
            this.state = (0, game_state_1.createInitialGameState)();
        }
    }
}
exports.GameManager = GameManager;
//# sourceMappingURL=game-manager.js.map