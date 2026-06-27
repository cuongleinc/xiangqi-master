"use strict";
// UCI protocol parser — parse engine stdout lines
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInfoLine = parseInfoLine;
exports.parseBestMoveLine = parseBestMoveLine;
exports.isUciOk = isUciOk;
exports.isReadyOk = isReadyOk;
exports.isIdName = isIdName;
exports.isIdAuthor = isIdAuthor;
exports.extractBestEval = extractBestEval;
// Parse a single "info ..." line from engine stdout
function parseInfoLine(line) {
    if (!line.startsWith('info '))
        return null;
    const tokens = line.slice(5).split(/\s+/);
    const info = {};
    let i = 0;
    while (i < tokens.length) {
        const token = tokens[i];
        if (token === undefined)
            break;
        switch (token) {
            case 'depth': {
                const val = parseInt(tokens[++i], 10);
                if (!isNaN(val))
                    info.depth = val;
                break;
            }
            case 'seldepth': {
                const val = parseInt(tokens[++i], 10);
                if (!isNaN(val))
                    info.seldepth = val;
                break;
            }
            case 'score': {
                const type = tokens[++i];
                const val = parseInt(tokens[++i], 10);
                if (!isNaN(val)) {
                    if (type === 'cp') {
                        info.score = { cp: val };
                    }
                    else if (type === 'mate') {
                        info.score = { mate: val };
                    }
                }
                break;
            }
            case 'pv': {
                i++;
                const pv = [];
                while (i < tokens.length && !isKeyword(tokens[i])) {
                    pv.push(tokens[i]);
                    i++;
                }
                info.pv = pv;
                continue; // skip the i++ at end
            }
            case 'nodes': {
                const val = parseInt(tokens[++i], 10);
                if (!isNaN(val))
                    info.nodes = val;
                break;
            }
            case 'nps': {
                const val = parseInt(tokens[++i], 10);
                if (!isNaN(val))
                    info.nps = val;
                break;
            }
            case 'time': {
                const val = parseInt(tokens[++i], 10);
                if (!isNaN(val))
                    info.time = val;
                break;
            }
            case 'currmove': {
                const val = tokens[++i];
                if (val)
                    info.currmove = val;
                break;
            }
            case 'multipv': {
                const val = parseInt(tokens[++i], 10);
                if (!isNaN(val))
                    info.multipv = val;
                break;
            }
            case 'hashfull': {
                const val = parseInt(tokens[++i], 10);
                if (!isNaN(val))
                    info.hashfull = val;
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
function parseBestMoveLine(line) {
    if (!line.startsWith('bestmove '))
        return null;
    const parts = line.slice(9).trim().split(/\s+/);
    if (parts.length === 0 || !parts[0])
        return null;
    const result = { bestMove: parts[0] };
    if (parts[1] === 'ponder' && parts[2]) {
        result.ponder = parts[2];
    }
    return result;
}
// Check for "uciok"
function isUciOk(line) {
    return line.trim() === 'uciok';
}
// Check for "readyok"
function isReadyOk(line) {
    return line.trim() === 'readyok';
}
// Check for "id name" (engine identification)
function isIdName(line) {
    return line.startsWith('id name ');
}
// Check for "id author"
function isIdAuthor(line) {
    return line.startsWith('id author ');
}
function isKeyword(token) {
    return [
        'depth', 'seldepth', 'score', 'pv', 'nodes', 'nps',
        'time', 'currmove', 'multipv', 'hashfull', 'string',
        'currmovenumber', 'cpuload', 'tbhits', 'sbhits',
        'upperbound', 'lowerbound',
    ].includes(token);
}
// Extract the best evaluation from accumulated info lines
function extractBestEval(infoLines) {
    // Find the info line with the highest depth (last one usually)
    let best = null;
    let maxDepth = -1;
    for (const info of infoLines) {
        if ((info.depth ?? -1) > maxDepth) {
            maxDepth = info.depth ?? -1;
            best = info;
        }
    }
    // If no depth found, take the last info line
    if (!best && infoLines.length > 0) {
        best = infoLines[infoLines.length - 1];
    }
    if (!best) {
        return { score: 0, depth: 0, pv: [] };
    }
    let score = 0;
    let mate;
    if (best.score) {
        if ('cp' in best.score) {
            score = best.score.cp;
        }
        else if ('mate' in best.score) {
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
//# sourceMappingURL=uci-parser.js.map