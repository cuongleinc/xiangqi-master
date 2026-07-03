import { create } from 'zustand';
import { gameApi } from '../api/game.api';
import { Color } from '@repo/shared';
import type { Difficulty } from '@repo/shared';
import { playCapture, playCheck, playGameOver } from '../lib/sound';

export interface MoveRecordData {
  moveNumber: number;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  evaluationBefore?: number;
  evaluationAfter?: number;
  classification?: string;
  isCheck: boolean;
  isCapture: boolean;
}

interface GameStoreState {
  gameId: string | null;
  fen: string | null;
  turn: Color;
  status: string;
  moveCount: number;
  hintsRemaining: number;
  difficulty: Difficulty;
  isAiThinking: boolean;
  moves: MoveRecordData[];
  recentAiMove: { uci: string; fen: string; evaluation?: number } | null;
  lastMoveUci: string | null;
  error: string | null;

  createNewGame: (difficulty: string) => Promise<void>;
  makeMove: (uci: string) => Promise<boolean>;
  fetchGameState: () => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameId: null,
  fen: null,
  turn: Color.RED,
  status: 'playing',
  moveCount: 0,
  hintsRemaining: 3,
  difficulty: 'medium',
  isAiThinking: false,
  moves: [],
  recentAiMove: null,
  lastMoveUci: null,
  error: null,

  createNewGame: async (difficulty: string) => {
    try {
      const data = await gameApi.createGame(difficulty);
      set({
        gameId: data.gameId,
        fen: data.fen,
        turn: Color.RED,
        status: 'playing',
        moveCount: 0,
        hintsRemaining: 3,
        difficulty: difficulty as Difficulty,
        isAiThinking: false,
        moves: [],
        recentAiMove: null,
        lastMoveUci: null,
        error: null,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  makeMove: async (uci: string) => {
    const { gameId } = get();
    if (!gameId) return false;

    try {
      const data = await gameApi.makeMove(gameId, uci);
      if (data.success) {
        // Sound triggers
        if (data.isMate || data.gameResult) playGameOver();
        else if (data.isCheck) playCheck();

        set({
          fen: data.fen,
          turn: data.turn === 'w' ? Color.RED : Color.BLACK,
          status: data.gameResult || 'playing',
          moveCount: data.moveNumber,
          isAiThinking: data.isAiThinking || false,
          lastMoveUci: uci,
          error: null,
        });
        // Poll for AI move if needed
        if (data.isAiThinking) {
          get().fetchGameState();
        }
        return true;
      }
      return false;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  fetchGameState: async () => {
    const { gameId, isAiThinking } = get();
    if (!gameId || !isAiThinking) return;

    try {
      const data = await gameApi.getGame(gameId);
      set({
        fen: data.fen,
        status: data.status,
        moveCount: data.moveCount,
        hintsRemaining: data.hintsRemaining,
        isAiThinking: data.isAiThinking,
        recentAiMove: data.recentAiMove,
        lastMoveUci: data.recentAiMove?.uci ?? get().lastMoveUci,
        moves: data.moves || [],
      });

      // If AI is still thinking, poll again
      if (data.isAiThinking) {
        setTimeout(() => get().fetchGameState(), 500);
      }
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setError: (error) => set({ error }),

  reset: () => set({
    gameId: null,
    fen: null,
    turn: Color.RED,
    status: 'playing',
    moveCount: 0,
    hintsRemaining: 3,
    isAiThinking: false,
    moves: [],
    recentAiMove: null,
    lastMoveUci: null,
    error: null,
  }),
}));
