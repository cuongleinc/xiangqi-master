/** Per-room PvP session kept in memory */
export interface PvPRoomData {
  gameId: string;
  /** Canonical GameManager driving this room */
  redSocketId: string;
  blackSocketId: string;
  redName: string;
  blackName: string;
  /** Random token each player receives at match creation, used for reconnect auth */
  redToken: string;
  blackToken: string;
  /** Set of spectator socket IDs */
  spectators: Set<string>;
  /** If a player disconnected, their socket ID + timestamp */
  disconnected: {
    socketId: string;
    since: number;
  } | null;
  /** Grace-period timer handle so we can clear on reconnect */
  forfeitTimer: ReturnType<typeof setTimeout> | null;
}

/** Shape of the live-games list item sent to clients */
export interface LiveGameInfo {
  gameId: string;
  redName: string;
  blackName: string;
  moveCount: number;
  spectatorCount: number;
}

// ── Socket.IO event payloads ──

/** Server → Client: match_found */
export interface MatchFoundPayload {
  gameId: string;
  color: 'red' | 'black';
  opponent: string;
  playerToken: string;
}

/** Server → Client: game_update */
export interface GameUpdatePayload {
  fen: string;
  lastMove: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  moveNumber: number;
  gameResult?: string;
}

/** Server → Client: game_over */
export interface GameOverPayload {
  result: string;
  reason: string;
}

/** Server → Client: game_state (full state on join/reconnect) */
export interface GameStatePayload {
  fen: string;
  turn: 'w' | 'b';
  status: string;
  moveNumber: number;
  moves: Array<{
    moveNumber: number;
    uci: string;
    fenBefore: string;
    fenAfter: string;
    isCheck: boolean;
    isCapture: boolean;
  }>;
  players: { red: string; black: string };
  yourColor?: 'red' | 'black';
}
