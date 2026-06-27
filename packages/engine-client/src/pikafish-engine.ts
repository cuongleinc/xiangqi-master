// PikafishEngine — singleton wrapper around Pikafish UCI engine
// Spawns a persistent child process, communicates via stdin/stdout UCI protocol

import { spawn, type ChildProcess } from 'child_process';
import * as readline from 'readline';
import type { PikafishConfig, AnalysisOptions, AnalysisResult, EvaluationResult, EngineStatus, EngineHealth, ParsedInfo } from './types';
import { parseInfoLine, parseBestMoveLine, isUciOk, isReadyOk, extractBestEval } from './uci-parser';
import { RequestQueue } from './request-queue';
import { EngineConnectionError, EngineCrashError, EngineTimeoutError, EngineNotReadyError } from './errors';
import { validateFen } from '@repo/xiangqi-core';
import { fenToPikafish, fenFromPikafish } from './fen-converter';

const DEFAULT_CONFIG: Partial<PikafishConfig> = {
  hash: 64,
  threads: 1,
  multiPv: 1,
};

export class PikafishEngine {
  private static instance: PikafishEngine | null = null;

  private process: ChildProcess | null = null;
  private queue: RequestQueue = new RequestQueue();
  private rl: readline.Interface | null = null;
  private status: EngineStatus = 'idle';
  private infoBuffer: ParsedInfo[] = [];
  private currentResolve: ((result: AnalysisResult) => void) | null = null;
  private currentReject: ((error: Error) => void) | null = null;
  private startTime = 0;
  private lastActivity = 0;
  private shouldRestart = true;

