import { io, Socket } from 'socket.io-client';

// In dev, Vite proxies /socket.io → backend. In production, same-origin works.
const SOCKET_PATH = import.meta.env.PROD ? undefined : '/socket.io';
const PVP_NAMESPACE = '/pvp';

let socket: Socket | null = null;

/** Get or create the PvP Socket.IO connection */
export function getPvpSocket(): Socket {
  if (!socket?.connected) {
    socket = io(PVP_NAMESPACE, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return socket;
}

/** Disconnect and null out the socket */
export function disconnectPvpSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/** One-shot listener that auto-removes after firing */
export function oncePvpEvent<T>(event: string, handler: (data: T) => void): void {
  const s = getPvpSocket();
  s.once(event, handler as (...args: unknown[]) => void);
}
