export const PieceType = {
  KING: 'king',
  ADVISOR: 'advisor',
  ELEPHANT: 'elephant',
  HORSE: 'horse',
  CHARIOT: 'chariot',
  CANNON: 'cannon',
  SOLDIER: 'soldier',
} as const;
export type PieceType = (typeof PieceType)[keyof typeof PieceType];

export const Color = {
  RED: 'red',
  BLACK: 'black',
} as const;
export type Color = (typeof Color)[keyof typeof Color];

export const PieceCode = {
  EMPTY: 0,
  RED_KING: 1, RED_ADVISOR: 2, RED_ELEPHANT: 3, RED_HORSE: 4, RED_CHARIOT: 5, RED_CANNON: 6, RED_SOLDIER: 7,
  BLACK_KING: 8, BLACK_ADVISOR: 9, BLACK_ELEPHANT: 10, BLACK_HORSE: 11, BLACK_CHARIOT: 12, BLACK_CANNON: 13, BLACK_SOLDIER: 14,
} as const;
export type PieceCodeValue = (typeof PieceCode)[keyof typeof PieceCode];

export interface PieceInfo { type: PieceType; color: Color; }

export const FEN_PIECE_MAP: Record<string, number> = {
  K: PieceCode.RED_KING, A: PieceCode.RED_ADVISOR, E: PieceCode.RED_ELEPHANT, H: PieceCode.RED_HORSE,
  R: PieceCode.RED_CHARIOT, C: PieceCode.RED_CANNON, P: PieceCode.RED_SOLDIER,
  k: PieceCode.BLACK_KING, a: PieceCode.BLACK_ADVISOR, e: PieceCode.BLACK_ELEPHANT, h: PieceCode.BLACK_HORSE,
  r: PieceCode.BLACK_CHARIOT, c: PieceCode.BLACK_CANNON, p: PieceCode.BLACK_SOLDIER,
  B: PieceCode.RED_ELEPHANT, N: PieceCode.RED_HORSE, b: PieceCode.BLACK_ELEPHANT, n: PieceCode.BLACK_HORSE,
};

export const PIECE_CODE_TO_FEN: Record<number, string> = {
  [PieceCode.RED_KING]: 'K', [PieceCode.RED_ADVISOR]: 'A', [PieceCode.RED_ELEPHANT]: 'E', [PieceCode.RED_HORSE]: 'H',
  [PieceCode.RED_CHARIOT]: 'R', [PieceCode.RED_CANNON]: 'C', [PieceCode.RED_SOLDIER]: 'P',
  [PieceCode.BLACK_KING]: 'k', [PieceCode.BLACK_ADVISOR]: 'a', [PieceCode.BLACK_ELEPHANT]: 'e', [PieceCode.BLACK_HORSE]: 'h',
  [PieceCode.BLACK_CHARIOT]: 'r', [PieceCode.BLACK_CANNON]: 'c', [PieceCode.BLACK_SOLDIER]: 'p',
};

export const PIECE_CHARS: Record<Color, Record<PieceType, string>> = {
  [Color.RED]: {
    [PieceType.KING]: '帥', [PieceType.ADVISOR]: '仕', [PieceType.ELEPHANT]: '相',
    [PieceType.HORSE]: '傌', [PieceType.CHARIOT]: '俥', [PieceType.CANNON]: '炮', [PieceType.SOLDIER]: '兵',
  },
  [Color.BLACK]: {
    [PieceType.KING]: '將', [PieceType.ADVISOR]: '士', [PieceType.ELEPHANT]: '象',
    [PieceType.HORSE]: '馬', [PieceType.CHARIOT]: '車', [PieceType.CANNON]: '砲', [PieceType.SOLDIER]: '卒',
  },
};
