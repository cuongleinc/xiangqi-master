// UCI protocol parser — parse engine stdout lines

import type { ParsedInfo, BestMoveLine } from './types';

// Parse a single "info ..." line from engine stdout
export function parseInfoLine(line: string): ParsedInfo | null {
  if (!line.startsWith('info ')) return null;

  const tokens = line.slice(5).split(/\s+/);
  const info: ParsedInfo = {};
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    if (token === undefined) break;

    switch (token) {
      case 'depth': {
        const val = parseInt(tokens[++i]!, 10);
        if (!isNaN(val)) info.depth = val;
        break;
      }
      case 'seldepth': {
        const val = parseInt(tokens[++i]!, 10);
        if (!isNaN(val)) info.seldepth = val;
        break;
      }
      case 'score': {
        const type = tokens[++i];
        const val = parseInt(tokens[++i]!, 10);
        if (!isNaN(val)) {
          if (type === 'cp') {
            info.score = { cp: val };
          } else if (type === 'mate') {
            info.score = { mate: val };
          }
        }
        break;
      }
      case 'pv': {
        i++;
        const pv: string[] = [];
        while (i < tokens.length && !isKeyword(tokens[i]!)) {
          pv.push(tokens[i]!);
          i++;
        }
        info.pv = pv;
        continue; // skip the i++ at end
      }
      case 'nodes': {
        const val = parseInt(tokens[++i]!, 10);
        if (!isNaN(val)) info.nodes = val;
        break;
      }
      case 'nps': {
        const val = parseInt(tokens[++i]!, 10);
        if (!isNaN(val)) info.nps = val;
        break;
      }
      case 'time': {
        const val = parseInt(tokens[++i]!, 10);
        if (!isNaN(val)) info.time = val;
        break;
      }
      case 'currmove': {
        const val = tokens[++i];
        if (val) info.currmove = val;
        break;
      }
      case 'multipv': {
        const val = parseInt(tokens[++i]!, 10);
        if (!isNaN(val)) info.multipv = val;
        break;
      }
      case 'hashfull': {
        const val = parseInt(tokens[++i]!, 10);
        if (!isNaN(val)) info.hashfull = val;
        break;
      }
      default:
        // Unknown token — skip
        break;
    }
    i++;
  }

  return info;
}

// Parse "bestmove" line
export function parseBestMoveLine(line: string): BestMoveLine | null {
  if (!line.startsWith('bestmove ')) return null;

  const parts = line.slice(9).trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return null;

  const result: BestMoveLine = { bestMove: parts[0] };

  if (parts[1] === 'ponder' && parts[2]) {
    result.ponder = parts[2];
  }

  return result;
}

// Check for "uciok"
export function isUciOk(line: string): boolean {
  return line.trim() === 'uciok';
}

// Check for "readyok"
export function isReadyOk(line: string): boolean {
  return line.trim() === 'readyok';
}

// Check for "id name" (engine identification)
export function isIdName(line: string): boolean {
  return line.startsWith('id name ');
}

// Check for "id author"
export function isIdAuthor(line: string): boolean {
  return line.startsWith('id author ');
}

function isKeyword(token: string): boolean {
  return [
    'depth', 'seldepth', 'score', 'pv', 'nodes', 'nps',
    'time', 'currmove', 'multipv', 'hashfull', 'string',
    'currmovenumber', 'cpuload', 'tbhits', 'sbhits',
    'upperbound', 'lowerbound',
  ].includes(token);
}

// Extract the best evaluation from accumulated info lines
export function extractBestEval(infoLines: ParsedInfo[]): {
  score: number;
  mate?: number;
  depth: number;
  pv: string[];
} {
  // Find the info line with the highest depth (last one usually)
  let best: ParsedInfo | null = null;
  let maxDepth = -1;

  for (const info of infoLines) {
    if ((info.depth ?? -1) > maxDepth) {
      maxDepth = info.depth ?? -1;
      best = info;
    }
  }

  // If no depth found, take the last info line
  if (!best && infoLines.length > 0) {
    best = infoLines[infoLines.length - 1]!;
  }

  if (!best) {
    return { score: 0, depth: 0, pv: [] };
  }

  let score = 0;
  let mate: number | undefined;

  if (best.score) {
    if ('cp' in best.score) {
      score = best.score.cp;
    } else if ('mate' in best.score) {
      mate = best.score.mate;
      score = mate > 0 ? 10000 : -10000; // approximate mate score
    }
  }

  return {
    score,
    mate,
    depth: best.depth ?? 0,
    pv: best.pv ?? [],
  };
}
