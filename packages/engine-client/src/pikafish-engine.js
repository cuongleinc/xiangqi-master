"use strict";
// PikafishEngine — singleton wrapper around Pikafish UCI engine
// Spawns a persistent child process, communicates via stdin/stdout UCI protocol
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PikafishEngine = void 0;
const child_process_1 = require("child_process");
const readline = __importStar(require("readline"));
const uci_parser_1 = require("./uci-parser");
const request_queue_1 = require("./request-queue");
const errors_1 = require("./errors");
const xiangqi_core_1 = require("@repo/xiangqi-core");
const DEFAULT_CONFIG = {
    hash: 64,
    threads: 1,
    multiPv: 1,
};
class PikafishEngine {
    config;
    static instance = null;
    process = null;
    queue = new request_queue_1.RequestQueue();
    rl = null;
    status = 'idle';
    infoBuffer = [];
    currentResolve = null;
    currentReject = null;
    startTime = 0;
    lastActivity = 0;
    shouldRestart = true;
    constructor(config) {
        this.config = config;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    // Singleton access
    static getInstance(config) {
        if (!PikafishEngine.instance) {
            if (!config) {
                throw new Error('PikafishEngine config required for first initialization');
            }
            PikafishEngine.instance = new PikafishEngine(config);
        }
        return PikafishEngine.instance;
    }
    static resetInstance() {
        if (PikafishEngine.instance) {
            PikafishEngine.instance.stop().catch(() => { });
            PikafishEngine.instance = null;
        }
    }
    // ---- Lifecycle ----
    async start() {
        if (this.process && this.status === 'ready')
            return;
        this.status = 'starting';
        this.shouldRestart = true;
        try {
            this.process = (0, child_process_1.spawn)(this.config.path, [], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            this.process.on('exit', (code, signal) => {
                this.onProcessExit(code, signal);
            });
            this.process.stderr?.on('data', (data) => {
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
                this.rl.on('line', (line) => {
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
        }
        catch (err) {
            this.status = 'crashed';
            throw new errors_1.EngineConnectionError(`Failed to start engine: ${err.message}`);
        }
    }
    async stop() {
        this.shouldRestart = false;
        this.queue.clear(new Error('Engine stopped'));
        if (this.process) {
            try {
                this.sendCommand('quit');
                await this.waitForExit(2000);
            }
            catch {
                // Force kill
                try {
                    this.process.kill('SIGTERM');
                }
                catch { }
                try {
                    this.process.kill('SIGKILL');
                }
                catch { }
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
    async restart() {
        if (this.process) {
            try {
                this.process.kill('SIGTERM');
            }
            catch { }
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
    sendCommand(command) {
        if (!this.process?.stdin) {
            throw new errors_1.EngineConnectionError('Engine process not running');
        }
        this.process.stdin.write(command + '\n');
        this.lastActivity = Date.now();
    }
    async handshake() {
        // Send uci and wait for uciok
        this.sendCommand('uci');
        await this.waitFor('uciok', 5000);
    }
    configure() {
        this.sendCommand(`setoption name Hash value ${this.config.hash}`);
        this.sendCommand(`setoption name Threads value ${this.config.threads}`);
        if (this.config.multiPv && this.config.multiPv > 1) {
            this.sendCommand(`setoption name MultiPV value ${this.config.multiPv}`);
        }
        // Enable WDL output for better evaluation data
        this.sendCommand('setoption name UCI_ShowWDL value true');
    }
    async isReadyCheck() {
        this.sendCommand('isready');
        await this.waitFor('readyok', 5000);
    }
    waitFor(pattern, timeoutMs) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new errors_1.EngineTimeoutError(timeoutMs));
            }, timeoutMs);
            const check = (line) => {
                if ((pattern === 'uciok' && (0, uci_parser_1.isUciOk)(line)) ||
                    (pattern === 'readyok' && (0, uci_parser_1.isReadyOk)(line))) {
                    clearTimeout(timeout);
                    resolve();
                    return true;
                }
                return false;
            };
            // Override handleStdout temporarily
            const originalHandler = this.rl
                ? this.rl._checkHandler
                : undefined;
            const wrappedHandler = (line) => {
                if (check(line)) {
                    // Remove the temporary handler
                    if (this.rl) {
                        // Note: We can't easily remove a specific listener from readline
                        // Instead, we just process and the check function handles resolved state
                    }
                }
                else {
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
    waitPattern = null;
    waitResolve = null;
    waitReject = null;
    waitTimeout = null;
    handleWaitPattern(line) {
        if (!this.waitPattern)
            return false;
        const matched = (this.waitPattern === 'uciok' && (0, uci_parser_1.isUciOk)(line)) ||
            (this.waitPattern === 'readyok' && (0, uci_parser_1.isReadyOk)(line));
        if (matched) {
            if (this.waitTimeout)
                clearTimeout(this.waitTimeout);
            this.waitResolve?.();
            this.waitPattern = null;
            this.waitResolve = null;
            this.waitReject = null;
            this.waitTimeout = null;
            return true;
        }
        return false;
    }
    async waitForExit(timeoutMs) {
        return new Promise((resolve) => {
            if (!this.process)
                return resolve();
            const timeout = setTimeout(() => resolve(), timeoutMs);
            this.process.once('exit', () => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }
    // ---- Public API ----
    async analyze(fen, options) {
        if (this.status !== 'ready') {
            if (this.status === 'idle' || this.status === 'stopped') {
                await this.start();
            }
            else if (this.status === 'crashed') {
                await this.restart();
            }
            else {
                throw new errors_1.EngineNotReadyError();
            }
        }
        // Validate FEN before sending to engine (prevents crash)
        const validation = (0, xiangqi_core_1.validateFen)(fen);
        if (!validation.valid) {
            throw new Error(`Invalid FEN: ${validation.error}`);
        }
        const timeoutMs = (options?.movetime ?? 5000) + 5000;
        return this.queue.enqueue(fen, options ?? {}, timeoutMs);
    }
    async getBestMove(fen, movetime) {
        const result = await this.analyze(fen, { movetime: movetime ?? 2000 });
        return {
            bestMove: result.bestMove,
            score: result.score,
            depth: result.depth,
            pv: result.pv,
        };
    }
    async evaluate(fen, movetime) {
        const result = await this.analyze(fen, { movetime: movetime ?? 2000 });
        return {
            score: result.score,
            mate: result.mate,
            depth: result.depth,
            pv: result.pv,
        };
    }
    async isReady() {
        if (this.status !== 'ready')
            return false;
        try {
            await this.isReadyCheck();
            return true;
        }
        catch {
            return false;
        }
    }
    // ---- Stdout handling ----
    handleStdout(line) {
        line = line.trim();
        if (!line)
            return;
        // Check wait patterns first
        if (this.handleWaitPattern(line))
            return;
        // Parse info lines
        if (line.startsWith('info ')) {
            const info = (0, uci_parser_1.parseInfoLine)(line);
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
            // Handshake info — log at debug level
            return;
        }
    }
    processBestMove(line) {
        const parsed = (0, uci_parser_1.parseBestMoveLine)(line);
        if (!parsed)
            return;
        // Build analysis result from buffer
        const bestEval = (0, uci_parser_1.extractBestEval)(this.infoBuffer);
        const result = {
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
            if (info.nodes)
                result.nodes = info.nodes;
            if (info.time)
                result.time = info.time;
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
    processQueue() {
        if (this.queue.busy())
            return;
        if (this.status !== 'ready')
            return;
        const request = this.queue.dequeue();
        if (!request)
            return;
        this.queue.setProcessing(true);
        this.currentResolve = request.resolve;
        this.currentReject = request.reject;
        this.infoBuffer = [];
        // Clear request timeout when processing
        clearTimeout(request.timeout);
        try {
            this.sendCommand('ucinewgame');
            this.sendCommand(`position fen ${request.fen}`);
            this.sendGo(request.options);
            this.status = 'thinking';
        }
        catch (err) {
            request.reject(err);
            this.queue.setProcessing(false);
            this.processQueue();
        }
    }
    sendGo(options) {
        let command = 'go';
        if (options.depth) {
            command += ` depth ${options.depth}`;
        }
        else if (options.movetime) {
            command += ` movetime ${options.movetime}`;
        }
        else {
            command += ' movetime 5000'; // default
        }
        if (options.multiPv) {
            command += ` multiPV ${options.multiPv}`;
        }
        this.sendCommand(command);
    }
    // ---- Crash recovery ----
    onProcessExit(code, signal) {
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
            reject(new errors_1.EngineCrashError(code, signal));
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
    getStatus() {
        return {
            status: this.status,
            pid: this.process?.pid ?? null,
            uptime: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
            queueLength: this.queue.length,
            lastActivity: this.lastActivity,
        };
    }
    getStatusSync() {
        return this.status;
    }
}
exports.PikafishEngine = PikafishEngine;
//# sourceMappingURL=pikafish-engine.js.map