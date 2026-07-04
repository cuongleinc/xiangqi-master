import { Logger } from '@nestjs/common';
import { QUEUE_AI_FALLBACK_MS } from './pvp.constants';

interface QueuedPlayer {
  socketId: string;
  playerName: string;
  joinedAt: number;
}

/**
 * Simple FIFO matchmaking queue with AI fallback.
 *
 * When a player joins and is alone, a fallback timer starts.
 * If no second player arrives within QUEUE_AI_FALLBACK_MS, the
 * solo player is removed from the queue and an AI-match callback fires.
 */
export class MatchmakingQueue {
  private readonly logger = new Logger(MatchmakingQueue.name);
  private queue: QueuedPlayer[] = [];
  private aiFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private onAiFallback: ((player: QueuedPlayer) => void) | null = null;

  /** Register the callback invoked when the AI-fallback timer expires */
  setAiFallbackHandler(handler: (player: QueuedPlayer) => void): void {
    this.onAiFallback = handler;
  }

  enqueue(socketId: string, playerName: string): void {
    // Prevent duplicates
    if (this.queue.some((p) => p.socketId === socketId)) {
      this.logger.warn(`Socket ${socketId} already in queue, ignoring`);
      return;
    }

    const player: QueuedPlayer = { socketId, playerName, joinedAt: Date.now() };
    this.queue.push(player);
    this.logger.log(
      `Player "${playerName}" joined queue (size=${this.queue.length})`,
    );

    // Start AI-fallback timer for the first player
    if (this.queue.length === 1) {
      this.startAiFallbackTimer();
    }

    // If we now have ≥2 players, match them immediately
    if (this.queue.length >= 2) {
      this.clearAiFallbackTimer();
    }
  }

  remove(socketId: string): void {
    const idx = this.queue.findIndex((p) => p.socketId === socketId);
    if (idx === -1) return;
    const removed = this.queue[idx];
    this.queue.splice(idx, 1);
    if (removed) {
      this.logger.log(
        `Player "${removed.playerName}" left queue (size=${this.queue.length})`,
      );
    }

    // If queue drops below 2, restart AI timer for the sole remaining player
    if (this.queue.length === 1) {
      this.startAiFallbackTimer();
    } else if (this.queue.length === 0) {
      this.clearAiFallbackTimer();
    }
  }

  /** Try to dequeue two players for a match. Returns null if <2 in queue. */
  dequeuePair(): [QueuedPlayer, QueuedPlayer] | null {
    if (this.queue.length < 2) return null;
    this.clearAiFallbackTimer();
    const p1 = this.queue.shift()!;
    const p2 = this.queue.shift()!;
    this.logger.log(
      `Matched "${p1.playerName}" vs "${p2.playerName}"`,
    );
    return [p1, p2];
  }

  /** Check if a specific socket is in the queue */
  isInQueue(socketId: string): boolean {
    return this.queue.some((p) => p.socketId === socketId);
  }

  getSize(): number {
    return this.queue.length;
  }

  // ── Private ──

  private startAiFallbackTimer(): void {
    if (this.aiFallbackTimer) return;
    this.aiFallbackTimer = setTimeout(() => {
      const solo = this.queue.shift();
      if (solo && this.onAiFallback) {
        this.logger.log(
          `AI fallback triggered for "${solo.playerName}" (no opponent in ${QUEUE_AI_FALLBACK_MS}ms)`,
        );
        this.onAiFallback(solo);
      }
      this.aiFallbackTimer = null;
    }, QUEUE_AI_FALLBACK_MS);
  }

  private clearAiFallbackTimer(): void {
    if (this.aiFallbackTimer) {
      clearTimeout(this.aiFallbackTimer);
      this.aiFallbackTimer = null;
    }
  }
}
