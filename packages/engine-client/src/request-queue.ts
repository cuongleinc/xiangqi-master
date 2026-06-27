// Request queue — serial FIFO queue for engine requests
// Pikafish is single-threaded, so we queue requests and process one at a time

import type { AnalysisOptions, AnalysisResult } from './types';

interface QueuedRequest {
  id: string;
  fen: string;
  options: AnalysisOptions;
  resolve: (result: AnalysisResult) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

let nextId = 0;

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;

  enqueue(fen: string, options: AnalysisOptions, timeoutMs: number = 60000): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      const id = `req_${++nextId}`;
      const timeout = setTimeout(() => {
        this.remove(id);
        reject(new Error(`Request ${id} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.queue.push({
        id,
        fen,
        options,
        resolve,
        reject,
        timeout,
      });
    });
  }

  dequeue(): QueuedRequest | undefined {
    return this.queue.shift();
  }

  peek(): QueuedRequest | undefined {
    return this.queue[0];
  }

  remove(id: string): void {
    const idx = this.queue.findIndex((r) => r.id === id);
    if (idx >= 0) {
      const req = this.queue[idx]!;
      clearTimeout(req.timeout);
      this.queue.splice(idx, 1);
    }
  }

  get length(): number {
    return this.queue.length;
  }

  busy(): boolean {
    return this.isProcessing;
  }

  setProcessing(value: boolean): void {
    this.isProcessing = value;
  }

  clear(error?: Error): void {
    const requests = [...this.queue];
    this.queue = [];
    for (const req of requests) {
      clearTimeout(req.timeout);
      if (error) {
        req.reject(error);
      }
    }
  }

  // Get all pending request IDs (for debugging)
  getPendingIds(): string[] {
    return this.queue.map((r) => r.id);
  }
}
