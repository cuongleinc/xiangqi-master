"use strict";
// Xiangqi-related errors
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameOverError = exports.IllegalMoveError = exports.InvalidFenError = void 0;
class InvalidFenError extends Error {
    fen;
    constructor(message, fen) {
        super(`Invalid FEN: ${message}${fen ? ` (FEN: ${fen})` : ''}`);
        this.fen = fen;
        this.name = 'InvalidFenError';
    }
}
exports.InvalidFenError = InvalidFenError;
class IllegalMoveError extends Error {
    ucci;
    constructor(message, ucci) {
        super(`Illegal move: ${message}${ucci ? ` (UCCI: ${ucci})` : ''}`);
        this.ucci = ucci;
        this.name = 'IllegalMoveError';
    }
}
exports.IllegalMoveError = IllegalMoveError;
class GameOverError extends Error {
    constructor(message) {
        super(`Game over: ${message}`);
        this.name = 'GameOverError';
    }
}
exports.GameOverError = GameOverError;
//# sourceMappingURL=errors.js.map