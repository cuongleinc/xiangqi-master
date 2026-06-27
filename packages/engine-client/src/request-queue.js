"use strict";
// Request queue — serial FIFO queue for engine requests
// Pikafish is single-threaded, so we queue requests and process one at a time
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestQueue = void 0;
let nextId = 0;
class RequestQueue {
    queue = [];
    isProcessing = false;
    enqueue(fen, options, timeoutMs = 60000) {
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
    dequeue() {
        return this.queue.shift();
    }
    peek() {
        return this.queue[0];
    }
    remove(id) {
        const idx = this.queue.findIndex((r) => r.id === id);
        if (idx >= 0) {
            const req = this.queue[idx];
            clearTimeout(req.timeout);
            this.queue.splice(idx, 1);
        }
    }
    get length() {
        return this.queue.length;
    }
    busy() {
        return this.isProcessing;
    }
    setProcessing(value) {
        this.isProcessing = value;
    }
    clear(error) {
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
    getPendingIds() {
        return this.queue.map((r) => r.id);
    }
}
exports.RequestQueue = RequestQueue;
//# sourceMappingURL=request-queue.js.map