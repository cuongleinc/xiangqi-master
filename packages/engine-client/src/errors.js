"use strict";
// Engine-specific errors
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineBusyError = exports.EngineNotReadyError = exports.EngineTimeoutError = exports.EngineCrashError = exports.EngineConnectionError = void 0;
class EngineConnectionError extends Error {
    constructor(message) {
        super(`Engine connection: ${message}`);
        this.name = 'EngineConnectionError';
    }
}
exports.EngineConnectionError = EngineConnectionError;
class EngineCrashError extends Error {
    constructor(exitCode, signal) {
        super(`Engine crashed (exit code: ${exitCode}, signal: ${signal})`);
        this.name = 'EngineCrashError';
    }
}
exports.EngineCrashError = EngineCrashError;
class EngineTimeoutError extends Error {
    constructor(timeout) {
        super(`Engine timeout after ${timeout}ms`);
        this.name = 'EngineTimeoutError';
    }
}
exports.EngineTimeoutError = EngineTimeoutError;
class EngineNotReadyError extends Error {
    constructor() {
        super('Engine is not ready');
        this.name = 'EngineNotReadyError';
    }
}
exports.EngineNotReadyError = EngineNotReadyError;
class EngineBusyError extends Error {
    constructor(queueLength) {
        super(`Engine is busy (${queueLength} requests in queue)`);
        this.name = 'EngineBusyError';
    }
}
exports.EngineBusyError = EngineBusyError;
//# sourceMappingURL=errors.js.map