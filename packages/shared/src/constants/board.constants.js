"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COL_TO_FILE = exports.FILE_MAP = exports.RANKS = exports.FILES = exports.RIVER_BLACK_SIDE_END = exports.RIVER_RED_SIDE_START = exports.PALACE_COL_END = exports.PALACE_COL_START = exports.BLACK_PALACE_ROW_END = exports.BLACK_PALACE_ROW_START = exports.RED_PALACE_ROW_END = exports.RED_PALACE_ROW_START = exports.BOARD_CELL_COUNT = void 0;
const board_types_1 = require("../types/board.types");
// Board dimensions
exports.BOARD_CELL_COUNT = board_types_1.BOARD_COLS * board_types_1.BOARD_ROWS; // 90
// Palace bounds
exports.RED_PALACE_ROW_START = 7;
exports.RED_PALACE_ROW_END = 9;
exports.BLACK_PALACE_ROW_START = 0;
exports.BLACK_PALACE_ROW_END = 2;
exports.PALACE_COL_START = 3;
exports.PALACE_COL_END = 5;
// River
exports.RIVER_RED_SIDE_START = 5; // rows 5-9 are Red's side
exports.RIVER_BLACK_SIDE_END = 4; // rows 0-4 are Black's side
// Coordinates
exports.FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
exports.RANKS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
exports.FILE_MAP = {
    a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8,
};
exports.COL_TO_FILE = {
    0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h', 8: 'i',
};
//# sourceMappingURL=board.constants.js.map