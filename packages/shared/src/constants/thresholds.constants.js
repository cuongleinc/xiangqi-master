"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPETITION_LIMIT = exports.MAX_HINTS_PER_GAME = exports.DEFAULT_HINTS_PER_GAME = exports.FIFTY_MOVE_LIMIT = exports.PERPETUAL_LIMIT = void 0;
// Perpetual check/chase limits
exports.PERPETUAL_LIMIT = 6; // consecutive checks/chases before loss
// No-capture draw rule
exports.FIFTY_MOVE_LIMIT = 60; // half-moves without capture or soldier advance
// Game limits
exports.DEFAULT_HINTS_PER_GAME = 3;
exports.MAX_HINTS_PER_GAME = 10;
// Repetition
exports.REPETITION_LIMIT = 3; // threefold repetition → draw
//# sourceMappingURL=thresholds.constants.js.map