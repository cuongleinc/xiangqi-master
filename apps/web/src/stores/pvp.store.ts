import { create } from 'zustand';
import { getPvpSocket, disconnectPvpSocket } from '../api/socket';
import { useGameStore } from './game.store';
import type { Color } from '@repo/shared';

interface LiveGameInfo {
  gameId: string;
  redName: string;
  blackName: string;
  moveCount: number;
  spectatorCount: number;
}

interface MatchFoundData {
  gameId: string;
  color: 'red' | 'black';
  opponent: string;
  playerToken: string;
}

interface PvPStoreState {
  // ── Matchmaking ──
  isQueued: boolean;
  queuePosition: number;

  // ── Current PvP game ──
  gameId: string | null;
  playerColor: 'red' | 'black' | null;
  playerToken: string | null;
  opponentName: string | null;

  // ── Connection ──
  connectionState: 'disconnected' | 'connected' | 'reconnecting';
  opponentDisconnected: boolean;
  disconnectCountdown: number;

  // ── Spectator ──
  liveGames: LiveGameInfo[];
  isSpectating: boolean;
  spectatedGameId: string | null;

  // ── Actions ──
  joinQueue: () => void;
  leaveQueue: () => void;
  fetchLiveGames: () => void;
  spectateGame: (gameId: string) => void;
  leaveSpectate: () => void;
  reconnectToGame: (gameId: string, playerToken: string) => void;
  reset: () => void;
}

export const usePvPStore = create<PvPStoreState>((set, get) => ({
  isQueued: false,
  queuePosition: 0,
  gameId: null,
  playerColor: null,
  playerToken: null,
  opponentName: null,
  connectionState: 'disconnected',
  opponentDisconnected: false,
  disconnectCountdown: 0,
  liveGames: [],
  isSpectating: false,
  spectatedGameId: null,

  joinQueue: () => {
    const socket = getPvpSocket();

    set({ isQueued: true, queuePosition: 1 });

    socket.on('queue_joined', (data: { position: number }) => {
      set({ queuePosition: data.position });
    });

    socket.on('queue_left', () => {
      set({ isQueued: false, queuePosition: 0 });
    });

    socket.on('match_found', (data: MatchFoundData) => {
      // Clean up queue listeners
      socket.off('queue_joined');
      socket.off('queue_left');

      set({
        isQueued: false,
        gameId: data.gameId,
        playerColor: data.color,
        playerToken: data.playerToken,
        opponentName: data.opponent,
        connectionState: 'connected',
      });

      // Wire up game event listeners
      wireGameListeners(socket);

      // Initialize game store for PvP
      const gameStore = useGameStore.getState();
      gameStore.setPvPGame(data.gameId, data.color);
    });

    socket.on('match_ai_fallback', (data: { gameId: string; color: 'red' | 'black'; message: string; playerToken: string }) => {
      socket.off('queue_joined');
      socket.off('queue_left');

      set({
        isQueued: false,
        gameId: data.gameId,
        playerColor: data.color,
        playerToken: data.playerToken,
        opponentName: 'AI (Pikafish)',
        connectionState: 'connected',
      });

      wireGameListeners(socket);

      const gameStore = useGameStore.getState();
      gameStore.setPvPGame(data.gameId, data.color);
    });

    socket.emit('join_queue');
  },

  leaveQueue: () => {
    const socket = getPvpSocket();
    socket.off('queue_joined');
    socket.off('queue_left');
    socket.off('match_found');
    socket.off('match_ai_fallback');
    socket.emit('leave_queue');
    set({ isQueued: false, queuePosition: 0 });
  },

  fetchLiveGames: () => {
    const socket = getPvpSocket();
    socket.emit('get_live_games');
    socket.once('live_games', (games: LiveGameInfo[]) => {
      set({ liveGames: games });
    });
  },

  spectateGame: (gameId: string) => {
    const socket = getPvpSocket();
    set({ isSpectating: true, spectatedGameId: gameId });

    socket.once('game_state', (state) => {
      // Apply received game state for spectator view
      const gameStore = useGameStore.getState();
      gameStore.applySpectatorState(gameId, state);
    });

    wireGameListeners(socket);

    socket.once('error', (data: { message: string }) => {
      set({ isSpectating: false, spectatedGameId: null });
      console.error('Spectate error:', data.message);
    });

    socket.emit('spectate', { gameId });
  },

  leaveSpectate: () => {
    const socket = getPvpSocket();
    const gameId = get().spectatedGameId;
    if (gameId) {
      socket.emit('leave_spectate', { gameId });
      socket.off('game_update');
      socket.off('game_over');
      socket.off('spectator_count');
      socket.off('opponent_disconnected');
      socket.off('opponent_reconnected');
    }
    set({ isSpectating: false, spectatedGameId: null });
  },

  reconnectToGame: (gameId: string, playerToken: string) => {
    const socket = getPvpSocket();

    socket.once('game_state', (state) => {
      const gameStore = useGameStore.getState();
      gameStore.applyReconnectState(gameId, state);

      set({
        gameId,
        playerToken,
        connectionState: 'connected',
        opponentDisconnected: false,
        disconnectCountdown: 0,
      });
    });

    socket.once('error', () => {
      // Reconnection failed
      set({ connectionState: 'disconnected' });
    });

    wireGameListeners(socket);
    socket.emit('reconnect_game', { gameId, playerToken });
  },

  reset: () => {
    const socket = getPvpSocket();
    socket.off('game_update');
    socket.off('game_over');
    socket.off('spectator_count');
    socket.off('opponent_disconnected');
    socket.off('opponent_reconnected');
    socket.off('queue_joined');
    socket.off('queue_left');
    socket.off('match_found');
    socket.off('match_ai_fallback');

    set({
      isQueued: false,
      queuePosition: 0,
      gameId: null,
      playerColor: null,
      playerToken: null,
      opponentName: null,
      connectionState: 'disconnected',
      opponentDisconnected: false,
      disconnectCountdown: 0,
      isSpectating: false,
      spectatedGameId: null,
    });
  },
}));

// ── Internal: wire up in-game socket listeners ──

function wireGameListeners(socket: ReturnType<typeof getPvpSocket>): void {
  // Remove any previous listeners to prevent duplicates
  socket.off('game_update');
  socket.off('game_over');
  socket.off('spectator_count');
  socket.off('opponent_disconnected');
  socket.off('opponent_reconnected');

  socket.on('game_update', (data: {
    fen: string;
    lastMove: string;
    turn: 'w' | 'b';
    isCheck: boolean;
    moveNumber: number;
    gameResult?: string;
  }) => {
    const gameStore = useGameStore.getState();
    gameStore.applySocketMove(data);
  });

  socket.on('game_over', (data: { result: string; reason: string }) => {
    const gameStore = useGameStore.getState();
    gameStore.applyGameOver(data.result, data.reason);
  });

  socket.on('spectator_count', (data: { count: number }) => {
    // stored as a transient value; components can subscribe directly
    usePvPStore.setState({});
  });

  socket.on('opponent_disconnected', (data: { countdown: number }) => {
    usePvPStore.setState({
      opponentDisconnected: true,
      disconnectCountdown: data.countdown,
    });
  });

  socket.on('opponent_reconnected', () => {
    usePvPStore.setState({
      opponentDisconnected: false,
      disconnectCountdown: 0,
    });
  });
}
