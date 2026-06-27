// Xiangqi-related errors

export class InvalidFenError extends Error {
  constructor(
    message: string,
    public fen?: string,
  ) {
    super(`Invalid FEN: ${message}${fen ? ` (FEN: ${fen})` : ''}`);
    this.name = 'InvalidFenError';
  }
}

export class IllegalMoveError extends Error {
  constructor(
    message: string,
    public ucci?: string,
  ) {
    super(`Illegal move: ${message}${ucci ? ` (UCCI: ${ucci})` : ''}`);
    this.name = 'IllegalMoveError';
  }
}

export class GameOverError extends Error {
  constructor(message: string) {
    super(`Game over: ${message}`);
    this.name = 'GameOverError';
  }
}
