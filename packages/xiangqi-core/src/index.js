"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameOverError = exports.IllegalMoveError = exports.InvalidFenError = exports.GameManager = exports.gameStateToFen = exports.createGameStateFromFen = exports.createInitialGameState = exports.checkPerpetual = exports.wouldBeRepetition = exports.countRepetitions = exports.isRepetition = exports.GameResult = exports.isStalemate = exports.isCheckmate = exports.checkGameEnd = exports.isSelfCheckAfter = exports.findCheckers = exports.isInCheck = exports.calculateAccuracyFromClassifications = exports.calculateAccuracy = exports.classifyMove = exports.undoMove = exports.applyMove = exports.isUciMoveLegal = exports.isMoveLegal = exports.validateMove = exports.generateCaptures = exports.generateLegalMoves = exports.generatePseudoLegalMoves = exports.moveEquals = exports.moveToDisplay = exports.moveToUcci = exports.ucciToMove = exports.getSoldierMoves = exports.getCannonMoves = exports.getChariotMoves = exports.getHorseMoves = exports.getElephantMoves = exports.getAdvisorMoves = exports.isFlyingGeneralViolation = exports.getKingMoves = exports.positionFen = exports.cacheKey = exports.hashFen = exports.normalizeFen = exports.generateBoardOnly = exports.generateFen = exports.validateFen = exports.parseFenSafe = exports.parseFen = void 0;
// Board
__exportStar(require("./board"), exports);
// FEN
var fen_parser_1 = require("./fen/fen-parser");
Object.defineProperty(exports, "parseFen", { enumerable: true, get: function () { return fen_parser_1.parseFen; } });
Object.defineProperty(exports, "parseFenSafe", { enumerable: true, get: function () { return fen_parser_1.parseFenSafe; } });
Object.defineProperty(exports, "validateFen", { enumerable: true, get: function () { return fen_parser_1.validateFen; } });
var fen_generator_1 = require("./fen/fen-generator");
Object.defineProperty(exports, "generateFen", { enumerable: true, get: function () { return fen_generator_1.generateFen; } });
Object.defineProperty(exports, "generateBoardOnly", { enumerable: true, get: function () { return fen_generator_1.generateBoardOnly; } });
var fen_hash_1 = require("./fen/fen-hash");
Object.defineProperty(exports, "normalizeFen", { enumerable: true, get: function () { return fen_hash_1.normalizeFen; } });
Object.defineProperty(exports, "hashFen", { enumerable: true, get: function () { return fen_hash_1.hashFen; } });
Object.defineProperty(exports, "cacheKey", { enumerable: true, get: function () { return fen_hash_1.cacheKey; } });
Object.defineProperty(exports, "positionFen", { enumerable: true, get: function () { return fen_hash_1.positionFen; } });
// Pieces
var king_1 = require("./pieces/king");
Object.defineProperty(exports, "getKingMoves", { enumerable: true, get: function () { return king_1.getKingMoves; } });
Object.defineProperty(exports, "isFlyingGeneralViolation", { enumerable: true, get: function () { return king_1.isFlyingGeneralViolation; } });
var advisor_1 = require("./pieces/advisor");
Object.defineProperty(exports, "getAdvisorMoves", { enumerable: true, get: function () { return advisor_1.getAdvisorMoves; } });
var elephant_1 = require("./pieces/elephant");
Object.defineProperty(exports, "getElephantMoves", { enumerable: true, get: function () { return elephant_1.getElephantMoves; } });
var horse_1 = require("./pieces/horse");
Object.defineProperty(exports, "getHorseMoves", { enumerable: true, get: function () { return horse_1.getHorseMoves; } });
var chariot_1 = require("./pieces/chariot");
Object.defineProperty(exports, "getChariotMoves", { enumerable: true, get: function () { return chariot_1.getChariotMoves; } });
var cannon_1 = require("./pieces/cannon");
Object.defineProperty(exports, "getCannonMoves", { enumerable: true, get: function () { return cannon_1.getCannonMoves; } });
var soldier_1 = require("./pieces/soldier");
Object.defineProperty(exports, "getSoldierMoves", { enumerable: true, get: function () { return soldier_1.getSoldierMoves; } });
// Move
var move_types_1 = require("./move/move-types");
Object.defineProperty(exports, "ucciToMove", { enumerable: true, get: function () { return move_types_1.ucciToMove; } });
Object.defineProperty(exports, "moveToUcci", { enumerable: true, get: function () { return move_types_1.moveToUcci; } });
Object.defineProperty(exports, "moveToDisplay", { enumerable: true, get: function () { return move_types_1.moveToDisplay; } });
Object.defineProperty(exports, "moveEquals", { enumerable: true, get: function () { return move_types_1.moveEquals; } });
var move_generator_1 = require("./move/move-generator");
Object.defineProperty(exports, "generatePseudoLegalMoves", { enumerable: true, get: function () { return move_generator_1.generatePseudoLegalMoves; } });
Object.defineProperty(exports, "generateLegalMoves", { enumerable: true, get: function () { return move_generator_1.generateLegalMoves; } });
Object.defineProperty(exports, "generateCaptures", { enumerable: true, get: function () { return move_generator_1.generateCaptures; } });
var move_validator_1 = require("./move/move-validator");
Object.defineProperty(exports, "validateMove", { enumerable: true, get: function () { return move_validator_1.validateMove; } });
Object.defineProperty(exports, "isMoveLegal", { enumerable: true, get: function () { return move_validator_1.isMoveLegal; } });
Object.defineProperty(exports, "isUciMoveLegal", { enumerable: true, get: function () { return move_validator_1.isUciMoveLegal; } });
var move_executor_1 = require("./move/move-executor");
Object.defineProperty(exports, "applyMove", { enumerable: true, get: function () { return move_executor_1.applyMove; } });
Object.defineProperty(exports, "undoMove", { enumerable: true, get: function () { return move_executor_1.undoMove; } });
var move_classifier_1 = require("./move/move-classifier");
Object.defineProperty(exports, "classifyMove", { enumerable: true, get: function () { return move_classifier_1.classifyMove; } });
Object.defineProperty(exports, "calculateAccuracy", { enumerable: true, get: function () { return move_classifier_1.calculateAccuracy; } });
Object.defineProperty(exports, "calculateAccuracyFromClassifications", { enumerable: true, get: function () { return move_classifier_1.calculateAccuracyFromClassifications; } });
// Rules
var check_detector_1 = require("./rules/check-detector");
Object.defineProperty(exports, "isInCheck", { enumerable: true, get: function () { return check_detector_1.isInCheck; } });
Object.defineProperty(exports, "findCheckers", { enumerable: true, get: function () { return check_detector_1.findCheckers; } });
Object.defineProperty(exports, "isSelfCheckAfter", { enumerable: true, get: function () { return check_detector_1.isSelfCheckAfter; } });
var game_end_detector_1 = require("./rules/game-end-detector");
Object.defineProperty(exports, "checkGameEnd", { enumerable: true, get: function () { return game_end_detector_1.checkGameEnd; } });
Object.defineProperty(exports, "isCheckmate", { enumerable: true, get: function () { return game_end_detector_1.isCheckmate; } });
Object.defineProperty(exports, "isStalemate", { enumerable: true, get: function () { return game_end_detector_1.isStalemate; } });
Object.defineProperty(exports, "GameResult", { enumerable: true, get: function () { return game_end_detector_1.GameResult; } });
var repetition_detector_1 = require("./rules/repetition-detector");
Object.defineProperty(exports, "isRepetition", { enumerable: true, get: function () { return repetition_detector_1.isRepetition; } });
Object.defineProperty(exports, "countRepetitions", { enumerable: true, get: function () { return repetition_detector_1.countRepetitions; } });
Object.defineProperty(exports, "wouldBeRepetition", { enumerable: true, get: function () { return repetition_detector_1.wouldBeRepetition; } });
var perpetual_detector_1 = require("./rules/perpetual-detector");
Object.defineProperty(exports, "checkPerpetual", { enumerable: true, get: function () { return perpetual_detector_1.checkPerpetual; } });
// Game
var game_state_1 = require("./game/game-state");
Object.defineProperty(exports, "createInitialGameState", { enumerable: true, get: function () { return game_state_1.createInitialGameState; } });
Object.defineProperty(exports, "createGameStateFromFen", { enumerable: true, get: function () { return game_state_1.createGameStateFromFen; } });
Object.defineProperty(exports, "gameStateToFen", { enumerable: true, get: function () { return game_state_1.gameStateToFen; } });
var game_manager_1 = require("./game/game-manager");
Object.defineProperty(exports, "GameManager", { enumerable: true, get: function () { return game_manager_1.GameManager; } });
// Errors
var errors_1 = require("./errors");
Object.defineProperty(exports, "InvalidFenError", { enumerable: true, get: function () { return errors_1.InvalidFenError; } });
Object.defineProperty(exports, "IllegalMoveError", { enumerable: true, get: function () { return errors_1.IllegalMoveError; } });
Object.defineProperty(exports, "GameOverError", { enumerable: true, get: function () { return errors_1.GameOverError; } });
//# sourceMappingURL=index.js.map