// Game Manager — orchestrates a full game of Xiangqi

import { Color, STARTING_FEN } from '@repo/shared';
import { createInitialGameState, createGameStateFromFen, gameStateToFen } from './game-state';
import type { GameState } from './game-state';
import { validateMove } from '../move/move-validator';
import { applyMove } from '../move/move-executor';
import { moveToUcci } from '../move/move-types';
import { moveEquals } from '../move/move-types';
import type { Move } from '../move/move-types';
import { generateLegalMoves } from '../move/move-generator';
import { isInCheck } from '../rules/check-detector';
import { checkGameEnd, GameResult } from '../rules/game-end-detector';
import { checkPerpetual } from '../rules/perpetual-detector';
import { normalizeFen } from '../fen/fen-hash';
import { parseFen } from '../fen/fen-parser';
import { generateFen } from '../fen/fen-generator';
import type { MoveRecord } from '../rules/perpetual-detector';
import { getPiece } from '../board';

export interface MoveResult {
  success: boolean;
  fen?: string;
  move?: string;
  isCheck?: boolean;
  isMate?: boolean;
  isStalemate?: boolean;
  isDraw?: boolean;
  gameResult?: string;
  error?: string;
  captured?: number;
}

export class GameManager {
  private state: GameState;

  constructor(fen?: string) {
    if (fen) {
      this.state = createGameStateFromFen(fen);
    } else {
      this.state = createInitialGameState();
    }
  }

  // Attempt to make a move. Returns result describing what happened.
  makeMove(ucci: string): MoveResult {
    if (this.state.status !== GameResult.PLAYING) {
      return {
        success: false,
        error: `Game is already over: ${this.state.status}`,
        gameResult: this.state.status,
      };
    }

    const move = validateMove(this.state.board, ucci, this.state.turn);
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
    const newBoard = applyMove(this.state.board, move);
    const fenBefore = gameStateToFen(this.state);

    // Record move
    const moveRecord: MoveRecord = {
      fen: fenBefore,
      board: new Uint8Array(this.state.board),
      uci: ucci,
      wasCheck: false, // checked after applying
    };

    // Update state
    this.state.board = newBoard;
    this.state.turn = this.state.turn === Color.RED ? Color.BLACK : Color.RED;

    // Update clocks
    if (isCapture || isSoldierMove) {
      this.state.halfMoveClock = 0;
    } else {
      this.state.halfMoveClock++;
    }

    if (this.state.turn === Color.RED) {
      this.state.fullMoveNumber++;
    }

    // Record move in history
    const fenAfter = gameStateToFen(this.state);
    this.state.positionHistory.push(normalizeFen(fenAfter));
    this.state.moveHistory.push(moveRecord);

    // Check if the move gives check
    const isCheck = isInCheck(this.state.board, this.state.turn);

    // Check perpetual
    const perpetualResult = checkPerpetual(this.state.moveHistory, this.state.turn === Color.RED ? Color.BLACK : Color.RED);
    if (perpetualResult && perpetualResult !== GameResult.PLAYING) {
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
    const endCheck = checkGameEnd(
      this.state.board,
      this.state.turn,
      this.state.halfMoveClock,
      this.state.positionHistory,
    );

    if (endCheck.status !== GameResult.PLAYING) {
      this.state.status = endCheck.status;
      this.state.result = endCheck.reason;

      const isMate = endCheck.reason === 'checkmate';
      const isStalemate = endCheck.reason === 'stalemate';
      const isDraw = endCheck.status === GameResult.DRAW;

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
  getLegalMoves(): string[] {
    return generateLegalMoves(this.state.board, this.state.turn).map((m) => moveToUcci(m));
  }

  // Get current FEN
  getFen(): string {
    return gameStateToFen(this.state);
  }

  // Get current state (immutable snapshot)
  getState(): Readonly<GameState> {
    return { ...this.state, board: new Uint8Array(this.state.board) };
  }

  // Is game over?
  isGameOver(): boolean {
    return this.state.status !== GameResult.PLAYING;
  }

  // Undo last move (for analysis)
  undoMove(): MoveRecord | null {
    if (this.state.moveHistory.length === 0) return null;

    const lastRecord = this.state.moveHistory.pop()!;
    this.state.positionHistory.pop();

    // Restore board from move record
    const fenParsed = parseFen(lastRecord.fen);
    this.state.board = fenParsed.board;
    this.state.turn = fenParsed.turn;
    this.state.halfMoveClock = fenParsed.halfMoveClock;
    this.state.fullMoveNumber = fenParsed.fullMoveNumber;
    this.state.status = GameResult.PLAYING;
    this.state.result = undefined;

    return lastRecord;
  }

  // Get move history
  getMoveHistory(): MoveRecord[] {
    return [...this.state.moveHistory];
  }

  // Get the current board
  getBoard(): Uint8Array {
    return new Uint8Array(this.state.board);
  }

  // Get current turn
  getTurn(): Color {
    return this.state.turn;
  }

  // Reset to initial state
  reset(fen?: string): void {
    if (fen) {
      this.state = createGameStateFromFen(fen);
    } else {
      this.state = createInitialGameState();
    }
  }
}
