"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIECE_CHARS = exports.PIECE_CODE_TO_FEN = exports.FEN_PIECE_MAP = exports.PieceCode = exports.Color = exports.PieceType = void 0;
exports.PieceType = {
    KING: 'king',
    ADVISOR: 'advisor',
    ELEPHANT: 'elephant',
    HORSE: 'horse',
    CHARIOT: 'chariot',
    CANNON: 'cannon',
    SOLDIER: 'soldier',
};
exports.Color = {
    RED: 'red',
    BLACK: 'black',
};
exports.PieceCode = {
    EMPTY: 0,
    RED_KING: 1,
    RED_ADVISOR: 2,
    RED_ELEPHANT: 3,
    RED_HORSE: 4,
    RED_CHARIOT: 5,
    RED_CANNON: 6,
    RED_SOLDIER: 7,
    BLACK_KING: 8,
    BLACK_ADVISOR: 9,
    BLACK_ELEPHANT: 10,
    BLACK_HORSE: 11,
    BLACK_CHARIOT: 12,
    BLACK_CANNON: 13,
    BLACK_SOLDIER: 14,
};
exports.FEN_PIECE_MAP = {
    K: exports.PieceCode.RED_KING,
    A: exports.PieceCode.RED_ADVISOR,
    E: exports.PieceCode.RED_ELEPHANT,
    H: exports.PieceCode.RED_HORSE,
    R: exports.PieceCode.RED_CHARIOT,
    C: exports.PieceCode.RED_CANNON,
    P: exports.PieceCode.RED_SOLDIER,
    k: exports.PieceCode.BLACK_KING,
    a: exports.PieceCode.BLACK_ADVISOR,
    e: exports.PieceCode.BLACK_ELEPHANT,
    h: exports.PieceCode.BLACK_HORSE,
    r: exports.PieceCode.BLACK_CHARIOT,
    c: exports.PieceCode.BLACK_CANNON,
    p: exports.PieceCode.BLACK_SOLDIER,
};
exports.PIECE_CODE_TO_FEN = {
    [exports.PieceCode.RED_KING]: 'K',
    [exports.PieceCode.RED_ADVISOR]: 'A',
    [exports.PieceCode.RED_ELEPHANT]: 'E',
    [exports.PieceCode.RED_HORSE]: 'H',
    [exports.PieceCode.RED_CHARIOT]: 'R',
    [exports.PieceCode.RED_CANNON]: 'C',
    [exports.PieceCode.RED_SOLDIER]: 'P',
    [exports.PieceCode.BLACK_KING]: 'k',
    [exports.PieceCode.BLACK_ADVISOR]: 'a',
    [exports.PieceCode.BLACK_ELEPHANT]: 'e',
    [exports.PieceCode.BLACK_HORSE]: 'h',
    [exports.PieceCode.BLACK_CHARIOT]: 'r',
    [exports.PieceCode.BLACK_CANNON]: 'c',
    [exports.PieceCode.BLACK_SOLDIER]: 'p',
};
exports.PIECE_CHARS = {
    [exports.Color.RED]: {
        [exports.PieceType.KING]: '帥',
        [exports.PieceType.ADVISOR]: '仕',
        [exports.PieceType.ELEPHANT]: '相',
        [exports.PieceType.HORSE]: '傌',
        [exports.PieceType.CHARIOT]: '俥',
        [exports.PieceType.CANNON]: '炮',
        [exports.PieceType.SOLDIER]: '兵',
    },
    [exports.Color.BLACK]: {
        [exports.PieceType.KING]: '將',
        [exports.PieceType.ADVISOR]: '士',
        [exports.PieceType.ELEPHANT]: '象',
        [exports.PieceType.HORSE]: '馬',
        [exports.PieceType.CHARIOT]: '車',
        [exports.PieceType.CANNON]: '砲',
        [exports.PieceType.SOLDIER]: '卒',
    },
};
//# sourceMappingURL=pieces.types.js.map