  private constructor(private config: PikafishConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Singleton access
  static getInstance(config?: PikafishConfig): PikafishEngine {
    if (!PikafishEngine.instance) {
      if (!config) {
        throw new Error('PikafishEngine config required for first initialization');
      }
      PikafishEngine.instance = new PikafishEngine(config);
    }
    return PikafishEngine.instance;
  }

  static resetInstance(): void {
    if (PikafishEngine.instance) {
      PikafishEngine.instance.stop().catch(() => {});
      PikafishEngine.instance = null;
    }
  }

  // ---- Lifecycle ----

  async start(): Promise<void> {
    if (this.process && this.status === 'ready') return;

    this.status = 'starting';
    this.shouldRestart = true;

    try {
      this.process = spawn(this.config.path, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.process.on('exit', (code, signal) => {
        this.onProcessExit(code, signal);
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        // Log engine stderr for debugging
        const msg = data.toString().trim();
        if (msg) {
          console.warn(`[Pikafish stderr] ${msg}`);
        }
      });

      this.process.on('error', (err) => {
        console.error(`[Pikafish] Process error: ${err.message}`);
        this.status = 'crashed';
      });

      // Set up readline on stdout
      if (this.process.stdout) {
        this.rl = readline.createInterface({
          input: this.process.stdout,
          crlfDelay: Infinity,
        });

        this.rl.on('line', (line: string) => {
          this.handleStdout(line);
        });
      }

      // UCI handshake
      await this.handshake();

      // Configure engine
      this.configure();

      // Verify ready
      await this.isReadyCheck();

      this.status = 'ready';
      this.startTime = Date.now();
      this.lastActivity = Date.now();

      // Process any queued requests
      this.processQueue();
    } catch (err) {
      this.status = 'crashed';
      throw new EngineConnectionError(`Failed to start engine: ${(err as Error).message}`);
    }
  }

  async stop(): Promise<void> {
    this.shouldRestart = false;
    this.queue.clear(new Error('Engine stopped'));

    if (this.process) {
      try {
        this.sendCommand('quit');
        await this.waitForExit(2000);
      } catch {
        // Force kill
        try { this.process.kill('SIGTERM'); } catch {}
        try { this.process.kill('SIGKILL'); } catch {}
      }
      this.process = null;
    }

    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }

    this.status = 'stopped';
    PikafishEngine.instance = null;
  }

  async restart(): Promise<void> {
    if (this.process) {
      try { this.process.kill('SIGTERM'); } catch {}
      this.process = null;
    }
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    this.status = 'idle';
    await this.start();
  }

  // ---- UCI Protocol ----

  private sendCommand(command: string): void {
    if (!this.process?.stdin) {
      throw new EngineConnectionError('Engine process not running');
    }
    this.process.stdin.write(command + '\n');
    this.lastActivity = Date.now();
  }

  private async handshake(): Promise<void> {
    // Set up wait BEFORE sending command to avoid race condition
    const uciOkPromise = this.waitFor('uciok', 5000);
    this.sendCommand('uci');
    await uciOkPromise;
  }

  private configure(): void {
    // Set NNUE file path first (before isready)
    if (this.config.evalFile) {
      this.sendCommand(`setoption name EvalFile value ${this.config.evalFile}`);
    }
    this.sendCommand(`setoption name Hash value ${this.config.hash}`);
    this.sendCommand(`setoption name Threads value ${this.config.threads}`);
    if (this.config.multiPv && this.config.multiPv > 1) {
      this.sendCommand(`setoption name MultiPV value ${this.config.multiPv}`);
    }
    this.sendCommand('setoption name UCI_ShowWDL value true');
  }

  private async isReadyCheck(): Promise<void> {
    const readyPromise = this.waitFor('readyok', 5000);
    this.sendCommand('isready');
    await readyPromise;
  }

  private waitFor(pattern: string, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new EngineTimeoutError(timeoutMs));
      }, timeoutMs);

      const check = (line: string) => {
        if (
          (pattern === 'uciok' && isUciOk(line)) ||
          (pattern === 'readyok' && isReadyOk(line))
        ) {
          clearTimeout(timeout);
          resolve();
          return true;
        }
        return false;
      };

      // Override handleStdout temporarily
      const originalHandler = this.rl
        ? (this.rl as unknown as { _checkHandler?: (line: string) => boolean })._checkHandler
        : undefined;

      const wrappedHandler = (line: string) => {
        if (check(line)) {
          // Remove the temporary handler
          if (this.rl) {
            // Note: We can't easily remove a specific listener from readline
            // Instead, we just process and the check function handles resolved state
          }
        } else {
          this.handleStdout(line);
        }
      };

      // Add a temporary listener — since readline only supports one 'line' handler,
      // we need a different approach
      // Let's use the existing handler flow instead
      this.waitPattern = pattern;
      this.waitResolve = resolve;
      this.waitReject = reject;
      this.waitTimeout = timeout;
    });
  }

  // Temporary state for waitFor
  private waitPattern: string | null = null;
  private waitResolve: (() => void) | null = null;
  private waitReject: ((error: Error) => void) | null = null;
  private waitTimeout: ReturnType<typeof setTimeout> | null = null;

  private handleWaitPattern(line: string): boolean {
    if (!this.waitPattern) return false;

    const matched =
      (this.waitPattern === 'uciok' && isUciOk(line)) ||
      (this.waitPattern === 'readyok' && isReadyOk(line));

    if (matched) {
      if (this.waitTimeout) clearTimeout(this.waitTimeout);
      this.waitResolve?.();
      this.waitPattern = null;
      this.waitResolve = null;
      this.waitReject = null;
      this.waitTimeout = null;
      return true;
    }

    return false;
  }

  private async waitForExit(timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.process) return resolve();
      const timeout = setTimeout(() => resolve(), timeoutMs);
      this.process.once('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  // ---- Public API ----

  async analyze(fen: string, options?: AnalysisOptions): Promise<AnalysisResult> {
    if (this.status !== 'ready') {
      if (this.status === 'idle' || this.status === 'stopped') {
        await this.start();
      } else if (this.status === 'crashed') {
        await this.restart();
      } else {
        throw new EngineNotReadyError();
      }
    }

    // Validate FEN before sending to engine (prevents crash)
    const validation = validateFen(fen);
    if (!validation.valid) {
      throw new Error(`Invalid FEN: ${validation.error}`);
    }

    const timeoutMs = (options?.movetime ?? 5000) + 5000;
    const promise = this.queue.enqueue(fen, options ?? {}, timeoutMs);
    // Trigger queue processing (if not already processing)
    this.processQueue();
    return promise;
  }

  async getBestMove(fen: string, movetime?: number): Promise<{
    bestMove: string;
    score: number;
    depth: number;
    pv: string[];
  }> {
    const result = await this.analyze(fen, { movetime: movetime ?? 2000 });
    return {
      bestMove: result.bestMove,
      score: result.score,
      depth: result.depth,
      pv: result.pv,
    };
  }

  async evaluate(fen: string, movetime?: number): Promise<EvaluationResult> {
    const result = await this.analyze(fen, { movetime: movetime ?? 2000 });
    return {
      score: result.score,
      mate: result.mate,
      depth: result.depth,
      pv: result.pv,
    };
  }

  async isReady(): Promise<boolean> {
    if (this.status !== 'ready') return false;
    try {
      await this.isReadyCheck();
      return true;
    } catch {
      return false;
    }
  }

  // ---- Stdout handling ----

  private handleStdout(line: string): void {
    line = line.trim();
    if (!line) return;

    // Check wait patterns first
    if (this.handleWaitPattern(line)) return;

    // Parse info lines
    if (line.startsWith('info ')) {
      const info = parseInfoLine(line);
      if (info) {
        this.infoBuffer.push(info);
      }
      return;
    }

    // Parse bestmove
    if (line.startsWith('bestmove ')) {
      this.processBestMove(line);
      return;
    }

    // Log other engine output
    if (line.startsWith('id ') || line.startsWith('option ')) {
      return;
    }
  }

  private processBestMove(line: string): void {
    const parsed = parseBestMoveLine(line);
    if (!parsed) return;

    // Build analysis result from buffer
    const bestEval = extractBestEval(this.infoBuffer);
    const result: AnalysisResult = {
      bestMove: parsed.bestMove,
      ponder: parsed.ponder,
      score: bestEval.score,
      mate: bestEval.mate,
      depth: bestEval.depth,
      pv: bestEval.pv,
      nodes: 0,
      time: 0,
    };

    // Add node/time from the deepest info line
    for (const info of this.infoBuffer) {
      if (info.nodes) result.nodes = info.nodes;
      if (info.time) result.time = info.time;
    }

    // Reset for next request
    this.infoBuffer = [];
    this.status = 'ready';

    // Resolve the current promise
    if (this.currentResolve) {
      const resolve = this.currentResolve;
      this.currentResolve = null;
      this.currentReject = null;
      resolve(result);
    }

    // Process next request in queue
    this.queue.setProcessing(false);
    this.processQueue();
  }

  // ---- Request processing ----

  private processQueue(): void {
    if (this.queue.busy()) return;
    if (this.status !== 'ready') return;

    const request = this.queue.dequeue();
    if (!request) return;

    this.queue.setProcessing(true);
    this.currentResolve = request.resolve;
    this.currentReject = request.reject;
    this.infoBuffer = [];

    // Clear request timeout when processing
    clearTimeout(request.timeout);

    try {
      this.sendCommand('ucinewgame');
      const pikafishFen = fenToPikafish(request.fen);
      this.sendCommand(`position fen ${pikafishFen}`);
      this.sendGo(request.options);
      this.status = 'thinking';
    } catch (err) {
      request.reject(err as Error);
      this.queue.setProcessing(false);
      this.processQueue();
    }
  }

  private sendGo(options: AnalysisOptions): void {
    let command = 'go';
    if (options.depth) {
      command += ` depth ${options.depth}`;
    } else if (options.movetime) {
      command += ` movetime ${options.movetime}`;
    } else {
      command += ' movetime 5000'; // default
    }
    if (options.multiPv) {
      command += ` multiPV ${options.multiPv}`;
    }
    this.sendCommand(command);
  }

  // ---- Crash recovery ----

  private onProcessExit(code: number | null, signal: string | null): void {
    console.warn(`[Pikafish] Engine exited (code: ${code}, signal: ${signal})`);

    this.status = 'crashed';
    this.process = null;

    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }

    // Reject current request
    if (this.currentReject) {
      const reject = this.currentReject;
      this.currentResolve = null;
      this.currentReject = null;
      reject(new EngineCrashError(code, signal));
    }

    this.queue.setProcessing(false);

    // Auto-restart
    if (this.shouldRestart) {
      console.log('[Pikafish] Auto-restarting engine in 1s...');
      setTimeout(() => {
        this.restart().catch((err) => {
          console.error(`[Pikafish] Auto-restart failed: ${err.message}`);
          this.status = 'crashed';
        });
      }, 1000);
    }
  }

  // ---- Status ----

  getStatus(): EngineHealth {
    return {
      status: this.status,
      pid: this.process?.pid ?? null,
      uptime: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
      queueLength: this.queue.length,
      lastActivity: this.lastActivity,
    };
  }

  getStatusSync(): EngineStatus {
    return this.status;
  }
}
