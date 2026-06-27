// Engine-specific errors

export class EngineConnectionError extends Error {
  constructor(message: string) {
    super(`Engine connection: ${message}`);
    this.name = 'EngineConnectionError';
  }
}

export class EngineCrashError extends Error {
  constructor(
    exitCode: number | null,
    signal: string | null,
  ) {
    super(`Engine crashed (exit code: ${exitCode}, signal: ${signal})`);
    this.name = 'EngineCrashError';
  }
}

export class EngineTimeoutError extends Error {
  constructor(timeout: number) {
    super(`Engine timeout after ${timeout}ms`);
    this.name = 'EngineTimeoutError';
  }
}

export class EngineNotReadyError extends Error {
  constructor() {
    super('Engine is not ready');
    this.name = 'EngineNotReadyError';
  }
}

export class EngineBusyError extends Error {
  constructor(queueLength: number) {
    super(`Engine is busy (${queueLength} requests in queue)`);
    this.name = 'EngineBusyError';
  }
}
