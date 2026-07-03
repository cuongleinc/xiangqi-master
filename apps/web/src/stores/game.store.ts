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
  matchType: string;
  isAiThinking: boolean;
  moves: MoveRecordData[];
  recentAiMove: { uci: string; fen: string; evaluation?: number } | null;
  lastMoveUci: string | null;
  error: string | null;

  createNewGame: (difficulty: string, matchType?: string) => Promise<void>;
  makeMove: (uci: string) => Promise<boolean>;
  undoMove: () => Promise<void>;
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
  matchType: 'pvc',
  isAiThinking: false,
  moves: [],
  recentAiMove: null,
  lastMoveUci: null,
  error: null,

  createNewGame: async (difficulty: string, matchType: string = 'pvc') => {
    try {
      const data = await gameApi.createGame(difficulty, matchType);
      set({
        gameId: data.gameId,
        fen: data.fen,
        turn: Color.RED,
        status: 'playing',
        moveCount: 0,
        hintsRemaining: 3,
        difficulty: difficulty as Difficulty,
        matchType,
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
        // Poll for AI move if needed; otherwise fetch game state for moves
        if (data.isAiThinking) {
          get().fetchGameState();
        } else {
          gameApi.getGame(gameId).then((gameData) => {
            set({
              moves: gameData.moves || [],
              moveCount: gameData.moveCount,
              hintsRemaining: gameData.hintsRemaining,
              recentAiMove: gameData.recentAiMove,
              lastMoveUci: gameData.moves?.length > 0
                ? gameData.moves[gameData.moves.length - 1].uci
                : get().lastMoveUci,
            });
          }).catch(() => {});
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
      } else {
        // AI just finished — schedule a delayed refetch to pick up late classification data
        setTimeout(() => {
          if (get().gameId && !get().isAiThinking) {
            gameApi.getGame(get().gameId!).then((fresh) => {
              set({ moves: fresh.moves || [] });
            }).catch(() => {});
          }
        }, 1500);
      }
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setError: (error) => set({ error }),

  undoMove: async () => {
    const { gameId } = get();
    if (!gameId) return;

    try {
      const data = await gameApi.undoMove(gameId);
      set({
        gameId: data.id,
        fen: data.fen,
        turn: data.fen?.includes(' w ') ? Color.RED : Color.BLACK,
        status: data.status,
        moveCount: data.moveCount,
        hintsRemaining: data.hintsRemaining,
        isAiThinking: data.isAiThinking,
        moves: data.moves || [],
        recentAiMove: data.recentAiMove,
        lastMoveUci: data.moves?.length > 0 ? data.moves[data.moves.length - 1].uci : null,
        error: null,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  reset: () => set({
    gameId: null,
    fen: null,
    turn: Color.RED,
    status: 'playing',
    moveCount: 0,
    hintsRemaining: 3,
    matchType: 'pvc',
    isAiThinking: false,
    moves: [],
    recentAiMove: null,
    lastMoveUci: null,
    error: null,
  }),
}));
