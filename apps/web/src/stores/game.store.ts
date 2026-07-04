import { create } from 'zustand';
import { gameApi } from '../api/game.api';
import { Color, STARTING_FEN } from '@repo/shared';
import type { Difficulty } from '@repo/shared';
import { playCapture, playCheck, playGameOver } from '../lib/sound';
import { useAnalysisStore } from './analysis.store';

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
  result: string | null;
  moveCount: number;
  hintsRemaining: number;
  difficulty: Difficulty;
  matchType: string;
  isAiThinking: boolean;
  moves: MoveRecordData[];
  recentAiMove: { uci: string; fen: string; evaluation?: number } | null;
  lastMoveUci: string | null;
  error: string | null;
  _epoch: number;

  createNewGame: (difficulty: string, matchType?: string) => Promise<void>;
  makeMove: (uci: string) => Promise<boolean>;
  undoMove: () => Promise<void>;
  fetchGameState: () => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;

  // PvP socket-driven methods
  setPvPGame: (gameId: string, color: string) => void;
  applySocketMove: (data: { fen: string; lastMove: string; turn: 'w' | 'b'; isCheck: boolean; moveNumber: number; gameResult?: string }) => void;
  applyGameOver: (result: string, reason: string) => void;
  applySpectatorState: (gameId: string, state: { fen: string; turn: 'w' | 'b'; status: string; moveNumber: number; moves: any[]; players: { red: string; black: string }; yourColor?: 'red' | 'black' }) => void;
  applyReconnectState: (gameId: string, state: { fen: string; turn: 'w' | 'b'; status: string; moveNumber: number; moves: any[]; players: { red: string; black: string }; yourColor?: 'red' | 'black' }) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameId: null,
  fen: null,
  turn: Color.RED,
  status: 'playing',
  result: null,
  moveCount: 0,
  hintsRemaining: 3,
  difficulty: 'medium',
  matchType: 'pvc',
  isAiThinking: false,
  moves: [],
  recentAiMove: null,
  lastMoveUci: null,
  error: null,
  _epoch: 0,

  createNewGame: async (difficulty: string, matchType: string = 'pvc') => {
    try {
      const data = await gameApi.createGame(difficulty, matchType);
      // Clear analysis store to prevent stale data from previous game
      useAnalysisStore.getState().clear();
      set({
        gameId: data.gameId,
        fen: data.fen,
        turn: Color.RED,
        status: 'playing',
        result: null,
        moveCount: 0,
        hintsRemaining: 3,
        difficulty: difficulty as Difficulty,
        matchType,
        isAiThinking: false,
        moves: [],
        recentAiMove: null,
        lastMoveUci: null,
        error: null,
        _epoch: get()._epoch + 1,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  makeMove: async (uci: string) => {
    const { gameId, matchType } = get();
    if (!gameId) return false;

    // PvP: emit move via socket instead of REST
    if (matchType === 'pvp') {
      const socket = (await import('../api/socket')).getPvpSocket();
      socket.emit('move', { gameId, uci });
      // The actual state update comes via the game_update socket event
      return true;
    }

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
          result: data.gameResult || null,
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
        result: data.result ?? get().result,
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
      // Clear analysis store to prevent stale eval from pre-undo position
      useAnalysisStore.getState().clear();
      set({
        gameId: data.id,
        fen: data.fen,
        turn: data.fen?.includes(' w ') ? Color.RED : Color.BLACK,
        status: data.status,
        result: data.result ?? null,
        moveCount: data.moveCount,
        hintsRemaining: data.hintsRemaining,
        isAiThinking: data.isAiThinking,
        moves: data.moves || [],
        recentAiMove: data.recentAiMove,
        lastMoveUci: data.moves?.length > 0 ? data.moves[data.moves.length - 1].uci : null,
        error: null,
        _epoch: get()._epoch + 1,
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
    result: null,
    moveCount: 0,
    hintsRemaining: 3,
    matchType: 'pvc',
    isAiThinking: false,
    moves: [],
    recentAiMove: null,
    lastMoveUci: null,
    error: null,
  }),

  // ── PvP socket-driven methods ──

  setPvPGame: (gameId: string, color: string) => {
    set({
      gameId,
      fen: STARTING_FEN,
      turn: Color.RED,
      status: 'playing',
      result: null,
      moveCount: 0,
      hintsRemaining: 0,
      matchType: 'pvp',
      isAiThinking: false,
      moves: [],
      recentAiMove: null,
      lastMoveUci: null,
      error: null,
    });
  },

  applySocketMove: (data) => {
    set({
      fen: data.fen,
      turn: data.turn === 'w' ? Color.RED : Color.BLACK,
      status: data.gameResult || 'playing',
      result: data.gameResult || null,
      moveCount: data.moveNumber,
      lastMoveUci: data.lastMove,
      isAiThinking: false,
    });
  },

  applyGameOver: (result, _reason) => {
    set({ status: result, result });
  },

  applySpectatorState: (gameId, state) => {
    set({
      gameId,
      fen: state.fen,
      turn: state.turn === 'w' ? Color.RED : Color.BLACK,
      status: state.status,
      moveCount: state.moveNumber,
      moves: (state.moves || []).map((m: any) => ({
        moveNumber: m.moveNumber,
        uci: m.uci,
        fenBefore: m.fenBefore,
        fenAfter: m.fenAfter,
        isCheck: m.isCheck,
        isCapture: m.isCapture,
        classification: m.classification,
        evaluationBefore: m.evaluationBefore,
        evaluationAfter: m.evaluationAfter,
      })),
      matchType: 'pvp',
      isAiThinking: false,
      hintsRemaining: 0,
    });
  },

  applyReconnectState: (gameId, state) => {
    set({
      gameId,
      fen: state.fen,
      turn: state.turn === 'w' ? Color.RED : Color.BLACK,
      status: state.status,
      moveCount: state.moveNumber,
      moves: (state.moves || []).map((m: any) => ({
        moveNumber: m.moveNumber,
        uci: m.uci,
        fenBefore: m.fenBefore,
        fenAfter: m.fenAfter,
        isCheck: m.isCheck,
        isCapture: m.isCapture,
      })),
      isAiThinking: false,
      hintsRemaining: 0,
    });
  },
}));
